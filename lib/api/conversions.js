


    // Results of Type(X) now constants

var OBJECT = 1, // "object"
    NUMBER = 2, // "number"
    STRING = 3, // "string",
    SYMBOL = 4, // "symbol",
    BOOLEAN = 5, // "boolean",
    REFERENCE = 6, // "reference",
    ENVIRONMENT = 7, // "environment",
    COMPLETION = 8, //"completion",
    UNDEFINED = 9, // "undefined",
    NULL = 10; // "null";

var object_tostring_to_type_table = {
    __proto__: null,
    "[object SymbolPrimitiveType]": SYMBOL,
    "[object Reference]": REFERENCE,
    "[object CompletionRecord]": COMPLETION,
    "[object GlobalEnvironment]": ENVIRONMENT,
    "[object GlobalVariableEnvironment]": ENVIRONMENT,
    "[object GlobalLexicalEnvironment]": ENVIRONMENT,
    "[object ObjectEnvironment]": ENVIRONMENT,
    "[object FunctionEnvironment]": ENVIRONMENT,
    "[object DeclarativeEnvironment]": ENVIRONMENT,
    "[object OrdinaryObject]": OBJECT,
    "[object OrdinaryFunction]": OBJECT,
    "[object ProxyExoticObject]": OBJECT,
    "[object PromiseExoticObject]": OBJECT,
    "[object IntegerIndexedExoticObject]": OBJECT,
    "[object StringExoticObject]": OBJECT,
    "[object ArrayExoticObject]": OBJECT,
    "[object ArgumentsExoticObject]": OBJECT,
    "[object TypeDescriptorExoticObject]": OBJECT,
    "[object TypeExoticObject]": OBJECT
};
var primitive_type_string_table = {
    __proto__:null,
    "[object SymbolPrimitiveType]": "symbol",
    "number": "number",
    "string": "string",
    "boolean": "boolean",
    "undefined": "undefined"
};

function Type(O) {
    var type = typeof O;
    if (type === "object") {
        if (O === null) return NULL;
        if (O instanceof CompletionRecord) return Type(O.value);
        return object_tostring_to_type_table[O.toString && O.toString()] || OBJECT;
    }
    switch(type) {
        case "number":
            return NUMBER;
        case "boolean":
            return BOOLEAN;
        case "string":
            return STRING;
        case "symbol":
            return SYMBOL;
        case "undefined":
            return UNDEFINED;
    }
}

var EnvironmentType = {
  "[object ObjectEnvironment]":true,
  "[object DeclarativeEnvironment]": true,
  "[object FunctionEnvironment]": true,
  "[object GlobalLexicalEnvironment]": true,
  "[object GlobalVariableEnvironment]":true,
  "[object GlobalEnvironment]": true
};
function ToPrimitive(V, prefType) {
    var type = typeof V;
    if (V === null) return V;
    if (V === undefined) return V;
    if (type === "object") {

        var s = V.toString();
        if (s === "[object CompletionRecord]") {
            return ToPrimitive(V.value, prefType);
        }
        /* else if (s === "[object OrdinaryObject]") {*/
        else if (hasInternalSlot(V, SLOTS.NUMBERDATA)) return thisNumberValue(V);
        else if (hasInternalSlot(V, SLOTS.STRINGDATA)) return thisStringValue(V);
        else if (hasInternalSlot(V, SLOTS.BOOLEANDATA)) return thisBooleanValue(V);
        else if (hasInternalSlot(V, SLOTS.SYMBOLDATA)) return thisSymbolValue(V);
        else if (s === "[object SymbolPrimitiveType]") {
            return V;
        } else if (EnvironmentType[s]) {
            throw "Can not convert an environment to a primitive";
        }
        var v = V.valueOf();
        if (v === false) return false;
        if (v === true) return true;
        if (typeof v === "string") return v;
        if (typeof v === "number") return v;
    } else {
        if (type === "boolean") return !!V;
        if (type === "string") return "" + V;
        if (type === "number") return +V;
    }
    if (Type(V) === SYMBOL) return V;
    var hint;
    var exoticToPrim;
    if (!prefType) hint = "default";
    if (prefType === "string") hint = "string";
    if (prefType === "number") hint = "number";
    exoticToPrim = Get(V, $$toPrimitive);
    if (isAbrupt(exoticToPrim = ifAbrupt(exoticToPrim))) return exoticToPrim;
    var result;
    if (exoticToPrim !== undefined) {
        if (!IsCallable(exoticToPrim)) return newTypeError( "exotic ToPrimitive of object is not a function");
        result = exoticToPrim.Call(V, [hint]);
        if (isAbrupt(result = ifAbrupt(result))) return result;
        if (result !== undefined && Type(result) !== OBJECT) return result;
        else return newTypeError( "Can not convert the object to a primitive with exotic ToPrimitive")
    }
    if (hint === "default") hint = "number";
    return OrdinaryToPrimitive(V, hint);
}

