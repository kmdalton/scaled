import matplotlib.pyplot as plt
import re
import os
import Bio.Emboss.Applications
import pp
import pickle
import numpy as np
import string

Greek = {
    '1':'A',
    '2':'B',
    '3':'G',
    '4':'D',
    '5':'E',
    '6':'Z',
    '7':'H',
    '8':'Q',
    'A':'1',
    'B':'2',
    'G':'3',
    'D':'4',
    'E':'5',
    'Z':'6',
    'H':'7',
    'Q':'8'
}
neighbors = [
    [],
    [3, 4], #cct1
    [4, 5], #cct2
    [1, 6], #cct3
    [1, 2], #cct4
    [2, 7], #cct5
    [3, 8], #cct6
    [5, 8], #cct7
    [6, 7]  #cct8
]

stacksOn = [
    None,
    7, #cct1
    2, #cct2
    8, #cct3
    5, #cct4
    4, #cct5
    6, #cct6
    1, #cct7
    3  #cct8
]

delta131delta='ATSTLIKAIDGDTVKLMYKGQPMTFRLLLVDTPETKHPKKGVEKYGPEASAFTKKMVENAKKIEVEFDKGQRTDKYGRGLAYIYADGKMVNEALVRQGLAKVAYVYKPNNTHEQHLRKSEAQAKKEKLNIW'

mreB='MLRKDIGIDLGTANTLVFLRGKGIVVNEPSVIAIDSTTGEILKVGLEAKNMIGKTPATIKAIRPMRDGVIADYTVALVMLRYFINKAKGGMNLFKPRVVIGVPIGITDVERRAILDAGLEAGASKVFLIEEPMAAAIGSNLNVEEPSGNMVVDIGGGTTEVAVISLGSIVTWESIRIAGDEMDEAIVQYVRETYRVAIGERTAERVKIEIGNVFPSKENDELETTVSGIDLSTGLPRKLTLKGGEVREALRSVVVAIVESVRTTLEKTPPELVSDIIERGIFLTGGGSLLRGLDTLLQKETGISVIRSEEPLTAVAKGAGMVLDKVNILKKLQGA'

groEL='MAAKDVKFGNDARVKMLRGVNVLADAVKVTLGPKGRNVVLDKSFGAPTITKDGVSVAREIELEDKFENMGAQMVKEVASKANDAAGDGTTTATVLAQAIITEGLKAVAAGMNPMDLKRGIDKAVTAAVEELKALSVPCSDSKAIAQVGTISANSDETVGKLIAEAMDKVGKEGVITVEDGTGLQDELDVVEGMQFDRGYLSPYFINKPETGAVELESPFILLADKKISNIREMLPVLEAVAKAGKPLLIIAEDVEGEALATLVVNTMRGIVKVAAVKAPGFGDRRKAMLQDIATLTGGTVISEEIGMELEKATLEDLGQAKRVVINKDTTTIIDGVGEEAAIQGRVAQIRQQIEEATSDYDREKLQERVAKLAGGVAVIKVGAATEVEMKEKKARVEDALHATRAAVEEGVVAGGGVALIRVASKLADLRGQNEDQNVGIKVALRAMEAPLRQIVLNCGEEPSVVANTVKGGDGNYGYNAATEEYGNMIDMGILDPTKVTRSALQYAASVAGLMITTECMVTDLPKNDAADLGAAGGMGGMGGMGGMM'

mmCpn='MSQQPGVLPENMKRYMGRDAQRMNILAGRIIAETVRSTLGPKGMDKMLVDDLGDVVVTNDGVTILREMSVEHPAAKMLIEVAKTQEKEVGDGTTTAVVVAGELLRKAEELLDQNVHPTIVVKGYQAAAQKAQELLKTIACEVGAQDKEILTKIAMTSITGKGAEKAKEKLAEIIVEAVSAVVDDEGKVDKDLIKIEKKSGASIDDTELIKGVLVDKERVSAQMPKKVTDAKIALLNCAIEIKETETDAEIRITDPAKLMEFIEQEEKMLKDMVAEIKASGANVLFCQKGIDDLAQHYLAKEGIMAARRVKKSDMEKLAKATGANVITNIKDLSAQDLGDAGLVEERKISGDSMIFVEECKHPKAVTMLIRGTTEHVIEEVARAVDDAVGVVGCTIEDGRIVSGGGSTEVELSMKLREYAEGISGREQLAVRAFADALEVIPRTLAENAGLDAIEILVKVRAAHASNGNKCAGLNVFTGAVEDMCENGVVEPLRVKTQAIQSAAESTEMLLRIDDVIAAEKLRGAPDMGDMGGMPGMGGMPGMM'

