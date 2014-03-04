"use strict"

Error.stackTraceLimit = 100;

function makePromise (resolver) {

    "use strict";
    var state = "pending";
    var value;
    var reason;
    var handlers = [];
    var promise;

    function isPromise (o) {
        return o && typeof o === "object" && (typeof o.then === "function");
    }

    function isFunction (o) {
        return typeof o === "function";
    }

    function makeFn(type, set, data) {
        return function __resolve__() {
            
            var newValue, newReason;
            var deferred = set.deferred;
            var callback = set.onFulfilled;
            var errback = set.onRejected;
            try {
                if (isPromise(data)) {
                    data
                    .then(callback, errback)
                    .then(deferred.resolve, deferred.reject);
                } else if (type === "resolve") {
                    if (isFunction(callback)) newValue = callback(data);
                    deferred.resolve(newValue);
                } else if (type === "reject") {
                    if (isFunction(errback)) errback(data);
                    deferred.reject(data);
                }
            } catch (ex) {
                if (isFunction(errback)) errback(ex);
                deferred.reject(ex);
            }
        };
    }

    function resolve (_value_) {
        if (state !== "pending") return;
        state = "resolved";
        value = _value_;
        for (var i = 0, j = handlers.length; i < j; i++) {
            setTimeout(makeFn("resolve", handlers[i], value), 0);
        }
    }

    function reject (_reason_) {
        if (state !== "pending") return;
        state = "rejected";
        reason = _reason_;
        for (var i = 0, j = handlers.length; i < j; i++) {
            setTimeout(makeFn("reject", handlers[i], reason), 0);
        }
    }

    function then (onFulfilled, onRejected) {

            if (isPromise(onFulfilled)) {
                return onFulfilled.then(resolve, reject);
            } 

            var deferred = makePromise();
            var set = {
                    onFulfilled: onFulfilled,
                    onRejected: onRejected,
                    deferred: deferred
            };
            
            if (state === "resolved") {
                setTimeout(function () {
                    try {
                        if (isFunction(onFulfilled)) deferred.resolve(onFulfilled(value));
                        else deferred.resolve(value);
                    } catch (ex) {
                        deferred.reject(ex);
                    }
                }, 0);
            } else if (state == "rejected") {
                setTimeout(function () {
                    if (isFunction(onRejected)) onRejected(reason);
                    deferred.reject(reason);
                }, 0);
            } else if (state === "pending") {
                handlers.push(set);
            }
            return deferred.promise;
    }
    
    if (resolver !== undefined) {

        if (isFunction(resolver)) {
            // scheduled async "promise = makePromise(function (res, rej) {});""
            setTimeout(function () { resolver(resolve, reject); }, 0);
        } else if (isPromise(resolver)) {
            // makePromise(promise) returnt ein neues Promise, 
            try {
                return resolver.then(resolve, reject);
                //return makePromise(function (resolve, reject) { _then(resolve, reject); });
            } catch (ex) {
                return makePromise(function (resolve, reject) { reject(ex) });
            }
        } 
    } 
    
    promise = Object.freeze({
        then: then,
        get value () { return value; },
        get reason () { return reason; },
        get state () { return state; },
        get isPromise () { return true; },
        constructor: makePromise
    });

    // makePromise(function (resolve, reject)) returnt das promise und hat die function async scheduled.
    if (isFunction(resolver)) return promise;
    
    // makePromise() mit no args returnt das deferred object 
    var deferred = Object.freeze({
        promise: promise,
        resolve: resolve,
        reject: reject
    });
    return deferred;
}


if (typeof exports !== "undefined") {
    exports.makePromise = makePromise;
    // promises-aplus-tests-adapter
    exports.deferred = makePromise;
    exports.resolve = function (value) { return makePromise(function (resolve) { resolve(value); }); };
    exports.reject = function (reason) { return makePromise(function (resolve, reject) { reject(reason); }); };
}


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

