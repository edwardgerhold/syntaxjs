// ===========================================================================================================
// Object
// ===========================================================================================================
var ObjectConstructor_assign = function (thisArg, argList) {
    var target = argList[0];
    var source = argList[1];
    var to = ToObject(target);
    if (isAbrupt(to = ifAbrupt(to))) return to;
    var from = ToObject(source);
    if (isAbrupt(source = ifAbrupt(source))) return source;
    var keys = OwnPropertyKeys(source);
    if (isAbrupt(keys = ifAbrupt(keys))) return keys;
    var gotAllNames = false;
    var pendingException = undefined;
    var next, nextKey, desc, propValue, status;
    while (!gotAllNames) {
        next = IteratorStep(keys);
        if (isAbrupt(next = ifAbrupt(next))) return next;
        if (!next) gotAllNames = true;
        else {
            nextKey = IteratorValue(next);
            if (isAbrupt(nextKey = ifAbrupt(nextKey))) return nextKey;
            desc = GetOwnProperty(from, nextKey);
            if (isAbrupt(desc)) pendingException = desc;
            else if (desc !== undefined && desc.enumerable === true) {
                propValue = Get(from, nextKey);
                if (isAbrupt(propValue)) pendingException = propValue;
                else {
                    status = Put(to, nextKey, propValue, true);
                    if (isAbrupt(status)) pendingException = status;
                }
            }
        }
    }
    if (pendingException !== undefined) return pendingException;
    return to;
};
var ObjectConstructor_create = function (thisArg, argList) {
    var O = argList[0];
    var Properties = argList[1];
    if (Type(O) !== OBJECT && Type(O) !== NULL) return withError("Type", "create: argument is not an object or null");
    var obj = ObjectCreate(O);
    if (Properties !== undefined) {
        return ObjectDefineProperties(obj, Properties);
    }
    return obj;
};
var ObjectConstructor_defineProperty = function (thisArg, argList) {
    var O = argList[0];
    var P = argList[1];
    var Attributes = argList[2];
    if (Type(O) !== OBJECT) return withError("Type", "defineProperty: argument 1 is not an object");
    var key = ToPropertyKey(P);
    var desc = ToPropertyDescriptor(Attributes);
    if (isAbrupt(desc = ifAbrupt(desc))) return desc;
    var success = DefineOwnPropertyOrThrow(O, key, desc);
    if (isAbrupt(success = ifAbrupt(success))) return success;
    return O;
};
var ObjectConstructor_defineProperties = function (thisArg, argList) {
    var O = argList[0];
    var Properties = argList[1];
    return ObjectDefineProperties(O, Properties);
};




var ObjectConstructor_call = function Call(thisArg, argList) {
    var value = argList[0];
    if (value === null || value === undefined) return ObjectCreate();
    return ToObject(value);
};

var ObjectConstructor_construct = function (argList) {
    var value = argList[0];
    var type = Type(value);
    switch (type) {
        case OBJECT:
            return value;
        case STRING:
        case NUMBER:
        case SYMBOL:
        case BOOLEAN:
            return ToObject(value);
    }
    return ObjectCreate();
};

setInternalSlot(ObjectConstructor, "Call", ObjectConstructor_call);
setInternalSlot(ObjectConstructor, "Construct", ObjectConstructor_construct);

var ObjectConstructor_seal = function (thisArg, argList) {
        var O;
        O = argList[0];
        if (Type(O) !== OBJECT) return withError("Type", "First argument is object");
        var status = SetIntegrityLevel(O, "sealed");
        if (isAbrupt(status = ifAbrupt(status))) return status;
        if (status === false) return withError("Type", "seal: can not seal object");
        return O;
};


var ObjectConstructor_freeze =function (thisArg, argList) {
    var O;
    O = argList[0];
    if (Type(O) !== OBJECT) return withError("Type", "First argument is object");
    var status = SetIntegrityLevel(O, "frozen");
    if (isAbrupt(status = ifAbrupt(status))) return status;
    if (status === false) return withError("Type", "freeze: can not freeze object");
    return O;
};

