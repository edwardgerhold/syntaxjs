
var tables = require("tables");
var LineTerminators = tables.LineTerminators;

exports.RegExpCreate = RegExpCreate;

function RegExpCreate(P, F) {
    var obj = RegExpAllocate(getIntrinsic("%RegExp%"));
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

    var P, F, BMP;;
    if (pattern === undefined) P = "";
    else P = ToString(pattern);
    if (isAbrupt(P=ifAbrupt(P))) return P;
    if (flags === undefined) F = "";
    else F = ToString(flags);
    BMP = F.indexOf("u") === -1;

    var parse = require("regexp-parser").parse
    var patternCharacters = parse(P);

    setInternalSlot(obj, "OriginalFlags", F);
    setInternalSlot(obj, "OriginalSource", P);
    setInternalSlot(obj, "RegExpMatcher", createRegExpMatcher(patternCharacters));

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
    	    if (!(r && r.endIndex && r.captures)) return withError("Type", "RegExpExec: r has to be a state instance. Assertion failed.");
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

/*



*/
var FAILURE = null;

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
        var f = this[node.type];4
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
    }
}
