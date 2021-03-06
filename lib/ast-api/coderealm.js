function GetGlobalObject() {
    var realm = getRealm();
    var globalThis = realm.globalThis;
    return globalThis;
}
function createPublicCodeRealm() {
    var realm = CreateRealm();

    return {
        eval: function eval_() {
            return realm.eval.apply(realm, arguments);
        },
        eval0: function eval0() {
            return realm.eval0.apply(realm, arguments);
        },
        evalFile: function evalFile() {
            return realm.evalFile.apply(realm, arguments);
        },
        evalAsync: function evalAsync() {
            return realm.evalAsync.apply(realm, arguments);
        },
        evalByteCode: function evalByteCode() {
            return realm.evalByteCode.apply(realm, arguments);
        }
    };
    /*
     return {
     eval: realm.eval,
     eval0: realm.eval0,
     evalFile: realm.evalFile,
     evalAsync: realm.evalAsync,
     evalByteCode: realm.evalByteCode
     };
     */
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
        Function: undefined,
        loader: ldr,
        stack: [],
        eventQueue: [],
        ObserverCallbacks: [],
        GlobalSymbolRegistry: Object.create(null),
        leakySymbolMap: Object.create(null), // for getOwnPropertySymbols
        defaultLocale: undefined
    };
}
CodeRealm.prototype.toString = CodeRealm_toString;
CodeRealm.prototype.constructor = CodeRealm;
CodeRealm.prototype.evalFile = function (filename) {
    var rf = require("filesystem").readFileSync;
    if (typeof rf === "function") {
        var code = rf(filename);
        return this.eval(code);
    } else {
        throw new TypeError("can not read file " + filename + " with filesystem module");
    }
};
CodeRealm.prototype.eval = function (code) {
    saveCodeRealm();
    setCodeRealm(this);
    if (typeof code === "string") code = parse(code);
    var result = exports.Evaluate(code);
    result = GetValue(result);
    if (isAbrupt(result = ifAbrupt(result))) {
        var error = result.value;
        var ex = new Error(Get(error, "message"));
        ex.name = Get(error, "name");
        ex.stack = Get(error, "stack");
        throw ex;
    }
    evalJobs();
    restoreCodeRealm();
    return result;
};

CodeRealm.prototype.eval0 = function (code) {
    // overhead save realm
    saveCodeRealm();
    setCodeRealm(this);
    if (typeof code === "string") code = parse(code);
    var result = exports.loop(code);
    result = GetValue(result);
    if (isAbrupt(result = ifAbrupt(result))) {
        var error = result.value;
        var ex = new Error(Get(error, "message"));
        ex.name = Get(error, "name");
        ex.stack = Get(error, "stack");
        throw ex;
    }
    evalJobs();
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
    var result = require("asm-runtime").CompileAndRun(this, code);
    result = GetValue(result);
    if (isAbrupt(result = ifAbrupt(result))) {
        var error = result.value;
        var ex = new Error(Get(error, "message"));
        ex.name = Get(error, "name");
        ex.stack = Get(error, "stack");
        throw ex;
    }
    evalJobs();
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
function CreateRealm() {
    saveCodeRealm();
    var realmRec = CodeRealm();
    setCodeRealm(realmRec);
    var context = ExecutionContext(null);
    context.realm = realmRec;
    realmRec.stack.push(context);
    var intrinsics = CreateIntrinsics(realmRec);
    var loader = OrdinaryConstruct(getIntrinsic(INTRINSICS.LOADER), []);
    if (isAbrupt(loader = ifAbrupt(loader))) return loader;
    realmRec.loader = loader;
    realmRec.globalThis = OrdinaryObject();
    var newGlobal = SetDefaultGlobalBindings(realmRec);
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
    makeJobQueues(realmRec);
    addWellKnownSymbolsToRealmsLeakySymbolMap(realmRec);
    restoreCodeRealm();
    return realmRec;
}
var ___realms___ = [];
function saveCodeRealm() {
    ___realms___.push(realm);
}
function restoreCodeRealm() {
    setCodeRealm(___realms___.pop());
}
function setCodeRealm(r) {
    if (r) {
        realm = r;
        stack = realm.stack;
        intrinsics = realm.intrinsics;
        globalEnv = realm.globalEnv;
        globalThis = realm.globalThis;
    }
    require("runtime").setCodeRealm(r);
}

function Initialization(sources) {
    var realm = CreateRealm();
    // context wird in create realm erzeugt
    var status = InitializeFirstRealm(realm);
    if (isAbrupt(status)) {
        // Assert realm could not be created
        // and cleanup, if there is something to close
        return status;
    }
    for (var i = 0, j = sources.length; i < j; i++) {
        EnqueueJob("ScriptJobs", ScriptEvaluationJob, [sources[i]])
    }
    return NextJob(NormalCompletion(undefined))
}
function InitializeFirstRealm(realm) {
    var intrinsics = CreateIntrinsics(realm);
    var global = undefined;
    var status = SetRealmGlobalObject(realm, global)
    if (isAbrupt(status)) return status;
    var globalObj = SetDefaultGlobalBindings(realm);
    if (isAbrupt(globalObj = ifAbrupt(globalObj))) return globalObj;
    // CreateImplementationDefinedGlobalObjectProperties(globalObj);
    return NormalCompletion(undefined);
}


function GetFunctionRealm(obj) {
    Assert(IsCallable(obj), "MUST_BE_CALLABLE");
    if (hasInternalSlot(obj, SLOTS.REALM)) {
        return getInternalSlot(obj, SLOTS.REALM);
    }
    if (hasInternalSlot(obj, SLOTS.BOUNDTARGETFUNCTION)) {
        var target = getInternalSlot(obj, SLOTS.BOUNDTARGETFUNCTION);
        return GetFunctionRealm(target);
    }
    if (hasInternalSlot(obj, SLOTS.PROXYTARGET)) {
        var proxyTarget = getInternalSlot(obj, SLOTS.PROXYTARGET);
        return GetFunctionRealm(proxyTarget);
    }
    return getRealm();
}