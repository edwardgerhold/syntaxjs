
var syntaxjs = require("syntaxjs");
if (syntaxjs.system === "node") {
    if (!module.parent) syntaxjs.nodeShell();
} else if (syntaxjs.system === "browser") {
    syntaxjs.startHighlighterOnLoad();
} else if (syntaxjs.system === "worker") {
    syntaxjs.subscribeWorker();
}