ccts={
'1':'MSQLFNNSRSDTLFLGGEKISGDDIRNQNVLATMAVANVVKSSLGPVGLDKMLVDDIGDFTVTNDGATILSLLDVQHPAGKILVELAQQQDREIGDGTTSVVIIASELLKRANELVKNKIHPTTIITGFRVALREAIRFINEVLSTSVDTLGKETLINIAKTSMSSKIIGADSDFFSNMVVDALLAVKTQNSKGEIKYPVKAVNVLKAHGKSATESLLVPGYALNCTVASQAMPKRIAGGNVKIACLDLNLQKARMAMGVQINIDDPEQLEQIRKREAGIVLERVKKIIDAGAQVVLTTKGIDDLCLKEFVEAKIMGVRRCKKEDLRRIARATGATLVSSMSNLEGEETFESSYLGLCDEVVQAKFSDDECILIKGTSKHSSSSIILRGANDYSLDEMERSLHDSLSVVKRTLESGNVVPGGGCVEAALNIYLDNFATTVGSREQLAIAEFAAALLIIPKTLAVNAAKDSSELVAKLRSYHAASQMAKPEDVKRRSYRNYGLDLIRGKIVDEIHAGVLEPTISKVKSLKSALEACVAILRIDTMITVDPEPPKEDPHDH',
'2':'MSVQIFGDQVTEERAENARLSAFVGAIAVGDLVKSTLGPKGMDKLLQSASSNTCMVTNDGATILKSIPLDNPAAKVLVNISKVQDDEVGDGTTSVTVLSAELLREAEKLIDQSKIHPQTIIEGYRLASAAALDALTKAAVDNSHDKTMFREDLIHIAKTTLSSKILSQDKDHFAELATNAILRLKGSTNLEHIQIIKILGGKLSDSFLDEGFILAKKFGNNQPKRIENAKILIANTTLDTDKVKIFGTKFKVDSTAKLAQLEKAEREKMKNKIAKISKFGINTFINRQLIYDYPEQLFTDLGINSIEHADFEGVERLALVTGGEVVSTFDEPSKCKLGECDVIEEIMLGEQPFLKFSGCKAGEACTIVLRGATDQTLDEAERSLHDALSVLSQTTKETRTVLGGGCAEMVMSKAVDTEAQNIDGKKSLAVEAFARALRQLPTILADNAGFDSSELVSKLRSSIYNGISTSGLDLNNGTIADMRQLGIVESYKLKRAVVSSASEAAEVLLRVDNIIRARPRTANRQHM',
'3':'MQAPVVFMNASQERTTGRQAQISNITAAKAVADVIRTCLGPKAMLKMLLDPMGGLVLTNDGHAILREIDVAHPAAKSMLELSRTQDEEVGDGTTTVIILAGEILAQCAPYLIEKNIHPVIIIQALKKALTDALEVIKQVSKPVDVENDAAMKKLIQASIGTKYVIHWSEKMCELALDAVKTVRKDLGQTVEGEPNFEIDIKRYVRVEKIPGGDVLDSRVLKGVLLNKDVVHPKMSRHIENPRVVLLDCPLEYKKGESQTNIEIEKEEDWNRILQIEEEQVQLMCEQILAVRPTLVITEKGVSDLAQHYLLKGGCSVLRRVKKSDNNRIARVTGATIVNRVEDLKESDVGTNCGLFKVEMIGDEYFSFLDNCKEPKACTIMLRGGSKDILNEIDRNLQDAMAVARNVMLSPSLSPGGGATEMAVSVKLAEKAKQLEGIQQWPYQAVADAMECIPRTLIQNAGGDPIRLLSQLRAKHAQGNFTTGIDGDKGKIVDMVSYGIWEPEVIKQQSVKTAIESACLLLRVDDIVSGVRKQE',
'4':'MSAKVPSNATFKNKEKPQEVRKANIIAARSVADAIRTSLGPKGMDKMIKTSRGEIIISNDGHTILKQMAILHPVARMLVEVSAAQDSEAGDGTTSVVILTGALLGAAERLLNKGIHPTIIADSFQSAAKRSVDILLEMCHKVSLSDREQLVRAASTSLSSKIVSQYSSFLAPLAVDSVLKISDENSKNVDLNDIRLVKKVGGTIDDTEMIDGVVLTQTAIKSAGGPTRKEKAKIGLIQFQISPPKPDTENNIIVNDYRQMDKILKEERAYLLNICKKIKKAKCNVLLIQKSILRDAVNDLALHFLSKLNIMVVKDIEREEIEFLSKGLGCKPIADIELFTEDRLGSADLVEEIDSDGSKIVRVTGIRNNNARPTVSVVIRGANNMIIDETERSLHDALCVIRCLVKERGLIAGGGAPEIEISRRLSKEARSMEGVQAFIWQEFASALEVIPTTLAENAGLNSIKVVTELRSKHENGELNDGISVRRSGTTNTYEEHILQPVLVSTSAITLASECVKSILRIDDIAFSR',
'5':'MAARPQQPPMEMPDLSNAIVAQDEMGRPFIIVKDQGNKKRQHGLEAKKSHILAARSVASIIKTSLGPRGLDKILISPDGEITITNDGATILSQMELDNEIAKLLVQLSKSQDDEIGDGTTGVVVLASALLDQALELIQKGIHPIKIANGFDEAAKLAISKLEETCDDISASNDELFRDFLLRAAKTSLGSKIVSKDHDRFAEMAVEAVINVMDKDRKDVDFDLIKMQGRVGGSISDSKLINGVILDKDFSHPQMPKCVLPKEGSDGVKLAILTCPFEPPKPKTKHKLDISSVEEYQKLQTYEQDKFKEMIDDVKKAGADVVICQWGFDDEANHLLLQNDLPAVRWVGGQELEHIAISTNGRIVPRFQDLSKDKLGTCSRIYEQEFGTTKDRMLIIEQSKETKTVTCFVRGSNKMIVDEAERALHDSLCVVRNLVKDSRVVYGGGAAEVTMSLAVSEEADKQRGIDQYAFRGFAQALDTIPMTLAENSGLDPIGTLSTLKSKQLKEKISNIGVDCLGYGSNDMKELFVVDPFIGKKQQILLATQLCRMILKIDNVIISGKDEY',
'6':'MSLQLLNPKAESLRRDAALKVNVTSAEGLQSVLETNLGPKGTLKMLVDGAGNIKLTKDGKVLLTEMQIQSPTAVLIARAAAAQDEITGDGTTTVVCLVGELLRQAHRFIQEGVHPRIITDGFEIARKESMKFLDEFKISKTNLSNDREFLLQVARSSLLTKVDADLTEVLTPIVTDAVLSVYDAQADNLDLHMVEIMQMQHLSPKDTTFIKGLVLDHGGRHPDMPTRVKNAYVLILNVSLEYEKTEVNSGFFYSSADQRDKLAASERKFVDAKLKKIIDLKNEVCGMDPDKGFVIINQKGIDPMSLDVFAKHNILALRRAKRRNMERLQLVTGGEAQNSVEDLSPQILGFSGLVYQETIGEEKFTYVTENTDPKSCTILIKGSTHYALAQTKDAVRDGLRAVANVLKDKNIIPGAGAFYIALSRYLRSANMNKLGAKGKTKTGIEAFAEALLVIPKTLVKNSGFDPLDVLAMVEDELDDAQDSDETRYVGVDLNIGDSCDPTIEGIWDSYRVLRNAITGATGIASNLLLCDELLRAGRSTLKETPQ',
'7':'MNFGSQTPTIVVLKEGTDASQGKGQIISNINACVAVQEALKPTLGPLGSDILIVTSNQKTTISNDGATILKLLDVVHPAAKTLVDISRAQDAEVGDGTTSVTILAGELMKEAKPFLEEGISSHLIMKGYRKAVSLAVEKINELAVDITSEKSSGRELLERCARTAMSSKLIHNNADFFVKMCVDAVLSLDRNDLDDKLIGIKKIPGGAMEESLFINGVAFKKTFSYAGFEQQPKKFNNPKILSLNVELELKAEKDNAEVRVEHVEDYQAIVDAEWQLIFEKLRQVEETGANIVLSKLPIGDLATQFFADRNIFCAGRVSADDMNRVIQAVGGSIQSTTSDIKPEHLGTCALFEEMQIGSERYNLFQGCPQAKTCTLLLRGGAEQVIAEVERSLHDAIMIVKRALQNKLIVAGGGATEMEVSKCLRDYSKTIAGKQQMIINAFAKALEVIPRQLCENAGFDAIEILNKLRLAHSKGEKWYGVVFETENIGDNFAKFVWEPALVKINALNSATEATNLILSVDETITNKGSESANAGMMPPQGAGRGRGMPM',
'8':'MSLRLPQNPNAGLFKQGYNSYSNADGQIIKSIAAIRELHQMCLTSMGPCGRNKIIVNHLGKIIITNDAATMLRELDIVHPAVKVLVMATEQQKIDMGDGTNLVMILAGELLNVSEKLISMGLSAVEIIQGYNMARKFTLKELDEMVVGEITDKNDKNELLKMIKPVISSKKYGSEDILSELVSEAVSHVLPVAQQAGEIPYFNVDSIRVVKIMGGSLSNSTVIKGMVFNREPEGHVKSLSEDKKHKVAVFTCPLDIANTETKGTVLLHNAQEMLDFSKGEEKQIDAMMKEIADMGVECIVAGAGVGELALHYLNRYGILVLKVPSKFELRRLCRVCGATPLPRLGAPTPEELGLVETVKTMEIGGDRVTVFKQEQGEISRTSTIILRGATQNNLDDIERAIDDGVAAVKGLMKPSGGKLLPGAGATEIELISRITKYGERTPGLLQLAIKQFAVAFEVVPRTLAETAGLDVNEVLPNLYAAHNVTEPGAVKTDHLYKGVDIDGESDEGVKDIREENIYDMLATKKFAINVATEAATTVLSIDQIIMAKKAGGPRAPQGPRPGNWDQED'
}

