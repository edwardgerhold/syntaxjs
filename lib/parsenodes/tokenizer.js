define("tokenizer", function () {
//    function makeTokenizer () {
    "use strict";
    var exports = {};
    var tables = require("tables");
    var Punctuators = tables.Punctuators;
    var StartOfThreeFourPunctuators = tables.StartOfThreeFourPunctuators;
    var WhiteSpaces = tables.WhiteSpaces;
    var LineTerminators = tables.LineTerminators;
    var HexDigits = tables.HexDigits;
    var BinaryDigits = tables.BinaryDigits;
    var SingleEscapeCharacter = tables.SingleEscapeCharacter;
    var OctalDigits = tables.OctalDigits;
    var DecimalDigits = tables.DecimalDigits;
    var ExponentIndicator = tables.ExponentIndicator;
    var SignedInteger = tables.SignedInteger;
    var ParensSemicolonComma = tables.ParensSemicolonComma;
    var NumericLiteralLetters = tables.NumericLiteralLetters;
    var IdentifierStart = tables.IdentifierStart;
    var IdentifierPart = tables.IdentifierPart;
    var RegExpFlags = tables.RegExpFlags;
    var RegExpNoneOfs = tables.RegExpNoneOfs;
    var RegExpNoneOfsVal = tables.RegExpNoneOfsVal;
    var NotBeforeRegExp = tables.NotBeforeRegExp;
    var UnicodeIDStart = tables.UnicodeIDStart;
    var UnicodeIDContinue = tables.UnicodeIDContinue;
    var Quotes = tables.Quotes;
    var PunctToExprName = tables.PunctToExprName;
    var TypeOfToken = tables.TypeOfToken;
    var PunctOrLT = tables.PunctOrLT;
    var FewUnaryKeywords = tables.FewUnaryKeywords;
    var AllowedLastChars = tables.AllowedLastChars;
    var OneOfThesePunctuators = tables.OneOfThesePunctuators;
    var SkipableToken = tables.SkipableToken;
    var SkipableTokenNoLT = tables.SkipableTokenNoLT;
    /*
     var unicode = require("unicode-support");
     var isIdentifierStart = unicode.isIdentifierStart || function () {};
     var isIdentifierPart = unicode.isIdentifierPart || function () {};
     */
    var withWS = false;
    var createCustomToken = null;
    var sourceCode;
    var pos, length;
    var ltNext;
    var ltLast;
    var token;
    var tokenType; // is set at makeToken, until next token. asked for at standalone regexp
    var tokenValue;
    var lastToken;
    var ch, lookahead;	// lookahead0 and lookahead1
    var cb;
    var tokens = [];
    var tokensWithWhiteSpaces = [];
    var line = 1, column = 1;
    var lines = [];
    var offset = 0;
    var filename = null;
    var inputElementDiv = 1;
    var inputElementRegExp = 2;
    var inputElementTemplateTail = 3;
    var inputElementGoal = inputElementRegExp;
    var withExtras = false;
    var debugmode = false;
    var hasConsole = typeof console === "object" && console && typeof console.log === "function";
    function debug() {
        if (debugmode && hasConsole) {
            if (typeof arguments[0] == "object") {
                console.dir(arguments[0]);
            } else console.log.apply(console, arguments);
        }
    }
    function match(c) {
        if (c == ch) next();
        else throw new SyntaxError("tokenizer: "+ c + " expected, saw "+ch)
    }
    function Assert(test, message) {
        if (!test) throw new SyntaxError("assertion failed in tokenizer: "+message);
    }
    function updateStack(se) {
        var oldstack = se.stack;
        se.stack = "syntax.js tokenizer,\nfunction tokenize,\n does not recognize actual input. ch=" + ch + ", lookahead=" + lookahead + ", line=" + line + ", col=" + column + ", offset=" + offset + ", pos="+pos+" " +sourceCode+" \n" + oldstack;
    }    function atLineCol() {
        return ch + " at offset " + pos + " at line " + line + " at column " + column + ", lookahead="+lookahead;
    }
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
    function setWithExtras(bool) {
        withExtras = !!bool;
    }
    var extraBuffer = [];
    function exchangeExtraBuffer() {
        var b = extraBuffer;
        extraBuffer = [];
        tokenize.extraBuffer = b; // available in the parser.
        return b;
    }
    var saved = [];
    function saveState() {
        saved.push({
            sourceCode: sourceCode,
            pos: pos,
            length: length,
            token: token,
            tokenType: tokenType,
            ch: ch,
            lookahead: lookahead,
            inputElementGoal: inputElementGoal
        });
    }
    function restoreState() {
        var memento;
        if (memento = saved.pop()) {
            sourceCode = memento.sourceCode;
            pos = memento.pos;
            length = memento.length;
            token = memento.token;
            tokenType = memento.tokenType;
            ch = memento.ch;
            lookahead = memento.lookeahead;
            inputElementGoal = memento.inputElementGoal;
        }
    }
    function LineTerminator() {
        if (LineTerminators[ch]) {
            makeToken("LineTerminator", ch);
            if (!(ch  === "\r" && lookahead === "\n")) nextLine();
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
            makeToken("WhiteSpace", spaces);
            next();
            return token;
        }
        return false;
    }
    function StringLiteral() {
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
                            string = string.substr(0, string.length-1);
                            if (lookahead == "\r") next();// pass \n
                            if (lookahead == "\n") next();
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
            makeToken("StringLiteral", string, string.substr(1, string.length - 2));
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
            var braces;
            match("`");
            while (ch != undefined) {
                template = "";
                while ((ch === "$" && lookahead === "{") === false) {
                    if (ch === "`") {
                        spans.push(template);
                        makeToken("TemplateLiteral", spans);
                        match("`");
                        return token;
                    }
                    template += ch;
                    next();
                }
                spans.push(template);
                match("$");
                match("{");
                cooked = "";
                braces = ["{"];
                while (ch != "}") {
                    if (ch == "{") braces.push("{");
                    cooked += ch;
                    next();
                    // addition: block nesting ${ (function(){return 10; }()) }
                    if (ch == "}") {
                        braces.pop();
                        if (!braces.length) {
                            break;
                        } else {
                            cooked += ch;
                            next();
                        }
                    }
                    // block nesting end
                }
                spans.push(cooked);
                match("}");
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
            makeToken(type, comment);
            next();
            return token;
        } else if (ch + lookahead === "/*") {
            type = "MultiLineComment";
            comment = "/*";
            next();	// fix /*/ funny experience
            next();
            while (ch + lookahead !== "*/") {
                if (ch == "\n") nextLine();
                if (ch === undefined) {
                    throw new SyntaxError("Unexpected end of file");
                }
                comment += ch;
                next();
            }
            comment += "*/";    // ch + lookahead
            next();
            makeToken(type, comment);
            next();
            return token;
        }
        return false;
    }
    function RegularExpressionLiteral() {
        if (ch === "/" && !NotBeforeRegExp[tokenType] && !RegExpNoneOfsVal[tokenValue]) {
            var expr = "";
            var flags = "";
            var n;
            if (!RegExpNoneOfs[lookahead] && !LineTerminators[lookahead]) {
                next(); // first char after /
                big:
                    while (ch != undefined) {
                        if (ch === "/") {
                            n = expr.length - 1;
                            do {
                                if ((expr[n] !== "\\") || (expr[n - 1] === "\\" && expr[n - 2] !== "\\")) {
                                    break big;
                                }
                            } while (expr[n -= 2] === "\\");
                        } else if (LineTerminators[ch] || ch == undefined) {
                            throw new SyntaxError("Unexpected end of line, while parsing RegularExpressionLiteral at line " + line + ", column " + column);
                        }
                        expr += ch;
                        next();
                    }
            } else {
                return false;
            }
            if (ch === "/") {
                match("/");
                var hasFlags = {};
                while (RegExpFlags[ch]) {
                    if (hasFlags[ch]) throw new SyntaxError("duplicate flags not allowed in regular expressions");
                    flags += ch;
                    hasFlags[ch] = true;
                    next();
                }
                if (!(WhiteSpaces[ch]||Punctuators[ch]||LineTerminators[ch]) && ch != undefined) {
                    throw new SyntaxError("unexpected token illegal");
                }
                makeToken("RegularExpressionLiteral", [expr, flags]);
                inputElementGoal = inputElementDiv;
                return token;
            }

        }
        return false;
    }
    function DivPunctuator() {
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
                    makeToken("Punctuator", "/=", undefined, PunctToExprName["/="]);
                    next();
                    return token;
                } else {
                    makeToken("Punctuator", ch, undefined, PunctToExprName[ch]);
                    next();
                    return token;
                }
            }
        }
        return false;
    }
    function Punctuation() {
        if (ch == "/") return DivPunctuator();
        if (ParensSemicolonComma[ch]) {
            makeToken("Punctuator", ch, undefined, PunctToExprName[ch]);
            next();
            return token;
        }
        var punct;
        if (!StartOfThreeFourPunctuators[ch]) {
            punct = ch + lookahead;
        } else {
            punct = sourceCode[pos] + sourceCode[pos + 1] + sourceCode[pos + 2] + sourceCode[pos + 3];
            if (punct === ">>>=") {
                next();next();next();
                makeToken("Punctuator", punct, undefined, PunctToExprName[punct]);
                next();
                return token;
            }
            punct = punct[0] + punct[1] + punct[2];
            if (Punctuators[punct]) {
                next();next();
                makeToken("Punctuator", punct, undefined, PunctToExprName[punct]);
                next();
                return token;
            }
            punct = punct[0] + punct[1];
        }
        if (Punctuators[punct]) {
            next();
            makeToken("Punctuator", punct, undefined, PunctToExprName[punct]);
            next();
            return token;
        }
        punct = punct[0];
        if (Punctuators[punct]) {
            makeToken("Punctuator", punct, undefined, PunctToExprName[punct]);
            next();
            return token;
        }
        return false;
    }
    function getDecimalDigits(number) {
        var dot = false, exp = false;
        if (DecimalDigits[ch] || (ch === "." && DecimalDigits[lookahead] && (dot=true))) {
            number += ch;
            for (;;) {
                if (DecimalDigits[lookahead] || (lookahead === "." && !dot)) {
                    next();
                    number += ch;
                    if (ExponentIndicator[lookahead]) {
                        if(!exp) {
                            exp = true;
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
                        } else {
                            throw new SyntaxError("duplicate exponent indicator");
                        }
                    }
                } else if (lookahead === "." && dot) {
                    throw new SyntaxError("unexpected number");
                } else {
                    break;
                }
            }
            return number;
        }
        return false;
    }
    function NumericLiteral() {
        var number = "", longName, computed = 0;
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
                // code for MV function
                computed = +number;
            } else if ((ch === "b" || ch === "B") && BinaryDigits[lookahead]) {
                number += ch;
                while (BinaryDigits[lookahead]) {
                    next();
                    number += ch;
                }
                longName = "BinaryLiteral";
                computed = 0;
                // optimal code for MV function:
                for (var a = 2, b = number.length - 1; a <= b; a++)
                    computed += (+(number[a]) << (b - a)); // that´s from me.
            } else if ((ch === "o" || ch == "O") && OctalDigits[lookahead]) {
                number += ch;
                while (OctalDigits[lookahead]) {
                    next();
                    number += ch;
                }
                longName = "OctalLiteral";
                // code for MV(value) function
                computed = +(parseInt(number.substr(2), 8).toString(10));
            }
            makeToken("NumericLiteral", number, computed, longName);
            // syntax error works for all three above
            if (!(WhiteSpaces[lookahead]||Punctuators[lookahead]||LineTerminators[lookahead]) && lookahead != undefined) {
                throw new SyntaxError("unexpected token illegal in "+longName);
            }
            next();
            return token;
        } else if (DecimalDigits[ch] || (ch === "." && DecimalDigits[lookahead])) {
            number = getDecimalDigits(number);
            // if (number === false) throw new SyntaxError("Error parsing decimal digit")

            computed = +number; // code for MV function
            makeToken("NumericLiteral", number, computed, "DecimalLiteral");
            if (!(WhiteSpaces[lookahead]||Punctuators[lookahead]||LineTerminators[lookahead]) && lookahead != undefined) {
                throw new SyntaxError("unexpected token illegal in "+longName);
            }
            next();
            return token;
        }
        return false;
    }
    function getUnicodeBody() {
        var max, now = 0, raw = "";
        if (lookahead == "1") max = 5;
        else if (lookahead == "0") max = 4;
        else throw new SyntaxError("unexpected kind of unicode literal");
        while (HexDigits[lookahead]) {
            next();
            ++now;
            raw += ch;
            if (now === max) break;
        }
        if (now < max) throw new SyntaxError("unexpected kind of unicode literal "+max+" digits expected");
        return raw;
    }
    function EscapeSequence() {
        var raw = "";
        var value = "";
        if (ch == "\\") {
            var longName = "EscapeSequence";
            raw += ch;
            if (lookahead === "u") {
                next();
                raw += ch;
                if (lookahead == "{") {
                    next();
                    raw += ch;
                    raw += getUnicodeBody();
                    if (lookahead === "}") {
                        next();
                        raw += ch;
                        value = eval("\'" + raw + "\'");
                    } else {
                        throw new SyntaxError("expecting } to close unicode seq.");
                    }
                } else {
                    raw += getUnicodeBody();
                    // value = String.fromCharCode(+(raw.substr(2, raw.length-1)));
                    value = eval("\'" + raw + "\'");
                }
            } else if (SingleEscapeCharacter[lookahead]) {
                next();
                raw = SingleEscapeCharacter[ch];
            } else if (OctalDigits[lookahead]) {
                next();
                raw += ch;
                while (OctalDigits[lookahead]) {
                    next();
                    raw += ch;
                }
                value = parseInt(raw.substr(1, raw.length), 8);

            } else if (lookahead === "x") {
                next();
                raw += ch;
                while (HexDigits[lookahead]) {
                    next();
                    raw += ch;
                }
                value = eval("\'" + raw + "\'");
            }
            else {
                throw new SyntaxError("invalid escape sequence "+ch+ " "+lookahead);
            }
            return value;
        }
        return false;
    }
    /*
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
     */
    function KeywordOrIdentifier() {
        var token = "", e;
        var escaped = false;
        var raw = "";

        // to have an escaped and unescaped version
        // i saved it twice already in the very first version very early
        // (removed but should return)

        if (!IdentifierStart[ch] && !UnicodeIDStart[ch]) return false;
//    	    !String.isIdentifierStart(ch.codePointAt(0))) return false;
        if (ch !== "\\") {
            token += ch;
        } else {
            token = EscapeSequence();
            escaped = true;

            if (!IdentifierPart[lookahead] && (lookahead != "\\")) {
                if (IdentifierStart[token]) makeToken("Identifier", token);
                else throw new SyntaxError("unexpected escape sequence");
                next();
                return token;
            }
        }
        while (IdentifierPart[lookahead] || lookahead == "\\" ||
            // (lookahead && String.isIdentifierPart(lookahead.codePointAt(0)))
            // move table to unicodeIDcontinue
            UnicodeIDContinue[lookahead]) {
            next();
            if (ch === "\\") {
                escaped = true;
                token += EscapeSequence();
            } else {
                token += ch;
            }
        }
        makeToken((escaped ? "Identifier" : (TypeOfToken[token] || "Identifier")), token, token);
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
        if (pos < length) {
            pos += 1;
            ch = lookahead;
            lookahead = sourceCode[pos + 1];
            if (k) { return next(--k); }
            return ch;
        }
        return !!(ch = lookahead = undefined);
    }

    function makeToken(type, value, computed, longName) {
        lastToken = token;
        token = Object.create(null);
        ltLast = ltNext;
        if (type === "LineTerminator") ltNext = true;
        else ltNext =false;
        token.type = type;
        token.longName = longName;
        token.value = value;
        token.computed =  computed;
        if ((FewUnaryKeywords[value] || PunctOrLT[type]) && !OneOfThesePunctuators[value]) {
            inputElementGoal = inputElementRegExp;
        }
        token.loc = {
            source: filename,
            start: {
                line: line,
                column: column
            }
        };
        if (value != undefined) column += value.length;
        token.loc.end = {
            line: line,
            column: column - 1
        };
        token.offset = offset;
        //token.loc.range = [offset, offset + (((value&&value.length)-1)|0) ];
        if (createCustomToken) token = createCustomToken(token);
        if (!SkipableTokenNoLT[type]) {
            tokenType = type;
            tokenValue = value;
            tokens.push(token);
        } else {
            if (withExtras) extraBuffer.push(token);
        }
        if (withWS) tokensWithWhiteSpaces.push(token);

        // emit("token", token);
        return token;
    }

    function exchangeToken() {
        tokenize.token = token;
        tokenize.tokenType = tokenType;
        tokenize.tokenValue = tokenValue;
        tokenize.ltNext = ltNext;
    }

    function finishToken() {
        token = undefined;
        tokenType = undefined;
        tokenValue = undefined;
        ltNext = false;
        exchangeToken();
        return token;
    }

    function nextToken() {
        if (pos >= length) return finishToken();
        offset = pos;
        token = undefined;
        if (DecimalDigits[ch] || ch == ".") NumericLiteral();
        if (!token && Punctuators[ch]) Punctuation();
        if (IdentifierStart[ch]) KeywordOrIdentifier();
        else if (Quotes[ch]) StringLiteral();
        else if (ch == "`") TemplateLiteral();
        else if (WhiteSpaces[ch]) WhiteSpace();
        else if (LineTerminators[ch]) LineTerminator();

        if (!token && pos < length) throw new SyntaxError("Unknown Character: "+atLineCol());
        else if (!token) return finishToken();
        if (SkipableToken[token.type]) {
            if (token.type === "LineTerminator") ltNext = true;
            if (withExtras) {
                extraBuffer.push(token);
            }
            return nextToken(); // this one overflows the callstack
        } else {
            ltNext = false;
        }
        exchangeToken();
        exchangeExtraBuffer();
        return token;
    }

    function tokenize(jsSourceText, callback) {
        initTokenizer(jsSourceText, callback);
        return nextToken();
    }

    function initTokenizer(jsSourceText, callback) {
        if (jsSourceText) sourceCode = jsSourceText;
        if (callback) cb = callback;
        inputElementGoal = inputElementRegExp;
        tokens = tokenize.tokens = [];
        line = 1;
        column = 1;
        pos = -1;
        length = sourceCode.length;
        ch = undefined;
        lookahead = sourceCode[0];
        next();
    }

    function tokenizeIntoArray(jsSourceText, callback) {
        saveState();
        initTokenizer(jsSourceText, callback);
        if (withWS) tokenizeIntoArray.tokensWithWhiteSpaces = [];
        do {
            offset = pos;
            token = undefined;

            /*
                        if (WhiteSpaces[ch]) WhiteSpace();
                        else if (LineTerminators[ch]) LineTerminator();
                        else if (DecimalDigits[ch] || ch == ".") NumericLiteral();
                        if (!token) {
                            if (Punctuators[ch]) Punctuation();
                            else if (IdentifierStart[ch]) KeywordOrIdentifier();
                            else if (Quotes[ch]) StringLiteral();
                            else if (ch == "`") TemplateLiteral();
                        }
                    */
            switch (ch) {
                case " ":
                case "\t": WhiteSpace(); break;
                case "\r":
                case "\n": LineTerminator(); break;
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                case ".": NumericLiteral(); break;
                case "'":
                case "\"": StringLiteral(); break;
                case "`":  TemplateLiteral(); break;
                default:
                    if (IdentifierStart[ch]) KeywordOrIdentifier();
                    break;
            }
            if (!token && Punctuators[ch]) Punctuation();


	    /*
	    
	    // slowest ist the ORing of Functions() which have to be called,
	    // which means a whole EvaluateCall Situation. On node it´s 20% more
	    // just for calling 6 function EACH CHARACTER.
	    
	    // The second biggest lost is currently in parser´s OLD next,
	    // which skips WhiteSpaces and Co. TWICE. Simply removing causes
	    // in faults, and i didn´t see it, although it´s simple.
	    
             WhiteSpace() || LineTerminator() || DivPunctuator() || NumericLiteral() || Punctuation()|| KeywordOrIdentifier() || StringLiteral() || TemplateLiteral();

	    */

            if (!token && pos < length) {
                var errorMsg = "Unknown Character: "+ch+" at offset "+pos+" at line "+line+" at column "+column;
                restoreState();
                throw new SyntaxError(errorMsg);
            }
            if (withExtras) {
                exchangeExtraBuffer();
            }
            
        } while (ch !== undefined);
        restoreState();
        return tokens;
    }



    function tokenizeIntoArrayWithWhiteSpaces(jsSourceText, callback) {
        withWS = true;
        tokensWithWhiteSpaces = [];
        var tokens = tokenizeIntoArray(jsSourceText, callback);
        withWS = false;
        return tokensWithWhiteSpaces;
    }


    var tokenizer = {};
    tokenizer.LineTerminator = LineTerminator;
    tokenizer.KeywordOrIdentifier = KeywordOrIdentifier;
    tokenizer.StringLiteral = StringLiteral;
    tokenizer.Comments = Comments;
    tokenizer.DivPunctuator = DivPunctuator;
    tokenizer.RegularExpressionLiteral = RegularExpressionLiteral;
    tokenizer.EscapeSequence = EscapeSequence;
    tokenizer.NumericLiteral = NumericLiteral;
    tokenizer.Punctuation = Punctuation;
    tokenizer.TemplateLiteral = TemplateLiteral;


    tokenizeIntoArray.tokenize = tokenize;
    tokenizeIntoArray.tokenizeIntoArray = tokenizeIntoArray;
    //tokenizeIntoArray.makeTokenizer = makeTokenizer;
    tokenizeIntoArray.saveState = saveState;
    tokenizeIntoArray.restoreState = restoreState;
    tokenize.tokenizeIntoArray = tokenizeIntoArray;
    tokenize.tokenizeIntoArrayWithWhiteSpaces = tokenizeIntoArrayWithWhiteSpaces;


    tokenize.tokenizer = tokenizer;
    tokenize.nextToken = nextToken;
    tokenize.saveState = saveState;
    tokenize.restoreState = restoreState;
    tokenize.setCustomTokenMaker = setCustomTokenMaker;
    tokenize.unsetCustomTokenMaker = unsetCustomTokenMaker;
//        tokenize.makeTokenizer = makeTokenizer;
    tokenize.exchangeExtraBuffer = exchangeExtraBuffer;
    tokenize.setWithExtras = setWithExtras;

    return tokenize;
    //}
    //return makeTokenizer();
});

