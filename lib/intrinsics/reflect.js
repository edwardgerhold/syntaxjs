
// ===========================================================================================================
// Reflect
// ===========================================================================================================






function reflect_parse_transformASTtoOrdinaries(node, options) {
    var success;
    var newNode;
    var loc = options && options.loc;
    if (Array.isArray(node)) newNode = ArrayCreate(0);
    else newNode = ObjectCreate();
    var current;
    var value;
    for (var k in node) {
        if (!loc && k === "loc") continue;
        if (Object.hasOwnProperty.call(node, k)) {
            current = node[k];
            if (current && typeof current === "object") {
                value = reflect_parse_transformASTtoOrdinaries(current);
            } else {
                value = current;
            }
            success = DefineOwnProperty(newNode, k, {
                value: value,
                writable: true,
                enumerable: true,
                configurable: true
            });
            if (isAbrupt(success)) return success;
        }
    }
    return newNode;
}


var ReflectObject_parse = function (thisArg, argList) {
    var parse = require("parser");
    var parseGoal = parse.parseGoal;
    var source = argList[0];
    var options = argList[1];
    var jsAst, newAst, message;
    if (Type(source) !== STRING) return withError("Type", "String to parse expected");
    try {
        jsAst = parse(source);
    } catch (ex) {
        message = ex.message;
        return withError("Syntax", message);
    }
    newAst = reflect_parse_transformASTtoOrdinaries(jsAst, options);
    if (isAbrupt(newAst = ifAbrupt(newAst))) return newAst;
    return NormalCompletion(newAst);
};

var ReflectObject_parseGoal = function (thisArg, argList) {
    var parse = require("parser");
    var parseGoal = parse.parseGoal;
    var source = argList[1];
    var goal = argList[0];
    var jsAst, newAst, message;

    if (Type(goal) !== STRING) return withError("Type", "Goal to parse expected");
    if (Type(source) !== STRING) return withError("Type", "String to parse expected");
    try {
        jsAst = parseGoal(goal, source);
    } catch (ex) {
        message = ex.message;
        return withError("Syntax", message);
    }
    newAst = reflect_parse_transformASTtoOrdinaries(jsAst);
    if (isAbrupt(newAst = ifAbrupt(newAst))) return newAst;
    return NormalCompletion(newAst);
};


var ReflectObject_getPrototypeOf = function (thisArg, argList) {
    var target = argList[0];
    var obj = ToObject(target);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    return GetPrototypeOf(obj);
};

var ReflectObject_setPrototypeOf = function (thisArg, argList) {
    var target = argList[0];
    var proto = argList[1];
    var obj = ToObject(target);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    if (Type(proto) !== OBJECT && proto !== null) return withError("Type", "Reflect.setPrototypeOf: proto is neither an object nor null!");
    return SetPrototypeOf(obj, proto);
};


var ReflectObject_isExtensible = function (thisArg, argList) {
    var target = argList[0];
    var obj = ToObject(target);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    return IsExtensible(obj);
};

var ReflectObject_preventExtensions = function (thisArg, argList) {
    var target = argList[0];
    var obj = ToObject(target);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    return PreventExtensions(obj);
};
var ReflectObject_has = function (thisArg, argList) {
    var target = argList[0];
    var propertyKey = argList[1];
    var obj = ToObject(target);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    var key = ToPropertyKey(propertyKey);
    if (isAbrupt(key = ifAbrupt(key))) return key;
    return HasProperty(obj, key);
};
var ReflectObject_hasOwn = function (thisArg, argList) {
    var target = argList[0];
    var propertyKey = argList[1];
    var obj = ToObject(target);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    var key = ToPropertyKey(propertyKey);
    if (isAbrupt(key = ifAbrupt(key))) return key;
    return HasOwnProperty(obj, key);
};

var ReflectObject_getOwnPropertyDescriptor = function (thisArg, argList) {
    var target = argList[0];
    var propertyKey = argList[1];
    var obj = ToObject(target);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    var key = ToPropertyKey(propertyKey);
    if (isAbrupt(key = ifAbrupt(key))) return key;
    var desc = GetOwnProperty(obj, key);
    if (isAbrupt(desc = ifAbrupt(desc))) return desc;
    return FromPropertyDescriptor(desc);
};

var ReflectObject_get = function (thisArg, argList) {
    var target = argList[0];
    var propertyKey = argList[1];
    var receiver = argList[2];
    var obj = ToObject(target);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    var key = ToPropertyKey(propertyKey);
    if (isAbrupt(key = ifAbrupt(key))) return key;
    if (receiver === undefined) receiver = target;
    return obj.Get(key, receiver);
};

