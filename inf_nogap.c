#include <stdlib.h>
#include <stdio.h>
#include <math.h>

/* ##############################################################
Note on compilation: to make this fucker into a dynamic C-libary 
accessible from python run the following command:
gcc -std=c99 -fPIC -shared -fopenmp -o pinf.so pinf.c
if you do anything else you will be sad.
################################################################# */

void Inf(int M, int L, int mtx[M][L], float CovIJ[L][L]) {
#pragma omp parallel for
    for (int i = 0; i < L; ++i) {
        for (int j = 0; j < L; ++j) {
            if (i >= j) {

                // Calculate the Joint probability distribution of Mi & Mj along with 
                // the marginal probability distributions

                float JPD[20][20] ; 
                float MPi[20] ;
                float MPj[20] ;

                //Initialize the arrays to zero:
                for (int k = 0; k < 20; ++k) {
                    MPi[k] = 0;
                    MPj[k] = 0;
                    for (int l = 0; l < 20; ++l)
                        JPD[k][l] = 0;
                }

                //Sum up the distributions
                float Mf = 0;
                for (int k = 0; k < M; ++k) {
                    if (mtx[k][i] != 20 &&  mtx[k][j] != 20) {
                        MPi[mtx[k][i]] += 1. ;
                        MPj[mtx[k][j]] += 1. ;
                        JPD[mtx[k][i]][mtx[k][j]] += 1. ;
                        Mf += 1. ;
                    }
                }

                //Make sure the covariance matrix is actually zeros
                CovIJ[i][j] = 0.;

                //Sum up the information where the JPD is nonzero
                for (int k = 0; k < 20; ++k) {
                    for (int l = 0; l < 20; ++l) {
                        if (JPD[k][l] > 0.) 
                            CovIJ[i][j] += JPD[k][l]*log(Mf*JPD[k][l]/MPi[k]/MPj[l])/Mf/log(2);
                    }
                }
                CovIJ[j][i] = CovIJ[i][j];
            }
        }
    }
}

void JointH(int M, int L, int mtx[M][L], float CovIJ[L][L]) {
    #pragma omp parallel for
    for (int i = 0; i < L; ++i) {
        for (int j = 0; j < L; ++j) {
            if (i >= j) {

                // Calculate the JPD of Mi & Mj along with the MPDs
                float JPD[20][20] ; 
                //Initialize the arrays to zero:
                for (int k = 0; k < 20; ++k) {
                    for (int l = 0; l < 20; ++l)
                        JPD[k][l] = 0;
                }
                //Sum up the distributions
                float Mf = 0;
                for (int k = 0; k < M; ++k) {
                    if (mtx[k][i] != 20 && mtx[k][j] != 20) {
                        JPD[mtx[k][i]][mtx[k][j]] += 1. ;
                        Mf += 1. ;
                    }
                }

                //Make sure the covariance matrix is actually zeros
                CovIJ[i][j] = 0.;

                //Sum up the information where the JPD is nonzero
                for (int k = 0; k < 20; ++k) {
                    for (int l = 0; l < 20; ++l) {
                        if (JPD[k][l] > 0.) {
                            float prob = JPD[k][l]/Mf;
                            CovIJ[i][j] += -prob*log(prob)/log(2);
                        }
                    }
                }
                CovIJ[j][i] = CovIJ[i][j];
            }
        }
    }
}

void Entropy(int M, int L, int mtx[M][L], float CovIJ[L][L]) {
#pragma omp parallel for
    for (int i = 0; i < L; ++i) {
        for (int j = 0; j < L; ++j) {
            if (i >= j) {

                // Calculate the Joint probability distribution of Mi & Mj along with 
                // the marginal probability distributions

                float MPi[20] ;
                float MPj[20] ;

                //Initialize the arrays to zero:
                for (int k = 0; k < 20; ++k) {
                    MPi[k] = 0;
                    MPj[k] = 0;
                }

                //Sum up the distributions
                float Mf = 0;
                for (int k = 0; k < M; ++k) {
                    if (mtx[k][i] != 20 &&  mtx[k][j] != 20) {
                        MPi[mtx[k][i]] += 1. ;
                        MPj[mtx[k][j]] += 1. ;
                        Mf += 1. ;
                    }
                }

                //Make sure the covariance matrix is actually zeros
                CovIJ[i][j] = 0.;

                //Sum up the information 
                for (int k = 0; k < 20; ++k) {
                    if (MPi[k] > 0.) 
                        CovIJ[i][j] += -MPi[k]*log(MPi[k]/Mf)/Mf/log(2);
                    if (MPj[k] > 0.) 
                        CovIJ[i][j] += -MPj[k]*log(MPj[k]/Mf)/Mf/log(2);
                }
                CovIJ[j][i] = CovIJ[i][j];
            }
        }
    }
}


