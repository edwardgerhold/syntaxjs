/*

    replace_strings.js
    
    replaces a string (turned into a regexp)
    with another string (only with one)
    for any filename passed behind the two.
    put the first arguments in quotes and escape if needed
    
    usage: node replace_strings.js "search" "replace" file1.js file2.js ... filen.js
    
    or 
    
    for f in *.js; do node replace_string "search" "replace" $f; done

    i used it first time to remove "lib/" or "syntaxerror-" from the split files.
    can correct all module names in beetween the modules with.
    or simply replace code.
    will use it again.
    
*/

var fs = require("fs");

function transform(filename, search, replace, data) {
    var result = data.replace(search, function () { return replace; });
    write(filename, result);
}

function onReadFile(xform, err, data) {
    console.log("onReadFile: "+!err);
    if (err) throw err;
    xform(data);
}

function processFile(search, replace, filename) {
    console.log("processFile: "+filename);
    var xform = transform.bind(null, filename, search, replace);
    var onRead = onReadFile.bind(null, xform);
    fs.readFile(filename, "utf8", onRead);
}

function onWriteFile() {
    console.log("written");
}

function write(filename, data) {
    console.log("write: "+filename);
    var onWrite = onWriteFile.bind(null, filename);
    fs.writeFile(filename, data, "utf8", onWrite);
}

(function main() {
    var search = new RegExp(process.argv[2], "g");
    var replace = process.argv[3];
    var filenames = process.argv.slice(4);
    var proc = processFile.bind(null, search, replace);
    filenames.forEach(proc);
}());
