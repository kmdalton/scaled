Clazz.declarePackage ("JMB");
Clazz.load (["JMB.ProteinStructure"], "JMB.Turn", ["J.constant.EnumStructure"], function () {
c$ = Clazz.declareType (JMB, "Turn", JMB.ProteinStructure);
Clazz.makeConstructor (c$, 
function (apolymer, monomerIndex, monomerCount) {
Clazz.superConstructor (this, JMB.Turn, []);
this.setupPS (apolymer, J.constant.EnumStructure.TURN, monomerIndex, monomerCount);
this.subtype = J.constant.EnumStructure.TURN;
}, "JMB.AlphaPolymer,~N,~N");
});
