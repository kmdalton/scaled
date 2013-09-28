from time import time
from ctypes import *
import numpy as np
import os

# create c-based matrix
def cMtx(mtx):
    M, L = np.shape(mtx)
    arrayConstructor = c_int*L*M
    rowConstructor = c_int*L
    msa = arrayConstructor(*tuple([rowConstructor(*tuple(mtx[i])) for i in range(M)]))
    return msa

# convert c matrix back to numpy
def convertCtoNumpy(X, Y, mtx):
    m = np.zeros([X,Y])
    for i in xrange(X):
        for j in xrange(Y):
            m[i,j] = mtx[i][j]

# return the column-sum mutual information from covariance matrix
def cMI(mtx):
    mi = inf(mtx)
    return np.sum(mi, axis = (0))

# calculate mutual information
def inf(mtx):
    start = time()
    M, L = np.shape(mtx)
    curpwd = os.getcwd()
    lib = curpwd+r'/pinf.so'
    dll = cdll.LoadLibrary(lib)
    Cij = dll.Cij
    Cij.restype = c_voidp
    Cij.argtypes = [
        c_int,
        c_int,
        c_int*L*M
    ]
    arrayConstructor = c_int*L*M
    rowConstructor = c_int*L
    msa = arrayConstructor(*tuple([rowConstructor(*tuple(mtx[i])) for i in range(M)]))
    arrayConstructor = c_float*L*L
    rowConstructor = c_float*L
    C = arrayConstructor(*tuple([rowConstructor(*tuple([0.]*L)) for i in range(L)]))
    print 'Here we go! Starting information matrix calculation ...'
    Cij(c_int(M), c_int(L), msa, C)
    B = np.zeros([L, L])
    for i in xrange(L):
        for j in xrange(L):
            B[i,j] = C[i][j]
    print 'We are done in %s seconds' %(time() - start)
    return B

# calculate joint entropy
def jointH(mtx):
    start = time()
    M, L = np.shape(mtx)
    curpwd = os.getcwd()
    lib = curpwd+r'/joint.so'
    dll = cdll.LoadLibrary(lib)
    Cij = dll.Cij
    Cij.restype = c_voidp
    Cij.argtypes = [
        c_int,
        c_int,
        c_int*L*M
    ]
    arrayConstructor = c_int*L*M
    rowConstructor = c_int*L
    msa = arrayConstructor(*tuple([rowConstructor(*tuple(mtx[i])) for i in range(M)]))
    arrayConstructor = c_float*L*L
    rowConstructor = c_float*L
    C = arrayConstructor(*tuple([rowConstructor(*tuple([0.]*L)) for i in range(L)]))
    print 'Here we go! Starting information matrix calculation ...'
    Cij(c_int(M), c_int(L), msa, C)
    B = np.zeros([L, L])
    for i in xrange(L):
        for j in xrange(L):
            B[i,j] = C[i][j]
    print 'We are done in %s seconds' %(time() - start)
    return B

