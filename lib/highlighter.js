
// *******************************************************************************************************************************
// Highlight (UI Independent Function translating JS into a string of spans)
// *******************************************************************************************************************************

define("highlight", ["tables", "tokenizer"], function (tables, tokenize) {

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
            if (!parse) parse = require("parser");
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