changeToOneLetter={
'GLY':'G',
'ALA':'A',
'SER':'S',
'CYS':'C',
'VAL':'V',
'THR':'T',
'PRO':'P',
'ILE':'I',
'LEU':'L',
'ASP':'D',
'ASN':'N',
'GLU':'E',
'GLN':'Q',
'MET':'M',
'LYS':'K',
'HIS':'H',
'PHE':'F',
'TYR':'Y',
'ARG':'R',
'TRP':'W'
}


def simWalk(orgs, attr = 'SEQUENCE'):
    for org in orgs:
        simPlot(org, attr)
        plt.title(org['HEADER'])
        plt.axis([0,10,0,100])
        print org['HEADER']
        print org['LINEAGE']
        raw_input()
        plt.clf()

#Useful function for ambiguous sequences. makes a bar plot of the similarities between this seq and
#Each of the 8 ccts
def simPlot(o, attr = 'SEQUENCE'):
    seq = o[attr]
    sims = [similarity(align(seq, ccts[str(i)])) for i in range(1,9)]
    sims.append(similarity(align(seq, groEL)))
    sims.append(similarity(align(seq, mmCpn)))
    plt.bar(range(10), sims)
    ticks = ['cct%s' %i for i in range(1,9)]
    ticks.append('GroEL')
    ticks.append('mmCpn`')
    plt.xticks(np.arange(10) + 0.5, ticks)