var ReflectObject_set =function (thisArg, argList) {
    var target = argList[0];
    var propertyKey = argList[1];
    var V = argList[2];
    var receiver = argList[3];
    var obj = ToObject(target);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    var key = ToPropertyKey(propertyKey);
    if (isAbrupt(key = ifAbrupt(key))) return key;
    if (receiver === undefined) receiver = target;
    return callInternalSlot("Set", obj, key, V, receiver);
};
var ReflectObject_invoke = function (thisArg, argList) {
    var target = argList[0];
    var propertyKey = argList[1];
    var argumentList = argList[2];
    var receiver = argList[3];
    var obj = ToObject(target);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    var key = ToPropertyKey(propertyKey);
    if (isAbrupt(key = ifAbrupt(key))) return key;
    if (receiver === undefined) receiver = target;
    var A = CreateListFromArrayLike(argumentList);
    return obj.Invoke(key, A, receiver);
};
var ReflectObject_deleteProperty = function (thisArg, argList) {
    var target = argList[0];
    var propertyKey = argList[1];
    var obj = ToObject(target);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    var key = ToPropertyKey(propertyKey);
    if (isAbrupt(key = ifAbrupt(key))) return key;
    return callInternalSlot("Delete", obj, key);
};
var ReflectObject_defineProperty = function (thisArg, argList) {
    var target = argList[0];
    var propertyKey = argList[1];
    var attributes = argList[2];
    var obj = ToObject(target);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    var key = ToPropertyKey(propertyKey);
    if (isAbrupt(key = ifAbrupt(key))) return key;
    var desc = ToPropertyDescriptor(attributes);
    if (isAbrupt(desc = ifAbrupt(desc))) return desc;
    return callInternalSlot("DefineOwnProperty", obj,key, desc);
};
var ReflectObject_enumerate = function (thisArg, argList) {
    var target = argList[0];
    var obj = ToObject(target);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    return callInternalSlot("Enumerate", obj);
};
var ReflectObject_ownKeys = function (thisArg, argList) {
    var target = argList[0];
    var obj = ToObject(target);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    return callInternalSlot("OwnPropertyKeys", obj);
};


LazyDefineBuiltinFunction(ReflectObject, "defineProperty", 2, ReflectObject_defineProperty);
LazyDefineBuiltinFunction(ReflectObject, "deleteProperty", 3, ReflectObject_deleteProperty);
LazyDefineBuiltinFunction(ReflectObject, "enumerate", 1, ReflectObject_enumerate);
LazyDefineBuiltinFunction(ReflectObject, "invoke", 3, ReflectObject_invoke);
LazyDefineBuiltinFunction(ReflectObject, "isExtensible", 1, ReflectObject_isExtensible);
LazyDefineBuiltinFunction(ReflectObject, "get", 2, ReflectObject_get);
LazyDefineBuiltinFunction(ReflectObject, "getOwnPropertyDescriptor", 2, ReflectObject_getOwnPropertyDescriptor);
LazyDefineBuiltinFunction(ReflectObject, "getPrototypeOf", 1, ReflectObject_getPrototypeOf);
LazyDefineBuiltinFunction(ReflectObject, "has", 2, ReflectObject_has);
LazyDefineBuiltinFunction(ReflectObject, "hasOwn", 2, ReflectObject_hasOwn);
LazyDefineProperty(ReflectObject, "Loader", LoaderConstructor);
LazyDefineBuiltinFunction(ReflectObject, "ownKeys", 1, ReflectObject_ownKeys);
LazyDefineBuiltinFunction(ReflectObject, "parse", 1, ReflectObject_parse);
LazyDefineBuiltinFunction(ReflectObject, "parseGoal", 1, ReflectObject_parseGoal);
LazyDefineBuiltinFunction(ReflectObject, "preventExtensions", 1, ReflectObject_preventExtensions);
LazyDefineProperty(ReflectObject, "Realm", RealmConstructor);
LazyDefineBuiltinFunction(ReflectObject, "set", 3, ReflectObject_set);
LazyDefineBuiltinFunction(ReflectObject, "setPrototypeOf", 2, ReflectObject_setPrototypeOf);
LazyDefineBuiltinConstant(ReflectObject, $$toStringTag, "Reflect");




/*

    tHIS iS just for playing with the parser

*/

var ReflectObject_getIntrinsic = function (thisArg, argList) {
    var intrinsic = ToString(argList[0]);
    if (isAbrupt(intrinsic=ifAbrupt(intrinsic))) return intrinsic;
    return getIntrinsic(intrinsic);
};

LazyDefineBuiltinFunction(ReflectObject, "getIntrinsic", 1, ReflectObject_getIntrinsic);



var ReflectObject_createSelfHostingFunction = function(thisArg, argList) {
   var parseGoal = require("parser").parseGoal;
   var source = argList[0];
   var realm = argList[1];
   try {
       var fn = parseGoal("FunctionDeclaration", source);
   } catch (ex) {
       return withError("Syntax", ex.message);
   }
   var realmObject = realm === undefined ? getRealm() : getInternalSlot(realm, "RealmObject");
   var F = OrdinaryFunction();
   setInternalSlot(F, "Code", fn.body)
   setInternalSlot(F, "FormalParameters", fn.params);
   setInternalSlot(F, "Strict", !!fn.strict);
   setInternalSlot(F, "Realm", realmObject);
   return NormalCompletion(F);
};
LazyDefineBuiltinFunction(ReflectObject, "createSelfHostingFunction", 2, ReflectObject_createSelfHostingFunction);

