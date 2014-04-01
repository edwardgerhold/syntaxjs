/*

    replaced old readline interface with repl
    
    still has some bugs until i read documentation for again
    
    and clean the other stuff up

*/


define("syntaxjs-shell", function (require, exports) {
        
    var fs, repl, r, prefix, evaluate, startup, evaluateFile, prompt, haveClosedAllParens, shell;
    var realm, file; 
    
    var defaultPrefix = "es6> ";
    var multilinePrefix = "...> ";
    var inputBuffer = "";

    if (typeof process !== "undefined" && typeof module !== "undefined") {

        prefix = defaultPrefix;

        startup = function startup() {
	    realm = syntaxjs.createRealm();
	    if (process.argv[2]) file = process.argv[2];
            console.time("Uptime");
            fs = module.require("fs");
            r = repl =module.require("repl");
            repl.start({
                input: process.stdin,
                output: process.stdout,
                prompt: prefix,
                useColors: true,
                eval: evaluate,
                ignoreUndefined: true
            });
            if (file !== undefined) {
		process.stdin.emit("data", "\n");
	    }
        };

	evaluate = function(code, context, filename, callback) {
		
		if (file !== undefined) {
		    var f = file;
		    file = undefined;
		    try {
			var r = realm.evalFile(f);
		    } catch (ex) {
			callback(ex);
		    }
		    callback(null, r);
		    return;
		}

                if (code === ".break") {
                    savedInput = "";
                    prefix = defaultPrefix;
                    r.prompt = prefix;
                    callback(null);
                    return;
                }

                if (savedInput === "" && code[0] === ".") {

                    if (/^(\.print)/.test(code)) {
                        code = code.substr(7);
                        console.log(JSON.stringify(syntaxjs.createAst(code), null, 4));
                        callback(null);
                        return;
                    } else if (/^(\.tokenize)/.test(code)) {
                        code = code.substr(8);
                        console.log(JSON.stringify(syntaxjs.tokenize(code), null, 4));
                        callback(null);
                        return;
                    } else if (code === ".quit") {
                        console.log("Quitting the shell");
                        process.exit();
                        return;
                    } else if (/^(\.load\s)/.test(code)) {
                        file = code.substr(6);
                        try {
                        var r = realm.evalFile(file);
                        } catch (ex) {
                    	    callback(ex, null);
                    	    return;
                        }
                        callback(null, r);
                        return;
                    } else if (/.help/.test(code)) {
                        console.log("shell.js> available commands:");
                        console.log(".print <expression> (print the abstract syntax tree of expression)");
                        console.log(".tokens <expression> (print the result of the standalone tokenizer)");
                        console.log(".load <file> (load and evaluate a .js file)");
                        console.log(".quit (quit the shell with process.exit instead of ctrl-c)");
			callback(null);
                        return;
                    } 

                } 

                if (savedInput) code = savedInput + code;
                if (haveClosedAllParens(code)) {        
                    prefix = defaultPrefix;
                    repl.prompt = prefix;
                    savedInput = "";
		    var val;
    	    	    try {
                	val = realm.eval(code, true);
            	    } catch (ex) {
	                callback(ex);
	                return;
            	    } finally {
                	callback(null, val);
            	    }
            	    return;
                } else {
                    console.log("multiline");
                    prefix = multilinePrefix;
            	    repl.prompt = prefix;
                    savedInput = code;  
		    callback(null);
                    return;
                }
                    
        };
 
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
                    if (!parens.length) throw new SyntaxError("syntaxjshell: preflight: nesting error. stack is empty but you closed some paren.");
                    var p = parens.pop();
                    if (!(isRightParen[p] === ch)) {
                        throw new SyntaxError("syntaxjshell: preflight: nesting error. closing paren does not match stack.");
                    }
                }
            }
            return parens.length === 0;
        }
        
        shell = function main() {
        
            startup();

            process.on("exit", function () {
                console.log("\nHave a nice day.");
                console.timeEnd("Uptime");
            });
        };

    } else shell = function () {}
    return shell;
});


