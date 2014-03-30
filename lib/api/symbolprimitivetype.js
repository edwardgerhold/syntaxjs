/**
 * Created by root on 30.03.14.
 */


function IsSymbol(P) {
    return P instanceof SymbolPrimitiveType;
}

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


