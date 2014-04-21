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
var jsonfile, rawjson, json, writetests, testnames, verbose, fn, separator, doubleseparator, realm, testfile;
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
    console.log("-r = check out a new realm for the test");
}


function basic_setup (args) {
    for (var i = 0, j = args.length; i < j; i++) {
        if (args[i] == "-w") {
            writetests = true;
            
            //i += 1;
            //testfile = args[i];
        }
        else if (args[i] == "-v") verbose = true;
        else if (args[i] == "-r") realm = true;
        else jsonfile = args[i];
    }
    rawjson = fs.readFileSync(jsonfile, "utf8");
    json = JSON.parse(rawjson);
    testnames = Object.keys(json);
    separator = "";
    doubleseparator = "";
    for (var i = 0; i < 79; i++) separator += "-";
    for (var i = 0; i < 79; i++) doubleseparator += "=";
    if (writetests) testfile = jsonfile.substr(0, jsonfile.lastIndexOf(".")) + ".test.js";
    data = "";
}

function writeFooterAndClose(fd) {
//    fs.appendFile(testfile, data, function (err) {
//        if (err) throw err;
        console.log(testfile + ": footer");
//    });
}

var writeFn, data; // lifetime
function writeTests(testfile, json, testnames, err, fd) {
    if (err) throw err;
    while (testnames.length) {
        data = "";
        var testname = testnames.shift();
        console.log("writing Test: "+testname);
        var current = json[testname];
        writeTest(testfile, current, testname);
        if (testnames.length) break;
    }
    if (!testnames.length) {
        writeFooterAndClose(testfile);
    }
}

function writeTest(testfile, current, testname) {
    "use strict";
    data += "(function () {\n";
    var init = current.init;
    var throws = current.throws;
    var tests = current.tests;
    // attention multi line string

    data += "var Test = require('../../tools/tester0.js').Test;\n";
    data += "var syntaxjs = require('../../syntax0.js').syntaxjs\n";
    data += "var tester = new Test();\n";
    data += "var realm = syntaxjs.createRealm();\n";
    data += "var code = \""+init+"\";\n";
    if (throws) {
        data+="try {\n";
    }
    data += "	var initResult = realm.eval(code);\n";
    if (throws) {
        data += "} catch (ex) {\n";
        data += "   initResult = ex;\n"
        data += "}\n";
    }

    tests.forEach(function (test, index) {
        console.log("proccessing test " + index);
        var init = test[0];
        var expected = test[1];
        var fn = test[2];

        data += "tester.add(function (test) {\n\tvar code = \""+init+"\";\n";
        if (expected != undefined) {
            data += "        var expected = "+ (typeof expected === "string" ? "\""+expected+"\"" : expected) + ";\n";
        }
        switch (fn) {
            case "throws":
                data += "	this.throws(function () {\
    var result = realm.eval(code);\
    }, code);";
                break;
            case "NaN":
                data += "	var result = realm.eval(code);\n\
    this.assert(result != result, true, code);\n";
                break;
            default:
                data += "	var result = realm.eval(code);\n\
	this.assert(result, expected, code);\n";
                break;
        }
        data += "});\n";
    });

    data += "tester.run();\n";
    data += "tester.print();\n";
    data += "}());\n"

    console.log(data);
    fs.appendFile(testfile, data, function (err) {
        if (err) throw err;
        writeFn();
    });
}
function writeTestStarter(testfile, json, testnames) {
    writeFn = writeTests.bind(null, testfile, json, testnames);
    writeFn();
}


function runTest(current, testname) {
    // calling tester.js

    var tester = new Test();
    var code = current.init;
    var throws = current.throws;
    var rlm, result;

    console.log("TEST: " + testname);
    console.log(code);

    if (realm) {
        rlm = syntaxjs.createRealm();
    }

    if (throws) {
        try {
            if (realm) result = rlm.eval(code);
            else result = syntaxjs.eval(code, true, true);
        } catch (ex) {
            result = ex;
        }
    } else {
        if (realm) result = rlm.eval(code);
        else result = syntaxjs.eval(code, true, true);
    }
    var tests = current.tests;
    var testnum = 0;
    tests.forEach(function (test, index) {
        ++testnum;
        tester.add(function () {

            var code = test[0];
            var expected = test[1];
            var fn = test[2];
            var result;
            switch (fn) {
                case "throws":
                    this.throws(function () {
                        if (realm) rlm.eval(code);
                        else syntaxjs.eval(code, true);
                    }, code);
                    break;
                case "NaN":
                    if (realm) result = rlm.eval(code);
                    else result = syntaxjs.eval(code, true);
                    this.assert(result != result, true, code);
                    break;
                default:
                    if (realm) result = rlm.eval(code);
                    else result = syntaxjs.eval(code, true);
                    this.assert(result, expected, code);
            }
        });
    });
    tester.run();
    tester.print();
}

function runTestStarter(json, testnames) {
    testnames.forEach(function (testname, index) {
        var current = json[testname];
        if (writetests) writeTest(current, testname, index);
        else {
            try {
                runTest(current, testname);
                if (index < (testnames.length - 1)) console.log("\n" + separator);

            } catch (ex) {
                if (!current.throws) {
                    console.log("FAIL: Exception at: "+jsonfile+": "+testname);
                    console.log(ex.name);
                    console.log(ex.message);
                    console.log(ex.stack);
                } else {
                    console.log("PASS: initialisation code throws");
                }
            }
        }
    });
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

    if (writetests) {
        writeTestStarter(testfile, json, testnames);
    } else {
        runTestStarter(json, testnames);
    }

}(process.argv.slice(2)));

