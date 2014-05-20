var UniqueMapAndSetES5Counter = 0;
function __checkInternalUniqueKey(value, writeIfUndefined) {
    var internalKey;
    if (Type(value) === OBJECT) {
        internalKey = getInternalSlot(value, SLOTS.UNIQUEMAPANDSETES5KEY);
        if (internalKey === undefined) {
            internalKey = (++UniqueMapAndSetES5Counter) + Math.random();
            if (writeIfUndefined) setInternalSlot(value, SLOTS.UNIQUEMAPANDSETES5KEY, internalKey);
        }
        return internalKey;
    }
    internalKey = value;
    if (typeof value === "string") internalKey = "str_" + internalKey;
    if (typeof value === "number") internalKey = "num_" + internalKey;
    if (typeof value === "boolean") internalKey = "" + internalKey;
    if (typeof value === "undefined") internalKey = "" + internalKey;
    if (value === null) internalKey = internalKey + "" + internalKey;
    return internalKey;
}
var MapConstructor_call = function Call(thisArg, argList) {

    var iterable = argList[0];
    var comparator = argList[1];
    var map = thisArg;

    if (Type(map) !== OBJECT) return newTypeError( "map is not an object");
    if (!hasInternalSlot(map, SLOTS.MAPDATA)) return newTypeError( "MapData property missing on object");
    if (getInternalSlot(map, SLOTS.MAPDATA) !== undefined) return newTypeError( "MapData property already initialized");

    var iter;
    var hasValues, adder;
    if (iterable === undefined || iterable === null) iter = undefined;
    else {
        hasValues = HasProperty(iterable, "entries");
        if (isAbrupt(hasValues = ifAbrupt(hasValues))) return hasValues;
        if (hasValues) iter = Invoke(iterable, "entries");
        else iter = GetIterator(iterable);
        adder = Get(map, "set");
        if (isAbrupt(adder = ifAbrupt(adder))) return adder;
        if (!IsCallable(adder)) return newTypeError( "map adder (the set function) is not callable");
    }
    if (comparator !== undefined) {
        if (comparator !== "is") return newRangeError( "comparator argument has currently to be 'undefined' or 'is'");
    }

    setInternalSlot(map, SLOTS.MAPDATA, Object.create(null));
    setInternalSlot(map, SLOTS.MAPCOMPARATOR, comparator);

    if (iter === undefined) return NormalCompletion(map);

    var next, nextItem, done, k, v, status;
    for (;;) {
        next = IteratorNext(iter);
        if (isAbrupt(next = ifAbrupt(next))) return next;
        done = IteratorComplete(next);
        if (isAbrupt(done = ifAbrupt(done))) return done;
        if (done) return NormalCompletion(map);
        nextItem = IteratorValue(next);
        if (isAbrupt(nextItem = ifAbrupt(nextItem))) return nextItem;
        k = Get(nextItem, "0");
        if (isAbrupt(k = ifAbrupt(k))) return k;
        v = Get(nextItem, "1");
        if (isAbrupt(v = ifAbrupt(v))) return v;
        status = callInternalSlot(SLOTS.CALL, adder, map, [k, v]);
        if (isAbrupt(status)) return status;
    }
};
var MapConstructor_construct = function (argList) {
    var F = this;
    var args = argList;
    return OrdinaryConstruct(F, args);
};
var MapPrototype_has = function has(thisArg, argList) {

    var same;
    var key = argList[0];
    var M = thisArg;

    if (Type(M) !== OBJECT) return newTypeError( "this argument is not an object");
    if (!hasInternalSlot(M, SLOTS.MAPDATA)) return newTypeError( "this argument has no map data internal slot");

    var entries = getInternalSlot(M, SLOTS.MAPDATA);
    var comparator = getInternalSlot(M, SLOTS.MAPCOMPARATOR);

    if (comparator === undefined) same = SameValueZero;
    else same = SameValue;
    var internalKey;
    internalKey = __checkInternalUniqueKey(key);
    var record = entries[internalKey];
    if (record) {
        return NormalCompletion(true);
    }
    return NormalCompletion(false);
};
var MapPrototype_get = function (thisArg, argList) {
    var key = argList[0];
    var M = thisArg;
    var same;
    if (Type(M) !== OBJECT) return newTypeError( "this argument is not an object");
    if (!hasInternalSlot(M, SLOTS.MAPDATA)) return newTypeError( "this argument has no map data internal slot");
    var entries = getInternalSlot(M, SLOTS.MAPDATA);
    var comparator = getInternalSlot(M, SLOTS.MAPCOMPARATOR);
    if (comparator === undefined) same = SameValueZero;
    else same = SameValue;
    var internalKey;
    internalKey = __checkInternalUniqueKey(key);
    var record = entries[internalKey];
    if (record) {
        var value = record.value;
        return NormalCompletion(value);
    }
    return NormalCompletion(undefined);
};
var MapPrototype_set = function (thisArg, argList) {
    var key = argList[0];
    var value = argList[1];
    var M = thisArg;
    var same;
    if (Type(M) !== OBJECT) return newTypeError( "this argument is not an object");
    if (!hasInternalSlot(M, SLOTS.MAPDATA)) return newTypeError( "this argument has no map data internal slot");
    var entries = getInternalSlot(M, SLOTS.MAPDATA);
    var comparator = getInternalSlot(M, SLOTS.MAPCOMPARATOR);
    if (comparator === undefined) same = SameValueZero;
    else same = SameValue;
    var internalKey;
    internalKey = __checkInternalUniqueKey(key, true);
    var record = entries[internalKey];
    if (!record) {
        entries[internalKey] = {
            key: key,
            value: value
        };
    } else {
        record.value = value;
    }
    return NormalCompletion(M);
};
var MapPrototype_delete = function (thisArg, argList) {
    var key = argList[0];
    var M = thisArg;
    var same;
    if (Type(M) !== OBJECT) return newTypeError( "this argument is not an object");
    if (!hasInternalSlot(M, SLOTS.MAPDATA)) return newTypeError( "this argument has no map data internal slot");
    var entries = getInternalSlot(M, SLOTS.MAPDATA);
    var comparator = getInternalSlot(M, SLOTS.MAPCOMPARATOR);
    if (comparator === undefined) same = SameValueZero;
    else same = SameValue;

    var internalKey;

    internalKey = __checkInternalUniqueKey(key);

    var record = entries[internalKey];
    if (record) {
        entries[internalKey] = undefined;
        delete entries[internalKey];
        return NormalCompletion(true);
    }

    return NormalCompletion(false);
};
var MapPrototype_keys = function (thisArg, argList) {
    var O = thisArg;
    return CreateMapIterator(O, "key");
};
var MapPrototype_values = function (thisArg, argList) {
    var O = thisArg;
    return CreateMapIterator(O, "value");
};
var MapPrototype_entries = function (thisArg, argList) {
    var O = thisArg;
    return CreateMapIterator(O, "key+value");
};
var MapPrototype_forEach = function (thisArg, argList) {};
var MapPrototype_clear = function (thisArg, argList) {};
var MapConstructor_$$create = function $$create(thisArg, argList) {
    return OrdinaryCreateFromConstructor(thisArg, INTRINSICS.MAPPROTOTYPE, [
        SLOTS.MAPDATA,
        SLOTS.MAPCOMPARATOR
    ]);
};