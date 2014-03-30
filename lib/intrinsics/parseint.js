
// ===========================================================================================================
// parseInt, parseFloat
// ===========================================================================================================

setInternalSlot(ParseIntFunction, "Call", function (thisArg, argList) {
    return parseInt(argList[0], argList[1]);
});

setInternalSlot(ParseFloatFunction, "Call", function (thisArg, argList) {
    return parseFloat(argList[0], argList[1]);
});
