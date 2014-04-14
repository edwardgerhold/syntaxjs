
var tables = require("tables");
var LineTerminators = tables.LineTerminators;

function RegExpCreate(P, F) {
    var obj = RegExpAllocate(getIntrinsic("%RegExp%"));
    if (isAbrupt(obj=ifAbrupt(obj))) return obj;
    return RegExpInitialize(obj, P, F);
}

function EscapeRegExpPattern(P, F) {
    var S = "";
    for (var i = 0, j = P.length; i < j; i++) {
        var codePoint = P[i];
        if (codePoint === "/") {
            S += "\\/";
        } else S += codePoint;
    }
    return S;
}

function RegExpInitialize(obj, pattern, flags) {

    var P, F, BMP;;
    if (pattern === undefined) P = "";
    else P = ToString(pattern);
    if (isAbrupt(P=ifAbrupt(P))) return P;
    if (flags === undefined) F = "";
    else F = ToString(flags);
    BMP = F.indexOf("u") === -1;

    var parsed = parseGoal("Pattern", P);

    setInternalSlot(obj, "OriginalFlags", F);
    setInternalSlot(obj, "OriginalSource", P);
    setInternalSlot(obj, "RegExpMatcher", RegExpMatcher(patternCharacters, flags, parsed));

    var putStatus = Put(obj, "lastIndex", 0, true);
    if (isAbrupt(putStatus=ifAbrupt(putStatus))) return putStatus;
    return NormalCompletion(obj);
}

function RegExpAllocate(constructor) {

    var obj = OrdinaryCreateFromConstructor(constructor, "%RegExpPrototype%",{
        "RegExpMatcher": undefined,
        "OriginalSource": undefined,
        "OriginalFlags": undefined
    });
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
    Assert(getInternalSlot(R, "RegExpMatcher") != undefined, "RegExpExec: R must be a initialized RegExp instance");
    Assert(Type(S) === "string");
    Assert(ignore !== undefined ? Type(ignore) === "boolean" : true, "ignore has to be a bool if ignore is provided");
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
    matcher = getInternalSlot(R, "RegExpMatcher");
    flags = getInternalSlot(R, "OriginalFlags");
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
        r = matcher(S, i);
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
            Assert(Array.isArray(r) && r.length === 2, "RegExpExec: r has to be a state instance");
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
    var n = matcher.machine.NCapturingParens;
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



/*




 */

var FAILURE = null;

function RegExpMatcher(patternCharacters, flags, parsed) {

    var laterARealAutomaton = {};
    laterARealAutomaton.flags = flags;
    laterARealAutomaton.Input = patternCharacters;
    laterARealAutomaton.inputLength = 0;
    laterARealAutomaton.NCapturingParens = 0;
    laterARealAutomaton.ignoreCase = false;
    laterARealAutomaton.Multiline = false;
    laterARealAutomaton.Unicode = false;
    laterARealAutomaton.Pattern = Pattern;
    laterARealAutomaton.Disjunction = Disjunction;
    laterARealAutomaton.Alternative = Alternative;
    laterARealAutomaton.isFailure = function (r) {
        return r === FAILURE;
    };
    laterARealAutomaton.Continuation = function (steps) {
        return steps;
    };
    laterARealAutomaton.State = function (lastIndex, str) {
        return [lastIndex, str];
    };
    laterARealAutomaton.evaluate = function (node) {
        var f = this[node.type];
        if (f) return f.call(this, node);
    };


    var matcher = laterARealAutomaton.evaluate(parsed);
    matcher.machine = laterARealAutomaton;
    return matcher;

}

function Pattern (node) {
    var disjunction = node.disjunction;
    var m = this.evaluate(disjunction);
    return function matcher (str, index) {
        this.Input = new String(str);
        var listIndex = this.Input.indexOf(str[index]);
        this.InputLength = this.Input.length;
        var c = this.Continuation(function (state) { return state; });
        var cap = new Array(this.NCapturingParens + 1); // indexed 1 bis
        var x = this.State(listIndex, cap);
        return m.call(this, x,c);
    };
}

function Disjunction (node) {
    var alternative = node.alternative;
    var disjunction = node.disjunction;
    if (!disjunction) {
        return this.evaluate(alternative);
    } else {
        var m1 = this.evaluate(alternative);
        var m2 = this.evaluate(disjunction);
        return function m(x, c) {
            var r = m1.call(this, x, c);
            if (this.isFailure(r)) return r;
            return m2.call(this, x, c);
        };
    }
  
}

function Term () {
    if (node.assertion) {
        this.evaluate(node.assertion);
    }
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
    }
};
