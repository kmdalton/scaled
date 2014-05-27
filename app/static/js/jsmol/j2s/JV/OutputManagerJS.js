Clazz.declarePackage ("JV");
Clazz.load (["JV.OutputManager"], "JV.OutputManagerJS", ["JU.OC"], function () {
c$ = Clazz.declareType (JV, "OutputManagerJS", JV.OutputManager);
Clazz.makeConstructor (c$, 
function () {
Clazz.superConstructor (this, JV.OutputManagerJS, []);
});
$_V(c$, "getLogPath", 
function (fileName) {
return fileName;
}, "~S");
$_V(c$, "clipImageOrPasteText", 
function (text) {
return "Clipboard not available";
}, "~S");
$_V(c$, "getClipboardText", 
function () {
return "Clipboard not available";
});
$_V(c$, "openOutputChannel", 
function (privateKey, fileName, asWriter, asAppend) {
return ( new JU.OC ()).setParams (this.viewer.fileManager, fileName, asWriter, null);
}, "~N,~S,~B,~B");
$_V(c$, "createSceneSet", 
function (sceneFile, type, width, height) {
return "ERROR: Not Available";
}, "~S,~S,~N,~N");
});
