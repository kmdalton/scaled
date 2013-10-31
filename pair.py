import numpy as np
import random
import urllib
import xml.etree.ElementTree as ET
import os
import httplib


def url2xml(pmid,db='protein',dbfrom='protein',util='elink',term=''):
    """ returns the temporary filename into which is stored the POST results from an 
    eutils Pubmed request. Accepts a list of GIs or PMIDs
    You shouldn't really have to mess too much with this funciton, except perhaps to add a use-case
    for how to handle multiple pmids. The temporary file gets deleted by the functions which call 
    this one.

    """
    datadict = (('dbfrom',dbfrom),('db',db))
    if term != '':
        datadict = datadict+(('term',term),)

    if util=='esummary':
        toadd = ''
        for curid in pmid:
            toadd = toadd + ',' + str(curid)
        toadd = toadd[1:]
        datadict = datadict + (('id',toadd),)
    else: 
        # the difference being that each ID must be sent separately.
        for curid in pmid:
            datadict = datadict + (('id',curid),)

    f = postcall(datadict,util)
    # Should be changed so that filenaming isn't stupid.
    filename = '.tmp.'+str(random.randint(0,1000000))+'.xml'
    s = open(filename, 'w')
    s.write(f.read())
    s.close()

    return filename


def id2fasta(pmid):
    """ 
    Returns a filename into which is stored FASTA sequences of PMIDs
    """
    datadict = (('rettype','fasta'),('db','protein'))
    for curid in pmid:
        datadict = datadict + (('id',curid),)
    f = postcall(datadict,'efetch')

    # Should be changed so that filenaming isn't stupid.
    filename = '.tmp.'+str(random.randint(0,1000000))+'.fasta'
    s = open(filename, 'w')
    s.write(f.read())
    s.close()

    return filename

def postcall(datadict,util):
    """ Generalized post call to database. """
    headers = {"Content-type": "application/x-www-form-urlencoded", "Accept":"text/plain"}
    data = urllib.urlencode(datadict)
    h = httplib.HTTPConnection('eutils.ncbi.nlm.nih.gov')
    h.request('POST','/entrez/eutils/'+util+'.fcgi',data,headers)
    f = h.getresponse()
    return f


def gi2name(pmid):
    """ returns full organism name of protein GIs listed in pmid. """
    # get local xml from pubmed
    filename = url2xml(pmid,db='protein',dbfrom='',util='esummary')

    # find the PMID field
    xmlroot = ET.parse(filename).getroot()
    PMIDs = []
    maxscore = 0

    # Make list of lists
    for curid in xmlroot.getiterator('eSummaryResult'):
        for curid1 in curid.findall('DocSum'):

            thislist = [int(curid1.find('Id').text)]
            for curid2 in curid1.findall('Item'):
                if curid2.get('Name') == 'Title':
                        thetext = curid2.text.split('[')
            thislist.append(thetext[-1][:-1])
            PMIDs.append(thislist)

    os.remove(filename)
    return PMIDs    

def findProt(protname,orgname):
    """ 
    returns protein GI given search term and organism name 
    by simply searching for both in protein database and returning 
    the first query, or None if no results come up.
    Only accepts one orgname and protname at a time.
    
    """
    term = protname+' AND '+orgname+'[Organism]'
    # get local xml from pubmed
    filename = url2xml('',db='protein',dbfrom='',util='esearch',term=term)

    # find the PMID field
    xmlroot = ET.parse(filename).getroot()
    PMIDs = []

    maxscore = 0
    # Make list of lists
    for curid in xmlroot.getiterator('eSearchResult'):
        if curid.find('IdList').find('Id') is not None:
            toappend = int(curid.find('IdList').find('Id').text)
        else:
            toappend = None
    #print 'maxscore is ' + str(int(maxscore))
    # Delete that ugly xml file\
    os.remove(filename)
    return toappend


def getPartnerGI(protein1_gi,protein2):
    """ 
    returns fasta sequences for two proteins paired by their organism name. 
    such that sequence i in file 1 is from the same organism as sequence i in file 2
    headers of fasta sequences are just the GI numbers of the protein

    also returns organism list
    
    accepts a list of protein1 gi (as output from GI list downloads from Pubmed)
    and a query term which should be your second protein of interest (e.g. rodZ)
    """    
    # Get organism names of protein 1
    print "Getting protein 1 organisms.."
    protein1file = open(protein1_gi, 'r')
    protein1ids = protein1file.read().split('\n')
    p1_taxnames = gi2name(protein1ids)
    
    # Trim so that you only have unique tax names (for the case of homologs from the same protein)
    print "Trimming protein 1 organisms.."
    p1_taxnames_set = set()
    p1_tnu = []
    keepids = []
    for i in range(len(p1_taxnames)):
        if p1_taxnames[i][1] not in p1_taxnames_set:
            p1_taxnames_set.add(p1_taxnames[i][1])
            p1_tnu.append(p1_taxnames[i])
            keepids.append(i) 
    
    # Now get GIs of protein 2
    print "Getting GIs of protein 2 in protein 1 organisms"
    protein2ids = []
    secondset = set()
    for l in range(len(p1_tnu)):
        toadd = findProt(protein2, p1_tnu[l][1])
        if toadd is not None:
            if toadd not in secondset:
                protein2ids.append([p1_tnu[l][0],toadd,p1_tnu[l][1]])
                secondset.add(toadd)
                print p1_tnu[l][1]
    accmatch = np.zeros(np.array(protein2ids).shape, dtype=int)
    for i in range(len(protein2ids)):
        accmatch[i,0] = np.int(protein2ids[i][0])
        accmatch[i,1] = np.int(protein2ids[i][1])    

    print "Getting FASTAs for protein 1 and protein 2. "
    # Now make fasta files for each list of gis.
    p1file = id2fasta(accmatch[:,0])
    p2file = id2fasta(accmatch[:,1])
    orgNames  = [p1_taxnames[i][1] for i in range(len(p1_taxnames))]

    return p1file, p2file, orgNames

    
def combineFasta(p1file, p2file, headers, combinedname='combined.fasta'):
    """ combines two fasta files, using headers as headers. """
    f = open(p1file, 'r')
    f2 = open(p2file, 'r')
    
    l1 = f.read().split('\n')
    l2 = f2.read().split('\n')
    
    s1 = [j for (i,j) in zip(l1,range(len(l1))) if len(i)>0 and i[0]=='>']
    s2 = [j for (i,j) in zip(l2,range(len(l2))) if len(i)>0 and i[0]=='>']
    
    s1.append(len(l1))
    s2.append(len(l2))
    
    if len(s1) != len(s2):
        print "uhoh"
        
    out = open(combinedname, 'w')
    for i in range(len(s1)-1):
        out.write('>'+headers[i].replace(" ", "-"))
        out.write('\n')
        for j in range(s1[i]+1,s1[i+1]):
            out.write(l1[j].rstrip('\n'))
        for j in range(s2[i]+1,s2[i+1]):
            out.write(l2[j].rstrip('\n'))
        out.write('\n')
    out.close()

