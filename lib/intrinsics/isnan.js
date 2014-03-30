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
    if (number == Infinity || number == -Infinity || number != number) return false;
    return true
}, 1, "isFinite");
