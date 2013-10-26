###############################################################################
# The setup script for pysca. Use as you would expect (ie python setup.py)    #
###############################################################################

from ftplib import FTP


#Download the nr database from ncbi
def downloadNR(dbFilename):
    ftp = FTP('ftp.ncbi.nlm.nih.gov')
    ftp.login()
    ftp.cwd('blast/db/FASTA')
    ftp.retrbinary('RETR nr.gz', open(dbFilename, 'wb').write)


if __name__=="__main__":
    downloadNR('nr.gz')
