var Nil = null;
function TypeDescriptorExoticObject() {
    var obj = Object.create(TypeDescriptorExoticObject.prototype);
    setInternalSlot(obj, SLOTS.STRUCTURE, undefined); // structure value
    setInternalSlot(obj, SLOTS.RANK, undefined);    // int
    setInternalSlot(obj, SLOTS.OPACITY, undefined); // bool
    setInternalSlot(obj, SLOTS.ARRAYDESCRIPTOR, undefined); /// undef or typedesc
    setInternalSlot(obj, SLOTS.OPAQUEDESCRIPTOR, undefined); // undef or typedesc
    return obj;
}
TypeDescriptorExoticObject.prototype = {
    constructor: TypeDescriptorExoticObject,
    toString: function () {
        return "[object TypeDescriptorExoticObject]"
    }
};
addMissingProperties(TypeDescriptorExoticObject.prototype, OrdinaryObject.prototype);
function TypeExoticObject() {
    var obj = Object.create(TypeExoticObject.prototype);
    setInternalSlot(obj, SLOTS.TYPEDESCRIPTOR, undefined);
    setInternalSlot(obj, SLOTS.DIMENSIONS, undefined);
    // assert len(dim) == rank of typedesc
    return obj;
}
TypeExoticObject.prototype = {
    constructor: TypeDescriptorExoticObject,
    toString: function () {
        return "[object TypeExoticObject]";
    },

    Call: function (thisArg, argList) {
        var typeObject = thisArg;
        if (argList.length === 0) {
            if (isGroundType(typeObject)) {
                var typeDescriptor = getInternalSlot(typeObject, SLOTS.TYPEDESCRIPTOR);
                return Default(typeDescriptor);
            }
            return CreateTypedObject(typeObject);
        }
        var arg0 = argList[0];
        if (getInternalSlot(arg0, SLOTS.ARRAYBUFFERDATA)) {
            var length = argList[1];
            length = length || buffer.length;
            if (isGroundType(typeObject)) return newTypeError("object is a ground object");
            return CreateTypedObjectFromBuffer(typedObject, buffer, length);

        } else if (arg0 != undefined) {
            if (isGroundObject(typeObject)) return Coerce(typeObject, value);
            else {
                var o = CreateTypedObject(typeObject);
                typeDescriptor = getInternalSlot(typeObject, SLOTS.TYPEDESCRIPTOR);
                var dimensions = getInternalSlot(typeObject, SLOTS.DIMENSIONS);
                var buffer = getInternalSlot(typeObject, SLOTS.VIEWEDARRAYBUFFER);
                var offset = getInternalSlot(o, SLOTS.BYTEOFFSET);
                ConvertAndCopyTo(typeDescriptor, dimensions, buffer, offset, value);
            }
        }
    },

    GetOwnProperty: function (P) {
        var typeDescriptor = getInternalSlot(O, SLOTS.TYPEDESCRIPTOR);
        var dimensions = getInternalSlot(O, SLOTS.DIMENSIONS);
        var buffer = getInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER);
        var offset = getInternalSlot(O, SLOTS.BYTEOFFSET);
        if (dimensions === Nil) {
            var value = getInternalSlot(typeDescriptor, SLOTS.STRUCTURE);
            var r = FieldRecord(P);

        } else {

            Assert(dimensions === Cons(length, remainingDimensions), "dimensions has to be Cons(doms, remainingDimensions)");
            var isInteger;
            if (!IsAbrupt(ToInteger(P))) isInteger = true;
            if (!isInteger) return NormalCompletion(undefined);
            var i = ToInteger(P);
            var o = s * i + offset;
            var value = Reify(typeDescriptor, remainingDimensions, buffer, o);

        }
    },
    GetPrototypeOf: function () {
        var O = this;
        var typeDescriptor = getInternalSlot(O, SLOTS.TYPEDESCRIPTOR);
        return typeDescriptor;
    },
    IsExtensible: function () {
        return false;
    },
    Structure: function (O) {
        var typeDescriptor = getInternalSlot(O, SLOTS.TYPEDESCRIPTOR);
        return getInternalSlot(typeDescriptor, SLOTS.STRUCTURE);
    }

};
addMissingProperties(TypeExoticObject.prototype, OrdinaryObject.prototype);
var int8 = "int8",
    uint8 = "uint8",
    int16 = "int16",
    uint16 = "uint16",
    uint32 = "uint32",
    int32 = "int32",
    float32 = "float32",
    float64 = "float64",
    any = "any",
    string = "string",
    object = "object";
