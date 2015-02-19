import numpy as np
import networkx as nx

def write_vis_file(G, ats, outFN):
    nodes = [ats[i] for i in G.nodes()]
    with open(outFN, 'w') as out:
        out.write('from pymol import cmd\n')
        out.write('cmd.delete("nodes")\n')
        out.write('cmd.delete("dist*")\n')
        out.write('cmd.select("nodes", "resi {}")\n'.format(nodes[0]))
        for i in nodes:
            out.write('cmd.select("nodes", "resi {} or nodes")\n'.format(i))
        for i,j in G.edges():
            out.write('cmd.distance("name ca and chain a and resi {}", "name ca and chain a and resi {}")\n'.format(ats[i], ats[j]))

def graph_from_np(mat, cutoff):
    thresholded = np.zeros(np.shape(mat))
    thresholded[mat > cutoff] = mat[mat > cutoff]
    thresholded[np.diag_indices(np.shape(thresholded)[0])] = 0.
    G = nx.from_numpy_matrix(thresholded)
    for node in G.nodes():
        if len(G[node]) == 0:
            G.remove_node(node)
    return G

def nn_graph_from_np(mat, num_neighbors):
    L = np.shape(mat)[1]
    mat = mat.copy() #safety
    mat[np.diag_indices(L)] = 0.
    thresholded = np.zeros(np.shape(mat))
    for i in range(L):
        idx = np.argsort(mat[i])[-num_neighbors:]
        thresholded[idx] = mat[idx]
    G = nx.from_numpy_matrix(thresholded)
    for node in G.nodes():
        if len(G[node]) == 0:
            G.remove_node(node)
    return G

def write_vis_file_from_np(mat, ats, cutoff, outFN):
    G = graph_from_np(mat, cutoff)
    nodes = [ats[i] for i in G.nodes()]
    with open(outFN, 'w') as out:
        out.write('from pymol import cmd\n')
        out.write('cmd.delete("nodes")\n')
        out.write('cmd.delete("dist*")\n')
        
        out.write('cmd.select("nodes", "resi {}")\n'.format(nodes[0]))
        for i in nodes:
            out.write('cmd.select("nodes", "resi {} or nodes")\n'.format(i))
        for i,j in G.edges():
            out.write('cmd.distance("name ca and chain a and resi {}", "name ca and chain a and resi {}")\n'.format(ats[i], ats[j]))
