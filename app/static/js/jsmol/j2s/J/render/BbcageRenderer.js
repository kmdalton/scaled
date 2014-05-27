Clazz.declarePackage ("J.render");
Clazz.load (["J.render.CageRenderer"], "J.render.BbcageRenderer", ["JW.BoxInfo"], function () {
c$ = Clazz.declareType (J.render, "BbcageRenderer", J.render.CageRenderer);
$_V(c$, "initRenderer", 
function () {
this.tickEdges = JW.BoxInfo.bbcageTickEdges;
});
$_V(c$, "render", 
function () {
var bbox = this.shape;
if (bbox.isVisible && (this.isExport || this.g3d.checkTranslucent (false)) && !this.viewer.isJmolDataFrame ()) {
this.colix = this.viewer.getObjectColix (4);
this.renderCage (bbox.mad, this.modelSet.getBboxVertices (), null, 0, 0xFF, 0xFF, 1);
}return false;
});
});
