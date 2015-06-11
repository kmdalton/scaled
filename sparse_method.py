import pinfwrapper,fullmsa
import scipy.linalg
import numpy as np
import cvxpy as cvx

def jpd(mtx):
    M,L = np.shape(mtx)
    k = mtx.max()+1
    bivariate_mapper = np.arange(k*k).reshape((k,k))
    j = bivariate_mapper[mtx[:,:,None], mtx[:,None,:]]
    j = j.reshape(M, L**2)
    j = np.vstack([np.bincount(i, minlength=k**2)/float(M) for i in j.T])
    return j.reshape((k**2, L, L))


def max_entropy(mtx, **kw):
    M = np.shape(mtx)[0]
    masks = cvx.hstack(*(cvx.Constant(mtx==i) for i in np.where(np.bincount(mtx.flatten()) > 0)[0]))
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
    P = [max_entropy(i) for i in mtx.T]
    for p in P:
        p.solve(solver='SCS', max_iters=100000)
        p.solve(max_iters=100000)
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

def glasso(cov, rho, glasso_kwargs = None):
    dpglasso = importr('dpglasso')
    return np.array(dpglasso.dpglasso(cov, rho=rho)[2])

def MPD(mtx):
    M,L = np.shape(mtx)
    k = mtx.max() + 1
    return np.vstack((np.histogram(i, k, (-.01,20.1))[0]/float(M) for i in mtx.T))
    

def MER(mtx, **kw):
    delta = kw.get('delta', 0.01)
    k = mtx.max() + 1
    M,L = np.shape(mtx)
    JPD = jpd(mtx)
    X,Y = np.triu_indices(L, 1)
    JPD = [i[i > 0.] for i in JPD[:,X,Y].T]
    print np.shape(JPD)
    print np.shape(JPD[0])
    V = [cvx.Variable(len(i)) for i in JPD]
    constraints = []
    H = 0.
    for j,v in zip(JPD,V):
        constraints.append(sum([cvx.kl_div(p1,p2) for p1,p2 in zip(j,v)]) <= delta)
        constraints.append(v >= 0.)
        H += cvx.sum_entries(cvx.entr(v))
    print type(H)
    print [type(i) for i in constraints[:10]]
    return cvx.Problem(cvx.Maximize(H), constraints)
