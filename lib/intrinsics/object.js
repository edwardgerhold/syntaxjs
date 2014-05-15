
LazyDefineBuiltinFunction(ObjectConstructor, "getOwnPropertyDescriptors", 1, ObjectConstructor_getOwnPropertyDescriptors);

// ===========================================================================================================
// ObjectPrototype
// ===========================================================================================================

MakeConstructor(ObjectConstructor, true, ObjectPrototype);
setInternalSlot(ObjectPrototype, SLOTS.PROTOTYPE, null);

var ObjectPrototype_$$create = function (thisArg, argList) {
    var F = thisArg;
    var proto = GetPrototypeFromConstructor(F, INTRINSICS.OBJECTPROTOTYPE);
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
    else if (hasInternalSlot(O, SLOTS.SYMBOLDATA)) builtinTag = "Symbol";
    else if (hasInternalSlot(O, SLOTS.STRINGDATA)) builtinTag = "String";
    else if (hasInternalSlot(O, SLOTS.ERRORDATA)) builtinTag = "Error";
    else if (hasInternalSlot(O, SLOTS.BOOLEANDATA)) builtinTag = "Boolean";
    else if (hasInternalSlot(O, SLOTS.NUMBERDATA)) builtinTag = "Number";
    else if (hasInternalSlot(O, SLOTS.DATEVALUE)) builtinTag = "Date";
    else if (hasInternalSlot(O, SLOTS.REGEXPMATCHER)) builtinTag = "RegExp";
    else if (hasInternalSlot(O, SLOTS.MATHTAG)) builtinTag = "Math";
    else if (hasInternalSlot(O, SLOTS.JSONTAG)) builtinTag = "JSON";
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
    return callInternalSlot(SLOTS.GETPROTOTYPEOF, O);
};
var ObjectPrototype_set_proto = function (thisArg, argList) {
    var proto = argList[0];
    var O = CheckObjectCoercible(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var protoType = Type(proto);
    if (protoType !== OBJECT && protoType !== null) return proto;
    if (Type(O) !== OBJECT) return proto;
    var status = callInternalSlot(SLOTS.SETPROTOTYPEOF, O, proto);
    if (isAbrupt(status = ifAbrupt(status))) return status;
    if (status === false) return newTypeError( "__proto__: SetPrototypeOf failed.");
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

setInternalSlot(ObjectConstructor, SLOTS.CALL, ObjectConstructor_call);
setInternalSlot(ObjectConstructor, SLOTS.CONSTRUCT, ObjectConstructor_construct);

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

LazyDefineBuiltinFunction(ObjectPrototype, $$create, 0, ObjectPrototype_$$create);
LazyDefineBuiltinFunction(ObjectPrototype, "hasOwnProperty", 0, ObjectPrototype_hasOwnProperty);
LazyDefineBuiltinFunction(ObjectPrototype, "isPrototypeOf", 0, ObjectPrototype_isPrototypeOf);
LazyDefineBuiltinFunction(ObjectPrototype, "propertyIsEnumerable", 0, ObjectPrototype_propertyIsEnumerable);
LazyDefineBuiltinFunction(ObjectPrototype, "toString", 0, ObjectPrototype_toString);
LazyDefineBuiltinFunction(ObjectPrototype, "valueOf", 0, ObjectPrototype_valueOf);
LazyDefineProperty(ObjectPrototype, $$toStringTag, "Object");
