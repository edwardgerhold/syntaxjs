/*

    This is a small interface for my upcoming virtual machine implementation,
    that i can execute VM.eval(code[, realm]) from the es6> prompt and don´t
    have to switch to node for calling the functions.

    The code should be in lib/vm/vm.js and it´s include files.
    But until it is really a vm, some weeks and months will pass us by.
    For now, i will put it in lib/parsenodes.

*/
var VMObject_eval = function (thisArg, argList) {
    var code = argList[0];
    var realm = argList[1];
    var realmObject;
    if (realm === undefined) realmObject = getRealm();
    else {
	if (!(realmObject = getInternalSlot(realm, "RealmObject"))) return withError("Type", "Sorry, only realm objects are accepted as realm object");
    }
    return require("vm").CompileAndRun(realmObject, code);
};
LazyDefineBuiltinFunction(VMObject, "eval", 1, VMObject_eval);
/*

    This is a small interface for my upcoming virtual machine implementation,
    that i can execute VM.eval(code[, realm]) from the es6> prompt and don´t
    have to switch to node for calling the functions.

*/