var EscapeFunction_call = function (thisArg, argList) {
    return escape(argList[0]);
};
var UnescapeFunction_call = function (thisArg, argList) {
    return unescape(argList[0]);
};