var ObjectConstructor_getOwnPropertyDescriptor = function (thisArg, argList) {
    var O = argList[0];
    var P = argList[1];
    var obj = ToObject(O);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    var key = ToPropertyKey(P);
    var desc = GetOwnProperty(obj, key);
    if (isAbrupt(desc = ifAbrupt(desc))) return desc;
    return FromPropertyDescriptor(desc);
};
var ObjectConstructor_getOwnPropertyNames = function (thisArg, argList) {
    var O = argList[0];
    return GetOwnPropertyKeys(O, "string");
};

var ObjectConstructor_getOwnPropertySymbols =     function (thisArg, argList) {
        var O = argList[0];
        return GetOwnPropertyKeys(O, "symbol");
};
var ObjectConstructor_getPrototypeOf = function (thisArg, argList) {
        var O = argList[0];
        var obj = ToObject(O);
        if (isAbrupt(obj = ifAbrupt(obj))) return obj;
        return GetPrototypeOf(obj);
};
var ObjectConstructor_is = function (thisArg, argList) {
        var value1 = argList[0];
        var value2 = argList[1];
        return SameValue(value1, value2);
};
var ObjectConstructor_isExtensible = function (thisArg, argList) {
        var O = argList[0];
        if (Type(O) !== OBJECT) return false;
        return IsExtensible(O);
};

var ObjectConstructor_isSealed = function (thisArg, argList) {
        var O = argList[0];
        if (Type(O) !== OBJECT) return true;
        return TestIntegrityLevel(O, "sealed");
};

var ObjectConstructor_isFrozen = function (thisArg, argList) {
        var O = argList[0];
        if (Type(O) !== OBJECT) return true;
        return TestIntegrityLevel(O, "frozen");
};


var ObjectConstructor_preventExtensions = function (thisArg, argList) {
    var O = argList[0];
    if (Type(O) !== OBJECT) return withError("Type", "argument is not an object");
    var status = PreventExtensions(O);
    if (isAbrupt(status = ifAbrupt(status))) return status;
    if (status === false) return withError("Type", "can not prevent extensions");
    return O;
};


var ObjectConstructor_keys = function (thisArg, argList) {
    var O = argList[0];
    var obj = ToObject(O);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    var keys = OwnPropertyKeys(O);
    if (isAbrupt(keys = ifAbrupt(keys))) return keys;

    var nameList = [];
    var gotAllNames = false;
    var next, nextKey, desc;
    while (!gotAllNames) {
        next = IteratorNext(keys);
        if (isAbrupt(next = ifAbrupt(next))) return next;
        nextKey = IteratorValue(next);
        if (isAbrupt(nextKey = ifAbrupt(nextKey))) return nextKey;
        if (Type(nextKey) === STRING) {
            desc = GetOwnProperty(O, nextKey);
            if (isAbrupt(desc = ifAbrupt(desc))) return desc;
            if (desc !== undefined && desc.enumerable === true) {
                nameList.push(nextKey);
            }
        }

        if (IteratorComplete(next)) gotAllNames = true;
    }
    return CreateArrayFromList(nameList);
};

var ObjectConstructor_mixin = function (thisArg, argList) {
    var target = argList[0];
    var source = argList[1];
    var to = ToObject(target);
    if (isAbrupt(to = ifAbrupt(to))) return to;
    var from = ToObject(source);
    if (isAbrupt(from = ifAbrupt(from))) return from;
    return MixinProperties(to, from);
};

