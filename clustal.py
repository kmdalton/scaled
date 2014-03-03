###############################################################################
#                                                                             #
# Part of a group of scripts targetted at performing genome wide statistical  #
# coupling analysis to predict protein interactions.                          #
# Run clustal.py after running search.py and filter.py. This script will      #
# align the redundant taxa in `headDir`/filter using clustal omega.           #
#                                                                             #
###############################################################################

import water,fasta
from sys import argv,exit
from subprocess import call
import os

#Location of the proteome.fa file and the base directory for all the analysis
headDir = '__ur_directory_goes_here__'

if headDir[-1] != '/':
    headDir = headDir + '/'
inFN    = headDir + "proteome.fa"
outDir  = headDir + "filter/"

if not os.path.isfile(inFN):
    print "Input file, proteome.fa not found in the head directory: %s" %headDir
    print "Will now exit ..."
    exit()

files = [i for i in os.listdir(outDir) if i[-3:] == '.fa']
files.sort(key=lambda x: int(x[:-3])) #I want to sort the files for safety of multiple calls

#The input arguments are used to partition the data to multiple calls
chunk   = int(argv[1]) 
chunks  = int(argv[2])

start = int((len(files)/float(chunks))*(chunk -1 ))
end   = int((len(files)/float(chunks))*(chunk))

for FN in files[start:end]:
    try:
        print "Aligning %s ..." %FN
        outFN = FN[:-2] + 'aln'
        command = "clustalo -i %s -o %s" %(outDir + FN, outDir + outFN)
        call(command.split())
    except:
        print "There was an error aligning %s -- check the input file validity" %FN
