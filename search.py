###############################################################################
# Part of a group of scripts targetted at performing genome wide statistical  #
# coupling analysis to predict protein interactions.                          #
# search.py is responsible for using phmmer or blast query the nr database    #
# with proteins in an input file and thereby build a database of genes.       #
###############################################################################

import water,fasta
from sys import argv,exit
import os
import re

#Location of the proteome.fa file and the base directory for all the analysis
#DEFAULT IS THE DIRECTORY FROM WHICH THE SCRIPT IS CALLED
headDir = '__ur_directory_goes_here__'
#Set this to 'phmmer' to use phmmer
use = 'blast'
#Maximum number of sequences to return with blast
maxs= 20000

#Default is the current directory
if headDir == '__ur_directory_goes_here__':
    headDir = os.path.abspath('.')

if headDir[-1] != '/':
    headDir = headDir + '/'
inFN    = headDir + "proteome.fa"
outDir  = headDir + "search/"

if not os.path.isfile(inFN):
    print "Input file, proteome.fa not found in the head directory: %s" %headDir
    print "Will now exit ..."
    exit()

try:
    os.mkdir(outDir)
except OSError:
    print "The output file directory (%s) already exists... Not creating" %outDir

headers,seqs = fasta.importFasta(inFN)

#The input arguments are used to partition the data to multiple calls
chunk   = int(argv[1]) 
chunks  = int(argv[2])


start = int((len(seqs)/float(chunks))*(chunk -1 ))
end   = int((len(seqs)/float(chunks))*(chunk))

if chunk == chunks:
    end = len(seqs)

for i,tarSeq in enumerate(seqs[start:end], start):
    try:
        h,s = [],[]
        if use == 'phmmer':
            h,s = water.phmmer(tarSeq)
        else:
            lines = water.blastp(tarSeq, max_seqs=maxs, outfmt="6 evalue sgi staxids sseq")
            for line in lines:
                h.append(">" + "|".join(line.split("\t")[:3]))
                s.append(line.split("\t")[-1])
        with open(outDir + "%s.fa" %i, 'w') as out:
            print "Writing output for gene %s: %s" %(i, headers[i])
            for header, seq in zip(h,s):
                out.write("%s\n%s\n" %(header, seq))
    except:
        print "There was an error processing gene %s: %s" %(i, headers[i])
        print "Please try running fillmissing.py after this script terminates."
