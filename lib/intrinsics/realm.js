// ##################################################################
// Das Code Realm als %Realm%
// ##################################################################

var RealmPrototype_get_global = function (thisArg, argList) {
    var realmObject = thisArg;
    if ((Type(realmObject) != "object") || !hasInternalSlot(realmObject, "Realm")) return withError("Type", "The this value is no realm object");
    var realm = getInternalSlot(realmObject, "Realm");
    var globalThis = realm.globalThis;
    return globalThis;
};

var RealmPrototype_eval = function (thisArg, argList) {
    var source = argList[0];
    var realmObject = thisArg;
    if ((Type(realmObject) != "object") || !hasInternalSlot(realmObject, "Realm")) return withError("Type", "The this value is no realm object");
    return IndirectEval(getInternalSlot(realmObject, "Realm"), source);
};

var RealmConstructor_Call = function (thisArg, argList) {
    var realmObject = thisArg;
    var options = argList[0];
    var initializer = argList[1];
    if (Type(realmObject) !== "object") return withError("Type", "The this value is not an object");
    if (!hasInternalSlot(realmObject, "Realm")) return withError("Type", "The this value has not the required properties.");
    if (getInternalSlot(realmObject, "Realm") !== undefined) return withError("Type", "the realm property has to be undefined");
    if (options === undefined) options = ObjectCreate(null);
    else if (Type(options) !== "object") return withError("Type", "options is not an object");
    var realm = CreateRealm();
    var evalHooks = Get(options, "eval");
    if (isAbrupt(evalHooks = ifAbrupt(evalHooks))) return evalHooks;
    if (evalHooks === undefined) evalHooks = ObjectCreate();
    var directEval = Get(evalHooks, "directEval");
    if (isAbrupt(directEval = ifAbrupt(directEval))) return directEval;
    if (directEval === undefined) directEval = ObjectCreate();
    else if (Type(directEval) !== "object") return withError("Type", "directEval is not an object");
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
    setInternalSlot(realmObject, "Realm", realm);

    realm.directEvalTranslate = translate;
    realm.directEvalFallback = fallback;
    realm.indirectEval = indirectEval;
    realm.Function = Function;

    if (initializer !== undefined) {
        if (!IsCallable(initializer)) return withError("Type", "initializer should be a function");
        var builtins = ObjectCreate();
        DefineBuiltinProperties(realm, builtins);
        var status = callInternalSlot("Call", initializer, realmObject, [builtins]);
        if (isAbrupt(status)) return status;
    }
    return realmObject;
};

var RealmConstructor_Construct = function (argList) {
    var F = this;
    var args = argList;
    return Construct(F, argList);
};

var RealmConstructor_$$create = function (thisArg, argList) {
    var F = thisArg;
    var realmObject = OrdinaryCreateFromConstructor(F, "%RealmPrototype%", {
        "Realm": undefined
    });
    return realmObject;
};

// %Realm%
setInternalSlot(RealmConstructor, "Call", RealmConstructor_Call);
setInternalSlot(RealmConstructor, "Construct", RealmConstructor_Construct);
LazyDefineProperty(RealmConstructor, $$create, CreateBuiltinFunction(realm,RealmConstructor_$$create, 0, "[Symbol.create]"));
MakeConstructor(RealmConstructor, false, RealmPrototype);
// %RealmPrototype%
LazyDefineAccessor(RealmPrototype, "global", CreateBuiltinFunction(realm,RealmPrototype_get_global, 0, "get global"));
LazyDefineProperty(RealmPrototype, "eval", CreateBuiltinFunction(realm,RealmPrototype_eval, 1, "eval"));
LazyDefineProperty(RealmConstructor, $$toStringTag, "Realm");

