
// *******************************************************************************************************************************
// file imports
// *******************************************************************************************************************************

define("fswraps", function (require, exports) {

    /*
     var concreteAdapter = makeAdapter({
     test: {
     node: function
     browser: function
     worker: function
     sm: function
     any: function
     }
     work: {
     node: function
     browser: function
     worker: function
     sm: function
     any: function
     },
     default: function () {
     }
     });

     returns a function calling to call work[k] if test[k]

     starts only a work[k] if a test[k] is existing and returning true
     */


    function makeAdapter(methods, optionalThis) {
        if (arguments.length == 0 || typeof methods !== "object" || methods === null) {
            throw new TypeError("makeAdapter(methods, optionalThis) expects { test: {}, work: {} } where work[ĸ]() will be called iff test[k]() succeeds. Both need to be functions. Optional is a methods.default function if no test succeeds.");
        }
        var keys = Object.keys(methods.test);
        return function adapterFunction () {
            for (var i = 0, j = keys.length; i < j; i++) {
                var k = keys[i];

                var test = methods.test[k];
                if (typeof test != "function") {
                    throw new TypeError("adapter: adaptee.test['"+k+"'] is not a function");
                }

                if (test()) {
                    var work = methods.work[k];
                    if (typeof work != "function") {
                        throw new TypeError("adapter: adaptee.work['"+k+"'] is not a function");
                    }
                    return work.apply(optionalThis || this, arguments);
                }
            }
            if (typeof methods["default"] == "function") return methods["default"].apply(optionalThis || this, arguments);
        };
    }


    function readFileP(name) {
        return makePromise(function (resolve, reject) {
            return readFile(name, resolve, reject);
        });
    }

        // change to f(err, data)

    function readFile(name, callback, errback) {
        if (syntaxjs.system == "node") {
            var fs = module.require("fs");
            return fs.readFile(name, "utf8", function (err, data) {
                if (err) errback(err);
                else callback(data);
            });
            return true;

        } else if (syntaxjs.system == "browser") {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", name, true);
            xhr.onloadend = function (e) {
                callback(xhr.responseText);
            };
            xhr.onerror = function (e) {
                errback(xhr.responseText);
            };
            xhr.send(null);
            // missing promise
            return true;
        } else if (syntaxjs.system == "worker") {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", name, true);
            xhr.onloadend = function (e) {
                callback(xhr.responseText);
            };
            xhr.onerror = function (e) {
                errback(xhr.responseText);
            };
            xhr.send(null);
            // missing promise
            return true;
        }
    }

    function readFileSync(name) {
        if (syntaxjs.system == "node") {
            var fs = module.require("fs");
            return fs.readFileSync(name, "utf8");
        } else if (syntaxjs.system == "browser") {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", name, false);
            xhr.send(null);
            return xhr.responseText;
        } else if (syntaxjs.system == "worker") {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", name, false);
            xhr.send(null);
            return xhr.responseText;
        }
    }

    exports.readFileP = readFileP;
    exports.readFile = readFile;
    exports.readFileSync = readFileSync;
    exports.makeAdapter = makeAdapter;

});