function OrdinaryToPrimitive(O, hint) {
    Assert(Type(O) === OBJECT, "o must be an object");
    Assert(Type(hint) === STRING && (hint === "string" || hint === "number"), "hint must be a string equal to the letters string or number");
    var tryFirst;
    var trySecond;
    var list = (hint === "string") ? ["toString", "valueOf"] : ["valueOf", "toString"];
    var func, result;
    for (var i = 0; i < 2; i++) {
        func = Get(O, list[i]);
        if (isAbrupt(func = ifAbrupt(func))) return func;
        if (IsCallable(func)) {
            result = func.Call(O, []);
            if (isAbrupt(result = ifAbrupt(result))) return result;
            if (result !== undefined && Type(result) !== OBJECT) return result;
            else return newTypeError( "Can not convert the object to a primitive with OrdinaryToPrimitive by calling " + list[i]);
        }
    }
    return newTypeError( "Can not convert object to primitive with OrdinaryToPrimitive (end)");
}
var ReturnZero = {
    "NaN": true,
    "Infinity": true,
    "-Infinity": true,
    "0": true
};
var ReturnNaN = {
    "NaN": true
};
var ReturnNum = {
    "Infinity": true,
    "-Infinity": true,
    "0": true
};

var toInt8View = new Int8Array(1);
var toUint8View = new Uint8Array(1);
var toUint8ClampView = new Uint8ClampedArray(1);

/*
    soon i know how to cast better ;-)
*/

