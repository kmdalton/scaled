import numpy as np
import pdbFile
import fasta
import re
from copy import deepcopy
from time import time
from multiprocessing import cpu_count
import pinfwrapper
from sklearn.decomposition import fastica
from scipy.stats import t

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
#hashing is by unicode code point of character.
ordMapping = 20*np.ones(500, dtype='int')
for i in AminoAcids:
    ordMapping[ord(i)] = aaMapping[i]

#Unknown amino acids default to gap character
ordMapping[ord('X')] = aaMapping['-']
ordMapping[ord(' ')] = aaMapping['-']

#Background level frequences for amino acids 
#Ranganathan's Notes on SCA -- ordered according to the hash above
#Would be interesting to see how this compares in prokaryotes versus eukaryotes
BGQ = np.array([0.073, 0.025, 0.050, 0.061, 0.042, 0.072, 0.023, 0.053, 0.064, 0.089, 0.023, 0.043, 0.052, 0.040, 0.052, 0.073, 0.056, 0.063, 0.013, 0.033])

debug = 0

#Takes a iterable of aligned sequences and returns the corresponding numpy array
def binMatrix(seqs):
    # keep only sequences that have the mode length
    L = np.argmax(np.bincount(np.array([len(i) for i in seqs])))
    M = len(seqs)
    mtx = 20*np.ones([M,L], dtype='int')
    for i in range(M):
        try:
            mtx[i,:len(seqs[i])] = ordMapping[[ord(j) for j in seqs[i].strip().upper()]]
        except ValueError:
            # This is called when the size of the matrix is too small
            pass
            if (debug==1):
                print 'Failure parsing sequence with header: %s' %headers[i]
                print 'Sequence length: %s' %len(seqs[i])
    return mtx

# builds binary Rama matrix (20 aa, no gap)
def binMatrix3D(mtx):
    """Returns mtx (m by n) as a binary matrix n by m by 20
    with each column of the third dimension equal to zero except 
    at index mtx(i,j), where it equals unity.

    Helper function of Rama Ranganathan MATLAB sca5 function. 
    """
    mtx3d = np.zeros(mtx.shape+(20,))

    for i in range(mtx3d.shape[0]):
        for j in range(mtx3d.shape[1]):
            if mtx[i,j] != 20:
                mtx3d[i,j,mtx[i,j]] = 1.0
    return mtx3d
    
# python transcription of weight_aln.m 
def weightMatrix(mtx3d,bgq):
    """
    Calculation of weight tensor, which replaces unity values in
    mtx3d with the positions relative entropy. 

    Helper function of Rama Ranganathan MATLAB sca5 function. 
    """
    nseq,npos,naa = mtx3d.shape
    
    mtx3d_mat = np.reshape(mtx3d.transpose(2,1,0),(naa*npos,nseq),order='F')
    f1_v =np.sum(mtx3d_mat.T,axis=0)/nseq
    w_v = np.squeeze(np.ones((1,naa*npos)))
    q1_v = np.squeeze(np.tile(bgq,(1,npos)))

    for x in range(naa*npos):
        q = q1_v[x]
        f = f1_v[x]
        # here I hard coded their metric DerivEntropy
        if f > 0 and f < 1:
            w_v[x] = np.abs(np.log(f*(1-q)/(q*(1-f))))
        else: 
            w_v[x] = 0.

    W = np.zeros((npos,naa))
    for i in range(npos):
        for j in range(naa):
            W[i,j] = w_v[naa*i+j]
            
    Wx = np.tile(np.reshape(W,(1, npos, naa),order='F'),(nseq,1,1))*mtx3d

    return Wx,W
                 
def project_aln(aln,Wx,W):
    """
    Calculation of 2D weight matrix.

    Helper function of Rama Ranganathan MATLAB sca5 function. 
    """
    nseq,npos,naa = Wx.shape
    f = getModesFreqs2D(aln)
    
    p_wf = np.zeros((npos,naa))
    wf = np.zeros((naa,npos))
    
    for i in range(npos):
        for j in range(naa):
            wf[j,i] = W[i,j]*f[i,j]
        if np.linalg.norm(wf[:,i])>0: 
            p_wf[i,:] = wf[:,i]/np.linalg.norm(wf[:,i])

    pwX_wf = np.zeros((nseq,npos))
    
    for i in range(npos):
        for j in range(naa):
            pwX_wf[:,i] = pwX_wf[:,i]+p_wf[i,j]*Wx[:,i,j]

    return pwX_wf,p_wf        

