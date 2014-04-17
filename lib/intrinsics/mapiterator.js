
//
// Map Iterator
//

function CreateMapIterator(map, kind) {
    var M = ToObject(map);
    if (isAbrupt(M = ifAbrupt(M))) return M;
    if (!hasInternalSlot(M, "MapData")) return withError("Type", "object has no internal MapData slot");
    var entries = getInternalSlot(M, "MapData");
    var MapIteratorPrototype = Get(getIntrinsics(), "%MapIteratorPrototype%");
    var iterator = ObjectCreate(MapIteratorPrototype, {
        "Map": undefined,
        "MapNextIndex": undefined,
        "MapIterationKind": undefined
    });
    setInternalSlot(iterator, "Map", entries);
    setInternalSlot(iterator, "MapNextIndex", 0);
    setInternalSlot(iterator, "MapIterationKind", kind);
    return iterator;
}


DefineOwnProperty(MapIteratorPrototype, $$toStringTag, {
    value: "Map Iterator",
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(MapIteratorPrototype, $$iterator, {
    value: CreateBuiltinFunction(realm, function $$iterator(thisArg, argList) {
        return thisArg;
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(MapIteratorPrototype, "next", {
    value: CreateBuiltinFunction(realm, function next(thisArg, argList) {
        var O = thisArg;
        if (Type(O) !== OBJECT) return withError("Type", "the this value is not an object");
        if (!hasInternalSlot(O, "Map") || !hasInternalSlot(O, "MapNextIndex") || !hasInternalSlot(O, "MapIterationKind")) return withError("Type", "iterator has not all of the required internal properties");
        var entries = getInternalSlot(O, "Map");
        var kind = getInternalSlot(O, "MapIterationKind");
        var index = getInternalSlot(O, "MapNextIndex");
        var result;
        var internalKeys = Object.keys(entries); // deviate from spec
        var len = internalKeys.length;
        while (index < len) {
            var e = entries[internalKeys[index]];
            index = index + 1;
            setInternalSlot(O, "MapNextIndex", index);
            if (e.key !== empty) {
                if (kind === "key") result = e.key;
                else if (kind === "value") result = e.value;
                else {
                    Assert(kind === "key+value", "map iteration kind has to be key+value");
                    var result = ArrayCreate(2);
                    CreateDataProperty(result, "0", e.key);
                    CreateDataProperty(result, "1", e.value);
                }
                return CreateItrResultObject(result, false);
            }
        }
        return CreateItrResultObject(undefined, true);
    }),
    writable: false,
    enumerable: false,
    configurable: false
});
