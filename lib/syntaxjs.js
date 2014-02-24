
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
    
    var syntaxerror = Object.create(null);
    var syntaxerror_public_api_readonly = {
        version: pdmacro(VERSION),
        tokenize: pdmacro(require("tokenizer")),
        createAst: pdmacro(require("parser")),
        toValue: pdmacro(require("runtime")),
        createRealm: pdmacro(require("api").CreateRealm),
        toJsLang: pdmacro(require("js-codegen")),
        readFile: pdmacro(require("file").readFile),
        readFileSync: pdmacro(require("file").readFileSync),
        nodeShell: pdmacro(require("syntaxjs-shell")),
        subscribeWorker: pdmacro(require("syntaxjs-worker").subscribeWorker),
        evalAsync: pdmacro(require("runtime").ExecuteAsync),
        evalAsyncXfrm: pdmacro(require("runtime").ExecuteAsyncTransform),
        //    toLLVM: pdmacro(require("llvm-codegen"))
    };
    var syntaxerror_highlighter_api = {
        highlight: pdmacro(require("highlight"))
    };
    
    if (typeof window == "undefined" && typeof self !== "undefined" && typeof importScripts !== "undefined") {
        syntaxerror.system = "worker";
 
    } else if (typeof window !== "undefined") {
        syntaxerror.system = "browser";
        syntaxerror_highlighter_api.highlightElements = pdmacro(require("highlight-gui").highlightElements),
        syntaxerror_highlighter_api.startHighlighterOnLoad = pdmacro(require("highlight-gui").startHighlighterOnLoad)
 
    } else if (typeof process !== "undefined") {    
        
        if (typeof exports !== "undefined") exports.syntaxjs = syntaxerror;       
        syntaxerror.system = "node";
        syntaxerror._nativeRequire = nativeGlobal.require;
        syntaxerror._nativeModule = module;
        
        Object.defineProperties(exports, syntaxerror_public_api_readonly);
        Object.defineProperties(exports, syntaxerror_highlighter_api)
    }

    // ASSIGN properties to a SYNTAXJS object
    Object.defineProperties(syntaxerror, syntaxerror_public_api_readonly);
    Object.defineProperties(syntaxerror, syntaxerror_highlighter_api);
    
    return syntaxerror;
});

var syntaxjs = require("syntaxjs");
if (syntaxjs.system === "node") {
    if (!module.parent) syntaxjs.nodeShell();
} else if (syntaxjs.system === "browser") {
    syntaxjs.startHighlighterOnLoad();
} else if (syntaxjs.system === "worker") {
    syntaxjs.subscribeWorker();
}