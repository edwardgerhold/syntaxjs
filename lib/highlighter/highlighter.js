// *******************************************************************************************************************************
// Highlight (UI Independent Function translating JS into a string of spans)
// *******************************************************************************************************************************

define("highlight", function (require, exports) {

    "use strict";

    // export into tokenizer or parser
    function RegExpToString(word) {
        return ("/" + word[0] + "/" + word[1]);
    }

    function TemplateToString(word) {
        var val = word;
        var val2;
        word = "`";
        word += val[0];
        if (val.length > 1) {
            for (var k = 1, l = val.length; k < l; k += 2) {
                word += "${" + val[k] + "}";
                val2 = val[k + 1];
                if (val2 != undefined) word += val2;
            }
        }
        word += "`";
        return word;
    }

    var tables = require("tables");
    var tokenize = require("tokenizer").tokenizeIntoArrayWithWhiteSpaces;


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
    var HighlighterClassNamesByValue = {
        "undefined": "syntaxjs-undefined"
    };

    highlight.HighlighterClassNames = HighlighterClassNames;
    highlight.HighlighterClassNamesByValue = HighlighterClassNamesByValue;

    function stringifyTokens(array) {
        var string = "";
        for (var i = 0, j = array.length; i < j; i++) {
            string += array[i].value;
        }
        return string;
    }

    /*
     switch(type) {
     case "RegularExpressionLiteral":
     word = RegExpToString(word);
     break;
     case "TemplateLiteral":
     word = TemplateToString(word);
     break;
     }
     */
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

        var val, val2;
        for (m = 0, n = tokens.length; m < n; m++) {

            type = tokens[m].type;
            word = tokens[m].value;

            switch (type) {
                case "RegularExpressionLiteral":
                    word = RegExpToString(word);
                    break;
                case "TemplateLiteral":
                    word = TemplateToString(word);
                    break;
            }

            if ((cln = HighlighterClassNamesByValue[word]) || (cln = HighlighterClassNames[type])) {
                word = "<span class='" + cln + "'" + ">" + word + "</span>";
            }

            highlighted.push({
                type: type,
                value: word
            });
        }

        text = stringifyTokens(highlighted);    // "works" with template and value arrays, because it´s already concatted and highlighter,
        // and there are no arrays, that´s why it works

        if (rec) {
            rec.highlightedTokens = highlighted;
            rec.highlightedText = text;
        }

        if (el) el.innerHTML = text;
        return text;
    }

    exports.highlight = highlight;
    return exports;

});