# sca5.m
def sca5(mtx, **kwargs):
    """
    Calculates evolutionary covariance matrix according to 
    Rama Ranganathan MATLAB sca5 function, using the relative
    entropy of each sequence and position.

    Returns position covariance and sequence covariance, as well as 
    raw weight matrix.
    """
    bgq = kwargs.get('bgq', estimateBGFreq(mtx))
    nseq,npos = mtx.shape

    mtx3d = binMatrix3D(mtx)
    Wx,W = weightMatrix(mtx3d,bgq)

    pwX,pm = project_aln(mtx,Wx,W)
    
    pwX = np.matrix(pwX)
    Cp = np.abs((pwX.T*pwX)/nseq-np.mean(pwX,axis=0).T*np.mean(pwX,axis=0))
    Cs = np.abs((pwX*pwX.T)/npos-np.mean(pwX.T,axis=0).T*np.mean(pwX.T,axis=0))

    return np.array(Cp),np.array(Cs),np.array(pwX) #matrices are silly

    
# return frequency for all aa in  all positions
def getModesFreqs2D(mtx):
    P = np.shape(mtx)[1]
    f2d = np.zeros((P,20))

    for i in range(P):
        bins = np.bincount(mtx[:,i])
        for j in range(np.min([bins.size,20])):
            f2d[i,j] = float(bins[j])/np.sum(bins)
    return f2d

# Given a matrix, getModesFreqs will return the frequency and modes of all positions
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
#To include amino acid as the z dimension
#Is this matrix now redundant?
def extrudeBinMat(binMat):
    M,L = np.shape(binMat)
    new = np.zeros([M,L,21])
    for m in range(M):
        for l in range(L):
            new[m,l,binMat[m,l]] = 1.
    return new

def resample(mtx):
    """ Returns mtx with rows (sequences) randomly resampled."""
    mtxrand = np.array([mtx[i,:] for i in np.random.randint(mtx.shape[0],size=mtx.shape[0])])
    return mtxrand

def booty(ic,mtx,iternumfactor=4):
    """ 
    Calculates confidence of IC, and residues in IC via bootstrapping.
    
    ic is a matrix whos columns are indepdentent components.
    mtx is the pruned alignment matrix

    booty returns a single matrix of same size as ic, with each column
    containing values of confidences for each residue, which, when summed, 
    represents the confidence of the IC (between zero and one).
    
    iternumfactor determined the number of bootstraps as
    the times TIMES the number of columns in ic.

    The cluster can then be extracted from each column.
    """
    tokeep = ic.shape[1]
    numiter = int(iternumfactor*mtx.shape[1])
    icConf = np.zeros(ic.shape)
    
    # the appended t on variables stands for temp.
    for l in range(numiter):
        # generate new eigenspace.
        wtemp,vtemp = np.linalg.eigh(1.-infoDistance(resample(mtx)))
        idx = np.argsort(wtemp)
        vthresh = vtemp[:,idx[-tokeep:]]
        Kt,Wt,ICt = fastica(vthresh, n_components=tokeep, max_iter=20000, tol=.0001)
        
        # Now match and add to average.
        idmatch = matchic(ic,ICt)
        
        for g in range(tokeep):
            # for vectors this should be element-wise multiplications

            toadd = ICt[:,idmatch[g,1]]*ic[:,g]
            icConf[:,g] = icConf[:,g] + toadd*np.sign(np.sum(toadd))
        #print "%s %% Complete resampling" %(100*(l+1)/float(numiter))

    return icConf/float(numiter)

def matchic(ic1,ic2):
    """ 
    returns indices of ic2 which match best for each indice of ic1.
    ic1 and ic2 are matrices of equal size, with columns as vectors.
    
    returned indmatch is a nIC by 2 matrix, where every row is a matched IC pair,
    and column one represents ic1, column 2 represents ic2
    """
    covmtx = np.matrix(ic1).T*np.matrix(ic2)
    indmatch = np.array([[int(i), int(np.argmax(np.abs(covmtx[i,:])))] for i in range(covmtx.shape[0])])
    return indmatch

def topt(icm,cutoff=.05):
    """ Returns cluster by fitting t-test and returning residues above cutoff """
    
    param = t.fit(icm,loc=np.median(icm))
    x = np.linspace(-1,1,200)
    cdf = t.cdf(x,param[0],loc=param[1], scale=param[2])

    minx = np.max(x[np.nonzero(cdf<cutoff)])

    # deal with direction of tail:
    if icm[np.nonzero(np.abs(icm)==np.max(np.abs(icm)))]<0:
        cursect = np.array([i for i in range(icm.size) if icm[i]<minx])
    else:
        maxx = np.min(x[np.nonzero(cdf>(1-cutoff))])
        cursect = np.array([i for i in range(icm.size) if icm[i]>maxx])
        
    return cursect

# Gets the consensus sequence from alignment amtrix
def consensus(mtx):
    m, f = getModesFreqs(mtx)
    return ''.join([aaMapping['%d'%i] for i in m])

# prunes matrix of '-' consensus residues
def prune(mtx, cut = 1.0):
    cols = columns(mtx, cut)
    return mtx[:,list(cols)]

