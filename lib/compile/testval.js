function logAssertion(actual, expected, message) {
    if (actual === expected) {
	    console.log("PASS: "+actual+ " is " +expected);
    } else {
    	console.log("FAIL: "+actual+ " is not " +expected);
    }
}

var s = require("../../syntax0.js");
var typeChecker = s.require("asm-typechecker");

var code = "x = +x";
var node = s.parseGoal("AssignmentExpression", code);
logAssertion(typeChecker.getTypeOfParameter(node), 6);

var code = "x = x|0";
var node = s.parseGoal("AssignmentExpression", code);
logAssertion(typeChecker.getTypeOfParameter(node), 4);

var code = "return x|0";
var node = s.parseGoal("ReturnStatement", code);
logAssertion(typeChecker.getTypeOfReturnStatement(node), 4);

var code = "return +x";
var node = s.parseGoal("ReturnStatement", code);
logAssertion(typeChecker.getTypeOfReturnStatement(node), 6);

var code = "return -10";
var node = s.parseGoal("ReturnStatement", code);
logAssertion(typeChecker.getTypeOfReturnStatement(node), 7);
