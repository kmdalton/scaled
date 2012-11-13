#include <stdlib.h>
#include <stdio.h>
#include <math.h>

/* ##############################################################
Note on compilation: to make this fucker into a dynamic C-libary 
accessible from python run the following command:
gcc -std=c99 -fPIC -shared -fopenmp -o joint.so joint.c 
if you do anything else you will be sad.
################################################################# */

void Cij(int M, int L, int mtx[M][L], float CovIJ[L][L]) {
    float Mf = M;
    #pragma omp parallel for
    for (int i = 0; i < L; ++i) {
        for (int j = 0; j < L; ++j) {
            if (i >= j) {

                // Calculate the JPD of Mi & Mj along with the MPDs
                float JPD[21][21] ; 
                //Initialize the arrays to zero:
                for (int k = 0; k < 21; ++k) {
                    for (int l = 0; l < 21; ++l)
                        JPD[k][l] = 0;
                }
                //Sum up the distributions
                for (int k = 0; k < M; ++k) {
                    JPD[mtx[k][i]][mtx[k][j]] += 1. ;
                }

                //Make sure the covariance matrix is actually zeros
                CovIJ[i][j] = 0.;

                //Sum up the information where the JPD is nonzero
                for (int k = 0; k < 21; ++k) {
                    for (int l = 0; l < 21; ++l) {
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

