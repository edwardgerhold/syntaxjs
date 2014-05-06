/**
 * asm-typechecker
 *
 * The purpose of this module is to be able analyse the javascript
 * and to provide function to analyse the heap to obtain validation results
 *
 * This file will mostly implement the asm.js Specification in sense of
 * AST analysis, and later, when more is existing bytecode analysis.
 *
 * The function here should be easy to apply on the ast to obtain true or
 * false or the resulting type of the relevant check.
 * Whenever needed it should memoize and generate static informations.
 *
 */
define("asm-typechecker", function (require, exports){
    "use strict";

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

    function isSigned(node) {
        return node.type === "UnaryExpression" && node.operator === "-" && node.argument.type === "Identifier";
    }

    function isFixnum() {
    }

    function isUnsigned () {
    }
    function isExtern () {
    }


    /**
     * Validate the VariableDeclarations
     * @param node
     * @constructor
     */
    function VariableDeclaration(node) {

    }

    /**
     * Validate the FunctionDeclarations
     * @param node
     * @constructor
     */
    function FunctionDeclaration(node) {
        currentFunctionStack.push(currentFunction);
        currentFunction = node;
        currentFunction.boundNamesParams = BoundNames(node.params);
        currentFunction.varScopedDecls = VarScopedDeclarations(node);
        currentFunction.varDeclaredNames = VarDeclaredNames(node);
        currentFunction.lexScopedDecls = LexicallyScopedDeclarations(node);
        currentFunction.lexDeclaredNames = LexicallyDeclaredNames(node);







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

        } while ((expr = body[++i]) && (expr.type === "AssignmentExpression" || expr.type === "VariableDeclaration"));
        // walks as long as there are assignments under each.
        // but
    }

    /**
     * Validate AssignmentExpressions
     * look into the BoundNames of fDecl.params
     * and if it´s a parameter
     *
     * and return the resulting type
     * or return null
     *
     * @param node
     * @constructor
     */
    function AssignmentExpression(node) {
    }

    function IfStatement(node) {
    }

    function SwitchStatement(node) {
    }

    function ExpressionStatement(node) {

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
    validator.IfStatement = IfStatement;
    validator.SwitchStatement = SwitchStatement;

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
    exports.isLeftAndRightSameIdentifier = isLeftAndRightSameIdentifier;
    exports.validateAST = validateAST;
    exports.validate = validate;
    exports.validator = validator;
    exports.valueTypes = valueTypes;



});