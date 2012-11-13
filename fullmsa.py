import numpy as np
import pdbFile
import fasta
import re
from copy import deepcopy
from time import time
from multiprocessing import cpu_count
import pp
from simplices import nSimplex
import pinfwrapper

#Includes the gap character!
AminoAcids = ['A','C','D','E','F','G','H','I','K','L','M','N','P','Q','R','S','T','V','W','Y','-']

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

#ordMapping is a faster hash for constructing the alignment matrix
ordMapping = 20*np.ones(500, dtype='int')
for i in AminoAcids:
    ordMapping[ord(i)] = aaMapping[i]

#Unknown amino acids default to gap character
ordMapping[ord('X')] = aaMapping['-']
ordMapping[ord(' ')] = aaMapping['-']



#Background level frequences for amino acids 
#Ranganathan's Notes on SCA -- ordered according to the hash above
BGQ = np.array([0.073, 0.025, 0.050, 0.061, 0.042, 0.072, 0.023, 0.053, 0.064, 0.089, 0.023, 0.043, 0.052, 0.040, 0.052, 0.073, 0.056, 0.063, 0.013, 0.033])

#Takes a fasta formatted alignment file name and returns the corresponding numpy array
def binMatrix(msaFN):
    headers, seqs = fasta.importFasta(msaFN)
    M = len(seqs)
    L = np.argmax(np.bincount(np.array([len(i) for i in seqs])))
    seqs = [i for i in seqs if len(i) == L]
    M = len(seqs)
    mtx = 20*np.ones([M,L], dtype='int')
    for i in range(M):
        try:
            mtx[i,:len(seqs[i])] = ordMapping[[ord(j) for j in seqs[i].strip().upper()]]
        except ValueError:
            pass
            print 'Failure parsing sequence with header: %s' %headers[i]
            print 'Sequence length: %s' %len(seqs[i])
    return mtx

def getModesFreqs(mtx):
    P = np.shape(mtx)[1]
    m = np.zeros(P)
    f = np.zeros(P)
    for i in range(P):
        bins = np.bincount(mtx[:,i])
        m[i] = np.argmax(bins)
        f[i] = float(np.max(bins))/np.sum(bins)
    return m, f

#Return a 3D representation of the alignment matrix
def extrudeBinMat(binMat):
    M,L = np.shape(binMat)
    new = np.zeros([M,L,21])
    for m in range(M):
        for l in range(L):
            new[m,l,binMat[m,l]] = 1.
    return new

def consensus(mtx):
    m, f = getModesFreqs(mtx)
    return ''.join([aaMapping['%d'%i] for i in m])

def prune(mtx, cut = 1.0):
    cols = columns(mtx, cut)
    return mtx[:,list(cols)]

def newPrune(mtx, cut = 0.98):
    m, f = getModesFreqs(mtx)
    gaps = np.where(m == 20)[0]
    cols = np.where(f > cut)[0]
    cols = set(range(np.shape(mtx)[1])) - (set(cols) & set(gaps))
    cols = list(cols)
    cols = sorted(cols)
    return mtx[:,list(cols)]

def HPrune(mtx, cut = 1.0):
    H = Entropy(mtx)
    cols = np.where(H > cut)[0]
    return mtx[:,list(cols)]

def columns(mtx, cut = 0.9):
    m, f = getModesFreqs(mtx)
    cols = set(np.where(f < cut)[0]).intersection(set(np.where(m != 20)[0]))
    return list(cols)

def chunkify(listo, chunks):
    l = len(listo)
    ind = np.arange(chunks+1)*l/chunks
    ind[-1] = l
    listo = [listo[ind[i]:ind[i+1]] for i in range(chunks)]
    return listo

def weightrix(mtx):
    M,L = np.shape(mtx)
    D = np.ones([L,L])*DKL(mtx)
    return pinfwrapper.inf(mtx)/(1 + np.abs(D - D.T))

def randomEigs(mtx, func = weightrix, numVecs = 10):
    m = deepcopy(mtx)
    M,L = np.shape(mtx)
    v = np.zeros([numVecs,L])
    for i in range(numVecs):
        for j in range(L):
            np.random.shuffle(m[:,j])
        v[i] = np.linalg.eig(func(m))[0]
    return v

