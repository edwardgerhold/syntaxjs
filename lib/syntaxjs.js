
// #######################################################################################################################
//  Exporting the Syntax Object after Importing and Assembling the Components
// #######################################################################################################################

define("syntaxjs", function () {
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
    
    var syntaxjs = Object.create(null);
    var syntaxjs_public_api_readonly = {
        version: pdmacro(VERSION),
        tokenize: pdmacro(require("tokenizer")),
        createAst: pdmacro(require("parser")),
        toValue: pdmacro(require("runtime")),
        createRealm: pdmacro(require("api").CreateRealm),
        toJsLang: pdmacro(require("js-codegen")),
        readFile: pdmacro(require("fswraps").readFile),
        readFileSync: pdmacro(require("fswraps").readFileSync),
        nodeShell: pdmacro(require("syntaxjs-shell")),
        subscribeWorker: pdmacro(require("syntaxjs-worker").subscribeWorker),
        evalAsync: pdmacro(require("runtime").ExecuteAsync),
        evalAsyncXfrm: pdmacro(require("runtime").ExecuteAsyncTransform)
        //    toLLVM: pdmacro(require("llvm-codegen"))
        ,
        arraycompile: pdmacro(require("arraycompiler").compile)
    };
    var syntaxjs_highlighter_api = {
        highlight: pdmacro(require("highlight"))
    };
    
    if (typeof window == "undefined" && typeof self !== "undefined" && typeof importScripts !== "undefined") {
        syntaxjs.system = "worker";
 
    } else if (typeof window !== "undefined") {
        syntaxjs.system = "browser";
        syntaxjs_highlighter_api.highlightElements = pdmacro(require("highlight-gui").highlightElements),
        syntaxjs_highlighter_api.startHighlighterOnLoad = pdmacro(require("highlight-gui").startHighlighterOnLoad)
 
    } else if (typeof process !== "undefined") {    
        
        if (typeof exports !== "undefined") exports.syntaxjs = syntaxjs;       
        syntaxjs.system = "node";
        syntaxjs._nativeRequire = nativeGlobal.require;
        syntaxjs._nativeModule = module;
        
        Object.defineProperties(exports, syntaxjs_public_api_readonly);
        Object.defineProperties(exports, syntaxjs_highlighter_api)
    }

    // ASSIGN properties to a SYNTAXJS object
    Object.defineProperties(syntaxjs, syntaxjs_public_api_readonly);
    Object.defineProperties(syntaxjs, syntaxjs_highlighter_api);
    
    return syntaxjs;
});
