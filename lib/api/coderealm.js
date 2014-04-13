
// ===========================================================================================================
// CodeRealm Object
//
// assignIntrinsics
// createGlobalThis
// createGlobalEnv
// sollten zu diesem Objekt gebracht werden
// wenn ich das erzeuge,
// erzeuge ich intrinsics, global, env, loader....
//
// ===========================================================================================================

function createPublicCodeRealm () {
    var realm = CreateRealm();

    return {
        eval: function toValue() {
            return realm.toValue.apply(realm, arguments);
        },
        evalFile: function fileToValue() {
            return realm.fileToValue.apply(realm, arguments);
        },
        evalAsync: function evalAsync() {
            return realm.evalAsync.apply(realm, arguments);
        }
    };
}

function CodeRealm(intrinsics, gthis, genv, ldr) {
    "use strict";
    var cr = Object.create(CodeRealm.prototype);
    cr.intrinsics = intrinsics;
    cr.globalThis = gthis;
    cr.globalEnv = genv;
    cr.directEvalTranslate = undefined;
    cr.directEvalFallback = undefined;
    cr.indirectEval = undefined;
    cr.Function = undefined;
    cr.loader = ldr;

    // self defined

    cr.stack = [];
    cr.eventQueue = [];
    cr.xs = Object.create(null);
    return cr;
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

        // evaluate code
        // 1st stage parser
        if (typeof code === "string") code = parse(code);
        // 2nd stage evaluation
        var result = exports.Evaluate(code);    // here the realm argument...hmm. already in use all over
        if (isAbrupt(result=ifAbrupt(result))) {
            var error = result.value;
            var ex = new Error(Get(error, "message"));
            ex.name = Get(error, "name");
            throw ex;
        } else {
            result = GetValue(result);
        }
        // overhead restore realm
        restoreCodeRealm();
        return result;
    };

// change name with eval

CodeRealm.prototype.evalAsync =
    CodeRealm.prototype.evalFileAsync = function (file) {
        var realm = this;
        return require("filesystem").readFileP(name).then(function (code) {
            return realm.eval(code);
        }, function (err) {
            throw err;
        });
    };

function CodeRealm_toString() {
    return "[object CodeRealm]";
}

/**
 * Created by root on 30.03.14.
 */



    //
    // Realm und Loader
    //
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

    var loader = OrdinaryConstruct(getIntrinsic("%Loader%"), []);
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

    // my programming mistakes fixed.
    // there are variables realm, intrinsics, stack, ..
    // in the other module
    // i think hiding behind ONE function will help
    // or adding it to it´s modules exports and let
    // them use exports would be another. I favor
    // the function. but from my p3/933mhz i know i kill
    // the program with

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
    } else {
        // solution: REMOVE stack, intr, global*
        // in favor of realm.*, too. Until it´s
        // finished and optimize THEN, not now.
        realm = "check for bugs";
        stack = "check for bugs";
        intrinsics = "check for bugs";
        globalEnv = "check for bugs";
        globalThis = "check for bugs";
    }
    require("runtime").setCodeRealm(r);
}


function GetGlobalObject() {
    var realm = getRealm();
    var globalThis = realm.globalThis;
    return globalThis;
}
