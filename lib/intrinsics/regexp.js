// ===========================================================================================================
// Regular Expressiong	
// ===========================================================================================================

MakeConstructor(RegExpConstructor, true, RegExpPrototype);


var RegExp_$$create = function (thisArg, argList) {
    return RegExpAllocate(thisArg);
};
var RegExp_Call = function (thisArg, argList) {
    var func = RegExpConstructor;
    var pattern = argList[0];
    var flags = argList[1];
    var O = thisArg;
    var P, F, testP;
    if (!hasInternalSlot(O, "RegExpMatcher") || getInternalSlot(O, "RegExpMatcher") !== undefined) {
        if (testP=(Type(pattern) === "object" && hasInternalSlot(pattern, "RegExpMatcher"))) return pattern;
        O = RegExpAlloc(func);
        if (isAbrupt(O = ifAbrupt(O))) return O;
    }
    if (testP) {
        if (getInternalSlot(pattern, "RegExpMatcher") !== undefined) return withError("Type", "patterns [[RegExpMatcher]] isnt undefined");
        if (flags != undefined) return withError("Type", "flag should be undefined for this call");
        P = getInternalSlot(pattern, "OriginalSource");
        F = getInternalSlot(pattern, "OriginalFlags");
    } else {
        P = pattern;
        F = flags;
    }
    return RegExpInitialize(O, P, F);
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
