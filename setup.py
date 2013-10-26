###############################################################################
# The setup script for pysca. Use as you would expect (ie python setup.py)    #
###############################################################################

from ftplib import FTP
from subprocess import call


#Download the nr database from ncbi
def downloadNR(dbFilename):
    ftp = FTP('ftp.ncbi.nlm.nih.gov')
    ftp.login()
    ftp.cwd('blast/db/FASTA')
    ftp.retrbinary('RETR nr.gz', open(dbFilename, 'wb').write)

def compileCLibs():
    call(['gcc', '-std=c99', '-fPIC', '-shared', '-fopenmp', '-o', 'joint.so', 'joint.c'])
    call(['gcc', '-std=c99', '-fPIC', '-shared', '-fopenmp', '-o', 'pinf.so', 'pinf.c'])


if __name__=="__main__":
    compileCLibs()
    downloadNR('nr.gz')
