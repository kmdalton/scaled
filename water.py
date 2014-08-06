#Standard libs
from multiprocessing import cpu_count
from copy import deepcopy
import re,os,string,subprocess,urllib2

#Scientific Python libs
import numpy as np

#This tells the script where to find the sequences database
directoryPrefix = os.path.dirname(os.path.abspath(__file__)) + '/'
BLASTDIR = "/home/kmdalton/DATUMS/blast"

Greek = {
    '1':'A',
    '2':'B',
    '3':'G',
    '4':'D',
    '5':'E',
    '6':'Z',
    '7':'H',
    '8':'Q',
    'A':'1',
    'B':'2',
    'G':'3',
    'D':'4',
    'E':'5',
    'Z':'6',
    'H':'7',
    'Q':'8'
}

changeToOneLetter={
'GLY':'G',
'ALA':'A',
'SER':'S',
'CYS':'C',
'VAL':'V',
'THR':'T',
'PRO':'P',
'ILE':'I',
'LEU':'L',
'ASP':'D',
'ASN':'N',
'GLU':'E',
'GLN':'Q',
'MET':'M',
'LYS':'K',
'HIS':'H',
'PHE':'F',
'TYR':'Y',
'ARG':'R',
'TRP':'W'
}


#Modified by KD to get rid of the temporary file madness (10/15/2013). Pysca.register modified to reflect new syntax.
def align(seq1, seq2):
    aln = subprocess.Popen(["/bin/bash","-cs", "water <(echo %s) <(echo %s) stdout -gapopen=10 -gapextend=0.5 2>/dev/null" %(seq1, seq2)], stdout=subprocess.PIPE).communicate()[0]
    return aln

def similarity(aln):
    # pulls out similarity from alignment output
    return float(re.findall(r'Similarity:.*\n', aln)[0].split()[-1].strip('%()'))

def identity(aln):
    # pulls out identity from alignment output
    return float(re.findall(r'Identity:.*\n', aln)[0].split()[-1].strip('%()'))

def score(aln):
    # pulls out score from alignment output
    return float(re.findall(r'Score:.*\n', aln)[0].split()[-1].strip('%()'))

def getChains(pdbFN):
    # finds the chains in a pdb file
    lines = open(pdbFN, 'r').readlines()
    lines = [i for i in lines if i[:3] == 'ATO']
    chains = {}
    for line in lines:
        chain = line[21]
        if chain not in chains:
            # instantiate new index for new chain
            chains[chain] = []
        # add line (atom) to that chain
        chains[chain].append(line)
    return chains

def getSeq(lines):
    # get sequence of a chain in lines from getChains)
    length = max([int(i[22:26]) for i in lines]) 
    # instantiate seq variable by putting dash for every atom in chain
    seq = ['-' for i in range(length)]

    # save and return list of residues
    for line in lines:
        resNum = int(line[22:26]) - 1
        resName = line[17:20].upper()
        if resName in changeToOneLetter:
            seq[resNum] = changeToOneLetter[resName]
    return ''.join(seq).replace('-', '')

# This function is not called anywhere else in the code.
def rechain(pdbFN, outFN, cctFN = '.tmp.ccts'): 
    writeCCTFile(cctFN)
    chains = getChains(pdbFN)
    out = open(outFN, 'w')
    ccts = {}
    for chain in chains:
        seq = getSeq(chains[chain])
        cctNumber = str(cctN(seq, cctFN, 1))
        ccts[cctNumber] = []
        for line in chains[chain]:
            line = line[:21] + str(cctNumber) + line[22:]
            ccts[cctNumber].append(line)
    out = open(outFN, 'w')
    for i in [str(j) for j in range(1,9)]:
        for line in ccts[i]:
            out.write(line)
    out.close()
    os.remove(cctFN)


def renumber(pdbFN, outFN):
    # renumber residues in pdb file (presumably for merging)
    lines = [i for i in open(pdbFN, 'r').readlines() if i[:3] == 'ATO']
    out = open(outFN, 'w')
    curr = 0
    resnum = 1
    for line in lines:
        lnum = int(line[22:26])
        if lnum != curr:
            curr = lnum
            resnum += 1
        out.write(line[:21] + 'A' + string.rjust(str(resnum), 4) + line[26:])
    out.close()


