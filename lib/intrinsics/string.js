// ===========================================================================================================
// String Constructor and Prototype
// ===========================================================================================================

setInternalSlot(StringConstructor, "Call", function Call(thisArg, argList) {
    var O = thisArg;
    var s;
    if (!argList.length) s = "";
    else s = ToString(argList[0]);
    if (isAbrupt(s = ifAbrupt(s))) return s;
    if (Type(O) === "object" && hasInternalSlot(O, "StringData") && getInternalSlot(O, "StringData") === undefined) {
        var length = s.length;
        var status = DefineOwnPropertyOrThrow(O, "length", {
            value: length,
            writable: false,
            enumerable: false,
            configurable: false
        });
        if (isAbrupt(status = ifAbrupt(status))) return status;
        setInternalSlot(O, "StringData", s);
        return O;
    }
    return s;
});
setInternalSlot(StringConstructor, "Construct", function Construct(argList) {
    var F = StringConstructor;
    return OrdinaryConstruct(F, argList);
});

DefineOwnProperty(StringConstructor, $$create, {
    value: CreateBuiltinFunction(realm, function $$create(thisArg, argList) {
        var F = thisArg;
        var obj = StringExoticObject();
        var proto = GetPrototypeFromConstructor(F, "%StringPrototype%");
        if (isAbrupt(proto = ifAbrupt(proto))) return proto;
        setInternalSlot(obj, "Prototype", proto);
        setInternalSlot(obj, "StringData", undefined);
        return obj;
    }),
    enumerable: false,
    writable: true,
    configurable: true
});

var StringRawFunction = CreateBuiltinFunction(realm, function raw(thisArg, argList) {
    // String.raw(callSite, ...substitutions)

    var callSite = argList[0];
    // ,...substitions)
    var substitutions = CreateArrayFromList(argList.slice(1));
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
    if (isAbrupt(cooked = ifAbrupt(cooked))) return cooked;
});

DefineOwnProperty(StringConstructor, "raw", {
    value: StringRawFunction,
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(StringConstructor, "fromCharCode", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {}),
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(StringConstructor, "fromCodePoint", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {}),
    enumerable: false,
    writable: true,
    configurable: true
});



