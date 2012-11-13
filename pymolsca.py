from pymol import cmd, stored
from matplotlib import cm
from sklearn.decomposition import fastica
import infwrapper
import water
import pysca
import fullmsa
import numpy as np

aminoAcids = [
    'ala',
    'cys',
    'asp',
    'glu',
    'phe',
    'gly',
    'his',
    'ile',
    'lys',
    'leu',
    'met',
    'asn',
    'pro',
    'gln',
    'arg',
    'ser',
    'thr',
    'val',
    'trp',
    'tyr'
    ]

colors = ['tv_blue', 'tv_red', 'tv_green']
    
def eigenPainter(msaFN, chainID, vecs):
    vecs = [int(i) for i in vecs.split('+')]
    mtx = fullmsa.prune(fullmsa.binMatrix(msaFN), 1.)
    R = fullmsa.redundancy(mtx)
    v,vec = np.linalg.eig(R)
    resNums, chainSeq= chainFromPymol(chainID)
    ats = pysca.register(fullmsa.consensus(mtx), chainSeq, resNums)

    for i in vecs:
        residues = [ats[j] for j in range(np.shape(mtx)[1])]
        cmd.create('vec%s' %i, 'chain %s' %chainID)
        cmd.hide('everything', 'vec%s' %i)
        cmd.create('vec%s_l' %i, 'chain %s' %chainID)
        cmd.hide('everything', 'vec%s_l' %i)
        cmd.color('white', 'vec%s'%i)
        cmd.color('white', 'vec%s_l'%i)
        colorGrad(residues, vec[:,i], ' and (vec%s or vec%s_l)' %(i,i))
        print('Rendering...')
        cmd.show('surface', 'vec%s' %i)
        cmd.show('sticks', 'vec%s_l' %i)
    cmd.color('red', '*_l and name o')
    cmd.color('blue', '*_l and name n')
    cmd.color('yellow', '*_l and name s')
    print('Enjoy!')
cmd.extend('eigenPainter', eigenPainter)

def icaPainter(msaFN, chainID, ncomps = 5):
    maxComps = 5
    ncomps = int(ncomps)
    if ncomps < 5:
        maxComps = ncomps
    mtx = fullmsa.prune(fullmsa.binMatrix(msaFN), 1.)
    #mtx = fullmsa.prune(fullmsa.binMatrix(msaFN), 1.)
    R = fullmsa.infoDistance(mtx)
    #R = fullmsa.testMetric2(mtx)
    #mi = infwrapper.inf(mtx)
    ica = fastica(R, n_components=ncomps)[0]
    resNums, chainSeq = chainFromPymol(chainID.split('+')[0])
    ats = pysca.gappyRegister(fullmsa.consensus(mtx), chainSeq, resNums)

    for i,ic in enumerate(ica[:maxComps,:], 1):
        ic = np.abs(ic)
        residues = ats[np.where(ats > 0.)]
        ic = ic[[j for j in np.where(ats > 0.)[0] if j < len(ic)]]
        cmd.create('ic%s' %i, 'chain %s and resn %s' %(chainID, '+'.join(aminoAcids)))
        cmd.hide('everything', 'ic%s' %i)
        #meanIC = np.median(ic)
        #for j in resNums:
        cmd.alter('ic%s' %i, 'b=0')
        cmd.color('white', 'ic%s'%i)
        for res, val in zip(residues, ic):
            cmd.alter('resi %s and ic%s' %(res, i), 'b=%s' %val)
        cmd.create('ic%s_l' %i, 'ic%s' %i)
        print('Rendering component %s...' %i)
        cmd.spectrum('b', 'rainbow', 'ic%s' %i)
        cmd.spectrum('b', 'rainbow', 'ic%s_l and name C*' %i)
        cmd.show('surface', 'ic%s' %i)
        cmd.show('sticks', 'ic%s_l' %i)
    cmd.color('red', '*_l and name o*')
    cmd.color('blue', '*_l and name n*')
    cmd.color('yellow', '*_l and name s*')
    print('Enjoy!')
cmd.extend('icaPainter', icaPainter)


def chainFromPymol(chainID):
    stored.res = {}
    cmd.iterate('chain %s' %chainID, 'stored.res[resi] = resn')
    resis = {}
    for key in stored.res:
        try:
            resis[key] = water.changeToOneLetter[stored.res[key]]
        except KeyError:
            print 'Residue number %s%s was ommitted because it is not an amino acid' % (key, stored.res[key])
    resNums = sorted([int(i) for i in resis.keys()])
    seq = ''.join([resis[str(i)] for i in resNums])
    return resNums, seq

def colorGrad(resNums, vals, selString = ''):
    if isinstance(vals, str):
        vals = [float(i) for i in vals.split('+')]
    if isinstance(resNums, str):
        resNums = [int(i) for i in resNums.split('+')]
    selString = ' ' + selString
    #print 'The selection string is:\n%s' %selString
    #cmap = rgbMap(vals)
    for res, val in zip(resNums, vals):
        cmd.alter('resi %s and %s' %(res, selString), 'b=%s' %val)
        print 'alter resi %s and %s,  b=%s' %(res,selString,val)
    cmd.spectrum('b', 'rainbow', selString)
cmd.extend('colorGrad', colorGrad)

def newNetwork(name, resnums):
    cmd.create(name, 'resi %s' %resnums)
    cmd.create('%s_l' %name, 'resi %s' %resnums)
    cmd.show('surface', '%s' %name)
    cmd.color('lightblue', name)
    cmd.show('sticks', '%s_l' %name)
    cmd.color('lightblue', '%s_l and name C*' %name)
cmd.extend('newNetwork', newNetwork)



def colorString(vals, ats):
    vals = np.array(vals)
    ats  = np.array(ats)
    resNums = '+'.join([str(i) for i in ats[np.where(ats > 0)]])
    values  = '+'.join(['%f'%i for i in vals[np.where(ats > 0)]])
    print 'colorGrad, %s, %s' %(resNums, values)

class rgbMap():
    def __init__(self, vals):
        self.minimum = min(vals)
        self.maximum = max(vals)
    def __call__(self, val):
        normed = (val-self.minimum)/(self.maximum-self.minimum)
        return cm.jet(normed)[:3]

def cleanUp(selString):
    selString = ' ' + selString + ' '
    cmd.hide('everything', selString)
    cmd.color('white', selString + 'and name c*')
    cmd.show('ribbon', selString)
    cmd.show('sticks', selString + 'and resn anp')
    cmd.show('sticks', selString + 'and resn atp')
cmd.extend('cleanUp', cleanUp)

def runCCTs():
    for i in range(1,10):
        icaPainter('/home/kmdalton/Sequences/plot/aln/blast/cct%s.aln' %i, str(i), 3)
        cmd.save('/home/kmdalton/Sequences/plot/aln/blast/cct%s.pse' %i)
        cmd.delete('ic*')
cmd.extend('runCCTs', runCCTs)