def align(seq1, seq2, ID = 1):
    s = open('.tmp.seq1.%s' %ID, 'w')
    s.write('>seq1\n%s\n' %seq1)
    s.close()
    s = open('.tmp.seq2.%s' %ID, 'w')
    s.write('>seq2\n%s\n' %seq2)
    s.close()
    aln = Bio.Emboss.Applications.WaterCommandline(asequence='.tmp.seq1.%s' %ID, bsequence='.tmp.seq2.%s' %ID, gapopen=10, gapextend=0.5, outfile='stdout',stdout=True)
    aln, err = aln()
    os.remove('.tmp.seq1.%s' %ID)
    os.remove('.tmp.seq2.%s' %ID)
    return aln

def similarity(aln):
    return float(re.findall(r'Similarity:.*\n', aln)[0].split()[-1].strip('%()'))

def identity(aln):
    return float(re.findall(r'Identity:.*\n', aln)[0].split()[-1].strip('%()'))

def score(aln):
    return float(re.findall(r'Score:.*\n', aln)[0].split()[-1].strip('%()'))

def cctN(seq, cctFN=None, ID=1):
    wroteCCTFile = False
    if not cctFN:
        writeCCTFile()
        cctFN = '.tmp.ccts'
        wroteCCTFile = True
    seqFN = '.tmp.seq.%s' %ID
    s = open(seqFN, 'w')
    s.write('>seq-%s\n%s\n' %(ID, seq))
    s.close()
    aln = Bio.Emboss.Applications.WaterCommandline(asequence=seqFN, bsequence=cctFN, gapopen=10, gapextend=0.5, outfile='stdout',stdout=True)
    aln, err = aln()
    scores = [float(i.split()[-1]) for i in re.findall(r'Score:.*\n', aln)]
    subunit = ''
    highScore = -1
    for cct, score in enumerate(scores, 1):
        if score > highScore:
            highScore = score
            subunit = cct
    os.remove(seqFN)
    if wroteCCTFile:
        os.remove(cctFN)
    return subunit

