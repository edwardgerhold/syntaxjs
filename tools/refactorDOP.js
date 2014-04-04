/*
    refactorDOP.js
    
    DOP means [[DefineOwnProperty]]
    
    the aim of this tool is to replace
    a few hundred entries of DefineOwnProperty
    with a value of CreateBuiltinFunction or
    some other value (unimplemented)
    to replace the call with a call to another
    function, which saves some work and LOC,
    but would be too much to be changed manually.
        
    Here i can learn refactoring code with
    
    Mozilla Parser_API and syntax.js
    
    - first by hand.
    
    - Hope to find patterns.
    
    -- yes, read the code, analyze what to do.
    i just figured out a little and have no good
    nodeLocator()  or querySelector() for the AST yet. --
    
*/


var esprima = require("esprima");
var syntaxjs = require("syntaxjs").syntaxjs;
var withEsprima;

var fs = require("fs");

var state = {};

function getAst(file) {
    var code = fs.readFileSync(file, "utf8");
    if (withEsprima) {
    console.log("parsing "+file+" with esprima");
    return esprima.parse(code);
    }
    //console.log("hanging "+file+" with syntax.js (temp)");
    console.log("parsing "+file+" with syntax.js");
    return syntaxjs.parse(code);
}

function error(message) {
    return new Error(message);
}

function do_search(node) {
    state.sources = [];
    state.sourceStack = [];
    state.sourceStack.push(state.sources);    
    return search(node);
}

function search(node, parent) {

    // DO LISTS

    if (Array.isArray(node)) {
	node.forEach(function (child) {
	    search(child, parent);
	});
	return;
    }
    
    // Search for DefineOwnProperty(OBJ, NAME, DESC)

    if (node.type === "CallExpression") {
	if (node.callee.name === "DefineOwnProperty") {
	    console.log("found call to [[DefineOwnProperty]] ");	    
	    state.sources.push([node, parent]);
	}
    }

    if (typeof node === "object")
    Object.keys(node).forEach(function (k) {
	
	// visits more branches then necessary,
	// all DOP code is a top level callexpression
	// in a function body.
	// something to learn from
	
	switch (k) {
	    case "body":
	    case "expression":
	    case "sequence":
	    case "left":
	    case "right":
	    case "argument":
	    case "callee":
	    case "object":
	    case "value":
	    case "key":
		search(node[k], node);
	    break;
	    default:
	    break;
	}
    });

}

function do_replace () {
    state.current = state.sourceStack.shift();
    replace();
}

function replace() {

    state.decls = [];
    state.defines = [];
    state.replaced = [];

    state.current.forEach(function (array) {
	
	var node = array[0];
	var parent = array[1];
    
	// Die komplette CallExpression.
	// Auseinandernehmen, ersetzen.
	
	var params = node.arguments;

	var id = getValue(params[0]);
	var name = getValue(params[1]);	
	var desc = params[2];	
	// desc is ObjectExpression	
	var props = desc.properties; 
	    
        var enumer = false, 
	conf = false, 
	writ = false;
	
	var value, funcExpr;
	var ok;
	for (var i = 0, j = props.length; i < j; i++) {
	    var prop = props[i];
	    if (prop.key.name == "enumerable") enumer = getValue(prop.value);
	    if (prop.key.name == "configurable") conf = getValue(prop.value);
	    if (prop.key.name == "writable")     writ = getValue(prop.value);
	    if (prop.key.name == "value") {

		value = getValue(prop);
		if (value.type == "CallExpression") {
		
		    // suche:
		    // CallExpression
		    // callee: Identifier "CreateBuiltinFunction"
		    // arguments: [realm, funcExpr, flength, name]
		    if (value.callee.name == "CreateBuiltinFunction") {
			ok = true;			
						
			var args = value.arguments;			
			realm = getValue(args[0]);
			funcExpr = args[1];
			flength = getValue(args[2])|0;
			fname = getValue(args[3]);			
						
		    }	
		    
		} 
		
	    }
	}
	
	if (!ok) return;
	
	var callFnVarName = id+"_"+name;	
	console.log("callFnVarName = "+callFnVarName);
	
	var varDecl = {
	    type: "VariableDeclaration",
	    kind: "var",
	    declarations: [
		{
		    type: "VariableDeclarator",
		    id: callFnVarName,
		    init: funcExpr
		}
	    ],
	    loc: {
		start: {},
		end: {}
	    }
	};
        
        // LazyDefineBuiltinFucntion(realm, id, name, flength, callFnVarName)
	var callExpr = {
	    type: "CallExpression",
	    callee: {
		type: "Identifier",
		name: "LazyDefineBuiltinFunction"
	    },
	    arguments: [
		{
		    type: "Identifier",
		    name: realm
		},
		{
		    type: "Identifier",
		    name: id
		},
		{
		    type: "Literal",
		    value: name
		},
		{
		    type: "NumericLiteral",
		    value: flength
		},
		{
		    type: "Identifier",
		    value: callFnVarName
		}
	    ],
	    loc: {
		start: {},
		end: {}
	    }
	};

	console.log("created varDecl and callExpr from original callexpr");
		
	var code1 = syntaxjs.toJsLang({type:"Program", body:[varDecl]});
	var code2 = syntaxjs.toJsLang({type:"Program", body:[callExpr]});

	state.decls.push(code1);
	state.defines.push(code2);
	
	state.replaced.push(array);
    
    });

}

function getValue(node) {
    if (!node) return node;
    switch (node.type) {    
    case "Identifier":
	return node.name;
    case "StringLiteral":
	return node.value.substr(1,node.value.length-2);
    case "NumericLiteral":
	return node.value;
    case "BooleanLiteral":
	return node.value;
    case "Literal":
	return node.value;
    default:
	return node.value;
    }
}

function about() {
    console.log("refactorDOP.js");
    console.log("is a specialised tool for doing a certain task");
    console.log("this tool replaces some DefineOwnProperty calls with better code.");


    console.log("");
}
function usage() {
    console.log("refactorDOP.js [input[, input[, ...]]] -o output.js [-e|-s]");
    console.log("-e parses with esprima, -s with syntax.js");
}

(function main (args) {
    about();
    if (!args.length) {
	usage();
    }
    
    state.inputs = [];
    
    for (var i = 0, j = args.length; i < j; i++) {
	var arg = args[i];
	if (arg === "-s") {
	    withEsprima = false;
	    continue;
	}
	if (arg === "-e") {
	    withEsprima = true;
	    continue;
	}	
	if (arg === "-o") {
	    var ofile = state.ofile = args[++i];
	    if (typeof ofile != "string" || !ofile.length) {
		throw error("-o [filename] requires filename argument");
	    }
	} else {
	    state.inputs.push(arg);
	}
    }

    if (!state.inputs.length) {
	throw error("nothing to process");
    }
    
    state.inputs.forEach(function (input) {

	console.error("processing file: "+input);	
	console.log("// OMITTING INPUT ");
		
        var ast = getAst(input);
        
        do_search(ast); // search is specialised. refactorDOP is hardcoded.
        do_replace();	// same here

	console.log("// DEFINE CALLS");

        state.decls.forEach(function (code) {
    	    console.log(code);
        });
        
	console.log("// CREATE INTRINSICS");

        state.defines.forEach(function (code) {
    	    console.log(code);
        });
        
        var rnum = state.replaced.length;
        console.error("// DONE after "+rnum+" entries");
    });

}(process.argv.slice(2)));