# returns relative sequence of aligned sequences, but removes '-' from consensus sequence
def gappyRegister(consensus, seq, resNums):
    gappyAts = register(re.sub('-', '', consensus), seq, resNums)[1:]
    ats = [None for i in range(len(consensus) + 1)]
    
    charPlatzen = np.where(np.array(list(consensus)) != '-')[0]+1
    #print charPlatzena
    for pl,alnd in zip(charPlatzen, gappyAts):
        #print 'Platz - %s | ats - %s' %(pl, alnd)
        ats[pl] = alnd
    return np.array(ats)

# returns relative sequence of aligned sequences
def register(consensus, seq, resNums):
    aln = align(consensus, seq).split('\n')
    for line in aln: print line
    aln = [i for i in aln if len(i) > 2 and i[0] != '#']
    l = len(aln)
    s1 = ''.join([aln[3*i] for i in range(l/3)])
    s1 = re.sub(r'[^-ACDEFGHIKLMNPQRSTVWY]', '', s1)
    s2 = ''.join([aln[3*i+2] for i in range(l/3)])
    s2 = re.sub(r'[^-ACDEFGHIKLMNPQRSTVWY]', '', s2)
    print aln
    x = int(aln[0].split()[0]) 
    x = x-1 #Consensus seq and ats are zero indexed
    y = int(aln[2].split()[0])
    y = y-1 #resNums is zero indexed
    ats = [None for i in range(len(consensus))]
    print consensus
    print seq
    print resNums
    for i1,i2 in zip(s1, s2):
        if i1 != '-' and i2 != '-':
            try:
                ats[x] = resNums[y]
            except IndexError:
                print 'Something happened with %s%s' %(y, i2)
        if i1 != '-':
            x += 1
        if i2 != '-':
            y += 1
    return np.array(ats)



# Use hmmer to pull out similar protein sequences
# Two arguments, a protein seq as a string and an
# output filename for a stockholm sequence alignment
def phmmer(tarseq, **kw):
    """Make an external call to phmmer. One argument, first argument is the string representing the amino acid sequence you would like to find homologs to. Returns a tuple containing two lists. The first list is the sequence headers, the second is a list of aligned homologous sequences to the query."""

    #TODO: test to see if this file exists!!!!
    databaseFN = kw.get('db', directoryPrefix + 'nr')

    p = subprocess.Popen(["phmmer", "--notextw",  "--tformat", "fasta", "--qformat", "fasta","-E", "1e-5", "-A", "/dev/stdout", "-o", "/dev/null", "-", databaseFN], stdout=subprocess.PIPE, stdin=subprocess.PIPE, stderr=subprocess.STDOUT)
    lines = p.communicate(input=">tarSeq\n%s\n" %tarseq)[0]
    lines = lines.split("\n")
    seqs = {}
    headers = [] #Keep an ordered record of the alignment members
    for line in lines:
        if len(line.split()) > 1 and line[0] != '#':
            try:
                line = line.strip().split()
                seqname = '>' + line[0] #Prepend the > so you're in fasta format
                seq = line[-1]
                seq = seq.upper() #SAFETY FIRST!
                #Ditch insane characters
                seq = re.sub(r'[\.]', '-', seq) #Pysca doesn't use spaces for gaps
                seq = re.sub(r'[^-GASCVTPILDNEQMKHFYRW]', '', seq)
                if seqname in seqs:
                    seqs[seqname] = seqs[seqname] + seq
                else:
                    seqs[seqname] = seq
                    headers.append(seqname)
            except:
                print "%s : %s"%(seqname, seq)
    #Return two tuples, first the headers and then the corresponding sequences
    return headers, [seqs[i] for i in headers]

