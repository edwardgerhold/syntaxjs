/**
 * Created by root on 17.05.14.
 */

var ArrayIteratorPrototype_$$iterator = function (thisArg, argList) {
    return thisArg;
};

var ArrayIteratorPrototype_next = function (thisArg, argList) {
    var O = thisArg;
    if (Type(O) !== OBJECT) return newTypeError( "ArrayIterator.prototype.next: O is not an object. ");

    if (!hasInternalSlot(O, SLOTS.ITERATEDOBJECT) || !hasInternalSlot(O, SLOTS.ARRAYITERATIONNEXTINDEX) || !hasInternalSlot(O, SLOTS.ARRAYITERATIONKIND)) {
        return newTypeError( "Object has not all ArrayIterator properties.");
    }

    var a = getInternalSlot(O, SLOTS.ITERATEDOBJECT);
    var index = getInternalSlot(O, SLOTS.ARRAYITERATIONNEXTINDEX);
    var itemKind = getInternalSlot(O, SLOTS.ARRAYITERATIONKIND);
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
        setInternalSlot(O, SLOTS.ARRAYITERATIONNEXTINDEX, +Infinity);
        return CreateItrResultObject(undefined, true);
    }
    elementKey = ToString(index);
    setInternalSlot(O, SLOTS.ARRAYITERATIONNEXTINDEX, index + 1);

    if (itemKind === "key+value") {
        elementValue = Get(a, elementKey);
        if (isAbrupt(elementValue = ifAbrupt(elementValue))) return elementValue;

        result = ArrayCreate(2);
        callInternalSlot(SLOTS.DEFINEOWNPROPERTY, result, "0", {
            value: elementKey,
            writable: true,
            enumerable: true,
            configurable: true
        });
        callInternalSlot(SLOTS.DEFINEOWNPROPERTY, result, "1", {
            value: elementValue,
            writable: true,
            enumerable: true,
            configurable: true
        });
        callInternalSlot(SLOTS.DEFINEOWNPROPERTY, result, "length", {
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

};
