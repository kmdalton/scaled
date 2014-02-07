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

def adaptiveMeanshift(x, mtx, k):
    """
    Compute the meanshift vector at point x given the dataset contained in mtx.

    Uses the multivariate gaussian kernel. 
    """
    y  = x
    nn = knn(y, mtx, k) 
    h  = np.array([np.sqrt(np.dot(i,i)) for i in (nn - y)])
    yn = np.sum(
            nn.T*np.exp(
                -np.square(y - nn).T/np.square(h)
            ), axis = 1
         )/np.sum(
            np.exp(
                -np.square(y - nn).T/np.square(h)
            ), axis = 1
         )
    return yn

def detectMode(x, mtx, k):
    """
    Run successive meanshift steps until converged. 

    Parameters:
        x -- the starting point in the feature space for mode detection
        mtx -- the feature space to be analyzed
        k -- number of nearest neighbors to use for meanshift estimation
    """
    maxiter = 20
    tol  = 0.01
    y = x
    for i in range(maxiter):
        ny = adaptiveMeanshift(y, mtx, k)
        print np.linalg.norm(ny - y)
        if np.linalg.norm(ny -y ) < tol:
            break
        y = ny
    return y
