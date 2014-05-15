function CreateArrayFromList(list) {
    var array = ArrayCreate(list.length);
    for (var i = 0, j = list.length; i < j; i++) {
        array.Set(ToString(i), list[i], array);
    }
    return array;
}
function CreateListFromArrayLike(arrayLike) {
    var list = [];
    for (var i = 0, j = arrayLike.length; i < j; i++) {
        list.push(arrayLike.Get(ToString(i), arrayLike))
    }
    return list;
}
function CreateArrayIterator(array, kind) {
    var O = ToObject(array);
    if (isAbrupt(O=ifAbrupt(O))) return O;
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


var ArrayConstructor_call =  function (thisArg, argList) {
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
            if (intLen != len) return newRangeError(trans("ARRAY_LENGTH_ERROR"));
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
    if (isAbrupt(O=ifAbrupt(O))) return O;
    var lenVal = Get(O, "length");
    var len = ToLength(lenVal);
    if (isAbrupt(len=ifAbrupt(len))) return len;
    var relativeTarget = ToInteger(target);
    if (isAbrupt(relativeTarget=ifAbrupt(relativeTarget))) return relativeTarget;
    var from, to, final;
    if (relativeTarget < 0) to = max((len+relativeTarget), 0);
    else to = min(relativeTarget, len);
    var relativeStart = ToInteger(start);
    if (isAbrupt(relativeStart=ifAbrupt(relativeStart))) return relativeStart;
    if (relativeStart < 0) from = max((len+relativeStart), 0);
    else from = min(relativeStart, len);
    var relativeEnd;
    if (end === undefined) relativeEnd = len;
    else relativeEnd = ToInteger(end);
    if (isAbrupt(relativeEnd=ifAbrupt(relativeEnd))) return relativeEnd;
    if (relativeEnd < 0) final = max((len+relativeEnd),0);
    else final = min(relativeEnd, len);
    var count = min(final-from, len-to);
    var direction;
    if (from < to && (to < from+count)) {
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
        if (isAbrupt(fromPresent=ifAbrupt(fromPresent))) return fromPresent;
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
    if (isAbrupt(O=ifAbrupt(O))) return O;
    var lenValue = Get(O, "length");
    var len = ToLength(lenValue);
    if (isAbrupt(len=ifAbrupt(len))) return len;
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
            if (isAbrupt(kPresent=ifAbrupt(kPresent))) return kPresent;
            if (kPresent) {
                accumulator = Get(O, Pk);
                if (isAbrupt(accumulator=ifAbrupt(accumulator))) return accumulator;
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
            if (isAbrupt(accumulator=ifAbrupt(accumulator))) return accumulator;
        }
        k = k + 1;
    }
    return NormalCompletion(accumulator);
};
var ArrayPrototype_reduceRight = function reduceRight(thisArg, argList) {
    var callback = argList[0];
    var initialValue = argList[1];
    var O = ToObject(thisArg);
    if (isAbrupt(O=ifAbrupt(O))) return O;
    var lenValue = Get(O, "length");
    var len = ToLength(lenValue);
    if (isAbrupt(len=ifAbrupt(len))) return len;
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
            if (isAbrupt(kPresent=ifAbrupt(kPresent))) return kPresent;
            if (kPresent) {
                accumulator = Get(O, Pk);
                if (isAbrupt(accumulator=ifAbrupt(accumulator))) return accumulator;
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
            if (isAbrupt(accumulator=ifAbrupt(accumulator))) return accumulator;
        }
        k = k - 1;
    }
    return NormalCompletion(accumulator);
};
var ArrayPrototype_unshift = function unshift(thisArg, argList) {
    var items = argList;
    var O = ToObject(thisArg);
    if (isAbrupt(O=ifAbrupt(O))) return O;
    var lenValue = Get(O, "length");
    var len = ToLength(lenValue);
    if (isAbrupt(len=ifAbrupt(len))) return len;
    var argCount = argList.length;
    var k = len;
    // first move 0...n to k+1..n+k+1
    while (k > 0) {
        var from = ToString(k-1);
        var to = ToString(k+argCount-1);
        var fromPresent = HasProperty(O,from);
        if (isAbrupt(fromPresent=ifAbrupt(fromPresent))) return fromPresent;
        if (fromPresent === true) {
            var fromValue = Get(O, from);
            if (isAbrupt(fromValue=ifAbrupt(fromValue))) return fromValue;
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
        if(isAbrupt(putStatus)) return putSttus;
        i = i + 1;
        j = j + 1;
    }
    putStatus = Put(O, "length", len+argCount, true);
    if (isAbrupt(putStatus)) return putStatus;
    // thats unshift (renumber the old, prepend the new) == O(n) total copy and define
    return NormalCompletion(len+argCount);
};

var ArrayPrototype_findIndex = function (thisArg, argList) {
    var predicate = argList[0];
    var optThisArg = argList[1];
    var O = ToObject(thisArg);
    if (isAbrupt(O=ifAbrupt(O))) return O;
    var lenValue = Get(O, "length");
    var len = ToLength(lenValue);
    if (isAbrupt(len=ifAbrupt(len))) return len;
    if (!IsCallable(predicate)) return newTypeError(format("S_NOT_CALLABLE", "findIndex: predicate"));
    var T;
    if (optThisArg != undefined) T = optThisArg; else T = undefined; // or just "optThisArg = T;"
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (isAbrupt(kPresent=ifAbrupt(kPresent))) return kPresent;
        if (kPresent === true) {
            var kValue = Get(O, Pk);
            if (isAbrupt(kValue=ifAbrupt(kValue))) return kValue;
            var testResult = callInternalSlot(SLOTS.CALL, predicate, T, [kValue, k, O]);
            if (isAbrupt(testResult=ifAbrupt(testResult))) return testResult;
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
    if (isAbrupt(O=ifAbrupt(O))) return O;
    var lenValue = Get(O, "length");
    var len = ToLength(lenValue);
    if (isAbrupt(len=ifAbrupt(len))) return len;
    if (!IsCallable(predicate)) return newTypeError(format("S_NOT_CALLABLE", "findIndex: predicate"));
    var T;
    if (optThisArg != undefined) T = optThisArg; else T = undefined; // or just "optThisArg = T;"
    var k = 0;
    while (k < len) {
        var Pk = ToString(k);
        var kPresent = HasProperty(O, Pk);
        if (isAbrupt(kPresent=ifAbrupt(kPresent))) return kPresent;
        if (kPresent === true) {
            var kValue = Get(O, Pk);
            if (isAbrupt(kValue=ifAbrupt(kValue))) return kValue;
            var testResult = callInternalSlot(SLOTS.CALL, predicate, T, [kValue, k, O]);
            if (isAbrupt(testResult=ifAbrupt(testResult))) return testResult;
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
    if (isAbrupt(O=ifAbrupt(O))) return O;
    var lenVal = Get(O, "length");
    var len = ToLength(lenVal);
    if (isAbrupt(len=ifAbrupt(len))) return len;
    var k, final;
    var relativeStart = ToInteger(start);
    if (isAbrupt(relativeStart=ifAbrupt(relativeStart))) return relativeStart;
    if (relativeStart < 0) k = max((len+relativeStart), 0);
    else k = min(relativeStart, len);
    var relativeEnd;
    if (end === undefined) relativeEnd = len;
    else relativeEnd = ToInteger(end);
    if (isAbrupt(relativeEnd=ifAbrupt(relativeEnd))) return relativeEnd;
    if (relativeEnd < 0) final = max((len+relativeEnd),0);
    else final = min(relativeEnd, len);
    while (k < final) {
        var Pk = ToString(k);
        var putStatus = Put(O, Pk, value, true);
        if (isAbrupt(putStatus)) return putStatus;
        k = k + 1;
    }
    return NormalCompletion(O);
};

// %ArrayProto_values === Array.prototype.values
var ArrayPrototype_values = function (thisArg, argList) {
    var O = ToObject(thisArg);
    if (isAbrupt(O)) return O;
    return CreateArrayIterator(O, "value");
};
