Clazz.declarePackage ("JM");
Clazz.load (["JW.Edge", "JV.JC"], "JM.Bond", ["JW.C"], function () {
c$ = Clazz.decorateAsClass (function () {
this.atom1 = null;
this.atom2 = null;
this.mad = 0;
this.colix = 0;
this.shapeVisibilityFlags = 0;
Clazz.instantialize (this, arguments);
}, JM, "Bond", JW.Edge);
Clazz.makeConstructor (c$, 
function (atom1, atom2, order, mad, colix) {
Clazz.superConstructor (this, JM.Bond, []);
this.atom1 = atom1;
this.atom2 = atom2;
this.colix = colix;
this.setOrder (order);
this.setMad (mad);
}, "JM.Atom,JM.Atom,~N,~N,~N");
$_M(c$, "setMad", 
function (mad) {
this.mad = mad;
this.setShapeVisibility (mad != 0);
}, "~N");
$_M(c$, "setShapeVisibilityFlags", 
function (shapeVisibilityFlags) {
this.shapeVisibilityFlags = shapeVisibilityFlags;
}, "~N");
$_M(c$, "getShapeVisibilityFlags", 
function () {
return this.shapeVisibilityFlags;
});
$_M(c$, "setShapeVisibility", 
function (isVisible) {
var wasVisible = ((this.shapeVisibilityFlags & JM.Bond.myVisibilityFlag) != 0);
if (wasVisible == isVisible) return;
this.atom1.addDisplayedBond (JM.Bond.myVisibilityFlag, isVisible);
this.atom2.addDisplayedBond (JM.Bond.myVisibilityFlag, isVisible);
if (isVisible) this.shapeVisibilityFlags |= JM.Bond.myVisibilityFlag;
 else this.shapeVisibilityFlags &= ~JM.Bond.myVisibilityFlag;
}, "~B");
$_M(c$, "getIdentity", 
function () {
return (this.index + 1) + " " + this.getOrderNumberAsString () + " " + this.atom1.getInfo () + " -- " + this.atom2.getInfo () + " " + this.atom1.distance (this.atom2);
});
$_V(c$, "isCovalent", 
function () {
return (this.order & 1023) != 0;
});
$_V(c$, "isHydrogen", 
function () {
return JM.Bond.isOrderH (this.order);
});
c$.isOrderH = $_M(c$, "isOrderH", 
function (order) {
return (order & 30720) != 0;
}, "~N");
$_M(c$, "isStereo", 
function () {
return (this.order & 1024) != 0;
});
$_M(c$, "isPartial", 
function () {
return (this.order & 224) != 0;
});
$_M(c$, "isAromatic", 
function () {
return (this.order & 512) != 0;
});
$_M(c$, "isPymolStyle", 
function () {
return (this.order & 98304) == 98304;
});
$_M(c$, "setPaletteID", 
function (pid) {
}, "~N");
$_M(c$, "getEnergy", 
function () {
return 0;
});
$_M(c$, "getValence", 
function () {
return (!this.isCovalent () ? 0 : this.isPartial () || this.is (515) ? 1 : this.order & 7);
});
$_M(c$, "deleteAtomReferences", 
function () {
if (this.atom1 != null) this.atom1.deleteBond (this);
if (this.atom2 != null) this.atom2.deleteBond (this);
this.atom1 = this.atom2 = null;
});
$_M(c$, "setColix", 
function (colix) {
this.colix = colix;
}, "~N");
$_M(c$, "setTranslucent", 
function (isTranslucent, translucentLevel) {
this.colix = JW.C.getColixTranslucent3 (this.colix, isTranslucent, translucentLevel);
}, "~B,~N");
$_M(c$, "setOrder", 
function (order) {
if (this.atom1.getElementNumber () == 16 && this.atom2.getElementNumber () == 16) order |= 256;
if (order == 512) order = 515;
this.order = order | (this.order & 131072);
}, "~N");
$_M(c$, "getAtom1", 
function () {
return this.atom1;
});
$_M(c$, "getAtom2", 
function () {
return this.atom2;
});
$_V(c$, "getAtomIndex1", 
function () {
return this.atom1.index;
});
$_V(c$, "getAtomIndex2", 
function () {
return this.atom2.index;
});
$_M(c$, "getRadius", 
function () {
return this.mad / 2000;
});
$_V(c$, "getCovalentOrder", 
function () {
return JW.Edge.getCovalentBondOrder (this.order);
});
$_M(c$, "getOrderName", 
function () {
return JW.Edge.getBondOrderNameFromOrder (this.order);
});
$_M(c$, "getOrderNumberAsString", 
function () {
return JW.Edge.getBondOrderNumberFromOrder (this.order);
});
$_M(c$, "getColix1", 
function () {
return JW.C.getColixInherited (this.colix, this.atom1.colixAtom);
});
$_M(c$, "getColix2", 
function () {
return JW.C.getColixInherited (this.colix, this.atom2.colixAtom);
});
$_M(c$, "getOtherAtom", 
function (thisAtom) {
return (this.atom1 === thisAtom ? this.atom2 : this.atom2 === thisAtom ? this.atom1 : null);
}, "JM.Atom");
$_M(c$, "setIndex", 
function (i) {
this.index = i;
}, "~N");
$_M(c$, "is", 
function (bondType) {
return (this.order & -131073) == bondType;
}, "~N");
$_V(c$, "getOtherAtomNode", 
function (thisAtom) {
return (this.atom1 === thisAtom ? this.atom2 : this.atom2 === thisAtom ? this.atom1 : null);
}, "JW.Node");
$_V(c$, "toString", 
function () {
return this.atom1 + " - " + this.atom2;
});
c$.myVisibilityFlag = c$.prototype.myVisibilityFlag = JV.JC.getShapeVisibilityFlag (1);
});
