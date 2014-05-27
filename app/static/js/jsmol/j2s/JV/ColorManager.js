Clazz.declarePackage ("JV");
Clazz.load (["JW.ColorEncoder"], "JV.ColorManager", ["java.lang.Float", "JU.AU", "J.constant.EnumPalette", "JW.C", "$.Elements", "$.Logger", "JV.JC"], function () {
c$ = Clazz.decorateAsClass (function () {
this.propertyColorEncoder = null;
this.viewer = null;
this.g3d = null;
this.argbsCpk = null;
this.altArgbsCpk = null;
this.colorData = null;
this.isDefaultColorRasmol = false;
this.colixRubberband = 22;
this.colixBackgroundContrast = 0;
Clazz.instantialize (this, arguments);
}, JV, "ColorManager");
Clazz.prepareFields (c$, function () {
this.propertyColorEncoder =  new JW.ColorEncoder (null);
});
Clazz.makeConstructor (c$, 
function (viewer, gdata) {
this.viewer = viewer;
this.g3d = gdata;
this.argbsCpk = J.constant.EnumPalette.argbsCpk;
this.altArgbsCpk = JU.AU.arrayCopyRangeI (JV.JC.altArgbsCpk, 0, -1);
}, "JV.Viewer,JW.GData");
$_M(c$, "clear", 
function () {
});
$_M(c$, "getDefaultColorRasmol", 
function () {
return this.isDefaultColorRasmol;
});
$_M(c$, "resetElementColors", 
function () {
this.setDefaultColors (false);
});
$_M(c$, "setDefaultColors", 
function (isRasmol) {
if (isRasmol) {
this.isDefaultColorRasmol = true;
this.argbsCpk = JU.AU.arrayCopyI (JW.ColorEncoder.getRasmolScale (), -1);
} else {
this.isDefaultColorRasmol = false;
this.argbsCpk = J.constant.EnumPalette.argbsCpk;
}this.altArgbsCpk = JU.AU.arrayCopyRangeI (JV.JC.altArgbsCpk, 0, -1);
this.propertyColorEncoder.createColorScheme ((isRasmol ? "Rasmol=" : "Jmol="), true, true);
for (var i = J.constant.EnumPalette.argbsCpk.length; --i >= 0; ) this.g3d.changeColixArgb (i, this.argbsCpk[i]);

for (var i = JV.JC.altArgbsCpk.length; --i >= 0; ) this.g3d.changeColixArgb (JW.Elements.elementNumberMax + i, this.altArgbsCpk[i]);

}, "~B");
$_M(c$, "setRubberbandArgb", 
function (argb) {
this.colixRubberband = (argb == 0 ? 0 : JW.C.getColix (argb));
}, "~N");
$_M(c$, "setColixBackgroundContrast", 
function (argb) {
this.colixBackgroundContrast = JW.C.getBgContrast (argb);
}, "~N");
$_M(c$, "getColixBondPalette", 
function (bond, pid) {
var argb = 0;
switch (pid) {
case 19:
return this.propertyColorEncoder.getColorIndexFromPalette (bond.getEnergy (), -2.5, -0.5, 7, false);
}
return (argb == 0 ? 10 : JW.C.getColix (argb));
}, "JM.Bond,~N");
$_M(c$, "getColixAtomPalette", 
function (atom, pid) {
var argb = 0;
var index;
var id;
var modelSet;
var modelIndex;
var lo;
var hi;
switch (pid) {
case 84:
return (this.colorData == null || atom.index >= this.colorData.length ? 12 : this.getColixForPropertyValue (this.colorData[atom.index]));
case 0:
case 1:
id = atom.getAtomicAndIsotopeNumber ();
if (id < JW.Elements.elementNumberMax) return this.g3d.getChangeableColix (id, this.argbsCpk[id]);
var id0 = id;
id = JW.Elements.altElementIndexFromNumber (id);
if (id > 0) return this.g3d.getChangeableColix (JW.Elements.elementNumberMax + id, this.altArgbsCpk[id]);
id = JW.Elements.getElementNumber (id0);
return this.g3d.getChangeableColix (id, this.argbsCpk[id]);
case 2:
index = JW.ColorEncoder.quantize (atom.getPartialCharge (), -1, 1, JV.JC.PARTIAL_CHARGE_RANGE_SIZE);
return this.g3d.getChangeableColix (JV.JC.PARTIAL_CHARGE_COLIX_RED + index, JV.JC.argbsRwbScale[index]);
case 3:
index = atom.getFormalCharge () - -4;
return this.g3d.getChangeableColix (JV.JC.FORMAL_CHARGE_COLIX_RED + index, JV.JC.argbsFormalCharge[index]);
case 68:
case 5:
if (pid == 68) {
modelSet = this.viewer.getModelSet ();
lo = modelSet.getBfactor100Lo ();
hi = modelSet.getBfactor100Hi ();
} else {
lo = 0;
hi = 10000;
}return this.propertyColorEncoder.getColorIndexFromPalette (atom.getBfactor100 (), lo, hi, 7, false);
case 86:
return this.propertyColorEncoder.getColorIndexFromPalette (atom.getGroupParameter (1112539150), -1, 1, 7, false);
case 70:
hi = this.viewer.getSurfaceDistanceMax ();
return this.propertyColorEncoder.getColorIndexFromPalette (atom.getSurfaceDistance100 (), 0, hi, 7, false);
case 8:
return this.propertyColorEncoder.getColorIndexFromPalette (atom.getGroupID (), 0, 0, 5, false);
case 9:
return this.propertyColorEncoder.getColorIndexFromPalette (atom.getGroupID (), 0, 0, 4, false);
case 75:
return this.propertyColorEncoder.getColorIndexFromPalette (atom.getSelectedGroupIndexWithinChain (), 0, atom.getSelectedGroupCountWithinChain () - 1, 1, false);
case 87:
var m = this.viewer.getModelSet ().models[atom.modelIndex];
return this.propertyColorEncoder.getColorIndexFromPalette (atom.getPolymerIndexInModel (), 0, m.getBioPolymerCount () - 1, 1, false);
case 76:
return this.propertyColorEncoder.getColorIndexFromPalette (atom.getSelectedMonomerIndexWithinPolymer (), 0, atom.getSelectedMonomerCountWithinPolymer () - 1, 1, false);
case 77:
modelSet = this.viewer.getModelSet ();
return this.propertyColorEncoder.getColorIndexFromPalette (modelSet.getMoleculeIndex (atom.index, true), 0, modelSet.getMoleculeCountInModel (atom.getModelIndex ()) - 1, 0, false);
case 14:
modelSet = this.viewer.getModelSet ();
modelIndex = atom.getModelIndex ();
return this.propertyColorEncoder.getColorIndexFromPalette (modelSet.getAltLocIndexInModel (modelIndex, atom.getAlternateLocationID ()), 0, modelSet.getAltLocCountInModel (modelIndex), 0, false);
case 15:
modelSet = this.viewer.getModelSet ();
modelIndex = atom.getModelIndex ();
return this.propertyColorEncoder.getColorIndexFromPalette (modelSet.getInsertionCodeIndexInModel (modelIndex, atom.getInsertionCode ()), 0, modelSet.getInsertionCountInModel (modelIndex), 0, false);
case 16:
id = atom.getAtomicAndIsotopeNumber ();
argb = this.getJmolOrRasmolArgb (id, 1073741991);
break;
case 17:
id = atom.getAtomicAndIsotopeNumber ();
argb = this.getJmolOrRasmolArgb (id, 1073742116);
break;
case 7:
argb = atom.getProteinStructureSubType ().getColor ();
break;
case 10:
var chain = atom.getChainID ();
chain = ((chain < 0 ? 0 : chain >= 256 ? chain - 256 : chain) & 0x1F) % JV.JC.argbsChainAtom.length;
argb = (atom.isHetero () ? JV.JC.argbsChainHetero : JV.JC.argbsChainAtom)[chain];
break;
}
return (argb == 0 ? 22 : JW.C.getColix (argb));
}, "JM.Atom,~N");
$_M(c$, "getJmolOrRasmolArgb", 
($fz = function (id, argb) {
switch (argb) {
case 1073741991:
if (id >= JW.Elements.elementNumberMax) break;
return this.propertyColorEncoder.getArgbFromPalette (id, 0, 0, 2);
case 1073742116:
if (id >= JW.Elements.elementNumberMax) break;
return this.propertyColorEncoder.getArgbFromPalette (id, 0, 0, 3);
default:
return argb;
}
return JV.JC.altArgbsCpk[JW.Elements.altElementIndexFromNumber (id)];
}, $fz.isPrivate = true, $fz), "~N,~N");
$_M(c$, "setElementArgb", 
function (id, argb) {
if (argb == 1073741991 && this.argbsCpk === J.constant.EnumPalette.argbsCpk) return;
argb = this.getJmolOrRasmolArgb (id, argb);
if (this.argbsCpk === J.constant.EnumPalette.argbsCpk) {
this.argbsCpk = JU.AU.arrayCopyRangeI (J.constant.EnumPalette.argbsCpk, 0, -1);
this.altArgbsCpk = JU.AU.arrayCopyRangeI (JV.JC.altArgbsCpk, 0, -1);
}if (id < JW.Elements.elementNumberMax) {
this.argbsCpk[id] = argb;
this.g3d.changeColixArgb (id, argb);
return;
}id = JW.Elements.altElementIndexFromNumber (id);
this.altArgbsCpk[id] = argb;
this.g3d.changeColixArgb (JW.Elements.elementNumberMax + id, argb);
}, "~N,~N");
$_M(c$, "getPropertyColorRange", 
function () {
if (this.propertyColorEncoder.isReversed) return [this.propertyColorEncoder.hi, this.propertyColorEncoder.lo];
return [this.propertyColorEncoder.lo, this.propertyColorEncoder.hi];
});
$_M(c$, "setPropertyColorRangeData", 
function (data, bs, colorScheme) {
this.colorData = data;
this.propertyColorEncoder.currentPalette = this.propertyColorEncoder.createColorScheme (colorScheme, true, false);
this.propertyColorEncoder.hi = -3.4028235E38;
this.propertyColorEncoder.lo = 3.4028235E38;
if (data == null) return;
var isAll = (bs == null);
var d;
var i0 = (isAll ? data.length - 1 : bs.nextSetBit (0));
for (var i = i0; i >= 0; i = (isAll ? i - 1 : bs.nextSetBit (i + 1))) {
if (Float.isNaN (d = data[i])) continue;
this.propertyColorEncoder.hi = Math.max (this.propertyColorEncoder.hi, d);
this.propertyColorEncoder.lo = Math.min (this.propertyColorEncoder.lo, d);
}
this.setPropertyColorRange (this.propertyColorEncoder.lo, this.propertyColorEncoder.hi);
}, "~A,JU.BS,~S");
$_M(c$, "setPropertyColorRange", 
function (min, max) {
this.propertyColorEncoder.setRange (min, max, min > max);
if (JW.Logger.debugging) JW.Logger.debug ("ColorManager: color \"" + this.propertyColorEncoder.getCurrentColorSchemeName () + "\" range " + min + " " + max);
}, "~N,~N");
$_M(c$, "setPropertyColorScheme", 
function (colorScheme, isTranslucent, isOverloaded) {
var isReset = (colorScheme.length == 0);
if (isReset) colorScheme = "=";
var range = this.getPropertyColorRange ();
this.propertyColorEncoder.currentPalette = this.propertyColorEncoder.createColorScheme (colorScheme, true, isOverloaded);
if (!isReset) this.setPropertyColorRange (range[0], range[1]);
this.propertyColorEncoder.isTranslucent = isTranslucent;
}, "~S,~B,~B");
$_M(c$, "setUserScale", 
function (scale) {
this.propertyColorEncoder.setUserScale (scale);
}, "~A");
$_M(c$, "getColorSchemeList", 
function (colorScheme) {
var iPt = (colorScheme == null || colorScheme.length == 0) ? this.propertyColorEncoder.currentPalette : this.propertyColorEncoder.createColorScheme (colorScheme, true, false);
return JW.ColorEncoder.getColorSchemeList (this.propertyColorEncoder.getColorSchemeArray (iPt));
}, "~S");
$_M(c$, "getColixForPropertyValue", 
function (val) {
return this.propertyColorEncoder.getColorIndex (val);
}, "~N");
$_M(c$, "getColorEncoder", 
function (colorScheme) {
if (colorScheme == null || colorScheme.length == 0) return this.propertyColorEncoder;
var ce =  new JW.ColorEncoder (this.propertyColorEncoder);
ce.currentPalette = ce.createColorScheme (colorScheme, false, true);
return (ce.currentPalette == 2147483647 ? null : ce);
}, "~S");
});
