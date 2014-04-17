// ===========================================================================================================
// String Iterator
// ===========================================================================================================


DefineOwnProperty(StringIteratorPrototype, "next", {
    value: CreateBuiltinFunction(realm, function next(thisArg, argList) {
        var O = thisArg;
        if (Type(O) !== OBJECT)
            return withError("Type", "the this value is not an object");

        if (!hasInternalSlot(O, "IteratedString") || !hasInternalSlot(O, "IteratorNextIndex") || !hasInternalSlot(O, "IterationKind"))
            return withError("Type", "iterator has not all of the required internal properties");

        var string = getInternalSlot(O, "IteratedString");
        var kind = getInternalSlot(O, "IterationKind");
        var index = getInternalSlot(O, "IteratorNextIndex");
        var result;


        string = ToString(string);
        var len = string.length;

        if (index < len) {
            var ch = string[index];
            setInternalSlot(O, "IteratorNextIndex", index + 1);
            if (kind === "key") result = index;
            else if (kind === "value") result = ch;
            else {
                Assert(kind === "key+value", "string iteration kind has to be key+value");
                var result = ArrayCreate(2);
                CreateDataProperty(result, "0", index);
                CreateDataProperty(result, "1", ch);
            }
            return CreateItrResultObject(result, false);
        }
        return CreateItrResultObject(undefined, true);
    }),
    enumerable: false,
    configurable: false,
    writable: false
});

function CreateStringIterator(string, kind) {
    var iterator = ObjectCreate(StringIteratorPrototype, {
        "IteratedString": undefined,
        "IteratorNextIndex": undefined,
        "IterationKind": undefined
    });
    // for-of before worked without. there must be a mistake somewhere (found in ToPrimitive)
    // if (string instanceof StringExoticObject) string = getInternalSlot(string, "StringData");
    // ---
    setInternalSlot(iterator, "IteratedString", string);
    setInternalSlot(iterator, "IteratorNextIndex", 0);
    setInternalSlot(iterator, "IterationKind", kind);
    return iterator;
}


LazyDefineBuiltinConstant(StringIteratorPrototype, $$toStringTag, "String Iterator");
