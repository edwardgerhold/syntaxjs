var RealmPrototype_get_global = function (thisArg, argList) {
    var RealmConstructor = thisArg;
    if (Type(RealmConstructor) !== OBJECT || !hasInternalSlot(RealmConstructor, SLOTS.REALM)) return newTypeError(format("S_HAS_NO_S", "thisValue", "[[Realm]]"));
    var realm = getInternalSlot(RealmConstructor, SLOTS.REALM);
    var globalThis = realm.globalThis;
    return globalThis;
};
var RealmPrototype_eval = function (thisArg, argList) {
    var source = argList[0];
    var RealmConstructor = thisArg;
    if (Type(RealmConstructor) !== OBJECT || !hasInternalSlot(RealmConstructor, SLOTS.REALM)) return newTypeError(format("S_HAS_NO_S", "thisValue", "[[Realm]]"));
    return IndirectEval(getInternalSlot(RealmConstructor, SLOTS.REALM), source);
};
var RealmConstructor_Call = function (thisArg, argList) {
    var RealmConstructor = thisArg;
    var options = argList[0];
    var initializer = argList[1];
    if (Type(RealmConstructor) !== OBJECT) return newTypeError(format("S_NOT_OBJECT", "thisValue"));
    if (!hasInternalSlot(RealmConstructor, SLOTS.REALM)) return newTypeError(format("S_NOT_COMPLETE", "thisValue"));
    if (getInternalSlot(RealmConstructor, SLOTS.REALM) !== undefined) return newTypeError(format("S_NOT_UNDEFINED", "[[Realm]]"));
    if (options === undefined) options = ObjectCreate(null);
    else if (Type(options) !== OBJECT) return newTypeError(format("S_NOT_OBJECT", "options"));
    var realm = CreateRealm();
    var evalHooks = Get(options, "eval");
    if (isAbrupt(evalHooks = ifAbrupt(evalHooks))) return evalHooks;
    if (evalHooks === undefined) evalHooks = ObjectCreate();
    var directEval = Get(evalHooks, "directEval");
    if (isAbrupt(directEval = ifAbrupt(directEval))) return directEval;
    if (directEval === undefined) directEval = ObjectCreate();
    else if (Type(directEval) !== OBJECT) return newTypeError(format("S_NOT_OBJECT", "directEval"));
    var translate = Get(directEval, "translate");
    if (isAbrupt(translate = ifAbrupt(translate))) return translate;
    if ((translate !== undefined) && !IsCallable(translate)) return newTypeError(format("S_NOT_CALLABLE", "translate"));
    setInternalSlot(realm, "translateDirectEvalHook", translate);
    var fallback = Get(directEval, "fallback");
    if (isAbrupt(fallback = ifAbrupt(fallback))) return fallback;
    setInternalSlot(realm, "fallbackDirectEvalHook", fallback);
    var indirectEval = Get(options, "indirect");
    if (isAbrupt(indirectEval = ifAbrupt(indirectEval))) return indirectEval;
    if ((indirectEval !== undefined) && !IsCallable(indirectEval)) return newTypeError(format("S_NOT_CALLABLE", "indirectEval"));
    setInternalSlot(realm, "indirectEvalHook", indirectEval);
    var Function = Get(options, "Function");
    if (isAbrupt(Function = ifAbrupt(Function))) return Function;
    if ((Function !== undefined) && !IsCallable(Function)) return newTypeError(format("S_NOT_CALLABLE", "Function"));
    setInternalSlot(realm, "FunctionHook", Function);
    setInternalSlot(RealmConstructor, SLOTS.REALM, realm);

    realm.directEvalTranslate = translate;
    realm.directEvalFallback = fallback;
    realm.indirectEval = indirectEval;
    realm.Function = Function;

    if (initializer !== undefined) {
        if (!IsCallable(initializer)) return newTypeError(format("S_NOT_CALLABLE", "initializer"));
        var builtins = ObjectCreate();
        DefineBuiltinProperties(realm, builtins);
        var status = callInternalSlot(SLOTS.CALL, initializer, RealmConstructor, [builtins]);
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
    return OrdinaryCreateFromConstructor(thisArg, INTRINSICS.REALMPROTOTYPE, [
        SLOTS.REALM
    ]);
};
var RealmPrototype_stdlib_get = function (thisArg, argList) {
    var RealmConstructor = thisArg;
    var source = argList[0];
    if (Type(RealmConstructor) !== OBJECT || !hasInternalSlot(RealmConstructor, SLOTS.REALM)) return newTypeError("S_HAS_NO_S", "thisValue", "[[Realm]]");    var realm = getInternalSlot(RealmConstructor, SLOTS.REALM);
    if (realm === undefined) return newTypeError(format("S_IS_UNDEFINED", "[[Realm]]"));
    var props = ObjectCreate(getIntrinsic(INTRINSICS.OBJECTPROTOTYPE));
    var bindings = getInternalSlot(getGlobalThis(), SLOTS.BINDINGS);
    var symbols = getInternalSlot(getGlobalThis(), SLOTS.SYMBOLS);
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
var RealmPrototype_intrinsics = function (thisArg, argList) {
};
var RealmPrototype_initGlobal = function (thisArg, argList) {
};
var RealmPrototype_directEval = function (thisArg, argList) {
};
var RealmPrototype_indirectEval = function (thisArg, argList) {
    var RealmConstructor = thisArg;
    var source = argList[0];
    if (Type(RealmConstructor) !== OBJECT || !hasInternalSlot(RealmConstructor, SLOTS.REALM)) return newTypeError(format("S_HAS_NO_S", "thisValue", "[[Realm]]"));
    var realm = getInternalSlot(RealmConstructor, SLOTS.REALM);
    if (realm === undefined) return newTypeError(format("S_IS_UNDEFINED", "[[Realm]]"));
    return IndirectEval(realm, source);
};