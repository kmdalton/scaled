import numpy as np
import json

def jsonify(mtx,**kw):
    L = np.shape(mtx)[0]
    names = kw.get("names", [str(i) for i in range(1,1+L)])
    jsondict={"nodes":[], "links":[]}
    for i in range(L):
        newnode = { "name" : names[i],
                    "value": np.sum(mtx[i]) 
        }

        jsondict["nodes"].append(newnode)

        for j in range(L):
            if i>j:
                newlink = {
                    "source": i,
                    "target": j,
                    "value" : mtx[i,j]
                }
                jsondict["links"].append(newlink)


    return json.dumps(jsondict, indent=4, separators=(',', ': '))
