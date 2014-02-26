###############################################################################
# Part of a group of scripts targetted at performing genome wide statistical  #
# coupling analysis to predict protein interactions.                          #
# fillmissing.py is responsible for comparing the contents of the proteome.fa #
# file to the current database. The script fills in any missing files.        #
###############################################################################

import water,fasta
from sys import exit
import os

#Location of the proteome.fa file and the base directory for all the analysis
headDir = '__ur_directory_goes_here__'
#Set this to 'phmmer' to use phmmer
use = 'blast'
#Maximum number of sequences to return with blast
maxs= 20000

if headDir[-1] != '/':
    headDir = headDir + '/'
inFN    = headDir + "proteome.fa"
outDir  = headDir + "search/"

if not os.path.isfile(inFN):
    print "Input file, proteome.fa not found in the head directory: %s" %headDir
    print "Will now exit ..."
    exit()

files = os.listdir(outDir)
ids   = [int(i[:-3]) for i in files]

headers,seqs = fasta.importFasta(inFN)

missing = range(len(seqs))
missing = set(missing) - set(ids)

for i,tarSeq in enumerate(seqs):
    if i in missing:
        try:
            h,s = [],[]
            if use == 'phmmer':
                h,s = water.phmmer(tarSeq)
            else:
                lines = water.blastp(tarSeq, max_seqs=maxs, outfmt="6 evalue sgi staxids sseq")
                for line in lines:
                    h.append(">" + "|".join(line.split("\t")[:3]))
                    s.append(line.split("\t")[-1])

            with open(outDir + "%s.fa" %i, "w") as out:
                print "Writing output for gene %s: %s" %(i, headers[i])
                for header, seq in zip(h,s):
                    out.write("%s\n%s\n" %(header, seq))
        except:
                    print "There was an error processing gene %s: %s" %(i, headers[i])
