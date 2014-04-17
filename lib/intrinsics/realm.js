// ##################################################################
// Das Code Realm als %Realm%
// ##################################################################

var RealmPrototype_get_global = function (thisArg, argList) {
    var RealmConstructor = thisArg;
    if ((Type(RealmConstructor) != "object") || !hasInternalSlot(RealmConstructor, "Realm")) return withError("Type", "The this value is no realm object");
    var realm = getInternalSlot(RealmConstructor, "Realm");
    var globalThis = realm.globalThis;
    return globalThis;
};

var RealmPrototype_eval = function (thisArg, argList) {
    var source = argList[0];
    var RealmConstructor = thisArg;
    if ((Type(RealmConstructor) != "object") || !hasInternalSlot(RealmConstructor, "Realm")) return withError("Type", "The this value is no realm object");
    return IndirectEval(getInternalSlot(RealmConstructor, "Realm"), source);
};

var RealmConstructor_Call = function (thisArg, argList) {
    var RealmConstructor = thisArg;
    var options = argList[0];
    var initializer = argList[1];
    if (Type(RealmConstructor) !== OBJECT) return withError("Type", "The this value is not an object");
    if (!hasInternalSlot(RealmConstructor, "Realm")) return withError("Type", "The this value has not the required properties.");
    if (getInternalSlot(RealmConstructor, "Realm") !== undefined) return withError("Type", "the realm property has to be undefined");
    if (options === undefined) options = ObjectCreate(null);
    else if (Type(options) !== OBJECT) return withError("Type", "options is not an object");
    var realm = CreateRealm();
    var evalHooks = Get(options, "eval");
    if (isAbrupt(evalHooks = ifAbrupt(evalHooks))) return evalHooks;
    if (evalHooks === undefined) evalHooks = ObjectCreate();
    var directEval = Get(evalHooks, "directEval");
    if (isAbrupt(directEval = ifAbrupt(directEval))) return directEval;
    if (directEval === undefined) directEval = ObjectCreate();
    else if (Type(directEval) !== OBJECT) return withError("Type", "directEval is not an object");
    var translate = Get(directEval, "translate");
    if (isAbrupt(translate = ifAbrupt(translate))) return translate;
    if ((translate !== undefined) && !IsCallable(translate)) return withError("Type", "translate has to be a function");
    setInternalSlot(realm, "translateDirectEvalHook", translate);
    var fallback = Get(directEval, "fallback");
    if (isAbrupt(fallback = ifAbrupt(fallback))) return fallback;
    setInternalSlot(realm, "fallbackDirectEvalHook", fallback);
    var indirectEval = Get(options, "indirect");
    if (isAbrupt(indirectEval = ifAbrupt(indirectEval))) return indirectEval;
    if ((indirectEval !== undefined) && !IsCallable(indirectEval)) return withError("Type", "indirectEval should be a function");
    setInternalSlot(realm, "indirectEvalHook", indirectEval);
    var Function = Get(options, "Function");
    if (isAbrupt(Function = ifAbrupt(Function))) return Function;
    if ((Function !== undefined) && !IsCallable(Function)) return withError("Type", "Function should be a function");
    setInternalSlot(realm, "FunctionHook", Function);
    setInternalSlot(RealmConstructor, "Realm", realm);

    realm.directEvalTranslate = translate;
    realm.directEvalFallback = fallback;
    realm.indirectEval = indirectEval;
    realm.Function = Function;

    if (initializer !== undefined) {
        if (!IsCallable(initializer)) return withError("Type", "initializer should be a function");
        var builtins = ObjectCreate();
        DefineBuiltinProperties(realm, builtins);
        var status = callInternalSlot("Call", initializer, RealmConstructor, [builtins]);
        if (isAbrupt(status)) return status;
    }
    return RealmConstructor;
};

var RealmConstructor_Construct = function (argList) {
    var F = this;
    var args = argList;
    return Construct(F, argList);
};

var RealmConstructor_$$create = function (thisArg, argList) {
    var F = thisArg;
    var RealmConstructor = OrdinaryCreateFromConstructor(F, "%RealmPrototype%", {
        "Realm": undefined
    });
    return RealmConstructor;
};


var RealmConstructor_stdlib_get = function (thisArg, argList) {
    var RealmConstructor = thisArg;
    var source = argList[0];
    if (Type(RealmConstructor) != "object" || !hasInternalSlot(RealmConstructor, "RealmRecord")) return withError("Type", "this value is not an object or has no [[RealmRecord]]");
    var realm = getInternalSlot(RealmConstructor, "RealmRecord");
    if (realm === undefined) return withError("Type", "[[RealmRecord]] is undefined?");
    var props = ObjectCreate(getIntrinsic("%ObjectPrototype%"));

    var bindings = getInternalSlot(getGlobalThis(), "Bindings");
    var symbols = getInternalSlot(getGlobalThis(), "Symbols");

    function forEachProperty(props, bindings) {
        for (var P in bindings) {
            var desc = bindings[P];
            var newDesc = {
                value: desc.value,
                enumerable: desc.enumerable,
                configurable: desc.configurable,
                writable: desc.writable
            };
            var status = DefineOwnPropertyOrThrow(props, P, newDesc);
            if (isAbrupt(status)) return status;
        }
    }
    forEachProperty(props, bindings);
    forEachProperty(props, symbols);

};
var RealmConstructor_intrinsics = function (thisArg, argList) {
};
var RealmConstructor_initGlobal = function (thisArg, argList) {
};
var RealmConstructor_directEval = function (thisArg, argList) {
};
var RealmConstructor_indirectEval = function (thisArg, argList) {
    var RealmConstructor = thisArg;
    var source = argList[0];
    if (Type(RealmConstructor) != "object" || !hasInternalSlot(RealmConstructor, "RealmRecord")) return withError("Type", "this value is not an object or has no [[RealmRecord]]");
    var realm = getInternalSlot(RealmConstructor, "RealmRecord");
    if (realm === undefined) return withError("Type", "[[RealmRecord]] is undefined?");
    return IndirectEval(realm, source);
};
LazyDefineBuiltinFunction(RealmConstructor, "intrinsics", 2, RealmConstructor_intrinsics);
LazyDefineBuiltinFunction(RealmConstructor, "indirectEval", 2, RealmConstructor_indirectEval);
LazyDefineBuiltinFunction(RealmConstructor, "initGlobal", 2, RealmConstructor_initGlobal);
LazyDefineAccessor(RealmConstructor, "stdlib", 3, RealmConstructor_stdlib_get);




// %Realm%
setInternalSlot(RealmConstructor, "Call", RealmConstructor_Call);
setInternalSlot(RealmConstructor, "Construct", RealmConstructor_Construct);
LazyDefineProperty(RealmConstructor, $$create, CreateBuiltinFunction(realm,RealmConstructor_$$create, 0, "[Symbol.create]"));
MakeConstructor(RealmConstructor, false, RealmPrototype);
// %RealmPrototype%
LazyDefineAccessor(RealmPrototype, "global", CreateBuiltinFunction(realm,RealmPrototype_get_global, 0, "get global"));
LazyDefineProperty(RealmPrototype, "eval", CreateBuiltinFunction(realm,RealmPrototype_eval, 1, "eval"));
LazyDefineProperty(RealmConstructor, $$toStringTag, "Reflect.Realm");

