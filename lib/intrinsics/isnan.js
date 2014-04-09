// ===========================================================================================================
// IsNaN
// ===========================================================================================================

IsNaNFunction = CreateBuiltinFunction(realm, function isNaN(thisArg, argList) {
    var nan = ToNumber(argList[0]);
    return nan !== nan;
}, 1, "isNaN");

// ===========================================================================================================
// IsFinite
// ===========================================================================================================

IsFiniteFunction = CreateBuiltinFunction(realm, function isFinite(thisArg, argList) {
    var number = ToNumber(argList[0]);
    return  !(number == Infinity || number == -Infinity || number != number);
}, 1, "isFinite");
