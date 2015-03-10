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
    'TRP':'W',
    'G':'GLY',
    'A':'ALA',
    'S':'SER',
    'C':'CYS',
    'V':'VAL',
    'T':'THR',
    'P':'PRO',
    'I':'ILE',
    'L':'LEU',
    'D':'ASP',
    'N':'ASN',
    'E':'GLU',
    'Q':'GLN',
    'M':'MET',
    'K':'LYS',
    'H':'HIS',
    'F':'PHE',
    'Y':'TYR',
    'R':'ARG',
    'W':'TRP',
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
    '20':'-',
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
        self.atoms = [atom(line) for line in lines if line[:4] == 'ATOM']
        self.atoms = sorted(self.atoms, key = lambda x: (x['CHAIN'], x['RESNUM'], x['ATOMTYPE']))
        self.build_chains()

    def build_chains(self):
        for atom in self:
            chainID = atom['CHAIN']
            resnum  = atom['RESNUM']
            atomtype= atom['ATOMTYPE']
            if chainID not in self.chains:
                self.chains[chainID] = {}
            if resnum not in self.chains[chainID]:
                self.chains[chainID][resnum] = {}
            self.chains[chainID][resnum][atomtype] = atom

    def get_chain_seqs(self):
        seqs = {}
        for chain in self.chains:
            seqs[chain] = ''.join([changeToOneLetter[self.chains[chain][i].values()[0]['RESTYPE']] for i in self.chains[chain]])
        return seqs

    def get_calpha_dist_mat(self):
        dist = {key: {} for key in self.chains}
        for chain1 in self.chains:
            for chain2 in self.chains:
                atoms1 = [v['CA'] for v in self.chains[chain1].values()]
                atoms2 = [v['CA'] for v in self.chains[chain2].values()]
                dist[chain1][chain2] = distMat(atoms1, atoms2)
        return dist

    def __iter__(self):
        for atom in self.atoms:
            yield atom


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
def distMat(atoms1, atoms2):
    l1,l2 = len(atoms1),len(atoms2)
    x1 = np.ones([l2,l1])*np.array([i['XYZ'][0] for i in atoms1])
    y1 = np.ones([l2,l1])*np.array([i['XYZ'][1] for i in atoms1])
    z1 = np.ones([l2,l1])*np.array([i['XYZ'][2] for i in atoms1])
    x2 = np.ones([l1,l2])*np.array([i['XYZ'][0] for i in atoms2])
    y2 = np.ones([l1,l2])*np.array([i['XYZ'][1] for i in atoms2])
    z2 = np.ones([l1,l2])*np.array([i['XYZ'][2] for i in atoms2])
    D = np.sqrt((x1-x2.T)*(x1-x2.T)+(y1-y2.T)*(y1-y2.T)+(z1-z2.T)*(z1-z2.T))
    return D

#Returns indices for shared residue numbers
def get_shared_resnum_indices(resnums1, resnums2):
    indices1 = []
    indices2 = []
    for i,v1 in enumerate(resnums1):
        for j,v2 in enumerate(resnums2):
            if v1 == v2:
                indices1.append(i)
                indices2.append(j)
    return indices1, indices2
