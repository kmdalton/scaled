from ctypes import *
import numpy as np
import fullmsa, os


#Find the dynamic C-libs in the same directory as this file
directoryPrefix = os.path.abspath(os.path.dirname(__file__))+'/'
lib = directoryPrefix + 'inf.so'
DLL = cdll.LoadLibrary(lib)

# calculate weighted mutual information
def Inf(mtx, **kwargs):
    """
    pinfwrapper.Inf(mtx, **kwargs)
        Calculate the mutual information between columns in an alignment
    
    Parameters
    ----------
    mtx : numpy.ndarray
        Numpy array representing the multiple sequence alignment

    kwargs : {nogaps, weights}
        nogaps:
            Boolean- When True, omit residue pairs containing gaps from the probability distribution. 
        weights:
            Numpy Array- Supply a numpy array with the same length as the number of sequences in the alignment. The weights will be substituted in place of 1. in the summation of probability distributions for the infoDistance calculation. 
    Returns
    -------
    An LxL numpy array of floats where L is np.shape(mtx)[1]
    """

    M, L = np.shape(mtx)

    nogaps = kwargs.get('nogaps', False)
    PDSize = 21
    if nogaps == True:
        PDSize = 20
    W = kwargs.get('weights', np.ones(M))

    cfun = DLL.Inf
    cfun.restype = c_voidp
    cfun.argtypes = [
        c_int, #M -- number of sequences
        c_int, #L -- number of residues
        c_int, #PDSize -- 20 means ignore gaps & 21 means include gaps
        c_float*M, #Weights -- weighting factor for each sequence
        c_int*L*M, #alignment matrix -- make with fullmsa.binMatrix
        c_float*L*L #Covariance matrix -- will be altered in place by c function
    ]

    #Make the mtx CArray
    arrayConstructor = c_int*L*M
    rowConstructor = c_int*L
    msa = arrayConstructor(*tuple([rowConstructor(*tuple(i)) for i in mtx]))

    #Make the covariance matrix CArray
    arrayConstructor = c_float*L*L
    rowConstructor = c_float*L
    C = arrayConstructor(*tuple([rowConstructor(*tuple([0.]*L)) for i in range(L)]))

    #Make the weight CArray
    rowConstructor = c_float*M
    W = rowConstructor(*tuple(W))

    #Call the actual cfunction
    cfun(c_int(M), c_int(L), c_int(PDSize), W, msa, C)

    #Turn the covariance matrix CArray into a numpy array
    B = np.zeros([L, L])
    for i in xrange(L):
        for j in xrange(L):
            B[i,j] = C[i][j]
    return B

# calculate weighted mutual information
def JointH(mtx, **kwargs):
    """
    pinfwrapper.JointH(mtx, **kwargs)
        Calculate the joint entropy between columns in an alignment
    
    Parameters
    ----------
    mtx : numpy.ndarray
        Numpy array representing the multiple sequence alignment

    kwargs : {nogaps, weights}
        nogaps:
            Boolean- When True, omit residue pairs containing gaps from the probability distribution. 
        weights:
            Numpy Array- Supply a numpy array with the same length as the number of sequences in the alignment. The weights will be substituted in place of 1. in the summation of probability distributions for the infoDistance calculation. 
    Returns
    -------
    An LxL numpy array of floats where L is np.shape(mtx)[1]
    """

    M, L = np.shape(mtx)

    nogaps = kwargs.get('nogaps', False)
    PDSize = 21
    if nogaps == True:
        PDSize = 20
    W = kwargs.get('weights', np.ones(M))

    cfun = DLL.JointH
    cfun.restype = c_voidp
    cfun.argtypes = [
        c_int, #M -- number of sequences
        c_int, #L -- number of residues
        c_int, #PDSize -- 20 means ignore gaps & 21 means include gaps
        c_float*M, #Weights -- weighting factor for each sequence
        c_int*L*M, #alignment matrix -- make with fullmsa.binMatrix
        c_float*L*L #Covariance matrix -- will be altered in place by c function
    ]

    #Make the mtx CArray
    arrayConstructor = c_int*L*M
    rowConstructor = c_int*L
    msa = arrayConstructor(*tuple([rowConstructor(*tuple(i)) for i in mtx]))

    #Make the covariance matrix CArray
    arrayConstructor = c_float*L*L
    rowConstructor = c_float*L
    C = arrayConstructor(*tuple([rowConstructor(*tuple([0.]*L)) for i in range(L)]))

    #Make the weight CArray
    rowConstructor = c_float*M
    W = rowConstructor(*tuple(W))

    #Call the actual cfunction
    cfun(c_int(M), c_int(L), c_int(PDSize), W, msa, C)

    #Turn the covariance matrix CArray into a numpy array
    B = np.zeros([L, L])
    for i in xrange(L):
        for j in xrange(L):
            B[i,j] = C[i][j]
    return B

