/**
 * Created by root on 24.04.14.
 *
 * es6> let x = 10;
 * undefined
 * es6> VM.eval("x")
 * 10
 * es6> VM.eval("12")
 * 12
 * es6
 */
define("vm", function (require, exports) {

    //
    //  This stub looks a bit ridiculous.
    //
    //  My idea is now, instead of doing it in the runtime.js
    //  To redo the runtime.js for creating basic blocks.
    //  
    //  I think it´s getting easier later, when i can copy and
    //  paste the algorithms and just edit them, to process the
    //  basic blocks 
    //
    //  I got this inspiration when i fell asleep this afternoon,
    //  i dreamed of writing a two new files in a new lib/stackmachine
    //  directory, one which makes the basic blocks,
    //  and one which executes them
    //
    //  and i got the idea of adding a VM.eval function to be able
    //  to call the thing from the interpreter
    //
    //  can be, that this idea is lying around until may
    //  or that i plan it for some days or 
    //  maybe it was wrong to write the stub for, but with this idea
    //  i can implement a compiler for a single command and call it
    //  from VM.eval. And so on i could continue.

    var codeStack, resultStack;
    var ecma = require("api");
    var GetIdentifierReference = ecma.GetIdentifierReference;

    var getRealm = ecma.getRealm;
    var withError = ecma.withError;
    var getContext = ecma.getContext;
    var getLexEnv = ecma.getLexEnv;
    var ifAbrupt = ecma.ifAbrupt;
    var isAbrupt = ecma.isAbrupt;
    var NormalCompletion = ecma.NormalCompletion;
    var CODE = Object.create(null);

    CODE.TRUE = 8;
    CODE.FALSE = 9;
    CODE.ID = 10;
    CODE.NUM = 7;
    CODE.CALL = 32;

    function evaluate() {
        var op;
        while (op = codeStack.pop()) {
            switch (op) {
                case CODE.CALL:
                    var callee = codeStack.pop();
                    var args = codeStack.pop();

                    // this invokes the ast interpreter
                    var callRef = ecma.Evaluate(callee);
                    if (isAbrupt(callRef = ifAbrupt(callRef))) {
                        resultStack.push(callRef);
                        return;
                    }
                    var argList = ecma.ArgumentListEvaluation(args);
                    if (isAbrupt(argList)) {
                        resultStack.push(argList);
                        return;
                    }

                    // LATER THIS IS ALREADY FROM THE STACK
                    var result = ecma.EvaluateCall(callRef, argList, false);
                    resultStack.push(result);
                    if (isAbrupt(result)) return;
                    break;

                    // well done, here i have to repeat
                    // the original code.
                case CODE.NUM:
                    var value = codeStack.pop();
                    resultStack.push(value);
                    break;
                case CODE.ID:
                    var name = codeStack.pop();
                    var idRef = GetIdentifierReference(getLexEnv(), name, getContext().strict);
                    if (isAbrupt(idRef=ifAbrupt(idRef))) return idRef;
                    resultStack.push(idRef);
                    break;
                default:
                    var error = withError("Type", "unsupported opcode");
                    resultStack.push(error);
                    return; // return if abrupt. anders
                    break;
            }
        }
    }

    var compile = {
        CallExpression: function (node) {
            codeStack.push(node.arguments);
            codeStack.push(node.callee);
            codeStack.push(CODE.CALL);
        },
        NumericLiteral: function (node) {
            codeStack.push(node.value);
            codeStack.push(CODE.NUM);
        },
        Identifier: function Identifier(node) {
            codeStack.push(node.name);
            codeStack.push(CODE.ID);
        },
        ExpressionStatement: function ExpressionStatement(node) {
            compile[node.expression.type](node.expression);
        },
        Program: function Program(prg) {
            var body = prg.body;
            var node;
            // put them backwards onto the stack to exec the last first
            for (var i = body.length-1, j = 0; i >= j; i--) {
                if (node = body[i]) {
                    var f = compile[node.type];
                    if (f) f.call(compile, node);
                    else return withError("unsupported compilation unit: "+node.type)
                }
            }
        }
    };
    var parse = require("parser");
    var hasConsole = typeof console === "object" && console && typeof console.log === "function";
    function dbg() {
        if (hasConsole) {
            console.log("CODE IS NOW")
            console.dir(codeStack);
            console.log("STACK IS NOW");
            console.dir(resultStack);
        }
    }
    function CompileAndRun(realm, code) {
        codeStack = [];
        resultStack = [];
        try {
            var ast = parse(code);
        } catch (ex) {
            return withError("Syntax", ex.message);
        }
        compile[ast.type](ast);
        evaluate();
        var result = resultStack.pop();
        if (isAbrupt(result=ifAbrupt(result))) return result;
        return NormalCompletion(result);
    }
    exports.CompileAndRun = CompileAndRun;
});