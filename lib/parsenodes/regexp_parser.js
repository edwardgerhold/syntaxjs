/*

    The tokenizer is different from the remaining tokenization.
    I just need the array of code points.

    So i thought it´s better to separate it.

    Mistakes will be resolved when i´m through the whole evaluation specification
    and have completed implementing the RegExp.prototype methods.

      MY own question to myself is, how do i generate the automaton from (without violating spec)?

      Starting one from scratch is easy for me. But to see through the
      mist here, i got still some work to do. I will answer the question soon.

 */

define("regexp-parser", function (require, exports) {
"use strict";
    var tables = require("tables");

    var ch, lookahead, index, input, length;
    var parser = Object.create(null);

    function Node(type) {
        return {
            type: type
        };
    }

    function pass(c) {
        if (c == ch) next();
        else throw new SyntaxError("RegExpParser: " + c + " expected")
    }

    function next() {
        if (index < length) {
            ch = lookahead;
            lookahead = input[++index];
            return ch;
        }
        return undefined;
    }

    var FirstOfQuantifierPrefix = {
        "*": true,
        "+": true,
        "?": true,
        "{": true
    };


    var FirstOfAssertion = {
        __proto__: null,
        "^": true,
        "$": true,
        "\\": true,
        "(": true
    };

    var FollowOfAssertion = {
        __proto__: null,
        "b": "\\",
        "B": "\\"
    };

    var FirstOfAtom = {
        __proto__: null,
        "^": true,
        "$": true,
        "\\": true,
        ".": true
    };

    var ControlLetter = tables.ControlLetter;
    var ControlEscape = tables.ControlEscape;
    var CharacterClassEscape = tables.CharacterClassEscape;
    var NonPatternCharacter = tables.NonPatternCharacter;

    Object.keys(ControlLetter).forEach(function (key) {
        FirstOfAtom[key] = true;
    });


    function Term() {
        var node;
        if (FirstOfAssertion[ch] || !NonPatternCharacter[ch]) {
            node = Node("Assertion");
            var assertion;
            var first = ch;
            switch (ch) {
                case "^":
                    node.assertion = "^";
                    pass("^");
                    break
                case "$":
                    node.assertion = "$";
                    pass("$");
                    break;
                case "\\":
                    if (lookahead === "b" || lookahead === "B") {
                        next();
                        node.assertion = "\\" + ch;
                    }
                    break;
                case "(":
                    if (lookahead === "?") {
                        pass("(")
                        pass("?");
                        if (ch == "=") {
                            pass("=");
                            node.assertion = this.Disjunction();
                            node.prefix = "?=";
                        } else if (ch == "!") {
                            pass("!");
                            node.assertion = this.Disjunction();
                            node.prefix = "?!";
                        }
                    }
                    break;
                default:
                    return null;
            }
            return node;
        }
        if (FirstOfAtom[ch]) {
            node = Node("Atom");
            switch (ch) {
                case "\\":
                    node.atom = this.AtomEscape();
                    break;
                case "[":
                    node.atom = this.CharacterClass();
                    break;
                case "(":
                    pass("(")
                    if (ch == "?" && lookhead == ":") {
                        pass("?");
                        pass(":");
                        node.atom = "?:"
                        node.disjunction = this.Disjunction();
                    } else {
                        node.atom = this.Disjunction();
                    }
                    break;
                case ".":
                    node.atom = ".";
                    pass(".");
                    break;
                default:
                    if (!NonPatternCharacter[ch]) {
                        node.atom = ch;
                        next();
                    }

            }
            if (node) {
                var quantifier = this.Quantifier();
                if (quantifier) node.quantifier = quantifier;
            }
            return node;
        }
        return null;
    }

    function Quantifier() {
        if (FirstOfQuantifierPrefix[ch]) {

            var quantifier = ch;
            if (ch == "{") {

                pass("{");
                if (DecimalDigits[ch]) {
                    var q1 = "";
                    while (DecimalDigits[ch]) {
                        q1 += ch;
                        next();
                    }
                    if (ch == ",") {
                        var q2 = "";
                        pass(",");
                        while (DecimalDigits[ch]) {
                            q1 += ch;
                            next();
                        }
                    } else if (ch == "}") {
                        pass("}");
                        return [q1];
                    } else {
                        throw new SyntaxError("invalid quantifier");
                    }
                    pass("}");
                    return [q1, q2];
                } else {
                    throw new SyntaxError("invalid quantifier");
                }

            } else {
                pass(quantifier);
                return quantifier;
            }
        }
        return null;
    }

    function AtomEscape() {
        var escape = "\\";
        if (DecimalDigits[lookahead]) {
            pass("\\");
            while (DecimalDigits[ch]) {
                escape += ch;
                next();
            }
            return escape;
        }
        else if (ControlLetter[lookahead]) {
            pass("\\");
            escape += ch;
            pass(ch);
            return escape;
        } else if (CharacterClassEscape[lookahead]) {
            pass("\\");
            escape += ch;
            return escape;
        }
        return escape;
    }

    var DecimalDigits = tables.DecimalDigits;
    var Hexdigits = tables.HexDigits;

    function ClassEscape() {
        var escape = "\\";
        if (DecimalDigits[lookahead]) {
            pass("\\");
            if (ch == "0" && (lookahead === "x" || lookahead === "X")) {
                // HexEscapeSequence
                escape += "0";
                pass("0");
                escape += ch;
                pass(ch);
                while (HexDigits[ch]) {
                    escape += ch;
                    next();
                }
                return escape;
            }
            if (ch == "u") {
                // UnicodeEscapeSequence
                escape += "u";
                pass("u");
                while (HexDigits[ch]) {
                    escape += ch;
                    next();
                }
                return escape;
            }
            while (DecimalDigits[ch]) {
                escape += ch;
                next();
            }
            return escape;
        } else if (lookahead === "b") {
            pass("\\");
            escape += "b";
            pass("b");
            return escape;
        } else if (CharacterClassEscape[lookahead]) {
            pass("\\");
            escape += ch;
            pass(ch);
            return escape;
        } else {

            if (lookahead == "c") {
                pass("\\");
                pass("c");
                // not strikt (requires 3 token lookahead)
                if (ControlLetter[ch]) {
                    escape += ch;
                }
                pass(ch);
                return escape;
            }
            if (ControlEscape[lookahead]) {
                pass("\\");
                escape += ch;
                pass(ch);
                return escape;
            }
        }
    }

    function ClassRanges() {
        // ranges = [ 0, [1-7], 8, 9, [10-125] ]
        var ranges = [];
        while (ch != "]" && ch != undefined) {
            var left = ch;
            if (ch == "\\") {
                left = ClassEscape();
                if (!left) return null; // ???
            } else {
                pass(ch);
            }
            if (ch == "-") {
                pass("-");
                var right = ch;
                ranges.push([left, right]);
            } else {
                ranges.push(left);
            }
        }
        return ranges;
    }

    function CharacterClass() {
        var node = Node("CharacterClass");
        pass("[");e
        if (ch == "^") {
            node.negation = true;
            pass("^");
        }
        node.ranges = this.ClassRanges();
        pass("]");
        return node;
    }

    function Disjunction() {
        var node = Node("Disjunction");
        node.alternative = this.Alternative();
        if (ch === "|") {
            pass("|");
            node.disjunction = Disjunction();
        }
        return node;
    }

    function Alternative() {
        var alternative = [];
        do {
            var term = this.Term();
            alternative.push(term);
        } while (term && ch != "|" && ch != undefined);
	return alternative;
    }

    function Pattern() {
        var node = Node("Pattern");
        node.disjunction = this.Disjunction();
        return node;
    }
    
    function parse(string) {
        input = string || "";
        length = input.length;
        if (length === 0) return Node("Pattern");
        index = -1;
        lookahead = string[0];
        next();
        try {
        var result = Pattern.call(parser);
        } catch (ex) {
    	    console.log("DEBUG REGULAR EXPRESSION PARSER EXCEPTION");
    	    console.log(ex.name);
    	    console.log(ex.message);
    	    console.log(""+ex.stack);
        }
        return result;
    }

    parser.Pattern = Pattern;
    parser.Alternative = Alternative;
    parser.Disjunction = Disjunction;
    parser.ClassRanges = ClassRanges;
    parser.ClassEscape = ClassEscape;
    parser.Term = Term;
    parser.CharacterClass = CharacterClass;
    parser.AtomEscape = AtomEscape;
        
    exports.parser = parser;
    exports.parse = parse;
    return exports;
});