// ===========================================================================================================
// Personal DOM Wrapper (wrap native js into this big bullshit)
// ===========================================================================================================

function ExoticDOMObjectWrapper(object) {
    var O = Object.create(ExoticDOMObjectWrapper.prototype);

    setInternalSlot(O, "Target", object);
    setInternalSlot(O, "Symbols", Object.create(null));
    setInternalSlot(O, "Prototype", getIntrinsic("%ObjectPrototype%"));
    setInternalSlot(O, "Extensible", true);
    return O;
}
ExoticDOMObjectWrapper.prototype = {
    constructor: ExoticDOMObjectWrapper,
    type: "object",
    toString: function () {
        return "[object EddiesDOMObjectWrapper]";
    },
    Get: function (P) {
        var o = this.Target;
        var p = o[P];
        if (typeof p === "object" && p) {
            return ExoticDOMObjectWrapper(p);
        } else if (typeof p === "function") {
            return ExoticDOMFunctionWrapper(p, o);
        }
        return p;
    },
    Set: function (P, V, R) {
        var o = this.Target;
        return o[P] = V;
    },
    Invoke: function (P, argList, Rcv) {
        var f = this.Target;
        var o = this.Target;

        if ((f = this.Get(P)) && (typeof f === "function")) {
            var result = f.apply(o, argList);
            if (typeof result === "object" && result) {
                result = ExoticDOMObjectWrapper(result);
            } else if (typeof result === "function") {
                result = ExoticDOMFunctionWrapper(result, o);
            }
            return result;
        } else if (IsCallable(f)) {
            callInternalSlot("Call", f, o, argList);
        }
    },
    Delete: function (P) {
        var o = this.Target;
        return (delete o[P]);
    },
    DefineOwnProperty: function (P, D) {
        return Object.defineProperty(this.Target, P, D);
    },
    GetOwnProperty: function (P) {
        return Object.getOwnPropertyDescriptor(this.Target, P);
    },
    HasProperty: function (P) {
        return !!(P in this.Target);
    },
    HasOwnProperty: function (P) {
        var o = this.Target;
        return Object.hasOwnProperty.call(o, P);
    },
    GetPrototypeOf: function () {
        var o = this.Target;
        return Object.getPrototypeOf(o);
    },
    SetPrototypeOf: function (P) {
        var o = this.Target;
        return (o.__proto__ = P);
    },
    IsExtensible: function () {
        var o = this.Target;
        return Object.isExtensible(o);
    },
};

function ExoticDOMFunctionWrapper(func, that) {
    var F = Object.create(ExoticDOMFunctionWrapper.prototype);
    setInternalSlot(F, "NativeThat", that);
    setInternalSlot(F, "Symbols", Object.create(null));
    setInternalSlot(F, "Prototype", getIntrinsic("%FunctionPrototype%"));
    setInternalSlot(F, "Extensible", true);
    return F;
}
ExoticDOMFunctionWrapper.prototype = assign(ExoticDOMFunctionWrapper.prototype, ExoticDOMObjectWrapper.prototype);

ExoticDOMFunctionWrapper.prototype = {
    constructor: ExoticDOMFunctionWrapper,
    toString: function () {
        return "[object EddiesDOMFunctionWrapper]";
    },
    Call: function (thisArg, argList) {
        var f = this.Target;
        var that = this.NativeThat;
        var result = f.apply(that, argList);
        if (typeof result === "object" && result) {
            result = ExoticDOMObjectWrapper(result);
        } else if (typeof result === "function") {
            result = ExoticDOMFunctionWrapper(result, that);
        }
        return result;
    }
};

// ===========================================================================================================
// Symbol PrimitiveType / Exotic Object
// ===========================================================================================================

var es5id = Math.floor(Math.random() * (1 << 16));

function SymbolPrimitiveType(id, desc) {
    var O = Object.create(SymbolPrimitiveType.prototype);
    setInternalSlot(O, "Description", desc);
    setInternalSlot(O, "Bindings", Object.create(null));
    setInternalSlot(O, "Symbols", Object.create(null));
    setInternalSlot(O, "Prototype", null);
    setInternalSlot(O, "Extensible", false);
    setInternalSlot(O, "Integrity", "frozen");
    setInternalSlot(O, "es5id", id || (++es5id + Math.random()));
    //setInternalSlot(O, "Private", false);
    return O;
}

