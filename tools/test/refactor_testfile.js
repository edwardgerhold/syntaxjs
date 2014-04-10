
DefineOwnProperty(obj, "name", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
	var one = argList[0]
	return NormalCompletion("Your name is: "+one);
    }, 1),
    enumerable: false,
    writable: false,
    configurable: false
});
DefineOwnProperty(obj1, "name", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
	var one = argList[0]
	return NormalCompletion("Your name is: "+one);
    }, 1),
    enumerable: false,
    writable: false,
    configurable: false
});
DefineOwnProperty(obj2, "name", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
	var one = argList[0]
	return NormalCompletion("Your name is: "+one);
    }, 1),
    enumerable: false,
    writable: false,
    configurable: false
});
DefineOwnProperty(obj3, "name", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
	var one = argList[0]
	return NormalCompletion("Your name is: "+one);
    }, 1),
    enumerable: false,
    writable: false,
    configurable: false
});


/* 
// keeping one list with the functions.

var obj_name = function name(thisArg, argList) {
    var one = argList[0]
    return NormalCompletion("Your name is: "+one);
};
var obj1_name = function name(thisArg, argList) {
    var one = argList[0]
    return NormalCompletion("Your name is: "+one);
};
var obj2_name = function name(thisArg, argList) {
    var one = argList[0]
    return NormalCompletion("Your name is: "+one);
};
var obj3_name = function name(thisArg, argList) {
    var one = argList[0]
    return NormalCompletion("Your name is: "+one);
};

// keeping one list with the new define call.
LazyDefineBuiltinFunction(realm, obj, "name", 1, obj_name);
LazyDefineBuiltinFunction(realm, obj1, "name", 1, obj1_name);
LazyDefineBuiltinFunction(realm, obj2, "name", 1, obj2_name);
LazyDefineBuiltinFunction(realm, obj3, "name", 1, obj3_name);

*/
