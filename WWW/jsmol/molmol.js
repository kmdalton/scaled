//The JSMol stuff lives here
function loadPDB(pdbcode) {

    Info = {
	width: 490,
	height: 490,
	debug: false,
	//color: "0xC0C0C0",
	color: "white",
	disableJ2SLoadMonitor: true,
	disableInitialConsole: true,
	//addSelectionOptions: true,
	use: "HTML5",
	readyFunction: null,
	script: "load =" + pdbcode + ";wireframe OFF;spacefill OFF;ribbons ON;"
    }
    
    Jmol.setDocument(0) // required for after-page-loading to avoid
    // document.write()
    Jmol.getApplet("jmolApplet0",Info)  
    
    // app would be the first parameter of a Jmol.script command 
    $("#jsmoldiv").html(Jmol.getAppletHtml(jmolApplet0))
}


function spaceFill (resi) {

    script = "select " + resi + "; spacefill ON;"
    Jmol.script(script);
}

function unSpaceFill (resi) {
    script = "select " + resi + "; spacefill OFF;"
    Jmol.script(script);
}

