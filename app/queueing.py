import fullmsa,pinfwrapper,re,subprocess,water
from multiprocessing import cpu_count
from time import sleep
import re
from redis import Redis
from rq import Queue

q = Queue(connection=Redis())


class msaObj():
    def __init__(self, user_input):
        """Initialize the object with a FASTA formatted string and sanitize the string."""
        self.user_input = user_input
        self.headers = []
        self.qstat= None
        self.ismsa= False
        self.msa  = None
        self.mtx  = None
        self.C    = None
        self.seqs = None
        self.seed = None
        self.sane = True
        self.sanitize(user_input)

    def sanitize(self, aString):
        """Parse a FASTA formatted string and set internal class variables (headers,seqs,sane)."""
        try:
            lines = re.split(r'[\r\n]', aString)
            seqs  = []
            for line in lines:
                if len(line) > 0 and line[0] == ">":
                    self.headers.append(line)
                    seqs.append([])
                elif len(seqs) > 0:
                    seqs[-1].append(line)
            seqs = [re.sub(r'[^ACDEFGHIKLMNPQRSTUVWXYZ\-]', '', ''.join(i).upper()) for i in seqs]
            seqs = [re.sub(r'[UXZ]', '-', i) for i in seqs]
            #If the input is an MSA make sure all the sequences have the same length
            self.ismsa = True
            if len(seqs) > 1:
                self.sane = True
                l = len(seqs[0])
                for i in seqs:
                    if len(i) != l:
                        self.sane = False
                        self.ismsa= False

            #Make sure we have at least two columns. Otherwise, we're probably boned
            if len(seqs[0]) <2:
                self.sane = False
            
            self.seed = re.sub(r'[^ACDEFGHIKLMNPQRSTVWY]', '', seqs[0]) #Absolutely no gaps or weird chars in self.seed
            if len(seqs) > 1:
                self.seqs = [re.sub(r'[^ACDEFGHIKLMNPQRSTVWY\-]', '', i) for i in seqs]
                self.msa  = seqs
        except IndexError: #Cannot parse this thing as a fasta. Considering it a bare sequences as a last resort. 
            seed = re.sub(r'[^ACDEFGHIKLMNPQRSTVWY]', '', aString) #Absolutely no gaps or weird chars in self.seed
            if len(seed) > 1:
                self.sane = True
                self.seed = seed
            else:
                raise SyntaxError("Cannot parse the input as either fasta or bare sequence. Aborting analysis...")
        except:
            raise SyntaxError("Cannot parse the input as either fasta or bare sequence. Aborting analysis...")

    def blast(self, **kw):
        """Run blastp on the seed sequence
        Parameters
        ----------
            self: duh
            kwargs: { remote, max_seqs }
                remote: boolean. when true send the blastp job to the ncbi server. when false run locally --
                    must have the blast nr database downloaded and the BLASTDB environment variable set to point
                    to it. defaults to true.
                max_seqs: int. Maximum number of sequences to return from the blast search. Default is 5000
        """
        runremotely = kw.get('remote', True)
        fmt         = kw.get('format', '6 evalue sgi sseq')
        max_seqs    = kw.get('max_seqs', 5000)
        Text        = water.blastp(self.seed, remote=runremotely, outfmt=fmt, max_seqs = max_seqs)
        headers     = [i.split('\t')[1] for i in Text.split('\n')[:-1] if len(i.split('\t')) == 3]
        sequences   = [i.split('\t')[2] for i in Text.split('\n')[:-1] if len(i.split('\t')) == 3]
        sequences   = [re.sub(r'[^ACDEFGHIKLMNPQRSTVWY]', '', i.upper()) for i in sequences] #No nasty surprises
        self.headers= headers
        self.seqs   = sequences

    def clustal(self, **kw):
        """Run clustalo on self.sequences. Set aligned seqs to self.msa. This will be enqueued to prevent server overloading."""
        walltime = kw.get('walltime', 3600) #Default walltime for jobs is one hour. Not sure what is reasonable yet. Depends on number of seqs.
        cpus     = cpu_count()
        if self.seqs[0] != self.seed:
            self.seqs = [self.seed] + self.seqs
        job = q.enqueue_call(func=clustalo, args=(self.seqs,), kwargs={'numprocs': cpus}, timeout=walltime)
        while job.get_status() in ('queued', 'started'):
            sleep(2)
        self.msa = job.result

    def infoDistance(self, **kw):
        """Run pinfwrapper.infoDistance on the sequences. Supply any infoDistance kwargs"""
        self.mtx = fullmsa.prunePrimaryGaps(fullmsa.binMatrix(self.msa))
        kw['nogaps'] = False
        self.C   = 1. - pinfwrapper.infoDistance(self.mtx, **kw)
        kw['nogaps'] = True
        self.Cn  = 1. - pinfwrapper.infoDistance(self.mtx, **kw)

    def serialize(self, **kw):
        """Serialize self.C, self.Cn into json for embedding in the result viewer"""
        threshold = kw.get("threshold", -1.)
        values = fullmsa.Entropy(self.mtx) 
        nodes = '"nodes": [' + ','.join(['{"resnum": "%s", "entropy": %s}' %(i,h) for i,h in enumerate(values, 1)]) + "]"

        L = len(values)
        links = []
        for i in range(L):
            for j in range(L):
                if i > j:
                    if max(self.C[i,j], self.Cn[i,j]) > threshold:
                        links.append('{"source": %s, "target": %s, "gap": %s, "nogap":%s}' %(i, j, self.C[i,j], self.Cn[i,j]))
                        #links.append('{"source": %s, "target": %s, "value": %s}' %(i+1, j+1, self.C[i,j]))
        links = '"links": [' + ','.join(links) + ']'
        retval = "{"+','.join((nodes, links))+"}"
        return retval

def clustalo(sequences, **kw):
    """
    Make an external call to clustal omega. Takes an iterable containing sequences, returns a gapped version.
    Parameters
    ----------
        sequences: List of strings. Protein sequences.
        kwargs: { numprocs }
            numprocs: number of hyperthreads to use for the alignment. defaults to the value returned by multiprocessing.cpu_count()
    """
    numprocs = kw.get('numprocs', cpu_count())
    headers = [">%s" %i for i in range(len(sequences))] #Dummy headers to trick clustal
    sequences   = [re.sub(r'[^ACDEFGHIKLMNPQRSTVWY]', '', i.upper()) for i in sequences] #No nasty surprises

    #Interleave the two lists using fancy extended slice syntax :)
    fastaFile = headers + sequences
    fastaFile[::2] = headers
    fastaFile[1::2] = sequences
    fastaFile = '\n'.join(fastaFile)

    p = subprocess.Popen(["clustalo", "-i", "-"], stdout=subprocess.PIPE, stdin=subprocess.PIPE, stderr=subprocess.STDOUT)
    lines = p.communicate(input=fastaFile)[0]

    alignedSeqs = [''.join(i.split('\n')[1:]) for i in lines.split(">")[1:]] #Pull out the gapped sequences
    return alignedSeqs

