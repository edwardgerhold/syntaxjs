
// ===========================================================================================================
// Symbol Constructor and Prototype
// ===========================================================================================================

MakeConstructor(SymbolFunction, true, SymbolPrototype);

var SymbolFunction_Call = function Call(thisArg, argList) {
    var descString;
    var description = argList[0];
    if (description !== undefined) descString = ToString(description);
    if (isAbrupt(descString = ifAbrupt(descString))) return descString;
    var symbol = SymbolPrimitiveType();
    setInternalSlot(symbol, "Description", descString);
    return NormalCompletion(symbol);
};
var SymbolFunction_Construct = function Construct(argList) {
    return OrdinaryConstruct(this, argList);
};

setInternalSlot(SymbolFunction, "Call", SymbolFunction_Call);
setInternalSlot(SymbolFunction, "Construct", SymbolFunction_Construct);

LazyDefineBuiltinConstant(SymbolFunction, "create", $$create);
LazyDefineBuiltinConstant(SymbolFunction, "toStringTag", $$toStringTag);
LazyDefineBuiltinConstant(SymbolFunction, "toPrimitive", $$toPrimitive);
LazyDefineBuiltinConstant(SymbolFunction, "toInstance", $$hasInstance);
LazyDefineBuiltinConstant(SymbolFunction, "isConcatSpreadable", $$isConcatSpreadable);
LazyDefineBuiltinConstant(SymbolFunction, "iterator", $$iterator);
LazyDefineBuiltinConstant(SymbolFunction, "isRegExp", $$isRegExp);
LazyDefineBuiltinConstant(SymbolFunction, "unscopables", $$unscopables);

var SymbolFunction_$$create = function (thisArg, argList) {
    return withError("Type", "The Symbol[@@create] method of the Symbol function is supposed to throw a Type Error");
};

DefineOwnProperty(SymbolFunction, $$create, {
    value: CreateBuiltinFunction(realm, SymbolFunction_$$create, 0, "[Symbol.create]"),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(SymbolFunction, "prototype", {
    value: SymbolPrototype,
    writable: false,
    enumerable: false,
    configurable: false
});

setInternalSlot(SymbolPrototype, "Prototype", ObjectPrototype);
DefineOwnProperty(SymbolPrototype, "constructor", {
    value: SymbolFunction,
    writable: false,
    enumerable: false,
    configurable: false
});

var SymbolPrototype_toString = function toString(thisArg, argList) {
    var s = thisArg;
    if (hasInternalSlot(s, "SymbolData")) return withError("Type", "The this argument has got no [[SymbolData]] property.");
    var sym = getInternalSlot(s, "SymbolData");
    var desc = getInternalSlot(sym, "Description");
    if (desc === undefined) desc = "";
    Assert(Type(desc) === "string", "The [[Description]] field of the symbol of the this argument is not a string");
    var result = "Symbol(" + desc + ")";
    return NormalCompletion(result);
};

var SymbolPrototype_valueOf = function valueOf(thisArg, argList) {
    var s = thisArg;
    if (hasInternalSlot(s, "SymbolData")) return withError("Type", "The this argument has got no [[SymbolData]] property.");
    var sym = getInternalSlot(s, "SymbolData");
    return NormalCompletion(sym);
};

var SymbolPrototype_$$toPrimitive = function (thisArg, argList) {
    return withError("Type", "Symbol.prototype[@@toPrimitive] is supposed to throw a Type Error!");
};



// var GlobalSymbolRegistry = Object.create(null);
// moved up to the realm


var SymbolFunction_keyFor = function (thisArg, argList) {
    var sym = argList[0];
    if (Type(sym) !== "symbol") return withError("Type", "keyFor: sym is not a symbol");
    var key = getInternalSlot(sym, "Description");
    var e = GlobalSymbolRegistry[key];
    if (SameValue(e.Symbol, sym)) return NormalCompletion(e.key);
    Assert(getRealm().GlobalSymbolRegistry[key] === undefined, "GlobalSymbolRegistry must not contain an entry for sym");
    return NormalCompletion(undefined);
};


var SymbolFunction_for = function (thisArg, argList) {
    var key = argList[0];
    var stringKey = ToString(key)
    if (isAbrupt(stringKey = ifAbrupt(stringKey))) return stringKey;
    var e = getRealm().GlobalSymbolRegistry[key];
    if (e !== undefined && SameValue(e.Key, stringKey)) return NormalCompletion(e.symbol);
    Assert(e === undefined, "GlobalSymbolRegistry must currently not contain an entry for stringKey");
    var newSymbol = SymbolPrimitiveType();
    setInternalSlot(newSymbol, "Description", stringKey);
    getRealm().GlobalSymbolRegistry[stringKey] = { Key: stringKey, Symbol: newSymbol };
    return NormalCompletion(newSymbol); // There is a Typo newSumbol in the Spec.
};



LazyDefineBuiltinFunction(SymbolFunction, "for", 1, SymbolFunction_for);
LazyDefineBuiltinFunction(SymbolFunction, "keyFor", 1, SymbolFunction_keyFor /* ,realm */);
LazyDefineBuiltinFunction(SymbolPrototype, "toString", 0, SymbolPrototype_toString);
LazyDefineBuiltinFunction(SymbolPrototype, "valueOf", 0, SymbolPrototype_valueOf);
LazyDefineBuiltinConstant(SymbolPrototype, $$toStringTag, "Symbol");
LazyDefineBuiltinConstant(SymbolPrototype, $$toPrimitive,
    CreateBuiltinFunction(realm, SymbolPrototype_$$toPrimitive, 1, "[Symbol.toPrimitive]"));

