//
// SetIterator
//
function CreateSetIterator(set, kind) {
    var S = ToObject(set);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    if (!hasInternalSlot(S, "SetData")) return withError("Type", "object has no internal SetData slot");
    var entries = getInternalSlot(S, "SetData");
    var SetIteratorPrototype = Get(getIntrinsics(), "%SetIteratorPrototype%");
    var iterator = ObjectCreate(SetIteratorPrototype, {
        "IteratedSet": undefined,
        "SetNextIndex": undefined,
        "SetIterationKind": undefined
    });
    setInternalSlot(iterator, "IteratedSet", entries);
    setInternalSlot(iterator, "SetNextIndex", 0);
    setInternalSlot(iterator, "SetIterationKind", kind);
    return iterator;
}

DefineOwnProperty(SetIteratorPrototype, "constructor", {
    value: undefined,
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(SetIteratorPrototype, $$toStringTag, {
    value: "Set Iterator",
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(SetIteratorPrototype, $$iterator, {
    value: CreateBuiltinFunction(realm, function $$iterator(thisArg, argList) {
        return thisArg;
    }),
    writable: false,
    enumerable: false,
    configurable: false
});

DefineOwnProperty(SetIteratorPrototype, "next", {
    value: CreateBuiltinFunction(realm, function next(thisArg, argList) {
        var O = thisArg;
        if (Type(O) !== "object") return withError("Type", "the this value is not an object");
        if (!hasInternalSlot(O, "Set") || !hasInternalSlot(O, "SetNextIndex") || !hasInternalSlot(O, "SetIterationKind")) return withError("Type", "iterator has not all of the required internal properties");
        var entries = getInternalSlot(O, "Set");
        var kind = getInternalSlot(O, "SetIterationKind");
        var index = getInternalSlot(O, "SetNextIndex");
        var result;
        while (index < len) {
            var e = entries[index];
            index = index + 1;
            setInternalSlot(O, "SetNextIndex", index);
            if (e !== empty) {
                if (kind === "key+value") {
                    Assert(kind === "key+value", "set iteration kind has to be key+value");
                    var result = ArrayCreate(2);
                    CreateDataProperty(result, "0", e);
                    CreateDataProperty(result, "1", e);
                    return CreateItrResultObject(result, false);
                }
                return CreateItrResultObject(e, false);
            }
        }
        return CreateItrResultObject(undefined, true);
    }),
    writable: false,
    enumerable: false,
    configurable: false
});
