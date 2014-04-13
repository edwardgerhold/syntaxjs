


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

/*
    this will become the first AST evaluator

    which isnt in runtime.js

    i can make an extra file, but should stick it to
    all other "node traversing" functions.
 */

function RegExpMatcher(patternCharacters, flags, parsed) {

    var matcher = {};
    matcher.Input = patternCharacters; // patternCharacters is the input alphabet i guess, that means the whole set of codepoints/units and not a-z
    matcher.inputLength = 0;
    matcher.NCapturingParens = 0;
    matcher.ignoreCase = false;
    matcher.Multiline = false;
    matcher.Unicode = false;
    matcher.Pattern = Pattern;
    matcher.Disjunction = Disjunction;
    matcher.Alternative = Alternative;
    matcher.isFailure = function (r) {
        return r === null;
    };
    matcher.Continuation = function (steps) {
        return steps;
    }
    matcher.State = function (lastIndex, str) {
        return [lastIndex, str];
    };
    matcher.evaluate = function (node) {
        var f = this[node.type];
        if (f) return f.call(this, node);
    };
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
        return this.evaluate(alternaive);
    } else {
        var m1 = this.evaluate(alternative);
        var m2 = this.evaluate(disjunction);
        return function m(x, c) {
            var r = m1.call(this, x, c);
            if (this.isFailure(r)) return r;
            return m2.call(this, x, c);
        };
    }
    return null;
}

function Term () {
    if (node.assertion) {
        this.evaluate(node.assertion);
    }
}

var LineTerminator = require("tables").LineTerminator;

function Assertion(node) {

    return function m (x, c) {

        if (node == "^") {
            return function assertion_tester (x) {
                var e = x.endIndex;
                if (e === 0) return true;
                if (this.Multiline === false) return false;
                if (LineTerminator[this.Input[e-1]]) return true;
            }
        }

        var r = !!t.call(this, c);
        if (!r) return null;
        return c.call(this, x);

    }
}