# calculate weighted mutual information
def PairWiseEntropy(mtx, **kwargs):
    """
    pinfwrapper.PairWiseEntropy(mtx, **kwargs)
        Calculate the sum of entropies for two columns as conditioned by sequence weights and/or gap treatment
    
    Parameters
    ----------
    mtx : numpy.ndarray
        Numpy array representing the multiple sequence alignment

    kwargs : {nogaps, weights}
        nogaps:
            Boolean- When True, omit residue pairs containing gaps from the probability distribution. 
        weights:
            Numpy Array- Supply a numpy array with the same length as the number of sequences in the alignment. The weights will be substituted in place of 1. in the summation of probability distributions for the infoDistance calculation. 
    Returns
    -------
    An LxL numpy array of floats where L is np.shape(mtx)[1]
    """

    M, L = np.shape(mtx)

    nogaps = kwargs.get('nogaps', False)
    PDSize = 21
    if nogaps == True:
        PDSize = 20
    W = kwargs.get('weights', np.ones(M))

    cfun = DLL.Entropy
    cfun.restype = c_voidp
    cfun.argtypes = [
        c_int, #M -- number of sequences
        c_int, #L -- number of residues
        c_int, #PDSize -- 20 means ignore gaps & 21 means include gaps
        c_float*M, #Weights -- weighting factor for each sequence
        c_int*L*M, #alignment matrix -- make with fullmsa.binMatrix
        c_float*L*L #Covariance matrix -- will be altered in place by c function
    ]

    #Make the mtx CArray
    arrayConstructor = c_int*L*M
    rowConstructor = c_int*L
    msa = arrayConstructor(*tuple([rowConstructor(*tuple(i)) for i in mtx]))

    #Make the covariance matrix CArray
    arrayConstructor = c_float*L*L
    rowConstructor = c_float*L
    C = arrayConstructor(*tuple([rowConstructor(*tuple([0.]*L)) for i in range(L)]))

    #Make the weight CArray
    rowConstructor = c_float*M
    W = rowConstructor(*tuple(W))

    #Call the actual cfunction
    cfun(c_int(M), c_int(L), c_int(PDSize), W, msa, C)

    #Turn the covariance matrix CArray into a numpy array
    B = np.zeros([L, L])
    for i in xrange(L):
        for j in xrange(L):
            B[i,j] = C[i][j]
    return B

# calculate weighted mutual information
def infoDistance(mtx, **kwargs):
    """
    pinfwrapper.infoDistance(mtx, **kwargs)
        This function is meant to consolidate all the versions of infodistance and to allow for customization via kwargs. Defaults to vanilla infoDistance.
    
    Parameters
    ----------
    mtx : numpy.ndarray
        Numpy array representing the multiple sequence alignment

    kwargs : {nogaps, weights, zerocase}
        nogaps:
            Boolean- When True, omit residue pairs containing gaps from the infodistance probability distribution. *Note that this metric no longer obeys the triangle inequality but seems to perform better for lower quality alignments
        weights:
            Numpy Array- Supply a numpy array with the same length as the number of sequences in the alignment. The weights will be substituted in place of 1. in the summation of probability distributions for the infoDistance calculation. 
        zerocase:
            float- What value should infoDistance take when the joint probibility distribution is zero. The default value is 0.
    """
    M, L = np.shape(mtx)

    nogaps = kwargs.get('nogaps', False)
    zerocase = kwargs.get('zerocase', 0.)
    PDSize = 21
    if nogaps == True:
        PDSize = 20
    W = kwargs.get('weights', np.ones(M))

    cfun = DLL.infoDistance
    cfun.restype = c_voidp
    cfun.argtypes = [
        c_int, #M -- number of sequences
        c_int, #L -- number of residues
        c_int, #PDSize -- 20 means ignore gaps & 21 means include gaps
        c_float, #zerocase -- what value should it take when the joint entropy is zero?
        c_float*M, #Weights -- weighting factor for each sequence
        c_int*L*M, #alignment matrix -- make with fullmsa.binMatrix
        c_float*L*L #Covariance matrix -- will be altered in place by c function
    ]

    #Make the mtx CArray
    arrayConstructor = c_int*L*M
    rowConstructor = c_int*L
    msa = arrayConstructor(*tuple([rowConstructor(*tuple(i)) for i in mtx]))

    #Make the covariance matrix CArray
    arrayConstructor = c_float*L*L
    rowConstructor = c_float*L
    C = arrayConstructor(*tuple([rowConstructor(*tuple([0.]*L)) for i in range(L)]))

    #Make the weight CArray
    rowConstructor = c_float*M
    W = rowConstructor(*tuple(W))

    #Call the actual cfunction
    cfun(c_int(M), c_int(L), c_int(PDSize), c_float(zerocase), W, msa, C)

    #Turn the covariance matrix CArray into a numpy array
    B = np.zeros([L, L])
    for i in xrange(L):
        for j in xrange(L):
            B[i,j] = C[i][j]
    return B


