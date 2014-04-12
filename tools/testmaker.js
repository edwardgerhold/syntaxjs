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
var jsonfile, rawjson, json, writetests, testnames, verbose, fn, separator, doubleseparator;
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


function basic_setup (args) {
    for (var i = 0, j = args.length; i < j; i++) {
	if (args[i] == "-w") writetests = true;
	else if (args[i] == "-v") verbose = true;
	else jsonfile = args[i]; 
    }
    rawjson = fs.readFileSync(jsonfile, "utf8");
    json = JSON.parse(rawjson);
    testnames = Object.keys(json);
    separator = "";
    doubleseparator = "";
    for (var i = 0; i < 79; i++) separator += "-";
    for (var i = 0; i < 79; i++) doubleseparator += "=";
    
}

function writeTest(current) {

}

function runTest(current, testname) {
    // calling tester.js
    
    var tester = new Test();
    var code = current.init;
    var throws = current.throws;


    console.log("TEST: " + testname);
//    console.log("INIT: " + code);
    console.log(code);

    if (throws) {
	try {	
	    var result = syntaxjs.eval(code, true, true);
	} catch (ex) {
	    result = ex;
	}
    } else {
	var result = syntaxjs.eval(code, true, true);
    }    
    var tests = current.tests;
    var testnum = 0;
    tests.forEach(function (test, index) {
	++testnum;
	tester.add(function () {

	    var code = test[0];
	    var expected = test[1];
	    var fn = test[2];	
	    
	    switch (fn) {
		
		case "throws":
		    this.throws(function () {
			var result = syntaxjs.eval(code, true);
		    }, code);
		    break;
		case "NaN": 
		    var result = syntaxjs.eval(code, true);
		    this.assert(result != result, true, code);
		    break;
		default:
		    var result = syntaxjs.eval(code, true);
		    this.assert(result, expected, code);
	    }	    
	    
	    
	});
    });
        
    tester.run();
    tester.print();
    
    
    
}

(function main(args) {

    if (!args.length) {
        about();
	usage();
	process.exit(-1);
    }

    basic_setup(args);
    
    if (verbose) {
	about();
	console.log(rawjson);
    }
    
    console.log( "\n" + (jsonfile + " " + doubleseparator).substr(0,79));
    
    testnames.forEach(function (testname, index) {
	
	var current = json[testname];
	

	 // a. convert to other testlibs writing tests.js to fs
	// if (writetests) return writeTest(current);
	// b. use tester.js as testrunner
	try {
	    runTest(current, testname);
	    if (index < (testnames.length - 1)) console.log("\n" + separator);
	    
	} catch (ex) {
	    
	    console.log("FAIL: Exception at: "+jsonfile+": "+testname);
	    console.log(ex.name);
	    console.log(ex.message);
	    console.log(ex.stack);
	    
	}
    });
    
}(process.argv.slice(2)));

