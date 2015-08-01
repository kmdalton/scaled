import pinfwrapper,fullmsa
from scipy import sparse

import pycuda.autoinit
import pycuda.gpuarray as gpuarray
import numpy as np
from skcuda import linalg
linalg.init()

class gstat():
    def __init__(self, mtx):
        self.mtx = mtx.copy()
        self.mask= self.get_sparse_mask()
        self.gpu_mask = gpuarray.to_gpu( np.asarray(self.mask.todense(), np.float32) ) #Single precision for GPUs
        self.M, self.L = mtx.shape
        self.k = mtx.max()+1

    def get_sparse_mask(self):
        M,L = np.shape(self.mtx)
        k = self.mtx.max()+1
        mask = sparse.lil_matrix((M,L*k))
        for i in range(k):
            mask[:, np.arange(L)*k+i] = np.array(self.mtx==i, dtype=float)
        return sparse.csr_matrix(mask)

    def __call__(self, w):
        w = sparse.csc_matrix(w)
        W = self.mask.multiply(w.T)
        gpu_W = gpuarray.to_gpu( np.asarray(W.todense(), np.float32) ) #Single precision for GPUs

        O = (self.mask.multiply(w.T)).T*self.mask
        E = (w*self.mask).T*(w*self.mask)

        logO = O.copy()
        logE = E.copy()
        logO.data = np.log(O.data)
        logE.data = np.log(E.data)

        return np.nansum((O.multiply(logO-logE)).data)

