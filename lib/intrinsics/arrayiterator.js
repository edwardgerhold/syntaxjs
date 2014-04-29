// ===========================================================================================================
// Array Iterator
// ===========================================================================================================

setInternalSlot(ArrayIteratorPrototype, "Prototype", ObjectPrototype);
DefineOwnProperty(ArrayIteratorPrototype, $$iterator, {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        return thisArg;
    }, 0, "[Symbol.iterator]"),
    enumerable: false,
    configurable: false,
    writable: false
});

DefineOwnProperty(ArrayIteratorPrototype, $$toStringTag, {
    value: "Array Iterator",
    enumerable: false,
    configurable: false,
    writable: false
});

DefineOwnProperty(ArrayIteratorPrototype, "next", {
    value: CreateBuiltinFunction(realm, function next(thisArg, argList) {
        var O = thisArg;
        if (Type(O) !== OBJECT) return withError("Type", "ArrayIterator.prototype.next: O is not an object. ");

        if (!hasInternalSlot(O, "IteratedObject") || !hasInternalSlot(O, "ArrayIterationNextIndex") || !hasInternalSlot(O, "ArrayIterationKind")) {
            return withError("Type", "Object has not all ArrayIterator properties.");
        }

        var a = getInternalSlot(O, "IteratedObject");
        var index = getInternalSlot(O, "ArrayIterationNextIndex");
        var itemKind = getInternalSlot(O, "ArrayIterationKind");
        var lenValue = Get(a, "length");
        var len = ToUint32(lenValue);
        var elementKey, found, result, elementValue;
        if (isAbrupt(len = ifAbrupt(len))) return len;
        if ((/sparse/).test(itemKind)) {
            var found = false;
            while (!found && (index < len)) {
                elementKey = ToString(index);
                found = HasProperty(a, elementKey);
                if (isAbrupt(found)) return found;
                if (!(found = ifAbrupt(found))) index = index + 1;
            }
        }
        if (index >= len) {
            setInternalSlot(O, "ArrayIterationNextIndex", +Infinity);
            return CreateItrResultObject(undefined, true);
        }
        elementKey = ToString(index);
        setInternalSlot(O, "ArrayIterationNextIndex", index + 1);

        if (itemKind === "key+value") {
            elementValue = Get(a, elementKey);
            if (isAbrupt(elementValue = ifAbrupt(elementValue))) return elementValue;

            result = ArrayCreate(2);
            callInternalSlot("DefineOwnProperty", result, "0", {
                value: elementKey,
                writable: true,
                enumerable: true,
                configurable: true
            });
            callInternalSlot("DefineOwnProperty", result, "1", {
                value: elementValue,
                writable: true,
                enumerable: true,
                configurable: true
            });
            callInternalSlot("DefineOwnProperty", result, "length", {
                value: 2,
                writable: true,
                eumerable: false,
                configurable: false
            });
            return CreateItrResultObject(result, false);

        } else if (itemKind === "value") {
            elementValue = Get(a, elementKey);
            if (isAbrupt(elementValue = ifAbrupt(elementValue))) return elementValue;
            return CreateItrResultObject(elementValue, false);
        } else if (itemKind === "key") {
            return CreateItrResultObject(elementKey, false);
        }

    }),
    writable: false,
    enumerable: false,
    configurable: false
});
