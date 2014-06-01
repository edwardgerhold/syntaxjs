/*
 *
 *  syntax.js web worker module
 *
 * message format???
 *
 * {
 *      type: "",
 *      realm: {},
 *      data: ""
 * }
 *
 *
 *
 */


define("syntaxjs-worker", function (require, exports, module) {

    var messageHandler, registerWorker;


    if (typeof importScripts === "function") {

        var highlight = require("highlight");
        var interprete = require("runtime");

        messageHandler = function messageHandler(e) {
            var html;
            var message = e.data;

            var command = message.type;
            var code = message.code;
            var codeRealm = message.realm;

            var R, V, E;


            var keepalive = false;
            switch (command) {
                case "realm":
                    realm = syntaxjs.createRealm();

                    self.postMessage(realm);
                    break;

                case "compile":
                    if (codeRealm) realm = codeRealm;
                    var compilationUnit = realm.compile(code);


                    self.postMessage(compilationUnit);
                    break;

                case "evalbytes":
                    if (codeRealm) realm = codeRealm;
                    // else default realm
                    if (typeof code === "string" ||
                        typeof code === "object" &&
                            "type" in Code)
                      R = realm.compileAndRun(code);
                     else
                      R = realm.evalByteCode(code);

                    self.postMessage(R);

                    break;


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
        }

        registerWorker = function registerWorker(opt_handler, capture) {
            var handler = opt_handler || messageHandler;
            self.addEventListener("message", handler, !!capture);
            return function revokeListener() {
                self.removeEventListener("message", handler);
            };
        }

        exports.messageHandler = messageHandler;
        exports.registerWorker = registerWorker;

    }
    return exports;
});
