// #######################################################################################################################
//  Exporting the Syntax Object after Importing and Assembling the Components
// #######################################################################################################################

define("syntaxjs", function () {
    "use strict";
    
    function pdmacro(v) {
        return {
            configurable: false,
            enumerable: true,
            value: v,
            writable: false
        };
    }
    
    var syntaxjs = Object.create(null);
    var VERSION = "0.0.1";
    

				    
    var syntaxjs_public_api_readonly = {
    
    // essential functions
        version: pdmacro(VERSION),			
        tokenize: pdmacro(require("tokenizer")),				// <-- needs exports fixed
	    //@Deprecated
            createAst: pdmacro(require("parser")),					// <-- needs exports fixed
        parse: pdmacro(require("parser")),
            //@Deprecated
    	    toValue: pdmacro(require("runtime")),					// <-- needs exports fixed
        eval: pdmacro(require("runtime")),
        createRealm: pdmacro(require("api").createPublicCodeRealm),
        toJsLang: pdmacro(require("js-codegen")),				// <-- needs exports fixed

        makeAdapter: pdmacro(require("filesystem").makeAdapter),

    // experimental functions

        readFile: pdmacro(require("filesystem").readFile),	
        readFileSync: pdmacro(require("filesystem").readFileSync),


  // put into filesystem.js please
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


        evalStaticXform: pdmacro(require("runtime").ExecuteAsyncStaticXform),
        evalAsync: pdmacro(require("runtime").ExecuteAsync),
        evalAsyncXform: pdmacro(require("runtime").ExecuteAsyncTransform),
        // arraycompile: pdmacro(require("arraycompiler").compile)
    };
    
    var syntaxjs_highlighter_api = {
        highlight: pdmacro(require("highlight"))
    };
    
    // 1. The following block sets a property on syntaxjs
    // telling, which "system" has been detected (currently, only poorly "browser, node, worker" are supported, doesn´t work in spidermonkey or nashorn)
    // 2. the public properties are defined with defineProperties.
    // in the browser block the highlighter app is added 
    
    if (typeof window == "undefined" && typeof self !== "undefined" && typeof importScripts !== "undefined") {
    // worker export
        syntaxjs.system = "worker";
        syntaxjs_public_api_readonly.subscribeWorker = pdmacro(require("syntaxjs-worker").subscribeWorker);

    } else if (typeof window !== "undefined") {
    // browser export
        syntaxjs.system = "browser";

        syntaxjs_public_api_readonly.subscribeWorker = pdmacro(require("syntaxjs-worker").subscribeWorker);
        syntaxjs_highlighter_api.highlightElements = pdmacro(require("highlight-gui").highlightElements);
        syntaxjs_highlighter_api.startHighlighterOnLoad = pdmacro(require("highlight-gui").startHighlighterOnLoad);

    } else if (typeof process !== "undefined") {
    // node js export

        if (typeof exports !== "undefined") exports.syntaxjs = syntaxjs;
        syntaxjs.system = "node";
        syntaxjs._require = module.require;
        syntaxjs._module = module;

        syntaxjs_public_api_readonly.nodeShell = pdmacro(require("syntaxjs-shell"));// <-- needs exports fixed

        Object.defineProperties(exports, syntaxjs_public_api_readonly);
        Object.defineProperties(exports, syntaxjs_highlighter_api);
    } else if (typeof load == "function" && typeof print == "function") {
        if (typeof version === "function") syntaxjs.system = "spidermonkey";
        if (typeof Java === "object") syntaxjs.system = "nashorn";
        if (typeof exports !== "undefined") exports.syntaxjs = syntaxjs;
    }
    // ASSIGN properties to a SYNTAXJS object (all platforms)
    Object.defineProperties(syntaxjs, syntaxjs_public_api_readonly);
    Object.defineProperties(syntaxjs, syntaxjs_highlighter_api);
    return syntaxjs;
});
