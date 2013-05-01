import re

# Given fasta filename, collect heads and their sequences
def importFasta(fastaFN):
    lines = open(fastaFN, 'r').readlines()
    headers = []
    seq = []
    for line in lines:
        if line[0] == '>':
            headers.append(line)
            seq.append('')
        else:
            seq[-1] = seq[-1] + re.sub(r'[^-gascvtpildneqmkhfyrwGASCVTPILDNEQMKHFYRW]', '', line)
    return headers, seq

def writeFasta(fastaFN, orgs, param = 'SEQUENCE'):
    out = open(fastaFN, 'w')
    for org in orgs:
        out.write('%s\n%s\n' %(org['HEADER'].strip(), org[param]))
    out.close()

