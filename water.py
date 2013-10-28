import matplotlib.pyplot as plt
import re
import os
import Bio.Emboss.Applications
import pickle
import numpy as np
import string
import subprocess

#This tells the script where to find the sequences database
directoryPrefix = os.path.dirname(os.path.abspath(__file__)) + '/'

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
    y = int(aln[2].split()[0])
    ats = [None for i in range(len(consensus)+1)]
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
    """Make an external call to phmmer. One argument, first argument is the string representing the amino acid sequence you would like to find homologs to. Returns a tuple containing two lists. The first list is the sequence headers, the second is a list of homologous sequences to the query."""

    #TODO: test to see if this file exists!!!!
    databaseFN = kw.get('db', directoryPrefix + 'nr')

    p = subprocess.Popen(["phmmer", "-E", "1e-5", "-A", "/dev/stdout", "-o", "/dev/null", "-", databaseFN], stdout=subprocess.PIPE, stdin=subprocess.PIPE, stderr=subprocess.STDOUT)
    lines = p.communicate(input=">tarSeq\n%s\n" %tarseq)[0]
    lines = lines.split("\n")
    seqs = {}
    headers = [] #Keep an ordered record of the alignment members
    for line in lines:
        if len(line.split()) > 1 and line[0] != '#':
            try:
                line = line.strip().split()
                seqname = line[0]
                seq = line[-1]
                seq = seq.upper() #SAFETY FIRST!
                #Ditch insane characters and gaps
                seq = re.sub(r'[^GASCVTPILDNEQMKHFYRW]', '', seq)
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
    thresh = kw.get('thresh', 0.1)
    lmin   = length - thresh*length
    lmax   = length + thresh*length
    culled = [seq for seq in zip(h,s) if seq[1] > lmin and seq[1] < lmax]
    return zip(*culled)
