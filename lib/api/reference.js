
// ===========================================================================================================
// Reference
// ===========================================================================================================

function Reference(N, V, S, T) {
    var r = Object.create(Reference.prototype);
    r.name = N;
    r.base = V;
    r.strict = S;
    //if (T !== undefined)
    r.thisValue = T;
    return r;
}

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
    if (Type(V) !== "reference") return V;

    var base = V.base;

    if (IsUnresolvableReference(V)) return withError("Reference", "GetValue: '" + V.name + "' is an unresolvable reference");

    if (IsPropertyReference(V)) {

        if (HasPrimitiveBase(V)) {
            Assert(base !== null && base !== undefined, "base never null or undefined");
            base = ToObject(base);
        }

        // object
        return callInternalSlot("Get", base, V.name, GetThisValue(V));
    } else {
        // environment record
        return base.GetBindingValue(V.name, V.strict);
    }

}

function PutValue(V, W) {
    if (isAbrupt(V = ifAbrupt(V))) return V;
    if (isAbrupt(W = ifAbrupt(W))) return W;
    if (Type(V) !== "reference") return withError("Reference", "PutValue: V is not a reference");
    var base = V.base;

    if (IsUnresolvableReference(V)) {

        //console.log("unresolvable "+V.name);
        if (V.strict) return withError("Reference", "PutValue: unresolvable Reference");
        var globalObj = GetGlobalObject();
        return Put(globalObj, V.name, W, false);

    } else if (IsPropertyReference(V)) {

        if (HasPrimitiveBase(V)) {
            Assert(base !== null && base !== undefined, "PutValue: base is never null nor undefined");
            base = ToObject(base);
            var succeeded = base.Set(V.name, W, GetThisValue(V));
            if (isAbrupt(succeeded = ifAbrupt(succeeded))) return succeeded;
            if (succeeded === false && V.strict) return withError("Type", "PutValue: succeeded false but strict true");
            return NormalCompletion();
        }

    } else {

        debug("base setmutable " + V.name);

        return base.SetMutableBinding(V.name, W, V.strict);
    }

}

function IsPropertyReference(V) {
    var base = GetBase(V);
    return Type(base) === "object" || HasPrimitiveBase(V);

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
    return type === "string" || type === "boolean" || type === "number" || type === "symbol";

}

function GetThisValue(V) {
    if (isAbrupt(V = ifAbrupt(V))) return V;
    if (Type(V) !== "reference") return V;
    if (IsUnresolvableReference(V)) return withError("Reference", "GetThisValue: unresolvable reference");
    if (IsSuperReference(V)) return V.thisValue;
    return GetBase(V);
}
