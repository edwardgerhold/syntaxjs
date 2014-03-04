/* node inlinefile.js top-level.js [out-file.js] wird top-level.js rekursiv nach #include "name.js" absuchen und die Dateien einbinden */

(function main () {
    "use strict";
    
    function inlineFiles(filename) {	
	console.log("inlineFiles(\"+filename+\")");
        return makePromise(function (resolve, reject) {
            fs.readFile(filename, "utf8", function (err, data) {
        	if (err) reject(err);
        	else resolve(data);
            });
        });
    }
    
    function transFormSync(input) {
    	console.log("transFormSync()");
        return input.replace(include, function (all, filename) {
    	    console.log("inserting "+filename+" sync recursivly");
    	    if (!fs.existsSync(filename)) console.log("error: "+filename+" not found!");
            var content = fs.readFileSync(filename, "utf8");
            content = transFormSync(content);
            return content;
        });
    }
    
    function writeFile(toFile, data) {
        console.log("writeFile(\""+toFile+"\")");
        fs.writeFile(toFile, data, "utf8", function (err) {
            if (err) console.err(err);
            else console.log(toFile + " successfully written.");
        });
        return data;
    }
    
    function logOrWrite (data) {
        console.log("logOrWrite()");
        if (typeof toFile === "string") {
            if (fromFile === toFile) console.log("input "+fromFile+" and output "+toFile+" are the same");
            else writeFile(toFile, data);    
        } else {
            console.log(data);
        }
        return data;
    }
    
    
    console.log("inlinefiles.js replaces //#include \"name.js\" with name.js - syntax.js /tools");
    var include = /(?:[\/]{2}#include "([^\"]+)";)/g;
    var makePromise = require("./promise.js").makePromise;
    var fs = require("fs");
    var fromFile = process.argv[2];
    var toFile = process.argv[3];

    if (!fs.existsSync(fromFile)) throw new TypeError(fromFile + " does not exist");
    
    inlineFiles(fromFile).then(transFormSync).then(logOrWrite);
    
    // i had the worst comments and stupidest oneliners
    
}());