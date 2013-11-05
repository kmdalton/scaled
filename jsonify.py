import numpy as np

def jsonify(mtx, **kw):
    L = np.shape(mtx)[0]
    groups = kw.get('groups', [1]*L)
    names  = kw.get('names', range(L))
    thresh = kw.get('thresh', 2.)
    json = '{\n\t"nodes":[\n\t\t'

    thresh = np.mean(mtx) - thresh*np.std(mtx)

    nodes = []
    for n,g,i in zip(names,groups,range(L)):
        #if np.shape(np.where(mtx[i] < thresh))[1] > 1:
        nodes.append('{"name":%s,"group":%s}' %(n,g))
    json = json + ',\n\t\t'.join(nodes)
    
    json = json + '\n\t],\n\t"links":[\n\t\t'

    edges = []
    for i,j in zip(*np.triu_indices(L)):
        dist = mtx[i,j]
        if i!=j:
            if dist < thresh:
                edges.append('{"source":%s,"target":%s,"value":%s}' %(i, j, dist))
    json = json + ',\n\t\t'.join(edges)

    json = json + '\n\t]\n}'

    return json


def titrate(mtx, stds):
    files = []
    for i in stds:
        t = np.mean(mtx) - i*np.std(mtx)
        files.append(jsonify(mtx, thresh=t))
    return files 

def sif(mtx, **kw):
    L = np.shape(mtx)[0]
    names  = kw.get('names', range(L))
    thresh = kw.get('thresh', 2.)
    edges  = []
    maxdist = np.mean(mtx) - thresh*np.std(mtx)
    for i,j in zip(*np.triu_indices(L)):
        dist = mtx[i,j]
        if i!=j:
            if dist < maxdist:
                edges.append('resi%s %ssigma resi%s' %(names[i], thresh, names[j]))
    return '\n'.join(edges)
