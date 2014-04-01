//
// This module starts a real REPL for syntax.js
// If you start node syntax0.js a simple shell starts
// The repl has been developed a lot longer
// 
var syntaxjs = require("./syntax0.js").syntaxjs;
var repl = require("repl");
var net = require("net");
function evalWithSyntaxJs(cmd, context, filename, callback) {
    var result = syntaxjs.eval(cmd, true);
    callback(null, result);
}

var port = +process.argv[2];
console.log("node repl.js [port] wil start a repl on stdin or a server with a repl on [port] (from nodejs docs)")

if (!port) {
// node repl.js starts the repl
    repl.start({
        prompt: "es6> ",
        input: process.stdin,
        output: process.stdout,
        useColors: true,
        eval: evalWithSyntaxJs
    });
} else {
// node repl.js <portnum 5001> starts the server
    net.createServer(function(socket) {
	repl.start({
    	    prompt: "es6:"+port+"> ",
            input: socket,
	    output: socket,
    	    useColors: true,
            eval: evalWithSyntaxJs
	}).on("exit", function () {
	    socket.end();
	});
    }).listen(port);
}
