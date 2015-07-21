import pinfwrapper,fullmsa
import scipy.linalg
import numpy as np
import cvxpy as cvx

def jpd(mtx, **kw):
    M,L = np.shape(mtx)
    k = mtx.max()+1
    bivariate_mapper = np.arange(k*k).reshape((k,k))
    j = bivariate_mapper[mtx[:,:,None], mtx[:,None,:]].swapaxes(0,2).swapaxes(0,1)
    func1d = lambda x: np.bincount(x, kw.get('weights', None), k**2) #This is a helper, just chill out
    j = np.apply_along_axis(func1d, 2, j)
    return j/float(M)

def mpd(mtx, **kw):
    M,L = np.shape(mtx)
    k = mtx.max()+1
    func1d = lambda x: np.bincount(x, kw.get('weights', None), k) #This is a helper, just chill out
    mtx = np.apply_along_axis(func1d, 0, mtx)
    return mtx.T/float(M)

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


#from rpy2 import robjects
#import rpy2.robjects.numpy2ri
#from rpy2.robjects.packages import importr
#rpy2.robjects.numpy2ri.activate()
#
#def glasso(cov, rho, glasso_kwargs = None):
#    dpglasso = importr('dpglasso')
#    return np.array(dpglasso.dpglasso(cov, rho=rho)[2])

def MER(mtx, **kw):
    delta = kw.get('delta', 0.01)
    cutoff= kw.get('thresholdnmi', 0.2)
    k = mtx.max() + 1
    M,L = np.shape(mtx)
    JPD = jpd(mtx)
    #X,Y = np.triu_indices(L, 1)
    C = 1. - pinfwrapper.infoDistance(mtx)
    C[np.tril_indices(L)] = 0.
    X,Y = np.where(C>cutoff)
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

def joint_counts_matrix(mtx, **kw):
    M,L = np.shape(mtx)
    k = mtx.max()+1
    bivariate_mapper = np.arange(k*k).reshape((k,k))
    j = bivariate_mapper[mtx[:,:,None], mtx[:,None,:]]
    idx1,idx2 = np.triu_indices(L, 1)
    j = j[:,idx1,idx2]
    #return j
    M,L = np.shape(j)
    X,Y = np.array([], dtype=int),np.array([], dtype=int)
    offset = 0
    for i in [i for i in range(k**2) if i in j]:
        A,B = np.where(j[:,np.sum(j == i, axis=0) > 0.] == i)
        X,Y = np.append(X, A),np.append(Y, B + offset)
        offset = offset + B.max()
    return scipy.sparse.csr_matrix(scipy.sparse.coo_matrix((np.ones(len(X)), (X,Y))))

from scipy.optimize import minimize

def coordinate_descent(f, g, **kw):
    tolerance   = kw.get('tolerance', 0.1)
    macrocycles = kw.get('macrocycles', 100)
    w = g.copy()
    converged = False

    for i in range(macrocycles):
        print "Entering macrocyle {}".format(i)
        old_weights = w.copy()
        for j in range(len(g)):
            print "Optimizing sequence {}".format(j+1)
            def v(x):
                w[j] = x
                return f(w)
            w[j] = minimize(v, [w[i]], bounds=[(0., None)])['x']
            w = w/np.sum(w)
        if np.sum(np.abs(old_weights - w)) < tolerance:
            converged = True
            break

    print "Converged: {}".format(converged)
    return w


def linked_error(mtx, **kw):
    J = jpd(mtx)
    k,L,L = np.shape(J)
    k = int(np.sqrt(k))
    C = []
    O = cvx.Constant(np.ones(k))
    H = 0.
    for j in J[:, np.triu_indices(L, 1)[0], np.triu_indices(L,1)[1]].T:
        j = cvx.Constant(j.reshape((k,k)))
        v = cvx.Variable(k,k)
        C.append(O.T*j == O.T*v)
        C.append(O.T*j.T == O.T*v.T)
        H += cvx.sum_entries(cvx.entr(v)) 
    p = cvx.Problem(cvx.Maximize(H), C)
    return p

def max_joint_dkl(j, **kw):
    j = compress_jpd(j)
    k,l = np.shape(j)
    j = cvx.Constant(j)
    alpha = kw.get('alpha', 1.)
    v = cvx.Variable(k,l)
    Ok = cvx.Constant(np.ones(k))
    Ol = cvx.Constant(np.ones(l))
    constraints = [Ok.T*v == Ok.T*j, Ol.T*v.T == Ol.T*j.T]
    D = 0
    for x in range(k):
        for y in range(l):
            D += cvx.kl_div(j[x,y], v[x,y])
    H = cvx.sum_entries(cvx.entr(v))
    p = cvx.Problem(cvx.Maximize(H-alpha*D), constraints)
    return p


def max_joint(j, **kw):
    k,l = np.shape(j)
    j = cvx.Constant(j)
    v = cvx.Variable(k,l)
    Ok = cvx.Constant(np.ones(k))
    Ol = cvx.Constant(np.ones(l))
    constraints = [Ok.T*v == Ok.T*j, Ol.T*v.T == Ol.T*j.T]
    H = cvx.sum_entries(cvx.entr(v))
    p = cvx.Problem(cvx.Maximize(H), constraints)
    return p

