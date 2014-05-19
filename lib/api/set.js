var SetConstructor_call = function Call(thisArg, argList) {
    var iterable = argList[0];
    var comparator = argList[1];
    var set = thisArg;
    if (Type(set) !== OBJECT) return newTypeError( "set is not an object");
    if (!hasInternalSlot(set, SLOTS.SETDATA)) return newTypeError( "SetData property missing on object");
    if (getInternalSlot(set, SLOTS.SETDATA) !== undefined) return newTypeError( "SetData property already initialized");
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
        if (!IsCallable(adder)) return newTypeError( "set adder (the set function) is not callable");
    }
    if (comparator !== undefined) {
        if (comparator !== "is") return newRangeError( "comparator argument has currently to be 'undefined' or 'is'");
    }
    setInternalSlot(set, SLOTS.SETDATA, Object.create(null));
    setInternalSlot(set, SLOTS.SETCOMPARATOR, comparator);
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


};
var SetConstructor_construct = function (argList) {
    return OrdinaryConstruct(this, argList);
};
var SetConstructor_$$create = function $$create(thisArg, argList) {
    var F = thisArg;
    return OrdinaryCreateFromConstructor(F, INTRINSICS.SETPROTOTYPE, [
        SLOTS.SETDATA,
        SLOTS.SETCOMPARATOR
    ]);
};
var SetPrototype_clear = function clear(thisArg, argList) {};
var SetPrototype_set = function (thisArg, argList) {
    var value = argList[0];
    var S = thisArg;
    var same;
    if (Type(S) !== OBJECT) return newTypeError( "this argument is not an object");
    if (!hasInternalSlot(S, SLOTS.SETDATA)) return newTypeError( "this argument has no set data internal slot");
    var entries = getInternalSlot(S, SLOTS.SETDATA);
    var comparator = getInternalSlot(S, SLOTS.SETCOMPARATOR);
    if (comparator === undefined) same = SameValueZero;
    else same = SameValue;
    var internalKey;
    internalKey = __checkInternalUniqueKey(value, true);
    entries[internalKey] = value;
    return NormalCompletion(S);
};
var SetPrototype_has = function (thisArg, argList) {
    var value = argList[0];
    var S = thisArg;
    var same;
    if (Type(S) !== OBJECT) return newTypeError( "this argument is not an object");
    if (!hasInternalSlot(S, SLOTS.SETDATA)) return newTypeError( "this argument has no map data internal slot");
    var entries = getInternalSlot(S, SLOTS.SETDATA);
    var comparator = getInternalSlot(S, SLOTS.SETCOMPARATOR);
    if (comparator === undefined) same = SameValueZero;
    else same = SameValue;
    var internalKey;
    internalKey = __checkInternalUniqueKey(value);
    if (entries[internalKey] === value) return NormalCompletion(true);
    return NormalCompletion(false);
};
var SetPrototype_delete = function (thisArg, argList) {
    var value = argList[0];
    var S = thisArg;
    var same;
    if (Type(S) !== OBJECT) return newTypeError( "this argument is not an object");
    if (!hasInternalSlot(S, SLOTS.SETDATA)) return newTypeError( "this argument has no map data internal slot");
    var entries = getInternalSlot(S, SLOTS.SETDATA);
    var comparator = getInternalSlot(S, SLOTS.SETCOMPARATOR);
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
};
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