def clustalo(headers, sequences):
    """Make an external call to clustal omega. Supply two iterables containing strings. First iterable is fasta headers, second is the corresponding sequences. They must be the same length. Returns two tuples containing (1) fasta formatted headers and (2) corresponding sequences gapped as per the alignment."""

    #Just some safety checks to make sure we don't end up with weird line spacing
    headers = [i.strip() for i in headers]
    sequences = [i.strip() for i in sequences]

    #Interleave the two lists using fancy extended slice syntax :)
    fastaFile = headers + sequences
    fastaFile[::2] = headers
    fastaFile[1::2] = sequences
    fastaFile = '\n'.join(fastaFile)

    p = subprocess.Popen(["clustalo", "-i", "-"], stdout=subprocess.PIPE, stdin=subprocess.PIPE, stderr=subprocess.STDOUT)
    lines = p.communicate(input=fastaFile)[0]

    #I apologize for the unintelligibility of these lines. I promise they'll work fine as long as the fasta format doesn't change.
    newHeaders  = [">" + i.split('\n')[0] for i in lines.split(">")[1:]] #Pull out the headers
    alignedSeqs = [''.join(i.split('\n')[1:]) for i in lines.split(">")[1:]] #Pull out the gapped sequences

    return newHeaders, alignedSeqs

def cullByLength(headers, seqs, length, **kw):
    """Prune a set of fasta headers, sequences to remove outside a percentage of the target length. Call as cullByLength(fasta headers (iterable), fasta sequences (iterable), target length (int), *kw). Set the threshold by supplying thresh=float. Thresh must be betwen 0 & 1 -- default is 0.1. Returns: (list of headers, list of sequences). returned sequences have length > length-thresh*length and < length+thresh*length"""
    gapless= [re.sub(r'[-\.]','',i) for i in seqs] #Ignore gaps
    thresh = kw.get('thresh', 0.1)
    lmin   = length - thresh*length
    lmax   = length + thresh*length
    culled = [seq[:2] for seq in zip(headers, seqs, gapless) if len(seq[2]) > lmin and len(seq[2]) < lmax]
    return zip(*culled)

def extractGI(header):
    return header.split('|')[1]

def commonTaxa(gi1, seq1, gi2, seq2):
    t1    = [lookupTaxonomy(i) for i in gi1]
    t2    = [lookupTaxonomy(i) for i in gi2]
    pairedSeqs    = []
    pairedHeaders = []
    Taxa    = []
    for h,s,t in zip(gi1,seq1,t1):
        for taxon in t:
            for H,S,T in zip(gi2,seq2,t2):
                for TAXON in T:
                    if taxon == TAXON:
                        if taxon not in Taxa and (h,H) not in pairedHeaders: #NO DUPLICATES
                            pairedSeqs.append((s,S))
                            pairedHeaders.append((h,H))
                            Taxa.append(taxon)
    return pairedHeaders, pairedSeqs, Taxa

def doubleAlign(seq1, seq2, maxhits = 5000):
    h1,s1 = zip(*zip(*phmmer(seq1))[:maxhits])
    h2,s2 = zip(*zip(*phmmer(seq2))[:maxhits])
    t1    = [lookupTaxonomy(i.split('|')[1]) for i in h1]
    t2    = [lookupTaxonomy(i.split('|')[2]) for i in h2]
    pairedSeqs    = []
    pairedHeaders = []
    Taxa    = []
    for h,s,t in zip(h1,s1,t1):
        for taxon in t:
            for H,S,T in zip(h2,s2,t2):
                for TAXON in T:
                    if taxon == TAXON:
                        pairedSeqs.append((s,S))
                        pairedHeaders.append((h,H))
                        Taxa.append((taxon,TAXON))
    return pairedHeaders, pairedSeqs, Taxa

def lookupTaxonomy(gi):
    p = subprocess.Popen(["blastdbcmd","-db","nr","-outfmt",'"%T"',"-entry",gi], stdout=subprocess.PIPE, stdin=subprocess.PIPE, stderr=subprocess.STDOUT)
    line = p.communicate()[0]
    line = re.sub('"', '', line)
    return line.split('\n')

def blastdbcmd(gi, outfmt):
    p = subprocess.Popen(["blastdbcmd","-db","nr","-outfmt",outfmt,"-entry",gi], stdout=subprocess.PIPE, stdin=subprocess.PIPE, stderr=subprocess.STDOUT)
    line = p.communicate()[0]
    line = re.sub('"', '', line)
    return line

