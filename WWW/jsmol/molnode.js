//The D3 stuff lives here

var width = 490,
    height = 490;

var fill = d3.scale.category10();

var root = [];

var nodes, links, node, link;
var neighbors = new Array();

var force = d3.layout.force()
    .charge(-20)
    .linkDistance(20)
    .size([width, height])
    .on("tick",tick);


var svg = d3.select("#forcegraph").append("svg")
    .attr("width", width)
    .attr("height", height);


var oldnodes = "0"

function loadforcelayout(filename) {
    
    d3.json(filename, function(error, json) {
	
	root = json;
	for (var i = 0; i < root.nodes.length; i++) {
	    root.nodes[i].value = i;
	}
	
	nodes = root.nodes;
	links = root.links;
	
	force.nodes(nodes).links(links).start();
	
	
	updateNow(0.5);
	
    });
}

function loadforcelayout2() {

    var fastaseq = document.getElementById("loadseq").value;
    
    alert("This is going to take a while. Click OK and wait.");

    $.post("http://maripaludis.stanford.edu:8000/cgi-bin/autoAlign.py", { seq: fastaseq })
	.done(function( data ) {
	    root = jQuery.parseJSON( data );
	    alert("Done! Now load your PDB!");
	})
	.fail(function() { 
	    alert( "JSON call failed...");
	})
	.always(function() {
	    alert( "finished" );
	});
    
    root = json;
    for (var i = 0; i < root.nodes.length; i++) {
	root.nodes[i].value = i;
    }
    
    nodes = root.nodes;
    links = root.links;
    
    force.nodes(nodes).links(links).start();
    
    updateNow(0.5);
}

$(function() { 
    $("#slider").slider({
	handle: $('.knob'),
	animate:'true',
	min:30,
	max:100,
	startValue: 50,
	value: 50,
	stop: function( ev, ui ) {

	    updateNow(ui.value/100);
	}});
 });

function startforce() {
    force.resume();
}

function tocircle() {
    
    var r = 200;
    var numnode = root.nodes.length;
    nodes.forEach(function(o, i) {
	o.x = 1.5*r+r*Math.cos(o.value/numnode*2*Math.PI);
	o.y = 1.5*r+r*Math.sin(o.value/numnode*2*Math.PI);
    });

    force.stop();

    node.attr("cx", function(d) { return d.x; })
	.attr("cy", function(d) { return d.y; });
    
    link.attr("x1", function(d) { return d.source.x; })
	.attr("y1", function(d) { return d.source.y; })
	.attr("x2", function(d) { return d.target.x; })
	.attr("y2", function(d) { return d.target.y; });
    
}

function nodeColor(nodeval_) {
    return "hsl(".concat(nodeval_).concat(", 100%, 50%)");
}

function updateNow(threshold) {
    var nodesToKeep = new Array();

    for (var i = 0; i < root.nodes.length; i++) {
	neighbors[root.nodes[i].value] = new Array();
    }

    for (var i = 0; i < root.nodes.length; i++) {
	nodesToKeep[i] = 0;
    }

    links = root.links.filter(function(d) {
	if (d.value >= threshold) {
	    nodesToKeep[d.target.value] = 1;
	    nodesToKeep[d.source.value] = 1;

	    neighbors[parseInt(d.source.value)].push(parseInt(d.target.value));
	    neighbors[parseInt(d.target.value)].push(parseInt(d.source.value));
	}

	return (d.value >= threshold);
    });

    nodes = force.nodes().filter(function(d) {
	tokeep = (nodesToKeep[d.value]);
	(nodesToKeep[d.value]) = 0;
	return tokeep

    });

    
    for (var i = 0; i < root.nodes.length; i++) {
	if (nodesToKeep[root.nodes[i].value]) {
	    nodes.push(root.nodes[i]);
	    nodesToKeep[root.nodes[i].value] = 0;
	}
    }


    // restart force
    force
	.nodes(nodes)
	.links(links)
	.start();

    link = svg.selectAll(".link").data(links);
    node = svg.selectAll(".node").data(nodes);

    link.enter().insert("line")
	.attr("class", "link");

    link.exit().remove();    
    node.exit().remove();

    
    node.enter().append("circle")
	.attr("class", "node")
        .attr("r", 5)
	.on("click", function (d) { 
        connected(parseInt(d.value)); 
    });

    node.attr("fill", function (d) { return nodeColor(d.value); })
}


function connected(dval) {
    var dvals = new Array();
    dvals = getChildren(dval,dvals);

    node.attr("fill", function(d) {
	return dvals.indexOf(parseInt(d.value))==-1 ?  nodeColor(d.value) : "black"; 
    });
    
    // fix thingy.
    var outputstring = "";

    Jmol.script(jmolApplet0,"select " + oldnodes + "; spacefill OFF;");


    for (var k = 0; k < dvals.length; k++) {
	outputstring = outputstring.concat(dvals[k]);
	if ((k+1) < dvals.length) {
		outputstring = outputstring.concat("|");
	}

    }
    Jmol.script(jmolApplet0,"select " + outputstring + "; spacefill ON;");
    oldnodes = outputstring;
    document.getElementById("resids").value = outputstring;
    
//    $("input#resids").val(dvals);
}

function getChildren(dval,dvals) {

    dvals.push(parseInt(dval));
    
    for (var i = 0; i<neighbors[dval].length; i++) {
	if (dvals.indexOf(neighbors[dval][i])==-1) {
	    dvals = getChildren(neighbors[dval][i],dvals);
	}
    }
    return dvals;
}

function tick(e) {
    
    node.attr("cx", function(d) { return d.x; })
	.attr("cy", function(d) { return d.y; });
    
    link.attr("x1", function(d) { return d.source.x; })
	.attr("y1", function(d) { return d.source.y; })
	.attr("x2", function(d) { return d.target.x; })
	.attr("y2", function(d) { return d.target.y; });
}
