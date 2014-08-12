var IsNaNFunction_call = function (thisArg, argList) {
    var nan = ToNumber(argList[0]);
    return nan !== nan;
};
var IsFiniteFunction_call = function (thisArg, argList) {
    var number = ToNumber(argList[0]);
    return  !(number == Infinity || number == -Infinity || number != number);
};