def blastp(seq, **kw):
    """
    Run blastp from the blast+ suite. Takes a seq as the first input and the following kwargs.

    Keyword arguments:
    db -- String. The name of the blast database to use. Defaults to 'nr'. 
    procs -- The number of threads to utilize.  Defaults to the number reported from multiprocessing.cpu_count()
    outfmt -- String. A format string for the results using the blastp formatting options. As with the blast interface, this is a space-delimited set of format features. For a comprehensive list of available options please see the blast documentations. Defaults to '6 sgi staxids evalue sseq' which produces a tab deliminited list containing the subject GI, subject taxid(s), subject evalue and finally the matching portion of the subject sequences.
    max_seqs -- Int or String. The maximum number of sequences to return from the blast query. Defaults to 1000.
    remote -- Boolean. If True, run the job remotely on the ncbi server. This will automatically set procs to 1. 
    """
    db       = kw.get('db', 'nr')
    outfmt   = kw.get('outfmt', '6 evalue sgi staxids sseq')
    outfmt   = "'%s'" %outfmt
    procs    = kw.get('procs', cpu_count())
    max_seqs = kw.get('max_seqs', 20000)
    remote   = kw.get('remote', False)
    if remote:
        arguments = ["blastp",
                     "-db",db,
                     "-max_target_seqs",str(max_seqs),
                     #"-num_descriptions",str(max_seqs),
                     #"-num_alignments",str(max_seqs),
                     "-query","-",
                     "-outfmt",outfmt,
                     "-remote",
                     ]
    else:
        arguments = ["blastp",
                     "-db",db,
                     "-max_target_seqs",str(max_seqs),
                     "-query","-",
                     "-num_threads","%s" %procs,
                     "-outfmt",outfmt
                     ]
    p = subprocess.Popen(' '.join(arguments), stdout=subprocess.PIPE, stdin=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True)
    lines = p.communicate(input=">tarSeq\n%s\n" %seq)[0]
    return lines 

def doubleRegister(consensus, seq1, seq2):
    l1,l2 = len(seq1),len(seq2)
    resnums = np.concatenate((np.arange(1, l1+1), np.arange(1, l2+1)))
    ats = register(consensus, seq1+seq2, resnums)
    print ats
    #ats can have Nones in them -- we need to protect ourselves from this:
    tmpats = deepcopy(ats)
    print tmpats
    tmpats[np.where(ats) == None] = ats.max()
    boundary = np.argmin(tmpats[1:] -  tmpats[:-1]) + 1
    return ats, boundary


def ncbiGet(RID, **kw):
    """
    make an ncbi get request

    Parameters
    ----------
    RID : the request ID you wish to query blast about
    kwargs : { ALIGNMENTS, ALIGNMENT_VIEW, DESCRIPTIONS, ENTREZ_LINKS_NEW_WINDOW, EXPECT_LOW, EXPECT_HIGH, FORMAT_ENTREZ_QUERY, FORMAT_OBJECT, FORMAT_TYPE, NCBI_GI, RID, RESULTS_FILE, SERVICE, SHOW_OVERVIEW }
        kwargs are verbatim those supported by the blast REST API with CMD=Get. (http://www.ncbi.nlm.nih.gov/blast/Doc/node6.html)
    """
    BaseURL = "http://www.ncbi.nlm.nih.gov/blast/Blast.cgi?CMD=Get&"
    GetKwargs = ['ALIGNMENTS',
                 'ALIGNMENT_VIEW',
                 'DESCRIPTIONS',
                 'ENTREZ_LINKS_NEW_WINDOW',
                 'EXPECT_LOW',
                 'EXPECT_HIGH',
                 'FORMAT_ENTREZ_QUERY',
                 'FORMAT_OBJECT',
                 'FORMAT_TYPE',
                 'NCBI_GI',
                 'RID',
                 'RESULTS_FILE',
                 'SERVICE',
                 'SHOW_OVERVIEW'
                ]
    kw['RID'] = str(RID)
    QueryString = '&'.join(['='.join((i, str(kw[i]))) for i in GetKwargs if i in kw])
    #print BaseURL + QueryString
    URL = urllib2.urlopen(BaseURL + QueryString)
    return URL.read()


