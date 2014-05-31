/**
 * I have repeating ducktype tests for system facilities in the code
 * To DRY it, i added "detector". It does something like tools like Modrnizr do.
 * It tests and saves boolean results.
 */
define("detector", function () {


    var hasConsole = typeof console == "object" && console && typeof console.log === "function";
    var hasPrint = typeof print === "function";
    var isWindow = typeof window === "object";
    var isJava = typeof Java !== "undefined";
    var isWorker = typeof importScripts === "function" && typeof window === "undefined";
    var isNode = typeof process !== "undefined" && typeof global !== "undefined";
    var isBrowser = isWindow && !isWorker && !isNode && !isJava;
    var hasWeakMap = typeof WeakMap === "function";
    var hasProxy = typeof Proxy === "function";
    var hasXHR = typeof XMLHttpRequest === "function";


    /*

        move makeAdapter from "filesystem" here to
        and better: merge these nothing-saying modules
        you always forget to remove the fifth-class code.

     */

    function makeAdapter(methods) {
        if (arguments.length == 0 || typeof methods !== "object" || methods === null) {
            throw new TypeError("makeAdapter(methods) expects { test: {}, work: {} } where work[ĸ]() will be called iff test[k]() succeeds. Both need to be functions. Optional is a methods.default function if no test succeeds.");
        }
        var keys = Object.keys(methods.test);
        return function adapterFunction () {
            for (var i = 0, j = keys.length; i < j; i++) {
                var k = keys[i];
                var test = methods.test[k];
                if ((typeof test == "function" && test()) || test === true) {
                    var work = methods.work[k];
                    if (typeof work != "function") {
                        throw new TypeError("adapter: adaptee.work['"+k+"'] is not a function");
                    }
                    return work.apply(this, arguments);
                }
            }
            if (typeof methods["default"] == "function") return methods["default"].apply(this, arguments);
        };
    }




    return {
        makeAdapter: makeAdapter,

        hasConsole: hasConsole,
        hasPrint: hasPrint,

        isJava:    isJava,
        isNode:    isNode,
        isWorker:  isWorker,
        isWindow:  isWindow,
        isBrowser: isBrowser,

        hasWeakMap: hasWeakMap,
        hasProxy: hasProxy,
        hasXHR: hasXHR
    };
});