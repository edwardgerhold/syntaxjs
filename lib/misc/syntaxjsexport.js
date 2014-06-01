// #######################################################################################################################
// the closure around this is new in main.js, the main template
// #######################################################################################################################

// define("syntaxjs", function () {

    function pdmacro(v) {
        return {
            configurable: false,
            enumerable: true,
            value: v,
            writable: false
        };
    }

    var VERSION = "0.0.1";
    var syntaxjs_public_api_readonly = {
	    note: pdmacro("s.createRealm() returns a realm object with a .eval function."),
        version: pdmacro(VERSION),
        define: pdmacro(define),
        require: pdmacro(require),
        Promise: pdmacro(makePromise),
        tokenize: pdmacro(require("tokenizer")),// <-- needs exports fixed
        tokenizeIntoArrayWithWhiteSpaces: pdmacro(require("tokenizer").tokenizeIntoArrayWithWhiteSpaces),
        tokenizeIntoArray: pdmacro(require("tokenizer").tokenizeIntoArray),
        parse: pdmacro(require("parser")),// <-- needs exports fixed
        parseGoal: pdmacro(require("parser").parseGoal),
        createRealm: pdmacro(require("ast-api").createPublicCodeRealm),
        toJsLang: pdmacro(require("js-codegen")),// <-- needs exports fixed
        eval: pdmacro(require("runtime")),// <-- needs exports fixed
        readFile: pdmacro(require("filesystem").readFile),
        readFileSync: pdmacro(require("filesystem").readFileSync),
        evalFile: pdmacro(function (name, callback, errback) {
            var syntaxjs = this;
            return this.readFile(name, function (code) {
                return callback(syntaxjs.eval(code));
            }, function (err) {
                return errback(err);
            });
        }),
        evalFileSync: pdmacro(function (name) {
            return this.eval(this.readFileSync(name));
        }),
        evalAsync: pdmacro(require("runtime").ExecuteAsync),
    };
    
    var syntaxjs_highlighter_api = {
        highlight: pdmacro(require("highlight"))
    };
    
    if (typeof window == "undefined" && typeof self !== "undefined" && typeof importScripts !== "undefined") {
        syntaxjs.system = "worker";
        syntaxjs_public_api_readonly.registerWorker = pdmacro(require("syntaxjs-worker").registerWorker);
    } else if (typeof window !== "undefined") {
        syntaxjs.system = "browser";
        syntaxjs_public_api_readonly.registerWorker = pdmacro(require("syntaxjs-worker").registerWorker);
        syntaxjs_highlighter_api.highlightElements = pdmacro(require("highlight-gui").highlightElements);
        syntaxjs_highlighter_api.startHighlighterOnLoad = pdmacro(require("highlight-gui").startHighlighterOnLoad);
    } else if (typeof process !== "undefined") {
        if (typeof exports !== "undefined") exports.syntaxjs = syntaxjs;
        syntaxjs.system = "node";
        syntaxjs_public_api_readonly.nodeShell = pdmacro(require("syntaxjs-shell"));// <-- needs exports fixed
        Object.defineProperties(exports, syntaxjs_public_api_readonly);
        Object.defineProperties(exports, syntaxjs_highlighter_api);

    } else if (typeof load == "function" && typeof print == "function") {
        if (typeof version === "function")  syntaxjs.system = "spidermonkey";
        if (typeof Java === "object")       syntaxjs.system = "nashorn";
        if (typeof exports !== "undefined") exports.syntaxjs = syntaxjs;
    }

    Object.defineProperties(syntaxjs, syntaxjs_public_api_readonly);
    Object.defineProperties(syntaxjs, syntaxjs_highlighter_api);

    var i18n = require("i18n");
    i18n.addLang("de_DE");// requires("languages.de_DE") and add exports to require("i18n").languages["de_DE"];
    i18n.addLang("en_US");// requires("languages.en_US") and add exports to require("i18n").languages["en_US"];
    i18n.setLang("en_US");// sets i18n.languages.lang to i18n.languages.en_US; (lang is the default key)

// });