//SetFunctionName(ObjectConstructor, "Object");
//SetFunctionLength(ObjectConstructor, 1);
LazyDefineBuiltinFunction(ObjectConstructor, "assign", 2, ObjectConstructor_assign);
LazyDefineBuiltinFunction(ObjectConstructor, "create", 0, ObjectConstructor_create);
LazyDefineBuiltinFunction(ObjectConstructor, "defineProperty", 0, ObjectConstructor_defineProperty);
LazyDefineBuiltinFunction(ObjectConstructor, "defineProperties", 0, ObjectConstructor_defineProperties);
LazyDefineBuiltinFunction(ObjectConstructor, "freeze", 1, ObjectConstructor_freeze);
LazyDefineBuiltinFunction(ObjectConstructor, "getOwnPropertyDescriptor", 2, ObjectConstructor_getOwnPropertyDescriptor);
LazyDefineBuiltinFunction(ObjectConstructor, "getOwnPropertyNames", 1, ObjectConstructor_getOwnPropertyNames);
LazyDefineBuiltinFunction(ObjectConstructor, "getOwnPropertySymbols", 1, ObjectConstructor_getOwnPropertySymbols);
LazyDefineBuiltinFunction(ObjectConstructor, "getPrototypeOf", 1, ObjectConstructor_getPrototypeOf);
LazyDefineBuiltinFunction(ObjectConstructor, "keys", 1, ObjectConstructor_keys);
LazyDefineBuiltinFunction(ObjectConstructor, "mixin", 2, ObjectConstructor_mixin);
LazyDefineBuiltinFunction(ObjectConstructor, "is", 1, ObjectConstructor_is);
LazyDefineBuiltinFunction(ObjectConstructor, "isExtensible", 1, ObjectConstructor_isExtensible);
LazyDefineBuiltinFunction(ObjectConstructor, "isSealed", 1, ObjectConstructor_isSealed);
LazyDefineBuiltinFunction(ObjectConstructor, "isFrozen", 1, ObjectConstructor_isFrozen);
LazyDefineBuiltinFunction(ObjectConstructor, "preventExtensions", 1, ObjectConstructor_preventExtensions);
LazyDefineBuiltinFunction(ObjectConstructor, "seal", 2, ObjectConstructor_seal);

function MixinProperties(target, source) {
    Assert(Type(target) === OBJECT);
    Assert(Type(source) === OBJECT);
    var keys = OwnPropertyKeys(source);
    if (isAbrupt(keys = ifAbrupt(keys))) return keys;
    var gotAllNames = false;
    var pendingException = undefined;
    var next, nextKey, desc, propValue, newFunc;
    var pendingException, getter, setter;
    while (!gotAllNames) {
        next = IteratorStep(next);
        if (isAbrupt(next = ifAbrupt(next))) return next;
        //    if ((=ifAbrupt()) && isAbrupt()) return ;
        if (!next) gotAllNames = true;
        else {
            nextKey = IteratorValue(next);
            if (isAbrupt(nextKey = ifAbrupt(nextKey))) return nextKey;
            var desc = GetOwnProperty(source, nextKey);
            if (isAbrupt(desc)) pendingException = desc;
            else if (desc !== undefined && desc.enumerable === true) {
                // possibly neccessary (if desc isnt fresh)
                // desc = assign({}, desc);
                if (IsDataDescriptor(desc)) {
                    propValue = desc.Value;
                    if (SameValue(GetSuperBinding(propValue), source)) {
                        newFunc = MixinProperties(RebindSuper(propValue, target), propValue);
                        if (isAbrupt(newFunc)) pendingException = newFunc;
                        else desc.Value = newFunc;
                    }
                } else {
                    getter = desc.get;
                    if (SameValue(GetSuperBinding(getter), source)) {
                        newFunc = MixinProperties(RebindSuper(propValue, target), getter);
                        if (isAbrupt(newFunc)) pendingException = newFunc;
                        else desc.get = newFunc;
                    }
                    setter = desc.set;
                    if (SameValue(GetSuperBinding(setter), source)) {
                        newFunc = MixinProperties(RebindSuper(propValue, target), setter);
                        if (isAbrupt(newFunc)) pendingException = newFunc;
                        else desc.set = newFunc;
                    }
                }
                var status = DefineOwnPropertyOrThrow(target, nextKey, desc);
                if (isAbrupt(status)) pendingException = status;
            }
        }
    }
    if (pendingException) return pendingException;
    return target;
}


