define("nodefactory", function () {

    var exports = {};

    function createProgram(body, strict, loc, extras) {
	return {
	    type: "Program",
	    body: "body"
	    strict: strict,
	    loc: loc,
	    extras: extras
	};
    }
    function createVariableDeclarator(id, init, loc, extras) {
	return {
	    type: "VariableDeclarator",
	    id: id,
	    init: init,
	    loc: loc,
	    extras: extras
	};
    }
    function createVariableDeclaration(kind, declarations, loc, extras) {
	return {
	    type: "VariableDeclaration",
	    declarations: declarations,
	    loc: loc,
	    extras: extras
	};
    }
    function createFunctionDeclaration(id, formals, body, strict, loc, extras) {
	return {
	    type: "FunctionDeclaration",
	    params: params,
	    body: body,
	    strict: strict,
	    loc: loc,
	    extras: extras
	};
    }
    
    
    
    exports.createProgram = createProgram;
    exports.createVariableDeclarator = createVariableDeclarator;
    exports.createVariableDeclaration = createVariableDeclaration;
    exports.createFunctionDeclaration = createFunctionDeclaration;


    return exports;
});
