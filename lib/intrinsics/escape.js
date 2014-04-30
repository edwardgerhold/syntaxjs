
// ===========================================================================================================
// escape, unescape
// ===========================================================================================================

setInternalSlot(EscapeFunction, SLOTS.CALL, function (thisArg, argList) {
    return escape(argList[0]);
});

setInternalSlot(UnescapeFunction, SLOTS.CALL, function (thisArg, argList) {
    return unescape(argList[0]);
});

