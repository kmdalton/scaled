###############################################################################
# This guy is for automatically generating alignments of two genes with seqs  #
# that are paired up by TaxID. It has quite a few dependencies:               #
# BLAST+, hmmer, clustalo, nr database                                        #
###############################################################################
import water, fasta, fullmsa
from sys import argv


def run(seq1, seq2, maxseqs = 5000):
    """
    Simple function to make a paired alignment. Call as run(string1, string2),
    where each string corresponds to an amino acid sequences of a protein of
    interest. 

    Returns a tuple like (--list of headers--, --list of aligned sequences--)
    """

    #I apologize for short variable name h = list of headers; s = list of seqs;
    #gi = list of gene identifiers a la the blast nr db; t = list of taxids
    h1, s1 = water.phmmer(seq1)
    h2, s2 = water.phmmer(seq2)

    h1, s1 = h1[:maxseqs], s1[:maxseqs]
    h2, s2 = h2[:maxseqs], s2[:maxseqs]

    gi1 = [h.split('|')[1] for h in h1] 
    gi2 = [h.split('|')[1] for h in h2] 

    h,s,t = water.commonTaxa(gi1,s1,gi2,s2)
    
    #Don't trust hmmer alignment -- remake with clustalo
    #Concatenate the seq pairs and remove gaps

    concatenated = [i[0] + i[1] for i in s]
    concatenated = [re.sub('-', '', i) for i in s]

    #Reformat headers in an intellible way:
    #gi1;gi2;taxid
    nheaders = ["%s;%s" %(i,j) for i,j in h]
    nheaders = [">%s;%s" %(i,j) for i,j in zip(nheaders,t)]

    nheaders, alnseqs = water.clustalo(nheaders, concatenated)

    return nheaders, alnseqs

if __name__ == "__main__":
    inFN = argv[1]
    outFN= argv[2]
    h,s = fasta.importFasta(inFN)
    seq1,seq2 = s[0],s[1]
    h,s = run(seq1, seq2)

    with open(outFN, 'w') as out:
        for header, seq in zip(h,s):
            write(">%s\n%s\n" %(header, seq))
