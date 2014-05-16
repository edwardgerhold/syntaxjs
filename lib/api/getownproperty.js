function Put(O, P, V, Throw) {
    Assert(Type(O) === OBJECT, "O != OBJECT");
    Assert(IsPropertyKey(P));
    Throw = !!Throw;
    var success = callInternalSlot(SLOTS.SET, O, P, V, O);
    if (isAbrupt(success = ifAbrupt(success))) return success;
    if (success === false && Throw === true) return newTypeError(format("PUT_FAILS_AT_S", P));
    return NormalCompletion(success);
}
function DefineOwnPropertyOrThrow(O, P, D) {
    Assert(Type(O) === OBJECT, "O != OBJECT");
    Assert(IsPropertyKey(P));
    var success = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, O, P, D);
    if (isAbrupt(success = ifAbrupt(success))) return success;
    if (success === false) return newTypeError(format("DEFINEPROPERTYORTHROW_FAILS_AT_S", P));
    return NormalCompletion(success);
}
function DeletePropertyOrThrow(O, P) {
    Assert(Type(O) === OBJECT, "object expected");
    Assert(IsPropertyKey(P));
    var success = Delete(O, P);
    if (isAbrupt(success = ifAbrupt(success))) return success;
    if (success === false) return newTypeError(format("DELETEPROPERTYORTHROW_FAILS_AT_S", P));
    return NormalCompleion(success);
}
function OrdinaryDefineOwnProperty(O, P, D) {
    var current = OrdinaryGetOwnProperty(O, P);
    var extensible = getInternalSlot(O, SLOTS.EXTENSIBLE);
    return ValidateAndApplyPropertyDescriptor(O, P, extensible, D, current);
}
/*
function GetOwnProperty(O, P) {
    return OrdinaryGetOwnProperty(O, P);
}
*/
function OrdinaryGetOwnProperty(O, P) {
    Assert(IsPropertyKey(P));
    var D = Object.create(null); // value: undefined, writable: true, enumerable: true, configurable: true };
    var X = readPropertyDescriptor(O, P);
    if (X === undefined) return;

    if (IsDataDescriptor(X)) {
        D.value = X.value;
        D.writable = X.writable;
    } else if (IsAccessorDescriptor(X)) {
        D.set = X.set;
        D.get = X.get;
    }
    D.configurable = X.configurable;
    D.enumerable = X.enumerable;
    return D;
}
function ToPropertyKey(P) {
    if ((P = ifAbrupt(P)) && (isAbrupt(P) || P instanceof SymbolPrimitiveType)) return P;
    return ToString(P);
}
function GetOwnPropertyKeys(O, type) {
    var obj = ToObject(O);
    if (isAbrupt(obj = ifAbrupt(obj))) return obj;
    var keys;
    // differ from spec a little (i had to add a backref on desc coz there is only es5id as key)
    if (type === "symbol") {
        keys = OwnPropertySymbols(O);
    } else if (type === "string") {
        keys = OwnPropertyKeys(O);
    }
    if (isAbrupt(keys = ifAbrupt(keys))) return keys;
    var nameList = [];
    var gotAllNames = false;
    var next, nextKey;
    while (!gotAllNames) {
        next = IteratorStep(keys);
        if (isAbrupt(next = ifAbrupt(next))) {
    	    return next;
    	}
        if (!next) gotAllNames = true;
        else {
            nextKey = IteratorValue(next);
            if (isAbrupt(nextKey = ifAbrupt(nextKey))) return nextKey;

            // differs from spec if (Type(nextKey)==type) by if (type == "") above
        	nameList.push(nextKey);

        }
    }
    return CreateArrayFromList(nameList);
}
function OwnPropertyKeys(O, type) {
    var keys = [];
    var bindings = getInternalSlot(O,SLOTS.BINDINGS);
    var key;
    for (key in bindings) {
        keys.push(key);
    }
    return MakeListIterator(keys);
}
function OwnPropertyKeysAsList(O) {
    var keys = [];
    var bindings = getInternalSlot(O, SLOTS.BINDINGS);
    var key;
    for (key in bindings) {
        keys.push(key);
    }
    return keys;
}
/*
    trying to fix es5id and Object.getOwnPropertySymbols
    a) backref (a-)
    b) second global registry (of all symbols, no matter what the user says)
*/
function OwnPropertySymbols(O) {
    var keys = [];
    var symbols = getInternalSlot(O, SLOTS.SYMBOLS);
    var key, desc;
    for (key in symbols) {
        if (desc = symbols[key]) {
            Assert(desc.symbol.es5id === key, "symbol key and backref should be the same");
            keys.push(desc.symbol); // the backref desc.symbol is stuffed into in writePropertyDescriptor()
        }
    }
    return MakeListIterator(keys);
}