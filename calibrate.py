import numpy as np
import pdbFile
import fasta
import re
from copy import deepcopy
from time import time
from multiprocessing import cpu_count
import pinfwrapper
from sklearn.decomposition import fastica
from sklearn.cluster import MeanShift
from scipy.stats import t
import warnings
import fullmsa

def JCdistance(seqmat):
    """ 
    returns distance between the first sequence and the rest
    of the sequences, with gap characters treated as an amino acid, except where 
    both sequences have gaps. (gap = 40)
    
    seqmat is a numseq by numpos numerical matrix of amino acids.

    identity is the proportion of positions the same
    JC is the Jukes-Cantor Distance, with 21 possible aa
    JCsigma is the Jukes-Cantor variance
    """

    [numseq,numpos] = seqmat.shape
    effseqlength = np.sum(np.where(np.tile(seqmat[0],[numseq,1])+seqmat!=40,1,0),axis=1,dtype=np.double)
    
    # nan never equals nan, so we can use this as a way of ignoring gap characters.
    seqmatnan = np.where(seqmat==20,np.nan,seqmat)
    identity = np.sum(np.tile(seqmatnan[0],[numseq,1])==seqmatnan,axis=1,dtype=np.double)/effseqlength
    p = 1.-identity
    
    # There's something you need to know man,
    # JC bottoms out at p>=.75. So, lets take care of that by ... changing them.
    # We'll use a warning just in case.
    warnings.warn('Hey dude, some of your sequences are total shit',RuntimeWarning)
    p = np.where(p<20./21.,p,20./21.-.0001)
    

    # now calculate the distance metrics.
    JC = np.zeros(numseq)
    JC[1:] = -20./21.*np.log(1.-21./20.*p[1:])
    
    JCsigma = p*(1.-p)/(effseqlength*(1.-21./20.*p)**2.)

    return [identity,JC,JCsigma]


def reorder(mtx,**kw):
    """"
    re-orders the mtx MSA matrx according to similarity to ref sequence 
    (default: refseqind=0)
    """
    
    refseqind = kw.get('refseqind',0)
    mtxc = mtx
    if refseqind:
        mtxc[refseqind] = mtx[0]
        mtxc[0] = mtxc[refseqind]

    s = JCdistance(mtxc)
    mtxr = mtxc[np.argsort(s[1])]

    return mtxr

def metricBySequence(mtx,truncs,**kw):
    """ 
    calculates metric for varying truncations of MSA, in steps of truncstep
    default: metric = 1-infoDistance(mtx)
             bootstrap = True
    """
    
    [numseq,numpos] = mtx.shape

    metric   = kw.get('metric', lambda x: 1. - pinfwrapper.infoDistance(x))
    bootstrap   = kw.get('bootstrap', True)
    iternumfactor   = kw.get('iternumfactor', .01)

    results = []
    for seqlength in np.linspace(10,numseq,truncs):
        if not bootstrap:
            curmetric = metric(mtx[:seqlength])
        else:
            curmetric = fullmsa.bootstrapMetric(mtx[:seqlength],metric=metric,iternumfactor=iternumfactor)[0]
        results.append(curmetric)

    return results

def sectorDelta(mtx,**kw):
    """ 
    Looks at how sequence truncation and MeanShfit bandwidth affect the number of
    sectors relative to a reference bandwidth for the full MSA
    """
    refseqind = kw.get('refseqind',0)

    numbandtry = 50
    numseqtry = 20
    
    mtxr = reorder(mtx,refseqind=refseqind)

    [numseqs,numpos] = mtx.shape
    seqnums = np.linspace(10,numseqs,numseqtry)
    
    seqByBand = np.zeros([numseqtry,numbandtry])
    
    cps = metricBySequence(mtxr,numseqtry,bootstrap=True,iternumfactor=.01)

    for curseq in range(numseqtry):
        seqByBand[curseq,:] = sectorSearch(cps[curseq],numtry=numbandtry)[1]

    return seqByBand

def sectorSearch(Cp,**kw):
    """
    Tries a bunch of bandwidths and returns a pair of arrays 'bandwidth' and 'numsec', describing the
    number of non-unary sectors as a function of the bandwidth.
    """
    numtry = kw.get('numtry',50)
    numsector = np.zeros(numtry)
    bands = np.linspace(.01,5,numtry)
    mtxt = Cp
    for j in range(numtry):
        ms = None
        ms = MeanShift(bandwidth=bands[j],seeds=mtxt)
        ms.fit(Cp)
        numsector[j] = np.sum(np.array([np.sum(ms.labels_==i) for i in np.unique(ms.labels_)])>1)
        mtxt = ms.cluster_centers_
    return [bands,numsector]
