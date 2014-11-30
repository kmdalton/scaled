import pinfwrapper,fullmsa
import numpy as np
import cvxpy as cvx

def l1_least_squares(J, **kw): 
    #Empirical parameters
    L= np.shape(J)[0]
    W  = cvx.Variable(L, L)
    alpha = kw.get('alpha', 1.)
    rho = kw.get('rho', 0.5) #Ratio of l2
    verbose= kw.get('verbose', False)
    Lidentity = np.identity(L)

    #alpha --> controls sparsity of 1 - pinfwrapper.infoDistance(mtx)
    constraints = [W == W.T, W >= 0., cvx.hstack(*(cvx.diag(W) for i in range(L))) + cvx.hstack(*(cvx.diag(W) for i in range(L))).T - W >= 0.]
    p = cvx.Problem(cvx.Minimize(
                        rho*cvx.sum_squares(np.diag(J) - cvx.diag(W))/float(L) +
                        (1. - rho)*cvx.sum_squares(J - W)/float(L*L) +
                        alpha*cvx.norm(cvx.hstack(*(cvx.diag(W) for i in range(L))) + cvx.hstack(*(cvx.diag(W) for i in range(L))).T - Lidentity - W, 1)
                    ), constraints)

    p.solve(solver=kw.get('solver', 'SCS'), verbose=kw.get('verbose', False), max_iters=kw.get('max_iters', 25000))
    if kw.get('verbose', False) == True:
        print "\n\nSolver finished up with status: {}".format(p.status)
    W = np.array(p.variables()[0].value)
    return W

def l2_least_squares(J, **kw): 
    #Empirical parameters
    L= np.shape(J)[0]
    W  = cvx.Variable(L, L)
    alpha = kw.get('alpha', 1.)
    rho = kw.get('rho', 0.5) #Ratio of l2
    verbose= kw.get('verbose', False)
    Lidentity = np.identity(L)

    #alpha --> controls sparsity of 1 - pinfwrapper.infoDistance(mtx)
    constraints = [W == W.T, W >= 0., cvx.hstack(*(cvx.diag(W) for i in range(L))) + cvx.hstack(*(cvx.diag(W) for i in range(L))).T - W >= 0.]
    p = cvx.Problem(cvx.Minimize(
                        rho*cvx.sum_squares(np.diag(J) - cvx.diag(W))/float(L) +
                        (1. - rho)*cvx.sum_squares(J - W)/float(L*L) +
                        alpha*cvx.norm(cvx.hstack(*(cvx.diag(W) for i in range(L))) + cvx.hstack(*(cvx.diag(W) for i in range(L))).T - Lidentity - W, 2)
                    ), constraints)

    p.solve(solver=kw.get('solver', 'SCS'), verbose=kw.get('verbose', False), max_iters=kw.get('max_iters', 25000))
    if kw.get('verbose', False) == True:
        print "\n\nSolver finished up with status: {}".format(p.status)
    W = np.array(p.variables()[0].value)
    return W