# returns columns which have a mode with frequence < cut (90% by default) 
# and are not dominated by '-' modes.
def columns(mtx, cut = 0.9):
    m, f = getModesFreqs(mtx)
    cols = set(np.where(f < cut)[0]).intersection(set(np.where(m != 20)[0]))
    return list(cols)

def redundancy(mtx):
    M, L = np.shape(mtx)
    mI = pinfwrapper.inf(mtx)
    H = Entropy(mtx)
    h = (H*np.ones([L, L])).T + H*np.ones([L, L])
    return mI/h

# Shannon entropy
def Entropy(mtx):
    M, L = np.shape(mtx)
    H = np.zeros(L)
    for l in range(L):
        P = np.bincount(mtx[:,l], None, 21)/float(M)
        for i in np.where(P > 0.)[0]:
            H[l] += -P[i]*np.log2(P[i])
    return H

# returns population frequency of amino acids each residue position in mtx
def columnPops(mtx):
    M,L = np.shape(mtx)
    pops = np.zeros([L, 21])
    for i in range(L):
        pops[i] = np.bincount(mtx[:,i], None, 21)
    return pops/float(M)

# estimates background frequency of amino acids
def estimateBGFreq(mtx):
    return np.bincount(mtx.flatten(), None, 21)/float(len(mtx.flatten()))

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

def infoDistance(mtx,zerocase=1.):
    M,L = np.shape(mtx)
    H = Entropy(mtx)
    h = np.ones([L,L])*H
    mi = pinfwrapper.inf(mtx)
    jH = pinfwrapper.jointH(mtx)
    jH = np.where(jH==0,np.nan,jH)
    infdist = (h + h.T - 2*mi)/jH
    infdist = np.where(np.isnan(infdist),zerocase,infdist)
    return infdist

def clean(mtx, vecs):
    cleaned = np.zeros(np.shape(mtx))
    v,vec = np.linalg.eig(mtx)
    for i in vecs:
        l = v[i]
        k = np.matrix(deepcopy(vec[:,i]))
        cleaned = cleaned + l*np.array(k.T*k)
    return cleaned

#Return a distance matrix and information matrix trimmed to overlap and return residue indices in meatspace
def realDist(pdbFN, chainID, ats, mtx):
    d,r = pdbFile.distMat(pdbFN, chainID)
    indmtx = [i[0] for i in enumerate(ats) if i[1] in r]
    indd   = [i[0] for i in enumerate(r) if i[1] in ats]
    return d[indd][:,indd], mtx[indmtx][:,indmtx], r[indd]

# Return sequence in letters given numbers
def seq(mtx):
    return [aaMapping[str(i)] for i in mtx if i!=20]

# Return sequence indices in matrix (i.e. count the non-dash)
def seqi(vec):
    return np.nonzero(vec!=20)


def nEigs(mtx, **kw):
    """Calculate the statistical threshold for the number of eigenvectors to keep based on Rama's method. Takes an alignment matrix & returns an estimate of the number of important eigenvectors by iteratively shuffling the alignment columns to generate a significance threshold. Specify the desired covariance metric to be used with the kwarg metric = func. The metric defaults to 1. - infoDistance. Number of shufflings can be specified with the shuffles = int kwarg and defaults to 20."""
    shuffles = kw.get('shuffles', 20)
    eigval   = kw.get('eigval', -2)
    metric   = kw.get('metric', lambda x: 1. - infoDistance(x))

    eigs = np.zeros(shuffles)
    M,L = np.shape(mtx)
    m = deepcopy(mtx)

    for i in range(shuffles):

        #Shuffle the matrix
        for j in range(L):
            np.random.shuffle(m[:,j])

        eigs[i] = np.linalg.eigh(metric(m))[0][eigval] #Store the second largest Eigenvalue
        #print "%s %% complete shuffling ..." %(100*(i+1)/float(shuffles))

    v,vec = np.linalg.eigh(metric(mtx))

    nvecs = np.shape(np.where(v > eigs.max()))[1] -1

    return nvecs

def bootstrapMetric(mtx,**kw):
    """ 
    Calculates confidence of metric via bootstrapping.
    
    mtx is the pruned alignment matrix

    booty returns a square matrix of shape LxL where L is np.shape(mtx)[1].
    
    iternumfactor determined the number of bootstraps as
    the times TIMES the number of columns in ic.
    """

    iternumfactor=kw.get('iternumfactor', 0.25)
    metric = kw.get('metric', lambda x: 1.-infoDistance(x))


    M,L = np.shape(mtx)
    numiter = int(iternumfactor*mtx.shape[1])
    booted  = np.zeros([L,L])

    for l in range(numiter):
        booted = booted + metric(resample(mtx))
        #print "%s %% complete ..." %(100.*(l+1)/float(numiter))

    return booted/float(numiter)


