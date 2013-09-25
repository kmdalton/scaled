import re

# Given fasta filename, collect heads and their sequences
def importFasta(fastaFN):
    lines = open(fastaFN, 'r').readlines()
    headers = []
    seq = []
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
    return headers, seq

def writeFasta(fastaFN, orgs, param = 'SEQUENCE'):
    out = open(fastaFN, 'w')
    for org in orgs:
        out.write('%s\n%s\n' %(org['HEADER'].strip(), org[param]))
    out.close()

