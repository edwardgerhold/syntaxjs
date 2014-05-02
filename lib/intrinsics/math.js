
//===========================================================================================================
// Math
//============================================================================================================

var PI = Math.PI;
var LOG2E = Math.LOG2E;
var SQRT1_2 = Math.SQRT1_2;
var SQRT2 = Math.SQRT2;
var LN10 = Math.LN10;
var LN2 = Math.LN2;
var LOG10E = Math.LOG10E;
var E = Math.E;

var MathObject_sign = function (thisArg, argList) {
    var x = ToNumber(argList[0]);
    if (isAbrupt(x)) return x;
    return NormalCompletion(x > 0 ? 1 : -1);
};

var MathObject_random = function (thisArg, argList) {
    return NormalCompletion(Math.random());
};

var MathObject_log = function (thisArg, argList) {
    var x = +argList[0];
    return NormalCompletion(Math.log(x));
};
var MathObject_ceil = function (thisArg, argList) {
    var x = +argList[0];
    return NormalCompletion(Math.ceil(x));
};
var MathObject_floor = function (thisArg, argList) {
    var x = +argList[0];
    return NormalCompletion(Math.floor(x));
};
var MathObject_abs = function (thisArg, argList) {
    var a = +argList[0];
    return NormalCompletion(Math.abs(a));
};

var MathObject_pow = function (thisArg, argList) {
    var b = +argList[0];
    var e = +argList[1];
    return NormalCompletion(Math.pow(b, e));
};
var MathObject_sin = function (thisArg, argList) {
    var x = +argList[0];
    return NormalCompletion(Math.sin(x));
};
var MathObject_cos = function (thisArg, argList) {
    var x = +argList[0];
    return NormalCompletion(Math.cos(x));
};
var MathObject_atan = function (thisArg, argList) {
    var x = +argList[0];
    return NormalCompletion(Math.atan(x));
};
var MathObject_atan2 = function (thisArg, argList) {
    var x = +argList[0];
    var y = +argList[1];
    return NormalCompletion(Math.atan2(x,y));
};
var MathObject_max = function (thisArg, argList) {
    var args = CreateListFromArray(argList);
    if (isAbrupt(args)) return args;
    return NormalCompletion(Math.max.apply(Math, args));
};
var MathObject_min = function (thisArg, argList) {
    var args = CreateListFromArray(argList);
    if (isAbrupt(args)) return args;
    return NormalCompletion(Math.min.apply(Math, args));
};
var MathObject_tan = function (thisArg, argList) {
    var x = +argList[0];
    return NormalCompletion(Math.tan(x));
};
var MathObject_exp = function (thisArg, argList) {
    var x = argList[0];
    return NormalCompletion(Math.exp(x));
};
var MathObject_hypot = function (thisArg, argList) {

};
var MathObject_imul = function (thisArg, argList) {

};

var MathObject_log1p = function (thisArg, argList) {

};

var MathObject_clz = function (thisArg, argList) {
    var x = argList[0];
    x = ToNumber(x);
    if (isAbrupt(x = ifAbrupt(x))) return x;
    var n = ToUint32(x);
    if (isAbrupt(n = ifAbrupt(n))) return n;
    if (n < 0) return 0;
    if (n == 0) return 32;
    var bitlen = Math.ceil(Math.log(Math.pow(n, Math.LOG2E)));
    var p = 32 - bitlen;
    return NormalCompletion(p);
};

setInternalSlot(MathObject, SLOTS.MATHTAG, true);
setInternalSlot(MathObject, SLOTS.PROTOTYPE, ObjectPrototype);

LazyDefineBuiltinConstant(MathObject, "PI", PI);
LazyDefineBuiltinConstant(MathObject, "LOG2E", LOG2E);
LazyDefineBuiltinConstant(MathObject, "SQRT1_2", SQRT1_2);
LazyDefineBuiltinConstant(MathObject, "SQRT2", SQRT2);
LazyDefineBuiltinConstant(MathObject, "LN10", LN10);
LazyDefineBuiltinConstant(MathObject, "LN2", LN2);
LazyDefineBuiltinConstant(MathObject, "E", E);
LazyDefineBuiltinConstant(MathObject, "LOG10E", LOG10E);
LazyDefineBuiltinConstant(MathObject, $$toStringTag, "Math");

LazyDefineBuiltinFunction(MathObject, "atan", 2, MathObject_atan);
LazyDefineBuiltinFunction(MathObject, "atan2", 1, MathObject_atan2);
LazyDefineBuiltinFunction(MathObject, "ceil", 1, MathObject_ceil);
LazyDefineBuiltinFunction(MathObject, "clz", 1, MathObject_clz);
LazyDefineBuiltinFunction(MathObject, "cos", 1, MathObject_cos);
LazyDefineBuiltinFunction(MathObject, "exp", 1, MathObject_exp);
LazyDefineBuiltinFunction(MathObject, "floor", 1, MathObject_floor);
LazyDefineBuiltinFunction(MathObject, "hypot", 2, MathObject_hypot);
LazyDefineBuiltinFunction(MathObject, "imul", 2, MathObject_imul);
LazyDefineBuiltinFunction(MathObject, "log", 1, MathObject_log);
LazyDefineBuiltinFunction(MathObject, "log1p", 1, MathObject_log1p);
LazyDefineBuiltinFunction(MathObject, "max", 0, MathObject_max);
LazyDefineBuiltinFunction(MathObject, "min", 0, MathObject_min);
LazyDefineBuiltinFunction(MathObject, "pow", 2, MathObject_pow);
LazyDefineBuiltinFunction(MathObject, "sin", 1, MathObject_sin);
LazyDefineBuiltinFunction(MathObject, "sign", 1, MathObject_sign);
LazyDefineBuiltinFunction(MathObject, "tan", 1, MathObject_tan);
LazyDefineBuiltinFunction(MathObject, "random", 0, MathObject_random);