SymbolPrimitiveType.prototype = {
    constructor: SymbolPrimitiveType,
    type: "symbol",
    GetPrototypeOf: function () {
        return false;
    },
    SetPrototypeOf: function (P) {
        return false;
    },
    Get: function (P) {
        return false;
    },
    Set: function (P, V) {
        return false;
    },
    Invoke: function (P, Rcv) {
        return false;
    },
    Delete: function (P) {
        return false;
    },
    DefineOwnProperty: function (P, D) {
        return false;
    },
    GetOwnProperty: function (P) {
        return false;
    },
    HasProperty: function (P) {
        return false;
    },
    HasOwnProperty: function (P) {
        return false;
    },
    IsExtensible: function () {
        return false;
    },
    toString: function () {
        return "[object SymbolPrimitiveType]";
    }
};

// ===========================================================================================================
// A Definition of all Standard Builtin Objects (one per Realm is per contract)
// ===========================================================================================================


// ===========================================================================================================
// String Exotic Object
// ===========================================================================================================

function StringExoticObject() {
    var S = Object.create(StringExoticObject.prototype);
    setInternalSlot(S, "Bindings", Object.create(null));
    setInternalSlot(S, "Symbols", Object.create(null));
    setInternalSlot(S, "Extensible", true);
    return S;
}

StringExoticObject.prototype = assign(StringExoticObject.prototype, {
    HasOwnProperty: function (P) {
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        var has = HasOwnProperty(O, P);
        if (isAbrupt(has = ifAbrupt(has))) return has;
        if (has) return has;
        if (Type(P) !== "string") return false;
        var index = ToInteger(P);
        if (isAbrupt(index = ifAbrupt(index))) return index;
        var absIndex = ToString(abs(index));
        if (SameValue(absIndex, P) === false) return false;
        var str = this.StringData;
        var len = str.length;
        if (len <= index) return false;
        return true;
    },
    GetOwnProperty: function (P) {
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        var desc = OrdinaryGetOwnProperty(this, P);
        if (isAbrupt(desc = ifAbrupt(desc))) return desc;
        if (desc !== undefined) return desc;
        if (Type(P) !== "string") return undefined;
        var index = ToInteger(P);
        if (isAbrupt(index = ifAbrupt(index))) return index;
        var absIndex = ToString(abs(index));
        if (SameValue(absIndex, P) === false) return undefined;
        var str = getInternalSlot(this, "StringData");
        var len = str.length;
        if (len <= index) return undefined;
        var resultStr = str[index];
        return {
            value: resultStr,
            enumerable: true,
            writable: false,
            configurable: false
        };
    },
    DefineOwnProperty: function (P, D) {
        var O = this;
        var current = callInternalSlot("GetOwnProperty", O, P);
        var extensible = IsExtensible(this);
        return ValidateAndApplyPropertyDescriptor(O, P, extensible, D, current);
    },
    Enumerate: function () {
        return Enumerate(this);
    },
    OwnPropertyKeys: function () {
        return OwnPropertyKeys(this);
    },
    toString: function () {
        return "[object StringExoticObject]";
    },
    type: "object"
});
addMissingProperties(StringExoticObject.prototype, OrdinaryObject.prototype);

// ===========================================================================================================
// ArrayBuffer
// ===========================================================================================================

function CreateByteArrayBlock(bytes) {
    return new ArrayBuffer(bytes); //spaeter alloziere auf eigenem heap
}

function SetArrayBufferData(arrayBuffer, bytes) {
    Assert(hasInternalSlot(arrayBuffer, "ArrayBufferData"), "[[ArrayBufferData]] has to exist");
    Assert(bytes > 0, "bytes must be a positive integer");

    var block = CreateByteArrayBlock(bytes); // hehe
    setInternalSlot(arrayBuffer, "ArrayBufferData", block);
    setInternalSlot(arrayBuffer, "ArrayBufferByteLength", bytes);
    return arrayBuffer;
}

