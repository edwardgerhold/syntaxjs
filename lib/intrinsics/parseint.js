
var ParseIntFunction_call = function (thisArg, argList) {
    return parseInt(""+argList[0], +argList[1]);
};

var ParseFloatFunction_call = function (thisArg, argList) {
    return parseFloat(""+argList[0]);
};
setInternalSlot(ParseIntFunction, SLOTS.CALL, ParseIntFunction_call);

setInternalSlot(ParseFloatFunction, SLOTS.CALL, ParseFloatFunction_call);

