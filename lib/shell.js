/**
 *
 * This shell is quite a stub for a shell
 *
 * It´s just a quick hack. Not a fully implemented minimalistic application
 *
 * It´s dirty.
 *
 * But it´s worth to continue developing it.
 *
 * When this happens is not clear. It serves for the most important.
 *
 * Letting me input javascript on the prompt.
 * Parsing and interpreting it.
 *
 * I can execute files with, if the shell is starting and an process.argv[2] argument is present.
 * I start with executing the file.
 * Until now the shell is landing on the prompt after executing, that i could enter and debug.
 * I think i do something crazier now.
 *
 * I allow a filenames array, to execute in order.
 * And a "--dontQuit" argument, that it goes into shellmode after executing all files.
 * And a "--collectExceptions" argument to tell, that all files shall be executed and all exceptions be reported
 * and "errorInstance.followingException" property on the thrown error. (or a shell.exceptions in the module)
 *
 */


define("syntaxjs-shell", function (require, exports) {



    var collectExceptions = false; // hmm, shell doesnt throw out anyways..hmmm,too much?
    var exceptions = [];
    var dontQuit = false;



    var fs, readline, rl, prefix, evaluate, startup,
        evaluateFile, evaluateFiles, prompt, haveClosedAllParens, shell;
    var defaultPrefix = "es6> ";
    var multilinePrefix = "...> ";
    var inputBuffer = "";
    var savedInput ="";
    var isOpenParen = {
        __proto__:null,
        "(":true,
        "{":true,
        "[":true
    };
    var isCloseParen = {
        __proto__:null,
        ")": true,
        "}": true,
        "]": true
    };
    var isRightParen = {
        __proto__: null,
        "(":")",
        "[":"]",
        "{":"}"
    };

    if (typeof process !== "undefined" && typeof module !== "undefined") {

        prefix = defaultPrefix;
        startup = function startup() {
            console.time("Uptime");
            fs = module.require("fs");
            readline = module.require("readline");
            rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
        };

        evaluate = function evaluate(code, continuation) {
                var val;
                try {
                    val = syntaxjs.eval(code, true);
                } catch (ex) {
                    val = ex.message + "\n" + ("" + ex.stack).split("\n").join("\r\n");
                    if (collectExceptions) exceptions.push(ex);
                }
                console.log(val);
                if (continuation) setTimeout(continuation, 0);
        };

        evaluateFiles = function evaluateFiles(files, continuation) {
            exceptions = [];
            var code, val;
            for (var i = 0, j = files.length; i <j ; i++) {
                var file = files[i];

                try {
                    code = fs.readFileSync(file, "utf8");
                    val = syntaxjs.eval(code, true)
                } catch (ex) {
                    if (collectExceptions) {
                        val = undefined;
                        exceptions.push(ex);
                    }
                    else {
                        val = ex.message + "\n" + ("" + ex.stack).split("\n").join("\r\n");
                    }
                } finally {
                    console.log(val);
                }
            }


            if (continuation) setTimeout(continuation, 0);
            else if (!continuation && dontQuit) setTimeout(prompt, 0);
            
            shell.exceptions = exceptions;
            exceptions = [];
        };

        evaluateFile = function evaluateFile(file, continuation) {
            var code;
            console.log("-evaluating " + file + "-");
            try {
                code = fs.readFileSync(file, "utf8");
            } catch (err) {
                if (collectExceptions) exceptions.push(ex);
                else {
                    code = undefined;
                    console.log(file + " not readable!");
                    console.dir(err);
                }
            }
            if (!continuation && dontQuit) continuation = prompt;
            if (code) evaluate(code, continuation);
        };

        //
        // this is some additional hack to emulate multiline input
        //

        haveClosedAllParens = function (code) {
            var parens = [];
            for (var i = 0, j = code.length; i < j; i++) {
                var ch = code[i];
                if (isOpenParen[ch]) {
                    parens.push(ch);
                } else if (isCloseParen[ch]) {
                    if (!parens.length) throw new SyntaxError("syntax.js shell: nesting error. stack is empty but you closed with a "+ch);
                    var p = parens.pop();
                    if (!(isRightParen[p] === ch)) {
                        throw new SyntaxError("syntax.js shell: nesting error. closing parens do not match open parens on the stack.");
                    }
                }
            }
            return parens.length === 0;
        };
        //
        // prompt is now called again, and the savedInput is prepending the new inputted code.
        //
        prompt = function prompt() {
            rl.question(prefix, function (code) {
                if (code == "") return setTimeout(prompt);
                if (code === ".break") {
                    savedInput = "";
                    prefix = defaultPrefix;
                    setTimeout(prompt);
                    return;
                }
                if (savedInput === "" && code[0] === ".") {
                    if (/^(\.print)/.test(code)) {
                        code = code.substr(7);
                        try {
                    	    console.log(JSON.stringify(syntaxjs.parse(code), null, 4));
                        } catch (ex) {
                    	    console.log(ex.message);
                    	    console.log(ex.stack);
                        }
                        setTimeout(prompt);
                        return;
                    } else if (/^(\.tokenize)/.test(code)) {
                        code = code.substr(8);
                        console.log(JSON.stringify(syntaxjs.tokenize(code), null, 4));
                        setTimeout(prompt);
                        return;
                    } else if (code === ".quit") {
                        console.log("Quitting the shell");
                        process.exit();
                        return;
                    } else if (/^(\.load\s)/.test(code)) {
                        var file = code.split(/\s/)[1]; // substr(6);
                        try {
                            evaluateFile(file, prompt);
                        } catch (ex) {

                        }
                        return;
                    } else if (/.help/.test(code)) {
                        console.log("shell.js> available commands:");
                        console.log(".print <expression> (print the abstract syntax tree of expression)");
                        console.log(".load <file> (load with node and evaluate file with the syntax interpreter)");
                        console.log(".quit (quit the shell with process.exit instead of ctrl-c)");
                        setTimeout(prompt);
                        return;
                    } 

                }
                if (savedInput) code = savedInput + code;
                try {
                    var valid = haveClosedAllParens(code);
                } catch (ex) {
            	    console.log(ex.message);
            	    console.log(ex.stack);
            	    setTimeout(prompt);
            	    return;
                }
                if (valid) {        
                    prefix = defaultPrefix;
                    savedInput = "";
                    evaluate(code, prompt);
                    return;
                } else {
                    prefix = multilinePrefix;
                    savedInput = code;  
                    setTimeout(prompt);
                    return;
                }
            });
        };
        shell = function main() {
            var files = [];
            var file;

            startup();

            for (var i = 2, j = process.argv.length; i < j; i++) {
                var par = process.argv[i];
                if (par == "--dontQuit") dontQuit = true;
                else if (par == "--collectExceptions") collectExceptions = true;
                else files.push(par);
            }
            exceptions = [];
            if (!files.length) setTimeout(prompt);
            else evaluateFiles(files, prompt); // --dontQuit means keep alive
            
            process.on("exit", function () {
                console.log("\nHave a nice day.");
                console.timeEnd("Uptime");
            });
        };
    } else shell = function () { return "the shell function is not supported on this system"; };
    return shell;
});


