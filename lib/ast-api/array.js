function CreateArrayFromList(list) {
    var array = ArrayCreate(list.length);
    for (var i = 0, j = list.length; i < j; i++) {
        array.Set(ToString(i), list[i], array);
    }
    return array;
}
function CreateListFromArrayLike(arrayLike) {
    var list = [];
    for (var i = 0, j = Get(arrayLike, "length"); i < j; i++) {
        list.push(unwrap(Get(arrayLike, ToString(i))));
    }
    return list;
}
function CreateArrayIterator(array, kind) {
    var O = ToObject(array);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var proto = getIntrinsic(INTRINSICS.ARRAYITERATORPROTOTYPE);
    var iterator = ObjectCreate(proto);
    setInternalSlot(iterator, SLOTS.ITERATEDOBJECT, O);
    setInternalSlot(iterator, SLOTS.ARRAYITERATIONNEXTINDEX, 0);
    setInternalSlot(iterator, SLOTS.ARRAYITERATIONKIND, kind);
    return iterator;
}
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
function IsArray(A) {
    return A instanceof ArrayExoticObject;
}
var ArrayConstructor_call = function (thisArg, argList) {
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
    numberOfArgs = argList.length;

    if (numberOfArgs === 1) {
        len = GetValue(argList[0]);
        if (Type(O) === OBJECT && !getInternalSlot(O, SLOTS.ARRAYINITIALISATIONSTATE)) {
            setInternalSlot(O, SLOTS.ARRAYINITIALISATIONSTATE, true);
            array = O;
        } else {
            F = this;
            proto = OrdinaryCreateFromConstructor(F, INTRINSICS.ARRAYPROTOTYPE);
            if (isAbrupt(proto)) return proto;
            proto = ifAbrupt(proto);
            array = ArrayCreate(0, proto);
        }
        array = ifAbrupt(array);
        if (isAbrupt(array)) return array;
        if (Type(len) !== NUMBER) {
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
            if (intLen != len) return newRangeError(translate("ARRAY_LENGTH_ERROR"));
        }
        putStatus = Put(array, "length", intLen, true);
        if (isAbrupt(putStatus)) return putStatus;
        return NormalCompletion(array);

    } else {
        len = GetValue(argList[0]);
        if (Type(O) === OBJECT && !getInternalSlot(O, SLOTS.ARRAYINITIALISATIONSTATE)) {
            setInternalSlot(O, SLOTS.ARRAYINITIALISATIONSTATE, true);
            array = O;
        } else {
            F = this;
            proto = OrdinaryCreateFromConstructor(F, INTRINSICS.ARRAYPROTOTYPE);
            if (isAbrupt(proto)) return proto;
            proto = ifAbrupt(proto);
            array = ArrayCreate(0, proto);
        }

        array = ifAbrupt(array);
        if (isAbrupt(array)) return array;
        k = 0;
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
        return NormalCompletion(array);
    }

};
var ArrayConstructor_construct = function (argList) {
    var F = this;
    var argumentsList = argList;
    return OrdinaryConstruct(F, argumentsList);
};
var ArrayPrototype_toLocaleString = function toLocaleString(thisArg, argList) {

};
var ArrayPrototype_copyWithin = function (thisArg, argList) {
    var target = argList[0];
    var start = argList[1];
    var end = argList[2];
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var lenVal = Get(O, "length");
    var len = ToLength(lenVal);
    if (isAbrupt(len = ifAbrupt(len))) return len;
    var relativeTarget = ToInteger(target);
    if (isAbrupt(relativeTarget = ifAbrupt(relativeTarget))) return relativeTarget;
    var from, to, final;
    if (relativeTarget < 0) to = max((len + relativeTarget), 0);
    else to = min(relativeTarget, len);
    var relativeStart = ToInteger(start);
    if (isAbrupt(relativeStart = ifAbrupt(relativeStart))) return relativeStart;
    if (relativeStart < 0) from = max((len + relativeStart), 0);
    else from = min(relativeStart, len);
    var relativeEnd;
    if (end === undefined) relativeEnd = len;
    else relativeEnd = ToInteger(end);
    if (isAbrupt(relativeEnd = ifAbrupt(relativeEnd))) return relativeEnd;
    if (relativeEnd < 0) final = max((len + relativeEnd), 0);
    else final = min(relativeEnd, len);
    var count = min(final - from, len - to);
    var direction;
    if (from < to && (to < from + count)) {
        direction = -1;
        from = from + count - 1;
        to = to + count - 1;
    } else {
        direction = 1;
    }
    while (count > 0) {
        var fromKey = ToString(from);
        var toKey = ToString(to);
        var fromPresent = HasProperty(O, fromKey);
        if (isAbrupt(fromPresent = ifAbrupt(fromPresent))) return fromPresent;
        if (fromPresent === true) {
            var fromVal = Get(O, fromKey);
            if (isAbrupt(fromVal = ifAbrupt(fromVal))) return fromVal;
            var putStatus = Put(O, toKey, fromVal, true);
            if (isAbrupt(putStatus)) return putStatus;
        } else {
            var deleteStatus = DeletePropertyOrThrow(O, toKey);
            if (isAbrupt(deleteStatus)) return deleteStatus;
        }
        from = from + direction;
        to = to + direction;
        count = count - 1;
    }
    return NormalCompletion(O);
};
var ArrayPrototype_reduce = function reduce(thisArg, argList) {
    var callback = argList[0];
    var initialValue = argList[1];
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var lenValue = Get(O, "length");
    var len = ToLength(lenValue);
    if (isAbrupt(len = ifAbrupt(len))) return len;
    if (!IsCallable(callback)) return newTypeError(format("S_NOT_CALLABLE", "reduce: first argument"));
    var k = 0;
    var accumulator;
    if (argList.length > 1) {
        accumulator = initialValue;
    } else {
        var kPresent = false;
        while (!kPresent && (k < len)) {
            var Pk = ToString(k);
            var kPresent = HasProperty(O, Pk);
            if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
            if (kPresent) {
                accumulator = Get(O, Pk);
                if (isAbrupt(accumulator = ifAbrupt(accumulator))) return accumulator;
            }
            k = k + 1;
        }
        if (!kPresent) return newTypeError(format("S_IS_FALSE", "kPresent"));
    }
    while (k < len) {
        Pk = ToString(k);
        kPresent = HasProperty(O, Pk);
        if (kPresent) {
            var kValue = Get(O, Pk);
            if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
            accumulator = callInternalSlot(SLOTS.CALL, callback, undefined, [accumulator, kValue, k, O]);
            if (isAbrupt(accumulator = ifAbrupt(accumulator))) return accumulator;
        }
        k = k + 1;
    }
    return NormalCompletion(accumulator);
};
var ArrayPrototype_reduceRight = function reduceRight(thisArg, argList) {
    var callback = argList[0];
    var initialValue = argList[1];
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var lenValue = Get(O, "length");
    var len = ToLength(lenValue);
    if (isAbrupt(len = ifAbrupt(len))) return len;
    if (!IsCallable(callback)) return newTypeError(format("S_NOT_CALLABLE", "reduce: first argument"));
    var accumulator;
    var k = len - 1;
    if (argList.length > 1) {
        accumulator = initialValue;
    } else {
        var kPresent = false;
        while (!kPresent && (k >= 0)) {
            var Pk = ToString(k);
            kPresent = HasProperty(O, Pk);
            if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
            if (kPresent) {
                accumulator = Get(O, Pk);
                if (isAbrupt(accumulator = ifAbrupt(accumulator))) return accumulator;
            }
            k = k - 1;
        }
        if (!kPresent) return newTypeError(format("S_IS_FALSE", "kPresent"));
    }
    while (k >= 0) {
        Pk = ToString(k);
        kPresent = HasProperty(O, Pk);
        if (kPresent) {
            var kValue = Get(O, Pk);
            if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
            accumulator = callInternalSlot(SLOTS.CALL, callback, undefined, [accumulator, kValue, k, O]);
            if (isAbrupt(accumulator = ifAbrupt(accumulator))) return accumulator;
        }
        k = k - 1;
    }
    return NormalCompletion(accumulator);
};
var ArrayPrototype_unshift = function unshift(thisArg, argList) {
    var items = argList;
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var lenValue = Get(O, "length");
    var len = ToLength(lenValue);
    if (isAbrupt(len = ifAbrupt(len))) return len;
    var argCount = argList.length;
    var k = len;
    // first move 0...n to k+1..n+k+1
    while (k > 0) {
        var from = ToString(k - 1);
        var to = ToString(k + argCount - 1);
        var fromPresent = HasProperty(O, from);
        if (isAbrupt(fromPresent = ifAbrupt(fromPresent))) return fromPresent;
        if (fromPresent === true) {
            var fromValue = Get(O, from);
            if (isAbrupt(fromValue = ifAbrupt(fromValue))) return fromValue;
            var putStatus = Put(O, to, fromValue, true);
            if (isAbrupt(putStatus)) return putStatus;
        } else {
            var deleteStatus = DeletePropertyOrThrow(O, to);
            if (isAbrupt(deleteStatus)) return deleteStatus;
        }
        k = k - 1;
    }
    var j = 0;
    var i = 0;
    // secondly insert new 0..k before [k+1..n+k+1]
    while (i < items.length) {
        var E = items[i];
        var putStatus = Put(O, ToString(j), E, true);
        if (isAbrupt(putStatus)) return putSttus;
        i = i + 1;
        j = j + 1;
    }
    putStatus = Put(O, "length", len + argCount, true);
    if (isAbrupt(putStatus)) return putStatus;
    // thats unshift (renumber the old, prepend the new) == O(n) total copy and define
    return NormalCompletion(len + argCount);
};
var ArrayPrototype_findIndex = function (thisArg, argList) {
    var predicate = argList[0];
    var optThisArg = argList[1];
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var lenValue = Get(O, "length");
    var len = ToLength(lenValue);
    if (isAbrupt(len = ifAbrupt(len))) return len;
    if (!IsCallable(predicate)) return newTypeError(format("S_NOT_CALLABLE", "findIndex: predicate"));
    var T;
    if (optThisArg != undefined) T = optThisArg; else T = undefined; // or just "optThisArg = T;"
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
        if (kPresent === true) {
            var kValue = Get(O, Pk);
            if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
            var testResult = callInternalSlot(SLOTS.CALL, predicate, T, [kValue, k, O]);
            if (isAbrupt(testResult = ifAbrupt(testResult))) return testResult;
            if (ToBoolean(testResult) === true) return NormalCompletion(k);
        }
        k = k + 1;
    }
    return NormalCompletion(-1);
};
var ArrayPrototype_find = function (thisArg, argList) {
    var predicate = argList[0];
    var optThisArg = argList[1];
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var lenValue = Get(O, "length");
    var len = ToLength(lenValue);
    if (isAbrupt(len = ifAbrupt(len))) return len;
    if (!IsCallable(predicate)) return newTypeError(format("S_NOT_CALLABLE", "findIndex: predicate"));
    var T;
    if (optThisArg != undefined) T = optThisArg; else T = undefined; // or just "optThisArg = T;"
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
        if (kPresent === true) {
            var kValue = Get(O, Pk);
            if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
            var testResult = callInternalSlot(SLOTS.CALL, predicate, T, [kValue, k, O]);
            if (isAbrupt(testResult = ifAbrupt(testResult))) return testResult;
            if (ToBoolean(testResult) === true) return NormalCompletion(kValue);
        }
        k = k + 1;
    }
    return NormalCompletion(-1);
};
var ArrayPrototype_fill = function (thisArg, argList) {
    var value = argList[0];
    var start = argList[1];
    var end = argList[2];
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var lenVal = Get(O, "length");
    var len = ToLength(lenVal);
    if (isAbrupt(len = ifAbrupt(len))) return len;
    var k, final;
    var relativeStart = ToInteger(start);
    if (isAbrupt(relativeStart = ifAbrupt(relativeStart))) return relativeStart;
    if (relativeStart < 0) k = max((len + relativeStart), 0);
    else k = min(relativeStart, len);
    var relativeEnd;
    if (end === undefined) relativeEnd = len;
    else relativeEnd = ToInteger(end);
    if (isAbrupt(relativeEnd = ifAbrupt(relativeEnd))) return relativeEnd;
    if (relativeEnd < 0) final = max((len + relativeEnd), 0);
    else final = min(relativeEnd, len);
    while (k < final) {
        var Pk = ToString(k);
        var putStatus = Put(O, Pk, value, true);
        if (isAbrupt(putStatus)) return putStatus;
        k = k + 1;
    }
    return NormalCompletion(O);
};
var ArrayPrototype_values = function (thisArg, argList) {
    var O = ToObject(thisArg);
    if (isAbrupt(O)) return O;
    return CreateArrayIterator(O, "value");
};
var ArrayConstructor_$$create = function $$create(thisArg, argList) {
    var F = thisArg;
    var proto = GetPrototypeFromConstructor(F, INTRINSICS.ARRAYPROTOTYPE);
    if (isAbrupt(proto = ifAbrupt(proto))) return proto;
    var obj = ArrayCreate(undefined, proto);
    return obj;
};
var ArrayConstructor_isArray = function (thisArg, argList) {
    var arg = GetValue(argList[0]);
    return IsArray(arg);
};
var ArrayConstructor_of = function (thisArg, argList) {
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
    return NormalCompletion(A);

};
var ArrayConstructor_from = function from(thisArg, argList) {
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
        if (!IsCallable(mapfn)) return newTypeError(format("S_NOT_CALLABLE"), "Array.from: mapfn");
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
    return NormalCompletion(A);
};
var ArrayPrototype_toString = function toString(thisArg, argList) {
    var array = ToObject(thisArg);
    if (isAbrupt(array = ifAbrupt(array))) return array;
    array = GetValue(array);
    var func = Get(array, "join");
    if (isAbrupt(func = ifAbrupt(func))) return func;
    if (!IsCallable(func)) func = Get(ObjectPrototype, "toString");
    return callInternalSlot(SLOTS.CALL, func, array, []);
};
function IsConcatSpreadable(O) {
    if (Type(O) !== OBJECT) return false;
    if (isAbrupt(O)) return O;
    var spreadable = Get(O, $$isConcatSpreadable);
    if (isAbrupt(spreadable = ifAbrupt(spreadable))) return spreadable;
    if (spreadable !== undefined) return ToBoolean(spreadable);
    return O instanceof ArrayExoticObject;
}
var ArrayPrototype_concat = function (thisArg, argList) {
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var A = undefined;
    if (IsArray(O)) {
        var C = Get(O, "constructor");
        if (isAbrupt(C = isAbrupt(C))) return C;
        if (IsConstructor(C)) {
            var thisRealm = getRealm();
            if (thisRealm === getInternalSlot(C, SLOTS.REALM)) {
                A = callInternalSlot(SLOTS.CONSTRUCT, C, [0]);
                if (isAbrupt(A = ifAbrupt(A))) return A;
            }
        }
    }
    if (A === undefined) {
        A = ArrayCreate(0);
        if (isAbrupt(A = ifAbrupt(A))) return A;
    }
    var n = 0;
    var items = [O].concat(argList);
    var i = 0;
    var status;
    while (i < items.length) {
        var E = items[i];
        var spreadable = IsConcatSpreadable(E);
        if (spreadable) {
            var k = 0;
            var lenVal = Get(E, "length");
            var len = ToLength(lenVal);
            if (isAbrupt(len = ifAbrupt(len))) return len;
            while (k < len) {
                var P = ToString(k);
                var exists = HasProperty(E, P);
                if (isAbrupt(exists = ifAbrupt(exists))) return exists;
                if (exists) {
                    var subElement = Get(E, P);
                    if (isAbrupt(subElement = ifAbrupt(subElement))) return subElement;
                    status = CreateDataPropertyOrThrow(A, ToString(n), subElement);
                    if (isAbrupt(status)) return status;
                }
                n = n + 1;
                k = k + 1;
            }
        } else {
            status = CreateDataPropertyOrThrow(A, ToString(n), E);
            if (isAbrupt(status = ifAbrupt(status))) return status;
            n = n + 1;
        }
        i = i + 1;
    }
    var putStatus = Put(A, "length", n, true);
    if (isAbrupt(putStatus)) return putStatus;
    return NormalCompletion(A);
};
var ArrayPrototype_join = function join(thisArg, argList) {
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
};
var ArrayPrototype_pop = function pop(thisArg, argList) {
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
};
var ArrayPrototype_push = function push(thisArg, argList) {
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
};
var ArrayPrototype_reverse = function reverse(thisArg, argList) {
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
};
var ArrayPrototype_entries = function entries(thisArg, argList) {
    var O = ToObject(thisArg);
    if (isAbrupt(O)) return O;
    return CreateArrayIterator(O, "key+value");
};
var ArrayPrototype_keys = function keys(thisArg, argList) {
    var O = ToObject(thisArg);
    if (isAbrupt(O)) return O;
    return CreateArrayIterator(O, "key");
};
var ArrayPrototype_$$iterator = function $$iterator(thisArg, argList) {
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    return CreateArrayIterator(O, "value");
};
var ArrayPrototype_shift = function shift(thisArg, argList) {
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var lenVal = Get(O, "length");
    var len = ToUint32(lenVal);
    if (isAbrupt(len = ifAbrupt(len))) return len;
    if (len === 0) {
        var putStatus = Put(O, "length", 0, true);
        if (isAbrupt(putStatus)) return putStatus;
        return NormalCompletion(undefined);
    }
    var first = Get(O, "0");
    if (isAbrupt(first = ifAbrupt(first))) return first;
    var k = 1;
    while (k < len) {
        var from = ToString(k);
        var to = ToString(k - 1);
        var fromPresent = HasProperty(O, from);
        if (isAbrupt(fromPresent = ifAbrupt(fromPresent))) return fromPresent;
        if (fromPresent === true) {
            var fromVal = Get(O, from);
            if (isAbrupt(fromVal = ifAbrupt(fromVal))) return fromVal;
            putStatus = Put(O, to, fromVal, true);
            if (isAbrupt(putStatus)) return putStatus;
        } else {
            var deleteStatus = DeletePropertyOrThrow(O, to);
            if (isAbrupt(deleteStatus)) return deleteStatus;
        }
        k = k + 1;
    }
    deleteStatus = DeletePropertyOrThrow(O, ToString(len - 1));
    if (isAbrupt(deleteStatus)) return deleteStatus;
    putStatus = Put(O, "length", len - 1, true);
    if (isAbrupt(putStatus)) return putStatus;
    return NormalCompletion(first);
};
var ArrayPrototype_slice = function slice(thisArg, argList) {
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
            if (status === false) return newTypeError(format("CREATEDATAPROPERTY_FAILED"));
        }
        k = k + 1;
        n = n + 1;
    }
    putStatus = Put(A, "length", n, true);
    if (isAbrupt(putStatus)) return putStatus;
    return NormalCompletion(A);
};
/*
 function SortCompare(thisArg, argList) {
 var obj = thisArg;
 var j = argList[0];
 var k = argList[1];
 var jString = ToString(j);
 var kString = ToString(k);
 var hasj = HasProperty(obj, jString);
 var hask = HasProperty(obj, kString);
 if (isAbrupt(hasj=ifAbrupt(hasj))) return hasj;
 if (isAbrupt(hask=ifAbrupt(hask))) return hask;
 if (!hasj && !hask) return NormalCompletion(+0);
 if (!hasj) return NormalCompletion(1);
 if (!hask) return NormalCompletion(-1);
 var x = Get(obj, jString);
 if (isAbrupt(x = ifAbrupt(x))) return x;
 var y = Get(obj, kString);
 if (isAbrupt(y = ifAbrupt(y))) return y;
 if (x === undefined && y === undefined) return NormalCompletion(+0);
 if (x === undefined) return NormalCompletion(1);
 if (y === undefined) return NormalCompletion(-1);
 if (comparefn != undefined) {
 if (!IsCallable(comparefn)) return newTypeError("comparefn not callable");
 return callInternalSlot(SLOTS.CALL, comparefn, undefined, [x,y]);
 }
 var xString = ToString(x);
 if (isAbrupt(xString=ifAbrupt(xString))) return xString;
 var yString = ToString(y);
 if (isAbrupt(yString=ifAbrupt(yString))) return yString;
 if (xString < yString) return -1

 };
 */
