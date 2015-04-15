import pinfwrapper,fullmsa
import numpy as np
import cvxpy as cvx

def max_entropy(mtx, **kw):
    M = np.shape(mtx)[0]
    masks = cvx.hstack(*(cvx.Constant(mtx==i) for i in range(mtx.max()+1)))
    weights= cvx.Variable(M)
    constraints=[weights >= 0., cvx.sum_entries(weights) == 1.]
    p = cvx.Problem(cvx.Maximize(cvx.sum_entries(cvx.entr(weights.T*masks))), constraints)
    return p

def l2_max_entropy(mtx, **kw):
    M = np.shape(mtx)[0]
    rho   = kw.get('rho', float(M))
    masks = cvx.hstack(*(cvx.Constant(mtx==i) for i in range(mtx.max()+1)))
    weights= cvx.Variable(M)
    constraints=[weights >= 0., cvx.sum_entries(weights) == 1.]
    p = cvx.Problem(cvx.Maximize((1./float(M))*cvx.sum_entries(cvx.entr(weights.T*masks)) - rho*cvx.norm2(weights)), constraints)
    return p

def fix_positive_definiteness(C):
    """
    Some extreme weightings on the normalized mutual information lead to the accumulation
    of numerical errors culminating in a single negative eigenvalue. As such, I've written
    this filter to remove the nullspace from the eigenspectrum by increasing all the eigen
    values to be >=0.
    """

    v,vec = np.linalg.eig(C)
    if v.min() < 0.:
        v = v - v.min()
        return np.matrix(vec)*np.matrix(np.diag(v))*np.matrix(vec).T
    else:
        return C
