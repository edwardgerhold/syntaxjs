
var ParseIntFunction_call = function (thisArg, argList) {
    return parseInt(""+argList[0], +argList[1]);
};

var ParseFloatFunction_call = function (thisArg, argList) {
    return parseFloat(""+argList[0]);
};
setInternalSlot(ParseIntFunction, "Call", ParseIntFunction_call);

setInternalSlot(ParseFloatFunction, "Call", ParseFloatFunction_call);

