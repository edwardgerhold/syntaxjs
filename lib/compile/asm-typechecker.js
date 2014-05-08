/**
 * asm-typechecker
 *
 * The purpose of this module is to be able analyse the javascript
 * and to provide function to analyse the heap to obtain validation results
 *
 * This file will mostly implement the asm.js Specification in sense of
 * AST analysis, and later, when more is existing bytecode analysis.
 *
 * The functions here should be easy to apply on the ast to obtain true or
 * false or the resulting type of the relevant check.
 * Whenever needed it should memoize and generate static informations.
 *
 */
define("asm-typechecker", function (require, exports){
    "use strict";

    /**
     * The environments are needed again
     */
    var globalEnvironment = Object.create(null);
    var localEnvironment = Object.create(null);
    var blockEnvironment = Object.create(null);

    /**
     * these types are disallowed from escaping
     * @type {number}
     */
    var VOID = 1;	    // return;
    var INTISH = 2;	    //
    var DOUBLISH = 3;	//
    var INT = 4;	    //
    var UNSIGNED = 5;	// -127 >>> 0 === 4294967169
    /**
     * those types may escape the asm.js module
     * @type {number}
     */
    var DOUBLE = 6;	// +number === DOUBLE
    var SIGNED = 7;	// -number === SIGNED
    var FIXNUM = 8;	//
    var EXTERN = 9;	//
    /**
     * What is it, what i have to to?
     *
     * - Parameter Validator
     *   this one checks the functions arguments
     *   in the function body. is run together with the
     *   rest, but i will separate it within this code
     *   x = +x; // double
     *   x = x|0; // int
     *
     * - Return Type Validator
     *   return +x; // double
     *   return x|0; int
     *
     *
     *
     * - Statement and Expression Validator
     *
     *
     */

    var currentFunction;
    var currentFunctionStack = [];
    var statics = require("slower-static-semantics");
    var VarDeclaredNames = statics.VarDeclaredNames;
    var LexicallyDeclaredNames = statics.LexicallyDeclaredNames;
    var VarScopedDeclarations = statics.VarScopedDeclarations;
    var LexicallyScopedDeclarations = statics.LexicallyScopedDeclarations;
    var BoundNames = statics.BoundNames;

    /**
     * getTypeOfParameter can look at
     * AssignmentExpressions
     *
     * x = +x
     * x = x|0
     *
     * @param node
     * @returns {boolean}
     */

    function getTypeOfParameter(node) {
        if (isAssignmentExpressionAssign(node) &&
            isLeftAndRightSameIdentifier(node)) {
                if (isDouble(node.right)) return DOUBLE;
                if (isInt(node.right)) return INT;
            }
    }

    function isLeftAndRightSameIdentifier(node) {
        var left = node.left;
        if (!isIdentifier(left)) return false;
        var idLeft = node.left.name;
        //console.log("idLeft "+idLeft);
        var right = node.right;
        if (isBinaryExpression(right)) {
            if (!isIdentifier(right.left)) return false;
            var idRight = right.left.name;
            //console.log("idRight bin "+idRight)
            return idLeft === idRight;
        }
        else if (isUnaryExpression(right)) {
            if (!isIdentifier(right.argument)) return false;
            idRight = right.argument.name;
            //console.log("idRight unary "+idRight);
            return idLeft === idRight;
        }
        return false;
    }
    function isAssignmentExpression(node) {
        return node.type === "AssignmentExpression";
    }
    function isAssignmentExpressionAssign(node) {
        return node.type === "AssignmentExpression" && node.operator === "=";
    }
    function isUnaryExpression(node) {
        return node.type === "UnaryExpression";
    }
    function isBinaryExpression(node) {
        return node.type === "BinaryExpression";
    }
    function isIdentifier(node) {
        return node.type === "Identifier";
    }

    function isInt(node) {
        // x = x | 0 is int
        if (node.type === "AssignmentExpression") return isInt(node.right);
        return  (node.type === "BinaryExpression") && (node.operator === "|") && (node.left.type === "Identifier") && (node.right.value === "0");

    }
    function isDouble(node) {
        // x = +x; is double
        if (node.type === "AssignmentExpression") return isDouble(node.right);
        return (node.type === "UnaryExpression") && (node.operator === "+") && (node.argument.type === "Identifier");
    }

    function isSignedId(node) {
        // -x
        return node.type === "UnaryExpression" && node.operator === "-" && node.argument.type === "Identifier";
    }
    function isSignedNumeric(node) {
        // -x
        return node.type === "UnaryExpression" && node.operator === "-" && node.argument.type === "NumericLiteral";
    }

    function isVariableDeclarator(node) {
        return node.type === "VariableDeclarator";
    }

    function isNumber (node) {
        return node.type === "NumericLiteral";
    }

    function isReturnStatement(node) {
        return node.type === "ReturnStatement";
    }

    function isVariableDeclaration (node) {
        return node.type === "VariableDeclaration";
    }


    /**
     * ReturnStatement Analysis
     * Return the type of the return statement
     *
     * return +e:Expression
     * return e:Expression|0
     * return n:-NumericLiteral
     * return;
     *
     * @param node
     */
    function getTypeOfReturnStatement(node) {
        if (isReturnStatement(node)) {
            var argument = node.argument;
            if (!argument) return VOID;
            switch (argument.type) {
                case "UnaryExpression":
                    if (argument.prefix) {
                        if (argument.operator === "-" && argument.type === "NumericLiteral") return SIGNED;
                        if (argument.operator === "+") return DOUBLE;
                    }
                    break;
                case "BinaryExpression":
                    if (node.operator === "|" && node.value === "0") return INT;
                    break;
            }
        }
    }


    /**
     * Validate the VariableDeclarations
     * @param node
     * @constructor
     */
    function VariableDeclaration(node) {
        var declarations;
        if (isVariableDeclaration(node)) {
            for (var i = 0, j = declarations.length; i < j; i++) {
                var decl = declarations[i];

            }

        }
    }

    function getTypeOfVariableDeclaration(node) {
        if (isVariableDeclarator(node)) {
            if (node.init) return getTypeOfInitializer(node);
        }
    }

    function getTypeOfInitializer(node) {
        var initializer = decl.init;
        if (isInt(initializer)) return INT;
        if (isDouble(initializer)) return DOUBLE;
        if (isNumber(initalizer)) return DOUBLE;
    }

    function isValidInitializer(node) {

    }

    /**
     * Validate the FunctionDeclarations
     * @param node
     * @constructor
     */
    function FunctionDeclaration(node) {
        currentFunctionStack.push(currentFunction);
        currentFunction = {
            node: node,
            boundNamesParam: BoundNames(node.params),
            varScopedDecls: VarScopedDeclarations(node),
            varDeclaredNames: VarDeclaredNames(node),
            lexScopedDecls: LexicallyScopedDeclarations(node),
            lexDeclaredNames: LexicallyDeclaredNames(node)
        };
        /*
                go for the the body

         */

        currentFunction = currentFunctionStack.pop();
    }

    /**
     * Iterate through the parameter list
     * and memoize the BoundNames
     * (maybe just call BoundNames for)
     *
     *
     * @param node
     * @constructor
     */
    function FormalParameters(node) {
        var names = currentFunction.boundNamesParams;
        var body = node.body;
        var i = 0;
        var expr = body[0];
        do {
            var type = getTypeOfParameter(expr);
            if (type != DOUBLE && type != INT) {
                throw new TypeError("error validating parameter types");
            }
        } while ((expr = body[++i]) && (expr.type === "AssignmentExpression" || expr.type === "VariableDeclaration"));
        // walks as long as there are assignments under each.
        // but
    }


    function isFunctionDeclaration(node) {
        return node.type === "FunctionDeclaration";
    }

    function Module (node) {
        if (isFunctionDeclaration(node)) {
            var params = node.params;
            if (node.params.length === 3) {
                var stdlib = node.params[0];
                var foreign = node.params[1];
                var heap = node.params[2];
            }
        }
    }


    function validate(node) {
        var f = validator[node.type];
        if (f) return f.call(validator, node);
    }

    var valueTypes = Object.create(null);
    // may not escape
    valueTypes.VOID = VOID;
    valueTypes.INTISH = INTISH;
    valueTypes.DOUBLISH = DOUBLISH;
    valueTypes.INT = INT;
    valueTypes.UNSIGNED = UNSIGNED;
    // may escape code
    valueTypes.DOUBLE = DOUBLE;
    valueTypes.FIXNUM = FIXNUM;
    valueTypes.SIGNED = SIGNED;
    valueTypes.EXTERN = EXTERN;


    var validator = Object.create(null);
    // contains the functions like parser, tokenizer, evaluation
    validator.FunctionDeclaration = FunctionDeclaration;
    validator.VariableDeclaration = VariableDeclaration;

    function validateAST(ast, validate) {
        var result;
        switch (ast.type) {
            case "Program":
                var body = node.body;
                var len = node.body.length;
                for (var i = 0; i  < len; i++) {
                    if (!(result = validate(body[i]))) return result;
                }
            case "ExpressionStatement":
                if (!(result = validate(node.expression))) return result;
                break;
            case "AssignmentExpression":
                if (!(result = validate(node))) return result;
                break;
            case "BinaryExpression":
                if (!(result = validate(node))) return result;
                break;
            default:
                throw new SyntaxError("can not validate " + node.type);
        }
        return result;
    }
    exports.getTypeOfParameter = getTypeOfParameter;
    exports.getTypeOfReturnStatement  = getTypeOfReturnStatement;
    exports.getTypeOfVariableDeclaration = getTypeOfVariableDeclaration;

    exports.isLeftAndRightSameIdentifier = isLeftAndRightSameIdentifier;
    exports.validateAST = validateAST;
    exports.validate = validate;
    exports.validator = validator;
    exports.valueTypes = valueTypes;



});