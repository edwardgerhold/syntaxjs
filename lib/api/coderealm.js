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
var ___realms___ = [];
function saveCodeRealm() {
    ___realms___.push(realm);
}
function restoreCodeRealm() {
    setCodeRealm(___realms___.pop());
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
