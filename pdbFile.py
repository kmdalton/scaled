import numpy as np

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

#Maps amino acid names onto ints for the alignment matrix
aaMapping = {
    'A': 0,
    'C': 1,
    'D': 2,
    'E': 3,
    'F': 4,
    'G': 5,
    'H': 6,
    'I': 7,
    'K': 8,
    'L': 9,
    'M': 10,
    'N': 11,
    'P': 12,
    'Q': 13,
    'R': 14,
    'S': 15,
    'T': 16,
    'V': 17,
    'W': 18,
    'Y': 19,
    '-': 20,
    '0' :'A',
    '1' :'C',
    '2' :'D',
    '3' :'E',
    '4' :'F',
    '5' :'G',
    '6' :'H',
    '7' :'I',
    '8' :'K',
    '9' :'L',
    '10':'M',
    '11':'N',
    '12':'P',
    '13':'Q',
    '14':'R',
    '15':'S',
    '16':'T',
    '17':'V',
    '18':'W',
    '19':'Y',
    '20':'-'
}

# ATOM object uses a PDB file line for construction
class atom(dict):
    def __init__(self, line=None):
        self.line = None
        dict.__init__(self)
        if line:
            self.loadLine(line)

    def loadLine(self, line):
        self.line = line
        self['CHAIN'] = line[21]
        self['RESTYPE'] = line[17:20].upper()
        self['RESNUM'] = int(line[22:26])
        self['ATOMTYPE'] = line[12:16].strip().upper()
        self['XYZ'] = np.zeros(3)
        self['XYZ'][0] = float(line[30:38])
        self['XYZ'][1] = float(line[38:46])
        self['XYZ'][2] = float(line[46:54])
        self['ELEMENT'] = line[76:78].strip().upper()

# PDBfile object just takes a pdb file name
class pdbDB():
    def __init__(self, pdbFN=None):
        self.atoms = None
        self.pdbFN = None
        self.lines = None
        self.chains = {}
        self.alphas = {}
        if pdbFN:
            self.loadPDBFile(pdbFN)

    def loadPDBFile(self, pdbFN):
        self.pdbFN = pdbFN
        lines = open(pdbFN).readlines()
        self.lines = lines
        lines = [line for line in lines if line[:4] == 'ATOM']
        for line in lines:
            self.addAtom(line)

    def addAtom(self, line):
        newAtom = atom(line)
        chainID = newAtom['CHAIN']
        resNum = newAtom['RESNUM']
        atomType = newAtom['ATOMTYPE']
        if chainID not in self.chains:
            self.chains[chainID] = {}
            self.alphas[chainID] = {}
        if str(resNum) not in self.chains[chainID]:
            self.chains[chainID][str(resNum)] = {}
        self.chains[chainID][str(resNum)]['ATOMTYPE'] = newAtom
        if atomType == 'CA':
            self.alphas[chainID][str(resNum)] = newAtom
            
    def calphaDistMat(self, chainID):
        return distMat(self.alphas[chainID])

# returns list of atom objects
def atoms(pdbFN):
    lines = open(pdbFN).readlines()
    lines = [line for line in lines if line[:4] == 'ATOM']
    return [atom(lines) for lines in lines]

# returns distance between two atom objects
def dist(atom1, atom2):
    R1, R2 = atom1['XYZ'], atom2['XYZ']
    D = np.sqrt(np.sum(np.square(R1-R2)))
    return D

# returns distance matrix between all atoms in pdb file
def distMat(pdbFN, chainID):
    a = atoms(pdbFN)
    a = [i for i in a if i['CHAIN'] == chainID and i['ATOMTYPE'] == 'CA']
    l = len(a)
    x = np.ones([l,l])*np.array([i['XYZ'][0] for i in a])
    y = np.ones([l,l])*np.array([i['XYZ'][1] for i in a])
    z = np.ones([l,l])*np.array([i['XYZ'][2] for i in a])
    D = np.sqrt((x-x.T)*(x-x.T)+(y-y.T)*(y-y.T)+(z-z.T)*(z-z.T))
    return D

# copy of previous function, but also returns resNums
def distMat(pdbFN, chainID):
    a = atoms(pdbFN)
    a = [i for i in a if i['CHAIN'] == chainID and i['ATOMTYPE'] == 'CA']
    l = len(a)
    x = np.ones([l,l])*np.array([i['XYZ'][0] for i in a])
    y = np.ones([l,l])*np.array([i['XYZ'][1] for i in a])
    z = np.ones([l,l])*np.array([i['XYZ'][2] for i in a])
    D = np.sqrt((x-x.T)*(x-x.T)+(y-y.T)*(y-y.T)+(z-z.T)*(z-z.T))
    resNums = [i['RESNUM'] for i in a]
    resNums = np.array(sorted(resNums))
    return D, resNums

