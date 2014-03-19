###############################################################################
#                                                                             #
# Part of a group of scripts targetted at performing genome wide statistical  #
# coupling analysis to predict protein interactions.                          #
# Run couplegenome.py once the database of alignments have been built.        #
#                                                                             #
###############################################################################

import water,fasta,fullmsa,re
from sys import argv,exit
from subprocess import call
import numpy as np
import os
from matplotlib import pyplot as plt

#Location of the proteome.fa file and the base directory for all the analysis
#DEFAULT IS THE DIRECTORY FROM WHICH THE SCRIPT IS CALLED
headDir = '__ur_directory_goes_here__'
maxSeqs = 10000 #The maximum number of phased sequence pairs to include in the alignment

#Default is the current directory
if headDir == '__ur_directory_goes_here__':
    headDir = os.path.abspath('.')

if headDir[-1] != '/':
    headDir = headDir + '/'
inFN    = headDir + "proteome.fa"
inDir   = headDir + "filter/"
outDir  = headDir + "analysis/"

if not os.path.isfile(inFN):
    print "Input file, proteome.fa not found in the head directory: %s" %headDir
    print "Will now exit ..."
    exit()

try: #explicit test would be better
    os.mkdir(outDir)
except OSError:
    print "The output file directory (%s) already exists... Not creating" %outDir

files = [i for i in os.listdir(inDir) if i[-4:] == '.aln']
files.sort(key=lambda x: int(x.split('.')[0])) #I want to sort the files for safety of multiple calls
#Now we will interleave the filenames such that the load becomes balanced between threads...
a,b   = files[::2],files[1::2]
files = a + b
files[::2]  = a
files[1::2] = b[::-1]


#The input arguments are used to partition the data to multiple calls
chunk   = int(argv[1]) 
chunks  = int(argv[2])

start = int((len(files)/float(chunks))*(chunk -1 ))
end   = int((len(files)/float(chunks))*(chunk))

for FN1 in files[start:end]:
    H1,S1 = fasta.importFasta(inDir + FN1)
    #Illegal characters become gaps
    S1    = [re.sub(r'[^ACDEFGHIKLMNPQRSTVWY-]', '-', i) for i in S1]

    for FN2 in files:
        if FN1 != FN2:
            subDir = FN1.split('.')[0] + '/' + FN2.split('.')[0] + '/'
            try:
                os.makedirs(outDir + subDir)
            except OSError:
                print "Directory '%s' already exists... not creating" %(outDir + subDir)

            H2,S2 = fasta.importFasta(inDir + FN2)
            #Illegal characters become gaps
            S2    = [re.sub(r'[^ACDEFGHIKLMNPQRSTVWY-]', '-', i) for i in S2]

            h,s1,s2 = [],[],[]
            uniques = {}
            for header1,seq1 in zip(H1,S1):
                for header2,seq2 in zip(H2,S2):
                    t1,t2 = header1.split('|')[-1],header2.split('|')[-1]
                    if t1 == t2:
                        if seq1 + seq2 not in uniques:
                            h.append(t1)
                            s1.append(seq1)
                            s2.append(seq2)
                            uniques[seq1 + seq2] = True
                if len(h) > maxSeqs:
                    break
            with open(outDir + subDir + FN1, 'w') as out1, open(outDir + subDir + FN2, 'w') as out2:
                for header, seq1, seq2 in zip(h, s1, s2):
                    out1.write(">%s%s\n" %(header, seq1))
                    out2.write(">%s%s\n" %(header, seq2))

            #Do some filtering to clean up the alignment
            mtx1 = fullmsa.prune(fullmsa.binMatrix(s1), 1.)
            mtx2 = fullmsa.prune(fullmsa.binMatrix(s2), 1.)
            boundary = np.shape(mtx1)[1]
            mtx  = np.concatenate((mtx1, mtx2), axis=1)
            mtx  = np.array([seq for seq in mtx if np.shape(np.where(seq == 20))[1] < 0.1*(np.shape(mtx)[1])])
            mtx1 = fullmsa.prune(mtx[:,:boundary], 1.)
            mtx2 = fullmsa.prune(mtx[:,boundary:], 1.)
            boundary = np.shape(mtx1)[1]
            mtx  = np.concatenate((mtx1, mtx2), axis=1)

            #Coupling matrix
            c    = 1. - fullmsa.infoDistance(mtx)
            np.save(outDir + subDir + 'infodist.npy', c)
            #plt.matshow(c)
            #plt.colorbar()
            #plt.savefig(outDir + subDir + 'infodist.png')

            #plt.matshow(c[boundary:,:boundary])
            #plt.colorbar()
            #plt.savefig(outDir + subDir + 'q1.png')
            
            #Scrambled coupling matrix
            np.random.shuffle(mtx1)
            mtx  = np.concatenate((mtx1, mtx2), axis=1)
            c    = 1. - fullmsa.infoDistance(mtx)
            np.save(outDir + subDir + 'infodist_scrambled.npy', c)
            #plt.matshow(c)
            #plt.colorbar()
            #plt.savefig(outDir + subDir + 'infodist_scrambled.png')

            #plt.matshow(c[boundary:,:boundary])
            #plt.colorbar()
            #plt.savefig(outDir + subDir + 'q1s.png')
            
            
            #Write out boundary
            with open(outDir + subDir + 'boundary.txt', 'w') as out:
                out.write(str(boundary))
