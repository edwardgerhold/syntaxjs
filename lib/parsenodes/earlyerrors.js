/*
 * Created by root on 06.03.14.
 *
   * Early Errors is now separated from the parser.
   * -------------------------------------------
   * This "visitor" performs a check on each node,
   * whether the data is valid or not.
   * What´s valid and what´s not is listed in the spec.
   *
   * If the data is invalid it throws a new SyntaxError()
   *
   * CONTAINS is the second experiment
   * ----------------------------------
   * Contains is now becoming a blacklist
   * test with
   * if (Contains[node.type][field]) throw SyntaxError;
   *
 *
 */
define("earlyerrors", function () {

    // ========================================================================================================
    // Early Errors - Attach Handler for Production as Property of EarlyErrors
    // Symbol Table, Contains, Grammar Parameters
    // ========================================================================================================

    function EarlyErrors(node) {
        var handler = EarlyErrors[node.type];
        if (handler) handler(node);
        return node;
    }
    EarlyErrors.Program = function (node) {
    };
    EarlyErrors.FunctionDeclaration = function (node) {
    };
    EarlyErrors.ModuleDeclaration = function (node) {};
    EarlyErrors.Statement = function (node) {};
    EarlyErrors.StatementList = function (node) {};
    EarlyErrors.ObjectExpression = function (node) {};
    EarlyErrors.ArrayExpression = function (node) {};
    EarlyErrors.ArrayComprehension = function (node) {};
    EarlyErrors.GeneratorComprehension = function (node) {};
    EarlyErrors.GeneratorDeclaration = function (node) {};
    EarlyErrors.ForStatement = function (node) {};
    EarlyErrors.WhileStatement = function (node) {};
    EarlyErrors.DoWhileStatement = function (node) {};
    EarlyErrors.IfStatement = function (node) {};
    EarlyErrors.SwitchStatement = function (node) {};
    EarlyErrors.VariableDeclaration = function (node) {};
    EarlyErrors.LexicalDeclaration = function (node) {};
    EarlyErrors.ClassDeclaration = function (node) {};
    EarlyErrors.BlockDeclaration = function (node) {};
    EarlyErrors.Expression = function (node) {};
    EarlyErrors.ArrowExpression = function (node) {};
    EarlyErrors.FormalParameterList = function (node) {};


    /*

        Contains is a blacklist
        which has to be called
        on each node in the parser
        when the node is returned
        to gain maximum performance.

     */


    var Contains = function (containerType, nodeType) {
        var table = Contains[containerType];
        return !!table[nodeType];
    };

    Contains.Program = {
        __proto__:null,
       "BreakStatement":true,
       "ContinueStatement": true,
       "ReturnStatement": true,
       "SuperExpression": true
    };

    Contains.FunctionDeclaration = {
	__proto__:null,
       "BreakStatement":true,
       "ContinueStatement": true
    };

    Contains.ModuleDeclaration = {
        __proto__:null,
        "BreakStatement":true,
        "ContinueStatement": true,
        "ReturnStatement": true,
        "SuperExpression": true
    };



    return {
        EarlyErrors: EarlyErrors,
        Contains: Contains
    };
});
