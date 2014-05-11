var SymbolFunction_Call = function Call(thisArg, argList) {
    var descString;
    var description = argList[0];
    if (description !== undefined) descString = ToString(description);
    if (isAbrupt(descString = ifAbrupt(descString))) return descString;
    var symbol = SymbolPrimitiveType();
    setInternalSlot(symbol, SLOTS.DESCRIPTION, descString);
    return NormalCompletion(symbol);
};
var SymbolFunction_Construct = function Construct(argList) {
    return OrdinaryConstruct(this, argList);
};
var SymbolPrototype_toString = function toString(thisArg, argList) {
    var s = thisArg;
    if (hasInternalSlot(s, SLOTS.SYMBOLDATA)) return newTypeError(format("HAS_NO_SLOT_S", "[[SymbolData]]"));
    var sym = getInternalSlot(s, SLOTS.SYMBOLDATA);
    var desc = getInternalSlot(sym, SLOTS.DESCRIPTION);
    if (desc === undefined) desc = "";
    Assert(Type(desc) === STRING, format("SLOT_S_NOT_A_STRING", "[[Description]]"));
    var result = "Symbol(" + desc + ")";
    return NormalCompletion(result);
};

var SymbolPrototype_valueOf = function valueOf(thisArg, argList) {
    var s = thisArg;
    if (hasInternalSlot(s, SLOTS.SYMBOLDATA)) return newTypeError(format("HAS_NO_SLOT_S", "[[SymbolData]]"));
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
    Assert(getRealm().GlobalSymbolRegistry[key] === undefined, trans("GLOBAL_SYMBOL_REGISTRY_ERROR"));
    return NormalCompletion(undefined);
};
var SymbolFunction_for = function (thisArg, argList) {
    var key = argList[0];
    var stringKey = ToString(key);
    if (isAbrupt(stringKey = ifAbrupt(stringKey))) return stringKey;
    var e = getRealm().GlobalSymbolRegistry[key];
    if (e !== undefined && SameValue(e.Key, stringKey)) return NormalCompletion(e.Symbol);
    Assert(e === undefined, trans("GLOBAL_SYMBOL_REGISTRY_ERROR"));
    var newSymbol = SymbolPrimitiveType();
    setInternalSlot(newSymbol, SLOTS.DESCRIPTION, stringKey);
    getRealm().GlobalSymbolRegistry[stringKey] = { Key: stringKey, Symbol: newSymbol };
    return NormalCompletion(newSymbol); // There is a Typo newSumbol in the Spec.
};
var SymbolFunction_$$create = function (thisArg, argList) {
    return newTypeError( format("SYMBOL_CREATE_ERROR"));
};
MakeConstructor(SymbolFunction, true, SymbolPrototype);
setInternalSlot(SymbolFunction, SLOTS.CALL, SymbolFunction_Call);
setInternalSlot(SymbolFunction, SLOTS.CONSTRUCT, SymbolFunction_Construct);
setInternalSlot(SymbolPrototype, SLOTS.PROTOTYPE, ObjectPrototype);

LazyDefineBuiltinConstant(SymbolFunction, $$create, CreateBuiltinFunction(realm, SymbolFunction_$$create, 0, "[Symbol.create]"));
LazyDefineBuiltinConstant(SymbolFunction, "create", $$create);
LazyDefineBuiltinFunction(SymbolFunction, "for", 1, SymbolFunction_for);
LazyDefineBuiltinConstant(SymbolFunction, "isConcatSpreadable", $$isConcatSpreadable);
LazyDefineBuiltinConstant(SymbolFunction, "isRegExp", $$isRegExp);
LazyDefineBuiltinConstant(SymbolFunction, "iterator", $$iterator);
LazyDefineBuiltinFunction(SymbolFunction, "keyFor", 1, SymbolFunction_keyFor /* ,realm */);
LazyDefineBuiltinConstant(SymbolFunction, "prototype", SymbolPrototype);
LazyDefineBuiltinConstant(SymbolFunction, "hasInstance", $$hasInstance);
LazyDefineBuiltinConstant(SymbolFunction, "toPrimitive", $$toPrimitive);
LazyDefineBuiltinConstant(SymbolFunction, "toStringTag", $$toStringTag);
LazyDefineBuiltinConstant(SymbolFunction, "unscopables", $$unscopables);
LazyDefineBuiltinConstant(SymbolPrototype, "constructor", SymbolFunction);
LazyDefineBuiltinConstant(SymbolPrototype, $$toPrimitive, CreateBuiltinFunction(realm, SymbolPrototype_$$toPrimitive, 1, "[Symbol.toPrimitive]"));
LazyDefineBuiltinFunction(SymbolPrototype, "toString", 0, SymbolPrototype_toString);
LazyDefineBuiltinConstant(SymbolPrototype, $$toStringTag, "Symbol");
LazyDefineBuiltinFunction(SymbolPrototype, "valueOf", 0, SymbolPrototype_valueOf);
