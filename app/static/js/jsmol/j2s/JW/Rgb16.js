Clazz.declarePackage ("JW");
Clazz.load (null, "JW.Rgb16", ["JU.SB"], function () {
c$ = Clazz.decorateAsClass (function () {
this.r = 0;
this.g = 0;
this.b = 0;
Clazz.instantialize (this, arguments);
}, JW, "Rgb16");
Clazz.makeConstructor (c$, 
function () {
});
c$.newI = $_M(c$, "newI", 
function (argb) {
var c =  new JW.Rgb16 ();
c.setInt (argb);
return c;
}, "~N");
$_M(c$, "setInt", 
function (a) {
this.r = ((a >> 8) & 0xFF00) | 0x80;
this.g = ((a) & 0xFF00) | 0x80;
this.b = ((a << 8) & 0xFF00) | 0x80;
}, "~N");
$_M(c$, "setRgb", 
function (a) {
this.r = a.r;
this.g = a.g;
this.b = a.b;
}, "JW.Rgb16");
$_M(c$, "diffDiv", 
function (a, b, divisor) {
this.r = Clazz.doubleToInt ((a.r - b.r) / divisor);
this.g = Clazz.doubleToInt ((a.g - b.g) / divisor);
this.b = Clazz.doubleToInt ((a.b - b.b) / divisor);
}, "JW.Rgb16,JW.Rgb16,~N");
$_M(c$, "setAndIncrement", 
function (base, inc) {
this.r = base.r;
base.r += inc.r;
this.g = base.g;
base.g += inc.g;
this.b = base.b;
base.b += inc.b;
}, "JW.Rgb16,JW.Rgb16");
$_M(c$, "getArgb", 
function () {
return (0xFF000000 | ((this.r << 8) & 0x00FF0000) | (this.g & 0x0000FF00) | (this.b >> 8));
});
$_V(c$, "toString", 
function () {
return  new JU.SB ().append ("Rgb16(").appendI (this.r).appendC (',').appendI (this.g).appendC (',').appendI (this.b).append (" -> ").appendI ((this.r >> 8) & 0xFF).appendC (',').appendI ((this.g >> 8) & 0xFF).appendC (',').appendI ((this.b >> 8) & 0xFF).appendC (')').toString ();
});
});
