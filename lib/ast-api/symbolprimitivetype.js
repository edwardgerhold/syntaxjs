function IsSymbol(P) {
    return P instanceof SymbolPrimitiveType;
}
var es5id = Math.floor(Math.random() * (1 << 16));
function SymbolPrimitiveType(id, desc) {
    var O = Object.create(SymbolPrimitiveType.prototype);
    setInternalSlot(O, SLOTS.DESCRIPTION, desc);
    setInternalSlot(O, SLOTS.PROTOTYPE, null);
    setInternalSlot(O, SLOTS.EXTENSIBLE, false);
    setInternalSlot(O, SLOTS.INTEGRITY, "frozen");
    setInternalSlot(O, SLOTS.ES5ID, id || (++es5id + Math.random()));
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
var $$geti = SymbolPrimitiveType("@@geti",  "Symbol.geti");
var $$seti = SymbolPrimitiveType("@@seti",  "Symbol.seti");
var $$add  = SymbolPrimitiveType("@@ADD",  "Symbol.add");
var $$addr = SymbolPrimitiveType("@@ADDR",  "Symbol.addR");
function addWellKnownSymbolsToRealmsLeakySymbolMap(realm) {
    /**
     * for getOwnPropertySymbols i need a lookup table
     */
    var map = realm.leakySymbolMap;
    map['@@unscopables'] = $$unscopables;
    map['@@create'] = $$create;
    map['@@toPrimitive'] = $$toPrimitive;
    map['@@hasInstance'] = $$hasInstance;
    map['@@toStringTag'] = $$toStringTag;
    map['@@iterator'] = $$iterator;
    map['@@isRegExp'] = $$isRegExp;
    map['@@isConcatSpreadable'] = $$isConcatSpreadable;
    map['@@geti'] = $$geti;
    map['@@seti'] = $$seti;
    map['@@ADD'] = $$add;
    map['@@ADDR'] = $$addr;
}
exports.$$geti = $$geti;
exports.$$seti = $$seti;
exports.$$add = $$add;
exports.$$addr = $$addr;
function thisSymbolValue(value) {
    if (value instanceof CompletionRecord) return thisSymbolValue(value.value);
    if (Type(value) === SYMBOL) return value;
    if (Type(value) === OBJECT && hasInternalSlot(value, SLOTS.SYMBOLDATA)) {
        var b = getInternalSlot(value, SLOTS.SYMBOLDATA);
        if (Type(b) === SYMBOL) return b;
    }
    return newTypeError( "thisSymbolValue: value is not a Symbol");
}
var SymbolFunction_Call = function Call(thisArg, argList) {
    var descString;
    var description = argList[0];
    if (description !== undefined) descString = ToString(description);
    if (isAbrupt(descString = ifAbrupt(descString))) return descString;
    var symbol = SymbolPrimitiveType();
    setInternalSlot(symbol, SLOTS.DESCRIPTION, descString);

    /**
     * for getOwnPropertySymbols i need a lookup table
     *
     */

    getRealm().leakySymbolMap[getInternalSlot(symbol, SLOTS.ES5ID)] = symbol;

    /**
     * should consider redoing with WeakMap if nativly available
     */

    return NormalCompletion(symbol);
};
var SymbolFunction_Construct = function Construct(argList) {
    return OrdinaryConstruct(this, argList);
};
var SymbolPrototype_toString = function toString(thisArg, argList) {
    var s = thisArg;
    var sym;
    if (Type(s) === SYMBOL) sym = s;
    else if (!hasInternalSlot(s, SLOTS.SYMBOLDATA)) return newTypeError(format("HAS_NO_SLOT_S", "[[SymbolData]]"));
    else sym = getInternalSlot(s, SLOTS.SYMBOLDATA);
    var desc = getInternalSlot(sym, SLOTS.DESCRIPTION);
    if (desc === undefined) desc = "";
    Assert(Type(desc) === STRING, format("SLOT_S_NOT_A_STRING", "[[Description]]"));
    var result = "Symbol(" + desc + ")";
    return NormalCompletion(result);
};
var SymbolPrototype_valueOf = function valueOf(thisArg, argList) {
    var s = thisArg;
    if (Type(s) === SYMBOL) return NormalCompletion(s);
    if (!hasInternalSlot(s, SLOTS.SYMBOLDATA)) return newTypeError(format("HAS_NO_SLOT_S", "[[SymbolData]]"));
    var sym = getInternalSlot(s, SLOTS.SYMBOLDATA);
    return NormalCompletion(sym);
};
var SymbolPrototype_$$toPrimitive = function (thisArg, argList) {
    return newTypeError(format("SYMBOL_TOPRIMITVE_ERROR"));
};
var SymbolFunction_keyFor = function (thisArg, argList) {
    var sym = argList[0];
    if (Type(sym) !== SYMBOL) return newTypeError(format("S_NOT_A_SYMBOL","keyFor: sym"));
    var key = getInternalSlot(sym, SLOTS.DESCRIPTION);
    var e = getRealm().GlobalSymbolRegistry[key];
    if (SameValue(e.Symbol, sym)) return NormalCompletion(e.Key);
    Assert(getRealm().GlobalSymbolRegistry[key] === undefined, translate("GLOBAL_SYMBOL_REGISTRY_ERROR"));
    return NormalCompletion(undefined);
};
var SymbolFunction_for = function (thisArg, argList) {
    var key = argList[0];
    var stringKey = ToString(key);
    if (isAbrupt(stringKey = ifAbrupt(stringKey))) return stringKey;
    var e = getRealm().GlobalSymbolRegistry[key];
    if (e !== undefined && SameValue(e.Key, stringKey)) return NormalCompletion(e.Symbol);
    Assert(e === undefined, translate("GLOBAL_SYMBOL_REGISTRY_ERROR"));
    var newSymbol = SymbolPrimitiveType();
    setInternalSlot(newSymbol, SLOTS.DESCRIPTION, stringKey);
    getRealm().GlobalSymbolRegistry[stringKey] = { Key: stringKey, Symbol: newSymbol };
    return NormalCompletion(newSymbol); // There is a Typo newSumbol in the Spec.
};
var SymbolFunction_$$create = function (thisArg, argList) {
    return newTypeError(format("SYMBOL_CREATE_ERROR"));
};

