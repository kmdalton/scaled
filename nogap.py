from ctypes import *
import numpy as np
import os


#Find the dynamic C-libs in the same directory as this file
directoryPrefix = os.path.abspath(os.path.dirname(__file__))+'/'
lib = directoryPrefix + 'inf_nogap.so'
DLL = cdll.LoadLibrary(lib)



def infoDistance(mtx, **kw):
    M,L = np.shape(mtx)
    H = Entropy(mtx)
    MI = Inf(mtx)
    JH = JointH(mtx)
    zerocase = kw.get('zerocase', 1.)
    JH[np.where(JH == 0.)] = zerocase
    return (H - 2*MI)/JH

# Calculate the sum of the two marginal Entropies for residue pairs
def Entropy(mtx):
    M, L = np.shape(mtx)
    cfun = DLL.Entropy
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

