from scipy.optimize import minimize
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

    alpha = kw.get('alpha', 0.0001)
    rho = kw.get('rho', 0.5) #Ratio of l2 this parameter doesn't seem to matter
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

def mpd_reweighted_l1(mtx, **kw):
    S,L = np.shape(mtx)
    k = np.max(mtx) #Number of kategories

    P = JPD(mtx)
    J = -P*np.log2(P)
    J[np.isinf(J) | np.isnan(J)] = 0. #log2(0.) is not defined
    I = pinfwrapper.Inf(mtx)
    P = np.array([np.histogram(i, 21, (-.1, 0.1+k))[0]/float(S) for i in mtx.T])
    M = np.matrix(-P*np.log2(P))
    M[np.isinf(M) | np.isnan(M)] = 0. #log2(0.) is not defined
    M = [cvx.vec(i) for i in M]
    W = []
    for i in range(L):
        W.append([])
        for j in range(L):
            W[-1].append(cvx.Variable(21, 21))
    ind1,ind2 = np.indices((L,L))
    ind1,ind2 = ind1.flatten(),ind2.flatten()

    p = cvx.Problem(cvx.Minimize(
        cvx.sum_squares(cvx.hstack( *(cvx.sum_entries(M[i] + W[i]) + cvx.sum_entries(M[j] + W[j]) - (W[j].T * np.matrix(J[i,j]) * W[i].T) for i,j in zip(ind1, ind2)))) #This is the LSQs part GOD HELP US
        #cvx.sum_squares([cvx.trace(M[i,:].T * W[i,:]) + cvx.trace(M[j,:].T * W[j,:]) - (W[j,:] * np.matrix(J[i,j]) * W[i,:].T) - I[i,j] for i,j in zip(ind1, ind2)]) #This is the LSQs part GOD HELP US
    ))
    p.solve(solver=kw.get('solver', 'SCS'), verbose=kw.get('verbose', False), max_iters=kw.get('max_iters', 25000))
    if kw.get('verbose', False) == True:
        print "\n\nSolver finished up with status: {}".format(p.status)
    return p



def JPD(mtx, **kw):
    #This is painfully slow... but it gets the job done. Doesn't take much more than a minute i think
    k = kw.get('categories', 21)
    M,L = np.shape(mtx)
    J   = np.zeros((L,L,k,k))
    for (i,j),v in np.ndenumerate(np.zeros((L,L))):
        J[i,j,:] = np.histogram2d(mtx[:,i], mtx[:,j], (k, k), ((-.1, k - 0.9), (-.1, k - 0.9)))[0]
    return J/float(M)


def MPD(mtx, **kw):
    #This is painfully slow... but it gets the job done. Doesn't take much more than a minute i think
    k = kw.get('categories', 21)
    M,L = np.shape(mtx)
    P = np.array([np.histogram(i, k, (-.1, k-0.9))[0]/float(M) for i in mtx.T])
    return P

###############################################################################
# Belhow here are just some silly little functions for simulating alignment   #
# columns.                                                                    #
###############################################################################

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

def linked_error_problem(mtx, **kw):
    A = kw.get('A', 1.)
    B = kw.get('B', 1.)
    C = kw.get('C', 1.)

    M,L = np.shape(mtx)
    J = pinfwrapper.JointH(mtx)
    H = np.diag(J)
    H = np.ones((L,L))*H
    H = H + H.T

    H = cvx.Constant(H)
    J = cvx.Constant(J)

    sigma = cvx.Variable(L)
    sigma_sum = cvx.hstack(*(sigma for i in range(L))) + cvx.hstack(*(sigma for i in range(L))).T
    delta = cvx.Variable(L,L)
    MI = H + sigma_sum - J - delta


    constraints = [delta >= 0., sigma >= 0., ]
    p = cvx.Problem(cvx.Minimize(
        A*(1./L/L)*cvx.norm1(MI) + #sparsify the mutual information matrix
        B*((1./L)*cvx.norm2(sigma) + (1./L/L)*cvx.norm2(delta)) + #regularize the errors
        C*(1./L/L)*cvx.sum_squares(sigma_sum - delta)
    ), constraints)
    return p

def get_marginal_probability_distributions(mtx):
    M,L = np.shape(mtx)
    return np.array([np.histogram(i, 21, (-.1,20.1))[0]/float(M) for i in mtx.T])

def split_inf(mtx, A=0.01):
    M,L = np.shape(mtx)
    I = pinfwrapper.Inf(mtx)
    F = cvx.Variable(L,L)
    B = cvx.Variable(L,L)
    e = cvx.Variable(L,L)
    constraints = [B > 0., F >=0.]
    
    
    p = cvx.Problem(cvx.Minimize(
        (1./L/L)*cvx.sum_squares(I-F-B-e) +
        #cvx.sum_squares((1./L/L)*(cvx.sum_entries(B)) - B) +
        (1./L/L)*cvx.norm2(B) +
        (1./L/L)*cvx.norm2(e) +
        A*(1./L/L)*cvx.norm1(F-B)
        ), constraints)
    return p

def weighted_entropy(weights, mtx):
    mtx = mtx.copy()
    #weights = 1. + abs(weights.copy())
    return np.sum(-pinfwrapper.Entropy(mtx, weights=weights))

def max_entropy(mtx):
    M,L = np.shape(mtx)
    return minimize(weighted_entropy, np.ones(M), (mtx,))

def cvx_max_entropy(mtx):
    M,L = np.shape(mtx)
    masks  = [cvx.Constant(mtx==i) for i in range(mtx.min(), mtx.max()+1)]
    weights= cvx.Variable(M)
    constraints=[weights >= 0., cvx.sum_entries(weights) == 1.]
    p = cvx.Problem(cvx.Maximize(sum([cvx.sum_entries(cvx.entr(weights.T*i)) for i in masks])), constraints)
    return p
