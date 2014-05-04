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
    var VOID = 1;
    var INTISH = 2;
    var DOUBLISH = 3;
    var INT = 4;
    var UNSIGNED = 5;
    /**
     * those types may escape the asm.js module
     * @type {number}
     */
    var DOUBLE = 6;
    var SIGNED = 7;
    var FIXNUM = 8;
    var EXTERN = 9;
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
     * This piece of the validator is controlling the return statements
     *      *
     * - Statement and Expression Validator
     *
     *
     */

    /**
     * is***Expression
     *
     * helps me typing less. can be inlined later.
     * or be replaced with better code.
     *
     * @param node
     * @returns {boolean}
     */
    function isAssignmentExpression(node) {
        return node.type === "AssignmentExpression";
    }

    function isBinaryExpression(node) {
        return node.type === "BinaryExression";
    }

    function isIntish(node) {
        // x = x | 0 is intish
        return node.type === "BinaryExpression" && node.operator === "|" && node.left.type === "Identifier" && node.right.value === 0;
    }

    function isDoublish(node) {
        return node.type = "UnaryExpression" && node.operator === "+" && node.argument.type === "Identifier";
    }

    function isSigned(node) {
        return node.type = "UnaryExpression" && node.operator === "-" && node.argument.type === "Identifier";
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
        var names = BoundNames(node.params);
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

    var validator = Object.create(null);
    validator.FunctionDeclaration = FunctionDeclaration;
    validator.VariableDeclaration = VariableDeclaration;
    validator.IfStatement = IfStatement;
    validator.SwitchStatement = SwitchStatement;

    function validate(node) {
        var f = validator[node.type];
        if (f) return f.call(validator, node);
    }

    exports.validator = validator;
    exports.validate = validate;


});