define("asm-parser", function (require, exports) {

    /*
        this is a parser for a minimal assembly language
        being able to do ecmascript semantics with

        label:
        opcode op1 op2 op3
        opcode op1 op2
        opcode op1
        opcode

        labels will be converted into numbers
        and registered with name like labelled Statements
        that one can reference the label from within the code


        directly creating blocks from
        without doing anything. means
        you´ve got to write valid machine
        syntax in this dsl and get a running
        js program compiled and executed from

     */


    var char, char2;
    var pos, posC, posT;
    var cp1, cp2, cu;
    var token, token2;
    var source;


    var compiler = require("asm-compiler");
    var shared = require("asm-compiler");
//    var unit = compiler.getEmptyUnit();


    function nextChar() {
        pos = pos + 1;
        char = char2;
        char2 = source[pos+1];
        return char;
    }

    function nextToken() {
        switch (char) {
            case undefined:
                return;
            default:
                throw error ("unknown character " + char);
        }
    }

    var LABEL = 0;
    var OPCODE = 1;
    var OPERAND = 2;
    var ENDOFLINE = 3;
    var END = 4;

    var labels = Object.create(null);// forgot symbol table, eh
    var registers = Object.create(null);


    var numOperands;

    function getValue(token) {

        switch(token.type) {
            case "register":   // %eax?
                break;
            case "value":   //
            case "string":
                // POOL[]
                break;
            default:
                return token.value;
        }
    }



    function parseDSL(asmSource) {

        source = asmSource;
        pos = 0;
        char = source[0];
        char2 = source[1];
        state = LABEL;

        while (token = token2) {
            token2 = nextToken();
            switch (state) {
                case LABEL:
                    if (token.type === "label") {
                        labels[token.value] = STACKTOP;
                    }
                    state = OPCODE;
                    continue;
                case OPCODE:
                    HEAP32[ptr] = +token.value;
                    STACKTOP += 4;
                    // numOperands = 2; // numberOfOperators[opcode]; don´t know my new table yet
                    state = OPERAND;
                    var i = 0;
                    while (state != ENDOFLINE) {
                        nextToken();
                        HEAP32[ptr+i] = getValue(token);    // and do registering and and transforming
                        STACKTOP += 4;
                    }
            }

            switch (token.type) {

                case OPCODE:
                    /*
                     *
                     */
                case OPERAND:
                   /*
                    *
                    */
                case OPERATOR:
                    /*
                     *   encode with code
                     */
                case LABEL:
                    /*
                     *   translate to current position
                     *   like equ $-str, where $ is this/here
                     */
                    labels.push(STACKTOP);
            }
        }
    }

    exports.parseDSL = parseDSL;

});