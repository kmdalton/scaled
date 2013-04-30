import re
# import tails -- commenting for now because its throwing error and I can't find it online
import numpy as np
import pylab
from copy import deepcopy
from mpl_toolkits.mplot3d.axes3d import Axes3D
from matplotlib import pyplot as plt
import matplotlib as mpl

# makes a hexagonabl binning plot of x y z
def hexbin(x, y, z):
    ax = plt.gca()
    ax.set_axis_bgcolor(mpl.cm.jet(0.))
    plt.hexbin(x,y,z)
    plt.show()

# makes a heat map
def heatMap(matrix, color = 'jet', *args):
    args = [i.lower() for i in args]
    matrix = deepcopy(matrix)
    if 'baseline' in args:
        # shouldn't this be - np.min?
        matrix = matrix + np.min(matrix) 
    if 'log' in args:
        matrix = np.log10(np.abs(matrix))
    if 'diag' in args:
        matrix[np.diag_indices(np.shape(matrix)[0])] = 0.

    plt.imshow(10.*matrix/np.max(matrix), interpolation = 'nearest', cmap = plt.get_cmap(color, 10.))

# 
def genomeVLen(orgs, domain = 'NTAIL', group = 2):
    if group == 1: group = 'GROUPI'
    elif group == 2: group = 'GROUPII'
    else: return false
    ticks = []
    for org in orgs:
        if org[group] not in ticks:
            ticks.append(org[group])
    ticks = sorted(ticks)
    x = []
    for num in ticks:
        x.append([len(i[domain]) for i in orgs if i[group] == num])
    
    boxP(x, ticks)

#
def genomeIsoP(orgs, domain = 'NTAIL', group = 2):
    if group == 1: group = 'GROUPI'
    elif group == 2: group = 'GROUPII'
    else: return false
    ticks = []
    for org in orgs:
        if org[group] not in ticks:
            ticks.append(org[group])
    ticks = sorted(ticks)
    x = []
    for num in ticks:
        x.append([tails.isoP(i[domain]) for i in orgs if i[group] == num])
    
    boxP(x, ticks)

#
def boxP(x,ticks):
    plt.boxplot(x)
    pylab.xticks(range(1,len(ticks)+1), [str(i) for i in ticks])

#
def bimodality(arch):
    fig = plt.figure()
    fig.add_subplot(411)
    plt.hist([tails.isoP(i['SEQUENCE']) for i in arch if i['GROUPII'] == 1], bins = 20)
    plt.axis([3.6,6.9,0,25])
    fig.add_subplot(412)
    plt.hist([tails.isoP(i['SEQUENCE']) for i in arch if i['GROUPII'] == 2], bins = 20)
    plt.axis([3.6,6.9,0,25])
    fig.add_subplot(413)
    plt.hist([tails.isoP(i['SEQUENCE']) for i in arch if i['GROUPII'] == 3], bins = 20)
    plt.axis([3.6,6.9,0,25])
    fig.add_subplot(414)
    plt.hist([tails.isoP(i['SEQUENCE']) for i in arch if i['GROUPII'] == 4], bins = 20)
    plt.axis([3.6,6.9,0,25])
    plt.show()

#
def cladeBoxP(func, clades, domain = 'SEQUENCE'):
    x = []
    xticks = sorted(clades.keys())
    for key in xticks:
        x.append([func(i[domain]) for i in clades[key]])
    boxP(x, xticks)

#
def cctBoxP(func, ccts, domain = 'SEQUENCE'):
    x = []
    xticks = [str(i) for i in range(1,11)]
    for key in xticks:
        tmp = [func(i[domain]) for i in ccts[key]]
        tmp = [i for i in tmp if i != None]
        x.append(tmp)
    boxP(x, xticks)

def domainsBoxP(func, clades, axis = None):
    domains = ['NTAIL', 'EQUATORIAL', 'INTERMEDIATE', 'APICAL', 'CTAIL', 'SEQUENCE']
    f = plt.figure()
    p = 231
    for domain in domains:
        f.add_subplot(p)
        cladeBoxP(func, clades, domain)
        plt.title(domain)
        if axis != None: plt.axis(axis)
        p += 1

def cladesFromFiles(*args):
    clades = {}
    for i, arg in enumerate(args):
        clades[str(i)] = re.findall(r'b[0-9]*', ' '.join(open(arg, 'r').readlines()))
    return clades

def submatrix(ind1, ind2, mtx):
    smtx = np.zeros([len(ind1), len(ind2)])
    for i, i1 in enumerate(ind1):
        for j, j1 in enumerate(ind2):
            smtx[i,j] = mtx[i1,j1]
    return smtx

def clusterAnalysis(clusts, o):
    c = []
    for clust in clusts:
        c.append([o[i]['CCTN'] for i in clust])
    plt.boxplot(c)
    plt.xticks(range(1,len(c) + 1), range(len(c)))
    mpl.rcParams['font.size'] = 16
    plt.xlabel('Cluster ID')
    plt.ylabel('Cct Subunit')


def simMap(mtx, s = 12, text = True):
    for i in range(len(mtx)):
        mtx[i,i] = -1.
    for i in range(len(mtx)):
        mtx[i,i] = np.max(mtx)
    heatMap(mtx)
    if text:
        for i in range(len(mtx)):
            for j in range(len(mtx)):
                if i != j:
                    plt.text(i, j, '%0.1f' %mtx[i,j], color = 'y', horizontalalignment = 'center', verticalalignment = 'center', size = s)

def mode(l, o):
    return [np.argmax(np.bincount([o[j]['CCTN'] for j in i])) for i in l]

def plot3D(x, y, z, **kwargs):
    xlabel,ylabel,zlabel = 'x','y','z'
    color = np.zeros(len(x))
    if 'xlabel' in kwargs:
        xlabel = str(kwargs['xlabel'])
    if 'ylabel' in kwargs:
        ylabel = str(kwargs['ylabel'])
    if 'zlabel' in kwargs:
        zlabel = str(kwargs['zlabel'])
    if 'marker' in kwargs:
        m = kwargs['marker']
    else:
        m = 'o'
    if 'c' in kwargs:
        c = kwargs['c']
    else:
        c = 'b'
    xlabel,ylabel,zlabel = 'x','y','z'
    if 'xlabel' in kwargs:
        xlabel = kwargs['xlabel']
    if 'ylabel' in kwargs:
        ylabel = kwargs['ylabel']
    if 'zlabel' in kwargs:
        zlabel = kwargs['zlabel']
    x, y, z = np.real(x), np.real(y), np.real(z)
    f = plt.figure()
    ax = Axes3D(f)
    ax.scatter(x,y,z,marker=m,c=c)
    ax.set_zlabel(xlabel)
    ax.set_xlabel(ylabel)
    ax.set_ylabel(zlabel)
    plt.show()
