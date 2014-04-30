// ===========================================================================================================
// Set
// ===========================================================================================================

//
// Set
//

setInternalSlot(SetConstructor, "Prototype", FunctionPrototype);
setInternalSlot(SetPrototype, "Prototype", ObjectPrototype);

setInternalSlot(SetConstructor, SLOTS.CALL, function Call(thisArg, argList) {
    var iterable = argList[0];
    var comparator = argList[1];
    var set = thisArg;

    if (Type(set) !== OBJECT) return withError("Type", "set is not an object");
    if (!hasInternalSlot(set, "SetData")) return withError("Type", "SetData property missing on object");
    if (getInternalSlot(set, "SetData") !== undefined) return withError("Type", "SetData property already initialized");

    var iter;
    var hasValues, adder;
    if (iterable === undefined || iterable === null) iter = undefined;
    else {
        hasValues = HasProperty(iterable, "entries");
        if (isAbrupt(hasValues = ifAbrupt(hasValues))) return hasValues;
        if (hasValues) iter = Invoke(iterable, "entries");
        else iter = GetIterator(iterable);
        adder = Get(set, "set");
        if (isAbrupt(adder = ifAbrupt(adder))) return adder;
        if (!IsCallable(adder)) return withError("Type", "set adder (the set function) is not callable");
    }
    if (comparator !== undefined) {
        if (comparator !== "is") return withError("Range", "comparator argument has currently to be 'undefined' or 'is'");
    }

    setInternalSlot(set, "SetData", Object.create(null));
    setInternalSlot(set, "SetComparator", comparator);

    if (iter === undefined) return NormalCompletion(set);

    var next, nextItem, done, k, v, status;
    for (;;) {
        next = IteratorNext(iter);
        if (isAbrupt(next = ifAbrupt(next))) return next;
        done = IteratorComplete(next);
        if (isAbrupt(done = ifAbrupt(done))) return done;
        if (done) return NormalCompletion(set);
        nextItem = IteratorValue(next);
        if (isAbrupt(nextItem = ifAbrupt(nextItem))) return nextItem;
        k = Get(nextItem, "0");
        if (isAbrupt(k = ifAbrupt(k))) return k;
        v = Get(nextItem, "1");
        if (isAbrupt(v = ifAbrupt(v))) return v;
        status = callInternalSlot(SLOTS.CALL, adder, set, [v]);
        if (isAbrupt(status)) return status;
    }


});
setInternalSlot(SetConstructor, SLOTS.CONSTRUCT, function Construct(argList) {
    var F = this;
    var args = argList;
    return OrdinaryConstruct(F, args);
});

DefineOwnProperty(SetConstructor, $$create, {
    value: CreateBuiltinFunction(realm, function $$create(thisArg, argList) {
        var F = thisArg;
        return OrdinaryCreateFromConstructor(F, "%SetPrototype%", {
            "SetData": undefined,
            "SetComparator": undefined
        });
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(SetPrototype, $$toStringTag, {
    value: SLOTS.SET,
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(SetPrototype, "clear", {
    value: CreateBuiltinFunction(realm, function clear(thisArg, argList) {}),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(SetPrototype, "set", {
    value: CreateBuiltinFunction(realm, function set(thisArg, argList) {
        var value = argList[0];
        var S = thisArg;
        var same;
        if (Type(S) !== OBJECT) return withError("Type", "this argument is not an object");
        if (!hasInternalSlot(S, "SetData")) return withError("Type", "this argument has no set data internal slot");

        var entries = getInternalSlot(S, "SetData");

        var comparator = getInternalSlot(S, "SetComparator");
        if (comparator === undefined) same = SameValueZero;
        else same = SameValue;


        var internalKey;

        internalKey = __checkInternalUniqueKey(value, true);

        entries[internalKey] = value;

        return NormalCompletion(S);

    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(SetPrototype, "has", {
    value: CreateBuiltinFunction(realm, function has(thisArg, argList) {
        var value = argList[0];
        var S = thisArg;
        var same;
        if (Type(S) !== OBJECT) return withError("Type", "this argument is not an object");
        if (!hasInternalSlot(S, "SetData")) return withError("Type", "this argument has no map data internal slot");

        var entries = getInternalSlot(S, "SetData");

        var comparator = getInternalSlot(S, "SetComparator");
        if (comparator === undefined) same = SameValueZero;
        else same = SameValue;


        var internalKey;

        internalKey = __checkInternalUniqueKey(value);

        if (entries[internalKey] === value) return NormalCompletion(true);

        return NormalCompletion(false);

    }),
    writable: false,
    enumerable: false,
    configurable: false
});
DefineOwnProperty(SetPrototype, "delete", {
    value: CreateBuiltinFunction(realm, function _delete(thisArg, argList) {
        var value = argList[0];
        var S = thisArg;
        var same;
        if (Type(S) !== OBJECT) return withError("Type", "this argument is not an object");
        if (!hasInternalSlot(S, "SetData")) return withError("Type", "this argument has no map data internal slot");

        var entries = getInternalSlot(S, "SetData");

        var comparator = getInternalSlot(S, "SetComparator");
        if (comparator === undefined) same = SameValueZero;
        else same = SameValue;


        var internalKey;

        internalKey = __checkInternalUniqueKey(value);

        if (entries[internalKey] === value) {
            entries[internalKey] = undefined;
            delete entries[internalKey];
            return NormalCompletion(true);
        }
        return NormalCompletion(false);

    }),
    writable: false,
    enumerable: false,
    configurable: false
});


var SetPrototype_entries = function (thisArg, argList) {
    return CreateSetIterator(thisArg, "key+value");
};
var SetPrototype_keys = function (thisArg, argList) {
    return CreateSetIterator(thisArg, "key");
};
var SetPrototype_values = function (thisArg, argList) {
    return CreateSetIterator(thisArg, "value");
};

var SetPrototype_forEach = function (thisArg, argList) {

};


LazyDefineBuiltinFunction(SetPrototype, "keys", 0, SetPrototype_keys);
LazyDefineBuiltinFunction(SetPrototype, "values", 0, SetPrototype_values);
LazyDefineBuiltinFunction(SetPrototype, "entries", 0, SetPrototype_entries);
LazyDefineBuiltinFunction(SetPrototype, "forEach", 0, SetPrototype_forEach);
LazyDefineBuiltinFunction(SetPrototype, $$iterator, 0, SetPrototype_values);