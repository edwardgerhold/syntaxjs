
// *******************************************************************************************************************************
// file imports
// *******************************************************************************************************************************

define("fswraps", function (require, exports) {


    function readFileP(name) {
	return makePromise(function (resolve, reject) {
	    return readFile(name, resolve, reject);
	});	
    }

    function readFile(name, callback, errback) {
        
        if (syntaxjs.system == "node") {
            var fs = module.require("fs");
            return fs.readFile(name, function (err, data) {
                if (err) errback(err);
                callback(data);
            }, "utf8");
            return true;
        
        } else if (syntaxjs.system == "browser") {
        
            var xhr = new XMLHttpRequest();
            xhr.open("GET", name, false);
            xhr.onload = function (e) {
    		callback(xhr.responseText);
            };
            xhr.onerror = function (e) {
		errback(xhr.responseText);
            };
            xhr.send(null);
            // missing promise
            return true;
        } else if (syntaxjs.system == "worker") {
            importScripts(name);
        }
        
    }

    function readFileSync(name) {
        if (syntaxjs.system == "node") {
            var fs = module.require("fs");
            return fs.readFileSync(name, "utf8");
        } else if (syntaxjs.system == "browser") {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", name, true);
            xhr.send(null);
            return xhr.responseText;
        } else if (syntaxjs.system == "worker") {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", name, true);
            xhr.send(null);
            return xhr.responseText;
        }
    }
    exports.readFileP = readFileP;
    exports.readFile = readFile;
    exports.readFileSync = readFileSync;
});
