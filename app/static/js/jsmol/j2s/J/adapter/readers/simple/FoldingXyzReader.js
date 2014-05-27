Clazz.declarePackage ("J.adapter.readers.simple");
Clazz.load (["J.adapter.smarter.AtomSetCollectionReader"], "J.adapter.readers.simple.FoldingXyzReader", ["java.util.Hashtable", "JU.AU", "$.PT", "J.adapter.smarter.Atom"], function () {
c$ = Clazz.decorateAsClass (function () {
this.haveBonds = false;
Clazz.instantialize (this, arguments);
}, J.adapter.readers.simple, "FoldingXyzReader", J.adapter.smarter.AtomSetCollectionReader);
$_V(c$, "initializeReader", 
function () {
});
$_V(c$, "finalizeReader", 
function () {
if (this.haveBonds) this.atomSetCollection.setNoAutoBond ();
this.isTrajectory = false;
this.finalizeReaderASCR ();
});
$_V(c$, "checkLine", 
function () {
var next = [0];
var token = JU.PT.parseTokenNext (this.line, next);
if (token == null) return true;
var addAtoms = this.doGetModel (++this.modelNumber, null);
var modelAtomCount = this.parseIntStr (token);
if (addAtoms) {
this.atomSetCollection.newAtomSet ();
var tokens = this.getTokens ();
this.atomSetCollection.setAtomSetName (tokens.length == 2 ? "Protein " + tokens[1] : this.line.substring (next[0]).trim ());
}var readLine = this.readAtoms (modelAtomCount + 1, addAtoms);
this.continuing = !addAtoms || !this.isLastModel (this.modelNumber);
return readLine;
});
$_M(c$, "readAtoms", 
function (atomCount, addAtoms) {
var htBondCounts =  new java.util.Hashtable ();
var bonds = JU.AU.newInt2 (atomCount);
var haveAtomTypes = true;
var checking = true;
var lastAtom = null;
var readNextLine = true;
for (var i = 0; i < atomCount; i++) {
this.discardLinesUntilNonBlank ();
if (this.line == null) break;
var tokens = J.adapter.smarter.AtomSetCollectionReader.getTokensStr (this.line);
var sIndex = tokens[0];
if (sIndex.equals (lastAtom)) {
readNextLine = false;
break;
}lastAtom = sIndex;
if (!addAtoms) continue;
var atom =  new J.adapter.smarter.Atom ();
atom.atomName = tokens[1];
atom.elementSymbol = this.getElement (tokens[1]);
atom.atomSerial = this.parseIntStr (sIndex);
if (!this.filterAtom (atom, i)) continue;
this.setAtomCoordTokens (atom, tokens, 2);
this.atomSetCollection.addAtomWithMappedSerialNumber (atom);
var n = tokens.length - 5;
bonds[i] =  Clazz.newIntArray (n + 1, 0);
bonds[i][n] = atom.atomSerial;
for (var j = 0; j < n; j++) {
var t = tokens[j + 5];
var i2 = this.parseIntStr (t);
bonds[i][j] = i2;
if (checking) {
if (n == 0 || t.equals (sIndex) || i2 <= 0 || i2 > atomCount) {
haveAtomTypes = (n > 0);
checking = false;
} else {
var count = htBondCounts.get (t);
if (count == null) htBondCounts.put (t, count =  Clazz.newIntArray (1, 0));
if (++count[0] > 10) haveAtomTypes = !(checking = false);
}}}
}
if (addAtoms) {
this.makeBonds (bonds, !checking && haveAtomTypes);
this.applySymmetryAndSetTrajectory ();
}return readNextLine;
}, "~N,~B");
$_M(c$, "makeBonds", 
($fz = function (bonds, haveAtomTypes) {
var atoms = this.atomSetCollection.atoms;
for (var i = bonds.length; --i >= 0; ) {
var b = bonds[i];
if (b == null) continue;
var a1 = atoms[this.atomSetCollection.getAtomIndexFromSerial (b[b.length - 1])];
var b0 = 0;
if (haveAtomTypes) a1.atomName += "\0" + (b[b0++]);
for (var j = b.length - 1; --j >= b0; ) if (b[j] > i && this.atomSetCollection.addNewBondWithOrder (a1.index, this.atomSetCollection.getAtomIndexFromSerial (b[j]), 1) != null) this.haveBonds = true;

}
}, $fz.isPrivate = true, $fz), "~A,~B");
$_M(c$, "getElement", 
($fz = function (name) {
var n = name.length;
switch (n) {
case 1:
break;
default:
var c1 = name.charAt (0);
var c2 = name.charAt (1);
n = (J.adapter.smarter.Atom.isValidElementSymbol2 (c1, c2) || c1 == 'C' && c2 == 'L' ? 2 : 1);
}
return name.substring (0, n);
}, $fz.isPrivate = true, $fz), "~S");
});
