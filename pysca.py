import numpy as np
# from mdp.nodes import CuBICANode as ICANode # Throwing error!
# import msa # Throwing error!
import water
import re

# returns relative sequence of aligned sequences, but removes '-' from consensus sequence
# Repeated in water.py
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
# Repeated in water.py
def register(consensus, seq, resNums):

    aln = water.align(consensus, seq).split('\n')
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

# No idea what this does. 
def IDSectors(v, **kwargs):
    cut, sec = 0.1, 3 
    if 'cut' in kwargs:
        cut = kwargs['cut']
    if 'sectors' in kwargs:
        sec = int(kwargs['sectors'])
    m = [np.median(i) for i in v]
    s = []
    for vec, med in zip(v,m):
        if len(s) < sec:
            if med>0:
                t = sorted(vec)[int((1-cut)*len(vec))]
                s.append(np.where(vec > t)[0])
            elif med<0:
                t = sorted(vec)[int(cut*len(vec))]
                s.append(np.where(vec < t)[0])
    return s

#Usage: doICA(matrix, list of desired eigenvector indices)
#returns: tuple of eigenvectors projected on ICA axes number of input vectors == number of returned vecs
def doICA(mtx, vecs):
    vec = np.real(np.asarray(np.linalg.eig(mtx)[1][:,vecs]))
    ica = ICANode()
    ica.train(vec)
    ivec = ica(vec)
    return tuple([ivec[:,i] for i in range(len(vecs))])
