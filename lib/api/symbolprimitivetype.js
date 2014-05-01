/**
 * Created by root on 30.03.14.
 */


function IsSymbol(P) {
    return P instanceof SymbolPrimitiveType;
}

var es5id = Math.floor(Math.random() * (1 << 16));

function SymbolPrimitiveType(id, desc) {
    var O = Object.create(SymbolPrimitiveType.prototype);
    setInternalSlot(O, "Description", desc);
    setInternalSlot(O, SLOTS.PROTOTYPE, null);
    setInternalSlot(O, SLOTS.EXTENSIBLE, false);
    setInternalSlot(O, "Integrity", "frozen");
    setInternalSlot(O, "es5id", id || (++es5id + Math.random()));
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

var $$unscopables        = SymbolPrimitiveType("@@unscopables",         "Symbol.unscopables");
var $$create             = SymbolPrimitiveType("@@create",              "Symbol.create");
var $$toPrimitive        = SymbolPrimitiveType("@@toPrimitive",         "Symbol.toPrimitive");
var $$toStringTag        = SymbolPrimitiveType("@@toStringTag",         "Symbol.toStringTag");
var $$hasInstance        = SymbolPrimitiveType("@@hasInstance",         "Symbol.hasInstance");
var $$iterator           = SymbolPrimitiveType("@@iterator",            "Symbol.iterator");
var $$isRegExp           = SymbolPrimitiveType("@@isRegExp",            "Symbol.isRegExp");
var $$isConcatSpreadable = SymbolPrimitiveType("@@isConcatSpreadable",  "Symbol.isConcatSpreadable");


function thisSymbolValue(value) {
    if (value instanceof CompletionRecord) return thisSymbolValue(value.value);
    if (Type(value) === SYMBOL) return value;
    if (Type(value) === OBJECT && hasInternalSlot(value, "SymbolData")) {
        var b = getInternalSlot(value, "SymbolData");
        if (Type(b) === SYMBOL) return b;
    }
    return withError("Type", "thisSymbolValue: value is not a Symbol");
}


