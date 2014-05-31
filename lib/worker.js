/*
 *
 *  syntax.js web worker module
 *
 *  if it´s loaded, it provides a message handler for the worker thread
 *  the file lib/app.js calls syntaxjs.registerWorker which registers a
 *  predefined message handler.
 *  You can program your own handlers and call syntax.js in
 *  But this defines some builtin commands
 *
 *  postMessage({ command: "highlight", text: sourceText });
 *  returns a text replaced with span elements (a highlighted text)
 *  you can pass [text1,text2,text3] and get each one back highlighted
 *
 *  postMessage({ command: "value", text: sourceText });
 *  returns what the toValue Function would return on evaluating sourceText
 *  postMessage({ command: "value-keepalive", text: sourceText })
 *  returns the toValue of sourceText but keeps the Environment alive
 *
 *  This "keepalive" will be replaced with the creation of realms.
 */


define("syntaxjs-worker", function (require, exports, module) {
    "use strict";

    /*

    issue: doesnt use createrealm() right now but the old interface
     */

    if (typeof importScripts === "function") {
        var highlight = require("highlight");
        var interprete = require("runtime");
        var messageHandler = function message_handler(e) {
            var html;
            var text = e.data.text;
            var command = e.data.command;
            var keepalive = false;
            switch (command) {
                case "highlight":
                    if (Array.isArray(text)) {
                        html = [];
                        for (var i = 0, j = text.length; i < j; i++) {
                            html.push(highlight(text[i]));
                        }
                    } else {
                        html = highlight(text);
                    }
                    self.postMessage(html);
                    break;

                case "value-keepalive":
                    keepalive = true;
                case "value":
                    if (Array.isArray(text)) {
                        var result = [];
                        for (var i = 0, j = text.length; i < j; i++) {
                            result.push(interprete(text[i], keepalive));
                        }
                    } else {
                        result = interprete(text, keepalive);
                    }
                    self.postMessage(result);
                    break;
                default:
                    break;
            }
        };

        var registerWorker = function registerWorker() {
            var message_handler = exports.messageHandler;
            self.addEventListener("message", messageHandler, false);
        };

        exports.messageHandler = messageHandler;
        exports.registerWorker = registerWorker;
    }
    return exports;
});