def writeCCTFile(cctFN = '.tmp.ccts'):
    cct = open(cctFN, 'w')
    for i in range(1,9):
        cct.write('>cct%s\n%s\n' %(i, ccts[str(i)]))
    cct.write('>mmCpn\n%s\n' %mmCpn)
    cct.write('>groEL\n%s\n' %groEL)
    cct.close()

def parallelMapNames(seqs, n = 12, cctFN = '.tmp.ccts'):
    writeCCTFile(cctFN)
    ppservers = ()
    job_server = pp.Server(n, ppservers = ppservers)
    jobs = [job_server.submit(cctN, i, (), ('Bio.Emboss.Applications', 'os', 're')) for i in zip(seqs, [cctFN]*len(seqs), range(len(seqs)))]
    cctNs = [i() for i in jobs]
    os.remove(cctFN)
    job_server.destroy()
    return cctNs

def simMatrix(seqs, n=6):
    x = len(seqs)
    m = np.zeros([x, x])
    ind = np.triu_indices(x)
    z = len(ind[0])
    ppservers = ()
    for i in range(z):
        answ = similarity(align(seqs[ind[0][i]], seqs[ind[1][i]]))
        m[ind[0][i],ind[1][i]] = answ
        m[ind[1][i],ind[0][i]] = answ
    return m

def parallelDistanceMatrix(seqs, n=6):
    x = len(seqs)
    similarityMatrix = np.zeros([x, x])
    identityMatrix = np.zeros([x, x])
    scoreMatrix = np.zeros([x, x])
    ind = np.triu_indices(x)
    z = len(ind[0])
    ppservers = ()
    job_server = pp.Server(n, ppservers = ppservers)
    jobs = [job_server.submit(align, (seqs[ind[0][i]], seqs[ind[1][i]], i), (), ('Bio.Emboss.Applications', 'os', 're')) for i in range(z)]
    for i in range(z):
        aln = str(jobs[i]())
        sim = similarity(aln)
        ide = identity(aln)
        sco = score(aln)
        similarityMatrix[ind[0][i],ind[1][i]] = sim 
        similarityMatrix[ind[1][i],ind[0][i]] = sim 
        identityMatrix[ind[0][i],ind[1][i]] = ide 
        identityMatrix[ind[1][i],ind[0][i]] = ide 
        scoreMatrix[ind[0][i],ind[1][i]] = sco
        scoreMatrix[ind[1][i],ind[0][i]] = sco
    return similarityMatrix, scoreMatrix, identityMatrix


def squareDistanceMatrix(seq1, seq2, n=6):
    x = len(seq1)
    y = len(seq2)
    similarityMatrix = np.zeros([x, y])
    identityMatrix = np.zeros([x, y])
    scoreMatrix = np.zeros([x, y])
    ind = np.indices([x,y])
    z = len(ind[0].flatten())
    ind = zip(ind[0].flatten(), ind[1].flatten(), range(z))
    ppservers = ()
    job_server = pp.Server(n, ppservers = ppservers)
    jobs = [job_server.submit(align, (seq1[i[0]], seq2[i[1]], i[2]), (), ('Bio.Emboss.Applications', 'os', 're')) for i in ind]
    for i, j, k in ind:
        aln = str(jobs[k]())
        sim = similarity(aln)
        ide = identity(aln)
        sco = score(aln)
        similarityMatrix[i,j] = sim 
        #similarityMatrix[ind[i][1],ind[i][0]] = sim 
        identityMatrix[i,j] = ide 
        #identityMatrix[ind[i][1],ind[i][0]] = ide 
        scoreMatrix[i,j] = sco
        #scoreMatrix[ind[i][1],ind[i][0]] = sco
    return similarityMatrix, scoreMatrix, identityMatrix

