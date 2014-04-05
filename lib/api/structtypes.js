/**
 * Created by root on 04.04.14.
 */

/*
Specification:
 https://github.com/dslomov-chromium/typed-objects-es7

    still have to read it
 */



    function TypeDescriptorExoticObject() {
        var obj = Object.create(TypeDescriptorExoticObject.prototype);
        setInternalSlot(obj, "Structure", undefined); // structure value
        setInternalSlot(obj, "Rank", undefined);    // int
        setInternalSlot(obj, "Opacity", undefined); // bool
        setInternalSlot(obj, "ArrayDescriptor", undefined); /// undef or typedesc
        setInternalSlot(obj, "OpaqueDescriptor", undefined); // undef or typedesc
        return obj;
    }

    TypeDescriptorExoticObject.prototype = {
        constructor: TypeDescriptorExoticObject,
        toString: function () { return "[object TypeDescriptorExoticObject]" }
    };
    addMissingProperties(TypeDescriptorExoticObject.prototype, OrdinaryObject.prototype);


    function TypeExoticObject() {
        var obj = Object.create(TypeExoticObject.prototype);
        setInternalSlot(obj, "TypeDescriptor", undefined);
        setInternalSlot(obj, "Dimensions", undefined);
        // assert len(dim) == rank of typedesc
        return obj;
    }

    TypeExoticObject.prototype = {
        constructor: TypeDescriptorExoticObject,
        toString: function () { return "[object TypeExoticObject]"; },

        Call: function (thisArg, argList) {
            if (argList.length === 0) {

                return;
            }
            var arg0 = argList[0]
            if (getInternalSlot(arg0, "ArrayBufferData")) {
               return;
            } else if (arg0 != undefined) {
                return;
            }
        },

        GetOwnProperty: function () {

        },
        GetPrototypeOf: function () {

        },
        IsExtensible: function () {
            return false;
        },
        Structure: function (O) {
            var typeDescriptor = getInternalSlot(O, "TypeDescriptor");
            return getInternalSlot(typeDescriptor, "Structure");
        }

    };
    addMissingProperties(TypeExoticObject.prototype, OrdinaryObject.prototype)

    // Ground Structures
    var int8,uint8,uint16,uint32,int32,float32,float64,any,string,object,int16;


    var GroundStructures = {
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

// but in some hours i will

function AlignTo(value, alignment) {
    var r = (value % alignment);
    if (r != 0) return value + alignment - r;
    return value;
}

function IsTypeObject(O) {
    if (Type(O) != "object") return false;
    if (!hasInternalSlot(O, "TypeDescriptor")) return false;
    if (!hasInternalSlot(O, "ViewedArrayBuffer")) return false;
    return true;
}

function isGroundStructure(S) {

}

function Alignment(typeDescriptor) {
   var S = getInternalSlot(typeDescriptor, "Structure");
   if (isGroundStructure(S)) return Size(S);
   var list = [];

   //fieldType values for each
    //Alignment(TypeDescriptor(t))

}

function Size_typedObject(typedObject) {

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


















