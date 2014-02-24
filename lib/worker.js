
define("syntaxjs-worker", function (require, exports, module) {
    "use strict";
    if (typeof importScripts === "function") {
        var highlight = require("highlight");
        var interprete = require("runtime");
        var messageHandler = function message_handler(e) {
            var html;
            var text = e.data.text;
            switch (e.data.f) {
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
            case "value":
                var result = interprete(text);
                self.postMessage(result);
                break;
            default:
                break;
            }
        };
        var subscribeWorker = function subscribeWorker() {
            var message_handler = exports.messageHandler;
            self.addEventListener("message", messageHandler, false);
        };
        exports.messageHandler = messageHandler;
        exports.start = subscribeWorker;
    }
    return exports;
});
