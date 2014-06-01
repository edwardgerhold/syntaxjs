/*
* automatic start (included at the end of the main script)
*/
if (syntaxjs.system === "node") {
    if (!module.parent) syntaxjs.nodeShell();
} else if (syntaxjs.system === "browser") {
    syntaxjs.startHighlighterOnLoad();
} else if (syntaxjs.system === "worker") {
    syntaxjs.registerWorker();


// this is unreliable and nothing for a good project
} else if (syntaxjs.system === "spidermonkey") {
    print("syntax.js was successfully loaded but all console/node deps may not be removed yet");
} else if (syntaxjs.system === "nashorn") {
    print("support for java coming");
}

