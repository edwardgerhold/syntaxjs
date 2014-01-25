
function Module(id, exports, children, code) {
    "use strict"
    var m = this;
    if (typeof id === "object") {
        exports = id.exports;
        id = id.id;
        children = id.children;
        code = id.code;
    }
    m.id = id;
    m.children = children;
    if (exports) m.loaded = true;
    m.exports = exports || {};
    m.require = function (ids, factory) {
        return require.apply(this, arguments);
    };
    if (code) {
        m.factory = new Function("require", "exports", "module", code);
        m.factory(m.require.m.exports, m);
        m.loaded = true;
    }
    return m;
}

function define(id, deps, factory) {
    "use strict"
    var exports = {};
    var children = [];
    var imports = [];
    var returned;
    var m = new Module({
        id: id,
        exports: exports,
        children: children
    });
    var d;
    if (!require.cache) require.cache = Object.create(null);
    if (arguments.length === 2) {
        if (typeof deps === "function") {
            factory = deps;
            deps = null;
            try {
                returned = factory(m.require, m.exports, m);
            } catch (ex) {
                throw ex;
            }
        } else {
            returned = require.cache[id] = deps;
        }
    } else if (deps && deps.length && typeof factory === "function") {
        for (var i = 0, j = deps.length; i < j; i++) {
            imports.push((d = require.cache[deps[i]]) ? d.exports : null);
            children.push(d ? d : null);
        }
        try {
            returned = factory.apply(factory, imports);
        } catch (ex) {
            throw ex;
        }
    }
    m.exports = returned !== undefined ? returned : exports;
    require.cache[id] = m;
    return m.exports;
}

function require(deps, factory) {
    "use strict"
    var m;
    var mods = [];
    var exports;
    
    if (!require.cache) require.cache = Object.create(null);
    if (arguments.length === 1) {
        if (typeof deps === "function") return deps();
        if (m = require.cache[deps]) {
            return m.exports;
        }
        if (!exports) throw "require(id): could not find " + deps;
    } else {

        for (var i = 0, j = deps.length; i < j; i++) {
            m = require.cache[deps[i]];
            mods.push(m ? m.exports : {});
        }
        if (factory)
            return factory.apply(null, mods);
    }
}

/*
 ******
 define: tables
 ******
*/

define("lib/i18n-messages", function (require, exports, module) {

    var languages = Object.create(null);

    var en = {
        "not_an_object": "argument is not an object",
        "not_to_primitive": "can not convert argument to primitive type",
        "not_coercible": "can not convert argument to object",
        "unresolvable_ref": "is an unresolvable reference",
        "not_in_strict": "is not allowed in strict mode"
    };

    var de = {
        "not_an_object": "Argument ist kein Objekt",
        "not_to_primitve": "Kann Argument nicht in Primitivtyp umwandeln.",
        "not_coercible": "Kann Argument nicht in Objekt umwandeln.",
        "unresolvable_ref": "ist eine nicht aufloesbare Referenz."
    };

    var fr = {
        "not_an_object" : "argument n´est pas un object"
    };

    var la = {
        "not_an_object" : "objectum non est",
        "not_to_primitivus" : "primitive type non est",
        "not_coercible" : "non coerciblus"

    };



    languages.en = en;
    languages.de = de;
    languages.fr = fr;

    function i18n(name, lang) {
        lang = lang || i18n.defaultLanguage;
        return i18n.languages[lang][name] || i18n.languages["en"][name] || ("'i18n:" + lang + ":" + name + "'");
    }

    i18n.languages = languages;
    i18n.defaultLanguage = "de";

    return i18n;

});

define("lib/tables", function (require, exports, module) {

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
        "lib/syntaxerror": true,
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
        __proto__: null,
        ";": 0,
        ",": 1,
        "=": 10,
        "?": 20,
        "|": 20,
        "&": 20,
        "||": 30,
        "&&": 30,
        "+": 50,
        "-": 50,

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
        "*": 60,
        "/": 60,
        "%": 60,
        "!": 70,
        "~": 70,
        //"-":70,   <- unary - dupl key
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

define("lib/tokenizer", ["lib/tables"], function (tables) {

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
    var ch, lookahead;
    var cb;

    var result = [];

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

    function newNodeId() {
        var id = "" + Math.random();
        if (tokenTable[id]) id = newNodeId();
        return id;
    }

    function nextLine() {
        lines[line] = column;
        ++line;
        column = 0;
        return line;
    }

    function nestingError(r) {
        throw SyntaxError("incorrectly nested " + r);
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
        token.computed = computed;

        if (PunctOrLT[type]) {
            /*
			if (type === "Punctuator") {
			 if (lookahead === undefined && !AllowedLastChars[value]) throw SyntaxError("Unexpected end of input stream");
			}
			*/
            if (!OneOfThesePunctuators[value])
                inputElementGoal = inputElementRegExp;
        } else {
            inputElementGoal = inputElementDiv;
        }

        token.offset = offset;

        token.loc = {
            __proto__: null,
            source: filename,
            start: {
                line: line,
                column: column,
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

        result.push(token);
        if (cb) cb(token);
        return token;
    }

    function LineTerminator() {
        if (LineTerminators[ch]) return pushtoken("LineTerminator", ch, undefined, undefined, true);
        return false;
    }

    function WhiteSpace() {
        var spaces = "";
        if (WhiteSpaces[ch]) {
            spaces += ch;
            while (WhiteSpaces[lookahead]) {
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
            return pushtoken("StringLiteral", string, string.substr(1, string.length - 2));
        }
        return false;
    }

    function TemplateLiteral() {
        var template = "";
        if (ch == '`') {
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
        var expr = "",
            flags = "";
        var n, l;
        if (ch === "/" && !NotBeforeRegExp[lastTokenType]) { // <--- grammatik

            if (!RegExpNoneOfs[lookahead] && !LineTerminators[lookahead]) {
                expr += ch;
                next();
                if (i > j) throw new SyntaxError("Unexpected end of line, while parsing RegularExpressionLiteral at line " + line + ", column " + column);
                big: while (i < j) {

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
                }
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

            if (LPAREN[ch]) {
                parens.push(ch);
            } else if (RPAREN[ch]) {
                var p = parens.pop();
                if (LPARENOF[ch] !== p) {
                    //    			nestingError();
                }
            }
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
            ch = sourceCode[i];
            lookahead = sourceCode[i + 1];
            return true;
        } else if (i === j) return false;
        else throw new RangeError("UNEXPECTED END OF INPUT STREAM.");
        return false;
    }

    function resetVariables() {

        tokenTable = Object.create(null);
        sourceCode = "";
        result = [];
        cb = undefined;
        ch = undefined;
        lookahead = undefined;
        i = -1;
        j = 0;
        line = 1;
        column = 0;
    }

    function Error() {
        if (i >= 0 && i < j - 1) {
            var se = new SyntaxError("Can not parse token.");
            se.stack = "syntax.js tokenizer,\nfunction tokenize,\n does not recognize actual input. ch=" + ch + ", lookahead=" + lookahead + ", line=" + line + ", col=" + column + ", offset=" + offset + " \nMeans it is not in the language. \nControl the source, not this tool. \nOr you may have to extend it.";
            throw se;
        }
    }

    function tokenize(jstext, callback) {

        resetVariables();

        if (jstext) sourceCode = jstext;
        if (callback) cb = callback;

        ch = sourceCode[i];
        lookahead = sourceCode[i + 1];
        var token;
        for (i = i, j = sourceCode.length; i < j; next()) {

            offset = i;
            token = WhiteSpace() || LineTerminator() || DivPunctuator() || NumericLiteral() || Punctuation() || KeywordOrIdentifier() || StringLiteral() || TemplateLiteral();
            if (!token) {
                if (i > 0 && i < j - 1) Error();
            }

        }

        result.tokenTable = tokenTable;
        return result;

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

    function updateOffsetTrackingObject(counter) {
        counter.position = i;
        counter.line = line;
        counter.column = column;
    }

    function inlineSetup(src, pos) {
        sourceCode = src;
        i = pos - 1;
        j = sourceCode.length;
    }

    function inlineLex(goal, counter) {
        if (i < j) {
            next();
            offset = i;
            var token = WhiteSpace() || LineTerminator() || DivPunctuator(goal) || NumericLiteral() || StringLiteral() || TemplateLiteral() || Punctuation() || KeywordOrIdentifier();
            if (counter) updateOffsetTrackingObject(counter);
            return token;
        } else {
            throw "tokenize: over end";
        }
    }

    function setCustomTokenMaker(func) {

        if (typeof func === null) {
            customTokenMaker = null;
        } else if (typeof func === "function") {
            customTokenMaker = func;
        } else throw TypeError("tokenmaker must be a function your_token <- maker(my_token) to return a custom token. Please fix that and try again.");
    }

    tokenize.inlineSetup = inlineSetup;
    tokenize.inlineLex = inlineLex;
    tokenize.setCustomTokenMaker = setCustomTokenMaker;

    return tokenize;
});

define("lib/crocks-pratt-parser", ["lib/tables", "lib/tokenizer"], function (tables, tokenize) {
    "use strict";

    function makeCustomToken(foreign_token) {
        var token = Object.create(null);
        token.type = foreign_token.type;
        token.value = foreign_token.value;
        return token;
    }

    var symbol_table = Object.create(null);
    var token, token_nr;
    var scope;
    var original_symbol = {
        nud: function () {
            this.error("Undefined!");
        },
        left: function (left) {
            this.error("Missing operator");
        }
    };
    var symbol = function (id, bp) {
        var s = symbol_table[id];
        bp = bp || 0;
        if (s) {
            if (bp >= s.lbp) {
                s.lbp = bp;
            }
        } else {
            s = Object.create(original_symbol);
            s.id = s.value = id;
            s.lbp = bp
            symbol_table[id] = s;
        }
        return s;
    };

    symbol(":");
    symbol(";");
    symbol(",");
    symbol(")");
    symbol("]");
    symbol("}");
    symbol("else");
    symbol("(end)");
    symbol("(name)");

    var advance = function (id) {
        var a, o, t, v;
        if (id && token.id !== id) {
            token.error("Expected '" + id + "'");
        }
        if (token_nr >= tokens.length) {
            token = symbol_table["(end)"];
            return;
        }
        t = tokens[token_nr];
        token_nr += 1;
        v = t.value;
        a = t.type;
        if (a === "name") {
            o = scope.find(v);
        } else if (a === "operator") {
            o = symbol_table[v];
            if (!o) {
                t.error("Unknown operator!");
            }
        } else if (s === "string" || a === "number") {
            a = "literal";
            o = symbol_table["(literal)"];
        } else {
            t.error("Unexpected token.");
        }
        token = Object.create(o);
        token.value = v;
        token.arity = a;
        return token;
    };

    var itself = function () {
        return this;
    };

    var original_scope = {
        define: function (n) {
            var t = this.def[n.value];
            if (typeof t === "object") {
                n.error(t.reserved ?
                    "Already reserved!" :
                    "Already defined!!");
            }
            this.def[n.value] = n;
            n.reserved = false;
            n.nud = itself;
            n.led = null;
            n.std = null;
            n.scope = scope;
            return n;
        },
        find: function (n) {
            var e = this,
                o;
            while (true) {
                o = e.def[n];
                if (o && typeof o !== "function") {
                    return e.def[n];
                }
                e = e.parent;
                if (!e) {
                    o = symbol_table[n];
                    return o && typeof o !== "function" ? o : symbol_table["(name)"];
                }
            }
        },
        pop: function (n) {
            scope = this.parent;
        },
        reserve: function (n) {
            if (n.arity !== "name" || n.reserved) {
                return;
            }
            var t = this.def[n.value];
            if (t) {
                if (t.reserved) {
                    return;
                }
            }
            if (t.arity === "name") {
                s.error("Already defined");
            }
            this.def[n.value] = n;
            n.reserved = true;
        }

    };

    var new_scope = function () {
        var s = scope;
        scope = Object.create(original_scope);
        scope.def = Object.create(null);
        scope.parent = s;
        return scope;
    };

    var expression = function (rbp) {
        var left;
        var t = token;
        advance();
        left = t.nud();
        while (rbp < token.lbp) {
            t = token;
            advance();
            left = t.led(left);
        }
        return left;
    };

    var infix = function (id, bp, led) {
        var s = symbol(id, bp);
        s.led = led || function (left) {
            this.first = left;
            this.second = expression(bp);
            this.arity = "binary";
            return this;
        };
        return s;
    };

    infix("+", 50);
    infix("-", 50);
    infix("*", 60);
    infix("/", 60);
    infix("===", 40);
    infix("!==", 40);
    infix("<", 40);
    infix("<=", 40);
    infix(">", 40);
    infix(">=", 40);

    infix("?", 20, function (left) {
        this.type = "ConditionalExpression"; // <- so kriegt man den Mozilla AST gleich mit rein
        this.first = left;
        this.second = expression(0);
        advance(":");
        this.third = expression(0);
        this.arity = "ternary";
        // hier mit mozilla ast properties und lexNames und boundNames etc dekorieren.
    });

    infix(".", 80, function (left) {
        this.first = left;
        if (token.arity !== "name") {
            token.error("Expected a property name");
        }
        token.arity = "literal";
        this.second = token;
        this.arity = "binary";
        advance();
        return this;

    });

    infix("[", 80, function (left) {
        this.first = left;
        this.second = expression(0);
        this.arity = "binary";
        advance("]");
    });

    var infixr = function (id, bp, led) {
        var s = symbol(id, bp);
        s.led = led || function (left) {
            this.first = left;
            this.second = expression(bp - 1);
            this.arity = "binary";
        };
        return s;
    };
    infixr("&&", 30);
    infixr("||", 30);
    var prefix = function (id, nud) {
        var s = symbol(id);
        s.nud = nud || function () {
            scope.reserve(this);
            this.first = expression(70);
            this.arity = "unary";
            return this;
        };
        return s;
    };
    prefix("~");
    prefix("!");
    prefix("typeof");
    prefix("void");
    prefix("delete");

    prefix("(", function () {
        var e = expression(0);
        advance(")");
        return s;
    });

    var assignment = function (id) {
        return infixr(id, 10, function (left) {
            if (left.id !== "." && left.id !== "[" && left.arity !== "name") {
                left.error("Bad lvalue");
            }
            this.first = left;
            this.second = expression(0);
            this.assignment = true;
            this.arity = "binary";
            return this;
        });
    };
    assignment("=");
    assignment("+=");
    assignment("-=");

    var constant = function (s, v) {
        var x = symbol(s);
        x.nud = function () {
            scope.reserve(this);
            this.value = symbol_table[this - id].value;
            this.arity = "literal";
            return this;
        };
        x.value = v;
        return x;
    };
    constant("true", true);
    constant("false", false);
    constant("null", null);
    constant("undefined", undefined);

    var statement = function () {
        var n = token,
            v;
        if (n.std) {
            advance();
            scope.reserve(n);
            return n.std;
        }
        v = expression(0);
        if (!v.assignment && v.id !== "(") {
            v.error("Bad expression statement");
        }
        advance(";");
        return v;
    };

    var statements = function () {
        var a = [],
            s;
        while (true) {
            if (token.id === "}" || token.id === "(end)") {
                break;
            }
            s = statement();
            if (s) {
                a.push(s);
            }
        }
        return a.length === 0 ? null : a.length === 1 ? a[0] : a;
    };

    var stmt = function (s, f) {
        var x = symbol(s);
        x.std = f;
        return x;
    };

    stmt("{", function () {
        new_scope();
        var a = statements();
        advance("}");
        scope.pop();
        return a;
    });

    var block = function () {
        var t = token;
        advance("{");
        return t.std();
    };

    stmt("var", function () {
        var a = [],
            n, t;
        while (true) {
            n = token;
            if (n.arity !== "name") {
                n.error("Expected a new variable name");
            }
            scope.define(0);
            advance();
            if (token.id === "=") {
                t = token;
                advance("=");
                t.first = n;
                t.second = expression(0);
                t.arity = "binary";
                a.push(t);
            }
            if (token.id !== ",") {
                break;
            }
            advance(",");
        }
        advance(";");
        return a.length === 0 ? null : a.length === 1 ? a[0] : a;
    });

    stmt("while", function () {
        advance("(");
        this.first = expression(0);
        advance(")");
        this.second = block();
        if (token.id === "else") {
            scope.reserve(token);
            advance("else");
            this.third = token.id === "if" ? statement() : block();
        } else {
            this.third = null;
        }
        this.arity = "statement";
        return this;
    });

    stmt("break", function () {
        advance(";");
        if (token.id !== "}") {
            token.error("Unreachable statement");
        }
        this.arity = statement;
    });

    stmt("return", function () {
        if (token.id !== ";") {
            this.first = expression(0);
        }
        advance(";");
        if (token.id !== "}") {
            this.error("Unreachable statement");
        }
        this.arity = "statement";
        return this;
    });

    prefix("function", function () {
        var a = [];
        new_scope();
        if (token.arity === "name") {
            scope.define(token);
            this.name = token.value;
            advance();
        }
        advance("(");
        if (token.id !== "}") {

        }
        this.first = a;
        advance(")");
        advance("{");
        this.second = satements();
        advance("}");
        this.arity = "function";
        scope.pop();
        return this;
    });

    infix("(", 80, function (left) {
        var a = [];
        if (left.id === "." || left.id === "[") {
            this.arity = "ternary";
            this.first = left.first;
            this.second = left.second;
            this.third = a;
        } else {
            this.arity = "binary";
            this.first = left;
            this.second = a;
            if ((left.arity !== "unary" || left.id !== "function") &&
                left.arity !== "name" && left.id !== "(" && left.id !== "&&" && left.id !== "||" && left.id !== "?") {
                left.error("Expected a variable name");
            }
        }
        if (token.id !== ")") {
            while (true) {
                a.push(expression(0));
                if (token.id !== ",") {
                    break;
                }
                advance(",");
            }
            advance(")");
        }
        return this;
    });

    symbol("this").nud = function () {
        scope.reserve(this);
        this.arity = "this";
        return this;
    };

    prefix("[", function () {
        var a = [];
        if (token.id !== "]") {
            while (true) {
                a.push(expression(0));
                if (token.id !== ",") {
                    break;
                }
                advance(",");
            }
        }
        advance("]");
        this.first = a;
        this.arity = "unary";
        return this;
    });

    prefix("{", function () {
        var a = [];
        if (token.id !== ")") {
            while (true) {
                if (token.arity !== "name" && token.arity !== "literal") {
                    token.error("Bad key");
                }
                advance();
                advance(":");
                var v = expression(0);
                v.key = s.value;
                a.push(v);
                if (token.id !== ",") {
                    break;
                }
                advance(",");
            }
            advance("}");
            this.first = a;
            this.arity = "unary";
            return this;
        }

    });

    var exports = Object.create(null);
    exports.makeCustomToken = makeCustomToken;
    exports.symbol_table = symbol_table;
    exports.symbol = symbol;
    exports.prefix = prefix;
    exports.infix = infix;
    exports.infixr = infixr;
    exports.assignment = assignment;
    exports.statement = statement;
    exports.expression = expression;
    exports.stmt = stmt;
    exports.advance = advance;
    exports.constant = constant;
    exports.new_scope = new_scope;
    return exports;
});

define("lib/slower-static-semantics", function (require, exports, modules) {

    var debugmode = false;

    function debug() {
        if (debugmode && typeof importScripts !== "function") console.log.apply(console, arguments);
    }

    function debugdir() {
        if (debugmode && typeof importScripts !== "function") console.dir.apply(console, arguments);
    }

    exports.UTF16Encode = UTF16Encode;
    exports.UTF16Decode = UTF16Decode;

    function UTF16Encode(cp) {
        Assert(0 <= cp <= 0x10FFFF, "utf16encode: cp has to be beetween 0 and 0x10FFFF");
        if (cp <= 65535) return cp;
        var cu1 = Math.floor((cp - 65536) % 1024) + 55296;
        var cu2 = ((cp - 65536) % 1024) + 56320;
        return [cu1, cu2];
    }

    function UTF16Decode(lead, trail) {
        Assert(0xD800 <= lead <= 0xD8FF, "utf16decode: lead has to be beetween 0xD800 and 0xD8FF");
        Assert(0xDC00 <= trail <= 0xDFFF, "utf16decode: trail has to be beetween 0xDC00 and 0xDFFF");
        var cp = (lead - 55296) * 1024 + (trail - 564320);
        return cp;
    }

    function TailPosition(node, nonTerminal) {
        // Assert(nonTerminal is a parsed grammar production)
    }

    function HasProductionInTailPosition(node, nonTerminal) {
        if (Array.isArray(node)) {
            for (var i = 0, j = node.length; i < j; i++) {
                if (HasProductionInTailPosition(node[i], nonTerminal)) return true;
            }
            return false;
        } else if (node) {
            if (node.type === "ReturnStatement" && node.argument === nonTerminal) return true;
        }
    }
    exports.TailPosition = TailPosition;
    exports.HasProductionInTailPosition = HasProductionInTailPosition;

    exports.IsAnonymousFunctionDefinition = IsAnonymousFunctionDefinition;

    function IsAnonymousFunctionDefinition(node) {
        var type = node.type;
        var id = node.id;
        var expr = node.expression;
        if (!id) {
            if ((expr && (type === "FunctionDeclaration" || type === "GeneratorDeclaration")) || (type === "FunctionExpression" || type === "GeneratorExpression")) {
                return true;
            }
        }
        return false;
    }

    exports.IsIdentifierRef = IsIdentifierRef;

    function IsIdentifierRef(node) {
        var type = node.type;
        if (type === "Identifier") return true;
        else if (type === "RestParameter") return true;
        else if (type === "DefaultParameter") return true;
        return false;
    }

    function ImportEntriesForModule(module, importClause) {

    }

    function ExportEntriesForModule(module, exportClause) {

    }

    function UnknownExportEntries(node, list) {
        var nodetype = node.type;
        list = list || [];
        if (nodetype === "ModuleDeclaration") {
            var body = node.body;
            var decl;
            for (var i = 0, j = body.length; i < j; i++) {
                if (decl = body[i]) UnknownExportEntries(decl, list);
            }
        } else if (nodetype === "ExportDeclaration") {
            list = list.concat(BoundNames(node.exports));
        }
        return list;
    }

    function KnownExportEntries(node) {
        var nodetype = node.type;
        list = list || [];
        if (nodetype === "ModuleDeclaration") {
            var body = node.body;
            var decl;
            for (var i = 0, j = body.length; i < j; i++) {
                if (decl = body[i]) KnownExportEntries(decl, list);
            }
        } else if (nodetype === "ExportDeclaration") {

        }
        return list;
    }

    function ExportedBindings(node) {}

    function ExportedEntries(node) {}

    function ImportedBindings(node) {}

    function ImportedEntries(node) {}

    function ModuleRequests(node) {}

    function ImportedNames(node) {}

    function ExportedNames(node) {}

    exports.ModuleRequests = ModuleRequests;
    exports.ImportEntriesForModule = ImportEntriesForModule;
    exports.ExportEntriesForModule = ExportEntriesForModule;
    exports.ImportedEntries = ImportedEntries;
    exports.ImportedBindings = ImportedBindings;
    exports.ExportedEntries = ExportedEntries;
    exports.ExportedBindings = ExportedBindings;

    exports.IsFunctionDeclaration = IsFunctionDeclaration;
    exports.IsFunctionExpression = IsFunctionExpression;
    exports.IsGeneratorDeclaration = IsGeneratorDeclaration;
    exports.IsGeneratorExpression = IsGeneratorExpression;
    exports.IsVarDeclaration = IsVarDeclaration;

    function IsFunctionDeclaration(node) {
        return node.type === "FunctionDeclaration";
    }

    function IsFunctionExpression(node) {
        var type = node.type;
        return (type === "FunctionDeclaration" && node.expression) || type === "FunctionExpression";
    }

    function IsGeneratorDeclaration(node) {
        var type = node.type;
        return (type === "FunctionDeclaration" && node.generator) || type === "GeneratorDeclaration";
    }

    function IsGeneratorExpression(node) {
        var type = node.type;
        return (type === "FunctionDeclaration" && node.expression && node.generator) || type === "GeneratorExpression";
    }

    function IsVarDeclaration(node) {
        if (node.kind === "var" && node.type === "VariableDeclaration") return true;
        return false;
    }

    var isStrictDirective = {
        "'use strict'": true,
        '"use strict"': true
    };
    exports.isStrictDirective = isStrictDirective;

    exports.IsStrict = IsStrict;

    function IsStrict(node) {
        var n;
        if (!Array.isArray(node)) {
            if (node) {
                var type = node.type;
                if (node.strict) return true;
                else if (type === "Directive" && isStrictDirective[node.value]) return true;
                else if (type === "ModuleDeclaration") return true;
                else if (type === "GeneratorDeclaration") return true;
                else if (type === "ClassDeclaration") return true;
            }
        } else if (node) {

            var i = 0;
            var n;
            while ((n = node[i]) && n.type === "Directive") {
                i++;
                if (isStrictDirective[node.value]) return true;
            }
        }
        return false;
    }

    var IsIteration = {
        "ForStatement": true,
        "ForInStatement": true,
        "ForOfStatement": true,
        "WhileStatement": true,
        "DoWhileStatement": true

    };

    function Contains(R, S) {

        var contains = false;
        var body, node, type;

        if (typeof R !== "object") return false;

        if (!Array.isArray(S)) S = [S];
        if (Array.isArray(R)) body = R;
        else if (R.body) body = R.body;

        if (Array.isArray(body)) {

            for (var i = 0, j = body.length; i < j; i++) {
                node = body[i];
                type = node.type;
                if (type === "ClassDeclaration") continue;
                if (type === "FunctionDeclaration") continue;
                if (type === "GeneratorDeclaration") continue;

                if (IsIteration[type] && Contains(node, S)) {
                    contains = true;
                    return contains;
                }

                for (var k = 0, l = S.length; k < l; k++) {
                    if (type === S[k]) {
                        contains = true;
                        return contains;
                    }
                }

            }
        }
        return contains;
    }

    function BoundNames(list, names) {
        var item;
        names = names || [];
        var name;
        var node;
        var type;

        if (typeof list === "string") {
            names.push(list);
            debug("BoundNames: " + names.join(","));
            return names;

        } else if (!Array.isArray(list)) {

            // BoundNames einzeln
            node = list;

            type = node.type;

            if (type === "ArrayPattern" || type == "ObjectPattern") {
                names = BoundNames(node.elements, names);
            } else if (type === "ForDeclaration") names = BoundNames(node.id, names);
            else if ((type === "FunctionDeclaration") || (type === "VariableDeclarator")) names.push(node.id);
            else if (type === "GeneratorDeclaration") names.push(node.id);
            else if (type === "Identifier") names.push(node.name);
            else if (type === "DefaultParameter") names.push(node.id);
            else if (type === "RestParameter") names.push(node.id);

            debug("BoundNames: " + names.join(","));
            return names;

        } else {

            // BoundNames Formals oder andere Listen.
            var name;
            for (var i = 0, j = list.length; i < j; i++) {
                if (node = list[i]) {
                    type = node.type;
                    if (type === "ArrayPattern" || type == "ObjectPattern") {
                        names = BoundNames(node.elements, names);
                    } else if (type === "Identifier") {
                        name = node.name;
                        names.push(name);
                    } else if (type === "BindingElement") {
                        name = node.as.name || node.as.value;
                        names.push(name);
                    } else if (type === "DefaultParameter") {
                        name = node.id;
                        names.push(name);
                    } else if (type === "RestParameter") {
                        name = node.id;
                        names.push(name);
                    }
                }
            }

            debug("BoundNames: " + names.join(","));
            return names;

        }
    }

    var BreakableStatement = {

    };
    var IterationStatement = {
        "ForStatement": true,
        "WhileStatement": true,
        "DoWhileStatement": true,
        "ForInStatement": true,
        "ForOfStatement": true
    };

    function VarDeclaredNames(body, names) {

        var node, decl, i, j, k, l;
        if (!names) names = [];
        if (!body) return names;
        for (i = 0, j = body.length; i < j; i++) {

            if (node = body[i]) {

                var type = node.type;
                if (type === "VariableDeclaration" && node.kind === "var") {
                    var decls = node.declarations;

                    for (k = 0, l = decls.length; k < l; k++) {
                        if (decl = decls[k]) {
                            names = BoundNames(decl, names);
                        }
                    }
                } else if (type === "FunctionDeclaration" && !node.expression && !node.expression) {
                    names.push(node.id);
                } else if (type === "IfStatement") {
                    names = VarDeclaredNames(node.consequent, names);
                    names = VarDeclaredNames(node.alternate, names);
                } else if (type === "SwitchStatement") {
                    names = VarDeclaredNames(node.discriminant, names);
                    names = VarDeclaredNames(node.cases);
                } else if (IterationStatement[type]) {
                    if (type === "ForStatement") {
                        names = VarDeclaredNames(node.init, names);
                    } else if (type === "ForInStatement") {
                        if (node.left && node.left.type) {
                            if (node.left.type === "Identifier") names.push(node.left.name);
                        } else
                            names = VarDeclaredNames(node.left, names);
                    } else if (type === "ForOfStatement") {
                        if (node.left && node.left.type) {
                            if (node.left.type === "Identifier") names.push(node.left.name);
                        } else
                            names = VarDeclaredNames(node.left, names);
                    }
                    names = VarDeclaredNames(node.body, names);
                } else if (type === "ExportStatement") {
                    if (node.exports.type === "VariableDeclaration") names = VarDeclaredNames(node.exports, names);
                }
            }
        }

        debug("VarDeclaresNames: " + names.join(","));

        return names;
    }

    function VarScopedDeclarations(body, list) {
        var node, decl, i, j, k, l;
        var top;
        list = list || [];
        if (!Array.isArray(body)) body = [body];
        for (i = 0, j = body.length; i < j; i++) {
            if (node = body[i]) {

                var type = node.type;
                if (type === "VariableDeclaration" && node.kind === "var") {
                    var decls = node.declarations;

                    for (k = 0, l = decls.length; k < l; k++) {
                        if (decl = decls[k]) {
                            list.push(decl);
                        }
                    }
                } else if (type === "FunctionDeclaration") {
                    if (!node.expression) list.push(node);
                } else if (type === "IfStatement") {
                    VarScopedDeclarations(node.consequent, list);
                    VarScopedDeclarations(node.alternate, list);
                } else if (type === "SwitchStatement") {
                    VarScopedDeclarations(node.cases, list);
                } else if (IterationStatement[type]) {

                    if (type === "ForStatement") {
                        list = VarScopedDeclarations(node.init, list);
                    } else if (type === "ForInStatement") {
                        if (node.left && node.left.type) {
                            if (node.left.type === "Identifier") list.push(node.left.name);
                        } else

                            list = VarScopedDeclarations(node.left, list);
                    } else if (type === "ForOfStatement") {
                        if (node.left && node.left.type) {
                            if (node.left.type === "Identifier") list.push(node.left.name);
                        } else

                            list = VarScopedDeclarations(node.left, list);
                    }
                    list = VarScopedDeclarations(node.body, list);
                }
            }
        }

        debug("VarScopedDeclarations: " + list.length);

        return list;
    }

    function LexicallyDeclaredNames(body, names) {
        var node, decl, i, j, k, l;
        if (!names) names = [];
        if (!body) return names;
        for (i = 0, j = body.length; i < j; i++) {
            if (node = body[i]) {
                var type = node.type;
                if (type === "LexicalDeclaration" || (type === "VariableDeclaration" && (node.kind === "let" || node.kind === "const"))) {
                    var decls = node.declarations;

                    for (k = 0, l = decls.length; k < l; k++) {
                        if (decl = decls[k]) {
                            names = BoundNames(decl, names);
                        }
                    }
                } else if (type === "GeneratorDeclaration") {
                    names = BoundNames(node, names);
                }
            }
        }

        debug("LexicallyDeclaresNames: " + names.join(","));

        return names;
    }

    function LexicallyScopedDeclarations(body, list) {
        if (!body) return;
        var node, decl, i, j, k, l;
        list = list || [];
        if (!body) return list;
        if (!Array.isArray(body)) body = [body];
        for (i = 0, j = body.length; i < j; i++) {
            if (node = body[i]) {

                var type = node.type;
                if (type === "LexicalDeclaration" || (type === "VariableDeclaration" && node.kind !== "var")) {
                    var decls = node.declarations;

                    for (k = 0, l = decls.length; k < l; k++) {
                        if (decl = decls[k]) {
                            list.push(decl);
                        }
                    }
                } else if (type === "GeneratorDeclaration") {
                    list.push(node);
                }
            }
        }
        debug("LexicallyScopedDeclarations: " + list.length);

        return list;
    }

    function LexicalDeclarations(body, list) {
        if (!body) return;
        var node, decl, i, j, k, l;
        list = list || [];

        if (!body) return list;
        if (!Array.isArray(body)) body = [body];

        for (i = 0, j = body.length; i < j; i++) {
            if (node = body[i]) {
                var type = node.type;

                if (type === "LexicalDeclaration" || (type === "VariableDeclaration" && node.kind !== "var")) {
                    var decls = node.declarations;

                    for (k = 0, l = decls.length; k < l; k++) {
                        if (decl = decls[k]) {
                            list.push(decl);
                        }
                    }

                } else if (type === "GeneratorDeclaration") {
                    list.push(node);
                }
            }
        }

        debug("LexicalDeclarations: " + list.length);
        //debug(list.map(function (x) { return x.id; }).join());

        return list;
    }

    function ReferencesSuper(node) {
        var type;
        var stmt, contains = false;

        if (node && !Array.isArray(node)) {
            type = node.type;
            if (type === "SuperExpression") return true;
            if (type === "MethodDefinition") {
                contains = ReferencesSuper(node.params);
                if (contains) return true;
                contains = ReferencesSuper(node.body);
                if (contains) return true;
            } else if (type === "NewExpression" || type === "CallExpression") {
                if (ReferencesSuper(node.callee)) return true;
            } else if (type === "MemberExpression") {
                if (ReferencesSuper(node.object)) return true;
            }
        }

        if (node && Array.isArray(node)) {

            for (var i = 0, j = node.length; i < j; i++) {
                if (stmt = node[i]) {
                    type = stmt.type;
                    if (ReferencesSuper(stmt)) return true;
                } else if (IsIteration[stmt.type]) {
                    if (ReferencesSuper(stmt.body)) return true;
                }
            }

        }
        return false;
    }

    function ConstructorMethod(defs) {
        var C, def;
        if (Array.isArray(defs)) {
            for (var i = 0, j = defs.length; i < j; i++) {
                if (def = defs[i]) {
                    if (def.isConstructor) return def;
                    if (def.id === "constructor") return def;
                    if (def.ctor) return def.ctor;
                }
            }
        } else {
            def = defs;
            if (!def) return null;
            if (def.isConstructor) return def;
            if (def.id === "constructor") return def;
            if (def.ctor) return def.ctor;
        }
        return null;
    }

    function PrototypeMethodDefinitions(defs, checkList) {
        var def, list = [];
        for (var i = 0, j = defs.length; i < j; i++) {
            def = defs[i];
            if (def && def.type === "MethodDefinition") {
                if (def.isProtototype) list.pus(def);
                else if (!def.static && !def.isConstructor) list.push(def);
            }
        }
        return list;
    }

    function StaticMethodDefinitions(defs, checkList) {
        var def, list = [],
            checkList = Object.create(null);
        for (var i = 0, j = defs.length; i < j; i++) {
            def = defs[i];
            if (def && def.type === "MethodDefinition") {
                if (def.static) {
                    if (def.id && checkList[def.id] && def.kind !== "get" && def.kind !== "set") return withError("Syntax", "duplicate static method definition: " + def.id);
                    else {
                        checkList[def.id] = def.kind;
                        list.push(def);
                    }
                }
            }
        }
        return list;
    }

    function SpecialMethod() {
        if (node.kind === "get" || node.kind === "set") return true;
    }

    function HasInitialiser(node) {
        var type = node.type;
        if (node.id && node.init) return true;
        else if (type === "AssignmentExpression" && node.operator === "=") return true;
        else if (type === "VariableDeclarator" && node.init) return true;
        else if (type === "DefaultParameter") return true;
    }

    var isComplexParameter = {
        "RestParameter": true,
        "ObjectPattern": true,
        "ArrayPattern": true,
        "Identifier": false,
    };

    function IsSimpleParameterList(list) {
        var p;
        for (var i = 0, j = list.length; i < j; i++) {
            if (p = list[i]) {
                if (isComplexParameter[p.type]) return false;
            }
        }
        return true;
    }

    function ExpectedArgumentCount(list) {
        var p;
        for (var i = 0, j = list.length; i < j; i++) {
            if (p = list[i]) {
                if (p.type === "RestParameter" || p.type === "DefaultParameter") return i;
            }
        }
        return j;
    }

    function IsValidSimpleAssignmentTarget(node) {
        var type = node.type;
        if (type === "Identifier") return true;
        else if (type === "ArrayPattern") return true;
        else if (type === "ObjectPattern") return true;
        else if (type === "BinaryExpression") return false;
        return false;
    }

    exports.StringValue = StringValue;

    function StringValue(node) {
        switch (node.type) {
        case "Identifier":
            return node.name;
        case "StringLiteral":
            return node.computed || node.value.slice(1, node.value.length - 1);
        case "NumericLiteral":
            return node.value;
        case "DefaultParameter":
        case "RestParameter":
            return node.id;
        case "FunctionExpression":
        case "GeneratorExpression":
        case "FunctionDeclaration":
        case "GeneratorDeclaration":
            return node.id
        }
    }

    function PropName(node) {
        var type = node.type;
        var id = node.id;
        if (type === "MethodDefinition") {
            return id;
        }
        if (typeof id === "string") return id;
        if (typeof id === "object") return PropName(id);
        if (type === "Identifier") return StringValue(node);
    }

    function PropNameList(node, checkList) {
        var list, body;
        if (body = node.properties) {

        } else if (body = node.elements) {

        } else if (body = node.body) {

        }
    }

    function ElisionWidth(E) {
        return E && E.width || 0;
    }

    function IsConstantDeclaration(node) {
        if (node.kind === "const") return true;
        return false;
    }
    var LetOrConst = {
        __proto__: null,
        "let": true,
        "const": true
    };

    function IsLexicalDeclaration(node) {
        var type = node.type;
        var kind = node.kind;
        if (LetOrConst[kind]) return true;
        if (type === "LexicalDeclaration") return true;
        if (type === "VariableDeclaration") {
            if (LetOrConst[kind]) return true;
        }
        return false;
    }

    function dupesInTheTwoLists(list1, list2, memo) {
        var hasDupe = false;
        var memo = memo || Object.create(null);
        for (var i = 0, j = list1.length; i < j; i++) memo[list1[i]] = true;
        for (i = 0, j = list2.length; i < j; i++)
            if (memo[list2[i]]) hasDupe = true;
            else memo[list2[i]] = true;
    }

    function dupesInTheList(list, memo) {
        var hasDupe = false;
        var memo = memo || Object.create(null);
        for (var i = 0, j = list.length; i < j; i++) {
            if (memo[list[i]]) hasDupe = true;
            else memo[list[i]] = true;
        }
        return hasDupe;
    }

    function TV(t) {}

    function TRV(t) {}

    function CV(lit) {
        return lit.name || lit.value;
    }

    var MVHexDecimal = {
        __proto__: null,
        0: 0,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        A: 10,
        B: 11,
        C: 12,
        D: 13,
        E: 14,
        F: 15,
        a: 10,
        b: 11,
        c: 12,
        d: 13,
        e: 14,
        f: 15
    };

    function MV(value) {
        return +value;
    }

    var numberSplitter = /([0-9]+)(?:\.)?([0-9]*)?(?:([+-])?(?:[eE])([0-9]+))?/;
    // 1               2          3               4
    function _MV(value) {
        var number = 0;
        var ch;
        var mv;
        var vlen = value.length;
        var len;
        var pos;
        if (typeof value === "string") {
            mv = 0;
            var first = value[0];
            var second = value[1];
            var i, j;
            var n;
            if (first == "0") {
                if (second === "x") {

                    for (i = 2, j = vlen; i < j; i++) {
                        ch = value[i];
                        pos = vlen - (i - 2);
                        n = MVHexDecimal[ch];
                        if (pos > 0) n = n * (pos * 15)
                        mv += n;
                    }
                    return mv;

                } else if (second === "b") {
                    len = vlen - 2;
                    for (i = 2, j = vlen; i < j; i++) {
                        ch = value[i];
                        pos = vlen - (i - 2);
                        if (ch == 1) {
                            n += Math.pow(2, pos);
                        }
                        mv += n;
                    }
                    return mv;

                } else if (second === "o") {
                    len = vlen - 2;

                    return mv;
                }
            } else if (first === ".") {
                for (i = 1, j = value.length; i < j; i++) {
                    ch = value[i];
                    pos = i;
                    n = MVHexDecimal[ch];
                    n = n / (10 * pos)
                    mv += n;
                }
                return mv;

            }

            var parts = numberSplitter.exec(value);
            var intg = parts[1];
            var fp = parts[2];
            var sgn = parts[3];
            var exp = parts[4];

            mv = 0;
            if (intg) {

                for (i = 0, j = intg.length; i < j; i++) {
                    ch = intg[i];
                    pos = j - i;
                    n = MVHexDecimal[ch];
                    if (pos > 0) n = n * (pos * 10)
                    mv += n;
                }

            }
            if (fp) {
                for (i = 0, j = fp.length; i < j; i++) {
                    ch = fp[i];
                    pos = i + 1;
                    n = MVHexDecimal[ch];
                    n = n / (10 * pos)
                    mv += n;
                }
            }
            if (exp) {
                for (i = 0, j = exp.length; i < j; i++) {
                    ch = exp[i];
                    pos = j - i;
                    n = MVHexDecimal[ch];
                    if (pos > 0) n = n * (Math.pow(10, -pos))
                    mv += n;
                }
                if (sgn == "-") {
                    mv = -mv;
                }
            }

            return mv;
        }

        return +value;
    }

    function SV(value) {
        return "" + value;
    }

    function isDuplicateProperty(id, checkList) {
        if (checkList[id]) {
            return withError("Type", "duplicate property or method definition: " + id);
        } else return false;
    }

    exports.Contains = Contains;
    exports.BoundNames = BoundNames;
    exports.VarDeclaredNames = VarDeclaredNames;
    exports.LexicallyDeclaredNames = LexicallyDeclaredNames;
    exports.VarScopedDeclarations = VarScopedDeclarations;
    exports.LexicallyScopedDeclarations = LexicallyScopedDeclarations;
    exports.LexicalDeclarations = LexicalDeclarations;
    exports.ReferencesSuper = ReferencesSuper;
    exports.ConstructorMethod = ConstructorMethod;
    exports.PrototypeMethodDefinitions = PrototypeMethodDefinitions;
    exports.StaticMethodDefinitions = StaticMethodDefinitions;
    exports.SpecialMethod = SpecialMethod;
    exports.HasInitialiser = HasInitialiser;
    exports.IsSimpleParameterList = IsSimpleParameterList;
    exports.ExpectedArgumentCount = ExpectedArgumentCount;
    exports.IsValidSimpleAssignmentTarget = IsValidSimpleAssignmentTarget;
    exports.PropName = PropName;
    exports.PropNameList = PropNameList;
    exports.IsConstantDeclaration = IsConstantDeclaration;
    exports.IsLexicalDeclaration = IsLexicalDeclaration;
    exports.ElisionWidth = ElisionWidth;

    exports.ImportedNames = ImportedNames;
    exports.ExportedNames = ExportedNames;

    exports.dupesInTheTwoLists = dupesInTheTwoLists;
    exports.dupesInTheList = dupesInTheList;
    exports.isDuplicateProperty = isDuplicateProperty;

    exports.TV = TV;
    exports.TRV = TRV;
    exports.CV = CV;
    exports.MV = MV;
    exports.SV = SV;

});

/*
############################################################################################################################################################################################################

	Parser - Converts a stream of EcmaScript Tokens into a Mozilla Parser API AST instead of into the good looking Original Strings

############################################################################################################################################################################################################
*/

define("lib/parser", ["lib/tables", "lib/tokenizer"], function (tables, tokenize) {

    "use strict";

    var i18n = require("lib/i18n-messages");

    var parseGoalParameters;
    var withError, ifAbrupt, isAbrupt;

    // ==========================================================
    // O(1) XS Tables, candidate for export into tables module
    // ==========================================================

    var FinishStatementList = {
        __proto__: null,
        ")": true,
        "]": true,
        "}": true
    };

    var FinishSwitchStatementList = {
        __proto__: null,
        ")": true,
        "]": true,
        "}": true,
        "case": true,
        "default": true,
    };

    var PrimaryValues = {
        __proto__: null,
        "function": "FunctionExpression",
        "this": "ThisExpression",
        "class": "ClassExpression",
        "super": "SuperExpression"
    };

    var PrimaryTypes = {
        __proto__: null,
        "TemplateLiteral": "TemplateLiteral",
        "Identifier": "Identifier",
        "StringLiteral": "Literal",
        "NumericLiteral": "Literal",
        "BooleanLiteral": "Literal",
        "NullLiteral": "Literal",
        "ArrayExpression": "ArrayExpression",
        "ObjectExpression": "ObjectExpression",
        "ArrayComprehension": "ArrayComprehension"
    };

    var varKinds = {
        "var": true,
        "let": true,
        "const": true
    };

    var StatementParsers = {
        __proto__: null,
        "{": "BlockStatement",
        "var": "VariableStatement",
        "let": "VariableStatement",
        "const": "VariableStatement",
        "if": "IfStatement",
        "for": "IterationStatement",
        "while": "IterationStatement",
        "do": "IterationStatement",
        "continue": "ContinueStatement",
        "break": "BreakStatement",
        "return": "ReturnStatement",
        "with": "WithStatement",
        "switch": "SwitchStatement",
        "try": "TryStatement",
        "throw": "ThrowStatement",
        "debugger": "DebuggerStatement",
        "import": "ImportStatement",
        "export": "ExportStatement",
        ";": "EmptyStatement"
    };

    var PrimaryExpressionByValue = {
        __proto__: null,
        "(": "CoverParenthesizedExpressionAndArrowParameterList",
        "[": "ArrayExpression",
        "{": "ObjectExpression",
        "class": "ClassExpression",
        "function": "FunctionExpression",
        "this": "ThisExpression",
        "super": "SuperExpression"
    };

    var PrimaryExpressionByType = {
        __proto__: null,
        "Identifier": "Identifier",
        "NumericLiteral": "Literal",
        "TemplateLiteral": "TemplateLiteral",
        "StringLiteral": "Literal",
        "BooleanLiteral": "Literal",
        "NullLiteral": "Literal"
    };

    var SkipableWhiteSpace = {
        __proto__: null,
        "WhiteSpace": true,
        "LineTerminator": true,
        "LineComment": true,
        "MultiLineComment": true
    };
    var SkipableWhiteSpaceNoLT = {
        __proto__: null,
        "WhiteSpace": true,
        "LineComment": true,
        "MultiLineComment": true
    };

    var InOrOfInsOf = Object.create(null);
    InOrOfInsOf. in = true;
    InOrOfInsOf.of = true;
    InOrOfInsOf.instanceof = true;

    var InOrOf = Object.create(null);
    InOrOf. in = true;
    InOrOf.of = true;

    var BindingIdentifiers = {
        __proto__: null,
        "Identifier": true,
        "Keyword": true,
        "FutureReservedWord": true,
        "StringLiteral": true,
        "NumericLiteral": true,
        "BooleanLiteral": true,
        "NullLiteral": true
    };

    var propKeys = Object.create(null);
    propKeys.true = true;
    propKeys.false = true;
    propKeys.null = true;

    var ExprNoneOfs = Object.create(null);
    ExprNoneOfs["function"] = true;
    ExprNoneOfs["class"] = true;
    ExprNoneOfs["module"] = true;
    ExprNoneOfs["{"] = true;

    var MethodKeyByType = {
        __proto__: null,
        "Identifier": true,
        "StringLiteral": true,
        "NumericLiteral": true,
        "BooleanLiteral": true,
        "NullLiteral": true,
        "FutureReservedWord": true
    };

    var MethodKeyByValue = {
        __proto__: null,
        "constructor": true
    };

    var StartBinding = {
        __proto__: null,
        "{": true,
        "[": true
    };

    // ==========================================================
    // Imported Tables Re-Usable From the Tables Module
    // ==========================================================

    var LPAREN = tables.LPAREN;
    var RPAREN = tables.RPAREN;
    var LPARENOF = tables.LPARENOF;

    var Punctuators = tables.Punctuators;
    var WhiteSpaces = tables.WhiteSpaces;
    var LineTerminators = tables.LineTerminators;
    var ParensSemicolonComma = tables.ParensSemicolonComma;
    var NumericLiteralLetters = tables.NumericLiteralLetters;
    var Types = tables.Types;
    var SemicolonInsertionPoint = tables.SemicolonInsertionPoint;
    var ReservedWord = tables.ReservedWord;
    var TypeOfToken = tables.TypeOfToken;
    var Keywords = tables.Keywords;
    var IsAnyLiteral = tables.IsAnyLiteral;
    var PunctToExprName = tables.PunctToExprName;
    var BinaryOperators = tables.BinaryOperators;
    var AssignmentOperators = tables.AssignmentOperators;
    var RelationalOperators = tables.RelationalOperators;
    var UnaryOperators = tables.UnaryOperators;
    var UpdateOperators = tables.UpdateOperators;
    var EqualityOperators = tables.EqualityOperators;
    var RelationalOperators = tables.RelationalOperators;
    var LogicalOperators = tables.LogicalOperators;
    var BitwiseOperators = tables.BitwiseOperators;
    var InOperator = tables.InOperator;
    var OpenParens = tables.OpenParens;
    var ExprEndOfs = tables.ExprEndOfs;
    var OperatorPrecedence = tables.OperatorPrecedence;
    var RegExpNoneOfs = tables.RegExpNoneOfs;
    var NotBeforeRegExp = tables.NotBeforeRegExp;
    var IsIteration = tables.IsIteration;
    var NotExpressionStatement = tables.NotExpressionStatement;
    var DeclarationKind = tables.DeclarationKind;

    // ==========================================================
    // Parser Variables
    // ==========================================================

    var ltNext; // will be set if a lineterminator is before the next token, unset else
    var a, b;
    var lparen = false;
    var rparen = false;
    var tbl;
    var isWorker = typeof importScripts === "function";
    var state = 0; // 0 = SourceElements
    var goalSymbol = 0; // (!goalSymbol) === InputElementDiv
    var ast;

    //
    // VERY IMPORTANT
    //
    var rhs, rhst;
    var lhs, lhst;
    var tokens;
    var T = Object.create(null); // current token
    var t; // current token type
    var v; // current token value
    var i; // tokens[i] pointer
    var j; // tokens.length;
    //
    //
    var pos; // register for backtracking holding the "i" value (i == the position tokens[i])
    //

    var parser = Object.create(null);
    var stack = [];
    var parens = [];

    // Production Parameters 
    var noInStack = [];
    var isNoIn = false;
    var yieldStack = [];
    var yieldIsId = true;
    var defaultStack = [];
    var defaultIsId = true;
    var generatorParameter = false;
    var generatorParameterStack = [];
    var strictModeStack = [];
    var inStrictMode = false;
    var parameterStack = [];
    var curParameter = "";
    var moduleStack = [];
    var curModule;

    var operator;
    var bytes = 0;
    var start = 0; // pos?
    var end = 0; // last ending?
    var line = 0;
    var column = 0;
    var byte = 0;
    var lines = []; // lines[0] = 12 (columns)
    var lastloc = makeLoc();
    var loc = makeLoc();
    var lastcolumn = 0;
    var text;

    var compile = false;
    var builder = null;
    var cb;

    var stateStack = [];
    var state = "";

    function pushState(newState) {
        stateStack.push(state);
        state = newState;
    }

    function popState() {
        state = stateStack.pop();
    }

    function pushNoIn(new_state) {
        noInStack.push(isNoIn);
        isNoIn = new_state;
    }

    function popNoIn() {
        isNoIn = noInStack.pop();
    }

    // ====================================================
    // Throw Error in Parser with throwError(exObj)
    // ====================================================

    function makeErrorStack(error) {
        var stack = error.stack;
        var location = "{syntax.js} A Parser Error occured at line " + line + ", column " + column + "\r\n";
        error.stack = location;
        if (stack) error.stack += stack;
    }

    function throwError(obj) {
        makeErrorStack(obj);
        throw obj;
    }

    function syntaxError(C) {
        throwError(new SyntaxError(C + " expected at line " + line + ", column " + column));
    }

    // ========================================================================================================
    // Early Errors
    // ========================================================================================================

    function EarlyErrors(node) {
        var con = contains;
        /*
	switch(node.type) {
		case "Program":
		if (con.contains("BreakStatement")) throw new SyntaxError("Break is not allowed in the outer script body");
		if (con.contains("ContinueStatement")) throw new SyntaxError("Continue is not allowed in the outer script body");
		if (con.contains("ReturnStatement")) throw new SyntaxError("Return is not allowed in the outer script body");
		break;
		case "FunctionDeclaration":
		if (con.contains("BreakStatement")) throw new SyntaxError("Break is not allowed outside of iterations");
		if (con.contains("ContinueStatement")) throw new SyntaxError("Continue is not allowed outside of iterations");
		if (con.contains("YieldExpression")) throw new SyntaxError("Yield must be an identifier outside of generators or strict mode");

		break;
		case "GeneratorDeclaration":
		
		break;
		case "ModuleDeclaration":
			if (con.contains("BreakStatement")) throw new SyntaxError("Break is not allowed outside of iterations");
		if (con.contains("ContinueStatement")) throw new SyntaxError("Continue is not allowed outside of iterations");
		break;
		default:
		break;
	}
	*/
        return node;
    }

    // ========================================================================================================
    // Contains
    // ========================================================================================================

    var ident, contains;

    function makeNodeAndSymbolTables(tokens) {
        ident = SymbolTable();
        contains = ContainsTable();
    }

    function ContainsTable() {
        "use strict";

        var container = Object.create(null);
        var containers = [container];

        function new_scope() {
            containers.push(container);
            container = Object.create(container);
        }

        function old_scope() {
            container = containers.pop();
        }

        function add(production) {
            container[production] = true;
        }

        function contains(production) {
            if (Object.hasOwnProperty.call(container, production)) return container[production];
            else return false;
        }
        return {
            new_scope: new_scope,
            old_scope: old_scope,
            add: add,
            contains: contains
        };
    }

    var EvalArguments = {
        __proto__: null,
        "eval": true,
        "arguments": true
    };

    // ========================================================================================================
    // Symbol Table
    // ========================================================================================================

    /*
	Symbol Stack:
	------------
	Identifier im AST speichern
	Ein neuer Scope wird jede Funktion eingerichtet.
	
	Identifier sind:
	----------------
	VariableDecl
	LexDecl
	FunctionDecl
	GeneratorDecl
	MethodDefinition nicht, das sind Properties am Objekt.
	
*/

    function SymbolTable() {
        "use strict";

        var lexEnv = Object.create(null);
        var varEnv = lexEnv;
        var varEnvs = [varEnv];
        var lexEnvs = [lexEnv];

        function new_var_scope() {
            varEnvs.push(varEnv);
            varEnv = Object.create(lexEnv);
            lexEnvs.push(lexEnv);
            lexEnv = varEnv;
            return varEnv;
        }

        function new_lex_scope() {
            lexEnvs.push(lexEnv);
            lexEnv = Object.create(lexEnv);
            return lexEnv;
        }

        function old_scope() {
            if (lexEnv === varEnv) {
                varEnv = varEnvs.pop();
            }
            lexEnv = lexEnvs.pop();
            return lexEnv;
        }

        function add_lex(name, param) {
            if (is_lex(name, param)) throwError(name + " is a duplicate identifier in lexical scope ");
            lexEnv[name] = param;
        }

        function add_var(name, param) {
            if (is_var(name, param) && inStrictMode) throwError(name + " is a got duplicate identifier in variable scope ");
            varEnv[name] = param;
        }

        function is_var(name, param) { // check var env
            return Object.hasOwnProperty.call(varEnv, name) && (varEnv[name] === param);
        }

        function is_lex(name, param) { // check local
            return Object.hasOwnProperty.call(lexEnv, name) && (lexEnv[name] === param);
        }

        function bound_lex() {
            var boundNames = [];
            for (var v in lexEnv) {
                if (!Object.hasOwnProperty.call(lexEnv, v)) boundNames.push(v);
            }
            return boundNames;
        }

        function bound_var() {
            var boundNames = [];
            for (var v in varEnv) boundNames.push(v);
            return boundNames;
        }

        return {
            new_var: new_var_scope, // var +& lex
            new_lex: new_lex_scope, // lex
            old_scope: old_scope,
            add_lex: add_lex,
            add_var: add_var,
            is_var: is_var,
            is_lex: is_lex,
            bound_lex: bound_lex,
            bound_var: bound_var,
            constructor: SymbolTable
        };

    }

    /* 
     *
     */

    // ========================================================================================================
    // debug the parser
    // ========================================================================================================

    // parserdebug
    var debugmode = false;

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

    /*
	function newNodeId() {
		var id = ""+Math.random();
		if (tokenTable[id]) id = newNodeId();
		return id;
	}
*/

    // ========================================================================================================
    // Node
    // ========================================================================================================

    var nodeId = 1;

    function Node(type /*, linkToken*/ ) {
        var node = Object.create(null);
        node.ID = ++nodeId;
        contains.add(type);

        /*	
		node._oid_ = newNodeId();
		tables.tokenTable[node._oid_] = node;
		
		if (linkToken) {
			node._rid_ = linkToken._oid_;
					linkToken._rid_ = node._oid_;
		}
		*/

        if (typeof type === "object") {
            for (var k in type) {
                if (Object.hasOwnProperty.call(type, k)) node[k] = type[k];
            }

        } else {
            node.type = type;
        }

        //if (!node.loc) node.loc = makeLoc();
        return node;
    }

    function stringifyTokens(array) {
        //        return array.join("");
        var string = "";
        for (var i = 0, j = array.length; i < j; i++) {
            string += array[i].value;
        }
        return string;
    }

    // ========================================================================================================
    // lookahead functions
    // ========================================================================================================

    function righthand(tokens, i) {
        var rhs; // = " ";
        var b = 0;
        var t;
        ltNext = false;
        do {
            b++;
            t = tokens[i + b];
            if (t === undefined) return undefined;
            rhs = t.value;
            if (WhiteSpaces[rhs[0]]) continue;
            rhst = t.type;
            if (LineTerminators[rhs]) ltNext = true;
        } while (WhiteSpaces[rhs[0]]);
        return rhs;
    }

    function error(err) {
        throw err;
    }

    function unquote(str) {
        return ("" + str).replace(/^("|')|("|')$/g, ""); //'
    }

    function build(node) {
        if (!compile) return node;
        var type = node.type;
        var work = builder[type];
        return work(node);
    }

    function rotate_binexps(node) {
        var right = node.right,
            rightOp = right && right.operator,
            tmp;
        if (right.type !== "UnaryExpression" && rightOp) {
            if ((OperatorPrecedence[rightOp] || Infinity) < (OperatorPrecedence[node.operator] || Infinity)) {
                tmp = node;
                node = node.right;
                tmp.right = node.left;
                node.left = tmp;
            }
        }
        return node;
    }

    // ========================================================================================================
    // source locations
    // ========================================================================================================

    function makeLoc(start, end) {
        return {
            start: start || {},
            end: end || {}
        };
    }

    function resetVariables(t) {
        ast = null;
        line = 1;
        column = 0;

        if (typeof t === "string") t = tokenize(t);
        tokens = t || [];
        makeNodeAndSymbolTables();

        i = -1;
        j = tokens.length;
        T = v = t = undefined;
        rhs = rhst = undefined;
    }

    // ========================================================================================================
    // skip, next, pass, scan, eos
    // ========================================================================================================

    parser.skip = skip;
    parser.next = next;
    parser.scan = scan;

    function scan(C) {
        debug("scan (advance 2 tokens): " + C);
        if (rhs === C) next();
        else syntaxError(C);
        next();
        return C;
    }

    function advance(C) {
        debug("advance (advance 1 token): " + C);
        if (rhs === C) next();
        else syntaxError(C);
    }

    function pass(C) {
        debug("pass this token: " + C);
        if (v === C) next();
        else syntaxError(C);
    }

    function skip(C) {
        if (v === C) {
            debug("skipped: " + C);
            next();
            return true;
        } else {
            debug("cant skip: " + C + " /at " + v);
            return false;
        }
    }

    function eos() {
        return i >= j;
    }

    var lastloc;

    function next(goal) {

        if (i < j) {

            lhs = T;
            i += 1;

            lastloc = loc;

            lparen = false;
            rparen = false;

            T = tokens[i] || {};

            if (T) {

                t = T.type;
                if (SkipableWhiteSpace[t]) {
                    return next();
                }

                v = T.value;
                loc = T.loc;

                if (loc && loc.start) {
                    line = loc.start.line;
                    column = loc.start.column;
                } else {
                    line = -1;
                    column = -1;
                }
            } else {
                t = v = undefined;
            }

            rhs = righthand(tokens, i);

            return T;

        } else if (i == j) {
            T = v = t = undefined;
            return false;
        }

        throw error(new RangeError("parse: next(): Unexpected end. Mean called once to often. Should stop on j = length."));
    }

    // ========================================================================================================
    // Literals, Identifier
    // ========================================================================================================

    parser.Literal = Literal;

    function Literal() {
        var node;
        if (IsAnyLiteral[t]) {
            node = Node(t);
            node.details = T.details;
            node.value = v;
            debug("Literal packed " + v);
            node.computed = T.computed;
            node.loc = makeLoc(loc && loc.start, loc && loc.end);
            pass(v);
            if (compile) return builder[node.type](node.value, loc);
            return node;
        }
        return null;
    }

    function Identifier() {

        if (t === "Identifier" || (v === "yield" && yieldIsId) || (v === "default" && defaultIsId)) {

            var node = Node("Identifier");
            node.name = v;
            node.loc = T.loc;

            debug("Identifier packed " + v);

            pass(v);

            if (compile) return builder["identifier"](node.name, loc);
            return node;
        }
        return null;
    }

    parser.Identifier = Identifier;
    parser.ClassExpression = ClassExpression;
    parser.TemplateLiteral = TemplateLiteral;

    function ClassExpression() {
        if (v === "class") {
            // Einfach gemacht.
            var isExpr = true;
            var node = this.ClassDeclaration(isExpr);
            return node;
        }
        return null;
    }

    function TemplateLiteral() {
        if (t === "TemplateLiteral") {
            var l1, l2;
            l1 = loc && loc.start;
            var node = Node("TemplateLiteral");
            node.value = v;
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            pass(v);
            return compile ? builder["templateLiteral"](node.value, node.loc) : node;
        }
        return null;
    }
    parser.Elision = Elision;

    function Elision(node) {
        if (v === ",") {
            var l1, l2;
            if (node) {
                node.width += 1;
                if (node.loc) {
                    node.loc.end = loc && loc.end;
                }

            } else {
                node = Node("Elision");
                node.width = 1;
                l1 = loc && loc.start;
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
            }
            pass(v);
            return compile ? builder["elision"](node.value, node.loc) : node;
        }
        return null;
    }

    parser.ElementList = ElementList;

    function ElementList() {
        var list = [],
            el;

        do {

            if (v === "," && rhs == ",") {
                el = null;
                do {
                    el = this.Elision(el);
                } while (v === ",");
                list.push(el);
            }

            if (v === "]") break;

            el = this.SpreadExpression() || this.AssignmentExpression();
            list.push(el);

            if (v === ",") {
                if (rhs !== ",") pass(",");
                continue;
            } else if (v !== "]") {
                throwError(new SyntaxError("buggy element list"));
            }

        } while (v && v !== "]");

        return list;
    }
    parser.ArrayExpression = ArrayExpression;

    function ArrayExpression() {
        var node, l1, l2;
        if (v === "[") {
            l1 = loc && loc.start;

            if (rhs === "for") return this.ArrayComprehension();

            pass("[");

            var node = Node("ArrayExpression");

            if (v !== "]") node.elements = this.ElementList(node);
            else node.elements = [];

            l2 = loc && loc.end;
            pass("]");
            node.loc = makeLoc(l1, l2);
            return compile ? builder["arrayExpression"](node.elements, node.loc) : node;
        }
        return null;
    }



    parser.StrictFormalParameters = StrictFormalParameters;
    function StrictFormalParameters() {
        return this.FormalParameterList.apply(this, arguments);
    }
    parser.PropertyDefinitionList = PropertyDefinitionList;


    parser.ComputedPropertyName = ComputedPropertyName;
    function ComputedPropertyName() {
        var propertyName;
        if (v === "[") {
            pass("[");
            propertyName = this.AssignmentExpression("]");
            pass("]");
            return propertyName;
        } 
        return null;
    }

    parser.PropertyKey = PropertyKey;
    function PropertyKey() {
        var node;
        node = /*this.ComputedPropertyName() ||*/ this.Identifier() || this.Literal();
        if (!node && (Keywords[v])) {
            node = Node("Identifier");
            node.name = v;
            node.loc = T && T.loc;
        }
        if (node) return node;
        throwError(new SyntaxError("invalid property key in definition list"));
        return null;
    }

    function PropertyDefinitionList(parent) {
        var list = [];
        list.type = "PropertyDefinitionList";
        var id;
        var node, hasAsterisk, computedPropertyName; // p ist hier der node-name (renamen)

        do {

            if (v == "}") break;

            if ((v === "get" || v === "set") && rhs !== ":" && rhs !== "(") {

                node = Node("PropertyDefinition");
                node.kind = v;
                var method = this.MethodDefinition(parent, true);
                if (!method) throwError(new SyntaxError("Error parsing MethodDefinition in ObjectExpression"));
                node.key = method.id;
                node.value = method;
                list.push(node);

            } else {

                /* 
                    This has to be cleaned up. I did today, and removed the double method, the double "init", the computedPropertyName,
                    and used PropertyKey() for both. It looked nice and clean. But it failed. So i restored it for now. I want to write
                    it again (from scratch), but tomorrow.
                */

                
                if (v === "[") {
                    computedPropertyName = this.ComputedPropertyName();
                } else computedPropertyName = undefined;

                if (v === "*" || computedPropertyName || (BindingIdentifiers[t] || v === "constructor")) { //*[ Id
                    
                    node = Node("PropertyDefinition");

                    if ((rhs === "," || rhs === "}") && (BindingIdentifiers[t] || v === "constructor")) { // {x,y}
                        
                        node.kind = "init";
                        id = this.PropertyKey();
                        if (!id) throwError(new SyntaxError("error parsing objectliteral shorthand"))
                        node.key = id;
                        node.value = id;
                        list.push(node);

                    } else if (computedPropertyName && v === ":") { // [s]:
                        
                        node.kind = "init";
                        node.key = computedPropertyName;
                        node.computed = true;
                        pass(":");
                        node.value = this.AssignmentExpression();
                        if (!node.value) throwError(new SyntaxError("error parsing objectliteral := [symbol_expr]: assignmentexpression"))
                        list.push(node);

                    } else if (rhs === ":") { // key: AssignmentExpression
                        
                        node.kind = "init";
                        node.key = this.PropertyKey();
                        pass(":");
                        node.value = this.AssignmentExpression();
                        if (!node.value) throwError(new SyntaxError("error parsing objectliteral := propertykey : assignmentexpression"))
                        list.push(node);

                    } else if (computedPropertyName && v == "(") {

                        node.kind = "method";    
                        var method = this.MethodDefinition(parent, true, computedPropertyName);
                        if (!method) throwError(new SyntaxError("Error parsing method definition in ObjectExpression."));
                        node.key = method.id;
                        node.computed = method.computed;
                        node.value = method;
                        list.push(node);                        

                    } else if (((BindingIdentifiers[t] || v === "constructor") && rhs === "(") || (v === "*" && (rhs == "[" || BindingIdentifiers[rhst] || rhs === "constructor"))) {

                        node.kind = "method";    
                        var method = this.MethodDefinition(parent, true);
                        if (!method) throwError(new SyntaxError("Error parsing method definition in ObjectExpression."));
                        node.key = method.id;
                        node.computed = method.computed;
                        node.value = method;
                        list.push(node);
                    }

                }
            }
            computedPropertyName = undefined;
            
            if (v === ",") {
                pass(",");
            } else break;

        } while (v !== "}" && v != undefined);
        return list;
    }


    parser.ObjectExpression = ObjectExpression;

    function lookForEqualSignBehindBracesBeforeUsingTheObjectCoverGrammarForThis() {
        var tok;
        var typ;
        var parens = [];

        for (var y = i; y < j; y++) {
            if (tok = tokens[y]) {
                var v = tok.value;
                if (v == "{") {
                    parens.push("{");
                } else if (v === "}") {
                    parens.pop();
                    if (!parens.length) {
                        do {
                            if (tok = tokens[++y]) {
                                if (tok.value === "=") {
                                    return true;
                                } else if (tok.type === "WhiteSpace") continue;
                                else return false;
                            } else return false;
                        } while (1);
                    }
                }
            }
        }
        return false;
    }

    function ObjectExpression() {
        var node, l1, l2;
        if (v === "{") {

            if (!lookForEqualSignBehindBracesBeforeUsingTheObjectCoverGrammarForThis()) {

                l1 = loc && loc.start;
                node = Node("ObjectExpression");
                node.properties = [];
                pass("{");

                node.properties = this.PropertyDefinitionList();

                l2 = loc && loc.end;

                pass("}");

                node.loc = makeLoc(l1, l2);
                EarlyErrors(node);

                return compile ? builder["objectExpression"](node.properties, node.loc) : node;

            } else {
                return this.BindingPattern();
            }

        }
        return null;
    }
    parser.MemberExpression = MemberExpression;

    function MemberExpression(parent) {
        var obj, node, l1, l2;

        if (parent) obj = parent;
        else obj = this.PrimaryExpression();

        if (obj) {
            l1 = obj.loc && obj.loc.start;

            var node = Node("MemberExpression");
            node.object = obj;

            if (v === "TemplateLiteral") return this.CallExpression(obj);
            else if (v === "[") {

                pass("[");
                node.computed = true;
                node.property = this.AssignmentExpression();
                pass("]");

            } else if (v === ".") {

                pass(".");
                node.computed = false;

                if (t === "Identifier" || t === "Keyword" || propKeys[v] || t === "NumericLiteral") {
                    var property = Object.create(null);
                    property.type = "Identifier";
                    property.name = v;
                    property.loc = T.loc
                    node.property = property;
                } else {

                    throwError(new SyntaxError("MemberExpression . Identifier expects a valid IdentifierString or an IntegerString as PropertyKey."));
                }

                pass(v);

            } else return node.object;

            if (v == "[" || v == ".") return this.MemberExpression(node);
            else if (v == "(") return this.CallExpression(node);
            else if (t == "TemplateLiteral") return this.CallExpression(node);

            EarlyErrors(node);
            if (compile) return builder["memberExpression"](node.object, node.property, node.computed, node.loc);
            l2 = loc && loc.end;

            node.loc = makeLoc(l1, l2);
            return node;
        }
        return null;
    }

    function Arguments() {
        var args, arg;
        if (v === "(") {

            pass("(");
            args = [];

            if (v !== ")")
                do {

                    if (v === ")") break;

                    arg = this.SpreadExpression() || this.AssignmentExpression();
                    if (arg) args.push(arg);
                    if (v === ",") {
                        pass(",");
                        continue;
                    }

                    //else if (v !== ")") {
                    //    throwError(new SyntaxError("Error parsing the argument list of a call expression"));
                    //}

                } while (v !== undefined && i < j);

            pass(")");
            return args;
        }
        return null;
    }
    parser.Arguments = Arguments;

    function CallExpression(parent) {

        var node, tmp, l1, l2;
        l1 = l2 = (loc && loc.start);

        if (parent) tmp = parent;
        else tmp = this.MemberExpression();

        if (tmp) {
            l1 = tmp.loc && tmp.loc.start;

            node = Node("CallExpression");
            node.callee = tmp;
            node.arguments = null;

            if (t === "TemplateLiteral") {

                node.arguments = [this.TemplateLiteral()];
                l2 = loc && loc.end;

                node.loc = makeLoc(l1, l2);
                if (compile) return builder.callExpression(node.callee, node.arguments, node.loc);
                return node;
            } else if (v === "(") {

                node.arguments = this.Arguments();

                if (v === "(") {
                    // ..()()()

                    l2 = loc && loc.end;
                    node.loc = makeLoc(l1, l2);
                    return this.CallExpression(node);

                } else if (v === "[" || v == ".") {

                    // ..[][][] x.y.z.a.b
                    l2 = loc && loc.end;
                    node.loc = makeLoc(l1, l2);
                    return this.MemberExpression(node);

                } else {

                    l2 = loc && loc.end;
                    node.loc = makeLoc(l1, l2);
                    if (compile) return builder.callExpression(node.callee, node.arguments, node.loc);
                    return node;
                }

            } else {

                return node.callee;
            }

        }
        return null;
    }
    parser.CallExpression = CallExpression;
    parser.NewExpression = NewExpression;

    function NewExpression() {
        var node, l1, l2;

        if (v === "new") {

            l1 = loc && loc.start;
            l2 = loc && loc.end;
            node = Node("NewExpression");
            pass("new");

            if (v === "new") node.callee = this.NewExpression();
            else {

                var callee = this.CallExpression();
                if (callee && callee.type === "CallExpression") {
                    node = callee;
                    node.type = "NewExpression";
                } else node.callee = callee;
            }

            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);
            if (compile) return builder.newExpression(node.callee, node.arguments, node.loc);
            return node;
        }
        return null;
    }

    function LeftHandSideExpression() {
        return this.NewExpression() || this.CallExpression();
    }

    /*

 - ( GeneratorComprehension )
 abkuerzung fuer eine (function * () { for (k of a) yield k; }());

*/

    parser.ComprehensionForList = ComprehensionForList;

    function ComprehensionForList() {
        var list = [], el, binding, ae;
        while (v === "for") {
            pass("for");
            pass("(");
            binding = this.ForBinding();
            pass("of");
            ae = this.AssignmentExpression();
            var block = Node("ComprehensionBlock");
            block.left = binding;
            block.right = ae;
            list.push(block);
            pass(")");
        }
        return list.length ? list : null;
    }

    parser.ComprehensionFilters = ComprehensionFilters;

    function ComprehensionFilters() {
        var list = []
        while (v == "if") {
            pass("if");
            pass("(");
            list.push(this.AssignmentExpression());
            pass(")");
        }
        return list.length ? list : null
    }

    parser.ArrayComprehension = ArrayComprehension;

    function ArrayComprehension() {
        var node, blocks, filter;

        if (v === "[") {
            var l1, l2;
            l1 = loc && loc.start;
            node = Node("ArrayComprehension");
            node.blocks = [];
            node.filter = [];
            pass("[");
            while (v === "for") {
                blocks = this.ComprehensionForList();
                if (blocks) node.blocks = node.blocks.concat(blocks);
                filter = this.ComprehensionFilters();
                if (filter) node.filter = node.filter.concat(filter);
            }
            node.expression = this.AssignmentExpression();
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            pass("]");
            EarlyErrors(node);
            if (compile) return builder.comprehensionExpression(node.blocks, node.filter, node.expression, node.loc);
            return node;
        }
        return null;
    }

    parser.GeneratorComprehension = GeneratorComprehension;

    function GeneratorComprehension() {
        var node;

        if (v === "(") {
            var l1, l2;
            l1 = loc && loc.start;

            node = Node("GeneratorComprehension");

            pass("(");

            node.blocks = this.ComprehensionForList();
            node.filter = [];
            while (v == "if") {
                pass("if");
                node.filter.push(this.Expression());
            }

            node.expression = this.AssignmentExpression();

            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);
            return node;
        }
        return null;

    }

    parser.ExpressionStatement = ExpressionStatement;

    function ExpressionStatement(expr, l1, l2) {
        var node = Node("ExpressionStatement");
        node.expression = expr;
        node.loc = makeLoc(l1, l2);
        return node;
    }

    parser.SequenceExpression = SequenceExpression;

    function SequenceExpression(list, l1, l2) {
        var node = Node("SequenceExpression");
        node.sequence = list;
        node.loc = makeLoc(l1, l2);
        return node;
    }

    parser.Expression = Expression;

    function Expression(stop, parenthesised) {

        var list = [];
        var node;
        var ae;
        var l1 = loc && loc.start;
        var l2;

        var hasStop = typeof stop === "string";

        if (!parenthesised && (ExprNoneOfs[v] || (v === "let" && rhs === "["))) return null;

        do {
            debug("expr at " + v);
            if (hasStop && v === stop) break;
            ae = this.AssignmentExpression();
            if (ae) list.push(ae);
            if (hasStop && v === stop) break;

            if (v === ",") {
                pass(",");
                continue;
            } else break;

        } while (i < j && v !== undefined);

        l2 = loc && loc.end;

        switch (list.length) {
        case 0:
            return null;
            break;
        case 1:
            node = list[0];
            return this.ExpressionStatement(node, l1, l2);
            break;
        default:
            node = this.SequenceExpression(list, l1, l2);
            if (parenthesised) return this.ExpressionStatement(node, l1, l2);
            else return node;
        }
    }

    parser.ExpressionNoIn = ExpressionNoIn;

    function ExpressionNoIn() {
        noInStack.push(isNoIn);
        isNoIn = true;
        var node = this.Expression();
        isNoIn = noInStack.pop();
        return node;
    }

    parser.AssignmentExpressionNoIn = AssignmentExpressionNoIn;

    function AssignmentExpressionNoIn(parent) {

        noInStack.push(isNoIn);
        isNoIn = true;

        var node = this.AssignmentExpression(parent);

        isNoIn = noInStack.pop();
        return node;
    }

    parser.ParenthesizedExpression = ParenthesizedExpression;

    function ParenthesizedExpression() {
        return this.Expression(undefined, true);
    }

    parser.CoverParenthesizedExpression = CoverParenthesizedExpression;

    function CoverParenthesizedExpression(tokens) {
        var expression = parseGoal("ParenthesizedExpression", tokens);
        return expression;
    }

    parser.ArrowParameterList = ArrowParameterList;

    function ArrowParameterList(tokens) {
        var formals = parseGoal("FormalParameterList", tokens);
        return formals;
    }

    parser.CoverParenthesisedExpressionAndArrowParameterList = CoverParenthesisedExpressionAndArrowParameterList;

    function CoverParenthesisedExpressionAndArrowParameterList() {

        var parens = [];
        var covered = [];
        var cover = false;
        var expr, node, l1, l2;
        l1 = loc && loc.start;

        if (t === "Identifier" && rhs === "=>") {

            expr = this.Identifier();
            cover = true;

        } else if (v === "(") {
            if (rhs === "for") return this.GeneratorComprehension();

            cover = true;

            parens.push(v);

            while (next()) {

                if (v === "(") {
                    parens.push(v);
                } else if (v === ")") {
                    parens.pop();
                    if (!parens.length) {
                        covered.push(T);
                        break;
                    }
                }
                covered.push(T);
            }
 
           if (i >= j) throwError(new SyntaxError("no tokens left over covering expression"));

            pass(")");

        }

        if (cover) {

            if (v === "=>") {
                node = Node("ArrowExpression");
                node.kind = "arrow";
                node.strict = true;
                node.expression = true;
                node.params = (expr ? [expr] : this.ArrowParameterList(covered));
                pass("=>");
                node.body = this.ConciseBody(node);
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                EarlyErrors(node);
                if (compile) return builder.arrowExpression(node.params, node.body, node.loc);
                return node;

            } else {
                return this.CoverParenthesizedExpression(covered);
            }
        }
        return null;
    }

    parser.ConciseBody = ConciseBody;

    function ConciseBody(parent) {
        if (v == "{") {
            var body;
            yieldStack.push(yieldIsId);
            yieldIsId = true;
            pass("{");
            body = this.FunctionBody(parent);
            pass("}");
            yieldIsId = yieldStack.pop();
            return body;
        }
        return this.AssignmentExpression();
    };

    function PrimaryExpression() {
        var fn, node;
        debug("primary at " + v);
        fn = this[PrimaryExpressionByValue[v]];
        if (!fn) fn = this[PrimaryExpressionByType[t]];
        if (!fn && yieldIsId && v === "yield") fn = this.YieldAsIdentifier;
        if (!fn && defaultIsId && v === "default") fn = this.DefaultAsIdentifier;
        if (fn) node = fn.call(this);
        if (node) return node;
        return null;
    }

    parser.YieldExpression = YieldExpression;
    parser.YieldStatement = YieldExpression;

    parser.DefaultAsIdentifier = DefaultAsIdentifier;

    function DefaultAsIdentifier() {
        if (v === "default") {
            if (defaultIsId) {
                var node = Node("Identifier");
                node.name = "default";
                node.loc = T && T.loc;
                pass("default");
                return node;
            }
        }
        return null;
    }

    parser.YieldAsIdentifier = YieldAsIdentifier;

    function YieldAsIdentifier() {
        if (v === "yield") {
            if (yieldIsId) {
                var node = Node("Identifier");
                node.name = "yield";
                node.loc = T && T.loc;
                pass("yield");
                return node;
            }
        }
        return null;
    }

    function YieldExpression(parent) {
        if (v === "yield") {
            if (!yieldIsId) {
                pass("yield");
                var node = Node("YieldExpression");
                node.parent = parent;
                node.argument = this.Expression(";");
                return node;
            }
        }
        return null;
    }

    function PostfixExpression(lhs) {
        var l1 = loc && loc.start;
        lhs = lhs || this.LeftHandSideExpression();
        if (lhs) debug("got lhs " + lhs.type);
        if (lhs && UpdateOperators[v]) {
            var node = Node("UnaryExpression");
            node.operator = v;
            node.prefix = false;
            node.argument = lhs;
            node.loc = makeLoc(l1, loc && loc.end);
            pass(v);
            return node;
        }
        return lhs;
    }

    function UnaryExpression() {
        if (UnaryOperators[v] || UpdateOperators[v]) {
            var l1 = loc && loc.start;
            var node = Node("UnaryExpression");
            node.operator = v;
            node.prefix = true;
            pass(v);
            node.argument = this.PostfixExpression();
            var l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;
        }
        return this.PostfixExpression();
    }

    parser.ConditionalExpressionNoIn = ConditionalExpressionNoIn;

    function ConditionalExpressionNoIn(left) {
        noInStack.push(isNoIn);
        isNoIn = true;
        var r = this.ConditionalExpression(left);
        isNoIn = noInStack.pop();
        return r;
    }
    parser.ConditionalExpression = ConditionalExpression;

    function ConditionalExpression(left) {
        if (left && v === "?") {
            var l1 = loc && loc.start,
                l2;
            var node = Node("ConditionalExpression");
            node.test = left;
            pass("?");
            node.consequent = this.AssignmentExpression();
            pass(":");
            node.alternate = this.AssignmentExpression();
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;
        }
        return null;
    }

    parser.LeftHandSideExpression = LeftHandSideExpression;
    parser.ExpressionStatement = ExpressionStatement;
    parser.Expression = Expression;
    parser.PrimaryExpression = PrimaryExpression;
    parser.PostfixExpression = PostfixExpression;
    parser.UnaryExpression = UnaryExpression;

    parser.AssignmentExpression = AssignmentExpression;

    function AssignmentExpression(parent) {

        var node = null,
            leftHand, l1, l2;

        l1 = loc && loc.start;
        debug("At assignmentexpression with " + t + ", " + v);

        if (!yieldIsId && v === "yield") node = this.YieldExpression(parent);
        if (!node) node = this.CoverParenthesisedExpressionAndArrowParameterList();

        if (!node) leftHand = this.UnaryExpression();
        else leftHand = node;

        if (!leftHand) return null;
        if (v === undefined) return leftHand;
        if ((isNoIn === true && InOrOf[v])) return leftHand;
        if (v === "," || ExprEndOfs[v]) return leftHand;

        if (t !== "Punctuator" && !InOrOfInsOf[v]) {
            // throwError(new SyntaxError("can not parse expression"));
            return leftHand;
        }

        if (v === "?") {
            node = this.ConditionalExpressionNoIn(leftHand);
            return node;
        }

        // Fixing the recursion to lhs upwards again
        if (v === "." || v === "[") leftHand = this.MemberExpression(leftHand);
        else if (v === "(" || v === "`") leftHand = this.CallExpression(leftHand);
        else if (v == "++" || v == "--") leftHand = this.PostfixExpression(leftHand);

        if (AssignmentOperators[v] && (!isNoIn || (isNoIn && v != "in"))) {

            node = Node("AssignmentExpression");
            node.goal = PunctToExprName[v];
            node.operator = v;
            node.left = leftHand;

            debug(v);
            pass(v);

            node.right = this.AssignmentExpressionNoIn(node);
            if (!node.right) throwError(new SyntaxError("can not parse a valid righthandside for this assignment expression"));

            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;

        } else if (BinaryOperators[v] && (!isNoIn || (isNoIn && v != "in"))) {

            // FollowSet fuer den BinaryOperator ?

            node = Node("BinaryExpression");
            node.goal = PunctToExprName[v];
            node.operator = v;
            node.left = leftHand;

            debug(v);
            pass(v);

            node.right = this.AssignmentExpression(node);
            if (!node.right) throwError(new SyntaxError("can not parse a valid righthandside for this binary expression"));

            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);

            node = rotate_binexps(node);
            return node;

        } else {
            return leftHand;
        }
    }

    parser.SuperExpression = SuperExpression;

    function SuperExpression(parent) {
        if (v === "super") {
            var l1 = loc && loc.start;
            var node = Node("SuperExpression");
            node.loc = makeLoc(l1, l1);
            pass("super");
            if (compile) return builder.superExpression(node.home, node.method, node.loc);
            return node;
        }
        return null;
    }
    parser.ThisExpression = ThisExpression;

    function ThisExpression() {
        if (v === "this") {
            var l1 = loc && loc.start;
            var node = Node("ThisExpression");
            node.loc = makeLoc(l1, l1);
            pass("this");
            if (compile) return builder.thisExpression(node.loc);
            return node;
        }
        return null;
    }

    parser.Initialiser = Initialiser;

    function Initialiser() {
        if (v === "=") {
            pass("=");
            var expr = this.AssignmentExpression();
            return expr;
        }
        return null;
    }

    // hier ist binding elements
    parser.BindingElementList = BindingElementList;
    parser.BindingPattern = BindingPattern;

    function BindingElementList() {
        var list = [];
        var id, n, l1, l2;
        if (v === "{") {

            pass("{");

            while (v !== "}") {

                if (StartBinding[v]) id = this.BindingPattern();
                else id = this.Identifier();

                if (v === ":") {
                    l1 = id.loc && id.loc.start;
                    n = Object.create(null);
                    n.type = "BindingElement";
                    n.id = id;
                    pass(":");
                    n.as = this.Identifier();
                    l2 = loc && loc.end;
                    n.loc = makeLoc(l1, l2);

                    ident.add_lex(n.as.name);
                    list.push(n);
                } else {

                    ident.add_lex(id.name);
                    list.push(id);
                }

                if (v === ",") {
                    pass(",");
                    if (v === "}") break;
                    continue;
                }
                //else if (v !== "}") throwError(new SyntaxError("illegal statement in binding element list"));
            }

            pass("}");
        } else if (v === "[") {
            pass("[");
            while (v !== "]") {
                if (v === "...") id = this.RestParameter();
                else if (StartBinding[v]) id = this.BindingPattern();
                else id = this.Identifier();
                if (id) list.push(id);

                if (v === ",") {
                    pass(",");
                    if (v === "]") break;
                    continue;
                }
                //else if (v !== "]") throwError(new SyntaxError("illegal statement in binding pattern"));
            }
            pass("]");
        }
        return list;
    }
    parser.BindingPattern = BindingPattern;

    var PatternName = {
        __proto__: null,
        "{": "ObjectPattern",
        "[": "ArrayPattern"
    };

    function BindingPattern() {
        var node, l1, l2;
        if (StartBinding[v]) {
            l1 = loc && loc.start;
            node = Node(PatternName[v]);
            node.elements = this.BindingElementList();
            if (v === "=") node.init = this.Initialiser();
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);
            if (compile) return builder.bindingPattern(node.type, node.elements, node.init, node.loc);
            return node;
        }
        return null;
    }
    parser.VariableDeclaration = VariableDeclaration;

    function VariableDeclaration(kind) {

        var node = this.BindingPattern();

        if (node) {
            node.kind = kind;
            return node;
        }

        if (t === "Identifier" || (v === "yield" && yieldIsId) || (v === "default" && defaultIsId)) {

            node = Node("VariableDeclarator");
            node.kind = kind;

            var id = this.Identifier();
            node.id = id.name;

            if (kind == "var") ident.add_var(id.name);
            else ident.add_lex(id.name);

            if (v === "=") node.init = this.Initialiser();
            else if (v === ",") node.init = null;
            else if (v === ";") node.init = null;
            else if (v === "in" || v === "of") node.init = null;
            return node;
        }

        return null;
    }
    parser.VariableDeclarationList = VariableDeclarationList;

    function VariableDeclarationList(kind) {
        var list = [];
        var decl;
        while (i < (j - 1)) {

            decl = this.VariableDeclaration(kind);
            if (decl) list.push(decl);
            if (isNoIn && InOrOf[v]) break;

            if (v === ",") {
                pass(",");
                continue;
            } else if (v === ";") {
                break;
            } else if (v === undefined) break;

        }
        return list;
    }
    parser.VariableStatement = VariableStatement;

    var LetOrConst = {
        __proto__: null,
        "let": true,
        "const": true
    };

    function VariableStatement() {
        var node, decl, l1, l2;
        if (v === "var" || v === "let" || v === "const") {
            l1 = loc && loc.start;
            node = Node("VariableDeclaration");
            node.declarations = [];
            node.kind = v;
            if (LetOrConst[v]) node.type = "LexicalDeclaration";
            pass(v);
            node.declarations = this.VariableDeclarationList(node.kind);
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);
            if (compile) return builder["variableStatement"](node.kind, node.declarations, node.loc);
            return node;
        }
        return null;
    }

    parser.MethodDefinition = MethodDefinition;

    function MethodDefinition(parent, isObjectMethod, computedPropertyName) {
        
        var l1, l2;
        var node;
        var isStaticMethod = false;
        var isGenerator = false;
        var init = false;
        var isGetter = false;
        var isSetter = false;
        var isComputedPropertyKey = false;

        if (v === "}") return null;

        l1 = loc && loc.start;

        if (v === ";") {
            if (!isObjectMethod) pass(";");
        } 

        if (v === "static" && !isObjectMethod) {
            isStaticMethod = true;
            pass(v);
        }

        if (v === "*") {
            isGenerator = true;
            pass(v);
        } else if (v === "get") {
            isGetter = true;
            pass(v);
            // get c() {}
        } else if (v === "set") {
            isSetter = true;
            pass(v);
            // set c() {}
        }


        if ((v == "[" || computedPropertyName) || MethodKeyByType[t] || v === "constructor") {

            if (v == "[" && !computedPropertyName) {
                computedPropertyName = this.ComputedPropertyName();
                if (!computedPropertyName) throwError("can not parse [computed] methoddefinition key");
            }

            if ((computedPropertyName && v ==="(") || rhs === "(" ) {

                node = Node("MethodDefinition");
                if (computedPropertyName) {
                    node.id = computedPropertyName
                    node.computed = true;
                } else {
                    node.id = v;
                    pass(v);
                }

                node.generator = isGenerator;
                if (!isObjectMethod) node.static = isStaticMethod;
                
                if (isGetter) node.kind = "get";
                if (isSetter) node.kind = "set";
                pass("(");
                node.params = this.FormalParameterList();
                pass(")");
                pass("{");
                node.body = this.FunctionBody(node);
                pass("}");
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                EarlyErrors(node);
                if (compile) return builder.methodDefinition(node.id, node.params, node.body, node.strict, node.static, node.generator, node.loc);
                return node;

            } else if (((computedPropertyName && v === "=") || rhs === "=") && !isObjectMethod) {    

                node = Node("PropertyDefinition");
                if (computedPropertyName) {
                    node.id = computedPropertyName
                    node.computed = true;
                } else {
                    node.id = v;
                    pass(v);
                }
                node.static = isStatic;
                pass("=");
                node.value = this.AssignmentExpression();
                l2 = loc && loc.end;
                node.loc = makeLoc(l1, l2);
                if (compile) return builder.propertyDefinition(node.id, node.static, node.value, node.loc);
                return node;
            }
        }
        return null;
    }

    parser.ClassDeclaration = ClassDeclaration;

    function ClassDeclaration(isExpr) {
        var node, m;
        if (v === "class") {

            pushState("class");
            ident.new_var();

            node = Node("ClassDeclaration");
            node.id = null;
            node.expression = !! isExpr;
            node.extends = null;
            node.elements = [];

            pass("class");
            var id = this.Identifier();
            node.id = id.name;

            if (v === "extends") {
                pass("extends");
                node.extends = this.AssignmentExpression();
            }

            pass("{");
            while (v !== "}") {

                m = this.MethodDefinition(node);
                node.elements.push(m);
            }

            pass("}");
            ident.old_scope();
            popState();
            if (compile) return builder["classExpression"](node.id, node.extends, node.elements, node.loc);
            return node;
        }
        return null;
    }

    parser.RestParameter = RestParameter;

    function RestParameter() {
        if (v === "...") {
            var l1 = loc && loc.start;
            pass("...");
            var node = Node("RestParameter");
            node.id = v;

            ident.add_lex(v);

            pass(v);
            var l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return builder["restParameter"](node.id, node.loc);
            return node;
        }
        return null;
    }

    parser.SpreadExpression = SpreadExpression;

    function SpreadExpression() {
        if (v === "...") {
            var l1 = loc && loc.start;
            pass("...");
            var node = Node("SpreadExpression");
            node.argument = this.AssignmentExpression();
            node.loc = makeLoc(l1, node.argument.loc.end);
            if (compile) return builder["spreadExpression"](node.argument, node.loc);
            return node;
        }
        return null;
    }
    parser.DefaultParameter = DefaultParameter;

    function DefaultParameter() { // ES6
        var node;
        if (t == "Identifier" && rhs == "=") {
            var l1 = loc.start;
            node = Node("DefaultParameter");
            var id = this.Identifier();
            node.id = id.name;
            pass("=");
            node.init = this.AssignmentExpression();
            node.loc = makeLoc(l1, loc && loc.end);
            if (compile) return builder["defaultParameter"](node.id, node.init, node.loc);
            return node;
        }
        return null;
    }

    parser.FormalParameterList = FormalParameterList;

    function FormalParameterList() {
        var list = [];
        
        list.type = "FormalParameterList";

        var defaults;
        var id;
        var x;
        do {
            if (v) {
                x = i;
                debug("formalparameters calling with " + v);
                if (v === ")") break;

                else if (v === "...") {
                    id = this.RestParameter();
                    list.push(id);
                } else if (StartBinding[v]) {
                    id = this.BindingPattern();
                    if (id) list.push(id);
                } else if (t === "Identifier") {
                    if (rhs == "=") {
                        id = this.DefaultParameter();
                    } else {
                        id = this.Identifier();
                        ident.add_lex(id.name);
                    }
                    if (id) list.push(id);
                }

                if (v === ",") {
                    pass(",");
                    continue;
                }

            }
                if (x == i) break;
        } while (v !== undefined && v !== ")");

        return list;
    }
    parser.FunctionExpression = FunctionExpression;

    function FunctionExpression() {
        return this.FunctionDeclaration(true);
    }
    parser.FunctionBody = FunctionBody;

    function GeneratorBody(parent) {
        yieldStack.push(yieldIsId);
        yieldIsId = false;
        var body = this.FunctionBody(parent);
        yieldIsId = yieldStack.pop();
        return body;
    }
    parser.GeneratorBody = GeneratorBody;

    function FunctionBody(parent) {
        var body = [];
        var node, strict;
        if (v === "}") return body;
        this.DirectivePrologue(parent, body);
        while (v !== undefined && v !== "}") {
            node = this.FunctionDeclaration() || this.ModuleDeclaration() || this.ClassDeclaration() || this.Statement();
            body.push(node);
        }
        return body;
    }

    parser.FunctionDeclaration = FunctionDeclaration;

    function FunctionDeclaration(isExpr) {
        var node, start, end, sourceStart, sourceEnd;

        if (v === "function") {

            defaultStack.push(defaultIsId);
            defaultIsId = true;

            start = loc && loc.start;

            pass("function");

            if (v === "*") {
                node = Node("GeneratorDeclaration");
                node.generator = true;
                pass("*");
            } else {
                node = Node("FunctionDeclaration");
                node.generator = false;
            }
            node.id = null;
            node.params = [];
            node.expression = !! isExpr;
            node.strict = false;
            node.body = [];

            var id;

            if (v !== "(") id = this.Identifier();
            if (id) node.id = id.name;
            else {
                if (!node.expression) {
                    throwError(new SyntaxError("Function and Generator Declarations must have a name [only expressions can be anonymous]"));
                }
            }

            if (id && !isExpr) ident.add_var(id.name);

            ident.new_var();
            contains.new_scope();

            if (id && isExpr) ident.add_var(id.name);

            pass("(");
            node.params = this.FormalParameterList();
            pass(")");

            if (node.generator) {
                yieldStack.push(yieldIsId);
                yieldIsId = true;
            } else {
                yieldStack.push(yieldIsId);
                yieldIsId = false;
            }

            pass("{");
            node.body = this.FunctionBody(node);
            pass("}");

            yieldIsId = yieldStack.pop();
            end = loc && loc.end;
            node.loc = makeLoc(start, end);

            if (node.generator) {
                AddParentPointers(node);
            }
            defaultIsId = defaultStack.pop();

            node.lexNames = ident.bound_lex();
            node.varNames = ident.bound_var();
            ident.old_scope();
            contains.old_scope();

            EarlyErrors(node);
            return node;
        }
        return null;
    }

    function AddParentPointers(node, parent) {
        var n;
        if (Array.isArray(node)) {
            for (var i = 0, j = node.length; i < j; i++) {
                AddParentPointers(node[i], parent);
            }
            return;
        } else {
            for (var k in node) {
                if (Object.hasOwnProperty.call(node, k)) {
                    n = node[k];
                    if (n && typeof n === "object") {
                        if (n.type || Array.isArray(n)) AddParentPointers(n, node);
                    }
                }
            }
            if (node && parent) node.parent = parent;
        }
    }

    parser.BlockStatement = BlockStatement;

    function BlockStatement() {
        if (v === "{") {

            var l1, l2;
            l1 = loc && loc.start;

            ident.new_lex();
            contains.new_scope();

            var node = Node("BlockStatement");

            defaultStack.push(defaultIsId);
            defaultIsId = true;

            pass("{");
            node.body = this.StatementList();
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);

            defaultIsId = defaultStack.pop();
            ident.old_scope();
            contains.old_scope();

            pass("}");
            return node;

        }
        return null;
    }
    parser.BreakStatement = BreakStatement;

    function BreakStatement() {
        if (v === "break") {
            var node, l1, l2;
            l1 = loc && loc.start;
            node = Node("BreakStatement");
            pass("break");
            if (v !== ";") {
                if (ltNext) return node;
                if (t === "Identifier") {
                    var id = this.Identifier();
                    node.label = id.name;
                }
            }
            skip(";");
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;
        }
        return null;
    }
    parser.ContinueStatement = ContinueStatement;

    function ContinueStatement() {
        var node, l1, l2;
        if (v === "continue") {
            node = Node("ContinueStatement");
            l1 = loc && loc.start;
            pass("continue");
            if (v !== ";") {
                if (ltNext) return node;
                if (t === "Identifier") {
                    var id = this.Identifier();
                    node.label = id.name;
                }
            }
            skip(";");
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;
        }
    }
    parser.ReturnStatement = ReturnStatement;

    function ReturnStatement() {
        var node, l1, l2;
        if (v === "return") {
            l1 = loc && loc.start;
            node = Node("ReturnStatement");

            pass("return");

            if (v !== ";") {

                if (ltNext) {
                    l2 = loc && loc.end;
                    node.loc = makeLoc(l1, l2);
                    return node;
                }
                node.argument = this.Expression();

            }
            skip(";");
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
                return node;
        }
        return null;
    }
    parser.WithStatement = WithStatement;

    function WithStatement() {
        if (v === "with") {
            var node = Node("WithStatement");
            var l1 = loc && loc.start;
            pass("with");
            pass("(");
            node.object = this.Expression();
            pass(")");
            if (v !== "{") throwError(new SyntaxError("expecting BlockStatement after with (EXPR)"));
            node.body = this.BlockStatement();
            var l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;
        }
        return null;
    }
    parser.ThrowStatement = ThrowStatement;

    function ThrowStatement() {
        if (v === "throw") {
            var node, l1, l2;
            node = Node("ThrowStatement");
            l1 = loc && loc.start;
            pass("throw");
            if (v !== ";") {
                if (ltNext) return node;
                node.argument = this.Expression();
            } else skip(";");
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;
        }
        return null;
    }
    parser.LabelledStatement = LabelledStatement;

    function LabelledStatement() {
        if (t === "Identifier" && rhs === ":") {
            var node = Node("LabelledStatement");
            var l1 = loc && loc.start;
            var label = this.Identifier();
            node.label = label.name;
            pass(":");
            node.statement = this.Statement();
            var l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);
            return node;
        }
        return null;
    }
    parser.TryStatement = TryStatement;

    function TryStatement() {
        if (v === "try") {
            var node = Node("TryStatement");
            var l1, l2;
            l1 = loc && loc.start;
            pass("try");
            node.handler = this.Statement();
            if (v === "catch") node.guard = this.Catch();
            if (v === "finally") node.finalizer = this.Finally();
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);
            return node;
        }
        return null;
    }

    parser.Catch = Catch;

    function Catch() {
        if (v === "catch") {
            var node, l1, l2;
            node = Node("CatchClause");
            l1 = loc && loc.start;
            pass("catch");
            pass("(");
            node.params = this.FormalParameterList();
            pass(")");
            node.block = this.Statement();
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;
        }
        return null;
    }
    parser.Finally = Finally;

    function Finally() {
        if (v === "finally") {
            var node, l1, l2;
            l1 = loc && loc.start;
            var node = Node("Finally");
            pass("finally");
            node.block = this.Statement();
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            return node;
        }
        return null;
    }
    parser.DebuggerStatement = DebuggerStatement;

    function DebuggerStatement() {
        if (v === "debugger") {
            var node, l1, l2;
            node = Node("DebuggerStatement");
            l1 = loc && loc.start;
            pass("debugger");
            skip(";");
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            if (compile) return builder["debuggerStatement"](node.loc);
            return node;
        }
        return null;
    }
    //
    // Module
    //

    parser.Module = Module;

    function Module() {
        var root = Node("Module");
        var l1 = loc && loc.start;
        root.body = this.ModuleBody();
        var l2 = loc && loc.end;
        root.loc = makeLoc(l1, l2);
        EarlyErrors(root);
        if (compile) return builder["module"](root.body, root.loc);
        return root;
    }


    parser.ModuleDeclaration = ModuleDeclaration;

    function ModuleDeclaration() {
        if (v === "module") {
            var node, l1, l2;
            l1 = loc && loc.start;

            contains.new_scope();
            ident.new_var();
            
            moduleStack.push(curModule);
            curModule = {
                __proto__: null,
                knownExports: Object.create(null),
                unknownExports: Object.create(null),
                knownImports: Object.create(null),
                moduleRequests: Object.create(null)
            };

            node = Node("ModuleDeclaration");
            node.strict = true;
            pass("module");
            node.id = this.ModuleSpecifier();
            node.body = this.ModuleBody(node);
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);

            EarlyErrors(node);

            contains.old_scope();
            ident.old_scope();
            curModule = moduleStack.pop();


            return node;
        }
        return null;
    }
    parser.ModuleSpecifier = ModuleSpecifier;

    function ModuleSpecifier() {
        if (t === "StringLiteral") {
            var specifier = v.slice(1, v.length - 1);
            pass(v);
            return specifier;
        }
        throwError(new SyntaxError("can not make out ModuleSpecifier"));
    }
    parser.ModuleBody = ModuleBody;

    function ModuleBody() {
        var list = [];
        pass("{");
        var item;
        while (v !== undefined && v !== "}") {
            item = this.ExportStatement() || this.ModuleDeclaration() || this.ImportStatement() || this.Statement();
            if (item) list.push(item);
            else throwError(new SyntaxError("Error parsing module body"));
        }
        pass("}");
        return list;
    }

    parser.FromClause = FromClause;

    function FromClause() {
        pass("from");
        var frm = this.ModuleSpecifier();
        return frm;
    }

    //
    // Imports
    //    
    parser.ImportClause = ImportClause;

    function ImportClause() {
        var node = Node("ImportClause");
        var id = this.Identifier();
        node.id = id;
        if (id) {
            if (v === ",") {
                pass(v);
                var node2 = this.NamedImports();

                node.named = node2;
            }
        }
        return node;
    }
    parser.NamedImports = NamedImports;

    function NamedImports() {
        if (v === "{") {
            var list = [];
            while (v && v !== "}") {
                var node = Node("ImportSpecifier");
                node.id = this.Identifier();
                if (v === "as") {
                    pass("as");
                    node.as = this.Identifier();
                }
                list.push(node);
                if (v === ",") {
                    pass(",");
                    continue;
                } else {
                    throwError(new SyntaxError("BindingElement did not terminate with a , or }"));
                }
            }
            return list;
        }
        return null;
    }

    parser.ImportStatement = ImportStatement;

    function ImportStatement() {
        if (v === "import") {
            var l1 = loc && loc.start;
            var l2;
            var node = Node("ImportStatement");
            pass("import");
            var list = node.imports = [];
            var imp;
            if (v === "module") {
                if (ltNext) return null;
                node.module = true;
                node.id = this.Identifier();
            } else {
                while (v !== "from") {
                    if (v === "{") {
                        imp = this.ImportClause();
                        if (imp) list.push(imp);
                    } else if (t === "Identifier") {
                        imp = this.Identifier();
                        if (imp) list.push(imp);
                    } else if (v === ",") {
                        pass(",");
                        continue;
                    } else if (v !== "from") {
                        throwError(new SyntaxError("invalid import statement"));
                    }
                }
            }
            node.from = this.FromClause();
            skip(";");
            EarlyErrors(node);
            return node;
        }
        return null;
    }
    //
    // Exports
    //
    parser.ExportsClause = ExportsClause;

    function ExportsClause() {
        if (v === "{") {
            var list = [];
            while (v && v !== "}") {
                var node = Node("ExportsSpecifier");
                node.id = this.Identifier();
                if (v === "as") {
                    pass("as");
                    node.as = this.Identifier();
                }
                list.push(node);
                if (v === ",") {
                    pass(",");
                    continue;
                } else {
                    throwError(new SyntaxError("BindingElement did not terminate with a , or }"));
                }
            }
            return list;
        }
        return null;
    }

    parser.DeclarationDefault = DeclarationDefault;

    function DeclarationDefault() {
        defaultStack.push(defaultIsId);
        defaultIsId = true;
        var node = this.FunctionDeclaration();
        defaultIsId = defaultStack.pop();
    }

    parser.ExportStatement = ExportStatement;

    function ExportStatement() {
        if (v === "export") {
            var l1 = loc && loc.start;
            var l2;
            var node = Node("ExportStatement");
            pass("export");
            if (v === "default") {
                pass("default");
                node.
                default = true;
                node.exports = this.AssignmentExpression();
                skip(";");
            } else if (v === "*") {
                node.all = true;
                pass(v);
                node.from = this.FromClause();
                skip(";");
            } else {
                node.exports = this.ExportsClause();
                if (node.exports) node.from = this.FromClause();
                else node.exports = this.VariableStatement() || this.DeclarationDefault();
                skip(";");
            }
            l2 = loc && loc.end;
            makeLoc(l1, l2);
            EarlyErrors(node);
            return node;
        }
        return null;
    }

    /*
	Statement 
*/
    parser.StatementList = StatementList;
    parser.SwitchStatementList = SwitchStatementList;

    function SwitchStatementList() {
        var list = [];
        list.type = "StatementList";
        list.switch = true;
        var s;
        do {
            if (i >= j) break;
            debug("swstmtlist():");
            s = this.Statement();
            list.push(s);
        } while (!FinishSwitchStatementList[v]);
        return list;
    }

    function StatementList() {
        var list = [];
        list.type = "StatementList";
        var s;
        do {
            if (i >= j) break;
            debug("stmtlist():");
            s = this.Statement();
            list.push(s);
        } while (!FinishStatementList[v]);

        return list;
    }

    parser.Statement = Statement;

    function Statement(a, b, c, d) {
        var node;
        debug("statement at " + v);
        var fn = this[StatementParsers[v]];
        //    console.log("a) got no fn ");
        if (fn) node = fn.call(this, a, b, c, d);
        if (!node) node = (this.LabelledStatement(a, b, c, d) || this.Expression(a, b, c, d));
        //        if (!node) console.log("b) got no node");
        skip(";");
        return node;
    }

    /*


	Iteration
*/
    parser.IterationStatement = IterationStatement;

    function IterationStatement() {
        if (v === "for") return this.ForStatement();
        if (v === "do") return this.DoWhileStatement();
        if (v === "while") return this.WhileStatement();
        return null;
    }
    parser.ForStatement = ForStatement;

    var positions = [];

    function saveTheDot() {
        var o = {
            loc: loc,
            tokens: tokens,
            line: line,
            column: column,
            i: i,
            j: j,
            T: T,
            t: t,
            v: v,
            rhs: rhs,
            isNoIn: isNoIn,
            yieldIsId: yieldIsId,
            defaultIsId: defaultIsId,
            yieldStack: yieldStack,
            defaultStack: defaultStack,
            ident: ident,
            contains: contains
        };
        positions.push(o);
        return o;
    }

    function restoreTheDot(o) {
        o = o || positions.pop();
        if (o) {
            loc = o.loc;
            tokens = o.tokens;
            line = o.line;
            column = o.colum;
            i = o.i;
            j = o.j;
            T = o.T;
            t = o.t;
            v = o.v;
            rhs = o.rhs;
            rhst = o.rhst;
            isNoIn = o.isNoIn;
            yieldIsId = o.yieldIsId;
            defaultIsId = o.defaultIsId;
            yieldStack = o.yieldStack;
            defaultStack = o.defaultStack;
            ident = o.ident;
            contains = o.contains;
        }
    }

    function dropPositions() {
        return positions.pop();
    }

    function ForDeclaration() {
        var node;
        if (LetOrConst[v]) {
            node = Node("ForDeclaration");
            node.kind = v;
            pass(v);
            node.id = this.ForBinding();
            return node;
        }
        return null;
    }

    parser.ForDeclaration = ForDeclaration;
    parser.ForBinding = ForBinding;

    function ForBinding() {
        var node = this.BindingPattern() || this.Identifier();
        return node;
    }

    parser.VariableStatementNoIn = VariableStatementNoIn;

    function VariableStatementNoIn() {
        noInStack.push(isNoIn);
        isNoIn = true;
        var node = this.VariableStatement();
        isNoIn = noInStack.pop();
        return node;
    }

    parser.ForStatement = ForStatement;

    function ForStatement() {
        var node;
        var left;
        var right;
        var init;
        var test;
        var update;
        var statement;
        var parens = [];
        var peek;
        var numSemi = 0;
        var hasInOf = false;
        var l1, l2;

        if (v === "for") {
            l1 = loc && loc.start;
            pass("for");
            pass("(");

            /* lookahead */
            parens.push("(");
            for (var y = i; y < j; y++) {
                peek = (peek = tokens[y]) && peek.value;

                if (peek === ";") {
                    numSemi += 1;
                } else if (peek === "in" || peek === "of") {
                    hasInOf = peek;
                } else if (peek === "(") {
                    parens.push("(");
                } else if (peek === ")") {
                    parens.pop();
                    if (!parens.length) break;
                }
            }

            /* parse */

            ident.new_lex();
            contains.new_scope();

            if (numSemi === 2) {
                node = Node("ForStatement");

                if (v === ";") {
                    node.init = null;
                    pass(";");
                } else {
                    if (v === "var") {
                        node.init = this.VariableStatementNoIn();
                    } else if (LetOrConst[v]) {
                        node.init = this.VariableStatementNoIn();
                    } else {
                        node.init = this.ExpressionNoIn();
                    }
                    pass(";")
                }

                if (v === ";") {
                    node.test = null;
                    pass(";");
                } else {
                    node.test = this.Expression(";");
                    pass(";");
                }

                if (v === ")") node.update = null;
                else node.update = this.Expression(")");

                pass(")");

            } else if (numSemi === 0 && hasInOf) {

                node = Node("ForStatement");

                if (v === "var") {
                    pass("var");
                    node.left = this.ForBinding();
                } else if (LetOrConst[v]) {
                    node.left = this.ForDeclaration();
                } else {
                    node.left = this.LeftHandSideExpression();
                }

                if (!node.left) throwError(new SyntaxError("can not parse a valid lefthandside expression for for statement"));

                if (rhs === "in" || rhs === "of") next();

                if (v === "in") {
                    node.type = "ForInStatement";
                    pass("in");
                    node.right = this.Expression();
                } else if (v === "of") {
                    node.type = "ForOfStatement";
                    pass("of");
                    node.right = this.AssignmentExpression();
                }

                if (!node.right) throwError(new SyntaxError("can not parse a valid righthandside expression for for statement"));

                pass(")");

            } else {
                throwError(new SyntaxError("invalid syntax in for statement"));
            }

            node.body = this.Statement();
            l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);

            contains.old_scope();
            ident.old_scope();

            if (compile) {
                if (node.type === "ForStatement") return builder["forStatement"](node.init, node.condition, node.update, node.body, loc);
                else if (node.type === "ForInStatement") return builder["forInStatement"](node.left, node.right, node.body, loc);
                else if (node.type === "ForOfStatement") return builder["forOfStatement"](node.left, node.right, node.body, loc);
            }

            return node;
        }
        return null;
    }

    function WhileStatement() {
        /* IterationStatement : while ( this.Expression ) Statement */
        if (v === "while") {
            contains.new_scope();
            var l1, l2;
            l1 = loc && loc.start;
            var node = Node("WhileStatement");
            scan("(");
            node.test = this.Expression();
            pass(")");
            node.body = this.Statement();
            l2 = loc && loc.end;
            EarlyErrors(node);
            contains.old_scope();
            if (compile) return builder["whileStatement"](node.test, node.body, node.loc);
            return node;
        }
        return null;
    }
    parser.WhileStatement = WhileStatement;

    function IfStatement() {

        if (v === "if") {

            var node = Node("IfStatement");
            pass("if");
            pass("(");
            node.test = this.Expression();
            pass(")");
            node.consequent = this.Statement();
            if (v === "else") {
                pass("else");
                node.alternate = this.Statement();
            }
            EarlyErrors(node);
            if (compile) return builder["ifStatement"](node.test, node.consequent, node.alternate, loc);
            return node;
        }
        return null;
    }
    parser.IfStatement = IfStatement;
    parser.DoWhileStatement = DoWhileStatement;

    function DoWhileStatement() {
        if (v === "do") {
            var l1, l2;
            l1 = loc && loc.start;

            contains.new_scope();

            var node = Node("DoWhileStatement");

            pass("do");
            node.body = this.Statement();
            pass("while");
            pass("(");
            node.test = this.Expression();
            pass(")");
            l2 = loc && loc.end;
            skip(";");
            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);

            contains.old_scope();

            if (compile) return builder["doWhileStatement"](node.test, node.body, node.loc);
            return node;
        }
        return null;
    }
    parser.SwitchStatement = SwitchStatement;

    function SwitchStatement() {
        if (v === "switch") {

            defaultStack.push(defaultIsId);
            defaultIsId = false;
            contains.new_scope();

            var c;
            var node = Node("SwitchStatement");

            var l1 = loc && loc.start;
            var l2;

            pass("switch");
            pass("(");
            node.discriminant = this.Expression(")");
            pass(")");
            pass("{");

            var cases = node.cases = [];
            while (v !== "}") {
                c = this.SwitchCase() || this.DefaultCase();
                cases.push(c);
            }
            pass("}");

            node.loc = makeLoc(l1, l2);
            EarlyErrors(node);

            defaultIsId = defaultStack.pop();
            contains.old_scope();

            if (compile) return builder["switchStatement"](node.discriminant, node.cases, node.loc);
            return node;
        }
        return null;
    }
    parser.DefaultCase = DefaultCase;

    function DefaultCase() {
        if (v === "default" && rhs === ":") {
            var node = Node("DefaultCase");
            pass("default");
            pass(":");
            node.consequent = this.SwitchStatementList();
            skip(";");
            return node;
        }
        return null;
    }
    parser.SwitchCase = SwitchCase;

    function SwitchCase() {

        if (v === "case") {
            var node = Node("SwitchCase");
            pass("case");
            node.test = this.Expression(":");
            pass(":");

            node.consequent = this.SwitchStatementList();
            skip(";");

            return node;
        }
        return null;
    }

    parser.EmptyStatement = EmptyStatement;

    function EmptyStatement() {
        /* EmptyStatement : ; */
        var node;
        if (v === ";") {
            node = Node("EmptyStatement");
            node.loc = makeLoc(loc && loc.start, loc && loc.end);
            pass(";");
            if (compile) return builder.emptyStatement(loc);
            return node;
        }
        return null;
    }

    parser.DirectivePrologue = DirectivePrologue;

    function DirectivePrologue(containingNode, nodes) {

        var node;

        while (t === "Directive") {

            if (v === "\"use strict\"" || v === "\'use strict\'") containingNode.strict = true;
            else if (v == "\"use asm\"" || v == "\'use asm\'") containingNode.asm = true;

            var l1 = loc && loc.start;
            var node = Node("Directive");
            node.value = v;
            pass(v);
            var l2 = loc && loc.end;
            node.loc = makeLoc(l1, l2);
            skip(";");
            if (compile) node = builder.directive(node.value, node.loc);
            nodes.push(node);
        }

        return;
    }

    parser.SourceElements = SourceElements;

    function SourceElements(program) {
        var nodes = [];
        var node, strict;

        this.DirectivePrologue(program, nodes);

        do {

            node = this.FunctionDeclaration() || this.ClassDeclaration() || this.ModuleDeclaration() || this.Statement();
            if (node) nodes.push(node);

        } while (i < j && T !== undefined);

        return nodes;
    }

    parser.Program = Program;

    function Program() {

        var node = Node("Program");
        node.loc = loc = makeLoc();
        loc.start.line = 1;
        loc.start.column = 0;
        var l1 = loc && loc.start;
        var l2;

        next();

        node.body = this.SourceElements(node);

        l2 = loc && loc.end;
        node.loc = makeLoc(l1, l2);
        EarlyErrors(node);

        /*
		node.lexNames = ident.bound_lex();
		node.varNames = ident.bound_var();
				*/

        if (compile) return builder["program"](node.body, loc);
        return node;
    }

    // ===========================================================================================================
    // Regular Expression Parser
    // ===========================================================================================================

    function Atom() {

    }

    function Quantifier() {
        var qf = QuantifierPrefix();
        if (!qf) return null;
        var node = Node("Quantifier");
        node.quantifier = qf;
        if (rhs === "?") {
            next();
            node.questionmark = true;
        }
        return node;
    }

    var quantifierPrefixes = {
        "*": true,
        "+": true,
        "?": true,
        "{": true
    };

    function QuantifierPrefix() {
        var prefix, digits = "";
        if (quantifierPrefixes[v]) {
            prefix = Node("quantifierprefix");
            if (v === "{") {
                next();
                while (v !== "}") {
                    digits += v;
                    next();
                }
            }
            prefix.value = v;
            return prefix;
        }
        return null;
    }

    function AtomEscape() {

    }

    function Assertion() {
        var node;
        var node = Node("assertion");
        if (v === "^") {

        } else if (v === "$") {

        } else if ((v === "\\" && rhs === "b") || (v === "\\" && rhs === "B")) {

        } else if (v === "(" && rhs === "=") {

        } else if (v === "(" && rhs === "!") {

        } else {
            return null;
        }
        return node;
    }

    function CharacterClass() {

    }

    function AtomQuantifieropt() {
        var atom = Atom();
        if (atom) {
            var node = Node("term");
            node.atom = atom;
            var qf = Quantifier();
            if (qf) {
                node.quantifier = qf;
            }
            return node;
        }
        return null;
    }

    function Term() {
        var term = Assertion();
        var node = Node("term");
        if (term) {
            node.assertion = term;
            return node;
        }
        term = AtomQuantifieropt();
        if (term) {
            node.atom = term.atom;
            if (term.quantifier) {
                node.quantifier = term.quantifier;
            }
            return node;
        }
        return null;
    }

    function Alternative() {
        var term;
        if (v === undefined) return null;
        var node = Node("alternative");
        var list = [];
        while (term = Term()) {
            list.push(term);
        }
        node.alternatives = list;
        return node;
    }

    function Disjunction() {
        var node = Node("disjunction");
        var alternative = Alternative();
        if (rhs === "|") {
            scan("|");
            var disjunction = Disjunction();
            if (disjunction) node.disjunction = disjunction;
        }
        return node;
    }

    function Pattern() {
        var node = Node("pattern");
        var disjunction = Disjunction();
        if (disjunction) {
            node.disjunction = disjunction;
            return node;
        } else return null;
    }

    function PatternCharacter() {
        
    }

    parser.RegularExpressionLiteral = RegularExpressionLiteral;

    function RegularExpressionLiteral() {
        var tree = Pattern();
        if (tree) return tree;
        else throwError(new SyntaxError("Can not parse Regular Expression Source with Goal Symbol Pattern"));
    }

    // ===========================================================================================================
    // JSON Parser is invoked via parseGoal from the Runtime of the Interpreter and is incompatible
    // ===========================================================================================================

    parser.JSONText = JSONText;

    function JSONText() {
        if (!withError) {
            withError = require("lib/api").withError;
            ifAbrupt = require("lib/api").ifAbrupt;
            isAbrupt = require("lib/api").isAbrupt;
        }
        var tree = JSONValue();
        return tree;
    }

    parser.JSONValue = JSONValue;

    function JSONValue() {
        var value = JSONObject() || JSONArray() || JSONNumber() || JSONString() || JSONBooleanLiteral() || JSONNullLiteral();
        return value;
    }

    parser.JSONString = JSONString;

    function JSONString() {
        if (t === "StringLiteral") {
            var q1, q2;
            q1 = v[0];
            q2 = v[v.length - 1];
            if (q1 !== "\"" || q2 !== "\"") return withError("JSONString: Expecting double quoted strings.");
            var node = Node("JSONString");
            node.value = v;
            next();
            return node;
        }
        return null;
    }
    parser.JSONNumber = JSONNumber;

    function JSONNumber() {
        if (t === "NumericLiteral") {
            var node = Node("JSONNumber");
            node.value = v;
            next();
            return node;
        }
    }
    parser.JSONFraction = JSONFraction;

    function JSONFraction() {

    }
    parser.JSONNullLiteral = JSONNullLiteral;

    function JSONNullLiteral() {
        if (t === "NullLiteral") {
            var node = Node("JSONNullLiteral");
            node.value = v;
            next();
            return node;
        }
        return null;
    }
    parser.JSONBooleanLiteral = JSONBooleanLiteral;

    function JSONBooleanLiteral() {
        if (t === "BooleanLiteral") {
            var node = Node("JSONBooleanLiteral");
            node.value = v;
            next();
            return node;
        }
        return null;
    }

    parser.JSONArray = JSONArray;

    function JSONArray() {
        if (v === "[") {
            var node = Node("JSONArray");
            var elements = JSONElementList();
            if ((elements = ifAbrupt(elements)) && isAbrupt(elements)) return elements;
            node.elements = elements;
            pass("]");
            return node;
        }
        return null;

    }

    parser.JSONElementList = JSONElementList;

    function JSONElementList() {
        var list = [];
        next();
        while (v !== "]") {
            var node = JSONValue();
            if ((node = ifAbrupt(node)) && isAbrupt(node)) return node;
            if (node) list.push(node);
            else return withError("JSONElementList: Error parsing Element");
            if (v === ",") pass(",");
            else if (v === "]") break;
            else return withError("JSONElementList: Invalid formatted literal. Comma or ] expected. Got " + v);
        }
        return list;
    }

    parser.JSONObject = JSONObject;

    function JSONObject() {
        if (v === "{") {
            var node = Node("JSONObject");
            var properties = JSONMemberList();
            if ((properties = ifAbrupt(properties)) && isAbrupt(properties)) return properties;
            node.properties = properties;
            pass("}");
            return node;
        }
        return null;
    }

    parser.JSONMember = JSONMember;

    function JSONMember() {
        var node = Node("JSONMember");
        var key = JSONString();
        if (!key) return withError("Syntax", "JSONMember: Expecting double quoted string keys in object literals.");
        if ((key = ifAbrupt(key)) && isAbrupt(key)) return key;
        pass(":");
        var value = JSONValue();
        if ((value = ifAbrupt(value)) && isAbrupt(value)) return value;
        node.key = key;
        node.value = value;
        return node;
    }
    parser.JSONMemberList = JSONMemberList;

    function JSONMemberList() {
        var list = [];
        next();
        while (v !== "}") {
            var node = JSONMember();
            if ((node = ifAbrupt(node)) && isAbrupt(node)) return node;
            if (node) list.push(node);
            else return withError("JSONMemberList: Error parsing Member");
            if (v === ",") pass(",");
            else if (v === "}") break;
            else return withError("JSONMemberList: Invalid formatted literal. Comma or } expected. Got: " + v);
        }
        return list;
    }

    /***************************************************************************/

    /* setze inlinelex per default auf true */

    function CreateTheAST(tokens, options, inlineLexBool) {
        resetVariables(tokens, inlineLexBool);
        try {
            ast = parser.Program();
        } catch (ex) {
            console.log(ex.name);
            console.log(ex.message);
            console.log(ex.stack);
            ast = ex;
            //    throw ex;
        }
        return ast;
    }

    function parseGoal(goal, source) {

        if (!withError) {
            var api = require("lib/api")
            withError = api && api.withError;
            ifAbrupt = api && api.ifAbrupt;
            isAbrupt = api && api.isAbrupt;
        }

        saveTheDot();
        resetVariables();

        if (Array.isArray(source)) {
            tokens = source;
        } else {
            text = source;
            tokens = tokenize(text);
        }

        lhs = rhs = rhst = T = v = t = undefined;
        i = -1;
        j = tokens.length;
        next();

        //tokenize.inlineSetup(0, source);
        //next = tokenize.inlineLex;

        var fn = parser[goal];
        if (!fn) throw "Sorry, got no parser for " + goal;
        try {
            var node = fn.call(parser);
        } catch (ex) {
            console.log(ex.name);
            console.log(ex.message);
            console.log(ex.stack);
            throw ex;
        } finally {
            restoreTheDot();
        }
        return node;
    }

    CreateTheAST.parser = parser;
    parser.parse = CreateTheAST;

    CreateTheAST.parseGoal = parseGoal;
    CreateTheAST.setBuilder = setBuilder;

    var saveBuilder = [];

    function unsetBuilder(objBuilder) {
        var state;
        if (builder === objBuilder) state = saveBuilder.pop();
        if (state) {
            builder = state.builder;
            compile = state.compile;
        }
    }

    function setBuilder(objBuilder, boolCompile) {
        saveBuilder.push({
            builder: builder,
            compile: compile
        });
        if (typeof "objBuilder" !== "object") {
            throw "objBuilder ist a Mozilla Parser-API compatible Builder Object for Code Generation from the AST, see http://developers.mozilla.org/en-US/docs/SpiderMonkey/Parser_API for more how to use..";
        }
        builder = objBuilder;
        if (boolCompile !== undefined) compile = !! boolCompile;
        return true;
    }

    return CreateTheAST;
});

/*
############################################################################################################################################################################################################

	LLVM Codegen Placeholder for Future 
		
############################################################################################################################################################################################################
*/

define("lib/llvm-codegen", function (require, exports, module) {
    "use strict";
    var builder = {};

    return builder;
});

/*
############################################################################################################################################################################################################

	JavaScript Codegenerator - This module transforms the AST back into ES6 Source Code.
		
############################################################################################################################################################################################################
*/

define("lib/js-codegen", function (require, exports, module) {
    "use strict";

    var builder = {};
    var parser = require("lib/parser");
    var parseGoal = parser.parseGoal;
    var setBuilder = parser.setBuilder;
    var unsetBuilder = parser.unsetBuilder;

    var TAB = "    ";
    var SPC = " ";
    var indent = 0;
    var nesting = [];

    function tabs(indent) {
        var str = "";
        for (var i = 1; i <= indent; i++) {
            str += TAB;
        }
        return str;
    }

    function nl() {
        return "\r\n";
    }

    var names = {
        __proto__: null,
        "VariableStatement": "variableStatement",
        "ExpressionStatement": "expressionStatement",
        "FunctionDeclaration": "functionDeclaration",
        "MethodDefinition": "methodDefinition",
        "PropertyDefinition": "propertyDefinition"
    };

    function callBuilder(node) {
        var args;
        var name;

        if (!node) return "";

        if (Array.isArray(node)) {

            var src = "";
            var stm;
            for (var i = 0, j = node.length; i < j; i++) {
                if (stm = node[i]) {
                    src += callBuilder(stm);
                }
            }
            return src;

        } else if (typeof node === "string") {
            return node;
        } else {

            name = node.type;

            switch (name) {
            case "BlockStatement":
                args = [node.body, node.loc];
                break;
            case "FunctionDeclaration":
            case "FunctionExpression":
            case "GeneratorDeclaration":
            case "GeneratorExpression":
                args = [node.id, node.params, node.body, node.strict, node.generator, node.expression, node.loc];
                break;
            case "MethodDefinition":
                args = [node.id, node.params, node.body, node.strict, node.static, node.generator, node.loc];
                break;
            case "ArrowExpression":
                break;
            case "ExpressionStatement":
            case "SequenceExpression":
                args = [node.expression, node.loc];
                break;
            case "VariableDeclarator":
                args = [node.id, node.init, node.loc];
                break;
            case "VariableDeclaration":
            case "LexicalDeclaration":
                args = [node.kind, node.declarations, node.loc];
                break;
            case "EmptyStatement":
                args = [node.loc];
                break;
            case "ForStatement":
                args = [node.init, node.test, node.update, node.body, node.loc];
                break;
            case "ForInStatement":
            case "ForOfStatement":
                args = [node.left, node.right, node.body, node.loc];
                break;
            case "DoWhileStatement":
            case "WhileStatement":
                args = [node.test, node.body, node.loc];
                break;
            case "LabelledStatement":
                args = [node.label, node.statement, node.loc];
                break;
            case "IfStatement":
                args = [node.test, node.consequent, node.alternate, node.loc];
                break;
            case "TryStatement":
                args = [node.block, node.guard, node.finalizer, node.loc];
                break;
            case "SwitchStatement":
                args = [node.discriminant, node.cases, node.loc];
                break;
            case "WithStatement":
                args = [node.object, node.body, node.loc];
                break;
            case "ComprehensionExpression":
                args = [node.blocks, node.filter, node.expression];
                break;
            case "AssignmentExpression":
            case "BinaryExpression":
            case "LogicalExpression":
                args = [node.operator, node.left, node.right, node.loc];
                break;
            case "UnaryExpression":
                args = [node.operator, node.argument, node.prefix, node.loc];
                break;
            case "MemberExpression":
                args = [node.object, node.property, node.computed, node.loc];
                break;
            case "CallExpression":
            case "NewExpression":
                args = [node.callee, node.arguments, node.loc];
                break;
            case "ObjectPattern":
            case "ArrayPattern":
                args = [node.elements, node.loc];
                break;
            case "BindingElement":
                args = [node.id.name, node.as.name, node.loc];
                break;
            case "ObjectExpression":
                args = [node.properties, node.loc];
                break;
            case "ArrayExpression":
                args = [node.elements, node.loc];
                break;
            case "DefaultParameter":
                args = [node.id, node.init, node.loc];
                break;
            case "RestParameter":
                args = [node.id, node.init, node.loc];
                break;
            case "SpreadExpression":
                args = [node.argument, node.loc];
                break;
            case "ClassDeclaration":
            case "ClassExpression":
                args = [node.id, node.extends, node.elements, node.expression, node.loc];
                break;
            case "ThisExpression":
            case "SuperExpression":
                args = [node.loc];
                break;
            case "Program":
                args = [node.body, node.loc];
                break;
            case "Identifier":
                args = [node.name || node.value, node.loc];
                break;
            case "ReturnStatement":
            case "ThrowStatement":
                args = [node.argument, node.loc];
                break;

            case "BreakStatement":
            case "ContinueStatement":
                args = [node.argument, node.label, node.loc];
                break;
            case "YieldExpression":
                args = [node.argument, node.delegator, node.loc];
                break;
            case "Directive":
            case "Literal":
            case "NumericLiteral":
            case "StringLiteral":
            case "NullLiteral":
            case "BooleanLiteral":
            case "TemplateLiteral":
                args = [node.value, node.loc];
                break;
            }

            name = name[0].toLowerCase() + name.slice(1);
            return builder[name].apply(builder, args);

        }
    }

    builder.spreadExpression = function (argument, loc) {
        var src = "..." + callBuilder(argument);
        return src;
    };

    builder.restParameter = function (id, init, loc) {
        var src = "..." + callBuilder(id);
        if (init) src += " = " + callBuilder(init);
        return src;
    };

    builder.defaultParameter = function (id, init, loc) {
        var src = "";
        src += callBuilder(id);
        src += " = ";
        src += callBuilder(init);
        return src;
    };

    builder.classExpression =
        builder.classDeclaration = function (id, extend, elements, expression, loc) {
            var src = "class ";
            src += id;
            if (extend) src += " extends " + callBuilder(extend);
            src += "{";
            ++indent;
            for (var i = 0, j = elements.length; i < j; i++) {
                if (e = elements[i]) {
                    src += tabs(indent) + callBuilder(e) + nl();
                }
            }
            --indent;
            src += "}";
            return src;
    };

    builder.program = function (body, loc) {
        var src = "";
        var inst;
        for (var i = 0, j = body.length; i < j; i++) {
            if (inst = body[i]) {
                src += tabs(indent) + callBuilder(inst) + ";" + nl();
            }
        }
        return src;
    };

    builder.bindingElement = function (name, as, initialiser, loc) {
        var src = "";
        src += name;
        src += ":";
        src += as;
        if (initialiser) src += " = " + callBuilder(initialiser);
        return src;
    };
    builder.objectPattern = function (elements, loc) {
        var src, e;
        src += "{";
        for (var i = 0, j = elements.length; i < j; i++) {
            if (e = elements[i]) {
                src += callBuilder(e);
                if (i < j - 1) src += ", ";
            }
        }
        src += "}";
        return src;
    };
    builder.arrayPattern = function (elements, loc) {
        var src, e;
        src += "[";
        for (var i = 0, j = elements.length; i < j; i++) {
            if (e = elements[i]) {
                src += callBuilder(e);
                if (i < j - 1) src += ", ";
            }
        }
        src += "]";
        return src;
    };
    builder.identifier = function (name, loc) {
        var src = "";
        src += name;
        return src;
    };

    builder.directive =
        builder.stringLiteral =
        builder.numericLiteral =
        builder.booleanLiteral =
        builder.literal = function (literal, loc) {
            var src = "";
            src += literal;
            return src;
    };

    builder.emptyStatement = function emptyStatement(loc) {
        var src = ";";
        return src;
    };

    builder.variableDeclarator = function (id, init, loc) {
        var src = "";
        src += id;
        return src;
    };
    builder.lexicalDeclaration =
        builder.variableDeclaration = function variableStatement(kind, declarations, loc) {
            var src = kind + " ";
            var decl;
            for (var i = 0, j = declarations.length; i < j; i++) {
                if (decl = declarations[i]) {

                    src += callBuilder(decl);

                    if (decl.init) {
                        src += " = " + callBuilder(decl.init);
                    }

                    if (i < j - 1) {
                        src += ", ";
                    }
                }
            }
            return src;
    };

    builder.functionBody = function (body) {
        var src = "";
        var st;
        src += "{";
        src += nl();
        ++indent;
        for (var i = 0, j = body.length; i < j; i++) {
            if (st = body[i]) {
                src += tabs(indent) + callBuilder(st) + ";" + nl();
            }
        }
        --indent;
        src += "}";
        return src;
    };

    builder.functionDeclaration =
        builder.functionExpression =
        builder.generatorDeclaration =
        builder.generatorExpression = function (id, params, body, strict, generator, expression, loc) {
            var src = "";
            var st;
            src = "function";
            if (generator) src += "*";
            src += " ";
            if (id) src += id;
            src += this.formalParameters(params);
            src += " ";
            src += this.functionBody(body);
            return src;
    };

    builder.generatorMethod =
        builder.methodDefinition = function (id, params, body, strict, generator, loc) {
            ++indent;
            var src = "";
            if (generator) src += "*";
            src += id;
            src += this.formalParameters(params);
            src += " ";
            src += this.functionBody(body);
            return src;
    };

    builder.formalParameters = function (formals) {
        var a;
        var src = "";
        src += "(";
        if (formals && formals.length) {
            for (var i = 0, j = formals.length; i < j; i++) {
                if (a = formals[i]) {
                    src += callBuilder(a);
                    if (i < j - 1) src += ", ";
                }
            }
        }
        src += ")";
        return src;
    }

    builder.memberExpression = function (object, property, computed) {
        var src = "";
        src += callBuilder(object);
        if (computed) src += "[" + callBuilder(property) + "]";
        else src += "." + callBuilder(property);
        return src;
    };

    builder.callExpression = function (callee, args, loc) {
        var src = "";
        src += callBuilder(callee);
        src += this.formalParameters(args);
        return src;

    };
    builder.newExpression = function (callee, args, loc) {
        var src = "new ";
        src += callBuilder(callee);
        src += this.formalParameters(args);
        return src;
    };

    builder.objectExpression = function (properties, loc) {
        var p;
        var src = "{";
        for (var i = 0, j = properties.length; i < j; i++) {
            if (p = properties[i]) {

                src += callBuilder(e);

                if (i < j - 1) {
                    src += ", ";
                }
            }
        }
        src += "}";
        return src;
    };
    builder.arrayExpression = function (elements, loc) {
        var e;
        var src = "[";
        for (var i = 0, j = elements.length; i < j; i++) {
            if (e = elements[i]) {

                src += callBuilder(e);

                if (i < j - 1) {
                    src += ", ";
                }
            }
        }
        src += "]";
        return src;

    };

    builder.blockStatement = function (body, loc) {
        var stm;
        var src = "{";

        if (body) {
            src += nl();
            ++indent;
            for (var i = 0, j = body.length; i < j; i++) {
                if (stm = body[i]) {

                    src += tabs(indent);
                    src += callBuilder(stm);
                    src += ";";
                    src += nl();

                }
            }
            --indent;
        }
        src += "}";
        return src;
    };

    builder.unaryExpression = function (operator, argument, prefix, loc) {
        var src = "";
        if (prefix) src += operator;
        src += callBuilder(argument);
        if (!prefix) src += operator;
        return src;
    };

    builder.binaryExpression = function (operator, left, right, loc) {
        var src = "";
        src += callBuilder(left);
        src += SPC + operator + SPC;
        src += callBuilder(right);
        return src;
    }

    builder.assignmentExpression = function (operator, left, right, loc) {
        var src = "";
        src += callBuilder(left);
        src += SPC + operator + SPC;
        src += callBuilder(right);
        return src;
    }

    builder.pattern = function () {};
    builder.expressionStatement = function expressionStatement(expr, loc) {
        var src = "";
        src += callBuilder(expr);
        return src;
    };
    builder.labelledStatement = function labelledStatement(label, body, loc) {
        var src;
        src += label + ": ";
        src += nl();
        src += tabs(indent);
        src += callBuilder(body);
        return src;
    };
    builder.sequenceExpression = function (seq, loc) {
        var src = "";
        var e;
        for (var i = 0, j = seq.length; i < j; i++) {
            if (e = seq[i]) {
                src += callBuilder(e);
                if (i < j - 1) {
                    src += ", ";
                }
            }
        }
        return src;
    };
    builder.ifStatement = function ifStatement(test, condition, alternate, loc) {
        var src = tabs(indent) + "if (" + callBuilder(test) + ") " + callBuilder(condition);
        if (alternate) src += " else " + callBuilder(alternate);
        return src;
    };
    builder.switchStatement = function (discriminant, cases, isLexical, loc) {
        var c;
        var src = "switch (" + callBuilder(discriminant) + ") {";
        for (var i = 0, j = cases.length; i < j; i++) {
            if (c = cases[i]) {
                if (c.type === "DefaultCase") {
                    src += "default: " + nl();
                    ++indent;
                    src += callBuilder(c.consequent);
                    --indent;
                } else {
                    src += "case " + callBuilder(c.test) + ":" + nl();
                    ++indent;
                    src += callBuilder(c.consequent);
                    --indent;
                }
            }
        }
        src += "}";
        return src;
    };
    builder.whileStatement = function whileStatement(test, body, loc) {
        var src = "while (" + callBuilder(test) + ")" + callBuilder(body);
        return src;
    };
    builder.doWhileStatement = function doWhileStatement(test, body, loc) {
        var src = "do " + callBuilder(body) + " while (" + callBuilder(test) + ");";
        return src;
    };
    builder.withStatement = function withStatement(obj, body, loc) {
        var src = "with (" + callBuilder(obj) + ") " + callBuilder(body);
        return src;
    };
    builder.debuggerStatement = function debuggerStatement(loc) {
        var src = "debugger;";
        return src;
    };
    builder.tryStatement = function (block, handler, guard, finalizer, loc) {
        var src = "try " + callBuilder(block) + " catch (" + callBuilder(guard.params) + ") " + callBuilder(guard.block);
        if (finalizer) src += "finally " + callBuilder(finalizer.block);
        return src;
    };
    builder.forInStatement = function forInStatement(left, right, body, isForEach, loc) {
        var src = "for ("
        src += callBuilder(left);
        src += " in ";
        src += callBuilder(right);
        src += ") ";
        src += callBuilder(body);
        return src;
    };
    builder.forOfStatement = function forOfStatement(left, right, body, loc) {
        var src = "for ("
        src += callBuilder(left);
        src += " of ";
        src += callBuilder(right);
        src += ") ";
        src += callBuilder(body);
        return src;
    };
    builder.forStatement = function forStatement(init, test, update, body, loc) {
        var src = "for ("
        if (init) src += callBuilder(init);
        src += ";";
        if (test) src += callBuilder(test);
        src += ";";
        if (update) src += callBuilder(update);
        src += ") ";
        src += callBuilder(body);
        return src;
    };

    builder.throwStatement = function (expression, loc) {
        var src = "throw";
        if (expression) {
            src += SPC;
            src += callBuilder(expression);
        }
        return src;
    };
    builder.breakStatement = function (label, loc) {
        var src = "break";
        if (label) {
            src += SPC;
            src += callBuilder(label);
        }
        return src;
    };
    builder.continueStatement = function (label, loc) {
        var src = "continue";
        if (label) {
            src += SPC;
            src += callBuilder(label);
        }
        return src;
    };
    builder.returnStatement = function (expression, loc) {
        var src = "return";
        if (expression) {
            src += " " + callBuilder(expression);
        }
        return src;
    };
    builder.thisExpression = function (loc) {
        return "this";
    };
    builder.superExpression = function (loc) {
        return "super";
    };

    function buildFromSrc(src) {
        setBuilder(builder, true);
        try {
            var result = parser(src);
        } catch (ex) {
            result = "[" + ex.name + "]" + ex.message + ";\r\n" + tabs(1) + ex.stack + "\r\n";
        } finally {
            return result;
        }
        unsetBuilder(builder);
    }

    function build(ast) {
        if (typeof ast === "string") {
            return buildFromSrc(ast);
        }

        if (ast.type === "Program") {
            return callBuilder(ast);
        }
    }

    build.callBuilder = callBuilder;
    build.buildFromSrc = buildFromSrc;
    build.builder = builder;

    return build;
});

/*
############################################################################################################################################################################################################
	
	The Heap Memory (ArrayBuffer plus Load and Store)
	
############################################################################################################################################################################################################
*/

define("lib/heap", function (require, exports, module) {

    var DataType = {
        "object": 1,
        "string": 2,
        "number": 3,
        "boolean": 4,
        "null": 5,
        "environment": 6,
        "context": 7,
        "descriptor": 8,
        "bindingrecord": 9,
        "completion": 10,
        "declarative": 11,
        "global": 12,
        "function": 13,
        "objectenvironment": 14,
        "functionenvironment": 15,
        "symbol": 16
    };

    function makeDynamicHash() {

    }

    function makeFixedSizeHash(N) {
        var ptr;

        return ptr;
    }

    var encodes = Object.create(null);
    encodes["object"] = 1;
    encodes["undefined"] = 2;
    encodes["null"] = 3;
    encodes["true"] = 4;
    encodes["false"] = 5;
    encodes["function"] = 6;
    encodes["string"] = 7;
    encodes["number"] = 8;
    encodes["Program"] = 100;
    encodes["Identifier"] = 102;
    encodes["FunctionDeclaration"] = 103;
    encodes["FunctionExpression"] = 104;
    encodes["VariableDeclaration"] = 105;
    encodes["LexialDeclaration"] = 106;
    encodes["VariableDeclarator"] = 107;
    encodes["WhileStatement"] = 108;
    encodes["DoWhileStatement"] = 111;
    encodes["ForStatement"] = 112;
    encodes["IfStatement"] = 113;
    encodes["TryStatement"] = 114;
    encodes["ReturnStatement"] = 115;
    encodes["BreakStatement"] = 116;
    encodes["ThrowStatement"] = 117;
    encodes["ContinueStatement"] = 118;
    encodes["EmptyStatement"] = 127;

    var decodes = Object.create(null);
    for (var c in encodes) {
        if (Object.hasOwnProperty.call(encodes, c)) {
            decodes[encodes[c]] = c;
        }
    }

    var symbols = {
        0: 0,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        A: 10,
        B: 11,
        C: 12,
        D: 13,
        E: 14,
        F: 15,
        "undefined": 16,
        "null": 17,
        "true": 0,
        "false": 1,
    };
    var exports = {};
    var heap;

    var MAX_HEAPSIZE = 2048;
    var DEFAULT_ALIGNMENT = 8;
    var ALIGNMENT = 8;

    function align(number, alignment) {
        if (alignment === undefined) alignment = ALIGNMENT;
        var rest = number % alignment;
        if (rest === 0) return number;
        else return number + (alignment - rest);
    }

    function gc() {
        mark_reachable();
        copy_space();
    }

    function copy_space() {}

    function mark_reachable() {}

    function alloc(bytes) {}

    function make_hash(buf, ofs, N) {
        // offset: 
        // 1) Flags
        // 2) N
        // 3...) NAME, VALUE (offset, offset)

    }

    function createSpace(size) {

        size = alignWith8(size);
        var byteSize = size * Int8Array.BYTES_PER_ELEMENT

        var buf = new ArrayBuffer(byteSize);
        var view = new DataView(buf);
        var heap = {
            from: buf,
            view: view,
            root: Object.create(null),
            all: Object.create(null),
            freeList: Object.create(null),
            size: size,
            bytes: byteSize,
            sp: 0,
            hp: byteSize
        };
        return heap;
    }

    exports.createSpace = createSpace;

    exports.alignWith8 = alignWith8;

    function alignWith8(bytes) {
        var r = bytes % 8;
        if (r != 0) bytes += 8 - r;
        return bytes;
    }

    function make_heap() {}
    exports.make_heap = make_heap;

    function Allocate(buffer, bytes, root) {
        var sp = heap.sp;
        var rnd = alignWith8(bytes);
        heap.sp += rnd;
        var ptr = {
            ofs: sp,
            len: bytes,
            aln: rnd
        };
        // look at freelist
        // or give new mem
        if (root) heap.root[sp] = ptr;
        heap.all[sp] = ptr;
        return ptr;
    }

    exports.allocate = Allocate;

    function store_string() {}

    function store_number() {}

    function store_object() {}

    function store_array() {}

    function store_function() {}

    function store_global_environment() {}

    function store_fn_environment() {}

    function store_decl_environment() {}

    function store_context() {}

    function store_intrinsics() {}

    function store_realm() {}

    function store_completion() {}

    function Store(ptr, value, size, type) {
        if (type === "string") {} else if (type === "number") {} else if (type === "object" && value !== null) {} else if (value === undefined) {}
    }
    exports.store = Store;

    function ToInteger(V) {
        var ints = new Int8Array(8);
    }
    exports.toInteger = ToInteger;
    var hp;
    exports.init = function (size) {
        hp = make_heap(size);
    };
    exports.destroy = function (size) {
        hp = null;
    };
});

/*
############################################################################################################################################################################################################

	A Codegenerator which uses Heap Memory to Store the Data
		
############################################################################################################################################################################################################
*/

define("lib/builder", function (require, exports, module) {
    var builder = exports;

    builder.StringToByteCode = StringToByteCode;

    function ByteCodeToString(code) {
        var string = "";
        var view = new Uint16Array(code);
        for (var i = 0, j = view.length; i < j; i++) {
            string += String.fromCharCode(view[i]);
        }
        return string;
    }

    function StringToByteCode(string) {
        var code = new Float64Array(Math.ceil(string.length / 4));
        var trns = new Uint16Array(code);
        for (var i = 0, j = string.length; i < j; i++) {
            trns[i] = string.charCodeAt(i);
        }
        return code;
    }
    builder.LocToByteCode = LocToByteCode;

    function LocToByteCode(loc) {

    }

    // sizeOfLoc - 4 doubles = 32 bytes

    var sizeOfLoc = 32;

    // writeLoc (buf, ofs, loc):
    // schreibt start.line, start.column, end.* = 32 bytes (!!! big)
    // in buf ab position ofs
    // returns ofs (<=> pointer zur loc zum abspeichern)

    function writeLoc(buf, ofs, loc) {
        var line = loc.start.line;
        var column = loc.start.column;
        var endline = loc.end.line;
        var endcolumn = loc.end.colum;
        var code = new Float64Array(buf, ofs, 4);
        code[0] = DataType["loc"];
        code[1] = line;
        code[2] = column;
        code[3] = endline;
        code[4] = endcolumn;
        return ofs;
    }

    // readLoc (buf, ofs)
    // returnt typed [type==DataType["loc"], startline,startcolumn,endline,endcolumn] array von buf an position ofs

    function readLoc(buf, ofs) {
        var code = new Float64Array(buf, ofs, 1)
        return code;
    }

    //
    // writeString(buf, ofs, data[, len]) 
    // schreibt Uint16Array len oder data.length ab buf[ofs]
    // returnt ofs;

    function writeString(buf, ofs, data, len) {
        if (data === undefined) throw "writeString: no data";
        data = "" + data;
        if (len === undefined) len = data.length + 2;
        else len = len + 2;
        var array = new Uint16Array(buf, ofs, len);

        array[0] = DataType["string"];
        var char;
        for (var i = 1, j = len + 1; i < j; i++) {
            char = data[i];
            array[i] = data.charCodeAt(0);
            // Hier UTF16-Encode nutzen!!!
        }
        array[len] = 0;
        return ofs;
    }

    //
    // readString (buf, ofs, len)
    // liest bis len oder den ganzen String bis 0 
    // len = len + 2 ([0] = type, [len] = \0)
    // von buf ab pos ofs
    // returnt einen string

    // buf, ofs to string
    function readString(buf, ofs, len) {
        var array = readString(buf, ofs, len);
        return decodeStringType(array);
    }

    // buf, ofs, to array
    function readStringType(buf, ofs, len) {
        if (len !== undefined) len = len + 2;
        var array = new Uint16Array(buf, ofs, len);
        var type = buf[0];
        if (type !== DataType["string"]) throw "value is not a string";
        return array;
    }

    // array zu string
    function decodeStringType(array) {
        var string = "";
        var code;
        var i = 1;
        if (array[0] !== DataType["string"]) throw "array is not a string";
        while ((code = array[i]) != 0) {
            string += String.fromCharCode(code);
            i++;
            if (len && i === len) break;
        }
        return string;
    }

    //
    // writeNumber (buf, ofs, value) schreibt eine number 
    //

    function writeNumber(buf, ofs, value) {
        var code = new Float64Array(buf, ofs, 2);
        code[0] = DataType["number"];
        code[1] = value;
        return ofs;
    }

    //
    // readNumberType -> liest einen Typed Array
    // decodeNumberType -> returnt number value des arrays
    // readNumber -> liest von buf ofs und returnt value
    //

    function readNumberType(buf, ofs) {
        var code = new Float64Array(buf, ofs, 2);
        var type = buf[0];
        if (type !== DataType["number"]) throw "value is not a number";
        return code;
    }

    function readNumber(buf, ofs) {
        var num = readNumberType(buf, ofs);
        var value = num[1];
        return value;
    }

    function decodeNumberType(num) {
        if (num[0] !== DataType["number"]) throw "num is not a number";
        var value = num[1];
        return value;
    }

    //
    // Adding to the builder
    //

    builder.readLoc = readLoc;
    builder.writeLoc = writeLoc;
    builder.readStringType = readStringType;
    builder.decodeStringType = decodeStringType;
    builder.readString = readString;
    builder.writeString = writeString;
    builder.writeNumber = writeNumber;
    builder.readNumberType = readNumberType;

    /*
	Translating statements into ByteCode, recursivly


*/

    builder.emptyStatement = function emptyStatement(loc) {
        var ptr = allocate();
        var code = Bytecode["EmptyStatement"];
        var locinfo = LocToByteCode(loc);
    };

    builder.literal = function (type, value) {
        var bc = new Int8Array(8);
        bc[0] = encodes[type];
        return Store(hp, bc, 1);
    };

    builder.functionDeclaration = function (body, params, strict, generator, loc) {};
    builder.functionExpression = function (body, params, strict, generator, loc) {};

    builder.variableStatement = function variableStatement(kind, decls, loc) {};

    builder.callExpression = function (callee, args, loc) {};
    builder.newExpression = function (callee, args, loc) {};
    builder.objectExpression = function (properties, loc) {
        var p;
        // allocate object auf heap
        // addiere properties und values auf dem hash
        // [offs] = ptr = name + ptr to value
        // return offs von objekt mit offsets zu properties
        var obj;
        for (var i = 0, j = properties.length; i < j; i++) {
            if (p = properties[i]) {

            }
        }
        return obj;
    };
    builder.arrayExpression = function (elements, loc) {
        var arr, e;
        for (var i = 0, j = elements.length; i < j; i++) {
            if (e = elements[i]) {

            }
        }
        return arr;

    };

    builder.blockStatement = function (body, loc) {};
    builder.binaryExpression = function (left, operator, right, loc) {

    };
    builder.assignmentExpression = function (left, operator, right, loc) {

    };

    builder.pattern = function () {};
    builder.expressionStatement = function expressionStatement(expr, loc) {};
    builder.labeledStatement = function labeledStatement(label, body, loc) {};
    builder.sequenceExpression = function (seq, loc) {};
    builder.ifStatement = function ifStatement(test, condition, alternate, loc) {};
    builder.switchStatement = function (discriminant, cases, isLexical, loc) {};
    builder.whileStatement = function whileStatement(test, body, loc) {};
    builder.withStatement = function withStatement(obj, body, loc) {};
    builder.debuggerStatement = function debuggerStatement(loc) {};
    builder.tryStatement = function (block, handler, guard, finalizer, loc) {};
    builder.forInStatement = function forInStatement(left, right, body, isForEach, loc) {};
    builder.forOfStatement = function forOfStatement(left, right, body, loc) {};
    builder.forOfStatement = function forOfStatement(init, condition, update, body, loc) {};
    builder.doWhileStatement = function doWhileStatement(body, test, loc) {};
    builder.throwStatement = function (expression, loc) {};
    builder.breakStatement = function (label, loc) {};
    builder.continueStatement = function (label, loc) {};
    builder.returnStatement = function (expression, loc) {};

    return builder;
});

/*
############################################################################################################################################################################################################

	
############################################################################################################################################################################################################
*/

define("lib/api", function (require, exports, module) {

    "use strict";

    var heap = require("lib/heap");
    var i18n = require("lib/i18n-messages");

    // I had these variables at the beginning, i return to;
    var realm, intrinsics, globalEnv, globalThis;
    var stack, eventQueue;
    

    // ===========================================================================================================
    // all and empty are special objects
    // ===========================================================================================================

    var all = {
        toString: function () {
            return "[all imports/exports value]";
        }
    };
    var empty = {
        toString: function () {
            return "[empty completion value]";
        }
    };

    exports.all = all;
    exports.empty = empty;

    var statics = require("lib/slower-static-semantics");
    var Contains = statics.Contains;
    var BoundNames = statics.BoundNames;
    var IsSimpleParameterList = statics.IsSimpleParameterList;
    var VarDeclaredNames = statics.VarDeclaredNames;
    var LexicallyDeclaredNames = statics.LexicallyDeclaredNames;
    var dupesInTheTwoLists = statics.dupesInTheTwoLists
    var ExpectedArgumentCount = statics.ExpectedArgumentCount;
    var ModuleRequests = statics.ModuleRequests;
    var parse = require("lib/parser");
    var parseGoal = parse.parseGoal;
    var debugmode = false;

    function debug() {
        if (debugmode && typeof importScripts !== "function") console.log.apply(console, arguments);
    }

    function debugdir() {
        if (debugmode && typeof importScripts !== "function") console.dir.apply(console, arguments);
    }

    // ===========================================================================================================
    // quick getters for realm, env, intrnscs
    // ===========================================================================================================

    
    exports.getEventQueue = getEventQueue;

    function getContext() {
        var stack = getStack();
        if (stack)
            return stack[stack.length - 1];
    }

    function getEventQueue() {
        return realm.eventQueue;
    }

    function newContext(outer, s) {
        var env = outer !== undefined ? outer : getLexEnv();
        s = s || Object.create(null);
        var cx = new ExecutionContext(env, getRealm(), s);
        getStack().push(cx);
        return (realm.cx = cx); 
    }

    function oldContext() {
        var stack = getStack();
        stack.pop();
        return (realm.cx = stack[stack.length - 1]);
    }

    function dropExecutionContext() {
        return getStack().pop();
    }

    function getGlobalThis() {
        //return globalThis;
        return realm.globalThis;
    }

    function getGlobalEnv() {
        //return globalEnv;
        return realm.globalEnv;
    }

    function getIntrinsics() {
        //return intrinsics;
        return realm.intrinsics;
    }

    function getIntrinsic(name) {
        //var desc = intrinsics.Bindings[name];
        var desc = realm.intrinsics.Bindings[name];
        return desc && desc.value;
    }

    function getRealm() {
        return realm;
    }

    function getLexEnv() {
        var cx = getContext();
        if (cx) return cx.lexEnv;
        //    return getGlobalEnv().lexEnv;
    }

    function getVarEnv() {
        var cx = getContext();
        if (cx) return cx.varEnv;
        //    return getGlobalEnv().objEnv;
    }

    function getState() {
        return realm.xs;
    }

    function getStack() {
        return realm.stack;
    }

    // ===========================================================================================================
    // notes for the encoder 
    // ===========================================================================================================

    var object_types = {
        "1": "[object OrdinaryObject]",
        "2": "[object ArrayExoticObject]",
        "3": "[object OrdinaryFunction]",
        "4": "[object ArgumentsExoticObject]",
        "5": "[object StringExoticObject]",
        "6": "[object ProxyExoticObject]",
        "7": "[object SymbolPrimitiveType]",
        "8": "[object IndegerIndexedExoticObject]"
    };

    function getType(object) {
        return object_types[object[0]] || "[object OrdinaryObject]";
    }
    var type_table = {
        "1": "object",
        "2": "object",
        "3": "object",
        "4": "object",
        "5": "object",
        "6": "object",
        "7": "symbol"
    };

    // ===========================================================================================================
    // xs internal slots of objects (later xses bytecode instead of properties)
    // ===========================================================================================================

    var internals_encode = {
        // Objects
        "Type": 0,
        "Extensible": 1,
        "Bindings": 2,
        "Symbols": 3,
        "es5id": 4,
        // Functions
        "FunctionKind": 5,
        "Environment": 6,
        "FormalParameters": 7,
        "Code": 8,
        "HomeObject": 9,
        "MethodName": 10,
        // Bound Functions
        "BoundTargetFunction": 11,
        "BoundThis": 12,
        "BoundParameters": 13,
        // Object Wrappers
        "StringData": 14,
        "NumberData": 14,
        "DateValue": 14,
        "JSONTag": 14,
        "MathTag": 14,
        // Generator
        "GeneratorState": 14,
        "GeneratorContext": 15,
        // Maps
        "MapData": 16,
        "MapComparator": 17,
        "__mapSetInternalUniqueKey__": 18,
        // Promises
        "IsPromise": 19,
        // Observe
        "Notifier": 20
    };

    var internals_decode = Object.create(null);
    for (var k in internals_encode) {
        internals_decode[internals_encode[k]] = k;
    
    }


    function createGenericRecord(obj) {
        // interface for bytecode encoding of objects
        return obj;
    }


    function compareInternalSlot(O, N, V) {
        var value = getInternalSlot(O, N);
        return value === V;
    }

    function getInternalSlot(O, N) {
        return O[N];
    }

    function setInternalSlot(O, N, V) {
        return O[N] = V;
    }

    function hasInternalSlot(O, N) {
        return N in O;
    }




    //
    // call internal
    // 

    function callInternalSlot(name, object, a, b, c, d, e, f, g) {
        return object[name](a,b,c,d,e,f,g);
        // return getFunction(object, name).call(object, a, b, c, d, e, f, g);
    }

    function applyInternal(name, object, argList) {
        return getFunction(object, name).apply(object, argList);
    }

    function Call(F, thisArg, argList) {
        var call = getInternalSlot(F, "Call");
        if (call) return call.call(F, thisArg, argList);
    }

    
    //
    // choose right internal function of object (got no polymorphism and auto type detection)
    //

    var function_table = {
        "[object OrdinaryObject]": OrdinaryObject.prototype, // rename to ordinaryobjectfunctions and fix (this) parameter and call in callInternalSlot 
        "[object ArrayExoticObject]": ArrayExoticObject.prototype,
        "[object OrdinaryFunction]": OrdinaryFunction.prototype,
        "[object ArgumentsExoticObject]": ArgumentsExoticObject.prototype,
        "[object StringExoticObject]": StringExoticObject.prototype,
        "[object ProxyExoticObject]": ProxyExoticObject.prototype,
        "[object PromiseExoticObject]": OrdinaryObject.prototype,
        "[object SymbolPrimitiveType]": SymbolPrimitiveType.prototype,
        "[object EddiesDOMObjectWrapper]": ExoticDOMObjectWrapper.prototype,
        "[object EddiesDOMFunctionWrapper]": ExoticDOMFunctionWrapper.prototype,
        "[object IntegerIndexedExoticObject]": IntegerIndexedExoticObject.prototype
    };

    function getFunction(obj, name) {
        var func;
        var proto = function_table[obj.toString()];
        if (proto && (func = proto[name])) return func;
        proto = OrdinaryObject.prototype;
        func = proto[name];
        return func;
    }

    // ===========================================================================================================
    // raw read and write property descriptor (string and symbol assign to bindings/symbol)
    // ===========================================================================================================

    function readPropertyDescriptor(object, name) {
        if (IsSymbol(name)) {
            return object["Symbols"][name.es5id];
        } else {
            return object["Bindings"][name];
        }
        /*if (IsSymbol(name)) {
		return getInternalSlot(getInternalSlot(object, "Symbols"), getInternalSlot(name,"es5id"));
	} else {
		return getInternalSlot(getInternalSlot(object,"Bindings"),name);
	}*/
    }

    exports.writePropertyDescriptor = writePropertyDescriptor;

    function writePropertyDescriptor(object, name, value) {
        if (IsSymbol(name)) {
            return object["Symbols"][name.es5id] = value;
        } else {
            return object["Bindings"][name] = value;
        }
        /*if (IsSymbol(name)) {
		return setInternalSlot(getInternalSlot(object, "Symbols"), getInternalSlot(name,"es5id"),  value);
	} else {
		return setInternalSlot(getInternalSlot(object,"Bindings"), name, value);
	}*/
    }

    // ===========================================================================================================
    // ReturnIfAbrupt(argument) ==> if ((value=ifAbrupt(value))&&isAbrupt(value))return value;
    // ===========================================================================================================

    function unwrap(arg) {
        if (arg instanceof CompletionRecord) return arg.value;
        return arg;
    }

    // unwrap the argument, if it not abrupt

    function ifAbrupt(argument) {
        if (!(argument instanceof CompletionRecord) || argument.type !== "normal") return argument;
        return argument.value;
    }
    //if (argument && (typeof argument === "object") && (argument.toString() === "[object CompletionRecord]") && argument.type === "normal") return argument.value;

    //if (typeof argument !== "object" || !argument) return argument;
    //if (argument.toString() === "[object CompletionRecord]" && argument.type !== "normal") return argument;

    //return argument.value;

    // return finally true, if abrupt
    function isAbrupt(completion) {
        return (completion instanceof CompletionRecord && completion.type !== "normal");
    }
    // return (completion && typeof completion === "object" && (""+completion === "[object CompletionRecord]") && completion.type !== "normal");
    //if (completion && typeof completion === "object" && completion.toString() === "[object CompletionRecord]" && completion.type !== "normal") return true;
    //if (completion instanceof CompletionRecord && completion.type !== "normal") return true;

    // ===========================================================================================================
    // Ordinary Object
    // ===========================================================================================================

    function OrdinaryObject(prototype) {
        var O = Object.create(OrdinaryObject.prototype);
        prototype = prototype === undefined ? getIntrinsic("%ObjectPrototype%") || null : prototype;
        setInternalSlot(O,"Bindings",Object.create(null));
	    setInternalSlot(O,"Symbols",Object.create(null));
	    setInternalSlot(O,"Prototype",prototype || null);
	    setInternalSlot(O,"Extensible", true);
        return O;
    }
    OrdinaryObject.prototype = {
        constructor: OrdinaryObject,
        type: "object",
        toString: function () {
            return "[object OrdinaryObject]";
        },
        Get: function (P, R) {
            return OrdinaryObjectGet(this, P, R);
        },
        Set: function (P, V, R) {
            return Set(this, P, V, R);
        },
        Invoke: function (P, A, R) {
            return OrdinaryObjectInvoke(this, P, A, R);
        },
        Delete: function (P) {
            return Delete(this, P);
        },
        DefineOwnProperty: function (P, D) {
            return DefineOwnProperty(this, P, D);
        },
        GetOwnProperty: function (P) {
            return GetOwnProperty(this, P);
        },
        OwnPropertyKeys: function () {
            return OwnPropertyKeys(this);
        },
        Enumerate: function () {
            return Enumerate(this);
        },
        HasProperty: function (P) {
            return HasProperty(this, P);
        },
        HasOwnProperty: function (P) {
            if (IsPropertyKey(P)) {
                //P = unwrap(P);
                if (IsSymbol(P)) {
                    if (this.Symbols[P.es5id] !== undefined) return true;
                } else {
                    P = ToString(P);
                    if (this.Bindings[P]) return true;
                }
            }
            return false;

        },
        GetPrototypeOf: function () {
            // return GetPrototypeOf(this);
            return this.Prototype;
        },
        SetPrototypeOf: function (P) {
            //    return SetPrototypeOf(this, P);
            this.Prototype = unwrap(P);
        },
        IsExtensible: function () {
            return IsExtensible(this);
        },
        PreventExtensions: function () {
            return PreventExtensions(this);
        }
    };

    // ===========================================================================================================
    // essential methods
    // ===========================================================================================================

    function GetPrototypeOf(V) {
        if (Type(V) !== "object") return withError("Type", "argument is not an object");
        return getInternalSlot(V, "Prototype") || null;
    }

    function SetPrototypeOf(O, V) {
        if (Type(V) !== "object" && Type(V) !== "null") return withError("Type", "Assertion: argument is either object or null, but it is not.");
        var extensible = getInternalSlot(O, "Extensible");
        var current = getInternalSlot(O, "Prototype");
        if (SameValue(V, current)) return true;
        if (!extensible) return false;
        if (V !== null) {
            var p = V;
            while (p !== null) {
                if (SameValue(p, O)) return false;
                var nextp = GetPrototypeOf(p);
                if ((nextp = ifAbrupt(nextp)) && isAbrupt(nextp)) return nextp;
                p = nextp;
            }
        }
        setInternalSlot(O, "Prototype", V);
        return true;
    }

    function Delete(O, P) {
        var v;
        if (IsSymbol(P)) v = O.Symbols[P.es5id];
        else(v = O.Bindings[P]);
        if (v) {
            if (v.configurable) {
                if (IsSymbol(P)) {
                    O.Symbols[P.es5id] = undefined;
                    delete O.Symbols[P.es5id];
                } else {
                    O.Bindings[P] = undefined;
                    delete O.Bindings[P];
                }
                return true;
            }
        }
        return false;
    }

    function Get(O, P) {
        Assert(Type(O) === "object", "Get(O,P): expecting object");
        Assert(IsPropertyKey(P));
        return callInternalSlot("Get", O, P, O);
        //var func = getFunction(O, "Get");
        //return func.call(O,P,O);
    }

    function OrdinaryObjectGet(O, P, R) {
        Assert(IsPropertyKey(P), "Get (object) expects a valid Property Key (got " + P + ")")

        var desc = callInternalSlot("GetOwnProperty", O, P);
        if ((desc = ifAbrupt(desc)) && isAbrupt(desc)) return desc;
        

        if (desc === undefined) {
            var parent = GetPrototypeOf(O);
            if (isAbrupt(parent)) return parent;
            parent = ifAbrupt(parent);

            if (parent === null) return undefined;
            return parent.Get(P, R);
        }

        var getter;
        if (IsDataDescriptor(desc)) return desc.value;
        else if (IsAccessorDescriptor(desc)) {
            getter = desc.get;
            if (getter === undefined) return undefined;
            else return callInternalSlot("Call", getter, R, []);
        }

        return undefined;
    }

    function Set(O, P, V, R) {
        var ownDesc, parent, setter;
        Assert(IsPropertyKey(P), "Set (object) expects a valid Property Key")

        ownDesc = callInternalSlot("GetOwnProperty", O, P); // readPropertyDescriptor(O, P);
        if ((ownDesc == ifAbrupt(ownDesc)) && isAbrupt(ownDesc)) return ownDesc;
        
        if (ownDesc === undefined) {
            parent = GetPrototypeOf(O);
            if ((parent = ifAbrupt(parent)) && isAbrupt(parent)) return parent;
            if (parent !== null) {
                return parent.Set(P, V, R);
            }
        }

        // von unter isdata hoch gehoben
        else if (IsAccessorDescriptor(ownDesc)) {
            var setter = ownDesc.set;
            if (setter === undefined) return false;
            var setterResult = callInternalSlot("Call", setter, R, [V]);
            if (isAbrupt(setterResult)) return setterResult;
            return true;
        }

        ownDesc = {
            value: undefined,
            writable: true,
            configurable: true,
            enumerable: true
        };

        if (IsDataDescriptor(ownDesc)) {

            if (ownDesc.writable == false) return false;
            if (Type(R) !== "object") return false;

            var existingDescriptor = R.GetOwnProperty(P);
            if ((existingDescriptor = ifAbrupt(existingDescriptor)) && isAbrupt(existingDescriptor)) return existingDescriptor;

            if (existingDescriptor !== undefined) {
                var valueDesc = {
                    value: V
                };
                return R.DefineOwnProperty(P, valueDesc);
            } else {
                return CreateDataProperty(R, P, V);
            }

        }

        
        return false;

    }

    function Invoke(O, P, args) {
        var obj;
        Assert(IsPropertyKey(P), "Invoke: expecting property key");
        if (!Array.isArray(args)) args = [];
        obj = ToObject(O);
        if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
        var func = callInternalSlot("Get", obj, P, O);
        if (!IsCallable(func)) return withError("Type", "Invoke: expected function is not callable");
        if ((func = ifAbrupt(func)) && isAbrupt(func)) return func;
        return callInternalSlot("Call", func, O, args);
    }

    function OrdinaryObjectInvoke(O, P, A, R) {
        Assert(IsPropertyKey(P), "expecting property key");
        Assert(Array.isArray(A), "expecting arguments list");
        var method = O.Get(P, R);
        if ((method = ifAbrupt(method)) && isAbrupt(method)) return method;
        if (Type(method) !== "object") return withError("Type", "Invoke: method " + P + " is not an object");
        if (!IsCallable(method)) return withError("Type", "Invoke: method " + P + " is not callable");
        return method.Call(R, A);
    }

    function DefineOwnProperty(O, P, Desc) {
        return OrdinaryDefineOwnProperty(O, P, Desc);
    }

    function HasOwnProperty(O, P) {
        Assert(Type(O) === "object", "HasOwnProperty: first argument has to be an object");
        Assert(IsPropertyKey(P), "HasOwnProperty: second argument has to be a valid property key, got " + P);

        var desc = callInternalSlot("GetOwnProperty", O, P);
        if (desc === undefined) return false;
        return true;
    }

    function HasProperty(O, P) {
        do {
            if (HasOwnProperty(O, P)) return true;
        } while (O = GetPrototypeOf(O));
        return false;
    }

    function Enumerate(O) {
        var propList, name, proto, bindings, desc, index, denseList, isSparse;
        var duplicateMap = Object.create(null);
        propList = [];

        var chain = [];
        proto = O;
        while (proto != null) {
            chain.push(proto);
            proto = GetPrototypeOf(proto);
        }
        // 1) protoypes
        // dupes werden undefined gesetzt
        for (var k = chain.length -1; k >= 0; k--) {
            var obj = chain[k];
            bindings = obj.Bindings;
            for (name in bindings) {
                if (Type(name) === "string") {
                    desc = OrdinaryGetOwnProperty(obj, name);
                    if (desc.enumerable === true) {
                        if ((index = duplicateMap[name]) !== undefined) {
                            propList[index] = undefined;
                            isSparse = true;
                        }
                        duplicateMap[name] = propList.push(name) - 1;
                    }
                }
            }
        }

        if (isSparse) {
            denseList = [];
            for (var i = 0, j = propList.length; i < j; i++) {
                if ((name = propList[i]) !== undefined) denseList.push(name);
            }
            return MakeListIterator(denseList);
        }
        return MakeListIterator(propList);
    }

    function OwnPropertyKeys(O) {
        var keys = [];
        var bindings = O.Bindings;
        var key;
        for (key in bindings) {
            keys.push(key);
        }
        //return keys;
        return MakeListIterator(keys);
    }

    function OwnPropertyKeysAsList(O) {
        var keys = [];
        var bindings = O.Bindings;
        var key;
        for (key in bindings) {
            keys.push(key);
        }
        return keys;
    }

    function CreateListIterator(list) {

    }

    function MakeListIterator(list) {
        var nextPos = 0;
        var len = list.length;

        var listIteratorNext = CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
            var value, done;
            if (nextPos < len) {
                value = list[nextPos];
                nextPos = nextPos + 1;
                done = (nextPos === len);
                return CreateItrResultObject(value, done);
            }
            return CreateItrResultObject(undefined, true);
        });

        var obj = ObjectCreate();
        if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
        CreateDataProperty(obj, "next", listIteratorNext);
        return obj;
    }

    function IsExtensible(O) {
        if (Type(O) === "object") return !!getInternalSlot(O, "Extensible");
        return false;
    }

    function PreventExtensions(O) {
        setInternalSlot(O, "Extensible", false);
    }

    // ===========================================================================================================
    // Ordinary Function
    // ===========================================================================================================

    function OrdinaryFunction() {
        var F = Object.create(OrdinaryFunction.prototype);
        setInternalSlot(F, "Bindings", Object.create(null));
        setInternalSlot(F, "Symbols", Object.create(null));
        setInternalSlot(F, "Prototype", getIntrinsic("%FunctionPrototype%"));
        setInternalSlot(F, "Realm", undefined);
        setInternalSlot(F, "Extensible", true);
        F.Realm = undefined;
        F.Extensible = true;
        setInternalSlot(F, "Environment", undefined);
        setInternalSlot(F, "Code", undefined);
        setInternalSlot(F, "FormalParameters", undefined);
        return F;
    }

    OrdinaryFunction.prototype = {
        constructor: OrdinaryFunction,
        type: "object",
        toString: function () {
            return "[object OrdinaryFunction]";
        },
        Get: function (P, R) {
            var v = OrdinaryObjectGet(this, P, R);
            if (P === "caller" && IsCallable(v) && getInternalSlot(v, "Strict")) return null;
            return v;
        },
        GetOwnProperty: function (P) {
            var d = GetOwnProperty(this, P);
            if (P === "caller" && IsCallable(v) && getInternalSlot(v, "Strict")) d.value = null;
            return d;
        },
        Call: function () {
            // MODULE INTERDEPENDENCY -> call is from "lib/runtime"
            return exports.Call.apply(this, arguments);
        },
        Construct: function (argList) {
            return OrdinaryConstruct(this, argList);
        }
    };
    addMissingProperties(OrdinaryFunction.prototype, OrdinaryObject.prototype);

    // ===========================================================================================================
    // Declarative Environment
    // ===========================================================================================================

    function DeclarativeEnvironment(outer) {
        this.Bindings = Object.create(null);
        this.outer = outer || null;
    }
    DeclarativeEnvironment.prototype = {
        constructor: DeclarativeEnvironment,
        toString: function () {
            return "[object DeclarativeEnvironment]";
        },
        HasBinding: function HasBinding(N) {
            debug("hasbinding of decl called with " + N);
            return (N in this.Bindings);
        },
        CreateMutableBinding: function CreateMutableBinding(N, D) {
            var envRec = this.Bindings;
            debug("declenv create mutablebinding: " + N);
            var configValue = D === true || D === undefined ? true : false;
            if (N in envRec) return withError("Reference", N + " is bereits deklariert");
            else createIdentifierBinding(envRec, N, undefined, configValue);
            return NormalCompletion();
        },
        CreateImmutableBinding: function CreateImmutableBinding(N) {
            debug("declenv create immutablebinding: " + N);
            var envRec = this.Bindings;
            var configValue = false;
            if (N in envRec) return withError("Reference", N + " is bereits deklariert");
            else createIdentifierBinding(envRec, N, undefined, configValue, false);
            return NormalCompletion();
        },
        InitialiseBinding: function (N, V) {
            debug("declenv initialise: " + N);
            var b, outerEnv;
            if (this.HasBinding(N)) {
                b = this.Bindings[N];
                if (!b.initialised) {
                    b.value = V;
                    b.initialised = true;
                    return true;
                }
                return false;
            } else if (outerEnv = this.outer) return outerEnv.InitialiseBinding(N, V);
            return false;
        },
        SetMutableBinding: function (N, V, S) {
            var b, o;
            if (this.HasBinding(N)) {
                b = this.Bindings[N];
                if (b.writable || !b.initialised) {
                    b.value = V;
                    if (!b.initialised) b.initialised = true;
                }
                //    	    else if (!b.writable) return withError("Reference", "Trying to set immutable binding.");
                //    	    else if (!b.initialised) return withError("Reference", "Trying to set uninitialised binding.");
                return NormalCompletion(b.value);
            } else if (o = this.outer) return o.SetMutableBinding(N, V, S);
        },
        GetBindingValue: function (N, S) {
            var b;
            if (this.HasBinding(N)) {
                b = this.Bindings[N];
                if (!b.initialised) return NormalCompletion(undefined);
                return NormalCompletion(b.value);
            } else if (this.outer) return this.outer.GetBindingValue(N, S);
            return withError("Reference", "GetBindingValue: Can not find " + N);
        },
        DeleteBinding: function DeleteBinding(N) {
            if (this.HasBinding[N]) {
                this.Bindings[N] = undefined;
                delete this.Bindings[N];
            } else if (this.outer) return this.outer.DeleteBinding(N);
        },
        GetIdentifierReference: function (name, strict) {
            return GetIdentifierReference(this, name, strict);
        },
        HasThisBinding: function () {
            return false;
        },
        HasSuperBinding: function () {
            return false;
        },
        WithBaseObject: function () {
            return undefined;
        }
    };

    // ===========================================================================================================
    // BoundFunctionCreate
    // ===========================================================================================================

    function BoundFunctionCreate(B, T, argList) {
        var F = OrdinaryFunction();
        setInternalSlot(F, "BoundTargetFunction", B);
        setInternalSlot(F, "BoundThis", T);
        setInternalSlot(F, "BoundArguments", argList.slice());
        setInternalSlot(F, "Prototype", getIntrinsic("%FunctionPrototype%"));
        setInternalSlot(F, "Extensible", true);
        setInternalSlot(F, "Call", function (any, argList) {
            var B = getInternalSlot(F, "BoundTargetFunction");
            var T = getInternalSlot(F, "BoundThis");
            var A = getInternalSlot(F, "BoundArguments").concat(argList)
            return callInternalSlot("Call", B, T, A);
        });
        return F;
    }

    // ===========================================================================================================
    // Function Environment
    // ===========================================================================================================

    function FunctionEnvironment(F, T) {
        this.BoundFunction = F;
        this.thisValue = T;
        this.Bindings = Object.create(null);
        this.outer = getInternalSlot(F,"Environment");
    }
    FunctionEnvironment.prototype = assign(FunctionEnvironment.prototype, {
        HasThisBinding: function () {
            return true;
        },
        GetThisBinding: function () {
            return this.thisValue;
        },
        HasSuperBinding: function () {
            return !!this.BoundFunction.HomeObject;
        },
        GetSuperBase: function () {
            return this.BoundFunction.HomeObject;
        },
        GetMethodName: function () {
            return this.BoundFunction.MethodName;
        },
        WithBaseObject: function () {
            debug("FunctionEnv: WithBaseObject");
            return undefined;
        },
        toString: function () {
            return "[object FunctionEnvironment]";
        },
        constructor: FunctionEnvironment
    });
    addMissingProperties(FunctionEnvironment.prototype, DeclarativeEnvironment.prototype);

    // ===========================================================================================================
    // Object Environment
    // ===========================================================================================================

    function ObjectEnvironment(O, E) {
        this.Unscopables = Object.create(null);
        this.BoundObject = O;
        this.outer = E;
    }
    ObjectEnvironment.prototype = {
        constructor: ObjectEnvironment,
        toString: function () {
            return "[object ObjectEnvironment]";
        },
        HasBinding: function (N) {
            debug("objectenv: hasbinding mit key: " + N);
            var bindings = this.BoundObject;
            if (this.Unscopables[N]) return false;
            if (this.withEnvironment) {
                var unscopables = bindings.Get($$unscopables, bindings);
                if ((unscopables = ifAbrupt(unscopables)) && isAbrupt(unscopables)) return unscopables;
                if (Type(unscopables) === "object") {
                    var found = HasOwnProperty(unscopables, N);
                    if ((found = ifAbrupt(found)) && isAbrupt(found)) return found;
                    if (found === true) return false;
                }
            }
            return HasProperty(bindings, N);
        },
        CreateMutableBinding: function (N, D) {
            debug("object env: createmutablebinding mit key: " + N);
            var O = this.BoundObject;
            var configValue = D === true ? true : false;
            return callInternalSlot("DefineOwnProperty", O,N, {
                value: undefined,
                writable: true,
                enumerable: false,
                configurable: configValue
            });
        },
        CreateImmutableBinding: function (N) {
            var O = this.BoundObject;
            return callInternalSlot("DefineOwnProperty", O,N, {
                value: undefined,
                writable: false,
                enumerable: false,
                configurable: false
            });
        },
        GetBindingValue: function (N) {
            var O = this.BoundObject;
            Assert(Type(O) === "object", "ObjectEnvironment: BoundObject has to be of Type Object");
            return O.Get(N, O);
        },

        InitialiseBinding: function (N, V) {
            var O = this.BoundObject;
            return O.Set(N, V, O);
        },
        SetMutableBinding: function (N, V) {
            var O = this.BoundObject;
            return O.Set(N, V, O);
        },
        DeleteBinding: function (N) {
            var O = this.BoundObject;
            return O.Delete(N);
        },

        HasThisBinding: function () {
            return true;
        },

        HasSuperBinding: function () {
            return !!this.HomeObject;
        },
        GetSuperBase: function () {
            return this.HomeObject;
        },

        WithBaseObject: function () {
            var O = this.BoundObject;
            return O;
        },
        GetThisBinding: function () {
            var O = this.BoundObject;
            return O;
        }
    };
    // ===========================================================================================================
    // Global Environment
    // ===========================================================================================================

    function GlobalEnvironment(globalThis) {

        this.outer = null;
        this.objEnv = NewObjectEnvironment(globalThis, this.outer);
        this.objEnv.toString = function () {
            return "[object GlobalVariableEnvironment]";
        };

        this.lexEnv = new DeclarativeEnvironment(this.objEnv);
        this.lexEnv.toString = function () {
            return "[object GlobalLexicalEnvironment]";
        };
        this.VarNames = Object.create(null);

        for (var k in globalThis.Bindings) {
            if (globalThis.HasOwnProperty(k)) this.VarNames[k] = true;
        }
    }
    GlobalEnvironment.prototype = {
        constructor: GlobalEnvironment,

        toString: function () {
            return "[object GlobalEnvironment]";
        },

        HasBinding: function (N) {
            if (this.lexEnv.HasBinding(N)) return true;
            if (this.objEnv.HasBinding(N)) return true;
            return false;
        },
        CreateMutableBinding: function (N, D) {
            return this.lexEnv.CreateMutableBinding(N, D);
        },
        CreateImmutableBinding: function (N) {
            return this.lexEnv.CreateImmutableBinding(N);
        },
        GetBindingValue: function (N, S) {
            if (this.lexEnv.HasBinding(N)) return this.lexEnv.GetBindingValue(N, S);
            else if (this.objEnv.HasBinding(N)) return this.objEnv.GetBindingValue(N, S);
        },
        InitialiseBinding: function (N, V, S) {
            if (this.lexEnv.HasBinding(N)) return this.lexEnv.InitialiseBinding(N, V, S);
            else if (this.objEnv.HasBinding(N)) return this.objEnv.InitialiseBinding(N, V, S);
            return false;
        },
        SetMutableBinding: function (N, V, S) {
            if (this.lexEnv.HasBinding(N)) return this.lexEnv.SetMutableBinding(N, V, S);
            else if (this.objEnv.HasBinding(N)) return this.objEnv.SetMutableBinding(N, V, S);
            return false;
        },
        DeleteBinding: function (N) {
            if (this.lexEnv.HasBinding(N)) {
                return this.lexEnv.DeleteBinding(N);
            } else if (this.objEnv.HasBinding(N)) {
                var status = this.objEnv.DeleteBinding(N);
                if (status === true) {
                    this.VarNames[N] = undefined;
                }
                return status;
            }
            return false;
        },
        HasThisBinding: function () {
            return true;
        },
        HasSuperBinding: function () {
            return false;
        },
        WithBaseObject: function () {
            return this.objEnv;
        },
        GetThisBinding: function () {
            return this.objEnv.GetThisBinding();
        },
        HasVarDeclaration: function (N) {
            if (this.VarNames[N]) return true;
            return false;
        },
        HasLexicalDeclaration: function (N) {
            if (this.lexEnv.HasBinding(N)) return true;
            return false;
        },
        CanDeclareGlobalVar: function (N) {
            debug("candeclarevar");
            if (this.objEnv.HasBinding(N)) return true;
            return this.objEnv.BoundObject.IsExtensible();
        },
        CanDeclareGlobalFunction: function (N) {
            debug("candeclarefunc");
            var objRec = this.objEnv;
            var globalObject = objRec.BoundObject;
            var extensible = globalObject.IsExtensible();
            if ((extensible = ifAbrupt(extensible)) && isAbrupt(extensible)) return extensible;
            if (objRec.HasBinding(N) === false) return extensible;
            var existingProp = globalObject.GetOwnProperty(N);
            if (!existingProp) return extensible;
            if (IsDataDescriptor(existingProp) && existingProp.writable && existingProp.enumerable) return true;
            debug("returning false");
            return false;
        },
        CreateGlobalVarBinding: function (N, D) {
            debug("createglobalvar");
            var cpl = this.objEnv.CreateMutableBinding(N, D);
            if ((cpl = ifAbrupt(cpl)) && isAbrupt(cpl)) return cpl;
            cpl = this.objEnv.InitialiseBinding(N, undefined);
            if ((cpl = ifAbrupt(cpl)) && isAbrupt(cpl)) return cpl;
            this.VarNames[N] = true;
        },
        CreateGlobalFunctionBinding: function (N, V, D) {
            debug("createglobalfunction");
            var cpl = this.objEnv.CreateMutableBinding(N, D);
            if ((cpl = ifAbrupt(cpl)) && isAbrupt(cpl)) return cpl;
            cpl = this.objEnv.InitialiseBinding(N, V);
            if ((cpl = ifAbrupt(cpl)) && isAbrupt(cpl)) return cpl;
            this.VarNames[N] = true;
        }
    };

    // ===========================================================================================================
    // Assert
    // ===========================================================================================================

    function Assert(act, message) {
        if (!act) {
            var cx = getContext();
            var node = cx.state.node;
            if (node) {
                var loc = node.loc;
                if (loc) {
                    var line = loc.start.line;
                    var col = loc.start.column;
                }
            }
            throw new Error("Assertion failed: " + message + " (at: line " + line + ", column " + col + ")");
        }
    }

    // ===========================================================================================================
    // A List? Unused
    // ===========================================================================================================

    function List() {
        var sentinel = {};
        sentinel.next = sentinel;
        sentinel.prev = sentinel;
        this.sentinel = sentinel;
        this.size = 0;
    }
    List.prototype.insertFirst = function (item) {
        var rec = {
            value: item
        };
        rec.next = this.sentinel;
        rec.prev = this.sentinel.prev;
        this.sentinel.prev.next = rec;
        this.sentinel.prev = rec;
        this.size += 1;
        return this;
    };
    List.prototype.insertLast = function (item) {
        var rec = {
            value: item
        };
        rec.prev = this.sentinel;
        rec.next = this.sentinel.next;
        this.sentinel.next.prev = rec;
        this.sentinel.next = rec;
        this.size += 1;
        return this;
    };
    List.prototype.iterate = function (f) {
        var rec = this.sentinel.next;
        while (rec !== this.sentinel) {
            f(rec.value);
            rec = rec.next;
        }
        return this;
    };
    List.prototype.reverse = function (f) {
        var rec = this.sentinel.prev;
        while (rec !== this.sentinel) {
            f(rec.value);
            rec = rec.prev;
        }
    };
    List.prototype.nth = function (n) {
        var rec, i;
        if (n > this.size - 1 || n < 0) return null;
        if (n < this.size / 2) {
            i = 0;
            rec = this.sentinel;
            do {
                rec = rec.next;
                if (i === n) return rec.value;
                i += 1;
            } while (i <= n);
        } else {
            i = this.size - 1;
            rec = this.sentinel;
            do {
                rec = rec.prev;
                if (i === n) return rec.value;
                i -= 1;
            } while (i >= n);
        }
        return null;
    };
    List.prototype.removeFirst = function () {
        var rec = this.sentinel.next;
        if (rec != this.sentinel) {
            this.sentinel.next = rec.next;
            this.sentinel.next.prev = this.sentinel;
            rec.next = null;
            rec.prev = null;
            this.size -= 1;
            return rec.value;
        }
        return null;
    };
    List.prototype.removeLast = function () {
        var rec = this.sentinel.prev;
        if (rec != this.sentinel) {
            this.sentinel.prev = rec.prev;
            this.sentinel.prev.next = this.sentinel;
            rec.next = null;
            rec.prev = null;
            this.size -= 1;
            return rec.value;
        }
        return null;
    };
    List.prototype.push = List.prototype.insertLast;
    List.prototype.pop = List.prototype.removeLast;
    List.prototype.shift = List.prototype.removeFirst;

    // ===========================================================================================================
    // CodeRealm Object
    //
    // assignIntrinsics
    // createGlobalThis
    // createGlobalEnv
    // sollten zu diesem Objekt gebracht werden
    // wenn ich das erzeuge,
    // erzeuge ich intrinsics, global, env, loader....
    //
    // ===========================================================================================================

    function CodeRealm(intrinsics, gthis, genv, ldr) {
        "use strict";

        this.intrinsics = intrinsics;
        this.globalThis = gthis;
        this.globalEnv = genv;
        this.directEvalTranslate = undefined;
        this.directEvalFallback = undefined;
        this.indirectEval = undefined;
        this.Function = undefined;
        this.loader = ldr;

        this.stack = [];
        this.eventQueue = [];
        this.xs = Object.create(null);

        return this;
    }
    CodeRealm.prototype.toString = CodeRealm_toString;

    function CodeRealm_toString() {
        return "[object CodeRealm]";
    }

    // ===========================================================================================================
    // Execution Context
    // - has got a stack
    // xs.stack = [ctx1, .., ctxn];
    // ===========================================================================================================

    function ExecutionContext(outer, realm, state, generator) {
        "use strict";

        this.state = state || getState();
        this.realm = realm || getRealm();

        outer = outer || null;
        this.varEnv = NewDeclarativeEnvironment(outer);
        this.lexEnv = this.varEnv;

        this.generator = generator;
        realm.cx = this;
    }
    ExecutionContext.prototype.toString = ExecutionContext_toString;

    function ExecutionContext_toString() {
        return "[object ExecutionContext]";
    }

    // ===========================================================================================================
    // Completion Record
    // ===========================================================================================================

    function CompletionRecord(type, value, target) {
        "use strict";
        this.type = type;
        this.value = value;
        this.target = target;
    }

    CompletionRecord.prototype.toString = CompletionRecord_toString;

    function CompletionRecord_toString() {
        return "[object CompletionRecord]";
    }

    var completionUpdater = function (c, v, b) {
        completion = c;
        jsval = v;
        abrupt = b;
    };

    function registerCompletionUpdater(cb) {
        completionUpdater = cb;
    }

    function NormalCompletion(argument, label) {
        var completion = new CompletionRecord(); // realm.completion;
        if (argument instanceof CompletionRecord) {
            completion = argument;
        } else completion.value = argument;
        completion.type = "normal"
        completion.target = label;
        realm.completion = completion;
        return completion;
    }

    function Completion(type, argument, target) {
        var completion = new CompletionRecord();
        if (argument instanceof CompletionRecord) {
            completion = argument;
        } else completion.value = argument;
        completion.type = type || "normal";
        completion.target = target;
        realm.completion = completion;
        return completion;
    }


    // ===========================================================================================================
    // 8.4 Tasks and Task Queues
    // ===========================================================================================================

    function PendingTaskRecord_toString () {
        return "[object PendingTaskRecord]";
    }

    function PendingTaskRecord (task, args, realm) {
        var pendingTaskRecord = Object.create(PendingTaskRecord.prototype);
        pendingTaskRecord.Task = task;
        pendingTaskRecord.Arguments = args;
        pendingTaskRecord.Realm = realm;
        return pendingTaskRecord;
    }
    PendingTaskRecord.prototype = Object.create(null);
    PendingTaskRecord.prototype.constructor = PendingTaskRecord;
    PendingTaskRecord.prototype.toString = PendingTaskRecord_toString;

    function TaskQueue() {
        // use it like an array
        // and use .nextIndex and .nextOne for iteration
        // without the need for a shift() to go forward
        // or to write the code down manually
        var queue = Object.create(Array.prototype);
        Object.defineProperty(queue, "length", {
            value: 0,
            enumerable: false
        });
        // set queue.nextIndex = 0 to start Iteration
        Object.defineProperty(queue, "nextIndex", {
            value: 0,
            enumerable: false
        });
        // test queue.done convenient, wether it´s over
        Object.defineProperty(queue, "done", {
            get: function () {
                return queue.nextIndex >= queue.length;
            },
            enumerable: false
        });
        // use nextOne to get the value at nextIndex and increase
        Object.defineProperty(queue, "nextOne", {
            value: function () {
                if (!queue.done) {
                    var value = queue[queue.nextIndex];
                    queue.nextIndex += 1;
                    return value;
                }
                return undefined;
            },
            enumerable: false
        })
        return queue;
    }


    function makeTaskQueues(realm) {
        realm.LoadingTasks = TaskQueue();
        realm.PromiseTasks = TaskQueue();
    }
    function getTasks(realm, name) {
        return realm[name+"Tasks"];
    }

    function EnqueueTask(queueName, task, args) {        
    }

    function NextTask (result, nextQueue) {
        if ((result=ifAbrupt(result)) && isAbrupt(result)) {
            // performing implementation defined unhandled exception processing
            console.log("NextTask: Got exception - which will remain unhandled - for debugging, i print them out." )
            printException(result);
        }
        Assert(getStack().length === 0, "NextTask: The execution context stack has to be empty");
        var nextPending = nextQueue.shift();

    }
    // ===========================================================================================================
    // Reference 
    // ===========================================================================================================

    function Reference(N, V, S, T) {
        this.name = N;
        this.base = V;
        this.strict = S;
        //if (T !== undefined) 
        this.thisValue = T;
    }

    Reference.prototype = {
        toString: function () {
            return "[object Reference]";
        },
        GetValue: function () {
            return GetValue(this);
        },
        PutValue: function (W) {
            return PutValue(this, W);
        },
        IsPropertyReference: function () {
            return IsPropertyReference(this);
        },
        IsSuperReference: function () {
            return IsSuperReference(this);
        },
        IsStrictReference: function () {
            return IsStrictReference(this);
        },
        IsUnresolvableReference: function () {
            return IsUnresolvableReference(this);
        },
        GetReferencedName: function () {
            return GetReferencedName(this);
        },
        GetReferencedKey: function () {
            return GetReferencedKey(this);
        },
        GetBase: function () {
            return GetBase(this);
        },
        HasPrimitiveBase: function () {
            return HasPrimitiveBase(this);
        },
        GetThisValue: function () {
            return GetThisValue(this);
        },
        constructor: Reference
    };

    function GetValue(V) {

        if ((V = ifAbrupt(V)) && isAbrupt(V)) return V;
        if (Type(V) !== "reference") return V;

        var base = V.base;

        if (IsUnresolvableReference(V)) return withError("Reference", "GetValue: '" + V.name + "' is an unresolvable reference");

        if (IsPropertyReference(V)) {

            if (HasPrimitiveBase(V)) {
                Assert(base !== null && base !== undefined, "base never null or undefined");
                base = ToObject(base);
            }

            // object
            return callInternalSlot("Get", base, V.name, GetThisValue(V));
        } else {
            // environment record
            return base.GetBindingValue(V.name, V.strict);
        }

    }

    function PutValue(V, W) {
        if ((V = ifAbrupt(V)) && isAbrupt(V)) return V;
        if ((W = ifAbrupt(W)) && isAbrupt(W)) return W;
        if (Type(V) !== "reference") return withError("Reference", "PutValue: V is not a reference");
        var base = V.base;

        if (IsUnresolvableReference(V)) {

            //console.log("unresolvable "+V.name);
            if (V.strict) return withError("Reference", "PutValue: unresolvable Reference");
            var globalObj = GetGlobalObject();
            return Put(globalObj, V.name, W, false);

        } else if (IsPropertyReference(V)) {

            if (HasPrimitiveBase(V)) {
                Assert(base !== null && base !== undefined, "base never null or undefined");
                base = ToObject(base);
                var succeeded = base.Set(V.name, W, GetThisValue(V));
                if ((succeeded = ifAbrupt(succeeded)) && isAbrupt(succeeded)) return succeeded;
                if (succeeded === false && V.strict) return withError("Type", "PutValue: succeeded false but strict true");
                return NormalCompletion();
            }

        } else {

            debug("base setmutable " + V.name);

            return base.SetMutableBinding(V.name, W, V.strict);
        }

    }

    function IsPropertyReference(V) {
        var base = GetBase(V);
        if (Type(base) === "object" || HasPrimitiveBase(V)) return true;
        return false;
    }

    function IsSuperReference(V) {
        if (V.thisValue) return true;
        return false;
    }

    function IsUnresolvableReference(V) {
        if (V.base === undefined) return true;
        return false;
    }

    function IsStrictReference(V) {
        return V.strict === true;
    }

    function GetReferencedName(V) {
        return V.name;
    }

    function GetBase(V) {
        return V.base;
    }

    function HasPrimitiveBase(V) {
        var type = Type(GetBase(V));
        if (type === "string" || type === "boolean" || type === "number" || type === "symbol") return true;
        return false;
    }

    function GetThisValue(V) {
        if ((V = ifAbrupt(V)) && isAbrupt(V)) return V;
        if (Type(V) !== "reference") return V;
        if (IsUnresolvableReference(V)) return withError("Reference", "GetThisValue: unresolvable reference");
        if (IsSuperReference(V)) return V.thisValue;
        return GetBase(V);
    }

    // ===========================================================================================================
    // CreateDataProperty
    // ===========================================================================================================

    function CreateOwnAccessorProperty(O, P, G, S) {
        Assert(Type(O) === "object", "CreateAccessorProperty: first argument has to be an object.");
        Assert(IsPropertyKey(P), "CreateAccessorProperty: second argument has to be a valid property key.");
        var D = Object.create(null);
        D.get = G;
        D.set = S;
        D.enumerable = true;
        D.configurable = true;
        return callInternalSlot("DefineOwnProperty", O, P, D);
    }

    function CreateDataProperty(O, P, V) {
        Assert(Type(O) === "object", "CreateDataProperty: first argument has to be an object.");
        Assert(IsPropertyKey(P), "CreateDataProperty: second argument has to be a valid property key.");
        var newDesc = Object.create(null);
        newDesc.value = V;
        newDesc.writable = true;
        newDesc.enumerable = true;
        newDesc.configurable = true;
        return callInternalSlot("DefineOwnProperty", O, P, newDesc);
    }

    function CreateDataPropertyOrThrow(O, P, V) {
        Assert(Type(O) === "object", "CreateDataPropertyOrThrow: first argument has to be an object.");
        Assert(IsPropertyKey(P), "CreateDataPropertyOrThrow: second argument has to be a valid property key.");
        var success = CreateDataProperty(O, P, V);
        if ((success = ifAbrupt(success)) && isAbrupt(success)) return success;
        if (success === false) return withError("Type", "CreateDataPropertyOrThrow: CreateDataProperty failed and returned false.");
        return success;
    }

    function IsPropertyKey(P) {
        if (typeof P === "string") return true;
        if (P instanceof SymbolPrimitiveType) return true;
        return false;
    }

    function PropertyDescriptor(V, W, E, C) {
        var D = Object.create(null); //Object.create(null);
        D.value = V;
        D.writable = W !== undefined ? W : true;
        D.enumerable =  E !== undefined ? E : true;
        D.configurable =  C !== undefined ? C : true;
        return D;
    }

    function IsAccessorDescriptor(desc) {
        if (desc == null) return false;
        if (typeof desc !== "object") return false;
        if (("get" in desc) || ("set" in desc)) return true;
        return false;
    }

    function IsDataDescriptor(desc) {
        if (desc == null) return false;
        if (typeof desc !== "object") return false;
        if (("value" in desc) || ("writable" in desc)) return true;
        return false;
    }

    function IsGenericDescriptor(desc) {    // hat nur enum oder config props
        if (desc === null) return false;
        if (typeof desc !== "object") return false;
        if (!IsAccessorDescriptor(desc) && !IsDataDescriptor(desc) &&
            (("configurable" in desc) || ("enumerable" in desc))) return true;
        return false;
    }

    function FromPropertyDescriptor(desc) {
        if (desc == undefined) return undefined;
        if (desc.Origin) return desc.Origin;
        var obj = ObjectCreate();
        callInternalSlot("DefineOwnProperty", obj,"value", new PropertyDescriptor(desc.value, true, true, true));
        callInternalSlot("DefineOwnProperty", obj,"writable", new PropertyDescriptor(desc.writable, true, true, true));
        callInternalSlot("DefineOwnProperty", obj,"get", new PropertyDescriptor(desc.get, true, true, true));
        callInternalSlot("DefineOwnProperty", obj,"set", new PropertyDescriptor(desc.set, true, true, true));
        callInternalSlot("DefineOwnProperty", obj,"enumerable", new PropertyDescriptor(desc.enumerable, true, true, true));
        callInternalSlot("DefineOwnProperty", obj,"configurable", new PropertyDescriptor(desc.configurable, true, true, true));
        return obj;
    }

    function ToPropertyDescriptor(O) {
        if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
        if (Type(O) !== "object") return withError("Type", "ToPropertyDescriptor");
        var desc = Object.create(null);
        
        if (HasProperty(O, "enumerable")) {
            var enume = Get(O, "enumerable");
            if ((enume = ifAbrupt(enume)) && isAbrupt(enume)) return enume;
            desc.enumerable = enume;
        }
        if (HasProperty(O, "writable")) {
            var write = Get(O, "writable");
            if ((write = ifAbrupt(write)) && isAbrupt(write)) return write;
            desc.writable = write;
        }
        if (HasProperty(O, "configurable")) {
            var conf = Get(O, "configurable");
            if ((conf = ifAbrupt(conf)) && isAbrupt(conf)) return conf;
            desc.configurable = conf;
        }
        if (HasProperty(O, "value")) {
            var value = Get(O, "value");
            if ((value = ifAbrupt(value)) && isAbrupt(value)) return value;
            desc.value = value;
        }

        if (HasProperty(O, "get")) {
            var get = Get(O, "get");
            if ((get = ifAbrupt(get)) && isAbrupt(get)) return get;
            desc.get = get;
        }
        if (HasProperty(O, "set")) {
            var set = Get(O, "set");
            if ((set = ifAbrupt(set)) && isAbrupt(set)) return set;
            desc.set = set;
        }
        desc.Origin = O;
        return desc;
    }

    function IsCompatiblePropertyDescriptor(extensible, Desc, current) {
        return ValidateAndApplyPropertyDescriptor(undefined, undefined, extensible, Desc, current);
    }

    function CompletePropertyDescriptor(Desc, LikeDesc) {
        Assert(typeof LikeDesc === "object" || LikeDesc === undefined, "LikeDesc has to be object or undefined");
        Assert(typeof Desc === "object");
        if (LikeDesc === undefined) LikeDesc = {
            value: undefined,
            writable: false,
            get: undefined,
            set: undefined,
            enumerable: false,
            configurable: false
        };
        if (IsGenericDescriptor(Desc) || IsDataDescriptor(Desc)) {
            if (typeof Desc.writable === "undefined") Desc.writable = LikeDesc.writable;
            if (typeof Desc.value === "undefined") Desc.value = LikeDesc.value;
        } else {
            if (typeof Desc.get === "undefined") Desc.get = LikeDesc.get;
            if (typeof Desc.set === "undefined") Desc.set = LikeDesc.set;
        }
        if (typeof Desc.enumerable === "undefined") Desc.enumerable = LikeDesc.enumerable;
        if (typeof Desc.configurable === "undefined") Desc.configurable = LikeDesc.configurable;
        return Desc;
    }

    function ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current) {
        var same = true, d;
        var isDataDesc = IsDataDescriptor(Desc);
        var isGenericDesc = IsGenericDescriptor(Desc);
        var isAccessorDesc = IsAccessorDescriptor(Desc);

        if (O) Assert(IsPropertyKey(P), "ValidateAndApplyPropertyDescriptor: expecting property key if object is present");

        Assert(typeof Desc === "object", "ValidateAndApplyPropertyDescriptor: Desc must be a descriptor object (btw. current is " + ( !! current) + ")");

        var changeType = "reconfigure"; // o.observe

        if (!current) {

            if (!extensible) return false;

            Assert(extensible, "object has to be extensible");

            if (isGenericDesc || isDataDesc || isAccessorDesc) {
                if (O !== undefined) {    
                    writePropertyDescriptor(O, P, Desc);
                }
            } 
            //	var R = CreateChangeRecord("add", O, P, current, Desc);
            return true;

        } else if (current && Desc) {

            var isDataCurrent = IsDataDescriptor(current);
            var isGenericCurrent = IsGenericDescriptor(current);
            var isAccessorCurrent = IsAccessorDescriptor(current);

            if (Desc.get === undefined &&
                Desc.set === undefined &&
                Desc.writable === undefined &&
                Desc.enumerable === undefined &&
                Desc.configurable === undefined &&
                Desc.value === undefined) {
                return true;
            }

            for (d in Desc) {
                if (Object.hasOwnProperty.call(Desc, d))
                if (current[d] !== Desc[d]) same = false;
            }
            if (same) return true;

            if (current.configurable === false) {
                if (Desc.configurable === true) return false;
                if (Desc.enumerable === !current.enumerable) return false;
            }

            if (isDataCurrent && isDataDesc) {

                 if (current.configurable === false) {
                    if (!current.writable === Desc.writable) return false;
                    if (!current.writable) {
                        if (("value" in Desc) && (current.value !== Desc.value)) return false;
                    }
                }

                /*if (current.writable) {
                    writePropertyDescriptor(O, P, Desc);
                    return true;
                }*/

            } else if (isAccessorCurrent && isAccessorDesc) {
                
                if (current.configurable === false) {
                    if (("set" in Desc) && (Desc.set !== current.set)) return false;
                    if (("get" in Desc) && (Desc.get !== current.get)) return false;
                }/* else {
                    if (Desc.set === undefined) Desc.set === current.set;
                    if (Desc.get === undefined) Desc.get === current.get;
                    writePropertyDescriptor(O, P, Desc);
                    return true;
                }*/

            } else if (isGenericDesc) {
                if (current.configurable === false) return false;
                // convert to accessor
                if (isDataCurrent) {
                    if (O !== undefined) {
                        writePropertyDescriptor(O, P, {
                            get: undefined,
                            set: undefined,
                            enumerable: current.enumerable,
                            configurable: current.configurable
                        });
                        return true;
                    }
                // convert to data
                } else if (isAccessorCurrent) {
                    if (O !== undefined) {
                        writePropertyDescriptor(O, P, {
                            value: undefined,
                            writable: false,
                            enumerable: current.enumerable,
                            configurable: current.configurable
                        });
                        return true;
                    }
                }
            }

            if (O !== undefined) {
                if (isDataDesc && !current.writable) return false;
                
                for (d in Desc) {
                    if (Object.hasOwnProperty.call(Desc, d)) {
                        current[d] = Desc[d];
                    }
                }
                writePropertyDescriptor(O, P, current);
                
            }

            return true;
        }
    }

    function IsSymbol(P) {
        return P instanceof SymbolPrimitiveType;
    }

    function SameValue(x, y) {
        if ((x = ifAbrupt(x)) && isAbrupt(x)) return x;
        if ((y = ifAbrupt(y)) && isAbrupt(y)) return y;
        if (Type(x) !== Type(y)) return false;
        if (Type(x) === "null") return true;
        if (Type(x) === "undefined") return true;
        if (Type(x) === "number") {
            if (x === y) return true;
            if (x === "NaN" && y === "NaN") return true;
            if (x === +0 && y === -0) return false;
            if (x === -0 && y === +0) return false;
            return false;
        }
        if (Type(x) === "string") {
            if ((x.length === y.length) && x === y) return true;
            return false;
        }
        if (Type(x) === "boolean") {
            if ((x && y) || (!x && !y)) return true;
            return false;
        }

        if (Type(x) === "symbol") {
            return x === y;
        }

        if (x === y) return true;
        return false;
    }

    function SameValueZero(x, y) {
        if ((x = ifAbrupt(x)) && isAbrupt(x)) return x;
        if ((y = ifAbrupt(y)) && isAbrupt(y)) return y;
        if (Type(x) !== Type(y)) return false;
        if (Type(x) === "null") return true;
        if (Type(x) === "undefined") return true;
        if (Type(x) === "number") {
            if (x === y) return true;
            if (x === "NaN" && y === "NaN") return true;
            if (x === +0 && y === -0) return true;
            if (x === -0 && y === +0) return true;
            return false;
        }
        if (Type(x) === "string") {
            if ((x.length === y.length) && x === y) return true;
            return false;
        }
        if (Type(x) === "boolean") {
            if ((x && y) || (!x && !y)) return true;
            return false;
        }

        if (Type(x) === "symbol") {
            return x === y;
        }
        if (x === y) return true;
        return false;
    }

    function GetMethod(O, P) {
        Assert(Type(O) === "object" && IsPropertyKey(P) === true, "o has to be object and p be a valid key");
        var method = callInternalSlot("Get", O, P, O);
        if ((method = ifAbrupt(method)) && isAbrupt(method)) return method;
        if (IsCallable(method)) return method;
        else return withError("Type", "GetMethod: " + P + " can not be retrieved");
    }

    function SetIntegrityLevel(O, level) {
        Assert(Type(O) === "object", "object expected");
        Assert(level === "sealed" || level === "frozen", "level must be sealed or frozen");
        var desc;
        if (level === "sealed" || level === "frozen") {
            var pendingException;
            var keys = OwnPropertyKeysAsList(O); // Array statt iterator
            var key;
            var status;
            if (level === "sealed") {
                for (var k in keys) {
                    key = keys[k];
                    desc = OrdinaryGetOwnProperty(O, key);
                    if (desc && desc.configurable) {
                        desc.configurable = false;
                        status = DefineOwnPropertyOrThrow(O, key, desc);
                        if (isAbrupt(status)) {
                            if (!pendingException) pendingException = status;
                        }
                    }
                }
            } else if (level === "frozen") {
                for (var k in keys) {
                    key = keys[k];
                    status = GetOwnProperty(O, k);
                    if (isAbrupt(status)) {
                        if (!pendingException) pendingException = status;
                    } else {
                        var currentDesc = unwrap(status);
                        if (currentDesc) {
                            if (IsAccessorDescriptor(currentDesc)) {
                                desc = Object.create(null);
                                desc.get = currentDesc.get;
                                desc.set = currentDesc.set;
                                desc.enumerable = currentDesc.enumerable;
                                desc.configurable = false;
                                status = DefineOwnPropertyOrThrow(O, key, desc);
                                if (isAbrupt(status)) {
                                    if (!pendingException) pendingException = status;
                                }
                            } else {
                                desc = Object.create(null);
                                desc.value = currentDesc.value;
                                desc.writable = false;
                                desc.enumerable = currentDesc.enumerable;
                                desc.configurable = false;

                                status = DefineOwnPropertyOrThrow(O, key, desc);
                                if (isAbrupt(status)) {
                                    if (!pendingException) pendingException = status;
                                }
                            }
                        }
                    }
                }
            }
            if (pendingException) return pendingException;
            return PreventExtensions(O);
        }
    }

    function TestIntegrityLevel(O, level) {
        Assert(Type(O) === "object", "object expected");
        Assert(level === "sealed" || level === "frozen", "level must be sealed or frozen");
        var status = IsExtensible(O);
        if ((status = ifAbrupt(status)) && isAbrupt(status)) return status;
        if (status === true) return false;
        var keys = OwnPropertyKeysAsList(O); // Array statt iterator
        if ((keys = ifAbrupt(keys)) && isAbrupt(keys)) return keys;
        var pendingException = undefined;
        var key;
        var configurable = false,
            writable = false;
        for (var k in keys) {
            key = keys[k];
            status = GetOwnProperty(O, key);
            if ((status = ifAbrupt(status)) && isAbrupt(status)) {
                if (!pendingException) pendingException = status;
                configurable = true;
            } else {
                var currentDesc = unwrap(status);
                if (currentDesc !== undefined) {
                    configurable = configurable && currentDesc.configurable;
                    if (IsDataDescriptor(currentDesc)) {
                        writable = writable && currentDesc.writable;
                    }
                }
            }
        }
        if (pendingException) return pendingException;
        if (level === "frozen" && writable) return false;
        if (configurable) return false;
    }

    function CreateArrayFromList(list) {
        var array = ArrayCreate(list.length);
        for (var i = 0, j = list.length; i < j; i++) {
            array.Set(ToString(i), list[i], array);
        }
        return array;
    }

    function CreateListFromArrayLike(arrayLike) {
        var list = [];
        for (var i = 0, j = arrayLike.length; i < j; i++) {
            list.push(arrayLike.Get(ToString(i), arrayLike))
        }
        return list;
    }

    var object_tostring_to_type_table = {
        "[object Reference]": "reference",
        "[object CompletionRecord]": "completion",
        "[object GlobalEnvironment]": "environment",
        "[object GlobalVariableEnvironment]": "environment",
        "[object GlobalLexicalEnvironment]": "environment",
        "[object ObjectEnvironment]": "environment",
        "[object FunctionEnvironment]": "environment",
        "[object DeclarativeEnvironment]": "environment",
        "[object OrdinaryObject]": "object",
        "[object OrdinaryFunction]": "object",
        "[object ProxyExoticObject]": "object",
        "[object PromiseExoticObject]": "object",
        "[object IntegerIndexedExoticObject]": "object",
        "[object StringExoticObject]": "object",
        "[object ArrayExoticObject]": "object",
        "[object ArgumentsExoticObject]": "object",
        "[object SymbolPrimitiveType]": "symbol"
    };

    var primitive_type_string_table = {
        "[object SymbolPrimitiveType]": "symbol",
        "number": "number",
        "string": "string",
        "boolean": "boolean",
        "undefined": "undefined"
    };

    // ===========================================================================================================
    // Type Conversions
    // ===========================================================================================================

    function Type(O) {
        var type = typeof O;
        var tostring;
        if (type === "object") {
            if (O === null) return "null";
            tostring = O.toString();
            if (tostring === "[object CompletionRecord]") return Type(O.value);
            return object_tostring_to_type_table[tostring] || "object";
        }
        return type; // primitive_type_string_table[type];
    }

    function ToPrimitive(V, prefType) {
        var type = typeof V;

        if (V === null) return V;
        if (V === undefined) return V;
        if (type === "object") {

            var s = V.toString();
            if (s === "[object CompletionRecord ]") {
                return ToPrimitive(V.value, prefType);
            } else if (s === "[object OrdinaryObject]") {
                if (hasInternalSlot(V, "NumberData")) return thisNumberValue(V);
                if (hasInternalSlot(V, "StringData")) return thisStringValue(V);
                if (hasInternalSlot(V, "BooleanData")) return thisBooleanValue(V);
                if (hasInternalSlot(V, "SymbolData")) return getInternalSlot(V, "SymbolData");

            } else if (s === "[object SymbolPrimitiveType]") {

                return V;

            } else if ((/Environment/).test(s)) {
                throw "Can not convert an environment to a primitive";
            }

            var v = V.valueOf();
            if (v === false) return false;
            if (v === true) return true;
            if (typeof v === "string") return v;
            if (typeof v === "number") return v;

        } else {

            if (type === "boolean") return !!V;
            if (type === "string") return "" + V;
            if (type === "number") return +V;
        }

        if (Type(V) === "symbol") return V;
        var hint;
        var exoticToPrim;
        if (!prefType) hint = "default";
        if (prefType === "string") hint = "string";
        if (prefType === "number") hint = "number";
        exoticToPrim = Get(V, $$toPrimitive);
        if ((exoticToPrim = ifAbrupt(exoticToPrim)) && isAbrupt(exoticToPrim)) return exoticToPrim;
        var result;
        if (exoticToPrim !== undefined) {
            if (!IsCallable(exoticToPrim)) return withError("Type", "exotic ToPrimitive of object is not a function");
            result = exoticToPrim.Call(V, [hint]);
            if ((result = ifAbrupt(result)) && isAbrupt(result)) return result;
            if (result !== undefined && Type(result) !== "object") return result;
            else return withError("Type", "Can not convert the object to a primitive with exotic ToPrimitive")
        }
        if (hint === "default") hint === "number";
        return OrdinaryToPrimitive(V, hint);
    }

    function OrdinaryToPrimitive(O, hint) {
        Assert(Type(O) === "object", "o must be an object");
        Assert(Type(hint) === "string" && (hint === "string" || hint === "number"), "hint must be a string equal to the letters string or number");
        var tryFirst;
        var trySecond;

        var list = (hint === "string") ? ["toString", "valueOf"] : ["valueOf", "toString"];

        var func, result;

        for (var i = 0; i < 2; i++) {
            func = Get(O, list[i]);
            if ((func = ifAbrupt(func)) && isAbrupt(func)) return func;
            if (IsCallable(func)) {
                result = func.Call(O, []);
                if ((result = ifAbrupt(result)) && isAbrupt(result)) return result;
                if (result !== undefined && Type(result) !== "object") return result;
                else return withError("Type", "Can not convert the object to a primitive with OrdinaryToPrimitive by calling " + list[i]);
            }
        }
        return withError("Type", "Can not convert object to primitive with OrdinaryToPrimitive (end)");
    }

    var ReturnZero = {
        "NaN": true,
        "Infinity": true,
        "-Infinity": true,
        "0": true
    };

    var ReturnNaN = {
        "NaN": true
    };

    var ReturnNum = {
        "Infinity": true,
        "-Infinity": true,
        "0": true
    };

    function ToInt8(V) {
        var view = Int8Array(1);
        view[0] = V;
        return view[0];
    }

    function ToUint8(V) {
        var view = Uint8Array(1);
        view[0] = V;
        return view[0];
    }

    function ToUint8Clamp(V) {
        var view = Uint8ClampedArray(1);
        view[0] = V;
        return view[0];
    }

    function ToUint16(V) {
        var number = ToNumber(V);
        if ((number = ifAbrupt(number)) && isAbrupt(number)) return number;
        if (ReturnZero[number]) return +0;
        var int = sign(number) * floor(abs(number));
        var int16bit = int % (Math.pow(2, 16));
        return int16Bit;
    }

    function ToInt32(V) {
        var number = ToNumber(V);
        if ((number = ifAbrupt(number)) && isAbrupt(number)) return number;
        if (ReturnZero[number]) return +0;
        var int = sign(number) * floor(abs(number));
        var int32bit = int % (Math.pow(2, 32));
        if (int >= (Math.pow(2, 31))) return int32bit - (Math.pow(2, 32));
        else return int32bit;
    }

    function ToUint32(V) {
        /*
		var view = new Uint32Array(1);
	view[0] = ToNumber(V);
	return view[0];
*/
        var number = ToNumber(V);
        if ((number = ifAbrupt(number)) && isAbrupt(number)) return number;
        if (ReturnZero[number]) return +0;
        var int = sign(number) * floor(abs(number));
        var int32bit = int % (Math.pow(2, 32));
        return int32bit;
    }

    function ToInteger(V) {
        var number = ToNumber(V);
        if ((number = ifAbrupt(number)) && isAbrupt(number)) return number;
        if (ReturnNaN[number]) return +0;
        if (ReturnNum[number]) return number;
        return sign(number) * floor(abs(number));
    }

    function ToLength(V) {
        var len = ToInteger(V);
        if ((len = ifAbrupt(len)) && isAbrupt(len)) return len;
        if (len <= 0) return Completion("normal", 0, "");
        return Completion("normal", min(len, (Math.pow(2, 53)) - 1), "");
    }

    function ToBoolean(V) {
        var type = Type(V);

        if (V instanceof CompletionRecord) return ToBoolean(V.value);

        if (V === undefined) return false;
        if (V === null) return false;

        if (type === "boolean") V = thisBooleanValue(V);
        if (typeof V === "boolean") {
            return V;
        }
        if (type === "number") V = thisNumberValue(V);
        if (typeof V === "number") {
            if (V === +0 || V === -0 || V !== V) return false;
            else return true;
        }

        if (type === "string") V = thisStringValue(V);
        if (typeof V === "string") {
            if (V === "" || V.length === 0) return false;
            return true;
        }

        if (V instanceof SymbolPrimitiveType) return true;
        if (Type(V) === "object") return true;
        return false;
    }

    function ToNumber(V) {
        var T;

        if (V instanceof CompletionRecord) return ToNumber(V.value);

        if (V === undefined) return NaN;
        if (V === null) return +0;
        if (V === true) return 1;
        if (V === false) return 0;

        if ((T = Type(V)) === "number") return V;

        if (T === "string") return +V;

        if (T === "object") {
            var primVal = ToPrimitive(V, "number");
            return ToNumber(primVal);
        }

        return +V;
    }

    function ToString(V) {
        var t;
        var n, k, s;
        if (V instanceof CompletionRecord) return ToString(V.value);
        if (V === null) return "null";
        if (V === false) return "false";
        if (V === true) return "true";
        if (V !== V) return "NaN";
        if ((t = Type(V)) === "number" || typeof v === "number") {
            if (V == 0) return "0";
            if (V < 0) return "-" + ToString(-V);
            if (V === Infinity) return "Infinity";
            return "" + V;
        }
        if (t === "symbol") {
            return withError("Type", "Can not convert symbol to string");
        }
        if (t === "object") {
            if (hasInternalSlot(V, "SymbolData"))
                return withError("Type", "Can not convert symbol to string");

            var primVal = ToPrimitive(V, "string");
            return ToString(primVal);
        }
        return "" + V;
    }

    function ToObject(V) {
        if (isAbrupt(V)) return V;
        if (V instanceof CompletionRecord) return ToObject(V.value);
        if (V === undefined) return withError("Type", "ToObject: can not convert undefined to object");
        if (V === null) return withError("Type", "ToObject: can not convert null to object");

        if (Type(V) === "object") return V;

        if (V instanceof SymbolPrimitiveType) {
            var s = SymbolPrimitiveType();
            setInternalSlot(s, "Prototype", getIntrinsic("%SymbolPrototype%"));
            setInternalSlot(s, "SymbolData", V);
            return s;
        }

        if (typeof V === "number") {
            return OrdinaryConstruct(getIntrinsic("%Number%"), V);
        }
        if (typeof V === "string") {
            return OrdinaryConstruct(getIntrinsic("%String%"), V);
        }
        if (typeof V === "boolean") {
            return OrdinaryConstruct(getIntrinsic("%Boolean%"), V);
        }

        // return V;
    }

    function GetThisEnvironment() {
        var env = getLexEnv();
        do {
            if (env.HasThisBinding()) return env;
        } while (env = env.outer);
    }

    function ThisResolution() {
        var env = GetThisEnvironment();
        return env.GetThisBinding();
    }

    function GetGlobalObject() {
        var realm = getRealm();
        var globalThis = realm.globalThis;
        return globalThis;
    }

    function CreateByteDataBlock(bytes) {

    }

    function CopyDataBlockBytes(toBlock, toIndex, fromBlock, fromIndex, count) {

    }

    // 
    // Boolean, String, NumberValue
    //    

    function thisBooleanValue(value) {
        if (value instanceof CompletionRecord) return thisBooleanValue(value);
        if (typeof value === "boolean") return value;
        if (Type(value) === "boolean") return value;
        if (Type(value) === "object" && hasInternalSlot(value, "BooleanData")) {
            var b = getInternalSlot(value, "BooleanData");
            if (typeof b === "boolean") return b;
        }
        return withError("Type", "thisBooleanValue: value is not a Boolean");
    }

    function thisStringValue(value) {

        if (value instanceof CompletionRecord) return thisStringValue(value);
        if (typeof value === "string") return value;
        if (Type(value) === "string") return value;
        if (Type(value) === "object" && hasInternalSlot(value, "StringData")) {
            var b = getInternalSlot(value, "StringData");
            if (typeof b === "string") return b;
        }
        return withError("Type", "thisStringValue: value is not a String");
    }

    function thisNumberValue(value) {
        if (value instanceof CompletionRecord) return thisNumberValue(value);
        if (typeof value === "number") return value;
        if (Type(value) === "number") return value;
        if (Type(value) === "object" && hasInternalSlot(value, "NumberData")) {
            var b = getInternalSlot(value, "NumberData");
            if (typeof b === "number") return b;
        }
        return withError("Type", "thisNumberValue: value is not a Number");
    }

    //
    // **Create Functions (ObjectCreate, ProxyCreate, PromiseCreate)
    //


    function ObjectCreate(proto, internalDataList) {
        if (proto === undefined) proto = Get(getIntrinsics(), "%ObjectPrototype%");
        var O = OrdinaryObject(proto);
        if (internalDataList && typeof internalDataList === "object") {
            for (var k in internalDataList) {
                if (Object.hasOwnProperty.call(internalDataList, k)) {
                    O[k] = internalDataList[k];
                }
            }
        }
        return O;
    }

    function StringCreate(StringData) {
        return OrdinaryConstruct(StringConstructor, [StringData]);
    }

    function IntegerIndexedObjectCreate(prototype) {
        var O = IntegerIndexedExoticObject();
        setInternalSlot(O, "Extensible", true);
        setInternalSlot(O, "Prototype", prototype);
        setInternalSlot(O, "hiddenBuffer", undefined);
        return O;
    }

    function CreateArrayIterator(array, kind) {
        var O = ToObject(array);
        var proto = getIntrinsic("%ArrayIteratorPrototype%");
        var iterator = ObjectCreate(proto);
        setInternalSlot(iterator, "IteratedObject", O);
        setInternalSlot(iterator, "ArrayIterationNextIndex", 0);
        setInternalSlot(iterator, "ArrayIterationKind", kind);
        return iterator;
    }

    // ===========================================================================================================
    // More essential methods
    // ===========================================================================================================

    function setFunctionLength(F, L) {
        callInternalSlot("DefineOwnProperty", F, "length", {
            value: L,
            writable: false,
            enumerable: false,
            configurable: false
        });
    }

    function SetFunctionName(F, name, prefix) {
        var success;
        var t = Type(name);
        Assert(t === "string" || t === "symbol", "SetFunctionName: name must be a symbol or a string ("+name+" is "+t+")");
        Assert(IsCallable(F), "SetFunctionName: F has to be an EcmaScript Function Object");
        Assert(!HasOwnProperty(F, "name"), "SetFunctionName: Function may not have a name property");
        if (t === "symbol") {
            var desc = getInternalSlot(name, "Description");
            if (desc === undefined) name = "";
            else name = "[" + desc + "]";
        }
        if (name !== "" && prefix !== undefined) {
            name = prefix + " " + name;
        }
        success = DefineOwnProperty(F, "name", {
            value: name,
            writable: false,
            enumerable: false,
            configurable: false
        });
        if ((success = ifAbrupt(success)) && isAbrupt(success)) return success;
        if (success === false) return withError("Type", "Sorry, can not set name property of a non function");
        return NormalCompletion(undefined);
    }

    function GeneratorFunctionCreate(kind, paramList, body, scope, strict, fProto, homeObject, methodName) {
        if (!fProto) fProto = Get(getIntrinsics(), "%Generator%");
        var F = FunctionAllocate(fProto, "generator");
        return FunctionInitialise(F, kind, paramList, body, scope, strict, homeObject, methodName);
    }

    function FunctionCreate(kind, paramList, body, scope, strict, fProto, homeObject, methodName) {
        if (!fProto) fProto = Get(getIntrinsics(), "%FunctionPrototype%");
        var F = FunctionAllocate(fProto);
        return FunctionInitialise(F, kind, paramList, body, scope, strict, homeObject, methodName);
    }

    function FunctionAllocate(fProto, kind) {
        var F;
        Assert(Type(fProto) === "object", "fproto has to be an object");
        if (kind) {
            Assert((kind === "generator" || kind === "normal"), "kind must be generator or normal");
        } else {
            kind = "normal";
        }
        F = OrdinaryFunction();
        setInternalSlot(F, "FunctionKind", kind);
        setInternalSlot(F, "Prototype", fProto);
        setInternalSlot(F, "Extensible", true);
        setInternalSlot(F, "Construct", undefined);
        setInternalSlot(F, "Realm", getRealm());
        return F;
    }

    function FunctionInitialise(F, kind, paramList, body, scope, strict, homeObject, methodName) {
        setInternalSlot(F, "FunctionKind", kind);
        setInternalSlot(F, "FormalParameters", paramList);
        setInternalSlot(F, "Code", body);
        setInternalSlot(F, "Environment", scope);
        setInternalSlot(F, "Strict", strict);
        setInternalSlot(F, "Realm", getRealm());
        if (homeObject) setInternalSlot(F, "HomeObject", homeObject);
        if (methodName) setInternalSlot(F, "MethodName", methodName);
        setInternalSlot(F, "Strict", strict);
        if (kind === "arrow") setInternalSlot(F, "ThisMode", "lexical");
        else if (strict) setInternalSlot(F, "ThisMode", "strict");
        else setInternalSlot(F, "ThisMode", "global");
        return F;
    }

    function OrdinaryHasInstance(C, O) {
        var BC, P;

        if (!IsCallable(C)) return false;

        if (BC = getInternalSlot(C, "BoundTargetFunction")) {
            return OrdinaryHasInstance(BC, O);
        }

        if (Type(O) !== "object") return false;

        P = Get(C, "prototype");
        if ((P = ifAbrupt(P)) && isAbrupt(P)) return P;

        if (Type(P) !== "object") return withError("Type", "OrdinaryHasInstance: P not object");

        while (O = GetPrototypeOf(O)) {
            if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
            if (O === null) return false;
            if (SameValue(P, O) === true) return true;
        }
        return false;
    }

    function GetPrototypeFromConstructor(C, intrinsicDefaultProto) {
        var realm, intrinsics;
        Assert((typeof intrinsicDefaultProto === "string"), "intrinsicDefaultProto has to be a string");

        if (!IsConstructor(C)) return withError("Type", "GetPrototypeFromConstructor: C is no constructor");

        var proto = Get(C, "prototype");
        if ((proto = ifAbrupt(proto)) && isAbrupt(proto)) return proto;

        if (Type(proto) !== "object") {
            var realm = getInternalSlot(C, "Realm");
            if (realm) intrinsics = realm.intrinsics;
            else intrinsics = getIntrinsics();
            proto = Get(getIntrinsics(), intrinsicDefaultProto);
        }

        return proto;
    }
    
    function OrdinaryCreateFromConstructor(constructor, intrinsicDefaultProto, internalDataList) {
    
        Assert(HasProperty(getIntrinsics(), intrinsicDefaultProto), "the chosen intrinsic default proto has to be defined in the intrinsic");
        var O, result;
        var proto = GetPrototypeFromConstructor(constructor, intrinsicDefaultProto);
        if ((proto = ifAbrupt(proto)) && isAbrupt(proto)) return proto;
        return ObjectCreate(proto, internalDataList);
    }

    // 20. Januar

    function CreateFromConstructor(F) {
        var creator = Get(F, $$create);
        if ((creator = ifAbrupt(creator)) && isAbrupt(creator)) return creator;
        if (creator === undefined) return undefined;
        if (IsCallable(creator) === false) return withError("Type", "CreateFromConstructor: creator has to be callable");
        var obj = callInternalSlot("Call", creator, F, []);
        if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
        if (Type(obj) !== "object") return withError("Type", "CreateFromConstructor: obj has to be an object");
        return obj;
    }

    function Construct(F, argList) {
        Assert(Type(F) === "object", "essential Construct: F is not an object");
        var obj = OrdinaryCreateFromConstructor(F);
        if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
        if (obj === undefined) {
            obj = OrdinaryCreateFromConstructor(F, "%ObjectPrototype%");
            if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
            if (Type(obj) !== "object") return withError("Type", "essential Construct: obj is not an object");
        }
        var result = callInternalSlot("Call", F, obj, argList);
        if ((result = ifAbrupt(result)) && isAbrupt(result)) return result;
        if (Type(result) === "object") return result;
        return obj;
    }
    
    function MakeMethod (F, methodName, homeObject) {
        Assert(IsCallable(F), "MakeMethod: method is not a function");
        Assert(methodName === undefined || IsPropertyKey(methodName), "MakeMethod: methodName is neither undefined nor a valid property key");
        var hoType = Type(homeObject);
        Assert(hoType === "undefined" || hoType === "object", "MakeMethod: HomeObject is neither undefined nor object.");
        setInternalSlot(F, "NeedsSuper", true);
        setInternalSlot(F, "HomeObject", homeObject);
        setInternalSlot(F, "MethodName", methodName);
        return NormalCompletion(undefined);
    }
    
    // vorher 
    function OrdinaryConstruct(F, argList) {
        var creator = Get(F, $$create);
        var obj;
        if (creator) {
            if (!IsCallable(creator)) return withError("Type", "OrdinaryConstruct: creator is not callable");
            obj = callInternalSlot("Call", creator, F, argList);
        } else {
            obj = OrdinaryCreateFromConstructor(F, "%ObjectPrototype%");
        }
        if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
        if (Type(obj) !== "object") return withError("Type", "OrdinaryConstruct: Type(obj) is not object");
        var result = callInternalSlot("Call", F, obj, argList);
        if ((result = ifAbrupt(result)) && isAbrupt(result)) return result;
        if (Type(result) === "object") return result;
        return obj;
    }
    

    function MakeConstructor(F, writablePrototype, prototype) {
        var installNeeded = false;
        
        if (!prototype) {
            installNeeded = true;
            prototype = ObjectCreate();
        }
        if (writablePrototype === undefined) writablePrototype = true;
        setInternalSlot(F, "Construct", function Construct(argList) {
            return OrdinaryConstruct(this, argList);
        });
        if (installNeeded) callInternalSlot("DefineOwnProperty", prototype, "constructor", {
            value: F,
            writable: writablePrototype,
            enumerable: false,
            configurable: writablePrototype
        });
        callInternalSlot("DefineOwnProperty", F, "prototype", {
            value: prototype,
            writable: writablePrototype,
            enumerable: false,
            configurable: writablePrototype
        });
        return F;
    }

    function CheckObjectCoercible(argument) {

        if (argument instanceof CompletionRecord) return CheckObjectCoercible(argument.value);
        else if (argument === undefined) return withError("Type", "CheckObjectCoercible: undefined is not coercible");
        else if (argument === null) return withError("Type", "CheckObjectCoercible: null is not coercible");

        var type = Type(argument);
        switch (type) {
        case "boolean":
        case "number":
        case "string":
        case "symbol":
        case "object":
            return argument;
            break;
        default:
            break;
        }
        return argument;
    }

    function MakeSuperReference(propertyKey, strict) {
        var env = GetThisEnvironment();
        if (!env.HasSuperBinding()) return withError("Reference", "Can not make super reference.");
        var actualThis = env.GetThisBinding();
        var baseValue = env.GetSuperBase();
        var bv = CheckObjectCoercible(baseValue);
        if ((bv = ifAbrupt(bv)) && isAbrupt(bv)) return bv;
        if (propertyKey === undefined) propertyKey = env.GetMethodName();
        return new Reference(propertyKey, bv, strict, actualThis);
    }

    function GetSuperBinding(obj) {
        if (Type(obj) !== "object") return undefined;
        if (getInternalSlot(obj, "NeedsSuper") !== true) return undefined;
        //if (!hasInternalSlot(obj, "HomeObject")) return undefined;
        return getInternalSlot(obj, "HomeObject");
    }

    function cloneFunction (func) {
        var newFunc = OrdinaryFunction();
        setInternalSlot(newFunc, "Environment", getInternalSlot(func, "Environment"));
        setInternalSlot(newFunc, "Code", getInternalSlot(func, "Code"));
        setInternalSlot(newFunc, "FormalParameterList", getInternalSlot(func, "FormalParameterList"));
        setInternalSlot(newFunc, "ThisMode", getInternalSlot(func, "ThisMode"));
        setInternalSlot(newFunc, "FunctionKind", getInternalSlot(func, "FunctionKind"));
        setInternalSlot(newFunc, "Strict", getInternalSlot(func, "Strict"));
        return newFunc;
    }

    function CloneMethod(func, newHome, newName) {
        Assert(IsCallable(func), "CloneMethod: function has to be callable");
        Assert(Type(newHome) == "object", "CloneMethod: newHome has to be an object");
        Assert(Type(newName) === "undefined" || IsPropertyKey(newName), "CloneMethod: newName has to be undefined or object");
        var newFunc = cloneFunction(func);
        if (getInternalSlot(func, "NeedsSuper") === true) {
            setInternalSlot(newFunc, "HomeObject", newHome);
            if (newName !== undefined) setInternalSlot(newFunc, "MethodName", newName);
            else setInternalSlot(newFunc, "MethodName", getInternalSlot(func, "MethodName"));
        }
        return newFunc;
    }
    
    function RebindSuper(func, newHome) {
        Assert(IsCallable(func) && func.HomeObject, "func got to be callable and have a homeobject");
        Assert(Type(newHome) === "object", "newhome has to be an object");
        var nu = OrdinaryFunction();
        setInternalSlot(nu, "FunctionKind", getInternalSlot(func, "FunctionKind"));
        setInternalSlot(nu, "Environment", getInternalSlot(func, "Environment"));
        setInternalSlot(nu, "Code", getInternalSlot(func, "Code"));
        setInternalSlot(nu, "FormalParameters", getInternalSlot(func, "FormalParameters"));
        setInternalSlot(nu, "Strict", getInternalSlot(func, "Strict"));
        setInternalSlot(nu, "ThisMode", getInternalSlot(func, "ThisMode"));
        setInternalSlot(nu, "MethodName", getInternalSlot(func, "MethodName"));
        setInternalSlot(nu, "Realm", getInternalSlot(func, "Realm"));
        setInternalSlot(nu, "HomeObject", newHome);
        return nu;
    }

    function NewDeclarativeEnvironment(E) {
        return new DeclarativeEnvironment(E);
    }

    function NewObjectEnvironment(O, E) {
        return new ObjectEnvironment(O, E);
    }

    function NewFunctionEnvironment(F, T) {
        Assert(getInternalSlot(F, "ThisMode") !== "lexical", "NewFunctionEnvironment: ThisMode is lexical");
        var env = new FunctionEnvironment(F, T); // ist Lexical Environment and environment record in eins
        env.thisValue = T;
        if (getInternalSlot(F, "NeedsSuper") === true) {
            var home = getInternalSlot(F, "HomeObject");
            if (home === undefined) return withError("Reference", "NewFunctionEnvironment: HomeObject is undefined");
            env.HomeObject = home;
            env.MethodName = getInternalSlot(F, "MethodName");
        } else {
            env.HomeObject = undefined;
        }
        env.outer = getInternalSlot(F, "Environment"); // noch in [[Environment]] umbenennen
        return env;
    }

    function createIdentifierBinding(envRec, N, V, D, W) {
        return (envRec[N] = new IdentifierBinding(N, V, D, W));
    }

    function IdentifierBinding(N, V, D, W) {
        this.name = N;
        this.value = V;
        this.writable = W === undefined ? true : W;
        this.initialised = false;
        this.configurable = D;
    }

    function GetIdentifierReference(lex, name, strict) {
        if (lex == null) {
            // unresolvable ref.
            return new Reference(name, undefined, strict);
        }
        var exists = lex.HasBinding(name);
        var outer;
        if (exists) {
            return new Reference(name, lex, strict);
        } else {
            outer = lex.outer;
            return GetIdentifierReference(outer, name, strict);
        }
    }

    function Put(O, P, V, Throw) {
        Assert(Type(O) === "object", "o has to be an object");
        Assert(IsPropertyKey(P), "property key p expected");
        Assert(Throw === true || Throw === false, "throw has to be false or true");
        var success = callInternalSlot("Set", O, P, V, O);
        if ((success = ifAbrupt(success)) && isAbrupt(success)) return success;
        if (success === false && Throw === true) return withError("Type", "Put: success false and throw true at P=" + P);
        return success;
    }

    function DefineOwnPropertyOrThrow(O, P, D) {
        Assert(Type(O) === "object", "object expected");
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        var success = callInternalSlot("DefineOwnProperty", O, P, D);
        if ((success = ifAbrupt(success)) && isAbrupt(success)) return success;
        if (success === false) return withError("Type", "DefinePropertyOrThrow: DefineOwnProperty failed.");
        return success;
    }

    function DeletePropertyOrThrow(O, P) {
        Assert(Type(O) === "object", "object expected");
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        var success = Delete(O, P);
        if ((success = ifAbrupt(success)) && isAbrupt(success)) return success;
        if (success === false) return withError("Type", "DeletePropertyOrThrow: Delete failed.");
        return success;
    }

    function OrdinaryDefineOwnProperty(O, P, D) {
        var current = OrdinaryGetOwnProperty(O, P);
        var extensible = getInternalSlot(O, "Extensible");
        return ValidateAndApplyPropertyDescriptor(O, P, extensible, D, current);
    }

    function GetOwnProperty(O, P) {
        return OrdinaryGetOwnProperty(O, P);
    }

    function OrdinaryGetOwnProperty(O, P) {
        Assert(IsPropertyKey(P), "P has to be a valid property key");
        var D = Object.create(null); // value: undefined, writable: true, enumerable: true, configurable: true };

        var X = readPropertyDescriptor(O, P);

        if (X === undefined) return;

        if (IsDataDescriptor(X)) {
            D.value = X.value;
            D.writable = X.writable;
        } else if (IsAccessorDescriptor(X)) {
            D.set = X.set;
            D.get = X.get;
        }

        D.configurable = X.configurable;
        D.enumerable = X.enumerable;
        return D;
    }

    function IsCallable(O) {
        if (O instanceof CompletionRecord) return IsCallable(O.value);
        if (Type(O) === "object" && O.Call) return true;
        return false;
    }

    function IsConstructor(F) {
        if (F instanceof CompletionRecord) return IsConstructor(F.value);
        if (F && F.Construct) return true;
        return false;
    }

    function ToPropertyKey(P) {
        if ((P = ifAbrupt(P)) && (isAbrupt(P) || P instanceof SymbolPrimitiveType)) return P;
        return ToString(P);
    }

    // ===========================================================================================================
    // Personal DOM Wrapper (wrap native js into this big bullshit)
    // ===========================================================================================================

    function ExoticDOMObjectWrapper(object) {
        var O = Object.create(ExoticDOMObjectWrapper.prototype);

        setInternalSlot(O, "Target", object);
        setInternalSlot(O, "Symbols", Object.create(null));
        setInternalSlot(O, "Prototype", getIntrinsic("%ObjectPrototype%"));
        setInternalSlot(O, "Extensible", true);
        return O;
    }
    ExoticDOMObjectWrapper.prototype = {
        constructor: ExoticDOMObjectWrapper,
        type: "object",
        toString: function () {
            return "[object EddiesDOMObjectWrapper]";
        },
        Get: function (P) {
            var o = this.Target;
            var p = o[P];
            if (typeof p === "object" && p) {
                return new ExoticDOMObjectWrapper(p);
            } else if (typeof p === "function") {
                return new ExoticDOMFunctionWrapper(p, o);
            }
            return p;
        },
        Set: function (P, V, R) {
            var o = this.Target;
            return o[P] = V;
        },
        Invoke: function (P, argList, Rcv) {
            var f = this.Target;
            var o = this.Target;

            if ((f = this.Get(P)) && (typeof f === "function")) {
                var result = f.apply(o, argList);
                if (typeof result === "object" && result) {
                    result = new ExoticDOMObjectWrapper(result);
                } else if (typeof result === "function") {
                    result = new ExoticDOMFunctionWrapper(result, o);
                }
                return result;
            } else if (IsCallable(f)) {
                callInternalSlot("Call", f, o, argList);
            }
        },
        Delete: function (P) {
            var o = this.Target;
            return (delete o[P]);
        },
        DefineOwnProperty: function (P, D) {
            return Object.defineProperty(this.Target, P, D);
        },
        GetOwnProperty: function (P) {
            return Object.getOwnPropertyDescriptor(this.Target, P);
        },
        HasProperty: function (P) {
            return !!(P in this.Target);
        },
        HasOwnProperty: function (P) {
            var o = this.Target;
            return Object.hasOwnProperty.call(o, P);
        },
        GetPrototypeOf: function () {
            var o = this.Target;
            return Object.getPrototypeOf(o);
        },
        SetPrototypeOf: function (P) {
            var o = this.Target;
            return (o.__proto__ = P);
        },
        IsExtensible: function () {
            var o = this.Target;
            return Object.isExtensible(o);
        },
    };

    function ExoticDOMFunctionWrapper(func, that) {
        var F = Object.create(ExoticDOMFunctionWrapper.prototype);
        setInternalSlot(F, "NativeThat", that);
        setInternalSlot(F, "Symbols", Object.create(null));
        setInternalSlot(F, "Prototype", getIntrinsic("%FunctionPrototype%"));
        setInternalSlot(F, "Extensible", true);
        return F;
    }
    ExoticDOMFunctionWrapper.prototype = assign(ExoticDOMFunctionWrapper.prototype, ExoticDOMObjectWrapper.prototype);

    ExoticDOMFunctionWrapper.prototype = {
        constructor: ExoticDOMFunctionWrapper,
        toString: function () {
            return "[object EddiesDOMFunctionWrapper]";
        },
        Call: function (thisArg, argList) {
            var f = this.Target;
            var that = this.NativeThat;
            var result = f.apply(that, argList);
            if (typeof result === "object" && result) {
                result = new ExoticDOMObjectWrapper(result);
            } else if (typeof result === "function") {
                result = new ExoticDOMFunctionWrapper(result, that);
            }
            return result;
        }
    };

    // ===========================================================================================================
    // Symbol PrimitiveType / Exotic Object
    // ===========================================================================================================

    var es5id = Math.floor(Math.random() * (1 << 16));

    function SymbolPrimitiveType(id, desc) {
        var O = Object.create(SymbolPrimitiveType.prototype);
        setInternalSlot(O, "Description", desc);
        setInternalSlot(O, "Bindings", Object.create(null));
        setInternalSlot(O, "Symbols", Object.create(null));
        setInternalSlot(O, "Prototype", null);
        setInternalSlot(O, "Extensible", false);
        setInternalSlot(O, "Integrity", "frozen");
        setInternalSlot(O, "es5id", id || (++es5id + Math.random()));
        //setInternalSlot(O, "Private", false);
        return O;
    }

    SymbolPrimitiveType.prototype = {
        constructor: SymbolPrimitiveType,
        type: "symbol",
        GetPrototypeOf: function () {
            return false;
        },
        SetPrototypeOf: function (P) {
            return false;
        },
        Get: function (P) {
            return false;
        },
        Set: function (P, V) {
            return false;
        },
        Invoke: function (P, Rcv) {
            return false;
        },
        Delete: function (P) {
            return false;
        },
        DefineOwnProperty: function (P, D) {
            return false;
        },
        GetOwnProperty: function (P) {
            return false;
        },
        HasProperty: function (P) {
            return false;
        },
        HasOwnProperty: function (P) {
            return false;
        },
        IsExtensible: function () {
            return false;
        },
        toString: function () {
            return "[object SymbolPrimitiveType]";
        }
    };

    // ===========================================================================================================
    // A Definition of all Standard Builtin Objects (one per Realm is per contract)
    // ===========================================================================================================


    // ===========================================================================================================
    // String Exotic Object
    // ===========================================================================================================

    function StringExoticObject() {
        var S = Object.create(StringExoticObject.prototype);
        setInternalSlot(S, "Bindings", Object.create(null));
        setInternalSlot(S, "Symbols", Object.create(null));
        setInternalSlot(S, "Extensible", true);
        return S;
    }

    StringExoticObject.prototype = assign(StringExoticObject.prototype, {
        HasOwnProperty: function (P) {
            Assert(IsPropertyKey(P), "P has to be a valid property key");
            var has = HasOwnProperty(O, P);
            if ((has = ifAbrupt(has)) && isAbrupt(has)) return has;
            if (has) return has;
            if (Type(P) !== "string") return false;
            var index = ToInteger(P);
            if ((index = ifAbrupt(index)) && isAbrupt(index)) return index;
            var absIndex = ToString(abs(index));
            if (SameValue(absIndex, P) === false) return false;
            var str = this.StringData;
            var len = str.length;
            if (len <= index) return false;
            return true;
        },
        GetOwnProperty: function (P) {
            Assert(IsPropertyKey(P), "P has to be a valid property key");
            var desc = OrdinaryGetOwnProperty(this, P);
            if ((desc = ifAbrupt(desc)) && isAbrupt(desc)) return desc;
            if (desc !== undefined) return desc;
            if (Type(P) !== "string") return undefined;
            var index = ToInteger(P);
            if ((index = ifAbrupt(index)) && isAbrupt(index)) return index;
            var absIndex = ToString(abs(index));
            if (SameValue(absIndex, P) === false) return undefined;
            var str = getInternalSlot(this, "StringData");
            var len = str.length;
            if (len <= index) return undefined;
            var resultStr = str[index];
            return {
                value: resultStr,
                enumerable: true,
                writable: false,
                configurable: false
            };
        },
        DefineOwnProperty: function (P, D) {
            var O = this;
            var current = callInternalSlot("GetOwnProperty", O, P);
            var extensible = IsExtensible(this);
            return ValidateAndApplyPropertyDescriptor(O, P, extensible, D, current);
        },
        Enumerate: function () {
            return Enumerate(this);
        },
        OwnPropertyKeys: function () {
            return OwnPropertyKeys(this);
        },
        toString: function () {
            return "[object StringExoticObject]";
        },
        type: "object"
    });
    addMissingProperties(StringExoticObject.prototype, OrdinaryObject.prototype);

    // ===========================================================================================================
    // ArrayBuffer
    // ===========================================================================================================

    function CreateByteArrayBlock(bytes) {
        return new ArrayBuffer(bytes); //spaeter alloziere auf eigenem heap
    }

    function SetArrayBufferData(arrayBuffer, bytes) {
        Assert(hasInternalSlot(arrayBuffer, "ArrayBufferData"), "[[ArrayBufferData]] has to exist");
        Assert(bytes > 0, "bytes must be a positive integer");

        var block = CreateByteArrayBlock(bytes); // hehe
        setInternalSlot(arrayBuffer, "ArrayBufferData", block);
        setInternalSlot(arrayBuffer, "ArrayBufferByteLength", bytes);
        return arrayBuffer;
    }

    function AllocateArrayBuffer(F) {
        var obj = OrdinaryCreateFromConstructor(F, "%ArrayBufferPrototype%", {
            "ArrayBufferData": undefined,
            "ArrayBufferByteLength": undefined
        });
        if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
        setInternalSlot(obj, "ArrayBufferByteLength", 0);
        return obj;
    }

    // ===========================================================================================================
    // Integer Indexed Exotic Object
    // ===========================================================================================================

    function IntegerIndexedExoticObject() {
        var O = Object.create(IntegerIndexedExoticObject.prototype);
        setInternalSlot(O, "ArrayBufferData", undefined);
        return O;
    }
    IntegerIndexedExoticObject.prototype = assign(IntegerIndexedExoticObject.prototype, {
        DefineOwnProperty: function (P, Desc) {
            var O = this;
            Assert(IsPropertyKey(P), "P has to be a valid property key");
            Assert(O.ArrayBufferData !== undefined, "arraybufferdata must not be undefined");
            if (Type(P) === "string") {
                var intIndex = ToInteger(P);
                if ((intIndex = ifAbrupt(intIndex)) && isAbrupt(intIndex)) return intIndex;
                if (SameValue(ToString(intIndex), P)) {
                    if (intIndex < 0) return false;
                    var len = O.ArrayLength;
                    if (len === undefined) return withError("Type", "integerindexed: length is undefined");
                    if (intIndex >= len) return false;
                    if (IsAccessorDescriptor(Desc)) return false;
                    if (Desc.configurable) return false;
                    if (Desc.enumerable === false) return false;
                    var writable = true; // oder nicht... korrigiere hier
                    var makeReadOnly = false;
                    if (Desc.writable !== undefined) {
                        if (Desc.writable && !writable) return false;
                        if (!Desc.writable && writable) makeReadOnly = true;
                    }
                    if (Desc.value !== undefined) {
                        if (!writable) {
                            var oldValue = IntegerIndexedElementGet(O, intIndex);
                            if ((oldValue = ifAbrupt(oldValue)) && isAbrupt(oldValue)) return oldValue;
                            if (value === undefined) return false;
                            if (!SameValue(value, oldValue)) return false;
                        }
                    }
                    var status = IntegerIndexedElementSet(O, intIndex, value);
                    if ((status = ifAbrupt(status)) && isAbrupt(status)) return status;
                    if (makeReadOnly) {
                        // mark as non-writable
                    }
                    return true;
                }
            }
            // ordinarygetownproperty im draft, maybe fehler
            return OrdinaryDefineOwnProperty(O, P);
        },
        Get: function (P, R) {
            var O = this;
            Assert(IsPropertyKey(P), "P has to be a valid property key");
            if ((Type(P) === "string") && SameValue(O, R)) {
                var intIndex = ToInteger(P);
                if ((intIndex = ifAbrupt(intIndex)) && isAbrupt(intIndex)) return intIndex;
                if (SameValue(ToString(intIndex), P)) return IntegerIndexedElementGet(O, intIndex);
            }
            return Get(O, P, R);
        },
        Set: function (P, V, R) {
            var O = this;
            Assert(IsPropertyKey(P), "P has to be a valid property key");
            if ((Type(P) === "string") && SameValue(O, R)) {
                var intIndex = ToInteger(P);
                if ((intIndex = ifAbrupt(intIndex)) && isAbrupt(intIndex)) return intIndex;
                if (SameValue(ToString(intIndex), P)) return ToBoolean(IntegerIndexedElementSet(O, intIndex, V));
            }
            return Set(O, P, V, R);

        },
        GetOwnProperty: function (P) {
            var O = this;
            Assert(IsPropertyKey(P), "P has to be a valid property key");
            Assert(O.ArrayBufferData !== undefined, "arraybufferdata must not be undefined");
            if (Type(P) === "string") {
                var intIndex = ToInteger(P);
                if ((intIndex = ifAbrupt(intIndex)) && isAbrupt(intIndex)) return intIndex;
                if (SameValue(ToString(intIndex), P)) {
                    var value = IntegerIndexedElementGet(O, intIndex);
                    if ((value = ifAbrupt(value)) && isAbrupt(value)) return value;
                    if (value === undefined) return undefined;
                    var writable = true;
                    // setze falsch, falls sie es nciht sind, die props vom integerindexed
                    return {
                        value: value,
                        enumerable: true,
                        writable: writable,
                        configurable: false
                    };
                }
            }
            return OrdinaryGetOwnProperty(O, P);
        },
        HasOwnProperty: function (P) {
            var O = this;
            Assert(IsPropertyKey(P), "P has to be a valid property key");
            Assert(O.ArrayBufferData !== undefined, "arraybufferdata must not be undefined");
            if (Type(P) === "string") {
                var intIndex = ToInteger(P);
                if ((intIndex = ifAbrupt(intIndex)) && isAbrupt(intIndex)) return intIndex;
                if (SameValue(ToString(intIndex), P)) {
                    if (intIndex < 0) return false;
                    var len = O.ArrayLength;
                    if (len === undefined) return withError("Type", "integerindexed: length is undefined");
                    if (intIndex >= len) return false;
                }
            }
            return HasOwnProperty(O, P);
        },
        Enumerate: function () {
            return Enumerate(this);
        },
        OwnPropertyKeys: function () {
            return OwnPropertyKeys(this);
        },
        constructor: IntegerIndexedExoticObject,
        toString: function () {
            return "[object IntegerIndexedExoticObject]";
        },
        type: "object"
    });
    addMissingProperties(IntegerIndexedExoticObject.prototype, OrdinaryObject.prototype);

    function IntegerIndexedElementGet(O, index) {
        Assert(Type(index) === "number", "index type has to be number");
        Assert(index === ToInteger(index), "index has to be tointeger of index");
        var buffer = getInternalSlot(O, "ViewedArrayBuffer");
        var length = getInternalSlot(O, "ArrayLength");
        if (index < 0 || index >= length) return undefined;
        var offset = O.ByteOffset;
        var arrayTypeName = O.TypedArrayName;
        var elementSize = ToNumber(TypedArrayElementSize[arrayTypeName]);
        var indexedPosition = (index * elementSize) + offset;
        var elementType = TypedArrayElementType[arrayTypeName];
        return GetValueFromBuffer(buffer, indexedPosition, elementType);
    }

    function IntegerIndexedElementSet(O, index, value) {
        Assert(Type(index) === "number", "index type has to be number");
        Assert(index === ToInteger(index), "index has to be tointeger of index");
        var O = ToObject(ThisResolution());
        if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
        var buffer = getInternalSlot(O, "ViewedArrayBuffer");
        if (!buffer) return withError("Type", "object is not a viewed array buffer");
        var length = getInternalSlot(O, "ArrayLength");
        var numValue = ToNumber(value);
        if ((numValue = ifAbrupt(numValue)) && isAbrupt(numValue)) return numValue;
        if (index < 0 || index >= length) return numValue;
        var offset = O.ByteOffset;
        var arrayTypeName = O.TypedArrayName;
        var elementSize = ToNumber(TypedArrayElementSize[arrayTypeName]);
        var indexedPosition = (index * elementSize) + offset;
        var elementType = TypedArrayElementType[arrayTypeName];
        var status = SetValueInBuffer(buffer, indexedPosition, elementType, numValue);
        if ((status = ifAbrupt(status)) && isAbrupt(status)) return status;
        return numValue;
    }

    var TypedArrayElementSize = {
        "Float64Array": 8,
        "Float32Array": 4,
        "Int32Array": 4,
        "Uint32Array": 4,
        "Int16Array": 2,
        "Uint16Array": 2,
        "Int8Array": 1,
        "Uint8Array": 1,
        "Uint8ClampedArray": 1
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

    var arrayType2elementSize = {
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

    var typedConstructors = {
        "Float64": Float64Array,
        "Float32": Float32Array,
        "Int32": Int32Array,
        "Uint32": Uint32Array,
        "Int16": Int16Array,
        "Uint16": Uint16Array,
        "Int8": Int8Array,
        "Uint8": Uint8Array,
        "Uint8Clamped": Uint8ClampedArray
    };

    var typedConstructorNames = {
        "Float64": "%Float64ArrayPrototype%",
        "Float32": "%Float32ArrayPrototype%",
        "Int32": "%Int32ArrayPrototype%",
        "Uint32": "%Uint32ArrayPrototype%",
        "Int16": "%Int16ArrayPrototype%",
        "Uint16": "%Uint16ArrayPrototype%",
        "Int8": "%Int8ArrayPrototype%",
        "Uint8": "%Uint8ArrayPrototype%",
        "Uint8Clamped": "%Uint8ClampedArrayProtoype%"
    };

    function GetValueFromBuffer(arrayBuffer, byteIndex, type, isLittleEndian) {
        var length = getInternalSlot(arrayBuffer, "ArrayBufferByteLength");
        var block = getInternalSlot(arrayBuffer, "ArrayBufferData");
        if (block === undefined || block === null) return withError("Type", "[[ArrayBufferData]] is not initialised or available.");
        var elementSize = arrayType2elementSize[type];
        var rawValue, intValue;
        var help;

        help = new(typedConstructors[type])(bock, byteIndex, 1);
        rawValue = help[0];

        return rawValue;
    }

    function SetValueInBuffer(arrayBuffer, byteIndex, type, value, isLittleEndian) {

        var length = getInternalSlot(arrayBuffer, "ArrayBufferByteLength");
        var block = getInternalSlot(arrayBuffer, "ArrayBufferData");
        if (block === undefined || block === null) return withError("Type", "[[ArrayBufferData]] is not initialised or available.");
        var elementSize = arrayType2elementSize[type];
        var rawValue, intValue;
        var help;

        help = new(typedConstructors[type])(bock, byteIndex, 1);
        help[0] = value;

        return NormalCompletion(undefined);
    }

    function SetViewValue(view, requestIndex, isLittleEndian, type, value) {
        var v = ToObject(view);
        if ((v == ifAbrupt(v)) && isAbrupt(v)) return v;
        if (!hasInternalSlot(v, "DataArrayBuffer")) return withError("Type", "not a DataArrayBuffer");
        var buffer = getInternalSlot(v, "DataArrayBuffer");
        if (buffer === undefined) return withError("Type", "buffer is undefined");
        var numberIndex = ToNumber(requestIndex);
        var getIndex = ToInteger(numberIndex);
        if ((getIndex = ifAbrupt(getIndex)) && isAbrupt(getIndex)) return getIndex;
        if ((numberIndex !== getIndex) || (getIndex < 0)) return withError("Range", "index out of range");
        var littleEndian = ToBoolean(isLittleEndian);
        if ((littleEndian = ifAbrupt(littleEndian)) && isAbrupt(littleEndian)) return littleEndian;
        var viewOffset = getInternalSlot(v, "ByteOffset");
        var viewSize = getInternalSlot(v, "ByteLength");
        var elementSize = TypedArrayElementSize[type];
        if (getIndex + elementSize > viewSize) return withError("Range", "out of range larger viewsize");
        var bufferIndex = getIndex + viewOffset;
        return SetValueInBuffer(buffer, bufferIndex, type, littleEndian);
    }

    function GetViewValue(view, requestIndex, isLittleEndian, type) {
        var v = ToObject(view);
        if ((v == ifAbrupt(v)) && isAbrupt(v)) return v;
        if (!hasInternalSlot(v, "DataArrayBuffer")) return withError("Type", "not a DataArrayBuffer");
        var buffer = getInternalSlot(v, "DataArrayBuffer");
        if (buffer === undefined) return withError("Type", "buffer is undefined");
        var numberIndex = ToNumber(requestIndex);
        var getIndex = ToInteger(numberIndex);
        if ((getIndex = ifAbrupt(getIndex)) && isAbrupt(getIndex)) return getIndex;
        if ((numberIndex !== getIndex) || (getIndex < 0)) return withError("Range", "index out of range");
        var littleEndian = ToBoolean(isLittleEndian);
        if ((littleEndian = ifAbrupt(littleEndian)) && isAbrupt(littleEndian)) return littleEndian;
        var viewOffset = getInternalSlot(v, "ByteOffset");
        var viewSize = getInternalSlot(v, "ByteLength");
        var elementSize = TypedArrayElementSize[type];
        if (getIndex + elementSize > viewSize) return withError("Range", "out of range larger viewsize");
        var bufferIndex = getIndex + viewOffset;
        return GetValueFromBuffer(buffer, bufferIndex, type, littleEndian);
    }

    // ===========================================================================================================
    // floor, ceil, abs, min, max
    // ===========================================================================================================

    var floor = Math.floor;
    var ceil = Math.ceil;
    var abs = Math.abs;
    var min = Math.min;
    var max = Math.max;

    function _floor(x) {
        return x - (x % 1);
    }

    function _ceil(x) {
        return x - (x % 1) + 1;
    }

    function _abs(x) {
        return x < 0 ? -x : x;
    }

    function sign(x) {
        return x < 0 ? -1 : 1;
    }

    function _min() {
        var min = Infinity;
        var n;
        for (var i = 0, j = arguments.length; i < j; i++)
            if ((n = arguments[i]) < min) min = n;
        return min;
    }

    function _max() {
        var max = -Infinity;
        var n;
        for (var i = 0, j = arguments.length; i < j; i++)
            if ((n = arguments[i]) > max) max = n;
        return max;
    }

    // ===========================================================================================================
    // assign (copies properties)
    // ===========================================================================================================

    function addMissingProperties(target, mixin) {
        for (var k in mixin) {
            if (Object.hasOwnProperty.call(mixin, k)) {
                if (!Object.hasOwnProperty.call(target, k)) Object.defineProperty(target, k, Object.getOwnPropertyDescriptor(mixin, k));
            }
        }
        return target;
    }

    function assign(obj, obj2) {
        for (var k in obj2) {
            obj[k] = obj2[k];
        }
        return obj;
    }

    // ===========================================================================================================
    // Error Stack
    // ===========================================================================================================


    function printException (error) {
        var name = Get(error, "name");
        var message = Get(error, "message");
        var stack = Get(error, "stack");
        var text = makeMyExceptionText(name, message, callstack);
        console.log(text);
    }

    function makeMyExceptionText(name, message, callstack) {
        var text = "";
        text += "An exception has been thrown!\r\n";
        text += "exception.name: "+ name + "\r\n";
        text += "exception.message: " + message + "\n";
        text += "exception.stack: " + callstack + "\r\n";
        text += "\r\n";
        return text;
    }
    



    function stringifyErrorStack(type, message) {
        var callStack = getStack();
        var len = callStack.length || 0;
        var frame = getContext();
        var start = 0;
        var node, ntype, line ,column, pos, fn, clr;
        var stackTraceLimit = realm.xs.stackTraceLimit;
        var url = realm.xs.scriptLocation;
        var cnt = 1;

        if (type === undefined) type = "", message = "", stack = "";
        else {
            if (message === undefined) message = "";
            stack = type+": ";
            stack += message;
            stack += "\r\n";
        }
        
        if (len > stackTraceLimit) start = len - stackTraceLimit;
        
        for (pos = len - 1; pos >= start; pos--) {
            if (frame = callStack[pos]) {
                node = frame.state.node;
                ntype = node && node.type;
                line = frame.line;
                column = frame.column;
                fn = frame.callee;
                clr = frame.caller;
                stack += cnt + ". ";
                stack += fn + " at " + ntype + "  at line " + line + ", column " + column + " ";
                stack += "[caller " + clr + " @ "+url+"]";
                stack += "\r\n";
                cnt = cnt + 1;
            }
        }
        return stack;
    }

    // ===========================================================================================================
    // return withError
    // ===========================================================================================================

    // This Function returns the Errors, say the spec says "Throw a TypeError", then return withError("Type", message);


    function withRangError(message) {
        return Completion("throw", OrdinaryConstruct(getIntrinsic("%SyntaxError%"), [message]));
    }


    function withSyntaxError(message) {
        return Completion("throw", OrdinaryConstruct(getIntrinsic("%SyntaxError%"), [message]));
    }

    function withTypeError(message) {
        return Completion("throw", OrdinaryConstruct(getIntrinsic("%TypeError%"), [message]));
    }

    function withError(type, message) {
        return Completion("throw", OrdinaryConstruct(getIntrinsic("%" + type + "Error%"), [message]), "");
    }

    // ===========================================================================================================
    // Generator Algorithms
    // ===========================================================================================================

    function generatorCallbackWrong(generator, body) {
        //var result = exports.ResumableEvaluation(body);

        var result = realm.xs.Evaluate(body);
        if ((result = ifAbrupt(result)) && isAbrupt(result)) return result;
        // if (IteratorComplete(result)) {
        if ((result = ifAbrupt(result)) && isAbrupt(result) && result.type === "return") {
            Assert(isAbrupt(result) && result.type === "return", "expecting abrupt return completion");
            setInternalSlot(generator, "GeneratorState", "completed");
            if ((result = ifAbrupt(result)) && isAbrupt(result)) return result;
            cx.generatorCallback = undefined;
            return CreateItrResultObject(result, true);
            //}
        }
        return result;
    }

    function GeneratorStart(generator, body) {
        Assert(getInternalSlot(generator, "GeneratorState") === undefined, "GeneratorStart: GeneratorState has to be undefined");
        var cx = getContext();
        cx.generator = generator;
        cx.generatorCallback = function () {
            return generatorCallbackWrong(generator, body);
        };
        setInternalSlot(generator, "GeneratorContext", cx);
        setInternalSlot(generator, "GeneratorState", "suspendedStart");
        return generator;
    }

    function GeneratorResume(generator, value) {

        if (Type(generator) !== "object") return withError("Type", "resume: Generator is not an object");
        if (!hasInternalSlot(generator, "GeneratorState")) return withError("Type", "resume: Generator has no GeneratorState property");
        var state = getInternalSlot(generator, "GeneratorState");
        if (state !== "suspendedStart" && state !== "suspendedYield") return withError("Type", "Generator is neither in suspendedStart nor suspendedYield state");
        var genContext = getInternalSlot(generator, "GeneratorContext");

        var methodContext = getContext();
        getStack().push(genContext);
        
        setInternalSlot(generator, "GeneratorState", "executing");

        var generatorCallback = genContext.generatorCallback;
        var result = generatorCallback(NormalCompletion(value));
        var x = getContext();
        
        if (x !== methodContext) {
            console.log("GENERATOR ACHTUNG: CONTEXT MISMATCH TEST NICHT BESTANDEN - resume");
        };

        return result;
    }

    function GeneratorYield(itrNextObj) {
        Assert(HasOwnProperty(itrNextObj, "value") && HasOwnProperty(itrNextObj, "done"), "expecting itrNextObj to have value and done properties");
        var genContext = getContext();
        var generator = genContext.generator;

        setInternalSlot(generator, "GeneratorState", "suspendedYield");

        var x = getStack().pop();

        if (x !== genContext) {
            console.log("GENERATOR ACHTUNG: CONTEXT MISMATCH TEST NICHT BESTANDEN - yield");
        };

        genContext.generatorCallback = function (compl) {
            return compl;
        };
        return NormalCompletion(itrNextObj);
    }

    // ===========================================================================================================
    // Iterator Algorithms
    // ===========================================================================================================

    function CreateItrResultObject(value, done) {
        Assert(Type(done) === "boolean");
        var R = ObjectCreate();
        CreateDataProperty(R, "value", value);
        CreateDataProperty(R, "done", done);
        return R;
    }

    function GetIterator(obj) {
        var iterator = Invoke(obj, $$iterator, []);
        if ((iterator = ifAbrupt(iterator)) && isAbrupt(iterator)) return iterator;
        if (Type(iterator) !== "object") return withError("Type", "iterator is not an object");
        return iterator;
    }

    function IteratorNext(itr, val) {
        var result;
        if (arguments.length === 1) result = Invoke(itr, "next", []);
        else result = Invoke(itr, "next", [val]);
        if ((result = ifAbrupt(result)) && isAbrupt(result)) return result;
        if (Type(result) !== "object") return withError("Type", "IteratorNext: result is not an object");
        return result;
    }
    
    function IteratorComplete(itrResult) {
        Assert(Type(itrResult) === "object");
        var done = Get(itrResult, "done");
        return ToBoolean(done);
    }

    function IteratorValue(itrResult) {
        Assert(Type(itrResult) === "object");
        return Get(itrResult, "value");
    }

    function CreateEmptyIterator() {
        var emptyNextMethod = OrdinaryFunction();
        setInternalSlot(emptyNextMethod, "Call", function (thisArg, argList) {
            return CreateItrResultObject(undefined, true);
        });
        var obj = ObjectCreate();
        CreateDataProperty(obj, "next", emptyNextMethod);
        return obj;
    }

    function IteratorStep(iterator, value) {
        var result = IteratorNext(iterator, value);
        if ((result = ifAbrupt(result)) && isAbrupt(result)) return result;
        var done = Get(result, "done");
        if ((done = ifAbrupt(done)) && isAbrupt(done)) return done;
        if (done === true) return false;
        return result;
    }



    // ===========================================================================================================
    // Array Exotic Object
    // ===========================================================================================================

    function ArrayCreate(len, proto) {
        var p = proto || getIntrinsic("%ArrayPrototype%");
        var array = new ArrayExoticObject(p);
        array.Extensible = true;
        if (len !== undefined) {
            array.ArrayInitialisationState = true;
        } else {
            array.ArrayInitialisationState = false;
            len = 0;
        }
        OrdinaryDefineOwnProperty(array, "length", {
            value: len,
            writable: true,
            enumerable: false,
            configurable: false
        });
        return array;
    }

    function ArraySetLength(A, Desc) {
        if (Desc.value === undefined) {
            return OrdinaryDefineOwnProperty(A, "length", Desc);
        }
        var newLenDesc = assign({}, Desc);
        var newLen = ToUint32(Desc.value);
        if (newLen != ToNumber(Desc.value)) return withError("Range", "Array length index out of range");
        newLenDesc.value = newLen;
        var oldLenDesc = A.GetOwnProperty("length");
        if (!oldLenDesc) oldLenDesc = Object.create(null);
        var oldLen = Desc.value;
        if (newLen >= oldLen) return OrdinaryDefineOwnProperty(A, "length", newLenDesc);
        if (oldLenDesc.writable === false) return false;
        var newWritable;
        if (newLenDesc.writable === undefined || newLenDesc.writable === true) newWritable = true;
        else {
            newWritable = false;
            newLenDesc.writable = true;
        }
        var succeeded = OrdinaryDefineOwnProperty(A, "length", newLenDesc);
        if ((succeeded = ifAbrupt(succeeded)) && isAbrupt(succeeded)) return succeeded;
        if (succeeded === false) return false;
        while (newLen < oldLen) {
            oldLen = oldLen - 1;
            succeeded = A.Delete(ToString(oldLen));
            if ((succeeded = ifAbrupt(succeeded)) && isAbrupt(succeeded)) return succeeded;
            if (succeeded === false) {
                newLenDesc.value = oldLen + 1;
                if (newWritable === false) newLenDesc.writable = false;
                succeeded = OrdinaryDefineOwnProperty(A, "length", newLenDesc);
                if ((succeeded = ifAbrupt(succeeded)) && isAbrupt(succeeded)) return succeeded;
                return false;
            }
        }
        if (newWritable === false) {
            OrdinaryDefineOwnProperty(A, "length", {
                writable: false
            });
        }
        return true;
    }

    function ArrayExoticObject(proto) {
        var A = Object.create(ArrayExoticObject.prototype);
        A.Bindings = Object.create(null);
        A.Symbols = Object.create(null);
        A.Extensible = true;
        if (proto) A.Prototype = proto;
        else A.Prototype = ArrayPrototype;
        return A;
    }
    ArrayExoticObject.prototype = assign(ArrayExoticObject.prototype, OrdinaryObject.prototype);
    ArrayExoticObject.prototype = assign(ArrayExoticObject.prototype, {
        constructor: ArrayExoticObject,
        type: "object",
        toString: function () {
            return "[object ArrayExoticObject]";
        },
        DefineOwnProperty: function (P, Desc) {
            if (IsPropertyKey(P)) {

                if (IsSymbol(P)) return OrdinaryDefineOwnProperty(this, P, Desc);

                if (P === "length") {

                    return ArraySetLength(this, Desc);

                } else {

                    var testP = P;

                    if (ToString(ToInteger(testP)) === ToString(testP)) {
                        var oldLenDesc = GetOwnProperty(this, "length");
                        if (!oldLenDesc) oldLenDesc = Object.create(null);
                        var oldLen = oldLenDesc.value;
                        var index = ToUint32(P);
                        if ((index = ifAbrupt(index)) && isAbrupt(index)) return index;
                        if (index >= oldLen && oldLenDesc.writable === false) return false;
                        var succeeded = OrdinaryDefineOwnProperty(this, P, Desc);
                        if ((succeeded = ifAbrupt(succeeded)) && isAbrupt(succeeded)) return succeeded;
                        if (succeeded === false) return false;
                        if (index >= oldLen) {
                            oldLenDesc.value = index + 1;
                            succeeded = this.DefineOwnProperty("length", oldLenDesc);
                            if ((succeeded = ifAbrupt(succeeded)) && isAbrupt(succeeded)) return succeeded;
                        }
                        return true;
                    }

                }

                return OrdinaryDefineOwnProperty(this, P, Desc);
            }
            return false;
        }
    });

    // ===========================================================================================================
    // Arguments Object
    // ===========================================================================================================

    function ArgumentsExoticObject() {
        var O = Object.create(ArgumentsExoticObject.prototype);
        
        setInternalSlot(O, "Bindings", Object.create(null));
        setInternalSlot(O, "Symbols", Object.create(null));
        
        setInternalSlot(O, "Prototype", getIntrinsic("%ArrayPrototype%"));

        var map = ObjectCreate();
        setInternalSlot(map, "toString", function () {
            return "[object ParameterMap]";
        });
        setInternalSlot(O, "ParameterMap", map);

        return O;
    }
    ArgumentsExoticObject.prototype = assign(ArgumentsExoticObject.prototype, {

        type: "object",

        toString: function () {
            return "[object ArgumentsExoticObject]";
        },

        Get: function (P) {
            var ao = this;
            var map = getInternalSlot(ao, "ParameterMap");
            var isMapped = map.GetOwnProperty(P);
            if (!isMapped) {
                var v = OrdinaryGetOwnProperty(ao, P);
                if (v !== undefined) v = v.value;
                if (P === "caller" && (Type(v) === "object" && (IsCallable(v) || IsConstructor(v))) && getInternalSlot(v, "Strict")) {
                    return withError("Type", "Arguments.Get: Can not access 'caller' in strict mode");
                }
                return v;
            } else {
                return Get(map, P);
            }

        },
        GetOwnProperty: function (P) {
            var ao = this;
            var desc = readPropertyDescriptor(this, P);
            if (desc === undefined) return desc;
            var map = getInternalSlot(ao, "ParameterMap");
            var isMapped = callInternalSlot("GetOwnProperty", map, P);
            if (isMapped) desc.value = Get(map, P);
            return desc;
        },


    // Muss definitiv einen Bug haben.
        DefineOwnProperty: function (P, Desc) {
            var ao = this;
            var map = getInternalSlot(ao, "ParameterMap");
            var isMapped = callInternalSlot("GetOwnProperty", map, P);
            var allowed = OrdinaryDefineOwnProperty(ao, P, Desc);
            
            var putStatus;
            if ((allowed = ifAbrupt(allowed)) && isAbrupt(allowed)) return allowed;

            if (!allowed) return allowed;

            if (isMapped) {
                
                if (IsAccessorDescriptor(Desc)) {
                    callInternalSlot("Delete", map, P);
                } else {
                    if (Desc["value"] !== undefined) putStatus = Put(map, P, Desc.value, false);
                    Assert(putStatus === true, "Arguments::DefineOwnProperty: putStatus has to be true");
                    if (Desc.writable === false) callInternalSlot("Delete", map, P);
                }
            }
            return true;
        },
        Delete: function (P) {
            var map = this.ParameterMap;
            var isMapped = callInternalSlot("GetOwnProperty", map, P);
            var result = Delete(this, P);
            result = ifAbrupt(result);
            if (result && isMapped) callInternalSlot("Delete", map, P);
        },
        
        constructor: ArgumentsExoticObject
    });

    addMissingProperties(ArgumentsExoticObject.prototype, OrdinaryObject.prototype);

    // ===========================================================================================================
    // Proxy
    // ===========================================================================================================

    function ProxyExoticObject(handler, target) {
        var P = Object.create(ProxyExoticObject.prototype);
        setInternalSlot(P, "Prototype",getIntrinsic("%ProxyPrototype%"));
        setInternalSlot(P, "Extensible", true);
        setInternalSlot(P, "ProxyHandler", handler);
        setInternalSlot(P, "ProxyTarget", target);
        return P;
    }

    ProxyExoticObject.prototype = {
        constructor: ProxyExoticObject,
        type: "object",
        toString: function () {
            return "[object ProxyExoticObject]";
        },
        GetPrototypeOf: function () {
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "getPrototypeOf");
            if ((trap = ifAbrupt(trap)) && isAbrupt(trap)) return trap;
            if (trap === undefined) return GetPrototypeOf(T);
            var handlerProto = callInternalSlot("Call", trap, handler, [T]);
            if ((handlerProto = ifAbrupt(handlerProto)) && isAbrupt(handlerProto)) return handlerProto;
            var targetProto = GetPrototypeOf(T);
            if ((targetProto = ifAbrupt(targetProto)) && isAbrupt(targetProto)) return targetProto;
            if (!SameValue(handlerProto, targetProto)) return withError("Type", "handler and target protos differ");
            return handlerProto;
        },

        SetPrototypeOf: function (V) {
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "setPrototypeOf");
            if ((trap = ifAbrupt(trap)) && isAbrupt(trap)) return trap;
            if (trap === undefined) return SetPrototypeOf(T, V);
            var trapResult = callInternalSlot("Call", trap, H, [T, V]);
            if ((trapResult = ifAbrupt(trapResult)) && isAbrupt(trapResult)) return trapResult;
            trapResult = ToBoolean(trapResult);
            var extensibleTarget = IsExtensible(T);
            if ((extensibleTarget = ifAbrupt(extensibleTarget)) && isAbrupt(extensibleTarget)) return extensibleTarget;
            if (extensibleTarget === true) return trapResult;
            var targetProto = GetPrototypeOf(T);
            if ((targetProto = ifAbrupt(targetProto)) && isAbrupt(targetProto)) return targetProto;
            if (!SameValue(V, targetProto)) return withError("Type", "prototype argument and targetProto differ");
            return trapResult;
        },

        IsExtensible: function () {
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "isExtensible");
            if ((trap = ifAbrupt(trap)) && isAbrupt(trap)) return trap;
            if (trap === undefined) return IsExtensible(T);
            var trapResult = callInternalSlot("Call", trap, H, [T]);
            if ((trapResult = ifAbrupt(trapResult)) && isAbrupt(trapResult)) return trapResult;
            trapResult = ToBoolean(trapResult);
            var booleanTrapResult = ToBoolean(trapResult);
            if ((booleanTrapResult = ifAbrupt(booleanTrapResult)) && isAbrupt(booleanTrapResult)) return booleanTrapResult;
            var targetResult = IsExtensible(T);
            if ((targetResult = ifAbrupt(targetResult)) && isAbrupt(targetResult)) return targetResult;
            if (!SameValue(booleanTrapResult, targetResult)) return withError("Type", "trap and target boolean results differ");
            return booleanTrapResult;
        },

        PreventExtensions: function () {
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "preventExtensions");
            if ((trap = ifAbrupt(trap)) && isAbrupt(trap)) return trap;
            if (trap === undefined) return PreventExtensions(T);
            var trapResult = callInternalSlot("Call", trap, H, [T]);
            if ((trapResult = ifAbrupt(trapResult)) && isAbrupt(trapResult)) return trapResult;
            var booleanTrapResult = ToBoolean(trapResult);
            if ((booleanTrapResult = ifAbrupt(booleanTrapResult)) && isAbrupt(booleanTrapResult)) return booleanTrapResult;
            var targetIsExtensible = IsExtensible(T);
            if ((targetIsExtensible = ifAbrupt(targetIsExtensible)) && isAbrupt(targetIsExtensible)) return targetIsExtensible;
            if (booleanTrapResult === true && targetIsExtensible === true) return withError("Type", "target still extensible");
            return targetIsExtensible;
        },

        HasOwnProperty: function (P) {
            Assert(IsPropertyKey(P) === true);
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "hasOwn");
            if ((trap = ifAbrupt(trap)) && isAbrupt(trap)) return trap;
            if (trap === undefined) return HasOwnProperty(T, P);
            var trapResult = callInternalSlot("Call", trap, H, [T, P]);
            if ((trapResult = ifAbrupt(trapResult)) && isAbrupt(trapResult)) return trapResult;
            var success = ToBoolean(trapResult);
            var extensibleTarget;
            var targetDesc;
            if (!success) {
                targetDesc = GetOwnProperty(T, P);
                if ((targetDesc = ifAbrupt(targetDesc)) && isAbrupt(targetDesc)) return targetDesc;
                if (targetDesc) {
                    if (targetDesc.configurable === false) return withError("Type", "targetDesc.configurable is false");
                    extensibleTarget = IsExtensible(T);
                    if ((extensibleTarget = ifAbrupt(extensibleTarget)) && isAbrupt(extensibleTarget)) return extensibleTarget;
                    if (ToBoolean(extensibleTarget) === false) return withError("Type", "target is not extensible");
                }
            } else {
                extensibleTarget = IsExtensible(T);
                if ((extensibleTarget = ifAbrupt(extensibleTarget)) && isAbrupt(extensibleTarget)) return extensibleTarget;
                if (ToBoolean(extensibleTarget) === true) return success;
                targetDesc = GetOwnProperty(T, P);
                if ((targetDesc = ifAbrupt(targetDesc)) && isAbrupt(targetDesc)) return targetDesc;
                if (targetDesc === undefined) return withError("Type", "target descriptor is undefined");
            }
            return success;
        },

        GetOwnProperty: function (P) {
            Assert(IsPropertyKey(P) === true);
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "getOwnPropertyDescriptor");
            if ((trap = ifAbrupt(trap)) && isAbrupt(trap)) return trap;
            if (trap === undefined) return GetOwnProperty(T, P);
            var trapResultObj = callInternalSlot("Call", trap, H, [T, P]);
            if ((trapResultObj = ifAbrupt(trapResultObj)) && isAbrupt(trapResultObj)) return trapResultObj;
            if (Type(trapResultObj) !== "object" && Type(trapResultObj) !== "undefined") return withError("Type", "getown - neither object nor undefined");
            var targetDesc = GetOwnProperty(T, P);
            if ((targetDesc = ifAbrupt(targetDesc)) && isAbrupt(targetDesc)) return targetDesc;
            var extensibleTarget;
            if (Type(trapResultObj) === "undefined") {
                if (targetDesc === undefined) return undefined;
                if (targetDesc.configurable === false) return withError("Type", "inconfigurable target problem");
                extensibleTarget = IsExtensible(T);
                if ((extensibleTarget = ifAbrupt(extensibleTarget)) && isAbrupt(extensibleTarget)) return extensibleTarget;
                if ((extensibleTarget = ToBoolean(extensibleTarget)) === false) return withError("Type", "target is not extensible");
                return undefined;
            }
            extensibleTarget = IsExtensible(T);
            if ((extensibleTarget = ifAbrupt(extensibleTarget)) && isAbrupt(extensibleTarget)) return extensibleTarget;
            extensibleTarget = ToBoolean(extensibleTarget);
            var resultDesc = ToPropertyDescriptor(trapResultObj);
            CompletePropertyDescriptor(resultDesc, targetDesc);
            var valid = IsCompatiblePropertyDescriptor(extensibleTarget, resultDesc, targetDesc);
            if (!valid) return withError("Type", "invalid property descriptor");
            if (resultDesc.configurable === false) {
                if (targetDesc === undefined || targetDesc.configurable === true) return withError("Type", "descriptor configurability mismatch");
            }
            return resultDesc;
        },

        DefineOwnProperty: function (P, D) {
            Assert(IsPropertyKey(P) === true);
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "defineProperty");
            if ((trap = ifAbrupt(trap)) && isAbrupt(trap)) return trap;
            if (trap === undefined) return DefineOwnProperty(T, P, D);
            var trapResult = callInternalSlot("Call", trap, H, [T, P, D]);
            if ((trapResult = ifAbrupt(trapResult)) && isAbrupt(trapResult)) return trapResult;
            var targetDesc = GetOwnProperty(T, P);
            if ((targetDesc = ifAbrupt(targetDesc)) && isAbrupt(targetDesc)) return targetDesc;
            var extensibleTarget = ToBoolean(extensibleTarget);
            var settingConfigFalse;
            if (D.configurable !== undefined && !D.configurable) {
                settingConfigFalse = true;
            } else settingConfigFalse = false;
            if (targetDesc === undefined) {
                if (!extensibleTarget) return withError("Type", "target not extensible");
                if (settingConfigFalse) return withError("Type", "not configurable descriptor or undefined and no target descriptor?!");
            } else {
                if (!IsCompatiblePropertyDescriptor(extensibleTarget, D, targetDesc)) return withError("Type", "incompatible descriptors");
                if (settingConfigFalse && targetDesc.configurable) return withError("Type", "configurability incomptatiblity");
            }
            return true;
        },

        HasProperty: function (P) {
            Assert(IsPropertyKey(P) === true);
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "has");
            if ((trap = ifAbrupt(trap)) && isAbrupt(trap)) return trap;
            if (trap === undefined) return HasProperty(T, P);
            var trapResult = callInternalSlot("Call", trap, H, [T, P]);
            if ((trapResult = ifAbrupt(trapResult)) && isAbrupt(trapResult)) return trapResult;
            var success = ToBoolean(trapResult);
            if (!success) {
                var targetDesc = GetOwnProperty(T, P);
                if ((targetDesc = ifAbrupt(targetDesc)) && isAbrupt(targetDesc)) return targetDesc;
                if (targetDesc) {
                    if (targetDesc.configurable === false) return withError("Type", "targetDesc.configurable is false");
                    extensibleTarget = IsExtensible(T);
                    if ((extensibleTarget = ifAbrupt(extensibleTarget)) && isAbrupt(extensibleTarget)) return extensibleTarget;
                    if (ToBoolean(extensibleTarget) === false) return withError("Type", "target is not extensible");
                }
            }
            return success;
        },

        Get: function (P) {
            Assert(IsPropertyKey(P) === true);
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "get");
            if ((trap = ifAbrupt(trap)) && isAbrupt(trap)) return trap;
            if (trap === undefined) return Get(T, P);
            var trapResult = callInternalSlot("Call", trap, H, [T, P]);
            if ((trapResult = ifAbrupt(trapResult)) && isAbrupt(trapResult)) return trapResult;

            var targetDesc = GetOwnProperty(T, P);
            if ((targetDesc = ifAbrupt(targetDesc)) && isAbrupt(targetDesc)) return targetDesc;
            if (targetDesc) {
                if (IsDataDescriptor(targetDesc) && targetDesc.configurable === false && targetDesc.writable === false) {
                    if (!SameValue(trapResult, targetDesc.value)) return withError("Type", "trap and target values differ");
                } else if (IsAccessorDescriptor(targetDesc) && targetDesc.configurable === false && targetDesc.get === undefined) {
                    if (trapResult) return withError("Type", "Getter problem, undefined and not configurable");
                }
            }
            return trapResult;
        },
        Set: function (P, V, R) {
            Assert(IsPropertyKey(P) === true);
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "set");
            if ((trap = ifAbrupt(trap)) && isAbrupt(trap)) return trap;
            if (trap === undefined) return Set(T, P, V, R);
            var trapResult = callInternalSlot("Call", trap, H, [T, P, V, R]);
            if ((trapResult = ifAbrupt(trapResult)) && isAbrupt(trapResult)) return trapResult;
            if (ToBoolean(trapResult) === false) return withError("Type", "cant set value with trap");
            var targetDesc = GetOwnProperty(T, P);
            if ((targetDesc = ifAbrupt(targetDesc)) && isAbrupt(targetDesc)) return targetDesc;
            if (targetDesc) {
                if (IsDataDescriptor(targetDesc) && targetDesc.configurable === false && targetDesc.writable === false) {
                    if (!SameValue(trapResult, targetDesc.value)) return withError("Type", "trap and target values differ");
                } else if (IsAccessorDescriptor(targetDesc) && targetDesc.configurable === false) {
                    if (targetDesc.set === undefined) return withError("Type", "Getter problem, undefined and not configurable");
                }
            }
            return true;
        },
        Invoke: function (P, A, R) {
            Assert(IsPropertyKey(P) === true);
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "invoke");
            if ((trap = ifAbrupt(trap)) && isAbrupt(trap)) return trap;
            if (trap === undefined) return Invoke(T, P, A, R);
            var argArray = CreateArrayFromList(A);
            return callInternalSlot("Call", trap, H, [T, P, argArray, R]);
        },
        Delete: function (P) {

            Assert(IsPropertyKey(P) === true);
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "deleteProperty");
            if ((trap = ifAbrupt(trap)) && isAbrupt(trap)) return trap;
            if (trap === undefined) return Delete(T, P);
            var trapResult = callInternalSlot("Call", trap, H, [T, P]);
            if ((trapResult = ifAbrupt(trapResult)) && isAbrupt(trapResult)) return trapResult;

            if (ToBoolean(trapResult) === false) return false;
            var targetDesc = GetOwnProperty(T, P);
            if ((targetDesc = ifAbrupt(targetDesc)) && isAbrupt(targetDesc)) return targetDesc;
            if (targetDesc === undefined) return true;
            if (targetDesc.configurable === false) return withError("Type", "property is not configurable");
            return true;

        },

        Enumerate: function () {
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "enumerate");
            if ((trap = ifAbrupt(trap)) && isAbrupt(trap)) return trap;
            if (trap === undefined) return Enumerate(T);
            var trapResult = callInternalSlot("Call", trap, H, [T]);
            if ((trapResult = ifAbrupt(trapResult)) && isAbrupt(trapResult)) return trapResult;
            if (Type(trapResult) !== "object") return withError("Type", "trapResult is not an object");
            return trapResult;
        },
        OwnPropertyKeys: function () {
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "ownKeys");
            if ((trap = ifAbrupt(trap)) && isAbrupt(trap)) return trap;
            if (trap === undefined) return OwnPropertyKeys(T);
            var trapResult = callInternalSlot("Call", trap, H, [T]);
            if ((trapResult = ifAbrupt(trapResult)) && isAbrupt(trapResult)) return trapResult;
            if (Type(trapResult) !== "object") return withError("Type", "trapResult is not an object");
            return trapResult;
        },

        Call: function (thisArg, argList) {
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "apply");
            if ((trap = ifAbrupt(trap)) && isAbrupt(trap)) return trap;
            if (trap === undefined) return callInternalSlot("Call",T, thisArg, argList);
            var argArray = CreateArrayFromList(argList);
            return callInternalSlot("Call", trap, H, [T, thisArg, argArray]);
        },

        Construct: function (argList) {
            var T = getInternalSlot(this, "ProxyTarget");
            var H = getInternalSlot(this, "ProxyHandler");
            var trap = GetMethod(H, "construct");
            if ((trap = ifAbrupt(trap)) && isAbrupt(trap)) return trap;
            if (trap === undefined) return callInternalSlot("Construct", T, argList);
            var argArray = CreateArrayFromList(argList);
            var newObj = callInternalSlot("Call", trap, H, [T, argArray]);
            if ((newObj = ifAbrupt(newObj)) && isAbrupt(newObj)) return newObj;
            if (Type(newObj) !== "object") return withError("Type", "returned value is not an object");
            return newObj;
        }
    };

    // ===========================================================================================================
    // Date Algorithms
    // ===========================================================================================================

    var msPerDay = 1000 * 60 * 60 * 24;
    var msPerHour = 1000 * 60 * 60;
    var msPerMinute = 1000 * 60;
    var msPerSecond = 1000;
    var minutesPerHour = 60;
    var hoursPerDay = 24;
    var secondsPerMinute = 60;
    var msPerYear = msPerDay * 365;

    function UTC() {

    }

    function thisTimeValue(value) {
        if (value instanceof CompletionRecord) return thisTimeValue(value);
        if (Type(value) === "object" && hasInternalSlot(value, "DateValue")) {
            var b = getInternalSlot(value, "DateValue");
            if (b !== undefined) return b;
        }
        return withError("Type", "thisTimeValue: value is not a Date");
    }

    function Day(t) {
        return Math.floor(t / msPerDay);
    }

    function TimeWithinDay(t) {
        return t % msPerDay;
    }

    function DaysInYear(y) {
        var a = y % 4;
        var b = y % 100;
        var c = y % 400;
        if (a !== 0) return 365;
        if (a === 0 && b !== 0) return 366;
        if (b === 0 && c !== 0) return 365;
        if (c === 0) return 366;
    }

    function DayFromYear(y) {
        return msPerDay * DayFromYear(y);
    }

    function YearFromTime(t) {
        var y = t / (60 * 60 * 24 * 365);
        return y;
    }

    function InLeapYear(t) {
        var diy = DaysInYear(YearFromTime(t));
        if (diy == 365) return 0;
        if (diy == 366) return 1;
    }

    var Months = {
        __proto__: null,
        0: "January",
        1: "February",
        2: "March",
        3: "April",
        4: "May",
        5: "June",
        6: "July",
        7: "August",
        8: "September",
        9: "October",
        10: "November",
        11: "December"
    };

    function MonthFromTime(t) {
        var il = InLeapYear(t);
        var dwy = DayWithinYear(t);
        if (0 <= dwy && dwy < 31) return 0;
        else if (31 <= dwy && dwy < 59 + il) return 1;
        else if (59 + il <= dwy && dwy < 90 + il) return 2;
        else if (90 + il <= dwy && dwy < 120 + il) return 3;
        else if (120 + il <= dwy && dwy < 151 + il) return 4;
        else if (151 + il <= dwy && dwy < 181 + il) return 5;
        else if (181 + il <= dwy && dwy < 212 + il) return 6;
        else if (212 + il <= dwy && dwy < 243 + il) return 7;
        else if (243 + il <= dwy && dwy < 273 + il) return 8;
        else if (273 + il <= dwy && dwy < 304 + il) return 9;
        else if (304 + il <= dwy && dwy < 334 + il) return 10;
        else if (334 + il <= dwy && dwy < 365 + il) return 11;
    }

    function DayWithinYear(t) {
        return Day(t) - DayFromYear(YearFromTime(t));
    }

    function HourFromTime(t) {
        return Math.floor(t / msPerHour) % hoursPerDay;
    }

    function MinFromTime(t) {
        return Math.floor(t / msPerMinute) % minutesPerHour;
    }

    function SecFromTime(t) {
        return Math.floor(t / msPerSecond) % secondsPerMinute;
    }

    function msFromTime(t) {
        return t % msPerSecond;
    }

    function MakeTime(hour, min, sec, ms) {
        if (isFinite(hour) === false) return NaN;
        var h = ToInteger(hour);
        var m = ToInteger(min);
        var sec = ToInteger(sec);
        var milli = ToInteger(ms);
        var t = h * msPerHour + m * msPerMinute + s * msPerSecond + milli;
        return t;
    }

    function MakeDay(year, month, date) {
        if (!isFinite(time)) return NaN;
        var y = ToInteger(year);
        var m = ToInteger(month);
        var dt = ToInteger(date);
        var ym = Math.floor(m / 12);
        var mn = m % 12;
        var t;
        return Day(t) + dt - 1;
    }

    function MakeDate(day, time) {
        if (!isFinite(day)) return NaN;
        return day * msPerDay + time;
    }

    function TimeClip(time) {
        if (!isFinite(time)) return NaN;
        if (Math.abs(time) > (8.64 * Math.pow(10, 15))) return NaN;
        return ToInteger(time) + (+0);
    }

    function WeekDay (t) {
        return ((Day(t) + 4) % 7);
    }

    // ===========================================================================================================
    // Encode, Decode Algorithms
    // ===========================================================================================================

    function Encode(string, unescapedSet) {
        var strLen = string.length;
        var R = "";
        var k = 0;
        var C, S, cu, V, kChar;
        while (k < strLen) {
            if (k === strLen) return NormalCompletion(R);
            C = string[k];
            if (unescapedSet.indexOf(C) > -1) {
                R += C;
            } else {
                cu = C.charCodeAt(0);
                if (!(cu < 0xDC00) && !(cu > 0xDFFF)) return withError("URI", "Encode: Code unit out of Range");
                else if (cu < 0xD800 || cu > 0xDBFF) {
                    V = cu;
                } else {
                    k = k + 1;
                    if (k === strLen) return withError("URI", "Encode: k eq strLen");
                    kChar = string.charCodeAt(k);
                    if (kChar < 0xDC00 || kChar > 0xDFFF) return withError("URI", "kChar code unit is out of range");
                    V = ((cu - 0xD800) * 0x400 + (kChar - 0xDC00) + 0x10000);
                    /*
			Achtung Oktett encodierung aus Tabelle 32 (rev 16)
		*/
                }
                var octets = UTF8Encode(V);
                var L = octets.length;
                var j = 0;
                var joctets;
                while (j < L) {
                    joctets = octets[j];
                    S = "%" + joctets.toString(16).toUpperCase();
                    j = j + 1;
                    R = R + S;
                }
            }
            k = k + 1;
        }
        return NormalCompletion(R);
    }

    function UTF8Encode(V) {
        return [V];
    }

    var HexDigits = require("lib/tables").HexDigits; // CAUTION: require

    function Decode(string, reservedSet) {
        var strLen = string.length;
        var R = "";
        var k = 0;
        var S;
        for (;;) {
            if (k === strLen) return NormalCompletion(R);
            var C = string[k];
            if (C !== "%") {
                S = "" + C;
            } else {
                var start = k;
                if (k + 2 >= strLen) return withError("URI", "k+2>=strLen");
                if (!HexDigits[string[k + 1]] || !HexDigits[string[k + 2]]) return withError("URI", "%[k+1][k+2] are not hexadecimal letters");
                var hex = string[k + 1] + string[k + 2];
                var B = parseInt(hex, 16);
                k = k + 2;

            }
            R = R + S;
            k = k + 1;
        }
    }
    var uriReserved = ";/?:@&=+$,";
    var uriUnescaped = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~_.!\"*'()";

    // ===========================================================================================================
    //
    // some functions...

    function assignConstructorAndPrototype(Function, Prototype) {
        setInternalSlot(Function, "Prototype", Prototype);
        DefineOwnProperty(Function, "prototype", {
            value: Prototype,
            enumerable: false,
            writable: true,
            configurable: true
        });
        DefineOwnProperty(Prototype, "constructor", {
            value: Function,
            enumerable: false,
            writable: true,
            configurable: true
        });
    }

    function ObjectDefineProperty(O, P, Desc) {
        if (IsDataDescriptor(Desc)) {
            callInternalSlot("DefineOwnProperty", O,P, Desc);
        } else if (IsAccessorDescriptor(Desc)) {
            callInternalSlot("DefineOwnProperty", O,P, Desc);
        }
        return O;
    }

    function ObjectDefineProperties(O, Properties) {
        var pendingException;
        if (Type(O) !== "object") return withError("Type", "first argument is not an object");
        var props = ToObject(Properties);
        var names = OwnPropertyKeysAsList(props);
        var P, descriptors = [];
        var descObj, desc;
        for (P in names) {
            descObj = Get(props, names[P]);
            if ((descObj = ifAbrupt(descObj)) && isAbrupt(descObj)) return descObj;
            desc = ToPropertyDescriptor(descObj);
            if ((desc = ifAbrupt(desc)) && isAbrupt(desc)) return desc;
            descriptors.push({
                P: names[P],
                desc: desc
            });
        }
        var pair, status;
        for (var i in descriptors) {
            pair = descriptors[i];
            P = pair.P;
            desc = pair.desc;
            status = DefineOwnPropertyOrThrow(O, P, desc);
            if (isAbrupt(status)) pendingException = status;
        }
        if ((pendingException = ifAbrupt(pendingException)) && isAbrupt(pendingException)) return pendingException;
        return O;
    }

    // ===========================================================================================================
    // add missing properties (used often)
    // ===========================================================================================================

    function addMissingProperties(target, mixin) {
        for (var k in mixin) {
            if (Object.hasOwnProperty.call(mixin, k)) {
                if (!Object.hasOwnProperty.call(target, k)) Object.defineProperty(target, k, Object.getOwnPropertyDescriptor(mixin, k));
            }
        }
        return target;
    }

    // ===========================================================================================================
    // assign (copies properties)
    // ===========================================================================================================

    function assign(obj, obj2) {
        for (var k in obj2) {
            obj[k] = obj2[k];
        }
        return obj;
    }

    // ===========================================================================================================
    // LazyDefineProperty (used intermediary)
    // ===========================================================================================================

    function LazyDefineFalseTrueFalse(O, name, value) {
        return callInternalSlot("DefineOwnProperty", O, name, {
            configurable: false,
            enumerable: true,
            value: value,
            writable: false 
        });
    }

    function LazyDefineBuiltinConstant(O, name, value) {
        return callInternalSlot("DefineOwnProperty", O, name, {
            configurable: false,
            enumerable: false,
            value: value,
            writable: false 
        });
    }

    // noch was vereinfacht
    function LazyDefineBuiltinFunction(O, name, arity, fproto, e, w, c) {
        if (e === undefined) e = false;
        if (w === undefined) w = true;
        if (c === undefined) c = true;
        return callInternalSlot("DefineOwnProperty", O, name, {
            configurable: c,
            enumerable: e,
            value: CreateBuiltinFunction(getRealm(),fproto, arity, name),
            writable: w
        });
    }

    function LazyDefineAccessor(obj, name, g, s, e, c) {
        if (e === undefined) e = false;
        if (c === undefined) c = true;
        return callInternalSlot("DefineOwnProperty", obj, name, {
            configurable: c,
            enumerable: e,
            get: g,
            set: s
        });
    }

    function LazyDefineProperty(O, P, V, w, e, c) {
        var desc; 
        if (w === undefined) w = true;
        if (e === undefined) e = false;
        if (c === undefined) c = true;
        if (IsDataDescriptor(V) || IsAccessorDescriptor(V)) {
            desc = V;
        } else {
            desc = {
                configurable: c,
                enumerable: e,
                value: V,
                writable: w
            };
        }
        //return callInternalSlot("DefineOwnProperty", O, P, desc);
        return OrdinaryDefineOwnProperty(O, P, desc);
    }

    // ===========================================================================================================
    // AddRestricted FPs
    // ===========================================================================================================

    function AddRestrictedFunctionProperties(F) {
        var thrower = getIntrinsic("%ThrowTypeError%");
        var status = DefineOwnPropertyOrThrow(F, "caller", {
            get: thrower,
            set: thrower,
            enumerable: false,
            configurable: false
        });
        if (isAbrupt(status)) return status;
        return DefineOwnPropertyOrThrow(F, "arguments", {
            get: thrower,
            set: thrower,
            enumerable: false,
            configurable: false
        });
    }

    // ===========================================================================================================
    // Create Builtin (Intrinsic Module)
    // ===========================================================================================================

    function CreateBuiltinFunction(realm, steps, len, name) {
        
        var tmp;
        var realm = getRealm();
        var F = OrdinaryFunction();

        // this is probably unneccessary, coz all builtins have no access to the environments anyways
        // because they are plain javascript functions
        function Call() {
            var result;
            var cx = new ExecutionContext(getLexEnv(), realm);
            var stack = getStack();
            stack.push(cx);
            result = steps.apply(this, arguments);
            Assert(cx === stack.pop(), "CreateBuiltinFunction: Wrong Context popped from the Stack.");
            return result;
        }
        // the .steps reference is needed by function.prototype.toString to put out the right function
        Call.steps = steps;
        
        setInternalSlot(F, "Call", Call);
        setInternalSlot(F, "Code", undefined);
        setInternalSlot(F, "Construct", undefined);
        setInternalSlot(F, "FormalParameters", undefined);
        setInternalSlot(F, "Prototype", getIntrinsic("%FunctionPrototype%"));
        setInternalSlot(F, "Environment", undefined);
        setInternalSlot(F, "Strict", true);
        setInternalSlot(F, "Realm", realm);
     
        AddRestrictedFunctionProperties(F);
     
        if (typeof len === "string") {
            tmp = name;
            name = len;
            len = tmp;
        }     
        if (typeof name !== "string") name = steps.name;
        if (name) SetFunctionName(F, name);
        if (typeof len !== "number") len = 0;
        setFunctionLength(F, len);
        return F;
    }




    //
    //
    //
    exports.printException = printException;
    exports.makeMyExceptionText = makeMyExceptionText;


    exports.PromiseNew = PromiseNew;
    exports.PromiseBuiltinCapability = PromiseBuiltinCapability;
    exports.PromiseOf = PromiseOf;
    exports.PromiseAll = PromiseAll;
    exports.PromiseCatch = PromiseCatch;
    exports.PromiseThen = PromiseThen;

    function PromiseNew (executor) {
        var promise = AllocatePromise("%Promise%");
        return IntialisePromise(promise, executor);
    }
    function PromiseBuiltinCapability() {
        var promise = AllocatePromise("%Promise%");
        return CreatePromiseCapabilityRecord(promise, "%Promise%");
    }
    function PromiseOf(value) {
        var capability = PromiseNewCapability();
        if ((capability = ifAbrupt(capability)) && isAbrupt(capability)) return capability;
        var resolveResult = callInternalSlot("Call", capability.Resolve, undefined, [value]);
        if ((resolveResult=ifAbrupt(resolveResult)) && isAbrupt(resolveResult)) return resolveResult;
        return NormalCompletion(capability.Promise);
    }
    function PromiseAll(promiseList) {

    }
    function PromiseCatch(promise, rejectedAction) {}
    function PromiseThen(promise, resolvedAction, rejectedAction) {}





    //
    // Realm und Loader
    //
    //
    //


        function IndirectEval(realm, source) {
            
            return realm.toValue(source);

        }

        function CreateRealm (realmObject) {
            /*var realm = createRealm({ createOnly: true });
            setInternalSlot(realmObject, "Realm", realm);
            return realm;
            */

            var realmRec = new CodeRealm();
            
            var intrinsics = createIntrinsics(realmRec);
            var newGlobal = ObjectCreate(null);
            defineGlobalObject(newGlobal, intrinsics);
        }



        function GetOrCreateLoad() {
            var F = OrdinaryFunction();
            setInternalSlot(F, "Call", GetOrCreateLoad_Call);
            return F;
        }

        function ProceedToLocate(loader, load, p) {
            p = PromiseResolve(undefined);
            var F = CallLocate();
            setInternalSlot(F, "Loader", loader);
            setInternalSlot(F, "Load", load);
            p = PromiseThen(loader, load, p);
            return ProceedToFetch(loader, load, p);
        }

        function ProceedToFetch(loader, load, p) {
            var F = CallFetch();
            setInternalSlot(F, "Loader", loader);
            setInternalSlot(F, "Load", load);
            setInternalSlot(F, "AddressPromise", p);
            return ProceedToTranslate(loader, load, p);
        }

        function ProceedToTranslate(loader, load, p) {
            var F = CallTranslate();
            setInternalSlot(F, "Loader", loader);
            setInternalSlot(F, "Load", load);
            p = PromiseThen(p, F);
            F = CallInstantiate();
            setInternalSlot(F, "Loader", loader);
            setInternalSlot(F, "Load", load);
            p = PromiseThen(p, F);
            F = InstantiateSucceeded();
            setInternalSlot(F, "Loader", loader);
            setInternalSlot(F, "Load", load);
            p = PromiseThen(p, F);
            F = LoadFailed();
            setInternalSlot(F, "Load", load);
            p = PromiseCatch(p, F);
        }

        function SimpleDefine(obj, name, value) {
            return OrdinaryDefineOwnProperty(obj, name, {
                value: value,
                writable: true,
                enumerable: true,
                configurable: true
            });
        }

        var CallLocate_Call = function (thisArg, argList) {
            var F = this;
            var loader = getInternalSlot(F, "Loader");
            var load = getInternalSlot(F, "Load");
            var hook = Get(loader, "locate");
            if ((hook=ifAbrupt(hook)) && isAbrupt(hook)) return hook;
            if (!IsCallable(hook)) return withError("Type", "call locate hook is not callable");
            SimpleDefine(obj, "name", load.name);y
            SimpleDefine(obj, "metadata", load.metadata);
            return callInternalSlot("Call", hook, loader, [obj]);
        };

        function CallLocate() {
            var F = OrdinaryFunction();
            setInternalSlot(F, "Call", CallLocate_Call);
            return F;
        }

        var CallFetch_Call = function (thisArg, argList) {
            var F = this;
            var address = argList[0];
            var loader = getInternalSlot(F, "Loader");
            var load = getInternalSlot(F, "Load");
            load.address = address;
            var hook = Get(loader, "fetch");
            if ((hook=ifAbrupt(hook)) && isAbrupt(hook)) return hook;
            if (!IsCallable(hook)) return withError("Type", "call fetch hook is not callable");            
            var obj = ObjectCreate();
            SimpleDefine(obj, "name", load.name);
            SimpleDefine(obj, "metadata", load.metadata);
            SimpleDefine(obj, "address", address);
            return callInternalSlot("Call", hook, loader, [obj]);
        };

        function CallFetch() {
            var F = OrdinaryFunction();
            setInternalSlot(F, "Call", CallFetch_Call);
            return F;
        }

        var CallTranslate_Call = function (thisArg, argList) {
            var F = this;
            var source = argList[0];
            var loader = getInternalSlot(F, "Loader");
            var load = getInternalSlot(F, "Load");
            if (!load.linksets.length) return NormalCompletion(undefined);
            var hook = Get(loader, "translate");
            if ((hook=ifAbrupt(hook)) && isAbrupt(hook)) return hook;
            if (!IsCallable(hook)) return withError("Type", "call translate hook is not callable");            
            var obj = ObjectCreate();
            SimpleDefine(obj, "name", load.name);
            SimpleDefine(obj, "metadata", load.metadata);
            SimpleDefine(obj, "address", load.address);
            SimpleDefine(obj, "source", source);
            return callInternalSlot("Call", hook, loader, [obj]);
        };

        function CallTranslate() {
            var F = OrdinaryFunction();
            setInternalSlot(F, "Call", CallTranslate_Call);
            return F;
        }

        var CallInstantiate_Call = function (thisArg, argList) {
            var F = this;
            var source = argList[0];
            var loader = getInternalSlot(F, "Loader");
            var load = getInternalSlot(F, "Load");
            var hook = Get(loader, "instantiate");
            if ((hook=ifAbrupt(hook)) && isAbrupt(hook)) return hook;
            if (!IsCallable(hook)) return withError("Type", "call translate hook is not callable");            
            var obj = ObjectCreate();
            SimpleDefine(obj, "name", load.name);
            SimpleDefine(obj, "metadata", load.metadata);
            SimpleDefine(obj, "address", load.address);
            SimpleDefine(obj, "source", source);
            return callInternalSlot("Call", hook, loader, [obj]);
        };

        function CallInstantiate() {
            var F = OrdinaryFunction();
            setInternalSlot(F, "Call", CallInstantiate_Call);
            return F;
        }

        var InstantiateSucceeded_Call = function (thisArg, argList) {
            var instantiateResult = argList[0];
            var loader = getInternalSlot(F, "loader");
            var load = getInternalSlot(F, "load");
            var depsList;
            if (!load.linksets.length) return NormalCompletion(undefined);
            if (instantiateResult) {
                var body = parseGoal("Module", load.source);
                load.body = body;
                load.kind = "declarative";
                depsList = ModuleRequests(body);
            } else if (Type(instantiateResult) === "object") {
                var deps = Get(instantiateResult, "deps");
                if ((deps=ifAbrupt(deps)) && isAbrupt(deps)) return deps;
                if (deps === undefined) depsList = [];
                else {
                    depsList = IterableToList(deps);
                    //if ((depsList=ifAbrupt(depsList)) && isAbrupt(depsList)) return depsList;
                }
                var execute = Get(instantiateResult, "execute");
                load.execute = execute;
                load.kind = "dynamic";
            } else {
                return withError("Type", "error with instantiation result");
            }
            return ProcessLoadDependencies(load, loader, depsList);
        };

        function IterableToList(iterable) {
            //var A = ArrayCreate();
            var A = [];
            var next, status;
            while (next = IteratorStep(iterable)) {
                A.push(next);
                // status = Invoke(A, "push", [next]);
                //if (isAbrupt(status)) return status;
            }
            return A;
        }

        function InstantiateSucceeded() {
            var F = OrdinaryFunction();
            setInternalSlot(F, "Call", InstantiateSucceeded_Call);
            return F;
        }

        function ProcessLoadDependencies(load, loader, depsList) {
            var refererName = load.name;
            load.dependencies = [];
            var loadPromises = [];
            for (var i = 0, j = depsList.length; i < j; i++) {
                var request = depsList[i];
                var p = RequestLoad(loader, request, refererName, load.address);
                var F = AddDependencyLoad();
                setInternalSlot(F, "Load", load);
                setInternalSlot(F, "Request", request);
                p = PromiseThen(p, F);
                loadPromises.push(p);
            }
            var p = PromiseAll(loadPromises);
            var F = LoadSucceeded();p

            setInternalSlot(F, "Load", load);
            p = PromiseThen(p, F);
            return p;
        }

        var AddDependencyLoad_Call = function (thisArg, argList) {
            var depLoad = argList[0];
            var parentLoad = getInternalSlot(F, "ParentLoad");
            var request = getInternalSlot(F, "Request");
            Assert(!parentLoad.dependecies[request], "there is no parentLoad dependency whose key is equal to request, but it is");
            parentLoad.dependencies[request] = depLoad; //.name;
            if (depLoad.status !== "linked") {
                var linkSets = parentLoad.linksets; //.slice();
                for (var i = 0, j = linkSets.length; i < j; i++) {
                    var linkSet = linkSets[i];
                    AddLoadToLinkSet(linkSet, depLoad);
                }
            }
        };

        function AddDependencyLoad() {
            var F = OrdinaryFunction();
            setInternalSlot(F, "Call", AddDependencyLoad_Call);
            return F;
        }

        var LoadSucceeded_Call = function (thisArg, argList) {
            var load = getInternalSlot(F, "Load");
            Assert(load.status === "loading", "load.status should have been loading but isnt");
            load.status = "loaded";
            var linkSets = load.linksets;
            for (var i = 0, j = linkSets.length; i < j; i++) {
                var linkSet = linkSets[i];
                UpdateLinkSetOnLoad(linkSet, load);
            }
    };

        function LoadSucceeded() {
            var F = OrdinaryFunction();
            setInternalSlot(F, "Call", LoadSucceeded_Call);
            return F;
        }

        function LinkSet() {
            return {
                loader: undefined,
                loads: undefined,
                done: undefined,
                resolve: undefined,
                reject: undefined,
                constructor: LinkSet
            };
        }

        function CreateLinkSet(loader, startingLoad) {
            if (Type(loader) !== "object") return withError("Type", "CreateLinkSet: loader has to be an object");
            if (!hasInternalSlot("Loader", "Load")) return withError("Type", "CreateLinkSet: loader is missing internal properties");
            var deferred = GetDeferred(getIntrinsic("%Promise%"));
            if ((deferred = ifAbrupt(deferred)) && isAbrupt(deferred)) return deferred;
            var linkSet = LinkSet();
            linkSet.loader = loader;
            linkSet.loads = [];
            linkSet.done = deferred.Promise;
            linkSet.resolve = deferred.Resolve;
            linkSet.reject = deferred.Reject;
            AddLoadToLinkSet(linkSet, startingLoad);
            return linkSet;
        }

        function AddLoadToLinkSet(linkSet, load) {
            Assert(load.status === "loading" || load.status === "loaded", "loader.[[Status]] has to be loading or loaded");
            var loader = linkSet.loader;
            if (!linkSet.loads[load.name]) {
                linkSet.loads.push(load);
                linkSet.loads[load.name] = load;
                load.linksets.push(linkSet);
                for (var name in load.dependencies) {
                    if (!loader.modules[name]) {
                        if (loader.loads[name]) {
                            depLoad = loader.loads[name];
                            AddLoadToLinkSet(linkSet, depLoad);
                        }
                    }
                }
            }
        }

        function UpdateLinkSetOnLoad(linkSet, load) {
            var loads = linkSet.loads;
            Assert(loads.indexOf(loads) > -1, "linkset.loads has to contain load");
            Assert(load.status === "loaded" || load.status === "linked");
            for (var i = 0, j = loads.length; i < j; i++) {
                var load = loads[i];
                if (load.status === "loading") return;
            }
            var startingLoad = loads[0];
            var status = Link(loads, linkSet.loader);
            if (isAbrupt(status)) {
                LinkSetFailed(linkSet, status.value);
                return;
            }
            Assert(linkSet.loads.length === 0, "linkset.loads has to be empty here");
            var result = callInternalSlot("Call", linkset.resolve, undefined, [startingLoad]);
            Assert(!isAbrupt(result), "resolving the linkset may not terminate abnormally");
            return result;
        }

        function LinkSetFailed(linkSet, exc) {
            var loader = linkSet.loader;
            var loads = linkSet.loads; //.slice();
            for (var i = 0, j = loads.length; i < j; i++) {
                var load = loads[i];
                var idx;
                Assert((idx = load.linksets.indexOf(v)) > -1, "load.linksets has to contain linkset");
                load.linksets.splice(idx,idx+1);upt
                if ((load.linksets.length === 0) && ((idx=loader.loads.indexOf(load)) > -1)) {
                    loader.loads.splice(idx,idx+1);

                }
            }
            var result = callInternalSlot("Call", linkset.reject, undefined, [exc]);
            Assert(!isAbrupt(result), "linkset.reject may not complete abormally");
            return result;
        }

        function FinishLoad(loader, load) {
            var name = load.name;
            if (name !== undefined) {
                Assert(!loader.modules[name], "there may be no duplicate recoded in loader.modules")
                loader.modules[name] = load.module;
            }
            var idx;
            if ((idx=loader.loads.indexOf(load)) > -1) {
                load.loads.splice(idx, idx+1);
            }
            for (var i = 0, j = load.linksets.length, linksets = load.linksets; i < j; i++) {
                var loads = linksets.loads;
                idx = loads.indexOf(loads);
                if (idx>-1) {
                    loads.splice(idx, idx+1);
                }
            }
            load.linksets = [];
        }

        // Seite 21 von 43

        function LoadModule(loader, name, options) {
            var name = ToString(name);
            if ((name = ifAbrupt(name)) && isAbrupt(name)) return name;
            var address = GetOption(options, "address");
            if ((address = ifAbrupt(address)) && isAbrupt(address)) return address;
            var F = AsyncStartLoadPartwayThrough();
            setInternalSlot(F, "Loader", loader);
            setInternalSlot(F, "ModuleName", name);
            if (address === undefined) setIntenal(F, "Step", "locate");
            else setInternalSlot(F, "Step", "fetch");
            var metadata = ObjectCreate();
            setInternalSlot(F, "ModuleMetadata", metadata);
            setInternalSlot(F, "ModuleSource", source);
            setInternalSlot(F, "ModuleAddress", address);
            return OrdinaryConstruct(getIntrinsic("%Promise%"));
        }

        function GetOption(options, name) {
            if (options == undefined) return undefined;
            if (Type(options) !== "object") return withError("Type", "options is not an object");
            return Get(options, name);
        }

        var AsyncStartLoadPartwayThrough_Call = function (thisArg, argList) {
            var F = thisArg;
            var resolve = argList[0];
            var reject = argList[1];
            var loader = getInternalSlot(F, "Loader");
            var name = getInternalSlot(F, "ModuleName");
            var step = getInternalSlot(F, "Step");
            var metadata = getInternalSlot(F, "ModuleMetadata");
            var address = getInternalSlot(F, "ModuleAddress");
            var source = getInternalSlot(F, "ModuleSource");
            if (loader.modules[name]) return withError("Type", "loader.modules may not contain the same key");
            for (var i = 0, j = loader.loads.length, loads = loader.loads; i < j; i++) {
                var load = loads[i];
                if (load.name === name) return withError("Type", "loader.loads may not contain a record with the same name");
            }
            load = CreateLoad(name);
            load.metadata = metadata;
            var linkSet = CreateLinkSet(loader, load);
            loader.loads.push(load);
            var result = callInternalSlot("Call", resolve, null, [linkSet.done]);
            if (step === "locate") {
                ProceedToLocate(loader, load);
            } else if (step === "fetch") {
                var addressPromise = PromiseOf(address);
                ProceedToFetch(loader, load, addressPromise);
            } else {
                Assert(step === "translate", "step has to be translate");
                load.address = address;
                var sourcePromise = PromiseOf(source);
                ProceedToTranslate(loader, load, sourcePromise);
            }
        };

        function AsyncStartLoadPartwayThrough() {
            var F = OrdinaryFunction();
            setInternalSlot(F, "Call", AsyncStartLoadPartwayThrough_Call);
            return F;
        }

        var EvaluateLoadedModule_Call = function (thisArg, argList) {
            var F = thisArg;
            var loader = getInternalSlot(F, "Loader");
            Assert(load.status === "linked", "load.status has to be linked here");
            var module = load.module;
            var result = EnsureEvaluated(module, [], loader);
            if (isAbrupt(result)) return result;
            return module;
        };

        function EvaluateLoadedModule() {
            var F = OrdinaryFunction();
            setInternalSlot(F, "Call", EvaluateLoadedModule_Call);
            return F;
        }

        //
        // 1.3 Module Linking

        function EnsureEvaluated(mod, seen, loader) {
            var deps = mod.dependencies;
            for (var p in deps) {
                var dep = deps[p];
                if (seen.indexOf(dep) === -1) {
                    EnsureEvaluated(dep, seen, loader);
                }
            }
            var body = getInternalSlot(mod, "Body");
            if (body !== undefined && getInternalSlot(mod, "Evaluated") === false) {
                setInternalSlot(mod, "Evaluated", true);
                var initContext = cx = newContext();
                initContext.realm = getInternalSlot(loader, "Realm");
                initContext.varEnv = getInternalSlot(mod, "Environment");
                var r = Evaluate(body);
                cx = oldContext();
                if (isAbrupt(r)) return r;
            }
        }

        function OrdinaryModule() {
            var mod = ObjectCreate(null, {
                "Environment": undefined,
                "Exports": undefined,
                "Dependencies": undefined
            });
            return mod;
        }

        var ConstantFunction_Call = function (thisArg, argList) {
            return getInternalSlot(this, "ConstantValue");
        };

        function CreateConstantGetter(key, value) {
            var getter = CreateBuiltinFunction(getRealm(),ConstantFunction_Call, 0, "get " + key);
            setInternalSlot(getter, "ConstantValue", value);
            return getter;
        }

        function Module(obj) {
            if (Type(obj) !== "object") return withError("Type", "module obj is not an object");
            var mod = OrdinaryModule();
            var keys = OwnPropertyKeysAsList(obj);
            for (var k in keys) {
                var key = keys[k];
                var value = Get(obj, key);
                if ((value = ifAbrupt(value)) && isAbrupt(value)) return value;
                var F = CreateConstantGetter(key, value);
                var desc = {
                    get: F,
                    set: undefined,
                    enumerable: true,
                    configurable: false
                };
                var status = DefineOwnPropertyOrThrow(mod, key, desc);
                if ((status = ifAbrupt(status)) && isAbrupt(status)) return status;
            }
            callInternalSlot("PreventExtensions", mod, mod, []);
            return mod;
        }

        // ##################################################################
        // Modules and Loaders (linking.docx)
        // ##################################################################

        function CreateUnlinkedModuleInstance(body, boundNames, knownExports, unknownExports, imports) {
            var M = ObjectCreate(null);
            setInternalSlot(M, "Body", body);
            setInternalSlot(M, "BoundNames", boundNames);
            setInternalSlot(M, "KnownExportEntries", knownExports);
            setInternalSlot(M, "UnknownExportEntries", unknownExports);
            setInternalSlot(M, "ExportDefinitions", undefined);
            setInternalSlot(M, "Exports", undefined);
            setInternalSlot(M, "Dependencies", undefined);
            setInternalSlot(M, "UnlinkedDependencies", undefined);
            setInternalSlot(M, "ImportEntries", imports);
            setInternalSlot(M, "ImportDefinitions", undefined);
            setInternalSlot(M, "LinkErrors", []);
            var realm = getRealm();
            var globalEnv = realm.globalEnv;
            setInternalSlot(M, "Environment", env);
            return M;
        }

        function LookupModuleDependency(M, requestName) {
            if (requestName === null) return M;
            var deps = getInternalSlot(M, "Dependencies");
            var pair = deps[requestName];
            if (pair) return pair.module;
        }

        function LookupExport(M, exportName) {
            var exp = getInternalSlot(M, "Exports");
            var ex;
            if (ex = exp[exportName]) {
                return ex.binding;
            }
            return undefined;
        }

        function ResolveExportEntries(M, visited) {
            var exportDefs = getInternalSlot(M, "ExportDefinitions");
            if (exportDefs != undefined) return exportDefs;
            var defs = [];
            var boundNames = getInternalSlot(M, "BoundNames");
            var knownExportEntries = getInternalSlot(M, "KnownExportEntries");
            var linkErrors = getInternalSlot(M, "LinkErrors");
            for (var k in knownExportEntries) {

                var entry = knownExportEntries[k];
                var modReq = entry.moduleRequest // caps
                var otherMod = LookupModuleDependency(M, modReq);

                if (entry.module !== null && entry.localName !== null && !boundNames[emtry.localName]) { // caps
                    var error = withError("Reference", "linkError created in ResolveExportEntries");
                    linkErrors.push(error);
                }

            }
            setInternalSlot(M, "ExportDefinitions", defs);
            return defs;
        }

        function ResolveExports(M) {
            var exportDefinitions = getInternalSlot("M", "ExportDefinitions");
            for (var i = 0, j = exportDefinitions.length; i < j; i++) {
                var def = exportDefinitions[i];
                ResolveExport(M, def.exportName, []);
            }
        }

        function ResolveExport(M, exportName, visited) {
            var exports = getInternalSlot(M,"Exports");
            if (exports[exportName]) {
                return exports.binding;
            }
            var ref = { module: M, exportName: exportName };
            if (visited[exportName]) {
                var error = withError("Syntax", "Visited Exports in ResolveExports");
                var linkErrors = getInternalSlot(M, "LinkErrors");
                linkErrors.push(error);
                return error;
            }
            var defs = getInternalSlot(M, "ExportDefinitions");
            var overlappingDefs = [];
            var hasExplicit = 0;
            var explicit;
            for (var i = 0, j = defs.length; i < j; i++) {
                var def = defs[i]
                if (def.exportName === exportName) {
                    overlappingDefs.push(def);
                    if (def.explicit) hasExplicit++, explicit = def;
                }
            }
            if (!overlappingDefs.length) {
                error = withError("Reference", "can not find exportNames for overlappingDefs")
                var linkErrors = getInternalSlot(M, "LinkErrors");
                linkErrors.push(error);
                return error;   
            }
            if (overlappingDefs.length > 1 && hasExplicit != 1) {
                var error = withError("Syntax", "");
                var linkErrors = getInternalSlot(M, "LinkErrors");
                linkErrors.push(error);
                return error;   
            }
            var def = explicit;
            if (def.localName != null) {
                var binding = { module: M, localName: def.localName };
                var _export = {exportName:exportName, binding:binding};
                exports[exportName] = _export;
                return binding;
            }
            visited[exportName] = ref;
            binding = ResolveExport(def.module, def.importName);
            return binding;
        }

        function ResolveImportEntries(M) {
            var entries = getInternalSlot(M, "ImportEntries");
            var defs = [];
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                var modReq = entry.moduleRequest;
                var otherMod = LookupModuleDependency(M, modReq);
                var record = { module: otherMod, importName: entry.importName, localName: entry.localName };
                defs.push(record);
            }
            return defs;
        }

        function LinkImports(M) {
            var envRec = getInternalSlot(M, "Environment");
            var defs = getInternalSlot(M, "ImportDefinitions");
            for (var i = 0; i < defs.length; i++) {
                var def = defs[i];
                if (def.importName === "module") {
                    envRec.CreateImmutableBinding(def.localName);
                    envRec.InitialiseBinding(def.localName, def.module);
                } else {
                    var binding = ResolveExport(def.module, def.importName);
                    if (binding === undefined) {
                        var error = withError("Reference", "can not resolve export to a binding");
                        var linkErrors = getInternalSlot(M, "LinkErrors");
                        linkErrors.push(error);
                        return error;   
                    } 
                    envRec.CreateMutableBinding(def.localName);
                    envRec.InitialiseBinding(def.localName, binding);
                }
            }
        }

        function LinkDeclarativeModules(loads, loader) {
            var unlinked = [];
            for (var i = 0; i < loads.length; i++) {
                var load = loads[i];
                if (load.status !== "linked") {
                    var body = load.body;
                    var boundNames = BoundNames(body);
                    var knownExports = KnownExportEntries(body);
                    var unknownExports = UnknownExportEntries(body);
                    var imports = ImportEntries(body);
                    var module = CreateUnlinkedModuleInstance(body, boundNames, knownExports, unknownExports, imports);
                    var pair = { module: module, load: load };
                    unlinked.push(pair);
                }
            }
            for (i = 0; i < unlinked.length; i++) {
                pair = unlinked[i];
                var resolvedDeps = [];
                var unlinkedDeps = [];
                for (var d in pair.load.dependencies) {
                    var dep = pair.load.dependencies[d];
                    var requestName = d;  //dep[key]
                    var normalizedName = dep; // dep[value];
                    for (var i = 0; i < loads.length; i++) {
                        load = loads[i];
                        if (load.status === "linked") {
                            //var resolvedDep = { key: requestName, value: load.module };


                        }
                    }
                }
            }
        }

        function LinkDynamicModules(loads, loader) {
            for (var i = 0; i < loads.length; i++) {
                var load = loads[i];
                var factory = load.execute;
                var module = callInternalSlot("Call", factory, undefined, []);
                if ((module=ifAbrupt(module)) && isAbrupt(module)) return module;
                if (!hasInternalSlot(module, "Exports")) {
                    return withError("Type", "module object has not the required internal properties");
                }
                load.module = module;
                load.status = "linked";
                var r = FinishLoad(loader, load);
                if (isAbrupt(r)) return r;
            }
        }

        function Link(start, loader) {
            var groups = LinkageGroups(start);
            for (var g in groups) { // groups = [] ??? 
                var group = groups[g];
                if (group.kind === "declarative") { // groups.kind oder .Kind ??
                    LinkDeclarativeModules(group, loader);
                } else {
                    LinkDynamicModules(group, loader);
                }
            }
        }

        function LinkageGroups(start) {
            var G = start.loads;
            var kind;
            for (var i = 0, j = G.length; i <j; i++) {
                var record = G[i];
                if (kind && (record.kind != kind)) return withError("Syntax", "mixed dependency cylces detected");
                kind = record.kind;

            }
        }

        function BuildLinkageGroups(load, declarativeGroups, dynamicGroups, visited) {
                if (visited[name]) return;
                visited[load.name] = load;
                var groups;
                for (var i = 0, j = load.unlinkeddependencies.length; i < j; i++) {
                    BuildLinkageGroups(dep, declarativeGroups, dynamicGroups, visited);
                    var k = load.groupindex;
                    if (load.kind === "declarative") groups = declarativeGroups;
                    else groups = dynamicGroups;
                    var group = groups[i];
                    groups.push(load);
                }
        }

        // ##################################################################
        // DefineBuiltinProperties::: Modules and Loaders (linking.docx)
        // ##################################################################

        var standard_properties = {
            __proto__: null,
            "Array": true,
            "Error": true,
            "Function": true,
            "Object": true,
            "Symbol": true
        };

        function DefineBuiltinProperties(O) {
            var globalThis = getGlobalThis();
            for (var name in standard_properties) {
                if (standard_properties[name] === true) {
                    var desc = callInternalSlot("GetOwnProperty", globalThis, name);
                    var status = callInternalSlot("DefineOwnProperty", O, name, desc);
                    if (isAbrupt(status)) return status;
                }
            }
            return O;
        }


    // ===========================================================================================================
    // exports
    // ===========================================================================================================

    var $$unscopables        = SymbolPrimitiveType("@@unscopables", "Symbol.unscopables");
    var $$create             = SymbolPrimitiveType("@@create", "Symbol.create");
    var $$toPrimitive        = SymbolPrimitiveType("@@toPrimitive", "Symbol.toPrimitive");
    var $$toStringTag        = SymbolPrimitiveType("@@toStringTag", "Symbol.toStringTag");
    var $$hasInstance        = SymbolPrimitiveType("@@hasInstance", "Symbol.hasInstance");
    var $$iterator           = SymbolPrimitiveType("@@iterator", "Symbol.iterator");
    var $$isRegExp           = SymbolPrimitiveType("@@isRegExp", "Symbol.isRegExp");
    var $$isConcatSpreadable = SymbolPrimitiveType("@@isConcatSpreadable", "Symbol.isConcatSpreadable");



    exports.$$unscopables   = $$unscopables;
    exports.$$create            = $$create;
    exports.$$toPrimitive           = $$toPrimitive;
    exports.$$hasInstance               = $$hasInstance;
    exports.$$toStringTag                   = $$toStringTag;
    exports.$$iterator                          = $$iterator;
    exports.$$isRegExp                              = $$isRegExp;
    exports.$$isConcatSpreadable = $$isConcatSpreadable;


    exports.IndirectEval = IndirectEval;
    exports.CreateRealm = CreateRealm;

    exports.CreateBuiltinFunction = CreateBuiltinFunction;
    exports.AddRestrictedFunctionProperties = AddRestrictedFunctionProperties;
    exports.LazyDefineProperty = LazyDefineProperty;
    exports.uriReserved = uriReserved;
    exports.uriUnescaped = uriUnescaped;
    exports.Encode = Encode;
    exports.Decode = Decode;
    exports.UTF8Encode = UTF8Encode;
    exports.SetFunctionName = SetFunctionName;
    exports.List = List;
    exports.setFunctionLength = setFunctionLength;
    exports.HasOwnProperty = HasOwnProperty;
    exports.Put = Put;
    exports.Invoke = Invoke;
    exports.newContext = newContext;
    exports.oldContext = oldContext;
    exports.dropExecutionContext = dropExecutionContext;
    exports.withError = withError; // This Function returns the Errors, say the spec says "Throw a TypeError", then return withError("Type", message);
    exports.getContext = getContext;
    exports.getRealm = getRealm;
    exports.getLexEnv = getLexEnv;
    exports.getVarEnv = getVarEnv;
    exports.getIntrinsic = getIntrinsic;
    exports.getIntrinsics = getIntrinsics;
    exports.getGlobalEnv = getGlobalEnv;
    exports.getGlobalThis = getGlobalThis;
    exports.getStack = getStack;
    exports.getState = getState;
    exports.getInternalSlot = getInternalSlot;
    exports.setInternalSlot = setInternalSlot;
    exports.hasInternalSlot = hasInternalSlot;
    exports.callInternalSlot = callInternalSlot;
    exports.applyInternal = applyInternal;
    exports.CreateArrayIterator = CreateArrayIterator;
    exports.CreateByteDataBlock = CreateByteDataBlock;
    exports.CopyDataBlockBytes = CopyDataBlockBytes;
    exports.GetThisEnvironment = GetThisEnvironment;
    exports.GeneratorStart = GeneratorStart;
    exports.GeneratorYield = GeneratorYield;
    exports.GeneratorResume = GeneratorResume;
    exports.CreateItrResultObject = CreateItrResultObject;
    exports.IteratorNext = IteratorNext;
    exports.IteratorComplete = IteratorComplete;
    exports.IteratorValue = IteratorValue;
    exports.GetIterator = GetIterator;
    exports.CreateDataProperty = CreateDataProperty;
    exports.CreateOwnAccessorProperty = CreateOwnAccessorProperty;
    exports.stringifyErrorStack = stringifyErrorStack;
    exports.addMissingProperties = addMissingProperties;
    exports.NormalCompletion = NormalCompletion;
    exports.registerCompletionUpdater = registerCompletionUpdater;
    exports.Completion = Completion;
    exports.NewDeclarativeEnvironment = NewDeclarativeEnvironment;
    exports.NewObjectEnvironment = NewObjectEnvironment;
    exports.NewFunctionEnvironment = NewFunctionEnvironment;
    exports.createIdentifierBinding = createIdentifierBinding;
    exports.GetIdentifierReference = GetIdentifierReference;
    exports.FunctionCreate = FunctionCreate;
    exports.FunctionAllocate = FunctionAllocate;
    exports.FunctionInitialise = FunctionInitialise;
    exports.GeneratorFunctionCreate = GeneratorFunctionCreate;
    exports.OrdinaryHasInstance = OrdinaryHasInstance;
    exports.GetPrototypeFromConstructor = GetPrototypeFromConstructor;
    exports.OrdinaryCreateFromConstructor = OrdinaryCreateFromConstructor;
    exports.OrdinaryConstruct = OrdinaryConstruct;
    exports.MakeConstructor = MakeConstructor;
    exports.CreateEmptyIterator = CreateEmptyIterator;
    exports.ArgumentsExoticObject = ArgumentsExoticObject;
    exports.ArrayCreate = ArrayCreate;
    exports.ArraySetLength = ArraySetLength;
    exports.ExoticDOMObjectWrapper = ExoticDOMObjectWrapper;
    exports.ExoticDOMFunctionWrapper = ExoticDOMFunctionWrapper;
    exports.BoundFunctionCreate = BoundFunctionCreate;
    exports.GeneratorFunctionCreate = GeneratorFunctionCreate;
    exports.ObjectDefineProperties = ObjectDefineProperties;
    exports.DeclarativeEnvironment = DeclarativeEnvironment;
    exports.ObjectEnvironment = ObjectEnvironment;
    exports.GlobalEnvironment = GlobalEnvironment;
    exports.ToPropertyKey = ToPropertyKey;
    exports.IsPropertyKey = IsPropertyKey;
    exports.IsSymbol = IsSymbol;
    exports.CreateDataProperty = CreateDataProperty;
    exports.PropertyDescriptor = PropertyDescriptor;
    exports.IsAccessorDescriptor = IsAccessorDescriptor;
    exports.IsDataDescriptor = IsDataDescriptor;
    exports.IsGenericDescriptor = IsGenericDescriptor;
    exports.FromPropertyDescriptor = FromPropertyDescriptor;
    exports.ToPropertyDescriptor = ToPropertyDescriptor;
    exports.CompletePropertyDescriptor = CompletePropertyDescriptor;
    exports.ValidateAndApplyPropertyDescriptor = ValidateAndApplyPropertyDescriptor;
    exports.OrdinaryObject = OrdinaryObject;
    exports.ObjectCreate = ObjectCreate;
    exports.IsCallable = IsCallable;
    exports.IsConstructor = IsConstructor;
    exports.OrdinaryFunction = OrdinaryFunction;
    exports.FunctionEnvironment = FunctionEnvironment;
    exports.DeclarativeEnvironment = DeclarativeEnvironment;
    exports.GlobalEnvironment = GlobalEnvironment;
    exports.ObjectEnvironment = ObjectEnvironment;
    exports.SymbolPrimitiveType = SymbolPrimitiveType;
    exports.CodeRealm = CodeRealm;
    exports.ExecutionContext = ExecutionContext;
    exports.CompletionRecord = CompletionRecord;
    exports.NormalCompletion = NormalCompletion;
    exports.IdentifierBinding = IdentifierBinding;
    exports.floor = floor;
    exports.ceil = ceil;
    exports.sign = sign;
    exports.abs = abs;
    exports.min = min;
    exports.max = max;
    exports.Type = Type;
    exports.ToPrimitive = ToPrimitive;
    exports.ToString = ToString;
    exports.ToBoolean = ToBoolean;
    exports.ToUint32 = ToUint32;
    exports.ToNumber = ToNumber;
    exports.ToObject = ToObject;
    exports.GetValue = GetValue;
    exports.PutValue = PutValue;
    exports.GetBase = GetBase;
    exports.MakeSuperReference = MakeSuperReference;
    exports.IsSuperReference = IsSuperReference;
    exports.IsUnresolvableReference = IsUnresolvableReference;
    exports.IsPropertyReference = IsPropertyReference;
    exports.IsStrictReference = IsStrictReference;
    exports.GetReferencedName = GetReferencedName;
    exports.GetThisValue = GetThisValue;
    exports.HasPrimitiveBase = HasPrimitiveBase;
    exports.ifAbrupt = ifAbrupt;
    exports.isAbrupt = isAbrupt;
    exports.Assert = Assert;
    exports.unwrap = unwrap;
    exports.SameValue = SameValue;
    exports.SameValueZero = SameValueZero;
    exports.Type = Type;
    exports.Reference = Reference;
    exports.ToPrimitive = ToPrimitive;
    exports.ToInteger = ToInteger;
    exports.ToNumber = ToNumber;
    exports.ToUint16 = ToUint16;
    exports.ToInt32 = ToInt32;
    exports.ToUint32 = ToUint32;
    exports.OrdinaryHasInstance = OrdinaryHasInstance;
    exports.GetGlobalObject = GetGlobalObject;
    exports.ThisResolution = ThisResolution;
    exports.CreateArrayFromList = CreateArrayFromList;
    exports.CreateListFromArrayLike = CreateListFromArrayLike;
    exports.TestIntegrityLevel = TestIntegrityLevel;
    exports.SetIntegrityLevel = SetIntegrityLevel;
    
    exports.CheckObjectCoercible = CheckObjectCoercible;
    exports.HasProperty = HasProperty;
    exports.GetMethod = GetMethod;
    exports.Get = Get;
    exports.Set = Set;
    exports.DefineOwnProperty = DefineOwnProperty;
    exports.GetOwnProperty = GetOwnProperty;
    exports.OwnPropertyKeys = OwnPropertyKeys;
    exports.OwnPropertyKeysAsList = OwnPropertyKeysAsList;
    exports.MakeListIterator = MakeListIterator;
    exports.DefineOwnPropertyOrThrow = DefineOwnPropertyOrThrow;
    exports.Delete = Delete;
    exports.Enumerate = Enumerate;
    exports.OwnPropertyKeys = OwnPropertyKeys;
    exports.SetPrototypeOf = SetPrototypeOf;
    exports.GetPrototypeOf = GetPrototypeOf;
    exports.PreventExtensions = PreventExtensions;
    exports.IsExtensible = IsExtensible;
    exports.CreateByteArrayBlock = CreateByteArrayBlock;
    exports.SetArrayBufferData = SetArrayBufferData;
    exports.AllocateArrayBuffer = AllocateArrayBuffer;
    exports.IntegerIndexedObjectCreate = IntegerIndexedObjectCreate;
    exports.StringExoticObject = StringExoticObject;
    exports.thisTimeValue = thisTimeValue;
    exports.thisNumberValue = thisNumberValue;
    exports.thisBooleanValue = thisBooleanValue;
    exports.thisStringValue = thisStringValue;

    // #################################################################################################################################################################################################
    // #################################################################################################################################################################################################
    // REALM (intrinsics, globalthis, globalenv, loader) each Process One
    // #################################################################################################################################################################################################
    // #################################################################################################################################################################################################
    var createGlobalThis;

    function define_intrinsic(intrinsics, intrinsicName, value) {
        var descriptor = Object.create(null);
        descriptor.configurable = true;
        descriptor.enumerable = true;
        descriptor.value = value;
        descriptor.writable = true;
        callInternalSlot("DefineOwnProperty", intrinsics, intrinsicName, descriptor);
    }
    

    function createIntrinsicConstructor (intrinsics, name, len, intrinsicName) {
        
        var constructor = OrdinaryFunction();
        define_intrinsic(intrinsics, intrinsicName, constructor);
        SetFunctionName(constructor, name);
        setFunctionLength(constructor, len);
        return constructor;
    }
    
    function createIntrinsicPrototype (intrinsics, intrinsicName) {
        var prototype = OrdinaryObject();
        define_intrinsic(intrinsics, intrinsicName, prototype);
        return prototype;
    }

    function createIntrinsicObject (intrinsics, intrinsicName) {
        var object = OrdinaryObject();
        define_intrinsic(intrinsics, intrinsicName, object);
        return object;
    }

    function createIntrinsics(realm) {
        
        var intrinsics = OrdinaryObject(null);
        realm.intrinsics = intrinsics;

        var ObjectPrototype = createIntrinsicPrototype(intrinsics, "%ObjectPrototype%");
        setInternalSlot(ObjectPrototype, "Prototype", null);
        
        var FunctionPrototype = createIntrinsicPrototype(intrinsics, "%FunctionPrototype%");
        setInternalSlot(FunctionPrototype, "Prototype", ObjectPrototype);
        
        var FunctionConstructor = createIntrinsicConstructor(intrinsics, "Function", 0, "%Function%");
        setInternalSlot(FunctionConstructor, "Prototype", FunctionPrototype);
        
        var ObjectConstructor = createIntrinsicConstructor(intrinsics, "Object", 0, "%Object%");
        
    Assert(getInternalSlot(ObjectConstructor, "Prototype") === FunctionPrototype, "ObjectConstructor and FunctionPrototype have to have a link");
        
        var EncodeURIFunction = createIntrinsicConstructor(intrinsics, "EncodeURI", 0, "%EncodeURI%");
        var DecodeURIFunction = createIntrinsicConstructor(intrinsics, "DecodeURI", 0, "%DecodeURI%");
        var EncodeURIComponentFunction = createIntrinsicConstructor(intrinsics, "EncodeURIComponent", 0, "%EncodeURIComponent%");
        var DecodeURIComponentFunction = createIntrinsicConstructor(intrinsics, "DecodeURIComponent", 0, "%DecodeURIComponent%");
        var SetTimeoutFunction = createIntrinsicConstructor(intrinsics, "SetTimeout", 0, "%SetTimeout%");
        var SetImmediateFunction = createIntrinsicConstructor(intrinsics, "SetImmediate", 0, "%SetImmediate%");
        var IsNaNFunction = createIntrinsicConstructor(intrinsics, "IsNaN", 0, "%IsNaN%");
        var IsFiniteFunction = createIntrinsicConstructor(intrinsics, "IsFinite", 0, "%IsFinite%");
        var ParseFloatFunction = createIntrinsicConstructor(intrinsics, "ParseFloat", 0, "%ParseFloat%");
        var ParseIntFunction = createIntrinsicConstructor(intrinsics, "ParseInt", 0, "%ParseInt%");
        var EscapeFunction = createIntrinsicConstructor(intrinsics, "Escape", 0, "%Escape%");
        var UnescapeFunction = createIntrinsicConstructor(intrinsics, "Unescape", 0, "%Unescape%");
        var EvalFunction = createIntrinsicConstructor(intrinsics, "Eval", 0, "%Eval%");
        var RegExpConstructor = createIntrinsicConstructor(intrinsics, "RegExp", 0, "%RegExp%");
        var RegExpPrototype = createIntrinsicPrototype(intrinsics, "%RegExpPrototype%");
        var ProxyConstructor = createIntrinsicConstructor(intrinsics, "Proxy", 0, "%Proxy%");
        var ProxyPrototype = createIntrinsicPrototype(intrinsics, "%ProxyPrototype%");
        var BooleanConstructor = createIntrinsicConstructor(intrinsics, "Boolean", 0, "%Boolean%");
        var BooleanPrototype = createIntrinsicPrototype(intrinsics, "%BooleanPrototype%");
        var NumberConstructor = createIntrinsicConstructor(intrinsics, "Number", 0, "%Number%");
        var NumberPrototype = createIntrinsicPrototype(intrinsics, "%NumberPrototype%");
        var StringConstructor = createIntrinsicConstructor(intrinsics, "String", 0, "%String%");
        var StringRawFunction;
        var StringPrototype = createIntrinsicPrototype(intrinsics, "%StringPrototype%");
        var StringIteratorPrototype = createIntrinsicPrototype(intrinsics, "%StringIteratorPrototype%");
        var DateConstructor = createIntrinsicConstructor(intrinsics, "Date", 0, "%Date%");
        var DatePrototype = createIntrinsicPrototype(intrinsics, "%DatePrototype%");
        var ErrorConstructor = createIntrinsicConstructor(intrinsics, "Error", 0, "%Error%");
        var ErrorPrototype = createIntrinsicPrototype(intrinsics, "%ErrorPrototype%");
        var ArrayConstructor = createIntrinsicConstructor(intrinsics, "Array", 0, "%Array%");
        var ArrayPrototype = createIntrinsicPrototype(intrinsics, "%ArrayPrototype%");
        var ArrayIteratorPrototype = createIntrinsicPrototype(intrinsics, "%ArrayIteratorPrototype%");
        var GeneratorFunction = createIntrinsicConstructor(intrinsics, "Generator", 0, "%GeneratorFunction%");
        var GeneratorPrototype = createIntrinsicPrototype(intrinsics, "%GeneratorPrototype%");
        var GeneratorObject = createIntrinsicObject(intrinsics, "%Generator%");
        var ReflectObject = createIntrinsicObject(intrinsics, "%Reflect%");
        //var NativeError = OrdinaryFunction();
        var SymbolFunction = createIntrinsicConstructor(intrinsics, "Symbol", 0, "%Symbol%");
        var SymbolPrototype = createIntrinsicPrototype(intrinsics, "%SymbolPrototype%");
        var TypeErrorConstructor = createIntrinsicConstructor(intrinsics, "TypeError", 0, "%TypeError%");
        var TypeErrorPrototype = createIntrinsicPrototype(intrinsics, "%TypeErrorPrototype%");
        var ReferenceErrorConstructor = createIntrinsicConstructor(intrinsics, "ReferenceError", 0, "%ReferenceError%");
        var ReferenceErrorPrototype = createIntrinsicPrototype(intrinsics, "%ReferenceErrorPrototype%");
        var SyntaxErrorConstructor = createIntrinsicConstructor(intrinsics, "SyntaxError", 0, "%SyntaxError%");
        var SyntaxErrorPrototype = createIntrinsicPrototype(intrinsics, "%SyntaxErrorPrototype%");
        var RangeErrorConstructor = createIntrinsicConstructor(intrinsics, "RangeError", 0, "%RangeError%");
        var RangeErrorPrototype = createIntrinsicPrototype(intrinsics, "%RangeErrorPrototype%");
        var EvalErrorConstructor = createIntrinsicConstructor(intrinsics, "EvalError", 0, "%EvalError%");
        var EvalErrorPrototype = createIntrinsicPrototype(intrinsics, "%EvalErrorPrototype%");
        var URIErrorConstructor = createIntrinsicConstructor(intrinsics, "URIError", 0, "%URIError%");
        var URIErrorPrototype = createIntrinsicPrototype(intrinsics, "%URIErrorPrototype%");
        var PromiseConstructor = createIntrinsicConstructor(intrinsics, "Promise", 0, "%Promise%");
        var PromisePrototype = createIntrinsicPrototype(intrinsics, "%PromisePrototype%");
        var WeakMapConstructor = createIntrinsicConstructor(intrinsics, "WeakMap", 0, "%WeakMap%");
        var WeakMapPrototype = createIntrinsicPrototype(intrinsics, "%WeakMapPrototype%");
        var WeakSetConstructor = createIntrinsicConstructor(intrinsics, "WeakSet", 0, "%WeakSet%");
        var WeakSetPrototype = createIntrinsicPrototype(intrinsics, "%WeakSetPrototype%");
        var MapConstructor = createIntrinsicConstructor(intrinsics, "Map", 0, "%Map%");
        var MapPrototype = createIntrinsicPrototype(intrinsics, "%MapPrototype%");
        var MapIteratorPrototype = createIntrinsicPrototype(intrinsics, "%MapIteratorPrototype%");
        var SetConstructor = createIntrinsicConstructor(intrinsics, "Set", 0, "%Set%");
        var SetPrototype = createIntrinsicPrototype(intrinsics, "%SetPrototype%");
        var SetIteratorPrototype = createIntrinsicPrototype(intrinsics, "%SetIteratorPrototype%");
        var __mapSetUniqueInternalUniqueKeyCounter__ = 0;
        var TypedArrayConstructor = createIntrinsicConstructor(intrinsics, "TypedArray", 0, "%TypedArray%");
        var TypedArrayPrototype = createIntrinsicPrototype(intrinsics, "%TypedArrayPrototype%");
        var Uint8ArrayConstructor = createIntrinsicConstructor(intrinsics, "Uint8Array", 0, "%Uint8Array%");
        var Int8ArrayConstructor = createIntrinsicConstructor(intrinsics, "Int8Array", 0, "%Int8Array%");
        var Uint8ClampedArrayConstructor = createIntrinsicConstructor(intrinsics, "Uint8ClampedArray", 0, "%Uint8ClampedArray%");
        var Int16ArrayConstructor = createIntrinsicConstructor(intrinsics, "Int16Array", 0, "%Int16Array%");
        var Uint16ArrayConstructor = createIntrinsicConstructor(intrinsics, "Uint16Array", 0, "%Uint16Array%");
        var Int32ArrayConstructor = createIntrinsicConstructor(intrinsics, "Int32Array", 0, "%Int32Array%");
        var Uint32ArrayConstructor = createIntrinsicConstructor(intrinsics, "Uint32Array", 0, "%Uint32Array%");
        var Float32ArrayConstructor = createIntrinsicConstructor(intrinsics, "Float32Array", 0, "%Float32Array%");
        var Float64ArrayConstructor = createIntrinsicConstructor(intrinsics, "Float64Array", 0, "%Float64Array%");
        var Uint8ArrayPrototype = createIntrinsicPrototype(intrinsics, "%Uint8ArrayPrototype%");
        var Int8ArrayPrototype = createIntrinsicPrototype(intrinsics, "%Int8ArrayPrototype%");
        var Uint8ClampedArrayPrototype = createIntrinsicPrototype(intrinsics, "%Uint8ClampedArrayPrototype%");
        var Int16ArrayPrototype = createIntrinsicPrototype(intrinsics, "%Int16ArrayPrototype%");
        var Uint16ArrayPrototype = createIntrinsicPrototype(intrinsics, "%Uint16ArrayPrototype%");
        var Int32ArrayPrototype = createIntrinsicPrototype(intrinsics, "%Int32ArrayPrototype%");
        var Uint32ArrayPrototype = createIntrinsicPrototype(intrinsics, "%Uint32ArrayPrototype%");
        var Float32ArrayPrototype = createIntrinsicPrototype(intrinsics, "%Float32ArrayPrototype%");
        var Float64ArrayPrototype = createIntrinsicPrototype(intrinsics, "%Float64ArrayPrototype%");
        var ArrayBufferConstructor = createIntrinsicConstructor(intrinsics, "ArrayBuffer", 0, "%ArrayBuffer%");
        var ArrayBufferPrototype = createIntrinsicPrototype(intrinsics, "%ArrayBufferPrototype%");
        var DataViewConstructor = createIntrinsicConstructor(intrinsics, "DataView", 0, "%DataView%");
        var DataViewPrototype = createIntrinsicPrototype(intrinsics, "%DataViewPrototype%");
        var JSONObject = createIntrinsicObject(intrinsics, "%JSON%");
        var MathObject = createIntrinsicObject(intrinsics, "%Math%");
        var ConsoleObject = createIntrinsicObject(intrinsics, "%Console%");
        var LoadFunction = createIntrinsicConstructor(intrinsics, "Load", 0, "%Load%");
        var RequestFunction = createIntrinsicConstructor(intrinsics, "Request", 0, "%Request%");
        var EmitterConstructor = createIntrinsicConstructor(intrinsics, "Emitter", 0, "%Emitter%");
        var EmitterPrototype = createIntrinsicPrototype(intrinsics, "%EmitterPrototype%");
        // Object.observe
        var NotifierPrototype = createIntrinsicPrototype(intrinsics, "%NotifierPrototype%");
        var ObserverCallbacks = [];
        var LoaderConstructor = createIntrinsicConstructor(intrinsics, "Loader", 0, "%Loader%");
        var LoaderPrototype = createIntrinsicPrototype(intrinsics, "%LoaderPrototype%");
        var LoaderIteratorPrototype = createIntrinsicPrototype(intrinsics, "%LoaderIteratorPrototype%");
        var RealmConstructor = createIntrinsicConstructor(intrinsics, "Realm", 0, "%Realm%");
        var RealmPrototype = createIntrinsicPrototype(intrinsics, "%RealmPrototype%");
        var ModuleFunction = createIntrinsicConstructor(intrinsics, "Module", 0, "%Module%");
        var ModulePrototype = null;

        // ##################################################################
        // Der Module Loader Start
        // ##################################################################

        var std_Module;// = OrdinaryModule(getGlobalThis());

        var std_Object;
        var std_ObjectPrototype;
        var std_Function;
        var std_FunctionPrototype;
        var std_Function_call;
        var std_Function_apply;
        var std_Function_bind;


        // ##################################################################
        // Das Code Realm als %Realm%
        // ##################################################################

        var RealmPrototype_get_global = function (thisArg, argList) {
            var realmObject = thisArg;
            var realm = getInternalSlot(realmObject, "Realm");
            if ((Type(realmObject) != "object") || !hasInternalSlot(realmObject, "Realm")) return withError("Type", "The this value is no realm object");
            var globalThis = getInternalSlot(realm, globalThis);
            return globalThis;
        };

        var RealmPrototype_eval = function (thisArg, argList) {
            var source = argList[0];
            var realmObject = thisArg;
            if ((Type(realmObject) != "object") || !hasInternalSlot(realmObject, "Realm")) return withError("Type", "The this value is no realm object");
            return IndirectEval(getInternalSlot(realmObject, "Realm"), source);
        };

        var RealmConstructor_Call = function (thisArg, argList) {
            var realmObject = thisArg;
            var options = argList[0];
            var initializer = argList[1];
            if (Type(realmObject) !== "object") return withError("Type", "The this value is not an object");
            if (!hasInternalSlot(realmObject, "Realm")) return withError("Type", "The this value has not the required properties.");
            if (getInternalSlot(realmObject, "Realm") !== undefined) return withError("Type", "the realm property has to be undefined");
            if (options === undefined) options = ObjectCreate(null);
            else if (Type(options) !== "object") return withError("Type", "options is not an object");
            var realm = CreateRealm(realmObject);
            var evalHooks = Get(options, "eval");
            if ((evalHooks=ifAbrupt(evalHooks)) && isAbrupt(evalHooks)) return evalHooks;
            if (evalHooks === undefined) evalHooks = ObjectCreate();
            var directEval = Get(evalHooks(direct));
            if ((directEval=ifAbrupt(directEval)) && isAbrupt(directEval)) return directEval;
            if (directEval === undefined) directEval = ObjectCreate();
            else if (Type(directEval) !== "object") return withError("Type", "directEval is not an object");
            var translate = Get(directEval, "translate");
            if ((translate = ifAbrupt(translate)) && isAbrupt(translate)) return translate;
            if ((translate !== undefined) && !IsCallable(translate)) return withError("Type", "translate has to be a function");
            setInternalSlot(realm, "translateDirectEvalHook", translate);
            var fallback = Get(directEval, "fallback");
            if ((fallback=ifAbrupt(fallback)) && isAbrupt(fallback)) return fallback;
            setInternalSlot(realm, "fallbackDirectEvalHook", fallback);
            var indirectEval = Get(options, "indirect");
            if ((indirectEval = ifAbrupt(indirectEval)) && isAbrupt(indirectEval)) return indirectEval;
            if ((indirectEval !== undefined) && !IsCallable(indirectEval)) return withError("Type", "indirectEval should be a function");
            setInternalSlot(realm, "indirectEvalHook", indirectEval);
            var Function = Get(options, "Function");
            if ((Function = ifAbrupt(Function)) && isAbrupt(Function)) return Function;
            if ((Function !== undefined) && !IsCallable(Function)) return withError("Type", "Function should be a function");
            setInternalSlot(realm, "FunctionHook", Function);
            setInternalSlot(realmObject, "Realm", realm);
            if (initializer !== undefined) {
                if (!IsCallable(initializer)) return withError("Type", "initializer should be a function");
                var builtins = ObjectCreate();
                DefineBuiltinProperties(realm, builtins);
                var status = callInternalSlot("Call", initializer, realmObject, [builtins]);
                if (isAbrupt(status)) return status;
            }
            return realmObject;
        };

        var RealmConstructor_Construct = function (argList) {
            var F = this;
            var args = argList;
            return OrdinaryConstruct(F, argList);
        };

        var RealmConstructor_$$create = function (thisArg, argList) {
            var F = thisArg;
            var realmObject = OrdinaryCreateFromConstructor(F, "%RealmPrototype%", {
                "Realm": undefined
            });
            return realmObject;
        };

        // %Realm%
        setInternalSlot(RealmConstructor, "Call", RealmConstructor_Call);
        setInternalSlot(RealmConstructor, "Construct", RealmConstructor_Construct);
        LazyDefineProperty(RealmConstructor, $$create, CreateBuiltinFunction(getRealm(),RealmConstructor_$$create, 0, "[Symbol.create]"));
        MakeConstructor(RealmConstructor, false, RealmPrototype);
        // %RealmPrototype%
        LazyDefineAccessor(RealmPrototype, "global", CreateBuiltinFunction(getRealm(),RealmPrototype_get_global, 0, "get global"));
        LazyDefineProperty(RealmPrototype, "eval", CreateBuiltinFunction(getRealm(),RealmPrototype_eval, 1, "eval"));
        LazyDefineProperty(RealmConstructor, $$toStringTag, "Realm");

        // ##################################################################
        // %Loader% und Loader.prototype
        // ##################################################################


        var LoaderConstructor_Call = function (thisArg, argList) {
            var options = argList[0];
            var loader = thisArg;
            if (Type(loader) !== "object") return withError("Type", "Loader is not an object");

            if (getInternalSlot(loader, "Modules") !== undefined) return withError("Type", "loader.[[Modules]] isnt undefined");
            if (Type(options) !== "object") return withError("Type", "the Loader constructors´ options argument is not an object");

            var realmObject = Get(options, "realm");
            if ((realmObject = ifAbrupt(realmObject)) && isAbrupt(realmObject)) return realmObject;
            var realm;

            if (realmObject === undefined) realm = getRealm();
            else realm = getInternalSlot(realmObject, "Realm");

            var exc = null;
            var help = function (name) {
                var hook = Get(options, name);
                if ((hook = ifAbrupt(hook)) && isAbrupt(hook)) return hook;
                if (hook !== undefined) {
                    var result = callInternalSlot("DefineOwnProperty", loader, name, {
                        value: hook,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                    if (isAbrupt(result)) exc = result;
                }
            };
            ["normalize", "locate", "fetch", "translate", "instantiate"].forEach(help);
            if (exc) return exc;

            setInternalSlot(loader, "Modules", Object.create(null));
            setInternalSlot(loader, "Loads", []);
            setInternalSlot(loader, "Realm", realm);
            return NormalCompletion(loader);
        };

        var LoaderConstructor_Construct = function (argList) {
            return OrdinaryConstruct(this, argList);
        };

        var LoaderConstructor_$$create = function (thisArg, argList) {
            var F = thisArg;
            var loader = OrdinaryCreateFromConstructor(F, "%LoaderPrototype%", {
                "Modules": undefined,
                "Loads": undefined,
                "Realm": undefined
            });
            return loader;
        };

        var LoaderPrototype_get_realm = function (thisArg, argList) {
            var loader = thisArg;
            if (Type(loader) !== "object" || !hasInternalSlot(loader, "Realm")) {
                return withError("Type", "the this value is not a valid loader object");
            }
            var realm = getInternalSlot(loader, "Realm");
            return getInternalSlot(realm, "realmObject");
        };

        var LoaderPrototype_get_global = function (thisArg, argList) {
            var loader = thisArg;
            if (Type(loader) !== "object" || !hasInternalSlot(loader, "Realm")) {
                return withError("Type", "the this value is not a valid loader object");
            }
            var realm = getInternalSlot(loader, "Realm");
            var global = realm.globalThis;
            return global;
        };

        var ReturnUndefined_Call = function (thisArg, argList) {
            return NormalCompletion(undefined);
        };

        function ReturnUndefined() {
            var F = OrdinaryFunction();
            setInternalSlot(F, "Call", ReturnUndefined_Call);
            return F;
        }

        var LoaderPrototype_entries = function (thisArg, argList) {
            return CreateLoaderIterator(thisArg, "key+value");
        };

        var LoaderPrototype_values = function (thisArg, argList) {
            return CreateLoaderIterator(thisArg, "value");
        };

        var LoaderPrototype_keys = function (thisArg, argList) {
            return CreateLoaderIterator(thisArg, "key");
        };

        var LoaderPrototype_define = function (thisArg, argList) {
            var loader = thisArg;
            if ((loader = ifAbrupt(loader)) && isAbrupt(loader)) return loader;

            setInternalSlot(F, "Loader", loader);
            setInternalSlot(F, "ModuleName", name);
            setInternalSlot(F, "Step", "translate");
            setInternalSlot(F, "ModuleMetadata", metadata);
            setInternalSlot(F, "ModuleSource", source);
            setInternalSlot(F, "ModuleAddress", address);
            var Promise = getIntrinsic("%Promise%");
            var p = OrdinaryConstruct(Promise, [F]);
            var G = ReturnUndefined;
            p = PromiseThen(o, G);
            return p;
        };
        var LoaderPrototype_load = function (thisArg, argList) {
            var request = argList[0];
            var options = argList[1];
            var loader = thisLoader(thisArg);
            if ((loader =ifAbrupt(loader)) && isAbrupt(loader)) return loader;
            var p = LoadModule(loader, name, options);
            var F = ReturnUndefined(); 

            p = PromiseThen(p, F);
            return p;
        };

        var LoaderPrototype_module = function (thisArg, argList) {
            var loader = thisLoader(thisArg);
            if ((loader=ifAbrupt(loader)) && isAbrupt(loader)) return loader;
            var address = GetOption(options, "address");
            if ((address=ifAbrupt(address)) && isAbrupt(address)) return address;
            var load = CreateLoad(undefined);
            load.address = address;
            var linkSet = CreateLinkSet(loader, load);
            var successCallback = EvaluateLoadedModule();
            setInternalSlot(successCallback, "Loader", loader);
            setInternalSlot(successCallback, "Load", load);
            var p = PromiseThen(linkSet.done, successCallback);
            var sourcePromise = PromiseOf(source);
            ProceedToTranslate(loader, load, sourcePromise);
            return p;
        };

        var LoaderPrototype_import = function (thisArg, argList) {
            var name = argList[0];
            var options = argList[1];
            var loader = thisLoader(thisArg);
            if ((loader=ifAbrupt(loader)) && isAbrupt(loader)) return loader;
            var p = LoadModule(loader, name, options);
            if ((p=ifAbrupt(p)) && isAbrupt(p)) return p;
            var F = EvaluateLoadedModule();
            setInternalSlot(F, "Loader", loader);
            p = PromiseThen(p, F);
            return p;
        };
        var LoaderPrototype_eval = function (thisArg, argList) {
            var source = argList[0];
            var loader = thisLoader(thisArg);
            if ((loader=ifAbrupt(loader)) && isAbrupt(loader)) return loader;
            return IndirectEval(getInternalSlot(loader, "Realm"), source);

        };


        var LoaderPrototype_get = function (thisArg, argList) {
            var loader = thisLoader(thisArg);
            if ((loader=ifAbrupt(loader)) && isAbrupt(loader)) return loader;
            var name = ToString(argList[0]);
            if ((name=ifAbrupt(name)) && isAbrupt(name)) return name;

            var modules = getInternalSlot(loader, "Modules");
            if (modules[name]) {
                var module = modules[name];
                var result = EnsureEvaluated(module, [], loader);
                if ((result=ifAbrupt(result)) && isAbrupt(result)) return result;
                return NormalCompletion(module);
            }
            return NormalCompletion(undefined);
        };
        var LoaderPrototype_has = function (thisArg, argList) {
            var loader = thisLoader(thisArg);
            if ((loader=ifAbrupt(loader)) && isAbrupt(loader)) return loader;
            var name = ToString(argList[0]);
            if ((name=ifAbrupt(name)) && isAbrupt(name)) return name;

            var modules = getInternalSlot(loader, "Modules");
            if (modules[name]) {
                return NormalCompletion(true);
            }
            return NormalCompletion(false);

        };
        var LoaderPrototype_set = function (thisArg, argList) {
            var name = argList[0];
            var module = argList[1];
            var loader = thisLoader(thisArg);
            if ((loader=ifAbrupt(loader)) && isAbrupt(loader)) return loader;
            var loaderRecord = getInternalSlot(loader, "Loader");
            var name = ToString(name);
            if ((name=ifAbrupt(name)) && isAbrupt(name)) return name;
            if (Type(module) !== "object") return withError("Type", "module is not an object");
            var modules = loaderRecord.modules;
            modules[name] = module;
            return NormalCompletion(loader);
        };
        var LoaderPrototype_delete = function (thisArg, argList) {

        };
        var LoaderPrototype_normalize = function (thisArg, argList) {
            var name = argList[0];
            var refererName = argList[1];
            var refererAddress = argList[2];
            Assert(Type(name) == "string", "Loader.prototype.normalize: name has to be a string.");
            return NormalCompletion(name);
        };
        var LoaderPrototype_locate = function (thisArg, argList) {
            var loadRequest = argList[0];
            return Get(loadRequest, "name");
        };
        var LoaderPrototype_fetch = function (thisArg, argList) {
            return withError("Type", "The Loader.prototype.fetch function is supposed to throw a type error.")
        };
        var LoaderPrototype_translate = function (thisArg, argList) {
            var load = argList[0];
            return Get(load, "source");
        };
        
        var LoaderPrototype_instantiate = function (thisArg, argList) {
            var loadRequest = argList[0];
            return NormalCompletion(undefined);
        };
        var LoaderPrototype_$$iterator = LoaderPrototype_entries;

        // Loader

        setInternalSlot(LoaderConstructor, "Prototype", FunctionPrototype);
        setInternalSlot(LoaderConstructor, "Call", LoaderConstructor_Call);
        setInternalSlot(LoaderConstructor, "Construct", LoaderConstructor_Construct);
        LazyDefineProperty(LoaderConstructor, $$create, CreateBuiltinFunction(getRealm(),LoaderConstructor_$$create, 0, "[Symbol.create]"));
        MakeConstructor(LoaderConstructor, false, LoaderPrototype);
        //SetFunctionName(LoaderConstructor, "Loader");

        // Loader.prototype
        LazyDefineProperty(LoaderPrototype, "entries", CreateBuiltinFunction(getRealm(),LoaderPrototype_entries, 0, "entries"));
        LazyDefineProperty(LoaderPrototype, "values", CreateBuiltinFunction(getRealm(),LoaderPrototype_values, 0, "values"));
        LazyDefineProperty(LoaderPrototype, "keys", CreateBuiltinFunction(getRealm(),LoaderPrototype_keys, 0, "keys"));
        LazyDefineProperty(LoaderPrototype, "has", CreateBuiltinFunction(getRealm(),LoaderPrototype_has, 0, "has"));
        LazyDefineProperty(LoaderPrototype, "get", CreateBuiltinFunction(getRealm(),LoaderPrototype_get, 0, "get"));
        LazyDefineProperty(LoaderPrototype, "set", CreateBuiltinFunction(getRealm(),LoaderPrototype_set, 0, "set"));
        LazyDefineProperty(LoaderPrototype, "delete", CreateBuiltinFunction(getRealm(),LoaderPrototype_delete, 0, "delete"));
        LazyDefineProperty(LoaderPrototype, "define", CreateBuiltinFunction(getRealm(),LoaderPrototype_define, 2, "define"));

        LazyDefineProperty(LoaderPrototype, "load", CreateBuiltinFunction(getRealm(),LoaderPrototype_load,    1, "load"));
        LazyDefineProperty(LoaderPrototype, "module", CreateBuiltinFunction(getRealm(),LoaderPrototype_module, 1, "module"));
        LazyDefineProperty(LoaderPrototype, "import", CreateBuiltinFunction(getRealm(),LoaderPrototype_import, 0, "import"));
        LazyDefineProperty(LoaderPrototype, "eval", CreateBuiltinFunction(getRealm(),LoaderPrototype_eval, 0, "eval"));
        LazyDefineProperty(LoaderPrototype, "normalize", CreateBuiltinFunction(getRealm(),LoaderPrototype_normalize, 0, "normalize"));
        LazyDefineProperty(LoaderPrototype, "fetch", CreateBuiltinFunction(getRealm(),LoaderPrototype_fetch, 0, "fetch"));
        LazyDefineProperty(LoaderPrototype, "locate", CreateBuiltinFunction(getRealm(),LoaderPrototype_locate, 0, "locate"));
        LazyDefineProperty(LoaderPrototype, "translate", CreateBuiltinFunction(getRealm(),LoaderPrototype_instantiate, 1, "translate"));
        LazyDefineProperty(LoaderPrototype, "instantiate", CreateBuiltinFunction(getRealm(),LoaderPrototype_instantiate, 0, "instantiate"));
        LazyDefineProperty(LoaderPrototype, $$iterator, CreateBuiltinFunction(getRealm(),LoaderPrototype_$$iterator, 0, "[Symbol.iterator]"));
        LazyDefineProperty(LoaderPrototype, $$toStringTag, "Loader");

        // ##################################################################
        // Der Loader Iterator
        // ##################################################################

        function CreateLoaderIterator(loader, kind) {
            var loaderIterator = ObjectCreate(LoaderIteratorPrototype, {
                "Loader": loader,
                "ModuleMapNextIndex": 0,
                "MapIterationKind": kind
            });
            return loaderIterator;
        }

        var LoaderIteratorPrototype_next = function next(thisArg, argList) {
            var iterator = thisArg;
            var loader = getInternalSlot(iterator, "Loader");
            var nextIndex = getInternalSlot(iterator, "ModuleMapNextIndex");
            var kind = getInternalSlot(iterator, "MapIterationKind");
            var nextValue;
            return nextValue;
        };

        var LoaderIteratorPrototype_$$iterator = function $$iterator(thisArg, argList) {
            return thisArg;
        };

        LazyDefineProperty(LoaderIteratorPrototype, $$iterator, CreateBuiltinFunction(getRealm(),LoaderIteratorPrototype_$$iterator, 0, "[Symbol.iterator]"));
        LazyDefineProperty(LoaderIteratorPrototype, "next", CreateBuiltinFunction(getRealm(),LoaderIteratorPrototype_next, 0, "next"));
        LazyDefineProperty(LoaderIteratorPrototype, $$toStringTag, "Loader Iterator");

        // ##################################################################
        // Der Module Loader Stop
        // ##################################################################

        var create_std_Module = function create_std_Module(obj) {
            var mod = OrdinaryModule();
            return mod;
        };

        // ##################################################################
        // Loader Operationen 
        // ##################################################################

        function thisLoader(value) {
            if (Type(value) === "object" && hasInternalSlot(value, "Modules")) {
                var m = getInternalSlot(value, "Modules");
                if (m !== undefined) return value;
            }
            return withError("Type", "thisLoader(value): value is not a valid loader object");
        }

        function LoadRecord() {
            return {
                __proto__:null,
                status: undefined,
                name: undefined,
                linksets: undefined,
                metadata: undefined,
                address: undefined,
                source: undefined,
                kind: undefined,
                body: undefined,
                execute: undefined,
                exception: undefined,
                module: undefined,
                constructor: LoadRecord
            };
        }

        function CreateLoad(name) {
            var load = LoadRecord();
            load.status = "loading";
            load.name = name;
            load.linksets = [];
            var metadata = ObjectCreate();
            load.metadata = metadata;
            return load;
        }

        function createLoadFailedFunction(exc) {

            var LoadFailedFunction_Call = function (thisArg, argList) {
                var F = this;
                var load = getInternalSlot(this, "Load");
                Assert(load.status === "loading", "load.[[Status]] has to be loading at this point");
                load.status = "failed";
                load.exception = exc;
                var linkSets = load.linksets;
                for (var i = 0, j = linkSets.length; i < j; i++) LinkSetFailed(linkSet[i], exc);
                Assert(load.linksets.length === 0, "load.[[LinkSets]] has to be empty at this point");
            };

            var F = OrdinaryFunction();
            setInternalSlot(F, "Load", load);
            setInternalSlot(F, "Call", LoadFailedFunction_Call);
            return F;
        }

        function RequestLoad(loader, request, refererName, refererAddress) {
            var F = CallNormalize();
            setInternalSlot(F, "Loader", loader);
            setInternalSlot(F, "Request", request);
            setInternalSlot(F, "RefererName", refererName);
            setInternalSlot(F, "RefererAddress", refererAddress);
            var p = OrdinaryConstruct(getIntrinsic("%Promise%"), [F]);
            var G = GetOrCreateLoad();
            setInternalSlot(G, "Loader", loader);
            p = PromiseThen(p, G);
            return p;
        }

        var CallNormalizeFunction_Call = function (thisArg, argList) {
            var F = this;
            var resolve = argList[0];
            var reject = argList[1];

            var loader = getInternalSlot(F, "Loader");
            var request = getInternalSlot(F, "Request");
            var refererName = getInternalSlot(F, "RefererName");
            var refererAddress = getInternalSlot(F, "RefererAddress");

            var normalizeHook = Get(loader, "normalize");
            var name = callInternalSlot("Call", normalizeHook, undefined, [request, refererName, refererAddress]);
            if ((name = ifAbrupt(name)) && isAbrupt(name)) return name;
            callInternalSlot("Call", resolve, undefined, [name]);
        };

        function CallNormalize() {
            var F = OrdinaryFunction();
            setInternalSlot(F, "Call", CallNormalizeFunction_Call);
            return F;
        }

        var GetOrCreateLoad_Call = function (thisArg, argList) {
            var F = this;
            var name = argList[0];
            var loader = getInternalSlot(F, "loader");
            name = ToString(name);
            if ((name = ifAbrupt(name)) && isAbrupt(name)) return name;
            if (loader.modules[name]) {
                var existingModule = loader.modules[name].value;
                var load = CreateLoad(name);
                load.status = "linked";
                return load;
            } else if (loader.loads[name]) {
                var load = loader.loads[name];
                Assert(load.status === "loading" || load.status === "loaded", "load.[[status]] has either to be loading or loaded");
                return load;
            }
        };

        //******************************************************************************************************************************************************************************************************
        //******************************************************************************************************************************************************************************************************
        // Unter mir der Code der nach Realm kommt.
        //******************************************************************************************************************************************************************************************************
        //******************************************************************************************************************************************************************************************************

        /*
	Diese Funktion wieder defactoren.
	Und daraus das std_Modul machen.
	*/

        // ===========================================================================================================
        // %ThrowTypeError%
        // ===========================================================================================================

        var ThrowTypeError = FunctionAllocate(FunctionPrototype);
        setInternalSlot(ThrowTypeError, "Call", function (thisArg, argList) {
            return withError("Type", "The system is supposed to throw a Type Error with %ThrowTypeError% here.");
        });
        setInternalSlot(ThrowTypeError, "Construct", undefined);

        // ===========================================================================================================
        // load and request function (load loads file into string and request fetches from network)
        // ===========================================================================================================

        function isWindow() {
            return typeof window !== "undefined";
        }

        function isNode() {
            return typeof process !== "undefined";
        }

        function isWorker() {
            return typeof importScripts === "function" && !isWindow();
        }

        setInternalSlot(LoadFunction, "Call", function load(thisArg, argList) {
            var file = argList[0];
            var fs, xhr, data;
            if (isWindow()) {
                try {
                    xhr = new XMLHttpRequest();
                    xhr.open("GET", file, false);
                    xhr.send(null);
                    return xhr.responseText;
                } catch (ex) {
                    return withError("Type", "can not xml http request " + file);
                }
            } else if (isNode()) {
                fs = require._nativeModule.require("fs");
                try {
                    data = fs.readFileSync(file, "utf8");
                    return data;
                } catch (ex) {
                    return withError("Type", "fs.readFileSync threw an exception");
                }
            } else if (isWorker()) {
                try {
                    xhr = new XMLHttpRequest();
                    xhr.open("GET", file, false);
                    xhr.send(null);
                    return xhr.responseText;
                } catch (ex) {
                    return withError("Type", "can not xml http request " + file);
                }
            } else {
                return withError("Type", "Unknown architecture. Load function not available.");
            }
        });

        setInternalSlot(RequestFunction, "Call", function request(thisArg, argList) {
            var url = argList[0];
            var d, p;
            if (isWindow()) {

                var handler = CreateBuiltinFunction(getRealm(),function handler(thisArg, argList) {
                    var resolve = argList[0];
                    var reject = argList[1];
                })

                d = OrdinaryConstruct(PromiseConstructor, [handler]);

                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
                xhr.onload = function (e) {
                    if (xhr.status !== 200 || xhr.status === 301) {}
                };

                xhr.send();

                return xhr.responseText;
            } else if (isNode()) {

            } else if (isWorker()) {

            } else {
                return withError("Type", "Unknown architecture. Request function not available.");
            }
        });

        // ===========================================================================================================
        // Console (add-on, with console.log);
        // ===========================================================================================================

        DefineOwnProperty(ConsoleObject, "log", {
            value: CreateBuiltinFunction(getRealm(),function log(thisArg, argList) {
                console.log.apply(console, argList);
            }),
            writable: true,
            enumerable: false,
            configurable: true

        });
        DefineOwnProperty(ConsoleObject, "dir", {
            value: CreateBuiltinFunction(getRealm(),function dir(thisArg, argList) {
                console.dir.apply(console, argList);
            }),
            writable: true,
            enumerable: false,
            configurable: true

        });
        DefineOwnProperty(ConsoleObject, "html", {
            value: CreateBuiltinFunction(getRealm(),function html(thisArg, argList) {
                var selector = argList[0];
                var html = "";
                if (Type(selector) !== "string") return withError("Type", "First argument of console.html should be a valid css selector string.");
                if (typeof document !== "undefined") {
                    var element = document.querySelector(selector);
                } else {
                    if (typeof process !== "undefined") {
                        console.log.apply(console, argList.slice(1));
                    } else
                        return withError("Reference", "Can not select element. document.querySelector is not supported in the current environment.");
                }
                if (element) {
                    html += argList[1];
                    for (var i = 2, j = argList.length; i < j; i++) {
                        html += ", " + argList[i];
                    }
                    html += "<br>\n";
                } else {
                    return withError("Reference", "document.querySelector could not find the element " + selector);
                }
                element.innerHTML += html;
                return NormalCompletion(undefined);
            }),
            writable: true,
            enumerable: false,
            configurable: true
        });

        // ===========================================================================================================
        // Array Iterator
        // ===========================================================================================================
        setInternalSlot(ArrayIteratorPrototype, "Prototype", ObjectPrototype);
        DefineOwnProperty(ArrayIteratorPrototype, $$iterator, {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                return thisArg;
            }, 0, "[Symbol.iterator]"),
            enumerable: false,
            configurable: false,
            writable: false
        });
        DefineOwnProperty(ArrayIteratorPrototype, $$toStringTag, {
            value: "Array Iterator",
            enumerable: false,
            configurable: false,
            writable: false
        });
        DefineOwnProperty(ArrayIteratorPrototype, "next", {
            value: CreateBuiltinFunction(getRealm(),function next(thisArg, argList) {
                var O = thisArg;
                if (Type(O) !== "object") return withError("Type", "ArrayIterator.prototype.next: O is not an object. ");

                if (!hasInternalSlot(O, "IteratedObject") || !hasInternalSlot(O, "ArrayIterationNextIndex") || !hasInternalSlot(O, "ArrayIterationKind")) {
                    return withError("Type", "Object has not all ArrayIterator properties.");
                }

                var a = getInternalSlot(O, "IteratedObject");
                var index = getInternalSlot(O, "ArrayIterationNextIndex");
                var itemKind = getInternalSlot(O, "ArrayIterationKind");
                var lenValue = Get(a, "length");
                var len = ToUint32(lenValue);
                var elementKey, found, result, elementValue;
                if ((len = ifAbrupt(len)) && isAbrupt(len)) return len;
                if ((/sparse/).test(itemKind)) {
                    var found = false;
                    while (!found && (index < len)) {
                        elementKey = ToString(index);
                        found = HasProperty(a, elementKey);
                        if (isAbrupt(found)) return found;
                        if (!(found = ifAbrupt(found))) index = index + 1;
                    }
                }
                if (index >= len) {
                    setInternalSlot(O, "ArrayIterationNextIndex", +Infinity);
                    return CreateItrResultObject(undefined, true);
                }
                elementKey = ToString(index);
                setInternalSlot(O, "ArrayIterationNextIndex", index + 1);

                if (/key\+value/.test(itemKind)) {
                    elementValue = Get(a, elementKey);
                    if ((elementValue = ifAbrupt(elementValue)) && isAbrupt(elementValue)) return elementValue;

                    result = ArrayCreate(2);

                    result.DefineOwnProperty("0", {
                        value: elementKey,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                    result.DefineOwnProperty("1", {
                        value: elementValue,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                    result.DefineOwnProperty("length", {
                        value: 2,
                        writable: true,
                        eumerable: false,
                        configurable: false
                    });
                    return CreateItrResultObject(result, false);
                } else if ((/value/).test(itemKind)) {
                    elementValue = Get(a, elementKey);
                    if ((elementValue = ifAbrupt(elementValue)) && isAbrupt(elementValue)) return elementValue;
                    return CreateItrResultObject(elementValue, false);
                } else if ((/key/).test(itemKind)) {
                    return CreateItrResultObject(elementKey, false);
                }

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        // ===========================================================================================================
        // Array Constructor (not the exotic object type returned by)
        // ===========================================================================================================

        function IsSparseArray(A) {
            var len = Get(A, "length");
            var elem;
            for (var i = 0, j = ToUint32(len); i < j; i++) {
                elem = Get(A, ToString(i));
                if ((elem = ifAbrupt(elem)) && isAbrupt(elem)) return elem;
                if (elem === undefined) return true;
            }
            return false;
        }

        MakeConstructor(ArrayConstructor, true, ArrayPrototype);
        setInternalSlot(ArrayPrototype, "Prototype", ObjectPrototype);

        DefineOwnProperty(ArrayConstructor, $$create, {
            value: CreateBuiltinFunction(getRealm(),function $$create(thisArg, argList) {
                var F = thisArg;
                var proto = GetPrototypeFromConstructor(F, "%ArrayPrototype%");
                if ((proto = ifAbrupt(proto)) && isAbrupt(proto)) return proto;
                var obj = ArrayCreate(undefined, proto);
                return obj;
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayConstructor, $$toStringTag, {
            value: "Array",
            enumerable: false,
            writable: false,
            configurable: false
        });

        setInternalSlot(ArrayConstructor, "Call", function (thisArg, argList) {

            var O = thisArg;
            var array;
            var intLen;
            var F, proto;
            var defineStatus;
            var len;
            var k;
            var putStatus;
            var numberOfArgs;
            var Pk, itemK;
            var items;

            numberOfArgs === argList.length;
            if (numberOfArgs === 1) {
                len = GetValue(argList[0]);
                if (Type(O) === "object" && !getInternalSlot(O, "ArrayInitialisationState")) {
                    setInternalSlot(O, "ArrayInitialisationState", true);
                    array = O;
                } else {
                    F = this;
                    proto = OrdinaryCreateFromConstructor(F, "%ArrayPrototype");
                    if (isAbrupt(proto)) return proto;
                    proto = ifAbrupt(proto);
                    array = ArrayCreate(0, proto);
                }
                array = ifAbrupt(array);
                if (isAbrupt(array)) return array;
                if (Type(len) !== "number") {
                    defineStatus = DefineOwnPropertyOrThrow(array, "0", {
                        value: len,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                    if (isAbrupt(defineStatus)) return defineStatus;
                    intLen = 1;
                } else {
                    intLen = ToUint32(len);
                    if (intLen != len) return withError("Range", "Array(len): intLen is not equal to len");
                }
                putStatus = Put(array, "length", intLen, true);
                if (isAbrupt(putStatus)) return putStatus;
                return array;

            } else {
                len = GetValue(argList[0]);
                if (Type(O) === "object" && !getInternalSlot(O, "ArrayInitialisationState")) {
                    setInternalSlot(O, "ArrayInitialisationState", true);
                    array = O;
                } else {
                    F = this;
                    proto = OrdinaryCreateFromConstructor(F, "%ArrayPrototype");
                    if (isAbrupt(proto)) return proto;
                    proto = ifAbrupt(proto);
                    array = ArrayCreate(0, proto);
                }

                array = ifAbrupt(array);
                if (isAbrupt(array)) return array;
                k = 1;
                items = argList;

                while (k < numberOfArgs) {
                    Pk = ToString(k);
                    itemK = items[k];
                    defineStatus = DefineOwnPropertyOrThrow(array, Pk, {
                        value: itemK,
                        writable: true,
                        enumerable: true,
                        configurable: true

                    });
                    if (isAbrupt(defineStatus)) return defineStatus;
                    k = k + 1;
                }
                putStatus = Put(array, "length", numberOfArgs, true);
                if (isAbrupt(putStatus)) return putStatus;
                return array;
            }

        });
        setInternalSlot(ArrayConstructor, "Construct", function (argList) {
            var F = this;
            var argumentsList = argList;
            return OrdinaryConstruct(F, argumentsList);
        });
        DefineOwnProperty(ArrayConstructor, "length", {
            value: 1,
            enumerable: false,
            writable: false,
            configurable: false
        });
        DefineOwnProperty(ArrayConstructor, "prototype", {
            value: ArrayPrototype,
            enumerable: false,
            writable: false,
            configurable: false
        });

        DefineOwnProperty(ArrayConstructor, "isArray", {
            value: CreateBuiltinFunction(getRealm(),function isArray(thisArg, argList) {
                var arg = GetValue(argList[0]);
                // if (Type(arg) !== "object") return false;
                if (arg instanceof ArrayExoticObject) return true;
                return false;
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayConstructor, "of", {
            value: CreateBuiltinFunction(getRealm(),function of(thisArg, argList) {
                var items = CreateArrayFromList(argList);
                var lenValue = Get(items, "length");
                var C = thisArg;
                var newObj;
                var A;
                var len = ToInteger(lenValue);
                if (IsConstructor(C)) {
                    newObj = OrdinaryConstruct(C, [len]);
                    A = ToObject(newObj);
                } else {
                    A = ArrayCreate(len);
                }
                if ((A = ifAbrupt(A)) && isAbrupt(A)) return A;
                var k = 0;
                var Pk, kValue, defineStatus, putStatus;
                while (k < len) {
                    Pk = ToString(k);
                    kValue = Get(items, Pk);
                    defineStatus = DefineOwnPropertyOrThrow(A, Pk, {
                        value: kValue,
                        writable: true,
                        configurable: true,
                        enumerable: true
                    });
                    if (isAbrupt(defineStatus)) return defineStatus;
                    k = k + 1;
                }
                putStatus = Put(A, "length", len, true);
                if (isAbrupt(putStatus)) return putStatus;
                return A;

            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayConstructor, "from", {
            value: CreateBuiltinFunction(getRealm(),function from(thisArg, argList) {
                var C = thisArg;
                var arrayLike = argList[0];
                var mapfn = argList[1];
                var thisArg2 = argList[2];
                var T;
                var items = ToObject(arrayLike);
                var mapping = false;
                var len, lenValue;
                var k;
                var iterator;
                var done, Pk, kValue, defineStatus, putStatus, kPresent, mappedValue;
                var newObj, A;
                if ((items = ifAbrupt(items)) && isAbrupt(items)) return items;
                if (mapfn == undefined) {
                    mapping = true;
                } else {
                    if (!IsCallable(mapfn)) return withError("Type", "Array.from: mapfn is not callable.");
                    if (thisArg2) T = thisArg2;
                    else T = undefined;
                    mapping = true;

                }
                var usingIterator = HasProperty(items, $$iterator);

                var next, nextValue;
                if (usingIterator) {
                    iterator = GetIterator(items);
                    if (IsConstructor(C)) {
                        newObj = OrdinaryConstruct(C, []);
                        A = ToObject(newObj);
                    } else {
                        A = ArrayCreate(0);
                    }
                    while (!done) {

                        Pk = ToString(k);
                        next = IteratorNext(iterator);
                        if (isAbrupt(next)) return next;
                        next = ifAbrupt(next);
                        done = IteratorComplete(next);
                        if (isAbrupt(done)) return done;
                        done = ifAbrupt(done);
                        if (done) {

                        }
                        nextValue = IteratorValue(next);
                        if (isAbrupt(nextValue)) return nextValue;
                        nextValue = ifAbrupt(nextValue);
                        if (mapping) {
                            mappedValue = mapfn.Call(T, [nextValue]);
                            if (isAbrupt(mappedValue)) return mappedValue;
                            mappedValue = ifAbrupt(mappedValue);

                        } else mappedValue = nextValue;

                        defineStatus = DefineOwnPropertyOrThrow(A, Pk, {
                            value: mappedValue,
                            writable: true,
                            enumberable: true,
                            configurable: true
                        });

                        if (isAbrupt(defineStatus)) return defineStatus;

                        k = k + 1;
                    }

                } else {

                    // Assert(items is array like and no iterator)
                    lenValue = Get(items, "length");
                    len = ToInteger(lenValue);
                    if (isAbrupt(len)) return len;
                    if (IsConstructor(C)) {
                        newObj = OrdinaryConstruct(C, [len]);
                        A = ToObject(newObj);
                    } else {
                        A = ArrayCreate(len);
                    }
                    k = 0;
                    while (k < len) {
                        Pk = ToString(k);
                        kPresent = HasProperty(items, Pk);
                        if (isAbrupt(kPresent)) return kPresent;
                        if (kPresent) {
                            kValue = Get(items, Pk);
                            if ((kValue = ifAbrupt(kValue)) && isAbrupt(kValue)) return kValue;
                            if (mapping) {
                                mappedValue = mapfn.Call(T, [kValue, k, items]);
                                if ((mappedValue = ifAbrupt(mappedValue)) && isAbrupt(mappedValue)) return mappedValue;
                                defineStatus = DefineOwnPropertyOrThrow(A, Pk, {
                                    value: mappedValue,
                                    writable: true,
                                    configurable: true,
                                    enumerable: true
                                });

                            } else mappedValue = kValue;

                        }
                        k = k + 1;
                    }

                }
                putStatus = Put(A, "length", len, true);
                if (isAbrupt(putStatus)) return putStatus;
                return A;
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });
        
        DefineOwnProperty(ArrayPrototype, "constructor", {
            value: ArrayConstructor,
            enumerable: false,
            writable: false,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "toString", {
            value: CreateBuiltinFunction(getRealm(),function toString(thisArg, argList) {
                var array = ToObject(thisArg);
                if ((array = ifAbrupt(array)) && isAbrupt(array)) return array;
                array = GetValue(array);
                var func = Get(array, "join");
                if ((func = ifAbrupt(func)) && isAbrupt(func)) return func;
                if (!IsCallable(func)) func = Get(ObjectPrototype, "toString");
                return callInternalSlot("Call", func, array, []);
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        var ArrayPrototype_toLocaleString = function toLocaleString(thisArg, argList) {

        };
        LazyDefineBuiltinFunction(ArrayPrototype, "toLocaleString", 2, ArrayPrototype_toLocaleString);

        function IsConcatSpreadable(O) {
            if (isAbrupt(O)) return O;
            var spreadable = Get(O, $$isConcatSpreadable);
            if ((spreadable = ifAbrupt(spreadable)) && isAbrupt(spreadable)) return spreadable;
            if (spreadable !== undefined) return ToBoolean(spreadable);
            if (O instanceof ArrayExoticObject) return true;
            return false;
        }

        DefineOwnProperty(ArrayPrototype, "concat", {
            value: CreateBuiltinFunction(getRealm(),function concat(thisArg, argList) {
                var args = argList;
                var k = 0;
                var len = args.length;
                var spreadable;
                while (k < len) {

                    if (spreadable = IsConcatSpreadable(C)) {

                    }
                    k = k + 1;
                }
            }, 1),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "join", {
            value: CreateBuiltinFunction(getRealm(),function join(thisArg, argList) {
                var O = ToObject(thisArg);
                if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
                var separator = argList[0];
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if ((len = ifAbrupt(len)) && isAbrupt(len)) return len;
                if (separator === undefined) separator = ",";
                var sep = ToString(separator);
                if (len === 0) return NormalCompletion("");
                var element0 = Get(O, "0");
                var R;
                if (element0 === undefined) R = "";
                else R = ToString(element0);
                var k = 1;
                while (k < len) {
                    var S = R + sep;
                    var element = Get(O, ToString(k));
                    var next;
                    if (element === undefined || element === null) next = "";
                    else next = ToString(element);
                    if ((next = ifAbrupt(next)) && isAbrupt(next)) return next;
                    R = S + next;
                    k = k + 1;
                }
                return NormalCompletion(R);
            }, 1),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "pop", {
            value: CreateBuiltinFunction(getRealm(),function pop(thisArg, argList) {
                var O = ToObject(thisArg);
                if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if ((len = ifAbrupt(len)) && isAbrupt(len)) return len;
                var putStatus, deleteStatus;
                if (len === 0) {
                    putStatus = Put(O, "length", 0, true);
                    if ((putStatus = ifAbrupt(putStatus)) && isAbrupt(putStatus)) return putStatus;
                    return undefined;
                } else {
                    var newLen = len - 1;
                    var index = ToString(newLen);
                    var element = Get(O, index);
                    if ((element = ifAbrupt(element)) && isAbrupt(element)) return element;
                    deleteStatus = DeletePropertyOrThrow(O, index);
                    if ((deleteStatus = ifAbrupt(deleteStatus)) && isAbrupt(deleteStatus)) return deleteStatus;
                    putStatus = Put(O, "length", newLen, true);
                    if ((putStatus = ifAbrupt(putStatus)) && isAbrupt(putStatus)) return putStatus;
                    return NormalCompletion(element);
                }
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "push", {
            value: CreateBuiltinFunction(getRealm(),function push(thisArg, argList) {
                var O = ToObject(thisArg);
                if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
                var lenVal = Get(O, "length");
                var n = ToUint32(lenVal);
                if ((n = ifAbrupt(n)) && isAbrupt(n)) return n;
                var items = argList;
                var E, putStatus;
                for (var i = 0, j = items.length; i < j; i++) {
                    E = items[i];
                    putStatus = Put(O, ToString(n), E, true);
                    if ((putStatus = ifAbrupt(putStatus)) && isAbrupt(putStatus)) return putStatus;
                    n = n + 1;
                }
                putStatus = Put(O, "length", n, true);
                if ((putStatus = ifAbrupt(putStatus)) && isAbrupt(putStatus)) return putStatus;
                return NormalCompletion(n);
            }, 1),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "reverse", {
            value: CreateBuiltinFunction(getRealm(),function reverse(thisArg, argList) {
                var O = ToObject(thisArg);
                if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if ((len = ifAbrupt(len)) && isAbrupt(len)) return len;
                var middle = Math.floor(len / 2);
                var lower = 0;
                var putStatus;
                var deleteStatus;
                while (lower < middle) {
                    var upper = len - lower - 1;
                    var upperP = ToString(upper);
                    var lowerP = ToString(lower);
                    var lowerValue = Get(O, lowerP);
                    if ((lowerValue = ifAbrupt(lowerValue)) && isAbrupt(lowerValue)) return lowerValue;
                    var upperValue = Get(O, upperP);
                    if ((upperValue = ifAbrupt(upperValue)) && isAbrupt(upperValue)) return upperValue;
                    var lowerExists = HasProperty(O, lowerP);
                    if ((lowerExists = ifAbrupt(lowerExists)) && isAbrupt(lowerExists)) return lowerExists;
                    var upperExists = HasProperty(O, upperP);
                    if ((upperExists = ifAbrupt(upperExists)) && isAbrupt(upperExists)) return upperExists;
                    if (lowerExists === true && upperExists === true) {
                        putStatus = Put(O, lowerP, upperValue, true);
                        if ((putStatus = ifAbrupt(putStatus)) && isAbrupt(putStatus)) return putStatus;
                        putStatus = Put(O, upperP, lowerValue, true);
                        if ((putStatus = ifAbrupt(putStatus)) && isAbrupt(putStatus)) return putStatus;

                    } else if (lowerExists === false && upperExists === true) {

                        putStatus = Put(O, lowerP, upperValue, true);
                        if ((putStatus = ifAbrupt(putStatus)) && isAbrupt(putStatus)) return putStatus;
                        deleteStatus = DeletePropertyOrThrow(O, upperP);
                        if ((deleteStatus = ifAbrupt(deleteStatus)) && isAbrupt(deleteStatus)) return deleteStatus;

                    } else if (lowerExists === true && upperExists === false) {

                        deleteStatus = DeletePropertyOrThrow(O, lowerP);
                        if ((deleteStatus = ifAbrupt(deleteStatus)) && isAbrupt(deleteStatus)) return deleteStatus;
                        putStatus = Put(O, upperP, lowerValue, true);
                        if ((putStatus = ifAbrupt(putStatus)) && isAbrupt(putStatus)) return putStatus;

                    }

                    lower = lower + 1;
                }
                return NormalCompletion(O);
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "shift", {
            value: CreateBuiltinFunction(getRealm(),function shift(thisArg, argList) {
                var O = ToObject(thisArg);
                if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if ((len = ifAbrupt(len)) && isAbrupt(len)) return len;

            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "slice", {
            value: CreateBuiltinFunction(getRealm(),function slice(thisArg, argList) {
                var start = argList[0];
                var end = argList[1];
                var O = ToObject(thisArg);
                var A = ArrayCreate(0);
                if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if ((len = ifAbrupt(len)) && isAbrupt(len)) return len;

                var relativeStart = ToInteger(start);
                if ((relativeStart = ifAbrupt(relativeStart)) && isAbrupt(relativeStart)) return relativeStart;

                var k;
                if (relativeStart < 0) k = max((len + relativeStart), 0);
                else k = min(relativeStart, len);
                var relativeEnd;
                if (end === undefined) relativeEnd = len;
                else relativeEnd = ToInteger(end);
                if ((relativeEnd = ifAbrupt(relativeEnd)) && isAbrupt(relativeEnd)) return relativeEnd;
                var final;
                if (relativeEnd < 0) final = max((len + relativeEnd), 0);
                else final = min(relativeEnd, len);
                var n = 0;
                var putStatus, status;
                while (k < final) {
                    var Pk = ToString(k);
                    var kPresent = HasProperty(O, Pk);
                    if ((kPresent = ifAbrupt(kPresent)) && isAbrupt(kPresent)) return kPresent;
                    if (kPresent) {
                        var kValue = Get(O, Pk);
                        if ((kValue = ifAbrupt(kValue)) && isAbrupt(kValue)) return kValue;
                        status = CreateDataProperty(A, ToString(n), kValue);
                        if (isAbrupt(status)) return status;
                        if (status === false) return withError("Type", "slice: CreateDataProperty on new Array returned false");
                    }
                    k = k + 1;
                    n = n + 1;
                }
                putStatus = Put(A, "length", n, true);
                if (isAbrupt(putStatus)) return putStatus;
                return NormalCompletion(A);
            }, 2),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "sort", {
            value: CreateBuiltinFunction(getRealm(),function sort(thisArg, argList) {
                var O = ToObject(thisArg);
                if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if ((len = ifAbrupt(len)) && isAbrupt(len)) return len;

            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        var ArrayPrototype_splice = function splice(thisArg, argList) {
            var start = argList[0];
            var deleteCount = argList[1];
            var items = argList.slice(2);
            var O = ToObject(thisArg);
            if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
            var lenVal = Get(O, "length");
            var len = ToLength(lenVal);
            if ((len = ifAbrupt(len)) && isAbrupt(len)) return len;
            var relativeStart = ToInteger(start);
            if ((relativeStart=ifAbrupt(relativeStart))&&isAbrupt(relativeStart)) return relativeStart;
            var actualStart;
            if (relativeStart < 0) actualStart = max((len+relativeStart),0);
            else actualStart=min(relativeStart,len);
            if (start === undefined) {
                var actualDeleteCount = 0;
            } else if (deleteCount === undefined) {
                actualDeleteCount = len - actualStart;
            } else {
                var dc = ToInteger(deleteCount);
                if ((dc=ifAbrupt(dc)) && isAbrupt(dc)) return dc;
                actualDeleteCount = min(max(dc, 0), len - actualStart);
            }
            var A = undefined;
            if (O instanceof ArrayExoticObject) {
                var C = Get(O, "constructor");
                if ((C=ifAbrupt(C))&&isAbrupt(C)) return C;
                if (IsConstructor(C) === true) {
                    var thisRealm = getRealm();
                    if (SameValue(thisRealm, getInternalSlot(C, "Realm"))) {
                        A = callInternalSlot("Construct", [actualDeleteCount]);
                    }
                }
            }
            if (A === undefined) {
                A = ArrayCreate(actualDeleteCount);
            }
            if ((A=ifAbrupt(A)) && isAbrupt(A)) return A;
            var k = 0;
            while (k < actualDeleteCount) {
                var from = ToString(actualStart + k);
                var fromPresent = HasProperty(O, from);
                if ((fromPresent=ifAbrupt(fromPresent)) && isAbrupt(fromPresent));
                if (fromPresent === true) {
                    var fromValue = Get(O, from);
                    if ((fromValue=ifAbrupt(fromValue)) && isAbrupt(fromValue)) return fromValue;
                    var status = CreateDataPropertyOrThrow(A, ToString(k), fromValue);
                    if (isAbrupt(status)) return status;
                }
                k = k + 1;
            }
            var putStatus = Put(A, "length", actualDeleteCount, true);
            if (isAbrupt(putStatus)) return putStatus;
            var itemCount = items.length;
            var k;
            if (itemCount < actualDeleteCount) {
                k = actualStart;
                while (k < (len - actualDeleteCount)) {
                    var from = ToString(k+actualDeleteCount);
                    var to = ToString(k+itemCount);
                    var fromPresent = HasProperty(O, from);
                    if ((fromPresent = ifAbrupt(fromPresent)) && isAbrupt(fromPresent));
                    if (fromPresent  === true) {
                        var fromValue = Get(O, from);
                        if ((fromValue = ifAbrupt(fromValue)) && isAbrupt(fromValue)) return fromValue;
                        putStatus = Put(O, to, fromValue, true);
                        if (isAbrupt(putStatus)) return putStatus;

                    } else {
                        var deleteStatus = DeletePropertyOrThrow(O, to);
                        if (isAbrupt(deleteStatus)) return deleteStatus;
                    }
                    k = k + 1;
                }
            } else if (itemCount > actualDeleteCount) {
                k = len - actualDeleteCount;
                while (k < actualStart) {
                    var from = ToStirng(k + actualDeleteCount - 1);
                    var to = ToString(k + itemCount - 1);
                    var fromPresent = HasProperty(O, from);
                    if (fromPresent === true) {
                        var fromValue = Get(O, from);
                        if ((fromValue=ifAbrupt(fromValue)) && isAbrupt(fromValue)) return fromValue;
                        putStatus = Put(O, to, fromValue, true);
                        if (isAbrupt(putStatus)) return putStatus;
                    } else {
                        deleteStatus = DeletePropertyOrThrow(O, to);
                        if (isAbrupt(deleteStatus)) return deleteStatus;
                    }
                    k = k - 1;
                }
            }
            k = actualStart;
            var l = 0;
            while (k < actualStart) {
                var E = items[l];
                putStatus = Put(O, ToString(k), E, true);
                l = l + 1;
                k = k + 1;
                if (isAbrupt(putStatus)) return putStatus;
            }
            putStatus = Put(O, "length", len - actualDeleteCount + itemCount, true);
            if (isAbrupt(putStatus)) return putStatus;
            return NormalCompletion(A);
        };
        var ArrayPrototype_unshift = function unshift(thisArg, argList) {

        };
        LazyDefineBuiltinFunction(ArrayPrototype, "splice", 2, ArrayPrototype_splice);
        LazyDefineBuiltinFunction(ArrayPrototype, "unshift", 1, ArrayPrototype_unshift);
        
        DefineOwnProperty(ArrayPrototype, "indexOf", {
            value: CreateBuiltinFunction(getRealm(),function indexOf(thisArg, argList) {
                var O = ToObject(thisArg);
                if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
                var searchElement = argList[0];
                var fromIndex = argList[1];
                var lenValue = Get(O, "length");
                var len = ToUint32(lenValue);
                if ((len = ifAbrupt(len)) && isAbrupt(len)) return len;
                var n;
                var k;
                if (fromIndex !== undefined) n = ToInteger(fromIndex);
                else n = 0;
                if ((n = ifAbrupt(n)) && isAbrupt(n)) return n;
                if (len === 0) return -1;
                if (n >= 0) k = n;
                else {
                    k = len - abs(n);
                    if (k < 0) k = 0;
                }
                while (k < len) {
                    var Pk = ToString(k);
                    var kPresent = HasProperty(O, Pk);
                    if ((kPresent = ifAbrupt(kPresent)) && isAbrupt(kPresent)) return kPresent;
                    if (kPresent) {
                        var elementK = Get(O, Pk);
                        if ((elementK = ifAbrupt(elementK)) && isAbrupt(elementK)) return elementK;
                        /* Replace mit Strict EQ Abstract Op */
                        var same = (searchElement === elementK);
                        if (same) return NormalCompletion(k);
                    }
                    k = k + 1;
                }
                return NormalCompletion(-1);
            }, 1),
            enumerable: false,
            writable: true,
            configurable: true
        });
        DefineOwnProperty(ArrayPrototype, "lastIndexOf", {
            value: CreateBuiltinFunction(getRealm(),function lastIndexOf(thisArg, argList) {
                var O = ToObject(thisArg);
                if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
                var searchElement = argList[0];
                var fromIndex = argList[1];
                var lenValue = Get(O, "length");
                var len = ToUint32(lenValue);
                if ((len = ifAbrupt(len)) && isAbrupt(len)) return len;
                var n;
                var k;
                if (len === 0) return -1;
                if (fromIndex !== undefined) n = ToInteger(fromIndex);
                else n = len - 1;
                if ((n = ifAbrupt(n)) && isAbrupt(n)) return n;
                if (n >= 0) k = min(n, len - 1);
                else {
                    k = len - abs(n);
                }
                while (k > 0) {
                    var Pk = ToString(k);
                    var kPresent = HasProperty(O, Pk);
                    if ((kPresent = ifAbrupt(kPresent)) && isAbrupt(kPresent)) return kPresent;
                    if (kPresent) {
                        var elementK = Get(O, Pk);
                        if ((elementK = ifAbrupt(elementK)) && isAbrupt(elementK)) return elementK;
                        /* Replace mit Strict EQ Abstract Op */
                        var same = (searchElement === elementK);
                        if (same) return NormalCompletion(k);
                    }
                    k = k - 1;
                }
                return NormalCompletion(-1);

            }, 1),
            enumerable: false,
            writable: true,
            configurable: true
        });
        DefineOwnProperty(ArrayPrototype, "forEach", {
            value: CreateBuiltinFunction(getRealm(),function forEach(thisArg, argList) {
                var callback = argList[0];
                var T = argList[1];
                var O = ToObject(thisArg);
                if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if ((len = ifAbrupt(len)) && isAbrupt(len)) return len;
                if (!IsCallable(callback)) return withError("Type", "forEach: callback is not a function.");
                if (argList.length < 2) T = undefined;
                var k = 0;
                while (k < len) {
                    var Pk = ToString(k);
                    var kPresent = HasProperty(O, Pk);
                    if ((kPresent = ifAbrupt(kPresent)) && isAbrupt(kPresent)) return kPresent;
                    if (kPresent) {
                        var kValue = Get(O, Pk);
                        if ((kValue = ifAbrupt(kValue)) && isAbrupt(kValue)) return kValue;
                        var funcResult = callInternalSlot("Call", callback, T, [kValue, k, O]);
                        if (isAbrupt(funcResult)) return funcResult;
                    }
                    k = k + 1;
                }
                return NormalCompletion(undefined);
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });
        DefineOwnProperty(ArrayPrototype, "map", {
            value: CreateBuiltinFunction(getRealm(),function map(thisArg, argList) {

                var callback = argList[0];
                var T = argList[1];
                var O = ToObject(thisArg);
                if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if (!IsCallable(callback)) return withError("Type", "map: callback is not a function.");
                if (argList.length < 2) T = undefined;
                var k = 0;
                var A = ArrayCreate(len);
                while (k < len) {
                    var Pk = ToString(k);
                    var kPresent = HasProperty(O, Pk);
                    if ((kPresent = ifAbrupt(kPresent)) && isAbrupt(kPresent)) return kPresent;
                    if (kPresent) {
                        var kValue = Get(O, Pk);
                        if ((kValue = ifAbrupt(kValue)) && isAbrupt(kValue)) return kValue;
                        var mappedValue = callInternalSlot("Call", callback, T, [kValue, k, O]);
                        if ((mappedValue = ifAbrupt(mappedValue)) && isAbrupt(mappedValue)) return mappedValue;
                        callInternalSlot("DefineOwnProperty", A, Pk, {
                            value: mappedValue,
                            writable: true,
                            enumerable: true,
                            configurable: true
                        });
                    }
                    k = k + 1;
                }
                return NormalCompletion(A);
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });
        DefineOwnProperty(ArrayPrototype, "filter", {
            value: CreateBuiltinFunction(getRealm(),function filter(thisArg, argList) {

                var callback = argList[0];
                var T = argList[1];
                var O = ToObject(thisArg);
                if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if (!IsCallable(callback)) return withError("Type", "filter: callback is not a function.");
                if (argList.length < 2) T = undefined;
                var k = 0;
                var to = 0;
                var A = ArrayCreate(len);
                while (k < len) {
                    var Pk = ToString(k);
                    var kPresent = HasProperty(O, Pk);
                    if ((kPresent = ifAbrupt(kPresent)) && isAbrupt(kPresent)) return kPresent;
                    if (kPresent) {
                        var kValue = Get(O, Pk);
                        if ((kValue = ifAbrupt(kValue)) && isAbrupt(kValue)) return kValue;

                        var selected = callInternalSlot("Call", callback, T, [kValue, k, O]);
                        if ((selected = ifAbrupt(selected)) && isAbrupt(selected)) return selected;
                        if (ToBoolean(selected) === true) {

                            A.DefineOwnProperty(ToString(to), {
                                value: kValue,
                                writable: true,
                                enumerable: true,
                                configurable: true
                            });
                            to = to + 1;
                        }
                    }
                    k = k + 1;
                }
                return NormalCompletion(A);
            }, 1),
            enumerable: false,
            writable: true,
            configurable: true
        });

        var ArrayPrototype_reduce = function reduce(thisArg, argList) {

        };
        var ArrayPrototype_reduceRight = function reduce(thisArg, argList) {

        };

        LazyDefineBuiltinFunction(ArrayPrototype, "reduce", 1, ArrayPrototype_reduce);
        LazyDefineBuiltinFunction(ArrayPrototype, "reduceRight", 1, ArrayPrototype_reduceRight);

        DefineOwnProperty(ArrayPrototype, "every", {
            value: CreateBuiltinFunction(getRealm(),function every(thisArg, argList) {
                var callback = argList[0];
                var T = argList[1];
                var O = ToObject(thisArg);
                if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if (!IsCallable(callback)) return withError("Type", "every: callback is not a function.");
                if (argList.length < 2) T = undefined;
                var k = 0;
                while (k < len) {
                    var Pk = ToString(k);
                    var kPresent = HasProperty(O, Pk);
                    if ((kPresent = ifAbrupt(kPresent)) && isAbrupt(kPresent)) return kPresent;
                    if (kPresent) {
                        var kValue = Get(O, Pk);
                        if ((kValue = ifAbrupt(kValue)) && isAbrupt(kValue)) return kValue;
                        var testResult = callInternalSlot("Call", callback, T, [kValue, k, O]);
                        if ((testResult = ifAbrupt(testResult)) && isAbrupt(testResult)) return testResult;
                        if (ToBoolean(testResult) === false) return NormalCompletion(false);
                    }
                    k = k + 1;
                }
                return NormalCompletion(true);
            }, 1),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "some", {
            value: CreateBuiltinFunction(getRealm(),function some(thisArg, argList) {
                var callback = argList[0];
                var T = argList[1];
                var O = ToObject(thisArg);
                if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
                var lenVal = Get(O, "length");
                var len = ToUint32(lenVal);
                if (!IsCallable(callback)) return withError("Type", "some: callback is not a function.");
                if (argList.length < 2) T = undefined;
                var k = 0;
                while (k < len) {
                    var Pk = ToString(k);
                    var kPresent = HasProperty(O, Pk);
                    if ((kPresent = ifAbrupt(kPresent)) && isAbrupt(kPresent)) return kPresent;
                    if (kPresent) {
                        var kValue = Get(O, Pk);
                        if ((kValue = ifAbrupt(kValue)) && isAbrupt(kValue)) return kValue;
                        var testResult = callInternalSlot("Call", callback, T, [kValue, k, O]);
                        if ((testResult = ifAbrupt(testResult)) && isAbrupt(testResult)) return testResult;
                        if (ToBoolean(testResult) === true) return NormalCompletion(true);
                    }
                    k = k + 1;
                }
                return NormalCompletion(false);
            }, 1),
            enumerable: false,
            writable: true,
            configurable: true
        });

        var ArrayPrototype_predicate = function (thisArg, argList) {

        };
        var ArrayPrototype_findIndex = function (thisArg, argList) {

        };
        
        LazyDefineBuiltinFunction(ArrayPrototype, "predicate", 1, ArrayPrototype_predicate);
        LazyDefineBuiltinFunction(ArrayPrototype, "findIndex", 1, ArrayPrototype_findIndex);

        
        DefineOwnProperty(ArrayPrototype, "entries", {
            value: CreateBuiltinFunction(getRealm(),function entries(thisArg, argList) {
                var O = ToObject(thisArg);
                if (isAbrupt(O)) return O;
                return CreateArrayIterator(O, "key+value");
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });
        DefineOwnProperty(ArrayPrototype, "keys", {
            value: CreateBuiltinFunction(getRealm(),function keys(thisArg, argList) {
                var O = ToObject(thisArg);
                if (isAbrupt(O)) return O;
                return CreateArrayIterator(O, "key");
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, "values", {
            value: CreateBuiltinFunction(getRealm(),function values(thisArg, argList) {
                var O = ToObject(thisArg);
                if (isAbrupt(O)) return O;
                return CreateArrayIterator(O, "value");
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, $$iterator, {
            value: CreateBuiltinFunction(getRealm(),function $$iterator(thisArg, argList) {
                var O = ToObject(thisArg);
                if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
                return CreateArrayIterator(O, "value");
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(ArrayPrototype, $$unscopables, {
            value: (function () {
                var blackList = ObjectCreate();
                CreateDataProperty(blackList, "find", true);
                CreateDataProperty(blackList, "findIndex", true);
                CreateDataProperty(blackList, "fill", true);
                CreateDataProperty(blackList, "copyWithin", true);
                CreateDataProperty(blackList, "entries", true);
                CreateDataProperty(blackList, "keys", true);
                CreateDataProperty(blackList, "values", true);
                return blackList;
            }()),
            enumerable: false,
            writable: true,
            configurable: true
        });

        // ===========================================================================================================
        // String Constructor and Prototype
        // ===========================================================================================================

        setInternalSlot(StringConstructor, "Call", function Call(thisArg, argList) {
            var O = thisArg;
            var s;
            if (!argList.length) s = "";
            else s = ToString(argList[0]);
            if ((s = ifAbrupt(s)) && isAbrupt(s)) return s;
            if (Type(O) === "object" && hasInternalSlot(O, "StringData") && getInternalSlot(O, "StringData") === undefined) {
                var length = s.length;
                var status = DefineOwnPropertyOrThrow(O, "length", {
                    value: length,
                    writable: false,
                    enumerable: false,
                    configurable: false
                });
                if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
                setInternalSlot(O, "StringData", s);
                return O;
            }
            return s;
        });
        setInternalSlot(StringConstructor, "Construct", function Construct(argList) {
            var F = StringConstructor;
            return OrdinaryConstruct(F, argList);
        });

        DefineOwnProperty(StringConstructor, $$create, {
            value: CreateBuiltinFunction(getRealm(),function $$create(thisArg, argList) {
                var F = thisArg;
                var obj = StringExoticObject();
                var proto = GetPrototypeFromConstructor(F, "%StringPrototype%");
                if ((proto = ifAbrupt(proto)) && isAbrupt(proto)) return proto;
                setInternalSlot(obj, "Prototype", proto);
                setInternalSlot(obj, "StringData", undefined);
                return obj;
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        StringRawFunction = CreateBuiltinFunction(getRealm(),function raw(thisArg, argList) {
            // String.raw(callSite, ...substitutions)

            var callSite = argList[0];
            // ,...substitions)
            var substitutions = CreateArrayFromList(argList.slice(1));
            var cooked = ToObject(callSite);
            if ((cooked = ifAbrupt(cooked)) && isAbrupt(cooked)) return cooked;
            var rawValue = Get(cooked, "raw");
            var raw = ToObject(rawValue);
            if ((raw = ifAbrupt(raw)) && isAbrupt(raw)) return raw;
            var len = Get(raw, "length");
            var literalSegments = ToLength(len);
            if ((literalSegments = ifAbrupt(literalSegments)) && isAbrupt(literalSegments)) return literalSegments;
            if (literalSegments <= 0) return "";
            var stringElements = [];
            var nextIndex = 0;
            for (;;) {
                var nextKey = ToString(nextIndex);
                var next = Get(raw, nextKey);
                var nextSeg = ToString(next);
                if ((nextSeg = ifAbrupt(nextSeg)) && isAbrupt(nextSeg)) return nextSeg;
                stringElements.push(nextSeg);
                if (nextIndex + 1 === literalSegments) {
                    var string = stringElements.join('');
                    return NormalCompletion(string);
                }
                next = Get(substitutions, nextKey);
                var nextSub = ToString(next);
                if ((nextSub = ifAbrupt(nextSub)) && isAbrupt(nextSub)) return nextSub;
                stringElements.push(nextSub);
                nextIndex = nextIndex + 1;
            }
            if ((cooked = ifAbrupt(cooked)) && isAbrupt(cooked)) return cooked;
        });

        DefineOwnProperty(StringConstructor, "raw", {
            value: StringRawFunction,
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(StringConstructor, "fromCharCode", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {}),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(StringConstructor, "fromCodePoint", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {}),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(StringConstructor, "", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {}),
            enumerable: false,
            writable: true,
            configurable: true
        });

        DefineOwnProperty(StringPrototype, "", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {}),
            enumerable: false,
            writable: true,
            configurable: true
        });



        function GetReplaceSubstitution () {

        }

        var StringPrototype_normalize = function (thisArg, argList) {

        };

        var StringPrototype_replace = function (thisArg, argList) {

        };
        var StringPrototype_match = function (thisArg, argList) {

        };
        var StringPrototype_repeat = function (thisArg, argList) {
            var count = argList[0];
            var S = CheckObjectCoercible(thisArg);
            if ((S = ifAbrupt(S)) && isAbrupt(S)) return S;
            S = ToString(S);
            if ((S = ifAbrupt(S)) && isAbrupt(S)) return S;
            var n = ToInteger(count);
            if ((n=ifAbrupt(n)) && isAbrupt(n)) return n;
            if (n < 0) return withError("Range", "n is less than 0");
            if (n === Infinity) return withError("Range", "n is infinity");
            var T = "";
            for (var i = 0; i < n; i++) T+=S;
            return NormalCompletion(T);
        };

        var StringPrototype_contains = function (thisArg, argList) {
            var searchString = argList[0];
            var position = argList[1];
            var S = CheckObjectCoercible(thisArg);
            if ((S = ifAbrupt(S)) && isAbrupt(S)) return S;
            S = ToString(S);
            if ((S = ifAbrupt(S)) && isAbrupt(S)) return S;
            var searchStr = ToString(searchString);
            var pos = ToInteger(position);
            var len = S.length;
            var start = min(max(pos, 0), len);
            var searchLen = searchStr.length;
            var i = start;
            var j = len;
            var result = false;
            while (i < len-searchLen) {
                
                if ((searchStr[0] === S[i]) && (searchStr[searchLen-1] === S[i+searchLen-1])) {
                    result = true;
                    for (var k = i+1, l = i+searchLen-1, m = 1; k < l; k++, m++) {
                        if (searchStr[m] !== S[k]) result = false;
                    }
                    if (result) return true;
                }

                i = i+1;
            }
            return false;
        };

        var StringPrototype_startsWith = function (thisArg, argList) {
            var searchString = argList[0];
            var position = argList[1];
            var S = CheckObjectCoercible(thisArg);
            if ((S=ifAbrupt(S)) && isAbrupt(S)) return S;
            S = ToString(S);
            if ((S = ifAbrupt(S)) && isAbrupt(S)) return S;
            var searchStr = ToString(searchString);
            var pos = ToInteger(position);
            var len = S.length;
            var start = min(max(pos, 0), len);
            var searchLength = searchString.length;
            if (searchLength+start > len) return false;
            var result = true;
            for (var k = 0, i = start, j = searchLength+start; i < j; i++, k++) {
                if (searchStr[k] !== S[i]) { result = false; break; }
            }
            return result;
        };
        var StringPrototype_endsWith = function (thisArg, argList) {
            var searchString = argList[0];
            var endPosition = argList[1];
            var S = CheckObjectCoercible(thisArg);
            if ((S=ifAbrupt(S)) && isAbrupt(S)) return S;
            S = ToString(S);
            if ((S = ifAbrupt(S)) && isAbrupt(S)) return S;
            var searchStr = ToString(searchString);
            var pos = endPosition === undefined ? len : ToInteger(endPosition);
            var len = S.length;
            var end = min(max(pos, 0), len);
            var searchLength = searchString.length;
            var start = end - searchLength;
            if (start < 0) return false;
            var result = true;
            for (var i = start, j = start + searchLength, k = 0; i < j; i++, k++) {
                if (searchString[k] !== S[i]) { result = false; break; }
            }
            return result;
        };
        var StringPrototype_valueOf = function valueOf(thisArg, argList) {
            var x = thisStringValue(thisArg);
            return x;
        };
        var StringPrototype_toArray = function (thisArg, argList) {
            var S = CheckObjectCoercible(thisArg);
            if ((S=ifAbrupt(S)) && isAbrupt(S)) return S;
            S = ToString(S);
            var array = ArrayCreate(0);
            var len = S.length;
            var n = 0;
            while (n < len) {
                var c = S[n];
                callInternalSlot("DefineOwnProperty", array, ToString(n), {
                    configurable: true,
                    enumerable: true,
                    value: c,
                    writable: true
                }, false);
                n = n + 1;
            }
            return NormalCompletion(array);

        };
        LazyDefineBuiltinFunction(StringPrototype, "match", 0, StringPrototype_match);
        LazyDefineBuiltinFunction(StringPrototype, "normalize", 0, StringPrototype_normalize);
        LazyDefineBuiltinFunction(StringPrototype, "repeat", 0, StringPrototype_repeat);
        LazyDefineBuiltinFunction(StringPrototype, "replace", 0, StringPrototype_replace);

        LazyDefineBuiltinFunction(StringPrototype, "contains", 0, StringPrototype_contains);
        LazyDefineBuiltinFunction(StringPrototype, "startsWith", 1, StringPrototype_startsWith);
        LazyDefineBuiltinFunction(StringPrototype, "endsWith", 1, StringPrototype_endsWith);
        LazyDefineBuiltinFunction(StringPrototype, "valueOf", 0, StringPrototype_valueOf);
        LazyDefineBuiltinFunction(StringPrototype, "toArray", 0, StringPrototype_toArray);
        MakeConstructor(StringConstructor, false, StringPrototype);
        // ===========================================================================================================
        // String Iterator
        // ===========================================================================================================

        DefineOwnProperty(StringPrototype, $$iterator, {
            value: CreateBuiltinFunction(getRealm(),function iterator(thisArg, argList) {
                return CreateStringIterator(thisArg, "value");
            }, 0, "[Symbol.iterator]"),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(StringPrototype, "values", {
            value: CreateBuiltinFunction(getRealm(),function values(thisArg, argList) {
                return CreateStringIterator(thisArg, "value");
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(StringPrototype, "keys", {
            value: CreateBuiltinFunction(getRealm(),function keys(thisArg, argList) {
                return CreateStringIterator(thisArg, "key");
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(StringPrototype, "entries", {
            value: CreateBuiltinFunction(getRealm(),function entries(thisArg, argList) {
                return CreateStringIterator(thisArg, "key+value");
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(StringIteratorPrototype, "next", {
            value: CreateBuiltinFunction(getRealm(),function next(thisArg, argList) {
                var O = thisArg;
                if (Type(O) !== "object")
                    return withError("Type", "the this value is not an object");

                if (!hasInternalSlot(O, "IteratedString") || !hasInternalSlot(O, "IteratorNextIndex") || !hasInternalSlot(O, "IterationKind"))
                    return withError("Type", "iterator has not all of the required internal properties");

                var string = getInternalSlot(O, "IteratedString");
                var kind = getInternalSlot(O, "IterationKind");
                var index = getInternalSlot(O, "IteratorNextIndex");
                var result;

                string = ToString(string);
                var len = string.length;

                if (index < len) {
                    var ch = string[index];
                    setInternalSlot(O, "IteratorNextIndex", index + 1);
                    if (kind === "key") result = index;
                    else if (kind === "value") result = ch;
                    else {
                        Assert(kind === "key+value", "string iteration kind has to be key+value");
                        var result = ArrayCreate(2);
                        CreateDataProperty(result, "0", index);
                        CreateDataProperty(result, "1", ch);
                    }
                    return CreateItrResultObject(result, false);
                }
                return CreateItrResultObject(undefined, true);
            }),
            enumerable: false,
            configurable: false,
            writable: false
        });

        function CreateStringIterator(string, kind) {
            var iterator = ObjectCreate(StringIteratorPrototype, {
                "IteratedString": undefined,
                "IteratorNextIndex": undefined,
                "IterationKind": undefined
            });
            setInternalSlot(iterator, "IteratedString", string);
            setInternalSlot(iterator, "IteratorNextIndex", 0);
            setInternalSlot(iterator, "IterationKind", kind);
            return iterator;
        }

        // ===========================================================================================================
        // Boolean Constructor and Prototype
        // ===========================================================================================================

        setInternalSlot(BooleanConstructor, "Call", function Call(thisArg, argList) {
            var O = thisArg;
            var value = argList[0];
            var b = ToBoolean(value);
            if (Type(O) === "object" && hasInternalSlot(O, "BooleanData") && typeof getInternalSlot(O, "BooleanData") !== "boolean") {
                setInternalSlot(O, "BooleanData", b);
                return O;
            }
            return b;
        });
        setInternalSlot(BooleanConstructor, "Construct", function Construct(argList) {
            var F = this;
            var argumentsList = argList;
            return OrdinaryConstruct(F, argumentsList);
        });
        MakeConstructor(BooleanConstructor, true, BooleanPrototype);
        DefineOwnProperty(BooleanConstructor, $$create, {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var F = thisArg;
                var obj = OrdinaryCreateFromConstructor(F, "%BooleanPrototype%", {
                    "BooleanData": null
                });
                return obj;
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });
        DefineOwnProperty(BooleanConstructor, "length", {
            value: 1,
            enumerable: false,
            writable: false,
            configurable: false
        });
        DefineOwnProperty(BooleanPrototype, "constructor", {
            value: BooleanConstructor,
            enumerable: false,
            writable: false,
            configurable: false
        });
        DefineOwnProperty(BooleanPrototype, "toString", {
            value: CreateBuiltinFunction(getRealm(),function toString(thisArg, argList) {
                var b = thisBooleanValue(thisArg);
                if (isAbrupt(b)) return b;
                if (b === true) return "true";
                if (b === false) return "false";
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });
        DefineOwnProperty(BooleanPrototype, "valueOf", {
            value: CreateBuiltinFunction(getRealm(),function valueOf(thisArg, argList) {
                return thisBooleanValue(thisArg);
            }),
            enumerable: false,
            writable: true,
            configurable: true
        });

        // ===========================================================================================================
        // Symbol Constructor and Prototype
        // ===========================================================================================================

        MakeConstructor(SymbolFunction, true, SymbolPrototype);

        var SymbolFunction_Call = function Call(thisArg, argList) {
            var descString;
            var description = argList[0];
            if (description !== undefined) descString = ToString(description);
            var symbol = SymbolPrimitiveType();
            setInternalSlot(symbol, "Description", descString);
            return symbol;
        };
        var SymbolFunction_Construct = function Construct(argList) {
            var F = SymbolFunction;
            var argumentList = argList;
            return OrdinaryConstruct(F, argumentList);
        };

        setInternalSlot(SymbolFunction, "Call", SymbolFunction_Call);
        setInternalSlot(SymbolFunction, "Construct", SymbolFunction_Construct);

        DefineOwnProperty(SymbolFunction, "create", {
            value: $$create,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SymbolFunction, "toStringTag", {
            value: $$toStringTag,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SymbolFunction, "toPrimitive", {
            value: $$toPrimitive,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SymbolFunction, "hasInstance", {
            value: $$hasInstance,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SymbolFunction, "isConcatSpreadable", {
            value: $$isConcatSpreadable,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SymbolFunction, "iterator", {
            value: $$iterator,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SymbolFunction, "isRegExp", {
            value: $$isRegExp,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SymbolFunction, "unscopables", {
            value: $$unscopables,
            writable: false,
            enumerable: false,
            configurable: false
        });

        var SymbolFunction_$$create = function (thisArg, argList) {
            return withError("Type", "The Symbol[@@create] method of the Symbol Function is supposed to throw a Type Error");
        };
        DefineOwnProperty(SymbolFunction, $$create, {
            value: CreateBuiltinFunction(getRealm(),SymbolFunction_$$create, 0, "[Symbol.create]"),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SymbolFunction, "prototype", {
            value: SymbolPrototype,
            writable: false,
            enumerable: false,
            configurable: false
        });

        setInternalSlot(SymbolPrototype, "Prototype", ObjectPrototype);
        DefineOwnProperty(SymbolPrototype, "constructor", {
            value: SymbolFunction,
            writable: false,
            enumerable: false,
            configurable: false
        });

        var SymbolPrototype_toString = function toString(thisArg, argList) {
            var s = thisArg;
            if (hasInternalSlot(s, "SymbolData")) return withError("Type", "The this argument has got no [[SymbolData]] property.");
            var sym = getInternalSlot(s, "SymbolData");
            var desc = getInternalSlot(sym, "Description");
            if (desc === undefined) desc = "";
            Assert(Type(desc) === "string", "The [[Description]] field of the symbol of the this argument is not a string");
            var result = "Symbol(" + desc + ")";
            return NormalCompletion(result);
        };

        DefineOwnProperty(SymbolPrototype, "toString", {
            value: CreateBuiltinFunction(getRealm(),SymbolPrototype_toString, 0, "toString"),
            writable: false,
            enumerable: false,
            configurable: false
        });

        var SymbolPrototype_valueOf = function valueOf(thisArg, argList) {
            var s = thisArg;
            if (hasInternalSlot(s, "SymbolData")) return withError("Type", "The this argument has got no [[SymbolData]] property.");
            var sym = getInternalSlot(s, "SymbolData");
            return NormalCompletion(sym);
        };
        
        var SymbolPrototype_$$toPrimitive = function (thisArg, argList) {
                return withError("Type", "Symbol.prototype[@@toPrimitive] is supposed to throw a Type Error!");
        };
        
        var GlobalSymbolRegistry = Object.create(null);

        var SymbolFunction_keyFor = function (thisArg, argList) {
            var sym = argList[0];
            if (Type(sym) !== "symbol") return withError("Type", "keyFor: sym is not a symbol");
            var key = getInternalSlot(sym, "Description");
            var e = GlobalSymbolRegistry[key];
            if (SameValue(e.symbol, sym)) return NormalCompletion(e.key);
            Assert(GlobalSymbolRegistry[key] === undefined, "GlobalSymbolRegistry must not contain an entry for sym");
            return NormalCompletion(undefined);
        };

        var SymbolFunction_for = function (thisArg, argList) {
            var key = argList[0];
            var stringKey = ToString(key)
            if ((stringKey = ifAbrupt(stringKey)) && isAbrupt(stringKey)) return stringKey;
            var e = GlobalSymbolRegistry[key];
            if (e !== undefined && SameValue(e.key, stringKey)) return NormalCompletion(e.symbol);
            Assert(e === undefined, "GlobalSymbolRegistry must currently not contain an entry for stringKey");
            var newSymbol = SymbolPrimitiveType();
            setInternalSlot(newSymbol, "Description", stringKey);
            GlobalSymbolRegistry[stringKey] = createGenericRecord({ key: stringKey, symbol: newSymbol });
            return NormalCompletion(newSymbol); // There is a Typo newSumbol in the Spec. 
        };


        LazyDefineBuiltinFunction(SymbolPrototype, "valueOf", 0, SymbolPrototype_valueOf);
        LazyDefineBuiltinConstant(SymbolPrototype, $$toStringTag, "Symbol");
        LazyDefineBuiltinConstant(SymbolPrototype, $$toPrimitive, CreateBuiltinFunction(getRealm(),SymbolPrototype_$$toPrimitive, 1, "[Symbol.toPrimitive]"));

        LazyDefineBuiltinFunction(SymbolFunction, "for", 1, SymbolFunction_for);
        LazyDefineBuiltinFunction(SymbolFunction, "keyFor", 1, SymbolFunction_keyFor /* ,realm */);


        // ===========================================================================================================
        // encodeURI, decodeURI functions
        // ===========================================================================================================

        setInternalSlot(EncodeURIFunction, "Call", function (thisArg, argList) {
            var uri = argList[0];
            var uriString = ToString(uri);
            if ((uriString = ifAbrupt(uriString)) && isAbrupt(uriString)) return uriString;
            var unescapedUriSet = "" + uriReserved + uriUnescaped + "#";
            return Encode(uriString, unescapedUriSet);
        });

        setInternalSlot(EncodeURIComponentFunction, "Call", function (thisArg, argList) {
            var uriComponent = argList[0];
            var uriComponentString = ToString(uriComponent);
            if ((uriComponentString = ifAbrupt(uriComponentString)) && isAbrupt(uriComponentString)) return uriComponentString;
            var unescapedUriComponentSet = "" + uriUnescaped;
            return Encode(uriComponentString, unescapedUriComponentSet);
        });

        setInternalSlot(DecodeURIFunction, "Call", function (thisArg, argList) {
            var encodedUri = argList[0];
            var uriString = ToString(encodedUri);
            if ((uriString = ifAbrupt(uriString)) && isAbrupt(uriString)) return uriString;
            var reservedUriSet = "" + uriReserved + "#";
            return Decode(uriString, reservedUriSet);
        });

        setInternalSlot(DecodeURIComponentFunction, "Call", function (thisArg, argList) {
            var encodedUriComponent = argList[0];
            var uriComponentString = ToString(encodedUriComponent);
            if ((uriComponentString = ifAbrupt(uriComponentString)) && isAbrupt(uriComponentString)) return uriComponentString;
            var reservedUriComponentSet = "";
            return Decode(uriComponentString, reservedUriComponentSet);
        });

        // ===========================================================================================================
        // escape, unescape
        // ===========================================================================================================

        setInternalSlot(EscapeFunction, "Call", function (thisArg, argList) {
            return escape(argList[0]);
        });

        setInternalSlot(UnescapeFunction, "Call", function (thisArg, argList) {
            return unescape(argList[0]);
        });

        // ===========================================================================================================
        // parseInt, parseFloat
        // ===========================================================================================================

        setInternalSlot(ParseIntFunction, "Call", function (thisArg, argList) {
            return parseInt(argList[0], argList[1]);
        });

        setInternalSlot(ParseFloatFunction, "Call", function (thisArg, argList) {
            return parseFloat(argList[0], argList[1]);
        });

        // ===========================================================================================================
        // eval("let x = 10"); Function calls the parser and exports.Evaluate
        // ===========================================================================================================

        setInternalSlot(EvalFunction, "Call", function (thisArg, argList) {
            var input, strict, direct, strictCaller, evalRealm, directCallToEval,
                ctx, value, result, script, evalCxt, lexEnv, varEnv, strictVarEnv,
                strictScript;

            input = GetValue(argList[0]);
            if (Type(input) !== "string") return input;
            try {
                script = parse(input);
            } catch (ex) {
                return withError("Syntax", ex.message);
            }

            if (script.type !== "Program") return undefined;

            if (script.strict) {
                strict = true;
            }

            if (directCallToEval) direct = true;
            if (direct) {
                strictCaller = true;
            } else {
                strictCaller = false;
            }
            ctx = getContext();
            if (strict) ctx.strict = true;
            evalRealm = ctx.realm;

            if (direct) {

                // 1. if the code that made the call is function code
                // and ValidInFunction is false throw SyntaxError
                // 2. If the code is module code and
                // ValidInModule ist false throw SyntaxError
            }
            if (direct) {
                lexEnv = ctx.lexEnv;
                varEnv = ctx.varEnv;
            } else {
                lexEnv = evalRealm.globalEnv;
                varEnv = evalRealm.globalEnv;
            }
            if (strictScript || (direct && strictCaller)) {
                strictVarEnv = NewDeclarativeEnvironment(lexEnv);
                lexEnv = strictVarEnv;
                varEnv = strictVarEnv;
            }

            evalCxt = newContext(getLexEnv());
            evalCxt.realm = evalRealm;
            evalCxt.varEnv = varEnv;
            evalCxt.lexEnv = lexEnv;

            result = require("lib/runtime").Evaluate(script);
            ctx = oldContext();
            return result;
        });

        setInternalSlot(EvalFunction, "Construct", null);

        // ===========================================================================================================
        // Error
        // ===========================================================================================================

        setInternalSlot(ErrorPrototype, "Prototype", ObjectPrototype);
        MakeConstructor(ErrorConstructor, true, ErrorPrototype);
        LazyDefineBuiltinConstant(ErrorConstructor, "prototype", ErrorPrototype);
        LazyDefineBuiltinConstant(ErrorPrototype, "constructor", ErrorConstructor);
        //SetFunctionName(ErrorConstructor, "Error");

        setInternalSlot(ErrorConstructor, "Call", function (thisArg, argList) {
            var func = ErrorConstructor;
            var message = argList[0];
            var O = thisArg;
            var isObject = Type(O) === "object";
                // This is different from the others in the spec
            if (!isObject || (isObject &&
                (!hasInternalSlot(O, "ErrorData") || (getInternalSlot(O, "ErrorData") === undefined)))) {
                O = OrdinaryCreateFromConstructor(func, "%ErrorPrototype%", {
                    "ErrorData": undefined
                });
                if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
            }
                // or i read it wrong
            Assert(Type(O) === "object");
            setInternalSlot(O, "ErrorData", "Error");
            if (message !== undefined) {
                var msg = ToString(message);
                if ((msg = ifAbrupt(msg)) && isAbrupt(msg)) return msg;
                var msgDesc = {
                    value: msg,
                    writable: true,
                    enumerable: false,
                    configurable: true
                };
                var status = DefineOwnPropertyOrThrow(O, "message", msgDesc);
                if (isAbrupt(status)) return status;
            }

            CreateDataProperty(O, "stack", stringifyErrorStack());

            setInternalSlot(O, "toString", function () { return "[object Error]"; })
            return O;
        });

        setInternalSlot(ErrorConstructor, "Construct", function (argList) {
            var F = this;
            var argumentsList = argList;
            return OrdinaryConstruct(F, argumentsList);
        });

        DefineOwnProperty(ErrorConstructor, $$create, {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var F = thisArg;
                var obj = OrdinaryCreateFromConstructor(F, "%ErrorPrototype%", {
                    "ErrorData": undefined
                });
                return obj;
            }),
            writable: false,
            configurable: false,
            enumerable: false

        });

        DefineOwnProperty(ErrorPrototype, "toString", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var O = thisArg;
                if (Type(O) !== "object") return withError("Type", "Error.prototype.toString: O is not an object.");
                var name = Get(O, "name");
                if (isAbrupt(name)) return name;
                name = ifAbrupt(name);
                var msg = Get(O, "message");
                if (isAbrupt(msg)) return msg;
                msg = ifAbrupt(msg);
                if (msg === undefined) msg = "";
                else msg = ToString(msg);
                if (name === "") return msg;
                if (msg === "") return name;
                return name + ": " + msg;
            }),
            writable: false,
            configurable: false,
            enumerable: false

        });

        function createNativeError(nativeType, ctor, proto) {
            var name = nativeType + "Error";
            var intrProtoName = "%" + nativeType + "ErrorPrototype%"
            //SetFunctionName(ctor, name);
            setInternalSlot(ctor, "Call", function (thisArg, argList) {
                var func = this;
                var O = thisArg;
                var message = argList[0];
                if (Type(O) !== "object" ||
                    (Type(O) == "object" && getInternalSlot(O, "ErrorData") == undefined)) {
                    O = OrdinaryCreateFromConstructor(func, intrProtoName);
                    if (isAbrupt(O)) return O;
                    O = ifAbrupt(O);
                }
                if (Type(O) !== "object") return withError("Assert: NativeError: O is an object: failed");
                setInternalSlot(O, "ErrorData", name);
                if (message !== undefined) {
                    var msg = ToString(message);
                    var msgDesc = {
                        value: msg,
                        writable: true,
                        enumerable: false,
                        configurable: true
                    };
                    var status = DefineOwnPropertyOrThrow(O, "message", msgDesc);
                    if (isAbrupt(status)) return status;
                }

                CreateDataProperty(O, "stack", stringifyErrorStack())

                // interne representation
                setInternalSlot(O, "toString", function () {
                    return "[object "+name+"]";
                });
                return O;

            });

            setInternalSlot(ctor, "Construct", function (thisArg, argList) {
                var F = ctor;
                var argumentsList = argList;
                return OrdinaryCreateFromConstructor(F, argumentsList);
            });

            DefineOwnProperty(ctor, "length", {
                value: 1,
                enumerable: false,
                configurable: false,
                writable: false
            });
            DefineOwnProperty(ctor, $$create, {
                value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                    var F = thisArg;
                    var obj = OrdinaryCreateFromConstructor(F, intrProtoName);
                    return obj;
                }),
                enumerable: false,
                configurable: false,
                writable: false
            });

            LazyDefineBuiltinConstant(ctor, "prototype", proto);
            LazyDefineBuiltinConstant(proto, "constructor", ctor);
            LazyDefineBuiltinConstant(proto, "name", name);
            LazyDefineBuiltinConstant(proto, "message", "");
            MakeConstructor(ctor, false, proto);
        }

        // ===========================================================================================================
        // SyntaxError, TypeError, ReferenceError, URIError, RangeError, EvalError
        // ===========================================================================================================

        // SyntaxError
        createNativeError("Syntax", SyntaxErrorConstructor, SyntaxErrorPrototype);
        // TypeError
        createNativeError("Type", TypeErrorConstructor, TypeErrorPrototype);
        // ReferenceError
        createNativeError("Reference", ReferenceErrorConstructor, ReferenceErrorPrototype);
        // RangeError
        createNativeError("Range", RangeErrorConstructor, RangeErrorPrototype);
        // URIError
        createNativeError("URI", URIErrorConstructor, URIErrorPrototype);
        // EvalError
        createNativeError("Eval", EvalErrorConstructor, EvalErrorPrototype);

        // ===========================================================================================================
        // Date Constructor and Prototype (algorithms above)
        // ===========================================================================================================

        setInternalSlot(DateConstructor, "Call", function (thisArg, argList) {
            
            var O = thisArg;
            var numberOfArgs = argList.length;
            var y, m, dt, h, min, milli, finalDate;

            if (numberOfArgs >= 2) {
                
                var year = argList[0];
                var month = argList[1];
                var date = argList[2];
                var hours = argList[3];
                var minutes = argList[4];
                var seconds = argList[5];
                var ms = argList[6];
                
                if (Type(O) === "object" 
                    && hasInternalSlot(O, "DateValue") 
                    && (getInternalSlot(O, "DateValue") === undefined)) {

                    y = ToNumber(year);
                    if (isAbrupt(y)) return y;
                    m = ToNumber(month);
                    if (isAbrupt(m)) return m;
                    if (date) dt = ToNumber(date);
                    else dt = 1;
                    if (isAbrupt(dt)) return dt;
                    if (hours) h = ToNumber(hours);
                    else h = 0;
                    if (minutes) min = ToNumber(minutes);
                    else min = 0;
                    if (isAbrupt(min)) return min;
                    if (ms) milli = ToNumber(ms);
                    else milli = 0;
                    if (isAbrupt(milli)) return milli;
                    finalDate = MakeDate(MakeDay(yr, m, dt), MakeTime(h, min, s, milli));
                    setInternalSlot(O, "DateValue", TimeClip(UTC(finalDate)));
                }
                return O;
            } else if (numberOfArgs === 1) {
                var value = argList[0];
                var tv, v;
                if (Type(O) === "object" && hasInternalSlot(O, "DateValue") && getInternalSlot(O, "DateValue") === undefined) {
                    if (Type(value) === "object" && hasInternalSlot(value, "DateValue")) tv = thisTimeValue(value);
                    else {
                        v = ToPrimitive(value);
                        if (Type(v) === "string") {
                            tv = Invoke(DateConstructor, "parse", [v])
                        } else {
                            tv = ToNumber(v);
                        }
                        if ((tv = ifAbrupt(tv)) && isAbrupt(tv)) return tv;
                        setInternalSlot(O, "DateValue", TimeClip(tv));
                        return O;
                    }
                }
            } else if (numberOfArgs === 0) {
                if (Type(O) === "object" && hasInternalSlot(O, "DateValue") && getInternalSlot(O, "DateValue") === undefined) {
                    setInternalSlot(O, "DateValue", Date.now()/*TimeClip(UTC(Date.now()))*/);
                    return O;
                }
            } else {
                O = OrdinaryConstruct(DateConstructor, []);
                return Invoke(O, "toString", []);
            }
        });

        setInternalSlot(DateConstructor, "Construct", function (thisArg, argList) {
            return OrdinaryConstruct(this, argList);
        });


        DefineOwnProperty(DateConstructor, "prototype", {
            value: DatePrototype,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "constructor", {
            value: DateConstructor,
            writable: false,
            enumerable: false,
            configurable: false
        });

        //DatePrototype
        DefineOwnProperty(DateConstructor, "parse", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var string = ToString(argList[0]);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        //DatePrototype
        DefineOwnProperty(DateConstructor, "now", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                return NormalCompletion(Date.now());
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DateConstructor, $$create, {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var obj = OrdinaryCreateFromConstructor(DateConstructor, "%DatePrototype%", {
                    "DateValue" : undefined
                });
                return obj;
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getDate", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return DateFromTime(LocalTime(t));
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getDay", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return WeekDay(LocalTime(t));
            }),

            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getFullYear", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return YearFromTime(LocalTime(t));
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getHours", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return HourFromTime(LocalTime(t));
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getMilliSeconds", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return msFromTime(LocalTime(t));
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getMinutes", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return MinFromTime(LocalTime(t));
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getMonth", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return MonthFromTime(LocalTime(t));
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getTimeZoneOffset", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return (t - LocalTime(t));

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getUTCDay", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return WeekDay(t);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getUTCFullYear", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return YearFromTime(t);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getUTCHours", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return HourFromTime(t);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getUTCMilliseconds", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return msFromTime(t);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getUTCMinutes", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return MinFromTime(t);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "getUTCSeconds", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var t = thisTimeValue(thisArg);
                if (isAbrupt(t)) return t;
                if (t !== t) return NaN;
                return SecFromTime(t);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "setDate", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var date = argList[0];
                var t = LocalTime(thisTimeValue(thisArg));
                var newDate = MakeDate(MakeDay(YearFromTime(t), MonthFromTime(t), dt), TimeWithinDay(t));
                var u = TimeClip(UTC(newDate));
                setInternalSlot(thisArg, "DateValue", u);
                return u;
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DatePrototype, "", {
            value: null,
            writable: false,
            enumerable: false,
            configurable: false
        });

        LazyDefineBuiltinConstant(DatePrototype, $$toStringTag, "Date");

        //===========================================================================================================
        // Math 
        //============================================================================================================

        var PI = Math.PI;
        var LOG2E = Math.LOG2E;
        var SQRT1_2 = Math.SQRT1_2;
        var SQRT2 = Math.SQRT2;
        var LN10 = Math.LN10;
        var LN2 = Math.LN2;
        var LOG10E = Math.LOG10E;
        var E = Math.E;

        var MathObject_random = function (thisArg, argList) {
            return Math.random();
        };
        var MathObject_log = function (thisArg, argList) {
            var x = argList[0];
            return Math.log(x);
        };
        var MathObject_ceil = function (thisArg, argList) {
            var x = argList[0];
            return Math.ceil(x);
        };
        var MathObject_floor = function (thisArg, argList) {
            var x = argList[0];
            return Math.floor(x);
        };
        var MathObject_abs = function (thisArg, argList) {
            var a = argList[0];
            return Math.abs(a);
        };

        var MathObject_pow = function (thisArg, argList) {
            var b = argList[0];
            var e = argList[1];
            return Math.pow(b, e)
        };
        var MathObject_sin = function (thisArg, argList) {
            var x = argList[0];
            return Math.sin(x);
        };
        var MathObject_cos = function (thisArg, argList) {
            var x = argList[0];
            return Math.cos(x);
        };
        var MathObject_atan = function (thisArg, argList) {
            var x = argList[0];
            var y = argList[1];
            return Math.atan(x,y);
        };
        var MathObject_atan2 = function (thisArg, argList) {
            var x = argList[0];
            var y = argList[1];
            return Math.atan2(x,y);
        };
        var MathObject_max = function (thisArg, argList) {
            var args = CreateListFromArray(argList);
            return Math.max.apply(Math, args);
        }; 
        var MathObject_min = function (thisArg, argList) {
            var args = CreateListFromArray(argList);
            return Math.min.apply(Math, args);
        }; 
        var MathObject_tan = function (thisArg, argList) {
            var x = argList[0];
            return Math.tan(x);
        };
        var MathObject_exp = function (thisArg, argList) {
            var x = argList[0];
            return Math.exp(x);
        };
        var MathObject_hypot = function (thisArg, argList) {

        };
        var MathObject_imul = function (thisArg, argList) {

        };

        var MathObject_log1p = function (thisArg, argList) {

        };
        
        var MathObject_clz = function (thisArg, argList) {
                var x = argList[0];
                x = ToNumber(x);
                if ((x=ifAbrupt(x)) && isAbrupt(x)) return x;
                var n = ToUint32(x);
                if ((n=ifAbrupt(n)) && isAbrupt(n)) return n;
                if (n < 0) return 0;
                if (n == 0) return 32;
                var bitlen = Math.ceil(Math.log(Math.pow(n, Math.LOG2E)));
                var p = 32 - bitlen; 
                return NormalCompletion(p);
        };



        setInternalSlot(MathObject, "MathTag", true);
        setInternalSlot(MathObject, "Prototype", ObjectPrototype);
        
        LazyDefineBuiltinConstant(MathObject, "PI", PI);
        LazyDefineBuiltinConstant(MathObject, "LOG2E", LOG2E);
        LazyDefineBuiltinConstant(MathObject, "SQRT1_2", SQRT1_2);
        LazyDefineBuiltinConstant(MathObject, "SQRT2", SQRT2);
        LazyDefineBuiltinConstant(MathObject, "LN10", LN10);
        LazyDefineBuiltinConstant(MathObject, "LN2", LN2);
        LazyDefineBuiltinConstant(MathObject, "E", E);
        LazyDefineBuiltinConstant(MathObject, "LOG10E", LOG10E);
        LazyDefineBuiltinConstant(MathObject, $$toStringTag, "Math");

        LazyDefineBuiltinFunction(MathObject, "atan", 2, MathObject_atan);
        LazyDefineBuiltinFunction(MathObject, "atan2", 1, MathObject_atan2);
        LazyDefineBuiltinFunction(MathObject, "ceil", 1, MathObject_ceil);
        LazyDefineBuiltinFunction(MathObject, "clz", 1, MathObject_clz);        
        LazyDefineBuiltinFunction(MathObject, "cos", 1, MathObject_cos);
        LazyDefineBuiltinFunction(MathObject, "exp", 1, MathObject_exp);
        LazyDefineBuiltinFunction(MathObject, "floor", 1, MathObject_floor);
        LazyDefineBuiltinFunction(MathObject, "imul", 2, MathObject_imul);        
        LazyDefineBuiltinFunction(MathObject, "log", 1, MathObject_log);
        LazyDefineBuiltinFunction(MathObject, "log1p", 1, MathObject_log1p);
        LazyDefineBuiltinFunction(MathObject, "max", 0, MathObject_max);
        LazyDefineBuiltinFunction(MathObject, "min", 0, MathObject_min);
        LazyDefineBuiltinFunction(MathObject, "pow", 2, MathObject_pow);
        LazyDefineBuiltinFunction(MathObject, "sin", 1, MathObject_sin);
        LazyDefineBuiltinFunction(MathObject, "tan", 1, MathObject_tan);
        LazyDefineBuiltinFunction(MathObject, "random", 0, MathObject_random);
            
        // ===========================================================================================================
        // Number 
        // ===========================================================================================================

        MakeConstructor(NumberConstructor, true, NumberPrototype);

        var MIN_INTEGER = Number.MIN_INTEGER;
        var MAX_INTEGER = Number.MAX_INTEGER;
        var EPSILON = Number.EPSILON;
        var MIN_VALUE = Number.MIN_VALUE;
        var MAX_VALUE = Number.MAX_VALUE;
        var NAN = NaN;
        var POSITIVE_INFINITY = Infinity;
        var NEGATIVE_INFINITY = -Infinity;

        setInternalSlot(NumberConstructor, "Call", function (thisArg, argList) {
            var value = argList[0];
            var O = thisArg;
            var n;
            if (argList.length === 0) n = +0;
            else n = ToNumber(value);
            if ((n = ifAbrupt(n)) && isAbrupt(n)) return n;
            if (Type(O) === "object" /*&& hasInternalSlot(O, "NumberData")*/ && getInternalSlot(O, "NumberData") === undefined) {
                setInternalSlot(O, "NumberData", n);
                return O;
            }
            return n;
        });

        setInternalSlot(NumberConstructor, "Construct", function (argList) {
            var F = NumberConstructor;
            return OrdinaryConstruct(F, argList);
        });

        var NumberConstructor_$$create = function (thisArg, argList) {
                var F = thisArg;
                var obj = OrdinaryCreateFromConstructor(F, "%NumberPrototype%", {
                    "NumberData": undefined
                });
                return obj;
        };
        var NumberConstructor_isFinite = IsFiniteFunction;
        var NumberConstructor_isInteger = function (thisArg, argList) {
                var number = argList[0];
                if (Type(number) !== "number") return false;
                if ((number != number) ||
                    number === +Infinity || number === -Infinity) return false;
                return true;
        };
        var NumberPrototype_clz = function (thisArg, argList) {
                var x = thisNumberValue(thisArg);
                if ((x=ifAbrupt(x)) && isAbrupt(x)) return x;
                var n = ToUint32(x);
                if ((n=ifAbrupt(n)) && isAbrupt(n)) return n;
                if (n < 0) return 0;
                if (n === 0) return 32;
                var bitlen = Math.floor(Math.log(Math.pow(n, Math.LOG2E))) + 1;
                var p = 32 - bitlen; 
                return NormalCompletion(p);
        };
        var NumberPrototype_toString = function (thisArg, argList) {
                var radix = argList[0];
                var n = thisNumberValue(thisArg);
                if (radix) {
                    return (+n).toString(radix);
                } 
                return ToString(thisArg);
        };
        var NumberPrototype_valueOf = function (thisArg, argList) {
                var x = thisNumberValue(thisArg);
                return x;
        };
        var NumberPrototype_toPrecision = function (thisArg, argList) {
                var precision = argList[0];
                var x = thisNumberValue(thisArg);
                if ((x = ifAbrupt(x)) && isAbrupt(x)) return x;
                if (precision === undefined) return ToString(x);
                var p = ToInteger(precision);
                if ((p = ifAbrupt(p)) && isAbrupt(p)) return p;
                if (x !== x) return "NaN";
                var s = "";
                if (x < 0) {
                    s = "-";
                    x = -x;
                }
                if (x === +Infinity || x === -Infinity) {
                        return NormalCompletion(s + "Infinity");

                }

        };


// --> 
        function repeatString (str, times) {
            var concat = "";
            for (var i = 0; i < times; i++) {
                concat += str;
            }
            return concat;
        }

// -->

        var NumberPrototype_toFixed = function (thisArg, argList) {
                var fractionDigits = argList[0];
                var x = thisNumberValue(thisArg);
                if ((x = ifAbrupt(x)) && isAbrupt(x)) return x;
                if (fractionDigits === undefined) return ToString(x);
                var f = ToInteger(fractionDigits);
                if ((f = ifAbrupt(f)) && isAbrupt(f)) return f;
                if ((f < 0) || (f > 20)) return withError("Range", "fractionDigits is less or more than 20")
                if (x !== x) return "NaN";
                var s = "";
                if (x < 0) {
                    s = "-";
                    x = -x;
                }
                if (x >= 1021) {
                    var m = ToString(x);
                } else {
                    var n;
                    if (n === 0) m = "0";
                    else m = ""+n;
                    if (f != 0) {
                        var k = Math.ceil(Math.log(Math.pow(n, Math.LOG2E))); // = number of elements in n
                        if (k <= f)  {
                            var z = repeatString(0x0030, f+1-k);
                            m = z + m;
                            k = f + 1;
                        }
                        var a = m.substr(0, k-f);
                        var b = m.substr(k-f);
                        m = a + "." + b;
                    }
                }
                return NormalCompletion(s + m);
        };
        var NumberPrototype_toExponential = function (thisArg, argList) {
                var fractionDigits = argList[0];
                var x = thisNumberValue(thisArg);
                if ((x = ifAbrupt(x)) && isAbrupt(x)) return x;
                var f = ToInteger(fractionDigits);
                if ((f = ifAbrupt(f)) && isAbrupt(f)) return f;
                if (x !== x) return "NaN";
                var s = "";
                if (x < 0) {
                    s = "-";
                    x = -x;
                }
                var n;
                if (x === Infinity || s === -Infinity) {
                    return s + "Infinity";
                }
                if (fractionDigits !== undefined && ((f < 0) || (f > 20))) return withError("Range", "toExponential: fractionDigits < 0 or > 20");
                if (x === 0) {
                    if (fractionDigits === undefined) f = 0;
                    var m = stringRepeat(0x0030, f+1);
                    var e = 0;
                } else {
                    if (fractionDigits !== undefined) {

                        // ich konnte das im mcview nicht lesen ob 10f oder 10^f 
                        // ich hab das unterwegs geschrieben, todo 
                        e;
                        n;
                    } else {
                        e;
                        n;
                    }
                    m = ""+n;
                }
                if (f != 0) {
                    var a = m.substr(m, 1);
                    var b = m.substr(1);
                } 
                if (e === 0) {
                    var c = "+";
                    var d = "0";
                } else {
                    if (e > 0) c = "+";
                    else if (e <= 0) {
                        c = "-";
                        e = -e;
                    }
                    d = ""+e;
                    m = m + "e" + c + d;
                }
                return NormalCompletion(s + m)
        };

        LazyDefineBuiltinFunction(NumberConstructor, "isFinite", 0, NumberConstructor_isFinite);
        LazyDefineBuiltinFunction(NumberConstructor, "isInteger", 0, NumberConstructor_isInteger);
        LazyDefineBuiltinFunction(NumberConstructor, $$create, 0, NumberConstructor_$$create);
        LazyDefineBuiltinConstant(NumberConstructor, "EPSILON", EPSILON);
        LazyDefineBuiltinConstant(NumberConstructor, "MIN_INTEGER", MIN_INTEGER);
        LazyDefineBuiltinConstant(NumberConstructor, "MIN_VALUE", MIN_VALUE);
        LazyDefineBuiltinConstant(NumberConstructor, "MAX_INTEGER", MAX_INTEGER);
        LazyDefineBuiltinConstant(NumberConstructor, "MAX_VALUE", MAX_VALUE);
        LazyDefineBuiltinConstant(NumberConstructor, "NaN", NAN);
        LazyDefineBuiltinConstant(NumberConstructor, "NEGATIVE_INFINITY", NEGATIVE_INFINITY);
        
        LazyDefineBuiltinFunction(NumberPrototype, "clz", 0, NumberPrototype_clz); 
        LazyDefineBuiltinFunction(NumberPrototype, "toExponential", 0, NumberPrototype_toExponential);
        LazyDefineBuiltinFunction(NumberPrototype, "toFixed", 0, NumberPrototype_toFixed);
        LazyDefineBuiltinFunction(NumberPrototype, "toPrecision", 0, NumberPrototype_toPrecision);
        LazyDefineBuiltinFunction(NumberPrototype, "toString", 0, NumberPrototype_toString);
        LazyDefineBuiltinFunction(NumberPrototype, "valueOf", 0, NumberPrototype_valueOf);

        LazyDefineBuiltinConstant(NumberPrototype, $$toStringTag, "Number");

        // ===========================================================================================================
        // Proxy
        // ===========================================================================================================

        function ProxyCreate(target, handler) {
            var proxy = ProxyExoticObject();
            setInternalSlot(proxy, "Prototype", ProxyPrototype);
            setInternalSlot(proxy, "ProxyTarget", target);
            setInternalSlot(proxy, "ProxyHandler", handler);
            return proxy;
        }

        MakeConstructor(ProxyConstructor, true, ProxyPrototype);

        var ProxyConstructor_revocable = function revocable(thisArg, argList) {
                var target = argList[0];
                var handler = argList[1]

                var revoker = CreateBuiltinFunction(getRealm(),function revoke(thisArg, argList) {
                    var p = getInternalSlot(revoker, "RevokableProxy");
                    if (p === null) return NormalCompletion(undefined);
                    setInternalSlot(revoker, "RevokableProxy", null);
                    Assert(p instanceof ProxyExoticObject, "revoke: object is not a proxy");
                    setInternalSlot(p, "ProxyTarget", null);
                    setInternalSlot(p, "ProxyHandler", null);
                    return NormalCompletion(undefined);
                });

                var proxy = ProxyCreate(target, handler);
                setInternalSlot(revoker, "RevokableProxy", proxy);
                var result = ObjectCreate();
                CreateDataProperty(result, "proxy", proxy);
                CreateDataProperty(result, "revoke", revoker);
                return result;
        };

        var ProxyConstructor_Call = function Call(thisArg, argList) {
            var target = argList[0];
            var handler = argList[1];
            var p = ProxyCreate(target, handler);
            if (!IsConstructor(target)) setInternalSlot(p, "Construct", undefined);
            return p;
        };

        LazyDefineBuiltinFunction(ProxyConstructor, "revocable", 2, ProxyConstructor_revocable);
        setInternalSlot(ProxyConstructor, "Call", ProxyConstructor_Call);

        
        // ===========================================================================================================
        // Reflect
        // ===========================================================================================================

        function reflect_parse_transformASTtoOrdinaries(node, options) {
            var success;
            var newNode;
            var loc = options && options.loc;
            if (Array.isArray(node)) newNode = ArrayCreate(0);
            else newNode = ObjectCreate();
            var current;
            var value;
            for (var k in node) {
                if (!loc && k === "loc") continue;

                if (Object.hasOwnProperty.call(node, k)) {
                    current = node[k];
                    if (current && typeof current === "object") {
                        value = reflect_parse_transformASTtoOrdinaries(current);
                    } else {
                        value = current;
                    }
                    success = DefineOwnProperty(newNode, k, {
                        value: value,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                    if (isAbrupt(success)) return success;
                }
            }
            return newNode;
        };


        var ReflectObject_parse = function (thisArg, argList) {
                var parse = require("lib/parser");
                var parseGoal = parse.parseGoal;
                var source = argList[0];
                var options = argList[1];
                var jsAst, newAst, message;
                if (Type(source) !== "string") return withError("Type", "String to parse expected");
                try {
                    jsAst = parse(source);
                } catch (ex) {
                    message = ex.message;
                    return withError("Syntax", message);
                }
                newAst = reflect_parse_transformASTtoOrdinaries(jsAst, options);
                if ((newAst = ifAbrupt(newAst)) && isAbrupt(newAst)) return newAst;
                return NormalCompletion(newAst);
            };

        var ReflectObject_parseGoal = function (thisArg, argList) {
                var parse = require("lib/parser");
                var parseGoal = parse.parseGoal;
                var source = argList[1];
                var goal = argList[0];
                var jsAst, newAst, message;

                if (Type(goal) !== "string") return withError("Type", "Goal to parse expected");
                if (Type(source) !== "string") return withError("Type", "String to parse expected");
                try {
                    jsAst = parseGoal(goal, source);
                } catch (ex) {
                    message = ex.message;
                    return withError("Syntax", message);
                }
                newAst = reflect_parse_transformASTtoOrdinaries(jsAst);
                if ((newAst = ifAbrupt(newAst)) && isAbrupt(newAst)) return newAst;
                return NormalCompletion(newAst);
            };


        var ReflectObject_getPrototypeOf = function (thisArg, argList) {
                var target = argList[0];
                var obj = ToObject(target);
                if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
                return GetPrototypeOf(obj);
            };

        var ReflectObject_setPrototypeOf = function (thisArg, argList) {
            var target = argList[0];
            var proto = argList[1];
            var obj = ToObject(target);
            if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
            if (Type(proto) !== "object" && proto !== null) return withError("Type", "Reflect.setPrototypeOf: proto is neither an object nor null!");
            return SetPrototypeOf(obj, proto);
        };


        var ReflectObject_isExtensible = function (thisArg, argList) {
            var target = argList[0];
            var obj = ToObject(target);
            if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
            return IsExtensible(obj);
        };

        var ReflectObject_preventExtensions = function (thisArg, argList) {
                var target = argList[0];
                var obj = ToObject(target);
                if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
                return PreventExtensions(obj);
        };
        var ReflectObject_has = function (thisArg, argList) {
            var target = argList[0];
            var propertyKey = argList[1];
            var obj = ToObject(target);
            if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
            var key = ToPropertyKey(propertyKey);
            if ((key = ifAbrupt(key)) && isAbrupt(key)) return key;
            return HasProperty(obj, key);
        };
        var ReflectObject_hasOwn = function (thisArg, argList) {
            var target = argList[0];
            var propertyKey = argList[1];
            var obj = ToObject(target);
            if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
            var key = ToPropertyKey(propertyKey);
            if ((key = ifAbrupt(key)) && isAbrupt(key)) return key;
            return HasOwnProperty(obj, key);
        };

        var ReflectObject_getOwnPropertyDescriptor = function (thisArg, argList) {
            var target = argList[0];
            var propertyKey = argList[1];
            var obj = ToObject(target);
            if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
            var key = ToPropertyKey(propertyKey);
            if ((key = ifAbrupt(key)) && isAbrupt(key)) return key;
            var desc = GetOwnProperty(obj, key);
            if ((desc = ifAbrupt(desc)) && isAbrupt(desc)) return desc;
            return FromPropertyDescriptor(desc);
        };

        var ReflectObject_get = function (thisArg, argList) {
                var target = argList[0];
                var propertyKey = argList[1];
                var receiver = argList[2];
                var obj = ToObject(target);
                if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
                var key = ToPropertyKey(propertyKey);
                if ((key = ifAbrupt(key)) && isAbrupt(key)) return key;
                if (receiver === undefined) receiver = target;
                return obj.Get(key, receiver);
            };

        var ReflectObject_set =function (thisArg, argList) {
            var target = argList[0];
            var propertyKey = argList[1];
            var V = argList[2];
            var receiver = argList[3];
            var obj = ToObject(target);
            if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
            var key = ToPropertyKey(propertyKey);
            if ((key = ifAbrupt(key)) && isAbrupt(key)) return key;
            if (receiver === undefined) receiver = target;
            return obj.Set(key, V, receiver);
        };
        var ReflectObject_invoke = function (thisArg, argList) {
                var target = argList[0];
                var propertyKey = argList[1];
                var argumentList = argList[2];
                var receiver = argList[3];
                var obj = ToObject(target);
                if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
                var key = ToPropertyKey(propertyKey);
                if ((key = ifAbrupt(key)) && isAbrupt(key)) return key;
                if (receiver === undefined) receiver = target;
                var A = CreateListFromArrayLike(argumentList);
                return obj.Invoke(key, A, receiver);
            };
        var ReflectObject_deleteProperty = function (thisArg, argList) {
                var target = argList[0];
                var propertyKey = argList[1];
                var obj = ToObject(target);
                if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
                var key = ToPropertyKey(propertyKey);
                if ((key = ifAbrupt(key)) && isAbrupt(key)) return key;
                return obj.Delete(key);
            };
        var ReflectObject_defineProperty = function (thisArg, argList) {
                var target = argList[0];
                var propertyKey = argList[1];
                var attributes = argList[2];
                var obj = ToObject(target);
                if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
                var key = ToPropertyKey(propertyKey);
                if ((key = ifAbrupt(key)) && isAbrupt(key)) return key;
                var desc = ToPropertyDescriptor(attributes);
                if ((desc = ifAbrupt(desc)) && isAbrupt(desc)) return desc;
                return callInternalSlot("DefineOwnProperty", obj,key, desc);
            };
            var ReflectObject_enumerate = function (thisArg, argList) {
                var target = argList[0];
                var obj = ToObject(target);
                if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
                return obj.Enumerate();
            };
            var ReflectObject_ownKeys = function (thisArg, argList) {
                var target = argList[0];
                var obj = ToObject(target);
                if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
                return obj.OwnPropertyKeys();
            };


        LazyDefineBuiltinFunction(ReflectObject, "defineProperty", 2, ReflectObject_defineProperty);
        LazyDefineBuiltinFunction(ReflectObject, "deleteProperty", 3, ReflectObject_deleteProperty);
        LazyDefineBuiltinFunction(ReflectObject, "enumerate", 1, ReflectObject_enumerate);    
        LazyDefineBuiltinFunction(ReflectObject, "invoke", 3, ReflectObject_invoke);        
        LazyDefineBuiltinFunction(ReflectObject, "isExtensible", 1, ReflectObject_isExtensible);
        LazyDefineBuiltinFunction(ReflectObject, "get", 2, ReflectObject_get);
        LazyDefineBuiltinFunction(ReflectObject, "getOwnPropertyDescriptor", 2, ReflectObject_getOwnPropertyDescriptor);
        LazyDefineBuiltinFunction(ReflectObject, "getPrototypeOf", 1, ReflectObject_getPrototypeOf);
        LazyDefineBuiltinFunction(ReflectObject, "has", 2, ReflectObject_has);
        LazyDefineBuiltinFunction(ReflectObject, "hasOwn", 2, ReflectObject_hasOwn);
        LazyDefineBuiltinFunction(ReflectObject, "ownKeys", 1, ReflectObject_ownKeys);        
        LazyDefineBuiltinFunction(ReflectObject, "parse", 1, ReflectObject_parse);
        LazyDefineBuiltinFunction(ReflectObject, "parseGoal", 1, ReflectObject_parseGoal);
        LazyDefineBuiltinFunction(ReflectObject, "preventExtensions", 1, ReflectObject_preventExtensions);
        LazyDefineBuiltinFunction(ReflectObject, "set", 3, ReflectObject_set);
        LazyDefineBuiltinFunction(ReflectObject, "setPrototypeOf", 2, ReflectObject_setPrototypeOf);
        

        // ===========================================================================================================
        // IsNaN
        // ===========================================================================================================

        IsNaNFunction = CreateBuiltinFunction(getRealm(),function isNaN(thisArg, argList) {
            var nan = ToNumber(argList[0]);
            return nan !== nan;
        }, 1, "isNaN");

        // ===========================================================================================================
        // IsFinite
        // ===========================================================================================================

        IsFiniteFunction = CreateBuiltinFunction(getRealm(),function isFinite(thisArg, argList) {
            var number = ToNumber(argList[0]);
            if (number == Infinity || number == -Infinity || number != number) return false;
            return true
       }, 1, "isFinite");

        // ===========================================================================================================
        // Object
        // ===========================================================================================================
        var ObjectConstructor_assign = function (thisArg, argList) {
                var target = argList[0];
                var source = argList[1];
                var to = ToObject(target);
                if ((to = ifAbrupt(to)) && isAbrupt(to)) return to;
                var from = ToObject(source);
                if ((source = ifAbrupt(source)) && isAbrupt(source)) return source;
                var keys = OwnPropertyKeys(source);
                if ((keys = ifAbrupt(keys)) && isAbrupt(keys)) return keys;
                var gotAllNames = false;
                var pendingException = undefined;
                var next, nextKey, desc, propValue, status;
                while (!gotAllNames) {
                    next = IteratorStep(keys);
                    if ((next = ifAbrupt(next)) && isAbrupt(next)) return next;
                    if (!next) gotAllNames = true;
                    else {
                        nextKey = IteratorValue(next);
                        if ((nextKey = ifAbrupt(nextKey)) && isAbrupt(nextKey)) return nextKey;
                        desc = GetOwnProperty(from, nextKey);
                        if (isAbrupt(desc)) pendingException = desc;
                        else if (desc !== undefined && desc.enumerable === true) {
                            propValue = Get(from, nextKey);
                            if (isAbrupt(propValue)) pendingException = propValue;
                            else {
                                status = Put(to, nextKey, propValue, true);
                                if (isAbrupt(status)) pendingException = status;
                            }
                        }
                    }
                }
                if (pendingException !== undefined) return pendingException;
                return to;
            };
            var ObjectConstructor_create = function (thisArg, argList) {
                var O = argList[0]
                var Properties = argList[1];
                if (Type(O) !== "object" && Type(O) !== "null") return withError("Type", "create: argument is not an object or null");
                var obj = ObjectCreate(O);
                if (Properties !== undefined) {
                    return ObjectDefineProperties(obj, Properties);
                }
                return obj;
            };
            var ObjectConstructor_defineProperty = function (thisArg, argList) {
                var O = argList[0];
                var P = argList[1];
                var Attributes = argList[2];
                if (Type(O) !== "object") return withError("Type", "defineProperty: argument 1 is not an object");
                var key = ToPropertyKey(P);
                var desc = ToPropertyDescriptor(Attributes);
                if ((desc = ifAbrupt(desc)) && isAbrupt(desc)) return desc;
                var success = DefineOwnPropertyOrThrow(O, key, desc);
                if ((success = ifAbrupt(success)) && isAbrupt(success)) return success;
                return O;
            };
            var ObjectConstructor_defineProperties = function (thisArg, argList) {
                var O = argList[0];
                var Properties = argList[1];
                return ObjectDefineProperties(O, Properties);
            };

        //SetFunctionName(ObjectConstructor, "Object");
        //setFunctionLength(ObjectConstructor, 1);
        LazyDefineBuiltinFunction(ObjectConstructor, "assign", 2, ObjectConstructor_assign);
        LazyDefineBuiltinFunction(ObjectConstructor, "create", 0, ObjectConstructor_create);
        LazyDefineBuiltinFunction(ObjectConstructor, "defineProperty", 0, ObjectConstructor_defineProperty);
        LazyDefineBuiltinFunction(ObjectConstructor, "defineProperties", 0, ObjectConstructor_defineProperties);



        setInternalSlot(ObjectConstructor, "Call", function Call(thisArg, argList) {
            var value = argList[0];
            if (value === null || value === undefined) return ObjectCreate();
            return ToObject(value);
        });

        setInternalSlot(ObjectConstructor, "Construct", function (argList) {
            var value = argList[0];
            var type = Type(value);
            switch (type) {
            case "object":
                return value;
                break;
            case "string":
            case "number":
            case "symbol":
            case "boolean":
                return ToObject(value);
                break;
            }
            return ObjectCreate();
        });


        LazyDefineProperty(ObjectConstructor, "seal", CreateBuiltinFunction(getRealm(),
            function (thisArg, argList) {
                var O;
                O = argList[0];
                if (Type(O) !== "object") return withError("Type", "First argument is object");
                var status = SetIntegrityLevel(O, "sealed");
                if ((status = ifAbrupt(status)) && isAbrupt(status)) return status;
                if (status === false) return withError("Type", "seal: can not seal object");
                return O;
            }
        ));

        LazyDefineProperty(ObjectConstructor, "freeze", CreateBuiltinFunction(getRealm(),
            function (thisArg, argList) {
                var O;
                O = argList[0];
                if (Type(O) !== "object") return withError("Type", "First argument is object");
                var status = SetIntegrityLevel(O, "frozen");
                if ((status = ifAbrupt(status)) && isAbrupt(status)) return status;
                if (status === false) return withError("Type", "freeze: can not freeze object");
                return O;
            }
        ));

        LazyDefineProperty(ObjectConstructor, "getOwnPropertyDescriptor", CreateBuiltinFunction(getRealm(),
            function (thisArg, argList) {
                var O = argList[0];
                var P = argList[1];
                var obj = ToObject(O);
                if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
                var key = ToPropertyKey(P);
                var desc = GetOwnProperty(obj, key);
                if ((desc = ifAbrupt(desc)) && isAbrupt(desc)) return desc;
                return FromPropertyDescriptor(desc);
            }));

        LazyDefineProperty(ObjectConstructor, "getOwnPropertyNames", CreateBuiltinFunction(getRealm(),
            function (thisArg, argList) {
                var O = argList[0];
                return GetOwnPropertyKeys(O, "string");
            }));

        function GetOwnPropertyKeys(O, type) {
            var obj = ToObject(O);
            if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
            var keys = OwnPropertyKeys(O);
            if ((keys = ifAbrupt(keys)) && isAbrupt(keys)) return keys;
            var nameList = [];
            var gotAllNames = false;
            var next, nextKey;
            while (!gotAllNames) {
                next = IteratorStep(keys);
                if ((next = ifAbrupt(next)) && isAbrupt(next)) return next;
                if (!next) gotAllNames = true;
                else {
                    nextKey = IteratorValue(next);
                    if ((nextKey = ifAbrupt(nextKey)) && isAbrupt(nextKey)) return nextKey;
                    if (Type(nextKey) === type)
                        nameList.push(nextKey);
                }
            }
            return CreateArrayFromList(nameList);
        }

        LazyDefineProperty(ObjectConstructor, "getOwnPropertySymbols", CreateBuiltinFunction(getRealm(),
            function (thisArg, argList) {
                var O = argList[0];
                return GetOwnPropertyKeys(O, "symbol");
            }));

        LazyDefineProperty(ObjectConstructor, "getPrototypeOf", CreateBuiltinFunction(getRealm(),
            function (thisArg, argList) {
                var O = argList[0];
                var obj = ToObject(O);
                if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
                return GetPrototypeOf(obj);
            }));

        LazyDefineProperty(ObjectConstructor, "is", CreateBuiltinFunction(getRealm(),
            function (thisArg, argList) {
                var value1 = argList[0];
                var value2 = argList[1];
                return SameValue(value1, value2);
            }));

        LazyDefineProperty(ObjectConstructor, "isExtensible", CreateBuiltinFunction(getRealm(),
            function (thisArg, argList) {
                var O = argList[0];
                if (Type(O) !== "object") return false;
                return IsExtensible(O);
            }
        ));

        LazyDefineProperty(ObjectConstructor, "isSealed", CreateBuiltinFunction(getRealm(),
            function (thisArg, argList) {
                var O = argList[0];
                if (Type(O) !== "object") return true;
                return TestIntegrityLevel(O, "sealed");
            }
        ));

        LazyDefineProperty(ObjectConstructor, "isFrozen", CreateBuiltinFunction(getRealm(),
            function (thisArg, argList) {
                var O = argList[0];
                if (Type(O) !== "object") return true;
                return TestIntegrityLevel(O, "frozen");
            }
        ));


        var ObjectConstructor_preventExtensions = function (thisArg, argList) {
            var O = argList[0];
            if (Type(O) !== "object") return withError("Type", "argument is not an object");
            var status = PreventExtensions(O);
            if ((status = ifAbrupt(status)) && isAbrupt(status)) return status;
            if (status === false) return withError("Type", "can not prevent extensions");
            return O;
        };


        var ObjectConstructor_keys = function (thisArg, argList) {
            var O = argList[0];
            var obj = ToObject(O);
            if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
            var keys = OwnPropertyKeys(O);
            if ((keys = ifAbrupt(keys)) && isAbrupt(keys)) return keys;

            var nameList = [];
            var gotAllNames = false;
            var next, nextKey, desc;
            while (!gotAllNames) {
                next = IteratorNext(keys);
                if ((next = ifAbrupt(next)) && isAbrupt(next)) return next;
                nextKey = IteratorValue(next);
                if ((nextKey = ifAbrupt(nextKey)) && isAbrupt(nextKey)) return nextKey;
                if (Type(nextKey) === "string") {
                    desc = GetOwnProperty(O, nextKey);
                    if ((desc = ifAbrupt(desc)) && isAbrupt(desc)) return desc;
                    if (desc !== undefined && desc.enumerable === true) {
                        nameList.push(nextKey);
                    }
                }

                if (IteratorComplete(next)) gotAllNames = true;
            }
            return CreateArrayFromList(nameList);
        };

        var ObjectConstructor_mixin = function (thisArg, argList) {
            var target = argList[0];
            var source = argList[1];
            var to = ToObject(target);
            if ((to = ifAbrupt(to)) && isAbrupt(to)) return to;
            var from = ToObject(source);
            if ((from = ifAbrupt(from)) && isAbrupt(from)) return from;
            return MixinProperties(to, from);
        };

        LazyDefineBuiltinFunction(ObjectConstructor, "preventExtensions", 1, ObjectConstructor_preventExtensions);
        LazyDefineBuiltinFunction(ObjectConstructor, "keys", 1, ObjectConstructor_keys);
        LazyDefineBuiltinFunction(ObjectConstructor, "mixin", 2, ObjectConstructor_mixin);


        function MixinProperties(target, source) {
            Assert(Type(target) === "object");
            Assert(Type(source) === "object");
            var keys = OwnPropertyKeys(source);
            if ((keys = ifAbrup(keys)) && isAbrupt(keys)) return keys;
            var gotAllNames = false;
            var pendingException = undefined;
            var next, nextKey, desc, propValue, newFunc;
            var pendingException, getter, setter;
            while (!gotAllNames) {
                next = IteratorStep(next);
                if ((next = ifAbrupt(next)) && isAbrupt(next)) return next;
                //    if ((=ifAbrupt()) && isAbrupt()) return ;
                if (!next) gotAllNames = true;
                else {
                    nextKey = IteratorValue(next);
                    if ((nextKey = ifAbrupt(nextKey)) && isAbrupt(nextKey)) return nextKey;
                    var desc = GetOwnProperty(source, nextKey);
                    if (isAbrupt(desc)) pendingException = desc;
                    else if (desc !== undefined && desc.enumerable === true) {
                        // possibly neccessary (if desc isnt fresh)
                        // desc = assign({}, desc);
                        if (IsDataDescriptor(desc)) {
                            propValue = desc.Value;
                            if (SameValue(GetSuperBinding(propValue), source)) {
                                newFunc = MixinProperties(RebindSuper(propValue, target), propValue);
                                if (isAbrupt(newFunc)) pendingException = newFunc;
                                else desc.Value = newFunc;
                            }
                        } else {
                            getter = desc.get;
                            if (SameValue(GetSuperBinding(getter), source)) {
                                newFunc = MixinProperties(RebindSuper(propValue, target), getter);
                                if (isAbrupt(newFunc)) pendingException = newFunc;
                                else desc.get = newFunc;
                            }
                            setter = desc.set;
                            if (SameValue(GetSuperBinding(setter), source)) {
                                newFunc = MixinProperties(RebindSuper(propValue, target), setter);
                                if (isAbrupt(newFunc)) pendingException = newFunc;
                                else desc.set = newFunc;
                            }
                        }
                        status = DefineOwnPropertyOrThrow(target, nextKey, desc);
                        if (isAbrupt(status)) pendingException = status;
                    }
                }
            }
            if (pendingException) return pendingException;
            return target;
        }


        // ===========================================================================================================
        // ObjectPrototype
        // ===========================================================================================================

        MakeConstructor(ObjectConstructor, true, ObjectPrototype);
        setInternalSlot(ObjectPrototype, "Prototype", null);

        var ObjectPrototype_$$create = function (thisArg, argList) {
            var F = thisArg;
            var proto = GetPrototypeFromConstructor(F, "%ObjectPrototype%");
            if ((proto = ifAbrupt(proto)) && isAbrupt(proto)) return proto;
            return ObjectCreate(proto);
        };

        var ObjectPrototype_hasOwnProperty = function (thisArg, argList) {
            var P = ToPropertyKey(argList[0]);
            if ((P = ifAbrupt(P)) && isAbrupt(P)) return P;
            var O = ToObject(thisArg);
            if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
            return HasOwnProperty(O, P);
        };
        
        var ObjectPrototype_isPrototypeOf = function (thisArg, argList) {
            var V = argList[0];
            if (Type(O) !== "object") return false;
            var O = ToObject(thisArg);
            if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
            for (;;) {
                V = GetPrototypeOf(V);
                if (V == null) return false;
                if (SameValue(O, V)) return true;
            }
            return false;
        };


            var ObjectPrototype_propertyIsEnumerable = function (thisArg, argList) {
                var V = argList[0];
                var P = ToString(V);
                if ((P = ifAbrupt(P)) && isAbrupt(P)) return P;
                var O = ToObject(thisArg);
                if ((O = ifAbrupt(O)) && isAbrupt(O)) return O;
                var desc = GetOwnProperty(O, P);
                if (desc === undefined) return false;
                return desc.enumerable;
            };

        var OneOfTheseTags = {
            __proto__: null,
            "Arguments": true,
            "Array": true,
            "Boolean": true,
            "Date": true,
            "Error": true,
            "Function": true,
            "JSON": true,
            "Math": true,
            "Number": true,
            "RegExp": true,
            "String": true
        };

        var builtinTagsByToString = {
            "[object ArrayExoticObject]": "Array",
            "[object ProxyExoticObject]": "Proxy",
            "[object ArgumentsExoticObject]": "Arguments",
            "[object OrdinaryFunction]": "Function",
            "[object StringExoticObject]": "String",
        };


            var ObjectPrototype_toString = function toString(thisArg, argList) {
                var i = 0;
                if (thisArg === undefined) return "[object Undefined]";
                if (thisArg === null) return "[object Null]";

                var O = ToObject(thisArg);
                var builtinTag, tag;

                var intrToStr = O.toString();

                if (builtinTag = builtinTagsByToString[intrToStr]) {} else if (hasInternalSlot(O, "SymbolData")) builtinTag = "Symbol";
                else if (hasInternalSlot(O, "StringData")) builtinTag = "String";
                else if (hasInternalSlot(O, "ErrorData")) builtinTag = "Error";
                else if (hasInternalSlot(O, "BooleanData")) builtinTag = "Boolean";
                else if (hasInternalSlot(O, "NumberData")) builtinTag = "Number";
                else if (hasInternalSlot(O, "DateValue")) builtinTag = "Date";
                else if (hasInternalSlot(O, "RegExpMatcher")) builtinTag = "RegExp";
                else if (hasInternalSlot(O, "MathTag")) builtinTag = "Math";
                else if (hasInternalSlot(O, "JSONTag")) builtinTag = "JSON";
                else builtinTag = "Object";

                var hasTag = HasProperty(O, $$toStringTag);
                if ((hasTag = ifAbrupt(hasTag)) && isAbrupt(hasTag)) return hasTag;
                if (!hasTag) tag = builtinTag;
                else {
                    tag = Get(O, $$toStringTag);
                    if (isAbrupt(tag)) tag = NormalCompletion("???");
                    tag = unwrap(tag);
                    if (Type(tag) !== "string") tag = "???";
                    if (OneOfTheseTags[tag] && (!SameValue(tag, builtinTag))) tag = "~" + tag;
                }

                return "[object " + tag + "]";
            };
        
            var ObjectPrototype_valueOf = function valueOf(thisArg, argList) {
                var O = ToObject(thisArg);
                return O;
            };

        // B.2.2.1  Object.prototype.__proto__

            var ObjectPrototype_get_proto = function (thisArg, argList) {
                var O = ToObject(thisArg);
                if ((O=ifAbrupt(O)) && isAbrupt(O)) return O;
                return callInternalSlot("GetPrototypeOf", O);
            };
            var ObjectPrototype_set_proto = function (thisArg, argList) {
                var proto = argList[0];
                var O = CheckObjectCoercible(thisArg);
                if ((O=ifAbrupt(O)) && isAbrupt(O)) return O;
                var protoType = Type(proto);
                if (protoType !== "object" && protoType !== null) return proto;
                if (Type(O) !== "object") return proto;
                var status = callInternalSlot("SetPrototypeOf", O, proto);
                if ((status=ifAbrupt(status)) && isAbrupt(status)) return status;
                if (status === false) return withError("Type", "__proto__: SetPrototypeOf failed.");
                return proto;
            };
            var ObjectPrototype_proto_ = {
                __proto__:null,
                configurable: true,
                enumerable: false,
                get: CreateBuiltinFunction(getRealm(),ObjectPrototype_get_proto, "get __proto__", 0),
                set: CreateBuiltinFunction(getRealm(),ObjectPrototype_set_proto, "set __proto___", 0)
            };
            DefineOwnProperty(ObjectPrototype, "__proto__", ObjectPrototype_proto_)


        LazyDefineBuiltinFunction(ObjectPrototype, $$create, 0, ObjectPrototype_propertyIsEnumerable);
        LazyDefineBuiltinFunction(ObjectPrototype, "hasOwnProperty", 0, ObjectPrototype_hasOwnProperty);
        LazyDefineBuiltinFunction(ObjectPrototype, "isPrototypeOf", 0, ObjectPrototype_isPrototypeOf);
        LazyDefineBuiltinFunction(ObjectPrototype, "propertyIsEnumerable", 0, ObjectPrototype_propertyIsEnumerable);
        LazyDefineBuiltinFunction(ObjectPrototype, "toString", 0, ObjectPrototype_toString);
        LazyDefineBuiltinFunction(ObjectPrototype, "valueOf", 0, ObjectPrototype_valueOf);
        LazyDefineProperty(ObjectPrototype, $$toStringTag, "Object");

        // ===========================================================================================================
        // Object.observe
        // ===========================================================================================================

        // Object.observe 
        // http://wiki.ecmascript.org/doku.php?id=harmony:observe
        // var NotifierPrototype is defined with all other intrinsics above

        DefineOwnProperty(NotifierPrototype, "notify", {
            value: CreateBuiltinFunction(getRealm(),function notify(thisArg, argList) {
                var changeRecord = argList[0];
                var notifier = thisArg;
                if (Type(notifier) !== "object") return withError("Type", "Notifier is not an object.");
                var target = getInternalSlot(notifier, "Target");
                var newRecord = ObjectCreate();
                var status = callInternalSlot("DefineOwnProperty", newRecord, "object", {
                    value: target,
                    writable: false,
                    enumerable: true,
                    configurable: false
                });
                //if (isAbrupt(status)) return status;

                var bindings = getInternalSlot(changeRecord, "Bindings");
                var value;
                for (var N in bindings) {
                    if (Object.hasOwnProperty.call(bindings, N)) {
                        if (N !== "object") {
                            value = callInternalSlot("Get", changeRecord, N, changeRecord);
                            if ((value = ifAbrupt(value)) && isAbrupt(value)) return value;
                            status = callInternalSlot("DefineOwnProperty", newRecord, N, {
                                value: value,
                                writable: false,
                                enumerable: true,
                                configurable: false
                            });
                            //if (isAbrupt(status)) return status;
                        }

                    }
                }
                setInternalSlot(newRecord, "Extensible", false);
                status = EnqueueChangeRecord(target, newRecord);
                //if (isAbrupt(status)) return status;
                return NormalCompletion();
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(NotifierPrototype, "performChange", {
            value: CreateBuiltinFunction(getRealm(),function notify(thisArg, argList) {
                var changeType = argList[0];
                var changeFn = argList[1];
                var notifier = thisArg;
                var status;
                if (Type(notifier) !== "object") return withError("Type", "notifier is not an object");
                var target = getInternalSlot(notifier, "Target");
                if (target === undefined) return NormalCompletion(undefined);
                if (Type(changeType) !== "string") return withError("Type", "changeType has to be a string");
                if (!IsCallable(changeFn)) return withError("Type", "changeFn is not a callable");
                status = BeginChange(target, changeType);
                var changeRecord = callInternalSlot("Call", changeFn, undefined, []);
                status = EndChange(target, changeType);
                var changeObservers = getInternalSlot(notifier, "ChangeObservers");
                if (!changeObservers.length) return NormalCompletion();
                var newRecord = ObjectCreate();
                status = callInternalSlot("DefineOwnProperty", newRecord, "object", {
                    value: target,
                    writable: false,
                    enumerable: true,
                    configurable: false
                });
                status = callInternalSlot("DefineOwnProperty", newRecord, "type", {
                    value: changeType,
                    writable: false,
                    enumerable: true,
                    configurable: false
                });
                var bindings = getInternalSlot(changeRecord, "Bindings");
                var value;
                for (var N in bindings) {
                    if (Object.hasOwnProperty.call(bindings, N)) {
                        if (N !== "object" && N !== "type") {
                            value = callInternalSlot("Get", changeRecord, N, changeRecord);
                            if ((value = ifAbrupt(value)) && isAbrupt(value)) return value;
                            status = callInternalSlot("DefineOwnProperty", newRecord, N, {
                                value: value,
                                writable: false,
                                enumerable: true,
                                configurable: false
                            });
                            //if (isAbrupt(status)) return status;
                        }
                    }
                }
                setInternalSlot(newRecord, "Extensible", false);
                status = EnqueueChangeRecord(target, newRecord);
                return NormalCompletion(undefined);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        function GetNotifier(O) {
            var proto;
            var notifier = getInternalSlot(O, "Notifier");
            if (notifier === undefined) {
                proto = Get(getIntrinsics(), "NotifierPrototype%")
                notifier = ObjectCreate(proto);
                setInternalSlot(notifier, "Target", O);
                setInternalSlot(notifier, "ChangeObservers", []);
                setInternalSlot(notifier, "ActiveChanges", ObjectCreate(null));
                setInternalSlot(O, "Notifier", notifier);
            }
            return notifier;
        }

        function BeginChange(O, changeType) {
            var notifier = GetNotifier(O);
            var activeChanges = getInternalSlot(notifier, "ActiveChanges");
            var changeCount = Get(activeChanges, changeType);
            if (changeCount === undefined) changeCount = 1;
            else changeCount = changeCount + 1;
            CreateDataProperty(activeChanges, changeType, changeCount);
        }

        function EndChange(O, changeType) {
            var notifier = GetNotifier(O);
            var activeChanges = getInternalSlot(notifier, "ActiveChanges");
            var changeCount = Get(activeChanges, changeType);
            Assert(changeCount > 0, "changeCount has to be bigger than 0");
            changeCount = changeCount - 1;
            CreateDataProperty(activeChanges, changeType, changeCount);
        }

        function ShouldDeliverToObserver(activeChanges, acceptList, changeType) {
            var doesAccept = false;
            for (var i = 0, j = acceptList.length; i < j; i++) {
                var accept = acceptList[i];
                if (activeChanges[accept] > 0) return false;
                if (accept === changeType) doesAccept = true;
            }
            return doesAccept;
        }

        function EnqueueChangeRecord(O, changeRecord) {
            var notifier = GetNotifier(O);
            var changeType = Get(changeRecord, "type");
            var activeChanges = getInternalSlot(notifier, "ActiveChanges");
            var changeObservers = getInternalSlot(notifier, "ChangeObservers");
            var observerRecord;
            for (var i = 0, j = changeObservers.length; i < j; i++) {
                if (observerRecord = changeObservers[i]) {
                    var acceptList = Get(oserverRecord, "accept");
                    var deliver = ShouldDeliverToObserver(activeChanges, acceptList, changeType);
                    if (deliver === false) continue;
                    var observer = Get(observerRecord, "callback");
                    var pendingRecords = getInternalSlot(observer, "PendingChangeRecords");
                    pendingRecords.push(changeRecord);
                }
            }
        }

        function DeliverChangeRecords(C) {
            var changeRecords = getInternalSlot(C, "PendingChangeRecords");
            setInternalSlot(C, "PendingChangeRecords", []);
            var array = ArrayCreate(0);
            var n = 0;
            var status;
            var record;
            for (var i = 0, j = changeRecords.length; i < j; i++) {
                if (record = changeRecords[i]) {
                    status = callInternalSlot("DefineOwnProperty", array, ToString(n), {
                        value: record,
                        writable: true,
                        enumerable: true,
                        configurable: true
                    });
                    n = n + 1;
                }
            }
            if (Get(array, "length") === 0) return false;
            callInternalSlot("Call", C, undefined, [array]);
            return true;
        }

        function DeliverAllChangeRecords() {
            var observers = ObserverCallbacks;
            var anyWorkDone = false;
            var observer;
            for (var i = 0, j = observers.length; i < j; i++) {
                if (observer = observers[i]) {
                    var result = DeliverChangeRecords(observer);
                    if (result === true) anyWorkDone = true;
                }
            }
            return anyWorkDone;
        }

        function CreateChangeRecord(type, object, name, oldDesc, newDesc) {
            var changeRecord = ObjectCreate();
            var status;
            status = callInternalSlot("DefineOwnProperty", changeRecord, "type", {
                value: type,
                writable: false,
                enumerable: true,
                configurable: false
            });
            status = callInternalSlot("DefineOwnProperty", changeRecord, "object", {
                value: object,
                writable: false,
                enumerable: true,
                configurable: false
            });
            if (Type(name) === "string") {
                status = callInternalSlot("DefineOwnProperty", changeRecord, "name", {
                    value: name,
                    writable: false,
                    enumerable: true,
                    configurable: false
                });
            }
            if (IsDataDescriptor(oldDesc)) {
                if (!IsDataDescriptor(newDesc) || !SameValue(oldDesc.value, newDesc.value)) {
                    status = callInternalSlot("DefineOwnProperty", changeRecord, "oldValue", {
                        value: oldDesc,
                        writable: false,
                        enumerable: true,
                        configurable: false
                    });
                }
            }
            setInternalSlot(changeRecord, "Extensible", false);
            return changeRecord;
        }

        function CreateSpliceChanceRecord(object, index, removed, addedCount) {
            var changeRecord = ObjectCreate();
            var status = callInternalSlot("DefineOwnProperty", changeRecord, "type", {
                value: "splice",
                writable: false,
                enumerable: true,
                configurable: false
            });
            status = callInternalSlot("DefineOwnProperty", changeRecord, "object", {
                value: object,
                writable: false,
                enumerable: true,
                configurable: false
            });
            status = callInternalSlot("DefineOwnProperty", changeRecord, "index", {
                value: index,
                writable: false,
                enumerable: true,
                configurable: false
            });
            status = callInternalSlot("DefineOwnProperty", changeRecord, "removed", {
                value: removed,
                writable: false,
                enumerable: true,
                configurable: false
            });
            status = callInternalSlot("DefineOwnProperty", changeRecord, "addedCount", {
                value: addedCount,
                writable: false,
                enumerable: true,
                configurable: false
            });
        }

        DefineOwnProperty(ObjectConstructor, "observe", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var O = argList[0];
                var callback = argList[1];
                var accept = argList[2];
                if (Type(O) !== "object") return withError("Type", "first argument is not an object");
                if (!IsCallable(callback)) return withError("Type", "second argument is not callable");
                if (TestIntegrityLevel(callback, "frozen")) return withError("Type", "second argument is frozen");
                if (accept === undefined) {
                    accept = ["add", "updata", "delete", "reconfigure", "setPrototype", "preventExtensions"];
                } else {
                    accept = CreateListFromArray(accept);
                    var notifier = GetNotifier(O);
                    var changeObservers = getInternalSlot(notifier, "ChangeObservers");
                    var observer;
                    for (var i = 0, j = changeObservers.length; i < j; i++) {
                        if (observer = changeObservers[i]) {
                            if (Get(observer, "callback") === callback) {
                                CreateDataProperty(record, "accept", acceptList);
                                return NormalCompletion(O);
                            }
                        }
                    }
                    var observerRecord = ObjectCreate();
                    CreateDataProperty(observerRecord, "callback", callback);
                    CreateDataProperty(observerRecord, "accept", acceptList);
                    changeObservers.push(observerRecord);
                    var observerCallbacks = ObserverCallbacks;
                    if (observerCallbacks.indexOf(callback)) return NormalCompletion(O);
                    observerCallbacks.push(calllback);
                    return NormalCompletion(O);
                }
            }),
            writable: true,
            enumerable: true,
            configurable: true
        });

        DefineOwnProperty(ObjectConstructor, "unobserve", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var O = argList[0];
                var callback = argList[1];
                if (Type(O) !== "object") return withError("Type", "first argument is not an object");
                if (!IsCallable(callback)) return withError("Type", "second argument is not callable");
                var notifier = GetNotifier(O);
                var changeObservers = getInternalSlot(notifier, "ChangeObservers");
                changeObservers = changeObservers.filter(function (r) {
                    return (Get(r, "callback") !== callback);
                });
                return NormalCompletion(O);
            }),
            writable: true,
            enumerable: true,
            configurable: true
        });

        DefineOwnProperty(ObjectConstructor, "deliverChangeRecords", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var callback = argList[0];
                if (!IsCallable(callback)) return withError("Type", "first argument is not callable.");
                var status;
                for (;;) {
                    status = DeliverChangeRecords(callback);
                    if (status === false || isAbrupt(status)) break;
                }
                if (isAbrupt(status)) return status;
                return NormalCompletion(undefined);
            }),
            writable: true,
            enumerable: true,
            configurable: true
        });

        DefineOwnProperty(ObjectConstructor, "getNotifier", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var O = argList[0];
                if (Type(O) !== "object") return withError("Type", "first argument is not an object");
                if (TestIntegrityLevel(O, "frozen")) return NormalCompletion(null);
                return GetNotifier(O);
            }),
            writable: true,
            enumerable: true,
            configurable: true
        });

        // ==========================rc=================================================================================
        // Function
        // ===========================================================================================================

        //	
        // Function
        //

        MakeConstructor(FunctionConstructor, true, FunctionPrototype);
        setInternalSlot(FunctionPrototype, "Prototype", ObjectPrototype);
        LazyDefineProperty(FunctionPrototype, $$toStringTag, "Function");

        LazyDefineProperty(FunctionPrototype, "valueOf", CreateBuiltinFunction(getRealm(),function valueOf(thisArg, argList) {
            return thisArg;
        }));

        setInternalSlot(FunctionConstructor, "Call", function (thisArg, argList) {

            var argCount = argList.length;
            var P = "";
            var bodyText;
            var firstArg, nextArg;

            if (argCount === 0) bodyText = "";
            else if (argCount === 1) bodyText = argList[0];
            else if (argCount > 1) {
                firstArg = argList[0];
                P = ToString(firstArg);
                if ((firstArg = ifAbrupt(firstArg)) && isAbrupt(firstArg)) return firstArg;
                var k = 1;
                while (k < argCount - 1) {
                    nextArg = argList[k];
                    nextArg = ToString(nextArg);
                    if ((nextArg = ifAbrupt(nextArg)) && isAbrupt(nextArg)) return nextArg;
                    P = P + "," + nextArg;
                    k += 1;
                }
                bodyText = argList[argCount - 1];
            }

            bodyText = ToString(bodyText);
            if ((bodyText = ifAbrupt(bodyText)) && isAbrupt(bodyText)) return bodyText;
            var parameters = parseGoal("FormalParameterList", P); // () sind fehlerhaft bei
            var funcBody = parseGoal("FunctionBody", bodyText);

            //if (Contains(funcBody, "YieldExpression")) return withError("Syntax", "regular function may not contain a yield expression");

            var boundNames = BoundNames(parameters);

            if (!IsSimpleParameterList(parameters)) {
                if (dupesInTheTwoLists(boundNames, VarDeclaredNames(funcBody))) return withError("Syntax", "Duplicate Identifier in Parameters and VarDeclaredNames of funcBody");
            }
            if (dupesInTheTwoLists(boundNames, LexicallyDeclaredNames(funcBody))) return withError("Syntax", "Duplicate Identifier in Parameters and LexicallyDeclaredNames of funcBody");

            var scope = getRealm().globalEnv;
            var F = thisArg;
            if (F == undefined || !hasInternalSlot(F, "Code")) {
                var FunctionPrototype = getIntrinsic("%FunctionPrototype%");
                F = FunctionAllocate(FunctionPrototype);
            }

            if (getInternalSlot(F, "FunctionKind") !== "normal") return withError("Type", "function object not a 'normal' function");

            FunctionInitialise(F, "normal", parameters, funcBody, scope, true);
            var proto = ObjectCreate();
            MakeConstructor(F);
            return NormalCompletion(F);

        });

        setInternalSlot(FunctionConstructor, "Construct", function (argList) {
            var F = this;
            return OrdinaryConstruct(F, argList);
        });

        DefineOwnProperty(FunctionConstructor, $$create, {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var F = thisArg;
                var proto = GetPrototypeFromConstructor(F, "%FunctionPrototype%");
                if ((proto = ifAbrupt(proto)) && isAbrupt(proto)) return proto;
                var obj = FunctionAllocate(proto);
                return obj;
            }),
            enumerable: false,
            writable: false,
            configurable: true
        });

        LazyDefineProperty(FunctionPrototype, $$create, CreateBuiltinFunction(getRealm(),function $$create(thisArg, argList) {
            var F = thisArg;
            return OrdinaryCreateFromConstructor(F, "%ObjectPrototype%");
        }));

        DefineOwnProperty(FunctionPrototype, "constructor", {
            value: FunctionConstructor,
            enumerable: false,
            configurable: true,
            writable: true
        });

        // ===
        // Function.prototype.toString uses codegen module ===>>> var codegen = require("lib/js-codegen");
        // ====

        CreateDataProperty(FunctionPrototype, "toString", CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
            var codegen = require("lib/js-codegen");
            var F = thisArg;
            if (!IsCallable(F)) return withError("Type", "Function.prototype.toString only applies to functions!");
            var name = Get(F, "name") || "(anonymous)";
            var P, C;
            P = getInternalSlot(F, "FormalParameters");
            C = getInternalSlot(F, "Code");
            var kind = getInternalSlot(F, "FunctionKind");
            var star = kind === "generator" ? "*" : "";
            var callfn;
            if (!C && (callfn=getInternalSlot(F, "Call"))) {
                var code = "// [[Builtin Function native JavaScript Code]]\r\n";
                // createbuiltin wraps the builtin
                if (callfn.steps) callfn = callfn.steps; 
                // setinternalslot call has no wrapper
                // this requires a double check here

                code += callfn.toString(); 
                return code;
            }
            var paramString, bodyString;
            var p, c, t;
            paramString = codegen.builder.formalParameters(P);
            if (kind === "arrow") {
                if (Array.isArray(C)) {
                    bodyString = codegen.builder.functionBody(C);
                } else bodyString = codegen.callBuilder(C);
                return paramString + " => " + bodyString;
            } else {
                bodyString = codegen.builder.functionBody(C);
                return "function" + star + " " + name + " " + paramString + " " + bodyString;
            }
        }));


        DefineOwnProperty(FunctionPrototype, "apply", {
            value: CreateBuiltinFunction(getRealm(),function apply(thisArg, argList) {
                var func = thisArg;
                if (!IsCallable(func)) return withError("Type", "fproto.apply: func is not callable");
                var T;
                if (T !== undefined && T !== null) T = ToObject(argList[0]);
                else T = argList[0];
                var argArray = argList[1] || ArrayCreate(0);
                var argList2 = CreateListFromArrayLike(argArray);
                if ((argList2 = ifAbrupt(argList2)) && isAbrupt(argList2)) return argList2;
                return callInternalSlot("Call", func, T, argList2);
            }),
            enumerable: false,
            configurable: true,
            writable: true
        });
        DefineOwnProperty(FunctionPrototype, "bind", {
            value: CreateBuiltinFunction(getRealm(),function bind(thisArg, argList) {
                var boundTarget = thisArg;
                var thisArgument = argList[0];
                var listOfArguments = argList.slice(1, argList.length - 1);
                return BoundFunctionCreate(boundTarget, thisArgument, listOfArguments);
            }),
            writable: true,
            enumerable: false,
            configurable: true
            
        });
        DefineOwnProperty(FunctionPrototype, "call", {
            value: CreateBuiltinFunction(getRealm(),function call(thisArg, argList) {
                var func = thisArg;
                if (!IsCallable(func)) return withError("Type", "fproto.call: func is not callable");
                var T = ToObject(argList[0]);
                var args = argList.slice(1);
                return callInternalSlot("Call", func, T, args);
            }),
            writable: true,
            enumerable: false,
            configurable: true
        });
        DefineOwnProperty(FunctionPrototype, $$hasInstance, {
            value: CreateBuiltinFunction(getRealm(),function $$hasInstance(thisArg, argList) {
                var V = argList[0];
                var F = thisArg;
                return OrdinaryHasInstance(F, V);
            }, 1, "[Symbol.hasInstance]"),
            writable: true,
            enumerable: false,
            configurable: true

        });

        var FunctionPrototype_toMethod = function (thisArg, argList) {
            var superBinding = argList[0];
            var methodName = argList[1];
            if (!IsCallable(thisArg)) return withError("Type", "this value is not callable");
            if (Type(superBinding) !== "object") return withError("Type", "superBinding is not an object");
            if (methodName !== undefined) {
                methodName = ToPropertyKey(methodName);
                if ((methodName = ifAbrupt(methodName)) && isAbrupt(methodName)) return methodName;
            }
            return CloneMethod(thisArg, superBinding, methodName)
        };

        LazyDefineBuiltinFunction(FunctionPrototype, "toMethod", 1, FunctionPrototype_toMethod /*, realm  !!!*/);

        // ===========================================================================================================
        // Generator Prototype and Function
        // ===========================================================================================================

        LazyDefineProperty(GeneratorPrototype, $$iterator, CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
            return thisArg;
        }));

        LazyDefineProperty(GeneratorPrototype, $$toStringTag, "Generator");

        // GeneratorFunction.[[Prototype]] = FunctionPrototype
        setInternalSlot(GeneratorFunction, "Prototype", FunctionConstructor);


        // GeneratorFunction.prototype = %Generator%
        MakeConstructor(GeneratorFunction, true, GeneratorObject);
        DefineOwnProperty(GeneratorFunction, "prototype", {
            value: GeneratorObject,
            enumerable: false
        });

        // GeneratorFunction.prototype.constructor = GeneratorFunction
        LazyDefineProperty(GeneratorObject, "constructor", GeneratorFunction);

        // GeneratorFunction.prototype.prototype = GeneratorPrototype
        setInternalSlot(GeneratorObject, "Prototype", GeneratorPrototype);

        LazyDefineProperty(GeneratorObject, "prototype", GeneratorPrototype);
        //    LazyDefineProperty(GeneratorPrototype, "constructor", GeneratorObject);

        LazyDefineProperty(GeneratorPrototype, "next", CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
            var value = argList[0];
            var G = thisArg;
            return GeneratorResume(G, value);
        }));

        LazyDefineProperty(GeneratorPrototype, "throw", CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
            var g = thisArg;
            var exception = argList[0];
            if (Type(g) !== "object") return withError("Type", "throw: Generator is not an object");
            if (!hasInternalSlot(g, "GeneratorState")) return withError("Type", "throw: generator has no GeneratorState property");
            var state = getInternalSlot(g, "GeneratorState");
            Assert(hasInternalSlot(g, "GeneratorContext"), "generator has to have a GeneratorContext property");
            if (state !== "suspendedStart" && state != "suspendedYield") return withError("Type", "GeneratorState is neither suspendedStart nor -Yield");
            var E = new CompletionRecord("throw", exception);
            if (state === "suspendedStart") {
                setInternalSlot(g, "GeneratorState", "completed");
                setInternalSlot(g, "GeneratorContext", undefined);
                return E;
            }
            var genContext = getInternalSlot(g, "GeneratorContext");
            var methodContext = getCurrentExectionContext();
            setInternalSlot(g, "GeneratorState", "executing");
            getStack().push(genContext);
            var result = genContext.generatorCallback(E);
            Assert(genContext !== getContext());
            Assert(methodContext === getContext());
            return result;
        }));

        setInternalSlot(GeneratorFunction, "Call", function Call(thisArg, argList) {
            // GeneratorFunction(p1...pn, body)
            var argCount = argList.length;
            var P = "";
            var bodyText;
            var firstArg, nextArg;
            if (argCount === 0) bodyText = "";
            else if (argCount === 1) bodyText = argList[0];
            else if (argCount > 1) {
                firstArg = argList[0];
                P = ToString(firstArg);
                if ((firstArg = ifAbrupt(firstArg)) && isAbrupt(firstArg)) return firstArg;
                var k = 1;
                while (k < argCount - 1) {
                    nextArg = argList[k];
                    nextArg = ToString(nextArg);
                    if ((nextArg = ifAbrupt(nextArg)) && isAbrupt(nextArg)) return nextArg;
                    P = P + "," + nextArg;
                    k += 1;
                }
                bodyText = argList[argCount - 1];
            }

            bodyText = ToString(bodyText);
            if ((bodyText = ifAbrupt(bodyText)) && isAbrupt(bodyText)) return bodyText;
            var parameters = parseGoal("FormalParameterList", P);

            var funcBody = parseGoal("GeneratorBody", bodyText);
            if (!Contains(funcBody, "YieldExpression")) return withError("Syntax", "GeneratorFunctions require some yield expression");
            var boundNames = BoundNames(parameters);

            if (!IsSimpleParameterList(parameters)) {
                if (dupesInTheTwoLists(boundNames, VarDeclaredNames(funcBody))) return withError("Syntax", "Duplicate Identifier in Parameters and VarDeclaredNames of funcBody");
            }
            if (dupesInTheTwoLists(boundNames, LexicallyDeclaredNames(funcBody))) return withError("Syntax", "Duplicate Identifier in Parameters and LexicallyDeclaredNames of funcBody");

            var scope = getRealm().globalEnv;

            var F = thisArg;

            if (F == undefined || !hasInternalSlot(F, "Code")) {
                F = FunctionAllocate(GeneratorFunction, "generator");
            }

            if (getInternalSlot(F, "FunctionKind") !== "generator") return withError("Type", "function object not a generator");
            FunctionInitialise(F, "generator", parameters, funcBody, scope, true);
            var proto = ObjectCreate(GeneratorPrototype);
            MakeConstructor(F, true, proto);
            setFunctionLength(F, ExpectedArgumentCount(F.FormalParameters));
            return NormalCompletion(F);
        });

        setInternalSlot(GeneratorFunction, "Construct", function (argList) {
            var F = GeneratorFunction;
            return OrdinaryConstruct(F, argList);
        });

        LazyDefineProperty(GeneratorFunction, $$create, CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
            var F = thisArg;
            var proto = GetPrototypeFromConstructor(F, "%Generator%");
            if ((proto = ifAbrupt(proto)) && isAbrupt(proto)) return proto;
            var obj = FunctionAllocate(proto, "generator");
            return obj;
        }));

        LazyDefineProperty(GeneratorPrototype, $$create, CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
            var F = thisArg;
            var obj = OrdinaryCreateFromConstructor(F, "%Generator%", {
                GeneratorState: null,
                GeneratorContext: null
            });
            return obj;
        }));

        // ===========================================================================================================
        // JSON
        // ===========================================================================================================

        function Str(key, holder, _state) {
            var replacer = _state.ReplaceFunction;
            var stack = _state.stack;
            var indent = _state.indent;
            var gap = _state.gap;

            var value = Get(holder, key);
            if ((value = ifAbrupt(value)) && isAbrupt(value)) return value;
            if (Type(value) === "object") {
                var toJSON = Get(value, "toJSON");
                if (IsCallable(toJSON)) {
                    value = callInternalSlot("Call", toJSON, value, [key]);
                }
            }
            if (IsCallable(replacer)) {
                value = callInternalSlot("Call", replacer, holder, [key, value]);
            }
            if (Type(value) === "object") {

                if (hasInternalSlot(value, "NumberData")) {
                    value = ToNumber(value);
                } else if (hasInternalSlot(value, "StringData")) {
                    value = ToString(value);
                } else if (hasInternalSlot(value, "BooleanData")) {
                    value = ToBoolean(value);
                }

            }
            if (value === null) return "null";
            if (value === true) return "true";
            if (value === false) return "false";
            if (Type(value) === "string") return Quote(value);
            if (Type(value) === "number") {
                if (value <= Math.pow(2, 53) - 1) return ToString(value);
                else return "null";
            }
            if (Type(value) === "object" && !IsCallable(value)) {
                if (value instanceof ArrayExoticObject) return JA(value, _state);
                else return JO(value, _state);
            }
            return undefined;
        }

        function Quote(value) {
            var ch, la;
            var product = "\"";
            for (var i = 0, j = value.length; i < j; i++) {
                ch = value[i];
                la = value[i + 1];
                if (false) {

                } else {
                    product += ch;
                }
            }
            return product + "\"";
        }

        function JA(value, _state) {
            var replacer = _state.ReplacerFunction;
            var stack = _state.stack;
            var indent = _state.indent;
            var gap = _state.gap;
            var PropertyList = _state.PropertyList;
            if (stack.indexOf(value) > -1) {
                return withError("Type", "Because the structure is cyclical!");
            }

            stack.push(value);
            var stepback = indent;
            var len = Get(value, "length");
            var index = 0;
            var partial = [];

            while (index < len) {
                var strP = Str(ToString(index), value, _state);
                if ((strP = ifAbrupt(strP)) && isAbrupt(strP)) return strP;
                if (strP == undefined) {
                    partial.push("null");
                } else {
                    partial.push(strP);
                }
                index = index + 1;
            }
            var final = "";
            var properties;
            if (!partial.length) {
                final = "{}";
            } else {
                if (gap === "") {
                    properties = partial.join(",");
                    final = "[" + properties + "]";
                } else {
                    var separator = ",\u000A" + indent;
                    properties = partial.join(separator);
                    final = "[\u000A" + indent + properties + "\u000A" + stepback + "]";
                }
            }
            stack.pop();
            _state.indent = stepback;
            return final;
        }

        function JO(value, _state) {
            var replacer = _state.ReplacerFunction;
            var stack = _state.stack;
            var indent = _state.indent;
            var gap = _state.gap;
            var PropertyList = _state.PropertyList;
            if (stack.indexOf(value) > -1) {
                return withError("Type", "Because the structure is cyclical!");
            }

            stack.push(value);
            var stepback = indent;
            var K;

            if (PropertyList && PropertyList.length) {
                K = MakeListIterator(PropertyList);
            } else {
                K = OwnPropertyKeys(value);
            }

            var partial = [];
            var done, nextResult, P;

            while (!done) {
                nextResult = IteratorNext(K);
                if ((nextResult = ifAbrupt(nextResult)) && isAbrupt(nextResult)) return nextResult;
                P = IteratorValue(nextResult);
                if ((P = ifAbrupt(P)) && isAbrupt(P)) return P;
                var strP = Str(P, value, _state);
                if ((strP = ifAbrupt(strP)) && isAbrupt(strP)) return strP;
                if (strP !== undefined) {
                    var member = Quote(P);
                    member = member + ":";
                    if (gap != "") {
                        member = member + " ";
                    }
                    member = member + strP;
                    partial.push(member);
                }
                done = IteratorComplete(nextResult);
            }
            var final = "";
            var properties;
            if (!partial.length) {
                final = "{}";
            } else {
                if (gap === "") {
                    properties = partial.join(",");
                    final = "{" + properties + "}";
                } else {
                    var separator = ",\u000A" + indent;
                    properties = partial.join(separator);
                    final = "{\u000A" + indent + properties + "\u000A" + stepback + "}";
                }
            }
            stack.pop();
            _state.indent = stepback;
            return final;
        }

        function Walk(holder, name) {
            var val = Get(holder, name);
            var done;
            var nextResult;
            var nextValue;
            var status;
            var newElement;
            if ((val = ifAbrupt(val)) && isAbrupt(val)) return val;
            if (Type(val) === "object") {
                if (val instanceof ArrayExoticObject) {
                    var I = 0;
                    var len = Get(val, "length");
                    if ((len = ifAbrupt(len)) && isAbrupt(len)) return len;
                    while (I < len) {
                        newElement = Walk(val, ToString(I));
                        if (newElement === undefined) {
                            status = Delete(val, P);
                        } else {
                            status = val.DefineOwnProperty(ToString(I), {
                                value: newElement,
                                writable: true,
                                enumerable: true,
                                configurable: true
                            });
                        }
                        if ((status = ifAbrupt(status)) && isAbrupt(status)) return status;
                        I = I + 1;
                    }
                } else {
                    var keys = OwnPropertyKeys(val);
                    while (!done) {
                        var nextResult = IteratorNext(keys);
                        if ((nextResult = ifAbrupt(nextResult)) && isAbrupt(nextResult)) return nextResult;
                        var P = IteratorResult(nextResult);
                        newElement = Walk(val, P);
                        if (newElement === undefined) {
                            status = Delete(val, P);
                        } else {
                            status = val.DefineOwnProperty(P, {
                                value: newElement,
                                writable: true,
                                enumerable: true,
                                configurable: true
                            });
                        }
                        if ((status = ifAbrupt(status)) && isAbrupt(status)) return status;
                        done = IteratorComplete(nextResult);
                    }
                }
            }
            return callInternalSlot("Call",reviver, holder, [name, val]);
        }

        DefineOwnProperty(JSONObject, "parse", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var text = GetValue(argList[0]);
                var reviver = argList[1];
                var JText = ToString(text);

                var tree = parseGoal("JSONText", text);

                if ((tree = ifAbrupt(tree)) && isAbrupt(tree)) return tree;

                var scriptText = parseGoal("ParenthesizedExpression", text);
                var exprRef = require("lib/runtime").Evaluate(scriptText);
                if ((exprRef = ifAbrupt(exprRef)) && isAbrupt(exprRef)) return exprRef;

                var unfiltered = GetValue(exprRef);
                if (IsCallable(reviver) === true) {
                    var cx = getContext();
                    var proto = Get(getIntrinsics(), "%ObjectPrototype%");
                    var root = ObjectCreate(proto);
                    CreateDataProperty(root, "", unfiltered);
                    return Walk(root, "");
                }

                return unfiltered;
            }, 2),
            enumerable: false,
            configurable: false,
            writable: false
        });
        DefineOwnProperty(JSONObject, "stringify", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var value = argList[0];
                var replacer = argList[1];
                var space = argList[2];
                var stack = [];
                var indent = "";
                var ReplacerFunction, PropertyList = []; // slow arrays
                var _state = {
                    stack: stack,
                    indent: indent,
                    ReplacerFunction: undefined,
                    PropertyList: undefined
                };
                var gap, i;
                if (Type(replacer) === "object") {
                    if (IsCallable(replacer)) {
                        _state.ReplacerFunction = ReplacerFunction = replacer;
                    } else if (replacer instanceof ArrayExoticObject) {
                        var len = Get(replacer, "length");
                        var item, v;
                        for (i = 0; i < len; i++) {
                            item = undefined;
                            v = Get(replacer, ToString(i));
                            if (Type(v) === "string") item = v;
                            else if (Type(v) === "number") item = ToString(v);
                            else if (Type(v) === "object") {
                                if (hasInternalSlot(v, "NumberData") || hasInternalSlot(v, "StringData")) item = ToString(v);
                                if (item != undefined && PropertyList.indexOf(item) < 0) {
                                    _state.PropertyList = PropertyList
                                    PropertyList.push(item);
                                }
                            }
                        }
                    }
                }
                if (Type(space) === "object") {
                    if (hasInternalSlot(space, "NumberData")) space = ToNumber(space);
                    else if (hasInternalSlot(space, "StringData")) space = ToString(space);
                }
                if (Type(space) === "number") {
                    space = min(10, ToInteger(space));
                    gap = "";
                    for (i = 0; i < space; i++) {
                        gap += " ";
                    }
                } else if (Type(space) === "string") {
                    if (space.length < 11) gap = space;
                    else {
                        for (i = 0; i < 10; i++) {
                            gap += space[i];
                        }
                    }
                } else gap = "";
                var cx = getContext();
                var proto = Get(getIntrinsics(), "%ObjectPrototype%");
                var wrapper = ObjectCreate(proto);
                CreateDataProperty(wrapper, "", value);
                return Str("", wrapper, _state);
            }),
            enumerable: false,
            configurable: false,
            writable: false
        });
        DefineOwnProperty(JSONObject, $$toStringTag, {
            value: "JSON",
            enumerable: false,
            configurable: false,
            writable: false
        });

        setInternalSlot(JSONObject, "Prototype", ObjectPrototype);
        setInternalSlot(JSONObject, "JSONTag", true);

        // ===========================================================================================================
        // Promises
        // ===========================================================================================================

        //
        // Promise
        // http://github.com/domenic/promises-unwrapping
        //


        function makeDeferred(promise, resolve, reject) {
            var deferred = Object.create(null);
                deferred.Promise=promise;
                deferred.Reject=reject;
                deferred.Resolve=resolve;
            return deferred;
        }
        function makePromiseReaction(deferred, handler) {
            var reaction = Object.create(null);
            reaction.Deferred = deferred;
            reaction.Handler = handler;
            return reaction;
        }

        function PromiseReject (promise, reason) {
        }
        function PromiseResolve (promise, resolution) {
        }
        function TriggerPromiseReactions(reactions, argument) {
        }
        function UpdateDeferredFromPotentialThenable (x, deferred) {
        }



        function makeResolutionHandlerFunction () {
            var handler = OrdinaryFunction();
            var handler_Call = function (thisArg, argList) {

            };
            setInternalSlot(handler, "Call", handler_Call);
            return handler;
        }
        
        function makeRejectFunction () {
            var handler = OrdinaryFunction();
            var handler_Call = function (thisArg, argList) {

            };
            setInternalSlot(handler, "Call", handler_Call);
            return handler;
        }

        function makeResolveFunction () {
            var handler = OrdinaryFunction();
            var handler_Call = function (thisArg, argList) {

            };
            setInternalSlot(handler, "Call", handler_Call);
            return handler;
        }


        var Thrower = CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
            var e = argList[0];
            return Completion("throw", e, "");
        }, 1, "thrower");

/*
        function DeferredConstructionFunction (resolve, reject) {
            var F = OrdinaryFunction();
            var DeferredConstructionFunction_Call = function (thisArg, argList) {
                setInternalSlot(F, "Resolve", argList[0]);
                setInternalSlot(F, "Reject", argList[1]);
            }; 
            setInternalSlot(F, "Call", DeferredConstructionFunction_Call);
            return F;
        }
*/
        function DeferredConstructionFunction (F, resolve, reject) {
            setInternalSlot(F, "Resolve", resolve);
            setInternalSlot(F, "Reject", reject);
            return F;
        }



        // if ((value = ifAbrupt(value)) && isAbrupt(value)) return RejectIfAbrupt(value, deferred);
        function RejectIfAbrupt (value, deferred) {
            var rejectResult = callInternalSlot("Call", deferred.Reject, undefined, [value.value]);
            if (isAbrupt(rejectResult)) return rejectResult;
            return deferred.Promise;
        }

        function QueueMicroTask(microTask, argumentsList) {
            setTimeout(function () {
                callInternalSlot("Call", microTask, undefined, argumentsList);
            }, 0)
        }

        function PromiseCreate() {
            var P = ObjectCreate(PromisePrototype, {
                "PromiseStatus": undefined, // unresolved, has-resolution, has-rejection
                "PromiseConstructor": PromiseConstructor,   // cast method checkt
                "Result": undefined,    // wenn das promise resolved wird interessant
                "ResolveReactions": [], // Eine Liste, wenn resolved 
                "RejectReactions" : [], // eine liste mit rejections zum processen
                "toString": function () {
                    return "[object PromiseExoticObject]";
                }
            });
            return P;
        }

        var PromiseConstructor_Call = function (thisArg, argList) {
            var resolver = argList[0];
            var promise = PromiseCreate();
            if (Type(promise) !== "object") return withError("Type", "Promise: thisarg is not an object");
            
            if (getInternalSlot(promise, "PromiseStatus") !== undefined) return withError("Type", "PromiseStatus Property fails");
            if (!IsCallable(resolver)) return withError("Type", "Promise: resolver is not a function");
            
            setInternalSlot(promise, "PromiseStatus", "unresolved");
            setInternalSlot(promise, "ResolveReactions", []);
            setInternalSlot(promise, "RejectReactions", []);

            var resolve = CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var x = argList[0];
                Resolve(promise, x);
            });
            setInternalSlot(resolve, "Promise", promise);
            var reject = CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var x = argList[0];
                Reject(promise, x);
            });
            setInternalSlot(reject, "Promise", promise);

            var e = callInternalSlot("Call", resolver, undefined, [resolve, reject]);
            if (isAbrupt(e)) PromiseReject(promise, e.value);
            return promise;
        };

        var PromiseConstructor_Construct = function (argList) {
            return OrdinaryConstruct(this, argList);
        };


        var PromiseConstructor_$$create = function (thisArg, argList) {
            var p = OrdinaryCreateFromConstructor(thisArg, "%PromisePrototype%", {
                PromiseStatus: undefined,
                PromiseConstructor: undefined,
                Result: undefined,
                ResolveReactions: undefined,
                RejectReactions: undefined
            });
            p.PromiseConstructor = thisArg;
            return p;
        };



        //SetFunctionName(PromiseConstructor, "Promise");
        MakeConstructor(PromiseConstructor, true, PromisePrototype);
        setInternalSlot(PromiseConstructor, "Call", PromiseConstructor_Call);
        setInternalSlot(PromiseConstructor, "Construct", PromiseConstructor_Construct);
        LazyDefineProperty(PromiseConstructor, $$create, CreateBuiltinFunction(getRealm(),PromiseConstructor_$$create, 0, "[Symbol.create]"));



        //
        // Promise
        // http://github.com/domenic/promises-unwrapping
        //

        var ThenableCoercions = {
            keys: [],
            values: [],
            has: function (obj) {
                var keyIndex = this.keys.indexOf(obj);
                return keyIndex > -1;
            },
            get: function (obj) {
                var keyIndex = this.keys.indexOf(obj);
                if (keyIndex > -1) {
                    var item = this.values[keyIndex];
                    return item;
                }
                return undefined;
            },
            set: function (obj, item) {
                var keyIndex = this.keys.indexOf(obj);
                if (keyIndex === -1) {
                    keyIndex = this.keys.length;
                    this.keys.push(obj);
                }
                this.values[keyIndex] = item;
                return undefined;
            },
            toString: function () {
                return "[object SlowLeakMap]";
            }
        };

        function IsPromise(x) {

            if (Type(x) == "object") {
                if (getInternalSlot(x, "PromiseStatus") === undefined) return false;
                return true;
            }
            return false;
        }

        function ToPromise(C, x) {
            var pc = getInternalSlot(x, "PromiseConstructor");
            if (IsPromise(x) && SameValue(pc, C)) return true;
            var deferred = GetDeferred(C);
            callInternalSlot("Resolve", deferred, x);
            return deferred.Promise;
        }

        function Resolve(p, x) {
            if (p.Following || p.Value || p.Reason) return;
            if (IsPromise(x)) {
                if (SameValue(p, x)) {
                    var selfResolutionError = withError("Type", "resolve: self resolution error");
                    SetReason(p, selfResolutionError);
                } else if (x.Following) {
                    p.Following = x.Following;
                    x.Following.Derived.push({
                        DerivedPromise: p,
                        OnFulfilled: undefined,
                        OnRejected: undefined
                    });
                } else if (x.Value) {
                    SetValue(p, x.Value);
                } else if (x.Reason) {
                    SetReason(p, x.Reason);
                } else {
                    p.Following = x;
                    x.Derived.push({
                        DerivedPromise: p,
                        OnFulfilled: undefined,
                        OnRejected: undefined
                    });
                }
            } else {
                SetValue(p, x);
            }
        }

        function Reject(p, r) {
            if (p.Following || p.Value || p.Reason) return;
            SetReason(p, r);
        }

        function Then(p, onFulfilled, onRejected) {
            if (p.Following) return Then(p.Following, onFulfilled, onRejected);
            else {
                var q;
                var C = Get(p, "constructor");
                if ((C = ifAbrupt(C)) && isAbrupt(C)) {
                    q = OrdinaryConstruct(PromiseConstructor, []);
                    Reject(q, C);
                } else {
                    q = (GetDeferred(C)).Promise;
                    var derived = {
                        DerivedPromise: q,
                        onFulfilled: onFulfilled,
                        onRejected: onRejected
                    };
                    UpdateDerivedFromPromise(derived, p);
                }
                return q;
            }
        }

        function PropagateToDerived(p) {

            Assert( !! p.Value == !( !! p.Reason), "there is only one way to resolve or to reject");

            var derived;
            for (var i = 0, j = p.Derived.length; i < j; i++) {
                derived = p.Derived[i];
                UpdateDerived(derived, p);
            }
            p.Derived = [];
        }

        function UpdateDerived(derived, originator) {
            var idx;
            Assert( !! originator.Value == !( !! originator.Reason));
            if (originator.Value) {

                if (Type(originator.Value) === "object") {
                    setTimeout(function () {
                        if (ThenableCoercions.has(originator.Value)) {
                            var coercedAlready = ThenableCoercions.get(originator.Value);
                            UpdateDerivedFromPromise(derived, coercedAlready);
                        } else {
                            var then = Get(originator.Value, "then");
                            if (isAbrupt(then)) {
                                UpdateDerivedFromReason(derived, then);
                            } else if (IsCallable(then)) {
                                var coerced = CoerceThenable(originator.Value, then);
                                UpdateDerivedFromPromise(derived, coerced);
                            } else UpdateDerivedFromValue(derived, originator.Value);
                        }
                    }, 0);
                } else {
                    UpdateDerivedFromValue(derived, originator.Value);
                }
            } else {
                UpdateDerivedFromReason(derived, originator.Reason);
            }
        }

        function UpdateDerivedFromValue(derived, value) {
            if (IsCallable(derived.OnFulfilled)) CallHandler(derived.DerivedPromise, derived.OnFulfilled, value);
            else SetValue(derived.DerivedPromise, value);
        }

        function UpdateDerivedFromReason(derived, reason) {
            if (IsCallable(derived.OnRejected)) CallHandler(derived.DerivedPromise, derived.OnRejected, value);
            else SetReason(derived.DerivedPromise, reason);
        }

        function UpdateDerivedFromPromise(derived, promise) {
            if (promise.Value || promise.Reason) UpdateDerived(derived, promise);
            else promise.Derived.push(derived);
        }

        function CallHandler(derivedPromise, handler, argument) {
            setTimeout(function () {
                var v = handler.Call(undefined, [argument]);
                if (isAbrupt(v)) Reject(derivedPromise, v);
                else Resolve(derivedPromise, v);
            });
        }

        function SetValue(p, value) {
            Assert(!p.Value && !p.Reason);
            p.Value = value;
            p.Following = undefined;
            PropagateToDerived(p);
        }

        function SetReason(p, reason) {
            Assert(!p.Value && !p.Reason);
            p.Reason = reason;
            p.Following = undefined;
            PropagateToDerived(p);
        }

        function CoerceThenable(thenable, then) {
            Assert(Type(thenable) == "object");
            Assert(IsCallable(then));
            // Assert(execution context is empty);
            var p = OrdinaryConstruct(PromiseConstructor, []);

            var resolve = CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var x = argList[0];
                Resolve(p, x);
            });
            var reject = CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var x = argList[0];
                Reject(p, x);
            });

            var e = then.Call(thenable, [resolve, reject]);
            if ((e = ifAbrupt(e)) && isAbrupt(e)) Reject(p, e);
            ThenableCoercions.set(thenable, p);
            return p;
        }

        function GetDeferred(C) {
            var promise;
            if (IsConstructor(C)) {
                var resolver = CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                    var resolve = argList[0];
                    var reject = argList[1];
                    if (resolve) {
                        Resolve(promise, x);
                    } else if (reject) {
                        Reject(promise, x);
                    }
                });
                promise = callInternalSlot("Construct", C, [resolver]);
            } else {
                promise = callInternalSlot("Construct", PromiseConstructor, []);
                var resolve = CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                    var x = argList[0];
                    Resolve(promise, x);
                });
                var reject = CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                    var x = argList[0];
                    Reject(promise, x);
                });
                return {
                    Promise: promise,
                    Resolve: resolve,
                    Reject: reject
                };
            }
        }

        var PromiseConstructor_resolve = function (thisArg, argList) {
                var r = argList[0];
                var deferred = GetDeferred(thisArg);
                deferred.Resolve.Call(undefined, [r]);
                return deferred.Promise;
            };
        var PromiseConstructor_reject = function (thisArg, argList) {
                var r = argList[0];
                var deferred = GetDeferred(thisArg);
                deferred.Reject.Call(undefined, [r]);
                return deferred.Promise;
        };
        var PromiseConstructor_cast = function (thisArg, argList) {
                var x = argList[0];
                return ToPromise(x);
            };
        var PromiseConstructor_race = function (thisArg, argList) {
                var deferred = GetDeferred(thisArg);
                var nextValue;
                var nextPromise;
                var done = false;
                while (!IteratorComplete(iterable)) {
                    nextValue = IteratorValue(IteratorNext(iterable));
                    nextPromise = ToPromise(thisArg, nextValue);
                    Then(nextPromise, deferred.Resolve, deferred.Reject);
                }
                return deferred.Promise;
            };
        var PromiseConstructor_all = function (thisArg, argList) {
            var deferred = GetDeferred(thisArg);
            var values = ArrayCreate(0);
            var countdown = 0;
            var index = 0;
            var onFulfilled;
            while (!IteratorComplete(iterable)) {
                nextValue = IteratorValue(IteratorNext(iterable));
                nextPromise = ToPromise(thisArg, nextValue);
                onFullfilled = CreateBuiltinFunction(getRealm(),
                    (function (index) {
                        return function (thisArg, argList) {
                            values.DefineOwnProperty(index, {
                                value: argList[0],
                                writable: true,
                                enumerable: true
                            });
                            countdown = countdown - 1;
                            if (countdown === 0) {
                                deferred.Resolve.Call(undefined, [values]);
                            }
                        };
                    }(index)));
                Then(nextPromise(onFulfilled, deferred.Reject));
                index = index + 1;
                countdown = countdown + 1;
            }
            if (index === 0) {
                deferred.Resolve.Call(undefined, [values]);
            }
            return deferred.Promise;
        }

        var PromisePrototype_then = function (thisArg, argList) {
            var onFulfilled = argList[0];
            var onRejected = argList[1];
            if (!IsPromise(thisArg)) return withError("Type", "then: this is not a promise object");
            return Then(thisArg, onFulfilled, onRejected);
        };

        var PromisePrototype_catch = function (thisArg, argList) {
            var onRejected = argList[0];
            return Invoke(thisArg, "then", [undefined, onRejected]);
        };

        LazyDefineBuiltinFunction(PromiseConstructor, "resolve", 1, PromiseConstructor_resolve);
        LazyDefineBuiltinFunction(PromiseConstructor, "reject", 1, PromiseConstructor_reject);
        LazyDefineBuiltinFunction(PromiseConstructor, "cast", 1, PromiseConstructor_cast);
        LazyDefineBuiltinFunction(PromiseConstructor, "race", 1, PromiseConstructor_race);

        LazyDefineProperty(PromiseConstructor, "all", CreateBuiltinFunction(getRealm(),PromiseConstructor_all, 0, "all"));
        LazyDefineProperty(PromisePrototype, "then", CreateBuiltinFunction(getRealm(),PromisePrototype_then, 2, "then"));
        LazyDefineProperty(PromisePrototype, "catch", CreateBuiltinFunction(getRealm(),PromisePrototype_catch, 1, "catch"));
        LazyDefineProperty(PromisePrototype, "constructor", PromiseConstructor);

        // ===========================================================================================================
        // Regular Expression
        // ===========================================================================================================

        MakeConstructor(RegExpConstructor, true, RegExpPrototype);

        var RegExp_$$create = function (thisArg, argList) {
            return RegExpAlloc(F);
        };

        var RegExp_Call = function (thisArg, argList) {

        };

        var RegExp_Construct = function (thisArg, argList) {

        };

        setInternalSlot(RegExpConstructor, "Call", RegExp_Call);
        setInternalSlot(RegExpConstructor, "Construct", RegExp_Construct);

        LazyDefineBuiltinConstant(RegExpConstructor, $$isRegExp, true);
        LazyDefineBuiltinFunction(RegExpConstructor, $$create, 1, RegExp_$$create);


        // ===========================================================================================================
        // set Timeout
        // ===========================================================================================================

        setInternalSlot(SetTimeoutFunction, "Call", function (thisArg, argList) {

            var func = argList[0];
            var timeout = argList[1] || 0;
            var task;
            if (!IsCallable(func)) return withError("Type", "setTimeout: function argument expected");
            task = {
                time: Date.now(),
                timeout: timeout,
                func: func
            };
            eventQueue.push(task);
            return task;
        });

        // ===========================================================================================================
        // ArrayBuffer
        // ===========================================================================================================

        setInternalSlot(ArrayBufferConstructor, "Call", function (thisArg, argList) {
            var length = argList[0];
            var O = thisArg;
            if (Type(O) !== "object" || (!hasInternalSlot(O, "ArrayBufferData")) || (getInternalSlot(O, "ArrayBufferData") !== undefined)) {
                return withError("Type", "Can not initialise the this argument as an ArrayBuffer or it is already initialised!");
            }
            Assert(getInternalSlot(O, "ArrayBufferData") === undefined, "ArrayBuffer has already to be initialised here but it is not.");
            var numberLength = ToNumber(length);
            var byteLength = ToInteger(numberLength);
            if ((byteLength = ifAbrupt(byteLength)) && isAbrupt(byteLength)) return byteLength;
            if ((numberLength != byteLength) || (byteLength < 0)) return withError("Range", "invalid byteLength");
            return SetArrayBufferData(O, byteLength);
        });

        setInternalSlot(ArrayBufferConstructor, "Construct", function (argList) {
            var F = ArrayBufferConstructor;
            return OrdinaryConstruct(F, argList);
        });

        setInternalSlot(ArrayBufferConstructor, "Prototype", FunctionPrototype);
        DefineOwnProperty(ArrayBufferConstructor, "prototype", {
            value: ArrayBufferPrototype,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(ArrayBufferConstructor, "isView", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var arg = argList[0];
                if (Type(arg) !== "object") return false;
                if (hasInternalSlot(arg, "ViewedArrayBuffer")) return true;
                return false;
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(ArrayBufferConstructor, $$create, {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var F = thisArg;
                return AllocateArrayBuffer(F);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(ArrayBufferPrototype, "constructor", {
            value: ArrayBufferConstructor,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(ArrayBufferPrototype, $$toStringTag, {
            value: "ArrayBuffer",
            writable: false,
            enumerable: false,
            configurable: false
        });

        setInternalSlot(ArrayBufferPrototype, "Prototype", ObjectPrototype);

        DefineOwnProperty(ArrayBufferPrototype, "byteLength", {
            get: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var O = thisArg;
                if (!hasInternalSlot(O, "ArrayBufferData")) return withError("Type", "The this argument hasnÂ´t [[ArrayBufferData]]");
                if (getInternalSlot(O, "ArrayBufferData") === undefined) return withError("Type", "The this arguments [[ArrayBufferData]] is not initialised");
                var length = getInternalSlot(O, "ArrayBufferByteLength");
                return length;
            }),
            set: undefined,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(ArrayBufferPrototype, "slice", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var start = argList[0];
                var end = argList[1];
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        // ===========================================================================================================
        // DataView
        // ===========================================================================================================

        setInternalSlot(DataViewConstructor, "Call", function (thisArg, argList) {

        });

        setInternalSlot(DataViewConstructor, "Contruct", function (thisArg, argList) {

        });

        setInternalSlot(DataViewConstructor, "Prototype", DataViewPrototype);

        DefineOwnProperty(DataViewConstructor, $$create, {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DataViewPrototype, $$toStringTag, {
            value: "DataView",
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(DataViewPrototype, "readInt8", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {

            }),
            writable: true,
            enumerable: false,
            configurable: true
        });

        DefineOwnProperty(DataViewPrototype, "readInt16", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {

            }),
            writable: true,
            enumerable: false,
            configurable: true
        });

        DefineOwnProperty(DataViewPrototype, "writeInt8", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {

            }),
            writable: true,
            enumerable: false,
            configurable: true
        });

        DefineOwnProperty(DataViewPrototype, "writeInt16", {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {

            }),
            writable: true,
            enumerable: false,
            configurable: true
        });

        // ===========================================================================================================
        // TypedArray
        // ===========================================================================================================
        // ------------------------------------------------------------------------------------------
        // Der %TypedArray% Constructor (Superklasse)
        // ------------------------------------------------------------------------------------------

        var TypedArrayConstructor_Call = function (thisArg, argList) {
            var array, typedArray, length;
            array = argList[0];
            var F = thisArg;
            var O;
            var elementType;
            var numberLength;
            var elementLength;
            var elementSize;
            var byteLength;
            var status;
            var data;
            var constructorName;

            if (Type(array) === "object") {
                if (array instanceof ArrayExoticObject) {

                } else if ((typedArray = array) instanceof IntegerIndexedExoticObject) {

                }
            } else if (typeof (length = array) == "number") {
                O = thisArg;
                if (Type(O) !== "object") return withError("Type", "this value is not an object");
                if (!hasInternalSlot(O, "TypedArrayName")) return withError("Type", "object has no TypedArrayName property");
                Assert(hasInternalSlot(O, "ViewedArrayBuffer"), "object has to have a ViewedArrayBuffer property");
                if (getInternalSlot(O, "ViewedArrayBuffer") === undefined) return withError("Type", "object has to have a well defined ViewedArrayBuffer property");
                constructorName = getInternalSlot(O, "TypedArrayName");
                elementType = TypedArrayElementType[constructorName];
                numberLength = ToNumber(length);
                elementLength = ToLength(numberLength);
                if ((elementLength = ifAbrupt(elementLength)) && isAbrupt(elementLength)) return elementLength;
                if (SameValueZero(numberLength, elementLength) === false) return withError("Range", "TypedArray: numberLength and elementLength are not equal");
                data = AllocateArrayBuffer("%ArrayBuffer%");
                if ((data = ifAbrupt(data)) && isAbrupt(data)) return data;
                elementSize = TypedArrayElementSize[elementType];
                byteLength = elementSize * elementLength;
                status = SetArrayBufferData(data, byteLength);
                if ((status = ifAbrupt(status)) && isAbrupt(status)) return status;
                setInternalSlot(O, "ViewedArrayBuffer", data);
                setInternalSlot(O, "ByteLength", byteLength);
                setInternalSlot(O, "ByteOffset", 0);
                setInternalSlot(O, "ArrayLength", elementLength);
                return O;
            } else {
                Assert(hasInternalSlot(O, "ViewedArrayBuffer"), "O has to have [[ViewedArrayBuffer]]");
                var buffer = argList[0];
                var byteOffset = argList[1];
                if (byteOffset === undefined) byteOffset = 0;
                length = argList[2];
                Assert((Type(buffer) === "object") && hasInternalSlot(buffer, "ArrayBufferData"), "buffer has to be an object and to have [[ArrayBufferData]]");
                O = thisArg;
                var arrayBufferData = getInternalSlot(buffer, "ArrayBufferData");
                if (arrayBufferData === undefined) return withError("Type", "[[ArrayBufferData]] is undefined");
                if (Type(O) !== "object" || !hasInternalSlot(O, "TypedArrayName")) return withError("Type", "O has to be object and to have [[TypedArrayName]]");
                var viewedArrayBuffer = getInternalSlot(O, "ViewedArrayBuffer");
                var typedArrayName = getInternalSlot(O, "TypedArrayName");
                if (typedArrayName === undefined) return withError("Type", "O has to have a well defined [[TypedArrayName]]");
                constructorName = getInternalSlot(O, "TypedArrayName");
                elementType = TypedArrayElementType[constructorName];
                elementSize = TypedArrayElementSize[elementType];
                var offset = ToInteger(byteOffset);
                if ((offset = ifAbrupt(offset)) && isAbrupt(offset)) return offset;
                if (offset < 0) return withError("Range", "offset is smaller 0");
                if ((offset % elementSize) !== 0) return withError("Range", "offset mod elementSize is not 0");
                var bufferByteLength = getInternalSlot(buffer, "ArrayBufferByteLength");
                if (offset + elementSize >= bufferByteLength) return withError("Range", "offset + elementSize is >= bufferByteLength");
                var newByteLength;
                if (length === undefined) {
                    if (bufferByteLength % elementSize !== 0) return withError("Range", "bufferByteLength mod elementSize is not 0");
                    newByteLength = bufferByteLength + offset;
                    if (newByteLength < 0) return withError("Range", "newByteLength < 0 underflow when adding offset to bufferByteLength");
                } else {
                    var newLength = ToLength(length);
                    if ((newLength = ifAbrupt(newLength)) && isAbrupt(newLength)) return newLength;
                    newByteLength = newLength * elementSize;
                    if (offset + newByteLength > bufferByteLength) return withError("Range", "offset + newByteLength is larger than bufferByteLength");
                }
                if (viewedArrayBuffer !== undefined) return withError("Type", "the [[ViewedArrayBuffer]] of O is not empty");
                setInternalSlot(O, "ViewedArrayBuffer", buffer);
                setInternalSlot(O, "ByteLength", newByteLength);
                setInternalSlot(O, "ByteOffset", offset);
                setInternalSlot(O, "ArrayLength", Math.floor(newByteLength / elementSize));
            }
            return O;
        };

        var typedArrayPrototypeNames = {
            "Float64Array": "%Float64ArrayPrototype%",
            "Float32Array": "%Float32ArrayPrototype%",
            "Int32Array": "%Int32ArrayPrototype%",
            "Uint32Array": "%Uint32ArrayPrototype%",
            "Int16Array": "%Int16ArrayPrototype%",
            "Uint16Array": "%Uint16ArrayPrototype%",
            "Int8Array": "%Int8ArrayPrototype%",
            "Uint8Array": "%Uint8ArrayPrototype%",
            "Uint8Clamped": "%Uint8ClampedArrayProtoype%"
        };

        var TypedArrayConstructor_$$create = function $$create(thisArg, argList) {
            var F = thisArg;
            if (Type(F) !== "object") return withError("Type", "the this value is not an object");
            if (!hasInternalSlot(F, "TypedArrayConstructor")) return withError("Type", "The this value has no [[TypedArrayConstructor]] property");
            var proto = GetPrototypeFromConstructor(F, typedArrayPrototypeNames[getInternalSlot(F, "TypedArrayConstructor")]);
            if ((proto = ifAbrupt(proto)) && isAbrupt(proto)) return proto;
            var obj = IntegerIndexedObjectCreate(proto);
            setInternalSlot(obj, "ViewedArrayBuffer", undefined);
            setInternalSlot(obj, "TypedArrayName", getInternalSlot(F, "TypedArrayConstructor"));
            setInternalSlot(obj, "ByteLength", 0);
            setInternalSlot(obj, "ByteOffset", 0);
            setInternalSlot(obj, "ArrayLength", 0);
            return obj;
        };

        var TypedArrayConstructor_from = function from(thisArg, argList) {
            "use strict";
            var source = argList[0];
            var mapfn = argList[1];
            var tArg = argList[2];
            var T;
            var C = thisArg;
            var newObj;
            var putStatus;
            if (!IsConstructor(C)) return withError("Type", "The this value is no constructor function.");
            var items = ToObject(source);
            if ((items = ifAbrupt(items)) && isAbrupt(items)) return items;
            var mapping;
            var k;
            var nextValue, kValue, Pk;
            if (mapfn === undefined) {
                mapping = false;
            } else {
                if (!IsCallable(mapfn)) return withError("Type", "mapfn is not a callable object");
                T = tArg;
                mapping = true;
            }
            var usingIterator = HasProperty(items, $$iterator);
            if ((usingIterator = ifAbrupt(usingIterator)) && isAbrupt(usingIterator)) return usingIterator;
            if (usingIterator) {
                var iterator = Get(items, $$iterator);
                iterator = unwrap(iterator);
                var values = [];
                var next = true;
                while (next != false) {
                    next = IteratorStept(iterator);
                    if (next !== false) {
                        nextValue = IteratorValue(next);
                        if ((nextValue = ifAbrupt(nextValue)) && isAbrupt(nextValue)) return nextValue;
                        values.push(nextValue);
                    }
                }
                var len = values.length;
                newObj = callInternalSlot("Construct", C, C, [len]);
                if ((newObj = ifAbrupt(newObj)) && isAbrupt(newObj)) return newObj;
                k = 0;
                while (k < len) {
                    Pk = ToString(k);
                    kValue = values[k];
                    if (mapping) {
                        mappedValue = callInternalSlot("Call", mapfn, T, [kValue]);
                        if ((mappedValue = ifAbrupt(mappedValue)) && isAbrupt(mappedValue)) return mappedValue;
                    } else mappedValue = kValue;
                    putStatus = Put(newObj, Pk, mappedValue, true);
                    if (isAbrupt(putStatus)) return putStatus;
                    k = k + 1;
                }
                return NormalCompletion(newObj);
            }
            Assert(HasProperty(items, "length"), "items has to be an array like object");
            var lenValue = Get(items, "length");
            var len = ToLength(lenValue);
            if ((len = ifAbrupt(len)) && isAbrupt(len)) return len;
            newObj = callInternalSlot("Construct", C, C, [len]);
            if ((newObj = ifAbrupt(newObj)) && isAbrupt(newObj)) return newObj;

            var mappedValue;
            k = 0;
            while (k < len) {
                Pk = ToString(k);
                kValue = Get(items, Pk);
                if ((kValue = ifAbrupt(kValue)) && isAbrupt(kValue)) return kValue;
                if (mapping) {
                    mappedValue = callInternalSlot("Call", mapfn, T, [kValue, k, items]);
                    if ((mappedValue = ifAbrupt(mappedValue)) && isAbrupt(mappedValue)) return mappedValue;
                } else {
                    mappedValue = kValue;
                }
                putStatus = Put(newObj, Pk, mappedValue, true);
                if (isAbrupt(putStatus)) return putStatus;
                k = k + 1;
            }
            return NormalCompletion(newObj);

        };
        var TypedArrayConstructor_of = function of(thisArg, argList) {
            var items = CreateArrayFromList(argList);

            var lenValue = Get(items, "length");
            var C = thisArg;

            if (IsConstructor(C)) {
                var newObj = callInternalSlot("Construct", C, C, [len]);
                if ((newObj = ifAbrupt(newObj)) && isAbrupt(newObj)) return newObj;
            } else {
                return withError("Type", "The thisValue has to be a constructor");
            }

            var k = 0;
            var status;
            var Pk, kValue;
            while (k < len) {
                Pk = ToString(k);
                kValue = Get(items, Pk);
                //if ((kValue=ifAbrupt(kValue))&&isAbrupt(kValue)) return kValue;
                status = Put(newObj, Pk, kValue, true);
                if ((status = ifAbrupt(status)) && isAbrupt(status)) return status;
                k = k + 1;
            }
            return NormalCompletion(newObj);
        };

        setInternalSlot(TypedArrayConstructor, "Call", TypedArrayConstructor_Call);
        LazyDefineProperty(TypedArrayConstructor, $$create, CreateBuiltinFunction(getRealm(),TypedArrayConstructor_$$create, 0, "[Symbol.create]"));
        LazyDefineProperty(TypedArrayConstructor, "from", CreateBuiltinFunction(getRealm(),TypedArrayConstructor_from, 1, "from"));
        LazyDefineProperty(TypedArrayConstructor, "of", CreateBuiltinFunction(getRealm(),TypedArrayConstructor_of, 2, "of"));

        // ------------------------------------------------------------------------------------------
        // 22.2.6. Typed Array Prototype
        // ------------------------------------------------------------------------------------------

        var TypedArrayPrototype_get_buffer = function (thisArg, argList) {

        };
        var TypedArrayPrototype_get_byteLength = function (thisArg, argList) {

        };
        var TypedArrayPrototype_get_byteOffset = function (thisArg, argList) {

        };
        var TypedArrayPrototype_get_buffer = function (thisArg, argList) {

        };

        var tap_subarray = function subarray(thisArg, argList) {

        };

        // filter
        // find
        // findIndex
        // forEach
        // indexOf
        // join
        // keys
        // lastIndexOf
        // length
        // map
        // reduce
        // reduceRight
        // reverse
        // set
        // slice
        // some
        // sort
        // subarray
        // toLocaleString
        // toString
        // values
        // $$iterator
        var TypedArrayPrototype_$$iterator = function iterator(thisArg, argList) {

        };

        // $$toStringTag
        var TypedArrayPrototype_get_$$toStringTag = function get_toStringTag(thisArg, argList) {
            var O = thisArg;
            if (Type(O) !== "object") return withError("Type", "the this value is not an object");
            if (!hasInternalSlot(O, "TypedArrayName")) return withError("Type", "the this value has no [[TypedArrayName]] slot");
            var name = getInternalSlot(O, "TypedArrayName");
            Assert(Type(name) == "string", "name has to be a string value");
            return NormalCompletion(name);
        };

        function createTypedArrayPrototype(proto) {
            LazyDefineAccessor(proto, "buffer", CreateBuiltinFunction(getRealm(),TypedArrayPrototype_get_buffer, 0, "get buffer"));
            LazyDefineAccessor(proto, "byteLength", CreateBuiltinFunction(getRealm(),TypedArrayPrototype_get_byteLength, 0, "get byteLength"));
            LazyDefineAccessor(proto, "byteOffset", CreateBuiltinFunction(getRealm(),TypedArrayPrototype_get_byteOffset, 0, "get byteOffset"));
            LazyDefineAccessor(proto, $$toStringTag, CreateBuiltinFunction(getRealm(),TypedArrayPrototype_get_$$toStringTag, 0, "get [Symbol.toStringTag]"));
            return proto;
        };

        // ===========================================================================================================
        // Create Typed Arrays
        // ===========================================================================================================

        function createTypedArrayVariant(_type, _bpe, _ctor, _proto) {

            //    setInternalSlot(_ctor, "TypedArrayConstructor", _type + "Array");

            setInternalSlot(_ctor, "Prototype", TypedArrayConstructor);

            setInternalSlot(_ctor, "Call", function (thisArg, argList) {
                var O = thisArg;
                if (Type(O) !== "object") return withError("Type", "O is not an object");
                if (!hasInternalSlot(O, "TypedArrayName")) return withError("Type", "[[TypedArrayName]] is missing");
                if (getInternalSlot(O, "TypedArrayName") != undefined) return withError("Type", "[[TypedArrayName]] isnt undefined");
                setInternalSlot(O, "TypedArrayName", _type + "Array");
                var F = this;
                var realmF = getInternalSlot(F, "Realm");
                var sup = Get(realmF.intrinsics, "%TypedArray%");
                var args = argList;
                return callInternalSlot("Call", sup, O, args);
            });

            setInternalSlot(_ctor, "Construct", function (argList) {
                var F = this;
                var args = argList;
                return OrdinaryConstruct(F, args);
            });
            DefineOwnProperty(_ctor, "BYTES_PER_ELEMENT", {
                value: _bpe,
                writable: false,
                enumerable: false,
                configurable: false
            });
            DefineOwnProperty(_ctor, "prototype", {
                value: _proto,
                writable: false,
                enumerable: true,
                configurable: false
            });
            DefineOwnProperty(_proto, "constructor", {
                value: _ctor,
                writable: false,
                enumerable: true,
                configurable: false
            });

            return _ctor;
        }

        createTypedArrayVariant("Int8", 1, Int8ArrayConstructor, Int8ArrayPrototype);
        createTypedArrayVariant("Uint8", 1, Uint8ArrayConstructor, Int8ArrayPrototype);
        createTypedArrayVariant("Uint8C", 1, Uint8ClampedArrayConstructor, Uint8ClampedArrayPrototype);
        createTypedArrayVariant("Int16", 2, Int16ArrayConstructor, Int16ArrayPrototype);
        createTypedArrayVariant("Uint16", 2, Uint16ArrayConstructor, Uint16ArrayPrototype);
        createTypedArrayVariant("Int32", 4, Int32ArrayConstructor, Int32ArrayPrototype);
        createTypedArrayVariant("Uint32", 4, Uint32ArrayConstructor, Uint32ArrayPrototype);
        createTypedArrayVariant("Float32", 8, Float32ArrayConstructor, Float32ArrayPrototype);
        createTypedArrayVariant("Float64", 8, Float64ArrayConstructor, Float64ArrayPrototype);

        // ===========================================================================================================
        // Map
        // ===========================================================================================================

        //
        // Map, WeakMap, Set
        //
        // 
        // To achieve constant O(1) XS within ES5 i do one thing, as long
        // as i have not even written the compiler and bytecode
        // I set an internal Property with a String Value, which can be used
        // as a key to get the record with the entry very fast.
        //
        // for (k in listobj) is listing in order of creation
        // that is a tradeoff for es5 
        // i do not like array.indexOf, coz each lookup is up to O(n)
        // and we want it to be constant

        var uniqueInMapKey = 0;

        setInternalSlot(MapConstructor, "Prototype", FunctionPrototype);
        setInternalSlot(MapPrototype, "Prototype", ObjectPrototype);

        setInternalSlot(MapConstructor, "Call", function Call(thisArg, argList) {

            var iterable = argList[0];
            var comparator = argList[1];
            var map = thisArg;

            if (Type(map) !== "object") return withError("Type", "map is not an object");
            if (!hasInternalSlot(map, "MapData")) return withError("Type", "MapData property missing on object");
            if (getInternalSlot(map, "MapData") !== undefined) return withError("Type", "MapData property already initialised");

            var iter;
            var hasValues, adder;
            if (iterable === undefined || iterable === null) iter = undefined;
            else {
                hasValues = HasProperty(iterable, "entries");
                if ((hasValues = ifAbrupt(hasValues)) && isAbrupt(hasValues)) return hasValues;
                if (hasValues) iter = Invoke(iterable, "entries");
                else iter = GetIterator(iterable);
                adder = Get(map, "set");
                if ((adder = ifAbrupt(adder)) && isAbrupt(adder)) return adder;
                if (!IsCallable(adder)) return withError("Type", "map adder (the set function) is not callable");
            }
            if (comparator !== undefined) {
                if (comparator !== "is") return withError("Range", "comparator argument has currently to be 'undefined' or 'is'");
            }

            setInternalSlot(map, "MapData", Object.create(null));
            setInternalSlot(map, "MapComparator", comparator);

            if (iter === undefined) return NormalCompletion(map);

            var next, nextItem, done, k, v, status;
            for (;;) {
                next = IteratorNext(iter);
                if ((next = ifAbrupt(next)) && isAbrupt(next)) return next;
                done = IteratorComplete(next);
                if ((done = ifAbrupt(done)) && isAbrupt(done)) return done;
                if (done) return NormalCompletion(map);
                nextItem = IteratorValue(next);
                if ((nextItem = ifAbrupt(nextItem)) && isAbrupt(nextItem)) return nextItem;
                k = Get(nextItem, "0");
                if ((k = ifAbrupt(k)) && isAbrupt(k)) return k;
                v = Get(nextItem, "1");
                if ((v = ifAbrupt(v)) && isAbrupt(v)) return v;
                status = callInternalSlot("Call", adder, map, [k, v]);
                if (isAbrupt(status)) return status;
            }
            return NormalCompletion(map);
        });

        setInternalSlot(MapConstructor, "Construct", function Construct(argList) {
            var F = this;
            var args = argList;
            return OrdinaryConstruct(F, args);
        });

        DefineOwnProperty(MapConstructor, "prototype", {
            value: MapPrototype,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(MapPrototype, "constructor", {
            value: MapConstructor,
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(MapPrototype, "has", {
            value: CreateBuiltinFunction(getRealm(),function has(thisArg, argList) {

                var same;
                var key = argList[0];
                var M = thisArg;

                if (Type(M) !== "object") return withError("Type", "this argument is not an object");
                if (!hasInternalSlot(M, "MapData")) return withError("Type", "this argument has no map data internal slot");

                var entries = getInternalSlot(M, "MapData");
                var comparator = getInternalSlot(M, "MapComparator");

                if (comparator === undefined) same = SameValueZero;
                else same = SameValue;
                
                var internalKey;

                internalKey = __checkInternalUniqueKey(key);

                var record = entries[internalKey];
                if (record) {
                    return NormalCompletion(true);
                }
                return NormalCompletion(false);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(MapPrototype, "get", {
            value: CreateBuiltinFunction(getRealm(),function get(thisArg, argList) {
                var key = argList[0];
                var M = thisArg;
                var same;
                if (Type(M) !== "object") return withError("Type", "this argument is not an object");
                if (!hasInternalSlot(M, "MapData")) return withError("Type", "this argument has no map data internal slot");
                var entries = getInternalSlot(M, "MapData");
                var comparator = getInternalSlot(M, "MapComparator");
                if (comparator === undefined) same = SameValueZero;
                else same = SameValue;
                
                var internalKey;

                internalKey = __checkInternalUniqueKey(key);

                var record = entries[internalKey];
                if (record) {
                    var value = record.value;
                    return NormalCompletion(value);
                }
                return NormalCompletion(undefined);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(MapPrototype, "set", {
            value: CreateBuiltinFunction(getRealm(),function set(thisArg, argList) {
                var key = argList[0];
                var value = argList[1];
                var M = thisArg;
                var same;
                if (Type(M) !== "object") return withError("Type", "this argument is not an object");
                if (!hasInternalSlot(M, "MapData")) return withError("Type", "this argument has no map data internal slot");

                var entries = getInternalSlot(M, "MapData");

                var comparator = getInternalSlot(M, "MapComparator");
                if (comparator === undefined) same = SameValueZero;
                else same = SameValue;

                
                var internalKey;

                internalKey = __checkInternalUniqueKey(key, true);

                var record = entries[internalKey];
                if (!record) {
                    entries[internalKey] = {
                        key: key,
                        value: value
                    };
                } else {
                    record.value = value;
                }
                return NormalCompletion(M);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(MapPrototype, "delete", {
            value: CreateBuiltinFunction(getRealm(),function _delete(thisArg, argList) {
                var key = argList[0];
                var M = thisArg;
                var same;
                if (Type(M) !== "object") return withError("Type", "this argument is not an object");
                if (!hasInternalSlot(M, "MapData")) return withError("Type", "this argument has no map data internal slot");
                var entries = getInternalSlot(M, "MapData");
                var comparator = getInternalSlot(M, "MapComparator");
                if (comparator === undefined) same = SameValueZero;
                else same = SameValue;
                
                var internalKey;

                internalKey = __checkInternalUniqueKey(key);

                var record = entries[internalKey];
                if (record) {
                    entries[internalKey] = undefined;
                    delete entries[internalKey];
                    return NormalCompletion(true);
                }
                return NormalCompletion(false);
            }, 1, "delete"),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(MapPrototype, "forEach", {
            value: CreateBuiltinFunction(getRealm(),function forEach(thisArg, argList) {

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(MapPrototype, "clear", {
            value: CreateBuiltinFunction(getRealm(),function clear(thisArg, argList) {}),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(MapPrototype, "keys", {
            value: CreateBuiltinFunction(getRealm(),function keys(thisArg, argList) {
                var O = thisArg;
                return CreateMapIterator(O, "key");
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(MapPrototype, "values", {
            value: CreateBuiltinFunction(getRealm(),function values(thisArg, argList) {
                var O = thisArg;
                return CreateMapIterator(O, "value");
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(MapPrototype, "entries", {
            value: CreateBuiltinFunction(getRealm(),function entries(thisArg, argList) {
                var O = thisArg;
                return CreateMapIterator(O, "key+value");
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(MapConstructor, $$create, {
            value: CreateBuiltinFunction(getRealm(),function $$create(thisArg, argList) {
                var F = thisArg;
                return OrdinaryCreateFromConstructor(F, "%MapPrototype%", {
                    "MapData": undefined,
                    "MapComparator": undefined
                });
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(MapPrototype, $$toStringTag, {
            value: "Map",
            writable: false,
            enumerable: false,
            configurable: false
        });

        //
        // Map Iterator
        //

        function CreateMapIterator(map, kind) {
            var M = ToObject(map);
            if ((M = ifAbrupt(M)) && isAbrupt(M)) return M;
            if (!hasInternalSlot(M, "MapData")) return withError("Type", "object has no internal MapData slot");
            var entries = getInternalSlot(M, "MapData");
            var MapIteratorPrototype = Get(getIntrinsics(), "%MapIteratorPrototype%");
            var iterator = ObjectCreate(MapIteratorPrototype, {
                "Map": undefined,
                "MapNextIndex": undefined,
                "MapIterationKind": undefined
            });
            setInternalSlot(iterator, "Map", entries);
            setInternalSlot(iterator, "MapNextIndex", 0);
            setInternalSlot(iterator, "MapIterationKind", kind);
            return iterator;
        }

        DefineOwnProperty(MapIteratorPrototype, "constructor", {
            value: undefined,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(MapIteratorPrototype, $$toStringTag, {
            value: "Map Iterator",
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(MapIteratorPrototype, $$iterator, {
            value: CreateBuiltinFunction(getRealm(),function $$iterator(thisArg, argList) {
                return thisArg;
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(MapIteratorPrototype, "next", {
            value: CreateBuiltinFunction(getRealm(),function next(thisArg, argList) {
                var O = thisArg;
                if (Type(O) !== "object") return withError("Type", "the this value is not an object");
                if (!hasInternalSlot(O, "Map") || !hasInternalSlot(O, "MapNextIndex") || !hasInternalSlot(O, "MapIterationKind")) return withError("Type", "iterator has not all of the required internal properties");
                var entries = getInternalSlot(O, "Map");
                var kind = getInternalSlot(O, "MapIterationKind");
                var index = getInternalSlot(O, "MapNextIndex");
                var result;
                var internalKeys = Object.keys(entries); // deviate from spec
                var len = internalKeys.length;
                while (index < len) {
                    var e = entries[internalKeys[index]];
                    index = index + 1;
                    setInternalSlot(O, "MapNextIndex", index);
                    if (e.key !== empty) {
                        if (kind === "key") result = e.key;
                        else if (kind === "value") result = e.value;
                        else {
                            Assert(kind === "key+value", "map iteration kind has to be key+value");
                            var result = ArrayCreate(2);
                            CreateDataProperty(result, "0", e.key);
                            CreateDataProperty(result, "1", e.value);
                        }
                        return CreateItrResultObject(result, false);
                    }
                }
                return CreateItrResultObject(undefined, true);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        function __checkInternalUniqueKey(value, writeIfUndefined) {
            var internalKey;
            if (Type(value) === "object") {
                internalKey = getInternalSlot(value, "__mapSetInternalUniqueKey__");
                if (internalKey === undefined) {
                    internalKey = (++__mapSetUniqueInternalUniqueKeyCounter__) + Math.random();
                    if (writeIfUndefined) setInternalSlot(value, "__mapSetInternalUniqueKey__", internalKey);
                }
                return internalKey;
            }
            internalKey = value;
            if (typeof value === "string") internalKey = "str_" + internalKey;
            if (typeof value === "number") internalKey = "num_" + internalKey;
            if (typeof value === "boolean") internalKey = "" + internalKey;
            if (typeof value === "undefined") internalKey = "" + internalKey;
            if (value === null) internalKey = internalKey + "" + internalKey;
            return internalKey;
        }

        // ===========================================================================================================
        // Set
        // ===========================================================================================================

        // 
        // Set
        //

        setInternalSlot(SetConstructor, "Prototype", FunctionPrototype);
        setInternalSlot(SetPrototype, "Prototype", ObjectPrototype);

        setInternalSlot(SetConstructor, "Call", function Call(thisArg, argList) {
            var iterable = argList[0];
            var comparator = argList[1];
            var set = thisArg;

            if (Type(set) !== "object") return withError("Type", "set is not an object");
            if (!hasInternalSlot(set, "SetData")) return withError("Type", "SetData property missing on object");
            if (getInternalSlot(set, "SetData") !== undefined) return withError("Type", "SetData property already initialised");

            var iter;
            var hasValues, adder;
            if (iterable === undefined || iterable === null) iter = undefined;
            else {
                hasValues = HasProperty(iterable, "entries");
                if ((hasValues = ifAbrupt(hasValues)) && isAbrupt(hasValues)) return hasValues;
                if (hasValues) iter = Invoke(iterable, "entries");
                else iter = GetIterator(iterable);
                adder = Get(set, "set");
                if ((adder = ifAbrupt(adder)) && isAbrupt(adder)) return adder;
                if (!IsCallable(adder)) return withError("Type", "set adder (the set function) is not callable");
            }
            if (comparator !== undefined) {
                if (comparator !== "is") return withError("Range", "comparator argument has currently to be 'undefined' or 'is'");
            }

            setInternalSlot(set, "SetData", Object.create(null));
            setInternalSlot(set, "SetComparator", comparator);

            if (iter === undefined) return NormalCompletion(set);

            var next, nextItem, done, k, v, status;
            for (;;) {
                next = IteratorNext(iter);
                if ((next = ifAbrupt(next)) && isAbrupt(next)) return next;
                done = IteratorComplete(next);
                if ((done = ifAbrupt(done)) && isAbrupt(done)) return done;
                if (done) return NormalCompletion(set);
                nextItem = IteratorValue(next);
                if ((nextItem = ifAbrupt(nextItem)) && isAbrupt(nextItem)) return nextItem;
                k = Get(nextItem, "0");
                if ((k = ifAbrupt(k)) && isAbrupt(k)) return k;
                v = Get(nextItem, "1");
                if ((v = ifAbrupt(v)) && isAbrupt(v)) return v;
                status = callInternalSlot("Call", adder, set, [v]);
                if (isAbrupt(status)) return status;
            }
            return NormalCompletion(set);

        });
        setInternalSlot(SetConstructor, "Construct", function Construct(argList) {
            var F = this;
            var args = argList;
            return OrdinaryConstruct(F, args);
        });

        DefineOwnProperty(SetConstructor, $$create, {
            value: CreateBuiltinFunction(getRealm(),function $$create(thisArg, argList) {
                var F = thisArg;
                return OrdinaryCreateFromConstructor(F, "%SetPrototype%", {
                    "SetData": undefined,
                    "SetComparator": undefined
                });
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SetPrototype, $$toStringTag, {
            value: "Set",
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SetPrototype, "clear", {
            value: CreateBuiltinFunction(getRealm(),function clear(thisArg, argList) {}),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SetPrototype, "set", {
            value: CreateBuiltinFunction(getRealm(),function set(thisArg, argList) {
                var value = argList[0];
                var S = thisArg;
                var same;
                if (Type(S) !== "object") return withError("Type", "this argument is not an object");
                if (!hasInternalSlot(S, "SetData")) return withError("Type", "this argument has no set data internal slot");

                var entries = getInternalSlot(S, "SetData");

                var comparator = getInternalSlot(S, "SetComparator");
                if (comparator === undefined) same = SameValueZero;
                else same = SameValue;

                
                var internalKey;

                internalKey = __checkInternalUniqueKey(value, true);

                entries[internalKey] = value;

                return NormalCompletion(S);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SetPrototype, "has", {
            value: CreateBuiltinFunction(getRealm(),function has(thisArg, argList) {
                var value = argList[0];
                var S = thisArg;
                var same;
                if (Type(S) !== "object") return withError("Type", "this argument is not an object");
                if (!hasInternalSlot(S, "SetData")) return withError("Type", "this argument has no map data internal slot");

                var entries = getInternalSlot(S, "SetData");

                var comparator = getInternalSlot(S, "SetComparator");
                if (comparator === undefined) same = SameValueZero;
                else same = SameValue;

                
                var internalKey;

                internalKey = __checkInternalUniqueKey(value);

                if (entries[internalKey] === value) return NormalCompletion(true);

                return NormalCompletion(false);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(SetPrototype, "delete", {
            value: CreateBuiltinFunction(getRealm(),function _delete(thisArg, argList) {
                var value = argList[0];
                var S = thisArg;
                var same;
                if (Type(S) !== "object") return withError("Type", "this argument is not an object");
                if (!hasInternalSlot(S, "SetData")) return withError("Type", "this argument has no map data internal slot");

                var entries = getInternalSlot(S, "SetData");

                var comparator = getInternalSlot(S, "SetComparator");
                if (comparator === undefined) same = SameValueZero;
                else same = SameValue;

                
                var internalKey;

                internalKey = __checkInternalUniqueKey(value);

                if (entries[internalKey] === value) {
                    entries[internalKey] = undefined;
                    delete entries[internalKey];
                    return NormalCompletion(true);
                }
                return NormalCompletion(false);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        //
        // SetIterator
        // 
        function CreateSetIterator(set, kind) {
            var S = ToObject(set);
            if ((S = ifAbrupt(S)) && isAbrupt(S)) return S;
            if (!hasInternalSlot(S, "SetData")) return withError("Type", "object has no internal SetData slot");
            var entries = getInternalSlot(S, "SetData");
            var SetIteratorPrototype = Get(getIntrinsics(), "%SetIteratorPrototype%");
            var iterator = ObjectCreate(SetIteratorPrototype, {
                "IteratedSet": undefined,
                "SetNextIndex": undefined,
                "SetIterationKind": undefined
            });
            setInternalSlot(iterator, "IteratedSet", entries);
            setInternalSlot(iterator, "SetNextIndex", 0);
            setInternalSlot(iterator, "SetIterationKind", kind);
            return iterator;
        }

        DefineOwnProperty(SetIteratorPrototype, "constructor", {
            value: undefined,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SetIteratorPrototype, $$toStringTag, {
            value: "Set Iterator",
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SetIteratorPrototype, $$iterator, {
            value: CreateBuiltinFunction(getRealm(),function $$iterator(thisArg, argList) {
                return thisArg;
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(SetIteratorPrototype, "next", {
            value: CreateBuiltinFunction(getRealm(),function next(thisArg, argList) {
                var O = thisArg;
                if (Type(O) !== "object") return withError("Type", "the this value is not an object");
                if (!hasInternalSlot(O, "Set") || !hasInternalSlot(O, "SetNextIndex") || !hasInternalSlot(O, "SetIterationKind")) return withError("Type", "iterator has not all of the required internal properties");
                var entries = getInternalSlot(O, "Set");
                var kind = getInternalSlot(O, "SetIterationKind");
                var index = getInternalSlot(O, "SetNextIndex");
                var result;
                while (index < len) {
                    var e = entries[index];
                    index = index + 1;
                    setInternalSlot(O, "SetNextIndex", index);
                    if (e !== empty) {
                        if (kind === "key+value") {
                            Assert(kind === "key+value", "set iteration kind has to be key+value");
                            var result = ArrayCreate(2);
                            CreateDataProperty(result, "0", e);
                            CreateDataProperty(result, "1", e);
                            return CreateItrResultObject(result, false);
                        }
                        return CreateItrResultObject(e, false);
                    }
                }
                return CreateItrResultObject(undefined, true);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        // ===========================================================================================================
        // WeakMap
        // ===========================================================================================================

        // ===========================================================================================================
        // WeakSet
        // ===========================================================================================================

        // ===========================================================================================================
        // Event Emitter (nodejs emitter like with equal interfaces)
        // ===========================================================================================================

        setInternalSlot(EmitterPrototype, "Prototype", ObjectPrototype);

        setInternalSlot(EmitterConstructor, "Call", function Call(thisArg, argList) {
            var O = thisArg;
            var type = Type(O);
            var has, listeners;
            if (type === "object") {
                var has = hasInternalSlot(O, "EventListeners");
                if (!has) {
                    return withError("Type", "this argument has to have a [[Listeners]] Property");
                } else {
                    var listeners = getInternalSlot(O, "EventListeners");
                    if (!listeners) {
                        listeners = Object.create(null);
                        setInternalSlot(O, "EventListeners", listeners);

                    }
                }
            } else {
                return withError("Type", "this argument is not an object");
            }
            return O;
        });

        setInternalSlot(EmitterConstructor, "Construct", function Call(argList) {
            var F = this;
            var args = argList;
            return OrdinaryConstruct(F, args);
        });

        DefineOwnProperty(EmitterConstructor, $$create, {
            value: CreateBuiltinFunction(getRealm(),function (thisArg, argList) {
                var F = EmitterConstructor;
                var proto = GetPrototypeFromConstructor(F, "%EmitterPrototype%");
                var O = ObjectCreate(proto, {
                    "EventListeners": undefined
                });
                return O;
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(EmitterConstructor, "prototype", {
            value: EmitterPrototype,
            writable: false,
            enumerable: false,
            configurable: false
        });
        DefineOwnProperty(EmitterPrototype, "constructor", {
            value: EmitterConstructor,
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(EmitterPrototype, "on", {
            value: CreateBuiltinFunction(getRealm(),function on(thisArg, argList) {
                var E = thisArg,
                    listeners, callback, event;

                if (Type(E) !== "object") return withError("Type", "this argument is not an object");

                if (!hasInternalSlot(E, "EventListeners")) return withError("Type", "[[Listeners]] missing on this argument");
                else listeners = getInternalSlot(E, "EventListeners");

                var event = argList[0];
                var callback = argList[1];
                if (Type(event) !== "string") return withError("Type", "Your argument 1 is not a event name string.");
                if (!IsCallable(callback)) return withError("Type", "Your argument 2 is not a callback function");

                var list = listeners[event];
                if (list == undefined) list = listeners[event] = [];
                list.push(callback);

                return NormalCompletion(undefined);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(EmitterPrototype, "once", {
            value: CreateBuiltinFunction(getRealm(),function once(thisArg, argList) {
                var E = thisArg,
                    listeners, callback, event;

                if (Type(E) !== "object") return withError("Type", "this argument is not an object");

                if (!hasInternalSlot(E, "EventListeners")) return withError("Type", "[[Listeners]] missing on this argument");
                else listeners = getInternalSlot(E, "EventListeners");

                var event = argList[0];
                var callback = argList[1];
                if (Type(event) !== "string") return withError("Type", "Your argument 1 is not a event name string.");
                if (!IsCallable(callback)) return withError("Type", "Your argument 2 is not a callback function");

                var list = listeners[event];
                if (list == undefined) list = listeners[event] = [];

                list.push(
                    function (callback) {

                        return CreateBuiltinFunction(getRealm(),function once_callback(thisArg, argList) {
                            if (callback) {
                                callInternalSlot("Call", callback, thisArg, argList);
                                callback = null;
                            }
                        });

                    }(callback)
                );

                return NormalCompletion(undefined);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(EmitterPrototype, "remove", {
            value: CreateBuiltinFunction(getRealm(),function remove(thisArg, argList) {

                var E = thisArg,
                    listeners, callback, event, values;

                if (Type(E) !== "object") return withError("Type", "this argument is not an object");

                if (!hasInternalSlot(E, "EventListeners")) return withError("Type", "[[Listeners]] missing on this argument");
                else listeners = getInternalSlot(E, "EventListeners");

                event = argList[0];
                callback = argList[1];

                if (Type(event) !== "string") return withError("Type", "Your argument 1 is not a event name string.");
                if (!IsCallable(callback)) return withError("Type", "Your argument 2 is not a function.");

                var list = listeners[event];
                if (list == undefined) return NormalCompletion(undefined);

                var newList = [];
                var fn;
                for (var i = 0, j = list.length; i < j; i++) {
                    if (fn = list[i]) {
                        if (fn !== callback) newList.push(fn);
                    }
                }

                listeners[event] = newList;

                return NormalCompletion(undefined);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(EmitterPrototype, "removeAll", {
            value: CreateBuiltinFunction(getRealm(),function removeAll(thisArg, argList) {
                var E = thisArg,
                    listeners, event;

                if (Type(E) !== "object") return withError("Type", "this argument is not an object");

                if (!hasInternalSlot(E, "EventListeners")) return withError("Type", "[[Listeners]] missing on this argument");
                else listeners = getInternalSlot(E, "EventListeners");

                event = argList[0];

                if (Type(event) !== "string") return withError("Type", "Your argument 1 is not a event name string.");

                var list = listeners[event];
                if (list == undefined) return NormalCompletion(undefined);
                else listeners[event] = [];

                return NormalCompletion(undefined);

            }),
            writable: false,
            enumerable: false,
            configurable: false
        });

        DefineOwnProperty(EmitterPrototype, "emit", {
            value: CreateBuiltinFunction(getRealm(),function emit(thisArg, argList) {
                var E = thisArg,
                    listeners, callback, event, values;

                if (Type(E) !== "object") return withError("Type", "this argument is not an object");

                if (!hasInternalSlot(E, "EventListeners")) return withError("Type", "[[Listeners]] missing on this argument");
                else listeners = getInternalSlot(E, "EventListeners");

                event = argList[0];
                values = argList.slice(1);
                if (Type(event) !== "string") return withError("Type", "Your argument 1 is not a event name string.");
                var list = listeners[event];
                if (list == undefined) return NormalCompletion(undefined);
                
                //setTimeout(function () {
                var result;
                for (var i = 0, j = list.length; i < j; i++) {
                    if (callback = list[i]) {
                        result = callInternalSlot("Call", callback, thisArg, values);
                        if (isAbrupt(result)) return result;
                    }
                }
                //},0);
                
                return NormalCompletion(undefined);
            }),
            writable: false,
            enumerable: false,
            configurable: false
        });
        
        LazyDefineBuiltinConstant(EmitterPrototype, $$toStringTag, "Emitter");
        

        // ===========================================================================================================
        // Globales This erzeugen (sollte mit dem realm und den builtins 1x pro neustart erzeugt werden)
        // ===========================================================================================================

        createGlobalThis = function createGlobalThis(globalThis, intrinsics) {
            SetPrototypeOf(globalThis, ObjectPrototype);
            setInternalSlot(globalThis, "Extensible", true);

            DefineOwnProperty(globalThis, "Array", GetOwnProperty(intrinsics, "%Array%"));
            DefineOwnProperty(globalThis, "ArrayBuffer", GetOwnProperty(intrinsics, "%ArrayBuffer%"));
            DefineOwnProperty(globalThis, "Boolean", GetOwnProperty(intrinsics, "%Boolean%"));
            DefineOwnProperty(globalThis, "DataView", GetOwnProperty(intrinsics, "%DataView%"));
            DefineOwnProperty(globalThis, "Date", GetOwnProperty(intrinsics, "%Date%"));
            DefineOwnProperty(globalThis, "Emitter", GetOwnProperty(intrinsics, "%Emitter%"));
            DefineOwnProperty(globalThis, "Error", GetOwnProperty(intrinsics, "%Error%"));
            DefineOwnProperty(globalThis, "EvalError", GetOwnProperty(intrinsics, "%EvalError%"));
            DefineOwnProperty(globalThis, "Function", GetOwnProperty(intrinsics, "%Function%"));
            DefineOwnProperty(globalThis, "Float32Array", GetOwnProperty(intrinsics, "%Float32Array%"));
            DefineOwnProperty(globalThis, "Float64Array", GetOwnProperty(intrinsics, "%Float64Array%"));
            DefineOwnProperty(globalThis, "GeneratorFunction", GetOwnProperty(intrinsics, "%GeneratorFunction%"));
            LazyDefineBuiltinConstant(globalThis, "Infinity", Infinity);
            DefineOwnProperty(globalThis, "Int8Array", GetOwnProperty(intrinsics, "%Int8Array%"));
            DefineOwnProperty(globalThis, "Int16Array", GetOwnProperty(intrinsics, "%Int16Array%"));
            DefineOwnProperty(globalThis, "Int32Array", GetOwnProperty(intrinsics, "%Int32Array%"));
            DefineOwnProperty(globalThis, "JSON", GetOwnProperty(intrinsics, "%JSON%"));
            DefineOwnProperty(globalThis, "Loader", GetOwnProperty(intrinsics, "%Loader%"));
            DefineOwnProperty(globalThis, "Math", GetOwnProperty(intrinsics, "%Math%"));
            DefineOwnProperty(globalThis, "Map", GetOwnProperty(intrinsics, "%Map%"));
            DefineOwnProperty(globalThis, "Module", GetOwnProperty(intrinsics, "%Module%"));
            LazyDefineBuiltinFunction(globalThis, "NaN", NaN);
            DefineOwnProperty(globalThis, "Number", GetOwnProperty(intrinsics, "%Number%"));
            DefineOwnProperty(globalThis, "Proxy", GetOwnProperty(intrinsics, "%Proxy%"));
            DefineOwnProperty(globalThis, "RangeError", GetOwnProperty(intrinsics, "%RangeError%"));
            DefineOwnProperty(globalThis, "Realm", GetOwnProperty(intrinsics, "%Realm%"));
            DefineOwnProperty(globalThis, "ReferenceError", GetOwnProperty(intrinsics, "%ReferenceError%"));
            DefineOwnProperty(globalThis, "RegExp", GetOwnProperty(intrinsics, "%RegExp%"));
            DefineOwnProperty(globalThis, "SyntaxError", GetOwnProperty(intrinsics, "%SyntaxError%"));
            DefineOwnProperty(globalThis, "TypeError", GetOwnProperty(intrinsics, "%TypeError%"));
            DefineOwnProperty(globalThis, "URIError", GetOwnProperty(intrinsics, "%URIError%"));
            DefineOwnProperty(globalThis, "Object", GetOwnProperty(intrinsics, "%Object%"));
            DefineOwnProperty(globalThis, "Promise", GetOwnProperty(intrinsics, "%Promise%"));
            DefineOwnProperty(globalThis, "Reflect", GetOwnProperty(intrinsics, "%Reflect%"));
            DefineOwnProperty(globalThis, "Set", GetOwnProperty(intrinsics, "%Set%"));
            DefineOwnProperty(globalThis, "String", GetOwnProperty(intrinsics, "%String%"));
            DefineOwnProperty(globalThis, "Symbol", GetOwnProperty(intrinsics, "%Symbol%"));
            DefineOwnProperty(globalThis, "Uint8Array", GetOwnProperty(intrinsics, "%Uint8Array%"));
            DefineOwnProperty(globalThis, "Uint8ClampedArray", GetOwnProperty(intrinsics, "%Uint8ClampedArray%"));
            DefineOwnProperty(globalThis, "Uint16Array", GetOwnProperty(intrinsics, "%Uint16Array%"));
            DefineOwnProperty(globalThis, "Uint32Array", GetOwnProperty(intrinsics, "%Uint32Array%"));            
            DefineOwnProperty(globalThis, "WeakMap", GetOwnProperty(intrinsics, "%WeakMap%"));
            DefineOwnProperty(globalThis, "WeakSet", GetOwnProperty(intrinsics, "%WeakSet%"));            
            DefineOwnProperty(globalThis, "console", GetOwnProperty(intrinsics, "%Console%"));
            DefineOwnProperty(globalThis, "decodeURI", GetOwnProperty(intrinsics, "%DecodeURI%"));
            DefineOwnProperty(globalThis, "decodeURIComponent", GetOwnProperty(intrinsics, "%DecodeURIComponent%"));
            DefineOwnProperty(globalThis, "encodeURI", GetOwnProperty(intrinsics, "%EncodeURI%"));
            DefineOwnProperty(globalThis, "encodeURIComponent", GetOwnProperty(intrinsics, "%EncodeURIComponent%"));
            DefineOwnProperty(globalThis, "escape", GetOwnProperty(intrinsics, "%Escape%"));
            DefineOwnProperty(globalThis, "eval", GetOwnProperty(intrinsics, "%Eval%"));
            LazyDefineFalseTrueFalse(globalThis, "global", globalThis);
            DefineOwnProperty(globalThis, "isNaN", GetOwnProperty(intrinsics, "%IsNaN%"));
            DefineOwnProperty(globalThis, "isFinite", GetOwnProperty(intrinsics, "%IsFinite%"));
            DefineOwnProperty(globalThis, "load", GetOwnProperty(intrinsics, "%Load%"));
            LazyDefineBuiltinConstant(globalThis, "null", null);
            DefineOwnProperty(globalThis, "parseInt", GetOwnProperty(intrinsics, "%ParseInt%"));
            DefineOwnProperty(globalThis, "parseFloat", GetOwnProperty(intrinsics, "%ParseFloat%"));
            DefineOwnProperty(globalThis, "request", GetOwnProperty(intrinsics, "%Request%"));
            DefineOwnProperty(globalThis, "setTimeout", GetOwnProperty(intrinsics, "%SetTimeout%"));
            LazyDefineBuiltinConstant(globalThis, "undefined", undefined);
            DefineOwnProperty(globalThis, "unescape", GetOwnProperty(intrinsics, "%Unescape%"));
            LazyDefineBuiltinConstant(globalThis, $$toStringTag, "syntaxjsGlobal")
            

        /*
	           DOM Wrapper 
        */

            if (typeof importScripts === "function") {
                DefineOwnProperty(globalThis, "self", GetOwnProperty(intrinsics, "%DOMWrapper%"));
            } else if (typeof window === "object") {
                DefineOwnProperty(globalThis, "window", GetOwnProperty(intrinsics, "%DOMWrapper%"));
                DefineOwnProperty(globalThis, "document", {
                    configurable: true,
                    enumerable: true,
                    value: globalThis.Get("window").Get("document"),
                    writable: true

                });
            } else if (typeof process === "object") {
                DefineOwnProperty(globalThis, "process", GetOwnProperty(intrinsics, "%DOMWrapper%"));
            }
            return globalThis;
        }


        LazyDefineProperty(intrinsics, "%DOMWrapper%", new ExoticDOMObjectWrapper(
                typeof importScripts === "function" ? self : typeof window === "object" ? window : process)
        );
 

        return intrinsics; // assignIntrinsics(intrinsics);

    } // createIntrinsics ()

    // *****************************************************************************************************************************************************************************
    // code and intrinsics: REALM (contains builtins + eval function)
    // *****************************************************************************************************************************************************************************   

    //
    // ---------------- this modul cares for suspending and restoring realms -----
    //

    
    var realms = [];

    function saveCodeRealm() {
        realms.push(realm);
    }

    function restoreCodeRealm() {
        setCodeRealm(realms.pop());
    }

    function setCodeRealm(r) {  // CREATE REALM (API)
        if (r) {
            realm = r;
            stack = realm.stack;
            intrinsics = realm.intrinsics;
            globalEnv = realm.globalEnv;
            globalThis = realm.globalThis;
        }
        require("lib/runtime").setCodeRealm(r);
    }

    function createRealm(options) {
        options = options || {}; // { createOnly: true, don´t set to current realm }

        if (console.time) console.time("Creating Realm...");

        
        var realm = new CodeRealm();
        setCodeRealm(realm); // loc
        var intrinsics = createIntrinsics(realm);
        realm.globalThis = OrdinaryObject(null);
        realm.globalEnv = new GlobalEnvironment(realm.globalThis);
        
        setCodeRealm(realm); // local
        // first context
        var cx;
        cx = newContext(null, realm.xs);
        // intrinsics
        createGlobalThis(realm.globalThis, realm.intrinsics);

        realm.loader = undefined;

        // quickAssignIntrVars(realm.xs);

        if (!options.createOnly) {
            var cx = getContext();
            cx.lexEnv = realm.globalEnv;
            cx.varEnv = realm.globalEnv;
        }
        
        
        realm.toString = function () { return "[object CodeRealm]"; }
        

        realm.toValue = function (code) {
            saveCodeRealm();
            setCodeRealm(realm);
            var result = ecma.Evaluate(code);
            restoreCodeRealm();
            return result;
        };
        
        if (console.time) console.timeEnd("Creating Realm...");

        return realm;
    }

    exports.createRealm = createRealm;
    exports.createIntrinsics = createIntrinsics;
    exports.setCodeRealm = setCodeRealm;
    exports.saveCodeRealm = saveCodeRealm;
    exports.restoreCodeRealm = restoreCodeRealm;

    return exports;
});

//******************************************************************************************************************************************************************************************************
// Jetzt die AST Runtime, die fuer ByteCode wiederholt werden muss
//******************************************************************************************************************************************************************************************************

define("lib/runtime", ["lib/parser", "lib/api", "lib/slower-static-semantics"], function (parse, ecma, statics) {
    "use strict";

    var i18n = require("lib/i18n-messages");

    var parseGoal = parse.parseGoal;

    var debugmode = false;

    function debug() {
        if (debugmode && typeof importScripts !== "function") console.log.apply(console, arguments);
    }

    function debugdir() {
        if (debugmode && typeof importScripts !== "function") console.dir.apply(console, arguments);
    }

    var isWorker = typeof importScripts === "function" && typeof window === "undefined";

    function log() {
        if (!isWorker) console.log.apply(console, arguments);
    }

    function dir() {
        if (!isWorker) console.dir.apply(console, arguments);
    }


/*
    The interfaces for refactoring the runtime for the Bytecode
*/

    
    function getCode(code, field) {
        return code[field];
    }



    function isCodeType(code, type) {
        return code.type === type;
    }


/*
    
*/


    //
    // Code REALM requiren




    // 

    var createRealm = ecma.createRealm;
    var writePropertyDescriptor = ecma.writePropertyDescriptor;

    // 
    // Alte Static Semantics (werden abgeloest)
    //

    var BoundNames = statics.BoundNames;
    var VarScopedDeclarations = statics.VarScopedDeclarations;
    var LexicallyScopedDeclarations = statics.LexicallyScopedDeclarations;
    var VarDeclaredNames = statics.VarDeclaredNames;
    var LexicallyDeclaredNames = statics.LexicallyDeclaredNames;
    var LexicalDeclarations = statics.LexicalDeclarations;
    var IsLexicalDeclaration = statics.IsLexicalDeclaration;
    var IsConstantDeclaration = statics.IsConstantDeclaration;
    var ReferencesSuper = statics.ReferencesSuper;
    var ConstructorMethod = statics.ConstructorMethod;
    var PrototypeMethodDefinitions = statics.PrototypeMethodDefinitions;
    var StaticMethodDefinitions = statics.StaticMethodDefinitions;
    var HasInitialiser = statics.HasInitialiser;
    var IsSimpleParameterList = statics.IsSimpleParameterList;
    var ExpectedArgumentCount = statics.ExpectedArgumentCount;
    var IsValidSimpleAssignmentTarget = statics.IsValidSimpleAssignmentTarget;
    var PropName = statics.PropName;
    var PropNameList = statics.PropNameList;
    var SpecialMethod = statics.SpecialMethod;
    var ElisionWidth = statics.ElisionWidth;
    var IsStrict = statics.IsStrict;
    var IsAnonymousFunctionDefinition = statics.IsAnonymousFunctionDefinition;
    var StringValue = statics.StringValue;
    var IsIdentifierRef = statics.IsIdentifierRef;

    //
    // essential-api (essential internals)
    //



    var List = ecma.List;
    var Assert = ecma.Assert;
    var assert = ecma.assert;
    var CreateDataProperty = ecma.CreateDataProperty;
    var CreateAccessorProperty = ecma.CreateAccessorProperty;
    var ToPropertyKey = ecma.ToPropertyKey;
    var IsPropertyKey = ecma.IsPropertyKey;
    var IsSymbol = ecma.IsSymbol;
    var IsAccessorDescriptor = ecma.IsAccessorDescriptor;
    var IsDataDescriptor = ecma.IsDataDescriptor;
    var IsGenericDescriptor = ecma.IsGenericDescriptor;
    var FromPropertyDescriptor = ecma.FromPropertyDescriptor;
    var ToPropertyDescriptor = ecma.ToPropertyDescriptor;
    var CompletePropertyDescriptor = ecma.CompletePropertyDescriptor;
    var ValidateAndApplyPropertyDescriptor = ecma.ValidateAndApplyPropertyDescriptor;
    var ThrowTypeError = ecma.ThrowTypeError;
    
    var withError = ecma.withError;
    var printException = ecma.printException;
    var makeMyExceptionText = ecma.makeMyExceptionText;


    var $$unscopables = ecma.$$unscopables;
    var $$create = ecma.$$create;
    var $$toPrimitive = ecma.$$toPrimitive;
    var $$toStringTag = ecma.$$toStringTag;
    var $$hasInstance = ecma.$$hasInstance;
    var $$iterator = ecma.$$iterator;
    var $$isRegExp = ecma.$$isRegExp;
    var $$isConcatSpreadable = ecma.isConcatSpreadable;

    var NewFunctionEnvironment = ecma.NewFunctionEnvironment;
    var NewObjectEnvironment = ecma.NewObjectEnvironment;
    var NewDeclarativeEnvironment = ecma.NewDeclarativeEnvironment;
    var OrdinaryObject = ecma.OrdinaryObject;
    var ObjectCreate = ecma.ObjectCreate;
    var IsCallable = ecma.IsCallable;
    var IsConstructor = ecma.IsConstructor;
    var OrdinaryConstruct = ecma.OrdinaryConstruct;
    var OrdinaryCreateFromConstructor = ecma.OrdinaryCreateFromConstructor;
    var FunctionCreate = ecma.FunctionCreate;
    var FunctionAllocate = ecma.FunctionAllocate;
    var FunctionInitialise = ecma.FunctionInitialise;
    var GeneratorFunctionCreate = ecma.GeneratorFunctionCreate;
    var OrdinaryFunction = ecma.OrdinaryFunction;
    var FunctionEnvironment = ecma.FunctionEnvironment;
    var SymbolPrimitiveType = ecma.SymbolPrimitiveType;
    var ExecutionContext = ecma.ExecutionContext;
    var CodeRealm = ecma.CodeRealm;
    var CompletionRecord = ecma.CompletionRecord;
    var NormalCompletion = ecma.NormalCompletion;
    var Completion = ecma.Completion;
    var OrdinaryHasInstance = ecma.OrdinaryHasInstance;
    var floor = ecma.floor;
    var ceil = ecma.ceil;
    var sign = ecma.sign;
    var abs = ecma.abs;
    var min = ecma.min;
    var max = ecma.max;
    var IdentifierBinding = ecma.IdentifierBinding;
    var GlobalEnvironment = ecma.GlobalEnvironment;
    var ObjectEnvironment = ecma.ObjectEnvironment;
    var ToNumber = ecma.ToNumber;
    var ToUint16 = ecma.ToUint16;
    var ToInt32 = ecma.ToInt32;
    var ToUint32 = ecma.ToUint32;
    var ToString = ecma.ToString;
    var ToObject = ecma.ToObject;
    var Type = ecma.Type;
    var Reference = ecma.Reference;
    var GetIdentifierReference = ecma.GetIdentifierReference;
    var GetThisEnvironment = ecma.GetThisEnvironment;
    var OrdinaryCreateFromConstructor = OrdinaryCreateFromConstructor;
    var GetValue = ecma.GetValue;
    var PutValue = ecma.PutValue;
    var SameValue = ecma.SameValue;
    var SameValueZero = ecma.SameValueZero;
    var ToPrimitive = ecma.ToPrimitive;
    var GetGlobalObject = ecma.GetGlobalObject;
    var ThisResolution = ecma.ThisResolution;
    var CreateArrayFromList = ecma.CreateArrayFromList;
    var CreateListFromArrayLike = ecma.CreateListFromArrayLike;
    var TestIntegrityLevel = ecma.TestIntegrityLevel;
    var SetIntegrityLevel = ecma.SetIntegrityLevel;
    var ifAbrupt = ecma.ifAbrupt;
    var isAbrupt = ecma.isAbrupt;
    var Intrinsics;
    var globalThis;
    var MakeConstructor = ecma.MakeConstructor;
    var ArrayCreate = ecma.ArrayCreate;
    var ArraySetLength = ecma.ArraySetLength;
    var unwrap = ecma.unwrap;
    var GeneratorStart = ecma.GeneratorStart;
    var GeneratorYield = ecma.GeneratorYield;
    var GeneratorResume = ecma.GeneratorResume;
    
    var CreateEmptyIterator = CreateEmptyIterator;
    var ToBoolean = ecma.ToBoolean;
    var ToString = ecma.ToString;
    var ToNumber = ecma.ToNumber;
    var ToUint32 = ecma.ToUint32;

    var newContext = ecma.newContext;
    var oldContext = ecma.oldContext;

    var CreateItrResultObject = ecma.CreateItrResultObject;
    var IteratorNext = ecma.IteratorNext;
    var IteratorComplete = ecma.IteratorComplete;
    var IteratorValue = ecma.IteratorValue;
    var GetIterator = ecma.GetIterator;

    var SetFunctionName = ecma.SetFunctionName;

    var Invoke = ecma.Invoke;
    var Get = ecma.Get;
    var Set = ecma.Set;
    var DefineOwnProperty = ecma.DefineOwnProperty;
    var DefineOwnPropertyOrThrow = ecma.DefineOwnPropertyOrThrow;
    var Delete = ecma.Delete;
    var Enumerate = ecma.Enumerate;
    var OwnPropertyKeys = ecma.OwnPropertyKeys;
    var SetPrototypeOf = ecma.SetPrototypeOf;
    var GetPrototypeOf = ecma.GetPrototypeOf;
    var PreventExtensions = ecma.PreventExtensions;
    var IsExtensible = ecma.IsExtensible;
    var Put = ecma.Put;

    var GetMethod = ecma.GetMethod;
    var HasProperty = ecma.HasProperty;
    var HasOwnProperty = ecma.HasOwnProperty;

    var IsPropertyReference = ecma.IsPropertyReference;
    var MakeSuperReference = ecma.MakeSuperReference;
    var IsUnresolvableReference = ecma.IsUnresolvableReference;
    var IsStrictReference = ecma.IsStrictReference;
    var HasPrimitiveBase = ecma.HasPrimitiveBase;
    var GetBase = ecma.GetBase;
    var GetReferencedName = ecma.GetReferencedName;
    var GetThisValue = ecma.GetThisValue;
    var empty = ecma.empty;
    var all = ecma.all;

    var getRealm = ecma.getRealm;
    var getLexEnv = ecma.getLexEnv;
    var getVarEnv = ecma.getVarEnv;
    var getIntrinsics = ecma.getIntrinsics;
    var getIntrinsic = ecma.getIntrinsic;
    var getGlobalThis = ecma.getGlobalThis;
    var getGlobalEnv = ecma.getGlobalEnv;
    var getState = ecma.getState;
    var getStack = ecma.getStack;
    var getContext = ecma.getContext;
    var getEventQueue = ecma.getEventQueue;

    var ArgumentsExoticObject = ecma.ArgumentsExoticObject;
    var AddRestrictedFunctionProperties = ecma.AddRestrictedFunctionProperties;
    var setInternalSlot = ecma.setInternalSlot;
    var getInternalSlot = ecma.getInternalSlot;
    var hasInternalSlot = ecma.hasInternalSlot;
    var callInternalSlot = ecma.callInternalSlot;
    var applyInternal = ecma.applyInternal;
    var setFunctionLength = ecma.setFunctionLength;

    //-----------------------------------------------------------
    // setze Call Funktion im anderen Modul zu Call fuer ASTNode:
    // ----------------------------------------------------------

    ecma.OrdinaryFunction.prototype.Call = Call;

    //
    // ----------------------------------------------------------
    //

    function setCodeRealm(r) {  // IN THE RUNTIME, 
                // before evaluate accepts a realm 
                // and public evalute is only defined on each realm

        if (r) {
            realm = r;
            stack = realm.stack;
            intrinsics = realm.intrinsics;
            globalEnv = realm.globalEnv;
            globalThis = realm.globalThis;
            eventQueue = realm.eventQueue;
        
        }
        

    }

    // ^ replacen mit realm und module system
    //
    //
    //

    function inStrict (node) {
        if (node && node.strict) return true;
        if (getLexEnv().strict) return true;
        return false;
    }

    var CheckObjectCoercible = ecma.CheckObjectCoercible;

    // ---- xs is used for intermodule 
    
    // -----
    var line, column;


    var cx; // der aktive Context; gegen getContext()
    var realm, intrinsics, globalEnv, globalThis;
    var stack, eventQueue;
    
    var scriptLocation;

    var initialisedTheRuntime = false;
    var evaluation = Object.create(null);

    var strictModeStack = [];
    var inStrictMode = false;
    var loc = {};

    var registerCompletionUpdater = ecma.registerCompletionUpdater;
    var insideGeneratorState = false;

    var IsFunctionDeclaration = statics.IsFunctionDeclaration;
    var IsFunctionExpression = statics.IsFunctionExpression;
    var IsGeneratorDeclaration = statics.IsGeneratorDeclaration;
    var IsGeneratorExpression = statics.IsGeneratorExpression;
    var IsVarDeclaration = statics.IsVarDeclaration;
    var isDuplicateProperty = statics.isDuplicateProperty;

    var CV = statics.CV;
    var MV = statics.MV;
    var SV = statics.SV;
    var TV = statics.TV;
    var TRV = statics.TRV;

    function unquote(str) {
        return str.replace(/^("|')|("|')$/g, ""); //'
    }

    var IsBindingPattern = {
        __proto__: null,
        "ObjectPattern": true,
        "ArrayPattern": true
    };

    var ControlStatement = {
        "IfStatement": true,
        "SwitchStatement": true
    };

    function assign(obj, obj2) {
        for (var k in obj2) {
            if (Object.hasOwnProperty.call(obj2, k)) obj[k] = obj2[k];
        }
        return obj;
    }

    function ResolveBinding(name) {
        var lex = getLexEnv();
        var strict = getContext().strict;
        return GetIdentifierReference(lex, name, strict);
    }

    function IsIdentifier(obj) {
        if (obj.type == "Identifier") return true;
        return false;
    }

    function InstantiateModuleDeclaration(module, env) {

        var ex;
        var lexNames = module.lexNames;
        var varNames = module.varNames;
        var boundNames = module.boundNames;

        for (var i = 0, j = lexNames.length; i < j; i++) {
            name = lexNames[i];
            if (env.HasBinding(name)) return withError("Syntax", "Instantiate module: Has var declaration: " + name);
        }

        for (i = 0, j = varNames.length; i < j; i++) {
            name = varNames[i];
            if (env.HasBinding(name)) return withError("Syntax", "Instantiate module: Has lexical declaration: " + name);
        }

    }

    function InstantiateGlobalDeclaration(script, env, deletableBindings) {
        "use strict";

        var name;
        var boundNamesInPattern;
        var code = script.body;
        var strict = !! script.strict;

        var cx = getContext();
        if (strict) cx.strict = true;

        var ex;
        var lexNames = LexicallyDeclaredNames(code);
        var varNames = VarDeclaredNames(code);
        var i, j, y, z;
        var status;

        for (i = 0, j = lexNames.length; i < j; i++) {
            if (name = lexNames[i]) {
                if (env.HasVarDeclaration(name)) return withError("Syntax", "Instantiate global: existing var declaration: " + name);
                if (env.HasLexicalDeclaration(name)) return withError("Syntax", "Instantiate global: existing lexical declaration: " + name);
            }
        }

        for (i = 0, j = varNames.length; i < j; i++) {
            if (name = varNames[i]) {
                if (env.HasLexicalDeclaration(name)) return withError("Syntax", "Instantiate global: var " + name + " has already a lexical declaration: " + name);
            }
        }

        var varDeclarations = script.varDeclarations || VarScopedDeclarations(script.body);
        var functionsToInitialize = [];
        var declaredFunctionNames = Object.create(null);
        var d;
        var fn;
        var fnDefinable;
        for (i = varDeclarations.length - 1, j = 0; i >= j; i--) {
            d = varDeclarations[i];
            debug("got declaration " + i);
            if (d.type === "FunctionDeclaration" || d.type === "GeneratorDeclaration") {
                fn = d && (d.id || d.id.name);
                fnDefinable = env.CanDeclareGlobalFunction(fn);
                debug("can declare global function " + fn + ", is " + fnDefinable);
                if (!fnDefinable) return withError("Type", "Instantiate global: can not declare global function: " + fn);
                declaredFunctionNames[fn] = d;
                functionsToInitialize.push(d);
            }
        }

        var vnDefinable;
        var declaredVarNames = Object.create(null);
        var vn;
        for (i = 0, j = varDeclarations.length; i < j; i++) {
            d = varDeclarations[i];

            if (d.type === "VariableDeclarator") {

                vn = d.id;
                if (!declaredVarNames[vn]) {
                    vnDefinable = env.CanDeclareGlobalVar(vn);
                    debug("Can declare global var: " + vn + ", is " + vnDefinable);
                    if (!vnDefinable) return withError("Type", "Instantiate global: can not declare global variable" + vn);
                    declaredVarNames[vn] = d;
                } else debug(vn + "is already declared");

            } else if (IsBindingPattern[d.type]) { // extra hack or spec update ?

                boundNamesInPattern = BoundNames(d.elements);
                for (y = 0, z = boundNamesInPattern.length; y < z; y++) {
                    vn = boundNamesInPattern[y];
                    if (!declaredVarNames[vn]) {
                        vnDefinable = env.CanDeclareGlobalVar(vn);
                        debug("Can declare global var: " + vn + ", is " + vnDefinable);
                        if (!vnDefinable) return withError("Type", "Instantiate global: can not declare global variable" + vn);
                        declaredVarNames[vn] = d;
                    } else debug(vn + "is already declared");
                }
            }

        }
        var fo;

        if (functionsToInitialize.length) debug("Functions to initialize: " + functionsToInitialize.length);

        for (i = 0, j = functionsToInitialize.length; i < j; i++) {
            d = functionsToInitialize[i];
            fn = d.id;
            fo = InstantiateFunctionObject(d, env);
            status = env.CreateGlobalFunctionBinding(fn, fo, deletableBindings);
            if (isAbrupt(status)) return status;
            //status = SetFunctionName(fo, fn);
            //if (isAbrupt(status)) return status;
        }
        var ex;
        for (var d in declaredVarNames) {
            status = env.CreateGlobalVarBinding(d, deletableBindings);
            if (isAbrupt(status)) return status;
        }

        var lexDeclarations = LexicalDeclarations(script.body);
        var dn, kind;
        for (i = 0, j = lexDeclarations.length; i < j; i++) {
            debug("lexdecls: " + j);
            d = lexDeclarations[i];
            dn = d.id;
            kind = d.kind;
            if (IsBindingPattern[d.type]) { // extra hack
                boundNamesInPattern = BoundNames(d.elements);
                for (y = 0, z = boundNamesInPattern.length; y < z; y++) {
                    dn = boundNamesInPattern[y];
                    if (kind === "const") status = env.CreateImmutableBinding(dn);
                    else status = env.CreateMutableBinding(dn);
                    if (isAbrupt(status)) return status;
                }
            } else if (kind === "const") {
                status = env.CreateImmutableBinding(dn);
                if (isAbrupt(status)) return status;
            } else if (kind === "let") {
                status = env.CreateMutableBinding(dn, deletableBindings);
                if (isAbrupt(status)) return status;
            } else if (d.generator) {
                fn = d.id;
                fo = InstantiateFunctionObject(d, env);
                status = env.CreateMutableBinding(fn);
                if (isAbrupt(status)) return status;
                status = env.InitialiseBinding(fn, fo, false);
                if (isAbrupt(status)) return status;
                //status = SetFunctionName(fo, fn);
                //if (isAbrupt(status)) return status;
            }

        }
    }

    function InstantiateBlockDeclaration(code, env) {
        "use strict";
        var ex;
        var declarations = LexicalDeclarations(code);
        var decl, functionsToInitialize = [];
        var fn;
        var fo;
        var type;
        var status;

        for (var i = 0, j = declarations.length; i < j; i++) {
            if (decl = declarations[i]) {
                if (!decl.vmDeclared) {
                    if (type === "LexicalDeclaration") {
                        if (decl.kind === "const") {
                            status = env.CreateImmutableBinding(decl.id);
                            if (isAbrupt(status)) return status;
                        } else {
                            status = env.CreateMutableBinding(decl.id);
                            if (isAbrupt(status)) return status;
                        }
                    } else if ((type === "FunctionDeclaration" || type === "GeneratorDeclaration") && (!decl.expression)) {
                        functionsToInitialize.push(decl);
                    }
                }
            }
        }
        for (i = 0, j = functionsToInitialize.length; i < j; i++) {
            fn = functionsToInitialize[i].id;
            fo = InstantiateFunctionObject(functionsToInitialize[i], env);
            env.SetMutableBinding(fn, fo, false);
            SetFunctionName(fo, fn);
        }
    }

    function InstantiateFunctionObject(node, env) {

        var F;
        var params = getCode(node, "params");
        var body = getCode(node, "body");
        var generator = node.generator;

        var strict = cx.strict || node.strict;
        var scope = env;

        if (!generator) {
            var name = node.id;
            F = FunctionCreate("normal", params, body, scope, strict);
            MakeConstructor(F);
            if (name) SetFunctionName(F, name);
        } else if (generator) {
            strict = true;
            var name = node.id;
            F = GeneratorFunctionCreate("generator", params, body, scope, strict);
            var GeneratorPrototype = getIntrinsic("%GeneratorPrototype%");
            var prototype = ObjectCreate(GeneratorPrototype);
            if (name) SetFunctionName(F, name);
            MakeConstructor(F, true, prototype);
        }
        var realm = getRealm();
        setInternalSlot(F, "Realm", realm);
        return F;
    }

    function InstantiateFunctionDeclaration(F, argList, env) {
        "use strict";
        var x;

        //console.log("ins=");
        //console.dir(argList);

        var code = getInternalSlot(F, "Code");
        var formals = getInternalSlot(F, "FormalParameters");
        var strict = getInternalSlot(F, "Strict");

        var boundNamesInPattern;
        var parameterNames = BoundNames(formals);
        var varDeclarations = VarScopedDeclarations(code);
        var argumentsObjectNeeded;

        if (F.ThisMode === "lexical") argumentsObjectNeeded = false;
        else argumentsObjectNeeded = true;

        var d;
        var fn;
        var fo;
        var functionsToInitialise = [];
        var alreadyDeclared;
        var status;
        for (var j = 0, i = varDeclarations.length; i >= j; i--) {
            if (d = varDeclarations[i]) {

                if (IsFunctionDeclaration(d)) {
                    fn = BoundNames(d)[0];
                    alreadyDeclared = env.HasBinding(fn);
                    if (isAbrupt(alreadyDeclared)) return alreadyDeclared;
                    if (!alreadyDeclared) {
                        env.CreateMutableBinding(fn);
                        functionsToInitialise.push(d);
                    }
                }
            }
        }

        var paramName;
        for (i = 0, j = parameterNames.length; i < j; i++) {
            if (paramName = parameterNames[i]) {
                alreadyDeclared = env.HasBinding(paramName);
                if (!alreadyDeclared) {
                    if (paramName === "arguments") argumentsObjectNeeded = false;
                    status = env.CreateMutableBinding(paramName, false);
                    //if (isAbrupt(status)) return status;
                }
            }
        }

        if (argumentsObjectNeeded) {
            if (strict) {
                env.CreateImmutableBinding("arguments");
            } else {
                env.CreateMutableBinding("arguments");
            }
        }
        var varNames = VarDeclaredNames(code);
        var varName;
        for (i = 0, j = varNames.length; i < j; i++) {
            if (varName = varNames[i]) {
                alreadyDeclared = env.HasBinding(varName);
                if (!alreadyDeclared) {
                    var status = env.CreateMutableBinding(varName);
                    //if (isAbrupt(status)) return status;
                }
            }
        }
        var lexDeclarations = LexicalDeclarations(code);
        var dn, bn;
        for (i = 0, j = lexDeclarations.length; i < j; i++) {
            if (d = lexDeclarations[i]) {
                bn = BoundNames(d);
                for (var y = 0, z = bn.length; y < z; y++) {
                    dn = bn[y];
                    if (IsGeneratorDeclaration(d)) {
                        functionsToInitialise.push(d);
                    } else if (IsConstantDeclaration(d)) {
                        env.CreateImmutableBinding(dn);
                    } else {
                        env.CreateMutableBinding(dn);
                    }
                }
            }
        }
        for (i = 0, j = functionsToInitialise.length; i < j; i++) {
            if (d = functionsToInitialise[i]) {
                fn = BoundNames(d)[0];
                fo = InstantiateFunctionObject(d, env);
                env.InitialiseBinding(fn, fo, false);
            }
        }

        var ao = InstantiateArgumentsObject(argList);


        if ((ao = ifAbrupt(ao)) && isAbrupt(ao)) return ao;
        var formalStatus = BindingInitialisation(formals, ao, undefined);

        if (argumentsObjectNeeded) {
            
            if (strict) {
                CompleteStrictArgumentsObject(ao);
            } else {
                CompleteMappedArgumentsObject(ao, F, formals, env);
            }
            env.InitialiseBinding("arguments", ao);
        }
        return F;
    }

    function InstantiateArgumentsObject(args) {
        
        var len = args.length;
        var obj = ArgumentsExoticObject();


        /* callInternalSlot("DefineOwnProperty", */

        writePropertyDescriptor(obj, "length", {
            value: len,
            writable: true,
            configurable: true,
            enumerable: false
        });
        
        var indx = len - 1;
        var val;


        while (indx >= 0) {
            val = args[indx];
            //callInternalSlot("DefineOwnProperty", 
            writePropertyDescriptor(obj, ToString(indx), {
                value: val,
                writable: true,
                enumerable: true,
                configurable: true
            });
            indx = indx - 1;
        }
        return obj;
    }

    function CompleteStrictArgumentsObject(obj) {
        AddRestrictedFunctionProperties(obj);
        return obj;
    }

    function CompleteMappedArgumentsObject(obj, F, formals, env) {

        var len = Get(obj, "length");

        var mappedNames = Object.create(null);
        var numberOfNonRestFormals;
        var i = 0;

        while (i < formals.length) {
            if (formals[i].type === "RestParameter") break;
            ++i;
        }

        numberOfNonRestFormals = i;
        var map = ObjectCreate();

        var name;
        var indx = len - 1;
        var param;

        while (indx >= 0) {

            if (indx < numberOfNonRestFormals) {
                param = formals[indx];

                if (IsBindingPattern[param.type]) { // extra hack ?
                    
                    var elem;
                    for (var x = 0, y = param.elements.length; x < y; x++) {
                        elem = param.elements[i];
                        name = elem.as ? elem.as.name : (elem.name || elem.value);
                            if (!mappedNames[name]) {
                                mappedNames[name] = true;
                                var g = MakeArgGetter(name, env);
                                var s = MakeArgSetter(name, env);
                                callInternalSlot("DefineOwnProperty", map, name, {
                                    get: g,
                                    set: s,
                                    enumerable: true,
                                    configurable: true
                                });
                            }
                    }

                } else {

                    if (param.type === "Identifier") {
                        name = param.name || param.value;
                    } else if (param.type === "DefaultParameter") {
                        name = param.id;
                    } else name = "";

                    
                    if (name && !mappedNames[name]) {
                        mappedNames[name] = true;
                        var g = MakeArgGetter(name, env);
                        var s = MakeArgSetter(name, env);
                        callInternalSlot("DefineOwnProperty", map, name, {
                            get: g,
                            set: s,
                            enumerable: true,
                            configurable: true
                        });
                    }
                }
            }
            indx = indx - 1;
        }

        if (Object.keys(mappedNames).length) {
            setInternalSlot(obj, "ParameterMap", map);
        }
        
        callInternalSlot("DefineOwnProperty", obj, "callee", {
            value: F,
            writable: false,
            configurable: false,
            enumerable: false
        });
        return obj;
    }

    function makeArgumentsGetter(name) {
        return [{
            type: "ReturnStatement",
            argument: {
                type: "Identifier",
                name: name
            }
        }];
    }

    function makeArgumentsSetterFormals(name) {
        return [{
            type: "Identifier",
            name: name + "_arg"
        }];
    }

    function makeArgumentsSetter(name) {
        return {
            type: "AssigmentExpression",
            operator: "=",
            left: {
                type: "Identifier",
                name: name
            },
            right: {
                type: "Identifier",
                name: name + "_arg"
            }
        };
    }

    function MakeArgGetter(name, env) {
        var bodyText = makeArgumentsGetter(name);
        var formals = [];
        //var bodyText = parseGoal("FunctionBody", "return " + name + ";");
        //var formals = [];
        var F = FunctionCreate("normal", formals, bodyText, env, true);
        return F;
    }

    function MakeArgSetter(name, env) {
        var bodyText = makeArgumentsSetter(name);
        var formals = makeArgumentsSetterFormals(name);
        //var bodyText = parseGoal("FunctionBody", name + "= " + name + "_arg;");
        //var formals = parseGoal("FormalParameterList", name + "_arg");
        var F = FunctionCreate("normal", formals, bodyText, env, true);
        return F;
    }

    /********************************************************************** continuing with the ast ********************************************************************************/

    function ArgumentListEvaluation(list) {
        var args = [],
            arg;
        var type, value;

        for (var i = 0, j = list.length; i < j; i++) {

            arg = list[i];
            type = arg.type;

            if (type === "TemplateLiteral") {

                var siteObj = GetTemplateCallSite(arg);
                var substitutions = SubstitutionEvaluation(siteObj);
                if ((substitutions = ifAbrupt(substitutions)) && isAbrupt(substitutions)) return substitutions;
                args.push(siteObj);
                for (var k = 0, l = substitutions.length; k < l; k++) {
                    args.push(substitutions[k]);
                }

            } else if (type === "SpreadExpression") {

                var array = GetValue(Evaluate(arg));
                if ((arg = ifAbrupt(arg)) && isAbrupt(arg)) return arg;
                for (var k = 0, l = Get(array, "length"); k < l; k++) {
                    value = Get(array, ToString(k));
                    if ((value = ifAbrupt(value)) && isAbrupt(value)) return value;
                    args.push(value);
                }

            } else {

                // Identifer und Literals.
                var argRef = Evaluate(arg);
                if ((argRef = ifAbrupt(argRef)) && isAbrupt(argRef)) return argRef;
                var argValue = GetValue(argRef);
                if ((argValue = ifAbrupt(argValue)) && isAbrupt(argValue)) return argValue;
                args.push(argValue);
            }

        }

        // console.dir(args);
        return args;
    }

    function EvaluateCall(ref, args, tailPosition) {
        var thisValue;
        var func = GetValue(ref);
        if ((func = ifAbrupt(func)) && isAbrupt(func)) return func;
        var argList = ArgumentListEvaluation(args);
//console.dir(argList)
        if ((argList = ifAbrupt(argList)) && isAbrupt(argList)) return argList;
        if (Type(func) !== "object") return withError("Type", "EvaluateCall: func is not an object");
        if (!IsCallable(func)) return withError("Type", "EvaluateCall: func is not callable");
        if (Type(ref) === "reference") {
            if (IsPropertyReference(ref)) {
                thisValue = ref.GetThisValue();
            } else {
                var env = GetBase(ref);
                thisValue = env.WithBaseObject();
            }
        } else {
            thisValue = undefined;
        }
        if (tailPosition) {
            //    PrepareForTailCall();
        }

        var result = callInternalSlot("Call", func, thisValue, argList);

        //var call = getInternalSlot(func, "Call");
        //var result = call.call(func, thisValue, argList);
        // var result = func.Call(thisValue, argList);

        //if (tailPosition) {
        //}
        return result;

    }

    function Call(thisArg, argList) {

        var F = this;
        var params = getInternalSlot(this, "FormalParameters");
        var code = getInternalSlot(this, "Code");
        var thisMode = getInternalSlot(this, "ThisMode");
        var scope = getInternalSlot(this, "Environment");
        var status, result;
        var fname;
        var localEnv;

        if (!code) return withError("Type", "Call: this value has no [[Code]] slot");

        var callerContext = getContext();

        var calleeContext = newContext();

        var calleeName = Get(this, "name");
        var callerName = callerContext.callee;

        calleeContext.caller = callerName;
        calleeContext.callee = calleeName;

        if (thisMode === "lexical") {
            localEnv = NewDeclarativeEnvironment(scope);
        } else {
            if (thisMode === "strict") {
                this.thisValue = thisArg;
            } else {
                if (thisArg === null || thisArg === undefined) this.thisValue = getGlobalThis();
                else if (Type(thisArg) !== "object") {
                    var thisValue = ToObject(thisArg);
                    // neu
                   // if (isAbrupt(thisValue)) return thisValue;
                    // 
                    this.thisValue = thisValue;
                } else this.thisValue = thisArg;
            }
            localEnv = NewFunctionEnvironment(this, this.thisValue);
        }


        calleeContext.varEnv = localEnv;
        calleeContext.lexEnv = localEnv;


        var status = InstantiateFunctionDeclaration(this, argList, localEnv);
        if ((status = ifAbrupt(status)) && isAbrupt(status)) {
            return status;
        }


        cx = calleeContext;

        var result;
        result = EvaluateBody(this);

        cx = oldContext();
        Assert(cx === callerContext, "The right context could not be popped from the stack");
        return result;
    }

    function PrepareForTailCall() {
        cx = oldContext();
    }

    evaluation.SpreadExpression = SpreadExpression;

    function SpreadExpression(node) {
        return Evaluate(node.argument);
    }

    evaluation.BreakStatement = BreakStatement;

    function BreakStatement(node) {
        return Completion("break", undefined, node.label || empty);
    }

    evaluation.ContinueStatement = ContinueStatement;

    function ContinueStatement(node) {
        return Completion("continue", undefined, node.label || empty);
    }

    evaluation.ThrowStatement = ThrowStatement;

    function ThrowStatement(node) {
        var expr = getCode(node, "argument");
        
        var exprRef = Evaluate(expr);
        if (isAbrupt(exprRef)) return exprRef;
        var exprValue = GetValue(exprRef);

        return Completion("throw", exprValue, empty);
    }

    evaluation.ReturnStatement = ReturnStatement;

    function ReturnStatement(node) {
        var expr = getCode(node, "argument");
        var exprRef = Evaluate(expr);
        if (isAbrupt(exprRef)) return exprRef;
        var exprValue = GetValue(exprRef);
        return Completion("return", exprValue, empty);
    }

    /* completion ende */

    evaluation.YieldExpression = YieldExpression;

    function YieldExpression(node, completion) {

        var parent = node.parent;
        var expression = getCode(node, "argument");
        var delegator = node.delegator;

        if (!expression) {
            return GeneratorYield(CreateItrResultObject(undefined, false));
        }

        var exprRef = Evaluate(expression);
        var value = GetValue(exprRef);
        if ((value = ifAbrupt(value)) && isAbrupt(value)) return value;
        if (delegator) {
            var iterator = GetIterator(value);
            if ((iterator = ifAbrupt(iterator)) && isAbrupt(iterator)) return iterator;
            var received = completion || NormalCompletion(undefined);
            var innerResult, done, innerValue;
            for (;;) {
                if (received.type === "normal") {
                    innerResult = IteratorNext(iterator, received.value);
                    if ((innerResult = ifAbrupt(innerResult)) && isAbrupt(innerResult)) return innerResult;
                } else {
                    Assert(received.type === "throw", "YieldExpression: at this point the completion has to contain the throw type");
                    if (HasProperty(iterator, "throw")) {
                        innerResult = Invoke(iterator, "throw", [received.value]);
                        if ((innerResult = ifAbrupt(innerResult)) && isAbrupt(innerResult)) return innerResult;
                    } else {
                        return received;
                    }
                }
                donone = IteratorComplete(iterator);
                if ((done = ifAbrupt(done)) && isAbrupt(done)) return done;
                if (done) {
                    innerValue = IteratorValue(innerResult);
                    return innerValue;
                }
                received = GeneratorYield(innerResult);
            }
        } else {
            return GeneratorYield(CreateItrResultObject(value, false));
        }
    }

    /****************************************************/

    // put to xs and eval once each realm.

    ecma.EvaluateBody = EvaluateBody;
    ecma.Evaluate = Evaluate;
    ecma.CreateGeneratorInstance = CreateGeneratorInstance;

    /****************************************************/

    function CreateGeneratorInstance(F) {
        var env = GetThisEnvironment();
        var G = env.GetThisBinding();
        if (Type(G) !== "object" || (Type(G) === "object" && getInternalSlot(G, "GeneratorState") === undefined)) {
            var newG = OrdinaryCreateFromConstructor(F, "%GeneratorPrototype%", {
                "GeneratorState": undefined,
                "GeneratorContext": undefined
            });
            if ((newG = ifAbrupt(newG)) && isAbrupt(newG)) return newG;
            G = newG;
        }
        return GeneratorStart(G, F.Code);
    }

    var SkipMeDeclarations = {
        __proto__: null,
        "FunctionDeclaration": true,
        "GeneratorDeclaration": true
    };

    function SkipDecl(node) {
        if (SkipMeDeclarations[node.type] && !node.expression) return true;
        return false;
    }

    function EvaluateConciseBody(F) {
        "use strict";
        var code = F.Code;
        var exprRef, exprValue;
        var node;

        if (!Array.isArray(code) && code) {
            exprValue = GetValue(Evaluate(code));
            if (isAbrupt(exprValue)) return exprValue;
            return NormalCompletion(exprValue);
        }

        for (var i = 0, j = code.length; i < j; i++) {
            if ((node = code[i]) && !SkipDecl(node)) {
                tellExecutionContext(node, i);
                exprRef = Evaluate(node);
                if (isAbrupt(exprRef)) {
                    if (exprRef.type === "return") {
                        return NormalCompletion(exprRef.value);
                    } else return exprRef;
                }
            }
        }
        return exprRef;
    }

    function EvaluateBody(F) {
        "use strict";
        var exprRef, exprValue;
        var node;

        var code = getInternalSlot(F,"Code");
        var kind = getInternalSlot(F, "FunctionKind");
        var thisMode = getInternalSlot(F, "ThisMode");
        
        if (kind === "generator") {
            return CreateGeneratorInstance(F);
        } else if (thisMode === "lexical" || kind === "arrow") {
            return EvaluateConciseBody(F);
        }

        // FunctionBody
        for (var i = 0, j = code.length; i < j; i++) {
            if ((node = code[i]) && !SkipDecl(node)) {
                tellExecutionContext(node, i);
                exprRef = Evaluate(node);

                if (isAbrupt(exprRef)) {
                    if (exprRef.type === "return") {
                        return NormalCompletion(exprRef.value);
                    } else return exprRef;
                }
            }
        }
        return exprRef;
    }

    /******************************************************************************************************************************************************************/
    evaluation.GeneratorExpression = GeneratorDeclaration;
    evaluation.GeneratorDeclaration = GeneratorDeclaration;

    function GeneratorDeclaration(node) {
        "use strict";

        var params = getCode(node, "params");
        var body = getCode(node, "body");
        var id = node.id;
        var gproto = Get(getIntrinsics(), "%GeneratorPrototype%");
        var scope = getLexEnv();
        var strict = true;
        var closure;
        var isExpression = node.expression;
        var prototype;

        if (isExpression) {
            scope = NewDeclarativeEnvironment(scope);
            closure = GeneratorFunctionCreate("generator", params, body, scope, strict);
            prototype = ObjectCreate(gproto);
            MakeConstructor(closure, true, prototype);
            if (id) {
                scope.CreateMutableBinding(id);
                scope.InitialiseBinding(id, closure);
                SetFunctionName(closure, id);
            }
            return closure;
        } else {
            return NormalCompletion(empty);
        }
        return closure;
    }

    evaluation.ArrowExpression = ArrowExpression;

    function ArrowExpression(node) {
        "use strict";
        var F;
        var scope = getLexEnv();
        var body = getCode(node, "body");
        var params = getCode(node, "params");
        var strict = true;
        F = FunctionCreate("arrow", params, body, scope, strict);
        F.ThisMode = "lexical";
        //MakeConstructor(F);
        return NormalCompletion(F);
    }

    evaluation.FunctionExpression = FunctionDeclaration;
    evaluation.FunctionDeclaration = FunctionDeclaration;

    function FunctionDeclaration(node, objectdecl) {
        "use strict";
        var F;
        var id = node.id;
        var expr = node.expression;
        var params = getCode(node, "params");
        var body = getCode(node, "body");
        var scope;
        var strict = cx.strict || node.strict;
        if (expr || objectdecl) {
            if (id) {
                scope = NewDeclarativeEnvironment(getLexEnv());
                status = scope.CreateMutableBinding(id);
                if (isAbrupt(status)) return status;
            } else scope = getLexEnv();
            F = FunctionCreate("normal", params, body, scope, strict);
            MakeConstructor(F);
            if (id) {
                var status;
                status = SetFunctionName(F, id);
                if (isAbrupt(status)) return status;
                status = scope.InitialiseBinding(id, F);
                if (isAbrupt(status)) return status;
            }
            return NormalCompletion(F);
        }
        return NormalCompletion(empty);
    }

    evaluation.MemberExpression = MemberExpression;
    function MemberExpression(node) {
        "use strict";

        var notSuperExpr = node.object.type !== "SuperExpression";

        var propertyNameReference;
        var propertyNameValue;
        var propertyNameString;
        var baseReference;
        var baseValue;
        var o = node.object;
        var p = node.property;
        var strict = cx.strict;

        if (notSuperExpr) {
            baseReference = Evaluate(o);
            baseValue = GetValue(baseReference);
            if ((baseValue=ifAbrupt(baseValue)) && isAbrupt(baseValue)) return baseValue;

        }

        if (node.computed) {

            propertyNameReference = Evaluate(p);
            if ((propertyNameReference = ifAbrupt(propertyNameReference)) && isAbrupt(propertyNameReference)) return propertyNameReference;
            propertyNameValue = GetValue(propertyNameReference);
            if ((propertyNameValue = ifAbrupt(propertyNameValue)) && isAbrupt(propertyNameValue)) return propertyNameValue;

        } else {

            propertyNameValue = p.name || p.value;

        }

        propertyNameString = ToPropertyKey(propertyNameValue);

        if (notSuperExpr) {

            var bv = CheckObjectCoercible(baseValue);
            if ((bv = ifAbrupt(bv)) && isAbrupt(bv)) return bv;
            var ref = new Reference(propertyNameString, bv, strict);
            return ref;

        } else {

            return MakeSuperReference(propertyNameString, strict);
        }
    }

    evaluation.NewExpression = NewExpression;

    function NewExpression(node) {
        "use strict";
        var exprRef;
        var O, callee;
        var cx = getContext();
        var strict = cx.strict;
        var notSuperExpr = node.callee.type !== "SuperExpression";

        if (notSuperExpr) {
            exprRef = Evaluate(node.callee);
            if ((exprRef = ifAbrupt(exprRef)) && isAbrupt(exprRef)) return exprRef;
            callee = GetValue(exprRef);
        } else {
            exprRef = MakeSuperReference(undefined, strict);
            if ((exprRef = ifAbrupt(exprRef)) && isAbrupt(exprRef)) return exprRef;
            callee = GetValue(exprRef);
        }

        if ((callee = ifAbrupt(callee)) && isAbrupt(callee)) return callee;

        if (!IsConstructor(callee)) {
            return withError("Type", "expected function is not a constructor");
        }

        if (callee) {
            cx.callee = "(new) " + (Get(callee, "name") || "(anonymous)");
        }

        var args = node.arguments;
        var argList;
        if (args) argList = ArgumentListEvaluation(args);
        else argList = [];
        return OrdinaryConstruct(callee, argList);
    }

    evaluation.CallExpression = CallExpression;

    function CallExpression(node) {
        "use strict";

        var callee = node.callee;
        var notSuperExpr = callee.type !== "SuperExpression";
        var strict = cx.strict;

        var tailCall = !! node.tailCall;
        var exprRef;

        if (notSuperExpr) {
            exprRef = Evaluate(callee);
            if ((exprRef = ifAbrupt(exprRef)) && isAbrupt(exprRef)) return exprRef;
            return EvaluateCall(exprRef, node.arguments, tailCall);
        } else {
            exprRef = MakeSuperReference(undefined, strict);
            if ((exprRef = ifAbrupt(exprRef)) && isAbrupt(exprRef)) return exprRef;
            return EvaluateCall(exprRef, node.arguments, tailCall);
        }
    }

    evaluation.LexicalDeclaration = VariableDeclaration;
    evaluation.VariableDeclaration = VariableDeclaration;

    function VariableDeclaration(node) {
        var decl, decl2, init, arr, initialiser, status, env;

        // console.log("decl for "+node.type);
        var env = isCodeType("VariableDeclaration") ? (node.kind === "var" ? getVarEnv() : getLexEnv()) : getLexEnv();
        var i, j, p, q, type

        var name;

        var strict = cx.strict;

        for (i = 0, j = node.declarations.length; i < j; i++) {
            decl = node.declarations[i];
            type = decl.type;

            // wird von binding intialisation vorher initialisiert,
            // hier wird das initialiser assignment durchgefuehrt, wenn
            // der code evaluiert wird.

            if (type === "ArrayPattern" || type === "ObjectPattern") {

                if (decl.init) initialiser = GetValue(Evaluate(decl.init));
                else return withError("Type", "Destructuring Patterns must have some = Initialiser.");
                if (isAbrupt(initialiser)) return initialiser;

                status = BindingInitialisation(decl, initialiser, env);
                if ((status = ifAbrupt(status)) && isAbrupt(status)) return status;

            } else {

                if (decl.init) {
                    name = decl.id;
                    initialiser = GetValue(Evaluate(decl.init));

                    if (isAbrupt(initialiser)) return initialiser;

                    if (IsCallable(initialiser)) {
                        if (IsAnonymousFunctionDefinition(decl.init) && !HasOwnProperty(initialiser, "name")) {
                            SetFunctionName(initialiser, name);
                        }
                    }
                    status = BindingInitialisation(name, initialiser, env);
                    if ((status = ifAbrupt(status)) && isAbrupt(status)) return status;
                }
            }

        }
        return NormalCompletion();
    }

    function KeyedBindingInitialisation(decl, obj, env) {
        var elem;
        var val;
        var identName, newName;
        if (decl.type === "ObjectPattern" || decl.type === "ObjectExpression") {

            for (var p = 0, q = decl.elements.length; p < q; p++) {

                if (elem = decl.elements[p]) {
                    if (elem.id) {
                        identName = elem.id.name || elem.id.value;
                        newName = elem.as.name || elem.as.value;
                    } else {
                        identName = elem.name || elem.value;
                        newName = undefined;
                    }

                    var val = Get(obj, ToString(identName));
                    if (env !== undefined) {
                        if (newName) env.InitialiseBinding(newName, val);
                        else env.InitialiseBinding(identName, val);
                    } else {
                        var lref = Evaluate(elem);
                        if ((lref = ifAbrupt(lref)) && isAbrupt(lref)) return lref;
                        PutValue(lref, val);
                    }
                }

            }
        }

        return NormalCompletion();

    }

    evaluation.BindingElement = function (node) {
        if (node.as) {
            return ResolveBinding(node.as);
        } else {
            return Identifier(node);
        }
        return null;
    }

    function IteratorBindingInitialisation() {

    }

    function IndexedBindingInitialisation(decl, nextIndex, value, env) {
        "use strict";
        var len = Get(value, "length");
        var elem;
        var index = 0;
        var ref;
        var val;
        var identName, newName;

        if ((decl && decl.type === "ArrayPattern") ||
            (decl && decl.type === "ArrayExpression")) {

            for (var i = 0, j = decl.elements.length; i < j; i++) {
                if (elem = decl.elements[i]) {

                    if (elem.id) {
                        identName = elem.id.name;
                        newName = elem.as.name;
                    } else {
                        identName = elem.name || elem.value;
                        newName = undefined;
                    }

                    val = Get(value, ToString(i));
                    // nextIndex = nextIndex + 1;

                    if (env !== undefined) {
                        if (newName) env.InitialiseBinding(newName, val);
                        else env.InitialiseBinding(identName, val);
                    } else {
                        var lref = Evaluate(elem);
                        if ((lref = ifAbrupt(lref)) && isAbrupt(lref)) return lref;
                        PutValue(lref, array);
                    }
                }

            }

        } else if (decl && decl.type === "RestParameter") {

            var array = ArrayCreate(len - nextIndex);
            var name = decl.id;

            debug("processing restparameter: " + name);

            for (var i = nextIndex; i < len; i++) {
                elem = value.Get(ToString(i), value);
                if ((elem = ifAbrupt(elem)) && isAbrupt(elem)) return elem;
                array.DefineOwnProperty(ToString(index), {
                    value: elem,
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
                index = index + 1;
            }

            if (env !== undefined) {
                env.InitialiseBinding(name, array);

            } else {

                // wird bei function f(...rest) gerufen:

                var lref = new Reference(name, getLexEnv(), cx.strict);

                //lref = ResolveBinding(name);

                if ((lref = ifAbrupt(lref)) && isAbrupt(lref)) return lref;
                PutValue(lref, array);
            }
        }

        return len;

    }

    function BindingInitialisation(node, value, env) {
        "use strict";
        var names, name, val, got, len, ex, decl, lhs, strict;
        var type;
        if (!node) return;

     /*   console.log("BINDINGINIT:")
        console.dir(node);
        console.dir(value);
        console.dir(env); */

        if (Array.isArray(node)) { // F.FormalParameters: formals ist ein Array

            for (var i = 0, j = node.length; i < j; i++) {

                decl = node[i];
                type = decl.type;

                if (type === "ObjectPattern") {
                    ex = KeyedBindingInitialisation(decl, Get(value, ToString(i)), env);
                    if (isAbrupt(ex)) return ex;
                } else if (type === "ArrayPattern") {
                    ex = IndexedBindingInitialisation(decl, undefined, Get(value, ToString(i)), env);
                    if (isAbrupt(ex)) return ex;
                } else if (type === "RestParameter") {
                    ex = IndexedBindingInitialisation(decl, i, value, env);
                    if (isAbrupt(ex)) return ex;
                } else {
                    ex = BindingInitialisation(decl, Get(value, ToString(i)), env);
                    if (isAbrupt(ex)) return ex;
                }

            }
            return NormalCompletion(undefined);
        }

        type = node.type;
        strict = !! cx.strict;

        if (type === "ForDeclaration") {
            return BindingInitialisation(node.id, value, env);

        } else if (type === "DefaultParameter") {

            name = node.id;

            if (value === undefined) value = GetValue(Evaluate(node.init));

            if (env !== undefined) env.InitialiseBinding(name, value, strict);
            else {
                //env = getLexEnv();
                //lhs = new Reference(name, env, strict);
                lhs = ResolveBinding(name);
                PutValue(lhs, value);
            }
            return NormalCompletion(undefined);

        } else if (type === "Identifier") {

            name = node.name;

            if (env !== undefined) {
                ex = env.InitialiseBinding(name, value, strict);
                if (isAbrupt(ex)) return ex;

                return NormalCompletion(undefined);

            } else {

                //lhs = new Reference(name, getLexEnv(), strict);
                //if ((lhs = ifAbrupt(lhs)) && isAbrupt(lhs)) return lhs;
                lhs = ResolveBinding(name);
                //	console.log("lhs=");
                //	console.dir(lhs);
                ex = PutValue(lhs, value);
                if (isAbrupt(ex)) return ex;
                return NormalCompletion(undefined);
            }

        } else if (type === "ArrayPattern" || type === "ArrayExpression") {

            var decl;
            for (var p = 0, q = node.elements.length; p < q; p++) {

                if (decl = node.elements[p]) {

                    if (decl.type === "RestParameter") {

                        return IndexedBindingInitialisation(decl, p, value, env);

                    } else {

                        if (env) {
                            if (decl.id) {
                                env.InitialiseBinding(decl.as.name, value.Get(decl.id.name, value));
                            } else {
                                env.InitialiseBinding(decl.name, value.Get(ToString(p), value));
                            }
                        } else {
                            if (decl.id) {
                                lhs = Evaluate(decl.id);
                                PutValue(lhs, Get(value, decl.id.name));
                            } else {
                                lhs = Evaluate(decl.name);
                                PutValue(lhs, Get(value, ToString(p)));
                            }
                        }

                    }

                }
            }

        } else if (type === "ObjectPattern" || type === "ObjectExpression") {

            var decl;
            for (var p = 0, q = node.elements.length; p < q; p++) {
                if (decl = node.elements[p]) {

                    if (env) {

                        if (decl.id) env.InitialiseBinding(decl.as.name, value.Get(decl.id.name, value));
                        else env.InitialiseBinding(decl.name, value.Get(decl.name, value));

                    } else {
                        if (decl.id) {
                            lhs = Evaluate(decl.id);
                            PutValue(lhs, Get(value, decl.id.name));
                        } else {
                            lhs = Evaluate(decl.name);
                            PutValue(lhs, Get(value, decl.name));
                        }
                    }
                }
            }

        } else if (typeof node === "string") {
            // Assume Identifier Name
            if (env) {
                env.InitialiseBinding(node, value, strict);
            } else {
                //env = getLexEnv();
                lhs = ResolveBinding(node);
                //lhs = new Reference(node, env, strict);
                PutValue(lhs, value);
            }
        }
        return NormalCompletion(undefined);
    }

    function EmptyStatement(node) {
        //if (completion) return completion;
        return NormalCompletion(empty);
    }
    evaluation.EmptyStatement = EmptyStatement;

    /*** debugger, ***************************************************************************************************** */

    evaluation.printStackEntry = printStackEntry;

    function printStackEntry(cx, key) {
        log("## stack[" + key + "] => " + cx.toString());
        /*for (var k in cx) {
			log("# Execution Context: "+cx+", field "+k);
			if (k >= stack.length-2) log(cx[k]);
			// else dir(cx[k]);
		}*/
    }

    function printEnvironment(cx) {
        var i;
        var v = getVarEnv();
        var l = getLexEnv();
        log("########### Running Execution Context on Top Of The Stack.");
        log("+++ running +++ cx.[[varEnv]]");
        dir(v);
        log("+++ running +++ cx.[[lexEnv]]");
        dir(l);
        log(">> Completion Record << ");
        log("completion:");
        dir(realm.completion);
        log("## Environments (E <= E.outer)");
        l = getLexEnv();
        i = 0;
        var b;
        var bound;
        var k;
        do {
            bound = "";
            log("context " + i + " (last)");
            log(l.toString());
            if (l.toString() === "[object ObjectEnvironment]") b = l.BoundObject.Bindings;
            else if (l.toString() === "[object GlobalVariableEnvironment]") b = l.BoundObject.Bindings;
            else if (l.toString() === "[object GlobalLexicalEnvironment]") b = l.Bindings;
            else b = l.Bindings;
            for (k in b) bound += k + ", ";
            log("Bound Identifiers: " + bound);
            log("(outer:)");
            ++i;
        } while (l = l.outer);
    }

    evaluation.printStackAtDebuggerStatement = printStackAtDebuggerStatement;

    function printStackAtDebuggerStatement() {
        var stackTraceLimit = realm.xs.stackTraceLimit || 10;
        var i = 0;

        var key;
        var len;
        var cx;
        var stack = getStack();

        log("stack.length: " + stack.length);
        if (len = stack.length) {
            for (var key in stack) {
                if (len < stackTraceLimit || (key >= len - stackTraceLimit)) printStackEntry(stack[key], key);
            }
        }

        if (cx = getContext()) {
            printEnvironment(cx);
        } else log("kein context/keine environment");
    }

    function DebuggerStatement(node) {

        var loc = node.loc;

        var line = loc && loc.start ? loc.start.line : "unknown";
        var column = loc && loc.start ? loc.start.column : "unknown";

        log("DebuggerStatement at line " + (line) + ", " + (column) + "\n");
        printStackAtDebuggerStatement();
        log("DebuggerStatement End");
        return NormalCompletion(undefined);
    }
    evaluation.DebuggerStatement = DebuggerStatement;

    /* ^ debugger ****************************************************************************************************** */

    function RegularExpressionLiteral(node) {

        var literalSource = node.computed;
        if (!literalSource) {
            literalSource = (node.value && node.value.substr(1, node.value.length - 2));
        }

        var regExpTree = parseGoal("RegularExpressionLiteral", literalSource);
        if (regExpTree) {

        }

        return withError("Syntax", "Can not create Regular Expression from Literal " + literalSource);
    }
    evaluation.RegularExpressionLiteral = RegularExpressionLiteral;

    /*

	ValueLiterals
	- StringLiteral
	- Numeric
	- Boolean
*/

    evaluation.StringLiteral = StringLiteral;

    function StringLiteral(node) {
        return node.computed || unquote(node.value);
    }

    evaluation.NumericLiteral = NumericLiteral;

    function NumericLiteral(node) {
        return MV(node.value);
        if (node.computed !== undefined) return node.computed;
        else return +node.value;
    }

    evaluation.NullLiteral = NullLiteral;

    function NullLiteral(node) {
        return null;
    }
    evaluation.BooleanLiteral = BooleanLiteral;

    function BooleanLiteral(node) {
        return node.value === "true" ? true : false;
    }

    evaluation.Literal = Literal;

    function Literal(node) {
        if (node.goal) return evaluation[node.goal](node);
        if (node.computed !== undefined) return node.computed;
        return node.value;
    }

    evaluation.ThisExpression = ThisExpression;

    function ThisExpression(node) {
        return ThisResolution();
    }

    evaluation.Identifier = Identifier;

    function Identifier(node) {
        var name = node.name || node.value;
        var lex = getLexEnv();
        var strict = cx.strict;
        return GetIdentifierReference(lex, name, strict);
    }

    evaluation.Elision = Elision;

    function Elision(node) {
        return node.width;
    }

    function ArrayAccumulation(elementList, array, nextIndex) {
        "use strict";
        var exprRef;
        var exprValue;
        var i, j = elementList.length;
        var element;

        for (i = 0; i < j; i++) {
            element = elementList[i];

            if (element.type === "Elision") {

                nextIndex += element.width;

            } else if (element.type === "SpreadExpression") {

                var spreadRef = Evaluate(element);
                var spreadObj = GetValue(spreadRef);
                var spreadLen = Get(spreadObj, "length");

                for (var k = 0; k < spreadLen; k++) {

                    exprValue = Get(spreadObj, ToString(k));
                    if ((exprValue = ifAbrupt(exprValue)) && isAbrupt(exprValue)) return exprValue;

                    array.DefineOwnProperty(ToString(nextIndex), {
                        writable: true,
                        value: exprValue,
                        enumerable: true,
                        configurable: true
                    });

                    nextIndex = nextIndex + 1;
                }

            } else {

                exprRef = Evaluate(element);
                if ((exprRef = ifAbrupt(exprRef)) && isAbrupt(exprRef)) return exprRef;
                exprValue = GetValue(exprRef);
                if ((exprValue = ifAbrupt(exprValue)) && isAbrupt(exprValue)) return exprValue;

                array.DefineOwnProperty(ToString(nextIndex), {
                    writable: true,
                    value: exprValue,
                    enumerable: true,
                    configurable: true
                });

                nextIndex = nextIndex + 1;
            }

        }

        return nextIndex;
    }

    evaluation.ArrayExpression = ArrayExpression;

    function ArrayExpression(node) {
        var j = node.elements.length;
        var array, pad, nextIndex;
        var element;
        if (j === 1) {
            element = node.elements[0];
            if (element.type === "Elision") {
                array = ArrayCreate(0);
                pad = element.width;
                //Put(array, "length", pad, false);


                array.Bindings["length"] = {
                    value: pad,
                    writable: true,
                    enumerable: false,
                    configurable: false
                };

                return array;
            }
        }
        array = ArrayCreate(0);
        nextIndex = 0;
        nextIndex = ArrayAccumulation(node.elements, array, nextIndex);
        if ((nextIndex = ifAbrupt(nextIndex)) && isAbrupt(nextIndex)) return nextIndex;

        array.Bindings["length"] = {
            value: nextIndex,
            writable: true,
            enumerable: false,
            configurable: false
        };

        return NormalCompletion(array);
    }

    function defineFunctionOnObject (node, newObj, propName) {
            
            var scope = getLexEnv();
            var body = getCode(node, "body");
            var formals = getCode(node, "params");
            var strict = cx.strict || node.strict;
            var fproto = Get(getIntrinsics(), "%FunctionPrototype%");
            var id = node.id;
            var generator = node.generator;
            var propValue;
           
            var methodName = propName;


            if (id) {
                scope = NewDeclarativeEnvironment(scope);
                scope.CreateMutableBinding(id);
            }

            if (ReferencesSuper(node)) {
                var home = getLexEnv().GetSuperBase();
                //getInternalSlot(object, "HomeObject");
            } else {
                methodName = undefined;
                home = undefined;
            }
            
            if (generator) propValue = GeneratorFunctionCreate("method", formals, body, scope, strict, fproto, home, methodName);
            else propValue = FunctionCreate("method", formals, body, scope, strict, fproto, home, methodName);

            if (id) scope.InitialiseBinding(id, propValue);

            MakeConstructor(propValue);
            SetFunctionName(propValue, propName);
            CreateDataProperty(newObj, propName, propValue);

    }


    function defineGetterOrSetterOnObject (node, newObj, propName, kind) {
                
            var scope = getLexEnv();
            var body = getCode(node, "body");
            var formals = getCode(node, "params");
            var functionPrototype = getIntrinsic("%FunctionPrototype%");
            var strict = node.strict;
            var methodName;
            var propValue;
            var status;


            if (ReferencesSuper(node)) {
                var home = getLexEnv().GetSuperBase();
                methodName = propName;
            } else {
                home = undefined;
                methodName = undefined
            }
            //getInternalSlot(object, "HomeObject");
            propValue = FunctionCreate("method", formals, body, scope, strict, functionPrototype, home, methodName);                
            
            var desc = kind == "get" ? {
                get: propValue,
                enumerable: true,
                configurable: true
            } : {
                set: propValue,
                enumerable: true,
                configurable: true
            };

            SetFunctionName(propValue, propName, kind);                
            status = DefineOwnPropertyOrThrow(newObj, propName, desc);       
            if (isAbrupt(status)) return status;

    }


    evaluation.PropertyDefinition = PropertyDefinition;
    function PropertyDefinition(newObj, propertyDefinition) {
        "use strict";
            var kind = propertyDefinition.kind;
            var key = propertyDefinition.key;
            var node = propertyDefinition.value;
            var strict = node.strict;
            var isComputed = node.computed;

            var status;   
            var exprRef, exprValue;
            var propRef, propName, propValue;
            var closure;
            var formals;
            var body;
            var scope;
            var hasSuperRef;
            var homeObject;
            var methodName;
            var functionPrototype;

            
            /* I refactored it today, but resetted it tonight, i rewrite it tomorrow */
            
            if (kind == "init") {

                if (isComputed) {
                    var symRef = Evaluate(key);
                    var symValue = GetValue(symRef);
                    if ((symValue=ifAbrupt(symValue)) && isAbrupt(symValue)) return symValue;
                    if (!IsSymbol(symValue)) return withError("Type", "A [computed] property inside an object literal has to evaluate to a Symbol primitive");
                    propName = symValue;
                } else {
                    // init
                    propName = typeof key === "string" ? key : key.name || key.value;
                }

                if (!isComputed && propName === "__proto__") {

                }
                
                if (isCodeType("FunctionDeclaration")) {
                    status = defineFunctionOnObject(node, newObj, propName);
                    if (isAbrupt(status)) return status;
                } else {
                    propRef = Evaluate(node, newObj);
                    if ((propRef = ifAbrupt(propRef)) && isAbrupt(propRef)) return propRef;
                    propValue = GetValue(propRef);
                    if ((propValue = ifAbrupt(propValue)) && isAbrupt(propValue)) return propValue;
                    status = CreateDataProperty(newObj, propName, propValue);
                    if (isAbrupt(status)) return status;
                }
                
            } else if (kind === "method") {

                propValue = Evaluate(node, newObj);
                if ((propValue = ifAbrupt(propValue)) && isAbrupt(propValue)) return propValue;

            } else if (kind === "get" || kind === "set") {
                                
                // get [s] () { return 10 }
                if (node.computed) {
                    propName = GetValue(Evaluate(key));
                    if ((propName =ifAbrupt(propName)) && isAbrupt(propName)) return propName;
                    if (!IsSymbol(propName)) return withError("Type", "A [computed] property inside an object literal has to evaluate to a Symbol primitive");
                } else {
                    propName = typeof key === "string" ? key : key.name || key.value;
                }
                defineGetterOrSetterOnObject(node, newObj, propName, kind);
            }
        
    }

    evaluation.ObjectExpression = ObjectExpression;
    function ObjectExpression(node) {
        "use strict";
        var props = node.properties;
        var newObj = ObjectCreate();        
        var status;
        for (var i = 0, j = props.length; i < j; i++) {
            status = PropertyDefinition(newObj, props[i]);
            if (isAbrupt(status)) return status;
        }
        return NormalCompletion(newObj);
    }

    evaluation.AssignmentExpression = AssignmentExpression;

    var isValidSimpleAssignmentTarget = {
        "ObjectPattern": true,
        "ArrayPattern": true,
        "ObjectExpression": true,
        "ArrayExpression": true
    };

    evaluation.ObjectPattern = ObjectPattern;

    function ObjectPattern(node) {
        var n;
        var init = node.init;
        node.init = null;
        n = Node("AssignmentExpression");
        n.left = node;
        n.right = init;
        n.operator = "=";
        n.loc = node.loc;
        return DestructuringAssignmentEvaluation(n);
    }

    function IteratorDestructuringEvaluation() {}

    function DestructuringAssignmentEvaluation(node) {

        var type = node.left.type;
        var op = node.operator;
        var leftElems = node.left.elements;
        
        var lval, rval;
        var rref, lref;
        var result;
        var l, i, j;
        var obj, array;

        rref = Evaluate(node.right);
        if ((rref = ifAbrupt(rref)) && isAbrupt(rref)) return rref;
        rval = GetValue(rref);
        if ((rval = ifAbrupt(rval)) && isAbrupt(rval)) return rval;

        if (type === "ObjectPattern" || type === "ObjectExpression") {

            obj = rval;
            var identName, newName;

            if (Type(rval) !== "object") return withError("Type", "can not desctructure a non-object into some object");

            for (i = 0, j = leftElems.length; i < j; i++) {
                if (leftElems[i].id) identName = leftElems[i].id.name;
                else identName = leftElems[i].name;

                lval = GetValue(Evaluate(leftElems[i]));
                rval = Get(obj, identName);
                result = applyAssignmentOperator(op, lval, rval);

                if (leftElems[i].as) newName = leftElems[i].as.name;

                var lexEnv = getLexEnv();

                if (newName) lexEnv.SetMutableBinding(newName, result)
                else lexEnv.SetMutableBinding(identName, result);
                newName = undefined;
            }

            return NormalCompletion(result);

        } else if (type === "ArrayPattern" || type === "ArrayExpression") {

            array = rval;
            if (Type(array) !== "object") return withError("Type", "can not desctructure a non-object into some object");
            var width;
            var index = 0;
                var len = Get(array, "length");
            var status;

            for (i = 0, j = leftElems.length; i < j; i++) {

                var ltype = leftElems[i].type;
                if (ltype === "SpreadExpression") { // === REST! Achtung

                    var rest = ArrayCreate(0);
                    var restName = BoundNames(leftElems[i].argument)[0];
                    var index2 = 0;

                    while (index < len) {
                        lval = Get(array, ToString(index));
                        result = applyAssignmentOperator(op, lval, rval);
                        status = callInternalSlot("DefineOwnProperty", rest, ToString(index2), {
                            value: result,
                            writable: true,
                            enumerable: true,
                            configurable: true
                        });
                        if (isAbrupt(status)) return status;
                        index += 1;
                        index2 += 1;
                    }
                    getLexEnv().SetMutableBinding(restName, rest);
                    break;

                } else if (ltype === "Elision") {

                    index += node.width - 1;
                    result = undefined;

                } else {

                    l = leftElems[i].value || leftElems[i].name;
                    rval = Get(array, ToString(index));
                    lval = GetValue(Evaluate(leftElems[i]));
                    result = applyAssignmentOperator(op, lval, rval);
                    status = getLexEnv().SetMutableBinding(l, result);
                    if (isAbrupt(status)) return status;
                    index = index + 1;
                }
            }


            return NormalCompletion(result);
        }
    }

    function AssignmentExpression(node) {
        var lref, rref;
        var lval, rval;
        var base, name;

        var op = node.operator;
        var result, status;
        var ltype = node.left.type;

        if (cx.generator) {}

        if (ltype === "Identifier") {

            lref = Evaluate(node.left);
            rref = Evaluate(node.right);
            if ((lref = ifAbrupt(lref)) && isAbrupt(lref)) return lref;
            if ((rref = ifAbrupt(rref)) && isAbrupt(rref)) return rref;
            lval = GetValue(lref);
            rval = GetValue(rref);
            if ((lval = ifAbrupt(lval)) && isAbrupt(lval)) return lval;
            if ((rval = ifAbrupt(rval)) && isAbrupt(rval)) return rval;
            result = applyAssignmentOperator(op, lval, rval);
            status = PutValue(lref, result);
            if (isAbrupt(status)) return status;
        
        } else if (ltype === "MemberExpression") {
        
            lref = Evaluate(node.left);
            if ((lref = ifAbrupt(lref)) && isAbrupt(lref)) return lref;
            rref = Evaluate(node.right);
            if ((rref = ifAbrupt(rref)) && isAbrupt(rref)) return rref;
            
            lval = GetValue(lref);
            rval = GetValue(rref);
            if ((lval = ifAbrupt(lval)) && isAbrupt(lval)) return lval;
            if ((rval = ifAbrupt(rval)) && isAbrupt(rval)) return rval;
            //console.dir(lref);
            result = applyAssignmentOperator(op, lval, rval);
            //    return PutValue(lref, result);
            status = Put(lref.base, lref.name, result, false);

            if (isAbrupt(status)) return status;
        } else if (isValidSimpleAssignmentTarget[ltype]) {
            return DestructuringAssignmentEvaluation(node);
        } else {
            return withError("Reference", "Currently not a valid lefthandside expression for assignment")
        }
        return NormalCompletion(result);
    }
    evaluation.ConditionalExpression = ConditionalExpression;

    function add(op, left, right) { 
        left = GetValue(left);
        right = GetValue(right);
        switch (op) {
        case "+=":
            return left += right;
        case "%=":
            return left %= right;
        case "/=":
            return left /= right;
        case "*=":
            return left *= right;
        case "-=":
            return left -= right;
        case "^=":
            return left ^= right;
        case "|=":
            return left |= right;
        case "&=":
            return left &= right;
        case ">>>=":
            return left >>>= right;
        case "=":
            return left = right;
        }
    }

    function applyAssignmentOperator(op, lval, rval) {
        var newValue;
        switch (op) {
        case "+=":
            newValue = lval + rval;
            break;
        case "%=":
            newValue = lval % rval;
            break;
        case "/=":
            newValue = lval / rval;
            break;
        case "*=":
            newValue = lval * rval;
            break;
        case "-=":
            newValue = lval - rval;
            break;
        case "^=":
            newValue = lval ^ rval;
            break;
        case "|=":
            newValue = lval | rval;
            break;
        case "&=":
            newValue = lval & rval;
            break;
        case ">>>=":
            newValue = lval >>> rval;
            break;
        case "=":
            newValue = rval;
            break;
        }
        return newValue;
    }

    function ConditionalExpression(node) {
        var testExpr = node.test;
        var trueExpr = node.consequent;
        var falseExpr = node.alternate;
        var exprRef = Evaluate(testExpr);
        var exprValue = GetValue(exprRef);
        if (isAbrupt(exprValue)) return exprValue;
        if (exprValue) {
            var trueRef = Evaluate(trueExpr);
            if ((trueRef = ifAbrupt(trueRef)) && isAbrupt(trueRef)) return trueRef;
            var trueValue = GetValue(trueRef);

            if ((trueValue = ifAbrupt(trueValue)) && isAbrupt(trueValue)) return trueValue;
            return NormalCompletion(trueValue);
        } else {
            var falseRef = Evaluate(falseExpr);
            if ((falseRef = ifAbrupt(falseRef)) && isAbrupt(falseRef)) return falseRef;
            var falseValue = GetValue(falseRef);
            if ((falseValue = ifAbrupt(falseValue)) && isAbrupt(falseValue)) return falseValue;
            return NormalCompletion(falseValue);
        }
    }

    function UnaryExpression(node) {
        var status;
        var isPrefixOperation = node.prefix;
        var oldValue, newValue, val;
        var op = node.operator;
        var argument = getCode(node, "argument");

        var exprRef = Evaluate(argument);
        if ((exprRef = ifAbrupt(exprRef)) && isAbrupt(exprRef)) return exprRef;

        if (op === "typeof") {

            if (Type(exprRef) === "reference") {
                if (IsUnresolvableReference(exprRef)) return NormalCompletion("undefined");
                val = GetValue(exprRef);
            } else val = exprRef;

            if ((val = ifAbrupt(val)) && isAbrupt(val)) return val;

            var lazyTypeString = Type(val);

            if (IsCallable(val)) return NormalCompletion("function");
            if (val === null) return NormalCompletion("object");
            return NormalCompletion(lazyTypeString);

        } else if (op === "void") {

            oldValue = GetValue(exprRef);
            return NormalCompletion(undefined);

        } else if (op === "delete") {

            if (Type(exprRef) !== "reference") return true;
            if (IsUnresolvableReference(exprRef)) {
                if (IsStrictReference(exprRef)) return withError("Syntax", "Can not delete unresolvable and strict reference.");
                return true;
            }
            if (IsPropertyReference(exprRef)) {
                if (IsSuperReference(exprRef)) return withError("Reference", "Can not delete a super reference.");
                var deleteStatus = Delete(ToObject(GetBase(exprRef), GetReferenceName(exprRef)));
                deleteStatus = ifAbrupt(deleteStatus);
                if (isAbrupt(deleteStatus)) return deleteStatus;
                if (deleteStatus === false && IsStrictReference(exprRef)) return withError("Type", "deleteStatus is false and IsStrictReference is true.");
                return deleteStatus;
            } else {
                var bindings = GetBase(exprRef);
                return bindings.DeleteBinding(GetReferencedName(exprRef));
            }

        } else if (isPrefixOperation) {

            switch (op) {
            case "~":
                oldValue = ToNumber(GetValue(exprRef));
                newValue = ~oldValue;
                return NormalCompletion(newValue);
            case "!":
                oldValue = ToNumber(GetValue(exprRef));
                newValue = !oldValue;
                return NormalCompletion(newValue);
            case "+":
                return NormalCompletion(ToNumber(GetValue(exprRef)));
                break;
            case "-":
                oldValue = ToNumber(GetValue(exprRef));
                if (oldValue != oldValue) return NormalCompletion(oldValue);
                return NormalCompletion(-oldValue);
                break;
            case "++":
                oldValue = ToNumber(GetValue(exprRef));
                if (isAbrupt(oldValue)) return oldValue;
                oldValue = unwrap(oldValue);
                newValue = oldValue + 1;
                status = PutValue(exprRef, newValue);
                if (isAbrupt(status)) return status;
                return NormalCompletion(newValue);
                break;
            case "--":
                oldValue = ToNumber(GetValue(exprRef));
                if (isAbrupt(oldValue)) return oldValue;
                oldValue = unwrap(oldValue);
                newValue = oldValue - 1;
                status = PutValue(exprRef, newValue);
                if (isAbrupt(status)) return status;
                return NormalCompletion(newValue);
                break;
            }

        } else {

            switch (op) {
            case "++":
                oldValue = ToNumber(GetValue(exprRef));
                if (isAbrupt(oldValue)) return oldValue;
                oldValue = unwrap(oldValue);
                newValue = oldValue + 1;
                status = PutValue(exprRef, newValue);
                if (isAbrupt(status)) return status;
                return NormalCompletion(oldValue);
            case "--":
                oldValue = ToNumber(GetValue(exprRef));
                if (isAbrupt(oldValue)) return oldValue;
                oldValue = unwrap(oldValue);
                newValue = oldValue - 1;
                status = PutValue(exprRef, newValue);
                if (isAbrupt(status)) return status;
                return NormalCompletion(oldValue);
                break;
            }

        }
    }
    evaluation.UnaryExpression = UnaryExpression;
    evaluation.BinaryExpression = BinaryExpression;

    /** ************************************************************************************************************************************************************************************************ */
    /** ************************************************************************************************************************************************************************************************ */
    /** ************************************************************************************************************************************************************************************************ */

    function StrictEqualityComparison(x, y) {
        var tx = Type(x);
        var ty = Type(y);

        if (tx !== ty) return false;

        if (tx === "undefined" && ty === "null") return false;
        if (ty === "undefined" && tx === "null") return false;

    }

    function AbstractEqualityComparison(x, y) {
        var tx = Type(x);
        var ty = Type(y);

        if (tx === ty) return StrictEqualityComparison(x, y);

        if (tx === "undefined" && ty === "null") return true;
        if (ty === "undefined" && tx === "null") return true;

    }

    function AbstractRelationalComparison(leftFirst) {
        var tx = Type(x);
        var ty = Type(y);

    }

    /** ************************************************************************************************************************************************************************************************ */
    /** ************************************************************************************************************************************************************************************************ */
    /** ************************************************************************************************************************************************************************************************ */

    function instanceOfOperator(O, C) {
        if (Type(C) !== "object") return withError("Type", "instanceOfOperator: C is not an object.");
        var instHandler = GetMethod(C, $$hasInstance);
        if (isAbrupt(instHandler)) return instHandler;
        if (instHandler) {
            if (!IsCallable(instHandler)) return withError("Type", "instanceOfOperator: [@@hasInstance] is expected to be a callable.");
            var result = instHandler.Call(C, [O]);
            return ToBoolean(result);
        }
        if (IsCallable(C) === false) return withError("Type", "instanceOfOperator: C ist not callable.");
        return OrdinaryHasInstance(C, O);
    }

    function BinaryExpression(node) {

        var op = node.operator;

        var lref = Evaluate(node.left);
        if ((lref = ifAbrupt(lref)) && isAbrupt(lref)) return lref;
        var rref = Evaluate(node.right);
        if ((rref = ifAbrupt(rref)) && isAbrupt(rref)) return rref;

        var lval = GetValue(lref);
        if ((lval = ifAbrupt(lval)) && isAbrupt(lval)) return lval;
        var rval = GetValue(rref);
        if ((rval = ifAbrupt(rval)) && isAbrupt(rval)) return rval;

        var result;
        switch (op) {
        case "of":
            debug("doing the impossible");
            var value = Invoke(ToObject(rval), "valueOf");
            result = SameValue(rval, lval);
            return result;
        case "in":
            result = HasProperty(rval, ToPropertyKey(lval));
            return result;
        case "<":
            result = lval < rval;
            break;
        case ">":
            result = lval > rval;
            break;
        case "<=":
            result = lval <= rval;
            break;
        case ">=":
            result = lval >= rval;
            break;
        case "+":
            result = lval + rval;
            break;
        case "-":
            result = lval - rval;
            break;
        case "*":
            result = lval * rval;
            break;
        case "/":
            result = lval / rval;
            break;
        case "^":
            result = lval ^ rval;
            break;
        case "%":
            result = lval % rval;
            break;
        case "===":
            result = lval === rval;
            break;
        case "!==":
            result = lval !== rval;
            break;
        case "==":
            result = lval == rval;
            break;
        case "!=":
            result = lval != rval;
            break;
        case "&&":
            result = lval && rval;
            break;
        case "||":
            result = lval || rval;
            break;
        case "|":
            result = lval | rval;
            break;
        case "&":
            result = lval & rval;
            break;
        case "<<":
            result = lval << rval;
            break;
        case ">>":
            result = lval >> rval;
            break;
        case ">>>":
            result = lval >>> rval;
            break;
        case "instanceof":
            result = instanceOfOperator(lval, rval);
            return result;
            break;
        default:
            break;
        }

        return NormalCompletion(result); // NormalCompletion(result);
    }

    evaluation.ExpressionStatement = ExpressionStatement;

    function ExpressionStatement(node) {
        return Evaluate(node.expression);
    }
    evaluation.SequenceExpression = SequenceExpression;

    function SequenceExpression(node) {
        var exprRef, exprValue;
        var list = node.sequence;
        var V = undefined;
        var item;
        for (var i = 0, j = list.length; i < j; i += 1) {
            if (item = list[i]) {
                tellExecutionContext(item, i);
                exprRef = Evaluate(item);
                if (isAbrupt(exprRef)) return exprRef;
                exprValue = GetValue(exprRef);
                if (isAbrupt(exprValue)) return exprValue;
                if (exprValue !== empty) V = exprValue;
            }
        }
        return NormalCompletion(V);
    }

    evaluation.StatementList = StatementList;

    function StatementList(stmtList) {
        var stmtRef, stmtValue, stmt;

        var V = undefined;
        for (var i = 0, j = stmtList.length; i < j; i++) {
            if (stmt = stmtList[i]) {
                tellExecutionContext(stmt, i);
                stmtRef = Evaluate(stmt);
                stmtValue = GetValue(stmtRef);
                if (isAbrupt(stmtValue)) return stmtValue;
                if (stmtValue !== empty) V = stmtValue;
            }
        }
        return NormalCompletion(V);
    }

    evaluation.BlockStatement = BlockStatement;

    function BlockStatement(node) {
        var stmtList = getCode(node, "body");

        var oldEnv = getLexEnv();
        var blockEnv = NewDeclarativeEnvironment(oldEnv);

        var status = InstantiateBlockDeclaration(stmtList, blockEnv);
        if (isAbrupt(status)) {
            return status;
        }

        getContext().lexEnv = blockEnv;
        status = evaluation.StatementList(stmtList);
        getContext().lexEnv = oldEnv;
        if (isAbrupt(status)) return status;
        return NormalCompletion(empty);

    }
    evaluation.IfStatement = IfStatement;

    function IfStatement(node) {
        var test = node.test;
        var ok = node.consequent;
        var not = node.alternate;
        var rval;
        if (not) {
            rval = GetValue(Evaluate(test)) ? GetValue(Evaluate(ok)) : GetValue(Evaluate(not));
        } else {
            if (GetValue(Evaluate(test))) rval = GetValue(Evaluate(ok));
        }
        return NormalCompletion();
    }

    function LoopContinues(completion, labelSet) {
        debug("LoopContinues:");
        debugdir(completion);
        debugdir(labelSet);
        // -- inconsistency fix
        if (completion instanceof CompletionRecord === false) return true;
        // --- reg. code
        if (completion.type === "normal") return true;
        if (completion.type !== "continue") return false;
        if (completion.target === "" || completion.target === undefined) return true;
        if (labelSet && labelSet[completion.target]) return true;
        return false;
    }

    evaluation.WhileStatement = WhileStatement;

    function WhileStatement(node, labelSet) {
        var test = node.test;
        var body = getCode(node, "body");
        var exprRef, exprValue;
        var V, stmt;
        labelSet = labelSet || cx.labelSet || Object.create(null);

        for (;;) {

            var testRef = Evaluate(test);
            if ((testRef = ifAbrupt(testRef)) && isAbrupt(testRef)) return testRef;
            var testValue = GetValue(testRef);
            if ((testValue = ifAbrupt(testValue)) && isAbrupt(testValue)) return testValue;

            if (ToBoolean(testValue) === false) {
                return NormalCompletion(V);
            }
            exprRef = Evaluate(body);
            exprValue = GetValue(exprRef);
            if (LoopContinues(exprValue, labelSet) === false) return exprValue;
            V = unwrap(exprValue);

        }

        return NormalCompletion(V);
    }

    function DoWhileStatement(node, labelSet) {

        var test = node.test;
        var body = getCode(node, "body");
        var exprRef, exprValue;
        var V, stmt;
        labelSet = labelSet || cx.labelSet || Object.create(null);

        for (;;) {

            exprRef = Evaluate(body);
            exprValue = GetValue(exprRef);
            if (LoopContinues(exprValue, labelSet) === false) return exprValue;
            V = unwrap(exprValue);

            var testRef = Evaluate(test);
            if ((testRef = ifAbrupt(testRef)) && isAbrupt(testRef)) return testRef;
            var testValue = GetValue(testRef);
            if ((testValue = ifAbrupt(testValue)) && isAbrupt(testValue)) return testValue;

            if (ToBoolean(testValue) === false) {
                return NormalCompletion(V);
            }

        }

    }
    evaluation.DoWhileStatement = DoWhileStatement;

    evaluation.ForDeclaration = ForDeclaration;

    function ForDeclaration(node) {
        var kind = node.kind;
        var id = node.id;
        return Evaluate(node.id);
    }

// TODO: RESUME for Generator
    function ForInOfExpressionEvaluation(expr, iterationKind, labelSet) {

        var exprRef = Evaluate(expr);
        var exprValue = GetValue(exprRef);
        var iterator, obj, keys;
        if ((exprValue = ifAbrupt(exprValue)) && isAbrupt(exprValue)) {
            if (LoopContinues(exprValue, labelSet) === false) return exprValue;
            else return Completion("break");
        }

        if (exprValue === null || exprValue === undefined) return Completion("break");
        obj = ToObject(exprValue);
        if (iterationKind === "enumerate") {

            keys = Enumerate(obj);

        } else if (iterationKind === "iterate") {

            iterator = Invoke(obj, $$iterator, []);
            keys = ToObject(iterator);

        } else if (iterationKind) {
            return withError("Type", "ForInOfExpression: iterationKind is neither enumerate nor iterate.");
        }
        if (isAbrupt(keys)) {
            if (LoopContinues(exprValue, labelSet) === false) return exprValue;
            Assert(keys.type === "continue");
            return Completion("break");
        }
        return keys;
    }


// TODO: RESUME for Generator
    function ForInOfBodyEvaluation(lhs, stmt, keys, lhsKind, labelSet) {
        "use strict";
        var oldEnv = getLexEnv();
        var noArgs = [];
        var V;
        var nextResult, nextValue, done, status;
        var rval, lhsRef;
        var names = BoundNames(lhs);

        for (;;) {
            nextResult = Invoke(keys, "next", noArgs);
            if ((nextResult = ifAbrupt(nextResult)) && isAbrupt(nextResult)) return nextResult;
            if (Type(nextResult) !== "object") return withError("Type", "ForInOfBodyEvaluation: nextResult is not an object");
            done = IteratorComplete(nextResult);
            if ((done = ifAbrupt(done)) && isAbrupt(done)) return done;
            if (done === true) return NormalCompletion(V);
            nextValue = IteratorValue(nextResult);
            if ((nextValue = ifAbrupt(nextValue)) && isAbrupt(nextValue)) return nextValue;
            if (lhsKind === "assignment") {

                if (lhs.type !== "ObjectPattern" && lhs.type !== "ArrayPattern") {

                    lhsRef = Evaluate(lhs);
                    status = PutValue(lhsRef, nextValue);

                } else {
                    rval = ToObject(nextValue);
                    if (isAbrupt(rval)) status = rval;
                    else status = DestructuringAssignmentEvaluation(lhs, rval);
                }

            } else if (lhsKind === "varBinding") {

                status = BindingInitialisation(lhs, nextValue, undefined);

            } else {

                Assert(lhsKind === "lexicalBinding", "lhsKind muss lexical Binding sein");
                // Assert(lhs == ForDeclaration);
                var iterationEnv = NewDeclarativeEnvironment(oldEnv);
                for (var i = 0, j = names.length; i < j; i++) {
                    iterationEnv.CreateMutableBinding(names[i], true);
                }
                getContext().lexEnv = iterationEnv;
                status = BindingInitialisation(lhs, nextValue, iterationEnv);
                if (isAbrupt(status)) return (getContext().lexEnv = oldEnv), status;
                status = NormalCompletion(undefined);

            }

            if (!isAbrupt(status)) {
                status = Evaluate(stmt);
                if (status instanceof CompletionRecord) {
                    if (status.type === "normal" && status.value !== empty) V = status.value;
                }
            }

            getContext().lexEnv = oldEnv;
            if (isAbrupt(status) && LoopContinues(status, labelSet) === false) return status;
        }
    }

    function ForInStatement(node, labelSet) {
        var left = node.left;
        var right = node.right;
        var body = getCode(node, "body");
        var tleft = left.type;
        var tright = right.type;

        var labelSet = cx.labelSet || Object.create(null);
        var lhsKind = "assignment";
        var iterationKind = "enumerate";

        var keyResult = ForInOfExpressionEvaluation(right, iterationKind, labelSet);
        return ForInOfBodyEvaluation(left, body, keyResult, lhsKind, labelSet);
    }
    evaluation.ForInStatement = ForInStatement;

    var assignmentRather = {
        "Identifier": true,
        "ArrayPattern": true,
        "ObjectPattern": true
    };

    function ForOfStatement(node, labelSet) {
        "use strict";
        var left = node.left;
        var right = node.right;
        var body = getCode(node, "body");
        var tleft = left.type;
        var tright = right.type;

        var labelSet = cx.labelSet || Object.create(null);
        var lhsKind;
        var iterationKind = "iterate";

        lhsKind = "assignment";

        if (IsLexicalDeclaration(left)) {
            lhsKind = "lexicalBinding";
        } else {
            lhsKind = "varBinding";
        }

        var keyResult = ForInOfExpressionEvaluation(right, iterationKind, labelSet);
        return ForInOfBodyEvaluation(left, body, keyResult, lhsKind, labelSet);
    }
    evaluation.ForOfStatement = ForOfStatement;

    function LabelledEvaluation(node, labelSet) {
        var result;
        var type = node.type;
        var fn = evaluation[type];
        if (fn) result = fn(node, labelSet);
        else throw SyntaxError("can not evaluate " + type);
        return NormalCompletion(result);
    }

    evaluation.LabelledStatement = LabelledStatement;

    function LabelledStatement(node) {
        var exists;
        var label = node.label.name || node.label.value;
        var statement = node.statement;
        var labelSet = cx.labelSet || Object.create(null);
        var labelSet = cx.labelSet;
        if (!labelSet) {
            exists = false;
            labelSet = Object.create(null);
            cx.labelSet = labelSet;
        } else exists = true;

        labelSet[label] = node;

        var result = LabelledEvaluation(statement, labelSet);
        if (!exists) cx.labelSet = undefined;
        return result;
    }

    evaluation.ForStatement = ForStatement;

    var IterationStatements = {
        "ForStatement": true
    };

    var BreakableStatements = {
        "WhileStatement": true,
        "DoWhileStatement": true,
        "SwitchStatement": true
    };

// TODO: RESUME for Generator
    function ForStatement(node) {
        "use strict";
        var initExpr = node.init;
        var testExpr = node.test;
        var incrExpr = node.update;
        var body = getCode(node, "body");
        var exprRef, exprValue;
        var varDcl, isConst, dn, forDcl;
        var oldEnv, loopEnv, bodyResult;

        var labelSet = cx.labelSet;
        if (!labelSet) {
            labelSet = Object.create(null);
            cx.labelSet = labelSet;
        }

        if (initExpr) {

            if (IsVarDeclaration(initExpr)) {
                varDcl = Evaluate(initExpr);
                if (!LoopContinues(varDcl, labelSet)) return varDcl;
                return ForBodyEvaluation(testExpr, incrExpr, body, labelSet);

            } else if (IsLexicalDeclaration(initExpr)) {

                oldEnv = getLexEnv();
                loopEnv = NewDeclarativeEnvironment(oldEnv);
                isConst = IsConstantDeclaration(initExpr);

                for (var i = 0, j = initExpr.declarations.length; i < j; i++) {
                    var names = BoundNames(initExpr.declarations[i]);
                    for (var y = 0, z = names.length; y < z; y++) {
                        dn = names[y];
                        if (isConst) {
                            loopEnv.CreateImmutableBinding(dn);
                        } else {
                            loopEnv.CreateMutableBinding(dn, false);
                        }
                    }
                }

                getContext().lexEnv = loopEnv;

                forDcl = Evaluate(initExpr);
                if (!LoopContinues(forDcl, labelSet)) {
                    getContext().lexEnv = oldEnv;
                    return forDcl;
                }

                bodyResult = ForBodyEvaluation(testExpr, incrExpr, body, labelSet);

                getContext().lexEnv = oldEnv;
                return bodyResult;

            } else {
                var exprRef = Evaluate(initExpr);
                var exprValue = GetValue(exprRef);
                if (!LoopContinues(exprValue, labelSet)) return exprValue;
                return ForBodyEvaluation(testExpr, incrExpr, body, labelSet);
            }
        }

    }

    function ForBodyEvaluation(testExpr, incrementExpr, stmt, labelSet) {
        "use strict";
        var V;
        var result;
        var testExprRef, testExprValue;
        var incrementExprRef, incrementExprValue;
        for (;;) {
            if (testExpr) {
                testExprRef = Evaluate(testExpr);
                testExprValue = GetValue(testExprRef);
                if (testExprValue === false) return NormalCompletion(V);
                if (!LoopContinues(testExprValue, labelSet)) return testExprValue;
            }

            result = Evaluate(stmt);

            if (result instanceof CompletionRecord) {
                if (result.value !== empty) V = result.value;
            } else V = result;

            if (!LoopContinues(result, labelSet)) return result;
            if (incrementExpr) {
                incrementExprRef = Evaluate(incrementExpr);
                incrementExprValue = GetValue(incrementExprRef);
                if (!LoopContinues(incrementExprValue, labelSet)) return incrementExprValue;
            }
        }
        return NormalCompletion(V);
    }

    function CaseSelectorEvaluation(node) {
        var test = node.test;
        var exprRef = Evaluate(test);
        return GetValue(exprRef);
    }

    function CaseBlockEvaluation(input, caseBlock) {

        var clause;
        var clauseSelector;
        var runDefault = true;
        var matched;
        var sList;
        var V;
        var R;
        var defaultClause;
        var searching = true;
        loop: for (var i = 0, j = caseBlock.length; i < j; i++) {
            clause = caseBlock[i];
            if (clause.type === "DefaultCase") {
                defaultClause = clause;
            } else {

                clauseSelector = CaseSelectorEvaluation(clause);
                if (isAbrupt(clauseSelector)) return clauseSelector;
                if (searching) matched = SameValue(input, clauseSelector);
                if (matched) {
                    searching = false;
                    sList = clause.consequent; // parseNode
                    if (sList) {
                        R = GetValue(Evaluate(sList));
                        if (isAbrupt(R)) {
                            if (R.type === "break") break loop;
                            if (R.type === "continue") return withError("Type", "continue is not allowed in a switch statement");
                            if (R.type === "throw") return R;
                            if (R.type === "return") return R;
                        } else {
                            V = R;
                        }
                    }
                    if (isAbrupt(R)) break loop;
                }

            }
        }

        if (!isAbrupt(R)) searching = true; // kein Break.
        if (searching && defaultClause) {
            R = Evaluate(defaultClause.consequent);
            if (isAbrupt(R)) {
                if (R.type === "break") return V;
                if (R.type === "continue") return withError("Type", "continue is not allowed in a switch statement");
                if (R.type === "throw") return R;
                if (R.type === "return") return R;
            } else {
                V = GetValue(R);
            }
        }

        return V;
    }

    evaluation.SwitchStatement = SwitchStatement;

    function SwitchStatement(node) {
        var oldEnv, blockEnv;
        var R;
        var switchExpr = node.discriminant;
        var caseBlock = node.cases;
        var exprRef = Evaluate(switchExpr);
        var switchValue = GetValue(exprRef);
        if (isAbrupt(switchValue)) return switchValue;
        oldEnv = getLexEnv();
        blockEnv = NewDeclarativeEnvironment(oldEnv);
        R = InstantiateBlockDeclaration(caseBlock, blockEnv);
        if (isAbrupt(R)) return R;
        getContext().lexEnv = blockEnv;
        R = CaseBlockEvaluation(switchValue, caseBlock);
        getContext().lexEnv = oldEnv;
        return R;
    }

    function TemplateStrings(node, raw) {
        var strings = [];

        var rawString = node.value.slice(1, node.value.length - 1);

        var intoPieces = /(\$\{[^}]+})/g;
        var sparseSpans = rawString.split(intoPieces);

        var getVarName = /\$\{([^\}]+)\}/;
        var sparseVars = sparseSpans.map(function (x) {
            if (x) return x.split(getVarName)[1];
        });

        for (var i = 0, j = sparseVars.length; i < j; i++) {

            if (raw) {
                /*
			strings = TRV(head).concat(TRV(middle)).concat(TRV(tail));
			*/
                if (sparseVars[i] === undefined) { // auf Span
                    strings.push(sparseSpans[i]);
                } else { // auf Element
                    //    strings.push(sparseVars[i]);
                }
            } else {
                /*
			strings = TV(head).concat(TV(middle)).concat(TV(tail));
			*/
                if (sparseVars[i] === undefined) { // auf Span
                    // strings.push(sparseSpans[i]);
                } else { // auf Element
                    strings.push(sparseVars[i]);
                }
            }
        }
        return strings;
    }

    function SubstitutionEvaluation(siteObj) {
        var len = +Get(siteObj, "length");
        var results = [];
        for (var i = 0; i < len; i++) {
            var expr = Get(siteObj, ToString(i));
            if ((expr = ifAbrupt(expr)) && isAbrupt(expr)) return expr;
            if (typeof expr === "string") {
                expr = parseGoal("Expression", expr);
                var exprRef = Evaluate(expr);
                var exprValue = GetValue(exprRef);
                if ((exprValue = ifAbrupt(exprValue)) && isAbrupt(exprValue)) return exprValue;
                results.push(exprValue);
            }
        }
        return results;
    }

    function GetTemplateCallSite(templateLiteral) {
        //if (templateLiteral.siteObj) return templateLiteral.siteObj;
        var cookedStrings = TemplateStrings(templateLiteral, false); // die expressions ??? bei mir jedenfalls gerade
        var rawStrings = TemplateStrings(templateLiteral, true); // strings 
        var count = Math.max(cookedStrings.length, rawStrings.length);
        var siteObj = ArrayCreate(count);
        var rawObj = ArrayCreate(count);
        var index = 0;
        var prop, cookedValue, rawValue;
        while (index < count) {
            prop = ToString(index);
            cookedValue = cookedStrings[index];
            rawValue = rawStrings[index];
            if (cookedValue !== undefined) callInternalSlot("DefineOwnProperty", siteObj, prop, {
                value: cookedValue,
                enumerable: false,
                writable: false,
                configurable: false
            });
            if (rawValue !== undefined) callInternalSlot("DefineOwnProperty", rawObj, prop, {
                value: rawValue,
                enumerable: false,
                writable: false,
                configurable: false
            });
            index = index + 1;
        }
        SetIntegrityLevel(rawObj, "frozen");
        DefineOwnProperty(siteObj, "raw", {
            value: rawObj,
            enumerable: false,
            writable: false,
            configurable: false
        });
        SetIntegrityLevel(siteObj, "frozen");
        templateLiteral.siteObj = siteObj;
        return siteObj;
    }

    function TemplateLiteral(node) {
        return GetTemplateCallSite(node);
    }

    evaluation.TemplateLiteral = TemplateLiteral;


    var defaultClassConstructorFormalParameters = parseGoal("FormalParameterList", "...args");
    var defaultClassConstructorFunctionBody = parseGoal("FunctionBody", "return super(...args);");


    function DefineMethod(node, object, functionPrototype) {
        "use strict";
        var body = getCode(node, "body");
        var formals = getCode(node, "params");
        var key = node.id;
        

        var computed = node.computed;

        var strict = IsStrict(body);
        var scope = getLexEnv();
        var closure;
        var generator = node.generator;

        var propKey;
        
        if (computed) {
            propKey = GetValue(Evaluate(key));
            if ((propKey=ifAbrupt(propKey)) && isAbrupt(propKey)) return propKey;
            if (!IsSymbol(propKey)) return withError("Type", "A [computed] property inside an object literal has to evaluate to a Symbol primitive");
        } else {
            propKey = PropName(node);
        }

        var methodName = propKey;
        if ((propKey = ifAbrupt(propKey)) && isAbrupt(propKey)) return propKey;

        
        if (ReferencesSuper(node)) {
            var home = getInternalSlot(object, "HomeObject");
        } else {
            home = undefined;
            methodName = undefined;
        }

        if (generator) closure = GeneratorFunctionCreate("method", formals, body, scope, strict, functionPrototype, home, methodName);
        else closure = FunctionCreate("method", formals, body, scope, strict, functionPrototype, home, methodName);
        if ((closure=ifAbrupt(closure)) && isAbrupt(closure)) return closure;
        
        var rec = {
            key: propKey,
            closure: closure
        };
        return NormalCompletion(rec);
    }



    evaluation.MethodDefinition = MethodDefinition;
    function MethodDefinition(node, object) {
        "use strict";
        var fproto;

        if (node.generator) {
            var intrinsics = getIntrinsics();
            fproto = Get(intrinsics, "%GeneratorFunction%");
        } 

        var methodDef = DefineMethod(node, object, fproto);
        if ((methodDef = ifAbrupt(methodDef)) && isAbrupt(methodDef)) return methodDef;
        SetFunctionName(methodDef.closure, methodDef.key);
        
        var desc = {
            value: methodDef.closure,
            writable: true,
            enumerable: true,
            configurable: true
        };
        return DefineOwnPropertyOrThrow(object, methodDef.key, desc);
    }

    evaluation.ClassDeclaration = ClassDeclaration;

    function ClassDeclaration(node) {
        "use strict";
        var superclass = null;
        var elements = node.elements;
        var constructor = ConstructorMethod(elements);
        var staticMethods = StaticMethodDefinitions(elements);
        var protoMethods = PrototypeMethodDefinitions(elements);
        var protoParent;
        var intrinsics = getIntrinsics();
        var ObjectPrototype = Get(intrinsics, "%ObjectPrototype%");
        var FunctionPrototype = Get(intrinsics, "%FunctionPrototype%");
        var className = node.id;
        var isExtending = node.extends;
        var constructorParent;
        var Proto;
        var element, decl;
        var name, isStatic;
        var status;
        var type;
        var expression = node.expression;

        if (node.extends) {
            superclass = GetValue(Evaluate(node.extends));
        }

        if (!superclass) {
            protoParent = null;
            constructorParent = FunctionPrototype;
        } else {
            if (Type(superclass) !== "object") return withError("Type", "superclass is no object");
            if (!IsConstructor(superclass)) return withError("Type", "superclass is no constructor");
            protoParent = Get(superclass, "prototype");
            if (Type(protoParent) !== "object" && Type(protoParent) !== "null") return withError("Type", "prototype of superclass is not object, not null");
            constructorParent = superclass;
        }

        Proto = ObjectCreate(protoParent);
        var lex = getLexEnv();
        var scope = NewDeclarativeEnvironment(lex);
        if (className) {
            lex.CreateMutableBinding(className);
        }

        var caller = cx.callee;
        getContext().lexEnv = scope;
        cx.callee = className;
        cx.caller = caller;
        getContext().lexEnv = scope;
        var F = FunctionCreate("normal", [], null, scope, true, FunctionPrototype, constructorParent);

        if (!constructor) {
            if (isExtending) {
                setInternalSlot(F, "FormalParameters", defaultClassConstructorFormalParameters);
                setInternalSlot(F, "Code", defaultClassConstructorFunctionBody);
            } else {
                setInternalSlot(F, "FormalParameters", []);
                setInternalSlot(F, "Code", []);
            }
        } else {
            setInternalSlot(F, "FormalParameters", constructor.params);
            setFunctionLength(F, ExpectedArgumentCount(constructor.params));
            setInternalSlot(F, "Code", constructor.body);
        }

        setInternalSlot(F, "Construct", function (argList) {
            var F = this;
            return OrdinaryConstruct(F, argList);
        });

        var i, j;

        for (i = 0, j = protoMethods.length; i < j; i++) {
            if (decl = protoMethods[i]) {
                status = evaluation.MethodDefinition(decl, Proto);
                if (isAbrupt(status)) return status;
            }
        }
        for (i = 0, j = staticMethods.length; i < j; i++) {
            if (decl = staticMethods[i]) {
                status = evaluation.MethodDefinition(decl, F);
                if (isAbrupt(status)) return status;
            }
        }
        if (node.extends) {
            setInternalSlot(F, "HomeObject", protoParent);
            setInternalSlot(F, "MethodName", "constructor");
        }

        MakeConstructor(F, false, Proto);

        if (className) {
            SetFunctionName(F, className);
            lex.InitialiseBinding(className, F);
        }

        getContext().lexEnv = lex;
        return NormalCompletion(F);
    }


    function SuperExpression(node) {
        return NormalCompletion(empty);
    }
    evaluation.SuperExpression = SuperExpression;
    evaluation.ModuleDeclaration = ModuleDeclaration;


    function ModuleDeclaration(node) {
        return NormalCompletion(empty);
    }
    evaluation.ImportStatement = ImportStatement;
    evaluation.ExportStatement = ExportStatement;

    function ImportStatement(node) {

    }
    function ExportStatement(node) {

    }

    evaluation.WithStatement = WithStatement;
    function WithStatement(node) {
        var body = getCode(node, "body");
        var object = GetValue(Evaluate(node.object));
        var objEnv = new ObjectEnvironment(object, cx.lexEnv);
        objEnv.withEnvironment = true;
        var oldEnv = getLexEnv();
        getContext().lexEnv = objEnv;
        var result = Evaluate(body);
        getContext().lexEnv = oldEnv;
        if (isAbrupt(result)) return result;
        return NormalCompletion(undefined);
    }

    evaluation.ArrayComprehension = ArrayComprehension;
    evaluation.GeneratorComprehension = GeneratorComprehension;
    function ComprehensionEvaluation(node, accumulator) {

        var filters = node.filter;
        var expr = node.expression;
        var filter;
        if (accumulator !== undefined) {

            if (filters.length) {
                for (var i = 0, j = filters.length; i < j; i++) {
                    if (filter = filters[i]) {
                        var filterRef = Evaluate(filter);
                        var filterValue = GetValue(filterRef);
                        if ((filterValue = ifAbrupt(filterValue)) && isAbrupt(filterValue)) return filterValue;
                        if (ToBoolean(filterValue) === false) break;
                    }
                }
            }

            if (!filter || (ToBoolean(filterValue) === true)) {

                var exprRef = Evaluate(expr);
                var exprValue = GetValue(exprRef);
                var len = Get(accumulator, "length");
                if (len >= (Math.pow(2, 53) - 1)) return withError("Range", "Range limit exceeded");

                var putStatus = Put(accumulator, ToString(len), exprValue, true);
                if ((putStatus = ifAbrupt(putStatus)) && isAbrupt(putStatus)) return putStatus;
                len = len + 1;
                var putStatus = Put(accumulator, "length", len, true);
                if ((putStatus = ifAbrupt(putStatus)) && isAbrupt(putStatus)) return putStatus;

            }

            return NormalCompletion(undefined);

        } else {
            var yieldStatus = GeneratorYield(CreateItrResultObject(value, false));
            if ((yieldStatus = ifAbrupt(yieldStatus)) && isAbrupt(yieldStatus)) return yieldStatus;
            return NormalCompletion(undefined);
        }
    }

    function QualifierEvaluation(block, node, accumulator) {

        var forBinding = block.left;
        var assignmentExpr = block.right;
        var exprRef = Evaluate(assignmentExpr);
        var exprValue = GetValue(exprRef);
        var obj = ToObject(exprValue);
        if ((obj = ifAbrupt(obj)) && isAbrupt(obj)) return obj;
        var iterator = Invoke(obj, $$iterator, []);
        var keys = ToObject(iterator);
        var oldEnv = getLexEnv();
        var noArgs = [];
        var status;

        for (;;) {

            var nextResult = Invoke(keys, "next", noArgs);
            if ((nextResult = ifAbrupt(nextResult)) && isAbrupt(nextResult)) return nextResult;
            if (Type(nextResult) !== "object") return withError("Type", "QualifierEvaluation: nextResult is not an object");
            var done = IteratorComplete(nextResult);
            if ((done = ifAbrupt(done)) && isAbrupt(done)) return done;
            if (done === true) return true;
            var nextValue = IteratorValue(nextResult);
            if ((nextValue = ifAbrupt(nextValue)) && isAbrupt(nextValue)) return nextValue;
            var forEnv = NewDeclarativeEnvironment(oldEnv);
            var bn = BoundNames(forBinding);
            for (var i = 0, j = bn.length; i < j; i++) {
                forEnv.CreateMutableBinding(bn[i]);
                status = BindingInitialisation(forBinding, nextValue, forEnv);
                if (isAbrupt(status)) return status;
            }
            getContext().lexEnv = forEnv;
            var continu = ComprehensionEvaluation(node, accumulator);
            getContext().lexEnv = oldEnv;
            if ((continu = ifAbrupt(continu)) && isAbrupt(continu)) return continu;
        }

        return accumulator;
    }

    function ArrayComprehension(node) {
        var blocks = node.blocks;
        var filter = node.filter;
        var expr = node.expression;

        var array = ArrayCreate(0);
        var status;

        for (var i = 0, j = blocks.length; i < j; i++) {
            status = QualifierEvaluation(blocks[i], node, array);
            if ((status = ifAbrupt(status)) && isAbrupt(status)) return status;
        }

        return array;
    }

    function GeneratorComprehension(node) {

        var filter = node.filter;
        var blocks = node.blocks;
        var binding;

        var closure = FunctionCreate("generator", [], [], getLexEnv(), true);
        return closure.Call(undefined, []);
    }

    function CatchClauseEvaluation(thrownValue, catchNode) {
        var status, oldEnv, catchEnv;
        var catchBlock = catchNode.block;
        var catchParameter = catchNode.params && catchNode.params[0];
        var boundNames = BoundNames(catchNode.params);
        var R;
        oldEnv = getLexEnv();
        catchEnv = NewDeclarativeEnvironment(oldEnv);
        getContext().lexEnv = catchEnv;
        for (var i = 0, j = boundNames.length; i < j; i++) {
            catchEnv.CreateMutableBinding(boundNames[i]);
        }
        status = BindingInitialisation(catchParameter, thrownValue, undefined);
        if (isAbrupt(status)) return status;
        R = Evaluate(catchBlock);
        getContext().lexEnv = oldEnv;
        return R;
    }

    evaluation.Finally = Finally;

    function Finally(node) {
        return Evaluate(node.block);
    }

    evaluation.TryStatement = TryStatement;

    function TryStatement(node) {
        var tryBlock = node.handler;
        var catchNode = node.guard;
        var finalizer = node.finalizer;
        var B, C, F;

        B = Evaluate(tryBlock);
        if (isAbrupt(B) && (B.type === "throw")) {
            var thrownValue = B.value;
            C = CatchClauseEvaluation(thrownValue, catchNode);
        } else {
            C = B;
        }

        if (finalizer) {
            F = Evaluate(finalizer);
            if (!isAbrupt(F)) {
                return C;
            }
        } else {
            return C;
        }
        return F;
    }

    var isStrictMode = {
        "'use strict'": true,
        '"use strict"': true
    };
    var isUsingAsmJsWhatMeansNuttingButADirectiveHereBUTaValidatorOrGeneratorWouldBeCool = {
        "'use asm'": true,
        '"use asm"': true
    };

    evaluation.Directive = Directive;

    function Directive(node) {
        if (isStrictMode[node.value]) {
            getContext().strict = true;
        } else if (isUsingAsmJsWhatMeansNuttingButADirectiveHereBUTaValidatorOrGeneratorWouldBeCool[node.value]) {
            getContext().asm = true;
        }
        return NormalCompletion(empty);
    }

    function tellExecutionContext(node, i) {

        loc = node.loc || loc;
        cx.state.node = node;
        cx.line = loc.start.line;
        cx.column = loc.start.column;
        cx.index = i;
        if (node.strict !== undefined) cx.strict = node.strict;
    }

    evaluation.ScriptBody =
        evaluation.Program = Program;

    function Program(program) {

        "use strict";
        var v;
        
        if (program.strict) {
            getContext().strict = true;
        }

        var status = InstantiateGlobalDeclaration(program, getGlobalEnv(), []);
        if (isAbrupt(status)) return status;

        tellExecutionContext(program, 0);
        cx.callee = "ScriptItemList";
        cx.caller = "Script";

        var node;
        var V = undefined;
        var body = program.body;
        for (var i = 0, j = program.body.length; i < j; i += 1) {
            if (node = body[i]) {
                tellExecutionContext(node, i);
                v = GetValue(Evaluate(node));
                if (isAbrupt(v)) {
                    //    cx = oldContext();
                    return v;
                }
                if (v !== empty) V = v;
            }
        }

        getContext().strict = false;
        return NormalCompletion(V);
    }

    function TransformObjectToJSObject(O) {

        var o = {};

        var keys = OwnPropertyKeysAsList(O);
        keys.forEach(function (key) {

            var desc = GetOwnProperty(O, key);
            var value = desc.value;
            var newValue;

            if (Type(value) === "object") {

                if (IsCallable(value)) {
                    newValue = function () {
                        var c = callInternalSlot("Call", value, value, arguments);
                        c = unwrap(c);
                        if (Type(c) === "object") return TransformObjectToJSObject(c);
                        return c;
                    };
                } else {

                    newValue = TransformObjectToJSObject(value);
                }
            } else if (Type(value) === "symbol") {
                newValue = {
                    type: "symbol",
                    description: value.Description
                };
            } else newValue = value;

            Object.defineProperty(o, key, {
                value: newValue,
                writable: desc.writable,
                enumerable: desc.enumerable,
                configurable: desc.configurable
            });

        });

        return o;
    }

    /************************************************************ end of ast evaluation section ***************************************************************/

    var DiverseSubProductions = {
        "alternate": "alternate",
        "consequent": "consequent",
        "left": "left",
        "right": "right",
        "body": "body",
        "block": "block"
    };

    function RecordIndex(search, node, state) {
        var p, k, i, j;
        var type = search.type;
        if (search === node) return state;
        if (Array.isArray(node)) {
            for (i = 0, j = node.length; i < j; i++) {
                p = node[i];
                if (RecordIndex(search, p, state)) {
                    state.push(i);
                    return state;
                }
            }
        }
        for (k in node) {
            if (Object.hasOwnProperty.call(node, k)) {
                if (p = node[DiverseSubProductions[k]]) {
                    i = RecordIndex(search, p, state);
                    if (i) state.push(k);
                    return state;
                }

            }
        }
    }

    function GetRootNode(node) {
        var root;
        if (!node.parent) return node;
        root = node.parent;
        do {
            if (root.parent) root = root.parent;
        } while (root.parent);
        return root;
    }

    ecma.ResumableEvaluation = ResumableEvaluation;

    function ResumableEvaluation(node, state, completion) {

        if (!state) state = RecordIndex(node, GetRootNode(node), []);

        var pos = state.pop();
        var production = node[pos];
        var exprRef;
        var exprValue;
        var p;

        if (Array.isArray(production)) {

            // Halt hier muss ich den Loop drueber resumen, das heisst,
            // hier die Position ermitteln und
            // dem Ding drueber die Parameter zum resumen mitgeben.

            pos = state.pop();

            if (state.length) {
                completion = ResumableEvaluation(production[pos], state, completion);
            }

            for (var i = pos, j = production.length; i < j; i++) {
                var p = production[i];
                exprRef = Evaluate(p, completion); // YieldExpression mit Value ???
                if ((exprRef = ifAbrupt(exprRef)) && isAbrupt(exprRef)) return exprRef;
                if (cx.pauseGenerator) return exprRef;
            }

            return NormalCompletion();

        } else {
            if (!state.length) return Evaluate(node, completion);
            return ResumableEvaluation(production, state, completion);
        }
    }

    function Evaluate(node) {
        var E, R;
        var body, i, j;

        if (!node) return NormalCompletion(undefined); //  withError("Type", "Null node received");

        if (typeof node === "string") {
            debug("Evaluate(resolvebinding " + node + ")");
            R = ResolveBinding(node);
            return R;
        } else if (Array.isArray(node)) {
            debug("Evaluate(StatementList)");
            R = evaluation.StatementList(node);
            return R;
        } else {
            debug("Evaluate(" + node.type + ")");
            if (E = evaluation[node.type]) {
                tellExecutionContext(node, 0);
                R = E.apply(this, arguments);
            }

            return R;
        }
    }

    function HandleEventQueue(shellmode, initialised) {
        var task, val;
        var func, timeout, time, result;

        function handler() {
            if (task = eventQueue.shift()) {
                func = task.func;
                time = Date.now();
                if (time >= (task.time + task.timeout)) {
                    if (IsCallable(func)) result = func.Call(ThisResolution());
                    if (isAbrupt(result)) result = result; // ThrowAbruptThrowCompletion(result);
                } else eventQueue.push(task);
            }
            if (eventQueue.length) setTimeout(handler, 0);
            else if (!shellmode && initialised) endRuntime();
        }
        setTimeout(handler, 0);
    }

    function makeNativeException (error) {
        var name = Get(error, "name");
        var message = Get(error, "message");
        var callstack = Get(error, "stack");
        var text = makeMyExceptionText(name, message, callstack);

        var nativeError = new Error(name);
        nativeError.name = name;
        nativeError.message = message;
        nativeError.stack = text;
        return nativeError;
    }

    function ExecuteTheCode(source, shellModeBool, resetEnvNowBool) {
        var exprRef, exprValue, text, type, message, stack, error, name, callstack;

        var node = typeof source === "string" ? parse(source) : source;
        if (!node) throw "example: Call Evaluate(parse(source)) or Evaluate(source)";

        if (!initialisedTheRuntime || !shellModeBool || resetEnvNowBool) {
            registerCompletionUpdater(completionUpdater);
            initializeTheRuntime();
            NormalCompletion(undefined);
        }

        exprRef = Evaluate(node);
        if (Type(exprRef) === "reference") exprValue = GetValue(exprRef);
        else exprValue = exprRef;

        if ((exprValue = ifAbrupt(exprValue)) && isAbrupt(exprValue)) {

            if (exprValue.type === "throw") {
                error = exprValue.value;

                if (Type(error) === "object") {
                    error = makeNativeException(error)
                } else {
                    error = new Error(error);
                    error.stack = "{eddies placeholder for stackframe of non object throwers}";
                }

                if (error) throw error;
            }
        }

        if (!shellModeBool && initialisedTheRuntime && !eventQueue.length) endRuntime();
        else if (eventQueue.length) {
            setTimeout(function () {
                HandleEventQueue(shellModeBool, initialisedTheRuntime);
            }, 0);
        }

        return exprValue;
    }

    function endRuntime() {
        initialisedTheRuntime = false;
    }


    function initializeTheRuntime() {

        realm = createRealm(); // and everything else

        
        cx = getContext();
        initialisedTheRuntime = true;
        /* rubbish */
        
        scriptLocation = "(syntax.js)";

        if (typeof window !== "undefined") {
            scriptLocation = "("+document.location.href + " @syntax.js)";
        } else if (typeof process !== "undefined") {
            scriptLocation = "(node.js interpreter)";
        } else {
            scriptLocation = "(worker)";
        }
        
        realm.xs.scriptLocation = scriptLocation;

    }

    function completionUpdater(c, v, b) {
        completion = c;
        jsval = v;
        abrupt = b;
    }

    /*
		exports.ExecuteTheCode = ExecuteTheCode;
		exports.setCodeRealm = setCodeRealm;
		exports.Evaluate = Evaluate;
		exports.ResumableEvaluation = ResumableEvaluation;
		*/

    ExecuteTheCode.setCodeRealm = setCodeRealm;
    ExecuteTheCode.Evaluate = Evaluate;

    return ExecuteTheCode;
});

// *******************************************************************************************************************************
// Highlight (UI Independent Function translating JS into a string of spans)
// *******************************************************************************************************************************

define("lib/syntaxerror-highlight", ["lib/tables", "lib/tokenizer"], function (tables, tokenize) {

    "use strict";

    var HighlighterClassNames = {
        __proto__: null,
        "Identifier": "syntaxjs-identifier",
        "NumericLiteral": "syntaxjs-number",
        "BooleanLiteral": "syntaxjs-boolean",
        "NullLiteral": "syntaxjs-null",
        "Keyword": "syntaxjs-keyword",
        "StringLiteral": "syntaxjs-string",
        "MultiLineComment": "syntaxjs-comment",
        "LineComment": "syntaxjs-comment",
        "FutureReservedWord": "syntaxjs-keyword",
        "RegularExpressionLiteral": "syntaxjs-regexp",
        "Punctuator": "syntaxjs-punctuator",
        "TemplateLiteral": "syntaxjs-template"
    };
    highlight.HighlighterClassNames = HighlighterClassNames;

    function stringifyTokens(array) {
        //        return array.join("");
        var string = "";
        for (var i = 0, j = array.length; i < j; i++) {
            string += array[i].value;
        }
        return string;
    }

    var parse;

    function highlight(text, options, rec) {

        var highlighted = [];
        var tokens, word, m, n, type;
        var wordcount;
        var cln;
        var el;
        var excp;
        var oid, rid;
        options = options || {};

        var withast = options.ast;

        if (typeof text === "string" && typeof importScripts === "function") {
            el = null;
            rec = null;
        } else if (text === null && rec instanceof HTMLElement) {
            text = rec.innerText || rec.textContent || text.innerHTML;
            el = rec;
            rec = Object.create(null);
            rec.element = el;
        } else if (text === null && typeof rec === "object") {
            el = rec.element;
            text = rec.input || (el.innerText || el.textContent || el.innerHTML);
        }

        if (Array.isArray(text)) tokens = text;
        else {

            try {
                tokens = tokenize(text);
            } catch (ex) {
                excp = "\n<br>syntax.js exception: " + ex.name + "<br>\n" + ex.message + "\n<br>" + ("" + ex.stack).split("\n").join("<br>\n");
                if (el) el.innerHTML += excp;
                text += excp;
                return text;
            }

        }

        if (rec) {
            if (!rec.originalText) rec.originalText = text;
            rec.input = text;
            rec.tokens = tokens;
        }

        if (withast) {
            if (!parse) parse = require("lib/parser");
            rec.ast = parse(tokens);
        }

        for (m = 0, n = tokens.length; m < n; m++) {
            type = tokens[m].type;
            word = tokens[m].value;
            //    oid = tokens[m]._oid_;

            if (cln = HighlighterClassNames[type]) word = "<span class='" + cln + "'" + ">" + word + "</span>";
            /*(oid?("data-syntaxjs-oid='"+oid+"'"):"")*/

            highlighted.push({
                type: type,
                value: word
            });
        }

        text = stringifyTokens(highlighted);

        if (rec) {
            rec.highlightedTokens = highlighted;
            rec.highlightedText = text;
        }

        if (el) el.innerHTML = text;
        return text;
    }

    return highlight;

});

/* ** Syntax-Highlighter Komponente ************************************************************************************************************************************************************************* */
if (typeof process === "undefined" && typeof window !== "undefined")

    define("lib/syntaxerror-highlight-gui", ["lib/tables", "lib/tokenizer", "lib/parser", "lib/runtime", "lib/builder", "heap", "lib/syntaxerror-highlight"],
        function (tables, tokenize, parse, Evaluate, builder, heap, highlight) {

            "use strict";

            function addEventListener(element, type, func, capture) {
                if (typeof element.attachEvent === "function" && typeof element.addEventListener !== "function") {
                    if (type == "DOMContentLoaded") type = "load";
                    return element.attachEvent("on" + type, func);
                } else return element.addEventListener(type, func, capture);
            }

            var DOM = tables.DOM;
            var HTML5Objects = tables.HTML5Objects;
            var NodeJSObjects = tables.NodeJSObjects;
            var Builtins = tables.Builtins;
            var Comment = tables.Comment;
            var Parentheses = tables.Parentheses;
            var Quotes = tables.Quotes;
            var Punctuators = tables.Punctuators;
            var WhiteSpaces = tables.WhiteSpaces;
            var PunctToExprName = tables.PunctToExprName;
            var LineTerminators = tables.LineTerminators;
            var ParensSemicolonComma = tables.ParensSemicolonComma;
            var Types = tables.Types;
            var SemicolonInsertionPoint = tables.SemicolonInsertionPoint;
            var ReservedWord = tables.ReservedWord;
            var TypeOfToken = tables.TypeOfToken;
            var Keywords = tables.Keywords;
            var IsAnyLiteral = tables.IsAnyLiteral;
            var BinaryOperators = tables.BinaryOperators;
            var AssignmentOperators = tables.AssignmentOperators;
            var RelationalOperators = tables.RelationalOperators;
            var UnaryOperators = tables.UnaryOperators;
            var UpdateOperators = tables.UpdateOperators;
            var EqualityOperators = tables.EqualityOperators;
            var RelationalOperators = tables.RelationalOperators;
            var LogicalOperators = tables.LogicalOperators;
            var BitwiseOperators = tables.BitwiseOperators;
            var InOperator = tables.InOperator;
            var OpenParens = tables.OpenParens;
            var ExprEndOfs = tables.ExprEndOfs;
            var OperatorPrecedence = tables.OperatorPrecedence;
            var RegExpFlags = tables.RegExpFlags;
            var RegExpNoneOfs = tables.RegExpNoneOfs;

            var GUI = {};

            function createRecord(element, options) {
                var rec = Object.create(null);
                if (element) {
                    rec.element = element;
                    rec.input = element.textContent;
                    rec.options = options;
                }
                return rec;
            }

            function setRecord(rec, data) {
                if (typeof data == "object") assign(rec, data);
                return null;
            }

            function assign(obj, obj2) {
                for (var k in obj2)
                    if (Object.hasOwnProperty.call(obj2, k))
                        obj[k] = obj2[k];
                return obj;
            }

            var DataAttributes = {
                "id": "data-syntaxjs",
                "highlight": "data-syntaxjs-highlight",
                "controls": "data-syntaxjs-controls",
                "language": "data-syntaxjs-language",
                "shell": "data-syntaxjs-shell"
            };

            var ClassNames = {
                __proto__: null,
                /* Elements */
                "wrapper": "syntaxjs-container",
                "buttons": "syntaxjs-button-container",
                "mainview": "syntaxjs-view",
                "token": "syntaxjs-tokens-button",
                "editorview": "syntaxjs-editor",
                "info": "syntaxjs-fileinformations",
                "console": "syntaxjs-eval-console",
                /* Buttons */
                "eval": "syntaxjs-native-eval-button",
                "original": "syntaxjs-originaltext-button",
                "linecount": "syntaxjs-lineno-button",
                "line": "syntaxjs-lineno",
                "editor": "syntaxjs-editor-button",
                "wordcount": "syntaxjs-wordcount-button",
                "wordcount-list": "syntaxjs-wordcountlist",
                "wordcount-panel": "syntaxjs-wordcount-panel",
                "wordcount-table": "syntaxjs-wordcount-table",
                "minify": "syntaxjs-minify-button",
                "tokens": "syntaxjs-tokens-button",
                "highlight": "syntaxjs-highlight-button",
                "ast": "syntaxjs-ast-button",
                "value": "syntaxjs-eval-button",
                "source": "syntaxjs-generator-button",
                "ss": "ss",
                "beauty": "syntaxjs-beautyfier-button",
                "shell-input": "syntaxjs-shell-input",
                "shell": "syntaxjs-shell-button"

            };
            var ClassTests = {};
            for (var k in ClassNames) {
                ClassTests[k] = true;
            }
            var Duties = {
                "true": true,
                "yes": true,
                "y": true
            };
            var OffDuties = {
                "false": true,
                "off": true,
                "no": true,
                "none": true
            };

            var ButtonNames = {
                __proto__: null,
                "eval": "Eval (Browser)",
                "original": "OriginalText",
                "linecount": "Zeilennummern",
                "editor": "Add/Hide Editor (Alpha)",
                "wordcount": "Wordcount",
                "minify": "Minifier",
                "token": "Tokens",
                "highlight": "Highlighted",
                "ast": "Abstract Syntax Tree",
                "value": "Evaluate(AST)",
                "infos": "Informationen",
                "source": "ToSource(AST)",
                "beauty": "Beautyfier",
                "shell": "shell input el"
            };

            var TagNames = {
                "PRE": true,
                "SPAN": true
            };

            var a = Object.create(null);
            var annotationDiv;
            var Annotations = a;
            var ClassAnnotations = {
                "syntaxjs-comment": "Kommentar",
                "syntaxjs-string": "Ein Zeichenkette, String genannt",
                "syntaxjs-regexp": "Regulaerer Ausdruck",
                "syntaxjs-template": "TemplateStrings sind neu in ES6",
                "syntaxjs-number": "Der Number Type ist ein 64 Bit Floating Point mit 11 Bit Exponent und 53 Bit Mantisse.",
                "syntaxjs-null": "Das NullLiteral ist der NULL-Pointer im JavaScript. Sein Boolean Wert ist false.",
                "syntaxjs-boolean": "Booleans stehen fuer 0 und 1 und koennen falsch oder wahr, false oder true sein. Damit kann man logische Verknuepfungen aufstellen.",
                "syntaxjs-identifier": "Identifier sind Bezeichner. Der Parser liest Labels, die mit einem Doppelpunkt enden als Identifier ein. Identifier sind in der Regel die Namen von Variablen, oder von Objekteigenschaften. Sie werden aufgeloest (sie zeigen auf einen Speicherbereich) und geben einen Datentypen zurueck. In JavaScript entweder einen Primitive Type wie true, false, null oder undefined, oder einen Reference Type wie Object. Identifier identifizieren Objekte oder Variablen.",
            };
            a["&"] = "Bitweise UND Verknuepfung. Hier werden die Bits der Operanden (als int 1,2,4,8,16,...) einzeln verknuepft.",
            a["|"] = "Bitweise ODER Verknuepfung. Hier werden die Bits der Operanden  (als int 1,2,4,8,16,...) einzeln verknuepft.",
            a["<"] = "Kleiner als. Ist Links < Rechts ergibt true oder false",
            a[">"] = "Groesser als. Ist Links > Rechts ergibt true, ist Links groesser als Rechts, ansonsten false",
            a[">="] = "Groesser-Gleich. Ist Links groesser oder gleich Rechts ergibt der Ausdruck Links >= Rechts true, sonst false.",
            a["<="] = "Kleiner-Gleich. Ist Links kleiner oder gleich Rechts ergibt der Ausdruck Links &lt;= Rechts true, sonst false.",
            a["<<"] = "Left-Shift. Entspricht einer Multiplikation der linken Seite mit 2, so oft, wie rechts vom Operator steht. 1 << 3 === 1*2*2*2. 4 << 3 === 4*2*2*2. Links ueberlaufende Bits werden abgetrennt.",
            a[">>"] = "Right-Shift. Entspricht einer Division der linken Seite durch 2, so oft, wie rechts vom Operator steht. 10 >> 1 === 5. 1 >> 1 = 0. Rechts ueberlaufende Bits werden abgetrennt.",
            a["%"] = "Rest. Die Modulus Operation gibt den Rest. 15 % 8 ergibt 7. 2 % 1 ergibt 0. Mit n % 2 === 0 kann man testen, ob n gerade oder ungerade ist. Anders als in einigen anderen Sprachen gibt es hier ein Fliesskommaergebnis und nicht nur eine Integerzahl.",
            a[";"] = "Das Semikolon gibt das Ende eines Statements an. Oder kann als einzelnes EmptyStatement solo stehen.",
            a["..."] = "...rest steht fuer den RestParameter, der alle nicht definierten Parameter aufnimmt, die nach dem letzten definierten kommen. Und ...spread, die SpreadExpression, das Gegenstueck zu ...rest, ist aehnlich .apply, nur besser, und breitet einen Array abc=[1,2,3] bei f(...abc) auf f(1,2,3) aus und arbeitet auch bei Kontruktoren, was apply nicht kann, dass man ihnen mit ES6 dynamische Parameter zuweisen kann. Workaround fuer Parameter: options-Objekt statt benannte Parameter nehmen und nur einen new f({opt:true,opt2:false}) uebergeben.",
            a["undefined"] = "undefiniert, noch kein Wert zugewiesen oder letzter Wert geloescht",
            a["this"] = "this ist ein spezielles Wort, was auf das aktuelle, in dem man sich befindende, Objekt anzeigt. this kann mit call und apply explizit uebergeben werden. 'use strict' setzt this in globalen Funktionen auf undefined.",
            a["super"] = "super ist ein spezielles Wort, was in Klassen verfuegbar ist, und direkt auf das Objekt, von dem extended wird, zeigt und dessen Methoden ruft. Ruft man in einer Klassenmethode super, wird versucht, die gleiche Funktion beim Vater zu rufen.",
            a["void"] = "Der void UnaryOperator macht gar nichts und ergibt undefined. Er ist mitunter mal nuetzlich.",
            a["typeof"] = "Der typeof UnaryOperator findet raus, was der dahinterstehende Identifier oder das folgende Literal fuer ein Typ ist. typeof .77 === \"number\" oder typeof x === \"object\".",
            a["delete"] = "delete loescht eine Objekteigenschaft oder Variable und gibt im Erfolgsfall true zur&uuml;ck und im Versagensfall false.",
            a["const"] = "const gehoert zu den LexicalDeclarations und deklariert eine Read-Only Variable. Die kann man nur einmal setzen und nicht mehr ueberschreiben.",
            a["let"] = "let ist ab ES6 das neue var. Es ist Block-Scoped (blockweit sichtbar), wie man es von anderen Programmiersprachen kennt. let ist eine LexicalDeclaration.",
            a["=>"] = "Der => Pfeil nach einer (x,y) => {} oder einem Identifier wie bei x => x*x, leitet eine Arrow Function ein. Ohne Block {} haben sie ein implizites return (letzter Wert) und ein lexikalisches this, dass man kein var that benoetigt. Ab ES6",
            a["__proto__"] = "__proto__ ist ein ganz frueher von Mozilla eingefuehrter, heute praktisch allgegenwaertiger, Link, der zum Prototype fuehrt. Wenn man ihn setzt, setzt man den Prototype des Objekts, dem man ihn setzt, zur Laufzeit. Man kann unter den Header praktisch andere Koerper schrauben, wenn man dazu Daten im Constructor traegt. Das ist aber nur eine kewle Idee. In ES6 soll __proto__ womoeglich Standard werden.", // ergibt [Object object] statt der Annotation in einem {} Objekt
            a["constructor"] = "Sorgt dafuer, dass instanceof true ist. Ist der offizielle Link vom Prototype zurueck zur Constructor Funktion. Superclass.prototype.constructor() ist praktisch, um zu extenden. Hat ein F.prototype eine constructor Property, wird diese bei new F gerufen. Sie sorgt dafuer, dass instanceof true ist. new F ist sowas wie (aber nur sowas wie) F.protoype.constructor.apply({}, arguments); wobei das neue {} zurueckgegeben wird...",
            a["{}"] = "Ist meist ein Objektliteral. var obj = {}; f.bind({}, g); Kann aber auch ein leerer, vergessener Statementblock sein. if (0) {} else {}.",
            a["[]"] = "In JavaScript gibt es zwei eckige Klammern nur als ArrayLiteral [1,2,3,4]. Eine Angabe wie var array[] gibt es _nicht_ in JavaScript. [] steht immer fuer sich und fuer einen leeren Array. Mit . kann man direkt Funktionen rufen, wie var array = [].push(\"a\") was klueger var array = [\"a\"] bedeutet.",
            a["!"] = "UnaryOperator !. Negiert die Aussage, bedeutet dass !true == false und !false == true, die Formel !!zwerg wandelt in Boolean(zwerg) um",
            a["+"] = "BinaryOperator/UnaryOperator Bedeutetet Addition. Sobald einer der beiden aber ein String ist, Konkatenation (1+2==3, aber 1+'2'=='12'). Wird ebenfalls zur Stringkonkatenation ganzer_string = string1 + string2 benutzt. Als UnaryOperator ist es ein positives Vorzeichen UND es versucht die Variable dahinter in eine Number zu konvertieren.",
            a["+="] = "AssignmentOperator. Addieren und zuweisen. left += right ist das Gleiche wie left = left + right;",
            a["-="] = "AssignmentOperator. Subtrahieren und zuweisen. left -= right ist das Gleiche wie left = left - right;",
            a["*="] = "AssignmentOperator. Multiplizieren und zuweisen. left *= right ist das Gleiche wie left = left * right;",
            a["/="] = "AssignmentOperator. Dividieren und Zuweisen. left /= right ist das Gleiche wie left = left / right;",
            a["%="] = "AssignmentOperator. Rest nehmen und Zuweisen. left %= right ist das Gleiche wie left = left % right;",
            a["|="] = "Bitweises OR und Zuweisung. wenn a = 10 (0b1010) und b = 20 (0b10100), dann setzt a |= b die Variable a auf 30.",
            a["&="] = "Bitweises UND und Zuweisung. Wenn a = 10 (0b1010) und b = 20 (0b10100) dann ist a &= b === 0 (0b0)",
            a["^="] = "Bitweises XOR und Zuweisung. Ist a = 10 (0b1010) und b = 20 (0b10100), dann ist nach a ^= b das a = 30 (0b11110) und nach nochmal a^=b wieder 10, da XOR sein eigenes Invers ist.",
            a["^"] = "XOR. Wenn man a = 10 (0b1010) mit b = 20 (0b10100) XORt erhaelt man 30 (0b11110) und XORt man b ^ a, erhaelt man auch 30. Weist man das der einen Variable gleich zu und XORt nochmal mit der anderen, erhaelt man den Originalwert zurueck.",
            a["="] = "Ein = dient der Zuweisung von der rechten Seite (right-hand-side) zur linken Seite (left-hand-side). Mit = kann man keine Vergleiche anstellen.<br>= ist ein AssignmentOperator, wie &uuml;brigens auch +=, %=, *=, -=, <<=, etc.",
            a["=="] = "Ein doppeltes == dient einem Vergleich. Wenn die Typen nicht gleich sind, wird versucht, die rechte Seite zum Typen der linken zu konvertieren. (1 == \"1\", dank type coercion)",
            a["==="] = "Ein dreifaches === ist ein strikter Vergleich. Hier muss auch der Typ uebereinstimmen (1 !== \"1\", da strict und eine Number 1 kein String \"1\" ist) Bei Objekten und Arrays wird ihre Reference (Adresse) verglichen. Will man die Felder alle pruefen, muss man das selbst schreiben, siehe deepEqual Funktionsvorschlag im assert-Modul in node.js oder CommonJS deepEqual in Unit/Test/10 ",
            a["!="] = "Ein einfaches not-equal, mit type coercion (Rechte Seite dem Typ der Linken anpassen). Hier ist 0 == '0' und '1' != '2'",
            a["!=="] = "Ein strict-not-equal. Keine Umwandlung des Typs der rechten Seite zum Typ der linken Seite. Der Typ muss gleich sein. Hier muess 5 === 5 sein und nicht 5 === '5' (was Number 5 !== String '5' waere, was mit == wiederum gleich waere)",
            a["!!"] = "!! (Bangbang) wandelt eine Variable in ihren Booleanwert um. Aus !![1] (ein Array mit einer 1 als Index Element 0) wird zum Beispiel true und aus !!undefined und !!null wird jeweils false",
            a[":"] = "Ein Doppelpunkt steht in einem Objekt { a: 1, b: 2 } zwischen Propertyname und Wert.<br>\nBeim conditional Operator ?: (ConditionalExpression) steht er zwischen der linken (true) und rechten (false) Seite nach dem ?.<br>\nBei LabeledStatenebts steht er nach dem Identifier fuer das Label -> loop: while(1) { break loop; }",
            a[","] = "Mit dem Komma-Operator kann man 1.) Befehle nacheinander als ein Statement ausf&uuml;hren. Das letzte Ergebnis bleibt stehen. Bei einem if braucht man beispielsweise keine geschweiften Klammern nach der Kondition oder fuer den else-Teil, nimmt man Kommas. 2.) Das Komma trennt Eigenschaften im Objekt, trennt 3.) Elemente im Array. -- Der Komma Operator -- Ein Komma trennt im Array [a,b,c] die Elemente  voneinander. Im Objekt die Properties { a: 1, b: c }. Ein Komma kann zum trennen von Befehlen genommen werden, a(),b(),c(). Ergebnis ist der letzte Aufruf.",
            a["("] = "Oeffnende runde Klammer. Wenn etwas in runden Klammern steht wird es zuerst berechnet, alles in der Klammer zusammen ist eine Expression,  und das Ergebnis tritt an deren Stelle.\n Beispiel: ((cx = vx()) == 12) vergleicht cx == 12, nachdem das Resultat von vx() der cx zugewiesen wurde.<br>Ausserdem: Runde Klammern leiten Funktionsargumente ein function f (a, b, c), oder gruppieren die Argumente bei Invokationen f(a,b,c).<br>\nUnd um die Kondition des IfStatements, ForStatements, WhileStatements, SwitchStatements sind runde Klammern Pflicht.",
            a[")"] = "Schliessende runde Klammer. Wenn etwas in runden Klammern steht wird es zuerst berechnet, alles in der Klammer zusammen ist eine Expression,  und das Ergebnis tritt an deren Stelle.\n Beispiel: ((cx = vx()) == 12) vergleicht cx == 12,  nachdem das Resultat von vx() der cx zugewiesen wurde.<br>Ausserdem: Runde Klammern leiten Funktionsargumente ein function f (a, b, c), oder gruppieren die Argumente bei Invokationen f(a,b,c).<br>\nUnd um die Kondition des IfStatements, ForStatements, WhileStatements, SwitchStatements sind runde Klammern Pflicht. ",
            a["{"] = "Oeffnende geschweifte Klammern klammern Statements als BlockStatement ein. (if (x) {Statements} else {Statements}. FunctionBodies function f() {body} ebenso wie Objekte { a: 1, b:2 } ein.<br>\n Neu ist in EcmaScript 6 das Destructuring. let {first, last} = {first:'Vorname', last:'Nachname'} erzeugt die Variablen first und last mit den Inhalten der Objektproperties.",
            a["}"] = "Schliessende geschweifte Klammern klammern Statements (if (x) {/*{Statementblock}*/} else {/*{Statementblock}*/}, FunctionBodies function f() { /*body*/ } ebenso wie Objekte { a: 1, b:2 } ein.<br>\n Neu ist in EcmaScript 6 das Destructuring. let {first, last} = {first:'Vorname', last:'Nachname'} erzeugt die Variablen first und last mit den Inhalten der Objektproperties.",
            a["["] = "&Ouml;ffnende eckige Klammer. Eckige Klammern sind f&uuml;r [1,3,4] Arrays, ab ES6 Comprehensions [v for (v of [0,1,2,3])if (v > 1)] === [2,3],<br>\nobject[key] Subscript Operationen. Und sie umschliessen in ES6 [symbol]definierte Properties in Klassen und Objektliteralen.",
            a["]"] = "Schliessende eckige Klammer. Eckige Klammern sind f&uuml;r [1,3,4] Arrays, ab ES6 Comprehensions [v for (v of [0,1,2,3]) if (v > 1)] === [2,3],<br>\nobject[key] Subscript Operationen. Und sie umschliessen in ES6 [symbol]definierte Properties in Klassen und Objektliteralen. Klammern muessen immer in der richtigen Reihenfolge geschachtelt sein.",
            a["!!"] = "Zwei Ausrufezeichen wandeln den Ausdruck dahinter in einen Booleanwert um. Den kann man in einer logischen Verknuepfung auswerten, anstelle ein Objekt oder anderes Ergebnis, was der Ausdruck sonst ist, zwischen die Elemente der logischen Verknuefung (normal nur wahr und falsch) zu pappen..",
            a["||"] = "Der Default Operator || wertet, wenn der Ausdruck links falsch ist, den Ausdruck rechts aus.<br>Man kann damit logische Verknuepfungen und Regeln aufbauen. Mit variable = variable || 'defaultvalue' wird variable ein Wert zugewiesen, wenn ihrer undefined, null, false oder '' ist. Wurde variable gar nicht erst deklariert (mit var, let oder Parametern), gibt es einen ReferenceError: Undefinierte Variable.",
            a["&&"] = "Der Guard Operator && wertet den rechten Ausdruck nur aus, wenn der linke Ausdruck wahr ist.<br>Man kann damit logische Verknuepfungen und Regeln erstellen. Oder mit if (obj && obj.p) z.B. erstmal pruefen, ob eine Variable vorhanden ist. Ist sie (obj) es nicht, wird gar nicht auf den Folgewert (obj.p) zugegriffen und false anstelle des Ausdrucks gesetzt. Bei if (a && b) muessen beide wahr sein um in den if Block zu gelangen.",
            a["var"] = "Mit var deklariert man eine Variable. Sie wird intern nach oben gehoben und ist in der gesamten Funktion zu sehen. Zuerst mit undefined. Dann aber der Zeile, wo sie mit = einen Wert bekommt, gibt sie den Wert aus. Ab ES6 wird es let geben, womit man die Variable auf den Block beschraenkt. Sowie const, womit man nur lesbare Konstanten initialisieren kann. Eine const Variable kann man nur einmalig einen Wert zuweisen. var kann man jederzeit setzen. Ein var gilt fuer ihre Funktion und alle darin geschriebenen Funktionen. Ein Sonderfall ist noch die Funktion eval, die unter Umstaenden auch auf ihre Variablen zugreifen kann.",
            a["instanceof"] = "Ein binaerer Operator, object instanceof function. Prueft ob ein Objekt eine Instanz eines bestimmten Constructors ist. Hat dessen Prototype die Funktion als Constructor, ist instanceof auf jeden Fall true. Kann in JavaScript getrost vernachlaessigt werden und mit Duck-Typing (hasOwnProperty) und Einschaetzen des Objekts koennen Aufgaben besser geloest werden.",
            a["function"] = "Funktionen sind normale Objekte. Rufbare Objekte (engl. Callable). Man kann ihnen Properties zuweisen. Sie haben auch welche, wie ihren .name. Und Methoden wie .bind oder .call und .apply. In JavaScript sind functions first-class. Sie koennen als Statement gerufen werden, oder in Expressions. Sie koennen als Parameter uebergeben werden. Einfach einem Objekt, Array, einer Funktion mit . oder  [subscript] zuweisen. Mit () hinter dem Namen, kann man functions rufen. Wenn man sie einer Variable zuweist, wenn man sie schreibt, braucht sie keinen Namen. Das ist eine FunctionExpression. Eine FunctionDeclaration ist function gefolgt von einem Namen, Argumenten, dem FunctionBody Block und keinem Semikolon. Expresions haben ein Semikolon wie ein normaler Ausdruck hat.",
            a["arguments"] = "Das Arguments Objekt enthaelt alle Parameter, die beim Aufruf einer Funktion uebergeben wurden und ist nur innerhalb dieser gerufenen Funktion sichtbar. Ab ES6 gibt es ...rest RestParameter, die das arbeiten leichter machen.",
            a["JSRuntime"] = "JSRuntime ist die SpiderMonkey Laufzeitstruktur. Wird mit JSRuntime *rt = JS_CreateRuntime(bytes); gestartet. Mit der rt kann man dann den JSContext(rt, heapsize) erzeugen.";

            function make_console_element(rec) {
                var element = rec.element;
                var consoleElement = document.createElement("div");
                consoleElement.className = ClassNames["console"];
                consoleElement.innerHTML = "<br>\n";
                element.parentNode.insertBefore(consoleElement, element.nextSibling);
                rec.consoleElement = consoleElement;
                return consoleElement;
            }

            function make_button(rec, cname, bname, clickhndlr, nopushbool) {
                var button = document.createElement("button");
                button.className = ClassNames[cname];
                button.innerHTML = ButtonNames[bname];
                addEventListener(button, "click", clickhndlr);
                if (nopushbool) return button;
                return pushButton(rec, button)
            }
            /* append all buttons to the container element */

            function appendButtons(rec, element) {
                var buttons = rec.buttons;
                element = element || rec.wrapper;
                if (!rec || !element || !buttons) return; // fails silent
                var buttonContainer = rec.buttonContainer = document.createElement("div");
                buttonContainer.className = ClassNames["buttons"];
                for (var i = 0, j = buttons.length; i < j; i++) {
                    if (buttons[i]) buttonContainer.appendChild(buttons[i]);
                }
                element.appendChild(buttonContainer);
            }
            /* remove all the buttons from the container */

            function removeButtons(rec, element) {
                var buttons = rec.buttons;
                element = element || rec.wrapper;
                if (!rec || !element || !buttons) return;
                for (var i = 0, j = buttons.length; i < j; i++) {
                    if (buttons[i].parentNode) buttons[i].parentNode.removeChild(buttons[i]);
                }
            }
            // This function stores the buttons under each id.

            function pushButton(rec, button) {
                if (!rec.buttons) rec.buttons = [];
                rec.buttons.push(button);
                return button;
            }
            // CreateFeaturing Elements

            var registered_annotation = false;
            var globalControlsAttribute = document.documentElement.getAttribute("data-syntaxjs-controls");
            var globalControls = globalControlsAttribute !== undefined ? Duties[globalControlsAttribute] : false;

            function highlightElements(options) {

                var elements;
                var element, rec, hl, ctrl;
                var controls, tag, att;
                var annotate;
                var delegate;
                var syntaxerrors;
                var att1, att2;
                var opt;
                var opt_rec;


                if (options === undefined) {
                    options = defaultOptions();
                }

                if (!registered_annotation) {
                    registered_annotation = true;
                    addEventListener(window, "mouseover", annotateCode, false);
                    addEventListener(window, "mouseout", annotateCode, false);
                }

                for (var tag in options) {

                    if (Object.hasOwnProperty.call(options, tag)) {

                        if (typeof tag === "string") {

                            if (elements = document.querySelectorAll(tag)) {

                                opts = options[tag];

                                if (opts) {
                                    controls =  opts.controls !== undefined ? opts.controls : false;
                                    syntaxerrors = opts.syntaxerrors !== undefined ? opts.syntaxerrors : true;
                                    annotate =  opts.annotate !== undefined ? opts.annotate : true;
                                    delegate =  opts.delegate !== undefined ? opts.delegate : true;
                                } else {
                                    syntaxerrors = annotate = delegate = true;
                                    controls = false;
                                }

                                for (var a = 0, b = elements.length; a < b; a++) {

                                    if (element = elements[a]) {

                                        name = element.tagName;
                                        att1 = element.getAttribute("data-syntaxjs-highlight");
                                        att2 = element.getAttribute("data-syntaxjs-controls");

                                        hl = true;
                                        if (OffDuties[att1]) hl = false;
                                        else if (Duties[att1]) hl = true;

                                        if (!globalControls) ctrl = false;
                                        else ctrl = true;

                                        if (Duties[att2]) ctrl = true;
                                        else if (OffDuties[att2]) ctrl = false;

                                        rec = createRecord(element, opts);
                                        if (controls && ctrl) createFeaturingElements(rec, options);

                                        if (hl) highlight(null, null, rec);
                                        rec = null;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // live Editor -
            // the first bug i got to was when replacing innerHTML with the highlighted text

            function createFeaturingElements(rec) {
                setTimeout(function () {
                    createWrapper(rec);
                    createNativeEvalButton(rec);
                    createOriginalTextButton(rec);
                    createShowLinesButton(rec);
                    createEditorButton(rec);
                    createWordCountButton(rec);
                    createMinifyingButton(rec);
                    createShowTokensButton(rec);
                    createHighlightButton(rec);
                    createShellButton(rec);
                    createAstButton(rec);
                    createEvaluateButton(rec);
                    createFileInformations(rec);
                    appendButtons(rec);
                });
                return rec;
            }
            
            //
            // CreateWrapper wraps the original pre with some elements,
            // to contain the buttons, console, second view, (maybe tabs soon)  and more
            //

            function createWrapper(rec) {
                var element = rec.element;
                var wrapper = rec.wrapper = document.createElement("div");
                var view = rec.view = document.createElement("div");
                wrapper.className = ClassNames["wrapper"];
                view.className = ClassNames["mainview"];
                if (element) {
                    if (element.parentNode) element.parentNode.replaceChild(wrapper, element);
                    wrapper.appendChild(view);
                    view.appendChild(element);
                }
                return wrapper;
            }

            function createEditorButton(rec) {

                var element = rec.element;
                var wrapper = rec.wrapper;
                var view = rec.view;
                var editor, pre;
                var alledit;
                var timeout;
                var cursor, x, y, rect;
                var sel, newsel;
                var range, newrange;

                function createEditor() {
                    /* Disabled highlighting until i fix the cursor */
                    rec.editor = editor = document.createElement("pre");
                    editor.className = ClassNames["editorview"];
                    editor.contentEditable = "true";
                    editor.innerHTML = rec.highlightedText || rec.input;
                    // editor.innerHTML = highlight(null, null, rec);
                    editor.hidden = false;
                    if (editor.scrollIntoView) editor.scrollIntoView();

                    function update() {
                        var text = "" + (editor.textContent || editor.innerText);
                        var ast;
                        rec.input = text;
                        rec.tokens = tokenize(text);
                        rec.ast = parse(rec.tokens);
                        ast = rec.astText = highlight(JSON.stringify(rec.ast, null, 4));
                        /* editor.innerHTML = highlight(text, null, rec); */
                        element.innerHTML = ast;
                        if (editor.scrollIntoView) editor.scrollIntoView();
                        /*
				newsel  = window.getSelection();
				newrange = newsel.getRangeAt(0);
				newrange.setStart(range.startContainer, range.startOffset);
				newrange.setEnd(range.endContainer, range.endOffset);*/
                        // cursor.moveToPoint(e.pageX, e.pageY);
                    }
                    addEventListener(editor, "keyup", function (e) {
                        if (timeout) {
                            clearTimeout(timeout);
                            timeout = null;
                        }
                        // sel = window.getSelection() || document.selection;
                        // range = sel.getRangeAt(0);
                        // if (e.char == "\t") e.preventDefault();
                        timeout = setTimeout(update, 250);
                    }, false);
                    view.insertBefore(editor, element);
                    element.innerHTML = highlight(JSON.stringify(rec.ast || parse(rec.tokens), null, 4));
                }
                return make_button(rec, "editor", "editor", function (e) {
                    if (!editor) createEditor();
                    else editor.hidden = !editor.hidden;
                });
            }
            // FileInformations are "Filesize: __ bytes, __ LOC, Format: (unimpl.)" on the bottom
            // special: the span with the infos is added to the buttons array which contains all other widgets (buttons)

            function createFileInformations(rec) {
                /* Mache was hover-touch-ables raus, was hochpopt wenn ich beruehre */
                var span = document.createElement("span");
                span.className = ClassNames["info"];
                var html = "Filesize: " + (rec.input || "").length + " bytes, ";
                html += (rec.input || "").split("\n").length + " LOC, ";
                span.innerHTML = html;
                rec.buttons.push(span);
            }
            // This buttons lets you return to the highlighted text

            function createHighlightButton(rec) {
                var element = rec.element;
                return make_button(rec, "highlight", "highlight", function (e) {
                    if (!rec.highlightedText) {
                        rec.highlightedText = highlight(element.textContent);
                    }
                    element.innerHTML = rec.highlightedText;
                    if (element.scrollIntoView) element.scrollIntoView();
                });
            }
            // This button uses the nativejs eval function coz i havent coded a AST.Evaluate() yet.

            function createNativeEvalButton(rec) {
                var element = rec.element;
                return make_button(rec, "eval", "eval", function (e) {
                    var consoleElement = rec.consoleElement;
                    if (!consoleElement) consoleElement = make_console_element(rec);
                    var code = rec.input;
                    var value;
                    try {
                        value = eval(code);
                    } catch (ex) {
                        value = "" + ex.message + "<br>\n" + ("" + ex.stack).split("\n").join("<br>\n");
                    } finally {
                        consoleElement.innerHTML += value += "<br>\n";
                    }
                });
            }
            // Finally i call Evaluate (i am proud not to be as stupid as my CV is)

            function createEvaluateButton(rec) {

                var element = rec.element;
                var consoleElement;
                return make_button(rec, "value", "value", function (e) {
                    consoleElement = rec.consoleElement;
                    if (!consoleElement) {
                        consoleElement = make_console_element(rec);
                    }
                    var code = rec.input;
                    var value;
                    try {
                        value = Evaluate(code);
                    } catch (ex) {
                        value = "" + ex.message + "<br>\n" + ("" + ex.stack).split("\n").join("<br>\n");
                    } finally {
                        consoleElement.innerHTML += value += "<br>\n";
                    }
                });
            }

            //
            // count_word adds 1 to the existing wordcount_obj[word] or creates a new entry [word] set to 1 on the wordcount_obj.
            //

            function count_word(word, wordcount_obj) {
                var n;
                wordcount_obj[word] = typeof (n = wordcount_obj[word]) === "number" ? n + 1 : 1;
            }
            /// Array.prototype.sort(sort_alpha) sortiert Worte.

            function sort_alpha(w1, w2) {
                var i, b1, b2;
                i = -1
                do {
                    i += 1;
                    b1 = w1[i];
                    b2 = w2[i];
                    if (b1 < b2) return false;
                    else if (b1 > b2) return true;
                } while (b1 === b2);
            }
            //
            // The wordcount buttons shows a label with some informations about the tokens (counters)
            // Has to be improved with cooler statistics.
            //

            function total(v) {
                return "<p>Total: <b>" + v + "</b></p>\n";
            }

            function ol() {
                return "<ol class=" + ClassNames["wordcount-list"] + ">";
            }

            function li(s, p) {
                return "<li>" + s + "x " + p + "\n";
            }

            function createWordCountButton(rec) {

                var flag = false;
                var panel = document.createElement("div");
                panel.className = ClassNames["wordcount-panel"];
                var calculated = false;
                var wordcount

                var HighlighterWordCounterLabel = {
                    "LineComment": "//comments",
                    "MultiLineComment": "/*comments*/",
                    "RegularExpressionLiteral": "/regex/",
                    "StringLiteral": "'strings'",
                    "TemplateLiteral": "`templates`"
                };

                function calculate() {

                    wordcount = rec.wordcount = Object.create(null);
                    var tokens = rec.tokens;
                    var token, word, type;
                    for (var i = 0, j = tokens.length; i < j; i++) {
                        word = tokens[i].value;
                        type = tokens[i].type;
                        count_word(HighlighterWordCounterLabel[type] || word, wordcount);
                    }

                    var html = "";
                    // Aufgabe ol(array, verifier): gibt html liste aus
                    var builtinlist = ol();
                    var keywordlist = ol();
                    var operatorlist = ol();
                    var identifierlist = ol();
                    var len = 0,
                        keywordc = 0,
                        operatorc = 0,
                        builtinc = 0,
                        identifierc = 0;
                    Object.keys(wordcount).sort(sort_alpha).forEach(function (p) {
                        // for (p in wordcount) {
                        if (!WhiteSpaces[p]) { // hey, that is a create null so skip : && Object.hasOwnProperty.call(wordcount, p)) {
                            ++len;
                            if (Keywords[p]) {
                                keywordlist += li(wordcount[p], p);
                                ++keywordc;
                            } else if (Punctuators[p]) {
                                ++operatorc;
                                operatorlist += li(wordcount[p], p);
                            } else if (Builtins[p]) {
                                ++builtinc;
                                builtinlist += li(wordcount[p], p);
                            } else {
                                ++identifierc;
                                identifierlist += li(wordcount[p], p);
                            }
                        }
                        // }
                    });
                    // Aufgabe: supplant(template, data) Funktion um das zum Template zu machen
                    builtinlist += "</ol>\n";
                    keywordlist += "</ol>\n";
                    operatorlist += "</ol>\n";
                    identifierlist += "</ol>\n";
                    html = "<table class='" + ClassNames["wordcount-table"] + "'>";
                    html += "<thead><tr><th>builtins<th>keywords<th>operators<th>eigene identifier</tr></thead>";
                    html += "<tbody><tr>";
                    html += "<td>" + builtinlist;
                    html += total(builtinc);
                    html += "<td>" + keywordlist;
                    html += total(keywordc);
                    html += "<td>" + operatorlist;
                    html += total(operatorc);
                    html += "<td>" + identifierlist;
                    html += total(identifierc);
                    html += "</tbody>";
                    html += "</table>";
                    html += panel.innerHTML = html;
                    calculated = true;
                }
                addEventListener(panel, "click", function (e) {
                    flag = false;
                    panel.parentNode.removeChild(panel);
                }, false);
                return make_button(rec, "wordcount", "wordcount", function (e) {
                    e = e || event;
                    var diviation;
                    e.target || (e.target = e.srcElement);
                    if (!flag) {
                        if (!calculated) {
                            calculate();
                        }
                        panel.style.position = "absolute";
                        panel.style.zIndex = "10000";
                        panel.style.top = (e.target.offsetTop - (2 * panel.clientHeight)) + "px";
                        diviation = e.target.offsetLeft + panel.clientWidth - e.target.offsetParent.clientWidth;
                        panel.style.left = (e.target.offsetLeft - (panel.clientWidth / 3) - (diviation > 0 ? diviation : 0)) + "px";
                        e.target.offsetParent.appendChild(panel);
                    } else {
                        e.target.offsetParent.removeChild(panel);
                    }
                    flag = !flag;
                });
            }
            // fillnum(9, 3) returns "009" (fill "9" with 0s to a width of 3)

            function fillnum(n, w) {
                var s = "";
                var l = ("" + n).length;
                for (var i = 0; i < (w - l); i++) {
                    s += " ";
                }
                s += n;
                return s;
            }
            //
            // This adds a line count by splitting the text into lines and adding a span in front of each
            //

            function createShowLinesButton(rec) {

                var element = rec.element;
                var oldtext, newtext, flag = false;
                var i, j;
                return make_button(rec, "linecount", "linecount", function (e) {
                    if (!flag) {
                        oldtext = "" + element.innerHTML;
                        newtext = oldtext.split("\n");
                        for (i = 0, j = newtext.length; i < j; i++) {
                            newtext[i] = "<span class=" + ClassNames["line"] + " data-syntaxjs-line='" + (i + 1) + "'>" + fillnum(i + 1, ("" + j).length) + "</span>" + newtext[i];
                        }
                        newtext = newtext.join("\n");
                        element.innerHTML = newtext;
                    } else {
                        element.innerHTML = oldtext;
                    }
                    flag = !flag;
                    if (element.scrollIntoView) element.scrollIntoView();
                });
            }
            //
            // This is a minifier, which bases on the Tokens-Array
            //

            function minify(text) {
                if (typeof text === "string") {
                    tokens = tokenize(text);
                } else if (Array.isArray(text)) {
                    tokens = text;
                } else throw new Error("Expected text or tokens");
                var el, peek;
                for (var i = 0, j = tokens.length; i < j; i++) {
                    el = tokens[i];
                    if (i < j - 1) peek = tokens[i + 1];
                    else peek = "";
                    if (!(/\s/.test(el.value[0]) || /Comment/.test(el.type))) text += el;
                    if (/Keyword/.test(el.type) && !/Punctuator/.test(peek.type)) text += " ";
                }
                return text;
            }
            //
            // This function minifies the highlighted spans by testing for the classname
            //

            function minifySpans(rec) {

                var tokens = rec.highlightedTokens;
                var text = "";
                var el, peek;
                for (var i = 0, j = tokens.length; i < j; i++) {
                    el = tokens[i];
                    if (i < j - 1) peek = tokens[i + 1];
                    else peek = "";
                    if (!/\s/.test(el.value[0]) && !/Comment/.test(el.type)) text += el.value;
                    if (/Keyword/.test(el.type) && !/Punctuator/.test(peek.type)) text += " ";
                }
                return text;
            }
            //
            // The minifier Button
            //

            function createMinifyingButton(rec) {
                var element = rec.element;
                var oldtext, newtext, flag = false;
                return make_button(rec, "minify", "minify", function (e) {
                    if (!rec.minifiedText) {
                        rec.minifiedText = minifySpans(rec);
                    }
                    element.innerHTML = rec.minifiedText;
                    if (element.scrollIntoView) element.scrollIntoView();
                });
            }
            //
            // Show original content of the Element
            //

            function createOriginalTextButton(rec) {
                var element = rec.element;
                return make_button(rec, "original", "original",
                    function (e) {
                        element.innerHTML = rec.originalText;
                        if (element.scrollIntoView) element.scrollIntoView();
                    });
            }
            // ununused

            function createToSourceButton(rec) {
                var element = rec.element;
                return make_button(rec, "source", "source", function (e) {
                    if (!source) {
                        try {
                            source = JSON.stringify(rec.ast.toSource(), null, 4);
                        } catch (ex) {
                            source = JSON.stringify(ex, null, 4);
                        }
                    }
                    element.innerHTML = source;
                    if (element.scrollIntoView) element.scrollIntoView();
                });
            }
            //
            // Pressing this button displays the AST
            //

            function createAstButton(rec) {
                var ast;
                var element = rec.element;
                var oldtext, newtext, flag = false;
                return make_button(rec, "ast", "ast", function (e) {
                    // if (!rec.astText || rec.editor) {
                    try {
                        rec.ast = parse(rec.tokens || tokenize(rec.input));
                        // rec.ast = parse(rec.input, true);
                    } catch (ex) {
                        rec.ast = ex;
                    }
                    rec.astText = highlight(JSON.stringify(rec.ast, null, 4));
                    //  }

                    element.style.maxHeight = window.height;
                    element.style.overflow = "auto";

                    element.innerHTML = rec.astText;
                    //      element.appendChild(sourceButton);
                    if (element.scrollIntoView) element.scrollIntoView();
                });
            }

            //
            // This Buttons shows the Tokens-Array
            // filterWhiteSpace used before displaying
            //

            function filterWhiteSpace(tokens) {
                return tokens.filter(function (token) {
                    return token.type !== "WhiteSpace";
                });
            }

            function createShowTokensButton(rec) {
                var element = rec.element;
                var newtext;
                return make_button(rec, "token", "token", function (e) {
                    newtext = rec.tokensText = highlight(JSON.stringify(filterWhiteSpace(rec.tokens), null, 4));
                    element.innerHTML = newtext;
                });
            }

            function createBeautyfierButton(rec) {
                var element = rec.element;
                return make_button(rec, "beauty", "beauty", function (e) {
                    element.innerHTML = highlight(beautify(rec.tokens));
                });
            }

            function createShellButton(rec) {
                var element = rec.element;
                var wrapper = rec.wrapper;
                var view = rec.view;
                var input;
                var code;
                var consoleElement;
                var val;

                function enter(e) {
                    if (e.keyCode === 13) {
                        code = input.value;
                        if (code === ".clear") {
                            consoleElement.innerHTML = "-cleared console-<br>\n";
                        } else if (code === ".quit") {
                            consoleElement += "Quitting the Shell...";
                            input.parentNode.removeChild(input);
                            input = null;
                        } else {
                            try {
                                val = syntaxjs.toValue(code, true); // brauche map fuers realm
                            } catch (ex) {
                                val = ex.message + "<br>\n" + ("" + ex.stack).split("\n").join("<br>n");
                            } finally {
                                consoleElement.innerHTML += val + "<br>\n";
                                input.value = "";
                            }
                        }
                    }
                }

                return make_button(rec, "shell", "shell", function (e) {
                    consoleElement = rec.consoleElement;
                    if (!consoleElement) consoleElement = make_console_element(rec);
                    if (!input) {
                        input = document.createElement("input");
                        input.type = "text";
                        input.className = ClassNames["shell-input"];
                        consoleElement.parentNode.insertBefore(input, consoleElement);
                        addEventListener(input, "keyup", enter);
                    }

                    var code = rec.ast || rec.tokens;
                    try {
                        val = syntaxjs.toValue(code, true, true);
                    } catch (ex) {
                        val = ex.message + "<br>\n" + ("" + ex.stack).split("\n").join("<br>n");
                    } finally {
                        consoleElement.innerHTML += "re-initialized code<br><br>\n" + val + "<br>\n";
                        consoleElement.scrollToBottom && consoleElement.scrollToBottom();
                        input.value = "";
                    }

                });
            }

            /* War das 1. Feature */

            var development_version = "<br><sub>ohne Gew&auml;hr</sub>";
            var NoOvers = {};
            NoOvers[ClassNames["info"]] = true;
            var clas = /syntaxjs-/;

            function annotateCode(e) {
                var key, str, html, target, className;
                e = e || window.event; // wack browser programmer i am
                target = e.target || e.srcElement;
                className = target.className;
                if (target.tagName === "SPAN" && clas.test(className) && !NoOvers[className]) {
                    if (e.type === "mouseout" && annotationDiv.parentNode) annotationDiv.parentNode.removeChild(annotationDiv);
                    if (e.type === "mouseover") {
                        key = target.innerText || target.textContent || target.innerHTML;
                        html = "";
                        /*
						var oid;
						if (oid=target.getAttribute("data-syntaxjs-oid")) {
						
						}
						*/
                        /*
						Falls parse tree:
						Was muss ich tun, um zu wissen, dass ich, wenn ich ueber a+b+c und dem
						2. + hover, dass ich in der expression a+b+c bin?
						Wie lege ich den Code Flow aus dem AST ab?
						gebe ast-node eine id?
						speichere alle nodes untereinander by id?
						o(1) zugriff fuer die suche im tree?
						in tokens objekt zu T
						speichere: "node.type"
						sagt mir, gehoere zu "binaryexpression"
						speichere: parentnode ???
					*/
                        // 1. Zeile key ist ein
                        if (str = TypeOfToken[key]) { // mal ausprobieren.
                            html += key + " ist ein " + str + "<br>\n";
                            /* ungeeignet genauer
						if (str = PunctToExprName[key]) {
							html += str + "<br>\n";
						}
						*/
                        }
                        // 2. Zeile annotation
                        if ((str = Annotations[key])) html += str;
                        else {
                            if (str = ClassAnnotations[className]) html += str + "<br>\n";
                            else html += key + " wird demn&auml;chst hier n&auml;her erl&auml;utert.<br>\n";
                        }

                        /*
						var oid;
						if (oid=target.getAttribute("data-syntaxjs-oid")) {
							html += "<br>Newsflash: dieses Token hat eine spezielle Id, die es ermoeglicht in den anderen Syntaxtree zu navigieren.<br>";
						}
						*/

                        annotationDiv.innerHTML = html;
                        annotationDiv.innerHTML += development_version;
                        annotationDiv.style.position = "absolute";
                        annotationDiv.style.top = (target.offsetTop + (4 * target.offsetHeight)) + "px";
                        annotationDiv.style.left = target.offsetLeft + "px";
                        target.offsetParent.appendChild(annotationDiv);
                    }
                }
            }

            annotationDiv = document.createElement("div");
            annotationDiv.className = "syntaxjs-annotation";

            /*
		Startet den Highlighter *****
	*/

            function defaultOptions() {
                    var options = Object.create(null);
                    options["PRE"] = {
                            controls: true,
                            annotate: true,
                            syntaxerrors: true,
                            delegate: true // das war die worker option
                    };
                    options["CODE"] = {
                            syntaxerrors: false,
                            controls: false,
                            annotate: true,
                            delegate: true // das war die worker option
                    };
                    return options;
            }

            function startHighlighterOnLoad() {
                var script = document.querySelector("script[data-syntaxjs-config]");
                var config;
                if (script) config = script.getAttribute("data-syntaxjs-config");

                if (config) config = JSON.parse(config);
                else config = defaultOptions();        
                var onload = function (e) {
                    setTimeout(highlightElements.bind(syntaxjs, config));
                };
                addEventListener(window, "DOMContentLoaded", onload, false);
            }

            /* -------------------------------- */            
            
            GUI.startHighlighterOnLoad = startHighlighterOnLoad;
            GUI.highlightElements = highlightElements;
            return GUI;
        });

// *******************************************************************************************************************************
// file imports
// *******************************************************************************************************************************

define("lib/syntaxerror-file", function (require, exports, module) {

    function readFile(name, callback, errback) {
        if (syntaxjs.system == "node") {
            var fs = require._nativeRequire("fs");
            return fs.readFile(name, function (err, data) {
                if (err) errback(err);
                callback(data);
            }, "utf8");
            return true;
        } else if (syntaxjs.system == "browser") {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", name, false);
            xhr.onload = function (e) {
                callback(xhr.responseText);
            };
            xhr.onerror = function (e) {
                errback(xhr.responseText);
            };
            xhr.send(null);
            // missing promise
            return true;
        } else if (syntaxjs.system == "worker") {
            importScripts(name);
        }
    }

    function readFileSync(name) {
        if (syntaxjs.system == "node") {
            var fs = require._nativeRequire("fs");
            return fs.readFileSync(name, "utf8");
        } else if (syntaxjs.system == "browser") {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", name, true);
            xhr.send(null);
            return xhr.responseText;
        } else if (syntaxjs.system == "worker") {
            importScripts(name);
        }
    }
    exports.readFile = readFile;
    exports.readFileSync = readFileSync;
});

// *******************************************************************************************************************************
// tester (note)
// *******************************************************************************************************************************

define("lib/syntaxjs-tester", function (require, exports, module) {

    var evaluate = require("lib/runtime");

    function testCode(result, code) {
        //console.log("bool testCode(result, code):");
        //console.log(code);

        var myresult = evaluate(code);

        if (result === myresult) {
            console.log("PASSED");
        } else {
            console.err("FAILED");
        }
    }

    function testCodeThrows(code) {
        var threw, myEx;
        console.log("bool testCodeThrows(code):");
        console.log(code);
        try {
            var myresult = evaluate(code);
        } catch (ex) {
            threw = true;
            myEx = ex;
        }
        if (!threw) {
            console.err("FAILED");
            return false;
        }
        console.log("PASSED");
        return true;
    }

    exports.testCode = testCode;
    exports.testCodeThrows = testCodeThrows;

});

// *******************************************************************************************************************************
// SHELL is the ultimate node module
// *******************************************************************************************************************************

define("lib/syntaxjs-shell", function (require, exports) {
    

    var fs, readline, rl, prefix, evaluate, startup, evaluateFile, prompt, haveClosedAllParens, shell;
    
    var defaultPrefix = "es6> ";
    var multilinePrefix = "...> ";
    var inputBuffer = "";

    if (typeof process !== "undefined" && typeof module !== "undefined") {

        prefix = defaultPrefix;

        startup = function startup() {
            console.time("Uptime");
            fs = module.require("fs");
            readline = module.require("readline");
            rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
        };

        evaluate = function evaluate(code, continuation) {
                var val;
                try {
                    val = syntaxjs.toValue(code, true);
                } catch (ex) {
                    val = ex.message + "\n" + ("" + ex.stack).split("\n").join("\n");
                } finally {
                    console.log(val);
                    if (continuation) setTimeout(continuation, 0);
                }
        };

        evaluateFile = function evaluateFile(file, continuation) {
            var code;
            console.log("-evaluating " + file + "-");
            try {
                code = fs.readFileSync(file, "utf8");
            } catch (err) {
                code = undefined;
                console.log(file + " not readable!");
                console.dir(err);
            }
            if (code) evaluate(code, continuation);
        };

        //
        // this is some additional hack to emulate multiline input
        //
 
        var savedInput ="";
        var isOpenParen = {
            __proto__:null,
            "(":true,
            "{":true,
            "[":true
        };
        var isCloseParen = {
            __proto__:null,
            ")": true,
            "}": true,
            "]": true
        };
        var isRightParen = {
            __proto__: null,
            "(":")",
            "[":"]",
            "{":"}"
        };
        
        haveClosedAllParens = function (code) {
            var parens = [];
            for (var i = 0, j = code.length; i < j; i++) {
                var ch = code[i];
                if (isOpenParen[ch]) {
                    parens.push(ch);
                } else if (isCloseParen[ch]) {
                    if (!parens.length) throw new SyntaxError("syntaxjshell: preflight: nesting error. stack is empty but you closed some paren.");
                    var p = parens.pop();
                    if (!(isRightParen[p] === ch)) {
                        throw new SyntaxError("syntaxjshell: preflight: nesting error. closing paren does not match stack.");
                    }
                }
            }
            return parens.length === 0;
        }
        
        //
        // prompt is now called again, and the inputBuffer is prepending the new inputted code.
        //

        prompt = function prompt() {
            
            rl.question(prefix, function (code) {

                if (code === ".break") {
                    inputBuffer = "";
                    prefix = defaultPrefix;
                    setTimeout(prompt);
                    return;
                }

                if (savedInput === "" && code[0] === ".") {

                    if (/^(\.print)/.test(code)) {
                        code = code.substr(7);
                        console.log(JSON.stringify(syntaxjs.createAst(code), null, 4));
                        setTimeout(prompt);
                        return;
                    } else if (/^(\.tokenize)/.test(code)) {
                        code = code.substr(8);
                        console.log(JSON.stringify(syntaxjs.tokenize(code), null, 4));
                        setTimeout(prompt);
                        return;
                    } else if (code === ".quit") {
                        console.log("Quitting the shell");
                        process.exit();
                        return;
                    } else if (/^(\.load\s)/.test(code)) {
                        file = code.substr(6);
                        evaluateFile(file, prompt);
                        return;
                    } else if (/.help/.test(code)) {
                        console.log("shell.js> available commands:");
                        console.log(".print <expression> (print the abstract syntax tree of expression)");
                        console.log(".tokens <expression> (print the result of the standalone tokenizer)");
                        console.log(".load <file> (load and evaluate a .js file)");
                        console.log(".quit (quit the shell with process.exit instead of ctrl-c)");
                        setTimeout(prompt);
                        return;
                    } 

                } 

                if (savedInput) code = savedInput + code;
            
                if (haveClosedAllParens(code)) {        
                    prefix = defaultPrefix;
                    savedInput = "";
                    evaluate(code, prompt);
                    return;
                } else {
                    prefix = multilinePrefix;
                    savedInput = code;  
                    setTimeout(prompt);
                    return;
                }
                    
                
            });
        };

        shell = function main() {
            var file;
            startup();
            if (process.argv[2]) file = process.argv[2];
            if (!file) setTimeout(prompt);
            else evaluateFile(file, prompt);
            process.on("exit", function () {
                console.log("\nHave a nice day.");
                console.timeEnd("Uptime");
            });
        };

    } else shell = function () {}
    return shell;
});

define("lib/syntaxjs-worker", function (require, exports, module) {
    "use strict";
    if (typeof importScripts === "function") {
        var highlight = require("lib/syntaxerror-highlight");
        var interprete = require("lib/runtime");
        var messageHandler = function message_handler(e) {
            var html;
            var text = e.data.text;
            switch (e.data.f) {
            case "highlight":
                if (Array.isArray(text)) {
                    html = [];
                    for (var i = 0, j = text.length; i < j; i++) {
                        html.push(highlight(text[i]));
                    }
                } else {
                    html = highlight(text);
                }
                self.postMessage(html);
                break;
            case "value":
                var result = interprete(text);
                self.postMessage(result);
                break;
            default:
                break;
            }
        };
        var subscribeWorker = function subscribeWorker() {
            var message_handler = exports.messageHandler;
            self.addEventListener("message", messageHandler, false);
        };
        exports.messageHandler = messageHandler;
        exports.start = subscribeWorker;
    }
    return exports;
});

// #######################################################################################################################
//	Exporting the Syntax Object after Importing and Assembling the Components
// #######################################################################################################################

// This is the App ?




define("lib/syntaxjs", function () {
    "use strict";
    
    var VERSION = "0.0.1";

    function pdmacro(v) {
        return {
            configurable: false,
            enumerable: true,
            value: v,
            writable: false
        };
    }

    var nativeGlobal = typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof importScripts === "function" ? self : {};
    
    var syntaxerror = Object.create(null);
    var syntaxerror_public_api_readonly = {
	    version: pdmacro(VERSION),
        tokenize: pdmacro(require("lib/tokenizer")),
        createAst: pdmacro(require("lib/parser")),
        toValue: pdmacro(require("lib/runtime")),
        createRealm: pdmacro(require("lib/api").createRealm),
        toJsLang: pdmacro(require("lib/js-codegen")),
        readFile: pdmacro(require("lib/syntaxerror-file").readFile),
        readFileSync: pdmacro(require("lib/syntaxerror-file").readFileSync),
        nodeShell: pdmacro(require("lib/syntaxjs-shell")),
        subscribeWorker: pdmacro(require("lib/syntaxjs-worker").subscribeWorker)
        //    toLLVM: pdmacro(require("lib/llvm-codegen"))
    };
    var syntaxerror_highlighter_api = {
        highlight: pdmacro(require("lib/syntaxerror-highlight"))
    };
    if (typeof window == "undefined" && typeof self !== "undefined" && typeof importScripts !== "undefined") {
        syntaxerror.system = "worker";
    } else if (typeof window !== "undefined") {
        syntaxerror.system = "browser";
        syntaxerror_highlighter_api.highlightElements = pdmacro(require("lib/syntaxerror-highlight-gui").highlightElements),
        syntaxerror_highlighter_api.startHighlighterOnLoad = pdmacro(require("lib/syntaxerror-highlight-gui").startHighlighterOnLoad)
    } else if (typeof process !== "undefined") {    
        if (typeof exports !== "undefined") exports.syntaxjs = syntaxerror;
        syntaxerror.system = "node";
        // temporarily left. could move to closure, could call a call to save
        // but will hide away them from the main object, left over from hacking.
        require._nativeRequire = nativeGlobal.require;
        require._nativeModule =  module;
        Object.defineProperties(exports, syntaxerror_public_api_readonly);
        Object.defineProperties(exports, syntaxerror_highlighter_api)
    }

    // ASSIGN properties to a SYNTAXJS object
    Object.defineProperties(syntaxerror, syntaxerror_public_api_readonly);
    Object.defineProperties(syntaxerror, syntaxerror_highlighter_api);
    
    return syntaxerror;
});


// No, This is the App.

var syntaxjs = require("lib/syntaxjs");
if (syntaxjs.system === "node") {
    if (!module.parent) syntaxjs.nodeShell();
} else if (syntaxjs.system === "browser") {
    syntaxjs.startHighlighterOnLoad();
} else if (syntaxjs.system === "worker") {
    syntaxjs.subscribeWorker();
}
