define("tokenizer", function () {

    "use strict";
    var exports = {};
    var tables = require("tables");
    
    var Punctuators = tables.Punctuators;
    var WhiteSpaces = tables.WhiteSpaces;
    var LineTerminators = tables.LineTerminators;
    var HexDigits = tables.HexDigits;
    var BinaryDigits = tables.BinaryDigits;
    var OctalDigits = tables.OctalDigits;
    var DecimalDigits = tables.DecimalDigits;
    var ExponentIndicator = tables.ExponentIndicator;
    var SignedInteger = tables.SignedInteger;
    var ParensSemicolonComma = tables.ParensSemicolonComma;
    var NumericLiteralLetters = tables.NumericLiteralLetters;
    var SingleEscape = tables.SingleEscape;
    var IdentifierStart = tables.IdentifierStart;
    var IdentifierPart = tables.IdentifierPart;
    var RegExpFlags = tables.RegExpFlags;
    var RegExpNoneOfs = tables.RegExpNoneOfs;
    var NotBeforeRegExp = tables.NotBeforeRegExp;
    var UnicodeIDStart = tables.UnicodeIDStart;
    var UnicodeIDContinue = tables.UnicodeIDContinue;
    var Quotes = tables.Quotes;
    var PunctToExprName = tables.PunctToExprName;
    var TypeOfToken = tables.TypeOfToken;
    
    /*
        var unicode = require("unicode-support");
	var isIdentifierStart = unicode.isIdentifierStart || function () {};
        var isIdentifierPart = unicode.isIdentifierPart || function () {};
    */

    var createCustomToken = null;
    var sourceCode;
    var i, j;
    var token;
    var ch, lookahead;	// lookahead0 and lookahead1
    var cb;
    var tokens = [];
    var line = 1,
        column = 1;
    var lines = [];
    var offset = 0;
    var filename = null;
    var lastTokenType;
    var inputElementDiv = 1;
    var inputElementRegExp = 2;
    var inputElementTemplateTail = 3;
    var inputElementGoal = inputElementRegExp;
    var withExtras = true;
    var isWS, isLT;

    var AllowedLastChars = {
        ")": true,
        "]": true,
        "}": true,
        ";": true,
        ":": true,
        "--": true,
        "++": true
    };
    var OneOfThesePunctuators = {
        ")": true,
        "]": true,
        "--": true,
        "++": true
    };

    var PunctOrLT = {
        "Punctuator": true,
        "LineTerminator": true
    };


    function pass(c) {
        if (c == ch) next();
        else throw new SyntaxError("tokenizer: "+ c + " expected, saw "+ch)
    }


    function Assert(test, message) {
        if (!test) throwError(new SyntaxError("tokenizer: "+message));
    }
    function throwError(se) {
        if (i > -1 && i < j) {
            if (se === undefined) se = new SyntaxError("Can not parse token.");
            var oldstack = se.stack;
            se.stack = "syntax.js tokenizer,\nfunction tokenize,\n does not recognize actual input. ch=" + ch + ", lookahead=" + lookahead + ", line=" + line + ", col=" + column + ", offset=" + offset + ", i="+i+" " +sourceCode+" \n" + oldstack;
            throw se;
        }
    }

    var debugmode = true;
    function debug() {
        if (debugmode && typeof importScripts !== "function") {
            if (typeof arguments[0] == "object") {
                console.dir(arguments[0]);
            } else console.log.apply(console, arguments);
        }
    }
    function debugdir() {
        if (debugmode && typeof importScripts !== "function") console.dir.apply(console, arguments);
    }




    function LineTerminator() {
        if (LineTerminators[ch]) {
            isLT = true;
            pushtoken("LineTerminator", ch);
            isLT = false;
            next();
            return token;
        }
        return false;
    }

    function WhiteSpace() {
        var spaces = "";
        var spc;
        if (WhiteSpaces[ch]) {
            spaces += ch;
            spc = ch;
            while (lookahead === spc) {
                next();
                spaces += ch;
            }
            isWS = true;
            pushtoken("WhiteSpace", spaces);
            isWS = false;
            next();
            return token;
        }
        return false;
    }

    function StringLiteral() {
        // please collect: raw string
        // and value string
        var quotecharacter;
        var string = "";
        var raw = "";
        var multiline = false;
        var n;
        if (Quotes[ch]) {
            quotecharacter = ch;
            string += ch;

            big: while (next()) {
                string += ch;
                if (ch === quotecharacter) {
                    n = string.length - 2;
                    do {
                        if (string[n] !== "\\") break big;
                        else if (string[n - 1] === "\\" && string[n - 2] !== "\\") break big;
                    } while (string[n -= 2] === "\\");
                }
                if (LineTerminators[lookahead]) {
                    n = string.length - 1;
                    while (string[n] === "\\") {
                        if (string[n - 1] === "\\") {
                            multiline = false;
                            n -= 2;
                        } else {
                            multiline = true;
                            nextLine();
                            break;
                        }
                    }
                }
                if (LineTerminators[ch]) {
                    if (!multiline) throw new SyntaxError("Unexpected token ILLEGAL");
                    else multiline = false;
                }
            }
            pushtoken("StringLiteral", string, string.substr(1, string.length - 2));
            next();
            return token;
        }
        return false;
    }

    function TemplateLiteral () {
        // `edward ${ ""+ist+y } toll ${ oder } nicht?`
        // [ "edward ", " \""+ist+y ", " toll ", " oder ", " nicht" ]

        if (ch === "`") {
            var template, cooked;
            var spans = [];
            pass("`");
            while (ch != undefined) {
                template = "";
                while ((ch === "$" && lookahead === "{") === false) {
                    if (ch === "`") {
                        spans.push(template);
                        pushtoken("TemplateLiteral", spans);
                        pass("`");
                        return token;
                    }
                    template += ch;
                    next();
                }
                spans.push(template);
                pass("$");
                pass("{");
                cooked = "";
                while (ch != "}") {
                    cooked += ch;
                    next();
                }
                spans.push(cooked);
                pass("}");
            }
        }
        return false;
    }

    function Comments() {
        var comment = "";
        var type;
        if ((ch + lookahead) === "//") {
            type = "LineComment";
            comment = "//";
            next();
            while (ch && !LineTerminators[lookahead]) {
                next();
                comment += ch;
            }
            pushtoken(type, comment);
            next();
            return token;
        } else if (ch + lookahead === "/*") {
            type = "MultiLineComment";
            while (ch + lookahead !== "*/") {
                if (ch === undefined) {
                    throw new SyntaxError("Unexpected end of file");
                }
                comment += ch;
                next();
            }
            comment += ch + lookahead;
            next();
            pushtoken(type, comment);
            next();
            return token;
        }
        return false;
    }

    /*
     Regex schreiben
     */

    function RegularExpressionLiteral() {
        var expr = "";
        var flags = "";
        var n, l;
        if (ch === "/" && !NotBeforeRegExp[lastTokenType]) { // <--- grammatik

            if (!RegExpNoneOfs[lookahead] && !LineTerminators[lookahead]) {
                //expr += ch;
                next();
                if (i > j) throw new SyntaxError("Unexpected end of line, while parsing RegularExpressionLiteral at line " + line + ", column " + column);
                big: while (next()) {
                    if (ch === "/") {
                        n = expr.length - 1;
                        do {
                            if (expr[n] !== "\\") break big;
                            else if (expr[n - 1] === "\\" && expr[n - 2] !== "\\") break big;
                        } while (expr[n -= 2] === "\\");

                    } else if (LineTerminators[ch] || i > j) {
                        throw new SyntaxError("Unexpected end of line, while parsing RegularExpressionLiteral at line " + line + ", column " + column);
                        return false;
                    }
                    expr += ch;
                    next();
                }
            } else return false;

            if (ch === "/") {
                //expr += ch;
                while (RegExpFlags[lookahead]) { // besorge noch die flags
                    next();
                    flags += ch;
                }

                pushtoken("RegularExpressionLiteral", [expr, flags]);
                next();

                inputElementGoal = inputElementDiv;
                return token;
            }
        }
        return false;
    }

    function DivPunctuator() {

        /*
            this is old */

        var tok;
        if (ch === "/") {
            if (tok = Comments()) return token = tok;
            if (inputElementGoal === inputElementRegExp) {
                if (tok = RegularExpressionLiteral()) {
                    inputElementGoal = inputElementDiv;
                    return token = tok;
                }
                inputElementGoal = inputElementDiv;
            }
            if (inputElementGoal !== inputElementRegExp) {
                if (ch + lookahead === "/=") {
                    next();
                    pushtoken("Punctuator", "/=", undefined, PunctToExprName["/="]);
                    next();
                    return token;
                } else {
                    pushtoken("Punctuator", ch, undefined, PunctToExprName[ch]);
                    next();
                    return token;
                }
            }
        }
        return false;
    }

    function Punctuation() {

        /*

            better is a hardcoded path and nested switch each char,
            that´s forward parsing, and here it´s capture 4, go down to 1.

         */

        if (ParensSemicolonComma[ch]) {
            pushtoken("Punctuator", ch, undefined, PunctToExprName[ch]);
            next();
            return token;
        }

        var punct = sourceCode[i] + sourceCode[i + 1] + sourceCode[i + 2] + sourceCode[i + 3];

        if (punct === ">>>=") {
            next();next();next();
            pushtoken("Punctuator", punct, undefined, PunctToExprName[punct]);
            next();
            return token;
        }

        punct = punct[0] + punct[1] + punct[2];
        if (Punctuators[punct]) {
            next();next();
            pushtoken("Punctuator", punct, undefined, PunctToExprName[punct]);
            next();
            return token;
        }
        punct = punct[0] + punct[1];
        if (Punctuators[punct]) {
            next();
            pushtoken("Punctuator", punct, undefined, PunctToExprName[punct]);
            next();
            return token;
        }

        punct = punct[0];
        if (Punctuators[punct]) {
            pushtoken("Punctuator", punct, undefined, PunctToExprName[punct]);
            next();
            return token;
        }

        return false;
    }

    function DecimalDigitsHelp(number) {
        var dot;
        if (DecimalDigits[ch] || (ch === "." && DecimalDigits[lookahead] && (dot = true))) {
            number += ch;
            for (;;) {
                if (DecimalDigits[lookahead] || (lookahead === "." && !dot)) {
                    next();
                    number += ch;
                    if (ExponentIndicator[lookahead]) {
                        next();
                        number += ch;
                        if (SignedInteger[lookahead]) {
                            next();
                            number += ch;
                        }
                        while (DecimalDigits[lookahead]) {
                            next();
                            number += ch;
                        }
                        return number;
                    }
                } else break;
            }
            return number;
        }
        return false;
    }

    function NumericLiteral() {
        var number = "",
            longName, computed = 0;
        if (ch === "0" && NumericLiteralLetters[lookahead]) {
            number += ch;
            next();
            if ((ch === "x" || ch === "X") && HexDigits[lookahead]) {
                number += ch;
                while (HexDigits[lookahead]) {
                    next();
                    number += ch;
                }
                longName = "HexLiteral";
                computed = +number;
            } else if ((ch === "b" || ch === "B") && BinaryDigits[lookahead]) {
                number += ch;
                while (BinaryDigits[lookahead]) {
                    next();
                    number += ch;
                }
                longName = "BinaryLiteral";
                computed = 0;
                for (var a = 2, b = number.length - 1; a <= b; a++)
                    computed += (+(number[a]) << (b - a));
            } else if ((ch === "o" || ch == "O") && OctalDigits[lookahead]) {
                number += ch;
                while (OctalDigits[lookahead]) {
                    next();
                    number += ch;
                }
                longName = "OctalLiteral";
                computed = +(parseInt(number.substr(2), 8).toString(10));
            }
            pushtoken("NumericLiteral", number, computed, longName);
            next();
            return token;
        } else if (DecimalDigits[ch] || (ch === "." && DecimalDigits[lookahead])) {
            number = DecimalDigitsHelp(number);
            pushtoken("NumericLiteral", number, +number, "DecimalLiteral");
            next();
            return token;
        }
        return false;
    }

    function EscapeSequence() {
        var raw = "";
        var value = "";

        if (ch == "\\") {
            raw += ch;
            if (lookahead === "u") {
                next();
                raw += ch;
                if (lookahead == "{") {
                    next();
                    raw += ch;
                    while (HexDigits[lookahead]) {
                        next();
                        raw += ch;
                    }
                    if (lookahead === "}") {
                        next();
                        raw += ch;
                        value = eval("\'" + raw + "\'");
                    } // else throw "missing }"
                } else {
                    while (HexDigits[lookahead]) {
                        next();
                        raw += ch;
                        /*++i;
                         if (i == 4) break; // some type more */
                    }
                    // value = String.fromCharCode(+(raw.substr(2, raw.length-1)));
                    value = eval("\'" + raw + "\'");
                }
            } else if (SingleEscapeCharacter[lookahead]) {
                next();
                raw = SingleEscape[ch];
            } else if (lookahead === "x") {
                next();
                raw += ch;
                while (HexDigits[lookahead]) {
                    next();
                    raw += ch;
                }
                value = eval("\'" + raw + "\'");
            }
            [ raw, value ]
        }
        return false;
    }

    function UnicodeEscape() {
        var raw = "",
            value = "",
            unit, cp1, cp2;
        raw += ch;
        next();
        raw += ch;
        if (lookahead == "{") {
            next();
            raw += ch;
            while (HexDigits[lookahead]) {
                next();
                raw += ch;
            }
            if (lookahead === "}") {
                next();
                raw += ch;
                value = eval("\'" + raw + "\'");
                // String.fromCharCode((+(raw.substr(3, raw.length-2))).toFixed(4));
            }
        } else {
            while (HexDigits[lookahead]) {
                next();
                raw += ch;
            }
            unit = 0;
            for (var a = 0, b = raw.length - 1; a <= b; a++) {
                unit += (1 << (b - a) * 4) * + raw[a];
            }
            if (unit > 0x10000) {
                cp1 = Math.floor((unit - 0x10000) / 0x0400 + 0xD800);
                cp2 = (unit - 0x10000) % 0x0400 + 0xD800;
                value = String.fromCharCode(cp1, cp2);
            } else
                value = eval("\'" + raw + "\'");
            // String.fromCharCode(+(raw.substr(2, raw.length-1)));
        }
        return [ raw, value ];
    }

    function KeywordOrIdentifier() {        
        var token = "", e;
        var raw = "";

	
        if (!IdentifierStart[ch] && !UnicodeIDStart[ch]) return false;
//    	    !String.isIdentifierStart(ch.codePointAt(0))) return false;

        if (ch !== "\\") {
            token += ch;
        } else {
            if (lookahead === "u") {
                e = UnicodeEscape();
                token += e[1];
            } else {
                return false;
            }
        }

        while (IdentifierPart[lookahead] || 

            // (lookahead && String.isIdentifierPart(lookahead.codePointAt(0)))
        	// move table to unicodeIDcontinue

    	    UnicodeIDContinue[lookahead]) {
            next();
            
            if (ch === "\\" && lookahead === "u") {
                e = UnicodeEscape();
                token += e[1];
            } else {
                token += ch;
            }
        }
        pushtoken(TypeOfToken[token] || "Identifier", token, token);
        next();
        return token;
    }

    function nextLine() {
        lines[line] = column;
        ++line;
        column = 1;
        return line;
    }

    function next(k) {
        if (i < j) {
    	    i += 1;
            ch = lookahead;
            lookahead = sourceCode[i + 1];
            if (k) { return next(--k); }
            return ch;
        } else if (i === j) {
            ch = undefined;
            lookahead = undefined;
            return false;
        }
        throw new RangeError("next() over last character");
    }

    function pushtoken(type, value, computed, longName) {
        if (!isWS) lastTokenType = type;

        token = Object.create(null);
        token.type = type;
        token.longName = longName;
        token.value = value;
        token.computed =  computed;

        if (inputElementGoal != inputElementTemplateTail) {
            if ((PunctOrLT[type]) && (!OneOfThesePunctuators[value])) inputElementGoal = inputElementRegExp;
                /*if (type === "Punctuator") if (lookahead === undefined && !AllowedLastChars[value]) throw SyntaxError("Unexpected end of input stream");*/
            else inputElementGoal = inputElementDiv;
        }
                // produce loc information
        token.offset = offset;
        token.loc = {
            __proto__: null,
            source: filename,
            start: {
                line: line,
                column: column
            }
        };
        if (value != undefined) column += value.length;
        token.loc.end = {
            __proto__: null,
            line: line,
            column: column - 1
        };

        if (isLT && (!(value  === "\r" && lookahead === "\n"))) nextLine();
        if (createCustomToken) token = createCustomToken(token);
        tokens.push(token);
        // if (cb) cb(token);
        // emit("token", token);
        return token;
    }


    function tokenize(jstext, callback) {
        if (jstext) sourceCode = jstext;
        if (callback) cb = callback;
        inputElementGoal = inputElementRegExp;
        tokens = [];
        line = 1;
        column = 0;
        i = -1;
        j = sourceCode.length;
        ch = undefined;
        lookahead = sourceCode[0];
        next();
        do {
    	    offset = i;
            WhiteSpace() || LineTerminator() || DivPunctuator() || NumericLiteral() ||  Punctuation() || KeywordOrIdentifier() || StringLiteral() || TemplateLiteral();
        } while (ch !== undefined);
        return tokens;
    }

    var tokenizer = {};
    tokenizer.LineTerminator = LineTerminator;
    tokenizer.KeywordOrIdentifier = KeywordOrIdentifier;
    tokenizer.StringLiteral = StringLiteral;
    tokenizer.Comments = Comments;
    tokenizer.DivPunctuator = DivPunctuator;
    tokenizer.RegularExpressionLiteral = RegularExpressionLiteral;
    tokenizer.UnicodeEscape = UnicodeEscape;
    tokenizer.EscapeSequence = EscapeSequence;
    tokenizer.NumericLiteral = NumericLiteral;
    tokenizer.Punctuation = Punctuation;
    tokenizer.TemplateLiteral = TemplateLiteral;

    
    tokenize.tokenizer = tokenizer;
    tokenize.setCustomTokenMaker = setCustomTokenMaker;
    tokenize.unsetCustomTokenMaker = unsetCustomTokenMaker;
   
    function setCustomTokenMaker (func) {
        if (typeof func === null) {
            createCustomToken = null;
        } else if (typeof func === "function") {
            createCustomToken = func;
        } else throw new TypeError("tokenmaker must be a 'function token_maker(my_token) returns your_token' to return a custom token. Please fix that and try again.");
    }

    function unsetCustomTokenMaker () {
        createCustomToken = null;
    }

    //console.dir(tokenize("... args;...args"));
    //process.exit(0);

        return tokenize;

    });
