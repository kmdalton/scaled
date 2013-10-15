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
