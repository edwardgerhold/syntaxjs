/* node inlinefile.js top-level.js [out-file.js] wird top-level.js rekursiv nach #include "name.js" absuchen und die Dateien einbinden */

(function main () {
    "use strict";
    
    function inlineFiles(filename) {
        return makePromise(function (resolve, reject) {
            fs.readFile(filename, "utf8", function (err, data) {
            if (err) reject(err);
            else resolve(data);
        });
    }
    
    function transFormSync(input) {
        return input.replace(include, function (all, filename) {
            var content = fs.readFileSync(filename, "utf8");
            content = transForm(content);
            return content;
        });
    }
    
    function writeFile(toDrive, data) {
        fs.writeFile(toDrive, data, "utf8", function (err) {
            if (err) console.err(err);
            else console.log(toDrive + " successfully written.");
        });
        return data;
    }
    
    function logOrWrite (data) {
        var toDrive = process.argv[3];
        if (typeof toDrive === "string") {
            if (fromFile === toDrive) console.log("input "+fromFile+" and output "+toDrive+" are the same");
            else writeFile(toDrive, data);    
        } else {
            console.log(data);
        }
        return data;
    }
    
    var include = /(?:\#include "([^\"]+)";)/g;
    var makePromise = require("./promise.js").makePromise;
    var fs = require("fs");
    var fromFile = process.argv[2];
    if (!fs.existsSync(fromFile)) throw new TypeError(fromFile + " does not exist");
    
    var ausgabeP = inlineFiles(fromFile).then(transFormSync).then(logOrWrite);
    console.log("A promise - Diese Zeile wird vor der Zeile ausgegeben, die wir soeben riefen.");
    // ausgabeP.then(console.log.bind(console.log.bind(console)))    
}());