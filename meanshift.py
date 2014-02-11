###############################################################################
# Really really daft implementation of adaptive meanshift which should be the #
# slowest one ever written by all rights.                                     #
###############################################################################

import numpy as np


def knn(x, mtx, k):
    """
    Compute the k-nearest neighbors of x in mtx
    """
    return mtx[np.argsort([np.linalg.norm(i) for i in (mtx - x)])[1:k+1]]

def meanshift(x, mtx, H):
    """
    Compute the meanshift vector at point x given the dataset contained in mtx and the
    diagonal bandwidth MATRIX H which is supplied as a vector with the dimensionality
    equivalent to the number of vectors in mtx. Return the next vector in the series
    of a meanshift ascent.
    """
    #Bump the precision cuz st00pid. 
    x   = np.array(x,   dtype=np.float128)
    mtx = np.array(mtx, dtype=np.float128)
    H   = np.array(H,   dtype=np.float128)
    n = np.sum(mtx*np.exp(-((x-mtx)*(x-mtx))/(H*H)), axis=0)
    d = np.sum(np.exp(-((x-mtx)*(x-mtx))/(H*H)), axis=0)
    y = n/d
    #Sometimes machine precision causes the above expression to blow up. Hopefully this fixes it?
    y = np.nan_to_num(y)
    return y

def adaptiveMeanshift(x, mtx):
    """
    Compute the meanshift vector at point x given the dataset contained in mtx.

    Uses the multivariate gaussian kernel. 
    """
    #Bump the precision cuz st00pid. 
    x   = np.array(x,   dtype=np.float128)
    mtx = np.array(mtx, dtype=np.float128)
    n,d = np.shape(mtx)
    y  = x
    H  = np.array([np.sum(np.abs(i)) for i in (mtx - y)], dtype = np.float128)
    H[np.where(H == 0)] = 1.
    n = np.sum(mtx*np.exp(-((x-mtx)*(x-mtx))/(H*H)), axis=0)
    d = np.sum(np.exp(-((x-mtx)*(x-mtx))/(H*H)), axis=0)
    y = n/d
    return y

def detectMode(x, mtx, H):
    """
    Run successive meanshift steps until converged. 

    Parameters:
        x -- the starting point in the feature space for mode detection
        mtx -- the feature space to be analyzed
        badwidth -- n-vector where n is np.shape(mtx)[1]
    """
    maxiter = 20
    tol  = 1e-10
    y = x
    for i in range(maxiter):
        ny = meanshift(y, mtx, H)
        #print np.linalg.norm(ny - y)
        #if np.linalg.norm(ny -y ) < tol:
        #    break

        y = ny
    return y

def adaptiveDetectMode(x, mtx):
    """
    Run successive meanshift steps until converged. 

    Parameters:
        x -- the starting point in the feature space for mode detection
        mtx -- the feature space to be analyzed
    """
    maxiter = 20
    tol  = 0.01
    y = x
    for i in range(maxiter):
        ny = adaptiveMeanshift(y, mtx)
        #print np.linalg.norm(ny - y)
        if np.linalg.norm(ny -y ) < tol:
            break
        y = ny
    return y

