/**
 * Created by root on 24.04.14.
 *
 * es6> let x = 10;
 * undefined
 * es6> VM.eval("x")
 * 10
 * es6> VM.eval("12")
 * 12
 * es6> VM.eval("Object()")
 * { .. }
 */
define("vm", function (require, exports) {

    var bc = require("jvm-bytecode");
    var parse = require("parser");
    var ecma = require("api");
    var runtime = require("runtime");
    var hasConsole = typeof console === "object" && console && typeof console.log === "function";
    var hasPrint = typeof print === "function";

    var constPool = Object.create(null); // number indices
    var r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12;
    var code, ip;
    var opStack;
    var GetIdentifierReference = ecma.GetIdentifierReference;

    var getRealm = ecma.getRealm;
    var withError = ecma.withError;
    var getContext = ecma.getContext;
    var getLexEnv = ecma.getLexEnv;
    var ifAbrupt = ecma.ifAbrupt;
    var isAbrupt = ecma.isAbrupt;
    var NormalCompletion = ecma.NormalCompletion;
    var Completion = ecma.Completion;

    var CODE = Object.create(null);

    CODE.HALT = 1;      //
    CODE.ERROR = 2;     //
    CODE.TRUE = 5;      // Boolean true
    CODE.FALSE = 6;     // Boolean false
    CODE.NULL = 7;      //
    CODE.UNDEFINED = 8; //
    CODE.ID = 10;       // Identifer followed by NAME
    CODE.NUM = 11;      // A Number
    CODE.CALL = 30;     //
    CODE.RET = 31;      //
    CODE.CONST_1 = 44;  // CONST_1 n gets constantPool[n] and puts it into r1
    CODE.CONST_2 = 45;  // CONST_2 n gets constantPool[n] and puts it into r2
    CODE.CONST_3 = 46;  //
    CODE.CONST_4 = 47;  //
    CODE.STORE_1 = 51;  // STORE_1 stores the argument in r1
    CODE.STORE_2 = 52;  // STORE_2 stores it´s argument in r2;
    CODE.STORE_3 = 53;  // store in r3;
    CODE.STORE_4 = 54;  //
    CODE.ADD = 61;      // r0 = r1 + r2
    CODE.SUB = 62;      // r0 =r1 + r2
    CODE.MUL = 63;      //
    CODE.DIV = 64;      //
    CODE.MOD = 65;      //
    CODE.EXPRSTMT = 100;//
                        //
    Object.freeze(CODE);// Does this trigger optimized access, immutability?
                        //
    var operatorCode = {
        "+": CODE.ADD,
        "-": CODE.SUB,
        "*": CODE.MUL,
        "/": CODE.DIV,
        "%": CODE.MOD
    };

    function dbg() {
        if (hasConsole) {
            console.log("CODE IS NOW")
            console.dir(code);
            console.log("STACK IS NOW");
            console.dir(opStack);
        }
    }



    var evaluation = {


    };
    function evaluate() {
        var op; // should push the other way round, now the first index is the last element

        while ((op = code[--ip]) != undefined) {   // this should maybe not just loop. And be callable.
                                    // or the switch should be in an extra function, to
                                   // be callable from within. with code from this or that function                                    // fetch - decode - execute and what was the last? that isnt met yet.
                            // (it´s my first try ever to do such a thing, anyways, i think i´ll also learn it)
            switch (op) {


                case CODE.CALL:
                    var callee = code[--ip];
                    var args = code[--ip];

                    // this invokes the ast interpreter (currently)
                    var callRef = ecma.Evaluate(callee);
                    if (isAbrupt(callRef = ifAbrupt(callRef))) {
                        opStack.push(callRef);
                        return;
                    }
                    var argList = ecma.ArgumentListEvaluation(args);
                    if (isAbrupt(argList = ifAbrupt(argList))) {
                        opStack.push(argList);
                        return;
                    }

                    // LATER THIS IS ALREADY FROM THE STACK, or, no from REGISTERs.
                    var result = ecma.EvaluateCall(callRef, argList, false);
                    opStack.push(result);

                    // r0 =result;

                    if (isAbrupt(result)) return;
                    break;

                    // well done, here i have to repeat
                    // the original code.
                case CODE.NUM:
                    var value = code[--ip];  // do that with r1..rx and use new Codes.
                    opStack.push(value);
                    // r0 =value;
                    break;
                case CODE.ID:
                    var name = code[--ip];
                    var idRef = GetIdentifierReference(getLexEnv(), name, getContext().strict);
                    opStack.push(idRef);
                    // r0 =idRef;
                    if (isAbrupt(idRef)) return; // the real "return ifabrupt()" i guess
                    break;
                case CODE.EXPRSTMT:
                    continue;
                case CODE.ADD:
                    var right = code[--ip]; // Assign to Registers, to let
                    var left = code[--ip];  // the EVALUATE Fetch it from there?
                                            // that doesn´t improve, i´m wrong, eh
                    var lval = GetValue(Evaluate(left));
                    // later fetch from r0, if it´s evaluated here
                    var rval = GetValue(Evaluate(right));
                    // later fetch from r0, it it´s evaluated here
                    if (isAbrupt(lval=ifAbrupt(lval))) {
                        opStack.push(lval);
                        return;
                    }
                    if (isAbrupt(rval=ifAbrupt(rval))) {
                        opStack.push(rval);
                        return;
                    }
                    var result = ecma.getAssignmentOperationResult("+", lval, rval)
                        result=ifAbrupt(result);
                        opStack.push(result);
                        if (isAbrupt(result)) return;
                    // r0 =result;
                    break;

                default:
                    var error = withError("Type", "unsupported opcode "+op);
                    opStack.push(error);
                    return;
                    break;
            }
            if (ip == 0) return;
        }
    }



    var compile = {
        /*
            this is compilation



         */
        BinaryExpression: function (node) {
            code.push(node.left);
            code.push(node.right);
            code.push(CODE[operatorCode[node.operator]]);
        },
        AssignmentExpression: function (node) {
            code.push(node.left);
            code.push(node.right);
            code.push(CODE[operatorCode[node.operator]]);
        },
        CallExpression: function (node) {
            code.push(node.arguments);
            code.push(node.callee);
            code.push(CODE.CALL);
        },
        NumericLiteral: function (node) {
            code.push(node.value);
            code.push(CODE.NUM);
        },
        Identifier: function Identifier(node) {
            code.push(node.name);
            code.push(CODE.ID);
        },
        ExpressionStatement: function ExpressionStatement(node) {
            // code.push(CODE.EXPRSTMT)
            var f = compile[node.expression.type];
            if (f) f.call(this, node.expression);
            else return withError("Type", "unsupported compilation unit "+node.type);
        },
        Program: function Program(prg) {
            var body = prg.body;
            var node;
            // here i put them backwards onto the stack to exec the last first
            // i should do forwards to just do a ++ip instead of code[--ip] (formerly code.pop(), which makes it one way code (not useful in a function, when [[CODE]] could be replaced)
            for (var i = body.length-1, j = 0; i >= j; i--) {
                if (node = body[i]) {
                    var f = compile[node.type];
                    if (typeof f == "function") f.call(compile, node);
                    else return withError("Type","unsupported compilation unit: "+node.type)
                }
            }
        }
    };


    function CompileAndRun(realm, src) {
        try {
            var ast = parse(src);
        } catch (ex) {
            return withError("Syntax", ex.message);
        }
        code = [];
        var result = compile[ast.type](ast);
        if (isAbrupt(result)) return result;
        ip = code.length;
        opStack = [];
        evaluate();
        //var result = r0; // fetch from register 0
        result = opStack.pop();
        if (isAbrupt(result=ifAbrupt(result))) return result;
        return NormalCompletion(result);
    }
    exports.CompileAndRun = CompileAndRun;
});