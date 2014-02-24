
/*
############################################################################################################################################################################################################

    A Codegenerator which uses Heap Memory to Store the Data
        
############################################################################################################################################################################################################
*/

define("lib/builder", function (require, exports, module) {
    var builder = exports;

    builder.StringToByteCode = StringToByteCode;

    function ByteCodeToString(code) {
        var string = "";
        var view = new Uint16Array(code);
        for (var i = 0, j = view.length; i < j; i++) {
            string += String.fromCharCode(view[i]);
        }
        return string;
    }

    function StringToByteCode(string) {
        var code = new Float64Array(Math.ceil(string.length / 4));
        var trns = new Uint16Array(code);
        for (var i = 0, j = string.length; i < j; i++) {
            trns[i] = string.charCodeAt(i);
        }
        return code;
    }
    builder.LocToByteCode = LocToByteCode;

    function LocToByteCode(loc) {

    }

    // sizeOfLoc - 4 doubles = 32 bytes

    var sizeOfLoc = 32;

    // writeLoc (buf, ofs, loc):
    // schreibt start.line, start.column, end.* = 32 bytes (!!! big)
    // in buf ab position ofs
    // returns ofs (<=> pointer zur loc zum abspeichern)

    function writeLoc(buf, ofs, loc) {
        var line = loc.start.line;
        var column = loc.start.column;
        var endline = loc.end.line;
        var endcolumn = loc.end.colum;
        var code = new Float64Array(buf, ofs, 4);
        code[0] = DataType["loc"];
        code[1] = line;
        code[2] = column;
        code[3] = endline;
        code[4] = endcolumn;
        return ofs;
    }

    // readLoc (buf, ofs)
    // returnt typed [type==DataType["loc"], startline,startcolumn,endline,endcolumn] array von buf an position ofs

    function readLoc(buf, ofs) {
        var code = new Float64Array(buf, ofs, 1)
        return code;
    }

    //
    // writeString(buf, ofs, data[, len]) 
    // schreibt Uint16Array len oder data.length ab buf[ofs]
    // returnt ofs;

    function writeString(buf, ofs, data, len) {
        if (data === undefined) throw "writeString: no data";
        data = "" + data;
        if (len === undefined) len = data.length + 2;
        else len = len + 2;
        var array = new Uint16Array(buf, ofs, len);

        array[0] = DataType["string"];
        var char;
        for (var i = 1, j = len + 1; i < j; i++) {
            char = data[i];
            array[i] = data.charCodeAt(0);
            // Hier UTF16-Encode nutzen!!!
        }
        array[len] = 0;
        return ofs;
    }

    //
    // readString (buf, ofs, len)
    // liest bis len oder den ganzen String bis 0 
    // len = len + 2 ([0] = type, [len] = \0)
    // von buf ab pos ofs
    // returnt einen string

    // buf, ofs to string
    function readString(buf, ofs, len) {
        var array = readString(buf, ofs, len);
        return decodeStringType(array);
    }

    // buf, ofs, to array
    function readStringType(buf, ofs, len) {
        if (len !== undefined) len = len + 2;
        var array = new Uint16Array(buf, ofs, len);
        var type = buf[0];
        if (type !== DataType["string"]) throw "value is not a string";
        return array;
    }

    // array zu string
    function decodeStringType(array) {
        var string = "";
        var code;
        var i = 1;
        if (array[0] !== DataType["string"]) throw "array is not a string";
        while ((code = array[i]) != 0) {
            string += String.fromCharCode(code);
            i++;
            if (len && i === len) break;
        }
        return string;
    }

    //
    // writeNumber (buf, ofs, value) schreibt eine number 
    //

    function writeNumber(buf, ofs, value) {
        var code = new Float64Array(buf, ofs, 2);
        code[0] = DataType["number"];
        code[1] = value;
        return ofs;
    }

    //
    // readNumberType -> liest einen Typed Array
    // decodeNumberType -> returnt number value des arrays
    // readNumber -> liest von buf ofs und returnt value
    //

    function readNumberType(buf, ofs) {
        var code = new Float64Array(buf, ofs, 2);
        var type = buf[0];
        if (type !== DataType["number"]) throw "value is not a number";
        return code;
    }

    function readNumber(buf, ofs) {
        var num = readNumberType(buf, ofs);
        var value = num[1];
        return value;
    }

    function decodeNumberType(num) {
        if (num[0] !== DataType["number"]) throw "num is not a number";
        var value = num[1];
        return value;
    }

    //
    // Adding to the builder
    //

    builder.readLoc = readLoc;
    builder.writeLoc = writeLoc;
    builder.readStringType = readStringType;
    builder.decodeStringType = decodeStringType;
    builder.readString = readString;
    builder.writeString = writeString;
    builder.writeNumber = writeNumber;
    builder.readNumberType = readNumberType;

    /*
    Translating statements into ByteCode, recursivly


*/

    builder.emptyStatement = function emptyStatement(loc) {
        var ptr = allocate();
        var code = Bytecode["EmptyStatement"];
        var locinfo = LocToByteCode(loc);
    };

    builder.literal = function (type, value) {
        var bc = new Int8Array(8);
        bc[0] = encodes[type];
        return Store(hp, bc, 1);
    };

    builder.functionDeclaration = function (body, params, strict, generator, loc) {};
    builder.functionExpression = function (body, params, strict, generator, loc) {};

    builder.variableStatement = function variableStatement(kind, decls, loc) {};

    builder.callExpression = function (callee, args, loc) {};
    builder.newExpression = function (callee, args, loc) {};
    builder.objectExpression = function (properties, loc) {
        var p;
        // allocate object auf heap
        // addiere properties und values auf dem hash
        // [offs] = ptr = name + ptr to value
        // return offs von objekt mit offsets zu properties
        var obj;
        for (var i = 0, j = properties.length; i < j; i++) {
            if (p = properties[i]) {

            }
        }
        return obj;
    };
    builder.arrayExpression = function (elements, loc) {
        var arr, e;
        for (var i = 0, j = elements.length; i < j; i++) {
            if (e = elements[i]) {

            }
        }
        return arr;

    };

    builder.blockStatement = function (body, loc) {};
    builder.binaryExpression = function (left, operator, right, loc) {

    };
    builder.assignmentExpression = function (left, operator, right, loc) {

    };

    builder.pattern = function () {};
    builder.expressionStatement = function expressionStatement(expr, loc) {};
    builder.labeledStatement = function labeledStatement(label, body, loc) {};
    builder.sequenceExpression = function (seq, loc) {};
    builder.ifStatement = function ifStatement(test, condition, alternate, loc) {};
    builder.switchStatement = function (discriminant, cases, isLexical, loc) {};
    builder.whileStatement = function whileStatement(test, body, loc) {};
    builder.withStatement = function withStatement(obj, body, loc) {};
    builder.debuggerStatement = function debuggerStatement(loc) {};
    builder.tryStatement = function (block, handler, guard, finalizer, loc) {};
    builder.forInStatement = function forInStatement(left, right, body, isForEach, loc) {};
    builder.forOfStatement = function forOfStatement(left, right, body, loc) {};
    builder.forOfStatement = function forOfStatement(init, condition, update, body, loc) {};
    builder.doWhileStatement = function doWhileStatement(body, test, loc) {};
    builder.throwStatement = function (expression, loc) {};
    builder.breakStatement = function (label, loc) {};
    builder.continueStatement = function (label, loc) {};
    builder.returnStatement = function (expression, loc) {};

    return builder;
});
}