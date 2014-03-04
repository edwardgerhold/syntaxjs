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
*
* I´ve seen, it doesn´t work for example with "nashorn" in Java.
* For that we will have to add another curly block, to support.
*
*/


var syntaxjs = (function () {

    var syntaxjs = require("syntaxjs");

    if (syntaxjs.system === "node") {
        if (!module.parent) syntaxjs.nodeShell();
    } else if (syntaxjs.system === "browser") {
        syntaxjs.startHighlighterOnLoad();
    } else if (syntaxjs.system === "worker") {
        syntaxjs.subscribeWorker();
    }

    return syntaxjs;
}());