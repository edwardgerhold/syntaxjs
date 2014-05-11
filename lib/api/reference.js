
// ===========================================================================================================
// Reference
// ===========================================================================================================

function Reference(N, V, S, T) {
    return {
        __proto__: Reference.prototype,
        name: N,
        base: V,
        strict: S,
        thisValue: T
    };
}
    /*
    var r = Object.create(Reference.prototype);
    r.name = N;
    r.base = V;
    r.strict = S;
    //if (T !== undefined)
    r.thisValue = T;
    return r;*/

Reference.prototype = {
    constructor: Reference,
    toString: function () {
        return "[object Reference]";
    } /*,
     GetValue: function () {
     return GetValue(this);
     },
     PutValue: function (W) {
     return PutValue(this, W);
     },
     IsPropertyReference: function () {
     return IsPropertyReference(this);
     },
     IsSuperReference: function () {
     return IsSuperReference(this);
     },
     IsStrictReference: function () {
     return IsStrictReference(this);
     },
     IsUnresolvableReference: function () {
     return IsUnresolvableReference(this);
     },
     GetReferencedName: function () {
     return GetReferencedName(this);
     },
     GetReferencedKey: function () {
     return GetReferencedKey(this);
     },
     GetBase: function () {
     return GetBase(this);
     },
     HasPrimitiveBase: function () {
     return HasPrimitiveBase(this);
     },
     GetThisValue: function () {
     return GetThisValue(this);
     }*/

};


function GetValue(V) {

    if (isAbrupt(V = ifAbrupt(V))) return V;
    if (Type(V) !== REFERENCE) return V;

    var base = V.base;

    if (IsUnresolvableReference(V)) return newReferenceError( format("REFERENCE_S_UNRESOLVABLE", V.name));

    if (IsPropertyReference(V)) {

        if (HasPrimitiveBase(V)) {
            Assert(base !== null && base !== undefined, trans("BASE_NEVER_NULL"));
            base = ToObject(base);
        }

        // object
        return callInternalSlot(SLOTS.GET, base, V.name, GetThisValue(V));
    } else {
        // environment record
        return base.GetBindingValue(V.name, V.strict);
    }

}

function PutValue(V, W) {
    if (isAbrupt(V = ifAbrupt(V))) return V;
    if (isAbrupt(W = ifAbrupt(W))) return W;
    if (Type(V) !== REFERENCE) return newReferenceError(trans("NOT_A_REFERENCE"));
    var base = V.base;

    if (IsUnresolvableReference(V)) {

        //console.log("unresolvable "+V.name);
        if (V.strict) return newReferenceError( trans("UNRESOLVABLE_REFERENCE"));
        var globalObj = GetGlobalObject();
        return Put(globalObj, V.name, W, false);

    } else if (IsPropertyReference(V)) {

        if (HasPrimitiveBase(V)) {
            Assert(base !== null && base !== undefined, "PutValue: base is never null nor undefined");
            base = ToObject(base);
            var succeeded = callInternalSlot(SLOTS.SET, base, V.name, W, GetThisValue(V));
            if (isAbrupt(succeeded = ifAbrupt(succeeded))) return succeeded;
            if (succeeded === false && V.strict) return newTypeError(format("SET_FAILED_IN_STRICTMODE"));
            return NormalCompletion();
        }

    } else {
        return base.SetMutableBinding(V.name, W, V.strict);
    }

}

function IsPropertyReference(V) {
    var base = GetBase(V);
    return Type(base) === OBJECT || HasPrimitiveBase(V);

}

function IsSuperReference(V) {
    return V.thisValue;

}

function IsUnresolvableReference(V) {
    return V.base === undefined;

}

function IsStrictReference(V) {
    return V.strict === true;
}

function GetReferencedName(V) {
    return V.name;
}

function GetBase(V) {
    return V.base;
}

function HasPrimitiveBase(V) {
    var type = Type(GetBase(V));
    switch(type) {
        case STRING:
        case BOOLEAN:
        case NUMBER:
        case SYMBOL:
            return true;
        default:
            return false;
    }
}

function GetThisValue(V) {
    if (isAbrupt(V = ifAbrupt(V))) return V;
    if (Type(V) !== REFERENCE) return V;
    if (IsUnresolvableReference(V)) return newReferenceError( "GetThisValue: unresolvable reference");
    if (IsSuperReference(V)) return V.thisValue;
    return GetBase(V);
}
