from ctypes import *
import numpy as np
import fullmsa, os


#Find the dynamic C-libs in the same directory as this file
directoryPrefix = os.path.abspath(os.path.dirname(__file__))+'/'
lib = directoryPrefix + 'inf.so'
DLL = cdll.LoadLibrary(lib)

def Redundancy(mtx):
    M,L = np.shape(mtx)
    I  = Inf(mtx)
    H  = fullmsa.Entropy(mtx)
    H  = np.ones((L,L))*H
    return I/(H + H.T)

def weightedRedundancy(mtx, W = None):
    if W is None:
        W = weights(mtx)
    M,L = np.shape(mtx)
    IW  = weightedInf(mtx, W)
    HW  = weightedEntropy(mtx, W)
    HW  = np.ones((L,L))*HW
    return IW/(HW + HW.T)

def infoDistance(mtx):
    M,L = np.shape(mtx)
    H = fullmsa.Entropy(mtx)
    H = np.ones((L,L))*H
    MI = Inf(mtx)
    JH = JointH(mtx)
    return (H + H.T - MI)/JH

def weightedInfoDistance(mtx, W = None):
    if W is None:
        W  = weights(mtx)
    M,L = np.shape(mtx)
    HW = weightedEntropy(mtx, W)
    HW = np.ones((L,L))*HW
    MI = weightedInf(mtx, W)
    JH = weightedJointH(mtx, W)
    return (HW + HW.T - MI)/JH

def weights(mtx):
    M,L = np.shape(mtx)
    weights = np.zeros(np.shape(mtx))
    weights[np.where(mtx - mtx[0] == 0)] = 1
    weights = np.sum(weights, axis=1)/float(L)
    return weights

def weightedEntropy(mtx, W=None):
    if W is None:
        W = weights(mtx)
    M, L = np.shape(mtx)
    Mw = np.sum(W)
    H = np.zeros(L)
    for l in range(L):
        for r in range(21):
            if r in mtx[:,l]:
                P = W[np.where(mtx[:,l] == r)]/Mw
                P = np.sum(P)
                H[l] += -P*np.log2(P)
    return H

def weightedRedundancy(mtx, W = None):
    if W is None:
        W = weights(mtx)
    M,L = np.shape(mtx)
    I = weightedInf(mtx, W)
    H = weightedEntropy(mtx)
    H = np.ones((L,L))*H
    return I/(H+H.T)

# calculate weighted mutual information
def weightedInf(mtx, W):
    M, L = np.shape(mtx)
    cfun = DLL.WeightedInf
    cfun.restype = c_voidp
    cfun.argtypes = [
        c_int,
        c_int,
        c_int*L*M,
        c_float*L*L,
        c_float*M
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
    cfun(c_int(M), c_int(L), msa, C, W)

    #Turn the covariance matrix CArray into a numpy array
    B = np.zeros([L, L])
    for i in xrange(L):
        for j in xrange(L):
            B[i,j] = C[i][j]
    return B

# calculate weighted mutual information
def weightedJointH(mtx, W):
    M, L = np.shape(mtx)
    cfun = DLL.WeightedJointH
    cfun.restype = c_voidp
    cfun.argtypes = [
        c_int,
        c_int,
        c_int*L*M,
        c_float*L*L,
        c_float*M
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
    cfun(c_int(M), c_int(L), msa, C, W)

    #Turn the covariance matrix CArray into a numpy array
    B = np.zeros([L, L])
    for i in xrange(L):
        for j in xrange(L):
            B[i,j] = C[i][j]
    return B

# calculate weighted mutual information
def Inf(mtx):
    M, L = np.shape(mtx)
    cfun = DLL.Inf
    cfun.restype = c_voidp
    cfun.argtypes = [
        c_int,
        c_int,
        c_int*L*M,
        c_float*L*L
    ]

    #Make the mtx CArray
    arrayConstructor = c_int*L*M
    rowConstructor = c_int*L
    msa = arrayConstructor(*tuple([rowConstructor(*tuple(i)) for i in mtx]))

    #Make the covariance matrix CArray
    arrayConstructor = c_float*L*L
    rowConstructor = c_float*L
    C = arrayConstructor(*tuple([rowConstructor(*tuple([0.]*L)) for i in range(L)]))

    #Call the actual cfunction
    cfun(c_int(M), c_int(L), msa, C)

    #Turn the covariance matrix CArray into a numpy array
    B = np.zeros([L, L])
    for i in xrange(L):
        for j in xrange(L):
            B[i,j] = C[i][j]
    return B

# calculate weighted mutual information
def JointH(mtx):
    M, L = np.shape(mtx)
    cfun = DLL.JointH
    cfun.restype = c_voidp
    cfun.argtypes = [
        c_int,
        c_int,
        c_int*L*M,
        c_float*L*L
    ]

    #Make the mtx CArray
    arrayConstructor = c_int*L*M
    rowConstructor = c_int*L
    msa = arrayConstructor(*tuple([rowConstructor(*tuple(i)) for i in mtx]))

    #Make the covariance matrix CArray
    arrayConstructor = c_float*L*L
    rowConstructor = c_float*L
    C = arrayConstructor(*tuple([rowConstructor(*tuple([0.]*L)) for i in range(L)]))

    #Call the actual cfunction
    cfun(c_int(M), c_int(L), msa, C)

    #Turn the covariance matrix CArray into a numpy array
    B = np.zeros([L, L])
    for i in xrange(L):
        for j in xrange(L):
            B[i,j] = C[i][j]
    return B