def entropy(p):
    p = p*np.log2(p)
    p[np.isnan(p)] = 0.
    return -np.sum(p)

def mi(j):
    Hx = entropy(np.sum(j, axis=0))
    Hy = entropy(np.sum(j, axis=1))
    Hxy= entropy(j.flatten())
    return Hx + Hy - Hxy

def nmi(j):
    Hx = entropy(np.sum(j, axis=0))
    Hy = entropy(np.sum(j, axis=1))
    Hxy= entropy(j.flatten())
    return (Hx + Hy - Hxy)/Hxy
    M,L = np.shape(mtx)
    M,L = np.shape(mtx)

def compress_jpd(j):
    j = j[:,np.sum(j, 0) > 0.][np.sum(j,1) >0.,:]
    return j

def min_chi2(j, **kw):
    alpha = kw.get('alpha', 1.)
    k,l = np.shape(j)
    Mk = np.sum(j, 1)
    Ml = np.sum(j, 0)
    e = cvx.Constant(np.matrix(Mk).T*np.matrix(Ml))
    print np.shape(e)
    v = cvx.Variable(k,l)

    j = cvx.Constant(j)
    ek,el = cvx.Constant(np.ones(k)), cvx.Constant(np.ones(l))
    constraints = [ek.T*v == ek.T*j, el.T*v.T == el.T*j.T]
    p = cvx.Problem(cvx.Minimize(cvx.sum_squares(v - e) + alpha*(cvx.sum_squares(v - j))), constraints)
    return p

def expected(mtx, **kw):
    w = kw.get('weights', None)
    M = mpd(mtx, weights=w).flatten()
    return np.matrix(M).T*np.matrix(M)

def observed(mtx, **kw):
    w = kw.get('weights', None)
    M,L = np.shape(mtx)
    k = mtx.max() + 1
    O = jpd(mtx, weights=w)
    return O.reshape((L,L,k,k)).swapaxes(1,2).reshape((L*k, L*k))

def block_sum(A, **kw):
    k = kw.get('k', 21)
    L = np.shape(A)[0]/k
    S = np.zeros((L,L))
    for i in range(k):
        for j in range(k):
            S = S + A[np.arange(L)*i,:][:,np.arange(L)*j]
    return S

def min_goof(mtx, **kw):
    M,L = np.shape(mtx)
    k = mtx.max() + 1

    #Set up the system variables
    M = mpd(mtx).flatten()
    E = np.matrix(M).T*np.matrix(M)
    O = jpd(mtx)
    O = O.reshape((L,L,k,k)).swapaxes(1,2).reshape((L*k, L*k))

    #CVXify everything
    M = cvx.Constant(M)
    E = cvx.Constant(E)
    O = cvx.Constant(O)
    e = cvx.Constant(np.ones(k))
    V = cvx.Variable(k*L, k*L)
    print V.shape

    constraints = []
    #Complicated constraints
    for i in range(L):
        start,end = i*k,(i+1)*k
        constraints.append(e.T*V[start:end,:] == M.T)
        constraints.append(e.T*V[:,start:end].T == M.T)
    
    p = cvx.Problem(cvx.Minimize(cvx.sum_squares(V - E) + alpha*(cvx.sum_squares(V - O))), constraints)
    return p

from scipy import sparse


class gstat():
    def __init__(self, mtx):
        self.mtx = mtx.copy()
        self.J, self.P1, self.P2 = self.get_sparse_masks()

    def get_sparse_masks(self):
        k = self.mtx.max() + 1
        M,L = np.shape(self.mtx)
        bivariate_mapper = np.arange(k*k).reshape((k,k))
        j = bivariate_mapper[self.mtx[:,:,None], self.mtx[:,None,:]].swapaxes(0,2).swapaxes(0,1)
        j = j.reshape((L*L, M))
        j = j.swapaxes(0, 1)

        J  = sparse.lil_matrix((M, L*L*k*k), dtype=np.int8)
        P1 = sparse.lil_matrix((M, L*L*k*k), dtype=np.int8)
        P2 = sparse.lil_matrix((M, L*L*k*k), dtype=np.int8)

        for i in range(k**2):
            j1,j2 = np.where(j == i)
            J[j1, j2 + i*L*L] = 1
            del j1,j2

            rownum,colnum = np.where(bivariate_mapper == i)
            row,col = bivariate_mapper[rownum], bivariate_mapper[:,colnum]

            i1,i2 = np.where((j >= row.min()) & (j <= row.max()))
            P1[i1, i2 + i*L*L] = 1
            del i1,i2

            i1,i2 = np.where((j >= col.min()) & (j <= col.max()))
            P2[i1, i2 + i*L*L] = 1
            del i1,i2

        J  = sparse.csr_matrix(J)
        P1 = sparse.csr_matrix(P1)
        P2 = sparse.csr_matrix(P2)
        return J, P1, P2

    def __call__(self, w):
        O = np.array(w*self.J)
        E1, E2 = np.array(w*self.P1), np.array(w*self.P2)
        return np.nansum(O*(np.log(O) - np.log(E1) - np.log(E2)))
