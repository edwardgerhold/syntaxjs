
// *******************************************************************************************************************************
// file imports
// *******************************************************************************************************************************

define("filesystem", function (require, exports) {


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

    return exports;
});
