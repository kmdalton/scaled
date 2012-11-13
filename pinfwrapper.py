from time import time
from ctypes import *
import numpy as np

def cMtx(mtx):
    M, L = np.shape(mtx)
    arrayConstructor = c_int*L*M
    rowConstructor = c_int*L
    msa = arrayConstructor(*tuple([rowConstructor(*tuple(mtx[i])) for i in range(M)]))
    return msa

def convertCtoNumpy(X, Y, mtx):
    m = np.zeros([X,Y])
    for i in xrange(X):
        for j in xrange(Y):
            m[i,j] = mtx[i][j]

def cMI(mtx):
    mi = inf(mtx)
    return np.sum(mi, axis = (0))

def inf(mtx):
    start = time()
    M, L = np.shape(mtx)
    lib = 'pinf.so'
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


def jointH(mtx):
    start = time()
    M, L = np.shape(mtx)
    lib = 'joint.so'
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