function ToInt8(V) {
    var view = new Int8Array(1);
    return toInt8View[0] = V;
}
function ToUint8(V) {
    return toUint8View[0] = V;
}
function ToUint8Clamp(V) {
    return toUint8ClampView[0] = V;
}
function ToUint16(V) {
    var number = ToNumber(V);
    if (isAbrupt(number = ifAbrupt(number))) return number;
    if (ReturnZero[number]) return +0;
    var int = sign(number) * floor(abs(number));
    var int16bit = int % (Math.pow(2, 16));
    return int16Bit;
}
function ToInt32(V) {
    var number = ToNumber(V);
    if (isAbrupt(number = ifAbrupt(number))) return number;
    if (ReturnZero[number]) return +0;
    var int = sign(number) * floor(abs(number));
    var int32bit = int % (Math.pow(2, 32));
    if (int >= (Math.pow(2, 31))) return int32bit - (Math.pow(2, 32));
    return int32bit;
}
function ToUint32(V) {
    var number = ToNumber(V);
    if (isAbrupt(number = ifAbrupt(number))) return number;
    if (ReturnZero[number]) return +0;
    return number >>> 0;
    //var int = sign(number) * floor(abs(number));
    //var int32bit = int % (Math.pow(2, 32));
    //return int32bit;
}
function ToInteger(V) {
    var number = ToNumber(V);
    if (isAbrupt(number = ifAbrupt(number))) return number;
    if (ReturnNaN[number]) return +0;
    if (ReturnNum[number]) return number;
    // return sign(number) * floor(abs(number));
    return number|0;
}
function ToLength(V) {
    var len = ToInteger(V);
    if (isAbrupt(len = ifAbrupt(len))) return len;
    if (len <= 0) return Completion("normal", 0, "");
    return Completion("normal", min(len, (Math.pow(2, 53)) - 1), "");
}
function ToBoolean(V) {
    var type = Type(V);
    if (V instanceof CompletionRecord) return ToBoolean(V.value);
    if (V === undefined) return false;
    if (V === null) return false;
    if (type === BOOLEAN) V = thisBooleanValue(V);
    if (typeof V === "boolean") {
        return V;
    }
    if (type === NUMBER) V = thisNumberValue(V);
    if (typeof V === "number") {
        return !(V === +0 || V === -0 || V !== V);
    }

    if (type === STRING) V = thisStringValue(V);
    if (typeof V === "string") {
        return !(V === "" || V.length === 0);

    }
    if (V instanceof SymbolPrimitiveType) return true;
    return Type(V) === OBJECT;
}
function ToNumber(V) {
    var T;
    if (isAbrupt(V)) return V;
    if (V instanceof CompletionRecord) return ToNumber(V.value);
    if (V === undefined) return NaN;
    if (V === null) return +0;
    if (V === true) return 1;
    if (V === false) return 0;
    if ((T = Type(V)) === NUMBER) return V;
    if (T === STRING) return +V;
    if (T === STRING) {
        var primVal = ToPrimitive(V, "number");
        return ToNumber(primVal);
    }
    return +V;
}
function ToString(V) {
    var t;
    var n, k, s;
    if (V instanceof CompletionRecord) return ToString(V.value);
    if (V === null) return "null";
    if (V === false) return "false";
    if (V === true) return "true";
    if (V !== V) return "NaN";
    if ((t = Type(V)) === NUMBER || typeof v === "number") {
        if (V == 0) return "0";
        if (V < 0) return "-" + ToString(-V);
        if (V === Infinity) return "Infinity";
        return "" + V;
    }
    if (t === SYMBOL) {
        return newTypeError( "Can not convert symbol to string");
    }
    if (t === OBJECT) {
        if (hasInternalSlot(V, SLOTS.SYMBOLDATA)) return newTypeError( "Can not convert symbol to string");
        var primVal = ToPrimitive(V, "string");
        return ToString(primVal);
    }
    return "" + V;
}

function ToObject(V) {
    if (isAbrupt(V)) return V;
    if (V instanceof CompletionRecord) return ToObject(V.value);
    if (V === undefined) return newTypeError( "ToObject: can not convert undefined to object");
    if (V === null) return newTypeError( "ToObject: can not convert null to object");
    if (Type(V) === OBJECT) return V;
    if (V instanceof SymbolPrimitiveType) {
        var s = SymbolPrimitiveType();
        setInternalSlot(s, SLOTS.PROTOTYPE, getIntrinsic(INTRINSICS.SYMBOLPROTOTYPE));
        setInternalSlot(s, SLOTS.SYMBOLDATA, V);
        return s;
    }
    if (typeof V === "number") {
        return OrdinaryConstruct(getIntrinsic("%Number%"), [V]);
    }
    if (typeof V === "string") {
        return OrdinaryConstruct(getIntrinsic("%String%"), [V]);
    }
    if (typeof V === "boolean") {
        return OrdinaryConstruct(getIntrinsic("%Boolean%"), [V]);
    }
    // return V;
}
function CheckObjectCoercible(argument) {

    if (argument instanceof CompletionRecord) return CheckObjectCoercible(argument.value);
    else if (argument === undefined) return newTypeError(format("UNDEFINED_NOT_COERCIBLE"));

    else if (argument === null) return newTypeError(format("NULL_NOT_COERCIBLE"));

    var type = Type(argument);
    switch (type) {
        case BOOLEAN:
        case NUMBER:
        case STRING:
        case SYMBOL:
        case OBJECT:
            return argument;
            break;
        default:
            break;
    }
    return argument;
}

// 7.4.2014
function CanonicalNumericString (argument) {
    Assert(Type(argument) === STRING, "CanonicalNumericString: argument has to be a string");
    var n = ToNumber(argument);
    if (n === -0) return +0;
    if (SameValue(ToString(n), argument) === false) return undefined;
    return n;
}