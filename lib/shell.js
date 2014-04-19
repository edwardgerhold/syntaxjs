
define("syntaxjs-shell", function (require, exports) {
    
    var fs, readline, rl, prefix, evaluate, startup, evaluateFile, prompt, haveClosedAllParens, shell;
    
    var defaultPrefix = "es6> ";
    var multilinePrefix = "...> ";
    var inputBuffer = "";

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
                } finally {
                    console.log(val);
                    if (continuation) setTimeout(continuation, 0);
                }
        };

        evaluateFile = function evaluateFile(file, continuation) {
            var code;
            console.log("-evaluating " + file + "-");
            try {
                code = fs.readFileSync(file, "utf8");
            } catch (err) {
                code = undefined;
                console.log(file + " not readable!");
                console.dir(err);
            }
            if (code) evaluate(code, continuation);
        };

        //
        // this is some additional hack to emulate multiline input
        //
 
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
                        evaluateFile(file, prompt);
                        return;
                    } else if (/.help/.test(code)) {
                        console.log("shell.js> available commands:");
                        console.log(".print <expression> (print the abstract syntax tree of expression)");
                        console.log(".load <file> (return file from disc as a string)");
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
            var file;
            startup();
            if (process.argv[2]) file = process.argv[2];
            if (!file) setTimeout(prompt);
            else evaluateFile(file, prompt);
            process.on("exit", function () {
                console.log("\nHave a nice day.");
                console.timeEnd("Uptime");
            });
        };

    } else shell = function () {};
    return shell;
});