var defaultCompareFn_call = function (thisArg, argList) {
    var a = argList[0];
    var b = argList[1];
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
};
var ArrayPrototype_sort = function (thisArg, argList) {
    var O = ToObject(thisArg);
    var comparefn = argList[0];
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var lenVal = Get(O, "length");
    var len = ToUint32(lenVal);
    if (isAbrupt(len = ifAbrupt(len))) return len;

    // let´s call native sort
    // for today

    var arrayToSort = CreateListFromArrayLike(O);
    if (isAbrupt(arrayToSort = ifAbrupt(arrayToSort))) return arrayToSort;

    if (!comparefn) {
        comparefn = getIntrinsic(INTRINSICS.DEFAULTCOMPARE);
    }
    if (!IsCallable(comparefn)) {
        return newTypeError("comparefn is not callable");
    }
    var sortedArray = arrayToSort.sort(function (a, b) {
        var result = unwrap(callInternalSlot(SLOTS.CALL, comparefn, undefined, [a, b]));
        return result;
    });
    return NormalCompletion(CreateArrayFromList(sortedArray));
};
var ArrayPrototype_splice = function splice(thisArg, argList) {
    var start = argList[0];
    var deleteCount = argList[1];
    var items = arraySlice(argList, 2);
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var lenVal = Get(O, "length");
    var len = ToLength(lenVal);
    if (isAbrupt(len = ifAbrupt(len))) return len;
    var relativeStart = ToInteger(start);
    if (isAbrupt(relativeStart = ifAbrupt(relativeStart))) return relativeStart;
    var actualStart;
    if (relativeStart < 0) actualStart = max((len + relativeStart), 0);
    else actualStart = min(relativeStart, len);
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
    if (IsArray(O)) {
        var C = Get(O, "constructor");
        if (isAbrupt(C = ifAbrupt(C))) return C;
        if (IsConstructor(C) === true) {
            var thisRealm = getRealm();
            if (SameValue(thisRealm, getInternalSlot(C, SLOTS.REALM))) {
                A = callInternalSlot(SLOTS.CONSTRUCT, [actualDeleteCount]);
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
    if (itemCount < actualDeleteCount) {
        k = actualStart;
        while (k < (len - actualDeleteCount)) {
            from = ToString(k + actualDeleteCount);
            var to = ToString(k + itemCount);
            fromPresent = HasProperty(O, from);
            if (isAbrupt(fromPresent = ifAbrupt(fromPresent))) return fromPresent;
            if (fromPresent === true) {
                fromValue = Get(O, from);
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
            from = ToString(k + actualDeleteCount - 1);
            to = ToString(k + itemCount - 1);
            fromPresent = HasProperty(O, from);
            if (fromPresent === true) {
                fromValue = Get(O, from);
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
var ArrayPrototype_indexOf = function indexOf(thisArg, argList) {
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
};
var ArrayPrototype_lastIndexOf = function lastIndexOf(thisArg, argList) {
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

};
var ArrayPrototype_forEach = function forEach(thisArg, argList) {
    var callback = argList[0];
    var T = argList[1];
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var lenVal = Get(O, "length");
    var len = ToUint32(lenVal);
    if (isAbrupt(len = ifAbrupt(len))) return len;
    if (!IsCallable(callback)) return newTypeError(format("S_NOT_CALLABLE", "forEach: callback"));
    if (argList.length < 2) T = undefined;
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
        if (kPresent) {
            var kValue = Get(O, Pk);
            if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
            var funcResult = callInternalSlot(SLOTS.CALL, callback, T, [kValue, k, O]);
            if (isAbrupt(funcResult)) return funcResult;
        }
        k = k + 1;
    }
    return NormalCompletion(undefined);
};
var ArrayPrototype_map = function map(thisArg, argList) {

    var callback = argList[0];
    var T = argList[1];
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var lenVal = Get(O, "length");
    var len = ToUint32(lenVal);
    if (!IsCallable(callback)) return newTypeError(format("S_NOT_CALLABLE", "map: callback"));
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
            var mappedValue = callInternalSlot(SLOTS.CALL, callback, T, [kValue, k, O]);
            if (isAbrupt(mappedValue = ifAbrupt(mappedValue))) return mappedValue;
            callInternalSlot(SLOTS.DEFINEOWNPROPERTY, A, Pk, {
                value: mappedValue,
                writable: true,
                enumerable: true,
                configurable: true
            });
        }
        k = k + 1;
    }
    return NormalCompletion(A);
};
var ArrayPrototype_filter = function filter(thisArg, argList) {

    var callback = argList[0];
    var T = argList[1];
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var lenVal = Get(O, "length");
    var len = ToUint32(lenVal);
    if (!IsCallable(callback)) return newTypeError(format("S_NOT_CALLABLE", "filter: callback"));
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

            var selected = callInternalSlot(SLOTS.CALL, callback, T, [kValue, k, O]);
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
};
var ArrayPrototype_every = function every(thisArg, argList) {
    var callback = argList[0];
    var T = argList[1];
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var lenVal = Get(O, "length");
    var len = ToUint32(lenVal);
    if (!IsCallable(callback)) return newTypeError(format("S_NOT_CALLABLE", "every: callback"));
    if (argList.length < 2) T = undefined;
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
        if (kPresent) {
            var kValue = Get(O, Pk);
            if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
            var testResult = callInternalSlot(SLOTS.CALL, callback, T, [kValue, k, O]);
            if (isAbrupt(testResult = ifAbrupt(testResult))) return testResult;
            if (ToBoolean(testResult) === false) return NormalCompletion(false);
        }
        k = k + 1;
    }
    return NormalCompletion(true);
};
var ArrayPrototype_some = function some(thisArg, argList) {
    var callback = argList[0];
    var T = argList[1];
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var lenVal = Get(O, "length");
    var len = ToUint32(lenVal);
    if (!IsCallable(callback)) return newTypeError(format("S_NOT_CALLABLE", "some: callback"));
    if (argList.length < 2) T = undefined;
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (isAbrupt(kPresent = ifAbrupt(kPresent))) return kPresent;
        if (kPresent) {
            var kValue = Get(O, Pk);
            if (isAbrupt(kValue = ifAbrupt(kValue))) return kValue;
            var testResult = callInternalSlot(SLOTS.CALL, callback, T, [kValue, k, O]);
            if (isAbrupt(testResult = ifAbrupt(testResult))) return testResult;
            if (ToBoolean(testResult) === true) return NormalCompletion(true);
        }
        k = k + 1;
    }
    return NormalCompletion(false);
};
var ArrayPrototype_first = function (thisArg, argList) {
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var result = Get(O, ToString(0));
    if (isAbrupt(result = ifAbrupt(result))) return result;
    return NormalCompletion(result);
};
var ArrayPrototype_last = function (thisArg, argList) {
    var O = ToObject(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var lenVal = Get(O, "length");
    var len = ToUint32(lenVal);
    if (isAbrupt(len = ifAbrupt(len))) return len;
    var result = Get(O, ToString(len - 1));
    if (isAbrupt(result = ifAbrupt(result))) return result;
    return NormalCompletion(result);
};