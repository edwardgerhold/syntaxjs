// ===========================================================================================================
// Regular Expressiong	
// ===========================================================================================================

MakeConstructor(RegExpConstructor, true, RegExpPrototype);

var RegExp_$$create = function (thisArg, argList) {
    return RegExpAllocate(thisArg);
};
var RegExp_Call = function (thisArg, argList) {
    var func = RegExpConstructor;
    var pattern = argList[0];
    var flags = argList[1];
    var O = thisArg;
    var P, F, testP;
    if (!hasInternalSlot(O, "RegExpMatcher") || getInternalSlot(O, "RegExpMatcher") !== undefined) {
        if (testP=(Type(pattern) === "object" && hasInternalSlot(pattern, "RegExpMatcher"))) return pattern;
        O = RegExpAllocate(func);
        if (isAbrupt(O = ifAbrupt(O))) return O;
    }
    if (testP) {
        if (getInternalSlot(pattern, "RegExpMatcher") !== undefined) return withError("Type", "patterns [[RegExpMatcher]] isnt undefined");
        if (flags != undefined) return withError("Type", "flag should be undefined for this call");
        P = getInternalSlot(pattern, "OriginalSource");
        F = getInternalSlot(pattern, "OriginalFlags");
    } else {
        P = pattern;
        F = flags;
    }
    return RegExpInitialize(O, P, F);
};
var RegExp_Construct = function (argList) {
    return Construct(this, argList);
};
var RegExpPrototype_get_global = function (thisArg, argList) {
    var R = thisArg;
    if (Type(R) != "object") return withError("Type", "this value is no object");
    if (!hasInternalSlot(R, "OriginalFlags")) return withError("Type", "this value has no [[OriginalFlags]]");
    var flags = getInternalSlot(R, "OriginalFlags");
    return flags.indexOf("g");
};
var RegExpPrototype_get_multiline = function (thisArg, argList) {
    var R = thisArg;
    if (Type(R) != "object") return withError("Type", "this value is no object");
    if (!hasInternalSlot(R, "OriginalFlags")) return withError("Type", "this value has no [[OriginalFlags]]");
    var flags = getInternalSlot(R, "OriginalFlags");
    return flags.indexOf("m");
};
var RegExpPrototype_get_ignoreCase = function (thisArg, argList) {
    var R = thisArg;
    if (Type(R) != "object") return withError("Type", "this value is no object");
    if (!hasInternalSlot(R, "OriginalFlags")) return withError("Type", "this value has no [[OriginalFlags]]");
    var flags = getInternalSlot(R, "OriginalFlags");
    return flags.indexOf("i");
};
var RegExpPrototype_get_sticky = function (thisArg, argList) {
    var R = thisArg;
    if (Type(R) != "object") return withError("Type", "this value is no object");
    if (!hasInternalSlot(R, "OriginalFlags")) return withError("Type", "this value has no [[OriginalFlags]]");
    var flags = getInternalSlot(R, "OriginalFlags");
    return flags.indexOf("y");
};

var RegExpPrototype_get_unicode = function (thisArg, argList) {
    var R = thisArg;
    if (Type(R) != "object") return withError("Type", "this value is no object");
    if (!hasInternalSlot(R, "OriginalFlags")) return withError("Type", "this value has no [[OriginalFlags]]");
    var flags = getInternalSlot(R, "OriginalFlags");
    return flags.indexOf("u");
};

var RegExpPrototype_get_source = function (thisArg, argList) {
    var R = thisArg;
    if (Type(R) != "object") return withError("Type", "this value is no object");
    if (!hasInternalSlot(R, "OriginalSource")) return withError("Type", "this value has no [[OriginalSource]]");
    if (!hasInternalSlot(R, "OriginalFlags")) return withError("Type", "this value has no [[OriginalFlags]]");
    var source =getInternalSlot(R, "OriginalSource");
    var flags = getInternalSlot(R, "OriginalFlags");
    if (source === undefined || flags === undefined) return withError("Type", "source and flags may not be undefined");
    return EscapeRegExpPattern(source, flags);
};


var RegExpPrototype_exec = function (thisArg, argList) {
    var R = thisArg;
    var string = argList[0];
    var S;
    if (Type(R) !== "object") return withError("Type", "this value is not an object");
    if (!hasInternalSlot(R, "RegExpMatcher")) return withError("Type", "this value has not [[RegExpMatcher]] internal slot");
    if (getInternalSlot(R, "RegExpMatcher") === undefined) return withError("Type", "this value has not [[RegExpMatcher]] internal slot defined");
    S = ToString(string);
    if (isAbrupt(S=ifAbrupt(S))) return S;
    return RegExpExec(R,S);
};

