from tornado import ioloop,web,template
from random import randint
import queueing,redis,os.path

result_persistence = 60*60*24 #How long should results persist in the redis db in seconds
numdigits          = 4 #Minimum number of digits for the result identifier
max_blasthits      = 1000 #Maximum number of blast hits to ask for
blast_hit_thresh   = 50 #Minimum number of blast hits for continuing analysis

loader = template.Loader("templates")
r = redis.Redis(host='localhost', port=6379, db=0)

class MainHandler(web.RequestHandler):
    def get(self):
        self.write(loader.load(r"frontpage.html").generate())

class blastHandler(web.RequestHandler):
    def post(self):
        seed_seq = self.get_argument(r"seed_seq")

class MSAHandler(web.RequestHandler):
    def post(self):
        msa_in,x = None,None
        try:
            msa_in = self.get_argument(r"seed_text")
            x = queueing.msaObj(msa_in)
        except:
            msa_in = self.request.files['msa_file'][0]['body']
            x = queueing.msaObj(msa_in)

        #Single seed sequence
        if x.sane and x.seqs is None:
            self.write(loader.load("progress.html").generate(message="Input appears to be a seed sequence. "))
            self.write("Interfacing with NCBI servers to generate hits ...")
            self.flush()
            try:
                x.blast(max_seqs = max_blasthits)
            except:
                self.write("Error contacting NCBI servers. Please try again later.")
            if isinstance(x.seqs, list):
                numseqs = len(x.seqs)
                if numseqs > blast_hit_thresh-1:
                    self.write("Blast returned %s sequences. Starting <a href='http://www.clustal.org/omega/'> Clustal Omega</a> ..." %numseqs)
                    x.clustal()
                    if x.msa is not None:
                        self.write("Clustal alignment completed. Running MISC ...")
                        x.infoDistance(zerocase=1.)
                        rid = get_fresh_rid()
                        r.setex(rid, x.serialize(), result_persistence)
                        self.write(loader.load("button.html").generate(rid=rid))
                    else:
                        self.write("Clustal alignment failed. Please try again later ...")
            else:
                self.write("Blast returned too few sequences (%s) for analysis. Try inputing a custom multiple sequence alignment." %numseqs)

        #MSA
        elif x.sane and len(x.seqs) > 50:
            self.write(loader.load("progress.html").generate(message="Input appears to be a sane MSA with %s sequences." %len(x.seqs)))
            self.write("Running MISC ...")
            self.flush()
            x.infoDistance(zerocase=1.)
            rid = get_fresh_rid()
            r.setex(rid, x.serialize(), result_persistence)
            self.write(loader.load("button.html").generate(rid=rid))

        #Bad Times
        elif x.sane and len(x.seqs) < 50:
            self.write('Input appears to be a sane MSA. However, there are less than 50 sequences. Aborting analysis ...<br><a href="/">Return to top</a>')
        else:
            self.write('Your input was bad and you should feel bad.<br><a href="/">Return to top</a>')
        self.finish()

class ResultHandler(web.RequestHandler):
    def get(self):
        self.write(loader.load("resultform.html").generate(message="Retrieve the results for a Result ID"))
    def post(self):
        rid = self.get_argument(r"rid")
        result = r.get(rid)
        if result is None:
            self.write(loader.load("resultform.html").generate(message="The entered result ID is invalid or expired"))
        else:
            self.write(loader.load("result_viewer.html").generate(json=result))
            #self.write(loader.load("result_viewer.html").generate(json=mrebjson))
        self.finish()

class JSONServer(web.RequestHandler):
    def get(self):
        rid = self.get_argument(r"rid")
        result = r.get(rid)
        if result is None:
            raise web.HTTPError(400)
        else:
            self.write(result)

def get_fresh_rid():
    rid = str(randint(0, 10**(numdigits-1))).zfill(numdigits)
    while r.get(rid) is not None:
        rid = rid + str(randint(10))
    return rid

static_path = os.path.join(os.path.dirname(__file__), "static")
jsmol_path    = os.path.join(os.path.dirname(__file__), "static/js/jsmol/")
application = web.Application([
    (r"/", MainHandler),
    (r"/msa_analysis/", MSAHandler),
    (r"/result_viewer/", ResultHandler),
    (r"/json/", JSONServer),
    (r"/static/(.*)", web.StaticFileHandler, {'path': static_path}),
    (r"/result_viewer/(.*)", web.StaticFileHandler, {'path': jsmol_path}),
])

if __name__ == "__main__":
    application.listen(5000)
    ioloop.IOLoop.instance().start()

