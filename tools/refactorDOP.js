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
var useEsprima = true;

var fs = require("fs");

var state = {};

function getAst(file) {
    var code = fs.readFileSync(file, "utf8");
    if (useEsprima)
    return esprima.parse(code);
    else return syntaxjs.parse(code);
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
	    search(child, node);
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

	var id = params[0].name;
	var name = params[1].value;
	var desc = params[2];		
	var props = desc.properties; // desc is ObjectExpression
        var enumer = false, 
	conf = false, 
	writ = false;
	var value, funcExpr;
	var ok;
	for (var i = 0, j = props.length; i < j; i++) {
	    var prop = props[i];
	    if (prop.key.name == "enumerable") enumer = prop.value.value;
	    if (prop.key.name == "configurable") conf = prop.value.value;
	    if (prop.key.name == "writable") writ = prop.value.value;
	    if (prop.key.name == "value") {
		value = prop.value;

		if (value.type == "CallExpression") {
		
		    if (value.callee.name == "CreateBuiltinFunction") {
			ok = true;
			var args = value.arguments;
			
			realm = args[0].name;
			funcExpr = args[1];
			flength = args[2].value;
			fname = args[3];
			fname = fname && fname.value;
			
			for (var y = 0, z = args.length; y < z; y++) {
			    var arg = args[y];
			}
		    
		    }	
		    
		} /*else 
		if (value && value.type == "FunctionDeclaration") {
		    ok = true;
		    funcExpr = value;
		    flength = funcExpr.formals.length;
		    
		}*/
	    }
	}
	
	if (!ok) return;
	
	var methodVariable = id+"_"+name;
	
	console.log("methodVariable = "+methodVariable);
	
	var varDecl = {
	    type: "VariableDeclaration",
	    kind: "var",
	    declarations: [
		{
		    type: "VariableDeclarator",
		    id: methodVariable,
		    init: funcExpr
		}
	    ],
	    loc: {
		start: {},
		end: {}
	    }
	};
	
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
		    type: "Literal",
		    value: flength
		},
		{
		    type: "Identifier",
		    value: methodVariable
		}
	    ],
	    loc: {
		start: {},
		end: {}
	    }
	};
	
	var code1 = syntaxjs.toJsLang({ type: "Program", body: [ varDecl ] });
	var code2 = syntaxjs.toJsLang({ type: "Program", body: [ callExpr ] });

	state.decls.push(code1);
	state.defines.push(code2);
	
	state.replaced.push(array);
    
    });

}

(function main (args) {
    
    state.inputs = [];
    
    for (var i = 0, j = args.length; i < j; i++) {
	var arg = args[i];
		
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
        
        do_search(ast);
        do_replace();

	console.log("// DEFINE CALLS");

        state.decls.forEach(function (code) {
    	    console.log(code);
        });
        
	console.log("// CREATE INTRINSICS");

        state.defines.forEach(function (code) {
    	    console.log(code);
        });
        
        var rnum = state.replaced.length;
        console.error("// DONE after "+rnum+" entries (will be continued for overworking the source)");
    });

}(process.argv.slice(2)));

