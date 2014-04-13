// ===========================================================================================================
// Regular Expressiong	
// ===========================================================================================================

MakeConstructor(RegExpConstructor, true, RegExpPrototype);


var RegExp_$$create = function (thisArg, argList) {
    return RegExpAllocate(thisArg);
};
var RegExp_Call = function (thisArg, argList) {
    var obj = thisArg;
    return obj;
};
var RegExp_Construct = function (argList) {
    return Construct(this, argList);
};
var RegExpPrototype_get_global = function (thisArg, argList) {};
var RegExpPrototype_get_multiline = function (thisArg, argList) {};
var RegExpPrototype_get_ignoreCase = function (thisArg, argList) {};
var RegExpPrototype_get_source = function (thisArg, argList) {};
var RegExpPrototype_compile = function (thisArg, argList) {
};
var RegExpPrototype_exec = function (thisArg, argList) {
};
var RegExpPrototype_test = function (thisArg, argList) {
};
setInternalSlot(RegExpConstructor, "Call", RegExp_Call);
setInternalSlot(RegExpConstructor, "Construct", RegExp_Construct);

LazyDefineBuiltinConstant(RegExpConstructor, "prototype", RegExpPrototype);
LazyDefineBuiltinConstant(RegExpPrototype, "constructor", RegExpConstructor);

LazyDefineBuiltinConstant(RegExpPrototype, $$isRegExp, true);
LazyDefineBuiltinConstant(RegExpPrototype, $$toStringTag, "RegExp");
LazyDefineBuiltinFunction(RegExpConstructor, $$create, 1, RegExp_$$create);

LazyDefineAccessor(RegExpPrototype, "ignoreCase", RegExpPrototype_get_ignoreCase, undefined);
LazyDefineAccessor(RegExpPrototype, "global", RegExpPrototype_get_global, undefined);
LazyDefineAccessor(RegExpPrototype, "multiline", RegExpPrototype_get_multiline, undefined);
LazyDefineAccessor(RegExpPrototype, "source", RegExpPrototype_get_source, undefined);

LazyDefineProperty(RegExpPrototype, "lastIndex", 0);

LazyDefineBuiltinFunction(RegExpPrototype, "compile", 1, RegExpPrototype_compile);
LazyDefineBuiltinFunction(RegExpPrototype, "exec", 1, RegExpPrototype_exec);
LazyDefineBuiltinFunction(RegExpPrototype, "test", 1, RegExpPrototype_test);
