function OrdinaryObject(prototype) {
    var O = Object.create(OrdinaryObject.prototype);
    prototype = prototype === undefined ? getIntrinsic(INTRINSICS.OBJECTPROTOTYPE) || null : prototype;
    setInternalSlot(O,SLOTS.BINDINGS, Object.create(null));
    setInternalSlot(O,SLOTS.SYMBOLS, Object.create(null));
    setInternalSlot(O,SLOTS.PROTOTYPE,prototype || null);
    setInternalSlot(O,SLOTS.EXTENSIBLE, true);
    return O;
}
OrdinaryObject.prototype = {
    constructor: OrdinaryObject,
    type: "object",
    toString: function () {
        return "[object OrdinaryObject]";
    },
    Get: function (P, R) {
        return OrdinaryObjectGet(this, P, R);
    },
    Set: function (P, V, R) {
        return Set(this, P, V, R);
    },
    Invoke: function (P, A, R) {
        return OrdinaryObjectInvoke(this, P, A, R);
    },
    Delete: function (P) {
        return Delete(this, P);
    },
    DefineOwnProperty: function (P, D) {
        return DefineOwnProperty(this, P, D);
    },
    GetOwnProperty: function (P) {
        return GetOwnProperty(this, P);
    },
    OwnPropertyKeys: function () {
        return OwnPropertyKeys(this);
    },
    Enumerate: function () {
        return Enumerate(this);
    },
    HasProperty: function (P) {
        return HasProperty(this, P);
    },
    HasOwnProperty: function (P) {
        if (IsPropertyKey(P)) {
            //P = unwrap(P);
            if (IsSymbol(P)) {
                if (this.Symbols[P.es5id] !== undefined) return true;
            } else {
                P = ToString(P);
                if (this.Bindings[P]) return true;
            }
        }
        return false;
    },
    GetPrototypeOf: function () {
        // return GetPrototypeOf(this);
        return this.Prototype;
    },
    SetPrototypeOf: function (P) {
        //    return SetPrototypeOf(this, P);
        this.Prototype = unwrap(P);
    },
    IsExtensible: function () {
        return IsExtensible(this);
    },
    PreventExtensions: function () {
        return PreventExtensions(this);
    }
};
function ObjectCreate(proto, internalDataList) {
    if (proto === undefined) proto = Get(getIntrinsics(), INTRINSICS.OBJECTPROTOTYPE);

    var O = OrdinaryObject(proto);
    /*
        new
     */
    if (internalDataList && Array.isArray(internalDataList)) {
        for (var i = 0, j = internalDataList.length; i < j; i++) {
            O[internalDataList[i]] = undefined;
        }
    }
    /*
        legacy
     */
    else if (internalDataList && typeof internalDataList === "object") {
        for (var k in internalDataList) {
            if (objectHasOwnProperty(internalDataList, k)) {
                O[k] = internalDataList[k];
            }
        }
    }
    return O;
}
function ObjectDefineProperty(O, P, Desc) {
    if (IsDataDescriptor(Desc)) {
        callInternalSlot(SLOTS.DEFINEOWNPROPERTY, O,P, Desc);
    } else if (IsAccessorDescriptor(Desc)) {
        callInternalSlot(SLOTS.DEFINEOWNPROPERTY, O,P, Desc);
    }
    return O;
}
function ObjectDefineProperties(O, Properties) {
    var pendingException;
    if (Type(O) !== OBJECT) return newTypeError( "first argument is not an object");
    var props = ToObject(Properties);
    var names = OwnPropertyKeysAsList(props);
    var P, descriptors = [];
    var descObj, desc;
    for (P in names) {
        descObj = Get(props, names[P]);
        if (isAbrupt(descObj = ifAbrupt(descObj))) return descObj;
        desc = ToPropertyDescriptor(descObj);
        if (isAbrupt(desc = ifAbrupt(desc))) return desc;
        descriptors.push({
            P: names[P],
            desc: desc
        });
    }
    var pair, status;
    for (var i in descriptors) {
        pair = descriptors[i];
        P = pair.P;
        desc = pair.desc;
        status = DefineOwnPropertyOrThrow(O, P, desc);
        if (isAbrupt(status)) pendingException = status;
    }
    if (isAbrupt(pendingException)) return pendingException;
    return O;
}
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
    if (Type(O) !== OBJECT && Type(O) !== NULL) return newTypeError( "create: argument is not an object or null");
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
    if (Type(O) !== OBJECT) return newTypeError( "defineProperty: argument 1 is not an object");
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
var ObjectConstructor_seal = function (thisArg, argList) {
    var O;
    O = argList[0];
    if (Type(O) !== OBJECT) return newTypeError( "First argument is object");
    var status = SetIntegrityLevel(O, "sealed");
    if (isAbrupt(status = ifAbrupt(status))) return status;
    if (status === false) return newTypeError( "seal: can not seal object");
    return O;
};
var ObjectConstructor_freeze =function (thisArg, argList) {
    var O;
    O = argList[0];
    if (Type(O) !== OBJECT) return newTypeError( "First argument is object");
    var status = SetIntegrityLevel(O, "frozen");
    if (isAbrupt(status = ifAbrupt(status))) return status;
    if (status === false) return newTypeError( "freeze: can not freeze object");
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
var ObjectConstructor_getOwnPropertySymbols = function (thisArg, argList) {
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
    if (Type(O) !== OBJECT) return newTypeError( "argument is not an object");
    var status = PreventExtensions(O);
    if (isAbrupt(status = ifAbrupt(status))) return status;
    if (status === false) return newTypeError( "can not prevent extensions");
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
    var descriptors = ObjectCreate(getIntrinsic(INTRINSICS.OBJECTPROTOTYPE));
    var gotAllNames = false;
    while (gotAllNames === false) {
        var next = IteratorStep(keys);
        if (isAbrupt(next=ifAbrupt(next))) return next;
        if (next === false) gotAllNames = true;
        else {
            var nextKey = IteratorValue(next);
            nextKey = ToPropertyKey(nextKey);
            if (isAbrupt(nextKey=ifAbrupt(nextKey))) return nextKey;
            var desc = callInternalSlot(SLOTS.GETOWNPROPERTY, obj, nextKey);
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
    if (builtinTagsByToString[intrToStr]) {
	builtinTag = builtinTagsByToString[intrToStr]
    } else if (hasInternalSlot(O, SLOTS.SYMBOLDATA)) builtinTag = "Symbol";
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