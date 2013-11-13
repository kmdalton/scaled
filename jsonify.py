import numpy as np
import json

# Main method
def makeMap(mtx,filename='output'):


    mtx = np.matrix(mtx)

    # Keep only upper diag to avoid double-connection weirdness
    mtxu = np.triu(mtx) 

    # Make dictionary
    ids={}

    # resids are refered to by their indice
    curIDs = range(mtxu.shape[0])
    for curid in curIDs:
        otherIDs = np.array([i for i in curIDs if mtxu[curid,i]!=0 and i != curid])
        ids[curid] = {'IDs':otherIDs}

    output = mtx2json(ids, mtx)
    
    # output json file
    filename = filename+'.json'
    s = open(filename, 'w')
    s.write(json.dumps(output, indent=4, separators=(',', ': ')))
    s.close()
    
    return filename

# Output JSON from buildmap output
def mtx2json(ids, mtx):
    output = {}
    keycount = {}

    for key in ids.keys():
        keycount[key] = 0
    
    # build links        
    output['links'] = []
    for key in ids.keys():
        for target in ids[key]['IDs']:
            keycount[key] += 1

    # build nodes
    output['nodes'] = []
    key2ind = []
    for key in ids.keys():
        output['nodes'].append({'name':str(key),'value': keycount[key]})
        key2ind.append(key)


    for key in ids.keys():
        for target in ids[key]['IDs']:
            output['links'].append({'source': key2ind.index(key),'target': key2ind.index(target),'value': (mtx[int(key),int(target)])})

        
    return output

