/*
*
* app.js
* This file starts syntax.js automatically.
* It can be left out, if you don´t like that it´s starting something.
* In our case it supports just:
*
* a) node.js
* b) browsers
* c) web workers of browsers
* d) load() but depends on node.js and console.log()
* have to implement "print()"
*
*
* @type {exports}
*/

var syntaxjs = require("syntaxjs");

if (syntaxjs.system === "node") {
    if (!module.parent) syntaxjs.nodeShell();
} else if (syntaxjs.system === "browser") {
    syntaxjs.startHighlighterOnLoad();
} else if (syntaxjs.system === "worker") {
    syntaxjs.subscribeWorker();
} else if (syntaxjs.system === "spidermonkey") {
    print("syntax.js was successfully loaded");
}
