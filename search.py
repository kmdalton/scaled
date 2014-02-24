###############################################################################
# Part of a group of scripts targetted at performing genome wide statistical  #
# coupling analysis to predict protein interactions.                          #
# search.py is responsible for using phmmer to query the nr database for each #
# protein in an input file and thereby build a database of genes.             #
###############################################################################

import water,fasta
from sys import argv
from os import mkdir


headDir = argv[1]
if headDir[-1] != '/':
    headDir = headDir + '/'
inFN    = headDir + "proteome.fa"
outDir  = headDir + "phmmer/"

if not os.path.isfile(inFN):
    print "Input file, proteome.fa not found in the head directory: %s" %headDir
    print "Will now exit ..."
    os.exit()

try:
    mkdir(outDir)
except OSError:
    print "The output file directory (%s) already exists... Not creating" %outDir


#The input arguments are used to partition the data to multiple calls
chunk   = int(argv[1]) 
chunks  = int(argv[2])


start = int((len(seqs)/float(chunks))*(chunk -1 ))
end   = int((len(seqs)/float(chunks))*(chunk))

if chunk == chunks:
    end = len(seqs)

for i,s in enumerate(seqs[start:end], start):
    try:
        h,s = water.phmmer(s)
        with open(outDir + "%s.fa" %i, 'w') as out:
            print "Writing output for gene %s: %s" %(i, headers[i])
            for header, seq in zip(h,s):
                out.write("%s\n%s\n" %(header, seq))
    except:
        print "There was an error processing gene %s: %s" %(i, headers[i])
        print "Please try running fillmissing.py after this script terminates."
