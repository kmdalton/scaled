#include <stdlib.h>
#include <stdio.h>
#include <math.h>

/* ##############################################################
Note on compilation: to make this fucker into a dynamic C-libary 
accessible from python run the following command:
gcc -std=c99 -fPIC -shared -fopenmp -o inf.so inf.c
if you do anything else you will be sad.
################################################################# */

void Inf(int M, int L, int PDSize, float weights[M], int mtx[M][L], float CovIJ[L][L]) {
#pragma omp parallel for
    for (int i = 0; i < L; ++i) {
        for (int j = 0; j < L; ++j) {
            if (i >= j) {

                // Calculate the Joint probability distribution of Mi & Mj along with 
                // the marginal probability distributions

                float JPD[PDSize][PDSize] ; 
                float MPi[PDSize] ;
                float MPj[PDSize] ;

                //Initialize the arrays to zero:
                for (int k = 0; k < PDSize; ++k) {
                    MPi[k] = 0;
                    MPj[k] = 0;
                    for (int l = 0; l < PDSize; ++l)
                        JPD[k][l] = 0;
                }

                //Sum up the distributions
                float Mf = 0;
                for (int k = 0; k < M; ++k) {
                    if (mtx[k][i] < PDSize && mtx[k][j] < PDSize) {
                        MPi[mtx[k][i]] += weights[k] ;
                        MPj[mtx[k][j]] += weights[k] ;
                        JPD[mtx[k][i]][mtx[k][j]] += weights[k] ;
                        Mf += weights[k] ;
                    }
                }

                //Make sure the covariance matrix is actually zeros
                CovIJ[i][j] = 0.;

                //Sum up the information where the JPD is nonzero
                for (int k = 0; k < PDSize; ++k) {
                    for (int l = 0; l < PDSize; ++l) {
                        if (JPD[k][l] > 0.) 
                            CovIJ[i][j] += JPD[k][l]*log(Mf*JPD[k][l]/MPi[k]/MPj[l])/Mf/log(2);
                    }
                }
                CovIJ[j][i] = CovIJ[i][j];
            }
        }
    }
}

void JointH(int M, int L, int PDSize, float weights[M], int mtx[M][L], float CovIJ[L][L]) {
    #pragma omp parallel for
    for (int i = 0; i < L; ++i) {
        for (int j = 0; j < L; ++j) {
            if (i >= j) {

                // Calculate the JPD of Mi & Mj along with the MPDs
                float JPD[PDSize][PDSize] ; 
                //Initialize the arrays to zero:
                for (int k = 0; k < PDSize; ++k) {
                    for (int l = 0; l < PDSize; ++l)
                        JPD[k][l] = 0;
                }
                //Sum up the distributions
                float Mf = 0;
                for (int k = 0; k < M; ++k) {
                    if (mtx[k][i] < PDSize && mtx[k][j] < PDSize) {
                        JPD[mtx[k][i]][mtx[k][j]] += weights[k] ;
                        Mf += weights[k] ;
                    }
                }

                //Make sure the covariance matrix is actually zeros
                CovIJ[i][j] = 0.;

                //Sum up the information where the JPD is nonzero
                for (int k = 0; k < PDSize; ++k) {
                    for (int l = 0; l < PDSize; ++l) {
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

void Entropy(int M, int L, int PDSize, float weights[M],  int mtx[M][L], float CovIJ[L][L]) {
#pragma omp parallel for
    for (int i = 0; i < L; ++i) {
        for (int j = 0; j < L; ++j) {
            if (i >= j) {

                // Calculate the Joint probability distribution of Mi & Mj along with 
                // the marginal probability distributions

                float MPi[PDSize] ;
                float MPj[PDSize] ;

                //Initialize the arrays to zero:
                for (int k = 0; k < PDSize; ++k) {
                    MPi[k] = 0;
                    MPj[k] = 0;
                }

                //Sum up the distributions
                float Mf = 0;
                for (int k = 0; k < M; ++k) {
                    if (mtx[k][i] < PDSize &&  mtx[k][j] < PDSize) {
                        MPi[mtx[k][i]] += weights[k] ;
                        MPj[mtx[k][j]] += weights[k] ;
                        Mf += weights[k] ;
                    }
                }

                //Make sure the covariance matrix is actually zeros
                CovIJ[i][j] = 0.;

                //Sum up the information 
                for (int k = 0; k < PDSize; ++k) {
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


void infoDistance(int M, int L, int PDSize, float zerocase, float weights[M], int mtx[M][L], float CovIJ[L][L]) {
#pragma omp parallel for
    for (int i = 0; i < L; ++i) {
        for (int j = 0; j < L; ++j) {
            if (i >= j) {

                // Calculate the Joint probability distribution of Mi & Mj along with 
                // the marginal probability distributions

                float JPD[PDSize][PDSize] ; 
                float MPi[PDSize] ;
                float MPj[PDSize] ;

                //Initialize the arrays to zero:
                for (int k = 0; k < PDSize; ++k) {
                    MPi[k] = 0;
                    MPj[k] = 0;
                    for (int l = 0; l < PDSize; ++l)
                        JPD[k][l] = 0;
                }

                //Sum up the distributions
                float Mf = 0;
                for (int k = 0; k < M; ++k) {
                    if (mtx[k][i] < PDSize && mtx[k][j] < PDSize) {
                        MPi[mtx[k][i]] += weights[k] ;
                        MPj[mtx[k][j]] += weights[k] ;
                        JPD[mtx[k][i]][mtx[k][j]] += weights[k] ;
                        Mf += weights[k] ;
                    }
                }

                //Make sure the covariance matrix is actually zeros
                CovIJ[i][j] = 0.;

                float MI = 0., Hi = 0., Hj = 0., JH = 0.;
                //Sum up the information where the JPD is nonzero
                for (int k = 0; k < PDSize; ++k) {
                    float MProbi= MPi[k]/Mf ;
                    float MProbj= MPj[k]/Mf ;
                    if (MPi[k] > 0.) 
                        Hi += -MProbi*log(MProbi)/log(2);
                    if (MPj[k] > 0.) 
                        Hj += -MProbj*log(MProbj)/log(2);
                    for (int l = 0; l < PDSize; ++l) {
                        if (JPD[k][l] > 0.) {
                            float MProbj= MPj[l]/Mf ;
                            float JProb = JPD[k][l]/Mf ;
                            if (MProbi > 0. && MProbj > 0.)
                                MI += JProb*log(JProb/MProbi/MProbj)/log(2) ;
                            JH += -JProb*log(JProb)/log(2) ;
                        }
                    }
                }

                if (JH == 0.)
                    CovIJ[j][i] = CovIJ[i][j] = zerocase;
                else
                    CovIJ[j][i] = CovIJ[i][j] = (Hi + Hj - 2*MI)/JH;
            }
        }
    }
}


