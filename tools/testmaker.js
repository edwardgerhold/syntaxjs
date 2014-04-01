/*
    testmaker for tester.js
    
    
    idea:
    
    
    test.json = {
    
	"test1":	{
	    "init": "let x = 10;",
	    "tests": 
	    [
		["x",10],
		["x+x", 20]
	    ],
	    
	"test2": {
	    "init": "const x = 20;",
	    "tests": 
	    [
		["x = 30; x;", 20],
		["x-=10", 10],
		["x", 20]
	    ]
	}
    }
    
    // .init is called to initialise the environment
    // .tests will be called with the same environment
    // each top-level test creates with .init a new realm
*/

var VERSION = "0.0.0";
var rawjson, json, writetests, testnames;
var Test = require("../tools/tester0.js").Test;
var syntaxjs = require("../syntax0.js").syntaxjs;

var fs = require("fs");

function about() {
    console.log("testmaker.js "+VERSION+" for tester.js for syntax.js by Edward");
}

function usage() {
    console.log("usage:");
    console.log("testmaker.js tests.json (calls tester.js and syntax.js with the testdata at once)");
    console.log("testmaker.js tests.json -w (unimplemented, will write code instead of calling tester)");
}


function basic_setup () {
    var args = process.argv.slice(2);
    rawjson = fs.readFileSync(args[0], "utf8");
    console.log(rawjson);;
    if (args[1] == "-w") writetests = true;
    json = JSON.parse(rawjson);
    testnames = Object.keys(json);
}

function writeTest(current) {
    //
    // write the same like in runTest
    // just as source code
    // so one can generate code for websites
    // or for whatever (maybe to be modified)
    //
}

function prepareTest(current) {
    var tester = new Test();
    var code = current.init;
    var result = syntaxjs.eval(code, true, true);
    var tests = current.tests;
    tests.forEach(function (test) {
	tester.add(function () {
	    var code = test[0];
	    var expected = test[1];
	    var result = syntaxjs.eval(code, true);
	    this.assert(result, expected, code);
	});
    });
    tester.run();
    tester.print();
}

(function main() {
    about();
    if (process.argv.length < 2) {
	usage();
	process.exit(-1);
    }

    basic_setup();
    
    testnames.forEach(function (testname) {
	var current = json[testname];
	if (writetests) writeTest(current);
	else prepareTest(current);
    });
    
    console.log("# testmaker.js finished work for now");
}());

