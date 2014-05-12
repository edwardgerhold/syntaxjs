/**
 * Created by root on 12.05.14.
 */
define("detector", function () {
    var hasConsole = typeof console == "object" && console && typeof console.log === "function";
    var hasPrint = typeof print === "function";
    var isWindow = typeof window === "object";
    var isJava = typeof Java !== "undefined";
    var isWorker = typeof importScripts === "function" && typeof window === "undefined";
    var isNode = typeof process !== "undefined" && typeof global !== "undefined";
    var isBrowser = isWindow && !isWorker && !isNode && !isJava;
    return {
        hasConsole: hasConsole,
        hasPrint: hasPrint,
        isJava: isJava,
        isNode:   isNode,
        isWorker: isWorker,
        isWindow: isWindow,
        isBrowser: isBrowser
    };
});