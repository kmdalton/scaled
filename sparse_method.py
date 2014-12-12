import pinfwrapper,fullmsa
import numpy as np
import cvxpy as cvx

def l1_least_squares(J, **kw): 
    #Empirical parameters
    L= np.shape(J)[0]
    H = np.diag(J)
    W  = cvx.Variable(L, L)
    #We're going to insert the diagonal of the mutual information matrix in here so we don't waste time learning
    #the diagonal ---> and so the diagonal is not the end state of our regularization
    I  = (np.diag(J) - J).T + np.diag(J)
    D  = I.copy()
    D[np.triu_indices(L, 1)] = 0.
    D[np.tril_indices(L,-1)] = 0.

    alpha = kw.get('alpha', 1.)
    rho = kw.get('rho', 0.5) #Ratio of l2
    verbose= kw.get('verbose', False)
    Lidentity = np.identity(L)

    #alpha --> controls sparsity of 1 - pinfwrapper.infoDistance(mtx)
    constraints = [W == W.T, W >= 0., cvx.hstack(*(cvx.diag(W) for i in range(L))) + cvx.hstack(*(cvx.diag(W) for i in range(L))).T - W >= 0.]
    p = cvx.Problem(cvx.Minimize(
                        rho*cvx.sum_squares(np.diag(J) - cvx.diag(W))/float(L) +
                        (1. - rho)*cvx.sum_squares(J - W)/float(L*L) +
                        alpha*cvx.norm(cvx.hstack(*(cvx.diag(W) for i in range(L))) + cvx.hstack(*(cvx.diag(W) for i in range(L))).T - W - D, 1)
                    ), constraints)

    p.solve(solver=kw.get('solver', 'SCS'), verbose=kw.get('verbose', False), max_iters=kw.get('max_iters', 25000))
    if kw.get('verbose', False) == True:
        print "\n\nSolver finished up with status: {}".format(p.status)
    W = np.array(p.variables()[0].value)
    return W


def l2_least_squares(J, **kw): 
    #Empirical parameters
    L= np.shape(J)[0]
    H = np.diag(J)
    W  = cvx.Variable(L, L)
    #We're going to insert the diagonal of the mutual information matrix in here so we don't waste time learning
    #the diagonal ---> and so the diagonal is not the end state of our regularization
    I  = (np.diag(J) - J).T + np.diag(J)
    D  = I.copy()
    D[np.triu_indices(L, 1)] = 0.
    D[np.tril_indices(L,-1)] = 0.

    alpha = kw.get('alpha', 1.)
    rho = kw.get('rho', 0.5) #Ratio of l2
    verbose= kw.get('verbose', False)

    #alpha --> controls sparsity of 1 - pinfwrapper.infoDistance(mtx)
    constraints = [W == W.T, W >= 0., cvx.hstack(*(cvx.diag(W) for i in range(L))) + cvx.hstack(*(cvx.diag(W) for i in range(L))).T - W >= 0.]
    p = cvx.Problem(cvx.Minimize(
                        rho*cvx.sum_squares(np.diag(J) - cvx.diag(W))/float(L) +
                        (1. - rho)*cvx.sum_squares(J - W)/float(L*L) +
                        alpha*cvx.norm(cvx.hstack(*(cvx.diag(W) for i in range(L))) + cvx.hstack(*(cvx.diag(W) for i in range(L))).T - W - D, 2)
                    ), constraints)

    p.solve(solver=kw.get('solver', 'SCS'), verbose=kw.get('verbose', False), max_iters=kw.get('max_iters', 25000))
    if kw.get('verbose', False) == True:
        print "\n\nSolver finished up with status: {}".format(p.status)
    W = np.array(p.variables()[0].value)
    return W

def random_jpd(size=None):
    if size is None:
        size=20
    J = np.random.random(size**2).reshape((size, size))
    J = J/np.sum(J)
    return J

def entropy_from_jpd(jpd):
    J = np.sum(-jpd*np.log2(jpd))

    P0 = np.sum(jpd, axis=0)
    H0 = np.sum(-P0*np.log2(P0))

    P1 = np.sum(jpd, axis=1)
    H1 = np.sum(-P1*np.log2(P1))
    return H0,H1,J

def sample_jpd(n, jpd):
    col1,col2 = np.indices(np.shape(jpd))
    col1,col2 = col1.flatten(),col2.flatten()
    samples   = np.random.multinomial(n, jpd.flatten())
    A = np.zeros((n,2), dtype=int)
    idx = iter(range(n))
    for i,j,s in zip(col1, col2, samples):
        for x in range(s):
            A[idx.next()] = [i,j]
    return A

def entropy_trace(X, jpd=None): #X is the series of numbers of sequences to request
    if jpd is None:
        jpd = random_jpd(jpd)
    D = [pinfwrapper.JointH(sample_jpd(i, jpd)) for i in X]
    H1= np.array([i[0,0] for i in D])
    H2= np.array([i[1,1] for i in D])
    J = np.array([i[0,1] for i in D])
    return H1, H2, J
