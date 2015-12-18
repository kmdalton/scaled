import pinfwrapper,fullmsa
from multiprocessing import Pool,cpu_count
import numpy as np
import cvxpy as cvx
from scipy import sparse
from time import time

class entropy():
    def __init__(self, mtx):
        self.mtx = mtx.copy()
        self.mask= self.get_sparse_mask()
        self.M, self.L = mtx.shape
        self.k = mtx.max()+1
        self.pool = Pool(cpu_count())

    def get_sparse_mask(self):
        M,L = np.shape(self.mtx)
        k = self.mtx.max()+1
        mask = sparse.lil_matrix((M,L*k))
        for i in range(k):
            mask[:, np.arange(L)*k+i] = np.array(self.mtx==i, dtype=float)
        return sparse.csr_matrix(mask)

    def gradient(self, W, **kw):
        columns = kw.get('columns', np.arange(self.L*self.k))
        M = self.mask.shape[0]
        helper = grad_helper(self.mask, W, columns=columns)
        grad = np.array(self.pool.map(helper, np.arange(M)))
        return grad

    def gradient_descent(self, **kw):
        columns = kw.get('columns', np.arange(self.L*self.k))
        W = kw.get('wo', np.ones(self.M)/float(self.M))
        alpha = kw.get('alpha', 1e-7)
        maxiter = kw.get('maxiter', 100)
        H,T = [],[]
        for i in range(maxiter):
            W = W + alpha*self.gradient(W, columns=columns)
            W = project(W)
            H.append(self(W, columns=columns))
            T.append(W)
        return np.array(H), np.array(T)

    def nullentropy(self, **kw):
        w = kw.get('weights', sparse.csr_matrix(np.ones(self.M)/float(self.M)))
        J = (w*self.mask).T*(w*self.mask)
        J.data = J.data*np.log2(J.data)
        return J

    def __call__(self, w, **kw):
        columns = kw.get('columns', np.arange(self.L*self.k))
        W = sparse.csr_matrix(np.diag(w))
        O = self.mask[:,columns].T*W*self.mask
        return np.nansum(O.data*np.log(O.data))

def project(W, **kw):
    verbose = kw.get('verbose', False)
    bound = kw.get('bound', 0.) 
    M = len(W)
    V = cvx.Variable(M)
    p = cvx.Problem(cvx.Minimize(cvx.norm2(V-W)), [cvx.sum_entries(V) == 1., V >= bound])
    try:
        p.solve(max_iters=100000, verbose=verbose)
    except:
        p.solve(solver="SCS", max_iters=100000, verbose=verbose)
    w = np.array(p.variables()[0].value).flatten()
    if w.min() < 0.:
        w[w < 0.] = 0.
        w = project(w)

    return w

class grad_helper():
    def __init__(self, A, W, **kw):
        self.columns = kw.get('columns', np.arange(A.shape[1]))
        self.A = sparse.csr_matrix(A)
        self.W = sparse.csr_matrix(np.diag(W))
        self.O = self.A[:,self.columns].T*self.W*self.A
        self.O.data = np.log(self.O.data) + 1.
        self.O.data[np.isnan(self.O.data)] = 0.

    def __call__(self, i):
        M = self.A.shape[0]
        w = sparse.csr_matrix((M, M))
        w[i,i] = 1.
        o = self.A[:,self.columns].T*w*self.A
        return -(self.O.multiply(o).sum())

class minmi():
    def __init__(self, mtx, **kw):
        self.mtx = mtx.copy()
        self.mask= self.get_sparse_mask(nogaps=kw.get('nogaps', False))
        self.M, self.L = mtx.shape
        self.k = mtx.max()+1
        self.pool = Pool(cpu_count())

    def get_sparse_mask(self, **kw):
        M,L = np.shape(self.mtx)
        k = self.mtx.max()+1
        if kw.get('nogaps', False):
            k = k - 1
        mask = sparse.lil_matrix((M,L*k))
        for i in range(k):
            mask[:, np.arange(L)*k+i] = np.array(self.mtx==i, dtype=float)
        return sparse.csr_matrix(mask)

    def gradient(self, W, **kw):
        M = self.mask.shape[0]
        helper = minmi_helper(self.mask, W)
        grad = np.array(self.pool.map(helper, np.arange(M)))
        return grad

    def gradient_descent(self, **kw):
        verbose = kw.get('verbose', False)
        bound = kw.get('bound', 0.)
        W = kw.get('wo', np.ones(self.M)/float(self.M))
        alpha = kw.get('alpha', 1e-7)
        maxiter = kw.get('maxiter', 100)
        H,T = [],[]
        start = time()
        if verbose:
            print "W is initialized to: {}".format(W)
            print "\tInitial objective value = {}".format(self(W))
        for i in range(maxiter):
            if verbose:
                print "Entering gradient descent cycle {}/{}".format(i+1, maxiter)
            W = W - alpha*self.gradient(W)
            if verbose:
                print "Projecting gradient step with cvx ..."
            W = project(W, bound=bound)
            if verbose:
                print "W is: {}".format(W)
            H.append(self(W))
            T.append(W)
            if verbose:
                print "\tCycle {} complete, objective = {}".format(i+1, H[-1])
                print "\t{} s elapsed".format(time() - start)
        return np.array(H), np.array(T)

    def __call__(self, w):
        W = sparse.csr_matrix(np.diag(w))
        w = sparse.csr_matrix(w)
        O = self.mask.T*W*self.mask
        E = w*self.mask
        LogArg = O.T.multiply(E.power(-1)).T.multiply(E.power(-1))
        LogArg.data = np.log(LogArg.data)
        return (O.multiply(LogArg)).sum()


class minmi_helper():
    def __init__(self, A, W, **kw):
        self.A = sparse.csr_matrix(A)
        self.M = sparse.csr_matrix(W)*A
        self.W = sparse.csr_matrix(np.diag(W))
        self.J = self.A.T*self.W*self.A

        self.I = self.J.copy()
        self.I = self.I.T.multiply(self.M.power(-1)).T.multiply(self.M.power(-1))
        self.I.data = np.log(self.I.data) + 1.

    def __call__(self, i):
        Jn = self.A[i].T*self.A[i]
        M = self.A[i].multiply(self.M.power(-1))
        return (Jn.multiply(self.I) - self.J.multiply(M) - self.J.T.multiply(M).T).sum()




