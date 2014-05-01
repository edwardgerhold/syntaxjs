function ArrayExoticObject(proto) {
    var A = Object.create(ArrayExoticObject.prototype);
    setInternalSlot(A, "Bindings",Object.create(null));
    setInternalSlot(A, "Symbols", Object.create(null));
    setInternalSlot(A, SLOTS.EXTENSIBLE, true);
    setInternalSlot(A, SLOTS.PROTOTYPE, proto? proto : ArrayPrototype);
    return A;
}
ArrayExoticObject.prototype = assign(ArrayExoticObject.prototype, OrdinaryObject.prototype);
ArrayExoticObject.prototype = assign(ArrayExoticObject.prototype, {
    constructor: ArrayExoticObject,
    type: "object",
    toString: function () {
        return "[object ArrayExoticObject]";
    },
    DefineOwnProperty: function (P, Desc) {
        if (IsPropertyKey(P)) {

            if (IsSymbol(P)) return OrdinaryDefineOwnProperty(this, P, Desc);

            if (P === "length") {

                return ArraySetLength(this, Desc);

            } else {

                var testP = P;

                if (ToString(ToInteger(testP)) === ToString(testP)) {
                    var oldLenDesc = GetOwnProperty(this, "length");
                    if (!oldLenDesc) oldLenDesc = Object.create(null);
                    var oldLen = oldLenDesc.value;
                    var index = ToUint32(P);
                    if (isAbrupt(index = ifAbrupt(index))) return index;
                    if (index >= oldLen && oldLenDesc.writable === false) return false;
                    var succeeded = OrdinaryDefineOwnProperty(this, P, Desc);
                    if (isAbrupt(succeeded = ifAbrupt(succeeded))) return succeeded;
                    if (succeeded === false) return false;
                    if (index >= oldLen) {
                        oldLenDesc.value = index + 1;
                        succeeded = this.DefineOwnProperty("length", oldLenDesc);
                        if (isAbrupt(succeeded = ifAbrupt(succeeded))) return succeeded;
                    }
                    return true;
                }

            }

            return OrdinaryDefineOwnProperty(this, P, Desc);
        }
        return false;
    }
});


// ===========================================================================================================
// Array Exotic Object
// ===========================================================================================================

function ArrayCreate(len, proto) {
    var p = proto || getIntrinsic("%ArrayPrototype%");
    var array = ArrayExoticObject(p);
    setInternalSlot(array, SLOTS.EXTENSIBLE, true);
    if (len !== undefined) {
        setInternalSlot(array , "ArrayInitialisationState", true);
    } else {
        setInternalSlot(array , "ArrayInitialisationState",  false);
        len = 0;
    }
    OrdinaryDefineOwnProperty(array, "length", {
        value: len,
        writable: true,
        enumerable: false,
        configurable: false
    });
    return array;
}

function ArraySetLength(A, Desc) {
    if (Desc.value === undefined) {
        return OrdinaryDefineOwnProperty(A, "length", Desc);
    }
    var newLenDesc = assign(Object.create(null), Desc);
    var newLen = ToUint32(Desc.value);
    if (newLen != ToNumber(Desc.value)) return withError("Range", "Array length index out of range");
    if (isAbrupt(newLen=ifAbrupt(newLen))) return newLen;
    newLenDesc.value = newLen;
    var oldLenDesc = callInternalSlot("GetOwnProperty", A, "length");
    if (!oldLenDesc) oldLenDesc = Object.create(null);
    var oldLen = Desc.value;
    if (newLen >= oldLen) return OrdinaryDefineOwnProperty(A, "length", newLenDesc);
    if (oldLenDesc.writable === false) return false;
    var newWritable;
    if (newLenDesc.writable === undefined || newLenDesc.writable === true) newWritable = true;
    else {
        newWritable = false;
        newLenDesc.writable = true;
    }
    var succeeded = OrdinaryDefineOwnProperty(A, "length", newLenDesc);
    if (isAbrupt(succeeded = ifAbrupt(succeeded))) return succeeded;
    if (succeeded === false) return false;
    while (newLen < oldLen) {
        oldLen = oldLen - 1;
        succeeded = callInternalSlot("Delete", A, (ToString(oldLen)));
        if (isAbrupt(succeeded = ifAbrupt(succeeded))) return succeeded;
        if (succeeded === false) {
            newLenDesc.value = oldLen + 1;
            if (newWritable === false) newLenDesc.writable = false;
            succeeded = OrdinaryDefineOwnProperty(A, "length", newLenDesc);
            if (isAbrupt(succeeded = ifAbrupt(succeeded))) return succeeded;
            return false;
        }
    }
    if (newWritable === false) {
        newLenDesc.writable = false;
        OrdinaryDefineOwnProperty(A, "length", {
            writable: false
        });
    }
    return true;
}

