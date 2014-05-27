Clazz.declarePackage ("JW");
Clazz.load (["J.api.JmolPatternMatcher"], "JW.PatternMatcher", ["java.util.regex.Pattern"], function () {
c$ = Clazz.declareType (JW, "PatternMatcher", null, J.api.JmolPatternMatcher);
$_V(c$, "compile", 
function (sFind, isCaseInsensitive) {
return java.util.regex.Pattern.compile (sFind, isCaseInsensitive ? 2 : 0);
}, "~S,~B");
});
