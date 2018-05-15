import re

# Given fasta filename, collect heads and their sequences
def importFasta(fastaFN):
    lines = open(fastaFN, 'r').readlines()
    headers = []
    seq = []
    # TODO: This method could be improved by using filename as format hint
    # -- Regrettably, there are not accepted conventions for extensions --

    # Check for .free or .clustal filetype.o
    # No idea what .free format is -- just going off of what comes in the Input
    # folder of sca5 files.
    if lines[0][0] == '>':
        for line in lines:

            if line[0] == '>':
                headers.append(line)
                seq.append('')
            else:
                seq[-1] = seq[-1] + re.sub(r'[^-gascvtpildneqmkhfyrwGASCVTPILDNEQMKHFYRW]', '', line)
    elif lines[0][0].isdigit():
        for line in lines:
            splitline = line.split()
            headers.append(splitline[0])
            seq.append('')
            seq[-1] = seq[-1] + splitline[1]
    else: 
        # Other free possibility: last 
        for line in lines:
            splitline = line.split()
            seq.append('')
            seq[-1] = seq[-1] + splitline[0]
    return headers, seq

def writeFasta(fastaFN, orgs, param = 'SEQUENCE'):
    out = open(fastaFN, 'w')
    for org in orgs:
        out.write('%s\n%s\n' %(org['HEADER'].strip(), org[param]))
    out.close()

def removeGaps(fastaFN, outFN):
    h,s = importFasta(fastaFN)
    out = open(outFN, 'w')
    for header, seq in zip(h,s):
        out.write(">%s\n%s\n" %(header, re.sub(r'-', '', seq)))
    out.close()

#Maybe Alex can merge this into the importFasta function if he likes. I don't know if there is a canonical file
#extensions for stockholm alignments
def importStockholm(stockholmFN):
    lines = open(stockholmFN).readlines()
    seqs = {}
    headers = [] #Keep an ordered record of the alignment members
    for line in lines:
        if line[0] != '#' and len(line.split()) > 1:
            try:
                line = line.strip().split()
                seqname = line[0]
                seq = line[-1]
                seq = seq.upper()
                #Ditch insane characters for safety
                seq = re.sub(r'[^-\.GASCVTPILDNEQMKHFYRW]', '', seq)
                #Pysca doesn't use dots for gaps -- only dashes
                seq = re.sub(r'[\.]', '-', seq)
                if seqname in seqs:
                    seqs[seqname] = seqs[seqname] + seq
                else:
                    seqs[seqname] = seq
                    headers.append(seqname)
            except:
                print("{} : {}".format(seqname, seq))
    #Return two tuples, first the headers and then the corresponding sequences
    return headers, [seqs[i] for i in headers]


