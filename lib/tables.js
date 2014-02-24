
define("tables", function (require, exports, module) {

    "use strict";

    exports.uriAlpha = uriAlpha;
    exports.uriMark = uriMark;
    exports.uriReserved = uriReserved;
    exports.NotPatternCharacter = NotPatternCharacter;
    exports.CharacterClassEscape = CharacterClassEscape;
    exports.ControlLetter = ControlLetter;
    exports.ControlEscape = ControlEscape;

    var uriAlpha = {
        __proto__: null,
        "A": true,
        "B": true,
        "C": true,
        "D": true,
        "E": true,
        "F": true,
        "G": true,
        "H": true,
        "I": true,
        "J": true,
        "K": true,
        "L": true,
        "M": true,
        "N": true,
        "O": true,
        "P": true,
        "Q": true,
        "R": true,
        "S": true,
        "T": true,
        "U": true,
        "V": true,
        "W": true,
        "X": true,
        "Y": true,
        "Z": true,
        "a": true,
        "b": true,
        "c": true,
        "d": true,
        "e": true,
        "f": true,
        "g": true,
        "h": true,
        "i": true,
        "j": true,
        "k": true,
        "l": true,
        "m": true,
        "n": true,
        "o": true,
        "p": true,
        "q": true,
        "r": true,
        "s": true,
        "t": true,
        "u": true,
        "v": true,
        "w": true,
        "x": true,
        "y": true,
        "z": true
    };
    var uriMark = {
        __proto__: null,
        "~": true,
        "_": true,
        ".": true,
        "!": true,
        "-": true,
        "*": true,
        "'": true,
        "(": true,
        ")": true
    };
    var uriReserved = {
        __proto__: null,
        ";": true,
        "/": true,
        "?": true,

        ":": true,
        "@": true,
        "&": true,
        "=": true,
        "+": true,
        "$": true,
        ",": true
    };

    var ControlEscape = {
        "f": true,
        "n": true,
        "r": true,
        "t": true,
        "v": true
    };
    var ControlLetter = {
        __proto__: null,
        "A": true,
        "B": true,
        "C": true,
        "D": true,
        "E": true,
        "F": true,
        "G": true,
        "H": true,
        "I": true,
        "J": true,
        "K": true,
        "L": true,
        "M": true,
        "N": true,
        "O": true,
        "P": true,
        "Q": true,
        "R": true,
        "S": true,
        "T": true,
        "U": true,
        "V": true,
        "W": true,
        "X": true,
        "Y": true,
        "Z": true,
        "a": true,
        "b": true,
        "c": true,
        "d": true,
        "e": true,
        "f": true,
        "g": true,
        "h": true,
        "i": true,
        "j": true,
        "k": true,
        "l": true,
        "m": true,
        "n": true,
        "o": true,
        "p": true,
        "q": true,
        "r": true,
        "s": true,
        "t": true,
        "u": true,
        "v": true,
        "w": true,
        "x": true,
        "y": true,
        "z": true
    };
    var CharacterClassEscape = {
        "d": true,
        "D": true,
        "s": true,
        "S": true,
        "w": true,
        "W": true
    };

    var NotPatternCharacter = {
        "^": true,
        "$": true,
        "\\": true,
        ".": true,
        "*": true,
        "+": true,
        "?": true,
        "(": true,
        ")": true,
        "[": true,
        "]": true,
        "{": true,
        "}": true,
        "|": true
    };

    var LPAREN = {
        __proto__: null,
        "(": true,
        "[": true,
        "{": true
    };
    var RPAREN = {
        __proto__: null,
        ")": true,
        "]": true,
        "}": true
    };
    var LPARENOF = {
        __proto__: null,
        ")": "(",
        "]": "[",
        "}": "{"
    };
    var RPARENOF = {
        __proto__: null,
        "(": ")",
        "[": "]",
        "{": "}"
    };

    exports.LPAREN = LPAREN;
    exports.RPAREN = RPAREN;
    exports.LPARENOF = LPARENOF;
    exports.RPARENOF = RPAREN

    var TypedArrayElementSize = {
        "Float64": 8,
        "Float32": 4,
        "Int32": 4,
        "Uint32": 4,
        "Int16": 2,
        "Uint16": 2,
        "Int8": 1,
        "Uint8": 1,
        "Uint8Clamped": 1
    };

    var TypedArrayElementType = {
        "Float64Array": "Float64",
        "Float32Array": "Float32",
        "Int32Array": "Int32",
        "Uint32Array": "Uint32",
        "Int16Array": "Int16",
        "Uint16Array": "Uint16",
        "Int8Array": "Int8",
        "Uint8Array": "Uint8",
        "Uint8ClampedArray": "Uint8C"
    };

    exports.TypedArrayElementSize = TypedArrayElementSize;
    exports.TypedArrayElementType = TypedArrayElementType;

    var Building = {
        "Identifier": "identifier",
        "Literal": "literal",
        "WhileStatement": "whileStatement",
        "BlockStatement": "blockStatement",
        "TryStatement": "tryStatement",
        "VariableDeclaration": "variableStatement",
        "LexicalDeclaration": "variableStatement",
        "DoWhileStatement": "doStatement",
        "IfStatement": "ifStatement",
        "ExpressionStatement": "expressionStatement",
        "SequenceExpression": "sequenceStatement",
    };

    var DOM = {
        __proto__: null,
        "window": true,
        "document": true,
        "navigator": true,
        "history": true,
        "screen": true,
        "XMLHttpRequest": true,
        "console": true,
        "childNodes": true,
        "firstChild": true,
        "nextSibling": true,
        "previousSibling": true,
        "appendChild": true,
        "insertBefore": true,
        "insertAdjacentHTML": true,
        "innerHTML": true,
        "outerHTML": true,
        "textContent": true,
        "removeChild": true,
        "createElement": true,
        "createDocumentFragment": true
    };
    var HTML5Objects = {
        "localStorage": true,
        "sessionStorage": true,
        "document": true,
        "window": true,
        "XMLHttpRequest": true,
        "File": true
    };
    var NodeJSObjects = {
        "process": true,
        "global": true,
    };

    var Comment = {
        __proto__: null,
        "//": true,
        "/*": true
    };
    var Parentheses = {
        __proto__: null,
        "(": true,
        ")": true,
        "{": true,
        "}": true,
        "[": true,
        "]": true
    };
    var Quotes = {
        __proto__: null,
        '"': true,
        "'": true
    };

    var Builtins = {
        __proto__: null,
        "{}": true,
        "[]": true,
        "Object": true,
        "Function": true,
        "Array": true,
        "String": true,
        "Boolean": true,
        "Number": true,
        "Math": true,
        "Date": true,
        "RegExp": true,
        "JSON": true,
        "Error": true,
        "EvalError": true,
        "RangeError": true,
        "ReferenceError": true,
        "syntaxerror": true,
        "TypeError": true,
        "URIError": true,
        "setTimeout": true,
        "setInterval": true,
        "setImmediate": true,
        "eval": true,
        "ArrayBuffer": true,
        "DataView": true,
        "isNaN": true,
        "isFinite": true,
        "isArray": true,
        "forEach": true,
        "Int8Array": true,
        "Int16Array": true,
        "Int32Array": true,
        "Uint8Array": true,
        "Uint16Array": true,
        "Uint32Array": true,
        "Float32Array": true,
        "Float64Array": true,
        "Uint8ClampedArray": true,
        "escape": true,
        "unescape": true,
        "encodeURI": true,
        "decodeURI": true,
        "encodeURIComponent": true,
        "decodeURIComponent": true,
        "parseInt": true,
        "parseFloat": true,
        "Iterator": true,
        "StopIteration": true,
        "Proxy": true,
        "Map": true,
        "Set": true,
        "WeakMap": true,
        "WeakSet": true
    };
    var Punctuators = {
        __proto__: null,
        "=>": true,
        "...": true,
        ".": true,
        ",": true,
        "&": true,
        "&&": true,
        "&=": true,
        "|=": true,
        "|": true,
        "||": true,
        "!": true,
        "!!": true,
        "!=": true,
        "!==": true,
        "=": true,
        "==": true,
        "===": true,
        "{": true,
        "}": true,
        "(": true,
        ")": true,
        "[": true,
        "]": true,
        "<": true,
        ">": true,
        "<=": true,
        ">=": true,
        "<<": true,
        "<<=": true,
        ">>=": true,
        "<<<": true,
        ">>>=": true,
        ";": true,
        "::": true,
        ":=": true,
        ":": true,
        "+": true,
        "-": true,
        "*": true,
        "/": true,
        "+=": true,
        "-=": true,
        "*=": true,
        "/=": true,
        "%": true,
        "%=": true,
        "++": true,
        "--": true,
        "^": true,
        "^=": true,
        "?": true,
        "<|": true,
        "#": true,
        "~": true,
        "&lt;": true,
        "&gt;": true,
        "&amp;&amp;": true,
        "&amp": true
    };
    var WhiteSpaces = {
        __proto__: null,
        "\u0009": true,
        "\u000B": true,
        "\u000C": true,
        "\u0020": true,
        "\u00A0": true,
        "\uFEFF": true
    };
    var LineTerminators = {
        __proto__: null,
        "\u000A": true,
        "\u000D": true,
        "\u2028": true,
        "\u2029": true
    };
    var HexDigits = {
        __proto__: null,
        "0": true,
        "1": true,
        "2": true,
        "3": true,
        "4": true,
        "5": true,
        "6": true,
        "7": true,
        "8": true,
        "9": true,
        "a": true,
        "b": true,
        "c": true,
        "d": true,
        "e": true,
        "f": true,
        "A": true,
        "B": true,
        "C": true,
        "D": true,
        "E": true,
        "F": true
    };
    var BinaryDigits = {
        __proto__: null,
        "0": true,
        "1": true
    };
    var OctalDigits = {
        __proto__: null,
        "0": true,
        "1": true,
        "2": true,
        "3": true,
        "4": true,
        "5": true,
        "6": true,
        "7": true
    };
    var DecimalDigits = {
        __proto__: null,
        "0": true,
        "1": true,
        "2": true,
        "3": true,
        "4": true,
        "5": true,
        "6": true,
        "7": true,
        "8": true,
        "9": true
    };
    var NonZeroDigits = {
        __proto__: null,
        "1": true,
        "2": true,
        "3": true,
        "4": true,
        "5": true,
        "6": true,
        "7": true,
        "8": true,
        "9": true
    };
    var ExponentIndicator = {
        __proto__: null,
        "e": true,
        "E": true
    };
    var SignedInteger = {
        __proto__: null,
        "+": true,
        "-": true
    };
    var ParensSemicolonComma = {
        "{": true,
        "}": true,
        "(": true,
        ")": true,
        "[": true,
        "]": true,
        ";": true,
        ",": true
    };
    var NumericLiteralLetters = {
        __proto__: null,
        "x": true,
        "X": true,
        "b": true,
        "B": true,
        "O": true,
        "o": true
    };
    var SingleEscape = {
        __proto__: null,
        "b": "\b",
        "t": "\t",
        "n": "\n",
        "v": "\v",
        "f": "\f",
        "r": "\r",
        "\\": "\\",
        "\"": "\"",
        "\'": "\'"
    };
    var IdentifierStart = {
        __proto__: null,
        "\\": true, // fuer schnelleren Vergleich mit escape sequence
        "$": true,
        "_": true,
        "A": true,
        "B": true,
        "C": true,
        "D": true,
        "E": true,
        "F": true,
        "G": true,
        "H": true,
        "I": true,
        "J": true,
        "K": true,
        "L": true,
        "M": true,
        "N": true,
        "O": true,
        "P": true,
        "Q": true,
        "R": true,
        "S": true,
        "T": true,
        "U": true,
        "V": true,
        "W": true,
        "X": true,
        "Y": true,
        "Z": true,
        "a": true,
        "b": true,
        "c": true,
        "d": true,
        "e": true,
        "f": true,
        "g": true,
        "h": true,
        "i": true,
        "j": true,
        "k": true,
        "l": true,
        "m": true,
        "n": true,
        "o": true,
        "p": true,
        "q": true,
        "r": true,
        "s": true,
        "t": true,
        "u": true,
        "v": true,
        "w": true,
        "x": true,
        "y": true,
        "z": true,
    };
    var IdentifierPart = {
        __proto__: null,
        "$": true,
        "_": true,
        "A": true,
        "B": true,
        "C": true,
        "D": true,
        "E": true,
        "F": true,
        "G": true,
        "H": true,
        "I": true,
        "J": true,
        "K": true,
        "L": true,
        "M": true,
        "N": true,
        "O": true,
        "P": true,
        "Q": true,
        "R": true,
        "S": true,
        "T": true,
        "U": true,
        "V": true,
        "W": true,
        "X": true,
        "Y": true,
        "Z": true,
        "a": true,
        "b": true,
        "c": true,
        "d": true,
        "e": true,
        "f": true,
        "g": true,
        "h": true,
        "i": true,
        "j": true,
        "k": true,
        "l": true,
        "m": true,
        "n": true,
        "o": true,
        "p": true,
        "q": true,
        "r": true,
        "s": true,
        "t": true,
        "u": true,
        "v": true,
        "w": true,
        "x": true,
        "y": true,
        "z": true,
        "0": true,
        "1": true,
        "2": true,
        "3": true,
        "4": true,
        "5": true,
        "6": true,
        "7": true,
        "8": true,
        "9": true,
        /* ZWNJ, ZWJ */
        "\u200C": true,
        "\u200D": true
    };
    var Types = {
        __proto__: null,
        "null": true,
        "undefined": true,
        "boolean": true,
        "string": true,
        "number": true,
        "object": true,
        "symbol": true,
        "function": true,
        "reference": true
    };
    var SemicolonInsertionPoint = {
        __proto__: null,
        "PostFixExpression": true, // LHS[no LT]++ / bzw. nur definiert weil ich es mir merken wollte
        "ContinueStatement": true,
        "BreakStatement": true,
        "ReturnStatement": true,
        "ThrowStatement": true,
        "LineTerminator": true,
        "RightBracePunctuator": true
    };
    var ReservedWord = {
        __proto__: null,
        "Keyword": true,
        "FutureReservedWord": true,
        "BooleanLiteral": true,
        "NullLiteral": true
    };

    /** WARUM habe ich das ding nochmal geschrieben ***/
    var TypeOfToken = {
        __proto__: null,
        "\"use strict\"": "Directive",
        "'use strict'": "Directive",
        "\"use asm\"": "Directive",
        "'use asm'": "Directive",
        "{": "Punctuator",
        "(": "Punctuator",
        ")": "Punctuator",
        "[": "Punctuator",
        "]": "Punctuator",
        ".": "Punctuator",
        ";": "Punctuator",
        ",": "Punctuator",
        "<": "Punctuator",
        ">": "Punctuator",
        "<=": "Punctuator",
        ">=": "Punctuator",
        "==": "Punctuator",
        "!=": "Punctuator",
        "===": "Punctuator",
        "!==": "Punctuator",
        "+": "Punctuator",
        "-": "Punctuator",
        "*": "Punctuator",
        "%": "Punctuator",
        "++": "Punctuator",
        "--": "Punctuator",
        "<<": "Punctuator",
        ">>": "Punctuator",
        ">>>": "Punctuator",
        "&": "Punctuator",
        "|": "Punctuator",
        "^": "Punctuator",
        "!": "Punctuator",
        "~": "Punctuator",
        "&&": "Punctuator",
        "||": "Punctuator",
        "?": "Punctuator",
        ":": "Punctuator",
        "=": "Punctuator",
        "+=": "Punctuator",
        "-=": "Punctuator",
        "*=": "Punctuator",
        "%=": "Punctuator",
        "<<=": "Punctuator",
        ">>=": "Punctuator",
        ">>>=": "Punctuator",
        "&=": "Punctuator",
        "|=": "Punctuator",
        "^=": "Punctuator",
        "=>": "Punctuator",
        "}": "RightBracePunctuator",
        "/": "DivPunctuator",
        "/=": "DivPunctuator",
        "break": "Keyword",
        "case": "Keyword",
        "catch": "Keyword",
        "class": "Keyword",
        "continue": "Keyword",
        "const": "Keyword",
        "debugger": "Keyword",
        "default": "Keyword",
        "delete": "Keyword",
        "do": "Keyword",
        "else": "Keyword",
        "export": "Keyword",
        "finally": "Keyword",
        "for": "Keyword",
        "function": "Keyword",
        "if": "Keyword",
        "import": "Keyword",
        "in": "Keyword",
        "of": "Keyword",
        "instanceof": "Keyword",
        "let": "Keyword",
        "new": "Keyword",
        "return": "Keyword",
        "super": "Keyword",
        "switch": "Keyword",
        "this": "Identifier",
        "throw": "Keyword",
        "try": "Keyword",
        "typeof": "Keyword",
        "var": "Keyword",
        "void": "Keyword",
        "while": "Keyword",
        "with": "Keyword",
        "enum": "FutureReservedWord",
        "extends": "FutureReservedWord",
        "implements": "FutureReservedWord",
        "interface": "FutureReservedWord",
        "package": "FutureReservedWord",
        "private": "FutureReservedWord",
        "protected": "FutureReservedWord",
        "public": "FutureReservedWord",
        "static": "Keyword",
        "yield": "FutureReservedWord",
        "null": "NullLiteral",
        "true": "BooleanLiteral",
        "false": "BooleanLiteral",
        "NaN": "NumericLiteral",
        "Infinity": "NumericLiteral",
        "undefined": "Identifier"
    };
    var Keywords = {
        __proto__: null,
        "case": true,
        "catch": true,
        "class": true,
        "continue": true,
        "const": true,
        "debugger": true,
        "default": true,
        "delete": true,
        "do": true,
        "else": true,
        "enum": true,
        "export": true,
        "extends": true,
        "finally": true,
        "for": true,
        "function": true,
        "if": true,
        "import": true,
        "in": true,
        "instanceof": true,
        "implements": true,
        "interface": true,
        "let": true,
        "new": true,
        "of": true,
        "package": true,
        "private": true,
        "protected": true,
        "public": true,
        "return": true,
        "static": true,
        "super": true,
        "switch": true,
        "this": true,
        "throw": true,
        "try": true,
        "typeof": true,
        "var": true,
        "void": true,
        "while": true,
        "with": true,
        "yield": true
    };

    var IsAnyLiteral = {
        __proto__: null,
        "NullLiteral": true,
        "NumericLiteral": true,
        "BooleanLiteral": true,
        "StringLiteral": true,
        "TemplateLiteral": true,
        "RegularExpressionLiteral": true
    };
    var PunctToExprName = {
        __proto__: null,
        "delete": "UnaryExpression",
        "typeof": "UnaryExpression",
        "void": "UnaryExpression",
        "--": "UnaryExpression",
        "++": "UnaryExpression",
        // + und - fehlen hier
        "!": "UnaryExpression",
        "*": "MultiplicativeExpression",
        "/": "MultiplicativeExpression",
        "%": "MultiplicativeExpression",
        "+": "AdditiveExpression",
        "-": "AdditiveExpression",
        "<<": "ShiftExpression",
        ">>": "ShiftExpression",
        "<<<": "ShiftExpression",
        "<": "RelationalExpression",
        ">": "RelationalExpression",
        "<=": "RelationalExpression",
        ">=": "RelationalExpression",
        "in": "RelationalExpression",
        "of": "RelationalExpression",
        "instanceof": "RelationalExpression",
        "=": "AssignmentExpression",
        "==": "EqualityExpression",
        "!=": "EqualityExpression",
        "===": "EqualityExpression",
        "!==": "EqualityExpression",
        "is": "EqualityExpression",
        "isnt": "EqualityExpression",
        "&": "BitwiseANDExpression",
        "|": "BitwiseORExpression",
        "^": "BitwiseXORExpression",
        "&&": "LogicalANDExpression",
        "||": "LogicalORExpression",
        "?": "ConditionalExpression"
    };
    var BinaryOperators = {
        __proto__: null,
        "==": true,
        "!=": true,
        "===": true,
        "!==": true,
        "<": true,
        "<=": true,
        ">": true,
        ">=": true,
        "<<": true,
        
        ">>": true,
        ">>>": true,
        
        "+": true,
        "-": true,
        "*": true,
        "/": true,
        "%": true,
        "&&": true,
        "||": true,
        "&": true,
        "|": true,
        "^": true,
        "in": true,
        "of": true,
        "instanceof": true,
        ".": true
    };
    var AssignmentOperators = {
        __proto__: null,
        "=": true,
        "%=": true,
        "*=": true,
        "/=": true,
        "+=": true,
        "-=": true,
        "<<=": true,
        ">>=": true,
        ">>>=": true,
        "&=": true,
        "^=": true,
        "|=": true,
        "~=": true
    };
    var UnaryOperators = {
        __proto__: null,
        "-": true,
        "+": true,
        "~": true,
        "!": true,
        "typeof": true,
        "void": true,
        "delete": true
    };
    var UpdateOperators = {
        __proto__: null,
        "++": true,
        "--": true
    };
    var EqualityOperators = {
        "==": true,
        "!=": true,
        "===": true,
        "!==": true,
        __proto__: null
    };
    var RelationalOperators = {
        "<": true,
        ">": true,
        "<=": true,
        ">=": true,
        "instanceof": true,
        __proto__: null
    };
    var LogicalOperators = {
        "&&": true,
        "||": true,
        __proto__: null
    };
    var BitwiseOperators = {
        __proto__: null,
        "~": true,
        "^": true,
        "|": true,
        "&": true
    };
    var InOperator = {
        __proto__: null,
        "in": true,
        "of": true
    };
    var OpenParens = {
        __proto__: null,
        "(": true,
        "{": true,
        "[": true
    };

    var ExprEndOfs = Object.create(null);
    ExprEndOfs[")"] = true;
    ExprEndOfs["]"] = true;
    ExprEndOfs["}"] = true;
    ExprEndOfs[":"] = true;
    ExprEndOfs[";"] = true;
    ExprEndOfs["case"] = true;
    ExprEndOfs["default"] = true;
    /*
            __proto__: null,
            ")": true,
            "}": true,
            "]": true,
            ":": true,
            ";": true,
            //",": true,
            "case": true,
            "default": true
            
        };
        */
    var Separators = {
        ";": true,
        ",": true
    };
    Separators.prototype = Object.create(LineTerminators);

    var OperatorPrecedence = {
        // higher is calculated first
        
        __proto__: null,

        ";": 0,
        ",": 1,
        "=": 10,
        "+=": 10,        
        "-=": 10,        
        "*=": 10,        
        "/=": 10,        
        "%=": 10,        
        "~=": 10,        
        "^=": 10,        
	"<<=": 10,                
	">>=": 10,        
	">>>=": 10,        
	"&=": 10,
	"|=": 10,        

        
        "?": 20,
        "|": 20,
        "&": 20,
        "<<": 20,
        ">>": 20,
        ">>>": 20,

        "^": 20,

        
        "||": 30,
        "&&": 30,

        
        "===": 40,
        "==": 40,
        "!==": 40,
        "!=": 40,
        "<": 40,
        ">": 40,
        "<=": 40,
        ">=": 40,
        "instanceof": 40,
        "in": 40,
        "of": 40,


        "+": 50,
        "-": 50,


        "*": 60,
        "/": 60,
        "%": 60,
        
        
        "!": 70,
        "~": 70,
        
        //"-":70,   <- unary - dupl key (hey! fix me!)
        //"+":70,   <- unary + dupl key 
        "!!": 70,
        
        

        ".": 80,
        "[": 80,
        "(": 80

    };

    var RegExpFlags = {
        __proto__: null,
        "m": true,
        "g": true,
        "y": true,
        "i": true,
        "u": true
    };
    var RegExpNoneOfs = {
        __proto__: null,
        "*": true,
        //    "\\":true,
        "/": true,
        "[": true
    };

    /* 1. Versuch */
    var NotBeforeRegExp = {
        __proto__: null,
        "Identifier": true,
        "NumericLiteral": true,
        "BooleanLiteral": true,
        "StringLiteral": true,
        "RegularExpressionLiteral": true
    };

    var UnicodeIDStart = {
        __proto__: null
    };
    var UnicodeIDContinue = {
        __proto__: null
    };

    var IsIteration = {
        "ForStatement": true,
        "ForInStatement": true,
        "ForOfStatement": true,
        "WhileStatement": true,
        "DoWhileStatement": true
    };

    var DeclarationKind = {
        "var": true,
        "let": true,
        "const": true
    };

    var NotExpressionStatement = {
        __proto__: null,
        "{": true,
        "function": true,
        "class": true
    };

    var Continuations = {
        __proto__: null,
        "throw": true,
        "break": true,
        "continue": true,
        "return": true,
        "yield": true
    };

    var AbruptCompletion = {
        "break": true,
        "continue": true,
        "throw": true,
        "return": true
    };
    var Integrities = {
        "nonextensible": true,
        "sealed": true,
        "frozen": true
    };
    var IterationStatement = {
        "ForStatement": true,
        "WhileStatement": true,
        "DoWhileStatement": true,
        "ForInStatement": true,
        "ForOfStatement": true
    };
    var ControlStatement = {
        "IfStatement": true,
        "SwitchStatement": true
    };

    // var tables = Object.create(null);
    exports.DOM = DOM;
    exports.HTML5Objects = HTML5Objects;
    exports.NodeJSObjects = NodeJSObjects;
    exports.Builtins = Builtins;
    exports.Comment = Comment;
    exports.Parentheses = Parentheses;
    exports.Quotes = Quotes;
    exports.Punctuators = Punctuators;
    exports.WhiteSpaces = WhiteSpaces;
    exports.LineTerminators = LineTerminators;
    exports.HexDigits = HexDigits;
    exports.NonZeroDigits = NonZeroDigits;
    exports.BinaryDigits = BinaryDigits;
    exports.OctalDigits = OctalDigits;
    exports.DecimalDigits = DecimalDigits;
    exports.ExponentIndicator = ExponentIndicator;
    exports.SignedInteger = SignedInteger;
    exports.ParensSemicolonComma = ParensSemicolonComma;
    exports.NumericLiteralLetters = NumericLiteralLetters;
    exports.SingleEscape = SingleEscape;
    exports.IdentifierStart = IdentifierStart;
    exports.IdentifierPart = IdentifierPart;
    exports.Types = Types;
    exports.SemicolonInsertionPoint = SemicolonInsertionPoint;
    exports.ReservedWord = ReservedWord;
    exports.TypeOfToken = TypeOfToken;
    exports.Keywords = Keywords;
    exports.IsAnyLiteral = IsAnyLiteral;
    exports.PunctToExprName = PunctToExprName;
    exports.BinaryOperators = BinaryOperators;
    exports.AssignmentOperators = AssignmentOperators;
    exports.RelationalOperators = RelationalOperators;
    exports.UnaryOperators = UnaryOperators;
    exports.UpdateOperators = UpdateOperators;
    exports.EqualityOperators = EqualityOperators;
    exports.RelationalOperators = RelationalOperators;
    exports.LogicalOperators = LogicalOperators;
    exports.BitwiseOperators = BitwiseOperators;
    exports.InOperator = InOperator;
    exports.OpenParens = OpenParens;
    exports.ExprEndOfs = ExprEndOfs;
    exports.Separators = Separators;
    exports.OperatorPrecedence = OperatorPrecedence;
    exports.RegExpFlags = RegExpFlags;
    exports.RegExpNoneOfs = RegExpNoneOfs;
    exports.NotBeforeRegExp = NotBeforeRegExp;
    exports.UnicodeIDStart = UnicodeIDStart;
    exports.UnicodeIDContinue = UnicodeIDContinue;
    exports.IsIteration = IsIteration;
    exports.NotExpressionStatement = NotExpressionStatement;
    exports.DeclarationKind = DeclarationKind;
    exports.Continuations = Continuations;
    // return tables;
});