var RegExpPrototype_search = function (thisArg, argList) {
    var rx = thisArg;
    var S = argList[0];
    if (Type(rx) !== "object") return withError("Type", "this value is not an obect");
    if (!hasInternalSlot(rx, "RegExpMatcher")) return withError("Type", "this value has no [[RegExpMatcher]] internal slot");
    var matcher = getInternalSlot(rx, "RegExpMatcher");
    var string = ToString(S);
    if (isAbrupt(string=ifAbrupt(string))) return string;
    var result = RegExpExec(rx, string, true);
    if (isAbrupt(result=ifAbrupt(result))) return result;
    if (result == null) return -1;
    return Get(result, "index");
};
var RegExpPrototype_match = function (thisArg, argList) {
    var rx = thisArg;
    var string = argList[0];
    var S;
    if (Type(rx) !== "object") return withError("Type", "this value is not an object");
    if (!hasInternalSlot(rx, "RegExpMatcher")) return withError("Type", "this value has not [[RegExpMatcher]] internal slot");
    if (getInternalSlot(rx, "RegExpMatcher") === undefined) return withError("Type", "this value has not [[RegExpMatcher]] internal slot defined");
    S = ToString(string);
    if (isAbrupt(S=ifAbrupt(S))) return S;
    var global = ToBoolean(Get(rx, "global"));
    if (isAbrupt(global=ifAbrupt(global))) return global;
    if (!global) {
        return RegExpExec(rx, S);
    } else {
        var putStatus = Put(rx, "lastIndex", 0, true);
        if (isAbrupt(putStatus)) return putStatus;
        var A = ArrayCreate(0);
        var previousLastIndex = 0;
        var n = 0;
        var lastMatch = true;
        while (lastMatch) {
            var result = RegExpExec(rx, S);
            if (isAbrupt(result=ifAbrupt(result))) return result;
            if (result === null) lastMatch = false;
            else {
                var thisIndex = ToInteger(Get(rx, "lastIndex"));
                if (isAbrupt(thisIndex=ifAbrupt(thisIndex))) return thisIndex;
                if (thisIndex === previousLastIndex) {
                    putStatus = Put(rx, "lastIndex", thisIndex + 1, true);
                    if (isAbrupt(putStatus)) return putStatus;
                    previousLastIndex = thisIndex + 1;
                } else {
                    previousLastIndex = thisIndex;
                }
                var matchStr = Get(result, "0");
                var defineStatus = CreateDataPropertyOrThrow(A, ToString(n), matchStr);
                if (isAbrupt(defineStatus)) return defineStatus;
                n =  n + 1;
            }
        }
        if (n === 0) return NormalCompletion(null);
        return NormalCompletion(A);
    }
};

var RegExpPrototype_test = function (thisArg, argList) {
    var R = thisArg;
    var string = argList[0];
    if (Type(R) !== "object") return withError("Type", "this value is no object");
    var match = Invoke(R, "exec", [string]);
    if (isAbrupt(match=ifAbrupt(match))) return match;
    return NormalCompletion(match !== null);
};


var RegExpPrototype_compile = function (thisArg, argList) {



};
var RegExpPrototype_split = function (thisArg, argList) {

};

var RegExpPrototype_replace = function (thisArg, argList) {
    var string = argList[0];
    var replaceValue = argList[1];
    var rx = thisArg;
    var S;
    if (Type(rx) !== "object") return withError("Type", "this value is not an object");
    if (!hasInternalSlot(rx, "RegExpMatcher")) return withError("Type", "this value has not [[RegExpMatcher]] internal slot");
    if (getInternalSlot(rx, "RegExpMatcher") === undefined) return withError("Type", "this value has not [[RegExpMatcher]] internal slot defined");

    var nCaptures = rx.machine.NCapturingParens;
    S = ToString(string);
    if (isAbrupt(S=ifAbrupt(S))) return S;
    var functionalReplace = IsCallable(replaceValue);
    var global = ToBoolean(Get(rx, "global"));
    if (isAbrupt(global=ifAbrupt(global))) return global;
    var accumulatedResult = "";
    var nextSrcPosition = 0;
    if (global) {
        var putStatus = Put(rx, "lastIndex", 0, true);
        if (isAbrupt(putStatus)) return putStatus;
    }
    var previousLastIndex = 0;
    var done = false;
    var accumulatedResult = "";
    var nextSrcPosition = 0;
    var matchLength;
    while (!done) {
        var result = RegExpExec(rx, S);
        if (isAbrupt(result=ifAbrupt(result))) return result;
        if (result === null) done = true;
        else {
            if (global) {
                var thisIndex = ToInteger(Get(rx, "lastIndex"));
                if (isAbrupt(thisIndex = ifAbrupt(thisIndex))) return thisIndex;
                if (thisIndex === previousLastIndex) {
                    var putStatus = Put(rx, "lastIndex", thisIndex + 1, true);
                    if (isAbrupt(putStatus)) return putStatus;
                    var previousLastIndex = thisIndex + 1;
                } else {
                    previousLastIndex = thisIndex;
                }
            }
            var sub = GetRegExpSubstitution(result);
            var matched = Get(result, "0");
            if (isAbrupt(matched=ifAbrupt(matched))) return matched;
            var position = Get(result, "index");
            if (isAbrupt(position = ifAbrupt(position))) return position;
            var n = 0;
            var captures = [];
            while (n < nCaptures) {
                var capN = Get(result, ToString(n));
                if(isAbrupt(capN=ifAbrupt(capN))) return capN;
                captures.push(capN);
                n = n + 1;
            }
            if (functionalReplace === true) {
                var replacerArgs = [matched];
                replacerArgs = replacerArgs.concat(captures);
                var replValue = callInternalSlot("Call", replaceValue, undefined, replacerArgs);
                var replacement = ToString(replValue);
            } else {
                replacement = GetReplaceSubstitution(matched, string, position, captures);
            }
            if (isAbrupt(replacement=ifAbrupt(replacement))) return replacement;
            var matchLength = matched.length;
            var replStr = ToString(replacement);
            if (isAbrupt(replStr=ifAbrupt(replStr))) return replStr;


            /*

             Achtung: Dokument pruefen

             Steps verschoben ???


             */
        /*
            return {
                position: position,
                matchLength: matchLength,
                replacement: replString
            }; */

            accumulatedResult = accumulatedResult + S.substr(nextSrcPosition, position - nextSrcPosition);
            nextSrcPosition = position + matchLength;
        }

    }

    return NormalCompletion( accumulatedResult + S.substr(nextSrcPosition, S.length - nextSrcPosition) );
};


