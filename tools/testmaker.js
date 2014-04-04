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
    
    
    lacks:

    json has no undefined
    tests agains undefined (omit the expected value should result in an undefined passed)
    
    NaN
    the is no expectation to test against nan.
    maybe a third argument in the test array could be such a command
    
*/

var VERSION = "0.0.1";
var rawjson, json, writetests, testnames, verbose, fn, separator;
var Test = require("../tools/tester0.js").Test;
var syntaxjs = require("../syntax0.js").syntaxjs;

var fs = require("fs");

function about() {
    console.log("testmaker.js "+VERSION+" for tester.js for syntax.js by Edward");
}

function usage() {
    console.log("usage:");
    console.log("testmaker.js tests.json (calls tester.js and syntax.js with the testdata at once)");
    console.log("-v = verbose and prints tests.json out each time");
    console.log("-w = (unimplemented, will write code instead of calling tester)");
}


function basic_setup () {
    var args = process.argv.slice(2);

    for (var i = 1, j = args.length; i < j; i++) {
	if (args[i] == "-w") writetests = true;
	else if (args[i] == "-v") verbose = true;
	else fn = args[i];
    }
    rawjson = fs.readFileSync(args[0], "utf8");
    json = JSON.parse(rawjson);
    testnames = Object.keys(json);
    separator = "";
    for (var i = 0; i < 50; i++) separator += "-";
}

function writeTest(current) {
}

function runTest(current, testname) {
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
    console.log(separator);
    console.log(testname);
    console.log(code);
    tester.run();
    tester.print();
}

(function main() {

    if (process.argv.length < 2) {
        about();
	usage();
	process.exit(-1);
    }

    basic_setup();
    
    if (verbose) {
	about();
	console.log(rawjson);
    }
    
    testnames.forEach(function (testname) {
	var current = json[testname];
	//if (writetests) writeTest(current);
	//else 
	runTest(current, testname);
    });
    
}());

