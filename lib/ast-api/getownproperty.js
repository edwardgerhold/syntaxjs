/**
 * Big Coding Issue
 *
 * I told myself i will do the functions the normal way for normal javascript objects
 * and design them so, that i can change it for typed array.
 *
 * now it seems like i write it twice and develop a second set of these functions which
 * do the same work, but on a few bytes and pointers in a typed array.
 *
 * The thing is to integrate both kinds of functions in one library, that we have a world
 * wonder with both variants working
 *
 * Looking downwards, these functions look like they can be used without modification
 * (except if i walk over an Object.create())
 * But thinking about reusing them and just replacing the property access and the putvalue
 * targets to write to the heap32 array, it doesn´t speed up the thing.
 * I could compile to a special instruction set, which would make me rewrite all of these
 * functions to become called with one bytecode and pointers or pool addresses..
 * I even think of add_rr (reg,reg) add_pr (pool,reg), add_pp (pool.pool), add_rp (reg, pool)
 * to make it completly easy to add registers, pool values and values from otherwhere.
 *
 * But i think i will break my head for one month to learn assembly. I´ve spotted a free ebook
 * and look towards printing it 4 on 1 page to read it, for programming x86 linux assembly, something
 * which i did only for a few interrupts till today. I became good in C, but wait. This will happen
 * now. Be patient, then i can help for nothing.
 *
 */

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
    Assert(Type(O) === OBJECT, "O != OBJECT");
    Assert(IsPropertyKey(P));
    var success = Delete(O, P);
    if (isAbrupt(success = ifAbrupt(success))) return success;
    if (success === false) return newTypeError(format("DELETEPROPERTYORTHROW_FAILS_AT_S", P));
    return NormalCompletion(success);
}
function OrdinaryDefineOwnProperty(O, P, D) {
    var current = OrdinaryGetOwnProperty(O, P);
    var extensible = getInternalSlot(O, SLOTS.EXTENSIBLE);
    return ValidateAndApplyPropertyDescriptor(O, P, extensible, D, current);
}
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
    var bindings = getInternalSlot(O, SLOTS.BINDINGS);
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
function OwnPropertySymbols(O) {
    var realm = getRealm();
    var leakyMap = realm.leakySymbolMap;
    var keys = [];
    var symbols = getInternalSlot(O, SLOTS.SYMBOLS);
    var key, desc;
    for (key in symbols) {
        if (desc = symbols[key]) {
            var s = leakyMap[key]
            keys.push(s);
        }
    }
    return MakeListIterator(keys);
}