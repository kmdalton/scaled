import numpy as np
import urllib
import xml.etree.ElementTree as ET
import os
import json
import httplib
import random

# Main method
def makeMap(mtx,filename='output'):


    mtx = np.matrix(mtx)

    # Define threshold
    avemtx = np.mean(np.mean(mtx))
    stdmtx = np.mean(np.std(mtx))
    thresh = avemtx + 3*stdmtx
    
    # Keep only upper diag to avoid double-connection weirdness
    mtxu = np.triu(mtx) 

    # Make dictionary
    ids={}
    # resids are refered to by their indice
    curIDs = range(mtxu.shape[0])
    for curid in curIDs:
        otherIDs = np.array([i for i in curIDs if i!=curid and mtxu[curid,i]>thresh])
        ids[curid] = {'IDs':otherIDs}

    output = mtx2json(ids)
    
    # output json file
    filename = filename+'.json'
    s = open(filename, 'w')
    s.write(json.dumps(output, indent=4, separators=(',', ': ')))
    s.close()
    
    return filename

# Output JSON from buildmap output
def mtx2json(ids):
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
            output['links'].append({'source': key2ind.index(key),'target': key2ind.index(target),'value': (keycount[key]+keycount[target])})

        
    return output

