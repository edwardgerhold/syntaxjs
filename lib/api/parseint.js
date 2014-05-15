/**
 * Created by root on 15.05.14.
 */

var ParseIntFunction_call = function (thisArg, argList) {
    try {
        return parseInt("" + argList[0], +argList[1]);
    } catch (ex) {
        return newTypeError(ex.message);
    }
};

var ParseFloatFunction_call = function (thisArg, argList) {
    try {
        return parseFloat("" + argList[0]);
    } catch(ex) {
        return newTypeError(ex.message);
    }
};