import numpy as np
# from mdp.nodes import CuBICANode as ICANode # Throwing error!
# import msa # Throwing error!
import water
import re

# returns relative sequence of aligned sequences, but removes '-' from consensus sequence
# Repeated in water.py
def gappyRegister(consensus, seq, resNums):
    gappyAts = register(re.sub('-', '', consensus), seq, resNums)[1:]
    ats = [None for i in range(len(consensus) + 1)]
    
    charPlatzen = np.where(np.array(list(consensus)) != '-')[0]+1
    #print charPlatzena
    for pl,alnd in zip(charPlatzen, gappyAts):
        #print 'Platz - %s | ats - %s' %(pl, alnd)
        ats[pl] = alnd
    return np.array(ats)

# returns relative sequence of aligned sequences
def register(consensus, seq, resNums):
    aln = water.align(consensus, seq).split('\n')
    for line in aln: print line
    aln = [i for i in aln if len(i) > 2 and i[0] != '#']
    l = len(aln)
    s1 = ''.join([aln[3*i] for i in range(l/3)])
    s1 = re.sub(r'[^-ACDEFGHIKLMNPQRSTVWY]', '', s1)
    s2 = ''.join([aln[3*i+2] for i in range(l/3)])
    s2 = re.sub(r'[^-ACDEFGHIKLMNPQRSTVWY]', '', s2)
    print aln
    x = int(aln[0].split()[0]) y = int(aln[2].split()[0])
    ats = [None for i in range(len(consensus)+1)]
    print consensus
    print seq
    print resNums
    for i1,i2 in zip(s1, s2):
        if i1 != '-' and i2 != '-':
            try:
                ats[x] = resNums[y]
            except IndexError:
                print 'Something happened with %s%s' %(y, i2)
        if i1 != '-':
            x += 1
        if i2 != '-':
            y += 1
    return np.array(ats)

