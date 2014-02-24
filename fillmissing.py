###############################################################################
# Part of a group of scripts targetted at performing genome wide statistical  #
# coupling analysis to predict protein interactions.                          #
# fillmissing.py is responsible for comparing the contents of the proteome.fa #
# file to the current database. The script fills in any missing files.        #
###############################################################################

import water,fasta
from sys import argv
import os

headDir = argv[1]
if headDir[-1] != '/':
    headDir = headDir + '/'
inFN    = headDir + "proteome.fa"
outDir  = headDir + "phmmer/"

if not os.path.isfile(inFN):
    print "Input file, proteome.fa not found in the head directory: %s" %headDir
    print "Will now exit ..."
    os.exit()

files = os.listdir(outDir)
ids   = [int(i[:-3]) for i in files]

headers,seqs = fasta.importFasta(inFN)

missing = range(len(seqs))
missing = set(missing) - set(ids)

for i,s in enumerate(seqs):
    if i in missing:
        try:
            h,s = water.phmmer(s)
            with open(outDir + "%s.fa" %i, "w") as out:
                print "Writing output for gene %s: %s" %(i, headers[i])
                for header, seq in zip(h,s):
                    out.write("%s\n%s\n" %(header, seq))
        except:
            print "There was an error processing gene %s: %s" %(i, headers[i])


