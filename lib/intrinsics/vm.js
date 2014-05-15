
var VMObject_eval = function (thisArg, argList) {
    var code = argList[0];
    var realm = argList[1];
    var realmObject;
    if (realm === undefined) realmObject = getRealm();
    else if (!(realmObject = getInternalSlot(realm, "RealmObject"))) return newTypeError( "Sorry, only realm objects are accepted as realm object");
    return require("vm").CompileAndRun(realmObject, code);
};

LazyDefineBuiltinFunction(VMObject, "eval", 1, VMObject_eval);