function AllocateArrayBuffer(F) {
    var obj = OrdinaryCreateFromConstructor(F, "%ArrayBufferPrototype%", {
        "ArrayBufferData": undefined,
        "ArrayBufferByteLength": undefined
    });
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    setInternalSlot(obj, "ArrayBufferByteLength", 0);
    return obj;
}

// ===========================================================================================================
// Integer Indexed Exotic Object
// ===========================================================================================================

function IntegerIndexedExoticObject() {
    var O = Object.create(IntegerIndexedExoticObject.prototype);
    setInternalSlot(O, "ArrayBufferData", undefined);
    return O;
}
IntegerIndexedExoticObject.prototype = assign(IntegerIndexedExoticObject.prototype, {
    DefineOwnProperty: function (P, Desc) {
        var O = this;
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        Assert(O.ArrayBufferData !== undefined, "arraybufferdata must not be undefined");
        if (Type(P) === "string") {
            var intIndex = ToInteger(P);
            if (isAbrupt(intIndex = ifAbrupt(intIndex))) return intIndex;
            if (SameValue(ToString(intIndex), P)) {
                if (intIndex < 0) return false;
                var len = O.ArrayLength;
                if (len === undefined) return withError("Type", "integerindexed: length is undefined");
                if (intIndex >= len) return false;
                if (IsAccessorDescriptor(Desc)) return false;
                if (Desc.configurable) return false;
                if (Desc.enumerable === false) return false;
                var writable = true; // oder nicht... korrigiere hier
                var makeReadOnly = false;
                if (Desc.writable !== undefined) {
                    if (Desc.writable && !writable) return false;
                    if (!Desc.writable && writable) makeReadOnly = true;
                }
                if (Desc.value !== undefined) {
                    if (!writable) {
                        var oldValue = IntegerIndexedElementGet(O, intIndex);
                        if (isAbrupt(oldValue = ifAbrupt(oldValue))) return oldValue;
                        if (value === undefined) return false;
                        if (!SameValue(value, oldValue)) return false;
                    }
                }
                var status = IntegerIndexedElementSet(O, intIndex, value);
                if (isAbrupt(status = ifAbrupt(status))) return status;
                if (makeReadOnly) {
                    // mark as non-writable
                }
                return true;
            }
        }
        // ordinarygetownproperty im draft, maybe fehler
        return OrdinaryDefineOwnProperty(O, P);
    },
    Get: function (P, R) {
        var O = this;
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        if ((Type(P) === "string") && SameValue(O, R)) {
            var intIndex = ToInteger(P);
            if (isAbrupt(intIndex = ifAbrupt(intIndex))) return intIndex;
            if (SameValue(ToString(intIndex), P)) return IntegerIndexedElementGet(O, intIndex);
        }
        return Get(O, P, R);
    },
    Set: function (P, V, R) {
        var O = this;
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        if ((Type(P) === "string") && SameValue(O, R)) {
            var intIndex = ToInteger(P);
            if (isAbrupt(intIndex = ifAbrupt(intIndex))) return intIndex;
            if (SameValue(ToString(intIndex), P)) return ToBoolean(IntegerIndexedElementSet(O, intIndex, V));
        }
        return Set(O, P, V, R);

    },
    GetOwnProperty: function (P) {
        var O = this;
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        Assert(O.ArrayBufferData !== undefined, "arraybufferdata must not be undefined");
        if (Type(P) === "string") {
            var intIndex = ToInteger(P);
            if (isAbrupt(intIndex = ifAbrupt(intIndex))) return intIndex;
            if (SameValue(ToString(intIndex), P)) {
                var value = IntegerIndexedElementGet(O, intIndex);
                if (isAbrupt(value = ifAbrupt(value))) return value;
                if (value === undefined) return undefined;
                var writable = true;
                // setze falsch, falls sie es nciht sind, die props vom integerindexed
                return {
                    value: value,
                    enumerable: true,
                    writable: writable,
                    configurable: false
                };
            }
        }
        return OrdinaryGetOwnProperty(O, P);
    },
    HasOwnProperty: function (P) {
        var O = this;
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        Assert(O.ArrayBufferData !== undefined, "arraybufferdata must not be undefined");
        if (Type(P) === "string") {
            var intIndex = ToInteger(P);
            if (isAbrupt(intIndex = ifAbrupt(intIndex))) return intIndex;
            if (SameValue(ToString(intIndex), P)) {
                if (intIndex < 0) return false;
                var len = O.ArrayLength;
                if (len === undefined) return withError("Type", "integerindexed: length is undefined");
                if (intIndex >= len) return false;
            }
        }
        return HasOwnProperty(O, P);
    },
    Enumerate: function () {
        return Enumerate(this);
    },
    OwnPropertyKeys: function () {
        return OwnPropertyKeys(this);
    },
    constructor: IntegerIndexedExoticObject,
    toString: function () {
        return "[object IntegerIndexedExoticObject]";
    },
    type: "object"
});
addMissingProperties(IntegerIndexedExoticObject.prototype, OrdinaryObject.prototype);