function GetReplaceSubstitution (matched, string, postion, captures) {
    Assert(Type(matched) === "string", "matched has to be a string");
    var matchLength = matched.length;
    Assert(Type(string) === "string");
    var stringLength = string.length;
    Assert(position >= 0, "position isnt a non negative integer");
    Assert(position <= stringLength);
    Assert(Array.isArray(captures), "captures is a possibly empty list but a list");
    var tailPos = position + matchLength;
    var m = captures.length;
    result = matched.replace("$$", "$");
    /*
     Table 39 - Replacement Text Symbol Substitutions missing
     Please fix your skills here
     */
    return result;
}

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
    if (form === undefined) from = "NFC";
    var f = ToString(form);
    if ((f = ifAbrupt(f)) && ifAbrupt(f)) return f;
    if (!normalizeOneOfs[f]) return withError("Range", "f is not one of nfc, nfd, nfkc, nfkd.");
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
    if (Type(searchValue) === "object" && HasProperty(searchValue, $$isRegExp)) {
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
                    var replValue = callInternalSlot("Call", replaceValue, undefined, [matched, pos, string]);
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
    if (Type(regexp) === "object" && HasProperty(regexp, $$isRegExp)) {
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
    if (n < 0) return withError("Range", "n is less than 0");
    if (n === Infinity) return withError("Range", "n is infinity");
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
        callInternalSlot("DefineOwnProperty", array, ToString(n), {
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
// 31.1.
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

// 31.1.
var StringPrototype_search = function (thisArg, argList) {
    var regexp = argList[0];
    var O = CheckObjectCoercible(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var S = ToString(O);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var rx;
    if (Type(regexp) === "object"  && HasProperty(regexp, $$isRegExp)) {
        rx = regexp;
    } else {
        rx = RegExpCreate(regexp, undefined);
    }
    if (isAbrupt(rx = ifAbrupt(rx))) return rx;
    return Invoke(rx, "search", [S]);
};
// 31.1.
var StringPrototype_toUpperCase = function (thisArg, argList) {
    var O = CheckObjectCoercible(thisArg);
    if (isAbrupt(O = ifAbrupt(O))) return O;
    var S = ToString(O);
    if (isAbrupt(S = ifAbrupt(S))) return S;
    var U = S.toUpperCase();
    return NormalCompletion(U);
};

// 31.1.
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
    if (Type(separator) === "object" && HasProperty(separator, $$isRegExp)) {
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

// http://wiki.ecmascript.org/doku.php?id=strawman:strawman
// 29.1. i have read a post about es7 timeline and one
// said for es7 we should look into the strawman namespace except
// for observe which is in harmony. Here is string_extensions
// http://wiki.ecmascript.org/doku.php?id=strawman:string_extensions
// the document defines lpad and rpad
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
    if (fillLen < 0) return withError("Range", "lpad: fillLen is smaller than the string"); // maybe auto cut just the string. too?
    if (fillLen == Infinity) return withError("Range", "lpad: fillLen is Infinity");
    var sFillStr;
    if (fillStr === undefined) sFillStr = " ";
    else sFillStr = ""+fillStr;
    var sFillVal = sFillStr;
    var sFillLen;
    do { sFillVal += sFillStr; } while ((sFillLen = (sFillVal.length - S.length)) < fillLen);
    if (sFillLen > fillLen) sFillVal = sFillVal.substr(0, fillLen);
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
    if (fillLen < 0) return withError("Range", "lpad: fillLen is smaller than the string");
    if (fillLen == Infinity) return withError("Range", "lpad: fillLen is Infinity");
    var sFillStr;
    if (fillStr === undefined) sFillStr = " ";
    else sFillStr = ""+fillStr;
    var sFillVal = sFillStr;
    var sFillLen;
    do { sFillVal += sFillStr; } while ((sFillLen = (sFillVal.length - S.length)) < fillLen);
    if (sFillLen > fillLen) sFillVal = sFillVal.substr(0, fillLen);
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
        var next = argList[i];
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
    var searchStr = ToString(searchStr);
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
    var numPos = ToNumber(position);
    if (isAbrupt(numPos = ifAbrupt(numPos))) return numPos;
    var pos;
    if (numPos !== numPos) pos = Infinity;
    else pos = numPos|0;
    var start = min(max(pos, 0), len);
    var searchLen = searchStr.length;


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
    if (pos < size || pos > size) return NormalCompletion("");
    var first = S[position];
    var cuFirst = s.charCodeAt(0);
    if (cuFirst < 0xD800 || cuFirst > 0xDBFF || (position + 1 === size)) return NormalCompletion(first);
    var cuSecond = S.charCodeAt[position+1];
    if (cuSecond < 0xDC00 || cuSecond > 0xDFFF) return NormalCompletion(first);
    var second = S.charCodeAt[position+1];
    var cp = (first - 0xD800) * 0x400+(second-0xDC00)+0x1000;
    return String.fromCharCode(cuFirst, cuSecond);
};

LazyDefineBuiltinFunction(StringPrototype, "at", 1, StringPrototype_at);
LazyDefineBuiltinFunction(StringPrototype, "charAt", 1, StringPrototype_charAt);
LazyDefineBuiltinFunction(StringPrototype, "charCode", 1, StringPrototype_charCodeAt);
LazyDefineBuiltinFunction(StringPrototype, "codePointAt", 1, StringPrototype_codePointAt);
LazyDefineBuiltinFunction(StringPrototype, "concat", 1, StringPrototype_concat);
LazyDefineBuiltinFunction(StringPrototype, "contains", 1, StringPrototype_contains);

LazyDefineBuiltinFunction(StringPrototype, "endsWith", 1, StringPrototype_endsWith);
LazyDefineBuiltinFunction(StringPrototype, "indexOf", 1, StringPrototype_indexOf);
LazyDefineBuiltinFunction(StringPrototype, "lpad", 1, StringPrototype_lpad);
LazyDefineBuiltinFunction(StringPrototype, "rpad", 1, StringPrototype_rpad);
LazyDefineBuiltinFunction(StringPrototype, "match", 0, StringPrototype_match);
LazyDefineBuiltinFunction(StringPrototype, "normalize", 0, StringPrototype_normalize);
LazyDefineBuiltinFunction(StringPrototype, "repeat", 0, StringPrototype_repeat);
LazyDefineBuiltinFunction(StringPrototype, "replace", 0, StringPrototype_replace);
LazyDefineBuiltinFunction(StringPrototype, "search", 1, StringPrototype_search);
LazyDefineBuiltinFunction(StringPrototype, "startsWith", 1, StringPrototype_startsWith);
LazyDefineBuiltinFunction(StringPrototype, "toArray", 0, StringPrototype_toArray);
LazyDefineBuiltinFunction(StringPrototype, "toLocaleCompare", 0, StringPrototype_localeCompare);
LazyDefineBuiltinFunction(StringPrototype, "toLowerCase", 0, StringPrototype_toLowerCase);
LazyDefineBuiltinFunction(StringPrototype, "toUpperCase", 0, StringPrototype_toUpperCase);
LazyDefineBuiltinFunction(StringPrototype, "trim", 1, StringPrototype_trim);
LazyDefineBuiltinFunction(StringPrototype, "valueOf", 0, StringPrototype_valueOf);
LazyDefineBuiltinConstant(StringPrototype, $$toStringTag, "String");
MakeConstructor(StringConstructor, true, StringPrototype);

DefineOwnProperty(StringPrototype, $$iterator, {
    value: CreateBuiltinFunction(realm, function iterator(thisArg, argList) {
        return CreateStringIterator(thisArg, "value");
    }, 0, "[Symbol.iterator]"),
    writable: false,
    enumerable: false,
    configurable: false
});
DefineOwnProperty(StringPrototype, "values", {
    value: CreateBuiltinFunction(realm, function values(thisArg, argList) {
        return CreateStringIterator(thisArg, "value");
    }),
    writable: false,
    enumerable: false,
    configurable: false
});
DefineOwnProperty(StringPrototype, "keys", {
    value: CreateBuiltinFunction(realm, function keys(thisArg, argList) {
        return CreateStringIterator(thisArg, "key");
    }),
    writable: false,
    enumerable: false,
    configurable: false
});
DefineOwnProperty(StringPrototype, "entries", {
    value: CreateBuiltinFunction(realm, function entries(thisArg, argList) {
        return CreateStringIterator(thisArg, "key+value");
    }),
    writable: false,
    enumerable: false,
    configurable: false
});