var RegExpPrototype_toString = function (thisArg, argList) {
    var R = thisArg;
    if (Type(R) !== "object") return withError("Type", "this value is not an object");
    if (!hasInternalSlot(R, "RegExpMatcher")) return withError("Type", "this value has not [[RegExpMatcher]] internal slot");
    if (getInternalSlot(R, "RegExpMatcher") === undefined) return withError("Type", "this value has not [[RegExpMatcher]] internal slot defined");
    var pattern = ToString(Get(R, "source"));
    if (isAbrupt(pattern=ifAbrupt(pattern))) return pattern;
    var result = "/" + pattern + "/";
    var global = ToBoolean(Get(R, "global"));
    if (isAbrupt(global=ifAbrupt(global))) return global;
    if (global) result += "g";

    var ignoreCase = ToBoolean(Get(R, "ignoreCase"));
    if (isAbrupt(ignoreCase=ifAbrupt(ignoreCase))) return ignoreCase;
    if (ignoreCase) result += "i";

    var multiline = ToBoolean(Get(R, "multiline"));
    if (isAbrupt(multiline=ifAbrupt(multiline))) return multiline;
    if (multiline) result += "m";

    var unicode = ToBoolean(Get(R, "unicode"));
    if (isAbrupt(unicode=ifAbrupt(unicode))) return unicode;
    if (unicode) result += "u";

    var sticky = ToBoolean(Get(R, "sticky"));
    if (isAbrupt(sticky=ifAbrupt(sticky))) return sticky;
    if (sticky) result += "y";
    return result;
};


setInternalSlot(RegExpConstructor, "Call", RegExp_Call);
setInternalSlot(RegExpConstructor, "Construct", RegExp_Construct);

LazyDefineBuiltinConstant(RegExpConstructor, "prototype", RegExpPrototype);
LazyDefineBuiltinConstant(RegExpPrototype, "constructor", RegExpConstructor);

LazyDefineBuiltinConstant(RegExpPrototype, $$isRegExp, true);
LazyDefineBuiltinConstant(RegExpPrototype, $$toStringTag, "RegExp");
LazyDefineBuiltinFunction(RegExpConstructor, $$create, 1, RegExp_$$create);

LazyDefineAccessor(RegExpPrototype, "ignoreCase", RegExpPrototype_get_ignoreCase, undefined);
LazyDefineAccessor(RegExpPrototype, "global", RegExpPrototype_get_global, undefined);
LazyDefineAccessor(RegExpPrototype, "multiline", RegExpPrototype_get_multiline, undefined);
LazyDefineAccessor(RegExpPrototype, "source", RegExpPrototype_get_source, undefined);
LazyDefineAccessor(RegExpPrototype, "sticky", RegExpPrototype_get_sticky, undefined);
LazyDefineAccessor(RegExpPrototype, "unicode", RegExpPrototype_get_unicode, undefined);

LazyDefineProperty(RegExpPrototype, "lastIndex", 0);

LazyDefineBuiltinFunction(RegExpPrototype, "compile", 1, RegExpPrototype_compile);
LazyDefineBuiltinFunction(RegExpPrototype, "exec", 1, RegExpPrototype_exec);
LazyDefineBuiltinFunction(RegExpPrototype, "match", 1, RegExpPrototype_match);
LazyDefineBuiltinFunction(RegExpPrototype, "replace", 1, RegExpPrototype_replace);
LazyDefineBuiltinFunction(RegExpPrototype, "search", 1, RegExpPrototype_search);
LazyDefineBuiltinFunction(RegExpPrototype, "split", 1, RegExpPrototype_split);
LazyDefineBuiltinFunction(RegExpPrototype, "test", 1, RegExpPrototype_test);
LazyDefineBuiltinFunction(RegExpPrototype, "toString", 1, RegExpPrototype_toString);
