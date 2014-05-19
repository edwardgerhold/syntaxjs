/**
 * Created by root on 15.05.14.
 */
function StringCreate(StringData) {
    return OrdinaryConstruct(getIntrinsic(INTRINSICS.STRING), [StringData]);
}
function thisStringValue(value) {
    if (value instanceof CompletionRecord) return thisStringValue(value.value);
    if (typeof value === "string") return value;
    if (Type(value) === STRING) return value;
    if (Type(value) === OBJECT && hasInternalSlot(value, SLOTS.STRINGDATA)) {
        var b = getInternalSlot(value, SLOTS.STRINGDATA);
        if (typeof b === "string") return b;
    }
    return newTypeError( "thisStringValue: value is not a String", value);
}
var StringConstructor_$$create = function (thisArg, argList) {
    var F = thisArg;
    var obj = StringExoticObject();
    var proto = GetPrototypeFromConstructor(F, INTRINSICS.STRINGPROTOTYPE);
    if (isAbrupt(proto = ifAbrupt(proto))) return proto;
    setInternalSlot(obj, SLOTS.PROTOTYPE, proto);
    setInternalSlot(obj, SLOTS.STRINGDATA, undefined);
    return obj;
};
var StringConstructor_call = function Call(thisArg, argList) {
    var O = thisArg;
    var s;
    if (!argList.length) s = "";
    else s = ToString(argList[0]);
    if (isAbrupt(s = ifAbrupt(s))) return s;
    if (Type(O) === OBJECT && hasInternalSlot(O, SLOTS.STRINGDATA) && (getInternalSlot(O, SLOTS.STRINGDATA) === undefined)) {
        var length = s.length;
        var status = DefineOwnPropertyOrThrow(O, "length", {
            value: length,
            writable: false,
            enumerable: false,
            configurable: false
        });
        if (isAbrupt(status = ifAbrupt(status))) return status;
        setInternalSlot(O, SLOTS.STRINGDATA, s);
        return O;
    }
    return s;
};
var StringConstructor_construct = function Construct(argList) {
    return OrdinaryConstruct(this, argList);
};
var normalizeOneOfs = {
    "NFC":true,
    "NFD":true,
    "NFKC":true,
    "NFKD":true
};
var StringPrototype_normalize = function (thisArg, argList) {
    var from = argList[0];
    var S = CheckObjectCoercible(thisArg);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    S = ToString(S);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    if (from === undefined) from = "NFC";
    var f = ToString(from);
    if ((f = ifAbrupt(f)) && ifAbrupt(f)) return f;
    if (!normalizeOneOfs[f]) return newRangeError( "f is not one of nfc, nfd, nfkc, nfkd.");
    if (S.normalize) {
        // powers of native es.
        var ns = S.normalize(f);
    } else {
        // off point, but a fill-in
        ns = ""+S;
    }
    return NormalCompletion(ns);
};
var StringPrototype_replace = function (thisArg, argList) {
    var searchValue = argList[0];
    var replaceValue = argList[1];
    var S = CheckObjectCoercible(thisArg);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    S = ToString(S);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    if (Type(searchValue) === OBJECT && HasProperty(searchValue, $$isRegExp)) {
        return Invoke(searchValue, "replace", [string, replaceValue]);
    }
    var searchString = ToString(searchValue);
    if (isAbrupt(searchString = ifAbrupt(searchString))) return searchString;
    var i = 0;
    var len = S.length;
    var searchLen = searchString.length;
    while (i < len) {
        if ((S[i] == searchString[0]) && (S[i+searchLen-1] == searchString[searchLen-1])) {
            var k = 0;
            var match = true;
            while (k < searchLen) {
                if (S[k] !== searchString[k]) {
                    match = false;
                    break;
                }
                k = k + 1;
            }

            if (match) {
                var matched = searchString;
                if (IsCallable(replaceValue)) {
                    var replValue = callInternalSlot(SLOTS.CALL, replaceValue, undefined, [matched, pos, string]);
                    if (isAbrupt(replValue = ifAbrupt(replValue))) return replValue;
                    var replStr = ToString(replValue);
                    if (isAbrupt(replStr = ifAbrupt(replStr))) return replStr;

                } else {
                    var capstures = [];
                    var replStr = GetReplaceSubstitution(matched, string, pos, captures);

                }
                var tailPos = pos - matched.length;
                var newString;


            }
        }
        i = i + 1;
    }
    return NormalCompletion(string);
};
var StringPrototype_match = function (thisArg, argList) {
    var regexp = argList[0];
    var S = CheckObjectCoercible(thisArg);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    S = ToString(S);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var rx;
    if (Type(regexp) === OBJECT && HasProperty(regexp, $$isRegExp)) {
        rx = regexp;
    } else {
        rx = RegExpCreate(regexp, undefined);
    }
    if (isAbrupt(rx = ifAbrupt(rx))) return rx;
    return Invoke(rx, "match", []);
};
var StringPrototype_repeat = function (thisArg, argList) {
    var count = argList[0];
    var S = CheckObjectCoercible(thisArg);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    S = ToString(S);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var n = ToInteger(count);
    if (isAbrupt(n = ifAbrupt(n))) return n;
    if (n < 0) return newRangeError( "n is less than 0");
    if (n === Infinity) return newRangeError( "n is infinity");
    var T = "";
    for (var i = 0; i < n; i++) T+=S;
    return NormalCompletion(T);
};
var StringPrototype_contains = function (thisArg, argList) {
    var searchString = argList[0];
    var position = argList[1];
    var S = CheckObjectCoercible(thisArg);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    S = ToString(S);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var searchStr = ToString(searchString);
    var pos = ToInteger(position);
    var len = S.length;
    var start = min(max(pos, 0), len);
    var searchLen = searchStr.length;
    var i = start;
    var j = len;
    var result = false;
    while (i < len-searchLen) {

        if ((searchStr[0] === S[i]) && (searchStr[searchLen-1] === S[i+searchLen-1])) {
            result = true;
            for (var k = i+1, l = i+searchLen-1, m = 1; k < l; k++, m++) {
                if (searchStr[m] !== S[k]) result = false;
            }
            if (result) return true;
        }

        i = i+1;
    }
    return false;
};
var StringPrototype_startsWith = function (thisArg, argList) {
    var searchString = argList[0];
    var position = argList[1];
    var S = CheckObjectCoercible(thisArg);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    S = ToString(S);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var searchStr = ToString(searchString);
    var pos = ToInteger(position);
    var len = S.length;
    var start = min(max(pos, 0), len);
    var searchLength = searchString.length;
    if (searchLength+start > len) return false;
    var result = true;
    for (var k = 0, i = start, j = searchLength+start; i < j; i++, k++) {
        if (searchStr[k] !== S[i]) { result = false; break; }
    }
    return result;
};
var StringPrototype_endsWith = function (thisArg, argList) {
    var searchString = argList[0];
    var endPosition = argList[1];
    var S = CheckObjectCoercible(thisArg);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    S = ToString(S);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var searchStr = ToString(searchString);
    var pos = endPosition === undefined ? len : ToInteger(endPosition);
    var len = S.length;
    var end = min(max(pos, 0), len);
    var searchLength = searchString.length;
    var start = end - searchLength;
    if (start < 0) return false;
    var result = true;
    for (var i = start, j = start + searchLength, k = 0; i < j; i++, k++) {
        if (searchString[k] !== S[i]) { result = false; break; }
    }
    return result;
};
var StringPrototype_valueOf = function valueOf(thisArg, argList) {
    var x = thisStringValue(thisArg);
    return x;
};
var StringPrototype_toArray = function (thisArg, argList) {
    var S = CheckObjectCoercible(thisArg);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    S = ToString(S);
    var array = ArrayCreate(0);
    var len = S.length;
    var n = 0;
    while (n < len) {
        var c = S[n];
        callInternalSlot(SLOTS.DEFINEOWNPROPERTY, array, ToString(n), {
            configurable: true,
            enumerable: true,
            value: c,
            writable: true
        }, false);
        n = n + 1;
    }
    return NormalCompletion(array);

};
var trim_leading_space_expr = /^([\s]*)/;
var trim_trailing_space_expr = /([\s]*)$/;
var StringPrototype_trim = function (thisArg, argList) {
    var O = CheckObjectCoercible(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var S = ToString(O);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var T;
    T = S.replace(trim_leading_space_expr, "");
    T = T.replace(trim_trailing_space_expr, "");
    return NormalCompletion(T);
};
var StringPrototype_search = function (thisArg, argList) {
    var regexp = argList[0];
    var O = CheckObjectCoercible(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var S = ToString(O);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var rx;
    if (Type(regexp) === OBJECT  && HasProperty(regexp, $$isRegExp)) {
        rx = regexp;
    } else {
        rx = RegExpCreate(regexp, undefined);
    }
    if (isAbrupt(rx = ifAbrupt(rx))) return rx;
    return Invoke(rx, "search", [S]);
};
var StringPrototype_toUpperCase = function (thisArg, argList) {
    var O = CheckObjectCoercible(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var S = ToString(O);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var U = S.toUpperCase();
    return NormalCompletion(U);
};
var StringPrototype_toLowerCase = function (thisArg, argList) {
    var O = CheckObjectCoercible(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var S = ToString(O);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var L = S.toLowerCase();
    return NormalCompletion(L);
};
var StringPrototype_charAt = function (thisArg, argList) {
    var index = argList[0];
    index = index|0;
    var O = CheckObjectCoercible(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var S = ToString(O);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var V = S.charAt(index);
    return NormalCompletion(V);
};
var StringPrototype_charCodeAt = function (thisArg, argList) {
    var index = argList[0];
    index = index|0;
    var O = CheckObjectCoercible(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var S = ToString(O);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    if (index < 0) return NormalCompletion(NaN);
    if (index >= S.length) return NormalCompletion(NaN);
    var C = S.charCodeAt(index);
    return NormalCompletion(C);
};
var StringPrototype_split = function (thisArg, argList) {
    var separator = argList[0];
    var limit = argList[1];
    var O = CheckObjectCoercible(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    if (Type(separator) === OBJECT && HasProperty(separator, $$isRegExp)) {
        return Invoke(separator, "split", [O, limit]);
    }
    var S = ToString(O);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var A = ArrayCreate(0);
    var lengthA = 0;
    var lim;
    if (limit === undefined) lim = Math.pow(2,53)-1;
    else lim = ToLength(limit);
    var s = S.length;
    var p = 0;
    var R = ToString(separator);

};
var StringPrototype_lpad = function (thisArg, argList) {
    var minLength = argList[0];
    var fillStr = argList[1];
    var O = CheckObjectCoercible(thisArg);
    var S = ToString(O);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var intMinLength = ToInteger(minLength);
    if (isAbrupt(intMinLength = ifAbrupt(intMinLength))) return intMinLength;
    if (intMinLength === undefined) return NormalCompletion(S);
    var fillLen = intMinLength - S.length;
    if (fillLen < 0) return newRangeError( "lpad: fillLen is smaller than the string");
    if (fillLen == Infinity) return newRangeError( "lpad: fillLen is Infinity");
    var sFillStr;
    if (fillStr === undefined) sFillStr = " ";
    else sFillStr = ""+fillStr;
    var sFillVal = sFillStr;
    do { sFillVal += sFillStr; } while (sFillVal.length < fillLen);
    if (sFillVal.length > fillLen) sFillVal = sFillVal.substr(0, fillLen);
    return NormalCompletion(sFillVal + S)
};
var StringPrototype_rpad = function (thisArg, argList) {
    var minLength = argList[0];
    var fillStr = argList[1];
    var O = CheckObjectCoercible(thisArg);
    var S = ToString(O);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var intMinLength = ToInteger(minLength);
    if (isAbrupt(intMinLength = ifAbrupt(intMinLength))) return intMinLength;
    if (intMinLength === undefined) return NormalCompletion(S);
    var fillLen = intMinLength - S.length;
    if (fillLen < 0) return newRangeError( "lpad: fillLen is smaller than the string");
    if (fillLen == Infinity) return newRangeError( "lpad: fillLen is Infinity");
    var sFillStr;
    if (fillStr === undefined) sFillStr = " ";
    else sFillStr = ""+fillStr;
    var sFillVal = sFillStr;
    do { sFillVal += sFillStr; } while (sFillVal.length < fillLen );
    if (sFillVal.length > fillLen) sFillVal = sFillVal.substr(0, fillLen);
    return NormalCompletion(S + sFillVal);
};
var StringPrototype_codePointAt = function (thisArg, argList) {
    var O = CheckObjectCoercible(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var S = ToString(O);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var position = ToInteger(pos);
    var size = S.length;
    if (position < 0 || position >= size) return NormalCompletion(undefined);
    var first = S.charCodeAt(position);
    if (first < 0xD800 || first > 0xDBFF || (position+1===size)) return S;
    var second = S.charCodeAt(position+1);
    if (second < 0xDC00 || second > 0xDFFF) return NormalCompletion(first);
    var result = (((first - 0xD800)*1024) + (second - 0xDC00)) + 0x10000;
    return NormalCompletion(result);
};
var StringPrototype_concat = function (thisArg, argList) {
    var O = CheckObjectCoercible(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var S = ToString(O);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var R = S;
    var next;
    for (var i = 0, j = argList.length; i < j; i++ ) {
        next = argList[i];
        var nextString = ToString(next);
        if (isAbrupt(nextString = ifAbrupt(nextString))) return nextString;
        R = R + next;
    }
    return NormalCompletion(R);
};
var StringPrototype_indexOf = function (thisArg, argList) {
    var searchString = argList[0];
    var position = argList[1];
    var O = CheckObjectCoercible(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var S = ToString(O);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var searchStr = ToString(searchString);
    var pos = position | 0;
    var len = S.length;
    var start = min(max(pos, 0), len);
    var searchLen = searchStr.length;
    outer:
        for (var i = 0, j = (S.length-searchLen); i < j; i++) {
            var ch = S[i];
            if (ch === searchStr[0]) {
                var k = 0;
                while (k < searchLen) {
                    if (S[i+k] !== searchStr[k]) continue outer;
                    k = k + 1;
                }
                return NormalCompletion(i);
            }
        }
    return NormalCompletion(-1);
};
var StringPrototype_lastIndexOf = function (thisArg, argList)   {
    var searchString = argList[0];
    var position = argList[1];
    var O = CheckObjectCoercible(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var S = ToString(O);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var searchStr = ToString(searchString);
    if (isAbrupt(searchStr=ifAbrupt(searchStr))) return searchStr;
    var numPos = ToNumber(position);
    if (isAbrupt(numPos = ifAbrupt(numPos))) return numPos;
    var pos;
    if (numPos !== numPos) pos = Infinity;
    else pos = numPos|0;
    var len = S.length;
    var start = min(pos, len);
    var searchLen = searchStr.length;
    //return S.lastIndexOf(searchStr, position);
    outer:
        for (var j = 0, i = start; j >= i; i--) {
            var ch = S[i];
            if (ch === searchStr[0]) {
                var k = 0;
                while (k < searchLen) {
                    if (S[i+k] !== searchStr[k]) continue outer;
                    k = k + 1;
                }
                return NormalCompletion(i);
            }
        }
    return NormalCompletion(-1);
};
var StringPrototype_localeCompare = function (thisArg, argList) {
    var that = argList[0];
    var O = CheckObjectCoercible(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var S = ToString(O);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var That = ToString(that);
    if (isAbrupt(that = ifAbrupt(that))) return that;
    return NormalCompletion(undefined);
};
var StringPrototype_at = function (thisArg, argList) {
    var position = argList[0];
    var O = CheckObjectCoercible(thisArg);
    var S = ToString(O);
    if (isAbrupt(S=ifAbrupt(S))) return S;
    var pos = ToInteger(position);
    if (isAbrupt(pos=ifAbrupt(pos))) return pos;
    var size = S.length;
    //if (pos < size || pos > size) return NormalCompletion("");
    var first = S[position];
    var cuFirst = s.charCodeAt(0);
    if (cuFirst < 0xD800 || cuFirst > 0xDBFF || (position + 1 === size)) return NormalCompletion(first);
    var cuSecond = S.charCodeAt[position+1];
    if (cuSecond < 0xDC00 || cuSecond > 0xDFFF) return NormalCompletion(String.fromCharCode(cuFirst));
    var second = S.charCodeAt[position+1];
    var cp = (first - 0xD800) * 0x400+(second-0xDC00)+0x1000;
    return NormalCompletion(String.fromCharCode(cuFirst, cuSecond));
};
function GetReplaceSubstitution (matched, string, postion, captures) {
    Assert(Type(matched) === STRING, "matched has to be a string");
    var matchLength = matched.length;
    Assert(Type(string) === STRING);
    var stringLength = string.length;
    Assert(position >= 0, "position isnt a non negative integer");
    Assert(position <= stringLength);
    Assert(Array.isArray(captures), "captures is a possibly empty list but a list");
    var tailPos = position + matchLength;
    var m = captures.length;
    var result = matched.replace("$$", "$");
    /*
     Table 39 - Replacement Text Symbol Substitutions missing
     Please fix your skills here
     */
    return result;
}
var StringConstructor_fromCharCode = function (thisArg, argList) {
    try {
        var str = String.fromCharCode.apply(null, argList);
    } catch (ex) {
        return newTypeError( "error converting string to charcode");
    }
    return NormalCompletion(str);
};
var StringConstructor_fromCodePoint = function (thisArg, argList) {
    // Here we need mathias´ code :-)
    try {
        var str = String.fromCharCode.apply(null, argList);
    } catch (ex) {
        return newTypeError( "error converting string to charcode");
    }
    return NormalCompletion(str);
};
var StringPrototype_$$iterator = function (thisArg, argList) {
    return CreateStringIterator(thisArg, "value");
};
var StringPrototype_entries = function (thisArg, argList) {
    return CreateStringIterator(thisArg, "key+value");
};
var StringPrototype_values = function values(thisArg, argList) {
    return CreateStringIterator(thisArg, "value");
};
var StringPrototype_keys = function keys(thisArg, argList) {
    return CreateStringIterator(thisArg, "key");
};
var StringConstructor_raw = function (thisArg, argList) {
    // String.raw(callSite, ...substitutions)

    var callSite = argList[0];
    // ,...substitions)
    var substitutions = CreateArrayFromList(arraySlice(argList, 1));
    var cooked = ToObject(callSite);
    if (isAbrupt(cooked = ifAbrupt(cooked))) return cooked;
    var rawValue = Get(cooked, "raw");
    var raw = ToObject(rawValue);
    if (isAbrupt(raw = ifAbrupt(raw))) return raw;
    var len = Get(raw, "length");
    var literalSegments = ToLength(len);
    if (isAbrupt(literalSegments = ifAbrupt(literalSegments))) return literalSegments;
    if (literalSegments <= 0) return "";
    var stringElements = [];
    var nextIndex = 0;
    for (;;) {
        var nextKey = ToString(nextIndex);
        var next = Get(raw, nextKey);
        var nextSeg = ToString(next);
        if (isAbrupt(nextSeg = ifAbrupt(nextSeg))) return nextSeg;
        stringElements.push(nextSeg);
        if (nextIndex + 1 === literalSegments) {
            var string = stringElements.join('');
            return NormalCompletion(string);
        }
        next = Get(substitutions, nextKey);
        var nextSub = ToString(next);
        if (isAbrupt(nextSub = ifAbrupt(nextSub))) return nextSub;
        stringElements.push(nextSub);
        nextIndex = nextIndex + 1;
    }
};
