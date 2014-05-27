Clazz.declarePackage ("J.script");
Clazz.load (["J.script.ScriptExpr"], "J.script.ScriptEval", ["java.lang.Boolean", "$.Float", "$.Thread", "java.util.Hashtable", "JU.BS", "$.List", "$.M3", "$.M4", "$.P3", "$.P4", "$.PT", "$.Quat", "$.SB", "$.V3", "J.api.Interface", "$.JmolParallelProcessor", "J.atomdata.RadiusData", "J.constant.EnumAnimationMode", "$.EnumPalette", "$.EnumStructure", "$.EnumVdw", "J.i18n.GT", "J.io.JmolBinary", "JM.BondSet", "$.Group", "J.script.FileLoadThread", "$.SV", "$.ScriptCompiler", "$.ScriptContext", "$.ScriptDelayThread", "$.ScriptInterruption", "$.ScriptManager", "$.ScriptMathProcessor", "$.T", "JW.BSUtil", "$.ColorEncoder", "$.Edge", "$.Elements", "$.Escape", "$.GData", "$.Logger", "$.Measure", "$.Parser", "$.SimpleUnitCell", "$.Txt", "JV.ActionManager", "$.FileManager", "$.JC", "$.StateManager", "$.Viewer"], function () {
c$ = Clazz.decorateAsClass (function () {
this.mathExt = null;
this.smilesExt = null;
this.sm = null;
this.isJS = false;
this.scriptDelayThread = null;
this.fileLoadThread = null;
this.allowJSThreads = true;
this.historyDisabled = false;
this.debugScript = false;
this.isCmdLine_C_Option = false;
this.isCmdLine_c_or_C_Option = false;
this.listCommands = false;
this.tQuiet = false;
this.executionStopped = false;
this.executionPaused = false;
this.executionStepping = false;
this.executing = false;
this.timeBeginExecution = 0;
this.timeEndExecution = 0;
this.mustResumeEval = false;
this.currentThread = null;
this.compiler = null;
this.definedAtomSets = null;
this.outputBuffer = null;
this.contextPath = "";
this.scriptFileName = null;
this.functionName = null;
this.$isStateScript = false;
this.scriptLevel = 0;
this.scriptReportingLevel = 0;
this.commandHistoryLevelMax = 0;
this.aatoken = null;
this.lineNumbers = null;
this.lineIndices = null;
this.script = null;
this.scriptExtensions = null;
this.pc = 0;
this.thisCommand = null;
this.fullCommand = null;
this.lineEnd = 0;
this.pcEnd = 0;
this.forceNoAddHydrogens = false;
this.parallelProcessor = null;
Clazz.instantialize (this, arguments);
}, J.script, "ScriptEval", J.script.ScriptExpr);
$_M(c$, "getMathExt", 
function () {
return (this.mathExt == null ? (this.mathExt = J.api.Interface.getOption ("scriptext.MathExt")).init (this) : this.mathExt);
});
$_M(c$, "getSmilesExt", 
function () {
return (this.smilesExt == null ? (this.smilesExt = J.api.Interface.getOption ("scriptext.SmilesExt")).init (this) : this.smilesExt);
});
$_V(c$, "getAllowJSThreads", 
function () {
return this.allowJSThreads;
});
$_M(c$, "doReport", 
function () {
return (!this.tQuiet && this.scriptLevel <= this.scriptReportingLevel);
});
$_V(c$, "getDefinedAtomSets", 
function () {
return this.definedAtomSets;
});
$_V(c$, "isStateScript", 
function () {
return this.$isStateScript;
});
$_V(c$, "getScript", 
function () {
return this.script;
});
Clazz.makeConstructor (c$, 
function () {
Clazz.superConstructor (this, J.script.ScriptEval, []);
this.currentThread = Thread.currentThread ();
});
$_V(c$, "setViewer", 
function (viewer) {
this.viewer = viewer;
this.compiler = (this.compiler == null ? viewer.compiler : this.compiler);
this.isJS = viewer.isSingleThreaded;
this.definedAtomSets = viewer.definedAtomSets;
return this;
}, "JV.Viewer");
$_V(c$, "setCompiler", 
function () {
this.viewer.compiler = this.compiler =  new J.script.ScriptCompiler (this.viewer);
});
$_V(c$, "compileScriptString", 
function (script, tQuiet) {
this.clearState (tQuiet);
this.contextPath = "[script]";
return this.compileScript (null, script, this.debugScript);
}, "~S,~B");
$_V(c$, "compileScriptFile", 
function (filename, tQuiet) {
this.clearState (tQuiet);
this.contextPath = filename;
return this.compileScriptFileInternal (filename, null, null, null);
}, "~S,~B");
$_V(c$, "evaluateCompiledScript", 
function (isCmdLine_c_or_C_Option, isCmdLine_C_Option, historyDisabled, listCommands, outputBuffer, allowThreads) {
var tempOpen = this.isCmdLine_C_Option;
this.isCmdLine_C_Option = isCmdLine_C_Option;
this.chk = this.isCmdLine_c_or_C_Option = isCmdLine_c_or_C_Option;
this.historyDisabled = historyDisabled;
this.outputBuffer = outputBuffer;
this.currentThread = Thread.currentThread ();
this.allowJSThreads = allowThreads;
this.listCommands = listCommands;
this.timeBeginExecution = System.currentTimeMillis ();
this.executionStopped = this.executionPaused = false;
this.executionStepping = false;
this.executing = true;
this.viewer.pushHoldRepaintWhy ("runEval");
this.setScriptExtensions ();
this.executeCommands (false, true);
this.isCmdLine_C_Option = tempOpen;
if (this.$isStateScript) J.script.ScriptManager.setStateScriptVersion (this.viewer, null);
}, "~B,~B,~B,~B,JU.SB,~B");
$_M(c$, "useThreads", 
function () {
return (!this.chk && !this.viewer.isHeadless () && !this.viewer.autoExit && this.viewer.haveDisplay && this.outputBuffer == null && this.allowJSThreads);
});
$_M(c$, "executeCommands", 
($fz = function (isTry, reportCompletion) {
var haveError = false;
try {
if (!this.dispatchCommands (false, false)) return;
} catch (e$$) {
if (Clazz.exceptionOf (e$$, Error)) {
var er = e$$;
{
this.viewer.handleError (er, false);
this.setErrorMessage ("" + er + " " + this.viewer.getShapeErrorState ());
this.errorMessageUntranslated = "" + er;
this.report (this.errorMessage);
haveError = true;
}
} else if (Clazz.exceptionOf (e$$, J.script.ScriptException)) {
var e = e$$;
{
if (Clazz.instanceOf (e, J.script.ScriptInterruption) && (!isTry || !e.isError)) {
return;
}if (isTry) {
this.viewer.setStringProperty ("_errormessage", "" + e);
return;
}this.setErrorMessage (e.toString ());
this.errorMessageUntranslated = e.getErrorMessageUntranslated ();
this.report (this.errorMessage);
this.viewer.notifyError ((this.errorMessage != null && this.errorMessage.indexOf ("java.lang.OutOfMemoryError") >= 0 ? "Error" : "ScriptException"), this.errorMessage, this.errorMessageUntranslated);
haveError = true;
}
} else {
throw e$$;
}
}
if (haveError || !this.isJS || !this.allowJSThreads) {
this.viewer.setTainted (true);
this.viewer.popHoldRepaint ("executeCommands" + " " + (this.scriptLevel > 0 ? "\u0001## REPAINT_IGNORE ##" : ""));
}this.timeEndExecution = System.currentTimeMillis ();
if (this.errorMessage == null && this.executionStopped) this.setErrorMessage ("execution interrupted");
 else if (!this.tQuiet && reportCompletion) this.viewer.scriptStatus ("Script completed");
this.executing = this.chk = this.isCmdLine_c_or_C_Option = this.historyDisabled = false;
var msg = this.getErrorMessageUntranslated ();
this.viewer.setErrorMessage (this.errorMessage, msg);
if (!this.tQuiet && reportCompletion) this.viewer.setScriptStatus ("Jmol script terminated", this.errorMessage, 1 + (this.timeEndExecution - this.timeBeginExecution), msg);
}, $fz.isPrivate = true, $fz), "~B,~B");
$_V(c$, "resumeEval", 
function (sc) {
this.setErrorMessage (null);
if (this.executionStopped || sc == null || !sc.mustResumeEval) {
this.resumeViewer ("resumeEval");
return;
}if (!this.executionPaused) sc.pc++;
this.thisContext = sc;
if (sc.scriptLevel > 0) this.scriptLevel = sc.scriptLevel - 1;
this.restoreScriptContext (sc, true, false, false);
this.executeCommands (sc.isTryCatch, this.scriptLevel <= 0);
}, "J.script.ScriptContext");
$_M(c$, "resumeViewer", 
($fz = function (why) {
this.viewer.setTainted (true);
this.viewer.popHoldRepaint (why);
this.viewer.queueOnHold = false;
}, $fz.isPrivate = true, $fz), "~S");
$_V(c$, "runScript", 
function (script) {
if (!this.viewer.isPreviewOnly ()) this.runScriptBuffer (script, this.outputBuffer);
}, "~S");
$_V(c$, "runScriptBuffer", 
function (script, outputBuffer) {
this.pushContext (null, "runScriptBuffer");
this.contextPath += " >> script() ";
this.outputBuffer = outputBuffer;
this.allowJSThreads = false;
if (this.compileScript (null, script + "\u0001## EDITOR_IGNORE ##" + "\u0001## REPAINT_IGNORE ##", false)) this.dispatchCommands (false, false);
this.popContext (false, false);
}, "~S,JU.SB");
$_V(c$, "checkScriptSilent", 
function (script) {
var sc = this.compiler.compile (null, script, false, true, false, true);
if (sc.errorType != null) return sc;
this.restoreScriptContext (sc, false, false, false);
this.chk = true;
this.isCmdLine_c_or_C_Option = this.isCmdLine_C_Option = false;
this.pc = 0;
try {
this.dispatchCommands (false, false);
} catch (e) {
if (Clazz.exceptionOf (e, J.script.ScriptException)) {
this.setErrorMessage (e.toString ());
sc = this.getScriptContext ("checkScriptSilent");
} else {
throw e;
}
}
this.chk = false;
return sc;
}, "~S");
c$.getContextTrace = $_M(c$, "getContextTrace", 
function (viewer, sc, sb, isTop) {
if (sb == null) sb =  new JU.SB ();
sb.append (J.script.ScriptError.getErrorLineMessage (sc.functionName, sc.scriptFileName, sc.lineNumbers[sc.pc], sc.pc, J.script.ScriptEval.statementAsString (viewer, sc.statement, (isTop ? sc.iToken : 9999), false)));
if (sc.parentContext != null) J.script.ScriptEval.getContextTrace (viewer, sc.parentContext, sb, false);
return sb;
}, "JV.Viewer,J.script.ScriptContext,JU.SB,~B");
$_V(c$, "setDebugging", 
function () {
this.debugScript = this.viewer.getBoolean (603979825);
this.debugHigh = (this.debugScript && JW.Logger.debugging);
});
$_V(c$, "haltExecution", 
function () {
this.resumePausedExecution ();
this.executionStopped = true;
});
$_V(c$, "pauseExecution", 
function (withDelay) {
if (this.chk || this.viewer.isHeadless ()) return;
if (withDelay && !this.isJS) this.delayScript (-100);
this.viewer.popHoldRepaint ("pauseExecution " + withDelay);
this.executionStepping = false;
this.executionPaused = true;
}, "~B");
$_V(c$, "stepPausedExecution", 
function () {
this.executionStepping = true;
this.executionPaused = false;
});
$_V(c$, "resumePausedExecution", 
function () {
this.executionPaused = false;
this.executionStepping = false;
});
$_V(c$, "isExecuting", 
function () {
return this.executing && !this.executionStopped;
});
$_V(c$, "isPaused", 
function () {
return this.executionPaused;
});
$_V(c$, "isStepping", 
function () {
return this.executionStepping;
});
$_V(c$, "isStopped", 
function () {
return this.executionStopped || !this.isJS && this.currentThread !== Thread.currentThread ();
});
$_V(c$, "getNextStatement", 
function () {
return (this.pc < this.aatoken.length ? J.script.ScriptError.getErrorLineMessage (this.functionName, this.scriptFileName, this.getLinenumber (null), this.pc, J.script.ScriptEval.statementAsString (this.viewer, this.aatoken[this.pc], -9999, this.debugHigh)) : "");
});
$_M(c$, "getCommand", 
($fz = function (pc, allThisLine, addSemi) {
if (pc >= this.lineIndices.length) return "";
if (allThisLine) {
var pt0 = -1;
var pt1 = this.script.length;
for (var i = 0; i < this.lineNumbers.length; i++) if (this.lineNumbers[i] == this.lineNumbers[pc]) {
if (pt0 < 0) pt0 = this.lineIndices[i][0];
pt1 = this.lineIndices[i][1];
} else if (this.lineNumbers[i] == 0 || this.lineNumbers[i] > this.lineNumbers[pc]) {
break;
}
var s = this.script;
if (s.indexOf ('\1') >= 0) s = s.substring (0, s.indexOf ('\1'));
if (pt1 == s.length - 1 && s.endsWith ("}")) pt1++;
return (pt0 == s.length || pt1 < pt0 ? "" : s.substring (Math.max (pt0, 0), Math.min (s.length, pt1)));
}var ichBegin = this.lineIndices[pc][0];
var ichEnd = this.lineIndices[pc][1];
var s = "";
if (ichBegin < 0 || ichEnd <= ichBegin || ichEnd > this.script.length) return "";
try {
s = this.script.substring (ichBegin, ichEnd);
if (s.indexOf ("\\\n") >= 0) s = JU.PT.rep (s, "\\\n", "  ");
if (s.indexOf ("\\\r") >= 0) s = JU.PT.rep (s, "\\\r", "  ");
if (s.length > 0 && !s.endsWith (";")) s += ";";
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
JW.Logger.error ("darn problem in Eval getCommand: ichBegin=" + ichBegin + " ichEnd=" + ichEnd + " len = " + this.script.length + "\n" + e);
} else {
throw e;
}
}
return s;
}, $fz.isPrivate = true, $fz), "~N,~B,~B");
$_M(c$, "logDebugScript", 
($fz = function (st, ifLevel) {
this.iToken = -9999;
if (this.debugHigh) {
if (st.length > 0) JW.Logger.debug (st[0].toString ());
for (var i = 1; i < st.length; ++i) if (st[i] != null) JW.Logger.debug (st[i].toString ());

var strbufLog =  new JU.SB ();
var s = (ifLevel > 0 ? "                          ".substring (0, ifLevel * 2) : "");
strbufLog.append (s).append (J.script.ScriptEval.statementAsString (this.viewer, st, this.iToken, this.debugHigh));
this.viewer.scriptStatus (strbufLog.toString ());
} else {
var cmd = this.getCommand (this.pc, false, false);
if (cmd !== "") this.viewer.scriptStatus (cmd);
}}, $fz.isPrivate = true, $fz), "~A,~N");
$_V(c$, "evaluateExpression", 
function (expr, asVariable) {
var e = ( new J.script.ScriptEval ()).setViewer (this.viewer);
try {
e.pushContext (null, "evalExp");
e.allowJSThreads = false;
} catch (e1) {
if (Clazz.exceptionOf (e1, J.script.ScriptException)) {
} else {
throw e1;
}
}
return (e.evaluate (expr, asVariable));
}, "~O,~B");
$_M(c$, "evaluate", 
($fz = function (expr, asVariable) {
try {
if (Clazz.instanceOf (expr, String)) {
if (this.compileScript (null, "e_x_p_r_e_s_s_i_o_n" + " = " + expr, false)) {
this.contextVariables = this.viewer.getContextVariables ();
this.setStatement (this.aatoken[0]);
return (asVariable ? this.parameterExpressionList (2, -1, false).get (0) : this.parameterExpressionString (2, 0));
}} else if (Clazz.instanceOf (expr, Array)) {
this.contextVariables = this.viewer.getContextVariables ();
var bs = this.atomExpression (expr, 0, 0, true, false, true, false);
return (asVariable ? J.script.SV.newV (10, bs) : bs);
}} catch (ex) {
if (Clazz.exceptionOf (ex, Exception)) {
JW.Logger.error ("Error evaluating: " + expr + "\n" + ex);
} else {
throw ex;
}
}
return (asVariable ? J.script.SV.getVariable ("ERROR") : "ERROR");
}, $fz.isPrivate = true, $fz), "~O,~B");
$_V(c$, "getAtomBitSet", 
function (atomExpression) {
if (Clazz.instanceOf (atomExpression, JU.BS)) return atomExpression;
var bs =  new JU.BS ();
try {
this.pushContext (null, "getAtomBitSet");
var scr = "select (" + atomExpression + ")";
scr = JU.PT.replaceAllCharacters (scr, "\n\r", "),(");
scr = JU.PT.rep (scr, "()", "(none)");
if (this.compileScript (null, scr, false)) {
this.st = this.aatoken[0];
bs = this.atomExpression (this.st, 1, 0, false, false, true, true);
}this.popContext (false, false);
} catch (ex) {
if (Clazz.exceptionOf (ex, Exception)) {
JW.Logger.error ("getAtomBitSet " + atomExpression + "\n" + ex);
} else {
throw ex;
}
}
return bs;
}, "~O");
$_V(c$, "getAtomBitSetVector", 
function (atomCount, atomExpression) {
var V =  new JU.List ();
var bs = this.getAtomBitSet (atomExpression);
for (var i = bs.nextSetBit (0); i >= 0; i = bs.nextSetBit (i + 1)) {
V.addLast (Integer.$valueOf (i));
}
return V;
}, "~N,~O");
$_M(c$, "compileScript", 
function (filename, strScript, debugCompiler) {
this.scriptFileName = filename;
strScript = this.fixScriptPath (strScript, filename);
this.restoreScriptContext (this.compiler.compile (filename, strScript, false, false, debugCompiler && JW.Logger.debugging, false), false, false, false);
this.$isStateScript = this.compiler.isStateScript;
this.forceNoAddHydrogens = (this.$isStateScript && this.script.indexOf ("pdbAddHydrogens") < 0);
var s = this.script;
this.pc = this.setScriptExtensions ();
if (!this.chk && this.viewer.scriptEditorVisible && strScript.indexOf ("\u0001## EDITOR_IGNORE ##") < 0) this.viewer.scriptStatus ("");
this.script = s;
return !this.$error;
}, "~S,~S,~B");
$_M(c$, "fixScriptPath", 
($fz = function (strScript, filename) {
if (filename != null && strScript.indexOf ("$SCRIPT_PATH$") >= 0) {
var path = filename;
var pt = Math.max (filename.lastIndexOf ("|"), filename.lastIndexOf ("/"));
path = path.substring (0, pt + 1);
strScript = JU.PT.rep (strScript, "$SCRIPT_PATH$/", path);
strScript = JU.PT.rep (strScript, "$SCRIPT_PATH$", path);
}return strScript;
}, $fz.isPrivate = true, $fz), "~S,~S");
$_M(c$, "setScriptExtensions", 
($fz = function () {
var extensions = this.scriptExtensions;
if (extensions == null) return 0;
var pt = extensions.indexOf ("##SCRIPT_STEP");
if (pt >= 0) {
this.executionStepping = true;
}pt = extensions.indexOf ("##SCRIPT_START=");
if (pt < 0) return 0;
pt = JU.PT.parseInt (extensions.substring (pt + 15));
if (pt == -2147483648) return 0;
for (this.pc = 0; this.pc < this.lineIndices.length; this.pc++) {
if (this.lineIndices[this.pc][0] > pt || this.lineIndices[this.pc][1] >= pt) break;
}
if (this.pc > 0 && this.pc < this.lineIndices.length && this.lineIndices[this.pc][0] > pt) --this.pc;
return this.pc;
}, $fz.isPrivate = true, $fz));
$_M(c$, "compileScriptFileInternal", 
($fz = function (filename, localPath, remotePath, scriptPath) {
if (filename.toLowerCase ().indexOf ("javascript:") == 0) return this.compileScript (filename, this.viewer.jsEval (filename.substring (11)), this.debugScript);
var data =  new Array (2);
data[0] = filename;
if (!this.viewer.getFileAsStringBin (data, true)) {
this.setErrorMessage ("io error reading " + data[0] + ": " + data[1]);
return false;
}if (("\n" + data[1]).indexOf ("\nJmolManifest.txt\n") >= 0) {
var path;
if (filename.endsWith (".all.pngj") || filename.endsWith (".all.png")) {
path = "|state.spt";
filename += "|";
} else {
data[0] = filename += "|JmolManifest.txt";
if (!this.viewer.getFileAsStringBin (data, true)) {
this.setErrorMessage ("io error reading " + data[0] + ": " + data[1]);
return false;
}path = J.io.JmolBinary.getManifestScriptPath (data[1]);
}if (path != null && path.length > 0) {
data[0] = filename = filename.substring (0, filename.lastIndexOf ("|")) + path;
if (!this.viewer.getFileAsStringBin (data, true)) {
this.setErrorMessage ("io error reading " + data[0] + ": " + data[1]);
return false;
}}}this.scriptFileName = filename;
data[1] = J.io.JmolBinary.getEmbeddedScript (data[1]);
var script = this.fixScriptPath (data[1], data[0]);
if (scriptPath == null) {
scriptPath = this.viewer.getFilePath (filename, false);
scriptPath = scriptPath.substring (0, Math.max (scriptPath.lastIndexOf ("|"), scriptPath.lastIndexOf ("/")));
}script = JV.FileManager.setScriptFileReferences (script, localPath, remotePath, scriptPath);
return this.compileScript (filename, script, this.debugScript);
}, $fz.isPrivate = true, $fz), "~S,~S,~S,~S");
$_V(c$, "evalFunctionFloat", 
function (func, params, values) {
try {
var p = params;
for (var i = 0; i < values.length; i++) p.get (i).value = Float.$valueOf (values[i]);

var f = func;
return J.script.SV.fValue (this.runFunctionAndRet (f, f.name, p, null, true, false, false));
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
return NaN;
} else {
throw e;
}
}
}, "~O,~O,~A");
$_V(c$, "getUserFunctionResult", 
function (name, params, tokenAtom) {
return this.runFunctionAndRet (null, name, params, tokenAtom, true, true, false);
}, "~S,JU.List,J.script.SV");
$_M(c$, "runFunctionAndRet", 
($fz = function ($function, name, params, tokenAtom, getReturn, setContextPath, allowThreads) {
if ($function == null) {
$function = this.viewer.getFunction (name);
if ($function == null) return null;
if (setContextPath) this.contextPath += " >> function " + name;
} else if (setContextPath) {
this.contextPath += " >> " + name;
}this.pushContext (null, "runFunctinoAndRet");
if (this.allowJSThreads) this.allowJSThreads = allowThreads;
var isTry = ($function.getTok () == 364558);
this.thisContext.isTryCatch = isTry;
this.thisContext.isFunction = !isTry;
this.functionName = name;
if (isTry) {
this.viewer.resetError ();
this.thisContext.displayLoadErrorsSave = this.viewer.displayLoadErrors;
this.thisContext.tryPt = ++J.script.ScriptEval.tryPt;
this.viewer.displayLoadErrors = false;
this.restoreFunction ($function, params, tokenAtom);
this.contextVariables.put ("_breakval", J.script.SV.newI (2147483647));
this.contextVariables.put ("_errorval", J.script.SV.newS (""));
var cv = this.contextVariables;
this.executeCommands (true, false);
while (this.thisContext.tryPt > J.script.ScriptEval.tryPt) this.popContext (false, false);

this.processTry (cv);
return null;
} else if (Clazz.instanceOf ($function, J.api.JmolParallelProcessor)) {
{
this.parallelProcessor = $function;
this.restoreFunction ($function, params, tokenAtom);
this.dispatchCommands (false, true);
($function).runAllProcesses (this.viewer);
}} else {
this.restoreFunction ($function, params, tokenAtom);
this.dispatchCommands (false, true);
}var v = (getReturn ? this.getContextVariableAsVariable ("_retval") : null);
this.popContext (false, false);
return v;
}, $fz.isPrivate = true, $fz), "J.api.JmolScriptFunction,~S,JU.List,J.script.SV,~B,~B,~B");
$_M(c$, "processTry", 
($fz = function (cv) {
this.viewer.displayLoadErrors = this.thisContext.displayLoadErrorsSave;
this.popContext (false, false);
var err = this.viewer.getParameter ("_errormessage");
if (err.length > 0) {
cv.put ("_errorval", J.script.SV.newS (err));
this.viewer.resetError ();
}cv.put ("_tryret", cv.get ("_retval"));
var ret = cv.get ("_tryret");
if (ret.value != null || ret.intValue != 2147483647) {
this.cmdReturn (ret);
return;
}var errMsg = (cv.get ("_errorval")).value;
if (errMsg.length == 0) {
var iBreak = (cv.get ("_breakval")).intValue;
if (iBreak != 2147483647) {
this.breakAt (this.pc - iBreak);
return;
}}if (this.pc + 1 < this.aatoken.length && this.aatoken[this.pc + 1][0].tok == 102412) {
var ct = this.aatoken[this.pc + 1][0];
if (ct.contextVariables != null && ct.name0 != null) ct.contextVariables.put (ct.name0, J.script.SV.newS (errMsg));
ct.intValue = (errMsg.length > 0 ? 1 : -1) * Math.abs (ct.intValue);
}}, $fz.isPrivate = true, $fz), "java.util.Map");
$_M(c$, "breakAt", 
($fz = function (pt) {
if (pt < 0) {
this.getContextVariableAsVariable ("_breakval").intValue = -pt;
this.pcEnd = this.pc;
return;
}var ptEnd = Math.abs (this.aatoken[pt][0].intValue);
var tok = this.aatoken[pt][0].tok;
if (tok == 102411 || tok == 102413) {
this.theToken = this.aatoken[ptEnd--][0];
var ptNext = Math.abs (this.theToken.intValue);
if (this.theToken.tok != 1150985) this.theToken.intValue = -ptNext;
} else {
this.pc = -1;
while (this.pc != pt && this.thisContext != null) {
while (this.thisContext != null && !J.script.ScriptCompiler.isBreakableContext (this.thisContext.token.tok)) this.popContext (true, false);

this.pc = this.thisContext.pc;
this.popContext (true, false);
}
}this.pc = ptEnd;
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "restoreFunction", 
($fz = function (f, params, tokenAtom) {
var $function = f;
this.aatoken = $function.aatoken;
this.lineNumbers = $function.lineNumbers;
this.lineIndices = $function.lineIndices;
this.script = $function.script;
this.pc = 0;
if ($function.names != null) {
this.contextVariables =  new java.util.Hashtable ();
$function.setVariables (this.contextVariables, params);
}if (tokenAtom != null) this.contextVariables.put ("_x", tokenAtom);
}, $fz.isPrivate = true, $fz), "J.api.JmolScriptFunction,JU.List,J.script.SV");
$_V(c$, "clearDefinedVariableAtomSets", 
function () {
this.definedAtomSets.remove ("# variable");
});
$_M(c$, "defineSets", 
($fz = function () {
if (!this.definedAtomSets.containsKey ("# static")) {
for (var i = 0; i < JV.JC.predefinedStatic.length; i++) this.defineAtomSet (JV.JC.predefinedStatic[i]);

this.defineAtomSet ("# static");
}if (this.definedAtomSets.containsKey ("# variable")) return;
for (var i = 0; i < JV.JC.predefinedVariable.length; i++) this.defineAtomSet (JV.JC.predefinedVariable[i]);

for (var i = JW.Elements.elementNumberMax; --i >= 0; ) {
var definition = " elemno=" + i;
this.defineAtomSet ("@" + JW.Elements.elementNameFromNumber (i) + definition);
this.defineAtomSet ("@_" + JW.Elements.elementSymbolFromNumber (i) + definition);
}
for (var i = 4; --i >= 0; ) {
var definition = "@" + JW.Elements.altElementNameFromIndex (i) + " _e=" + JW.Elements.altElementNumberFromIndex (i);
this.defineAtomSet (definition);
}
for (var i = JW.Elements.altElementMax; --i >= 4; ) {
var ei = JW.Elements.altElementNumberFromIndex (i);
var def = " _e=" + ei;
var definition = "@_" + JW.Elements.altElementSymbolFromIndex (i);
this.defineAtomSet (definition + def);
definition = "@_" + JW.Elements.altIsotopeSymbolFromIndex (i);
this.defineAtomSet (definition + def);
definition = "@_" + JW.Elements.altIsotopeSymbolFromIndex2 (i);
this.defineAtomSet (definition + def);
definition = "@" + JW.Elements.altElementNameFromIndex (i);
if (definition.length > 1) this.defineAtomSet (definition + def);
var e = JW.Elements.getElementNumber (ei);
ei = JW.Elements.getNaturalIsotope (e);
if (ei > 0) {
def = JW.Elements.elementSymbolFromNumber (e);
this.defineAtomSet ("@_" + def + ei + " _e=" + e);
this.defineAtomSet ("@_" + ei + def + " _e=" + e);
}}
this.defineAtomSet ("# variable");
}, $fz.isPrivate = true, $fz));
$_M(c$, "defineAtomSet", 
($fz = function (script) {
if (script.indexOf ("#") == 0) {
this.definedAtomSets.put (script, Boolean.TRUE);
return;
}var sc = this.compiler.compile ("#predefine", script, true, false, false, false);
if (sc.errorType != null) {
this.viewer.scriptStatus ("JmolConstants.java ERROR: predefined set compile error:" + script + "\ncompile error:" + sc.errorMessageUntranslated);
return;
}if (sc.aatoken.length != 1) {
this.viewer.scriptStatus ("JmolConstants.java ERROR: predefinition does not have exactly 1 command:" + script);
return;
}var statement = sc.aatoken[0];
if (statement.length <= 2) {
this.viewer.scriptStatus ("JmolConstants.java ERROR: bad predefinition length:" + script);
return;
}var tok = statement[1].tok;
if (!J.script.T.tokAttr (tok, 1073741824) && !J.script.T.tokAttr (tok, 3145728)) {
this.viewer.scriptStatus ("JmolConstants.java ERROR: invalid variable name:" + script);
return;
}var name = (statement[1].value).toLowerCase ();
if (name.startsWith ("dynamic_")) name = "!" + name.substring (8);
this.definedAtomSets.put (name, statement);
}, $fz.isPrivate = true, $fz), "~S");
$_V(c$, "lookupIdentifierValue", 
function (identifier) {
var bs = this.lookupValue (identifier, false);
if (bs != null) return JW.BSUtil.copy (bs);
bs = this.getAtomBits (1073741824, identifier);
return (bs == null ?  new JU.BS () : bs);
}, "~S");
$_M(c$, "lookupValue", 
($fz = function (setName, plurals) {
if (this.chk) {
return  new JU.BS ();
}this.defineSets ();
setName = setName.toLowerCase ();
var value = this.definedAtomSets.get (setName);
var isDynamic = false;
if (value == null) {
value = this.definedAtomSets.get ("!" + setName);
isDynamic = (value != null);
}if (Clazz.instanceOf (value, JU.BS)) return value;
if (Clazz.instanceOf (value, Array)) {
this.pushContext (null, "lookupValue");
var bs = this.atomExpression (value, -2, 0, true, false, true, true);
this.popContext (false, false);
if (!isDynamic) this.definedAtomSets.put (setName, bs);
return bs;
}if (plurals) return null;
var len = setName.length;
if (len < 5) return null;
if (setName.charAt (len - 1) != 's') return null;
if (setName.endsWith ("ies")) setName = setName.substring (0, len - 3) + 'y';
 else setName = setName.substring (0, len - 1);
return this.lookupValue (setName, true);
}, $fz.isPrivate = true, $fz), "~S,~B");
$_V(c$, "deleteAtomsInVariables", 
function (bsDeleted) {
for (var entry, $entry = this.definedAtomSets.entrySet ().iterator (); $entry.hasNext () && ((entry = $entry.next ()) || true);) {
var value = entry.getValue ();
if (Clazz.instanceOf (value, JU.BS)) {
JW.BSUtil.deleteBits (value, bsDeleted);
if (!entry.getKey ().startsWith ("!")) this.viewer.setUserVariable ("@" + entry.getKey (), J.script.SV.newV (10, value));
}}
}, "JU.BS");
$_V(c$, "getContextVariables", 
function () {
return this.contextVariables;
});
$_V(c$, "getThisContext", 
function () {
return this.thisContext;
});
$_M(c$, "clearState", 
($fz = function (tQuiet) {
this.thisContext = null;
this.scriptLevel = 0;
this.setErrorMessage (null);
this.contextPath = "";
this.tQuiet = tQuiet;
}, $fz.isPrivate = true, $fz), "~B");
$_V(c$, "pushContextDown", 
function (why) {
this.scriptLevel--;
this.pushContext2 (null, why);
}, "~S");
$_M(c$, "pushContext", 
($fz = function (token, why) {
if (this.scriptLevel == 100) this.error (44);
this.pushContext2 (token, why);
}, $fz.isPrivate = true, $fz), "J.script.ContextToken,~S");
$_M(c$, "pushContext2", 
($fz = function (token, why) {
this.thisContext = this.getScriptContext (why);
this.thisContext.token = token;
if (token == null) {
this.scriptLevel = ++this.thisContext.scriptLevel;
} else {
this.thisContext.scriptLevel = -1;
this.contextVariables =  new java.util.Hashtable ();
if (token.contextVariables != null) for (var key, $key = token.contextVariables.keySet ().iterator (); $key.hasNext () && ((key = $key.next ()) || true);) J.script.ScriptCompiler.addContextVariable (this.contextVariables, key);

}if (this.debugHigh || this.isCmdLine_c_or_C_Option) JW.Logger.info ("-->>----------------------".substring (0, Math.min (15, this.scriptLevel + 5)) + this.scriptLevel + " " + this.scriptFileName + " " + token + " " + this.thisContext.id);
}, $fz.isPrivate = true, $fz), "J.script.ContextToken,~S");
$_V(c$, "getScriptContext", 
function (why) {
var context =  new J.script.ScriptContext ();
if (this.debugHigh) JW.Logger.info ("creating context " + context.id + " for " + why);
context.scriptLevel = this.scriptLevel;
context.parentContext = this.thisContext;
context.contextPath = this.contextPath;
context.scriptFileName = this.scriptFileName;
context.parallelProcessor = this.parallelProcessor;
context.functionName = this.functionName;
context.script = this.script;
context.lineNumbers = this.lineNumbers;
context.lineIndices = this.lineIndices;
context.aatoken = this.aatoken;
context.statement = this.st;
context.statementLength = this.slen;
context.pc = context.pc0 = this.pc;
context.lineEnd = this.lineEnd;
context.pcEnd = this.pcEnd;
context.iToken = this.iToken;
context.theToken = this.theToken;
context.theTok = this.theTok;
context.outputBuffer = this.outputBuffer;
context.vars = this.contextVariables;
context.isStateScript = this.$isStateScript;
context.errorMessage = this.errorMessage;
context.errorType = this.errorType;
context.iCommandError = this.iCommandError;
context.chk = this.chk;
context.executionStepping = this.executionStepping;
context.executionPaused = this.executionPaused;
context.scriptExtensions = this.scriptExtensions;
context.mustResumeEval = this.mustResumeEval;
context.allowJSThreads = this.allowJSThreads;
return context;
}, "~S");
$_M(c$, "popContext", 
function (isFlowCommand, statementOnly) {
if (this.thisContext == null) return;
if (this.thisContext.scriptLevel > 0) this.scriptLevel = this.thisContext.scriptLevel - 1;
var scTemp = (isFlowCommand ? this.getScriptContext ("popFlow") : null);
this.restoreScriptContext (this.thisContext, true, isFlowCommand, statementOnly);
if (scTemp != null) this.restoreScriptContext (scTemp, true, false, true);
if (this.debugHigh || this.isCmdLine_c_or_C_Option) JW.Logger.info ("--<<------------".substring (0, Math.min (15, this.scriptLevel + 5)) + (this.scriptLevel + 1) + " " + this.scriptFileName + " isFlow " + isFlowCommand + " thisContext=" + (this.thisContext == null ? "" : "" + this.thisContext.id) + " pc=" + this.pc);
}, "~B,~B");
$_M(c$, "restoreScriptContext", 
function (context, isPopContext, isFlowCommand, statementOnly) {
this.executing = !this.chk;
if (context == null) return;
if (this.debugHigh || this.isCmdLine_c_or_C_Option) JW.Logger.info ("--r------------".substring (0, Math.min (15, this.scriptLevel + 5)) + this.scriptLevel + " " + this.scriptFileName + " isPop " + isPopContext + " isFlow " + isFlowCommand + " context.id=" + context.id + " pc=" + this.pc + "-->" + context.pc);
if (!isFlowCommand) {
this.st = context.statement;
this.slen = context.statementLength;
this.pc = context.pc;
this.lineEnd = context.lineEnd;
this.pcEnd = context.pcEnd;
if (statementOnly) return;
}this.mustResumeEval = context.mustResumeEval;
this.script = context.script;
this.lineNumbers = context.lineNumbers;
this.lineIndices = context.lineIndices;
this.aatoken = context.aatoken;
this.contextVariables = context.vars;
this.scriptExtensions = context.scriptExtensions;
if (isPopContext) {
this.contextPath = context.contextPath;
var pt = (this.contextPath == null ? -1 : this.contextPath.indexOf (" >> "));
if (pt >= 0) this.contextPath = this.contextPath.substring (0, pt);
this.scriptFileName = context.scriptFileName;
this.parallelProcessor = context.parallelProcessor;
this.functionName = context.functionName;
this.iToken = context.iToken;
this.theToken = context.theToken;
this.theTok = context.theTok;
this.outputBuffer = context.outputBuffer;
this.$isStateScript = context.isStateScript;
this.thisContext = context.parentContext;
this.allowJSThreads = context.allowJSThreads;
} else {
this.$error = (context.errorType != null);
this.errorMessage = context.errorMessage;
this.errorMessageUntranslated = context.errorMessageUntranslated;
this.iCommandError = context.iCommandError;
this.errorType = context.errorType;
}}, "J.script.ScriptContext,~B,~B,~B");
$_M(c$, "setException", 
function (sx, msg, untranslated) {
sx.untranslated = (untranslated == null ? msg : untranslated);
var isThrown = "!".equals (untranslated);
this.errorType = msg;
this.iCommandError = this.pc;
if (sx.message == null) {
sx.message = "";
return;
}var s = J.script.ScriptEval.getContextTrace (this.viewer, this.getScriptContext ("setException"), null, true).toString ();
while (this.thisContext != null && !this.thisContext.isTryCatch) this.popContext (false, false);

sx.message += s;
sx.untranslated += s;
if (isThrown) this.resumeViewer ("throw context");
if (isThrown || this.thisContext != null || this.chk || msg.indexOf ("NOTE: file recognized as a script file: ") >= 0) return;
JW.Logger.error ("eval ERROR: " + this.toString ());
if (this.viewer.autoExit) this.viewer.exitJmol ();
}, "J.script.ScriptException,~S,~S");
c$.statementAsString = $_M(c$, "statementAsString", 
function (viewer, statement, iTok, doLogMessages) {
if (statement.length == 0) return "";
var sb =  new JU.SB ();
var tok = statement[0].tok;
switch (tok) {
case 0:
return statement[0].value;
case 1150985:
if (statement.length == 2 && (statement[1].tok == 135368713 || statement[1].tok == 102436)) return ((statement[1].value)).toString ();
}
var useBraces = true;
var inBrace = false;
var inClauseDefine = false;
var setEquals = (statement.length > 1 && tok == 1085443 && statement[0].value.equals ("") && (statement[0].intValue == 61 || statement[0].intValue == 35) && statement[1].tok != 1048577);
var len = statement.length;
for (var i = 0; i < len; ++i) {
var token = statement[i];
if (token == null) {
len = i;
break;
}if (iTok == i - 1) sb.append (" <<");
if (i != 0) sb.appendC (' ');
if (i == 2 && setEquals) {
if ((setEquals = (token.tok != 269484436)) || statement[0].intValue == 35) {
sb.append (setEquals ? "= " : "== ");
if (!setEquals) continue;
}}if (iTok == i && token.tok != 1048578) sb.append (">> ");
switch (token.tok) {
case 1048577:
if (useBraces) sb.append ("{");
continue;
case 1048578:
if (inClauseDefine && i == statement.length - 1) useBraces = false;
if (useBraces) sb.append ("}");
continue;
case 269484096:
case 269484097:
break;
case 1048586:
case 1048590:
inBrace = (token.tok == 1048586);
break;
case 1060866:
if (i > 0 && (token.value).equals ("define")) {
sb.append ("@");
if (i + 1 < statement.length && statement[i + 1].tok == 1048577) {
if (!useBraces) inClauseDefine = true;
useBraces = true;
}continue;
}break;
case 1048589:
sb.append ("true");
continue;
case 1048588:
sb.append ("false");
continue;
case 135280132:
break;
case 2:
sb.appendI (token.intValue);
continue;
case 8:
case 9:
case 10:
sb.append (J.script.SV.sValue (token));
continue;
case 7:
case 6:
sb.append ((token).escape ());
continue;
case 5:
sb.appendC ('^');
continue;
case 1048615:
if (token.intValue != 2147483647) sb.appendI (token.intValue);
 else sb.append (JM.Group.getSeqcodeStringFor (J.script.ScriptExpr.getSeqCode (token)));
token = statement[++i];
sb.appendC (' ');
sb.append (inBrace ? "-" : "- ");
case 1048614:
if (token.intValue != 2147483647) sb.appendI (token.intValue);
 else sb.append (JM.Group.getSeqcodeStringFor (J.script.ScriptExpr.getSeqCode (token)));
continue;
case 1048609:
sb.append ("*:");
sb.append (viewer.getChainIDStr (token.intValue));
continue;
case 1048607:
sb.append ("*%");
if (token.value != null) sb.append (token.value.toString ());
continue;
case 1048610:
sb.append ("*/");
case 1048611:
case 3:
if (token.intValue < 2147483647) {
sb.append (JW.Escape.escapeModelFileNumber (token.intValue));
} else {
sb.append ("" + token.value);
}continue;
case 1048613:
sb.appendC ('[');
sb.append (JM.Group.getGroup3For (token.intValue));
sb.appendC (']');
continue;
case 1048612:
sb.appendC ('[');
sb.appendO (token.value);
sb.appendC (']');
continue;
case 1048608:
sb.append ("*.");
break;
case 1095761925:
if (Clazz.instanceOf (token.value, JU.P3)) {
var pt = token.value;
sb.append ("cell=").append (JW.Escape.eP (pt));
continue;
}break;
case 4:
sb.append ("\"").appendO (token.value).append ("\"");
continue;
case 269484436:
case 269484434:
case 269484433:
case 269484432:
case 269484435:
case 269484438:
if (token.intValue == 1716520985) {
sb.append (statement[++i].value).append (" ");
} else if (token.intValue != 2147483647) sb.append (J.script.T.nameOf (token.intValue)).append (" ");
break;
case 364558:
continue;
case 1150985:
sb.append ("end");
continue;
default:
if (J.script.T.tokAttr (token.tok, 1073741824) || !doLogMessages) break;
sb.appendC ('\n').append (token.toString ()).appendC ('\n');
continue;
}
if (token.value != null) sb.append (token.value.toString ());
}
if (iTok >= len - 1 && iTok != 9999) sb.append (" <<");
return sb.toString ();
}, "JV.Viewer,~A,~N,~B");
$_V(c$, "setObjectPropSafe", 
function (id, tokCommand) {
try {
return this.setObjectProp (id, tokCommand, -1);
} catch (e) {
if (Clazz.exceptionOf (e, J.script.ScriptException)) {
return null;
} else {
throw e;
}
}
}, "~S,~N");
$_V(c$, "restrictSelected", 
function (isBond, doInvert) {
if (!this.chk) this.sm.restrictSelected (isBond, doInvert);
}, "~B,~B");
$_V(c$, "showString", 
function (str) {
this.showStringPrint (str, false);
}, "~S");
$_M(c$, "showStringPrint", 
function (str, isPrint) {
if (this.chk || str == null) return;
if (this.outputBuffer != null) this.outputBuffer.append (str).appendC ('\n');
 else this.viewer.showString (str, isPrint);
}, "~S,~B");
$_M(c$, "report", 
function (s) {
if (this.chk) return;
if (this.outputBuffer != null) {
this.outputBuffer.append (s).appendC ('\n');
return;
}this.viewer.scriptStatus (s);
}, "~S");
$_M(c$, "addProcess", 
($fz = function (vProcess, pc, pt) {
if (this.parallelProcessor == null) return;
var statements =  new Array (pt);
for (var i = 0; i < vProcess.size (); i++) statements[i + 1 - pc] = vProcess.get (i);

var context = this.getScriptContext ("addProcess");
context.aatoken = statements;
context.pc = 1 - pc;
context.pcEnd = pt;
this.parallelProcessor.addProcess ("p" + (++J.script.ScriptEval.iProcess), context);
}, $fz.isPrivate = true, $fz), "JU.List,~N,~N");
$_M(c$, "checkContinue", 
($fz = function () {
if (this.executionStopped) return false;
if (this.executionStepping && this.isCommandDisplayable (this.pc)) {
this.viewer.setScriptStatus ("Next: " + this.getNextStatement (), "stepping -- type RESUME to continue", 0, null);
this.executionPaused = true;
} else if (!this.executionPaused) {
return true;
}if (JW.Logger.debugging) {
JW.Logger.debug ("script execution paused at command " + (this.pc + 1) + " level " + this.scriptLevel + ": " + this.thisCommand);
}this.refresh (false);
while (this.executionPaused) {
this.viewer.popHoldRepaint ("pause \u0001## REPAINT_IGNORE ##");
var script = this.viewer.getInsertedCommand ();
if (script.length > 0) {
this.resumePausedExecution ();
this.setErrorMessage (null);
var scSave = this.getScriptContext ("script insertion");
this.pc--;
try {
this.runScript (script);
} catch (e$$) {
if (Clazz.exceptionOf (e$$, Exception)) {
var e = e$$;
{
this.setErrorMessage ("" + e);
}
} else if (Clazz.exceptionOf (e$$, Error)) {
var er = e$$;
{
this.setErrorMessage ("" + er);
}
} else {
throw e$$;
}
}
if (this.$error) {
this.report (this.errorMessage);
this.setErrorMessage (null);
}this.restoreScriptContext (scSave, true, false, false);
this.pauseExecution (false);
}this.doDelay (-100);
this.viewer.pushHoldRepaintWhy ("pause");
}
this.notifyResumeStatus ();
return !this.$error && !this.executionStopped;
}, $fz.isPrivate = true, $fz));
$_M(c$, "delayScript", 
function (millis) {
if (this.viewer.autoExit) return;
this.stopScriptThreads ();
this.scriptDelayThread =  new J.script.ScriptDelayThread (this, this.viewer, millis);
this.scriptDelayThread.run ();
}, "~N");
$_M(c$, "doDelay", 
($fz = function (millis) {
if (!this.useThreads ()) return;
if (this.isJS) throw  new J.script.ScriptInterruption (this, "delay", millis);
this.delayScript (millis);
}, $fz.isPrivate = true, $fz), "~N");
$_V(c$, "evalParallel", 
function (context, shapeManager) {
return this.getCmdExt ().evalParallel (context, shapeManager);
}, "J.script.ScriptContext,JV.ShapeManager");
$_M(c$, "isCommandDisplayable", 
($fz = function (i) {
if (i >= this.aatoken.length || i >= this.pcEnd || this.aatoken[i] == null) return false;
return (this.lineIndices[i][1] > this.lineIndices[i][0]);
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "loadFileAsync", 
function (prefix, filename, i, doClear) {
prefix = "cache://local" + prefix;
var key = this.pc + "_" + i;
var cacheName;
if (this.thisContext == null || this.thisContext.htFileCache == null) {
this.pushContext (null, "loadFileAsync");
this.thisContext.htFileCache =  new java.util.Hashtable ();
}cacheName = this.thisContext.htFileCache.get (key);
if (cacheName != null && cacheName.length > 0) {
this.fileLoadThread = null;
this.popContext (false, false);
this.viewer.queueOnHold = false;
if ("#CANCELED#".equals (this.viewer.cacheGet (cacheName))) this.evalError ("#CANCELED#", null);
return cacheName;
}this.thisContext.htFileCache.put (key, cacheName = prefix + System.currentTimeMillis ());
if (this.fileLoadThread != null) this.evalError ("#CANCELED#", null);
if (doClear) this.viewer.cacheFileByName (prefix + "*", false);
this.fileLoadThread =  new J.script.FileLoadThread (this, this.viewer, filename, key, cacheName);
this.fileLoadThread.run ();
throw  new J.script.ScriptInterruption (this, "load", 1);
}, "~S,~S,~N,~B");
$_M(c$, "logLoadInfo", 
($fz = function (msg) {
if (msg.length > 0) JW.Logger.info (msg);
var sb =  new JU.SB ();
var modelCount = this.viewer.getModelCount ();
if (modelCount > 1) sb.append ((this.viewer.isMovie () ? this.viewer.getFrameCount () + " frames" : modelCount + " models") + "\n");
for (var i = 0; i < modelCount; i++) {
var moData = this.viewer.getModelAuxiliaryInfoValue (i, "moData");
if (moData == null) continue;
sb.appendI ((moData.get ("mos")).size ()).append (" molecular orbitals in model ").append (this.viewer.getModelNumberDotted (i)).append ("\n");
}
if (sb.length () > 0) this.showString (sb.toString ());
}, $fz.isPrivate = true, $fz), "~S");
$_V(c$, "notifyResumeStatus", 
function () {
if (!this.chk && !this.executionStopped && !this.executionStepping) {
this.viewer.scriptStatus ("script execution " + (this.$error || this.executionStopped ? "interrupted" : "resumed"));
}if (JW.Logger.debugging) JW.Logger.debug ("script execution resumed");
});
$_V(c$, "refresh", 
function (doDelay) {
if (this.chk) return;
this.viewer.setTainted (true);
this.viewer.requestRepaintAndWait ("refresh cmd");
if (this.isJS && doDelay) this.doDelay (10);
}, "~B");
$_V(c$, "stopScriptThreads", 
function () {
if (this.scriptDelayThread != null) {
this.scriptDelayThread.interrupt ();
this.scriptDelayThread = null;
}if (this.fileLoadThread != null) {
this.fileLoadThread.interrupt ();
this.fileLoadThread.resumeEval ();
if (this.thisContext != null) this.popContext (false, false);
this.fileLoadThread = null;
}});
$_M(c$, "getErrorLineMessage2", 
function () {
return J.script.ScriptError.getErrorLineMessage (this.functionName, this.scriptFileName, this.getLinenumber (null), this.pc, J.script.ScriptEval.statementAsString (this.viewer, this.st, -9999, this.debugHigh));
});
$_M(c$, "getLinenumber", 
function (c) {
return (c == null ? this.lineNumbers[this.pc] : c.lineNumbers[c.pc]);
}, "J.script.ScriptContext");
$_M(c$, "dispatchCommands", 
function (isSpt, fromFunc) {
if (this.sm == null) this.sm = this.viewer.getShapeManager ();
this.debugScript = this.debugHigh = false;
if (!this.chk) this.setDebugging ();
if (this.pcEnd == 0) this.pcEnd = 2147483647;
if (this.lineEnd == 0) this.lineEnd = 2147483647;
if (this.aatoken == null) return true;
var allowJSInterrupt = (this.isJS && !fromFunc && this.useThreads ());
this.commandLoop (allowJSInterrupt);
if (this.chk) return true;
var script = this.viewer.getInsertedCommand ();
if (!"".equals (script)) {
this.runScriptBuffer (script, null);
} else if (isSpt && this.debugScript && this.viewer.getBoolean (603979880)) {
this.viewer.scriptStatus ("script <exiting>");
}if (!this.mustResumeEval && !allowJSInterrupt || fromFunc) return true;
if (this.mustResumeEval || this.thisContext == null) {
var done = (this.thisContext == null);
this.resumeEval (this.thisContext);
this.mustResumeEval = false;
return done;
}return true;
}, "~B,~B");
$_M(c$, "commandLoop", 
($fz = function (allowInterrupt) {
var lastCommand = "";
var isForCheck = false;
var vProcess = null;
var lastTime = System.currentTimeMillis ();
if (this.debugScript && this.debugHigh && !this.chk) {
for (var i = this.pc; i < this.aatoken.length && i < this.pcEnd; i++) {
JW.Logger.info ("Command " + i);
if (this.debugScript) this.logDebugScript (this.aatoken[i], 0);
}
JW.Logger.info ("-----");
}for (; this.pc < this.aatoken.length && this.pc < this.pcEnd; this.pc++) {
if (allowInterrupt) {
if (!this.executionPaused && System.currentTimeMillis () - lastTime > 1000) {
this.pc--;
this.doDelay (-1);
}lastTime = System.currentTimeMillis ();
}if (!this.chk && !this.checkContinue ()) break;
if (this.lineNumbers[this.pc] > this.lineEnd) break;
if (this.debugHigh) {
var timeBegin = 0;
timeBegin = System.currentTimeMillis ();
this.viewer.scriptStatus ("Eval.dispatchCommands():" + timeBegin);
this.viewer.scriptStatus (this.script);
}if (this.debugScript && !this.chk) JW.Logger.info ("Command " + this.pc);
this.theToken = (this.aatoken[this.pc].length == 0 ? null : this.aatoken[this.pc][0]);
if (!this.historyDisabled && !this.chk && this.scriptLevel <= this.commandHistoryLevelMax && !this.tQuiet) {
var cmdLine = this.getCommand (this.pc, true, true);
if (this.theToken != null && cmdLine.length > 0 && !cmdLine.equals (lastCommand) && (this.theToken.tok == 135368713 || this.theToken.tok == 102436 || !J.script.T.tokAttr (this.theToken.tok, 102400))) this.viewer.addCommand (lastCommand = cmdLine);
}if (!this.chk) {
var script = this.viewer.getInsertedCommand ();
if (!"".equals (script)) this.runScript (script);
}if (!this.setStatement (this.aatoken[this.pc])) {
JW.Logger.info (this.getCommand (this.pc, true, false) + " -- STATEMENT CONTAINING @{} SKIPPED");
continue;
}this.thisCommand = this.getCommand (this.pc, false, true);
var nextCommand = this.getCommand (this.pc + 1, false, true);
this.fullCommand = this.thisCommand + (nextCommand.startsWith ("#") ? nextCommand : "");
this.getToken (0);
this.iToken = 0;
if ((this.listCommands || !this.chk && this.scriptLevel > 0) && !this.isJS) {
var milliSecDelay = this.viewer.getInt (536870922);
if (this.listCommands || milliSecDelay > 0) {
if (milliSecDelay > 0) this.delayScript (-milliSecDelay);
this.viewer.scriptEcho ("$[" + this.scriptLevel + "." + this.lineNumbers[this.pc] + "." + (this.pc + 1) + "] " + this.thisCommand);
}}if (vProcess != null && (this.theTok != 1150985 || this.slen < 2 || this.st[1].tok != 102439)) {
vProcess.addLast (this.st);
continue;
}if (this.chk) {
if (this.isCmdLine_c_or_C_Option) JW.Logger.info (this.thisCommand);
if (this.slen == 1 && this.st[0].tok != 135368713 && this.st[0].tok != 102436) continue;
} else {
if (this.debugScript) this.logDebugScript (this.st, 0);
if (this.scriptLevel == 0 && this.viewer.global.logCommands) this.viewer.log (this.thisCommand);
if (this.debugHigh && this.theToken != null) JW.Logger.debug (this.theToken.toString ());
}if (this.theToken == null) continue;
var tok = this.theToken.tok;
if (J.script.T.tokAttr (tok, 102400)) {
isForCheck = this.cmdFlow (tok, isForCheck, vProcess);
if (this.theTok == 102439) vProcess = null;
} else if (tok == 102439) {
this.pushContext (this.theToken, "PROCESS");
if (this.parallelProcessor != null) vProcess =  new JU.List ();
} else {
this.processCommand (tok);
}this.setCursorWait (false);
if (this.executionStepping) {
this.executionPaused = (this.isCommandDisplayable (this.pc + 1));
}}
}, $fz.isPrivate = true, $fz), "~B");
$_M(c$, "processCommand", 
($fz = function (tok) {
if (J.script.T.tokAttr (this.theToken.tok, 135168)) {
this.processShapeCommand (tok);
return;
}switch (tok) {
case 0:
if (this.chk || !this.viewer.getBoolean (603979880)) break;
var s = this.theToken.value;
if (s == null) break;
if (this.outputBuffer == null) this.viewer.showMessage (s);
this.report (s);
break;
case 1276383749:
this.pushContext (this.theToken, "PUSH");
break;
case 1276383249:
this.popContext (true, false);
break;
case 269484066:
break;
case 4097:
this.cmdAnimation ();
break;
case 1610616835:
this.cmdBackground (1);
break;
case 4100:
this.cmdBind ();
break;
case 4101:
this.cmdBondorder ();
break;
case 1069064:
this.cmdCD ();
break;
case 12289:
this.cmdCenter (1);
break;
case 1766856708:
this.cmdColor ();
break;
case 1060866:
this.cmdDefine ();
break;
case 528397:
this.cmdDelay ();
break;
case 12291:
this.cmdDelete ();
break;
case 554176526:
this.cmdSlab (true);
break;
case 1610625028:
this.cmdDisplay (true);
break;
case 266255:
case 266281:
if (this.chk) break;
if (this.pc > 0 && this.theToken.tok == 266255) this.viewer.clearScriptQueue ();
this.executionStopped = (this.pc > 0 || !this.viewer.global.useScriptQueue);
break;
case 266256:
if (this.chk) return;
this.viewer.exitJmol ();
break;
case 1229984263:
this.cmdFile ();
break;
case 1060869:
this.cmdFixed ();
break;
case 4114:
this.cmdFont (-1, 0);
break;
case 4115:
case 1095766030:
this.cmdModel (1);
break;
case 1073741824:
this.cmdFunc ();
break;
case 1276121098:
this.cmdGetProperty ();
break;
case 20500:
if (this.viewer.isHeadless ()) break;
this.cmdGoto (true);
break;
case 20482:
this.cmdHelp ();
break;
case 12294:
this.cmdDisplay (false);
break;
case 1612189718:
this.cmdHbond ();
break;
case 1610616855:
this.cmdHistory (1);
break;
case 544771:
this.cmdHover ();
break;
case 266264:
if (!this.chk) this.viewer.initialize (!this.$isStateScript);
break;
case 4121:
this.cmdInvertSelected ();
break;
case 135287308:
this.cmdScript (135287308, null, null);
break;
case 135271426:
this.cmdLoad ();
break;
case 36869:
this.cmdLog ();
break;
case 528410:
this.cmdLoop ();
break;
case 20485:
this.cmdMessage ();
break;
case 4128:
this.cmdMove ();
break;
case 4130:
this.cmdMoveto ();
break;
case 20487:
this.cmdPause ();
break;
case 36865:
this.cmdPrint ();
break;
case 135304707:
this.cmdPrompt ();
break;
case 4139:
case 4165:
this.cmdUndoRedoMove ();
break;
case 266284:
this.refresh (true);
break;
case 4141:
this.cmdReset ();
break;
case 12295:
this.cmdRestrict ();
break;
case 4143:
if (this.slen == 0) {
if (!this.chk) this.resumePausedExecution ();
break;
}case 4142:
this.cmdRestore ();
break;
case 36866:
this.cmdReturn (null);
break;
case 528432:
this.cmdRotate (false, false);
break;
case 4145:
this.cmdRotate (false, true);
break;
case 4146:
this.cmdSave ();
break;
case 1085443:
this.cmdSet ();
break;
case 135271429:
this.cmdScript (135271429, null, null);
break;
case 135280132:
this.cmdSelect (1);
break;
case 1611141171:
this.cmdSelectionHalos (1);
break;
case 554176565:
this.cmdSlab (false);
break;
case 1611141175:
this.cmdRotate (true, false);
break;
case 1611141176:
this.cmdSsbond ();
break;
case 266298:
if (this.cmdPause ()) this.stepPausedExecution ();
break;
case 1641025539:
this.cmdStructure ();
break;
case 3158024:
this.cmdSubset ();
break;
case 4156:
this.cmdSync ();
break;
case 36870:
this.cmdThrow ();
break;
case 536875070:
this.cmdTimeout (1);
break;
case 4160:
this.cmdTranslate (false);
break;
case 4162:
this.cmdTranslate (true);
break;
case 4164:
this.cmdUnbind ();
break;
case 4166:
this.cmdVibration ();
break;
case 1060873:
this.cmdZap (true);
break;
case 4168:
this.cmdZoom (false);
break;
case 4170:
this.cmdZoom (true);
break;
default:
this.checkExtension (this.theToken.tok);
}
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "checkExtension", 
($fz = function (tok) {
switch (tok) {
case 4098:
case 135270423:
case 4102:
case 4103:
case 4105:
case 135270405:
case 1095766024:
case 4106:
case 528395:
case 1612189718:
case 528443:
case 1052700:
case 4126:
case 1276121113:
case 4133:
case 135270418:
case 1052714:
case 135270408:
case 4131:
case 4148:
case 135270422:
this.getCmdExt ().dispatch (this.theToken.tok, false, this.st);
break;
default:
this.error (47);
}
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "processShapeCommand", 
($fz = function (tok) {
var iShape = 0;
switch (tok) {
case 1611272194:
iShape = 31;
break;
case 1115297793:
iShape = 9;
break;
case 1679429641:
iShape = 32;
break;
case 1113200642:
iShape = 11;
break;
case 135174:
iShape = 23;
break;
case 135402505:
iShape = 25;
break;
case 135175:
iShape = 17;
break;
case 1113198595:
iShape = 16;
break;
case 135176:
iShape = 22;
break;
case 537022465:
iShape = 30;
break;
case 1113198596:
iShape = 20;
break;
case 1611272202:
iShape = 35;
break;
case 1113198597:
iShape = 19;
break;
case 1113200646:
iShape = 8;
break;
case 135180:
iShape = 24;
break;
case 1826248716:
iShape = 5;
break;
case 135182:
iShape = 26;
break;
case 537006096:
case 1746538509:
iShape = 6;
break;
case 1113200647:
iShape = 13;
break;
case 1183762:
iShape = 27;
break;
case 135190:
iShape = 29;
break;
case 135188:
iShape = 28;
break;
case 135192:
iShape = 21;
break;
case 1113200649:
iShape = 14;
break;
case 1113200650:
iShape = 15;
break;
case 1113200651:
iShape = 0;
break;
case 1113200652:
iShape = 7;
break;
case 1650071565:
iShape = 12;
break;
case 1708058:
iShape = 4;
break;
case 1113200654:
iShape = 10;
break;
case 1614417948:
iShape = 33;
break;
case 135198:
iShape = 18;
break;
case 659488:
iShape = 1;
break;
default:
this.error (47);
}
if (this.sm.getShape (iShape) == null && this.slen == 2) {
switch (this.st[1].tok) {
case 1048588:
case 12291:
case 1048587:
return;
}
}switch (tok) {
case 1115297793:
case 1113200642:
case 1113200647:
case 1113200649:
case 1113200650:
case 1650071565:
case 1113200654:
this.setSizeBio (iShape);
return;
case 1113198595:
case 1113198597:
this.cmdDots (iShape);
return;
case 1113200646:
case 1113200651:
case 1113200652:
this.setSize (iShape, (tok == 1113200646 ? -1.0 : 1));
return;
case 1826248716:
this.cmdLabel (1);
return;
case 135198:
this.cmdVector ();
return;
case 659488:
this.cmdWireframe ();
return;
}
switch (tok) {
case 1611272194:
this.cmdAxes (1);
return;
case 1679429641:
this.cmdBoundbox (1);
return;
case 537022465:
this.cmdEcho (1, null, false);
return;
case 1611272202:
this.cmdFrank (1);
return;
case 1614417948:
this.cmdUnitcell (1);
return;
case 135174:
case 135402505:
case 135175:
case 135176:
case 1113198596:
case 135180:
case 135182:
case 537006096:
case 1746538509:
case 1183762:
case 135190:
case 135188:
case 135192:
case 1708058:
this.getCmdExt ().dispatch (iShape, false, this.st);
return;
}
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "cmdAnimation", 
($fz = function () {
var animate = false;
switch (this.getToken (1).tok) {
case 1048589:
animate = true;
case 1048588:
if (!this.chk) this.viewer.setAnimationOn (animate);
break;
case 1073742030:
var morphCount = Clazz.floatToInt (this.floatParameter (2));
if (!this.chk) this.viewer.setAnimMorphCount (Math.abs (morphCount));
break;
case 1610625028:
this.iToken = 2;
var bs = (this.tokAt (2) == 1048579 ? null : this.atomExpressionAt (2));
this.checkLength (this.iToken + 1);
if (!this.chk) this.viewer.setAnimDisplay (bs);
return;
case 4115:
if (this.isArrayParameter (2)) {
var f = J.script.ScriptEval.expandFloatArray (this.floatParameterSet (2, 0, 2147483647));
if (f == null) this.invArg ();
this.checkLength (this.iToken + 1);
if (this.chk) return;
var frames =  Clazz.newIntArray (f.length, 0);
for (var i = f.length; --i >= 0; ) frames[i] = Clazz.floatToInt (f[i]);

var movie =  new java.util.Hashtable ();
movie.put ("frames", frames);
movie.put ("currentFrame", Integer.$valueOf (0));
this.viewer.setMovie (movie);
} else {
this.cmdModel (2);
}break;
case 1073742024:
var startDelay = 1;
var endDelay = 1;
if (this.slen > 5) this.bad ();
var animationMode = null;
switch (J.script.T.getTokFromName (this.paramAsStr (2))) {
case 1073742070:
animationMode = J.constant.EnumAnimationMode.ONCE;
startDelay = endDelay = 0;
break;
case 528410:
animationMode = J.constant.EnumAnimationMode.LOOP;
break;
case 1073742082:
animationMode = J.constant.EnumAnimationMode.PALINDROME;
break;
default:
this.invArg ();
}
if (this.slen >= 4) {
startDelay = endDelay = this.floatParameter (3);
if (this.slen == 5) endDelay = this.floatParameter (4);
}if (!this.chk) this.viewer.setAnimationReplayMode (animationMode, startDelay, endDelay);
break;
case 1073741918:
var i = 2;
var direction = 0;
switch (this.tokAt (i)) {
case 269484192:
direction = -this.intParameter (++i);
break;
case 269484193:
direction = this.intParameter (++i);
break;
case 2:
direction = this.intParameter (i);
break;
default:
this.invArg ();
}
this.checkLength (++i);
if (direction != 1 && direction != -1) this.errorStr2 (35, "-1", "1");
if (!this.chk) this.viewer.setAnimationDirection (direction);
break;
case 1074790526:
this.setIntProperty ("animationFps", this.intParameter (this.checkLast (2)));
break;
default:
this.frameControl (1);
}
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdAxes", 
($fz = function (index) {
var tickInfo = this.tickParamAsStr (index, true, true, false);
index = this.iToken + 1;
var tok = this.tokAt (index);
var type = this.optParameterAsString (index).toLowerCase ();
if (this.slen == index + 1 && JU.PT.isOneOf (type, ";window;unitcell;molecular;")) {
this.setBooleanProperty ("axes" + type, true);
return;
}switch (tok) {
case 12289:
var center = this.centerParameter (index + 1);
this.setShapeProperty (31, "origin", center);
this.checkLast (this.iToken);
return;
case 1073742138:
this.setFloatProperty ("axesScale", this.floatParameter (this.checkLast (++index)));
return;
case 1826248716:
switch (tok = this.tokAt (index + 1)) {
case 1048588:
case 1048589:
this.checkLength (index + 2);
this.setShapeProperty (31, "labels" + (tok == 1048589 ? "On" : "Off"), null);
return;
}
var sOrigin = null;
switch (this.slen - index) {
case 7:
this.setShapeProperty (31, "labels", [this.paramAsStr (++index), this.paramAsStr (++index), this.paramAsStr (++index), this.paramAsStr (++index), this.paramAsStr (++index), this.paramAsStr (++index)]);
break;
case 5:
sOrigin = this.paramAsStr (index + 4);
case 4:
this.setShapeProperty (31, "labels", [this.paramAsStr (++index), this.paramAsStr (++index), this.paramAsStr (++index), sOrigin]);
break;
default:
this.bad ();
}
return;
}
if (type.equals ("position")) {
var xyp;
if (this.tokAt (++index) == 1048588) {
xyp =  new JU.P3 ();
} else {
xyp = this.xypParameter (index);
if (xyp == null) this.invArg ();
index = this.iToken;
}this.setShapeProperty (31, "position", xyp);
return;
}var mad = this.getSetAxesTypeMad (index);
if (this.chk || mad == 2147483647) return;
this.setObjectMad (31, "axes", mad);
if (tickInfo != null) this.setShapeProperty (31, "tickInfo", tickInfo);
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "cmdBackground", 
($fz = function (i) {
this.getToken (i);
var argb;
if (this.theTok == 1073741979) {
var file = this.paramAsStr (this.checkLast (++i));
if (!this.chk && !file.equalsIgnoreCase ("none") && file.length > 0) this.viewer.loadImage (file, null);
return;
}if (this.isColorParam (i) || this.theTok == 1048587) {
argb = this.getArgbParamLast (i, true);
if (this.chk) return;
this.setObjectArgb ("background", argb);
this.viewer.setBackgroundImage (null, null);
return;
}var iShape = this.getShapeType (this.theTok);
this.colorShape (iShape, i + 1, true);
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "cmdBind", 
($fz = function () {
var mouseAction = this.stringParameter (1);
var name = this.paramAsStr (2);
this.checkLength (3);
if (!this.chk) this.viewer.bindAction (mouseAction, name);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdBondorder", 
($fz = function () {
this.checkLength (-3);
var order = 0;
switch (this.getToken (1).tok) {
case 2:
case 3:
if ((order = JW.Edge.getBondOrderFromFloat (this.floatParameter (1))) == 131071) this.invArg ();
break;
default:
if ((order = J.script.ScriptParam.getBondOrderFromString (this.paramAsStr (1))) == 131071) this.invArg ();
if (order == 33 && this.tokAt (2) == 3) {
order = J.script.ScriptParam.getPartialBondOrderFromFloatEncodedInt (this.st[2].intValue);
}}
this.setShapeProperty (1, "bondOrder", Integer.$valueOf (order));
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdBoundbox", 
($fz = function (index) {
var tickInfo = this.tickParamAsStr (index, false, true, false);
index = this.iToken + 1;
var scale = 1;
if (this.tokAt (index) == 1073742138) {
scale = this.floatParameter (++index);
if (!this.chk && scale == 0) this.invArg ();
index++;
if (index == this.slen) {
if (!this.chk) this.viewer.setBoundBox (null, null, true, scale);
return;
}}var byCorner = (this.tokAt (index) == 1073741902);
if (byCorner) index++;
if (this.isCenterParameter (index)) {
this.expressionResult = null;
var index0 = index;
var pt1 = this.centerParameter (index);
index = this.iToken + 1;
if (byCorner || this.isCenterParameter (index)) {
var pt2 = (byCorner ? this.centerParameter (index) : this.getPoint3f (index, true));
index = this.iToken + 1;
if (!this.chk) this.viewer.setBoundBox (pt1, pt2, byCorner, scale);
} else if (this.expressionResult != null && Clazz.instanceOf (this.expressionResult, JU.BS)) {
if (!this.chk) this.viewer.calcBoundBoxDimensions (this.expressionResult, scale);
} else if (this.expressionResult == null && this.tokAt (index0) == 1048582) {
if (this.chk) return;
var bbox = this.getObjectBoundingBox (this.objectNameParameter (++index0));
if (bbox == null) this.invArg ();
this.viewer.setBoundBox (bbox[0], bbox[1], true, scale);
index = this.iToken + 1;
} else {
this.invArg ();
}if (index == this.slen) return;
}var mad = this.getSetAxesTypeMad (index);
if (this.chk || mad == 2147483647) return;
if (tickInfo != null) this.setShapeProperty (32, "tickInfo", tickInfo);
this.setObjectMad (32, "boundbox", mad);
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "cmdCD", 
($fz = function () {
if (this.chk) return;
var dir = (this.slen == 1 ? null : this.paramAsStr (1));
this.showString (this.viewer.cd (dir));
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdCenter", 
($fz = function (i) {
if (this.slen == 1) {
this.viewer.setNewRotationCenter (null);
return;
}var center = this.centerParameter (i);
if (center == null) this.invArg ();
if (!this.chk) this.viewer.setNewRotationCenter (center);
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "cmdColor", 
($fz = function () {
var i = 1;
if (this.isColorParam (1)) {
this.theTok = 1141899265;
} else {
var argb = 0;
i = 2;
var tok = this.getToken (1).tok;
switch (tok) {
case 1048582:
this.setObjectProperty ();
return;
case 1087373315:
case 3145730:
case 1087373316:
case 1073741946:
case 1632634891:
case 1087373318:
case 1114638362:
case 1087373322:
case 1073741991:
case 1095761936:
case 1073742029:
case 1048587:
case 1073742074:
case 1112541196:
case 1095761937:
case 1716520985:
case 1073742116:
case 1073742110:
case 1113200651:
case 1073742144:
case 1112539150:
case 1641025539:
case 1112539151:
case 1112541199:
case 603979967:
case 1073742186:
case 1649412120:
this.theTok = 1141899265;
i = 1;
break;
case 4:
i = 1;
var strColor = this.stringParameter (i++);
if (this.isArrayParameter (i)) {
strColor = strColor += "=" + J.script.SV.sValue (J.script.SV.getVariableAS (this.stringParameterSet (i))).$replace ('\n', ' ');
i = this.iToken + 1;
}var isTranslucent = (this.tokAt (i) == 603979967);
if (!this.chk) this.viewer.setPropertyColorScheme (strColor, isTranslucent, true);
if (isTranslucent) ++i;
if (this.tokAt (i) == 1073742114 || this.tokAt (i) == 1073741826) {
var min = this.floatParameter (++i);
var max = this.floatParameter (++i);
if (!this.chk) this.viewer.setCurrentColorRange (min, max);
}return;
case 1073742114:
case 1073741826:
var min = this.floatParameter (2);
var max = this.floatParameter (this.checkLast (3));
if (!this.chk) this.viewer.setCurrentColorRange (min, max);
return;
case 1610616835:
argb = this.getArgbParamLast (2, true);
if (!this.chk) this.setObjectArgb ("background", argb);
return;
case 10:
case 1048577:
i = -1;
this.theTok = 1141899265;
break;
case 1073742134:
argb = this.getArgbParamLast (2, false);
if (!this.chk) this.viewer.setRubberbandArgb (argb);
return;
case 536870920:
case 1611141171:
i = 2;
if (this.tokAt (2) == 1073742074) i++;
argb = this.getArgbParamLast (i, true);
if (this.chk) return;
this.sm.loadShape (8);
this.setShapeProperty (8, (tok == 1611141171 ? "argbSelection" : "argbHighlight"), Integer.$valueOf (argb));
return;
case 1611272194:
case 1679429641:
case 1614417948:
case 1073741824:
case 1613758476:
var str = this.paramAsStr (1);
if (this.checkToken (2)) {
argb = this.getToken (2).tok;
switch (argb) {
case 1048587:
argb = 1073741991;
break;
case 1073741991:
case 1073742116:
case 1073742110:
break;
default:
argb = this.getArgbParam (2);
}
}if (argb == 0) this.error (9);
this.checkLast (this.iToken);
if (str.equalsIgnoreCase ("axes") || JV.StateManager.getObjectIdFromName (str) >= 0) {
this.setObjectArgb (str, argb);
return;
}if (this.setElementColor (str, argb)) return;
this.invArg ();
break;
case 135180:
case 135402505:
this.setShapeProperty (JV.JC.shapeTokenIndex (tok), "thisID", "+PREVIOUS_MESH+");
break;
}
}this.colorShape (this.getShapeType (this.theTok), i, false);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdDefine", 
($fz = function () {
if (this.slen < 3 || !(Clazz.instanceOf (this.getToken (1).value, String))) this.invArg ();
var setName = (this.getToken (1).value).toLowerCase ();
if (JU.PT.parseInt (setName) != -2147483648) this.invArg ();
if (this.chk) return;
var isSite = setName.startsWith ("site_");
var isDynamic = (setName.indexOf ("dynamic_") == 0);
if (isDynamic || isSite) {
var code =  new Array (this.slen);
for (var i = this.slen; --i >= 0; ) code[i] = this.st[i];

this.definedAtomSets.put ("!" + (isSite ? setName : setName.substring (8)), code);
} else {
var bs = this.atomExpressionAt (2);
this.definedAtomSets.put (setName, bs);
if (!this.chk) this.viewer.setUserVariable ("@" + setName, J.script.SV.newV (10, bs));
}}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdDelay", 
($fz = function () {
var millis = 0;
switch (this.getToken (1).tok) {
case 1048589:
millis = 1;
break;
case 2:
millis = this.intParameter (1) * 1000;
break;
case 3:
millis = Clazz.floatToInt (this.floatParameter (1) * 1000);
break;
default:
this.error (34);
}
this.refresh (false);
this.doDelay (Math.abs (millis));
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdDelete", 
($fz = function () {
if (this.tokAt (1) == 1048582) {
if (this.slen == 4 && this.optParameterAsString (2).equals ("saved") && this.slen == 4) {
this.viewer.deleteSaved (this.optParameterAsString (3));
if (this.doReport ()) this.report (J.i18n.GT.o (J.i18n.GT._ ("show saved: {0}"), this.viewer.listSavedStates ()));
return;
}this.setObjectProperty ();
return;
}var bs = (this.slen == 1 ? null : this.atomExpression (this.st, 1, 0, true, false, true, false));
if (this.chk) return;
if (bs == null) bs = this.viewer.getAllAtoms ();
var nDeleted = this.viewer.deleteAtoms (bs, false);
if (this.doReport ()) this.report (J.i18n.GT.i (J.i18n.GT._ ("{0} atoms deleted"), nDeleted));
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdDisplay", 
($fz = function (isDisplay) {
var bs = null;
var addRemove = 0;
var i = 1;
var tok;
switch (tok = this.tokAt (1)) {
case 1276118017:
case 1073742119:
addRemove = tok;
tok = this.tokAt (++i);
break;
}
var isGroup = (tok == 1087373318);
if (isGroup) tok = this.tokAt (++i);
switch (tok) {
case 1048582:
this.setObjectProperty ();
return;
case 0:
break;
default:
if (this.slen == 4 && this.tokAt (2) == 1678770178) bs =  new JM.BondSet (JW.BSUtil.newBitSet2 (0, this.viewer.modelSet.bondCount));
 else bs = this.atomExpressionAt (i);
}
if (this.chk) return;
if (Clazz.instanceOf (bs, JM.BondSet)) {
this.viewer.displayBonds (bs, isDisplay);
return;
}this.viewer.displayAtoms (bs, isDisplay, isGroup, addRemove, this.tQuiet);
}, $fz.isPrivate = true, $fz), "~B");
$_M(c$, "cmdDots", 
($fz = function (iShape) {
if (!this.chk) this.sm.loadShape (iShape);
this.setShapeProperty (iShape, "init", null);
var value = NaN;
var type = J.atomdata.RadiusData.EnumType.ABSOLUTE;
var ipt = 1;
while (true) {
switch (this.getToken (ipt).tok) {
case 1073742072:
this.restrictSelected (false, false);
value = 1;
type = J.atomdata.RadiusData.EnumType.FACTOR;
break;
case 1048589:
value = 1;
type = J.atomdata.RadiusData.EnumType.FACTOR;
break;
case 1048588:
value = 0;
break;
case 1073741976:
this.setShapeProperty (iShape, "ignore", this.atomExpressionAt (ipt + 1));
ipt = this.iToken + 1;
continue;
case 2:
var dotsParam = this.intParameter (ipt);
if (this.tokAt (ipt + 1) == 1666189314) {
ipt++;
this.setShapeProperty (iShape, "atom", Integer.$valueOf (dotsParam));
this.setShapeProperty (iShape, "radius", Float.$valueOf (this.floatParameter (++ipt)));
if (this.tokAt (++ipt) == 1766856708) {
this.setShapeProperty (iShape, "colorRGB", Integer.$valueOf (this.getArgbParam (++ipt)));
ipt++;
}if (this.getToken (ipt).tok != 10) this.invArg ();
this.setShapeProperty (iShape, "dots", this.st[ipt].value);
return;
}break;
}
break;
}
var rd = (Float.isNaN (value) ? this.encodeRadiusParameter (ipt, false, true) :  new J.atomdata.RadiusData (null, value, type, J.constant.EnumVdw.AUTO));
if (rd == null) return;
if (Float.isNaN (rd.value)) this.invArg ();
this.setShapeSize (iShape, rd);
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "cmdEcho", 
($fz = function (index, id, isImage) {
if (this.chk) return;
var text = this.optParameterAsString (index);
if (this.viewer.getEchoStateActive ()) {
if (isImage) {
this.viewer.loadImage (text, id);
return;
} else if (text.startsWith ("\1")) {
text = text.substring (1);
isImage = true;
}if (text != null) this.setShapeProperty (30, "text", text);
}if (!isImage && this.viewer.getRefreshing ()) this.showString (this.viewer.formatText (text));
}, $fz.isPrivate = true, $fz), "~N,~S,~B");
$_M(c$, "cmdFile", 
($fz = function () {
var file = this.intParameter (this.checkLast (1));
if (this.chk) return;
var modelIndex = this.viewer.getModelNumberIndex (file * 1000000 + 1, false, false);
var modelIndex2 = -1;
if (modelIndex >= 0) {
modelIndex2 = this.viewer.getModelNumberIndex ((file + 1) * 1000000 + 1, false, false);
if (modelIndex2 < 0) modelIndex2 = this.viewer.getModelCount ();
modelIndex2--;
}this.viewer.setAnimationOn (false);
this.viewer.setAnimationDirection (1);
this.viewer.setAnimationRange (modelIndex, modelIndex2);
this.viewer.setCurrentModelIndex (-1);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdFixed", 
($fz = function () {
var bs = (this.slen == 1 ? null : this.atomExpressionAt (1));
if (this.chk) return;
this.viewer.setMotionFixedAtoms (bs);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdFlow", 
($fz = function (tok, isForCheck, vProcess) {
var ct;
var pt;
pt = this.st[0].intValue;
var isDone = (pt < 0 && !this.chk);
var isOK = true;
var ptNext = 0;
switch (tok) {
case 135368713:
case 102436:
this.cmdFunc ();
return isForCheck;
case 364558:
return isForCheck;
case 102412:
ct = this.theToken;
this.pushContext (ct, "CATCH");
if (!isDone && ct.name0 != null) this.contextVariables.put (ct.name0, ct.contextVariables.get (ct.name0));
isOK = !isDone;
this.st[0].intValue = -Math.abs (pt);
break;
case 102410:
case 102413:
case 102411:
ptNext = Math.abs (this.aatoken[Math.abs (pt)][0].intValue);
switch (isDone ? 0 : this.cmdFlowSwitch (this.theToken, tok)) {
case 0:
ptNext = -ptNext;
isOK = false;
break;
case -1:
isOK = false;
break;
case 1:
}
this.aatoken[this.pc][0].intValue = Math.abs (pt);
this.theToken = this.aatoken[Math.abs (pt)][0];
if (this.theToken.tok != 1150985) this.theToken.intValue = ptNext;
break;
case 135369225:
case 102402:
isOK = (!isDone && this.parameterExpressionBoolean (1, 0));
if (this.chk) break;
ptNext = Math.abs (this.aatoken[Math.abs (pt)][0].intValue);
ptNext = (isDone || isOK ? -ptNext : ptNext);
this.aatoken[Math.abs (pt)][0].intValue = ptNext;
if (tok == 102412) this.aatoken[this.pc][0].intValue = -pt;
break;
case 364547:
this.checkLength (1);
if (pt < 0 && !this.chk) this.pc = -pt - 1;
break;
case 364548:
this.checkLength (1);
break;
case 102406:
if (!isForCheck) this.pushContext (this.theToken, "WHILE");
isForCheck = false;
if (!this.parameterExpressionBoolean (1, 0) && !this.chk) {
this.pc = pt;
this.popContext (true, false);
}break;
case 102407:
if (!this.chk) {
this.breakAt (pt);
break;
}if (this.slen == 1) break;
var n = this.intParameter (this.checkLast (1));
if (this.chk) break;
for (var i = 0; i < n; i++) this.popContext (true, false);

break;
case 102408:
isForCheck = true;
if (!this.chk) this.pc = pt - 1;
if (this.slen > 1) this.intParameter (this.checkLast (1));
break;
case 135369224:
var cmdToken = this.theToken;
var pts =  Clazz.newIntArray (2, 0);
var j = 0;
var bsOrList = null;
var key = null;
for (var i = 1, nSkip = 0; i < this.slen && j < 2; i++) {
switch (tok = this.tokAt (i)) {
case 1048591:
if (nSkip > 0) nSkip--;
 else pts[j++] = i;
break;
case 1073741980:
key = this.paramAsStr (i - 1);
if (isForCheck) {
i = this.slen;
continue;
}nSkip -= 2;
if (this.tokAt (++i) == 1048577 || this.tokAt (i) == 10) {
bsOrList = this.atomExpressionAt (i);
if (this.isBondSet) bsOrList =  new JM.BondSet (bsOrList);
} else {
var what = this.parameterExpressionList (-i, 1, false);
if (what == null || what.size () < 1) this.invArg ();
var vl = what.get (0);
switch (vl.tok) {
case 10:
bsOrList = J.script.SV.getBitSet (vl, false);
break;
case 7:
bsOrList = vl.getList ();
break;
default:
this.invArg ();
}
}i = this.iToken;
break;
case 135280132:
nSkip += 2;
break;
}
}
var isMinusMinus = false;
if (key == null) {
if (isForCheck) {
j = (bsOrList == null ? pts[1] + 1 : 2);
} else {
this.pushContext (cmdToken, "FOR");
j = 2;
}if (this.tokAt (j) == 36868) j++;
key = this.paramAsStr (j);
isMinusMinus = key.equals ("--") || key.equals ("++");
if (isMinusMinus) key = this.paramAsStr (++j);
}var v = null;
if (tok == 1073741980 || J.script.T.tokAttr (this.tokAt (j), 1073741824) || (v = this.getContextVariableAsVariable (key)) != null) {
if (tok != 1073741980 && !isMinusMinus && this.getToken (++j).tok != 269484436) this.invArg ();
if (tok == 1073741980) {
isOK = true;
if (!isForCheck) this.pushContext (cmdToken, "FOR");
var t = this.getForVar (key);
v = this.getForVar (key + "/value");
if (isForCheck) {
if (t.isModified ()) isOK = false;
 else if (v.tok == 7) isOK = (++v.intValue <= v.getList ().size ());
 else if ((v.value).nextSetBit ((j = (v.value).nextSetBit (0)) + 1) < 0) isOK = false;
 else (v.value).clear (j);
} else {
v.setv (J.script.SV.getVariable (Clazz.instanceOf (bsOrList, JU.BS) ? JW.BSUtil.copy (bsOrList) : bsOrList));
v.intValue = 1;
t.setModified (false);
}if (isOK) t.setv (J.script.SV.selectItemVar (v));
} else {
if (isMinusMinus) j -= 2;
this.setVariable (++j, this.slen - 1, key, false);
}}if (tok != 1073741980) isOK = this.parameterExpressionBoolean (pts[0] + 1, pts[1]);
pt++;
if (!isOK) this.popContext (true, false);
isForCheck = false;
break;
case 1150985:
switch (this.getToken (this.checkLast (1)).tok) {
case 364558:
var trycmd = this.getToken (1).value;
if (this.chk) return false;
this.runFunctionAndRet (trycmd, "try", null, null, true, true, true);
return false;
case 102412:
this.popContext (true, false);
break;
case 135368713:
case 102436:
this.viewer.addFunction (this.theToken.value);
return isForCheck;
case 102439:
this.addProcess (vProcess, pt, this.pc);
this.popContext (true, false);
break;
case 102410:
if (pt > 0 && this.cmdFlowSwitch (this.aatoken[pt][0], 0) == -1) {
for (; pt < this.pc; pt++) if ((tok = this.aatoken[pt][0].tok) != 102413 && tok != 102411) break;

isOK = (this.pc == pt);
}break;
}
if (isOK) isOK = (this.theTok == 102412 || this.theTok == 102439 || this.theTok == 135369225 || this.theTok == 102410);
isForCheck = (this.theTok == 135369224 || this.theTok == 102406);
break;
}
if (!isOK && !this.chk) this.pc = Math.abs (pt) - 1;
return isForCheck;
}, $fz.isPrivate = true, $fz), "~N,~B,JU.List");
$_M(c$, "cmdFlowSwitch", 
($fz = function (c, tok) {
if (tok == 102410) c.addName ("_var");
var $var = c.contextVariables.get ("_var");
if ($var == null) return 1;
if (tok == 0) {
c.contextVariables.remove ("_var");
return -1;
}if (tok == 102413) return -1;
var v = this.parameterExpressionToken (1);
if (tok == 102411) {
var isOK = J.script.SV.areEqual ($var, v);
if (isOK) c.contextVariables.remove ("_var");
return isOK ? 1 : -1;
}c.contextVariables.put ("_var", v);
return 1;
}, $fz.isPrivate = true, $fz), "J.script.ContextToken,~N");
$_M(c$, "cmdFont", 
($fz = function (shapeType, fontsize) {
var fontface = "SansSerif";
var fontstyle = "Plain";
var sizeAdjust = 0;
var scaleAngstromsPerPixel = -1;
switch (this.iToken = this.slen) {
case 6:
scaleAngstromsPerPixel = this.floatParameter (5);
if (scaleAngstromsPerPixel >= 5) scaleAngstromsPerPixel = this.viewer.getZoomSetting () / scaleAngstromsPerPixel / this.viewer.getScalePixelsPerAngstrom (false);
case 5:
if (this.getToken (4).tok != 1073741824) this.invArg ();
fontstyle = this.paramAsStr (4);
case 4:
if (this.getToken (3).tok != 1073741824) this.invArg ();
fontface = this.paramAsStr (3);
if (!this.isFloatParameter (2)) this.error (34);
fontsize = this.floatParameter (2);
shapeType = this.getShapeType (this.getToken (1).tok);
break;
case 3:
if (!this.isFloatParameter (2)) this.error (34);
if (shapeType == -1) {
shapeType = this.getShapeType (this.getToken (1).tok);
fontsize = this.floatParameter (2);
} else {
if (fontsize >= 1) fontsize += (sizeAdjust = 5);
}break;
case 2:
default:
if (shapeType == 5) {
fontsize = 13;
break;
}this.bad ();
}
if (shapeType == 5) {
if (fontsize < 0 || fontsize >= 1 && (fontsize < 6 || fontsize > 63)) {
this.integerOutOfRange (6 - sizeAdjust, 63 - sizeAdjust);
return;
}this.setShapeProperty (5, "setDefaults", this.viewer.getNoneSelected ());
}if (this.chk) return;
if (JW.GData.getFontStyleID (fontface) >= 0) {
fontstyle = fontface;
fontface = "SansSerif";
}var font3d = this.viewer.getFont3D (fontface, fontstyle, fontsize);
this.sm.loadShape (shapeType);
this.setShapeProperty (shapeType, "font", font3d);
if (scaleAngstromsPerPixel >= 0) this.setShapeProperty (shapeType, "scalereference", Float.$valueOf (scaleAngstromsPerPixel));
}, $fz.isPrivate = true, $fz), "~N,~N");
$_M(c$, "cmdFrank", 
($fz = function (i) {
var b = true;
if (this.slen > i) switch (this.getToken (this.checkLast (i)).tok) {
case 1048589:
break;
case 1048588:
b = false;
break;
default:
this.error (5);
}
this.setBooleanProperty ("frank", b);
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "cmdFunc", 
($fz = function () {
if (this.chk && !this.isCmdLine_c_or_C_Option) return;
var name = (this.getToken (0).value).toLowerCase ();
if (!this.viewer.isFunction (name)) this.error (10);
var params = (this.slen == 1 || this.slen == 3 && this.tokAt (1) == 269484048 && this.tokAt (2) == 269484049 ? null : this.parameterExpressionList (1, -1, false));
if (this.chk) return;
this.runFunctionAndRet (null, name, params, null, false, true, true);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdGetProperty", 
($fz = function () {
if (this.chk) return;
var retValue = "";
var property = this.optParameterAsString (1);
var name = property;
if (name.indexOf (".") >= 0) name = name.substring (0, name.indexOf ("."));
if (name.indexOf ("[") >= 0) name = name.substring (0, name.indexOf ("["));
var propertyID = this.viewer.getPropertyNumber (name);
var param = "";
switch (this.tokAt (2)) {
default:
param = this.optParameterAsString (2);
break;
case 1048577:
case 10:
param = this.atomExpressionAt (2);
if (property.equalsIgnoreCase ("bondInfo")) {
switch (this.tokAt (++this.iToken)) {
case 1048577:
case 10:
param = [param, this.atomExpressionAt (this.iToken)];
break;
}
}break;
}
if (property.length > 0 && propertyID < 0) {
property = "";
param = "";
} else if (propertyID >= 0 && this.slen < 3) {
param = this.viewer.getDefaultPropertyParam (propertyID);
if (param.equals ("(visible)")) {
this.viewer.setModelVisibility ();
param = this.viewer.getVisibleSet ();
}} else if (propertyID == this.viewer.getPropertyNumber ("fileContents")) {
var s = param.toString ();
for (var i = 3; i < this.slen; i++) s += this.paramAsStr (i);

param = s;
}retValue = this.viewer.getProperty ("readable", property, param);
this.showString (retValue);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdGoto", 
($fz = function (isCmd) {
var strTo = (isCmd ? this.paramAsStr (this.checkLast (1)) : null);
var pcTo = (strTo == null ? this.aatoken.length - 1 : -1);
var s = null;
for (var i = pcTo + 1; i < this.aatoken.length; i++) {
var tokens = this.aatoken[i];
var tok = tokens[0].tok;
switch (tok) {
case 20485:
case 0:
s = tokens[tokens.length - 1].value;
if (tok == 0) s = s.substring (s.startsWith ("#") ? 1 : 2);
break;
default:
continue;
}
if (s.equalsIgnoreCase (strTo)) {
pcTo = i;
break;
}}
if (pcTo < 0) this.invArg ();
if (strTo == null) pcTo = 0;
var di = (pcTo < this.pc ? 1 : -1);
var nPush = 0;
for (var i = pcTo; i != this.pc; i += di) {
switch (this.aatoken[i][0].tok) {
case 1276383749:
case 102439:
case 135369224:
case 102412:
case 102406:
nPush++;
break;
case 1276383249:
nPush--;
break;
case 1150985:
switch (this.aatoken[i][1].tok) {
case 102439:
case 135369224:
case 102412:
case 102406:
nPush--;
}
break;
}
}
if (strTo == null) {
pcTo = 2147483647;
for (; nPush > 0; --nPush) this.popContext (false, false);

}if (nPush != 0) this.invArg ();
if (!this.chk) this.pc = pcTo - 1;
}, $fz.isPrivate = true, $fz), "~B");
$_M(c$, "cmdHbond", 
($fz = function () {
if (this.slen == 2 && this.getToken (1).tok == 4102) {
if (this.chk) return;
var n = this.viewer.autoHbond (null, null, false);
this.report (J.i18n.GT.i (J.i18n.GT._ ("{0} hydrogen bonds"), Math.abs (n)));
return;
}if (this.slen == 2 && this.getToken (1).tok == 12291) {
if (this.chk) return;
this.checkExtension (1612189718);
return;
}var mad = this.getMadParameter ();
if (mad == 2147483647) return;
this.setShapeProperty (1, "type", Integer.$valueOf (30720));
this.setShapeSizeBs (1, mad, null);
this.setShapeProperty (1, "type", Integer.$valueOf (1023));
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdHelp", 
($fz = function () {
if (this.chk) return;
var what = this.optParameterAsString (1).toLowerCase ();
var pt = 0;
if (what.startsWith ("mouse") && (pt = what.indexOf (" ")) >= 0 && pt == what.lastIndexOf (" ")) {
this.showString (this.viewer.getBindingInfo (what.substring (pt + 1)));
return;
}if (J.script.T.tokAttr (J.script.T.getTokFromName (what), 4096)) what = "?command=" + what;
this.viewer.getHelp (what);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdHistory", 
($fz = function (pt) {
if (this.slen == 1) {
this.showString (this.viewer.getSetHistory (2147483647));
return;
}if (pt == 2) {
var n = this.intParameter (this.checkLast (2));
if (n < 0) this.invArg ();
if (!this.chk) this.viewer.getSetHistory (n == 0 ? 0 : -2 - n);
return;
}switch (this.getToken (this.checkLast (1)).tok) {
case 1048589:
case 1073741882:
if (!this.chk) this.viewer.getSetHistory (-2147483648);
return;
case 1048588:
if (!this.chk) this.viewer.getSetHistory (0);
break;
default:
this.errorStr (24, "ON, OFF, CLEAR");
}
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "cmdHover", 
($fz = function () {
if (this.chk) return;
var strLabel = this.paramAsStr (1);
if (strLabel.equalsIgnoreCase ("on")) strLabel = "%U";
 else if (strLabel.equalsIgnoreCase ("off")) strLabel = null;
this.viewer.setHoverLabel (strLabel);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdInvertSelected", 
($fz = function () {
var pt = null;
var plane = null;
var bs = null;
var iAtom = -2147483648;
switch (this.tokAt (1)) {
case 0:
if (this.chk) return;
bs = this.viewer.getSelectedAtoms ();
pt = this.viewer.getAtomSetCenter (bs);
this.viewer.invertAtomCoordPt (pt, bs);
return;
case 528443:
iAtom = this.atomExpressionAt (2).nextSetBit (0);
bs = this.atomExpressionAt (this.iToken + 1);
break;
case 135266320:
pt = this.centerParameter (2);
break;
case 135266319:
plane = this.planeParameter (2);
break;
case 135267841:
plane = this.hklParameter (2);
break;
}
this.checkLengthErrorPt (this.iToken + 1, 1);
if (plane == null && pt == null && iAtom == -2147483648) this.invArg ();
if (this.chk) return;
if (iAtom == -1) return;
this.viewer.invertSelected (pt, plane, iAtom, bs);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdLabel", 
($fz = function (index) {
if (this.chk) return;
this.sm.loadShape (5);
var strLabel = null;
switch (this.getToken (index).tok) {
case 1048589:
strLabel = this.viewer.getStandardLabelFormat (0);
break;
case 1048588:
break;
case 12294:
case 1610625028:
this.setShapeProperty (5, "display", this.theTok == 1610625028 ? Boolean.TRUE : Boolean.FALSE);
return;
case 7:
strLabel = this.theToken.value;
break;
default:
strLabel = this.paramAsStr (index);
}
this.sm.setLabel (strLabel, this.viewer.getSelectedAtoms ());
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "cmdLoad", 
function () {
var doLoadFiles = (!this.chk || this.isCmdLine_C_Option);
var isAppend = false;
var isInline = false;
var isSmiles = false;
var isData = false;
var isAsync = false;
var bsModels;
var i = (this.tokAt (0) == 135270408 ? 0 : 1);
var appendNew = this.viewer.getBoolean (603979792);
var filter = null;
var firstLastSteps = null;
var modelCount0 = this.viewer.getModelCount () - (this.viewer.getFileName ().equals ("zapped") ? 1 : 0);
var atomCount0 = this.viewer.getAtomCount ();
var loadScript =  new JU.SB ().append ("load");
var nFiles = 1;
var htParams =  new java.util.Hashtable ();
if (this.$isStateScript) {
htParams.put ("isStateScript", Boolean.TRUE);
if (this.forceNoAddHydrogens) htParams.put ("doNotAddHydrogens", Boolean.TRUE);
}var modelName = null;
var filenames = null;
var tempFileInfo = null;
var errMsg = null;
var sOptions = "";
var tokType = 0;
var tok;
if (this.slen == 1) {
i = 0;
} else {
modelName = this.paramAsStr (i);
if (this.slen == 2 && !this.chk) {
if (modelName.endsWith (".spt") || modelName.endsWith (".png") || modelName.endsWith (".pngj")) {
this.cmdScript (0, modelName, null);
return;
}}switch (tok = this.tokAt (i)) {
case 1073742015:
var m = this.paramAsStr (this.checkLast (2));
if (!this.chk) this.viewer.setMenu (m, true);
return;
case 135270408:
isData = true;
loadScript.append (" /*data*/ data");
var key = this.stringParameter (++i).toLowerCase ();
loadScript.append (" ").append (JU.PT.esc (key));
isAppend = key.startsWith ("append");
var strModel = (key.indexOf ("@") >= 0 ? "" + this.getParameter (key.substring (key.indexOf ("@") + 1), 4) : this.paramAsStr (++i));
strModel = JV.Viewer.fixInlineString (strModel, this.viewer.getInlineChar ());
htParams.put ("fileData", strModel);
htParams.put ("isData", Boolean.TRUE);
loadScript.appendC ('\n');
loadScript.append (strModel);
if (key.indexOf ("@") < 0) {
loadScript.append (" end ").append (JU.PT.esc (key));
i += 2;
}break;
case 1073741839:
isAppend = true;
loadScript.append (" append");
modelName = this.optParameterAsString (++i);
tok = J.script.T.getTokFromName (modelName);
break;
case 1073741824:
i++;
loadScript.append (" " + modelName);
tokType = (tok == 1073741824 && JU.PT.isOneOf (modelName.toLowerCase (), ";xyz;vxyz;vibration;temperature;occupancy;partialcharge;") ? J.script.T.getTokFromName (modelName) : 0);
if (tokType != 0) {
htParams.put ("atomDataOnly", Boolean.TRUE);
htParams.put ("modelNumber", Integer.$valueOf (1));
if (tokType == 4166) tokType = 1146095631;
tempFileInfo = this.viewer.getFileInfo ();
isAppend = true;
}}
switch (tok) {
case 1229984263:
i++;
loadScript.append (" " + modelName);
if (this.tokAt (i) == 7) {
filenames = this.stringParameterSet (i);
i = this.iToken;
if (i + 1 != this.slen) this.invArg ();
if (filenames != null) nFiles = filenames.length;
}break;
case 1073741983:
isInline = true;
i++;
loadScript.append (" " + modelName);
break;
case 135267336:
isSmiles = true;
i++;
break;
case 1073741849:
isAsync = true;
htParams.put ("async", Boolean.TRUE);
i++;
break;
case 536870926:
case 1095766030:
i++;
loadScript.append (" " + modelName);
if (tok == 536870926) htParams.put ("isTrajectory", Boolean.TRUE);
if (this.isPoint3f (i)) {
var pt = this.getPoint3f (i, false);
i = this.iToken + 1;
htParams.put ("firstLastStep", [Clazz.floatToInt (pt.x), Clazz.floatToInt (pt.y), Clazz.floatToInt (pt.z)]);
loadScript.append (" " + JW.Escape.eP (pt));
} else if (this.tokAt (i) == 10) {
bsModels = this.getToken (i++).value;
htParams.put ("bsModels", bsModels);
loadScript.append (" " + JW.Escape.eBS (bsModels));
} else {
htParams.put ("firstLastStep", [0, -1, 1]);
}break;
case 1073741824:
break;
default:
modelName = "fileset";
}
if (filenames == null && this.getToken (i).tok != 4) this.error (16);
}var filePt = i;
var localName = null;
if (this.tokAt (filePt + 1) == 1073741848) {
localName = this.stringParameter (i = i + 2);
if (this.viewer.getPathForAllFiles () !== "") {
localName = null;
filePt = i;
}}var filename = null;
var appendedData = null;
var appendedKey = null;
if (this.slen == i + 1) {
if (i == 0 || filenames == null && (filename = this.paramAsStr (filePt)).length == 0) filename = this.getFullPathName ();
if (filename == null && filenames == null) {
this.cmdZap (false);
return;
}if (filenames == null && !isInline) {
if (isSmiles) {
filename = "$" + filename;
} else {
if (filename.indexOf ("[]") >= 0) return;
if (filename.indexOf ("[") == 0) {
filenames = JW.Escape.unescapeStringArray (filename);
if (filenames != null) {
if (i == 1) loadScript.append (" files");
nFiles = filenames.length;
}}}}if (filenames != null) for (var j = 0; j < nFiles; j++) loadScript.append (" /*file*/").append (JU.PT.esc (filenames[j]));

} else if (this.getToken (i + 1).tok == 1073742010 || this.theTok == 2 || this.theTok == 7 || this.theTok == 269484096 || this.theTok == 1073742195 || this.theTok == 1048586 || this.theTok == 8 || this.theTok == 1073742080 || this.theTok == 1095761926 || this.theTok == 1073742163 || this.theTok == 1073742114 || this.theTok == 1073742152 || this.theTok == 1614417948 || this.theTok == 1073742066 || this.theTok == 1073741940 && this.tokAt (i + 3) != 1048581 || this.theTok == 1073741839 || this.theTok == 1073741824 && this.tokAt (i + 3) != 1048581) {
if ((filename = this.paramAsStr (filePt)).length == 0 && (filename = this.getFullPathName ()) == null) {
this.cmdZap (false);
return;
}if (filePt == i) i++;
if (filename.indexOf ("[]") >= 0) return;
if ((tok = this.tokAt (i)) == 1073742010) {
var manifest = this.stringParameter (++i);
htParams.put ("manifest", manifest);
sOptions += " MANIFEST " + JU.PT.esc (manifest);
tok = this.tokAt (++i);
}switch (tok) {
case 2:
var n = this.intParameter (i);
sOptions += " " + n;
if (n < 0) htParams.put ("vibrationNumber", Integer.$valueOf (-n));
 else htParams.put ("modelNumber", Integer.$valueOf (n));
tok = this.tokAt (++i);
break;
case 7:
case 269484096:
case 1073742195:
var data = this.floatParameterSet (i, 1, 2147483647);
i = this.iToken;
var bs =  new JU.BS ();
for (var j = 0; j < data.length; j++) if (data[j] >= 1 && data[j] == Clazz.floatToInt (data[j])) bs.set (Clazz.floatToInt (data[j]) - 1);

htParams.put ("bsModels", bs);
var iArray =  Clazz.newIntArray (bs.cardinality (), 0);
for (var pt = 0, j = bs.nextSetBit (0); j >= 0; j = bs.nextSetBit (j + 1)) iArray[pt++] = j + 1;

sOptions += " " + JW.Escape.eAI (iArray);
tok = this.tokAt (i);
break;
}
var lattice = null;
if (tok == 1048586 || tok == 8) {
lattice = this.getPoint3f (i, false);
i = this.iToken + 1;
tok = this.tokAt (i);
}switch (tok) {
case 1073742080:
case 1095761926:
case 1073742163:
case 1073742114:
case 1073742152:
case 1614417948:
if (lattice == null) lattice = JU.P3.new3 (555, 555, -1);
this.iToken = i - 1;
}
var offset = null;
if (lattice != null) {
htParams.put ("lattice", lattice);
i = this.iToken + 1;
sOptions += " {" + Clazz.floatToInt (lattice.x) + " " + Clazz.floatToInt (lattice.y) + " " + Clazz.floatToInt (lattice.z) + "}";
if (this.tokAt (i) == 1073742080) {
htParams.put ("packed", Boolean.TRUE);
sOptions += " PACKED";
i++;
}if (this.tokAt (i) == 1095761926) {
htParams.put ("centroid", Boolean.TRUE);
sOptions += " CENTROID";
i++;
if (this.tokAt (i) == 1073742080 && !htParams.containsKey ("packed")) {
htParams.put ("packed", Boolean.TRUE);
sOptions += " PACKED";
i++;
}}if (this.tokAt (i) == 1073742163) {
var supercell;
if (this.isPoint3f (++i)) {
var pt = this.getPoint3f (i, false);
if (pt.x != Clazz.floatToInt (pt.x) || pt.y != Clazz.floatToInt (pt.y) || pt.z != Clazz.floatToInt (pt.z) || pt.x < 1 || pt.y < 1 || pt.z < 1) {
this.iToken = i;
this.invArg ();
}supercell = pt;
i = this.iToken + 1;
} else {
supercell = this.stringParameter (i++);
}htParams.put ("supercell", supercell);
}var distance = 0;
if (this.tokAt (i) == 1073742114) {
i++;
distance = this.floatParameter (i++);
sOptions += " range " + distance;
}htParams.put ("symmetryRange", Float.$valueOf (distance));
var spacegroup = null;
var sg;
var iGroup = -2147483648;
if (this.tokAt (i) == 1073742152) {
++i;
spacegroup = JU.PT.rep (this.paramAsStr (i++), "''", "\"");
sOptions += " spacegroup " + JU.PT.esc (spacegroup);
if (spacegroup.equalsIgnoreCase ("ignoreOperators")) {
iGroup = -999;
} else {
if (spacegroup.length == 0) {
sg = this.viewer.getCurrentUnitCell ();
if (sg != null) spacegroup = sg.getSpaceGroupName ();
} else {
if (spacegroup.indexOf (",") >= 0) if ((lattice.x < 9 && lattice.y < 9 && lattice.z == 0)) spacegroup += "#doNormalize=0";
}htParams.put ("spaceGroupName", spacegroup);
iGroup = -2;
}}var fparams = null;
if (this.tokAt (i) == 1614417948) {
++i;
if (this.optParameterAsString (i).length == 0) {
sg = this.viewer.getCurrentUnitCell ();
if (sg != null) {
fparams = sg.getUnitCellAsArray (true);
offset = sg.getCartesianOffset ();
}} else {
fparams = this.floatParameterSet (i, 6, 9);
}if (fparams == null || fparams.length != 6 && fparams.length != 9) this.invArg ();
sOptions += " unitcell {";
for (var j = 0; j < fparams.length; j++) sOptions += (j == 0 ? "" : " ") + fparams[j];

sOptions += "}";
htParams.put ("unitcell", fparams);
if (iGroup == -2147483648) iGroup = -1;
i = this.iToken + 1;
}if (iGroup != -2147483648) htParams.put ("spaceGroupIndex", Integer.$valueOf (iGroup));
}if (offset != null) this.coordinatesAreFractional = false;
 else if (this.tokAt (i) == 1073742066) offset = this.getPoint3f (++i, true);
if (offset != null) {
if (this.coordinatesAreFractional) {
offset.setT (this.fractionalPoint);
htParams.put ("unitCellOffsetFractional", (this.coordinatesAreFractional ? Boolean.TRUE : Boolean.FALSE));
sOptions += " offset {" + offset.x + " " + offset.y + " " + offset.z + "/1}";
} else {
sOptions += " offset " + JW.Escape.eP (offset);
}htParams.put ("unitCellOffset", offset);
i = this.iToken + 1;
}if (this.tokAt (i) == 1073741839) {
if (this.tokAt (++i) == 135270408) {
i += 2;
appendedData = this.getToken (i++).value;
appendedKey = this.stringParameter (++i);
++i;
} else {
appendedKey = this.stringParameter (i++);
appendedData = this.stringParameter (i++);
}htParams.put (appendedKey, appendedData);
}if (this.tokAt (i) == 1073741940) filter = this.stringParameter (++i);
} else {
if (i == 1) {
i++;
loadScript.append (" " + modelName);
}var pt = null;
var bs = null;
var fNames =  new JU.List ();
while (i < this.slen) {
switch (this.tokAt (i)) {
case 1073741940:
filter = this.stringParameter (++i);
++i;
continue;
case 1048581:
htParams.remove ("isTrajectory");
if (firstLastSteps == null) {
firstLastSteps =  new JU.List ();
pt = JU.P3.new3 (0, -1, 1);
}if (this.isPoint3f (++i)) {
pt = this.getPoint3f (i, false);
i = this.iToken + 1;
} else if (this.tokAt (i) == 10) {
bs = this.getToken (i).value;
pt = null;
i = this.iToken + 1;
}break;
case 1073741824:
this.invArg ();
}
fNames.addLast (filename = this.paramAsStr (i++));
if (pt != null) {
firstLastSteps.addLast ([Clazz.floatToInt (pt.x), Clazz.floatToInt (pt.y), Clazz.floatToInt (pt.z)]);
loadScript.append (" COORD " + JW.Escape.eP (pt));
} else if (bs != null) {
firstLastSteps.addLast (bs);
loadScript.append (" COORD " + JW.Escape.eBS (bs));
}loadScript.append (" /*file*/$FILENAME" + fNames.size () + "$");
}
if (firstLastSteps != null) {
htParams.put ("firstLastSteps", firstLastSteps);
}nFiles = fNames.size ();
filenames = fNames.toArray ( new Array (nFiles));
}if (!doLoadFiles) return;
if (filenames != null) filename = "fileSet";
if (appendedData != null) {
sOptions += " APPEND data \"" + appendedKey + "\"\n" + appendedData + (appendedData.endsWith ("\n") ? "" : "\n") + "end \"" + appendedKey + "\"";
}if (filter == null) filter = this.viewer.getDefaultLoadFilter ();
if (filter.length > 0) {
if (filter.toUpperCase ().indexOf ("DOCACHE") >= 0) {
if (!this.$isStateScript && !isAppend) this.viewer.cacheClear ();
}htParams.put ("filter", filter);
if (filter.equalsIgnoreCase ("2d")) filter = "2D-noMin";
sOptions += " FILTER " + JU.PT.esc (filter);
}var isVariable = false;
if (filenames == null) {
if (isInline) {
htParams.put ("fileData", filename);
} else if (filename.startsWith ("@") && filename.length > 1) {
isVariable = true;
var s = this.getStringParameter (filename.substring (1), false);
htParams.put ("fileData", s);
loadScript =  new JU.SB ().append ("{\n    var ").append (filename.substring (1)).append (" = ").append (JU.PT.esc (s)).append (";\n    ").appendSB (loadScript);
} else if (this.viewer.isJS && (isAsync || filename.startsWith ("?"))) {
localName = null;
filename = this.loadFileAsync ("LOAD" + (isAppend ? "_APPEND_" : "_"), filename, i, !isAppend);
}}var out = null;
if (localName != null) {
if (localName.equals (".")) localName = this.viewer.getFilePath (filename, true);
if (localName.length == 0 || this.viewer.getFilePath (localName, false).equalsIgnoreCase (this.viewer.getFilePath (filename, false))) this.invArg ();
var fullPath = [localName];
out = this.viewer.getOutputChannel (localName, fullPath);
if (out == null) JW.Logger.error ("Could not create output stream for " + fullPath[0]);
 else htParams.put ("outputChannel", out);
}if (filenames == null && tokType == 0) {
loadScript.append (" ");
if (isVariable || isInline) {
loadScript.append (JU.PT.esc (filename));
} else if (!isData) {
if (!filename.equals ("string") && !filename.equals ("string[]")) loadScript.append ("/*file*/");
if (localName != null) localName = this.viewer.getFilePath (localName, false);
loadScript.append ((localName != null ? JU.PT.esc (localName) : "$FILENAME$"));
}if (sOptions.length > 0) loadScript.append (" /*options*/ ").append (sOptions);
if (isVariable) loadScript.append ("\n  }");
htParams.put ("loadScript", loadScript);
}this.setCursorWait (true);
var timeMsg = this.viewer.getBoolean (603979934);
if (timeMsg) JW.Logger.startTimer ("load");
errMsg = this.viewer.loadModelFromFile (null, filename, filenames, null, isAppend, htParams, loadScript, tokType);
if (out != null) {
this.viewer.setFileInfo ([localName]);
JW.Logger.info (J.i18n.GT.o (J.i18n.GT._ ("file {0} created"), localName));
this.showString (this.viewer.getFilePath (localName, false) + " created");
out.closeChannel ();
}if (tokType > 0) {
this.viewer.setFileInfo (tempFileInfo);
if (errMsg != null && !this.isCmdLine_c_or_C_Option) this.evalError (errMsg, null);
return;
}if (errMsg != null && !this.isCmdLine_c_or_C_Option) {
if (errMsg.indexOf ("NOTE: file recognized as a script file: ") == 0) {
filename = errMsg.substring ("NOTE: file recognized as a script file: ".length).trim ();
this.cmdScript (0, filename, null);
return;
}this.evalError (errMsg, null);
}if (isAppend && (appendNew || nFiles > 1)) {
this.viewer.setAnimationRange (-1, -1);
this.viewer.setCurrentModelIndex (modelCount0);
}if (this.scriptLevel == 0 && !isAppend && nFiles < 2) this.showString (this.viewer.getModelSetAuxiliaryInfoValue ("modelLoadNote"));
if (this.debugHigh) this.report ("Successfully loaded:" + (filenames == null ? htParams.get ("fullPathName") : modelName));
var info = this.viewer.getModelSetAuxiliaryInfo ();
if (info != null && info.containsKey ("centroidMinMax") && this.viewer.getAtomCount () > 0) {
var bs = JW.BSUtil.newBitSet2 (isAppend ? atomCount0 : 0, this.viewer.getAtomCount ());
this.viewer.setCentroid (bs, info.get ("centroidMinMax"));
}var script = this.viewer.getDefaultLoadScript ();
var msg = "";
if (script.length > 0) msg += "\nUsing defaultLoadScript: " + script;
if (info != null && this.viewer.allowEmbeddedScripts ()) {
var embeddedScript = info.remove ("jmolscript");
if (embeddedScript != null && embeddedScript.length > 0) {
msg += "\nAdding embedded #jmolscript: " + embeddedScript;
script += ";" + embeddedScript;
this.setStringProperty ("_loadScript", script);
script = "allowEmbeddedScripts = false;try{" + script + "} allowEmbeddedScripts = true;";
}} else {
this.setStringProperty ("_loadScript", "");
}this.logLoadInfo (msg);
var siteScript = (info == null ? null : info.remove ("sitescript"));
if (siteScript != null) script = siteScript + ";" + script;
if (script.length > 0 && !this.isCmdLine_c_or_C_Option) this.runScript (script);
if (timeMsg) this.showString (JW.Logger.getTimerMsg ("load", 0));
});
$_M(c$, "cmdLog", 
($fz = function () {
if (this.slen == 1) this.bad ();
if (this.chk) return;
var s = this.parameterExpressionString (1, 0);
if (this.tokAt (1) == 1048588) this.setStringProperty ("logFile", "");
 else this.viewer.log (s);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdLoop", 
($fz = function () {
if (this.viewer.isHeadless ()) return;
if (!this.chk) this.pc = -1;
this.cmdDelay ();
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdMessage", 
($fz = function () {
var text = this.paramAsStr (this.checkLast (1));
if (this.chk) return;
var s = this.viewer.formatText (text);
if (this.outputBuffer == null) this.viewer.showMessage (s);
if (!s.startsWith ("_")) this.report (s);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdModel", 
($fz = function (offset) {
var isFrame = (this.theTok == 4115);
var useModelNumber = true;
if (this.slen == 1 && offset == 1) {
var modelIndex = this.viewer.getCurrentModelIndex ();
var m;
if (!this.chk && modelIndex >= 0 && (m = this.viewer.getJmolDataSourceFrame (modelIndex)) >= 0) this.viewer.setCurrentModelIndex (m == modelIndex ? -2147483648 : m);
return;
}switch (this.tokAt (1)) {
case 2:
if (isFrame && this.slen == 2) {
if (!this.chk) this.viewer.setFrame (this.intParameter (1));
return;
}break;
case 1048577:
case 10:
var i = this.atomExpressionAt (1).nextSetBit (0);
this.checkLength (this.iToken + 1);
if (this.chk || i < 0) return;
var bsa =  new JU.BS ();
bsa.set (i);
this.viewer.setCurrentModelIndex (this.viewer.getModelBitSet (bsa, false).nextSetBit (0));
return;
case 1073741904:
this.iToken = 1;
var n = (this.tokAt (2) == 2 ? this.intParameter (++this.iToken) : 1);
this.checkLength (this.iToken + 1);
if (!this.chk && n > 0) this.viewer.createModels (n);
return;
case 1074790550:
this.checkLength (3);
var id = this.stringParameter (2);
if (!this.chk) this.viewer.setCurrentModelID (id);
return;
case 528397:
var millis = 0;
this.checkLength (3);
switch (this.getToken (2).tok) {
case 2:
case 3:
millis = Clazz.floatToLong (this.floatParameter (2) * 1000);
break;
default:
this.error (20);
}
if (!this.chk) this.viewer.setFrameDelayMs (millis);
return;
case 1073742166:
if (this.checkLength23 () > 0) if (!this.chk) this.viewer.setFrameTitleObj (this.slen == 2 ? "@{_modelName}" : (this.tokAt (2) == 7 ? J.script.SV.listValue (this.st[2]) : this.paramAsStr (2)));
return;
case 1073741832:
var bs = (this.slen == 2 || this.tokAt (2) == 1048587 ? null : this.atomExpressionAt (2));
if (!this.chk) this.viewer.setFrameOffsets (bs);
return;
}
if (this.getToken (offset).tok == 269484192) {
++offset;
if (this.getToken (this.checkLast (offset)).tok != 2 || this.intParameter (offset) != 1) this.invArg ();
if (!this.chk) this.viewer.setAnimation (1073742108);
return;
}var isPlay = false;
var isRange = false;
var isAll = false;
var isHyphen = false;
var frameList = [-1, -1];
var nFrames = 0;
var fFrame = 0;
var haveFileSet = this.viewer.haveFileSet ();
for (var i = offset; i < this.slen; i++) {
switch (this.getToken (i).tok) {
case 1048579:
case 269484209:
this.checkLength (offset + (isRange ? 2 : 1));
isAll = true;
break;
case 269484192:
if (nFrames != 1) this.invArg ();
isHyphen = true;
break;
case 1048587:
this.checkLength (offset + 1);
break;
case 3:
useModelNumber = false;
if ((fFrame = this.floatParameter (i)) < 0) {
this.checkLength (i + 1);
if (!this.chk) this.viewer.morph (-fFrame);
return;
}case 2:
case 4:
if (nFrames == 2) this.invArg ();
var iFrame = (this.theTok == 4 ? J.script.ScriptParam.getFloatEncodedInt (this.theToken.value) : this.theToken.intValue);
if (iFrame < 0 && nFrames == 1) {
isHyphen = true;
iFrame = -iFrame;
if (haveFileSet && iFrame < 1000000) iFrame *= 1000000;
}if (this.theTok == 3 && haveFileSet && fFrame == Clazz.floatToInt (fFrame)) iFrame = Clazz.floatToInt (fFrame) * 1000000;
if (iFrame == 2147483647) {
if (i == 1) {
var id = this.theToken.value.toString ();
var modelIndex = (this.chk ? -1 : this.viewer.getModelIndexFromId (id));
if (modelIndex >= 0) {
this.checkLength (2);
this.viewer.setCurrentModelIndex (modelIndex);
return;
}}iFrame = 0;
}if (iFrame == -1) {
this.checkLength (offset + 1);
if (!this.chk) this.viewer.setAnimation (1073742108);
return;
}if (iFrame >= 1000 && iFrame < 1000000 && haveFileSet) iFrame = (Clazz.doubleToInt (iFrame / 1000)) * 1000000 + (iFrame % 1000);
if (!useModelNumber && iFrame == 0 && nFrames == 0) isAll = true;
if (iFrame >= 1000000) useModelNumber = false;
frameList[nFrames++] = iFrame;
break;
case 1073742096:
isPlay = true;
break;
case 1073742114:
isRange = true;
break;
default:
this.frameControl (offset);
return;
}
}
if (isRange && nFrames == 0) isAll = true;
if (this.chk) return;
if (isAll) {
this.viewer.setAnimationOn (false);
this.viewer.setAnimationRange (-1, -1);
if (!isRange) this.viewer.setCurrentModelIndex (-1);
return;
}if (nFrames == 2 && !isRange) isHyphen = true;
if (haveFileSet) useModelNumber = false;
 else if (useModelNumber) for (var i = 0; i < nFrames; i++) if (frameList[i] >= 0) frameList[i] %= 1000000;

var modelIndex = this.viewer.getModelNumberIndex (frameList[0], useModelNumber, false);
var modelIndex2 = -1;
if (haveFileSet && modelIndex < 0 && frameList[0] != 0) {
if (frameList[0] < 1000000) frameList[0] *= 1000000;
if (nFrames == 2 && frameList[1] < 1000000) frameList[1] *= 1000000;
if (frameList[0] % 1000000 == 0) {
frameList[0]++;
modelIndex = this.viewer.getModelNumberIndex (frameList[0], false, false);
if (modelIndex >= 0) {
var i2 = (nFrames == 1 ? frameList[0] + 1000000 : frameList[1] == 0 ? -1 : frameList[1] % 1000000 == 0 ? frameList[1] + 1000001 : frameList[1] + 1);
modelIndex2 = this.viewer.getModelNumberIndex (i2, false, false);
if (modelIndex2 < 0) modelIndex2 = this.viewer.getModelCount ();
modelIndex2--;
if (isRange) nFrames = 2;
 else if (!isHyphen && modelIndex2 != modelIndex) isHyphen = true;
isRange = isRange || modelIndex == modelIndex2;
}} else {
return;
}}if (!isPlay && !isRange || modelIndex >= 0) this.viewer.setCurrentModelIndexClear (modelIndex, false);
if (isPlay && nFrames == 2 || isRange || isHyphen) {
if (modelIndex2 < 0) modelIndex2 = this.viewer.getModelNumberIndex (frameList[1], useModelNumber, false);
this.viewer.setAnimationOn (false);
this.viewer.setAnimationDirection (1);
this.viewer.setAnimationRange (modelIndex, modelIndex2);
this.viewer.setCurrentModelIndexClear (isHyphen && !isRange ? -1 : modelIndex >= 0 ? modelIndex : 0, false);
}if (isPlay) this.viewer.setAnimation (4143);
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "cmdMove", 
($fz = function () {
this.checkLength (-11);
var dRot = JU.V3.new3 (this.floatParameter (1), this.floatParameter (2), this.floatParameter (3));
var dZoom = this.floatParameter (4);
var dTrans = JU.V3.new3 (this.intParameter (5), this.intParameter (6), this.intParameter (7));
var dSlab = this.floatParameter (8);
var floatSecondsTotal = this.floatParameter (9);
var fps = (this.slen == 11 ? this.intParameter (10) : 30);
if (this.chk) return;
this.refresh (false);
if (!this.useThreads ()) floatSecondsTotal = 0;
this.viewer.move (this, dRot, dZoom, dTrans, dSlab, floatSecondsTotal, fps);
if (floatSecondsTotal > 0 && this.isJS) throw  new J.script.ScriptInterruption (this, "move", 1);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdMoveto", 
($fz = function () {
if (this.slen == 2 && this.tokAt (1) == 1073742162) {
if (!this.chk) this.viewer.stopMotion ();
return;
}var floatSecondsTotal;
if (this.slen == 2 && this.isFloatParameter (1)) {
floatSecondsTotal = this.floatParameter (1);
if (this.chk) return;
if (!this.useThreads ()) floatSecondsTotal = 0;
if (floatSecondsTotal > 0) this.refresh (false);
this.viewer.moveTo (this, floatSecondsTotal, null, JV.JC.axisZ, 0, null, 100, 0, 0, 0, null, NaN, NaN, NaN, NaN, NaN, NaN);
if (this.isJS && floatSecondsTotal > 0 && this.viewer.global.waitForMoveTo) throw  new J.script.ScriptInterruption (this, "moveTo", 1);
return;
}var axis = JU.V3.new3 (NaN, 0, 0);
var center = null;
var i = 1;
floatSecondsTotal = (this.isFloatParameter (i) ? this.floatParameter (i++) : 2.0);
var degrees = 90;
var bsCenter = null;
var isChange = true;
var xTrans = 0;
var yTrans = 0;
var zoom = NaN;
var rotationRadius = NaN;
var zoom0 = this.viewer.getZoomSetting ();
var navCenter = null;
var xNav = NaN;
var yNav = NaN;
var navDepth = NaN;
var cameraDepth = NaN;
var cameraX = NaN;
var cameraY = NaN;
var pymolView = null;
switch (this.getToken (i).tok) {
case 1073742110:
pymolView = this.floatParameterSet (++i, 18, 21);
i = this.iToken + 1;
if (this.chk && this.checkLength (i) > 0) return;
break;
case 135270418:
var q;
var isMolecular = false;
if (this.tokAt (++i) == 1073742028) {
isMolecular = true;
i++;
}if (this.tokAt (i) == 10 || this.tokAt (i) == 1048577) {
isMolecular = true;
center = this.centerParameter (i);
if (!(Clazz.instanceOf (this.expressionResult, JU.BS))) this.invArg ();
bsCenter = this.expressionResult;
q = (this.chk ?  new JU.Quat () : this.viewer.getAtomQuaternion (bsCenter.nextSetBit (0)));
} else {
q = this.getQuaternionParameter (i);
}i = this.iToken + 1;
if (q == null) this.invArg ();
var aa = q.toAxisAngle4f ();
axis.set (aa.x, aa.y, aa.z);
degrees = (isMolecular ? -1 : 1) * (aa.angle * 180.0 / 3.141592653589793);
break;
case 9:
case 8:
case 1048586:
if (this.isPoint3f (i)) {
axis.setT (this.getPoint3f (i, true));
i = this.iToken + 1;
degrees = this.floatParameter (i++);
} else {
var pt4 = this.getPoint4f (i);
i = this.iToken + 1;
axis.set (pt4.x, pt4.y, pt4.z);
degrees = (pt4.x == 0 && pt4.y == 0 && pt4.z == 0 ? NaN : pt4.w);
}break;
case 1073741954:
axis.set (1, 0, 0);
degrees = 0;
this.checkLength (++i);
break;
case 1073741859:
axis.set (0, 1, 0);
degrees = 180;
this.checkLength (++i);
break;
case 1073741996:
axis.set (0, 1, 0);
this.checkLength (++i);
break;
case 1073742128:
axis.set (0, -1, 0);
this.checkLength (++i);
break;
case 1074790748:
axis.set (1, 0, 0);
this.checkLength (++i);
break;
case 1073741871:
axis.set (-1, 0, 0);
this.checkLength (++i);
break;
default:
axis = JU.V3.new3 (this.floatParameter (i++), this.floatParameter (i++), this.floatParameter (i++));
degrees = this.floatParameter (i++);
}
if (Float.isNaN (axis.x) || Float.isNaN (axis.y) || Float.isNaN (axis.z)) axis.set (0, 0, 0);
 else if (axis.length () == 0 && degrees == 0) degrees = NaN;
isChange = !this.viewer.isInPosition (axis, degrees);
if (this.isFloatParameter (i)) zoom = this.floatParameter (i++);
if (this.isFloatParameter (i) && !this.isCenterParameter (i)) {
xTrans = this.floatParameter (i++);
yTrans = this.floatParameter (i++);
if (!isChange && Math.abs (xTrans - this.viewer.getTranslationXPercent ()) >= 1) isChange = true;
if (!isChange && Math.abs (yTrans - this.viewer.getTranslationYPercent ()) >= 1) isChange = true;
}if (bsCenter == null && i != this.slen) {
center = this.centerParameter (i);
if (Clazz.instanceOf (this.expressionResult, JU.BS)) bsCenter = this.expressionResult;
i = this.iToken + 1;
}if (center != null) {
if (!isChange && center.distance (this.viewer.getRotationCenter ()) >= 0.1) isChange = true;
if (this.isFloatParameter (i)) rotationRadius = this.floatParameter (i++);
if (!this.isCenterParameter (i)) {
if ((rotationRadius == 0 || Float.isNaN (rotationRadius)) && (zoom == 0 || Float.isNaN (zoom))) {
var newZoom = Math.abs (this.getZoom (0, i, bsCenter, (zoom == 0 ? 0 : zoom0)));
i = this.iToken + 1;
zoom = newZoom;
} else {
if (!isChange && Math.abs (rotationRadius - this.viewer.getFloat (570425388)) >= 0.1) isChange = true;
}}if (zoom == 0 || Float.isNaN (zoom)) zoom = 100;
if (Float.isNaN (rotationRadius)) rotationRadius = 0;
if (!isChange && Math.abs (zoom - zoom0) >= 1) isChange = true;
if (i != this.slen) {
navCenter = this.centerParameter (i);
i = this.iToken + 1;
if (i != this.slen) {
xNav = this.floatParameter (i++);
yNav = this.floatParameter (i++);
}if (i != this.slen) navDepth = this.floatParameter (i++);
if (i != this.slen) {
cameraDepth = this.floatParameter (i++);
if (!isChange && Math.abs (cameraDepth - this.viewer.getCameraDepth ()) >= 0.01) isChange = true;
}if (i + 1 < this.slen) {
cameraX = this.floatParameter (i++);
cameraY = this.floatParameter (i++);
if (!isChange && Math.abs (cameraX - this.viewer.getCamera ().x) >= 0.01) isChange = true;
if (!isChange && Math.abs (cameraY - this.viewer.getCamera ().y) >= 0.01) isChange = true;
}}}this.checkLength (i);
if (this.chk) return;
if (!isChange) floatSecondsTotal = 0;
if (floatSecondsTotal > 0) this.refresh (false);
if (!this.useThreads ()) floatSecondsTotal = 0;
if (cameraDepth == 0) {
cameraDepth = cameraX = cameraY = NaN;
}if (pymolView != null) this.viewer.movePyMOL (this, floatSecondsTotal, pymolView);
 else this.viewer.moveTo (this, floatSecondsTotal, center, axis, degrees, null, zoom, xTrans, yTrans, rotationRadius, navCenter, xNav, yNav, navDepth, cameraDepth, cameraX, cameraY);
if (this.isJS && floatSecondsTotal > 0 && this.viewer.global.waitForMoveTo) throw  new J.script.ScriptInterruption (this, "moveTo", 1);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdPause", 
($fz = function () {
if (this.chk || this.isJS && !this.allowJSThreads) return false;
var msg = this.optParameterAsString (1);
if (!this.viewer.getBooleanProperty ("_useCommandThread")) {
}if (this.viewer.autoExit || !this.viewer.haveDisplay && !this.viewer.isWebGL) return false;
if (this.scriptLevel == 0 && this.pc == this.aatoken.length - 1) {
this.viewer.scriptStatus ("nothing to pause: " + msg);
return false;
}msg = (msg.length == 0 ? ": RESUME to continue." : ": " + this.viewer.formatText (msg));
this.pauseExecution (true);
this.viewer.scriptStatusMsg ("script execution paused" + msg, "script paused for RESUME");
return true;
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdPrint", 
($fz = function () {
if (this.slen == 1) this.bad ();
this.showStringPrint (this.parameterExpressionString (1, 0), true);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdPrompt", 
($fz = function () {
var msg = null;
if (this.slen == 1) {
if (!this.chk) msg = J.script.ScriptEval.getContextTrace (this.viewer, this.getScriptContext ("prompt"), null, true).toString ();
} else {
msg = this.parameterExpressionString (1, 0);
}if (!this.chk) this.viewer.prompt (msg, "OK", null, true);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdReset", 
($fz = function () {
if (this.slen == 3 && this.tokAt (1) == 135368713) {
if (!this.chk) this.viewer.removeFunction (this.stringParameter (2));
return;
}this.checkLength (-2);
if (this.chk) return;
if (this.slen == 1) {
this.viewer.reset (false);
return;
}switch (this.tokAt (1)) {
case 135270423:
this.viewer.cacheClear ();
return;
case 1073741935:
this.viewer.resetError ();
return;
case 1087373323:
this.viewer.resetShapes (true);
return;
case 135368713:
this.viewer.clearFunctions ();
return;
case 1641025539:
var bsAllAtoms =  new JU.BS ();
this.runScript (this.viewer.getDefaultStructure (null, bsAllAtoms));
this.viewer.resetBioshapes (bsAllAtoms);
return;
case 1649412120:
this.viewer.setData ("element_vdw", [null, ""], 0, 0, 0, 0, 0);
return;
case 1076887572:
this.viewer.resetAromatic ();
return;
case 1611141175:
this.viewer.reset (true);
return;
}
var $var = this.paramAsStr (1);
if ($var.charAt (0) == '_') this.invArg ();
this.viewer.unsetProperty ($var);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdRestrict", 
($fz = function () {
var isBond = (this.tokAt (1) == 1678770178);
this.cmdSelect (isBond ? 2 : 1);
this.restrictSelected (isBond, true);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdReturn", 
($fz = function (tv) {
if (this.chk) return;
var t = this.getContextVariableAsVariable ("_retval");
if (t != null) {
var v = (tv != null || this.slen == 1 ? null : this.parameterExpressionToken (1));
if (tv == null) tv = (v == null ? J.script.SV.newI (0) : v);
t.value = tv.value;
t.intValue = tv.intValue;
t.tok = tv.tok;
}this.cmdGoto (false);
}, $fz.isPrivate = true, $fz), "J.script.SV");
$_M(c$, "cmdRotate", 
($fz = function (isSpin, isSelected) {
if (this.slen == 2) switch (this.getToken (1).tok) {
case 1048589:
if (!this.chk) this.viewer.setSpinOn (true);
return;
case 1048588:
if (!this.chk) this.viewer.setSpinOn (false);
return;
}
var bsAtoms = null;
var degreesPerSecond = 1.4E-45;
var nPoints = 0;
var endDegrees = 3.4028235E38;
var isMolecular = false;
var haveRotation = false;
var dihedralList = null;
var ptsA = null;
var points =  new Array (2);
var rotAxis = JU.V3.new3 (0, 1, 0);
var translation = null;
var m4 = null;
var m3 = null;
var direction = 1;
var tok;
var q = null;
var helicalPath = false;
var ptsB = null;
var bsCompare = null;
var invPoint = null;
var invPlane = null;
var axesOrientationRasmol = this.viewer.getBoolean (603979806);
for (var i = 1; i < this.slen; ++i) {
switch (tok = this.getToken (i).tok) {
case 10:
case 1048577:
case 1048586:
case 8:
case 1048582:
if (tok == 10 || tok == 1048577) {
if (translation != null || q != null || nPoints == 2) {
bsAtoms = this.atomExpressionAt (i);
ptsB = null;
isSelected = true;
break;
}}haveRotation = true;
if (nPoints == 2) nPoints = 0;
var pt1 = this.centerParameterForModel (i, this.viewer.getCurrentModelIndex ());
if (!this.chk && tok == 1048582 && this.tokAt (i + 2) != 269484096) {
isMolecular = true;
var data = [this.objectNameParameter (++i), Integer.$valueOf (this.viewer.getCurrentModelIndex ()), null];
rotAxis = (this.getShapePropertyData (22, "getSpinAxis", data) ? data[2] : null);
}points[nPoints++] = pt1;
break;
case 1611141175:
isSpin = true;
continue;
case 1073741988:
case 1073742028:
isMolecular = true;
continue;
case 1114638363:
isSelected = true;
break;
case 269484080:
continue;
case 2:
case 3:
if (isSpin) {
if (degreesPerSecond == 1.4E-45) {
degreesPerSecond = this.floatParameter (i);
continue;
} else if (endDegrees == 3.4028235E38) {
endDegrees = degreesPerSecond;
degreesPerSecond = this.floatParameter (i);
continue;
}} else {
if (endDegrees == 3.4028235E38) {
endDegrees = this.floatParameter (i);
continue;
} else if (degreesPerSecond == 1.4E-45) {
degreesPerSecond = this.floatParameter (i);
isSpin = true;
continue;
}}this.invArg ();
break;
case 269484192:
direction = -1;
continue;
case 1112541205:
haveRotation = true;
rotAxis.set (direction, 0, 0);
continue;
case 1112541206:
haveRotation = true;
rotAxis.set (0, direction, 0);
continue;
case 1112541207:
haveRotation = true;
rotAxis.set (0, 0, (axesOrientationRasmol && !isMolecular ? -direction : direction));
continue;
case 9:
case 135270418:
case 1073741863:
if (tok == 135270418) i++;
haveRotation = true;
q = this.getQuaternionParameter (i);
if (q != null) {
if (tok == 1073741863 && !(isMolecular = isSelected)) q = q.mulQ (this.viewer.getRotationQuaternion ().mul (-1));
rotAxis.setT (q.getNormal ());
endDegrees = q.getTheta ();
}break;
case 135266307:
haveRotation = true;
if (this.isPoint3f (++i)) {
rotAxis.setT (this.centerParameter (i));
break;
}var p4 = this.getPoint4f (i);
rotAxis.set (p4.x, p4.y, p4.z);
endDegrees = p4.w;
q = JU.Quat.newVA (rotAxis, endDegrees);
break;
case 1048580:
isSelected = true;
isMolecular = true;
haveRotation = true;
if (this.isArrayParameter (++i)) {
dihedralList = this.floatParameterSet (i, 6, 2147483647);
i = this.iToken;
} else {
var iAtom1 = this.atomExpressionAt (i).nextSetBit (0);
var iAtom2 = this.atomExpressionAt (++this.iToken).nextSetBit (0);
if (iAtom1 < 0 || iAtom2 < 0) return;
bsAtoms = this.viewer.getBranchBitSet (iAtom2, iAtom1, true);
points[0] = this.viewer.getAtomPoint3f (iAtom1);
points[1] = this.viewer.getAtomPoint3f (iAtom2);
nPoints = 2;
}break;
case 4160:
translation = JU.V3.newV (this.centerParameter (++i));
isMolecular = isSelected = true;
break;
case 137363467:
helicalPath = true;
continue;
case 1297090050:
var symop = this.intParameter (++i);
if (this.chk) continue;
var info = this.viewer.getSpaceGroupInfo (null);
var op = (info == null ? null : info.get ("operations"));
if (symop == 0 || op == null || op.length < Math.abs (symop)) this.invArg ();
op = op[Math.abs (symop) - 1];
translation = op[5];
invPoint = op[6];
points[0] = op[7];
if (op[8] != null) rotAxis = op[8];
endDegrees = (op[9]).intValue ();
if (symop < 0) {
endDegrees = -endDegrees;
if (translation != null) translation.scale (-1);
}if (endDegrees == 0 && points[0] != null) {
rotAxis.normalize ();
JW.Measure.getPlaneThroughPoint (points[0], rotAxis, invPlane =  new JU.P4 ());
}q = JU.Quat.newVA (rotAxis, endDegrees);
nPoints = (points[0] == null ? 0 : 1);
isMolecular = true;
haveRotation = true;
isSelected = true;
continue;
case 135270405:
case 12:
case 11:
haveRotation = true;
if (tok == 135270405) {
bsCompare = this.atomExpressionAt (++i);
ptsA = this.viewer.getAtomPointVector (bsCompare);
if (ptsA == null) {
this.iToken = i;
this.invArg ();
}i = this.iToken;
ptsB = this.getPointVector (this.getToken (++i), i);
if (ptsB == null || ptsA.size () != ptsB.size ()) {
this.iToken = i;
this.invArg ();
}m4 =  new JU.M4 ();
points[0] =  new JU.P3 ();
nPoints = 1;
var stddev = (this.chk ? 0 : JW.Measure.getTransformMatrix4 (ptsA, ptsB, m4, points[0], false));
if (stddev > 0.001) ptsB = null;
} else if (tok == 12) {
m4 = this.theToken.value;
}m3 =  new JU.M3 ();
if (m4 != null) {
translation =  new JU.V3 ();
m4.getTranslation (translation);
m4.getRotationScale (m3);
} else {
m3 = this.theToken.value;
}q = (this.chk ?  new JU.Quat () : JU.Quat.newM (m3));
rotAxis.setT (q.getNormal ());
endDegrees = q.getTheta ();
isMolecular = true;
break;
default:
this.invArg ();
}
i = this.iToken;
}
if (this.chk) return;
if (dihedralList != null) {
if (endDegrees != 3.4028235E38) {
isSpin = true;
degreesPerSecond = endDegrees;
}}if (isSelected && bsAtoms == null) bsAtoms = this.viewer.getSelectedAtoms ();
if (bsCompare != null) {
isSelected = true;
if (bsAtoms == null) bsAtoms = bsCompare;
}var rate = (degreesPerSecond == 1.4E-45 ? 10 : endDegrees == 3.4028235E38 ? degreesPerSecond : (degreesPerSecond < 0) == (endDegrees > 0) ? -endDegrees / degreesPerSecond : degreesPerSecond);
if (dihedralList != null) {
if (!isSpin) {
this.viewer.setDihedrals (dihedralList, null, 1);
return;
}translation = null;
}if (q != null) {
if (nPoints == 0 && translation != null) points[0] = this.viewer.getAtomSetCenter (bsAtoms != null ? bsAtoms : isSelected ? this.viewer.getSelectedAtoms () : this.viewer.getAllAtoms ());
if (helicalPath && translation != null) {
points[1] = JU.P3.newP (points[0]);
points[1].add (translation);
var ret = JW.Measure.computeHelicalAxis (null, 135266306, points[0], points[1], q);
points[0] = ret[0];
var theta = (ret[3]).x;
if (theta != 0) {
translation = ret[1];
rotAxis = JU.V3.newV (translation);
if (theta < 0) rotAxis.scale (-1);
}m4 = null;
}if (isSpin && m4 == null) m4 = J.script.ScriptMathProcessor.getMatrix4f (q.getMatrix (), translation);
if (points[0] != null) nPoints = 1;
}if (invPoint != null) {
this.viewer.invertAtomCoordPt (invPoint, bsAtoms);
if (rotAxis == null) return;
}if (invPlane != null) {
this.viewer.invertAtomCoordPlane (invPlane, bsAtoms);
if (rotAxis == null) return;
}if (nPoints < 2 && dihedralList == null) {
if (!isMolecular) {
if (isSpin && bsAtoms == null && !this.useThreads ()) return;
if (this.viewer.rotateAxisAngleAtCenter (this, points[0], rotAxis, rate, endDegrees, isSpin, bsAtoms) && this.isJS && isSpin && bsAtoms == null) throw  new J.script.ScriptInterruption (this, "rotate", 1);
return;
}if (nPoints == 0) points[0] =  new JU.P3 ();
points[1] = JU.P3.newP (points[0]);
points[1].add (rotAxis);
nPoints = 2;
}if (nPoints == 0) points[0] =  new JU.P3 ();
if (nPoints < 2 || points[0].distance (points[1]) == 0) {
points[1] = JU.P3.newP (points[0]);
points[1].y += 1.0;
}if (endDegrees == 3.4028235E38) endDegrees = 0;
if (endDegrees != 0 && translation != null && !haveRotation) translation.scale (endDegrees / translation.length ());
if (isSpin && translation != null && (endDegrees == 0 || degreesPerSecond == 0)) {
endDegrees = 0.01;
rate = (degreesPerSecond == 1.4E-45 ? 0.01 : degreesPerSecond < 0 ? -endDegrees / degreesPerSecond : degreesPerSecond * 0.01 / translation.length ());
degreesPerSecond = 0.01;
}if (bsAtoms != null && isSpin && ptsB == null && m4 != null) {
ptsA = this.viewer.getAtomPointVector (bsAtoms);
ptsB = JW.Measure.transformPoints (ptsA, m4, points[0]);
}if (bsAtoms != null && !isSpin && ptsB != null) {
this.viewer.setAtomCoords (bsAtoms, 1146095626, ptsB);
} else {
if (!this.useThreads ()) return;
if (this.viewer.rotateAboutPointsInternal (this, points[0], points[1], rate, endDegrees, isSpin, bsAtoms, translation, ptsB, dihedralList) && this.isJS && isSpin) throw  new J.script.ScriptInterruption (this, "rotate", 1);
}}, $fz.isPrivate = true, $fz), "~B,~B");
$_M(c$, "cmdRestore", 
($fz = function () {
if (this.slen > 1) {
var saveName = this.optParameterAsString (2);
var tok = this.tokAt (1);
switch (tok) {
case 1073742077:
case 1073742132:
case 1073742139:
var floatSecondsTotal = (this.slen > 3 ? this.floatParameter (3) : 0);
if (floatSecondsTotal < 0) this.invArg ();
if (this.chk) return;
var type = "";
switch (tok) {
case 1073742077:
type = "Orientation";
this.viewer.restoreOrientation (saveName, floatSecondsTotal);
break;
case 1073742132:
type = "Rotation";
this.viewer.restoreRotation (saveName, floatSecondsTotal);
break;
case 1073742139:
type = "Scene";
this.viewer.restoreScene (saveName, floatSecondsTotal);
break;
}
if (this.isJS && floatSecondsTotal > 0 && this.viewer.global.waitForMoveTo) throw  new J.script.ScriptInterruption (this, "restore" + type, 1);
return;
}
this.checkLength23 ();
switch (tok) {
case 1678770178:
if (!this.chk) this.viewer.restoreBonds (saveName);
return;
case 14:
if (this.chk) return;
var sc = this.viewer.getContext (saveName);
if (sc != null) {
this.restoreScriptContext (sc, true, false, false);
if (this.thisContext != null) {
this.thisContext.setMustResume ();
this.mustResumeEval = true;
this.tQuiet = true;
}}return;
case 1048581:
if (this.chk) return;
var script = this.viewer.getSavedCoordinates (saveName);
if (script == null) this.invArg ();
this.runScript (script);
this.viewer.checkCoordinatesChanged ();
return;
case 1073742140:
if (!this.chk) this.viewer.restoreSelection (saveName);
return;
case 1073742158:
if (this.chk) return;
var state = this.viewer.getSavedState (saveName);
if (state == null) this.invArg ();
this.runScript (state);
return;
case 1641025539:
if (this.chk) return;
var shape = this.viewer.getSavedStructure (saveName);
if (shape == null) this.invArg ();
this.runScript (shape);
return;
}
}this.errorStr2 (53, "RESTORE", "bonds? context? coordinates? orientation? rotation? selection? state? structure?");
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdSave", 
($fz = function () {
if (this.slen > 1) {
var saveName = this.optParameterAsString (2);
switch (this.tokAt (1)) {
case 1678770178:
if (!this.chk) this.viewer.saveBonds (saveName);
return;
case 14:
if (!this.chk) this.viewer.saveContext (saveName);
return;
case 1048581:
if (!this.chk) this.viewer.saveCoordinates (saveName, this.viewer.getSelectedAtoms ());
return;
case 1073742077:
case 1073742132:
if (!this.chk) this.viewer.saveOrientation (saveName, null);
return;
case 1073742140:
if (!this.chk) this.viewer.saveSelection (saveName);
return;
case 1073742158:
if (!this.chk) this.viewer.saveState (saveName);
return;
case 1641025539:
if (!this.chk) this.viewer.saveStructure (saveName);
return;
}
}this.errorStr2 (53, "SAVE", "bonds? context? coordinates? orientation? rotation? selection? state? structure?");
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdScript", 
function (tok, filename, theScript) {
var loadCheck = true;
var isCheck = false;
var doStep = false;
var lineNumber = 0;
var pc = 0;
var lineEnd = 0;
var pcEnd = 0;
var i = 1;
var localPath = null;
var remotePath = null;
var scriptPath = null;
var params = null;
if (tok == 135287308) {
this.checkLength (2);
if (!this.chk) this.viewer.jsEval (this.paramAsStr (1));
return;
}var isAsync = false;
if (filename == null && theScript == null) {
tok = this.tokAt (i);
if (tok != 4) this.error (16);
filename = this.paramAsStr (i);
if (filename.equalsIgnoreCase ("async")) {
isAsync = true;
filename = this.paramAsStr (++i);
}if (filename.equalsIgnoreCase ("applet")) {
var appID = this.paramAsStr (++i);
theScript = this.parameterExpressionString (++i, 0);
this.checkLast (this.iToken);
if (this.chk) return;
if (appID.length == 0 || appID.equals ("all")) appID = "*";
if (!appID.equals (".")) {
this.viewer.jsEval (appID + "\1" + theScript);
if (!appID.equals ("*")) return;
}} else {
tok = this.tokAt (this.slen - 1);
doStep = (tok == 266298);
if (filename.equalsIgnoreCase ("inline")) {
theScript = this.parameterExpressionString (++i, (doStep ? this.slen - 1 : 0));
i = this.iToken;
}while (filename.equalsIgnoreCase ("localPath") || filename.equalsIgnoreCase ("remotePath") || filename.equalsIgnoreCase ("scriptPath")) {
if (filename.equalsIgnoreCase ("localPath")) localPath = this.paramAsStr (++i);
 else if (filename.equalsIgnoreCase ("scriptPath")) scriptPath = this.paramAsStr (++i);
 else remotePath = this.paramAsStr (++i);
filename = this.paramAsStr (++i);
}
if (this.viewer.isJS && (isAsync || filename.startsWith ("?"))) {
filename = this.loadFileAsync ("SCRIPT_", filename, i, true);
}if ((tok = this.tokAt (++i)) == 1073741878) {
isCheck = true;
tok = this.tokAt (++i);
}if (tok == 1073742050) {
loadCheck = false;
tok = this.tokAt (++i);
}if (tok == 1073741998 || tok == 1141899268) {
i++;
lineEnd = lineNumber = Math.max (this.intParameter (i++), 0);
if (this.checkToken (i)) {
if (this.getToken (i).tok == 269484192) lineEnd = (this.checkToken (++i) ? this.intParameter (i++) : 0);
 else lineEnd = -this.intParameter (i++);
if (lineEnd <= 0) this.invArg ();
}} else if (tok == 1073741890 || tok == 1073741892) {
i++;
pc = Math.max (this.intParameter (i++) - 1, 0);
pcEnd = pc + 1;
if (this.checkToken (i)) {
if (this.getToken (i).tok == 269484192) pcEnd = (this.checkToken (++i) ? this.intParameter (i++) : 0);
 else pcEnd = -this.intParameter (i++);
if (pcEnd <= 0) this.invArg ();
}}if (this.tokAt (i) == 269484048) {
params = this.parameterExpressionList (i, -1, false);
i = this.iToken + 1;
}this.checkLength (doStep ? i + 1 : i);
}}if (this.chk && !this.isCmdLine_c_or_C_Option) return;
if (this.isCmdLine_c_or_C_Option) isCheck = true;
var wasSyntaxCheck = this.chk;
var wasScriptCheck = this.isCmdLine_c_or_C_Option;
if (isCheck) this.chk = this.isCmdLine_c_or_C_Option = true;
this.pushContext (null, "SCRIPT");
this.contextPath += " >> " + filename;
if (theScript == null ? this.compileScriptFileInternal (filename, localPath, remotePath, scriptPath) : this.compileScript (null, theScript, false)) {
this.pcEnd = pcEnd;
this.lineEnd = lineEnd;
while (pc < this.lineNumbers.length && this.lineNumbers[pc] < lineNumber) pc++;

this.pc = pc;
var saveLoadCheck = this.isCmdLine_C_Option;
this.isCmdLine_C_Option = new Boolean (this.isCmdLine_C_Option & loadCheck).valueOf ();
this.executionStepping = new Boolean (this.executionStepping | doStep).valueOf ();
this.contextVariables =  new java.util.Hashtable ();
this.contextVariables.put ("_arguments", (params == null ? J.script.SV.getVariableAI ([]) : J.script.SV.getVariableList (params)));
if (isCheck) this.listCommands = true;
var timeMsg = this.viewer.getBoolean (603979934);
if (timeMsg) JW.Logger.startTimer ("script");
this.dispatchCommands (false, false);
if (this.$isStateScript) J.script.ScriptManager.setStateScriptVersion (this.viewer, null);
if (timeMsg) this.showString (JW.Logger.getTimerMsg ("script", 0));
this.isCmdLine_C_Option = saveLoadCheck;
this.popContext (false, false);
} else {
JW.Logger.error (J.i18n.GT._ ("script ERROR: ") + this.errorMessage);
this.popContext (false, false);
if (wasScriptCheck) {
this.setErrorMessage (null);
} else {
this.evalError (null, null);
}}this.chk = wasSyntaxCheck;
this.isCmdLine_c_or_C_Option = wasScriptCheck;
}, "~N,~S,~S");
$_M(c$, "cmdSelect", 
($fz = function (i) {
if (this.slen == 1) {
this.viewer.select (null, false, 0, !this.doReport ());
return;
}if (this.slen == 2 && this.tokAt (1) == 1073742072) return;
this.viewer.setNoneSelected (this.slen == 4 && this.tokAt (2) == 1048587);
if (this.tokAt (2) == 10 && Clazz.instanceOf (this.getToken (2).value, JM.BondSet) || this.tokAt (2) == 1678770178 && this.getToken (3).tok == 10) {
if (this.slen != this.iToken + 2) this.invArg ();
if (!this.chk) this.viewer.selectBonds (this.theToken.value);
return;
}if (this.tokAt (2) == 1746538509) {
if (this.slen != 5 || this.getToken (3).tok != 10) this.invArg ();
if (!this.chk) this.setShapeProperty (6, "select", this.theToken.value);
return;
}var bs;
var addRemove = 0;
var isGroup = false;
if (this.getToken (1).intValue == 0 && this.theTok != 1048588) {
var v = this.parameterExpressionToken (0).value;
if (!(Clazz.instanceOf (v, JU.BS))) this.invArg ();
this.checkLast (this.iToken);
bs = v;
} else {
var tok = this.tokAt (i);
switch (tok) {
case 1048589:
case 1048588:
if (!this.chk) this.viewer.setSelectionHalos (tok == 1048589);
tok = this.tokAt (++i);
if (tok == 0) return;
break;
}
switch (tok) {
case 1276118017:
case 1073742119:
addRemove = tok;
tok = this.tokAt (++i);
}
isGroup = (tok == 1087373318);
if (isGroup) tok = this.tokAt (++i);
bs = this.atomExpressionAt (i);
}if (this.chk) return;
if (this.isBondSet) {
this.viewer.selectBonds (bs);
} else {
if (bs.length () > this.viewer.getAtomCount ()) {
var bs1 = this.viewer.getAllAtoms ();
bs1.and (bs);
bs = bs1;
}this.viewer.select (bs, isGroup, addRemove, !this.doReport ());
}}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "cmdSelectionHalos", 
($fz = function (pt) {
var showHalo = false;
switch (pt == this.slen ? 1048589 : this.getToken (pt).tok) {
case 1048589:
case 1114638363:
showHalo = true;
case 1048588:
case 1048587:
case 1073742056:
this.setBooleanProperty ("selectionHalos", showHalo);
break;
default:
this.invArg ();
}
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "cmdSet", 
($fz = function () {
if (this.slen == 1) {
this.showString (this.viewer.getAllSettings (null));
return;
}var isJmolSet = (this.paramAsStr (0).equals ("set"));
var key = this.optParameterAsString (1);
if (isJmolSet && this.slen == 2 && key.indexOf ("?") >= 0) {
this.showString (this.viewer.getAllSettings (key.substring (0, key.indexOf ("?"))));
return;
}var tok = this.getToken (1).tok;
var newTok = 0;
var sval;
var ival = 2147483647;
var b;
var pt;
var showing = (!this.chk && this.doReport () && !(this.st[0].value).equals ("var"));
switch (tok) {
case 1611272194:
this.cmdAxes (2);
return;
case 1610616835:
this.cmdBackground (2);
return;
case 1679429641:
this.cmdBoundbox (2);
return;
case 1611272202:
this.cmdFrank (2);
return;
case 1610616855:
this.cmdHistory (2);
return;
case 1826248716:
this.cmdLabel (2);
return;
case 1614417948:
this.cmdUnitcell (2);
return;
case 536870920:
this.sm.loadShape (8);
this.setShapeProperty (8, "highlight", (this.tokAt (2) == 1048588 ? null : this.atomExpressionAt (2)));
return;
case 1610625028:
case 1611141171:
this.cmdSelectionHalos (2);
return;
case 536875070:
this.cmdTimeout (2);
return;
}
switch (tok) {
case 1641025539:
var type = J.constant.EnumStructure.getProteinStructureType (this.paramAsStr (2));
if (type === J.constant.EnumStructure.NOT) this.invArg ();
var data = this.floatParameterSet (3, 0, 2147483647);
if (data.length % 4 != 0) this.invArg ();
this.viewer.setStructureList (data, type);
this.checkLast (this.iToken);
return;
case 545259526:
ival = this.getArgbParam (2);
if (!this.chk) this.setObjectArgb ("axes", ival);
return;
case 1610612737:
b = false;
switch (this.getToken (this.checkLast (2)).tok) {
case 269484128:
break;
case 269484112:
b = true;
break;
default:
this.invArg ();
}
this.setBooleanProperty ("bondModeOr", b);
return;
case 536870916:
if (this.chk) return;
var iLevel = (this.tokAt (2) == 1048588 || this.tokAt (2) == 2 && this.intParameter (2) == 0 ? 4 : 5);
JW.Logger.setLogLevel (iLevel);
this.setIntProperty ("logLevel", iLevel);
if (iLevel == 4) {
this.viewer.setDebugScript (false);
if (showing) this.viewer.showParameter ("debugScript", true, 80);
}this.setDebugging ();
if (showing) this.viewer.showParameter ("logLevel", true, 80);
return;
case 537022465:
this.cmdSetEcho ();
return;
case 1610612738:
this.cmdFont (5, this.checkLength23 () == 2 ? 0 : this.floatParameter (2));
return;
case 1612189718:
var bool = false;
switch (this.tokAt (this.checkLast (2))) {
case 1115297793:
bool = true;
case 3145754:
this.setBooleanProperty ("hbondsBackbone", bool);
break;
case 1073742150:
bool = true;
case 1073741926:
this.setBooleanProperty ("hbondsSolid", bool);
break;
default:
this.invArg ();
}
return;
case 1746538509:
case 537006096:
switch (tok = this.tokAt (this.checkLast (2))) {
case 1048589:
case 1048588:
this.setBooleanProperty ("measurementlabels", tok == 1048589);
return;
case 1073741926:
case 2:
case 3:
this.viewer.loadShape (6);
var mad = this.getSetAxesTypeMad (2);
if (mad != 2147483647) this.setShapeSizeBs (6, mad, null);
return;
}
this.setUnits (this.paramAsStr (2), 545259568);
return;
case 1611141176:
b = false;
switch (this.tokAt (this.checkLast (2))) {
case 1115297793:
b = true;
break;
case 3145754:
break;
default:
this.invArg ();
}
this.setBooleanProperty ("ssbondsBackbone", b);
return;
case 1610612741:
this.cmdSetLabel ("toggle");
return;
case 536870930:
var v =  new JU.List ();
for (var i = 2; i < this.slen; i++) {
var argb = this.getArgbParam (i);
v.addLast (Integer.$valueOf (argb));
i = this.iToken;
}
if (this.chk) return;
var n = v.size ();
var scale =  Clazz.newIntArray (n, 0);
for (var i = n; --i >= 0; ) scale[i] = v.get (i).intValue ();

this.viewer.setUserScale (scale);
return;
case 553648188:
if (this.isFloatParameter (2)) {
this.checkLength (3);
this.setIntProperty ("zSlab", Clazz.floatToInt (this.floatParameter (2)));
pt = null;
} else {
if (!this.isCenterParameter (2)) this.invArg ();
pt = this.centerParameter (2);
this.checkLength (this.iToken + 1);
}if (!this.chk) this.viewer.setZslabPoint (pt);
return;
}
var justShow = true;
switch (tok) {
case 536870914:
if (this.slen > 2) {
var modelDotted = this.getSettingStr (2, false);
var modelNumber;
var useModelNumber = false;
if (modelDotted.indexOf (".") < 0) {
modelNumber = JU.PT.parseInt (modelDotted);
useModelNumber = true;
} else {
modelNumber = J.script.ScriptParam.getFloatEncodedInt (modelDotted);
}if (this.chk) return;
var modelIndex = this.viewer.getModelNumberIndex (modelNumber, useModelNumber, true);
this.viewer.setBackgroundModelIndex (modelIndex);
return;
}break;
case 1649412120:
if (this.chk) return;
this.viewer.setAtomProperty (this.viewer.getAllAtoms (), 1649412120, -1, NaN, null, null, null);
if (this.slen > 2 && "probe".equalsIgnoreCase (this.getSettingStr (2, false))) {
this.runScript ("#VDW radii for PROBE;{_H}.vdw = 1.0;{_H and connected(_C) and not connected(within(smiles,\'[a]\'))}.vdw = 1.17;{_C}.vdw = 1.75;{_C and connected(3) and connected(_O)}.vdw = 1.65;{_N}.vdw = 1.55;{_O}.vdw = 1.4;{_P}.vdw = 1.8;{_S}.vdw = 1.8;message VDW radii for H, C, N, O, P, and S set according to Word, et al., J. Mol. Biol. (1999) 285, 1711-1733");
return;
}newTok = 545259555;
case 545259555:
if (this.slen > 2) {
sval = this.paramAsStr (2);
if (this.slen == 3 && J.constant.EnumVdw.getVdwType (sval) == null && J.constant.EnumVdw.getVdwType (sval = this.getSettingStr (2, false)) == null) this.invArg ();
this.setStringProperty (key, sval);
}break;
case 536870918:
if (this.slen > 2) {
var $var = this.parameterExpressionToken (2);
if ($var.tok == 8) pt = $var.value;
 else {
pt =  new JU.P3 ();
var ijk = $var.asInt ();
if (ijk >= 100) JW.SimpleUnitCell.ijkToPoint3f (ijk, pt, -1);
}if (!this.chk) this.viewer.setDefaultLattice (pt);
}break;
case 545259552:
case 545259545:
if (this.slen > 2) {
if ((this.theTok = this.tokAt (2)) == 1073741991 || this.theTok == 1073742116) {
sval = this.paramAsStr (this.checkLast (2));
} else {
sval = this.getSettingStr (2, false);
}this.setStringProperty (key, sval);
}break;
case 1632634891:
ival = this.getSettingInt (2);
if (ival == -2147483648) this.invArg ();
if (!this.chk) this.viewer.setFormalCharges (ival);
return;
case 553648148:
ival = this.getSettingInt (2);
if (!this.chk) {
if (ival != -2147483648) this.commandHistoryLevelMax = ival;
this.setIntProperty (key, ival);
}break;
case 545259564:
if (this.slen > 2) this.setStringProperty (key, this.getSettingStr (2, isJmolSet));
break;
case 545259568:
case 545259558:
if (this.slen > 2) this.setUnits (this.getSettingStr (2, isJmolSet), tok);
break;
case 545259572:
if (!this.chk) this.viewer.setPicked (-1);
if (this.slen > 2) {
this.cmdSetPicking ();
return;
}break;
case 545259574:
if (this.slen > 2) {
this.cmdSetPickingStyle ();
return;
}break;
case 1716520985:
break;
case 553648168:
ival = this.getSettingInt (2);
if (!this.chk && ival != -2147483648) this.setIntProperty (key, this.scriptReportingLevel = ival);
break;
case 536870924:
ival = this.getSettingInt (2);
if (ival == -2147483648 || ival == 0 || ival == 1) {
justShow = false;
break;
}tok = 553648174;
key = "specularPercent";
this.setIntProperty (key, ival);
break;
case 1650071565:
tok = 553648178;
key = "strandCount";
this.setIntProperty (key, this.getSettingInt (2));
break;
default:
justShow = false;
}
if (justShow && !showing) return;
var isContextVariable = (!justShow && !isJmolSet && this.getContextVariableAsVariable (key) != null);
if (!justShow && !isContextVariable) {
switch (tok) {
case 1678770178:
newTok = 603979928;
break;
case 1613758470:
newTok = 603979908;
break;
case 1613758476:
newTok = 603979910;
break;
case 1610612739:
newTok = 603979879;
break;
case 1666189314:
newTok = 570425394;
this.setFloatProperty ("solventProbeRadius", this.getSettingFloat (2));
justShow = true;
break;
case 1610612740:
newTok = 570425390;
break;
case 1613758488:
newTok = 603979948;
break;
case 1766856708:
newTok = 545259545;
break;
case 1611141175:
sval = this.paramAsStr (2).toLowerCase ();
switch ("x;y;z;fps".indexOf (sval + ";")) {
case 0:
newTok = 570425398;
break;
case 2:
newTok = 570425400;
break;
case 4:
newTok = 570425402;
break;
case 6:
newTok = 570425396;
break;
default:
this.errorStr2 (50, "set SPIN ", sval);
}
if (!this.chk) this.viewer.setSpin (sval, Clazz.floatToInt (this.floatParameter (this.checkLast (3))));
justShow = true;
break;
}
}if (newTok != 0) {
key = J.script.T.nameOf (tok = newTok);
} else if (!justShow && !isContextVariable) {
if (key.length == 0 || key.charAt (0) == '_' && this.tokAt (2) != 269484096) this.error (56);
var lckey = key.toLowerCase ();
if (lckey.indexOf ("label") == 0 && JU.PT.isOneOf (lckey.substring (5), ";front;group;atom;offset;offsetexact;pointer;alignment;toggle;scalereference;")) {
if (this.cmdSetLabel (lckey.substring (5))) return;
}if (isJmolSet && lckey.indexOf ("shift_") == 0) {
var f = this.floatParameter (2);
this.checkLength (3);
if (!this.chk) this.viewer.getNMRCalculation ().setChemicalShiftReference (lckey.substring (6), f);
return;
}if (lckey.endsWith ("callback")) tok = 536870912;
}if (isJmolSet && !J.script.T.tokAttr (tok, 536870912)) {
this.iToken = 1;
if (!this.$isStateScript) this.errorStr2 (50, "SET", key);
this.warning (51, "SET", key);
}if (!justShow && isJmolSet) {
switch (this.slen) {
case 2:
this.setBooleanProperty (key, true);
justShow = true;
break;
case 3:
if (ival != 2147483647) {
this.setIntProperty (key, ival);
justShow = true;
}break;
}
}if (!justShow && !isJmolSet && this.tokAt (2) == 1048587) {
if (!this.chk) this.viewer.removeUserVariable (key.toLowerCase ());
justShow = true;
}if (!justShow) {
this.setVariable (1, 0, key, true);
if (!isJmolSet) return;
}if (showing) this.viewer.showParameter (key, true, 80);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdSetEcho", 
($fz = function () {
var propertyName = null;
var propertyValue = null;
var id = null;
var echoShapeActive = true;
var pt = 2;
switch (this.getToken (2).tok) {
case 1048588:
id = propertyName = "allOff";
this.checkLength (++pt);
break;
case 1048587:
echoShapeActive = false;
case 1048579:
id = this.paramAsStr (2);
this.checkLength (++pt);
break;
case 1073741996:
case 12289:
case 1073742128:
case 1074790748:
case 1073742019:
case 1073741871:
case 1073741824:
case 4:
case 1074790550:
if (this.theTok == 1074790550) pt++;
id = this.paramAsStr (pt++);
break;
}
if (!this.chk) {
this.viewer.setEchoStateActive (echoShapeActive);
this.sm.loadShape (30);
if (id != null) this.setShapeProperty (30, propertyName == null ? "target" : propertyName, id);
}if (pt < this.slen) {
switch (this.getToken (pt++).tok) {
case 1073741832:
propertyName = "align";
switch (this.getToken (pt).tok) {
case 1073741996:
case 1073742128:
case 12289:
propertyValue = this.paramAsStr (pt++);
break;
default:
this.invArg ();
}
break;
case 12289:
case 1073741996:
case 1073742128:
propertyName = "align";
propertyValue = this.paramAsStr (pt - 1);
break;
case 554176526:
propertyName = "%zpos";
propertyValue = Integer.$valueOf (Clazz.floatToInt (this.floatParameter (pt++)));
break;
case 1610625028:
case 3145768:
case 1048589:
propertyName = "hidden";
propertyValue = Boolean.FALSE;
break;
case 12294:
case 3145770:
propertyName = "hidden";
propertyValue = Boolean.TRUE;
break;
case 1095766030:
var modelIndex = (this.chk ? 0 : this.modelNumberParameter (pt++));
if (modelIndex >= this.viewer.getModelCount ()) this.invArg ();
propertyName = "model";
propertyValue = Integer.$valueOf (modelIndex);
break;
case 269484096:
case 1073742195:
propertyName = "xypos";
propertyValue = this.xypParameter (--pt);
if (propertyValue == null) this.invArg ();
pt = this.iToken + 1;
break;
case 2:
var posx = this.intParameter (pt - 1);
var namex = "xpos";
if (this.tokAt (pt) == 269484210) {
namex = "%xpos";
pt++;
}propertyName = "ypos";
propertyValue = Integer.$valueOf (this.intParameter (pt++));
if (this.tokAt (pt) == 269484210) {
propertyName = "%ypos";
pt++;
}this.checkLength (pt);
this.setShapeProperty (30, namex, Integer.$valueOf (posx));
break;
case 1048588:
propertyName = "off";
break;
case 1073742138:
propertyName = "scale";
propertyValue = Float.$valueOf (this.floatParameter (pt++));
break;
case 135271429:
propertyName = "script";
propertyValue = this.paramAsStr (pt++);
break;
case 4:
case 1073741979:
var isImage = (this.theTok == 1073741979);
if (isImage) pt++;
this.checkLength (pt);
if (id == null && isImage) {
var data =  new Array (1);
this.getShapePropertyData (30, "currentTarget", data);
id = data[0];
}this.cmdEcho (pt - 1, id, isImage);
return;
case 135266320:
propertyName = "point";
propertyValue = (this.isCenterParameter (pt) ? this.centerParameter (pt) : null);
pt = this.iToken + 1;
break;
default:
if (this.isCenterParameter (pt - 1)) {
propertyName = "xyz";
propertyValue = this.centerParameter (pt - 1);
pt = this.iToken + 1;
break;
}this.invArg ();
}
}this.checkLength (pt);
if (!this.chk && propertyName != null) this.setShapeProperty (30, propertyName, propertyValue);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdSetLabel", 
($fz = function (str) {
this.sm.loadShape (5);
var propertyValue = null;
this.setShapeProperty (5, "setDefaults", this.viewer.getNoneSelected ());
while (true) {
if (str.equals ("scalereference")) {
var scaleAngstromsPerPixel = this.floatParameter (2);
if (scaleAngstromsPerPixel >= 5) scaleAngstromsPerPixel = this.viewer.getZoomSetting () / scaleAngstromsPerPixel / this.viewer.getScalePixelsPerAngstrom (false);
propertyValue = Float.$valueOf (scaleAngstromsPerPixel);
break;
}if (str.equals ("offset") || str.equals ("offsetexact")) {
if (this.isPoint3f (2)) {
var pt = this.getPoint3f (2, false);
propertyValue = [1, pt.x, pt.y, pt.z, 0, 0, 0];
} else if (this.isArrayParameter (2)) {
propertyValue = this.floatParameterSet (2, 7, 7);
} else {
var xOffset = this.intParameterRange (2, -127, 127);
var yOffset = this.intParameterRange (3, -127, 127);
if (xOffset == 2147483647 || yOffset == 2147483647) return true;
propertyValue = Integer.$valueOf (JV.JC.getOffset (xOffset, yOffset));
}break;
}if (str.equals ("alignment")) {
switch (this.getToken (2).tok) {
case 1073741996:
case 1073742128:
case 12289:
str = "align";
propertyValue = this.theToken.value;
break;
default:
this.invArg ();
}
break;
}if (str.equals ("pointer")) {
var flags = 0;
switch (this.getToken (2).tok) {
case 1048588:
case 1048587:
break;
case 1610616835:
flags |= 2;
case 1048589:
flags |= 1;
break;
default:
this.invArg ();
}
propertyValue = Integer.$valueOf (flags);
break;
}if (str.equals ("toggle")) {
this.iToken = 1;
var bs = (this.slen == 2 ? null : this.atomExpressionAt (2));
this.checkLast (this.iToken);
if (!this.chk) this.viewer.togglePickingLabel (bs);
return true;
}this.iToken = 1;
var TF = (this.slen == 2 || this.getToken (2).tok == 1048589);
if (str.equals ("front") || str.equals ("group")) {
if (!TF && this.tokAt (2) != 1048588) this.invArg ();
if (!TF) str = "front";
propertyValue = (TF ? Boolean.TRUE : Boolean.FALSE);
break;
}if (str.equals ("atom")) {
if (!TF && this.tokAt (2) != 1048588) this.invArg ();
str = "front";
propertyValue = (TF ? Boolean.FALSE : Boolean.TRUE);
break;
}return false;
}
var bs = (this.iToken + 1 < this.slen ? this.atomExpressionAt (++this.iToken) : null);
this.checkLast (this.iToken);
if (this.chk) return true;
if (bs == null) this.setShapeProperty (5, str, propertyValue);
 else this.setShapePropertyBs (5, str, propertyValue, bs);
return true;
}, $fz.isPrivate = true, $fz), "~S");
$_M(c$, "cmdSetPicking", 
($fz = function () {
if (this.slen == 2) {
this.setStringProperty ("picking", "identify");
return;
}if (this.slen > 4 || this.tokAt (2) == 4) {
this.setStringProperty ("picking", this.getSettingStr (2, false));
return;
}var i = 2;
var type = "SELECT";
switch (this.getToken (2).tok) {
case 135280132:
case 1746538509:
case 1611141175:
if (this.checkLength34 () == 4) {
type = this.paramAsStr (2).toUpperCase ();
if (type.equals ("SPIN")) this.setIntProperty ("pickingSpinRate", this.intParameter (3));
 else i = 3;
}break;
case 12291:
break;
default:
this.checkLength (3);
}
var str = this.paramAsStr (i);
switch (this.getToken (i).tok) {
case 1048589:
case 1073742056:
str = "identify";
break;
case 1048588:
case 1048587:
str = "off";
break;
case 135280132:
str = "atom";
break;
case 1826248716:
str = "label";
break;
case 1678770178:
str = "bond";
break;
case 12291:
this.checkLength (4);
if (this.tokAt (3) != 1678770178) this.invArg ();
str = "deleteBond";
break;
}
var mode = ((mode = str.indexOf ("_")) >= 0 ? mode : str.length);
mode = JV.ActionManager.getPickingMode (str.substring (0, mode));
if (mode < 0) this.errorStr2 (50, "SET PICKING " + type, str);
this.setStringProperty ("picking", str);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdSetPickingStyle", 
($fz = function () {
if (this.slen > 4 || this.tokAt (2) == 4) {
this.setStringProperty ("pickingStyle", this.getSettingStr (2, false));
return;
}var i = 2;
var isMeasure = false;
var type = "SELECT";
switch (this.getToken (2).tok) {
case 1746538509:
isMeasure = true;
type = "MEASURE";
case 135280132:
if (this.checkLength34 () == 4) i = 3;
break;
default:
this.checkLength (3);
}
var str = this.paramAsStr (i);
switch (this.getToken (i).tok) {
case 1048587:
case 1048588:
str = (isMeasure ? "measureoff" : "toggle");
break;
case 1048589:
if (isMeasure) str = "measure";
break;
}
if (JV.ActionManager.getPickingStyleIndex (str) < 0) this.errorStr2 (50, "SET PICKINGSTYLE " + type, str);
this.setStringProperty ("pickingStyle", str);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdSlab", 
($fz = function (isDepth) {
var TF = false;
var plane = null;
var str;
if (this.isCenterParameter (1) || this.tokAt (1) == 9) plane = this.planeParameter (1);
 else switch (this.getToken (1).tok) {
case 2:
var percent = this.intParameter (this.checkLast (1));
if (!this.chk) if (isDepth) this.viewer.depthToPercent (percent);
 else this.viewer.slabToPercent (percent);
return;
case 1048589:
this.checkLength (2);
TF = true;
case 1048588:
this.checkLength (2);
this.setBooleanProperty ("slabEnabled", TF);
return;
case 4141:
this.checkLength (2);
if (this.chk) return;
this.viewer.slabReset ();
this.setBooleanProperty ("slabEnabled", true);
return;
case 1085443:
this.checkLength (2);
if (this.chk) return;
this.viewer.setSlabDepthInternal (isDepth);
this.setBooleanProperty ("slabEnabled", true);
return;
case 269484192:
str = this.paramAsStr (2);
if (str.equalsIgnoreCase ("hkl")) plane = this.hklParameter (3);
 else if (str.equalsIgnoreCase ("plane")) plane = this.planeParameter (3);
if (plane == null) this.invArg ();
plane.scale (-1);
break;
case 135266319:
switch (this.getToken (2).tok) {
case 1048587:
break;
default:
plane = this.planeParameter (2);
}
break;
case 135267841:
plane = (this.getToken (2).tok == 1048587 ? null : this.hklParameter (2));
break;
case 1073742118:
return;
default:
this.invArg ();
}
if (!this.chk) this.viewer.slabInternal (plane, isDepth);
}, $fz.isPrivate = true, $fz), "~B");
$_M(c$, "cmdSsbond", 
($fz = function () {
var mad = this.getMadParameter ();
if (mad == 2147483647) return;
this.setShapeProperty (1, "type", Integer.$valueOf (256));
this.setShapeSizeBs (1, mad, null);
this.setShapeProperty (1, "type", Integer.$valueOf (1023));
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdStructure", 
($fz = function () {
var type = J.constant.EnumStructure.getProteinStructureType (this.paramAsStr (1));
if (type === J.constant.EnumStructure.NOT) this.invArg ();
var bs = null;
switch (this.tokAt (2)) {
case 10:
case 1048577:
bs = this.atomExpressionAt (2);
this.checkLast (this.iToken);
break;
default:
this.checkLength (2);
}
if (this.chk) return;
this.clearDefinedVariableAtomSets ();
this.viewer.setProteinType (type, bs);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdSubset", 
($fz = function () {
var bs = null;
if (!this.chk) this.viewer.setSelectionSubset (null);
if (this.slen != 1 && (this.slen != 4 || !this.getToken (2).value.equals ("off"))) bs = this.atomExpressionAt (1);
if (!this.chk) this.viewer.setSelectionSubset (bs);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdSync", 
($fz = function () {
this.checkLength (-3);
var text = "";
var applet = "";
var port = JU.PT.parseInt (this.optParameterAsString (1));
if (port == -2147483648) {
port = 0;
switch (this.slen) {
case 1:
applet = "*";
text = "ON";
break;
case 2:
applet = this.paramAsStr (1);
if (applet.indexOf ("jmolApplet") == 0 || JU.PT.isOneOf (applet, ";*;.;^;")) {
text = "ON";
if (!this.chk) this.viewer.syncScript (text, applet, 0);
applet = ".";
break;
}text = applet;
applet = "*";
break;
case 3:
applet = this.paramAsStr (1);
text = (this.tokAt (2) == 528443 ? "GET_GRAPHICS" : this.paramAsStr (2));
break;
}
} else {
text = (this.slen == 2 ? null : this.paramAsStr (2));
applet = null;
}if (this.chk) return;
this.viewer.syncScript (text, applet, port);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdThrow", 
($fz = function () {
if (this.chk) return;
var pt = (this.tokAt (1) == 14 ? 2 : 1);
var v = (pt == 1 ? this.setVariable (1, this.slen, "thrown_value", false) : this.viewer.setUserVariable ("thrown_value", J.script.SV.newS (this.optParameterAsString (2))));
var info = v.asString ();
if (info.length == 0 && (info = this.optParameterAsString (1)).length == 0) info = "context";
if (pt == 2) {
this.viewer.saveContext (info);
if (this.doReport ()) this.report (J.i18n.GT.o (J.i18n.GT._ ("to resume, enter: &{0}"), info));
throw  new J.script.ScriptInterruption (this, info, -2147483648);
}this.evalError (info, null);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdTimeout", 
($fz = function (index) {
var name = null;
var script = null;
var mSec = 0;
if (this.slen == index) {
this.showString (this.viewer.showTimeout (null));
return;
}for (var i = index; i < this.slen; i++) switch (this.getToken (i).tok) {
case 1074790550:
name = this.paramAsStr (++i);
if (this.slen == 3) {
if (!this.chk) this.viewer.triggerTimeout (name);
return;
}break;
case 1048588:
break;
case 2:
mSec = this.intParameter (i);
break;
case 3:
mSec = Math.round (this.floatParameter (i) * 1000);
break;
default:
if (name == null) name = this.paramAsStr (i);
 else if (script == null) script = this.paramAsStr (i);
 else this.invArg ();
break;
}

if (!this.chk) this.viewer.setTimeout (name, mSec, script);
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "cmdTranslate", 
($fz = function (isSelected) {
var bs = null;
var i = 1;
var i0 = 0;
if (this.tokAt (1) == 1114638363) {
isSelected = true;
i0 = 1;
i = 2;
}if (this.isPoint3f (i)) {
var pt = this.getPoint3f (i, true);
bs = (!isSelected && this.iToken + 1 < this.slen ? this.atomExpressionAt (++this.iToken) : null);
this.checkLast (this.iToken);
if (!this.chk) this.viewer.setAtomCoordsRelative (pt, bs);
return;
}var xyz = (this.paramAsStr (i).toLowerCase () + " ").charAt (0);
if ("xyz".indexOf (xyz) < 0) this.error (0);
var amount = this.floatParameter (++i);
var type;
switch (this.tokAt (++i)) {
case 0:
case 10:
case 1048577:
type = '\0';
break;
default:
type = (this.optParameterAsString (i).toLowerCase () + '\0').charAt (0);
}
if (amount == 0 && type != '\0') return;
this.iToken = i0 + (type == '\0' ? 2 : 3);
bs = (isSelected ? this.viewer.getSelectedAtoms () : this.iToken + 1 < this.slen ? this.atomExpressionAt (++this.iToken) : null);
this.checkLast (this.iToken);
if (!this.chk) this.viewer.translate (xyz, amount, type, bs);
}, $fz.isPrivate = true, $fz), "~B");
$_M(c$, "cmdUnbind", 
($fz = function () {
if (this.slen != 1) this.checkLength23 ();
var mouseAction = this.optParameterAsString (1);
var name = this.optParameterAsString (2);
if (mouseAction.length == 0 || this.tokAt (1) == 1048579) mouseAction = null;
if (name.length == 0 || this.tokAt (2) == 1048579) name = null;
if (name == null && mouseAction != null && JV.ActionManager.getActionFromName (mouseAction) >= 0) {
name = mouseAction;
mouseAction = null;
}if (!this.chk) this.viewer.unBindAction (mouseAction, name);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdUndoRedoMove", 
($fz = function () {
var n = 1;
var len = 2;
switch (this.tokAt (1)) {
case 0:
len = 1;
break;
case 1048579:
n = 0;
break;
case 2:
n = this.intParameter (1);
break;
default:
this.invArg ();
}
this.checkLength (len);
if (!this.chk) this.viewer.undoMoveAction (this.tokAt (0), n);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdUnitcell", 
($fz = function (index) {
var icell = 2147483647;
var mad = 2147483647;
var pt = null;
var tickInfo = this.tickParamAsStr (index, true, false, false);
index = this.iToken;
var id = null;
var points = null;
switch (this.tokAt (index + 1)) {
case 4:
id = this.objectNameParameter (++index);
break;
case 1048582:
index++;
id = this.objectNameParameter (++index);
break;
case 10:
case 1048577:
var iAtom = this.atomExpressionAt (1).nextSetBit (0);
if (!this.chk) this.viewer.setCurrentAtom (iAtom);
if (iAtom < 0) return;
index = this.iToken;
break;
case 12289:
++index;
switch (this.tokAt (++index)) {
case 10:
case 1048577:
pt = JU.P3.newP (this.viewer.getAtomSetCenter (this.atomExpressionAt (index)));
this.viewer.toFractional (pt, true);
index = this.iToken;
break;
default:
if (this.isCenterParameter (index)) {
pt = this.centerParameter (index);
index = this.iToken;
break;
}this.invArg ();
}
pt.x -= 0.5;
pt.y -= 0.5;
pt.z -= 0.5;
break;
default:
if (this.isArrayParameter (index + 1)) {
points = this.getPointArray (++index, 4);
index = this.iToken;
} else if (this.slen == index + 2) {
if (this.getToken (index + 1).tok == 2 && this.intParameter (index + 1) >= 111) icell = this.intParameter (++index);
} else if (this.slen > index + 1) {
pt = this.getPointOrPlane (++index, false, true, false, true, 3, 3);
index = this.iToken;
}}
mad = this.getSetAxesTypeMad (++index);
this.checkLast (this.iToken);
if (this.chk || mad == 2147483647) return;
if (mad == 2147483647) this.viewer.setCurrentAtom (-1);
if (icell != 2147483647) this.viewer.setCurrentUnitCellOffset (null, icell);
 else if (id != null) this.viewer.setCurrentCage (id);
 else if (points != null) this.viewer.setCurrentCagePts (points);
this.setObjectMad (33, "unitCell", mad);
if (pt != null) this.viewer.setCurrentUnitCellOffset (pt, 0);
if (tickInfo != null) this.setShapeProperty (33, "tickInfo", tickInfo);
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "cmdVector", 
($fz = function () {
var type = J.atomdata.RadiusData.EnumType.SCREEN;
var value = 1;
this.checkLength (-3);
switch (this.iToken = this.slen) {
case 1:
break;
case 2:
switch (this.getToken (1).tok) {
case 1048589:
break;
case 1048588:
value = 0;
break;
case 2:
var d = this.intParameterRange (1, 0, 19);
if (d == 2147483647) return;
value = d;
break;
case 3:
type = J.atomdata.RadiusData.EnumType.ABSOLUTE;
if (Float.isNaN (value = this.floatParameterRange (1, 0, 3))) return;
break;
default:
this.error (6);
}
break;
case 3:
if (this.tokAt (1) == 1073742138) {
if (!Float.isNaN (value = this.floatParameterRange (2, -100, 100))) this.setFloatProperty ("vectorScale", value);
return;
}}
this.setShapeSize (18,  new J.atomdata.RadiusData (null, value, type, null));
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdVibration", 
($fz = function () {
this.checkLength (-3);
var period = 0;
switch (this.getToken (1).tok) {
case 1048589:
this.checkLength (2);
period = this.viewer.getFloat (570425412);
break;
case 1048588:
this.checkLength (2);
period = 0;
break;
case 2:
case 3:
this.checkLength (2);
period = this.floatParameter (1);
break;
case 1073742138:
if (!Float.isNaN (period = this.floatParameterRange (2, -100, 100))) this.setFloatProperty ("vibrationScale", period);
return;
case 1073742090:
this.setFloatProperty ("vibrationPeriod", this.floatParameter (2));
return;
case 1073741824:
this.invArg ();
break;
default:
period = -1;
}
if (period < 0) this.invArg ();
if (this.chk) return;
if (period == 0) {
this.viewer.setVibrationOff ();
return;
}this.viewer.setVibrationPeriod (-period);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdWireframe", 
($fz = function () {
var mad = -2147483648;
if (this.tokAt (1) == 4141) this.checkLast (1);
 else mad = this.getMadParameter ();
if (this.chk || mad == 2147483647) return;
this.setShapeProperty (1, "type", Integer.$valueOf (1023));
this.setShapeSizeBs (1, mad == -2147483648 ? 300 : mad, null);
}, $fz.isPrivate = true, $fz));
$_M(c$, "cmdZap", 
($fz = function (isZapCommand) {
if (this.slen == 1 || !isZapCommand) {
var doAll = (isZapCommand && !this.$isStateScript);
if (doAll) this.viewer.cacheFileByName (null, false);
this.viewer.zap (true, doAll, true);
this.refresh (false);
return;
}var bs = this.atomExpressionAt (1);
if (this.chk) return;
var nDeleted = this.viewer.deleteAtoms (bs, true);
var isQuiet = !this.doReport ();
if (!isQuiet) this.report (J.i18n.GT.i (J.i18n.GT._ ("{0} atoms deleted"), nDeleted));
this.viewer.select (null, false, 0, isQuiet);
}, $fz.isPrivate = true, $fz), "~B");
$_M(c$, "cmdZoom", 
($fz = function (isZoomTo) {
if (!isZoomTo) {
var tok = (this.slen > 1 ? this.getToken (1).tok : 1048589);
switch (tok) {
case 1073741980:
case 1073742079:
break;
case 1048589:
case 1048588:
if (this.slen > 2) this.bad ();
if (!this.chk) this.setBooleanProperty ("zoomEnabled", tok == 1048589);
return;
}
}var center = null;
var i = 1;
var floatSecondsTotal = (isZoomTo ? (this.isFloatParameter (i) ? this.floatParameter (i++) : 1) : 0);
if (floatSecondsTotal < 0) {
i--;
floatSecondsTotal = 0;
}var ptCenter = 0;
var bsCenter = null;
if (this.isCenterParameter (i)) {
ptCenter = i;
center = this.centerParameter (i);
if (Clazz.instanceOf (this.expressionResult, JU.BS)) bsCenter = this.expressionResult;
i = this.iToken + 1;
} else if (this.tokAt (i) == 2 && this.getToken (i).intValue == 0) {
bsCenter = this.viewer.getAtomBitSet ("visible");
center = this.viewer.getAtomSetCenter (bsCenter);
}var isSameAtom = false;
var zoom = this.viewer.getZoomSetting ();
var newZoom = this.getZoom (ptCenter, i, bsCenter, zoom);
i = this.iToken + 1;
var xTrans = NaN;
var yTrans = NaN;
if (i != this.slen) {
xTrans = this.floatParameter (i++);
yTrans = this.floatParameter (i++);
}if (i != this.slen) this.invArg ();
if (newZoom < 0) {
newZoom = -newZoom;
if (isZoomTo) {
if (this.slen == 1 || isSameAtom) newZoom *= 2;
 else if (center == null) newZoom /= 2;
}}var max = this.viewer.getMaxZoomPercent ();
if (newZoom < 5 || newZoom > max) this.numberOutOfRange (5, max);
if (!this.viewer.isWindowCentered ()) {
if (center != null) {
var bs = this.atomExpressionAt (ptCenter);
if (!this.chk) this.viewer.setCenterBitSet (bs, false);
}center = this.viewer.getRotationCenter ();
if (Float.isNaN (xTrans)) xTrans = this.viewer.getTranslationXPercent ();
if (Float.isNaN (yTrans)) yTrans = this.viewer.getTranslationYPercent ();
}if (this.chk) return;
if (isSameAtom && Math.abs (zoom - newZoom) < 1) floatSecondsTotal = 0;
this.viewer.moveTo (this, floatSecondsTotal, center, JV.JC.center, NaN, null, newZoom, xTrans, yTrans, NaN, null, NaN, NaN, NaN, NaN, NaN, NaN);
if (this.isJS && floatSecondsTotal > 0 && this.viewer.global.waitForMoveTo) throw  new J.script.ScriptInterruption (this, "zoomTo", 1);
}, $fz.isPrivate = true, $fz), "~B");
$_M(c$, "colorShape", 
($fz = function (shapeType, index, isBackground) {
var translucency = null;
var colorvalue = null;
var colorvalue1 = null;
var bs = null;
var prefix = (index == 2 && this.tokAt (1) == 1073741860 ? "ball" : "");
var isColor = false;
var isIsosurface = (shapeType == 24 || shapeType == 25);
var typeMask = 0;
var doClearBondSet = false;
var translucentLevel = 3.4028235E38;
if (index < 0) {
bs = this.atomExpressionAt (-index);
index = this.iToken + 1;
if (this.isBondSet) {
doClearBondSet = true;
shapeType = 1;
}}var tok = this.getToken (index).tok;
if (isBackground) this.getToken (index);
 else if ((isBackground = (tok == 1610616835)) == true) this.getToken (++index);
if (isBackground) prefix = "bg";
 else if (isIsosurface) {
switch (this.theTok) {
case 1073742018:
this.getToken (++index);
prefix = "mesh";
break;
case 1073742094:
var argb = this.getArgbParamOrNone (++index, false);
colorvalue1 = (argb == 0 ? null : Integer.$valueOf (argb));
this.getToken (index = this.iToken + 1);
break;
case 10:
case 1048577:
if (Clazz.instanceOf (this.theToken.value, JM.BondSet)) {
bs = this.theToken.value;
prefix = "vertex";
} else {
bs = this.atomExpressionAt (index);
prefix = "atom";
}this.getToken (index = this.iToken + 1);
break;
}
}if (!this.chk && shapeType == 27 && !this.getCmdExt ().dispatch (27, true, this.st)) return;
var isTranslucent = (this.theTok == 603979967);
if (isTranslucent || this.theTok == 1073742074) {
if (translucentLevel == 1.4E-45) this.invArg ();
translucency = this.paramAsStr (index++);
if (isTranslucent && this.isFloatParameter (index)) translucentLevel = this.getTranslucentLevel (index++);
}tok = 0;
if (index < this.slen && this.tokAt (index) != 1048589 && this.tokAt (index) != 1048588) {
isColor = true;
tok = this.getToken (index).tok;
if ((!isIsosurface || this.tokAt (index + 1) != 1074790746) && this.isColorParam (index)) {
var argb = this.getArgbParamOrNone (index, false);
colorvalue = (argb == 0 ? null : Integer.$valueOf (argb));
if (translucency == null && this.tokAt (index = this.iToken + 1) != 0) {
this.getToken (index);
isTranslucent = (this.theTok == 603979967);
if (isTranslucent || this.theTok == 1073742074) {
translucency = this.paramAsStr (index);
if (isTranslucent && this.isFloatParameter (index + 1)) translucentLevel = this.getTranslucentLevel (++index);
} else if (this.isColorParam (index)) {
argb = this.getArgbParamOrNone (index, false);
colorvalue1 = (argb == 0 ? null : Integer.$valueOf (argb));
}}} else if (shapeType == 26) {
this.iToken--;
} else {
var name = this.paramAsStr (index).toLowerCase ();
var isByElement = (name.indexOf ("byelement") == 0);
var isColorIndex = (isByElement || name.indexOf ("byresidue") == 0);
var pal = (isColorIndex || isIsosurface ? J.constant.EnumPalette.PROPERTY : tok == 1113200651 ? J.constant.EnumPalette.CPK : J.constant.EnumPalette.getPalette (name));
if (pal === J.constant.EnumPalette.UNKNOWN || (pal === J.constant.EnumPalette.TYPE || pal === J.constant.EnumPalette.ENERGY) && shapeType != 2) this.invArg ();
var data = null;
var bsSelected = (pal !== J.constant.EnumPalette.PROPERTY && pal !== J.constant.EnumPalette.VARIABLE || !this.viewer.global.rangeSelected ? null : this.viewer.getSelectedAtoms ());
if (pal === J.constant.EnumPalette.PROPERTY) {
if (isColorIndex) {
if (!this.chk) {
data = this.getBitsetPropertyFloat (bsSelected, (isByElement ? 1095763978 : 1095761932) | 256, NaN, NaN);
}} else {
index++;
if (name.equals ("property") && J.script.T.tokAttr ((tok = this.getToken (index).tok), 1078984704) && !J.script.T.tokAttr (tok, 1087373312)) {
if (!this.chk) {
data = this.getBitsetPropertyFloat (bsSelected, this.getToken (index++).tok | 256, NaN, NaN);
}}}} else if (pal === J.constant.EnumPalette.VARIABLE) {
index++;
name = this.paramAsStr (index++);
data =  Clazz.newFloatArray (this.viewer.getAtomCount (), 0);
JW.Parser.parseStringInfestedFloatArray ("" + this.getParameter (name, 4), null, data);
pal = J.constant.EnumPalette.PROPERTY;
}if (pal === J.constant.EnumPalette.PROPERTY) {
var scheme = null;
if (this.tokAt (index) == 4) {
scheme = this.paramAsStr (index++).toLowerCase ();
if (this.isArrayParameter (index)) {
scheme += "=" + J.script.SV.sValue (J.script.SV.getVariableAS (this.stringParameterSet (index))).$replace ('\n', ' ');
index = this.iToken + 1;
}} else if (isIsosurface && this.isColorParam (index)) {
scheme = this.getColorRange (index);
index = this.iToken + 1;
}if (scheme != null && !isIsosurface) {
this.setStringProperty ("propertyColorScheme", (isTranslucent && translucentLevel == 3.4028235E38 ? "translucent " : "") + scheme);
isColorIndex = (scheme.indexOf ("byelement") == 0 || scheme.indexOf ("byresidue") == 0);
}var min = 0;
var max = 3.4028235E38;
if (!isColorIndex && (this.tokAt (index) == 1073741826 || this.tokAt (index) == 1073742114)) {
min = this.floatParameter (index + 1);
max = this.floatParameter (index + 2);
index += 3;
if (min == max && isIsosurface) {
var range = this.getShapeProperty (shapeType, "dataRange");
if (range != null) {
min = range[0];
max = range[1];
}} else if (min == max) {
max = 3.4028235E38;
}}if (!this.chk) {
if (isIsosurface) {
} else if (data == null) {
this.viewer.setCurrentColorRange (name);
} else {
this.viewer.setCurrentColorRangeData (data, bsSelected);
}if (isIsosurface) {
this.checkLength (index);
isColor = false;
var ce = this.viewer.getColorEncoder (scheme);
if (ce == null) return;
ce.isTranslucent = (isTranslucent && translucentLevel == 3.4028235E38);
ce.setRange (min, max, min > max);
if (max == 3.4028235E38) ce.hi = max;
this.setShapeProperty (shapeType, "remapColor", ce);
this.showString (this.getIsosurfaceDataRange (shapeType, ""));
if (translucentLevel == 3.4028235E38) return;
} else if (max != 3.4028235E38) {
this.viewer.setCurrentColorRange (min, max);
}}} else {
index++;
}this.checkLength (index);
colorvalue = pal;
}}if (this.chk || shapeType < 0) return;
switch (shapeType) {
case 4:
typeMask = 32768;
break;
case 2:
typeMask = 30720;
break;
case 3:
typeMask = 256;
break;
case 1:
typeMask = 1023;
break;
default:
typeMask = 0;
}
if (typeMask == 0) {
this.sm.loadShape (shapeType);
if (shapeType == 5) this.setShapeProperty (5, "setDefaults", this.viewer.getNoneSelected ());
} else {
if (bs != null) {
this.viewer.selectBonds (bs);
bs = null;
}shapeType = 1;
this.setShapeProperty (shapeType, "type", Integer.$valueOf (typeMask));
}if (isColor) {
switch (tok) {
case 1112539151:
case 1112539150:
this.viewer.autoCalculate (tok);
break;
case 1112541199:
if (this.viewer.global.rangeSelected) this.viewer.clearBfactorRange ();
break;
case 1087373318:
this.viewer.calcSelectedGroupsCount ();
break;
case 1095761937:
case 1073742029:
this.viewer.calcSelectedMonomersCount ();
break;
case 1095761936:
this.viewer.calcSelectedMoleculesCount ();
break;
}
if (colorvalue1 != null && (isIsosurface || shapeType == 11 || shapeType == 14)) this.setShapeProperty (shapeType, "colorPhase", [colorvalue1, colorvalue]);
 else if (bs == null) this.setShapeProperty (shapeType, prefix + "color", colorvalue);
 else this.setShapePropertyBs (shapeType, prefix + "color", colorvalue, bs);
}if (translucency != null) this.setShapeTranslucency (shapeType, prefix, translucency, translucentLevel, bs);
if (typeMask != 0) this.setShapeProperty (1, "type", Integer.$valueOf (1023));
if (doClearBondSet) this.viewer.selectBonds (null);
if (shapeType == 0) this.viewer.checkInheritedShapes ();
}, $fz.isPrivate = true, $fz), "~N,~N,~B");
$_M(c$, "encodeRadiusParameter", 
function (index, isOnly, allowAbsolute) {
var value = NaN;
var factorType = J.atomdata.RadiusData.EnumType.ABSOLUTE;
var vdwType = null;
var tok = (index == -1 ? 1649412120 : this.getToken (index).tok);
switch (tok) {
case 1112539137:
case 1112539138:
case 1112541195:
case 1114638362:
case 1112541199:
case 1649412120:
value = 1;
factorType = J.atomdata.RadiusData.EnumType.FACTOR;
vdwType = (tok == 1649412120 ? null : J.constant.EnumVdw.getVdwType2 (J.script.T.nameOf (tok)));
tok = this.tokAt (++index);
break;
}
switch (tok) {
case 4141:
return this.viewer.getDefaultRadiusData ();
case 1073741852:
case 1073742116:
case 1073741856:
case 1073741858:
case 1073741991:
value = 1;
factorType = J.atomdata.RadiusData.EnumType.FACTOR;
this.iToken = index - 1;
break;
case 269484193:
case 2:
case 3:
if (tok == 269484193) {
index++;
} else if (this.tokAt (index + 1) == 269484210) {
value = Math.round (this.floatParameter (index));
this.iToken = ++index;
factorType = J.atomdata.RadiusData.EnumType.FACTOR;
if (value < 0 || value > 200) {
this.integerOutOfRange (0, 200);
return null;
}value /= 100;
break;
} else if (tok == 2) {
value = this.intParameter (index);
if (value > 749 || value < -200) {
this.integerOutOfRange (-200, 749);
return null;
}if (value > 0) {
value /= 250;
factorType = J.atomdata.RadiusData.EnumType.ABSOLUTE;
} else {
value /= -100;
factorType = J.atomdata.RadiusData.EnumType.FACTOR;
}break;
}var max;
if (tok == 269484193 || !allowAbsolute) {
factorType = J.atomdata.RadiusData.EnumType.OFFSET;
max = 16;
} else {
factorType = J.atomdata.RadiusData.EnumType.ABSOLUTE;
vdwType = J.constant.EnumVdw.NADA;
max = 100;
}value = this.floatParameterRange (index, (isOnly || !allowAbsolute ? -max : 0), max);
if (Float.isNaN (value)) return null;
if (isOnly) value = -value;
if (value > 16) value = 16.1;
break;
default:
if (value == 1) index--;
}
if (vdwType == null) {
vdwType = J.constant.EnumVdw.getVdwType (this.optParameterAsString (++this.iToken));
if (vdwType == null) {
this.iToken = index;
vdwType = J.constant.EnumVdw.AUTO;
}}return  new J.atomdata.RadiusData (null, value, factorType, vdwType);
}, "~N,~B,~B");
c$.expandFloatArray = $_M(c$, "expandFloatArray", 
($fz = function (a) {
var n = a.length;
try {
for (var i = 0; i < a.length; i++) if (a[i] < 0) n += Math.abs (a[i - 1] + a[i]) - 1;

if (n == a.length) return a;
var b =  Clazz.newFloatArray (n, 0);
for (var pt = 0, i = 0; i < a.length; i++) {
n = Clazz.floatToInt (a[i]);
if (n >= 0) {
b[pt++] = n;
} else {
var dif = Clazz.floatToInt (a[i - 1] + n);
var dir = (dif < 0 ? 1 : -1);
for (var j = Clazz.floatToInt (a[i - 1]); j != -a[i]; j += dir, pt++) b[pt] = b[pt - 1] + dir;

}}
return b;
} catch (e) {
if (Clazz.exceptionOf (e, Exception)) {
return null;
} else {
throw e;
}
}
}, $fz.isPrivate = true, $fz), "~A");
$_M(c$, "frameControl", 
($fz = function (i) {
switch (this.getToken (this.checkLast (i)).tok) {
case 1073742098:
case 1073742096:
case 4143:
case 20487:
case 1073742037:
case 1073742108:
case 1073742126:
case 1073741942:
case 1073741993:
if (!this.chk) this.viewer.setAnimation (this.theTok);
return;
}
this.invArg ();
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "getColorRange", 
function (i) {
var color1 = this.getArgbParam (i);
if (this.tokAt (++this.iToken) != 1074790746) this.invArg ();
var color2 = this.getArgbParam (++this.iToken);
var nColors = (this.tokAt (this.iToken + 1) == 2 ? this.intParameter (++this.iToken) : 0);
return JW.ColorEncoder.getColorSchemeList (JW.ColorEncoder.getPaletteAtoB (color1, color2, nColors));
}, "~N");
$_M(c$, "getForVar", 
($fz = function (key) {
var t = this.getContextVariableAsVariable (key);
if (t == null) {
if (key.startsWith ("_")) this.invArg ();
if (key.indexOf ("/") >= 0) this.contextVariables.put (key, t = J.script.SV.newI (0));
 else t = this.viewer.getOrSetNewVariable (key, true);
}return t;
}, $fz.isPrivate = true, $fz), "~S");
$_M(c$, "getFullPathName", 
function () {
var filename = (!this.chk || this.isCmdLine_C_Option ? this.viewer.getFullPathName (true) : "test.xyz");
if (filename == null) this.invArg ();
return filename;
});
$_M(c$, "getIsosurfaceDataRange", 
function (iShape, sep) {
var dataRange = this.getShapeProperty (iShape, "dataRange");
return (dataRange != null && dataRange[0] != 3.4028235E38 && dataRange[0] != dataRange[1] ? sep + "isosurface" + " full data range " + dataRange[0] + " to " + dataRange[1] + " with color scheme spanning " + dataRange[2] + " to " + dataRange[3] : "");
}, "~N,~S");
$_M(c$, "getObjectBoundingBox", 
($fz = function (id) {
var data = [id, null, null];
return (this.getShapePropertyData (24, "getBoundingBox", data) || this.getShapePropertyData (28, "getBoundingBox", data) || this.getShapePropertyData (25, "getBoundingBox", data) || this.getShapePropertyData (27, "getBoundingBox", data) ? data[2] : null);
}, $fz.isPrivate = true, $fz), "~S");
$_V(c$, "getObjectCenter", 
function (axisID, index, modelIndex) {
var data = [axisID, Integer.$valueOf (index), Integer.$valueOf (modelIndex)];
return (this.getShapePropertyData (22, "getCenter", data) || this.getShapePropertyData (24, "getCenter", data) || this.getShapePropertyData (28, "getCenter", data) || this.getShapePropertyData (25, "getCenter", data) || this.getShapePropertyData (27, "getCenter", data) ? data[2] : null);
}, "~S,~N,~N");
$_V(c$, "getPlaneForObject", 
function (id, vAB, vAC) {
var shapeType = this.sm.getShapeIdFromObjectName (id);
switch (shapeType) {
case 22:
this.setShapeProperty (22, "thisID", id);
var points = this.getShapeProperty (22, "vertices");
if (points == null || points.length < 3 || points[0] == null || points[1] == null || points[2] == null) break;
var plane =  new JU.P4 ();
JW.Measure.getPlaneThroughPoints (points[0], points[1], points[2],  new JU.V3 (), vAB, vAC, plane);
return plane;
case 24:
this.setShapeProperty (24, "thisID", id);
return this.getShapeProperty (24, "plane");
}
return null;
}, "~S,JU.V3,JU.V3");
$_M(c$, "getQuaternionArray", 
function (quaternionOrSVData, itype) {
var data;
switch (itype) {
case 135270418:
data = quaternionOrSVData;
break;
case 9:
var pts = quaternionOrSVData;
data =  new Array (pts.length);
for (var i = 0; i < pts.length; i++) data[i] = JU.Quat.newP4 (pts[i]);

break;
case 1073742001:
var sv = quaternionOrSVData;
data =  new Array (sv.size ());
for (var i = 0; i < sv.size (); i++) {
var pt = J.script.SV.pt4Value (sv.get (i));
if (pt == null) return null;
data[i] = JU.Quat.newP4 (pt);
}
break;
default:
return null;
}
return data;
}, "~O,~N");
$_M(c$, "getSetAxesTypeMad", 
($fz = function (index) {
if (index == this.slen) return 1;
switch (this.getToken (this.checkLast (index)).tok) {
case 1048589:
return 1;
case 1048588:
return 0;
case 1073741926:
return -1;
case 2:
return this.intParameterRange (index, -1, 19);
case 3:
var angstroms = this.floatParameterRange (index, 0, 2);
return (Float.isNaN (angstroms) ? 2147483647 : Clazz.doubleToInt (Math.floor (angstroms * 1000 * 2)));
}
this.errorStr (7, "\"DOTTED\"");
return 0;
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "getSettingFloat", 
($fz = function (pt) {
return (pt >= this.slen ? NaN : J.script.SV.fValue (this.parameterExpressionToken (pt)));
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "getSettingInt", 
($fz = function (pt) {
return (pt >= this.slen ? -2147483648 : this.parameterExpressionToken (pt).asInt ());
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "getSettingStr", 
($fz = function (pt, isJmolSet) {
return (isJmolSet && this.slen == pt + 1 ? this.paramAsStr (pt) : this.parameterExpressionToken (pt).asString ());
}, $fz.isPrivate = true, $fz), "~N,~B");
$_M(c$, "getShapeProperty", 
function (shapeType, propertyName) {
return this.sm.getShapePropertyIndex (shapeType, propertyName, -2147483648);
}, "~N,~S");
$_M(c$, "getShapePropertyData", 
function (shapeType, propertyName, data) {
return this.sm.getShapePropertyData (shapeType, propertyName, data);
}, "~N,~S,~A");
$_M(c$, "getShapeType", 
($fz = function (tok) {
var iShape = JV.JC.shapeTokenIndex (tok);
if (iShape < 0) this.error (49);
return iShape;
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "getTranslucentLevel", 
function (i) {
var f = this.floatParameter (i);
return (this.theTok == 2 && f > 0 && f < 9 ? f + 1 : f);
}, "~N");
$_M(c$, "getZoom", 
($fz = function (ptCenter, i, bs, currentZoom) {
var zoom = (this.isFloatParameter (i) ? this.floatParameter (i++) : NaN);
if (zoom == 0 || currentZoom == 0) {
var r = NaN;
if (bs == null) {
if (this.tokAt (ptCenter) == 1048582) {
var bbox = this.getObjectBoundingBox (this.objectNameParameter (ptCenter + 1));
if (bbox == null || (r = bbox[0].distance (bbox[1]) / 2) == 0) this.invArg ();
}} else {
r = this.viewer.calcRotationRadiusBs (bs);
}if (Float.isNaN (r)) this.invArg ();
currentZoom = this.viewer.getFloat (570425388) / r * 100;
zoom = NaN;
}if (zoom < 0) {
zoom += currentZoom;
} else if (Float.isNaN (zoom)) {
var tok = this.tokAt (i);
switch (tok) {
case 1073742079:
case 1073741980:
zoom = currentZoom * (tok == 1073742079 ? 0.5 : 2);
i++;
break;
case 269484208:
case 269484209:
case 269484193:
var value = this.floatParameter (++i);
i++;
switch (tok) {
case 269484208:
zoom = currentZoom / value;
break;
case 269484209:
zoom = currentZoom * value;
break;
case 269484193:
zoom = currentZoom + value;
break;
}
break;
default:
zoom = (bs == null ? -currentZoom : currentZoom);
}
}this.iToken = i - 1;
return zoom;
}, $fz.isPrivate = true, $fz), "~N,~N,JU.BS,~N");
$_M(c$, "setElementColor", 
($fz = function (str, argb) {
for (var i = JW.Elements.elementNumberMax; --i >= 0; ) {
if (str.equalsIgnoreCase (JW.Elements.elementNameFromNumber (i))) {
if (!this.chk) this.viewer.setElementArgb (i, argb);
return true;
}}
for (var i = JW.Elements.altElementMax; --i >= 0; ) {
if (str.equalsIgnoreCase (JW.Elements.altElementNameFromIndex (i))) {
if (!this.chk) this.viewer.setElementArgb (JW.Elements.altElementNumberFromIndex (i), argb);
return true;
}}
if (str.charAt (0) != '_') return false;
for (var i = JW.Elements.elementNumberMax; --i >= 0; ) {
if (str.equalsIgnoreCase ("_" + JW.Elements.elementSymbolFromNumber (i))) {
if (!this.chk) this.viewer.setElementArgb (i, argb);
return true;
}}
for (var i = JW.Elements.altElementMax; --i >= 4; ) {
if (str.equalsIgnoreCase ("_" + JW.Elements.altElementSymbolFromIndex (i))) {
if (!this.chk) this.viewer.setElementArgb (JW.Elements.altElementNumberFromIndex (i), argb);
return true;
}if (str.equalsIgnoreCase ("_" + JW.Elements.altIsotopeSymbolFromIndex (i))) {
if (!this.chk) this.viewer.setElementArgb (JW.Elements.altElementNumberFromIndex (i), argb);
return true;
}}
return false;
}, $fz.isPrivate = true, $fz), "~S,~N");
$_M(c$, "setMeshDisplayProperty", 
function (shape, i, tok) {
var propertyName = null;
var propertyValue = null;
var allowCOLOR = (shape == 25);
var checkOnly = (i == 0);
if (!checkOnly) tok = this.getToken (i).tok;
switch (tok) {
case 1766856708:
if (allowCOLOR) this.iToken++;
 else break;
case 1073742074:
case 603979967:
if (!checkOnly) this.colorShape (shape, this.iToken, false);
return true;
case 0:
case 12291:
case 1048589:
case 1048588:
case 12294:
case 3145770:
case 1610625028:
case 3145768:
if (this.iToken == 1 && shape >= 0 && this.tokAt (2) == 0) this.setShapeProperty (shape, "thisID", null);
if (tok == 0) return (this.iToken == 1);
if (checkOnly) return true;
switch (tok) {
case 12291:
this.setShapeProperty (shape, "delete", null);
return true;
case 3145770:
case 12294:
tok = 1048588;
break;
case 3145768:
tok = 1048589;
break;
case 1610625028:
if (i + 1 == this.slen) tok = 1048589;
break;
}
case 1073741958:
case 1073741862:
case 1073741964:
case 1073741898:
case 1073742039:
case 1113198595:
case 1073742042:
case 1073742018:
case 1073742052:
case 1073741938:
case 1073742046:
case 1073742182:
case 1073742060:
case 1073741960:
case 1073742058:
propertyName = "token";
propertyValue = Integer.$valueOf (tok);
break;
}
if (propertyName == null) return false;
if (checkOnly) return true;
this.setShapeProperty (shape, propertyName, propertyValue);
if ((this.tokAt (this.iToken + 1)) != 0) {
if (!this.setMeshDisplayProperty (shape, ++this.iToken, 0)) --this.iToken;
}return true;
}, "~N,~N,~N");
$_M(c$, "setObjectArgb", 
($fz = function (str, argb) {
if (this.chk) return;
this.viewer.setObjectArgb (str, argb);
}, $fz.isPrivate = true, $fz), "~S,~N");
$_M(c$, "setObjectMad", 
function (iShape, name, mad) {
if (this.chk) return;
this.viewer.setObjectMad (iShape, name, mad);
}, "~N,~S,~N");
$_M(c$, "setObjectProp", 
($fz = function (id, tokCommand, ptColor) {
var data = [id, null];
var s = "";
var isWild = JW.Txt.isWild (id);
for (var iShape = 17; ; ) {
if (iShape != 27 && this.getShapePropertyData (iShape, "checkID", data)) {
this.setShapeProperty (iShape, "thisID", id);
switch (tokCommand) {
case 12291:
this.setShapeProperty (iShape, "delete", null);
break;
case 12294:
case 1610625028:
this.setShapeProperty (iShape, "hidden", tokCommand == 1610625028 ? Boolean.FALSE : Boolean.TRUE);
break;
case 4148:
s += this.getShapeProperty (iShape, "command") + "\n";
break;
case 1766856708:
if (ptColor >= 0) this.colorShape (iShape, ptColor + 1, false);
break;
}
if (!isWild) break;
}if (iShape == 17) iShape = 31;
if (--iShape < 22) break;
}
return s;
}, $fz.isPrivate = true, $fz), "~S,~N,~N");
$_M(c$, "setObjectProperty", 
function () {
var id = this.setShapeNameParameter (2);
return (this.chk ? "" : this.setObjectProp (id, this.tokAt (0), this.iToken));
});
$_M(c$, "setShapeNameParameter", 
function (i) {
var id = this.paramAsStr (i);
var isWild = id.equals ("*");
if (id.length == 0) this.invArg ();
if (isWild) {
switch (this.tokAt (i + 1)) {
case 0:
case 1048589:
case 1048588:
case 3145768:
case 3145770:
case 1766856708:
case 12291:
break;
default:
if (this.setMeshDisplayProperty (-1, 0, this.tokAt (i + 1))) break;
id += this.optParameterAsString (++i);
}
}if (this.tokAt (i + 1) == 269484209) id += this.paramAsStr (++i);
this.iToken = i;
return id;
}, "~N");
$_M(c$, "setShapeProperty", 
function (shapeType, propertyName, propertyValue) {
if (!this.chk) this.sm.setShapePropertyBs (shapeType, propertyName, propertyValue, null);
}, "~N,~S,~O");
$_M(c$, "setShapePropertyBs", 
function (iShape, propertyName, propertyValue, bs) {
if (!this.chk) this.sm.setShapePropertyBs (iShape, propertyName, propertyValue, bs);
}, "~N,~S,~O,JU.BS");
$_M(c$, "setShapeSize", 
($fz = function (shapeType, rd) {
if (this.chk) return;
this.sm.setShapeSizeBs (shapeType, 0, rd, null);
}, $fz.isPrivate = true, $fz), "~N,J.atomdata.RadiusData");
$_M(c$, "setShapeSizeBs", 
function (shapeType, size, bs) {
if (this.chk) return;
this.sm.setShapeSizeBs (shapeType, size, null, bs);
}, "~N,~N,JU.BS");
$_M(c$, "setShapeTranslucency", 
function (shapeType, prefix, translucency, translucentLevel, bs) {
if (translucentLevel == 3.4028235E38) translucentLevel = this.viewer.getFloat (570425354);
this.setShapeProperty (shapeType, "translucentLevel", Float.$valueOf (translucentLevel));
if (prefix == null) return;
if (bs == null) this.setShapeProperty (shapeType, prefix + "translucency", translucency);
 else if (!this.chk) this.setShapePropertyBs (shapeType, prefix + "translucency", translucency, bs);
}, "~N,~S,~S,~N,JU.BS");
$_M(c$, "setSize", 
($fz = function (shape, scale) {
var rd = null;
var tok = this.tokAt (1);
var isOnly = false;
switch (tok) {
case 1073742072:
this.restrictSelected (false, false);
break;
case 1048589:
break;
case 1048588:
scale = 0;
break;
case 3:
isOnly = (this.floatParameter (1) < 0);
case 2:
default:
rd = this.encodeRadiusParameter (1, isOnly, true);
if (rd == null) return;
if (Float.isNaN (rd.value)) this.invArg ();
}
if (rd == null) rd =  new J.atomdata.RadiusData (null, scale, J.atomdata.RadiusData.EnumType.FACTOR, J.constant.EnumVdw.AUTO);
if (isOnly) this.restrictSelected (false, false);
this.setShapeSize (shape, rd);
}, $fz.isPrivate = true, $fz), "~N,~N");
$_M(c$, "setSizeBio", 
($fz = function (iShape) {
var mad = 0;
switch (this.getToken (1).tok) {
case 1073742072:
if (this.chk) return;
this.restrictSelected (false, false);
mad = -1;
break;
case 1048589:
mad = -1;
break;
case 1048588:
break;
case 1641025539:
mad = -2;
break;
case 1112541199:
case 1073741922:
mad = -4;
break;
case 2:
if ((mad = (this.intParameterRange (1, 0, 1000) * 8)) == 2147483647) return;
break;
case 3:
mad = Math.round (this.floatParameterRange (1, -4.0, 4.0) * 2000);
if (mad == 2147483647) return;
if (mad < 0) {
this.restrictSelected (false, false);
mad = -mad;
}break;
case 10:
if (!this.chk) this.sm.loadShape (iShape);
this.setShapeProperty (iShape, "bitset", this.theToken.value);
return;
default:
this.error (6);
}
this.setShapeSizeBs (iShape, mad, null);
}, $fz.isPrivate = true, $fz), "~N");
$_M(c$, "setUnits", 
($fz = function (units, tok) {
if (tok == 545259568 && (units.endsWith ("hz") || JU.PT.isOneOf (units.toLowerCase (), ";angstroms;au;bohr;nanometers;nm;picometers;pm;vanderwaals;vdw;"))) {
if (!this.chk) this.viewer.setUnits (units, true);
} else if (tok == 545259558 && JU.PT.isOneOf (units.toLowerCase (), ";kcal;kj;")) {
if (!this.chk) this.viewer.setUnits (units, false);
} else {
this.errorStr2 (50, "set " + J.script.T.nameOf (tok), units);
}return true;
}, $fz.isPrivate = true, $fz), "~S,~N");
$_M(c$, "toString", 
function () {
var str =  new JU.SB ();
str.append ("Eval\n pc:");
str.appendI (this.pc);
str.append ("\n");
str.appendI (this.aatoken.length);
str.append (" statements\n");
for (var i = 0; i < this.aatoken.length; ++i) {
str.append ("----\n");
var atoken = this.aatoken[i];
for (var j = 0; j < atoken.length; ++j) {
str.appendO (atoken[j]);
str.appendC ('\n');
}
str.appendC ('\n');
}
str.append ("END\n");
return str.toString ();
});
$_V(c$, "setAtomProp", 
function (prop, value, bs) {
this.setShapePropertyBs (0, prop, value, bs);
}, "~S,~O,JU.BS");
Clazz.defineStatics (c$,
"scriptLevelMax", 100,
"saveList", "bonds? context? coordinates? orientation? rotation? selection? state? structure?",
"iProcess", 0,
"tryPt", 0,
"EXPRESSION_KEY", "e_x_p_r_e_s_s_i_o_n");
});
