var ast = eval('({\
"type": "Program",\
"body": [\
{\
    type: "VariableDeclaration",\
    kind: "var",\
    declarations: \
    [\
	{ type: "VariableDeclarator", id: "a" },\
	{ type: "VariableDeclarator", id: "b" },\
	{ type: "VariableDeclarator", id: "c" },\
	{ type: "VariableDeclarator", id: "d" }\
    ]\
},\
{\
    type: "BinaryExpression",\
    operator: "+",\
    left: "d",\
    right: {\
	    type: "BinaryExpression",\
        operator: "+",\
	    left: { \
	        type: "Identifier", name: "a" \
	    },\
        right: {\
    	    type: "BinaryExpression",\
    	    operator: "*",\
    	    left:    { type: "Identifier", name: "b" },\
	        right:    { type: "Identifier", name: "c" }\
	    }\
    }\
}    \
    ]\
})');


console.log(JSON.stringify(ast, null, 4));
var syntaxjs = require("../../syntax0.js");
var toSSA = syntaxjs.require("ssa-tool").rewrite;
var newAST = toSSA(ast);
console.log(JSON.stringify(newAST, null, 4));
