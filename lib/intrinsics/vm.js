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
    else if (!(realmObject = getInternalSlot(realm, "RealmObject"))) return withError("Type", "Sorry, only realm objects are accepted as realm object");
    return require("vm").CompileAndRun(realmObject, code);
};

var VMObject_heap = function (thisArg, argList) {
    var size = argList[0];
    var realm = argList[1];
    var realmObject;
    if (realm === undefined) realmObject = getRealm();
    else if (!(realmObject = getInternalSlot(realm, "RealmObject"))) return withError("Type", "Sorry, only realm objects are accepted as realm object");
    var Heap = require("heap").Heap;
    var heap = new Heap(size);
    var O = NativeJSObjectWrapper(heap);
    setInternalSlot(O, "Heap", heap);    
    LazyDefineProperty(O, $$toStringTag, "HeapWrapper");    
    return NormalCompletion(O);
};
LazyDefineBuiltinFunction(VMObject, "eval", 1, VMObject_eval);
LazyDefineBuiltinFunction(VMObject, "heap", 1, VMObject_heap);

/*

    This is a small interface for my upcoming virtual machine implementation,
    that i can execute VM.eval(code[, realm]) from the es6> prompt and don´t
    have to switch to node for calling the functions.

*/