var GroundStructures = {
    __proto__: null,
    "uint8": { "Structure": uint8, "Opacity": false },
    "int8": { "Structure": int8, "Opacity": false},
    "uint16": { "Structure": uint16, "Opacity": false},
    "int16": { "Structure": int16, "Opacity": false},
    "uint32": { "Structure": uint32, "Opacity": false},
    "int32": { "Structure": int32, "Opacity": false},
    "float32": { "Structure": float32, "Opacity": false},
    "float64": { "Structure": float64, "Opacity": false},
    "any": { "Structure": any, "Opacity": true},
    "string": { "Structure": string, "Opacity": true},
    "object": { "Structure": object, "Opacity": true}
};
var groundTypes = Object.create(null);
groundTypes.int8 = int8;
groundTypes.uint8 = uint8;
groundTypes.int16 = int16;
groundTypes.uint16 = uint16;
groundTypes.int32 = int32;
groundTypes.uint32 = uint32;
groundTypes.float32 = float32;
groundTypes.float64 = float64;
function AlignTo(value, alignment) {
    var r = (value % alignment);
    if (r != 0) return value + alignment - r;
    return value;
}
function IsTypeObject(O) {
    if (Type(O) !== OBJECT) return false;
    if (!hasInternalSlot(O, SLOTS.TYPEDESCRIPTOR)) return false;
    return hasInternalSlot(O, SLOTS.VIEWEDARRAYBUFFER);

}
function isGroundStructure(S) {
    switch (S) {
        case int8:
        case int16:
        case uint8:
        case uint16:
        case uint32:
        case float32:
        case float64:
            return true;
        default:
            return false;
    }

}
function FieldRecord(fieldName, byteOffset, currentOffset, fieldType) {
    if (arguments.length === 2) {
        return { name: fieldName, type: byteOffset };
    } else {

    }
}
function Alignment(typeDescriptor) {
    var S = getInternalSlot(typeDescriptor, SLOTS.STRUCTURE);
    if (isGroundStructure(S)) return Size(S);
    else {

    }
    //fieldType values for each
    //Alignment(TypeDescriptor(t))

}
function Size(structure, dimensions) {
    if (arguments.length === 1) {
        //Size(structure)
        if (isGroundStructure(structure)) {

        }
    }
}
function OffsetOf(fieldRecords, name) {

}
function CreateStructTypeDescriptor(structure) {

}
function CreateArrayTypeDescriptor(typeDescriptor) {

}
function GetOrCreateArrayTypeDescriptor(typeDescriptor) {

}
function GetOrCreateOpaqueTypeDescriptor(typeDescriptor) {

}
function CreateTypedObjectFromBuffer(arrayBuffer, byteOffset, typeObject) {

}
function CreateTypedObject(typeObject) {
}
function Default(typeDescriptor) {
}
function Coerce(typeDescriptor, value) {

}
function Initialize(typeDescriptor, dimensions, buffer, offset) {

}
function ConvertAndCopyTo(typeDescriptor, dimensions, buffer, offset, value) {

}
function Reify(typeDescriptor, dimensions, buffer, offset, opacity) {

}
function Cons(car, cdr) {
    // wiki says from lisp: (cons 42 (cons 69 (cons 613 nil)))
}
function SameDimensions(d1, d2) {
    if (d1 === Nil && d2 === Nil) return true;
    // if (d1 = Cons(1, remainingDimensions1)
    // if (d2 = Cons(1, remainingDimensions2)
    // SameDimensions(remainingDimensions1, remainingDimensions2)
}
exports.Nil = Nil;
exports.TypeDescriptorExoticObject = TypeDescriptorExoticObject;
exports.TypeExoticObject = TypeExoticObject;
exports.IsTypeObject = IsTypeObject;
exports.FieldRecord = FieldRecord;
exports.Alignment = Alignment;
exports.Size = Size;
exports.OffsetOf = OffsetOf;
exports.CreateStructTypeDescriptor = CreateStructTypeDescriptor;
exports.CreateArrayTypeDescriptor = CreateArrayTypeDescriptor;
exports.GetOrCreateArrayTypeDescriptor = GetOrCreateArrayTypeDescriptor;
exports.GetOrCreateOpaqueTypeDescriptor = GetOrCreateOpaqueTypeDescriptor;
exports.CreateTypedObjectFromBuffer = CreateTypedObjectFromBuffer;
exports.CreateTypedObject = CreateTypedObject;
exports.Default = Default;
exports.Coerce = Coerce;
exports.Initialize = Initialize;
exports.ConvertAndCopyTo = ConvertAndCopyTo;
exports.Reify = Reify;
exports.Cons = Cons;
exports.SameDimensions = SameDimensions;
exports.GroundStructures = GroundStructures;
exports.isGroundStructure = isGroundStructure;
exports.groundTypes = groundTypes;
exports.int8 = int8;
exports.uint8 = uint8;
exports.int16 = int16;
exports.uint16 = uint16;
exports.int32 = int32;
exports.uint32 = uint32;
exports.float32 = float32;
exports.float64 = float64;
var TypePrototypePrototype_get = function (thisArg, argList) {
    var O = thisArg;
    if (!hasInternalSlot(O, SLOTS.TYPEDESCRIPTOR)) return newTypeError("has no type descriptor");
    return NormalCompletion(getInternalSlot(O, SLOTS.TYPEDESCRIPTOR));
};
var TypePrototype_arrayType = function (thisArg, argList) {
    var O = thisArg;
    var length = argList[0];
    if (!TypeObject(O)) return newTypeError("not a typed object");
    var typeDescriptor = getInternalSlot(O, SLOTS.TYPEDESCRIPTOR);
    var numberLength = ToNumber(length);
    var elementLength = ToLength(numberLength);
    if (isAbrupt(elementLength = ifAbrupt(elementLength))) return elementLength;
    if (SameValueZero(numberLength, elementLength)) return newRangeError("numberLength is not elementLength");
    var arrayDescriptor = GetOrCreateArrayTypeDescriptor(typeDescriptor);
    if (isAbrupt(arrayDescriptor = ifAbrupt(arrayDescriptor))) return arrayDescriptor;
    var R = TypeExoticObject();
    setInternalSlot(R, SLOTS.TYPEDESCRIPTOR, arrayDescriptor);
    var newDimensions = Cons(N, dimension);
    setInternalSlot(R, SLOTS.DIMENSIONS, newDimensions);
    return NormalCompletion(R);
};
var TypePrototype_opaqueType = function (thisArg, argList) {
    var O = thisArg;
    if (!IsTypeObject(O)) return newTypeError("is not a typed object");
    var typeDescriptor = getInternalSlot(O, SLOTS.TYPEDESCRIPTOR);
    var dimensions = setInternalSlot(O, SLOTS.DIMENSIONS);
    var opaqueDescriptor = GetOrCreateOpaqueTypeDescriptor(typeDescriptor);
    if (isAbrupt(opaqueDescriptor = ifAbrupt(opaqueDescriptor))) return opaqueDescriptor;
    var R = TypeObject();
    setInternalSlot(R, SLOTS.TYPEDESCRIPTOR, opaqueDescriptor);
    setInternalSlot(R, SLOTS.DIMENSIONS, dimensions);
    return NormalCompletion(R);
};
var StructTypeConstructor_Call = function (thisArg, argList) {
    var object = argList[0];
    if (Type(object) !== OBJECT) return newTypeError("first argument is not an object");

    var O = thisArg;
    if (!IsTypeObject(O)) return newTypeError("O is no TypeObject");
    var currentOffset = 0;
    var maxAlignment = 1;
    var structure = [];
    for (var P in object.Bindings) {
        var fieldType = Get(object, P);
        if (isAbrupt(fieldType = ifAbrupt(fieldType))) return fieldType;
        if (!IsTypeObject(fieldType)) return newTypeError("fieldType is no TypeObject");
        var alignment = Alignment(fieldType);
        maxAlignment = Math.max(alignment, maxAlignment);
        currentOffset = AlignTo(currentOffset, alignment);

        var r = FieldRecord(fieldName, byteOffset, currentOffset, fieldType);
        structure.push(r);
        var s = Size(fieldType);
        if (isAbrupt(s = ifAbrupt(s))) return s;
        currentOffset = currentOffset + s;
    }
    var size = AlignTo(currentOffset, maxAlignment);
    var typeDescriptor = CreateStructTypeDescriptor(structure);
    setInternalSlot(O, SLOTS.TYPEDESCRIPTOR, typeDescriptor);
    OrdinaryDefineOwnProperty(O, "prototype", {
        configurable: false,
        enumerable: false,
        value: typeDescriptor,
        writable: false
    });
    return NormalCompletion(O);
};
var StructTypeConstructor_Construct = function (argList) {
    return OrdinaryConstruct(this, argList);
};
var StructTypeConstructor_$$create = function (thisArg, argList) {
    var F = thisArg;
    var proto = OrdinaryCreateFromConstructor(F, INTRINSICS.STRUCTTYPEPROTOTYPE, [ SLOTS.TYPEDESCRIPTOR, SLOTS.DIMENSIONS ]);
    if (isAbrupt(proto = ifAbrupt(proto))) return proto;
    return ObjectCreate(proto);
};