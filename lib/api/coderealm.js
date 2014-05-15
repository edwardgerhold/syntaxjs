function GetGlobalObject() {
    var realm = getRealm();
    var globalThis = realm.globalThis;
    return globalThis;
}


function createPublicCodeRealm () {
    var realm = CreateRealm();
    return {
        eval: function toValue() {
            return realm.eval.apply(realm, arguments);
        },
        evalFile: function fileToValue() {
            return realm.evalFile.apply(realm, arguments);
        },
        evalAsync: function evalAsync() {
            return realm.evalAsync.apply(realm, arguments);
        },
        evalByteCode: function () {
            return realm.evalByteCode.apply(realm, arguments);
        }
    };
}

function CodeRealm(intrinsics, gthis, genv, ldr) {
    "use strict";
    return {
        __proto__: CodeRealm.prototype,
        intrinsics: intrinsics,
        globalThis: gthis,
        globalEnv: genv,
        directEvalTranslate: undefined,
        directEvalFallback: undefined,
        indirectEval: undefined,
        Function:undefined,
        loader: ldr,
        stack: [],
        eventQueue:[],
        ObserverCallbacks: []
    };
}
CodeRealm.prototype.toString = CodeRealm_toString;
CodeRealm.prototype.constructor = CodeRealm;

CodeRealm.prototype.fileToValue =
    CodeRealm.prototype.evalFile = function (filename) {
        var rf = require("filesystem").readFileSync;
        if (typeof rf === "function") {
            var code = rf(filename);
            return this.eval(code);
        } else {
            throw new TypeError("can not read file "+filename+" with filesystem module");
        }
    };


CodeRealm.prototype.eval =
    CodeRealm.prototype.toValue = function (code) {
        // overhead save realm
        saveCodeRealm();
        setCodeRealm(this);
        if (typeof code === "string") code = parse(code);
        var result = exports.Evaluate(code);
        result = GetValue(result);
        if (isAbrupt(result=ifAbrupt(result))) {
            var error = result.value;
            var ex = new Error(Get(error, "message"));
            ex.name = Get(error, "name");
            ex.stack = Get(error,"stack");
            throw ex;
        }
        var PromiseTasks = getTasks(getRealm(), "PromiseTasks")
        var taskResults = NextTask(undefined, PromiseTasks);

        restoreCodeRealm();
        return result;
    };

CodeRealm.prototype.evalAsync =
    function (code) {
        var realm = this;
        return makePromise(function (resolve, reject) {
            try {
                var result = realm.eval(code);
                resolve(result);
            } catch (ex) {
                reject(ex);
            }
        });
    };

    CodeRealm.prototype.evalFileAsync = function (file) {
        var realm = this;
        return require("filesystem").readFileP(name).then(function (code) {
            return realm.eval(code);
        }, function (err) {
            throw err;
        });
    };

    CodeRealm.prototype.evalByteCode = function (code) {
        saveCodeRealm();
        setCodeRealm(this);
        var result = require("vm").CompileAndRun(this, code);
        result = GetValue(result);
        if (isAbrupt(result=ifAbrupt(result))) {
            var error = result.value;
            var ex = new Error(Get(error, "message"));
            ex.name = Get(error, "name");
            ex.stack = Get(error,"stack");
            throw ex;
        }
        var PromiseTasks = getTasks(getRealm(), "PromiseTasks");
        var taskResults = NextTask(undefined, PromiseTasks);
        restoreCodeRealm();
        return result;
    };

function CodeRealm_toString() {
    return "[object CodeRealm]";
}


function IndirectEval(realm, source) {
    saveCodeRealm();
    setCodeRealm(realm);
    if (typeof source === "string") {
        var code = parse(source);
    } else code = source;
    var result = exports.Evaluate(code);
    restoreCodeRealm();
    return result;
    //return realm.toValue(source);
}

exports.IndirectEval = IndirectEval;
exports.CreateRealm = CreateRealm;
exports.createPublicCodeRealm = createPublicCodeRealm;

function CreateRealm () {

    saveCodeRealm();

    var realmRec = CodeRealm();
    setCodeRealm(realmRec);
    // i have to have a stack, realm, intriniscs
    // and to remove the dependency
    //var context = newContext(null);

    var context = ExecutionContext(null);
    context.realm = realmRec;
    realmRec.stack.push(context);


    var intrinsics = createIntrinsics(realmRec);

    var loader = OrdinaryConstruct(getIntrinsic(INTRINSICS.LOADER), []);
    if (isAbrupt(loader = ifAbrupt(loader))) return loader;

    realmRec.loader = loader;
    var newGlobal = createGlobalThis(realmRec, ObjectCreate(null), intrinsics);
    var newGlobalEnv = GlobalEnvironment(newGlobal);

    // i think this is a bug and no execution context should be required
    context.VarEnv = newGlobalEnv;
    context.LexEnv = newGlobalEnv;


    realmRec.globalThis = newGlobal;
    realmRec.globalEnv = newGlobalEnv;
    realmRec.directEvalTranslate = undefined;
    realmRec.directEvalFallback = undefined;
    realmRec.indirectEval = undefined;
    realmRec.Function = undefined;
    realmRec.GlobalSymbolRegistry = Object.create(null);
    makeTaskQueues(realmRec);
    restoreCodeRealm();
    return realmRec;
}


var realms = [];
function saveCodeRealm() {
    realms.push(realm);
}
function restoreCodeRealm() {
    setCodeRealm(realms.pop());
}
function setCodeRealm(r) {  // CREATE REALM (API)
    if (r) {
        realm = r;
        stack = realm.stack;
        intrinsics = realm.intrinsics;
        globalEnv = realm.globalEnv;
        globalThis = realm.globalThis;
    }
    require("runtime").setCodeRealm(r);
}





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

