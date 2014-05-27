Clazz.declarePackage ("JV");
Clazz.load (["JV.JmolStateCreator", "java.util.Hashtable"], "JV.StateCreator", ["java.lang.Boolean", "$.Float", "java.util.Arrays", "$.Date", "javajs.awt.Font", "JU.BS", "$.P3", "$.PT", "$.SB", "$.V3", "J.constant.EnumAxesMode", "$.EnumPalette", "$.EnumStereoMode", "$.EnumStructure", "$.EnumVdw", "JM.Atom", "$.AtomCollection", "$.Bond", "$.BondSet", "J.shape.Shape", "JW.BSUtil", "$.C", "$.ColorEncoder", "$.Edge", "$.Escape", "$.Logger", "JV.GlobalSettings", "$.JC", "$.StateManager", "$.Viewer"], function () {
c$ = Clazz.decorateAsClass (function () {
this.viewer = null;
this.temp = null;
this.temp2 = null;
this.temp3 = null;
this.undoWorking = false;
Clazz.instantialize (this, arguments);
}, JV, "StateCreator", JV.JmolStateCreator);
Clazz.prepareFields (c$, function () {
this.temp =  new java.util.Hashtable ();
this.temp2 =  new java.util.Hashtable ();
this.temp3 =  new java.util.Hashtable ();
});
Clazz.makeConstructor (c$, 
function () {
Clazz.superConstructor (this, JV.StateCreator, []);
});
$_V(c$, "setViewer", 
function (viewer) {
this.viewer = viewer;
}, "JV.Viewer");
$_V(c$, "getStateScript", 
function (type, width, height) {
var isAll = (type == null || type.equalsIgnoreCase ("all"));
var s =  new JU.SB ();
var sfunc = (isAll ?  new JU.SB ().append ("function _setState() {\n") : null);
if (isAll) s.append ("# Jmol state version " + JV.Viewer.getJmolVersion () + ";\n");
if (this.viewer.isApplet () && isAll) {
JV.StateCreator.appendCmd (s, "# fullName = " + JU.PT.esc (this.viewer.fullName));
JV.StateCreator.appendCmd (s, "# documentBase = " + JU.PT.esc (JV.Viewer.appletDocumentBase));
JV.StateCreator.appendCmd (s, "# codeBase = " + JU.PT.esc (JV.Viewer.appletCodeBase));
s.append ("\n");
}var global = this.viewer.global;
if (isAll || type.equalsIgnoreCase ("windowState")) s.append (this.getWindowState (sfunc, width, height));
if (isAll || type.equalsIgnoreCase ("fileState")) s.append (this.getFileState (sfunc));
if (isAll || type.equalsIgnoreCase ("definedState")) s.append (this.getDefinedState (sfunc, true));
if (isAll || type.equalsIgnoreCase ("variableState")) s.append (this.getParameterState (global, sfunc));
if (isAll || type.equalsIgnoreCase ("dataState")) s.append (this.getDataState (sfunc));
if (isAll || type.equalsIgnoreCase ("modelState")) s.append (this.getModelState (sfunc, true, this.viewer.getBooleanProperty ("saveProteinStructureState")));
if (isAll || type.equalsIgnoreCase ("colorState")) s.append (this.getColorState (this.viewer.colorManager, sfunc));
if (isAll || type.equalsIgnoreCase ("frameState")) s.append (this.getAnimState (this.viewer.animationManager, sfunc));
if (isAll || type.equalsIgnoreCase ("perspectiveState")) s.append (this.getViewState (this.viewer.tm, sfunc));
if (isAll || type.equalsIgnoreCase ("selectionState")) s.append (this.getSelectionState (this.viewer.selectionManager, sfunc));
if (sfunc != null) {
JV.StateCreator.appendCmd (sfunc, "set refreshing true");
JV.StateCreator.appendCmd (sfunc, "set antialiasDisplay " + global.antialiasDisplay);
JV.StateCreator.appendCmd (sfunc, "set antialiasTranslucent " + global.antialiasTranslucent);
JV.StateCreator.appendCmd (sfunc, "set antialiasImages " + global.antialiasImages);
if (this.viewer.getSpinOn ()) JV.StateCreator.appendCmd (sfunc, "spin on");
sfunc.append ("}\n\n_setState;\n");
}if (isAll) s.appendSB (sfunc);
return s.toString ();
}, "~S,~N,~N");
$_M(c$, "getDataState", 
($fz = function (sfunc) {
var commands =  new JU.SB ();
var haveData = false;
var atomProps = this.getAtomicPropertyState (-1, null);
if (atomProps.length > 0) {
haveData = true;
commands.append (atomProps);
}if (this.viewer.userVdws != null) {
var info = this.viewer.getDefaultVdwNameOrData (0, J.constant.EnumVdw.USER, this.viewer.bsUserVdws);
if (info.length > 0) {
haveData = true;
commands.append (info);
}}if (this.viewer.nmrCalculation != null) haveData = new Boolean (haveData | this.viewer.nmrCalculation.getState (commands)).valueOf ();
if (this.viewer.dataManager != null) haveData = new Boolean (haveData | this.viewer.dataManager.getDataState (this, commands)).valueOf ();
if (!haveData) return "";
var cmd = "";
if (sfunc != null) {
sfunc.append ("  _setDataState;\n");
cmd = "function _setDataState() {\n";
commands.append ("}\n\n");
}return cmd + commands.toString ();
}, $fz.isPrivate = true, $fz), "JU.SB");
$_M(c$, "getDefinedState", 
($fz = function (sfunc, isAll) {
var ms = this.viewer.modelSet;
var len = ms.stateScripts.size ();
if (len == 0) return "";
var haveDefs = false;
var commands =  new JU.SB ();
var cmd;
for (var i = 0; i < len; i++) {
var ss = ms.stateScripts.get (i);
if (ss.inDefinedStateBlock && (cmd = ss.toString ()).length > 0) {
commands.append ("  ").append (cmd).append ("\n");
haveDefs = true;
}}
if (!haveDefs) return "";
cmd = "";
if (isAll && sfunc != null) {
sfunc.append ("  _setDefinedState;\n");
cmd = "function _setDefinedState() {\n\n";
}if (sfunc != null) commands.append ("\n}\n\n");
return cmd + commands.toString ();
}, $fz.isPrivate = true, $fz), "JU.SB,~B");
$_V(c$, "getModelState", 
function (sfunc, isAll, withProteinStructure) {
var commands =  new JU.SB ();
if (isAll && sfunc != null) {
sfunc.append ("  _setModelState;\n");
commands.append ("function _setModelState() {\n");
}var cmd;
var ms = this.viewer.modelSet;
var bonds = ms.bonds;
var models = ms.models;
var modelCount = ms.modelCount;
if (isAll) {
var len = ms.stateScripts.size ();
for (var i = 0; i < len; i++) {
var ss = ms.stateScripts.get (i);
if (!ss.inDefinedStateBlock && (cmd = ss.toString ()).length > 0) {
commands.append ("  ").append (cmd).append ("\n");
}}
var sb =  new JU.SB ();
for (var i = 0; i < ms.bondCount; i++) if (!models[bonds[i].atom1.modelIndex].isModelKit) if (bonds[i].isHydrogen () || (bonds[i].order & 131072) != 0) {
var bond = bonds[i];
var index = bond.atom1.index;
if (bond.atom1.getGroup ().isAdded (index)) index = -1 - index;
sb.appendI (index).appendC ('\t').appendI (bond.atom2.index).appendC ('\t').appendI (bond.order & -131073).appendC ('\t').appendF (bond.mad / 1000).appendC ('\t').appendF (bond.getEnergy ()).appendC ('\t').append (JW.Edge.getBondOrderNameFromOrder (bond.order)).append (";\n");
}
if (sb.length () > 0) commands.append ("data \"connect_atoms\"\n").appendSB (sb).append ("end \"connect_atoms\";\n");
commands.append ("\n");
}if (ms.haveHiddenBonds) {
var bs =  new JM.BondSet ();
for (var i = ms.bondCount; --i >= 0; ) if (bonds[i].mad != 0 && (bonds[i].shapeVisibilityFlags & JM.Bond.myVisibilityFlag) == 0) bs.set (i);

if (bs.isEmpty ()) ms.haveHiddenBonds = false;
 else commands.append ("  hide ").append (JW.Escape.eBond (bs)).append (";\n");
}this.viewer.setModelVisibility ();
if (withProteinStructure) commands.append (ms.getProteinStructureState (null, isAll, false, 0));
this.getShapeState (commands, isAll, 2147483647);
if (isAll) {
var needOrientations = false;
for (var i = 0; i < modelCount; i++) if (models[i].isJmolDataFrame) {
needOrientations = true;
break;
}
for (var i = 0; i < modelCount; i++) {
var fcmd = "  frame " + ms.getModelNumberDotted (i);
var s = ms.getModelAuxiliaryInfoValue (i, "modelID");
if (s != null && !s.equals (ms.getModelAuxiliaryInfoValue (i, "modelID0"))) commands.append (fcmd).append ("; frame ID ").append (JU.PT.esc (s)).append (";\n");
var t = ms.frameTitles[i];
if (t != null && t.length > 0) commands.append (fcmd).append ("; frame title ").append (JU.PT.esc (t)).append (";\n");
if (needOrientations && models[i].orientation != null && !ms.isTrajectorySubFrame (i)) commands.append (fcmd).append ("; ").append (models[i].orientation.getMoveToText (false)).append (";\n");
if (models[i].frameDelay != 0 && !ms.isTrajectorySubFrame (i)) commands.append (fcmd).append ("; frame delay ").appendF (models[i].frameDelay / 1000).append (";\n");
if (models[i].simpleCage != null) {
commands.append (fcmd).append ("; unitcell ").append (JW.Escape.eAP (models[i].simpleCage.getUnitCellVectors ())).append (";\n");
this.getShapeState (commands, isAll, 33);
}}
var loadUC = false;
if (ms.unitCells != null) {
var haveModulation = false;
for (var i = 0; i < modelCount; i++) {
var symmetry = ms.getUnitCell (i);
if (symmetry == null) continue;
commands.append ("  frame ").append (ms.getModelNumberDotted (i));
var pt = symmetry.getFractionalOffset ();
if (pt != null && (pt.x != 0 || pt.y != 0 || pt.z != 0)) {
commands.append ("; set unitcell ").append (JW.Escape.eP (pt));
loadUC = true;
}pt = symmetry.getUnitCellMultiplier ();
if (pt != null) {
commands.append ("; set unitcell ").append (JW.Escape.eP (pt));
loadUC = true;
}commands.append (";\n");
haveModulation = new Boolean (haveModulation | (this.viewer.modelGetLastVibrationIndex (i, 1276121113) >= 0)).valueOf ();
}
if (loadUC) this.viewer.loadShape (33);
this.getShapeState (commands, isAll, 33);
if (haveModulation) {
var temp =  new java.util.Hashtable ();
var ivib;
for (var i = modelCount; --i >= 0; ) {
if ((ivib = this.viewer.modelGetLastVibrationIndex (i, 1276121113)) >= 0) for (var j = models[i].firstAtomIndex; j <= ivib; j++) {
var mset = this.viewer.getVibration (j);
if (mset != null) JW.BSUtil.setMapBitSet (temp, j, j, mset.getState ());
}
}
var s = this.getCommands (temp, null, "select");
commands.append (s);
}}commands.append ("  set fontScaling " + this.viewer.getBoolean (603979845) + ";\n");
if (this.viewer.getBoolean (603979883)) commands.append ("  set modelKitMode true;\n");
}if (sfunc != null) commands.append ("\n}\n\n");
return commands.toString ();
}, "JU.SB,~B,~B");
$_M(c$, "getShapeState", 
($fz = function (commands, isAll, iShape) {
var shapes = this.viewer.shapeManager.shapes;
if (shapes == null) return;
var cmd;
var shape;
var i;
var imax;
if (iShape == 2147483647) {
i = 0;
imax = 36;
} else {
imax = (i = iShape) + 1;
}for (; i < imax; ++i) if ((shape = shapes[i]) != null && (isAll || JV.JC.isShapeSecondary (i)) && (cmd = shape.getShapeState ()) != null && cmd.length > 1) commands.append (cmd);

commands.append ("  select *;\n");
}, $fz.isPrivate = true, $fz), "JU.SB,~B,~N");
$_M(c$, "getWindowState", 
($fz = function (sfunc, width, height) {
var global = this.viewer.global;
var str =  new JU.SB ();
if (sfunc != null) {
sfunc.append ("  initialize;\n  set refreshing false;\n  _setWindowState;\n");
str.append ("\nfunction _setWindowState() {\n");
}if (width != 0) str.append ("# preferredWidthHeight ").appendI (width).append (" ").appendI (height).append (";\n");
str.append ("# width ").appendI (width == 0 ? this.viewer.getScreenWidth () : width).append (";\n# height ").appendI (height == 0 ? this.viewer.getScreenHeight () : height).append (";\n");
JV.StateCreator.appendCmd (str, "stateVersion = " + JV.JC.versionInt);
JV.StateCreator.appendCmd (str, "background " + JW.Escape.escapeColor (global.objColors[0]));
for (var i = 1; i < 8; i++) if (global.objColors[i] != 0) JV.StateCreator.appendCmd (str, JV.StateManager.getObjectNameFromId (i) + "Color = \"" + JW.Escape.escapeColor (global.objColors[i]) + '"');

if (global.backgroundImageFileName != null) JV.StateCreator.appendCmd (str, "background IMAGE /*file*/" + JU.PT.esc (global.backgroundImageFileName));
str.append (this.getSpecularState ());
JV.StateCreator.appendCmd (str, "statusReporting  = " + global.statusReporting);
if (sfunc != null) str.append ("}\n\n");
return str.toString ();
}, $fz.isPrivate = true, $fz), "JU.SB,~N,~N");
$_V(c$, "getSpecularState", 
function () {
var str =  new JU.SB ();
var g = this.viewer.gdata;
JV.StateCreator.appendCmd (str, "set ambientPercent " + g.getAmbientPercent ());
JV.StateCreator.appendCmd (str, "set diffusePercent " + g.getDiffusePercent ());
JV.StateCreator.appendCmd (str, "set specular " + g.getSpecular ());
JV.StateCreator.appendCmd (str, "set specularPercent " + g.getSpecularPercent ());
JV.StateCreator.appendCmd (str, "set specularPower " + g.getSpecularPower ());
JV.StateCreator.appendCmd (str, "set celShading " + g.getCel ());
JV.StateCreator.appendCmd (str, "set celShadingPower " + g.getCelPower ());
var se = g.getSpecularExponent ();
var pe = g.getPhongExponent ();
if (Math.pow (2, se) == pe) JV.StateCreator.appendCmd (str, "set specularExponent " + se);
 else JV.StateCreator.appendCmd (str, "set phongExponent " + pe);
JV.StateCreator.appendCmd (str, "set zShadePower " + this.viewer.global.zShadePower);
return str.toString ();
});
$_M(c$, "getFileState", 
($fz = function (sfunc) {
var commands =  new JU.SB ();
if (sfunc != null) {
sfunc.append ("  _setFileState;\n");
commands.append ("function _setFileState() {\n\n");
}if (commands.indexOf ("append") < 0 && this.viewer.getModelSetFileName ().equals ("zapped")) commands.append ("  zap;\n");
this.appendLoadStates (commands);
if (sfunc != null) commands.append ("\n}\n\n");
return commands.toString ();
}, $fz.isPrivate = true, $fz), "JU.SB");
$_M(c$, "appendLoadStates", 
($fz = function (cmds) {
var ligandModelSet = this.viewer.ligandModelSet;
if (ligandModelSet != null) {
for (var key, $key = ligandModelSet.keySet ().iterator (); $key.hasNext () && ((key = $key.next ()) || true);) {
var data = this.viewer.ligandModels.get (key + "_data");
if (data != null) cmds.append ("  ").append (JW.Escape.encapsulateData ("ligand_" + key, data.trim () + "\n", 0));
data = this.viewer.ligandModels.get (key + "_file");
if (data != null) cmds.append ("  ").append (JW.Escape.encapsulateData ("file_" + key, data.trim () + "\n", 0));
}
}var commands =  new JU.SB ();
var ms = this.viewer.modelSet;
var models = ms.models;
var modelCount = ms.modelCount;
for (var i = 0; i < modelCount; i++) {
if (ms.isJmolDataFrameForModel (i) || ms.isTrajectorySubFrame (i)) continue;
var m = models[i];
var pt = commands.indexOf (m.loadState);
if (pt < 0 || pt != commands.lastIndexOf (m.loadState)) commands.append (models[i].loadState);
if (models[i].isModelKit) {
var bs = ms.getModelAtomBitSetIncludingDeleted (i, false);
if (ms.tainted != null) {
if (ms.tainted[2] != null) ms.tainted[2].andNot (bs);
if (ms.tainted[3] != null) ms.tainted[3].andNot (bs);
}m.loadScript =  new JU.SB ();
this.getInlineData (commands, this.viewer.getModelExtract (bs, false, true, "MOL"), i > 0, null);
} else {
commands.appendSB (m.loadScript);
}}
var s = commands.toString ();
if (s.indexOf ("data \"append ") < 0) {
var i = s.indexOf ("load /*data*/");
var j = s.indexOf ("load /*file*/");
if (j >= 0 && j < i) i = j;
if ((j = s.indexOf ("load \"@")) >= 0 && j < i) i = j;
if (i >= 0) s = s.substring (0, i) + "zap;" + s.substring (i);
}cmds.append (s);
}, $fz.isPrivate = true, $fz), "JU.SB");
$_V(c$, "getInlineData", 
function (loadScript, strModel, isAppend, loadFilter) {
var tag = (isAppend ? "append" : "model") + " inline";
loadScript.append ("load /*data*/ data \"").append (tag).append ("\"\n").append (strModel).append ("end \"").append (tag).append (loadFilter == null || loadFilter.length == 0 ? "" : " filter" + JU.PT.esc (loadFilter)).append ("\";");
}, "JU.SB,~S,~B,~S");
$_M(c$, "getColorState", 
($fz = function (cm, sfunc) {
var s =  new JU.SB ();
var n = this.getCEState (cm.propertyColorEncoder, s);
if (n > 0 && sfunc != null) sfunc.append ("\n  _setColorState\n");
return (n > 0 && sfunc != null ? "function _setColorState() {\n" + s.append ("}\n\n").toString () : s.toString ());
}, $fz.isPrivate = true, $fz), "JV.ColorManager,JU.SB");
$_M(c$, "getCEState", 
($fz = function (p, s) {
var n = 0;
for (var entry, $entry = p.schemes.entrySet ().iterator (); $entry.hasNext () && ((entry = $entry.next ()) || true);) {
var name = entry.getKey ();
if ( new Boolean (name.length > 0 & n++ >= 0).valueOf ()) s.append ("color \"" + name + "=" + JW.ColorEncoder.getColorSchemeList (entry.getValue ()) + "\";\n");
}
return n;
}, $fz.isPrivate = true, $fz), "JW.ColorEncoder,JU.SB");
$_M(c$, "getAnimState", 
($fz = function (am, sfunc) {
var modelCount = this.viewer.getModelCount ();
if (modelCount < 2) return "";
var commands =  new JU.SB ();
if (sfunc != null) {
sfunc.append ("  _setFrameState;\n");
commands.append ("function _setFrameState() {\n");
}commands.append ("# frame state;\n");
commands.append ("# modelCount ").appendI (modelCount).append (";\n# first ").append (this.viewer.getModelNumberDotted (0)).append (";\n# last ").append (this.viewer.getModelNumberDotted (modelCount - 1)).append (";\n");
if (am.backgroundModelIndex >= 0) JV.StateCreator.appendCmd (commands, "set backgroundModel " + this.viewer.getModelNumberDotted (am.backgroundModelIndex));
var bs = this.viewer.getFrameOffsets ();
if (bs != null) JV.StateCreator.appendCmd (commands, "frame align " + JW.Escape.eBS (bs));
JV.StateCreator.appendCmd (commands, "frame RANGE " + am.getModelSpecial (-1) + " " + am.getModelSpecial (1));
JV.StateCreator.appendCmd (commands, "animation DIRECTION " + (am.animationDirection == 1 ? "+1" : "-1"));
JV.StateCreator.appendCmd (commands, "animation FPS " + am.animationFps);
JV.StateCreator.appendCmd (commands, "animation MODE " + am.animationReplayMode.name () + " " + am.firstFrameDelay + " " + am.lastFrameDelay);
if (am.morphCount > 0) JV.StateCreator.appendCmd (commands, "animation MORPH " + am.morphCount);
var frames = am.getAnimationFrames ();
var showModel = true;
if (frames != null) {
JV.StateCreator.appendCmd (commands, "anim frames " + JW.Escape.eAI (frames));
var i = am.getCurrentFrameIndex ();
JV.StateCreator.appendCmd (commands, "frame " + (i + 1));
showModel = (am.currentModelIndex != am.modelIndexForFrame (i));
}if (showModel) JV.StateCreator.appendCmd (commands, "model " + am.getModelSpecial (0));
JV.StateCreator.appendCmd (commands, "animation " + (!am.animationOn ? "OFF" : am.currentDirection == 1 ? "PLAY" : "PLAYREV"));
if (am.animationOn && am.animationPaused) JV.StateCreator.appendCmd (commands, "animation PAUSE");
if (sfunc != null) commands.append ("}\n\n");
return commands.toString ();
}, $fz.isPrivate = true, $fz), "JV.AnimationManager,JU.SB");
$_M(c$, "getParameterState", 
($fz = function (global, sfunc) {
var list =  new Array (global.htBooleanParameterFlags.size () + global.htNonbooleanParameterValues.size ());
var commands =  new JU.SB ();
var isState = (sfunc != null);
if (isState) {
sfunc.append ("  _setParameterState;\n");
commands.append ("function _setParameterState() {\n\n");
}var n = 0;
for (var key, $key = global.htBooleanParameterFlags.keySet ().iterator (); $key.hasNext () && ((key = $key.next ()) || true);) if (JV.GlobalSettings.doReportProperty (key)) list[n++] = "set " + key + " " + global.htBooleanParameterFlags.get (key);

for (var key, $key = global.htNonbooleanParameterValues.keySet ().iterator (); $key.hasNext () && ((key = $key.next ()) || true);) if (JV.GlobalSettings.doReportProperty (key)) {
var value = global.htNonbooleanParameterValues.get (key);
if (key.charAt (0) == '=') {
key = key.substring (1);
} else {
key = (key.indexOf ("default") == 0 ? " " : "") + "set " + key;
value = JW.Escape.e (value);
}list[n++] = key + " " + value;
}
switch (global.axesMode) {
case J.constant.EnumAxesMode.UNITCELL:
list[n++] = "set axes unitcell";
break;
case J.constant.EnumAxesMode.BOUNDBOX:
list[n++] = "set axes window";
break;
default:
list[n++] = "set axes molecular";
}
java.util.Arrays.sort (list, 0, n);
for (var i = 0; i < n; i++) if (list[i] != null) JV.StateCreator.appendCmd (commands, list[i]);

var s = JV.StateManager.getVariableList (global.htUserVariables, 0, false, true);
if (s.length > 0) {
commands.append ("\n#user-defined atom sets; \n");
commands.append (s);
}if (this.viewer.shapeManager.getShape (5) != null) commands.append (this.getDefaultLabelState (this.viewer.shapeManager.shapes[5]));
if (global.haveSetStructureList) {
var slist = global.structureList;
commands.append ("struture HELIX set " + JW.Escape.eAF (slist.get (J.constant.EnumStructure.HELIX)));
commands.append ("struture SHEET set " + JW.Escape.eAF (slist.get (J.constant.EnumStructure.SHEET)));
commands.append ("struture TURN set " + JW.Escape.eAF (slist.get (J.constant.EnumStructure.TURN)));
}if (sfunc != null) commands.append ("\n}\n\n");
return commands.toString ();
}, $fz.isPrivate = true, $fz), "JV.GlobalSettings,JU.SB");
$_M(c$, "getDefaultLabelState", 
($fz = function (l) {
var s =  new JU.SB ().append ("\n# label defaults;\n");
JV.StateCreator.appendCmd (s, "select none");
JV.StateCreator.appendCmd (s, J.shape.Shape.getColorCommand ("label", l.defaultPaletteID, l.defaultColix, l.translucentAllowed));
JV.StateCreator.appendCmd (s, "background label " + J.shape.Shape.encodeColor (l.defaultBgcolix));
JV.StateCreator.appendCmd (s, "set labelOffset " + JV.JC.getXOffset (l.defaultOffset) + " " + (-JV.JC.getYOffset (l.defaultOffset)));
var align = JV.JC.getAlignmentName (l.defaultAlignment);
JV.StateCreator.appendCmd (s, "set labelAlignment " + (align.length < 5 ? "left" : align));
var pointer = JV.JC.getPointer (l.defaultPointer);
JV.StateCreator.appendCmd (s, "set labelPointer " + (pointer.length == 0 ? "off" : pointer));
if ((l.defaultZPos & 32) != 0) JV.StateCreator.appendCmd (s, "set labelFront");
 else if ((l.defaultZPos & 16) != 0) JV.StateCreator.appendCmd (s, "set labelGroup");
JV.StateCreator.appendCmd (s, J.shape.Shape.getFontCommand ("label", javajs.awt.Font.getFont3D (l.defaultFontId)));
return s.toString ();
}, $fz.isPrivate = true, $fz), "J.shape.Labels");
$_M(c$, "getSelectionState", 
($fz = function (sm, sfunc) {
var commands =  new JU.SB ();
if (sfunc != null) {
sfunc.append ("  _setSelectionState;\n");
commands.append ("function _setSelectionState() {\n");
}JV.StateCreator.appendCmd (commands, this.getTrajectoryState ());
var temp =  new java.util.Hashtable ();
var cmd = null;
JV.StateCreator.addBs (commands, "hide ", sm.bsHidden);
JV.StateCreator.addBs (commands, "subset ", sm.bsSubset);
JV.StateCreator.addBs (commands, "delete ", sm.bsDeleted);
JV.StateCreator.addBs (commands, "fix ", sm.bsFixed);
temp.put ("-", this.viewer.getSelectedAtomsNoSubset ());
cmd = this.getCommands (temp, null, "select");
if (cmd == null) JV.StateCreator.appendCmd (commands, "select none");
 else commands.append (cmd);
JV.StateCreator.appendCmd (commands, "set hideNotSelected " + sm.hideNotSelected);
commands.append (this.viewer.getShapeProperty (1, "selectionState"));
if (this.viewer.getSelectionHaloEnabled (false)) JV.StateCreator.appendCmd (commands, "SelectionHalos ON");
if (sfunc != null) commands.append ("}\n\n");
return commands.toString ();
}, $fz.isPrivate = true, $fz), "JV.SelectionManager,JU.SB");
$_V(c$, "getTrajectoryState", 
function () {
var s = "";
var m = this.viewer.modelSet;
if (m.trajectorySteps == null) return "";
for (var i = m.modelCount; --i >= 0; ) {
var t = m.models[i].getSelectedTrajectory ();
if (t >= 0) {
s = " or " + m.getModelNumberDotted (t) + s;
i = m.models[i].trajectoryBaseIndex;
}}
if (s.length > 0) s = "set trajectory {" + s.substring (4) + "}";
return s;
});
$_M(c$, "getViewState", 
($fz = function (tm, sfunc) {
var commands =  new JU.SB ();
var moveToText = tm.getMoveToText (0, false);
if (sfunc != null) {
sfunc.append ("  _setPerspectiveState;\n");
commands.append ("function _setPerspectiveState() {\n");
}JV.StateCreator.appendCmd (commands, "set perspectiveModel " + tm.perspectiveModel);
JV.StateCreator.appendCmd (commands, "set scaleAngstromsPerInch " + tm.scale3DAngstromsPerInch);
JV.StateCreator.appendCmd (commands, "set perspectiveDepth " + tm.perspectiveDepth);
JV.StateCreator.appendCmd (commands, "set visualRange " + tm.visualRange);
if (!tm.isWindowCentered ()) JV.StateCreator.appendCmd (commands, "set windowCentered false");
JV.StateCreator.appendCmd (commands, "set cameraDepth " + tm.cameraDepth);
var navigating = (tm.mode == 1);
if (navigating) JV.StateCreator.appendCmd (commands, "set navigationMode true");
JV.StateCreator.appendCmd (commands, this.viewer.getBoundBoxCommand (false));
JV.StateCreator.appendCmd (commands, "center " + JW.Escape.eP (tm.fixedRotationCenter));
commands.append (this.viewer.getOrientationText (1073742035, null));
JV.StateCreator.appendCmd (commands, moveToText);
if (tm.stereoMode !== J.constant.EnumStereoMode.NONE) JV.StateCreator.appendCmd (commands, "stereo " + (tm.stereoColors == null ? tm.stereoMode.getName () : JW.Escape.escapeColor (tm.stereoColors[0]) + " " + JW.Escape.escapeColor (tm.stereoColors[1])) + " " + tm.stereoDegrees);
if (!navigating && !tm.zoomEnabled) JV.StateCreator.appendCmd (commands, "zoom off");
commands.append ("  slab ").appendI (tm.slabPercentSetting).append (";depth ").appendI (tm.depthPercentSetting).append (tm.slabEnabled && !navigating ? ";slab on" : "").append (";\n");
commands.append ("  set slabRange ").appendF (tm.slabRange).append (";\n");
if (tm.zShadeEnabled) commands.append ("  set zShade;\n");
try {
if (tm.zSlabPoint != null) commands.append ("  set zSlab ").append (JW.Escape.eP (tm.zSlabPoint)).append (";\n");
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
} else {
throw e;
}
}
if (tm.slabPlane != null) commands.append ("  slab plane ").append (JW.Escape.eP4 (tm.slabPlane)).append (";\n");
if (tm.depthPlane != null) commands.append ("  depth plane ").append (JW.Escape.eP4 (tm.depthPlane)).append (";\n");
commands.append (this.getSpinState (true)).append ("\n");
if (this.viewer.modelSetHasVibrationVectors () && tm.vibrationOn) JV.StateCreator.appendCmd (commands, "set vibrationPeriod " + tm.vibrationPeriod + ";vibration on");
if (navigating) {
commands.append (tm.getNavigationState ());
if (tm.depthPlane != null || tm.slabPlane != null) commands.append ("  slab on;\n");
}if (sfunc != null) commands.append ("}\n\n");
return commands.toString ();
}, $fz.isPrivate = true, $fz), "JV.TransformManager,JU.SB");
$_V(c$, "getSpinState", 
function (isAll) {
var tm = this.viewer.tm;
var s = "  set spinX " + Clazz.floatToInt (tm.spinX) + "; set spinY " + Clazz.floatToInt (tm.spinY) + "; set spinZ " + Clazz.floatToInt (tm.spinZ) + "; set spinFps " + Clazz.floatToInt (tm.spinFps) + ";";
if (!Float.isNaN (tm.navFps)) s += "  set navX " + Clazz.floatToInt (tm.navX) + "; set navY " + Clazz.floatToInt (tm.navY) + "; set navZ " + Clazz.floatToInt (tm.navZ) + "; set navFps " + Clazz.floatToInt (tm.navFps) + ";";
if (tm.navOn) s += " navigation on;";
if (!tm.spinOn) return s;
var prefix = (tm.isSpinSelected ? "\n  select " + JW.Escape.eBS (this.viewer.getSelectedAtoms ()) + ";\n  rotateSelected" : "\n ");
if (tm.isSpinInternal) {
var pt = JU.P3.newP (tm.internalRotationCenter);
pt.sub (tm.rotationAxis);
s += prefix + " spin " + tm.rotationRate + " " + JW.Escape.eP (tm.internalRotationCenter) + " " + JW.Escape.eP (pt);
} else if (tm.isSpinFixed) {
s += prefix + " spin axisangle " + JW.Escape.eP (tm.rotationAxis) + " " + tm.rotationRate;
} else {
s += " spin on";
}return s + ";";
}, "~B");
$_V(c$, "getCommands", 
function (htDefine, htMore, selectCmd) {
var s =  new JU.SB ();
var setPrev = JV.StateCreator.getCommands2 (htDefine, s, null, selectCmd);
if (htMore != null) JV.StateCreator.getCommands2 (htMore, s, setPrev, "select");
return s.toString ();
}, "java.util.Map,java.util.Map,~S");
c$.getCommands2 = $_M(c$, "getCommands2", 
($fz = function (ht, s, setPrev, selectCmd) {
if (ht == null) return "";
for (var entry, $entry = ht.entrySet ().iterator (); $entry.hasNext () && ((entry = $entry.next ()) || true);) {
var key = entry.getKey ();
var set = JW.Escape.eBS (entry.getValue ());
if (set.length < 5) continue;
set = selectCmd + " " + set;
if (!set.equals (setPrev)) JV.StateCreator.appendCmd (s, set);
setPrev = set;
if (key.indexOf ("-") != 0) JV.StateCreator.appendCmd (s, key);
}
return setPrev;
}, $fz.isPrivate = true, $fz), "java.util.Map,JU.SB,~S,~S");
c$.appendCmd = $_M(c$, "appendCmd", 
($fz = function (s, cmd) {
if (cmd.length == 0) return;
s.append ("  ").append (cmd).append (";\n");
}, $fz.isPrivate = true, $fz), "JU.SB,~S");
c$.addBs = $_M(c$, "addBs", 
($fz = function (sb, key, bs) {
if (bs == null || bs.length () == 0) return;
JV.StateCreator.appendCmd (sb, key + JW.Escape.eBS (bs));
}, $fz.isPrivate = true, $fz), "JU.SB,~S,JU.BS");
$_V(c$, "getFontState", 
function (myType, font3d) {
var objId = JV.StateManager.getObjectIdFromName (myType.equalsIgnoreCase ("axes") ? "axis" : myType);
if (objId < 0) return "";
var mad = this.viewer.getObjectMad (objId);
var s =  new JU.SB ().append ("\n");
JV.StateCreator.appendCmd (s, myType + (mad == 0 ? " off" : mad == 1 ? " on" : mad == -1 ? " dotted" : mad < 20 ? " " + mad : " " + (mad / 2000)));
if (s.length () < 3) return "";
var fcmd = J.shape.Shape.getFontCommand (myType, font3d);
if (fcmd.length > 0) fcmd = "  " + fcmd + ";\n";
return (s + fcmd);
}, "~S,javajs.awt.Font");
$_V(c$, "getFontLineShapeState", 
function (s, myType, tickInfos) {
var isOff = (s.indexOf (" off") >= 0);
var sb =  new JU.SB ();
sb.append (s);
for (var i = 0; i < 4; i++) if (tickInfos[i] != null) this.appendTickInfo (myType, sb, tickInfos[i]);

if (isOff) sb.append ("  " + myType + " off;\n");
return sb.toString ();
}, "~S,~S,~A");
$_M(c$, "appendTickInfo", 
($fz = function (myType, sb, t) {
sb.append ("  ");
sb.append (myType);
JV.StateCreator.addTickInfo (sb, t, false);
sb.append (";\n");
}, $fz.isPrivate = true, $fz), "~S,JU.SB,JM.TickInfo");
c$.addTickInfo = $_M(c$, "addTickInfo", 
($fz = function (sb, tickInfo, addFirst) {
sb.append (" ticks ").append (tickInfo.type).append (" ").append (JW.Escape.eP (tickInfo.ticks));
var isUnitCell = (tickInfo.scale != null && Float.isNaN (tickInfo.scale.x));
if (isUnitCell) sb.append (" UNITCELL");
if (tickInfo.tickLabelFormats != null) sb.append (" format ").append (JW.Escape.eAS (tickInfo.tickLabelFormats, false));
if (!isUnitCell && tickInfo.scale != null) sb.append (" scale ").append (JW.Escape.eP (tickInfo.scale));
if (addFirst && !Float.isNaN (tickInfo.first) && tickInfo.first != 0) sb.append (" first ").appendF (tickInfo.first);
if (tickInfo.reference != null) sb.append (" point ").append (JW.Escape.eP (tickInfo.reference));
}, $fz.isPrivate = true, $fz), "JU.SB,JM.TickInfo,~B");
$_V(c$, "getShapeSetState", 
function (as, shape, monomerCount, monomers, bsSizeDefault, temp, temp2) {
var type = JV.JC.shapeClassBases[shape.shapeID];
for (var i = 0; i < monomerCount; i++) {
var atomIndex1 = monomers[i].firstAtomIndex;
var atomIndex2 = monomers[i].lastAtomIndex;
if (as.bsSizeSet != null && (as.bsSizeSet.get (i) || as.bsColixSet != null && as.bsColixSet.get (i))) {
if (bsSizeDefault.get (i)) JW.BSUtil.setMapBitSet (temp, atomIndex1, atomIndex2, type + (as.bsSizeSet.get (i) ? " on" : " off"));
 else JW.BSUtil.setMapBitSet (temp, atomIndex1, atomIndex2, type + " " + (as.mads[i] / 2000));
}if (as.bsColixSet != null && as.bsColixSet.get (i)) JW.BSUtil.setMapBitSet (temp2, atomIndex1, atomIndex2, J.shape.Shape.getColorCommand (type, as.paletteIDs[i], as.colixes[i], shape.translucentAllowed));
}
}, "J.shape.AtomShape,J.shape.Shape,~N,~A,JU.BS,java.util.Map,java.util.Map");
$_V(c$, "getMeasurementState", 
function (shape, mList, measurementCount, font3d, ti) {
var commands =  new JU.SB ();
JV.StateCreator.appendCmd (commands, "measures delete");
for (var i = 0; i < measurementCount; i++) {
var m = mList.get (i);
var count = m.count;
var sb =  new JU.SB ().append ("measure");
if (m.thisID != null) sb.append (" ID ").append (JU.PT.esc (m.thisID));
if (m.mad != 0) sb.append (" radius ").appendF (m.thisID == null || m.mad > 0 ? m.mad / 2000 : 0);
if (m.colix != 0) sb.append (" color ").append (JW.Escape.escapeColor (JW.C.getArgb (m.colix)));
if (m.text != null) {
sb.append (" font ").append (m.text.font.getInfo ());
if (m.text.pymolOffset != null) sb.append (" offset ").append (JW.Escape.eAF (m.text.pymolOffset));
}var tickInfo = m.tickInfo;
if (tickInfo != null) JV.StateCreator.addTickInfo (sb, tickInfo, true);
for (var j = 1; j <= count; j++) sb.append (" ").append (m.getLabel (j, true, true));

sb.append ("; # " + shape.getInfoAsString (i));
JV.StateCreator.appendCmd (commands, sb.toString ());
}
JV.StateCreator.appendCmd (commands, "select *; set measures " + this.viewer.getMeasureDistanceUnits ());
JV.StateCreator.appendCmd (commands, J.shape.Shape.getFontCommand ("measures", font3d));
var nHidden = 0;
var temp =  new java.util.Hashtable ();
var bs = JU.BS.newN (measurementCount);
for (var i = 0; i < measurementCount; i++) {
var m = mList.get (i);
if (m.isHidden) {
nHidden++;
bs.set (i);
}if (shape.bsColixSet != null && shape.bsColixSet.get (i)) JW.BSUtil.setMapBitSet (temp, i, i, J.shape.Shape.getColorCommandUnk ("measure", m.colix, shape.translucentAllowed));
if (m.strFormat != null) JW.BSUtil.setMapBitSet (temp, i, i, "measure " + JU.PT.esc (m.strFormat));
}
if (nHidden > 0) if (nHidden == measurementCount) JV.StateCreator.appendCmd (commands, "measures off; # lines and numbers off");
 else for (var i = 0; i < measurementCount; i++) if (bs.get (i)) JW.BSUtil.setMapBitSet (temp, i, i, "measure off");

if (ti != null) {
commands.append (" measure ");
JV.StateCreator.addTickInfo (commands, ti, true);
commands.append (";\n");
}if (shape.mad >= 0) commands.append (" set measurements " + (shape.mad / 2000)).append (";\n");
var s = this.getCommands (temp, null, "select measures");
if (s != null && s.length != 0) {
commands.append (s);
JV.StateCreator.appendCmd (commands, "select measures ({null})");
}return commands.toString ();
}, "J.shape.Measures,JU.List,~N,javajs.awt.Font,JM.TickInfo");
$_V(c$, "getBondState", 
function (shape, bsOrderSet, reportAll) {
this.clearTemp ();
var modelSet = this.viewer.modelSet;
var haveTainted = false;
var bonds = modelSet.bonds;
var bondCount = modelSet.bondCount;
var r;
if (reportAll || shape.bsSizeSet != null) {
var i0 = (reportAll ? bondCount - 1 : shape.bsSizeSet.nextSetBit (0));
for (var i = i0; i >= 0; i = (reportAll ? i - 1 : shape.bsSizeSet.nextSetBit (i + 1))) JW.BSUtil.setMapBitSet (this.temp, i, i, "wireframe " + ((r = bonds[i].mad) == 1 ? "on" : "" + (r / 2000)));

}if (reportAll || bsOrderSet != null) {
var i0 = (reportAll ? bondCount - 1 : bsOrderSet.nextSetBit (0));
for (var i = i0; i >= 0; i = (reportAll ? i - 1 : bsOrderSet.nextSetBit (i + 1))) {
var bond = bonds[i];
if (reportAll || (bond.order & 131072) == 0) JW.BSUtil.setMapBitSet (this.temp, i, i, "bondOrder " + JW.Edge.getBondOrderNameFromOrder (bond.order));
}
}if (shape.bsColixSet != null) for (var i = shape.bsColixSet.nextSetBit (0); i >= 0; i = shape.bsColixSet.nextSetBit (i + 1)) {
var colix = bonds[i].colix;
if ((colix & -30721) == 2) JW.BSUtil.setMapBitSet (this.temp, i, i, J.shape.Shape.getColorCommand ("bonds", J.constant.EnumPalette.CPK.id, colix, shape.translucentAllowed));
 else JW.BSUtil.setMapBitSet (this.temp, i, i, J.shape.Shape.getColorCommandUnk ("bonds", colix, shape.translucentAllowed));
}
var s = this.getCommands (this.temp, null, "select BONDS") + "\n" + (haveTainted ? this.getCommands (this.temp2, null, "select BONDS") + "\n" : "");
this.clearTemp ();
return s;
}, "J.shape.Shape,JU.BS,~B");
$_M(c$, "clearTemp", 
($fz = function () {
this.temp.clear ();
this.temp2.clear ();
}, $fz.isPrivate = true, $fz));
$_V(c$, "getAtomShapeSetState", 
function (shape, bioShapes) {
this.clearTemp ();
for (var i = bioShapes.length; --i >= 0; ) {
var bs = bioShapes[i];
if (bs.monomerCount > 0) {
if (!bs.isActive || bs.bsSizeSet == null && bs.bsColixSet == null) continue;
this.viewer.getShapeSetState (bs, shape, bs.monomerCount, bs.getMonomers (), bs.bsSizeDefault, this.temp, this.temp2);
}}
var s = "\n" + this.getCommands (this.temp, this.temp2, shape.shapeID == 9 ? "Backbone" : "select");
this.clearTemp ();
return s;
}, "J.shape.Shape,~A");
$_M(c$, "getShapeState", 
function (shape) {
var s;
switch (shape.shapeID) {
case 30:
var es = shape;
var sb =  new JU.SB ();
sb.append ("\n  set echo off;\n");
for (var t, $t = es.objects.values ().iterator (); $t.hasNext () && ((t = $t.next ()) || true);) {
sb.append (this.getTextState (t));
if (t.hidden) sb.append ("  set echo ID ").append (JU.PT.esc (t.target)).append (" hidden;\n");
}
s = sb.toString ();
break;
case 8:
var hs = shape;
s = this.getAtomShapeState (hs) + (hs.colixSelection == 2 ? "" : hs.colixSelection == 0 ? "  color SelectionHalos NONE;\n" : J.shape.Shape.getColorCommandUnk ("selectionHalos", hs.colixSelection, hs.translucentAllowed) + ";\n");
if (hs.bsHighlight != null) s += "  set highlight " + JW.Escape.eBS (hs.bsHighlight) + "; " + J.shape.Shape.getColorCommandUnk ("highlight", hs.colixHighlight, hs.translucentAllowed) + ";\n";
break;
case 34:
this.clearTemp ();
var h = shape;
if (h.atomFormats != null) for (var i = this.viewer.getAtomCount (); --i >= 0; ) if (h.atomFormats[i] != null) JW.BSUtil.setMapBitSet (this.temp, i, i, "set hoverLabel " + JU.PT.esc (h.atomFormats[i]));

s = "\n  hover " + JU.PT.esc ((h.labelFormat == null ? "" : h.labelFormat)) + ";\n" + this.getCommands (this.temp, null, "select");
this.clearTemp ();
break;
case 5:
this.clearTemp ();
var l = shape;
for (var i = l.bsSizeSet.nextSetBit (0); i >= 0; i = l.bsSizeSet.nextSetBit (i + 1)) {
var t = l.getLabel (i);
var cmd = null;
if (t != null) {
cmd = "label " + JU.PT.esc (t.textUnformatted);
if (t.pymolOffset != null) cmd += ";set labelOffset " + JW.Escape.eAF (t.pymolOffset);
}if (cmd == null) cmd = "label " + JU.PT.esc (l.formats[i]);
JW.BSUtil.setMapBitSet (this.temp, i, i, cmd);
if (l.bsColixSet != null && l.bsColixSet.get (i)) JW.BSUtil.setMapBitSet (this.temp2, i, i, J.shape.Shape.getColorCommand ("label", l.paletteIDs[i], l.colixes[i], l.translucentAllowed));
if (l.bsBgColixSet != null && l.bsBgColixSet.get (i)) JW.BSUtil.setMapBitSet (this.temp2, i, i, "background label " + J.shape.Shape.encodeColor (l.bgcolixes[i]));
var text = l.getLabel (i);
var sppm = (text != null ? text.getScalePixelsPerMicron () : 0);
if (sppm > 0) JW.BSUtil.setMapBitSet (this.temp2, i, i, "set labelScaleReference " + (10000 / sppm));
if (l.offsets != null && l.offsets.length > i) {
var offsetFull = l.offsets[i];
JW.BSUtil.setMapBitSet (this.temp2, i, i, "set " + ((offsetFull & 128) == 128 ? "labelOffsetExact " : "labelOffset ") + JV.JC.getXOffset (offsetFull >> 8) + " " + (-JV.JC.getYOffset (offsetFull >> 8)));
var align = JV.JC.getAlignmentName (offsetFull >> 2);
var pointer = JV.JC.getPointer (offsetFull);
if (pointer.length > 0) JW.BSUtil.setMapBitSet (this.temp2, i, i, "set labelPointer " + pointer);
if ((offsetFull & 32) != 0) JW.BSUtil.setMapBitSet (this.temp2, i, i, "set labelFront");
 else if ((offsetFull & 16) != 0) JW.BSUtil.setMapBitSet (this.temp2, i, i, "set labelGroup");
if (align.length > 0) JW.BSUtil.setMapBitSet (this.temp3, i, i, "set labelAlignment " + align);
}if (l.mads != null && l.mads[i] < 0) JW.BSUtil.setMapBitSet (this.temp2, i, i, "set toggleLabel");
if (l.bsFontSet != null && l.bsFontSet.get (i)) JW.BSUtil.setMapBitSet (this.temp2, i, i, J.shape.Shape.getFontCommand ("label", javajs.awt.Font.getFont3D (l.fids[i])));
}
s = this.getCommands (this.temp, this.temp2, "select") + this.getCommands (null, this.temp3, "select");
this.temp3.clear ();
this.clearTemp ();
break;
case 0:
this.clearTemp ();
var atomCount = this.viewer.getAtomCount ();
var atoms = this.viewer.modelSet.atoms;
var balls = shape;
var colixes = balls.colixes;
var pids = balls.paletteIDs;
var r = 0;
for (var i = 0; i < atomCount; i++) {
if (shape.bsSizeSet != null && shape.bsSizeSet.get (i)) {
if ((r = atoms[i].madAtom) < 0) JW.BSUtil.setMapBitSet (this.temp, i, i, "Spacefill on");
 else JW.BSUtil.setMapBitSet (this.temp, i, i, "Spacefill " + (r / 2000));
}if (shape.bsColixSet != null && shape.bsColixSet.get (i)) {
var pid = atoms[i].getPaletteID ();
if (pid != J.constant.EnumPalette.CPK.id || atoms[i].isTranslucent ()) JW.BSUtil.setMapBitSet (this.temp, i, i, J.shape.Shape.getColorCommand ("atoms", pid, atoms[i].getColix (), shape.translucentAllowed));
if (colixes != null && i < colixes.length) JW.BSUtil.setMapBitSet (this.temp2, i, i, J.shape.Shape.getColorCommand ("balls", pids[i], colixes[i], shape.translucentAllowed));
}}
s = this.getCommands (this.temp, this.temp2, "select");
this.clearTemp ();
break;
default:
s = "";
}
return s;
}, "J.shape.Shape");
$_M(c$, "getTextState", 
($fz = function (t) {
var s =  new JU.SB ();
var text = t.getText ();
if (text == null || t.isLabelOrHover || t.target.equals ("error")) return "";
var isImage = (t.image != null);
var strOff = null;
var echoCmd = "set echo ID " + JU.PT.esc (t.target);
switch (t.valign) {
case 0:
if (t.movableXPercent == 2147483647 || t.movableYPercent == 2147483647) {
strOff = (t.movableXPercent == 2147483647 ? t.movableX + " " : t.movableXPercent + "% ") + (t.movableYPercent == 2147483647 ? t.movableY + "" : t.movableYPercent + "%");
} else {
strOff = "[" + t.movableXPercent + " " + t.movableYPercent + "%]";
}case 4:
if (strOff == null) strOff = JW.Escape.eP (t.xyz);
s.append ("  ").append (echoCmd).append (" ").append (strOff);
if (t.align != 1) s.append (";  ").append (echoCmd).append (" ").append (JV.JC.hAlignNames[t.align]);
break;
default:
s.append ("  set echo ").append (JV.JC.vAlignNames[t.valign]).append (" ").append (JV.JC.hAlignNames[t.align]);
}
if (t.valign == 0 && t.movableZPercent != 2147483647) s.append (";  ").append (echoCmd).append (" depth ").appendI (t.movableZPercent);
if (isImage) s.append ("; ").append (echoCmd).append (" IMAGE /*file*/");
 else s.append ("; echo ");
s.append (JU.PT.esc (text));
s.append (";\n");
if (isImage && t.imageScale != 1) s.append ("  ").append (echoCmd).append (" scale ").appendF (t.imageScale).append (";\n");
if (t.script != null) s.append ("  ").append (echoCmd).append (" script ").append (JU.PT.esc (t.script)).append (";\n");
if (t.modelIndex >= 0) s.append ("  ").append (echoCmd).append (" model ").append (this.viewer.getModelNumberDotted (t.modelIndex)).append (";\n");
if (t.pointerPt != null) {
s.append ("  ").append (echoCmd).append (" point ").append (Clazz.instanceOf (t.pointerPt, JM.Atom) ? "({" + (t.pointerPt).index + "})" : JW.Escape.eP (t.pointerPt)).append (";\n");
}s.append ("  " + J.shape.Shape.getFontCommand ("echo", t.font));
if (t.scalePixelsPerMicron > 0) s.append (" " + (10000 / t.scalePixelsPerMicron));
s.append ("; color echo");
if (JW.C.isColixTranslucent (t.colix)) s.append (" translucent " + JW.C.getColixTranslucencyFractional (t.colix));
s.append (" ").append (JW.C.getHexCode (t.colix));
if (t.bgcolix != 0) {
s.append ("; color echo background");
if (JW.C.isColixTranslucent (t.bgcolix)) s.append (" translucent " + JW.C.getColixTranslucencyFractional (t.bgcolix));
s.append (" ").append (JW.C.getHexCode (t.bgcolix));
}s.append (";\n");
return s.toString ();
}, $fz.isPrivate = true, $fz), "JM.Text");
$_V(c$, "getLoadState", 
function (htParams) {
var g = this.viewer.global;
var str =  new JU.SB ();
JV.StateCreator.appendCmd (str, "set allowEmbeddedScripts false");
if (g.allowEmbeddedScripts) g.setB ("allowEmbeddedScripts", true);
JV.StateCreator.appendCmd (str, "set appendNew " + g.appendNew);
JV.StateCreator.appendCmd (str, "set appletProxy " + JU.PT.esc (g.appletProxy));
JV.StateCreator.appendCmd (str, "set applySymmetryToBonds " + g.applySymmetryToBonds);
if (g.atomTypes.length > 0) JV.StateCreator.appendCmd (str, "set atomTypes " + JU.PT.esc (g.atomTypes));
JV.StateCreator.appendCmd (str, "set autoBond " + g.autoBond);
if (g.axesOrientationRasmol) JV.StateCreator.appendCmd (str, "set axesOrientationRasmol true");
JV.StateCreator.appendCmd (str, "set bondRadiusMilliAngstroms " + g.bondRadiusMilliAngstroms);
JV.StateCreator.appendCmd (str, "set bondTolerance " + g.bondTolerance);
JV.StateCreator.appendCmd (str, "set defaultLattice " + JW.Escape.eP (g.ptDefaultLattice));
JV.StateCreator.appendCmd (str, "set defaultLoadFilter " + JU.PT.esc (g.defaultLoadFilter));
JV.StateCreator.appendCmd (str, "set defaultLoadScript \"\"");
if (g.defaultLoadScript.length > 0) g.setS ("defaultLoadScript", g.defaultLoadScript);
JV.StateCreator.appendCmd (str, "set defaultStructureDssp " + g.defaultStructureDSSP);
var sMode = this.viewer.getDefaultVdwNameOrData (-2147483648, null, null);
JV.StateCreator.appendCmd (str, "set defaultVDW " + sMode);
if (sMode.equals ("User")) JV.StateCreator.appendCmd (str, this.viewer.getDefaultVdwNameOrData (2147483647, null, null));
JV.StateCreator.appendCmd (str, "set forceAutoBond " + g.forceAutoBond);
JV.StateCreator.appendCmd (str, "#set defaultDirectory " + JU.PT.esc (g.defaultDirectory));
JV.StateCreator.appendCmd (str, "#set loadFormat " + JU.PT.esc (g.loadFormat));
JV.StateCreator.appendCmd (str, "#set loadLigandFormat " + JU.PT.esc (g.loadLigandFormat));
JV.StateCreator.appendCmd (str, "#set smilesUrlFormat " + JU.PT.esc (g.smilesUrlFormat));
JV.StateCreator.appendCmd (str, "#set nihResolverFormat " + JU.PT.esc (g.nihResolverFormat));
JV.StateCreator.appendCmd (str, "#set pubChemFormat " + JU.PT.esc (g.pubChemFormat));
JV.StateCreator.appendCmd (str, "#set edsUrlFormat " + JU.PT.esc (g.edsUrlFormat));
JV.StateCreator.appendCmd (str, "#set edsUrlCutoff " + JU.PT.esc (g.edsUrlCutoff));
JV.StateCreator.appendCmd (str, "set bondingVersion " + g.bondingVersion);
JV.StateCreator.appendCmd (str, "set legacyAutoBonding " + g.legacyAutoBonding);
JV.StateCreator.appendCmd (str, "set legacyHAddition " + g.legacyHAddition);
JV.StateCreator.appendCmd (str, "set minBondDistance " + g.minBondDistance);
JV.StateCreator.appendCmd (str, "set minimizationCriterion  " + g.minimizationCriterion);
JV.StateCreator.appendCmd (str, "set minimizationSteps  " + g.minimizationSteps);
JV.StateCreator.appendCmd (str, "set pdbAddHydrogens " + (htParams != null && htParams.get ("pdbNoHydrogens") !== Boolean.TRUE ? g.pdbAddHydrogens : false));
JV.StateCreator.appendCmd (str, "set pdbGetHeader " + g.pdbGetHeader);
JV.StateCreator.appendCmd (str, "set pdbSequential " + g.pdbSequential);
JV.StateCreator.appendCmd (str, "set percentVdwAtom " + g.percentVdwAtom);
JV.StateCreator.appendCmd (str, "set smallMoleculeMaxAtoms " + g.smallMoleculeMaxAtoms);
JV.StateCreator.appendCmd (str, "set smartAromatic " + g.smartAromatic);
if (g.zeroBasedXyzRasmol) JV.StateCreator.appendCmd (str, "set zeroBasedXyzRasmol true");
return str.toString ();
}, "java.util.Map");
$_V(c$, "getAllSettings", 
function (prefix) {
var g = this.viewer.global;
var commands =  new JU.SB ();
var list =  new Array (g.htBooleanParameterFlags.size () + g.htNonbooleanParameterValues.size () + g.htUserVariables.size ());
var n = 0;
var _prefix = "_" + prefix;
for (var key, $key = g.htBooleanParameterFlags.keySet ().iterator (); $key.hasNext () && ((key = $key.next ()) || true);) {
if (prefix == null || key.indexOf (prefix) == 0 || key.indexOf (_prefix) == 0) list[n++] = (key.indexOf ("_") == 0 ? key + " = " : "set " + key + " ") + g.htBooleanParameterFlags.get (key);
}
for (var key, $key = g.htNonbooleanParameterValues.keySet ().iterator (); $key.hasNext () && ((key = $key.next ()) || true);) {
if (key.charAt (0) != '@' && (prefix == null || key.indexOf (prefix) == 0 || key.indexOf (_prefix) == 0)) {
var value = g.htNonbooleanParameterValues.get (key);
if (Clazz.instanceOf (value, String)) value = JV.StateCreator.chop (JU.PT.esc (value));
list[n++] = (key.indexOf ("_") == 0 ? key + " = " : "set " + key + " ") + value;
}}
for (var key, $key = g.htUserVariables.keySet ().iterator (); $key.hasNext () && ((key = $key.next ()) || true);) {
if (prefix == null || key.indexOf (prefix) == 0) {
var value = g.htUserVariables.get (key);
var s = value.asString ();
list[n++] = key + " " + (key.startsWith ("@") ? "" : "= ") + (value.tok == 4 ? JV.StateCreator.chop (JU.PT.esc (s)) : s);
}}
java.util.Arrays.sort (list, 0, n);
for (var i = 0; i < n; i++) if (list[i] != null) JV.StateCreator.appendCmd (commands, list[i]);

commands.append ("\n");
return commands.toString ();
}, "~S");
c$.chop = $_M(c$, "chop", 
($fz = function (s) {
var len = s.length;
if (len < 512) return s;
var sb =  new JU.SB ();
var sep = "\"\\\n    + \"";
var pt = 0;
for (var i = 72; i < len; pt = i, i += 72) {
while (s.charAt (i - 1) == '\\') i++;

sb.append ((pt == 0 ? "" : sep)).append (s.substring (pt, i));
}
sb.append (sep).append (s.substring (pt, len));
return sb.toString ();
}, $fz.isPrivate = true, $fz), "~S");
$_V(c$, "getAtomShapeState", 
function (shape) {
this.clearTemp ();
var type = JV.JC.shapeClassBases[shape.shapeID];
if (shape.bsSizeSet != null) for (var i = shape.bsSizeSet.nextSetBit (0); i >= 0; i = shape.bsSizeSet.nextSetBit (i + 1)) JW.BSUtil.setMapBitSet (this.temp, i, i, type + (shape.mads[i] < 0 ? " on" : " " + shape.mads[i] / 2000));

if (shape.bsColixSet != null) for (var i = shape.bsColixSet.nextSetBit (0); i >= 0; i = shape.bsColixSet.nextSetBit (i + 1)) JW.BSUtil.setMapBitSet (this.temp2, i, i, J.shape.Shape.getColorCommand (type, shape.paletteIDs[i], shape.colixes[i], shape.translucentAllowed));

var s = this.getCommands (this.temp, this.temp2, "select");
this.clearTemp ();
return s;
}, "J.shape.AtomShape");
$_V(c$, "getFunctionCalls", 
function (f) {
if (f == null) f = "";
var s =  new JU.SB ();
var pt = f.indexOf ("*");
var isGeneric = (pt >= 0);
var isStatic = (f.indexOf ("static_") == 0);
var namesOnly = (f.equalsIgnoreCase ("names") || f.equalsIgnoreCase ("static_names"));
if (namesOnly) f = "";
if (isGeneric) f = f.substring (0, pt);
f = f.toLowerCase ();
if (isStatic || f.length == 0) this.addFunctions (s, JV.Viewer.staticFunctions, f, isGeneric, namesOnly);
if (!isStatic || f.length == 0) this.addFunctions (s, this.viewer.localFunctions, f, isGeneric, namesOnly);
return s.toString ();
}, "~S");
$_M(c$, "addFunctions", 
($fz = function (s, ht, selectedFunction, isGeneric, namesOnly) {
var names =  new Array (ht.size ());
var n = 0;
for (var name, $name = ht.keySet ().iterator (); $name.hasNext () && ((name = $name.next ()) || true);) if (selectedFunction.length == 0 && !name.startsWith ("_") || name.equalsIgnoreCase (selectedFunction) || isGeneric && name.toLowerCase ().indexOf (selectedFunction) == 0) names[n++] = name;

java.util.Arrays.sort (names, 0, n);
for (var i = 0; i < n; i++) {
var f = ht.get (names[i]);
s.append (namesOnly ? f.getSignature () : f.toString ());
s.appendC ('\n');
}
}, $fz.isPrivate = true, $fz), "JU.SB,java.util.Map,~S,~B,~B");
c$.isTainted = $_M(c$, "isTainted", 
($fz = function (tainted, atomIndex, type) {
return (tainted != null && tainted[type] != null && tainted[type].get (atomIndex));
}, $fz.isPrivate = true, $fz), "~A,~N,~N");
$_V(c$, "getAtomicPropertyState", 
function (taintWhat, bsSelected) {
if (!this.viewer.global.preserveState) return "";
var bs;
var commands =  new JU.SB ();
for (var type = 0; type < 14; type++) if (taintWhat < 0 || type == taintWhat) if ((bs = (bsSelected != null ? bsSelected : this.viewer.getTaintedAtoms (type))) != null) this.getAtomicPropertyStateBuffer (commands, type, bs, null, null);

return commands.toString ();
}, "~N,JU.BS");
$_V(c$, "getAtomicPropertyStateBuffer", 
function (commands, type, bs, label, fData) {
if (!this.viewer.global.preserveState) return;
var s =  new JU.SB ();
var dataLabel = (label == null ? JM.AtomCollection.userSettableValues[type] : label) + " set";
var n = 0;
var isDefault = (type == 2);
var atoms = this.viewer.modelSet.atoms;
var tainted = this.viewer.modelSet.tainted;
if (bs != null) for (var i = bs.nextSetBit (0); i >= 0; i = bs.nextSetBit (i + 1)) {
s.appendI (i + 1).append (" ").append (atoms[i].getElementSymbol ()).append (" ").append (atoms[i].getInfo ().$replace (' ', '_')).append (" ");
switch (type) {
case 14:
if (i < fData.length) s.appendF (fData[i]);
break;
case 13:
s.appendI (atoms[i].getAtomNumber ());
break;
case 0:
s.append (atoms[i].getAtomName ());
break;
case 1:
s.append (atoms[i].getAtomType ());
break;
case 2:
if (JV.StateCreator.isTainted (tainted, i, 2)) isDefault = false;
s.appendF (atoms[i].x).append (" ").appendF (atoms[i].y).append (" ").appendF (atoms[i].z);
break;
case 12:
var v = atoms[i].getVibrationVector ();
if (v == null) v =  new JU.V3 ();
s.appendF (v.x).append (" ").appendF (v.y).append (" ").appendF (v.z);
break;
case 3:
s.appendI (atoms[i].getAtomicAndIsotopeNumber ());
break;
case 4:
s.appendI (atoms[i].getFormalCharge ());
break;
case 6:
s.appendF (atoms[i].getBondingRadius ());
break;
case 7:
s.appendI (atoms[i].getOccupancy100 ());
break;
case 8:
s.appendF (atoms[i].getPartialCharge ());
break;
case 9:
s.appendF (atoms[i].getBfactor100 () / 100);
break;
case 10:
s.appendI (atoms[i].getValence ());
break;
case 11:
s.appendF (atoms[i].getVanderwaalsRadiusFloat (this.viewer, J.constant.EnumVdw.AUTO));
break;
}
s.append (" ;\n");
++n;
}
if (n == 0) return;
if (isDefault) dataLabel += "(default)";
commands.append ("\n  DATA \"" + dataLabel + "\"\n").appendI (n).append (" ;\nJmol Property Data Format 1 -- Jmol ").append (JV.Viewer.getJmolVersion ()).append (";\n");
commands.appendSB (s);
commands.append ("  end \"" + dataLabel + "\";\n");
}, "JU.SB,~N,JU.BS,~S,~A");
$_V(c$, "getAtomDefs", 
function (names) {
var sb =  new JU.SB ();
for (var e, $e = names.entrySet ().iterator (); $e.hasNext () && ((e = $e.next ()) || true);) {
if (Clazz.instanceOf (e.getValue (), JU.BS)) sb.append ("{" + e.getKey () + "} <" + (e.getValue ()).cardinality () + " atoms>\n");
}
return sb.append ("\n").toString ();
}, "java.util.Map");
$_V(c$, "undoMoveAction", 
function (action, n) {
switch (action) {
case 4165:
case 4139:
switch (n) {
case -2:
this.viewer.undoClear ();
break;
case -1:
(action == 4165 ? this.viewer.actionStates : this.viewer.actionStatesRedo).clear ();
break;
case 0:
n = 2147483647;
default:
if (n > 100) n = (action == 4165 ? this.viewer.actionStates : this.viewer.actionStatesRedo).size ();
for (var i = 0; i < n; i++) this.undoMoveActionClear (0, action, true);

}
break;
}
}, "~N,~N");
$_V(c$, "undoMoveActionClear", 
function (taintedAtom, type, clearRedo) {
if (!this.viewer.global.preserveState) return;
var modelIndex = (taintedAtom >= 0 ? this.viewer.modelSet.atoms[taintedAtom].modelIndex : this.viewer.modelSet.modelCount - 1);
switch (type) {
case 4139:
case 4165:
this.viewer.stopMinimization ();
var s = "";
var list1;
var list2;
switch (type) {
default:
case 4165:
list1 = this.viewer.actionStates;
list2 = this.viewer.actionStatesRedo;
break;
case 4139:
list1 = this.viewer.actionStatesRedo;
list2 = this.viewer.actionStates;
if (this.viewer.actionStatesRedo.size () == 1) return;
break;
}
if (list1.size () == 0 || this.undoWorking) return;
this.undoWorking = true;
list2.add (0, list1.remove (0));
s = this.viewer.actionStatesRedo.get (0);
if (type == 4165 && list2.size () == 1) {
var pt = [1];
type = JU.PT.parseIntNext (s, pt);
taintedAtom = JU.PT.parseIntNext (s, pt);
this.undoMoveActionClear (taintedAtom, type, false);
}if (this.viewer.modelSet.models[modelIndex].isModelkit () || s.indexOf ("zap ") < 0) {
if (JW.Logger.debugging) this.viewer.log (s);
this.viewer.evalStringQuiet (s);
} else {
this.viewer.actionStates.clear ();
}break;
default:
if (this.undoWorking && clearRedo) return;
this.undoWorking = true;
var bs;
var sb =  new JU.SB ();
sb.append ("#" + type + " " + taintedAtom + " " + ( new java.util.Date ()) + "\n");
if (taintedAtom >= 0) {
bs = this.viewer.getModelUndeletedAtomsBitSet (modelIndex);
this.viewer.modelSet.taintAtoms (bs, type);
sb.append (this.getAtomicPropertyState (-1, null));
} else {
bs = this.viewer.getModelUndeletedAtomsBitSet (modelIndex);
sb.append ("zap ");
sb.append (JW.Escape.eBS (bs)).append (";");
this.getInlineData (sb, this.viewer.getModelExtract (bs, false, true, "MOL"), true, null);
sb.append ("set refreshing false;").append (this.viewer.actionManager.getPickingState ()).append (this.viewer.tm.getMoveToText (0, false)).append ("set refreshing true;");
}if (clearRedo) {
this.viewer.actionStates.add (0, sb.toString ());
this.viewer.actionStatesRedo.clear ();
} else {
this.viewer.actionStatesRedo.add (1, sb.toString ());
}if (this.viewer.actionStates.size () == 100) {
this.viewer.actionStates.remove (99);
}}
this.undoWorking = !clearRedo;
}, "~N,~N,~B");
$_V(c$, "syncScript", 
function (script, applet, port) {
var sm = this.viewer.statusManager;
if ("GET_GRAPHICS".equalsIgnoreCase (script)) {
sm.setSyncDriver (5);
sm.syncSend (script, applet, 0);
this.viewer.setBooleanProperty ("_syncMouse", false);
this.viewer.setBooleanProperty ("_syncScript", false);
return;
}if ("=".equals (applet)) {
applet = "~";
sm.setSyncDriver (2);
}var disableSend = "~".equals (applet);
if (port > 0 || !disableSend && !".".equals (applet)) {
sm.syncSend (script, applet, port);
if (!"*".equals (applet) || script.startsWith ("{")) return;
}if (script.equalsIgnoreCase ("on") || script.equalsIgnoreCase ("true")) {
sm.setSyncDriver (1);
return;
}if (script.equalsIgnoreCase ("off") || script.equalsIgnoreCase ("false")) {
sm.setSyncDriver (0);
return;
}if (script.equalsIgnoreCase ("slave")) {
sm.setSyncDriver (2);
return;
}var syncMode = sm.getSyncMode ();
if (syncMode == 0) return;
if (syncMode != 1) disableSend = false;
if (JW.Logger.debugging) JW.Logger.debug (this.viewer.htmlName + " syncing with script: " + script);
if (disableSend) sm.setSyncDriver (3);
if (script.indexOf ("Mouse: ") != 0) {
var jsvMode = JV.JC.getJSVSyncSignal (script);
switch (jsvMode) {
case -1:
break;
case 0:
if (disableSend) return;
case 7:
case 14:
if ((script = this.viewer.getJSV ().processSync (script, jsvMode)) == null) return;
}
this.viewer.evalStringQuietSync (script, true, false);
return;
}this.mouseScript (script);
if (disableSend) this.viewer.setSyncDriver (4);
}, "~S,~S,~N");
$_V(c$, "mouseScript", 
function (script) {
var tokens = JU.PT.getTokens (script);
var key = tokens[1];
try {
key = (key.toLowerCase () + "...............").substring (0, 15);
switch (("zoombyfactor...zoomby.........rotatezby......rotatexyby.....translatexyby..rotatemolecule.spinxyby.......rotatearcball..").indexOf (key)) {
case 0:
switch (tokens.length) {
case 3:
this.viewer.zoomByFactor (JU.PT.parseFloat (tokens[2]), 2147483647, 2147483647);
return;
case 5:
this.viewer.zoomByFactor (JU.PT.parseFloat (tokens[2]), JU.PT.parseInt (tokens[3]), JU.PT.parseInt (tokens[4]));
return;
}
break;
case 15:
switch (tokens.length) {
case 3:
this.viewer.zoomBy (JU.PT.parseInt (tokens[2]));
return;
}
break;
case 30:
switch (tokens.length) {
case 3:
this.viewer.rotateZBy (JU.PT.parseInt (tokens[2]), 2147483647, 2147483647);
return;
case 5:
this.viewer.rotateZBy (JU.PT.parseInt (tokens[2]), JU.PT.parseInt (tokens[3]), JU.PT.parseInt (tokens[4]));
}
break;
case 45:
this.viewer.rotateXYBy (JU.PT.parseFloat (tokens[2]), JU.PT.parseFloat (tokens[3]));
return;
case 60:
this.viewer.translateXYBy (JU.PT.parseInt (tokens[2]), JU.PT.parseInt (tokens[3]));
return;
case 75:
this.viewer.rotateSelected (JU.PT.parseFloat (tokens[2]), JU.PT.parseFloat (tokens[3]), null);
return;
case 90:
this.viewer.spinXYBy (JU.PT.parseInt (tokens[2]), JU.PT.parseInt (tokens[3]), JU.PT.parseFloat (tokens[4]));
return;
case 105:
this.viewer.rotateArcBall (JU.PT.parseInt (tokens[2]), JU.PT.parseInt (tokens[3]), JU.PT.parseFloat (tokens[4]));
return;
}
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
} else {
throw e;
}
}
this.viewer.showString ("error reading SYNC command: " + script, false);
}, "~S");
Clazz.defineStatics (c$,
"MAX_ACTION_UNDO", 100);
});
