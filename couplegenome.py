###############################################################################
#                                                                             #
# Part of a group of scripts targetted at performing genome wide statistical  #
# coupling analysis to predict protein interactions.                          #
# Run couplegenome.py once the database of alignments have been built.        #
#                                                                             #
###############################################################################

import water,fasta,fullmsa
from sys import argv,exit
from subprocess import call
import os

#Location of the proteome.fa file and the base directory for all the analysis
headDir = '/home/kmdalton/DATUMS/mypn'
maxSeqs = 2000 #The maximum number of phased sequence pairs to include in the alignment

if headDir[-1] != '/':
    headDir = headDir + '/'
inFN    = headDir + "proteome.fa"
inDir   = headDir + "filter/"
outDir  = headDir + "analysis/"

if not os.path.isfile(inFN):
    print "Input file, proteome.fa not found in the head directory: %s" %headDir
    print "Will now exit ..."
    exit()

try:
    os.mkdir(outDir)
except OSError:
    print "The output file directory (%s) already exists... Not creating" %outDir

files = [i for i in os.listdir(inDir) if i[-4:] == '.aln']
files.sort(key=lambda x: int(x.split('.')[0])) #I want to sort the files for safety of multiple calls


#The input arguments are used to partition the data to multiple calls
chunk   = int(argv[1]) 
chunks  = int(argv[2])

start = int((len(files)/float(chunks))*(chunk -1 ))
end   = int((len(files)/float(chunks))*(chunk))

for FN1 in files[start:end]:
    H1,S1 = fasta.importFasta(inDir + FN1)
    H1,S1 = H1[:maxSeqs],S1[:maxSeqs]
    #Illegal characters become gaps
    S1    = [re.sub(r'[^ACDEFGHIKLMNPQRSTVWY-]', '-', i) for i in S1]

    for FN2 in files:
        subDir = FN1.split('.')[0] + '/' + FN2.split('.')[0] + '/'
        try:
            os.makedirs(outDir + subDir)
        except OSError:
            print "Directory '%s' already exists... not creating" %(outDir + subDir)

        H2,S2 = fasta.importFasta(inDir + FN2)
        H2,S2 = H2[:maxSeqs],S2[:maxSeqs]
        #Illegal characters become gaps
        S2    = [re.sub(r'[^ACDEFGHIKLMNPQRSTVWY-]', '-', i) for i in S2]

        h,s1,s2 = [],[],[]
        for header1,seq1 in zip(H1,S1):
            for header2,seq2 in zip(H2,S2):
                t1,t2 = header1.split('|')[-1],header2.split('|')[-1]
                if t1 == t2:
                    h.append(t1)
                    s1.append(seq1)
                    s2.append(seq2)
            if len(h) > maxSeqs:
                break
        with open(outDir + subDir + FN1, 'w') as out1, open(outDir + subDir + FN2, 'w') as out2:
            for header, seq1, seq2 in zip(h, s1, s2):
                out1.write("%s\n%s\n" %header, seq1)
                out2.write("%s\n%s\n" %header, seq2)
            