/*
    What a mess for refactoring. 2 styles and both deprecated behind the next 
*/

var ObjectConstructor_getOwnPropertyDescriptors = function (thisArg, argList) {
    /*
	http://gist.github.com/WebReflection/9353781
	Object.getOwnPropertyDescriptors
    */
    var O = argList[0];
    var obj = ToObject(O);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    var keys = OwnPropertyKeys(obj);
    if (isAbrupt(keys = ifAbrupt(keys))) return keys;
    var descriptors = ObjectCreate(getIntrinsic("%ObjectPrototype%"));
    var gotAllNames = false;
    while (gotAllNames === false) {
	var next = IteratorStep(keys);
	if (isAbrupt(next=ifAbrupt(next))) return next;
	if (next === false) gotAllNames = true;
	else {
	    var nextKey = IteratorValue(next);
	    nextKey = ToPropertyKey(nextKey);
	    if (isAbrupt(nextKey=ifAbrupt(nextKey))) return nextKey;
	    var desc = callInternalSlot("GetOwnProperty", obj, nextKey);
	    if (isAbrupt(desc=ifAbrupt(desc))) return desc;
	    var descriptor = FromPropertyDescriptor(desc);
	    if (isAbrupt(descriptor=ifAbrupt(descriptor))) return descriptor;
	    var status = CreateDataProperty(descriptors, nextKey, descriptor);
	    // Assert(!isAbrupt(status));
	    if (isAbrupt(status)) return status; 
	}
    }
    return descriptors;
};	

LazyDefineBuiltinFunction(ObjectConstructor, "getOwnPropertyDescriptors", 1, ObjectConstructor_getOwnPropertyDescriptors);

// ===========================================================================================================
// ObjectPrototype
// ===========================================================================================================

MakeConstructor(ObjectConstructor, true, ObjectPrototype);
setInternalSlot(ObjectPrototype, "Prototype", null);

var ObjectPrototype_$$create = function (thisArg, argList) {
    var F = thisArg;
    var proto = GetPrototypeFromConstructor(F, "%ObjectPrototype%");
    if (isAbrupt(proto = ifAbrupt(proto))) return proto;
    return ObjectCreate(proto);
};

var ObjectPrototype_hasOwnProperty = function (thisArg, argList) {
    var P = ToPropertyKey(argList[0]);
    if (isAbrupt(P = ifAbrupt(P))) return P;
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    return HasOwnProperty(O, P);
};

var ObjectPrototype_isPrototypeOf = function (thisArg, argList) {
    var V = argList[0];
    if (Type(O) !== OBJECT) return false;
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    for (;;) {
        V = GetPrototypeOf(V);
        if (V == null) return false;
        if (SameValue(O, V)) return true;
    }

};


var ObjectPrototype_propertyIsEnumerable = function (thisArg, argList) {
    var V = argList[0];
    var P = ToString(V);
    if (isAbrupt(P = ifAbrupt(P))) return P;
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var desc = GetOwnProperty(O, P);
    if (desc === undefined) return false;
    return desc.enumerable;
};

var OneOfTheseTags = {
    __proto__: null,
    "Arguments": true,
    "Array": true,
    "Boolean": true,
    "Date": true,
    "Error": true,
    "Function": true,
    "JSON": true,
    "Math": true,
    "Number": true,
    "RegExp": true,
    "String": true
};

var builtinTagsByToString = {
    "[object ArrayExoticObject]": "Array",
    "[object ProxyExoticObject]": "Proxy",
    "[object ArgumentsExoticObject]": "Arguments",
    "[object OrdinaryFunction]": "Function",
    "[object StringExoticObject]": "String"
};


