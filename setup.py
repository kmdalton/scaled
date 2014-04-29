###############################################################################
# The setup script for pysca. Use as you would expect (ie python setup.py)    #
###############################################################################

from ftplib import FTP
from subprocess import call


#Download the nr database from ncbi
def downloadNR():
    """Download the nr database from ncbi in fasta format from their ftp server. Automatically decrompresses the archive and leaves it named 'nr'. Requires gunzip!"""
    ftp = FTP('ftp.ncbi.nlm.nih.gov')
    ftp.login()
    ftp.cwd('blast/db/FASTA')
    ftp.retrbinary('RETR nr.gz', open('tmp.gz', 'wb').write)
    call(['gunzip', 'nr.gz'])

def compileCLibs():
    """Compile the pysca C-libraries. Requires gcc. Must be called from the pysca root directory."""
    call(['gcc', '-std=c99', '-fPIC', '-shared', '-fopenmp', '-o', 'inf.so', 'inf.c'])
    call(['gcc', '-std=c99', '-fPIC', '-shared', '-fopenmp', '-o', 'inf_nogap.so', 'inf_nogap.c'])


if __name__=="__main__":
    compileCLibs()
    #downloadNR() -- comment this out for the disk space. TODO: argparse flag to activate this.
