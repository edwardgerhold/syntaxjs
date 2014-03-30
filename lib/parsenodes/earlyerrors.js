/*
 * Created by root on 06.03.14.
 *
   * Early Errors is now separated from the parser.
   * This "visitor" performs a check on each node,
   * whether the data is valid or not.
   * What´s valid and what´s not is listed in the spec.
   *
   * If the data is invalid it throws a new SyntaxError()
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

    // EarlyErros.Script = i am for re-defining the whole mozilla api for ES6 and making a document with, but i am not informed about
    // e.g. esprimas extensions of the AST (never seen).

    EarlyErrors.Program = function (node) {
        /*SyntaxAssert(!staticSemantics.contains("BreakStatement"), "Break is not allowed in the outer script body");
         //if (staticSemantics.contains("BreakStatement")) throw new SyntaxError("Break is not allowed in the outer script body");
         if (staticSemantics.contains("ContinueStatement")) throw new SyntaxError("Continue is not allowed in the outer script body");
         if (staticSemantics.contains("ReturnStatement")) throw new SyntaxError("Return is not allowed in the outer script body");*/
    };

    EarlyErrors.FunctionDeclaration = function (node) {
        /*if (staticSemantics.contains("BreakStatement")) throw new SyntaxError("Break is not allowed outside of iterations");
         if (staticSemantics.contains("ContinueStatement")) throw new SyntaxError("Continue is not allowed outside of iterations");
         if (staticSemantics.contains("YieldExpression")) throw new SyntaxError("Yield must be an identifier outside of generators or strict mode");
         */
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


    return {
        EarlyErrors: EarlyErrors
    };
});
