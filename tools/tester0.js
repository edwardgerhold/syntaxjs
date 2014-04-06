/*

    tester.js is a test utility
    it can not be used inside other tools
    it´s own assertions are recorded in an array
    for later printing or whatever analysis later
    
    when reading the code i notice
    it´s older than syntax.js and 
    from my homepage. i just reuse it.
    and it needs further development :)
    a litte.

*/


var testerjs = (function () {

if (typeof exports !== "undefined") exports.Test = SimpleTest;

var ClassNames = {
    "test": "testerjs-test",
    "result":"testerjs-result",
    "actual":"testerjs-actual",
    "expected":"testerjs-expected",
    "message":"testerjs-message",
    "PASS":"testerjs-pass",
    "FAIL":"testerjs-fail",
    "EXCEPTION":"testerjs-error",
    "type":"testerjs-type",
    "ex":"testerjs-ex",
    "stack":"testerjs-stack"
};

var Pass = {
    "true": "PASS",
    "false": "FAIL",
    "error": "EXCEPTION"
};

var Colors = {
    "true": "green",
    "false": "red",
    "Exception": "orange",
    "type": "brown",
    "message": "darkblue",
    "actual": "darkgrey",
    "expected": "darkgrey"
};

function SimpleTest () {
    var test = Object.create(SimpleTest.prototype);
    
    test.tests = [];
    test.results = [];
    test.count = Object.create(null);
    test.count.assertions = 0;
    test.count.currentTest = 0;
    test.count.passed = 0;
    test.count.failed = 0;
    test.count.exceptions = 0;
    return test;
}

/* Assertions */
SimpleTest.prototype = Object.create(null);
SimpleTest.prototype.add = add_test;
SimpleTest.prototype.assert = assert;

SimpleTest.prototype.throws = throws;

SimpleTest.prototype.throwsNot = throwsNot;
SimpleTest.prototype.deepEquals = deepEquals;
SimpleTest.prototype.equals = equals;
SimpleTest.prototype.instanceOf = instanceOf;
SimpleTest.prototype.notEquals = notEquals;
SimpleTest.prototype.throws = throws;
/* Run */
SimpleTest.prototype.add = add_test;
SimpleTest.prototype.run = run_tests;
/* Utils */
SimpleTest.prototype.load = load;
SimpleTest.prototype.record = record;
SimpleTest.prototype.stringify = stringify;
/* Output */
SimpleTest.prototype.print = print_results;
SimpleTest.prototype.html = print_html;
SimpleTest.prototype.process = process_results;

/* load, record, stringify */
function load(file) {
    var fs = require("fs");
    return fs.readFileSync(file);
}
function struct(pass, type, actual, expected, message) {
    var print = Pass[pass]+": "+type+": actual="+stringify(actual)+", expected="+stringify(expected)+": message="+message;
    var rec = {
	pass: pass,
	type: type,
	actual: actual,
	expected: expected,
	message: message,
	print: print
    };
    return rec;
}
function record(pass, type, actual, expected, message) {
    var rec = struct(pass, type, actual, expected, message);
    this.count.assertions += 1;
    if (pass) this.count.passed += 1;
    else this.count.failed += 1;
    this.results.push(rec);
    return rec;
}
function stringify (obj) {
    var s, k;
    if (Array.isArray(obj)) {
	s="[";
	for (k in obj) if (Object.hasOwnProperty.call(obj, k)) s+= ""+ obj[k] +",";
	s+="]";
    } else if (typeof obj === "object" && obj !== null) {
        s = "{";
	for (k in obj) if (Object.hasOwnProperty.call(obj, k)) {
	    
	    if (typeof obj[k] !== "function" && typeof obj[k] !== "object") {
		s+=k+":"+""+obj[k]+""+",";
	    } else 
	    s+=k+",";
	
	}
	s+="}";
    } else {
	s = obj;
    }
    return s;
}
/* assert, deepEquals, equals, notEquals, throws */


function throws(fn, mess) {
    var pass = false;
    var act, exp;
    try {
	fn();
    } catch(ex) {
	act = ex.name;
	exp = (""+ ex.message).substr(0, 79);
	pass = true;
    } 
    var rec = this.record(pass, "throws", act, exp, mess);
    return rec;
}



function throwsNot(fn, mess) {
    var pass = false;
    var act, exp;
    try {
	fn();
	act = "";
	exp = "";
	pass = true;
    } catch(ex) {
	act = ex.name;
	exp = (""+ ex.message).substr(0, 79);
	pass = false;
    } 
    var rec = this.record(pass, "throwsNot", act, exp, mess);
    return rec;
}


function assert(act, exp, mess) {
    var pass = act === exp;
    var rec = this.record(pass, "assert", act, exp, mess);
    return rec;
}
function instanceOf(act, exp, mess) {
    var pass = act instanceof exp;
    var rec = this.record(pass, "instanceOf", act, exp, mess);
    return rec;
}
function deepEquals(act, exp, mess) {
    var pass, keys, rec;
    if (typeof act != typeof exp) pass = false;
    else {
	if (Array.isArray(exp)) {
	    pass = exp.length === act.length;
	    if (pass)
	    pass = act.every(function (acti, i) {
		return acti === exp[i];		
	    });
	} else if (typeof exp === "object") {
	    pass = (keys=Object.keys(act)).every(function (k) {
		return act[k] === exp[k];
	    }); 
	    if (pass)
	    pass = Object.keys(exp).length === keys.length;
	} else {
	    pass = act === exp;
	}
    }
    rec = this.record(pass, "deepEquals", act, exp, mess);
    return rec;
}
function equals(act, exp, mess) {
    var pass = act == exp;
    var rec = this.record(pass, "equals", act, exp, mess);
    return rec;
}
function notEquals(act, exp, mess) {
    var pass = act != exp;
    var rec = this.record(pass, "notEquals", act, exp, mess);
    return rec;
}
/* add, run */
function add_test(f) {
    this.tests.push(f);
}

function call_test (test, i) {
	var that = this;
	var rec;
	try {
	    that.count.currentTest = i;
	    rec = test.call(that, that);
	} catch(ex) {
	    that.count.exceptions += 1;
	    that.results.push(rec={
		pass: false,
		type: "Exception",
		ex: ex,
		test: test,
		print: Pass["error"]+": Exception thrown at "+test.toString().substr(0,100)+"...: "+ex.message+"\n"+ex.stack+"\n"
	    });
	    console.log("EXCEPTION THROWN AT TEST "+(i+1));
	    console.dir(ex);
	}
	return rec;
}

function run_tests() {
    var that = this;
    var l = this.tests.length;
    var t = l+" tests completed in ";
    var tests, test;
    tests = this.tests;
    console.time(t);
    for (var i=0, j=tests.length; i < j; i++) {
	if (test = tests[i]) {
    	    call_test.call(this, test, i);
	}
    }
    console.timeEnd(t);
}
/* print, html, draw */
function process_results(f) {
    this.results.forEach(f);
}
function print_results() {
    var str = "[Tests: "+this.tests.length;
    str += " Asserts: "+this.count.assertions;
    str += " Passed: "+this.count.passed;
    str += " Failed: "+this.count.failed;
    str += " Exceptions: "+this.count.exceptions;
    str += "]";
    console.log(str);
    this.results.forEach(function (rec) {
	console.log(rec.print);
    });
}

function span(classname, text) {
    return "<span class="+ClassNames[classname]+">" + text + "</span>";
}
function format_html (rec) {
    var html;
    html = span(Pass[rec.pass], Pass[rec.pass]);
    html += ": ";    
    html += span("type", rec.type);
    if (rec.type === "throws") {
	html += ": type="
	html += span("actual", rec.actual);
	html += ": msg=";
	html += span("expected", rec.expected);
	html += "; ";
	html += span("message", rec.message);    
    } else if (rec.type === "Exception") {
    	html += ": ex=";
	html += span("ex", rec.ex.message);
	html += ": stack=";
	html += span("stack", rec.ex.stack.substr(0));
    } else {
	html += ": actual=";
	html += span("actual", rec.actual);
	html += ", expected=";
	html += span("expected", rec.expected);
	html += "; ";
	html += span("message", rec.message);
    } 
    return span("result", html);
}

function print_html(options) {
    var ispre, rec, html = "";
    var element = typeof options.el === "string" ? document.querySelector(options.el) : options.el;
    if (element) {
	ispre = element instanceof HTMLPreElement;
	for (var i = 0, j = this.results.length; i < j; i++) {
	    rec = this.results[i];
	    html += format_html(rec) + (ispre ? "\n" : "<br>\n");
	}
	element.innerHTML += html;
    }
    else throw "tester.js: print_html({el:'#selector'||element}): el not found";
}

var tester = {
    id: "testerjs",
    Test: SimpleTest
};

if (typeof exports !== "undefined") {
    exports.Test = SimpleTest
} else if (typeof module === "object") module.exports = exports;
else if (typeof require === "function" && typeof require.cache === "object" && !require.cache[tester.id]) require.cache[tester.id] = tester;

return tester;

}());

if (typeof Test === "undefined") Test = testerjs.Test;