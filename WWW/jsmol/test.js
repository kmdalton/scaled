//The D3 stuff lives here

var width = 960,
    height = 800;

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

d3.json("mreb.json", function(error, json) {

    root = json;
    for (var i = 0; i < root.nodes.length; i++) {
	root.nodes[i].value = i;
    }

    nodes = root.nodes;
    links = root.links;

    force.nodes(nodes).links(links).start();


    updateNow(0.5);

});


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

function nodeColor(nodeval) {
    return d3.hsl(nodeval/root.nodes.length*360,1,.5);
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

var dvals;
function connected(dval) {
    dvals = new Array();
    dvals = getChildren(dval,dvals);
    
    node.attr("fill", function(d) {
	return $.inArray(parseInt(d.value),dvals)==-1 ? nodeColor(d.value): "black"; 
    });

    $("input#resids").val(dvals);
}

function getChildren(dval,dvals) {
    
    dvals.push(dval);

    for (var i = 0; i<neighbors[dval].length; i++) {
	if ($.inArray(neighbors[dval][i],dvals)==-1) {
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


//The JSMol stuff lives here
$(document).ready(function() {

Info = {
	width: 500,
	height: 850,
	debug: false,
//	color: "0xC0C0C0",
	color: "white",
  disableJ2SLoadMonitor: true,
  disableInitialConsole: true,
	//addSelectionOptions: true,
	use: "HTML5",
	readyFunction: null,
	script: "load =3ruw;wireframe OFF;spacefill OFF;ribbons ON;"
}

Jmol.setDocument(0) // required for after-page-loading to avoid document.write()
Jmol.getApplet("jmolApplet0",Info)  

// app would be the first parameter of a Jmol.script command 
$("#jsmoldiv").html(Jmol.getAppletHtml(jmolApplet0))
});


function spaceFill (resi) {
    script = "select " + resi + "; spacefill ON;"
    Jmol.script(script);
}

function unSpaceFill (resi) {
    script = "select " + resi + "; spacefill OFF;"
    Jmol.script(script);
}


