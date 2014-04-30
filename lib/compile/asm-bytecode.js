/**
 * Created by root on 30.04.14.
 */
define("asm.js-bytecode", function (require, exports) {

    "use strict";

    // research:
    // - i have printed LLVM compiler docs since last year, because of emscripten and for my native c++ engines parts
    // but i need to study emscripten more.
    // and not later when i program c++, now, what´s going into the typed array,
    // i´ll write my own heap with own code, but should take the bytecode to make
    // that thing runnable with asm.js interpreters and thank emscripten or kripken
    // for helping me out of the slow-mo-interpreter-on-interpreter squared corner

    exports.NULL = 0;

    /*
        placeholder

        This one needs research. I don´t want to steal ASM JS concepts.
         No, i would like to put this code, as far as possible into ASM JS engines.
         That could bring this engine up to native performance, or? If it´s possible.
         But if Games can be compiled to, this js-runtime should be, too. It´s not a
         225 MB JS file, just a few hundred kb.

         But for that. I´m sorry, i´d started with LLVM already in November/December,
         but dropped, when the whole project suffered from a hack day´s hours-no-tests
         march through a lot of functions, after that, it didn´t run anymore like before,
         but increased by almost a third. I spent a month with doing nothing and one with
         Java until i fixed all together in the last month. No, not All. Strict mode fails.
         I HAD strict mode before. I changed the Call Semantics like the draft changed it.
         I guess, if i implement the latest, i will automatically get strict mode back, coz
         the parser has it correct and the runtime has the flag on the context and i´m firm
         with. But i didn´t see the exchange or misinterpretation of a rule in the current code,
         when i looked at last time. (I think i tried to fix it once until today, so many other
         bugs, like not thrown syntax errors came between).

         For emscripten bytecode. and i should check it out BEFORE i take the JVM bytecode and
         transform it with giving creds into an own learned-from-java bytecode, and try to write
         a learned-from-emscripten-bytecode. Please support my idea and expect it to work, hehe.
         I do it for free then, and please say, i can do it without bugs. (And anyone thinking of
         the opposite, failures and not working, get´s it denied by contract, hehe)


         for hours only (transfer when you find)

     */

    return Object.freeze(exports);
});