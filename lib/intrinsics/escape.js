
// ===========================================================================================================
// escape, unescape
// ===========================================================================================================

setInternalSlot(EscapeFunction, "Call", function (thisArg, argList) {
    return escape(argList[0]);
});

setInternalSlot(UnescapeFunction, "Call", function (thisArg, argList) {
    return unescape(argList[0]);
});