function IntegerIndexedElementGet(O, index) {
    Assert(Type(index) === "number", "index type has to be number");
    Assert(index === ToInteger(index), "index has to be tointeger of index");
    var buffer = getInternalSlot(O, "ViewedArrayBuffer");
    var length = getInternalSlot(O, "ArrayLength");
    if (index < 0 || index >= length) return undefined;
    var offset = O.ByteOffset;
    var arrayTypeName = O.TypedArrayName;
    var elementSize = ToNumber(TypedArrayElementSize[arrayTypeName]);
    var indexedPosition = (index * elementSize) + offset;
    var elementType = TypedArrayElementType[arrayTypeName];
    return GetValueFromBuffer(buffer, indexedPosition, elementType);
}

function IntegerIndexedElementSet(O, index, value) {
    Assert(Type(index) === "number", "index type has to be number");
    Assert(index === ToInteger(index), "index has to be tointeger of index");
    var O = ToObject(ThisResolution());
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var buffer = getInternalSlot(O, "ViewedArrayBuffer");
    if (!buffer) return withError("Type", "object is not a viewed array buffer");
    var length = getInternalSlot(O, "ArrayLength");
    var numValue = ToNumber(value);
    if (isAbrupt(numValue = ifAbrupt(numValue))) return numValue;
    if (index < 0 || index >= length) return numValue;
    var offset = O.ByteOffset;
    var arrayTypeName = O.TypedArrayName;
    var elementSize = ToNumber(TypedArrayElementSize[arrayTypeName]);
    var indexedPosition = (index * elementSize) + offset;
    var elementType = TypedArrayElementType[arrayTypeName];
    var status = SetValueInBuffer(buffer, indexedPosition, elementType, numValue);
    if (isAbrupt(status = ifAbrupt(status))) return status;
    return numValue;
}

var TypedArrayElementSize = {
    "Float64Array": 8,
    "Float32Array": 4,
    "Int32Array": 4,
    "Uint32Array": 4,
    "Int16Array": 2,
    "Uint16Array": 2,
    "Int8Array": 1,
    "Uint8Array": 1,
    "Uint8ClampedArray": 1
};

var TypedArrayElementType = {
    "Float64Array": "Float64",
    "Float32Array": "Float32",
    "Int32Array": "Int32",
    "Uint32Array": "Uint32",
    "Int16Array": "Int16",
    "Uint16Array": "Uint16",
    "Int8Array": "Int8",
    "Uint8Array": "Uint8",
    "Uint8ClampedArray": "Uint8C"
};

var arrayType2elementSize = {
    "Float64": 8,
    "Float32": 4,
    "Int32": 4,
    "Uint32": 4,
    "Int16": 2,
    "Uint16": 2,
    "Int8": 1,
    "Uint8": 1,
    "Uint8Clamped": 1
};

var typedConstructors = {
    "Float64": Float64Array,
    "Float32": Float32Array,
    "Int32": Int32Array,
    "Uint32": Uint32Array,
    "Int16": Int16Array,
    "Uint16": Uint16Array,
    "Int8": Int8Array,
    "Uint8": Uint8Array,
    "Uint8Clamped": Uint8ClampedArray
};