def ncbiPut(seq, **kw):
    """
    webBlast(seq, **kwargs)
        Make a call to the ncbi webserver to run BLAST.

    Parameters
    ----------
    seq : Input protein or nucleic acid sequence

    kwargs : { AUTO_FORMAT, COMPOSITION_BASED_STATISTICS, DATABASE, DB_GENETIC_CODE, ENDPOINTS, ENTREZ_QUERY, EXPECT, FILTER, GAPCOSTS, GENETIC_CODE, HITLIST_SIZE, I_THRESH, LAYOUT, LCASE_MASK, MATRIX_NAME, NUCL_PENALTY, NUCL_REWARD, OTHER_ADVANCED, PERC_IDENT, PHI_PATTERN, PROGRAM, QUERY, QUERY_FILE, QUERY_BELIEVE_DEFLINE, QUERY_FROM, QUERY_TO, SEARCHSP_EFF, SERVICE, THRESHOLD, UNGAPPED_ALIGNMENT, WORD_SIZE }
    
        kwargs are verbatim those supported by the blast REST API with CMD=Put. The values will default to a vanilla blastp search which returns fasta formatted sequences with gids for headers. (http://www.ncbi.nlm.nih.gov/blast/Doc/node5.html)

    Returns
    -------
    Tuple (RID\string, WAITTIME\int) 
        RID: blast request ID (RID) which will be used to retrieve the results later with a Get request
        WAITTIME: blast returns an estimate of the amount of time in seconds the search will take
    """
    BaseURL = "http://www.ncbi.nlm.nih.gov/blast/Blast.cgi?CMD=Put&"
    PutKwargs = ['AUTO_FORMAT',
                'COMPOSITION_BASED_STATISTICS',
                'DATABASE',
                'DB_GENETIC_CODE',
                'ENDPOINTS',
                'ENTREZ_QUERY',
                'EXPECT',
                'FILTER',
                'GAPCOSTS',
                'GENETIC_CODE',
                'HITLIST_SIZE',
                'I_THRESH',
                'LAYOUT',
                'LCASE_MASK',
                'MATRIX_NAME',
                'NUCL_PENALTY',
                'NUCL_REWARD',
                'OTHER_ADVANCED',
                'PERC_IDENT',
                'PHI_PATTERN',
                'PROGRAM',
                'QUERY',
                'QUERY_FILE',
                'QUERY_BELIEVE_DEFLINE',
                'QUERY_FROM',
                'QUERY_TO',
                'SEARCHSP_EFF',
                'SERVICE',
                'THRESHOLD',
                'UNGAPPED_ALIGNMENT',
                'WORD_SIZE'
                ]
    kw['QUERY'] = seq
    kw['HITLIST_SIZE'] = kw.get('HITLIST_SIZE', 20000)
    kw['DATABASE'] = kw.get('DATABASE', 'nr')
    kw['PROGRAM'] = kw.get('PROGRAM', 'blastp')

    QueryString = '&'.join(['='.join((i, str(kw[i]))) for i in PutKwargs if i in kw])
    
    U  = urllib2.urlopen(BaseURL + QueryString)
    html = U.read()
    QBlastInfo = re.search(r"\<\!\-\-QBlastInfoBegin.+QBlastInfoEnd", html, re.DOTALL)
    QBlastInfo = QBlastInfo.group()
    RID        = QBlastInfo.split()[3]
    WAITTIME   = QBlastInfo.split()[6]
    try:
        WAITTIME = int(WAITTIME)
    except ValueError:
        print "Warning, invalid wait time returned by blast"

    return RID, WAITTIME

def ncbiDelete(RID):
    """
    delete a qblast RID from NCBI's servers

    Parameters
    ----------
    RID : the request ID you wish to delete
    """
    BaseURL = "http://www.ncbi.nlm.nih.gov/blast/Blast.cgi?CMD=Delete&"
    URL = urllib2.urlopen(BaseURL + "RID=%s" %RID)
    URL.read()

def blastFormatter(RID, **kw):
    outfmt   = kw.get('outfmt', '6 evalue sgi staxids sseq')
    outfmt   = "'%s'" %outfmt
    arguments = ["blast_formatter","-rid",str(RID),"-outfmt",outfmt]
    p = subprocess.Popen(' '.join(arguments), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True)
    #p = subprocess.Popen(' '.join(arguments), stdout=subprocess.PIPE, stdin=subprocess.PIPE, stderr=subprocess.STDOUT, shell=True)
    lines = p.communicate()
    return lines
    #lines = lines.split("\n")
    #return lines[:-1] #The last line is empty