# calculate weighted mutual information
def OMES(mtx, **kwargs):
    """
    Calculate the observed minus expected squared metric for protein coevolution. 
    Parameters
    ----------
    mtx : numpy.ndarray
        Numpy array representing the multiple sequence alignment

    kwargs : {nogaps, weights, zerocase}
        nogaps:
            Boolean- When True, omit residue pairs containing gaps from the infodistance probability distribution. Default is True for this metric to correspond with the published metric.
        weights:
            Numpy Array- Supply a numpy array with the same length as the number of sequences in the alignment. The weights will be substituted in place of 1. in the summation of probability distributions for the infoDistance calculation. 
    """
    M, L = np.shape(mtx)

    nogaps = kwargs.get('nogaps', True)
    PDSize = 21
    if nogaps == True:
        PDSize = 20
    W = kwargs.get('weights', np.ones(M))

    cfun = DLL.OMES
    cfun.restype = c_voidp
    cfun.argtypes = [
        c_int, #M -- number of sequences
        c_int, #L -- number of residues
        c_int, #PDSize -- 20 means ignore gaps & 21 means include gaps
        c_float*M, #Weights -- weighting factor for each sequence
        c_int*L*M, #alignment matrix -- make with fullmsa.binMatrix
        c_float*L*L #Covariance matrix -- will be altered in place by c function
    ]

    #Make the mtx CArray
    arrayConstructor = c_int*L*M
    rowConstructor = c_int*L
    msa = arrayConstructor(*tuple([rowConstructor(*tuple(i)) for i in mtx]))

    #Make the covariance matrix CArray
    arrayConstructor = c_float*L*L
    rowConstructor = c_float*L
    C = arrayConstructor(*tuple([rowConstructor(*tuple([0.]*L)) for i in range(L)]))

    #Make the weight CArray
    rowConstructor = c_float*M
    W = rowConstructor(*tuple(W))

    #Call the actual cfunction
    cfun(c_int(M), c_int(L), c_int(PDSize), W, msa, C)

    #Turn the covariance matrix CArray into a numpy array
    B = np.zeros([L, L])
    for i in xrange(L):
        for j in xrange(L):
            B[i,j] = C[i][j]
    return B


# calculate weighted mutual information
def MINT(mtx, **kwargs):
    """
    pinfwrapper.MINT(mtx, **kwargs)
        Calculate the mutual interdependency correction (Tillier & Liu). 
    
    Parameters
    ----------
    mtx : numpy.ndarray
        Numpy array representing the multiple sequence alignment

    kwargs : {nogaps, weights}
        nogaps:
            Boolean- When True, omit residue pairs containing gaps from the probability distribution. Defaults to True as defined by Tillier and Liu.
        weights:
            Numpy Array- Supply a numpy array with the same length as the number of sequences in the alignment. The weights will be substituted in place of 1. in the summation of probability distributions for the infoDistance calculation. 
    Returns
    -------
    An LxL numpy array of floats where L is np.shape(mtx)[1]
    """
    I = Inf(mtx, nogaps=kwargs.get('nogaps', True))

# Shannon entropy
def Entropy(mtx, **kw):
    nogaps = kw.get('nogaps', False)
    MPDSize= 21
    if nogaps:
        MPDSize = 20
    M = np.shape(mtx)[0]
    L = 1 if len(np.shape(mtx)) == 1 else np.shape(mtx)[1]
    weights= kw.get('weights', np.ones(M))
    weights= np.array(weights, dtype=float)
    H = np.zeros(L)
    if L == 1:
		P = np.histogram(mtx, MPDSize, (-0.1, MPDSize-0.9), weights=weights)[0]/np.sum(weights)
		H = -np.sum(P[P > 0.]*np.log2(P[P> 0.]))
    else:
        for l in range(L):
            P = np.histogram(mtx[:,l], MPDSize, (-0.1, MPDSize-0.9), weights=weights)[0]/np.sum(weights)
            H[l] = -np.sum(P[P > 0.]*np.log2(P[P> 0.]))
    return H

def NullEntropy(mtx, **kw):
    nogaps = kw.get('nogaps', False)
    MPDSize= 21
    if nogaps:
        MPDSize = 20
    M,L = np.shape(mtx)
    weights= kw.get('weights', np.ones(M))
    weights= np.array(weights, dtype=float)
    H = np.zeros(L)
    P = np.array([np.histogram(i, MPDSize, (-0.1, MPDSize-0.9), weights=weights)[0]/np.sum(weights) for i in mtx.T])
    P = P.T*P[:,:,None]
    P[P>0.] = P[P>0.]*np.log2(P[P>0.])
    H = -np.sum(P,axis=1)
    return H
