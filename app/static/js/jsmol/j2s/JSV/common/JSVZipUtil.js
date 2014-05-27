Clazz.declarePackage ("JSV.common");
Clazz.load (["JSV.api.JSVZipInterface"], "JSV.common.JSVZipUtil", ["java.util.zip.GZIPInputStream", "JSV.common.JSVZipFileSequentialReader"], function () {
c$ = Clazz.declareType (JSV.common, "JSVZipUtil", null, JSV.api.JSVZipInterface);
Clazz.makeConstructor (c$, 
function () {
});
$_V(c$, "newGZIPInputStream", 
function (bis) {
return  new java.util.zip.GZIPInputStream (bis, 512);
}, "java.io.InputStream");
$_V(c$, "newJSVZipFileSequentialReader", 
function ($in, subFileList, startCode) {
return  new JSV.common.JSVZipFileSequentialReader ().set ($in, subFileList, startCode);
}, "java.io.InputStream,~A,~S");
});
