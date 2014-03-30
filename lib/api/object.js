/**
 * Created by root on 30.03.14.
 */
    // ===========================================================================================================
    // Ordinary Object
    // ===========================================================================================================

function OrdinaryObject(prototype) {
    var O = Object.create(OrdinaryObject.prototype);
    prototype = prototype === undefined ? getIntrinsic("%ObjectPrototype%") || null : prototype;
    setInternalSlot(O,"Bindings",Object.create(null));
    setInternalSlot(O,"Symbols",Object.create(null));
    setInternalSlot(O,"Prototype",prototype || null);
    setInternalSlot(O,"Extensible", true);
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

