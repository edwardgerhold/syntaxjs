// ===========================================================================================================
// Map
// ===========================================================================================================

//
// Map, WeakMap, Set
//
//
// To achieve constant O(1) XS within ES5 i do one thing, as long
// as i have not even written the compiler and bytecode
// I set an internal Property with a String Value, which can be used
// as a key to get the record with the entry very fast.
//
// for (k in listobj) is listing in order of creation
// that is a tradeoff for es5
// i do not like array.indexOf, coz each lookup is up to O(n)
// and we want it to be constant

var uniqueInMapKey = 0;

setInternalSlot(MapConstructor, "Prototype", FunctionPrototype);
setInternalSlot(MapPrototype, "Prototype", ObjectPrototype);

setInternalSlot(MapConstructor, "Call", function Call(thisArg, argList) {

    var iterable = argList[0];
    var comparator = argList[1];
    var map = thisArg;

    if (Type(map) !== "object") return withError("Type", "map is not an object");
    if (!hasInternalSlot(map, "MapData")) return withError("Type", "MapData property missing on object");
    if (getInternalSlot(map, "MapData") !== undefined) return withError("Type", "MapData property already initialised");

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
        if (!IsCallable(adder)) return withError("Type", "map adder (the set function) is not callable");
    }
    if (comparator !== undefined) {
        if (comparator !== "is") return withError("Range", "comparator argument has currently to be 'undefined' or 'is'");
    }

    setInternalSlot(map, "MapData", Object.create(null));
    setInternalSlot(map, "MapComparator", comparator);

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
        status = callInternalSlot("Call", adder, map, [k, v]);
        if (isAbrupt(status)) return status;
    }
    return NormalCompletion(map);
});

setInternalSlot(MapConstructor, "Construct", function Construct(argList) {
    var F = this;
    var args = argList;
    return OrdinaryConstruct(F, args);
});

DefineOwnProperty(MapConstructor, "prototype", {
    value: MapPrototype,
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(MapPrototype, "constructor", {
    value: MapConstructor,
    writable: false,
    enumerable: false,
    configurable: false
});
DefineOwnProperty(MapPrototype, "has", {
    value: CreateBuiltinFunction(realm, function has(thisArg, argList) {

        var same;
        var key = argList[0];
        var M = thisArg;

        if (Type(M) !== "object") return withError("Type", "this argument is not an object");
        if (!hasInternalSlot(M, "MapData")) return withError("Type", "this argument has no map data internal slot");

        var entries = getInternalSlot(M, "MapData");
        var comparator = getInternalSlot(M, "MapComparator");

        if (comparator === undefined) same = SameValueZero;
        else same = SameValue;

        var internalKey;

        internalKey = __checkInternalUniqueKey(key);

        var record = entries[internalKey];
        if (record) {
            return NormalCompletion(true);
        }
        return NormalCompletion(false);
    }),
    writable: false,
    enumerable: false,
    configurable: false
});
DefineOwnProperty(MapPrototype, "get", {
    value: CreateBuiltinFunction(realm, function get(thisArg, argList) {
        var key = argList[0];
        var M = thisArg;
        var same;
        if (Type(M) !== "object") return withError("Type", "this argument is not an object");
        if (!hasInternalSlot(M, "MapData")) return withError("Type", "this argument has no map data internal slot");
        var entries = getInternalSlot(M, "MapData");
        var comparator = getInternalSlot(M, "MapComparator");
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

    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(MapPrototype, "set", {
    value: CreateBuiltinFunction(realm, function set(thisArg, argList) {
        var key = argList[0];
        var value = argList[1];
        var M = thisArg;
        var same;
        if (Type(M) !== "object") return withError("Type", "this argument is not an object");
        if (!hasInternalSlot(M, "MapData")) return withError("Type", "this argument has no map data internal slot");

        var entries = getInternalSlot(M, "MapData");

        var comparator = getInternalSlot(M, "MapComparator");
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

    }),
    writable: false,
    enumerable: false,
    configurable: false
});
DefineOwnProperty(MapPrototype, "delete", {
    value: CreateBuiltinFunction(realm, function _delete(thisArg, argList) {
        var key = argList[0];
        var M = thisArg;
        var same;
        if (Type(M) !== "object") return withError("Type", "this argument is not an object");
        if (!hasInternalSlot(M, "MapData")) return withError("Type", "this argument has no map data internal slot");
        var entries = getInternalSlot(M, "MapData");
        var comparator = getInternalSlot(M, "MapComparator");
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
    }, 1, "delete"),
    writable: false,
    enumerable: false,
    configurable: false
});
DefineOwnProperty(MapPrototype, "forEach", {
    value: CreateBuiltinFunction(realm, function forEach(thisArg, argList) {

    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(MapPrototype, "clear", {
    value: CreateBuiltinFunction(realm, function clear(thisArg, argList) {}),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(MapPrototype, "keys", {
    value: CreateBuiltinFunction(realm, function keys(thisArg, argList) {
        var O = thisArg;
        return CreateMapIterator(O, "key");
    }),
    writable: false,
    enumerable: false,
    configurable: false
});
DefineOwnProperty(MapPrototype, "values", {
    value: CreateBuiltinFunction(realm, function values(thisArg, argList) {
        var O = thisArg;
        return CreateMapIterator(O, "value");
    }),
    writable: false,
    enumerable: false,
    configurable: false
});
DefineOwnProperty(MapPrototype, "entries", {
    value: CreateBuiltinFunction(realm, function entries(thisArg, argList) {
        var O = thisArg;
        return CreateMapIterator(O, "key+value");
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(MapConstructor, $$create, {
    value: CreateBuiltinFunction(realm, function $$create(thisArg, argList) {
        var F = thisArg;
        return OrdinaryCreateFromConstructor(F, "%MapPrototype%", {
            "MapData": undefined,
            "MapComparator": undefined
        });
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(MapPrototype, $$toStringTag, {
    value: "Map",
    writable: false,
    enumerable: false,
    configurable: false
});

function __checkInternalUniqueKey(value, writeIfUndefined) {
    var internalKey;
    if (Type(value) === "object") {
        internalKey = getInternalSlot(value, "__mapSetInternalUniqueKey__");
        if (internalKey === undefined) {
            internalKey = (++__mapSetUniqueInternalUniqueKeyCounter__) + Math.random();
            if (writeIfUndefined) setInternalSlot(value, "__mapSetInternalUniqueKey__", internalKey);
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