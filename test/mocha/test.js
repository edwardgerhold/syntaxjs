var assert = require("assert");
var syntaxjs = require("../../syntax0.js").syntaxjs;

describe("Object.prototype.toString example", function () {
	it("should be [object Object]", function () {
	    assert.equal(syntaxjs.eval("({}).toString()"), "[object Object]");
	});

	it("should be [object Array]", function () {
	    assert.equal(syntaxjs.eval("Object.prototype.toString.call([])"), "[object Array]");
	});
    
    	it("should be [object Number]", function () {
	    assert.equal(syntaxjs.eval("Object.prototype.toString.call(new Number(10))"), "[object Number]");
	});
    
	it("should be [object String]", function () {
	    assert.equal(syntaxjs.eval("(new String('Hallo')).toString()"), "[object String]");
	});
});
