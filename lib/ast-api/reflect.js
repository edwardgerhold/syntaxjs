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
        if (objectHasOwnProperty(node, k)) {
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
    if (Type(source) !== STRING) return newTypeError("String to parse expected");
    try {
        jsAst = parse(source);
    } catch (ex) {
        message = ex.message;
        return newSyntaxError(message);
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

    if (Type(goal) !== STRING) return newTypeError("Goal to parse expected");
    if (Type(source) !== STRING) return newTypeError("String to parse expected");
    try {
        jsAst = parseGoal(goal, source);
    } catch (ex) {
        message = ex.message;
        return newSyntaxError(message);
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
    if (Type(proto) !== OBJECT && proto !== null) return newTypeError("Reflect.setPrototypeOf: proto is neither an object nor null!");
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
var ReflectObject_set = function (thisArg, argList) {
    var target = argList[0];
    var propertyKey = argList[1];
    var V = argList[2];
    var receiver = argList[3];
    var obj = ToObject(target);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    var key = ToPropertyKey(propertyKey);
    if (isAbrupt(key = ifAbrupt(key))) return key;
    if (receiver === undefined) receiver = target;
    return callInternalSlot(SLOTS.SET, obj, key, V, receiver);
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
    return callInternalSlot(SLOTS.DEFINEOWNPROPERTY, obj, key, desc);
};
var ReflectObject_enumerate = function (thisArg, argList) {
    var target = argList[0];
    var obj = ToObject(target);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    return callInternalSlot(SLOTS.ENUMERATE, obj);
};
var ReflectObject_ownKeys = function (thisArg, argList) {
    var target = argList[0];
    var obj = ToObject(target);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    return callInternalSlot("OwnPropertyKeys", obj);
};
var ReflectObject_getIntrinsic = function (thisArg, argList) {
    var intrinsic = ToString(argList[0]);
    if (isAbrupt(intrinsic = ifAbrupt(intrinsic))) return intrinsic;
    return getIntrinsic(intrinsic);
};
var ReflectObject_createSelfHostingFunction = function (thisArg, argList) {
    var parseGoal = require("parser").parseGoal;
    var source = argList[0];
    var realm = argList[1];
    try {
        var fn = parseGoal("FunctionDeclaration", source);
    } catch (ex) {
        return newSyntaxError(ex.message);
    }
    var realmObject = realm === undefined ? getRealm() : getInternalSlot(realm, "RealmObject");
    var F = OrdinaryFunction();
    setInternalSlot(F, SLOTS.CODE, fn.body);
    setInternalSlot(F, SLOTS.FORMALPARAMETERS, fn.params);
    setInternalSlot(F, SLOTS.STRICT, !!fn.strict);
    setInternalSlot(F, SLOTS.REALM, realmObject);
    return NormalCompletion(F);
};
