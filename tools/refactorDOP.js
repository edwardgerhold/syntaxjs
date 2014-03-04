// placeholder:
//
// refactor_DOP.js
//
// this is (will be) the tool refactoring the define own property calls for
// defining constructor and prototype properties 
// i would do too many edits for and loose too much time.


// only task for now
//
// 1. search for DefineOwnProperty(*Constructor|*Prototype, name, {
// 	value: CreateBuiltinFunction(realm, steps, 1, fname) 
// 	...
// 2. Extract from DOP
//	1. Constructorname
//	2. PropertyName
//   and from CBF
//	3. Steps
//	4. name
//	5. len
//
// 3. if name is a symbol
//	[name] or [Symbol.**] if it´s a well-known symbol
//
//
// 4. Write the thing down again
//
//
//
// Example:
/*

Converts:

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

To:

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

function error_handler(exception) {
    console.err("exception "+exception.name+" reached fn error_handler");
    throw exception;
}

var defineRegExp = /(DefineOwnProperty\()/gm;

function search_and_replace (err, data) {
    if (err) throw err;    
    var list = data.match(defineRegExp);
    console.log(JSON.stringify(list, null, 4));
}

(function main (fs, args) {
    while (args.length) {
	var arg = args.shift();
        fs.readFile(arg, "utf8", search_and_replace);
    }
}(require("fs"), process.argv.slice(2)));
