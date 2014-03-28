
define("tokenizer", ["tables"], function (tables) {

    "use strict";

    var Punctuators = tables.Punctuators;
    var WhiteSpaces = tables.WhiteSpaces;
    var LineTerminators = tables.LineTerminators;
    var HexDigits = tables.HexDigits;
    var NonZeroDigits = tables.NonZeroDigits;
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
    var ReservedWord = tables.ReservedWord;
    var Keywords = tables.Keywords;
    var RegExpFlags = tables.RegExpFlags;
    var RegExpNoneOfs = tables.RegExpNoneOfs;
    var NotBeforeRegExp = tables.NotBeforeRegExp;
    var UnicodeIDStart = tables.UnicodeIDStart;
    var UnicodeIDContinue = tables.UnicodeIDContinue;
    var LPAREN = tables.LPAREN;
    var RPAREN = tables.RPAREN;
    var LPARENOF = tables.LPARENOF;
    var parens = [];
    var Quotes = tables.Quotes;
    var PunctToExprName = tables.PunctToExprName;
    var TypeOfToken = tables.TypeOfToken;
    var Types = tables.Types;
    var createCustomToken = null;
    var tokenTable;
    var sourceCode;
    var i, j;
    var token;
    var ch, lookahead;	// lookahead0 and lookahead1
    var cb;
    var tokens = [];
    var token_count;
    var line = 1,
        column = 0;
    var lines = [];
    var loc = true;
    var offset = 0;
    var pos;
    var filename = null;
    var lastTokenType;
    var inputElementDiv = 1;
    var inputElementRegExp = 2;
    var inputElementTemplateTail = 3;
    var inputElementGoal = inputElementRegExp;


    var withExtras = true;

    function Assert(test, message) {
        if (!test) throwError(new SyntaxError("tokenizer: "+message));
    }

    function nextLine() {
        lines[line] = column;
        ++line;
        column = 0;
        return line;
    }

    var AllowedLastChars = {
        ")": true,
        "]": true,
        "}": true,
        ";": true,
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

    function pushtoken(type, value, computed, details, isLT, isWS) {
        var token = Object.create(null);

        /*    var oid = token._oid_ = newNodeId();
         tokenTable[oid] = token;
         */

        if (!isWS) lastTokenType = type;
        token.type = type;
        token.goal = details;
        token.value = value;

        if (PunctOrLT[type]) {
            /*
             if (type === "Punctuator") {
             if (lookahead === undefined && !AllowedLastChars[value]) throw SyntaxError("Unexpected end of input stream");
             }
             */
            if (!OneOfThesePunctuators[value]) inputElementGoal = inputElementRegExp;

        } else inputElementGoal = inputElementDiv;


        token.offset = offset;

        token.loc = {
            __proto__: null,
            source: filename,
            start: {
                line: line,
                column: column
                ,
            }
        };

        if (value) column += value.length;

        token.loc.end = {
            __proto__: null,
            line: line,
            column: column - 1
        };

        if (isLT && (!(value === "\r" && lookahead === "\n"))) nextLine();

        if (createCustomToken) {
            token = createCustomToken(token);
        }

        tokens.push(token);
        if (cb) cb(token);
        return token;
    }

    function LineTerminator() {
        if (LineTerminators[ch]) return pushtoken("LineTerminator", ch, undefined, undefined, true);
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
            return pushtoken("WhiteSpace", spaces, undefined, undefined, undefined, true);
        }
        return false;
    }

    function StringLiteral() {
        var quotecharacter;
        var string = "";
        var multiline = false;
        var n;
        if (Quotes[ch]) {
            quotecharacter = ch;
            string += ch;

            big: while (next() != undefined) {
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
            return pushtoken("StringLiteral", string, string.substr(1, string.length - 2));
        }
        return false;
    }

    function TemplateLiteral() {
        var template = "";
                
        if (ch == '`') {
    	    if (inputElementGoal !== inputElementTemplateTail) {
    		// inputElementGoal == inputElementTemplateTail;

    		// collect loop
    		// pushtoken templatehead
    		// if ` ..  ${

		// pushtoken nosubstitemplate
		// if ` .. `
    	    } else {
    		
    		inputElementGoal = inputElementRegExp
    		// collect loop
    		
    		// pushtoken templatemiddle
    		// if collect } to {

    		// pushtoken templatetail
    		// if collect } to `
    	    }

	    // remove and replace in evaluation the code
	            
            template += ch;
            while (lookahead !== "`") {
                if (ch === undefined) throw SyntaxError("unexpected end of Token Stream");
                next();
                template += ch;
                // escape tracken.
            }
            next();
            template += ch;
            return pushtoken("TemplateLiteral", template, template.substr(1, template.length - 2));
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
            return pushtoken(type, comment);
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
            return pushtoken(type, comment);
        }
        return false;
    }

    /*
     Regex schreiben
     */

    function RegularExpressionLiteral() {
        var expr = "", flags = "";
        var n, l;
        if (ch === "/" && !NotBeforeRegExp[lastTokenType]) { // <--- grammatik

            if (!RegExpNoneOfs[lookahead] && !LineTerminators[lookahead]) {
                expr += ch;
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
                expr += ch;
                while (RegExpFlags[lookahead]) { // besorge noch die flags
                    next();
                    expr += ch;
                    flags += ch;
                }
                return pushtoken("RegularExpressionLiteral", expr);
            }
        }
        return false;
    }

    function DivPunctuator() {
        var ok;
        if (ch === "/") {

            if (ok = Comments()) return ok;

            if (inputElementGoal === inputElementRegExp) {
                // saveTheDot();

                if (ok = RegularExpressionLiteral()) {
                    inputElementGoal = inputElementDiv;
                    return ok;
                } else inputElementGoal = inputElementDiv;
                // restoreTheDot();
            }

            if (inputElementGoal === inputElementDiv) {

                if (ch + lookahead === "/=") {
                    next();
                    return pushtoken("Punctuator", "/=", undefined, PunctToExprName["/="]);
                } else {
                    return pushtoken("Punctuator", ch, undefined, PunctToExprName[ch]);
                }

            }

        }
        return false;
    }

    function Punctuation() {
        if (ParensSemicolonComma[ch]) {

/*            if (LPAREN[ch]) {
                parens.push(ch);
            } else if (RPAREN[ch]) {
                var p = parens.pop();
                if (LPARENOF[ch] !== p) {

                }
            } */
            return pushtoken("Punctuator", ch, undefined, PunctToExprName[ch]);
        }
                
        var punct = sourceCode[i] + sourceCode[i + 1] + sourceCode[i + 2] + sourceCode[i + 3];
        if (Punctuators[punct]) return (i += 3), pushtoken("Punctuator", punct, undefined, PunctToExprName[punct]);
        punct = punct[0] + punct[1] + punct[2];
        if (Punctuators[punct]) return (i += 2), pushtoken("Punctuator", punct, undefined, PunctToExprName[punct]);
        punct = punct[0] + punct[1];
        if (Punctuators[punct]) return (i += 1), pushtoken("Punctuator", punct, undefined, PunctToExprName[punct]);
        punct = punct[0];
        if (Punctuators[punct]) return pushtoken("Punctuator", punct, undefined, PunctToExprName[punct]);
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
            details, computed = 0;
        if (ch === "0" && NumericLiteralLetters[lookahead]) {
            number += ch;
            next();
            if ((ch === "x" || ch === "X") && HexDigits[lookahead]) {
                number += ch;
                while (HexDigits[lookahead]) {
                    next();
                    number += ch;
                }
                details = "HexLiteral";
                computed = +number;
            } else if ((ch === "b" || ch === "B") && BinaryDigits[lookahead]) {
                number += ch;
                while (BinaryDigits[lookahead]) {
                    next();
                    number += ch;
                }
                details = "BinaryLiteral";
                computed = 0;
                for (var a = 2, b = number.length - 1; a <= b; a++)
                    computed += (+(number[a]) << (b - a));
            } else if ((ch === "o" || ch == "O") && OctalDigits[lookahead]) {
                number += ch;
                while (OctalDigits[lookahead]) {
                    next();
                    number += ch;
                }
                details = "OctalLiteral";
                computed = +(parseInt(number.substr(2), 8).toString(10));
            }
            return pushtoken("NumericLiteral", number, computed, details);
        } else if (DecimalDigits[ch] || (ch === "." && DecimalDigits[lookahead])) {
            number = DecimalDigitsHelp(number);
            return pushtoken("NumericLiteral", number, +number, "DecimalLiteral");
        }
        return false;
    }

    function EscapeSequence() {
        var es = "";
        var com = "";
        if (ch == "\\") {
            es += ch;
            if (lookahead === "u") {
                next();
                es += ch;
                if (lookahead == "{") {
                    next();
                    es += ch;
                    while (HexDigits[lookahead]) {
                        next();
                        es += ch;
                    }
                    if (lookahead === "}") {
                        next();
                        es += ch;
                        com = eval("\'" + es + "\'");
                    } // else throw "missing }"
                } else {
                    while (HexDigits[lookahead]) {
                        next();
                        es += ch;
                        /*++i;
                         if (i == 4) break; // some type more */
                    }
                    // com = String.fromCharCode(+(es.substr(2, es.length-1)));
                    com = eval("\'" + es + "\'");
                }
            } else if (SingleEscapeCharacter[lookahead]) {
                next();
                es = SingleEscape[ch];
            } else if (lookahead === "x") {
                next();
                es += ch;
                while (HexDigits[lookahead]) {
                    next();
                    es += ch;
                }
                com = eval("\'" + es + "\'");
            }
            return {
                com: com,
                es: es
            };
        }
        return false;
    }

    function UnicodeEscape() {
        var es = "",
            com = "",
            unit, cp1, cp2;
        es += ch;
        next();
        es += ch;
        if (lookahead == "{") {
            next();
            es += ch;
            while (HexDigits[lookahead]) {
                next();
                es += ch;
            }
            if (lookahead === "}") {
                next();
                es += ch;
                com = eval("\'" + es + "\'");
                // String.fromCharCode((+(es.substr(3, es.length-2))).toFixed(4));
            }
        } else {
            while (HexDigits[lookahead]) {
                next();
                es += ch;
            }
            unit = 0;
            for (var a = 0, b = es.length - 1; a <= b; a++) {
                unit += (1 << (b - a) * 4) * +es[a];
            }
            if (unit > 0x10000) {
                cp1 = Math.floor((unit - 0x10000) / 0x0400 + 0xD800);
                cp2 = (unit - 0x10000) % 0x0400 + 0xD800;
                com = String.fromCharCode(cp1, cp2);
            } else
                com = eval("\'" + es + "\'");
            // String.fromCharCode(+(es.substr(2, es.length-1)));
        }
        return {
            es: es,
            com: com
        };
    }

    function KeywordOrIdentifier() {
        /* Includes Keywords */
        var token = "",
            e;
        if (!IdentifierStart[ch] && !UnicodeIDStart[ch]) return false;
        if (ch !== "\\") {
            token += ch;
        } else {
            if (lookahead === "u") {
                e = UnicodeEscape();
                token += e.es;
            } else {
                return false;
            }
        }
        while (IdentifierPart[lookahead] || UnicodeIDContinue[lookahead]) {
            next();
            if (ch === "\\" && lookahead === "u") {
                e = UnicodeEscape();
                token += e.es;
            } else {
                token += ch;
            }
        }
        return pushtoken(TypeOfToken[token] || "Identifier", token, token);
    }

    function next() {
        if (i < j) {
    	    i += 1;
            ch = lookahead;
            lookahead = sourceCode[i + 1];
            return ch;
        } else if (i === j) return;
        else throw new RangeError("UNEXPECTED END OF INPUT STREAM.");
    }

    function resetVariables() {
        //tokenTable = Object.create(null);

        tokens = [];
        line = 1;
        column = 0;
        i = 0;
        j = sourceCode.length;
        ch = sourceCode[0];
        lookahead = sourceCode[1];
    }

    function Error() {
        if (i >= 0 && i < j - 1) {
            var se = new SyntaxError("Can not parse token.");
            se.stack = "syntax.js tokenizer,\nfunction tokenize,\n does not recognize actual input. ch=" + ch + ", lookahead=" + lookahead + ", line=" + line + ", col=" + column + ", offset=" + offset + ", i="+i+" " +sourceCode+" \n";
            throw se;
        }
    }

    function tokenize(jstext, callback) {
        if (jstext) sourceCode = jstext;
        if (callback) cb = callback;
        resetVariables();
        do { 
    	    offset = i;
            token = WhiteSpace() || LineTerminator() || DivPunctuator() || NumericLiteral() || Punctuation() || KeywordOrIdentifier() || StringLiteral() || TemplateLiteral();
            next();
        } while (lookahead !== undefined);
        //tokens.tokenTable = tokenTable;
        return tokens;
    }


    var exports = {};
    exports.LineTerminator = LineTerminator;
    exports.KeywordOrIdentifier = KeywordOrIdentifier;
    exports.StringLiteral = StringLiteral;
    exports.Comments = Comments;
    exports.DivPunctuator = DivPunctuator;
    exports.RegularExpressionLiteral = RegularExpressionLiteral;
    exports.UnicodeEscape = UnicodeEscape;
    exports.EscapeSequence = EscapeSequence;
    exports.NumericLiteral = NumericLiteral;
    exports.Punctuation = Punctuation;
    exports.TemplateLiteral = TemplateLiteral;
    exports.tokenize = tokenize;
    tokenize.tokenizer = exports;

    var customTokenMaker = null;
    function setCustomTokenMaker(func) {
        if (typeof func === null) {
            customTokenMaker = null;
        } else if (typeof func === "function") {
            customTokenMaker = func;
        } else throw TypeError("tokenmaker must be a function your_token <- maker(my_token) to return a custom token. Please fix that and try again.");
    }
    tokenize.setCustomTokenMaker = setCustomTokenMaker;

    return tokenize;
});
