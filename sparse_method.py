import pinfwrapper,fullmsa
import scipy.linalg
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

def columnwise_max_weights(mtx, **kw):
    rho = kw.get('rho', 0.)
    P = [l2_max_entropy(i, rho=rho) for i in mtx.T]
    for p in P:
        p.solve(solver='SCS')
    W = np.array([np.array(p.variables()[0].value).flatten() for p in P])
    return W

def iter_sparse_sqrt(mtx, **kw):
    alpha = kw.get('alpha', .001)
    iters = kw.get('iters', 10)
    threshold = kw.get('threshold', 1.)
    solver_kwargs = kw.get('solver_kwargs', {'solver': 'SCS', 'verbose': True, 'max_iters': 100000})
    C = 1. - pinfwrapper.infoDistance(mtx)
    R = scipy.linalg.sqrtm(C)
    for i in range(iters):
        p = sparse_sqrt(C, R, alpha=alpha)
        p.solve(**solver_kwargs)
        T = np.array(p.variables()[0].value)
        if np.sum(np.square(R-T)) < threshold:
            R = T.copy()
            break
        R = T.copy()
    return R

def sparse_sqrt(C, R, **kw):
    L,L = np.shape(C)
    alpha = kw.get('alpha', .001)
    I = np.matrix(np.linalg.inv(R))*np.matrix(C)
    R = cvx.Variable(L,L)
    constraints = [R == R.T]
    p = cvx.Problem(
        cvx.Minimize((1./L/L)*cvx.sum_squares(R - I) + alpha*(1./L/L)*cvx.norm1(R)), 
    constraints)
    return p


from rpy2 import robjects
import rpy2.robjects.numpy2ri
from rpy2.robjects.packages import importr
rpy2.robjects.numpy2ri.activate()

def glasso(cov, rho):
    dpglasso = importr('dpglasso')
    return dpglasso.dpglasso(cov, rho=rho)[2]

