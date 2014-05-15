
setInternalSlot(StringConstructor, SLOTS.CALL, StringConstructor_call);
setInternalSlot(StringConstructor, SLOTS.CONSTRUCT, StringConstructor_construct);

DefineOwnProperty(StringConstructor, $$create, {
    value: CreateBuiltinFunction(realm, function $$create(thisArg, argList) {
        var F = thisArg;
        var obj = StringExoticObject();
        var proto = GetPrototypeFromConstructor(F, INTRINSICS.STRINGPROTOTYPE);
        if (isAbrupt(proto = ifAbrupt(proto))) return proto;
        setInternalSlot(obj, SLOTS.PROTOTYPE, proto);
        setInternalSlot(obj, SLOTS.STRINGDATA, undefined);
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

});

DefineOwnProperty(StringConstructor, "raw", {
    value: StringRawFunction,
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(StringConstructor, "fromCharCode", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
       try {
           var str = String.fromCharCode.apply(null, argList);
       } catch (ex) {
           return newTypeError( "error converting string to charcode");
       }
       return NormalCompletion(str);
    }),
    enumerable: false,
    writable: true,
    configurable: true
});

DefineOwnProperty(StringConstructor, "fromCodePoint", {
    value: CreateBuiltinFunction(realm, function (thisArg, argList) {
        try {
            var str = String.fromCharCode.apply(null, argList);
        } catch (ex) {
            return newTypeError( "error converting string to charcode");
        }
        return NormalCompletion(str);
    }),
    enumerable: false,
    writable: true,
    configurable: true
});



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


LazyDefineBuiltinFunction(StringPrototype, "at", 1, StringPrototype_at);
LazyDefineBuiltinFunction(StringPrototype, "charAt", 1, StringPrototype_charAt);
LazyDefineBuiltinFunction(StringPrototype, "charCodeAt", 1, StringPrototype_charCodeAt);
LazyDefineBuiltinFunction(StringPrototype, "codePointAt", 1, StringPrototype_codePointAt);
LazyDefineBuiltinFunction(StringPrototype, "concat", 1, StringPrototype_concat);
LazyDefineBuiltinFunction(StringPrototype, "contains", 1, StringPrototype_contains);
LazyDefineBuiltinFunction(StringPrototype, "endsWith", 1, StringPrototype_endsWith);
LazyDefineBuiltinFunction(StringPrototype, "indexOf", 1, StringPrototype_indexOf);
LazyDefineBuiltinFunction(StringPrototype, "lastIndexOf", 1, StringPrototype_lastIndexOf);
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