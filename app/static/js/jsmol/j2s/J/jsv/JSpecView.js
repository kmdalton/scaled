Clazz.declarePackage ("J.jsv");
Clazz.load (["J.api.JmolJSpecView"], "J.jsv.JSpecView", ["java.util.Hashtable", "JU.BS", "$.List", "$.PT", "JW.Escape", "$.Logger", "JV.FileManager"], function () {
c$ = Clazz.decorateAsClass (function () {
this.viewer = null;
Clazz.instantialize (this, arguments);
}, J.jsv, "JSpecView", null, J.api.JmolJSpecView);
$_V(c$, "setViewer", 
function (viewer) {
this.viewer = viewer;
}, "JV.Viewer");
$_V(c$, "atomPicked", 
function (atomIndex) {
if (atomIndex < 0) return;
var peak = this.getPeakAtomRecord (atomIndex);
if (peak != null) this.sendJSpecView (peak + " src=\"JmolAtomSelect\"");
}, "~N");
$_M(c$, "getPeakAtomRecord", 
($fz = function (atomIndex) {
var atoms = this.viewer.modelSet.atoms;
var iModel = atoms[atomIndex].modelIndex;
var type = null;
switch (atoms[atomIndex].getElementNumber ()) {
case 1:
type = "1HNMR";
break;
case 6:
type = "13CNMR";
break;
default:
return null;
}
var peaks = this.viewer.getModelAuxiliaryInfoValue (iModel, "jdxAtomSelect_" + type);
if (peaks == null) return null;
this.viewer.modelSet.htPeaks =  new java.util.Hashtable ();
var htPeaks = this.viewer.modelSet.htPeaks;
for (var i = 0; i < peaks.size (); i++) {
var peak = peaks.get (i);
System.out.println ("Jmol JSpecView.java peak=" + peak);
var bsPeak = htPeaks.get (peak);
System.out.println ("Jmol JSpecView.java bspeak=" + bsPeak);
if (bsPeak == null) {
htPeaks.put (peak, bsPeak =  new JU.BS ());
var satoms = JU.PT.getQuotedAttribute (peak, "atoms");
var select = JU.PT.getQuotedAttribute (peak, "select");
System.out.println ("Jmol JSpecView.java satoms select " + satoms + " " + select);
var script = "";
if (satoms != null) script += "visible & (atomno=" + JU.PT.rep (satoms, ",", " or atomno=") + ")";
 else if (select != null) script += "visible & (" + select + ")";
System.out.println ("Jmol JSpecView.java script : " + script);
bsPeak.or (this.viewer.getAtomBitSet (script));
}System.out.println ("Jmol JSpecView bsPeak now : " + bsPeak + " " + atomIndex);
if (bsPeak.get (atomIndex)) return peak;
}
return null;
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "sendJSpecView", 
($fz = function (peak) {
var msg = JU.PT.getQuotedAttribute (peak, "title");
if (msg != null) this.viewer.scriptEcho (JW.Logger.debugging ? peak : msg);
peak = this.viewer.fullName + "JSpecView: " + peak;
JW.Logger.info ("Jmol.JSpecView.sendJSpecView Jmol>JSV " + peak);
this.viewer.statusManager.syncSend (peak, ">", 0);
}, $fz.isPrivate = true, $fz), "~S");
$_V(c$, "setModel", 
function (modelIndex) {
var syncMode = ("sync on".equals (this.viewer.modelSet.getModelSetAuxiliaryInfoValue ("jmolscript")) ? 1 : this.viewer.statusManager.getSyncMode ());
if (syncMode != 1) return;
var peak = this.viewer.getModelAuxiliaryInfoValue (modelIndex, "jdxModelSelect");
if (peak != null) this.sendJSpecView (peak + " src=\"Jmol\"");
}, "~N");
$_V(c$, "getBaseModelIndex", 
function (modelIndex) {
var baseModel = this.viewer.getModelAuxiliaryInfoValue (modelIndex, "jdxBaseModel");
if (baseModel != null) for (var i = this.viewer.getModelCount (); --i >= 0; ) if (baseModel.equals (this.viewer.getModelAuxiliaryInfoValue (i, "jdxModelID"))) return i;

return modelIndex;
}, "~N");
$_V(c$, "processSync", 
function (script, jsvMode) {
switch (jsvMode) {
default:
return null;
case 0:
this.viewer.statusManager.syncSend (this.viewer.fullName + "JSpecView" + script.substring (9), ">", 0);
return null;
case 7:
var list = JW.Escape.unescapeStringArray (script.substring (7));
var peaks =  new JU.List ();
for (var i = 0; i < list.length; i++) peaks.addLast (list[i]);

this.viewer.getModelSet ().setModelAuxiliaryInfo (this.viewer.getCurrentModelIndex (), "jdxAtomSelect_1HNMR", peaks);
return null;
case 14:
var filename = JU.PT.getQuotedAttribute (script, "file");
var isSimulation = filename.startsWith (JV.FileManager.SIMULATION_PROTOCOL);
var modelID = (isSimulation ? "molfile" : JU.PT.getQuotedAttribute (script, "model"));
filename = JU.PT.rep (filename, "#molfile", "");
var baseModel = JU.PT.getQuotedAttribute (script, "baseModel");
var atoms = JU.PT.getQuotedAttribute (script, "atoms");
var select = JU.PT.getQuotedAttribute (script, "select");
var script2 = JU.PT.getQuotedAttribute (script, "script");
var id = (modelID == null ? null : (filename == null ? "" : filename + "#") + modelID);
if ("".equals (baseModel)) id += ".baseModel";
var modelIndex = (id == null ? -3 : this.viewer.getModelIndexFromId (id));
if (modelIndex == -2) return null;
if (isSimulation) filename += "#molfile";
script = (modelIndex == -1 && filename != null ? script = "load " + JU.PT.esc (filename) : "");
if (id != null) script += ";model " + JU.PT.esc (id);
if (atoms != null) script += ";select visible & (@" + JU.PT.rep (atoms, ",", " or @") + ")";
 else if (select != null) script += ";select visible & (" + select + ")";
if (script2 != null) script += ";" + script2;
return script;
}
}, "~S,~N");
});