var typedConstructorNames = {
    "Float64": "%Float64ArrayPrototype%",
    "Float32": "%Float32ArrayPrototype%",
    "Int32": "%Int32ArrayPrototype%",
    "Uint32": "%Uint32ArrayPrototype%",
    "Int16": "%Int16ArrayPrototype%",
    "Uint16": "%Uint16ArrayPrototype%",
    "Int8": "%Int8ArrayPrototype%",
    "Uint8": "%Uint8ArrayPrototype%",
    "Uint8Clamped": "%Uint8ClampedArrayProtoype%"
};

function GetValueFromBuffer(arrayBuffer, byteIndex, type, isLittleEndian) {
    var length = getInternalSlot(arrayBuffer, "ArrayBufferByteLength");
    var block = getInternalSlot(arrayBuffer, "ArrayBufferData");
    if (block === undefined || block === null) return withError("Type", "[[ArrayBufferData]] is not initialised or available.");
    var elementSize = arrayType2elementSize[type];
    var rawValue, intValue;
    var help;

    help = new(typedConstructors[type])(bock, byteIndex, 1);
    rawValue = help[0];

    return rawValue;
}

function SetValueInBuffer(arrayBuffer, byteIndex, type, value, isLittleEndian) {

    var length = getInternalSlot(arrayBuffer, "ArrayBufferByteLength");
    var block = getInternalSlot(arrayBuffer, "ArrayBufferData");
    if (block === undefined || block === null) return withError("Type", "[[ArrayBufferData]] is not initialised or available.");
    var elementSize = arrayType2elementSize[type];
    var rawValue, intValue;
    var help;

    help = new(typedConstructors[type])(bock, byteIndex, 1);
    help[0] = value;

    return NormalCompletion(undefined);
}

function SetViewValue(view, requestIndex, isLittleEndian, type, value) {
    var v = ToObject(view);
    if (isAbrupt(v = ifAbrupt(v))) return v;
    if (!hasInternalSlot(v, "DataArrayBuffer")) return withError("Type", "not a DataArrayBuffer");
    var buffer = getInternalSlot(v, "DataArrayBuffer");
    if (buffer === undefined) return withError("Type", "buffer is undefined");
    var numberIndex = ToNumber(requestIndex);
    var getIndex = ToInteger(numberIndex);
    if (isAbrupt(getIndex = ifAbrupt(getIndex))) return getIndex;
    if ((numberIndex !== getIndex) || (getIndex < 0)) return withError("Range", "index out of range");
    var littleEndian = ToBoolean(isLittleEndian);
    if (isAbrupt(littleEndian = ifAbrupt(littleEndian))) return littleEndian;
    var viewOffset = getInternalSlot(v, "ByteOffset");
    var viewSize = getInternalSlot(v, "ByteLength");
    var elementSize = TypedArrayElementSize[type];
    if (getIndex + elementSize > viewSize) return withError("Range", "out of range larger viewsize");
    var bufferIndex = getIndex + viewOffset;
    return SetValueInBuffer(buffer, bufferIndex, type, littleEndian);
}

function GetViewValue(view, requestIndex, isLittleEndian, type) {
    var v = ToObject(view);
    if (isAbrupt(v = ifAbrupt(v))) return v;
    if (!hasInternalSlot(v, "DataArrayBuffer")) return withError("Type", "not a DataArrayBuffer");
    var buffer = getInternalSlot(v, "DataArrayBuffer");
    if (buffer === undefined) return withError("Type", "buffer is undefined");
    var numberIndex = ToNumber(requestIndex);
    var getIndex = ToInteger(numberIndex);
    if (isAbrupt(getIndex = ifAbrupt(getIndex))) return getIndex;
    if ((numberIndex !== getIndex) || (getIndex < 0)) return withError("Range", "index out of range");
    var littleEndian = ToBoolean(isLittleEndian);
    if (isAbrupt(littleEndian = ifAbrupt(littleEndian))) return littleEndian;
    var viewOffset = getInternalSlot(v, "ByteOffset");
    var viewSize = getInternalSlot(v, "ByteLength");
    var elementSize = TypedArrayElementSize[type];
    if (getIndex + elementSize > viewSize) return withError("Range", "out of range larger viewsize");
    var bufferIndex = getIndex + viewOffset;
    return GetValueFromBuffer(buffer, bufferIndex, type, littleEndian);
}