var ObjectPrototype_toString = function toString(thisArg, argList) {
    var i = 0;
    if (thisArg === undefined) return "[object Undefined]";
    if (thisArg === null) return "[object Null]";

    var O = ToObject(thisArg);
    var builtinTag, tag;

    var intrToStr = O.toString();

    if (builtinTag = builtinTagsByToString[intrToStr]) {}
    else if (hasInternalSlot(O, "SymbolData")) builtinTag = "Symbol";
    else if (hasInternalSlot(O, "StringData")) builtinTag = "String";
    else if (hasInternalSlot(O, "ErrorData")) builtinTag = "Error";
    else if (hasInternalSlot(O, "BooleanData")) builtinTag = "Boolean";
    else if (hasInternalSlot(O, "NumberData")) builtinTag = "Number";
    else if (hasInternalSlot(O, "DateValue")) builtinTag = "Date";
    else if (hasInternalSlot(O, "RegExpMatcher")) builtinTag = "RegExp";
    else if (hasInternalSlot(O, "MathTag")) builtinTag = "Math";
    else if (hasInternalSlot(O, "JSONTag")) builtinTag = "JSON";
    else builtinTag = "Object";

    var hasTag = HasProperty(O, $$toStringTag);
    if (isAbrupt(hasTag = ifAbrupt(hasTag))) return hasTag;
    if (!hasTag) tag = builtinTag;
    else {
        tag = Get(O, $$toStringTag);
        if (isAbrupt(tag)) tag = NormalCompletion("???");
        tag = unwrap(tag);
        if (Type(tag) !== STRING) tag = "???";
        if (OneOfTheseTags[tag] && (!SameValue(tag, builtinTag))) tag = "~" + tag;
    }
    return "[object " + tag + "]";
};

var ObjectPrototype_valueOf = function valueOf(thisArg, argList) {
    var O = ToObject(thisArg);
    return O;
};

// B.2.2.1  Object.prototype.__proto__

var ObjectPrototype_get_proto = function (thisArg, argList) {
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    return callInternalSlot("GetPrototypeOf", O);
};
var ObjectPrototype_set_proto = function (thisArg, argList) {
    var proto = argList[0];
    var O = CheckObjectCoercible(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var protoType = Type(proto);
    if (protoType !== OBJECT && protoType !== null) return proto;
    if (Type(O) !== OBJECT) return proto;
    var status = callInternalSlot("SetPrototypeOf", O, proto);
    if (isAbrupt(status = ifAbrupt(status))) return status;
    if (status === false) return withError("Type", "__proto__: SetPrototypeOf failed.");
    return proto;
};
var ObjectPrototype_proto_ = {
    __proto__:null,
    configurable: true,
    enumerable: false,
    get: CreateBuiltinFunction(realm, ObjectPrototype_get_proto, "get __proto__", 0),
    set: CreateBuiltinFunction(realm, ObjectPrototype_set_proto, "set __proto___", 0)
};
DefineOwnProperty(ObjectPrototype, "__proto__", ObjectPrototype_proto_);


LazyDefineBuiltinFunction(ObjectPrototype, $$create, 0, ObjectPrototype_$$create);
LazyDefineBuiltinFunction(ObjectPrototype, "hasOwnProperty", 0, ObjectPrototype_hasOwnProperty);
LazyDefineBuiltinFunction(ObjectPrototype, "isPrototypeOf", 0, ObjectPrototype_isPrototypeOf);
LazyDefineBuiltinFunction(ObjectPrototype, "propertyIsEnumerable", 0, ObjectPrototype_propertyIsEnumerable);
LazyDefineBuiltinFunction(ObjectPrototype, "toString", 0, ObjectPrototype_toString);
LazyDefineBuiltinFunction(ObjectPrototype, "valueOf", 0, ObjectPrototype_valueOf);
LazyDefineProperty(ObjectPrototype, $$toStringTag, "Object");
