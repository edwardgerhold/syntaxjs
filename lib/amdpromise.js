    /**
     * a poorly failing A+ or better A- Promise which fails in 1/3 of the tests.
     * The exports have the test adapter forgotten to be removed you can test it.
     * While writing this, i have tested it and see the issue at the throw err handler
     * a console.log(err) prints the error, but a throw err is caught away. Hmm. Should
     * compare what´s really going on some day. And maybe rename makePromise to Promise.
     *
     * var realm = syntaxjs.createRealm();
     * realm.evalAsync("let x = 10; x;").then(function (value) { console.log(v); return v; }, function (err) { throw err; });
     * // now let´s invoke the exception handler by repeating it, let x is already declared will be asyntax error
     * realm.evalAsync("let x = 10; x;").then(function (value) { console.log(v); return v; }, function (err) { console.log(err); });
     * // console.log(err) prints the syntax error
     * 
     * @param resolver
     * @returns {*}
     */
    function makePromise(resolver) {

        "use strict";
        var state = "pending";
        var value;

        var reason;
        var handlers = [];
        var promise;

        function isPromise(o) {
            return o && typeof o === "object" && (typeof o.then === "function");
        }

        function isFunction(o) {
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
                        try {
                            if (isFunction(errback)) errback(data);
                            deferred.reject(data);
                        } catch(ex) {
                            deferred.reject(ex);
                        }
                    }
                } catch (ex) {
                    try {
                        if (isFunction(errback)) errback(ex);
                        deferred.reject(ex);
                    } catch (ex) {
                        deferred.reject(ex);
                    }
                }
            };
        }

        function resolve(_value_) {
            if (state !== "pending") return;
            state = "resolved";
            value = _value_;
            for (var i = 0, j = handlers.length; i < j; i++) {
                setTimeout(makeFn("resolve", handlers[i], value), 0);
            }
        }

        function reject(_reason_) {
            if (state !== "pending") return;
            state = "rejected";
            reason = _reason_;
            for (var i = 0, j = handlers.length; i < j; i++) {
                setTimeout(makeFn("reject", handlers[i], reason), 0);
            }
        }

        function then(onFulfilled, onRejected) {

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
                setTimeout(function () {
                    resolver(resolve, reject);
                }, 0);
            } else if (isPromise(resolver)) {
                // makePromise(promise) returnt ein neues Promise,
                try {
                    return resolver.then(resolve, reject);
                    //return makePromise(function (resolve, reject) { _then(resolve, reject); });
                } catch (ex) {
                    return makePromise(function (resolve, reject) {
                        reject(ex)
                    });
                }
            }
        }

        promise = Object.freeze({
            then: then,
            get value() {
                return value;
            },
            get reason() {
                return reason;
            },
            get state() {
                return state;
            },
            get isPromise() {
                return true;
            },
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
    /**
     * What´s the aplus test adapter doing here?
     * This is a joke or? Good that it´s not happening in production.
     * Anyways, so the world can see, it fails 1/3 (i guess in error handling)
     */

    if (typeof exports !== "undefined") {
        exports.makePromise = makePromise;
        // promises-aplus-tests-adapter
        exports.deferred = makePromise;
        exports.resolve = function (value) {
            return makePromise(function (resolve) {
                resolve(value);
            });
        };
        exports.reject = function (reason) {
            return makePromise(function (resolve, reject) {
                reject(reason);
            });
        };
    }
    /**
     * require.cache[id] = Module
     *
     * Module({ id: exports children : code });
     *
     * @param id
     * @param exports
     * @param children
     * @param code
     * @returns {Module}
     * @constructor
     */
    function Module(id, exports, children, code) {
        "use strict";
        var m = this;
        m.id = id;
        m.children = children;
        if (exports) m.loaded = true;
        m.exports = exports || {};
        m.require = function (ids, factory) {
            return require.apply(this, arguments);
        };
        if (code) {
            if (typeof code === "function")
                m.factory = code;
            else
                m.factory = new Function("require", "exports", "module", code);
            m.exports = m.factory(m.require, m.exports, m);
            m.loaded = true;
        }
        return m;
    }
    /**
     * syntaxjs.define is a function on the syntaxjs object
     * this one is putting all exported values under it´s
     * required name, the module id, in require.cache[name]
     *
     * define("intrinsic", function (require, exports, module) {
     *      var tables = require("tables");
     *      exports.dummy = IsBindingPattern["ArrayPattern"];
     *      return exports;
     * });
     *
     * syntaxjs.define(name, ["dep1","dep2"], function (dep1, dep2) {
     *      return dep1+dep2;
     * });
     *
     * It looks like the define(function() {}) is missing, i see
     *
     * @param id
     * @param deps
     * @param factory
     * @returns {*|{}|Module.exports}
     *
     */
    function define(id, deps, factory) {
        "use strict";
        var exports = {};
        var children = [];
        var imports = [];
        var returned;
        var m = new Module(id, exports, children);
        var d;
        /*
        // should i do that? i spend 5 minutes on it
        if (arguments.length === 1 && typeof arguments[0] === "object" && arguments[0]) {
            if (typeof __dirname !== "undefined" && typeof __filename == "string") {
               var _id = __dirname + __filename;
               require.cache[_id] = new Module(_id, arguments[0]);
            } else if (typeof location !== undefined) {
                _id = location.href;
                _id = ("" + location.href).slice(("" + location.href).lastIndexOf("/"));
                return require[_id] = arguments[0];
            }
        }
        */
        if (!require.cache) require.cache = Object.create(null);
        if (arguments.length === 2) {
            if (typeof deps === "object" && !Array.isArray(deps)) {
                require.cache[id] = new Module(id, deps);
            }
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
    /**
     * require does the sync return of module.exports from require.cache[id]
     *
     * it´s defined on syntaxjs, too. You can acces the intrinsic modules by
     * calling syntaxjs.require("name");
     *
     * var tables = require("tables");
     * var format = require("i18n").format;
     *
     * Some might return export objects, some might return functions.
     * I want to change my kind of writing this to return export objects only
     * Everyhting else is a mess like this here still is
     *
     * @param deps
     * @param factory
     * @returns {*}
     */

    function require(deps, factory) {
        "use strict";
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

