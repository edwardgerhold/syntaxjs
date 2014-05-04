/**
 * Created by root on 30.03.14.
 */
function Put(O, P, V, Throw) {
    Assert(Type(O) === OBJECT, "o has to be an object");
    Assert(IsPropertyKey(P), "property key p expected");
    Assert(Throw === true || Throw === false, "throw has to be false or true");
    var success = callInternalSlot(SLOTS.SET, O, P, V, O);
    if (isAbrupt(success = ifAbrupt(success))) return success;
    if (success === false && Throw === true) return newTypeError( "Put: success false and throw true at P=" + P);
    return success;
}

function DefineOwnPropertyOrThrow(O, P, D) {
    Assert(Type(O) === OBJECT, "object expected");
    Assert(IsPropertyKey(P), "P has to be a valid property key");
    var success = callInternalSlot(SLOTS.DEFINEOWNPROPERTY, O, P, D);
    if (isAbrupt(success = ifAbrupt(success))) return success;
    if (success === false) return newTypeError( "DefinePropertyOrThrow: DefineOwnProperty has to return true. But success is false. At P="+P);
    return success;
}

function DeletePropertyOrThrow(O, P) {
    Assert(Type(O) === OBJECT, "object expected");
    Assert(IsPropertyKey(P), "P has to be a valid property key");
    var success = Delete(O, P);
    if (isAbrupt(success = ifAbrupt(success))) return success;
    if (success === false) return newTypeError( "DeletePropertyOrThrow: Delete failed.");
    return success;
}

function OrdinaryDefineOwnProperty(O, P, D) {
    var current = OrdinaryGetOwnProperty(O, P);
    var extensible = getInternalSlot(O, SLOTS.EXTENSIBLE);
    return ValidateAndApplyPropertyDescriptor(O, P, extensible, D, current);
}

function GetOwnProperty(O, P) {
    return OrdinaryGetOwnProperty(O, P);
}

function OrdinaryGetOwnProperty(O, P) {
    Assert(IsPropertyKey(P), "P has to be a valid property key");
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
    var bindings = getInternalSlot(O,"Bindings");
    var key;
    for (key in bindings) {
        keys.push(key);
    }
    return MakeListIterator(keys);
}

function OwnPropertyKeysAsList(O) {
    var keys = [];
    var bindings = getInternalSlot(O, "Bindings");
    var key;
    for (key in bindings) {
        keys.push(key);
    }
    return keys;
}

/*
    trying to fix es5id and Object.getOwnPropertySymbols
*/

function OwnPropertySymbols(O) {
    var keys = [];
    var symbols = getInternalSlot(O, "Symbols");
    var key, desc;
    for (key in symbols) {
        if (desc = symbols[key]) {
            Assert(desc.symbol.es5id === key, "symbol key and backref should be the same");
            keys.push(desc.symbol); // the backref desc.symbol is stuffed into in writePropertyDescriptor()
        }
    }
    return MakeListIterator(keys);
}