#In the early version of this program i set the diagonal of the positional covariance matrix
#to zero. This turns out to be a slightly silly idea.C Consequently, this function takes 
#the binary alignment matrix from which an old covariance matrix  was constructed and returns 
#a matrix containing the diagonal and zeros everywhere else.
def variance(mtx):
    numprocs = cpu_count()
    l = np.shape(mtx)[1]
    C = np.zeros([l,l])
    x, y = np.arange(l), np.arange(l)
    x, y = chunkify(x, numprocs), chunkify(y, numprocs)
    print 'Cacheing simplex vertices...'
    CA = cacheVij()
    print 'Cacheing complete.\n'
    print 'Beginning parallelized covariance calculation with %s processors...' %numprocs
    ppservers = ()
    job_server = pp.Server(numprocs, ppservers = ppservers)
    jobs = [job_server.submit(cov, (mtx, x[i], y[i], CA), (), ('numpy as np',)) for i in range(numprocs)]
    for i in range(numprocs):
        C = C + jobs[i]()
        print '%s %% complete' % (100*float(i)/numprocs)
    job_server.destroy()
    return C

#Takes square positional covariance matrix. returns square positional correlation matrix
def Pearson(c):
    l = np.shape(c)[0]
    d = c[np.diag_indices(l)]
    d = np.asmatrix(d)
    d = np.asarray(d.T*d)
    return c/d

def Mij(mtx, l1, l2):
    M, L = np.shape(mtx)
    M1 = np.zeros([M, M, 20])
    M1[range(M),:] = simp20[mtx[range(M),l1]]
    M2 = np.zeros([M, M, 20])
    M2[range(M),:] = simp20[mtx[range(M),l2]]
    for i in range(20): M2[:,:,i] = M2[:,:,i].T
    return M1 - M2

def distM(mtx, l1, l2):
    return np.sqrt(np.sum(np.square(np.sum(np.sum(Mij(mtx, l1, l2), 1), 1))))

def mutInf(mtx):
    M, L = np.shape(mtx)
    mP = np.zeros([L, 21])
    for i in xrange(L):
        mP[i] = np.bincount(mtx[:,i], None, 21)
    mI = np.zeros([L, L])
    for i in xrange(L):
        for j in xrange(L):
            for y in np.where(mP[i] > 0)[0]:
                for x in np.where(mP[j] > 0)[0]:
                    jP = np.shape(np.where(mtx[np.where(mtx[:,i] == y), j] == x))[1]/float(M)
                    if jP > 0:
                        #print 'x=%s, y=%s, jP(x,y)=%s' %(x, y, jP)
                        mI[i,j] += jP*np.log(jP/(mP[j,x]*mP[i,y]))
    return mI

def redundancy(mtx):
    M, L = np.shape(mtx)
    mI = pinfwrapper.inf(mtx)
    H = Entropy(mtx)
    h = (H*np.ones([L, L])).T + H*np.ones([L, L])
    return mI/h

def prune2D(mtx, cut = 1.):
    m,f = getModesFreqs(mtx)
    cols = np.where(m != 20)[0]
    print '%s columns' %len(cols)
    mtx = mtx[:,cols]
    m,f = getModesFreqs(np.rot90(mtx))
    rows = np.where(m != 20)[0]
    print '%s rows' %len(rows)
    return mtx[rows]

def Entropy(mtx):
    M, L = np.shape(mtx)
    H = np.zeros(L)
    for l in range(L):
        P = np.bincount(mtx[:,l], None, 21)/float(M)
        for i in np.where(P > 0.)[0]:
            H[l] += -P[i]*np.log2(P[i])
    return H

def clusterSelection(clusters, ats):
    colors = ['lightblue', 'lightorange', 'violet']
    for n in range(np.max(clusters)+1):
        sel = '+'.join([str(i) for i in ats[np.where(clusters == n)[0]] if i != None])
        if len(sel) > 0:
            print 'create s%s, resi %s' %(n, sel)
            print 'create s%s_l, s%s' %(n, n)
            print 'color %s, s%s' % (colors[n%3], n)
    print 'show surface, s* and not *_l'
    print 'show sticks, *_l'

def getClusters(labels):
    n_clusters = np.max(labels)
    clusters = []
    for i in range(n_clusters):
        clusters.append(np.where(labels == i)[0])
    return clusters

def alignRD(ats, R, atoms, chainID = 'A'):
    atoms = [i for i in atoms if i['CHAIN'] == chainID and i['ATOMTYPE'] == 'CA' and i['RESNUM'] in ats]
    resnums = [i['RESNUM'] for i in atoms]
    D = pdbFile.distMat(atoms)
    indices = [i[0] for i in enumerate(ats) if i[1] in resnums]
    R = R[indices,:][:,indices]
    return R, D

def columnPops(mtx):
    M,L = np.shape(mtx)
    pops = np.zeros([L, 21])
    for i in range(L):
        pops[i] = np.bincount(mtx[:,i], None, 21)
    return pops/float(M)

def estimateBGFreq(mtx):
    return np.bincount(mtx.flatten(), None, 21)/float(len(mtx.flatten()))

