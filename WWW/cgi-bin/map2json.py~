import numpy as np
import urllib
import xml.etree.ElementTree as ET
import os
import json
import httplib
import random

# Main method
def makeMap(inipmid,levels=2):

    output = map2json(buildMap([inipmid],levels=levels))
    
    # output json file
    filename = str(inipmid)+'.json'
    s = open(filename, 'w')
    s.write(json.dumps(output, indent=4, separators=(',', ': ')))
    s.close()
    
    return filename

# Output JSON from buildmap output
def map2json(ids,mincite=1):
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
        if keycount[key] >= mincite:
            output['nodes'].append({'name':str(key),'group':(ids[key]['level']+1),'url':'http://www.ncbi.nlm.nih.gov/pubmed/'+str(key),'value': keycount[key]})
            key2ind.append(key)


    for key in ids.keys():
        for target in ids[key]['IDs']:
            if keycount[target] >= mincite and keycount[key] >= mincite:
                output['links'].append({'source': key2ind.index(key),'target': key2ind.index(target),'value': (keycount[key]+keycount[target])})


        
    return output

# Returns dictionary of PMID keys and PMIDs values
def buildMap(inipmid,levels=3,ids={}):
    if levels > 1:
        curIDs = getIDs(inipmid)
        for curpmid in curIDs:
            if curpmid[0] not in ids:
                ids[curpmid[0]] = {'IDs':curpmid[1:],'level':levels}
        curIDs = sum(curIDs, [])
        curIDs = [item for item in curIDs if item not in ids]
        ids = buildMap(curIDs,levels=levels-1,ids=ids)
    else:
        for curpmid in inipmid:
            if curpmid not in ids:
                ids[curpmid] = {'IDs':[],'level':levels}

    return ids

# Returns pmids from citation pmid, if any.
# If none exist, returns None
# uses POST method
def getIDs(pmid):
    
    # get local xml from pubmed
    filename = url2xml(pmid)
    
    # find the PMID field
    xmlroot = ET.parse(filename).getroot()
    PMIDs = []
    
    # Make list of lists
    for curid in xmlroot.getiterator('LinkSet'):
        thislist = [int(curid.find('IdList').find('Id').text)]
        for linkset in curid.findall('LinkSetDb'):
            if linkset.find('LinkName').text:
                if "citedin" in linkset.find('LinkName').text:
                    for link in linkset.findall('Link'):
                        thislist.append(int(link.find('Id').text))
        # now append them
        PMIDs.append(thislist)

    # Delete that ugly xml file
    killfile(filename)
    return PMIDs

# Returns URL for pmid pubmed xml file
# Deprecated Oct 13, 2013
# All requests go through POST
def getURL(pmid):
    return 'http://www.ncbi.nlm.nih.gov/pubmed/'+str(pmid)+'?report=xml'

# Makes a local XML file by POSTing pmids in e-utils PUBMED,
# and returns the filename, directory of resultant XML file
def url2xml(pmid):
    headers = {"Content-type": "application/x-www-form-urlencoded", "Accept":"text/plain"}

    datadict = (('dbfrom','pubmed'),('db','pubmed'))
    for curid in pmid:
        datadict = datadict + (('id',curid),)
                
    data = urllib.urlencode(datadict)
                
    h = httplib.HTTPConnection('eutils.ncbi.nlm.nih.gov')
    h.request('POST','/entrez/eutils/elink.fcgi',data,headers)
    f = h.getresponse()
    
    filename = '.tmp.'+str(random.randint(0,1000000))+'.xml'
    s = open(filename, 'w')
    s.write(f.read())
    s.close()
    
    return filename
    

def killfile(filename):
    os.remove(filename)
    return None