def concat(orgs, fastaFN):
    orgs = [i for i in orgs.values() if i['CCTN'] in range(1,9)]
    idMap = {}
    for org in orgs:
        name = org['ORGANISM NAME']
        if name not in idMap:
            idMap[name] = []
        idMap[name].append(org)
    out = open(fastaFN, 'w')
    for name in idMap:
        if set(range(1,9)).issubset(set([i['CCTN'] for i in idMap[name]])):
            cc = ''
            for n in range(1,9):
                curr = {'CCTN':0}
                o = iter(idMap[name])
                while curr['CCTN'] != n:
                    curr = o.next()
                cc = cc + curr['SEQUENCE']
            out.write('>%s\n%s\n' %(name, cc))
    out.close()

def fullOrgs(orgs):
    db = list(set([(i['GENUS'],i['SPECIES'],i['STRAIN']) for i in orgs.values()]))
    full = []
    for gss in db:
        ccts = [i for i in orgs.values() if (i['GENUS'],i['SPECIES'],i['STRAIN']) == gss]
        if set(range(1,9)).issubset(set([i['CCTN'] for i in ccts])):
            full.append([])
            for i in range(1,9):
                o = iter(ccts)
                n = o.next()
                while n['CCTN'] != i:
                    n=o.next()
                full[-1].append(n)
    return full

def getChains(pdbFN):
    lines = open(pdbFN, 'r').readlines()
    lines = [i for i in lines if i[:3] == 'ATO']
    chains = {}
    for line in lines:
        chain = line[21]
        if chain not in chains:
            chains[chain] = []
        chains[chain].append(line)
    return chains

def getSeq(lines):
    length = max([int(i[22:26]) for i in lines]) 
    seq = ['-' for i in range(length)]
    for line in lines:
        resNum = int(line[22:26]) - 1
        resName = line[17:20].upper()
        if resName in changeToOneLetter:
            seq[resNum] = changeToOneLetter[resName]
    return ''.join(seq).replace('-', '')

def rechain(pdbFN, outFN, cctFN = '.tmp.ccts'):
    writeCCTFile(cctFN)
    chains = getChains(pdbFN)
    out = open(outFN, 'w')
    ccts = {}
    for chain in chains:
        seq = getSeq(chains[chain])
        cctNumber = str(cctN(seq, cctFN, 1))
        ccts[cctNumber] = []
        for line in chains[chain]:
            line = line[:21] + str(cctNumber) + line[22:]
            ccts[cctNumber].append(line)
    out = open(outFN, 'w')
    for i in [str(j) for j in range(1,9)]:
        for line in ccts[i]:
            out.write(line)
    out.close()
    os.remove(cctFN)

def renumber(pdbFN, outFN):
    lines = [i for i in open(pdbFN, 'r').readlines() if i[:3] == 'ATO']
    out = open(outFN, 'w')
    curr = 0
    resnum = 1
    for line in lines:
        lnum = int(line[22:26])
        if lnum != curr:
            curr = lnum
            resnum += 1
        out.write(line[:21] + 'A' + string.rjust(str(resnum), 4) + line[26:])

def alignmentToStructure(pdbFN):
    seq = getSeq(open(pdbFN, 'r').readlines())
    cctNum = cctN(seq)
    aln = align(ccts[str(cctNum)], seq).split('\n')
    aln = [i for i in aln if i[:3] == 'seq']
    s1 = ''
    s2 = ''
    for i in  [i for i in aln if i[:4] == 'seq1']:
        s1 = s1 + re.sub(r'[^-ACDEFGHIKLMNPQRSTVWY]', '', i)
    for i in  [i for i in aln if i[:4] == 'seq2']:
        s2 = s2 + re.sub(r'[^-ACDEFGHIKLMNPQRSTVWY]', '', i)
    print s1
    print s2
    x = int(aln[0].split()[1])
    ats = [None]
    for i1,i2 in zip(s1, s2):
        if i2 != '-':
            ats.append(x)
        if i1 != '-':
            x += 1
    return ats

def renumberChains(pdbFN, outFN = None):
    if outFN == None:
        outFN = pdbFN
    lines = open(pdbFN).readlines()
    newLines = []
    currentChain = 'A'
    currentResNum = 0
    for line in lines:
        if line[:3] == 'ATO':
            resNum = int(line[22:26])
            if resNum < currentResNum:
                currentChain = chr(ord(currentChain) + 1)
            newLines.append(line[:21] + currentChain + line[22:])
            currentResNum = resNum
        else:
            newLines.append(line)
    out = open(outFN, 'w')
    for line in newLines:
        out.write(line)
    out.close()



    