def DKL(mtx):
    M,L = np.shape(mtx)
    bgq = estimateBGFreq(mtx)
    cpops = columnPops(mtx)
    dkl = np.zeros(L)
    for i in range(L):
        for j in range(21):
            if bgq[j] > 0. and cpops[i,j] > 0.:
                dkl[i] += np.log2(cpops[i,j]/bgq[j])*cpops[i,j]
    return dkl

def testMetric(mtx):
    M,L = np.shape(mtx)
    H = np.ones([L,L])*Entropy(mtx)
    D = np.ones([L,L])*DKL(mtx)
    mi = pinfwrapper.inf(mtx)
    T = mi*D*D.T/(H+H.T)
    return T


def testMetric2(mtx):
    M,L = np.shape(mtx)
    H = np.ones([L,L])*Entropy(mtx)
    D = np.ones([L,L])*DKL(mtx)
    mi = pinfwrapper.inf(mtx)
    T = mi*(D*D.T)/(1 + np.abs(H-H.T))
    return T

def weightrix(mtx):
    M,L = np.shape(mtx)
    H = np.ones([L,L])*Entropy(mtx)
    D = np.ones([L,L])*DKL(mtx)
    mi = pinfwrapper.inf(mtx)
    return mi/(1+np.abs(D - D.T))

def weights(mtx):
    M,L = np.shape(mtx)
    H = np.ones([L,L])*Entropy(mtx)
    D = np.ones([L,L])*DKL(mtx)
    T = (D*D.T)/(1 + np.abs(H-H.T))
    return T

def weights2(mtx):
    M,L = np.shape(mtx)
    H = np.ones([L,L])*Entropy(mtx)
    D = np.ones([L,L])*DKL(mtx)
    T = (D+D.T)/(1 + np.abs(H-H.T))
    return T

def sample(dist, ats, percent):
    d = deepcopy(dist)
    d.sort()
    thresh = d[int(len(d) - len(d)*percent/100.)]
    s = np.where(dist > thresh)[0]   
    return '+'.join([str(i) for i in ats[s] if i != None])

def crossH(mtx):
    M,L = np.shape(mtx)
    P = np.zeros([L,21])
    for i in range(L):
        P[i] = np.bincount(mtx.T[i], None, 21)/float(M)
    temp = deepcopy(P)
    temp[np.where(temp == 0.)] = 1.
    logP = np.log2(temp)
    del temp
    cH = np.ones([L,L,21])*P
    logP = np.ones([L,L,21])*logP
    for i in range(21):
        cH[:,:,i] = cH[:,:,i]*logP[:,:,i].T
    cH = np.sum(cH, axis = 2)
    return cH

def jointH(mtx):
    M,L = np.shape(mtx)
    #L = 100
    jH = np.zeros([L,L])
    for i in range(L):
        for j in range(L):
            JPD = np.histogram2d(mtx[:,i], mtx[:,j], 21, [[0,21],[0,21]])[0]
            jH[i,j] = np.sum(JPD[np.nonzero(JPD)]*np.log2(JPD[np.nonzero(JPD)]))
    return jH

def autoprune(msaFN):
    mtx = binMatrix(msaFN)
    aminoAcids = np.bincount(mtx.flatten())[:-1]/float(np.product(np.shape(mtx)))
    thresh = aminoAcids.max()
    mtx = newPrune(mtx, thresh)
    return mtx

def infoDistance(mtx):
    M,L = np.shape(mtx)
    H = Entropy(mtx)
    h = np.ones([L,L])*H
    mi = pinfwrapper.inf(mtx)
    jH = pinfwrapper.jointH(mtx)
    return (h + h.T - 2*mi)/jH

def clean(mtx, vecs):
    cleaned = np.zeros(np.shape(mtx))
    v,vec = np.linalg.eig(mtx)
    for i in vecs:
        l = v[i]
        k = np.matrix(deepcopy(vec[:,i]))
        cleaned = cleaned + l*np.array(k.T*k)
    return cleaned

def arrange(mtx, vec, labels):
    secs = []
    for i in range(max(labels)+1):
        secs.append(np.where(labels == i)[0])
    z = []
    for i,sec in enumerate(secs, 1):
        sec = sec[np.argsort(vec[sec,i])]
        z.extend(sec)
    return mtx[z][:,z]

#Return a distance matrix and information matrix trimmed to overlap and return residue indices in meatspace
def realDist(pdbFN, chainID, ats, mtx):
    d,r = pdbFile.distMat(pdbFN, chainID)
    indmtx = [i[0] for i in enumerate(ats) if i[1] in r]
    indd   = [i[0] for i in enumerate(r) if i[1] in ats]
    return d[indd][:,indd], mtx[indmtx][:,indmtx], r[indd]

