
// ===========================================================================================================
// Array Constructor (not the exotic object type returned by)
// ===========================================================================================================

function IsSparseArray(A) {
    var len = Get(A, "length");
    var elem;
    for (var i = 0, j = ToUint32(len); i < j; i++) {
        elem = Get(A, ToString(i));
        if (isAbrupt(elem = ifAbrupt(elem))) return elem;
        if (elem === undefined) return true;
    }
    return false;
}

MakeConstructor(ArrayConstructor, true, ArrayPrototype);
setInternalSlot(ArrayPrototype, "Prototype", ObjectPrototype);

DefineOwnProperty(ArrayConstructor, $$create, {
    value: CreateBuiltinFunction(realm, function $$create(thisArg, argList) {
        var F = thisArg;
        var proto = GetPrototypeFromConstructor(F, "%ArrayPrototype%");
        if (isAbrupt(proto = ifAbrupt(proto))) return proto;
        var obj = ArrayCreate(undefined, proto);
        return obj;
    }),
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(ArrayConstructor, $$toStringTag, {
    value: "Array",
    enumerable: false,
    writable: false,
    configurable: false
});

setInternalSlot(ArrayConstructor, "Call", function (thisArg, argList) {

    var O = thisArg;
    var array;
    var intLen;
    var F, proto;
    var defineStatus;
    var len;
    var k;
    var putStatus;
    var numberOfArgs;
    var Pk, itemK;
    var items;

    numberOfArgs === argList.length;
    if (numberOfArgs === 1) {
        len = GetValue(argList[0]);
        if (Type(O) === "object" && !getInternalSlot(O, "ArrayInitialisationState")) {
            setInternalSlot(O, "ArrayInitialisationState", true);
            array = O;
        } else {
            F = this;
            proto = OrdinaryCreateFromConstructor(F, "%ArrayPrototype");
            if (isAbrupt(proto)) return proto;
            proto = ifAbrupt(proto);
            array = ArrayCreate(0, proto);
        }
        array = ifAbrupt(array);
        if (isAbrupt(array)) return array;
        if (Type(len) !== "number") {
            defineStatus = DefineOwnPropertyOrThrow(array, "0", {
                value: len,
                writable: true,
                enumerable: true,
                configurable: true
            });
            if (isAbrupt(defineStatus)) return defineStatus;
            intLen = 1;
        } else {
            intLen = ToUint32(len);
            if (intLen != len) return withError("Range", "Array(len): intLen is not equal to len");
        }
        putStatus = Put(array, "length", intLen, true);
        if (isAbrupt(putStatus)) return putStatus;
        return array;

    } else {
        len = GetValue(argList[0]);
        if (Type(O) === "object" && !getInternalSlot(O, "ArrayInitialisationState")) {
            setInternalSlot(O, "ArrayInitialisationState", true);
            array = O;
        } else {
            F = this;
            proto = OrdinaryCreateFromConstructor(F, "%ArrayPrototype");
            if (isAbrupt(proto)) return proto;
            proto = ifAbrupt(proto);
            array = ArrayCreate(0, proto);
        }

        array = ifAbrupt(array);
        if (isAbrupt(array)) return array;
        k = 1;
        items = argList;

        while (k < numberOfArgs) {
            Pk = ToString(k);
            itemK = items[k];
            defineStatus = DefineOwnPropertyOrThrow(array, Pk, {
                value: itemK,
                writable: true,
                enumerable: true,
                configurable: true

            });
            if (isAbrupt(defineStatus)) return defineStatus;
            k = k + 1;
        }
        putStatus = Put(array, "length", numberOfArgs, true);
        if (isAbrupt(putStatus)) return putStatus;
        return array;
    }

});
setInternalSlot(ArrayConstructor, "Construct", function (argList) {
    var F = this;
    var argumentsList = argList;
    return OrdinaryConstruct(F, argumentsList);
});
DefineOwnProperty(ArrayConstructor, "length", {
    value: 1,
    enumerable: false,
    writable: false,
    configurable: false
});
DefineOwnProperty(ArrayConstructor, "prototype", {
    value: ArrayPrototype,
    enumerable: false,
    writable: false,
    configurable: false
});

DefineOwnProperty(ArrayConstructor, "isArray", {
    value: CreateBuiltinFunction(realm, function isArray(thisArg, argList) {
        var arg = GetValue(argList[0]);
        // if (Type(arg) !== "object") return false;
        if (arg instanceof ArrayExoticObject) return true;
        return false;
    }),
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(ArrayConstructor, "of", {
    value: CreateBuiltinFunction(realm, function of(thisArg, argList) {
        var items = CreateArrayFromList(argList);
        var lenValue = Get(items, "length");
        var C = thisArg;
        var newObj;
        var A;
        var len = ToInteger(lenValue);
        if (IsConstructor(C)) {
            newObj = OrdinaryConstruct(C, [len]);
            A = ToObject(newObj);
        } else {
            A = ArrayCreate(len);
        }
        if (isAbrupt(A = ifAbrupt(A))) return A;
        var k = 0;
        var Pk, kValue, defineStatus, putStatus;
        while (k < len) {
            Pk = ToString(k);
            kValue = Get(items, Pk);
            defineStatus = DefineOwnPropertyOrThrow(A, Pk, {
                value: kValue,
                writable: true,
                configurable: true,
                enumerable: true
            });
            if (isAbrupt(defineStatus)) return defineStatus;
            k = k + 1;
        }
        putStatus = Put(A, "length", len, true);
        if (isAbrupt(putStatus)) return putStatus;
        return A;

    }),
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(ArrayConstructor, "from", {
    value: CreateBuiltinFunction(realm, function from(thisArg, argList) {
        var C = thisArg;
        var arrayLike = argList[0];
        var mapfn = argList[1];
        var thisArg2 = argList[2];
        var T;
        var items = ToObject(arrayLike);
        var mapping = false;
        var len, lenValue;
        var k;
        var iterator;
        var done, Pk, kValue, defineStatus, putStatus, kPresent, mappedValue;
        var newObj, A;
        if (isAbrupt(items = ifAbrupt(items))) return items;
        if (mapfn == undefined) {
            mapping = true;
        } else {
            if (!IsCallable(mapfn)) return withError("Type", "Array.from: mapfn is not callable.");
            if (thisArg2) T = thisArg2;
            else T = undefined;
            mapping = true;

        }
        var usingIterator = HasProperty(items, $$iterator);

        var next, nextValue;
        if (usingIterator) {
            iterator = GetIterator(items);
            if (IsConstructor(C)) {
                newObj = OrdinaryConstruct(C, []);
                A = ToObject(newObj);
            } else {
                A = ArrayCreate(0);
            }
            while (!done) {

                Pk = ToString(k);
                next = IteratorNext(iterator);
                if (isAbrupt(next)) return next;
                next = ifAbrupt(next);
                done = IteratorComplete(next);
                if (isAbrupt(done)) return done;
                done = ifAbrupt(done);
                if (done) {

                }
                nextValue = IteratorValue(next);
                if (isAbrupt(nextValue)) return nextValue;
                nextValue = ifAbrupt(nextValue);
                if (mapping) {
                    mappedValue = mapfn.Call(T, [nextValue]);
                    if (isAbrupt(mappedValue)) return mappedValue;
                    mappedValue = ifAbrupt(mappedValue);

                } else mappedValue = nextValue;

                defineStatus = DefineOwnPropertyOrThrow(A, Pk, {
                    value: mappedValue,
                    writable: true,
                    enumberable: true,
                    configurable: true
                });

                if (isAbrupt(defineStatus)) return defineStatus;

                k = k + 1;
            }

        } else {

            // Assert(items is array like and no iterator)
            lenValue = Get(items, "length");
            len = ToInteger(lenValue);
            if (isAbrupt(len)) return len;
            if (IsConstructor(C)) {
                newObj = OrdinaryConstruct(C, [len]);
                A = ToObject(newObj);
            } else {
                A = ArrayCreate(len);
            }
            k = 0;
            while (k < len) {
                Pk = ToString(k);
                kPresent = HasProperty(items, Pk);
                if (isAbrupt(kPresent)) return kPresent;
                if (kPresent) {
                    kValue = Get(items, Pk);
                    if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
                    if (mapping) {
                        mappedValue = mapfn.Call(T, [kValue, k, items]);
                        if (isAbrupt(mappedValue = ifAbrupt(mappedValue))) return mappedValue;
                        defineStatus = DefineOwnPropertyOrThrow(A, Pk, {
                            value: mappedValue,
                            writable: true,
                            configurable: true,
                            enumerable: true
                        });

                    } else mappedValue = kValue;

                }
                k = k + 1;
            }

        }
        putStatus = Put(A, "length", len, true);
        if (isAbrupt(putStatus)) return putStatus;
        return A;
    }),
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(ArrayPrototype, "constructor", {
    value: ArrayConstructor,
    enumerable: false,
    writable: false,
    configurable: true
});

DefineOwnProperty(ArrayPrototype, "toString", {
    value: CreateBuiltinFunction(realm, function toString(thisArg, argList) {
        var array = ToObject(thisArg);
        if (isAbrupt(array = ifAbrupt(array))) return array;
        array = GetValue(array);
        var func = Get(array, "join");
        if (isAbrupt(func = ifAbrupt(func))) return func;
        if (!IsCallable(func)) func = Get(ObjectPrototype, "toString");
        return callInternalSlot("Call", func, array, []);
    }),
    enumerable: false,
    writable: true,
    configurable: true
});

var ArrayPrototype_toLocaleString = function toLocaleString(thisArg, argList) {

};
LazyDefineBuiltinFunction(ArrayPrototype, "toLocaleString", 2, ArrayPrototype_toLocaleString);

function IsConcatSpreadable(O) {
    if (isAbrupt(O)) return O;
    var spreadable = Get(O, $$isConcatSpreadable);
    if (isAbrupt(spreadable = ifAbrupt(spreadable))) return spreadable;
    if (spreadable !== undefined) return ToBoolean(spreadable);
    if (O instanceof ArrayExoticObject) return true;
    return false;
}

DefineOwnProperty(ArrayPrototype, "concat", {
    value: CreateBuiltinFunction(realm, function concat(thisArg, argList) {
        var args = argList;
        var k = 0;
        var len = args.length;
        var spreadable;
        while (k < len) {

            if (spreadable = IsConcatSpreadable(C)) {

            }
            k = k + 1;
        }
    }, 1),
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(ArrayPrototype, "join", {
    value: CreateBuiltinFunction(realm, function join(thisArg, argList) {
        var O = ToObject(thisArg);
        if (isAbrupt(O = ifAbrupt(O))) return O;
        var separator = argList[0];
        var lenVal = Get(O, "length");
        var len = ToUint32(lenVal);
        if (isAbrupt(len = ifAbrupt(len))) return len;
        if (separator === undefined) separator = ",";
        var sep = ToString(separator);
        if (len === 0) return NormalCompletion("");
        var element0 = Get(O, "0");
        var R;
        if (element0 === undefined) R = "";
        else R = ToString(element0);
        var k = 1;
        while (k < len) {
            var S = R + sep;
            var element = Get(O, ToString(k));
            var next;
            if (element === undefined || element === null) next = "";
            else next = ToString(element);
            if (isAbrupt(next = ifAbrupt(next))) return next;
            R = S + next;
            k = k + 1;
        }
        return NormalCompletion(R);
    }, 1),
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(ArrayPrototype, "pop", {
    value: CreateBuiltinFunction(realm, function pop(thisArg, argList) {
        var O = ToObject(thisArg);
        if (isAbrupt(O = ifAbrupt(O))) return O;
        var lenVal = Get(O, "length");
        var len = ToUint32(lenVal);
        if (isAbrupt(len = ifAbrupt(len))) return len;
        var putStatus, deleteStatus;
        if (len === 0) {
            putStatus = Put(O, "length", 0, true);
            if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;
            return undefined;
        } else {
            var newLen = len - 1;
            var index = ToString(newLen);
            var element = Get(O, index);
            if (isAbrupt(element = ifAbrupt(element))) return element;
            deleteStatus = DeletePropertyOrThrow(O, index);
            if (isAbrupt(deleteStatus = ifAbrupt(deleteStatus))) return deleteStatus;
            putStatus = Put(O, "length", newLen, true);
            if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;
            return NormalCompletion(element);
        }
    }),
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(ArrayPrototype, "push", {
    value: CreateBuiltinFunction(realm, function push(thisArg, argList) {
        var O = ToObject(thisArg);
        if (isAbrupt(O = ifAbrupt(O))) return O;
        var lenVal = Get(O, "length");
        var n = ToUint32(lenVal);
        if (isAbrupt(n = ifAbrupt(n))) return n;
        var items = argList;
        var E, putStatus;
        for (var i = 0, j = items.length; i < j; i++) {
            E = items[i];
            putStatus = Put(O, ToString(n), E, true);
            if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;
            n = n + 1;
        }
        putStatus = Put(O, "length", n, true);
        if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;
        return NormalCompletion(n);
    }, 1),
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(ArrayPrototype, "reverse", {
    value: CreateBuiltinFunction(realm, function reverse(thisArg, argList) {
        var O = ToObject(thisArg);
        if (isAbrupt(O = ifAbrupt(O))) return O;
        var lenVal = Get(O, "length");
        var len = ToUint32(lenVal);
        if (isAbrupt(len = ifAbrupt(len))) return len;
        var middle = Math.floor(len / 2);
        var lower = 0;
        var putStatus;
        var deleteStatus;
        while (lower < middle) {
            var upper = len - lower - 1;
            var upperP = ToString(upper);
            var lowerP = ToString(lower);
            var lowerValue = Get(O, lowerP);
            if (isAbrupt(lowerValue = ifAbrupt(lowerValue))) return lowerValue;
            var upperValue = Get(O, upperP);
            if (isAbrupt(upperValue = ifAbrupt(upperValue))) return upperValue;
            var lowerExists = HasProperty(O, lowerP);
            if (isAbrupt(lowerExists = ifAbrupt(lowerExists))) return lowerExists;
            var upperExists = HasProperty(O, upperP);
            if (isAbrupt(upperExists = ifAbrupt(upperExists))) return upperExists;
            if (lowerExists === true && upperExists === true) {
                putStatus = Put(O, lowerP, upperValue, true);
                if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;
                putStatus = Put(O, upperP, lowerValue, true);
                if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;

            } else if (lowerExists === false && upperExists === true) {

                putStatus = Put(O, lowerP, upperValue, true);
                if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;
                deleteStatus = DeletePropertyOrThrow(O, upperP);
                if (isAbrupt(deleteStatus = ifAbrupt(deleteStatus))) return deleteStatus;

            } else if (lowerExists === true && upperExists === false) {

                deleteStatus = DeletePropertyOrThrow(O, lowerP);
                if (isAbrupt(deleteStatus = ifAbrupt(deleteStatus))) return deleteStatus;
                putStatus = Put(O, upperP, lowerValue, true);
                if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;

            }

            lower = lower + 1;
        }
        return NormalCompletion(O);
    }),
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(ArrayPrototype, "shift", {
    value: CreateBuiltinFunction(realm, function shift(thisArg, argList) {
        var O = ToObject(thisArg);
        if (isAbrupt(O = ifAbrupt(O))) return O;
        var lenVal = Get(O, "length");
        var len = ToUint32(lenVal);
        if (isAbrupt(len = ifAbrupt(len))) return len;

    }),
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(ArrayPrototype, "slice", {
    value: CreateBuiltinFunction(realm, function slice(thisArg, argList) {
        var start = argList[0];
        var end = argList[1];
        var O = ToObject(thisArg);
        var A = ArrayCreate(0);
        if (isAbrupt(O = ifAbrupt(O))) return O;
        var lenVal = Get(O, "length");
        var len = ToUint32(lenVal);
        if (isAbrupt(len = ifAbrupt(len))) return len;

        var relativeStart = ToInteger(start);
        if (isAbrupt(relativeStart = ifAbrupt(relativeStart))) return relativeStart;

        var k;
        if (relativeStart < 0) k = max((len + relativeStart), 0);
        else k = min(relativeStart, len);
        var relativeEnd;
        if (end === undefined) relativeEnd = len;
        else relativeEnd = ToInteger(end);
        if (isAbrupt(relativeEnd = ifAbrupt(relativeEnd))) return relativeEnd;
        var final;
        if (relativeEnd < 0) final = max((len + relativeEnd), 0);
        else final = min(relativeEnd, len);
        var n = 0;
        var putStatus, status;
        while (k < final) {
            var Pk = ToString(k);
            var kPresent = HasProperty(O, Pk);
            if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
            if (kPresent) {
                var kValue = Get(O, Pk);
                if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
                status = CreateDataProperty(A, ToString(n), kValue);
                if (isAbrupt(status)) return status;
                if (status === false) return withError("Type", "slice: CreateDataProperty on new Array returned false");
            }
            k = k + 1;
            n = n + 1;
        }
        putStatus = Put(A, "length", n, true);
        if (isAbrupt(putStatus)) return putStatus;
        return NormalCompletion(A);
    }, 2),
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(ArrayPrototype, "sort", {
    value: CreateBuiltinFunction(realm, function sort(thisArg, argList) {
        var O = ToObject(thisArg);
        if (isAbrupt(O = ifAbrupt(O))) return O;
        var lenVal = Get(O, "length");
        var len = ToUint32(lenVal);
        if (isAbrupt(len = ifAbrupt(len))) return len;

    }),
    enumerable: false,
    writable: true,
    configurable: true
});

var ArrayPrototype_splice = function splice(thisArg, argList) {
    var start = argList[0];
    var deleteCount = argList[1];
    var items = argList.slice(2);
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var lenVal = Get(O, "length");
    var len = ToLength(lenVal);
    if (isAbrupt(len = ifAbrupt(len))) return len;
    var relativeStart = ToInteger(start);
    if (isAbrupt(relativeStart = ifAbrupt(relativeStart))) return relativeStart;
    var actualStart;
    if (relativeStart < 0) actualStart = max((len+relativeStart),0);
    else actualStart=min(relativeStart,len);
    if (start === undefined) {
        var actualDeleteCount = 0;
    } else if (deleteCount === undefined) {
        actualDeleteCount = len - actualStart;
    } else {
        var dc = ToInteger(deleteCount);
        if (isAbrupt(dc = ifAbrupt(dc))) return dc;
        actualDeleteCount = min(max(dc, 0), len - actualStart);
    }
    var A = undefined;
    if (O instanceof ArrayExoticObject) {
        var C = Get(O, "constructor");
        if (isAbrupt(C = ifAbrupt(C))) return C;
        if (IsConstructor(C) === true) {
            var thisRealm = getRealm();
            if (SameValue(thisRealm, getInternalSlot(C, "Realm"))) {
                A = callInternalSlot("Construct", [actualDeleteCount]);
            }
        }
    }
    if (A === undefined) {
        A = ArrayCreate(actualDeleteCount);
    }
    if (isAbrupt(A = ifAbrupt(A))) return A;
    var k = 0;
    while (k < actualDeleteCount) {
        var from = ToString(actualStart + k);
        var fromPresent = HasProperty(O, from);
        if (isAbrupt(fromPresent = ifAbrupt(fromPresent))) return fromPresent;
        if (fromPresent === true) {
            var fromValue = Get(O, from);
            if (isAbrupt(fromValue = ifAbrupt(fromValue))) return fromValue;
            var status = CreateDataPropertyOrThrow(A, ToString(k), fromValue);
            if (isAbrupt(status)) return status;
        }
        k = k + 1;
    }
    var putStatus = Put(A, "length", actualDeleteCount, true);
    if (isAbrupt(putStatus)) return putStatus;
    var itemCount = items.length;
    var k;
    if (itemCount < actualDeleteCount) {
        k = actualStart;
        while (k < (len - actualDeleteCount)) {
            var from = ToString(k+actualDeleteCount);
            var to = ToString(k+itemCount);
            var fromPresent = HasProperty(O, from);
            if (isAbrupt(fromPresent = ifAbrupt(fromPresent)));
            if (fromPresent  === true) {
                var fromValue = Get(O, from);
                if (isAbrupt(fromValue = ifAbrupt(fromValue))) return fromValue;
                putStatus = Put(O, to, fromValue, true);
                if (isAbrupt(putStatus)) return putStatus;

            } else {
                var deleteStatus = DeletePropertyOrThrow(O, to);
                if (isAbrupt(deleteStatus)) return deleteStatus;
            }
            k = k + 1;
        }
    } else if (itemCount > actualDeleteCount) {
        k = len - actualDeleteCount;
        while (k < actualStart) {
            var from = ToStirng(k + actualDeleteCount - 1);
            var to = ToString(k + itemCount - 1);
            var fromPresent = HasProperty(O, from);
            if (fromPresent === true) {
                var fromValue = Get(O, from);
                if (isAbrupt(fromValue = ifAbrupt(fromValue))) return fromValue;
                putStatus = Put(O, to, fromValue, true);
                if (isAbrupt(putStatus)) return putStatus;
            } else {
                deleteStatus = DeletePropertyOrThrow(O, to);
                if (isAbrupt(deleteStatus)) return deleteStatus;
            }
            k = k - 1;
        }
    }
    k = actualStart;
    var l = 0;
    while (k < actualStart) {
        var E = items[l];
        putStatus = Put(O, ToString(k), E, true);
        l = l + 1;
        k = k + 1;
        if (isAbrupt(putStatus)) return putStatus;
    }
    putStatus = Put(O, "length", len - actualDeleteCount + itemCount, true);
    if (isAbrupt(putStatus)) return putStatus;
    return NormalCompletion(A);
};
var ArrayPrototype_unshift = function unshift(thisArg, argList) {

};
LazyDefineBuiltinFunction(ArrayPrototype, "splice", 2, ArrayPrototype_splice);
LazyDefineBuiltinFunction(ArrayPrototype, "unshift", 1, ArrayPrototype_unshift);

DefineOwnProperty(ArrayPrototype, "indexOf", {
    value: CreateBuiltinFunction(realm, function indexOf(thisArg, argList) {
        var O = ToObject(thisArg);
        if (isAbrupt(O = ifAbrupt(O))) return O;
        var searchElement = argList[0];
        var fromIndex = argList[1];
        var lenValue = Get(O, "length");
        var len = ToUint32(lenValue);
        if (isAbrupt(len = ifAbrupt(len))) return len;
        var n;
        var k;
        if (fromIndex !== undefined) n = ToInteger(fromIndex);
        else n = 0;
        if (isAbrupt(n = ifAbrupt(n))) return n;
        if (len === 0) return -1;
        if (n >= 0) k = n;
        else {
            k = len - abs(n);
            if (k < 0) k = 0;
        }
        while (k < len) {
            var Pk = ToString(k);
            var kPresent = HasProperty(O, Pk);
            if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
            if (kPresent) {
                var elementK = Get(O, Pk);
                if (isAbrupt(elementK = ifAbrupt(elementK))) return elementK;
                /* Replace mit Strict EQ Abstract Op */
                var same = (searchElement === elementK);
                if (same) return NormalCompletion(k);
            }
            k = k + 1;
        }
        return NormalCompletion(-1);
    }, 1),
    enumerable: false,
    writable: true,
    configurable: true
});
DefineOwnProperty(ArrayPrototype, "lastIndexOf", {
    value: CreateBuiltinFunction(realm, function lastIndexOf(thisArg, argList) {
        var O = ToObject(thisArg);
        if (isAbrupt(O = ifAbrupt(O))) return O;
        var searchElement = argList[0];
        var fromIndex = argList[1];
        var lenValue = Get(O, "length");
        var len = ToUint32(lenValue);
        if (isAbrupt(len = ifAbrupt(len))) return len;
        var n;
        var k;
        if (len === 0) return -1;
        if (fromIndex !== undefined) n = ToInteger(fromIndex);
        else n = len - 1;
        if (isAbrupt(n = ifAbrupt(n))) return n;
        if (n >= 0) k = min(n, len - 1);
        else {
            k = len - abs(n);
        }
        while (k > 0) {
            var Pk = ToString(k);
            var kPresent = HasProperty(O, Pk);
            if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
            if (kPresent) {
                var elementK = Get(O, Pk);
                if (isAbrupt(elementK = ifAbrupt(elementK))) return elementK;
                /* Replace mit Strict EQ Abstract Op */
                var same = (searchElement === elementK);
                if (same) return NormalCompletion(k);
            }
            k = k - 1;
        }
        return NormalCompletion(-1);

    }, 1),
    enumerable: false,
    writable: true,
    configurable: true
});
DefineOwnProperty(ArrayPrototype, "forEach", {
    value: CreateBuiltinFunction(realm, function forEach(thisArg, argList) {
        var callback = argList[0];
        var T = argList[1];
        var O = ToObject(thisArg);
        if (isAbrupt(O = ifAbrupt(O))) return O;
        var lenVal = Get(O, "length");
        var len = ToUint32(lenVal);
        if (isAbrupt(len = ifAbrupt(len))) return len;
        if (!IsCallable(callback)) return withError("Type", "forEach: callback is not a function.");
        if (argList.length < 2) T = undefined;
        var k = 0;
        while (k < len) {
            var Pk = ToString(k);
            var kPresent = HasProperty(O, Pk);
            if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
            if (kPresent) {
                var kValue = Get(O, Pk);
                if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
                var funcResult = callInternalSlot("Call", callback, T, [kValue, k, O]);
                if (isAbrupt(funcResult)) return funcResult;
            }
            k = k + 1;
        }
        return NormalCompletion(undefined);
    }),
    enumerable: false,
    writable: true,
    configurable: true
});
DefineOwnProperty(ArrayPrototype, "map", {
    value: CreateBuiltinFunction(realm, function map(thisArg, argList) {

        var callback = argList[0];
        var T = argList[1];
        var O = ToObject(thisArg);
        if (isAbrupt(O = ifAbrupt(O))) return O;
        var lenVal = Get(O, "length");
        var len = ToUint32(lenVal);
        if (!IsCallable(callback)) return withError("Type", "map: callback is not a function.");
        if (argList.length < 2) T = undefined;
        var k = 0;
        var A = ArrayCreate(len);
        while (k < len) {
            var Pk = ToString(k);
            var kPresent = HasProperty(O, Pk);
            if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
            if (kPresent) {
                var kValue = Get(O, Pk);
                if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
                var mappedValue = callInternalSlot("Call", callback, T, [kValue, k, O]);
                if (isAbrupt(mappedValue = ifAbrupt(mappedValue))) return mappedValue;
                callInternalSlot("DefineOwnProperty", A, Pk, {
                    value: mappedValue,
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
            }
            k = k + 1;
        }
        return NormalCompletion(A);
    }),
    enumerable: false,
    writable: true,
    configurable: true
});
DefineOwnProperty(ArrayPrototype, "filter", {
    value: CreateBuiltinFunction(realm, function filter(thisArg, argList) {

        var callback = argList[0];
        var T = argList[1];
        var O = ToObject(thisArg);
        if (isAbrupt(O = ifAbrupt(O))) return O;
        var lenVal = Get(O, "length");
        var len = ToUint32(lenVal);
        if (!IsCallable(callback)) return withError("Type", "filter: callback is not a function.");
        if (argList.length < 2) T = undefined;
        var k = 0;
        var to = 0;
        var A = ArrayCreate(len);
        while (k < len) {
            var Pk = ToString(k);
            var kPresent = HasProperty(O, Pk);
            if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
            if (kPresent) {
                var kValue = Get(O, Pk);
                if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;

                var selected = callInternalSlot("Call", callback, T, [kValue, k, O]);
                if (isAbrupt(selected = ifAbrupt(selected))) return selected;
                if (ToBoolean(selected) === true) {

                    A.DefineOwnProperty(ToString(to), {
                        value: kValue,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                    to = to + 1;
                }
            }
            k = k + 1;
        }
        return NormalCompletion(A);
    }, 1),
    enumerable: false,
    writable: true,
    configurable: true
});

var ArrayPrototype_reduce = function reduce(thisArg, argList) {

};
var ArrayPrototype_reduceRight = function reduce(thisArg, argList) {

};

LazyDefineBuiltinFunction(ArrayPrototype, "reduce", 1, ArrayPrototype_reduce);
LazyDefineBuiltinFunction(ArrayPrototype, "reduceRight", 1, ArrayPrototype_reduceRight);

DefineOwnProperty(ArrayPrototype, "every", {
    value: CreateBuiltinFunction(realm, function every(thisArg, argList) {
        var callback = argList[0];
        var T = argList[1];
        var O = ToObject(thisArg);
        if (isAbrupt(O = ifAbrupt(O))) return O;
        var lenVal = Get(O, "length");
        var len = ToUint32(lenVal);
        if (!IsCallable(callback)) return withError("Type", "every: callback is not a function.");
        if (argList.length < 2) T = undefined;
        var k = 0;
        while (k < len) {
            var Pk = ToString(k);
            var kPresent = HasProperty(O, Pk);
            if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
            if (kPresent) {
                var kValue = Get(O, Pk);
                if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
                var testResult = callInternalSlot("Call", callback, T, [kValue, k, O]);
                if (isAbrupt(testResult = ifAbrupt(testResult))) return testResult;
                if (ToBoolean(testResult) === false) return NormalCompletion(false);
            }
            k = k + 1;
        }
        return NormalCompletion(true);
    }, 1),
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(ArrayPrototype, "some", {
    value: CreateBuiltinFunction(realm, function some(thisArg, argList) {
        var callback = argList[0];
        var T = argList[1];
        var O = ToObject(thisArg);
        if (isAbrupt(O = ifAbrupt(O))) return O;
        var lenVal = Get(O, "length");
        var len = ToUint32(lenVal);
        if (!IsCallable(callback)) return withError("Type", "some: callback is not a function.");
        if (argList.length < 2) T = undefined;
        var k = 0;
        while (k < len) {
            var Pk = ToString(k);
            var kPresent = HasProperty(O, Pk);
            if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
            if (kPresent) {
                var kValue = Get(O, Pk);
                if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
                var testResult = callInternalSlot("Call", callback, T, [kValue, k, O]);
                if (isAbrupt(testResult = ifAbrupt(testResult))) return testResult;
                if (ToBoolean(testResult) === true) return NormalCompletion(true);
            }
            k = k + 1;
        }
        return NormalCompletion(false);
    }, 1),
    enumerable: false,
    writable: true,
    configurable: true
});

var ArrayPrototype_predicate = function (thisArg, argList) {

};
var ArrayPrototype_findIndex = function (thisArg, argList) {

};

LazyDefineBuiltinFunction(ArrayPrototype, "predicate", 1, ArrayPrototype_predicate);
LazyDefineBuiltinFunction(ArrayPrototype, "findIndex", 1, ArrayPrototype_findIndex);


DefineOwnProperty(ArrayPrototype, "entries", {
    value: CreateBuiltinFunction(realm, function entries(thisArg, argList) {
        var O = ToObject(thisArg);
        if (isAbrupt(O)) return O;
        return CreateArrayIterator(O, "key+value");
    }),
    enumerable: false,
    writable: true,
    configurable: true
});
DefineOwnProperty(ArrayPrototype, "keys", {
    value: CreateBuiltinFunction(realm, function keys(thisArg, argList) {
        var O = ToObject(thisArg);
        if (isAbrupt(O)) return O;
        return CreateArrayIterator(O, "key");
    }),
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(ArrayPrototype, "values", {
    value: CreateBuiltinFunction(realm, function values(thisArg, argList) {
        var O = ToObject(thisArg);
        if (isAbrupt(O)) return O;
        return CreateArrayIterator(O, "value");
    }),
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(ArrayPrototype, $$iterator, {
    value: CreateBuiltinFunction(realm, function $$iterator(thisArg, argList) {
        var O = ToObject(thisArg);
        if (isAbrupt(O = ifAbrupt(O))) return O;
        return CreateArrayIterator(O, "value");
    }),
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(ArrayPrototype, $$unscopables, {
    value: (function () {
        var blackList = ObjectCreate();
        CreateDataProperty(blackList, "find", true);
        CreateDataProperty(blackList, "findIndex", true);
        CreateDataProperty(blackList, "fill", true);
        CreateDataProperty(blackList, "copyWithin", true);
        CreateDataProperty(blackList, "entries", true);
        CreateDataProperty(blackList, "keys", true);
        CreateDataProperty(blackList, "values", true);
        return blackList;
    }()),
    enumerable: false,
    writable: true,
    configurable: true
});