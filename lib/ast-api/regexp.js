var tables = require("tables");
var LineTerminators = tables.LineTerminators;
exports.RegExpCreate = RegExpCreate;
function RegExpCreate(P, F) {
    var obj = RegExpAllocate(getIntrinsic(INTRINSICS.REGEXP));
    if (isAbrupt(obj=ifAbrupt(obj))) return obj;
    return RegExpInitialize(obj, P, F);
}
function EscapeRegExpPattern(P, F) {
    var S = "";
    for (var i = 0, j = P.length; i < j; i++) {
        var codePoint = P[i];
        if (codePoint === "/" && P[i-1] != "\\" || P[i-2]=="\\") {
            S += "\\/";
        } else S += codePoint;
    }
    return S;
}
function RegExpInitialize(obj, pattern, flags) {

    var P, F, BMP;
    if (pattern === undefined) P = "";
    else P = ToString(pattern);
    if (isAbrupt(P=ifAbrupt(P))) return P;
    if (flags === undefined) F = "";
    else F = ToString(flags);
    BMP = F.indexOf("u") === -1;

    var parse = require("regexp-parser").parse;
    var patternCharacters = parse(P);

    setInternalSlot(obj, SLOTS.ORIGINALFLAGS, F);
    setInternalSlot(obj, SLOTS.ORIGINALSOURCE, P);
    setInternalSlot(obj, SLOTS.REGEXPMATCHER, createRegExpMatcher(patternCharacters));

    var putStatus = Put(obj, "lastIndex", 0, true);
    if (isAbrupt(putStatus=ifAbrupt(putStatus))) return putStatus;
    return NormalCompletion(obj);
}
function RegExpAllocate(constructor) {

    var obj = OrdinaryCreateFromConstructor(constructor, INTRINSICS.REGEXPPROTOTYPE,[
        SLOTS.REGEXPMATCHER,
        SLOTS.ORIGINALSOURCE,
        SLOTS.ORIGINALFLAGS
    ]);
    var status = DefineOwnPropertyOrThrow(obj, "lastIndex", {
        writable: true,
        configurable: false,
        enumerable: false,
        value: undefined

    });
    if (isAbrupt(status = ifAbrupt(status))) return status;
    return NormalCompletion(obj);
}
function RegExpExec (R, S, ignore) {
    Assert(getInternalSlot(R, SLOTS.REGEXPMATCHER) != undefined, "RegExpExec: R must be a initialized RegExp instance");
    Assert(Type(S) === STRING);
    Assert(Type(S) === STRING);
    Assert(ignore !== undefined ? Type(ignore) === BOOLEAN : true, "ignore has to be a bool if ignore is provided");
    var length = S.length;
    var global, sticky, matcher, flags, matchSucceeded, e, fullUnicode, putStatus, eUTF;
    if (ignore === undefined) ignore = false;
    if (ignore) global = false;
    else {
        var lastIndex = Get(R, "lastIndex");
        var i = ToInteger(lastIndex);
        if (isAbrupt(i = ifAbrupt(i))) return i;
        var global = ToBoolean(Get(R, "global"));
        if (isAbrupt(global = ifAbrupt(global))) return global;
    }
    sticky = ToBoolean(Get(R, "sticky"));
    if (isAbrupt(sticky = ifAbrupt(sticky))) return sticky;
    matcher = getInternalSlot(R, SLOTS.REGEXPMATCHER);
    flags = getInternalSlot(R, SLOTS.ORIGINALFLAGS);
    fullUnicode = flags.indexOf("u") > -1;
    matchSucceeded = false;
    while (!matchSucceeded) {
        if (i < 0 || i > length) {
            if (ignore) {
                putStatus = Put(R, "lastIndex", 0, true);
                if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;
                return NormalCompletion(null);
            }
        }
        var r = matcher(S, i);
        if (r === FAILURE) {
            if (sticky) {
                if (ignore) {
                    putStatus = Put(R, "lastIndex", 0, true);
                    if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;
                }
            	return NormalCompletion(null);
            }
            i = i + 1;
        } else {
    	    if (!(r && r.endIndex && r.captures)) return newTypeError( "RegExpExec: r has to be a state instance. Assertion failed.");
            Assert(r && r.endIndex && r.captures, "RegExpExec: r has to be a state instance");
            matchSucceeded = true;
        }
    }
    e = r.endIndex;
    if (fullUnicode) {
            // index
    }
    if (global) {
        putStatus = Put(R, "lastIndex", e, true);
        if (isAbrupt(putStatus = ifAbrupt(putStatus))) return putStatus;
    }
    var n = matcher.evaluator.NCapturingParens;
    var A = ArrayCreate(n + 1);
    var matchIndex = i;
    var status;
    status = CreateDataProperty(A, "index", matchindex);
    if (isAbrupt(status)) return status;
    status = CreateDataProperty(A, "input", S);
    if (isAbrupt(status)) return status;
    status = CreateDataProperty(A, "length", n + 1);
    if (isAbrupt(status)) return status;
    var matchedSubstr = S.substr(i, e);
    status = CreateDataProperty(A, "0", matchedSubstr);
    var captureString;
    for (i = 1; i <= n; i++) {
        var captureI = r.captures[i];
        if (fullUnicode) {
            captureString = captureI;
        } else {
            captureString = captureI;
        }
        status = CreateDataProperty(A, ToString(i), captureString);
        if (isAbrupt(status)) return status;
    }
    return NormalCompletion(A);
}
var FAILURE = {};
function createRegExpMatcher(pattern) {
    var patternMatcher; // Evaluate(Pattern::Disjunction) returns the [[RegExpMatcher]](x,c) i guess
    var evaluator = function() {
        return patternMatcher.apply(evaluator, arguments);
    };
    // variables
    evaluator.flags = undefined;
    evaluator.Input = undefined;	// will be pattern characters or the STR
    evaluator.inputLength = 0;
    evaluator.NCapturingParens = 0;
    evaluator.ignoreCase = false;
    evaluator.Multiline = false;
    evaluator.Unicode = false;
    // interpreter
    evaluator.Pattern = Pattern;
    evaluator.Disjunction = Disjunction;
    evaluator.Alternative = Alternative;
    evaluator.Term = Term;
    evaluator.Assertion = Assertion;
    evaluator.isFailure = function (r) {
        return r === FAILURE;
    };
    evaluator.Continuation = function (steps) {
        return steps;
    };
    evaluator.State = function (endIndex, captures) {
        return { endIndex: endIndex, captures: captures };
    };
    evaluator.evaluate = function (node) {
	if (node === undefined) return FAILURE;
        var f = this[node.type];4;
        if (f) return f.call(evaluator, node);
    };
    patternMatcher = evaluator.evaluate.call(evaluator, pattern);
    evaluator.patternMatcher = patternMatcher;
    return evaluator;
}
function Pattern (node) {
    // start at Pattern :: Disjunction
    var disjunction = node.disjunction;
    var m = this.evaluate(disjunction);
    // i guess here the compiled stuff can land.
    // and the closure just works on bytestreams anyways

    return function matcher (str, index) {
        this.Input = new String(str);
        var listIndex = this.Input.indexOf(str[index]);
        this.InputLength = this.Input.length;
        var c = this.Continuation(function (state) { return state; });
        var cap = new Array((this.NCapturingParens|0) + 1); // indexed 1 bis
        var x = this.State(listIndex, cap);

        if (m != FAILURE) return m.call(this, x,c);
        // temp disabled
    };
}
function Disjunction (node) {
    var alternative = node.alternative;
    var disjunction = node.disjunction;
    if (!disjunction && alternative) {			// gates
        var a = this.evaluate(alternative);
        if (!a) return FAILURE;
        return a;
    } else if (disjunction && alternative) {		// power on
        var m1 = this.evaluate(alternative);
        if (!m1) return FAILURE;
        var m2 = this.evaluate(disjunction);
        if (!m2) return FAILURE;
        return function m(x, c) {
            var r;

            r = m1.call(this, x, c);
            if (!this.isFailure(r)) return r;

            return m2.call(this, x, c);
        };
    }
    return FAILURE;
}
function Alternative(node) {
    if (!node) return FAILURE;
    var alternative = node.atom;
    var term = node.term;
    // abc ist alternative alternative term.. oder [x,y,]
    if (!atom) return FAILURE;
}
function Term (node) {
    if (!node) return FAILURE;
    if (node.assertion) {
        return this.evaluate(node.assertion);
    }
    return FAILURE;
}
function Assertion(node) {
    return function m (x, c) {
        if (node == "^") {
            return function assertion_tester_caret (x) {
                var e = x.endIndex;
                if (e === 0) return true;
                if (this.Multiline === false) return false;
                return LineTerminators[this.Input[e-1]];
            }
        }

        var r = !!t.call(this, c);
        if (!r) return null;
        return c.call(this, x);
    };
}
var RegExp_$$create = function (thisArg, argList) {
    return RegExpAllocate(thisArg);
};
var RegExp_Call = function (thisArg, argList) {
    var func = this;
    var pattern = argList[0];
    var flags = argList[1];
    var O = thisArg;
    var P, F, testP;
    if (!hasInternalSlot(O, SLOTS.REGEXPMATCHER) || getInternalSlot(O, SLOTS.REGEXPMATCHER) !== undefined) {
        if (testP=(Type(pattern) === OBJECT && hasInternalSlot(pattern, SLOTS.REGEXPMATCHER))) return pattern;
        O = RegExpAllocate(func);
        if (isAbrupt(O = ifAbrupt(O))) return O;
    }
    if (testP) {
        if (getInternalSlot(pattern, SLOTS.REGEXPMATCHER) !== undefined) return newTypeError( "patterns [[RegExpMatcher]] isnt undefined");
        if (flags != undefined) return newTypeError( "flag should be undefined for this call");
        P = getInternalSlot(pattern, SLOTS.ORIGINALSOURCE);
        F = getInternalSlot(pattern, SLOTS.ORIGINALFLAGS);
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
    if (Type(R) !== OBJECT) return newTypeError( "this value is no object");
    if (!hasInternalSlot(R, SLOTS.ORIGINALFLAGS)) return newTypeError( "this value has no [[OriginalFlags]]");
    var flags = getInternalSlot(R, SLOTS.ORIGINALFLAGS);
    return NormalCompletion(flags.indexOf("g") > -1);
};
var RegExpPrototype_get_multiline = function (thisArg, argList) {
    var R = thisArg;
    if (Type(R) !== OBJECT) return newTypeError( "this value is no object");
    if (!hasInternalSlot(R, SLOTS.ORIGINALFLAGS)) return newTypeError( "this value has no [[OriginalFlags]]");
    var flags = getInternalSlot(R, SLOTS.ORIGINALFLAGS);
    return NormalCompletion(flags.indexOf("m") > -1);
};
var RegExpPrototype_get_ignoreCase = function (thisArg, argList) {
    var R = thisArg;
    if (Type(R) !== OBJECT) return newTypeError( "this value is no object");
    if (!hasInternalSlot(R, SLOTS.ORIGINALFLAGS)) return newTypeError( "this value has no [[OriginalFlags]]");
    var flags = getInternalSlot(R, SLOTS.ORIGINALFLAGS);
    return NormalCompletion(flags.indexOf("i") > -1);
};
var RegExpPrototype_get_sticky = function (thisArg, argList) {
    var R = thisArg;
    if (Type(R) !== OBJECT) return newTypeError( "this value is no object");
    if (!hasInternalSlot(R, SLOTS.ORIGINALFLAGS)) return newTypeError( "this value has no [[OriginalFlags]]");
    var flags = getInternalSlot(R, SLOTS.ORIGINALFLAGS);
    return NormalCompletion(flags.indexOf("y") > -1);
};
var RegExpPrototype_get_unicode = function (thisArg, argList) {
    var R = thisArg;
    if (Type(R) !== OBJECT) return newTypeError( "this value is no object");
    if (!hasInternalSlot(R, SLOTS.ORIGINALFLAGS)) return newTypeError( "this value has no [[OriginalFlags]]");
    var flags = getInternalSlot(R, SLOTS.ORIGINALFLAGS);
    return NormalCompletion(flags.indexOf("u") > -1);
};
var RegExpPrototype_get_source = function (thisArg, argList) {
    var R = thisArg;
    if (Type(R) !== OBJECT) return newTypeError( "this value is no object");
    if (!hasInternalSlot(R, SLOTS.ORIGINALSOURCE)) return newTypeError( "this value has no [[OriginalSource]]");
    if (!hasInternalSlot(R, SLOTS.ORIGINALFLAGS)) return newTypeError( "this value has no [[OriginalFlags]]");
    var source =getInternalSlot(R, SLOTS.ORIGINALSOURCE);
    var flags = getInternalSlot(R, SLOTS.ORIGINALFLAGS);
    if (source === undefined || flags === undefined) return newTypeError( "source and flags may not be undefined");
    return EscapeRegExpPattern(source, flags);
};
var RegExpPrototype_exec = function (thisArg, argList) {
    var R = thisArg;
    var string = argList[0];
    var S;
    if (Type(R) !== OBJECT) return newTypeError( "this value is not an object");
    if (!hasInternalSlot(R, SLOTS.REGEXPMATCHER)) return newTypeError( "this value has not [[RegExpMatcher]] internal slot");
    if (getInternalSlot(R, SLOTS.REGEXPMATCHER) === undefined) return newTypeError( "this value has not [[RegExpMatcher]] internal slot defined");
    S = ToString(string);
    if (isAbrupt(S=ifAbrupt(S))) return S;
    return RegExpExec(R,S);
};
var RegExpPrototype_search = function (thisArg, argList) {
    var rx = thisArg;
    var S = argList[0];
    if (Type(rx) !== OBJECT) return newTypeError( "this value is not an obect");
    if (!hasInternalSlot(rx, SLOTS.REGEXPMATCHER)) return newTypeError( "this value has no [[RegExpMatcher]] internal slot");
    var matcher = getInternalSlot(rx, SLOTS.REGEXPMATCHER);
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
    if (Type(rx) !== OBJECT) return newTypeError( "this value is not an object");
    if (!hasInternalSlot(rx, SLOTS.REGEXPMATCHER)) return newTypeError( "this value has not [[RegExpMatcher]] internal slot");
    if (getInternalSlot(rx, SLOTS.REGEXPMATCHER) === undefined) return newTypeError( "this value has not [[RegExpMatcher]] internal slot defined");
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
    if (Type(R) !== OBJECT) return newTypeError( "this value is no object");
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
    if (Type(rx) !== OBJECT) return newTypeError( "this value is not an object");
    if (!hasInternalSlot(rx, SLOTS.REGEXPMATCHER)) return newTypeError( "this value has not [[RegExpMatcher]] internal slot");
    if (getInternalSlot(rx, SLOTS.REGEXPMATCHER) === undefined) return newTypeError( "this value has not [[RegExpMatcher]] internal slot defined");

    var nCaptures = rx.NCapturingParens;
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
    previousLastIndex = 0;
    var done = false;
    accumulatedResult = "";
    nextSrcPosition = 0;
    var previousLastIndex;
    while (!done) {
        var result = RegExpExec(rx, S);
        if (isAbrupt(result=ifAbrupt(result))) return result;
        if (result === null) done = true;
        else {
            if (global) {
                var thisIndex = ToInteger(Get(rx, "lastIndex"));
                if (isAbrupt(thisIndex = ifAbrupt(thisIndex))) return thisIndex;
                if (thisIndex === previousLastIndex) {
                    putStatus = Put(rx, "lastIndex", thisIndex + 1, true);
                    if (isAbrupt(putStatus)) return putStatus;
                    previousLastIndex = thisIndex + 1;
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
                var replValue = callInternalSlot(SLOTS.CALL, replaceValue, undefined, replacerArgs);
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
    if (Type(R) !== OBJECT) return newTypeError( "this value is not an object");
    if (!hasInternalSlot(R, SLOTS.REGEXPMATCHER)) return newTypeError( "this value has not [[RegExpMatcher]] internal slot");
    if (getInternalSlot(R, SLOTS.REGEXPMATCHER) === undefined) return newTypeError( "this value has not [[RegExpMatcher]] internal slot defined");
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
    return NormalCompletion(result);
};