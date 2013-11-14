import water, fasta, fullmsa, jsonify, cgi
from sys import argv
import numpy as np

def run(tarSeq, **kw):
    """Supply a target sequence, search nr for homologs. Return headers and aligned sequences. It will choose the longest alignment which is at least as long as the target sequence times a threshold float between 0 and 1 by doing an iterative search. Change the numbers of cycles in the search with the 'cycles' kwarg which defaults to 10. Cycles are cheap but don't matter much after 5 or 6. The threshold can be supplied by the 'thresh' kwarg. Thresh defaults to 0.95. Set the max number of sequences with the maxseq kwarg (int); default is 5000. Set the minimum number of sequences to return with the 'minseq' kwarg (int) defaults to 400."""
    thresh = kw.get('thresh', 0.95)
    cycles = kw.get('cycles', 10)
    maxSequences = kw.get('maxseq', 5000)
    minSequences = kw.get('minseq', 400)

    h,s = water.phmmer(tarSeq)
    h,s = water.cullByLength(h, s, len(tarSeq))
    if len(h) > maxSequences:
        h,s = h[:maxSequences],s[:maxSequences]
    else:
        maxSequences = len(h)
    
    thresh = thresh*len(tarSeq)
    #print "The threshold is: %s" %thresh
    nSeqs = (minSequences + maxSequences)/3

    headers, seqs = h[:nSeqs],s[:nSeqs]
    mtx = fullmsa.prune(fullmsa.binMatrix(seqs), 1.)
    M,L = np.shape(mtx)
    nTrace = [minSequences, maxSequences, nSeqs]
    #print "Pruned alignment of %s sequences has %s columns\n" %(M, L)

    for i in range(cycles):
        #print "L is %s" %L

        if L > thresh: #Move right on the number line
            nextLargest = maxSequences
            for n in nTrace:
                if n > nSeqs and n < nextLargest:
                    nextLargest = n
            nSeqs = (nextLargest + nSeqs)/2

        else: #Move left on the number line
            nextSmallest= 0
            for n in nTrace:
                if n < nSeqs and n > nextSmallest:
                    nextSmallest = n
            nSeqs = (nSeqs + nextSmallest)/2

        nTrace.append(nSeqs)
        headers, seqs = h[:nSeqs],s[:nSeqs]
        mtx = fullmsa.prune(fullmsa.binMatrix(seqs), 1.)
        M,L = np.shape(mtx)
        #print "Pruned alignment of %s sequences has %s columns\n" %(M, L)


        if L > thresh and M > 0.95*maxSequences: #don't waste time cycling
            break

    return headers,seqs


args = cgi.FieldStorage()

tarSeq = int(args.getvalue('seq'))

h,s = run(tarSeq)
mtx = fullmsa.prune(fullmsa.binMatrix(s), 1.)
d   = fullmsa.bootMetric(mtx, 0.1)
print jsonify.jsonify(d)




print "Content-type: text/html\n\n"
print json



if __name__=="__main__":
    fastaIn = argv[1]
    outFN   = argv[2]
    tarSeq  = fasta.importFasta(fastaIn)[1][0]
    h,s = run(tarSeq)
    out = open(outFN, 'w')
    for header, seq in zip(h,s):
        out.write("%s\n%s\n" %(header.strip(), seq.strip()))
    out.close()
