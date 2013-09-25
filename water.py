import matplotlib.pyplot as plt
import re
import os
import Bio.Emboss.Applications
import pickle
import numpy as np
import string

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

def align(seq1, seq2, ID = 1):
    # write two temporary files with seq1 and seq2
    # importantly, these sequences will be prefaced by >seq1\n and >seq2\n respectively
    print seq1
    print '>seq2\n%s\n' %seq2
    
    s = open('.tmp.seq1.%s' %ID, 'w')
    s.write('>seq1\n%s\n' %seq1)
    s.close()
    s = open('.tmp.seq2.%s' %ID, 'w')
    s.write('>seq2\n%s\n' %seq2)
    s.close()

    
    
    # Submit files to Emboss Water alignment (using Smith-Waterman algorithm)
    aln = Bio.Emboss.Applications.WaterCommandline(asequence=os.path.realpath('.tmp.seq1.%s' %ID), bsequence=os.path.realpath('.tmp.seq2.%s' %ID), gapopen=10, gapextend=0.5, outfile='stdout',stdout=True)

    try:
        aln, err = aln()
    except Bio.Application.ApplicationError:
        aln = []
        print "Error in Emboss alignment. Is it installed?"
        
        

    # Delete temporary files
    os.remove('.tmp.seq1.%s' %ID)
    os.remove('.tmp.seq2.%s' %ID)

    # return alignment
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

# Again, this function is not called anywhere else in the code, and I'm not sure what cctN does.
def alignmentToStructure(pdbFN):
    seq = getSeq(open(pdbFN, 'r').readlines())
    cctNum = cctN(seq)
    aln = align(ccts[str(cctNum)], seq).split('\n')
    aln = [i for i in aln if i[:3] == 'seq']
    s1 = ''
    s2 = ''
    for i in  [i for i in aln if i[:4] == 'seq1']:
        s1 = s1 + re.sub(r'[^-ACDEFGHIKLMNPQRSTVWY]', '', i)
    for i in  [i for i in aln if i[:4] == 'seq2']:
        s2 = s2 + re.sub(r'[^-ACDEFGHIKLMNPQRSTVWY]', '', i)
    print s1
    print s2
    x = int(aln[0].split()[1])
    ats = [None]
    for i1,i2 in zip(s1, s2):
        if i2 != '-':
            ats.append(x)
        if i1 != '-':
            x += 1
    return ats

def renumberChains(pdbFN, outFN = None):
    # renumber chains
    if outFN == None:
        outFN = pdbFN
    lines = open(pdbFN).readlines()
    newLines = []
    currentChain = 'A'
    currentResNum = 0
    for line in lines:
        if line[:3] == 'ATO':
            resNum = int(line[22:26])
            if resNum < currentResNum:
                currentChain = chr(ord(currentChain) + 1)
            newLines.append(line[:21] + currentChain + line[22:])
            currentResNum = resNum
        else:
            newLines.append(line)
    out = open(outFN, 'w')
    for line in newLines:
        out.write(line)
    out.close()

def gappyRegister(consensus, seq, resNums):
    
    gappyAts = register(re.sub('-', '', consensus), seq, resNums)[1:]
    ats = [None for i in range(len(consensus) + 1)]
    charPlatzen = np.where(np.array(list(consensus)) != '-')[0]+1
    #print charPlatzen
    for pl,alnd in zip(charPlatzen, gappyAts):
        #print 'Platz - %s | ats - %s' %(pl, alnd)
        ats[pl] = alnd
    return np.array(ats)

def register(consensus, seq, resNums):
    # align consusnesus with seq using water algorithm
    aln = align(consensus, seq).split('\n')

    # get back aligned sequences with gaps
    for line in aln: print line
    aln = [i for i in aln if i[:3] == 'seq']
    s1 = ''
    s2 = ''
    for i in  [j for j in aln if j[:4] == 'seq1']:
        s1 = s1 + re.sub(r'[^-ACDEFGHIKLMNPQRSTVWY]', '', i)
    for i in  [j for j in aln if j[:4] == 'seq2']:
        s2 = s2 + re.sub(r'[^-ACDEFGHIKLMNPQRSTVWY]', '', i)
    x = int(aln[0].split()[1])
    y = int(aln[1].split()[1])

    ats = [None for i in range(len(consensus)+1)]

    print consensus
    print seq
    print resNums
    # return residue numbers corresponding to alignment
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
