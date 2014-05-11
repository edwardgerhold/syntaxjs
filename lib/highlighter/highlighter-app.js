/*



 The Highlighter

 The Reason for the tokenizer to be separate

 It was running for a long time on my homepage for fun

 Later i continued this weak highlighter with the draft

 Now i have much bad code mixed with seriously engineered code.



 My Tip:

 Kick this highlighter.

 bad:    It has just tokens.

 so:    Get the parse tree.
 (And with a token list)


 plus:    Get the AST information by
 getting a node id and setting
 it on the span element.

 and:    Evaluate in an own realm per
 PRE Element.
 Btw. HTML Designer prolly and
 rather use -pre with code inside-,
 i should change this, too.



 Kick it for the following reason:

 make the tokenizer a part of the parser

 (just a few changes, to get
 rid of "next" working on an array
 and an expensiver "righthand" function
 doing a lookahead scan to the
 right, then letting last lookat(1) fall
 back to 0 by assignment
 and get the next token.)


 */




if (typeof window != "undefined") {





    define("highlight-gui", function (require, exports) {
        "use strict";
        

        /*
            maybe i should go soon with jquery.
         */
        /*
            that means ie + mobile + effects for free.
            and future for the code.
         */
        
        
        var tables = require("tables");
        var tokenize = require("tokenizer").tokenizeIntoArrayWithWhiteSpaces;
        var parse = require("parser");
        var Evaluate = require("runtime");
        var highlight = require("highlight").highlight;

        var lang = "de_DE";

        var hlIntl = require("annotations."+lang);

        var Builtins = tables.Builtins;
        var Punctuators = tables.Punctuators;
        var WhiteSpaces = tables.WhiteSpaces;
        var TypeOfToken = tables.TypeOfToken;
        var Keywords = tables.Keywords;

        var ClassNames = {
            __proto__: null,
            /* Elements */
            "wrapper": "syntaxjs-container",
            "buttons": "syntaxjs-button-container",
            "mainview": "syntaxjs-view",
            "token": "syntaxjs-tokens-button",
            "editorview": "syntaxjs-editor",
            "info": "syntaxjs-fileinformations",
            "console": "syntaxjs-eval-console",
            /* Buttons */
            "eval": "syntaxjs-native-eval-button",
            "original": "syntaxjs-originaltext-button",
            "linecount": "syntaxjs-lineno-button",
            "line": "syntaxjs-lineno",
            "editor": "syntaxjs-editor-button",
            "wordcount": "syntaxjs-wordcount-button",
            "wordcount-list": "syntaxjs-wordcountlist",
            "wordcount-panel": "syntaxjs-wordcount-panel",
            "wordcount-table": "syntaxjs-wordcount-table",
            "minify": "syntaxjs-minify-button",
            "tokens": "syntaxjs-tokens-button",
            "highlight": "syntaxjs-highlight-button",
            "ast": "syntaxjs-ast-button",
            "value": "syntaxjs-eval-button",
            "source": "syntaxjs-generator-button",
            "ss": "ss",
            "beauty": "syntaxjs-beautyfier-button",
            "shell-input": "syntaxjs-shell-input",
            "shell": "syntaxjs-shell-button",
            "language": "syntaxjs-language-button"

        };

        var DataAttributes = {
            "id": "data-syntaxjs",
            "highlight": "data-syntaxjs-highlight",
            "controls": "data-syntaxjs-controls",
            "language": "data-syntaxjs-language",
            "shell": "data-syntaxjs-shell"
        };
        var Duties = {
            "true": true,
            "yes": true,
            "y": true,
            "yo": true,
            "yep": true,
            "1": true

        };
        var OffDuties = {
            "false": true,
            "off": true,
            "no": true,
            "nay": true,
            "nope": true,
            "none": true,
            "0": true
        };

        /* the above should move into an external package, too, to become highly configurable. */

        /* and then i should rewrite the highlighter with a library to let it become attractive */

        var buttonNames;
        var annotationDiv;
        var classAnnotations;

        var annotations = Object.create(null);


        classAnnotations = hlIntl.classAnnotations;
        buttonNames = hlIntl.buttonNames
        annotations = hlIntl.annotations;


        var development_version = "<br><sub>ohne Gew&auml;hr</sub>";
        var clas = /syntaxjs-/;
        annotationDiv = document.createElement("div");
        annotationDiv.className = "syntaxjs-annotation";


        var ClassTests = {};        
        for (var k in ClassNames) {
            ClassTests[k] = true;
        }
        var NoOvers = {};
        NoOvers[ClassNames["info"]] = true;

        function addEventListener(element, type, func, capture) {
            if (typeof element.attachEvent === "function" && typeof element.addEventListener !== "function") {
                if (type == "DOMContentLoaded") type = "load";
                return element.attachEvent("on" + type, func);
            } else return element.addEventListener(type, func, capture);
        }
        function createRecord(element, options) {
            var rec = Object.create(null);
            if (element) {
                rec.element = element;
                rec.input = element.textContent;
                rec.options = options;
            }
            return rec;
        }
        function setRecord(rec, data) {
            if (typeof data == "object") assign(rec, data);
            return null;
        }
        function assign(obj, obj2) {
            for (var k in obj2)
                if (Object.hasOwnProperty.call(obj2, k))
                    obj[k] = obj2[k];
            return obj;
        }
        function setAnnotation(newAnnotation) {
            annotations = newAnnotation;
        }
        function getAnnotation() {
            return annotations;
        }
        function make_console_element(rec) {
            var element = rec.element;
            var consoleElement = document.createElement("div");
            consoleElement.className = ClassNames["console"];
            consoleElement.innerHTML = "<br>\n";
            element.parentNode.insertBefore(consoleElement, element.nextSibling);
            rec.consoleElement = consoleElement;
            return consoleElement;
        }
        function make_button(rec, cname, bname, clickhndlr, nopushbool) {
            var button = document.createElement("button");
            button.className = ClassNames[cname];
            button.innerHTML = buttonNames[bname];
            addEventListener(button, "click", clickhndlr);
            if (nopushbool) return button;
            return pushButton(rec, button)
        }
        /* append all buttons to the container element */
        function appendButtons(rec, element) {
            var buttons = rec.buttons;
            element = element || rec.wrapper;
            if (!rec || !element || !buttons) return; // fails silent
            var buttonContainer = rec.buttonContainer = document.createElement("div");
            buttonContainer.className = ClassNames["buttons"];
            for (var i = 0, j = buttons.length; i < j; i++) {
                if (buttons[i]) buttonContainer.appendChild(buttons[i]);
            }
            element.appendChild(buttonContainer);
        }
        /* remove all the buttons from the container */
        function removeButtons(rec, element) {
            var buttons = rec.buttons;
            element = element || rec.wrapper;
            if (!rec || !element || !buttons) return;
            for (var i = 0, j = buttons.length; i < j; i++) {
                if (buttons[i].parentNode) buttons[i].parentNode.removeChild(buttons[i]);
            }
        }
        // This function stores the buttons under each id.
        function pushButton(rec, button) {
            if (!rec.buttons) rec.buttons = [];
            rec.buttons.push(button);
            return button;
        }
        // CreateFeaturing Elements
        var registered_annotation = false;
        var globalControlsAttribute = document.documentElement.getAttribute(DataAttributes["controls"]);
        var globalControls = globalControlsAttribute !== undefined ? Duties[globalControlsAttribute] : false;
        function highlightElements(options) {

            var elements;
            var element, rec, hl, ctrl;
            var controls;
            var annotate;
            var att1, att2;
            var opts;
            var name;

            if (options === undefined) {
                options = defaultOptions();
            }
            if (!registered_annotation) {
                registered_annotation = true;
                addEventListener(window, "mouseover", annotateCode, false);
                addEventListener(window, "touchmove", annotateCode, false);
                addEventListener(window, "mouseout", annotateCode, false);
                addEventListener(window, "touchcancel", annotateCode, false);
            }

            for (var tag in options) {

                if (Object.hasOwnProperty.call(options, tag)) {

                    if (typeof tag === "string") {

                        if (elements = document.querySelectorAll(tag)) {

                            opts = options[tag];

                            if (opts) {
                                controls =  opts.controls !== undefined ? opts.controls : false;
                                annotate =  opts.annotate !== undefined ? opts.annotate : true;
                            } else {
                                controls = false;
                            }

                            for (var a = 0, b = elements.length; a < b; a++) {

                                if (element = elements[a]) {

                                    name = element.tagName;
                                    att1 = element.getAttribute(DataAttributes["highlight"]);
                                    att2 = element.getAttribute(DataAttributes["controls"]);

                                    hl = true;

                                    if (OffDuties[att1]) hl = false;
                                    else if (Duties[att1]) hl = true;

                                    ctrl = globalControls;

                                    if (Duties[att2]) ctrl = true;
                                    else if (OffDuties[att2]) ctrl = false;

                                    rec = createRecord(element, opts);
                                    if (controls && ctrl) createFeaturingElements(rec);

                                    if (hl) highlight(null, null, rec);
                                    rec = null;
                                }
                            }
                        }
                    }
                }
            }
        }
        // live Editor -
        // the first bug i got to was when replacing innerHTML with the highlighted text
        function createFeaturingElements(rec) {
            setTimeout(function () {
                createWrapper(rec);
                createNativeEvalButton(rec);
                createOriginalTextButton(rec);
                createShowLinesButton(rec);
                createEditorButton(rec);
                createWordCountButton(rec);
                createMinifyingButton(rec);
                createShowTokensButton(rec);
                createHighlightButton(rec);
                createShellButton(rec);
                createAstButton(rec);
                createEvaluateButton(rec);
                createFileInformations(rec);
                appendButtons(rec);
            },0);
            return rec;
        }
        //
        // CreateWrapper wraps the original pre with some elements,
        // to contain the buttons, console, second view, (maybe tabs soon)  and more
        //
        function createWrapper(rec) {
            var element = rec.element;
            var wrapper = rec.wrapper = document.createElement("div");
            var view = rec.view = document.createElement("div");
            wrapper.className = ClassNames["wrapper"];
            view.className = ClassNames["mainview"];
            if (element) {
                if (element.parentNode) element.parentNode.replaceChild(wrapper, element);
                wrapper.appendChild(view);
                view.appendChild(element);
            }
            return wrapper;
        }
        function createEditorButton(rec) {

            var element = rec.element;
            var wrapper = rec.wrapper;
            var view = rec.view;
            var editor, pre;
            var alledit;
            var timeout;
            var cursor, x, y, rect;
            var sel, newsel;
            var range, newrange;

            function createEditor() {
                /* Disabled highlighting until i fix the cursor */
                rec.editor = editor = document.createElement("pre");
                editor.className = ClassNames["editorview"];
                editor.contentEditable = "true";
                editor.innerHTML = rec.highlightedText || rec.input;
                // editor.innerHTML = highlight(null, null, rec);
                editor.hidden = false;
                if (editor.scrollIntoView) editor.scrollIntoView();

                function update() {
                    var text = "" + (editor.textContent || editor.innerText);
                    var ast;
                    rec.input = text;
                    rec.tokens = tokenize(text);
                    rec.ast = parse(rec.tokens);
                    ast = rec.astText = highlight(JSON.stringify(rec.ast, null, 4));
                    /* editor.innerHTML = highlight(text, null, rec); */
                    element.innerHTML = ast;
                    if (editor.scrollIntoView) editor.scrollIntoView();
                    /*
                     this was from mozilla
                     newsel  = window.getSelection();
                     newrange = newsel.getRangeAt(0);
                     newrange.setStart(range.startContainer, range.startOffset);
                     newrange.setEnd(range.endContainer, range.endOffset);*/
                    // cursor.moveToPoint(e.pageX, e.pageY);
                }
                addEventListener(editor, "keyup", function (e) {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    // sel = window.getSelection() || document.selection;
                    // range = sel.getRangeAt(0);
                    // if (e.char == "\t") e.preventDefault();
                    timeout = setTimeout(update, 250);
                }, false);
                view.insertBefore(editor, element);
                element.innerHTML = highlight(JSON.stringify(rec.ast || parse(rec.tokens), null, 4));
            }
            return make_button(rec, "editor", "editor", function (e) {
                if (!editor) createEditor();
                else editor.hidden = !editor.hidden;
            });
        }
        // FileInformations are "Filesize: __ bytes, __ LOC, Format: (unimpl.)" on the bottom
        // special: the span with the infos is added to the buttons array which contains all other widgets (buttons)
        function createFileInformations(rec) {
            /* Mache was hover-touch-ables raus, was hochpopt wenn ich beruehre */
            var span = document.createElement("span");
            span.className = ClassNames["info"];
            var html = "Filesize: " + (rec.input || "").length + " bytes, ";
            html += (rec.input || "").split("\n").length + " LOC, ";
            span.innerHTML = html;
            rec.buttons.push(span);
        }
        // This buttons lets you return to the highlighted text
        function createHighlightButton(rec) {
            var element = rec.element;
            return make_button(rec, "highlight", "highlight", function (e) {
                if (!rec.highlightedText) {
                    rec.highlightedText = highlight(element.textContent);
                }
                element.innerHTML = rec.highlightedText;
                if (element.scrollIntoView) element.scrollIntoView();
            });
        }
        // This button uses the nativejs eval function coz i havent coded a AST.Evaluate() yet.
        function createNativeEvalButton(rec) {
            var element = rec.element;
            return make_button(rec, "eval", "eval", function (e) {
                var consoleElement = rec.consoleElement;
                if (!consoleElement) consoleElement = make_console_element(rec);
                var code = rec.input;
                var value;
                try {
                    value = eval(code);
                } catch (ex) {
                    value = "" + ex.message + "<br>\n" + ("" + ex.stack).split("\n").join("<br>\n");
                } finally {
                    consoleElement.innerHTML += value += "<br>\n";
                }
            });
        }
        // Finally i call Evaluate (i am proud not to be as stupid as my CV is)
        function createEvaluateButton(rec) {

            var element = rec.element;
            var consoleElement;
            return make_button(rec, "value", "value", function (e) {
                consoleElement = rec.consoleElement;
                if (!consoleElement) {
                    consoleElement = make_console_element(rec);
                }
                var code = rec.input;
                var value;
                try {
                    value = Evaluate(code);
                } catch (ex) {
                    value = "" + ex.message + "<br>\n" + ("" + ex.stack).split("\n").join("<br>\n");
                } finally {
                    consoleElement.innerHTML += (value + "<br>\n");
                }
            });
        }
        //
        // count_word adds 1 to the existing wordcount_obj[word] or creates a new entry [word] set to 1 on the wordcount_obj.
        //
        function count_word(word, wordcount_obj) {
            wordcount_obj[word] = typeof wordcount_obj[word] === "number" ? wordcount_obj[word] + 1 : 1;
        }
        /// Array.prototype.sort(sort_alpha) sortiert Worte.
        function sort_alpha(w1, w2) {
            var i, b1, b2;
            i = -1;
            do {
                i += 1;
                b1 = w1[i];
                b2 = w2[i];
                if (b1 < b2) return false;
                else if (b1 > b2) return true;
            } while (b1 === b2);
        }
        //
        // The wordcount buttons shows a label with some informations about the tokens (counters)
        // Has to be improved with cooler statistics.
        //
        function total(v) {
            return "<p>Total: <b>" + v + "</b></p>\n";
        }
        function ol() {
            return "<ol class=" + ClassNames["wordcount-list"] + ">";
        }
        function li(s, p) {
            return "<li>" + s + "x " + p + "\n";
        }
        function createWordCountButton(rec) {

            var flag = false;
            var panel = document.createElement("div");
            panel.className = ClassNames["wordcount-panel"];
            var calculated = false;
            var wordcount;

            var HighlighterWordCounterLabel = {
                "LineComment": "//comments",
                "MultiLineComment": "/*comments*/",
                "RegularExpressionLiteral": "/regex/",
                "StringLiteral": "'strings'",
                "TemplateLiteral": "`templates`"
            };

            function calculate() {

                wordcount = rec.wordcount = Object.create(null);
                var tokens = rec.tokens;
                var token, word, type;
                for (var i = 0, j = tokens.length; i < j; i++) {
                    word = tokens[i].value;
                    type = tokens[i].type;
                    count_word(HighlighterWordCounterLabel[type] || word, wordcount);
                }

                var html = "";
                // Aufgabe ol(array, verifier): gibt html liste aus
                var builtinlist = ol();
                var keywordlist = ol();
                var operatorlist = ol();
                var identifierlist = ol();
                var len = 0,
                    keywordc = 0,
                    operatorc = 0,
                    builtinc = 0,
                    identifierc = 0;
                Object.keys(wordcount).sort(sort_alpha).forEach(function (p) {
                    // for (p in wordcount) {
                    if (!WhiteSpaces[p]) { // hey, that is a create null so skip : && Object.hasOwnProperty.call(wordcount, p)) {
                        ++len;
                        if (Keywords[p]) {
                            keywordlist += li(wordcount[p], p);
                            ++keywordc;
                        } else if (Punctuators[p]) {
                            ++operatorc;
                            operatorlist += li(wordcount[p], p);
                        } else if (Builtins[p]) {
                            ++builtinc;
                            builtinlist += li(wordcount[p], p);
                        } else {
                            ++identifierc;
                            identifierlist += li(wordcount[p], p);
                        }
                    }
                    // }
                });
                // Aufgabe: supplant(template, data) Funktion um das zum Template zu machen
                builtinlist += "</ol>\n";
                keywordlist += "</ol>\n";
                operatorlist += "</ol>\n";
                identifierlist += "</ol>\n";
                html = "<table class='" + ClassNames["wordcount-table"] + "'>";
                html += "<thead><tr><th>builtins<th>keywords<th>operators<th>eigene identifier</tr></thead>";
                html += "<tbody><tr>";
                html += "<td>" + builtinlist;
                html += total(builtinc);
                html += "<td>" + keywordlist;
                html += total(keywordc);
                html += "<td>" + operatorlist;
                html += total(operatorc);
                html += "<td>" + identifierlist;
                html += total(identifierc);
                html += "</tbody>";
                html += "</table>";
                html += panel.innerHTML = html;
                calculated = true;
            }
            addEventListener(panel, "click", function (e) {
                flag = false;
                panel.parentNode.removeChild(panel);
            }, false);
            return make_button(rec, "wordcount", "wordcount", function (e) {
                e = e || event;
                var diviation;
                e.target || (e.target = e.srcElement);
                if (!flag) {
                    if (!calculated) calculate();

                    panel.style.position = "absolute";
                    panel.style.zIndex = "10000";
                    panel.style.top = (e.target.offsetTop - (2 * panel.clientHeight)) + "px";
                    diviation = e.target.offsetLeft + panel.clientWidth - e.target.offsetParent.clientWidth;
                    panel.style.left = (e.target.offsetLeft - (panel.clientWidth / 3) - (diviation > 0 ? diviation : 0)) + "px";
                    e.target.offsetParent.appendChild(panel);
                } else {
                    e.target.offsetParent.removeChild(panel);
                }
                flag = !flag;
            });
        }
        // fillnum(9, 3) returns "009" (fill "9" with 0s to a width of 3)
        function fillnum(n, w) {
            var s = "";
            var l = ("" + n).length;
            for (var i = 0; i < (w - l); i++) {
                s += " ";
            }
            s += n;
            return s;
        }
        //
        // This adds a line count by splitting the text into lines and adding a span in front of each
        //
        function createShowLinesButton(rec) {

            var element = rec.element;
            var oldtext, newtext, flag = false;
            var i, j;
            return make_button(rec, "linecount", "linecount", function (e) {
                if (!flag) {
                    oldtext = "" + element.innerHTML;
                    newtext = oldtext.split("\n");
                    for (i = 0, j = newtext.length; i < j; i++) {
                        newtext[i] = "<span class=" + ClassNames["line"] + " data-syntaxjs-line='" + (i + 1) + "'>" + fillnum(i + 1, ("" + j).length) + "</span>" + newtext[i];
                    }
                    newtext = newtext.join("\n");
                    element.innerHTML = newtext;
                } else {
                    element.innerHTML = oldtext;
                }
                flag = !flag;
                if (element.scrollIntoView) element.scrollIntoView();
            });
        }
        //
        // This is a minifier, which bases on the Tokens-Array
        //
        function minify(text) {
            var tokens;
            if (typeof text === "string") {
                tokens = tokenize(text);
            } else if (Array.isArray(text)) {
                tokens = text;
            } else throw new Error("Expected text or tokens");
            var el, peek;
            for (var i = 0, j = tokens.length; i < j; i++) {
                el = tokens[i];
                if (i < j - 1) peek = tokens[i + 1];
                else peek = "";
                if (!(/\s/.test(el.value[0]) || /Comment/.test(el.type))) text += el;
                if (/Keyword/.test(el.type) && !/Punctuator/.test(peek.type)) text += " ";
            }
            return text;
        }
        //
        // This function minifies the highlighted spans by testing for the classname
        //
        function minifySpans(rec) {

            var tokens = rec.highlightedTokens;
            var text = "";
            var el, peek;
            for (var i = 0, j = tokens.length; i < j; i++) {
                el = tokens[i];
                if (i < j - 1) peek = tokens[i + 1];
                else peek = "";
                if (!/\s/.test(el.value[0]) && !/Comment/.test(el.type)) text += el.value;
                if (/Keyword/.test(el.type) && !/Punctuator/.test(peek.type)) text += " ";
            }
            return text;
        }
        //
        // The minifier Button
        //
        function createMinifyingButton(rec) {
            var element = rec.element;
            var oldtext, newtext, flag = false;
            return make_button(rec, "minify", "minify", function (e) {
                if (!rec.minifiedText) {
                    rec.minifiedText = minifySpans(rec);
                }
                element.innerHTML = rec.minifiedText;
                if (element.scrollIntoView) element.scrollIntoView();
            });
        }
        //
        // Show original content of the Element
        //
        function createOriginalTextButton(rec) {
            var element = rec.element;
            return make_button(rec, "original", "original",
                function (e) {
                    element.innerHTML = rec.originalText;
                    if (element.scrollIntoView) element.scrollIntoView();
                });
        }
        // ununused
        function createToSourceButton(rec) {
            var source;
            var element = rec.element;
            return make_button(rec, "source", "source", function (e) {
                if (!source) {
                    try {
                        source = JSON.stringify(require("js-codegen")(rec.ast), null, 4);
                    } catch (ex) {
                        source = JSON.stringify(ex, null, 4);
                    }
                }
                element.innerHTML = source;
                if (element.scrollIntoView) element.scrollIntoView();
            });
        }
        //
        // Pressing this button displays the AST
        //
        function createAstButton(rec) {
            var ast;
            var element = rec.element;
            var oldtext, newtext, flag = false;
            return make_button(rec, "ast", "ast", function (e) {
                // if (!rec.astText || rec.editor) {
                try {
                    rec.ast = parse(rec.tokens || tokenize(rec.input));
                    // rec.ast = parse(rec.input, true);
                } catch (ex) {
                    rec.ast = ex;
                }
                rec.astText = highlight(JSON.stringify(rec.ast, null, 4));
                //  }

                element.style.maxHeight = window.height;
                element.style.overflow = "auto";

                element.innerHTML = rec.astText;
                //      element.appendChild(sourceButton);
                if (element.scrollIntoView) element.scrollIntoView();
            });
        }
        //
        // This Buttons shows the Tokens-Array
        // filterWhiteSpace used before displaying
        //
        function filterWhiteSpace(tokens) {
            return tokens.filter(function (token) {
                return token.type !== "WhiteSpace";
            });
        }
        function createShowTokensButton(rec) {
            var element = rec.element;
            var newtext;
            return make_button(rec, "token", "token", function (e) {
                newtext = rec.tokensText = highlight(JSON.stringify(filterWhiteSpace(rec.tokens), null, 4));
                element.innerHTML = newtext;
            });
        }
        function createBeautyfierButton(rec) {
            var element = rec.element;
            return make_button(rec, "beauty", "beauty", function (e) {
                element.innerHTML = highlight(beautify(rec.tokens));
            });
        }
        function createShellButton(rec) {
            var element = rec.element;
            var wrapper = rec.wrapper;
            var view = rec.view;
            var input;
            var code;
            var consoleElement;
            var val;
            var realm = rec.realm;

            function enter(e) {
                if (e.keyCode === 13) {
                    code = input.value;
                    if (code === ".clear") {
                        consoleElement.innerHTML = "-cleared console-<br>\n";
                    } else if (code === ".quit") {
                        consoleElement += "Quitting the Shell...";
                        input.parentNode.removeChild(input);
                        input = null;
                        realm = null;
                    } else {
                        if (!realm) {
                            realm = syntaxjs.createRealm();
                        }
                        try {
                            val = realm.eval(code);
                        } catch (ex) {
                            val = ex.message + "<br>\n" + ("" + ex.stack).split("\n").join("<br>n");
                        } finally {
                            consoleElement.innerHTML += val + "<br>\n";
                            input.value = "";
                        }
                    }
                }
            }

            return make_button(rec, "shell", "shell", function (e) {
                consoleElement = rec.consoleElement;
                if (!consoleElement) consoleElement = make_console_element(rec);
                if (!input) {
                    input = document.createElement("input");
                    input.type = "text";
                    input.className = ClassNames["shell-input"];
                    consoleElement.parentNode.insertBefore(input, consoleElement);
                    addEventListener(input, "keyup", enter);
                }

                var code = rec.ast || rec.tokens;
                try {
                    val = syntaxjs.eval(code, true, true);
                } catch (ex) {
                    val = ex.message + "<br>\n" + ("" + ex.stack).split("\n").join("<br>n");
                } finally {
                    consoleElement.innerHTML += "re-initialized code<br><br>\n" + val + "<br>\n";
                    if (consoleElement.scrollToBottom) consoleElement.scrollToBottom();
                    input.value = "";
                }

            });
        }
        /* War das 1. Feature */
        function annotateCode(e) {
            var key, str, html, target, className;
            e = e || window.event; // wack browser programmer i am
            target = e.target || e.srcElement;
            className = target.className;

            if (target.tagName === "SPAN" && clas.test(className) && !NoOvers[className]) {
                if (e.type === "mouseout" && annotationDiv.parentNode) annotationDiv.parentNode.removeChild(annotationDiv);
                if (e.type === "mouseover") {
                    key = target.innerText || target.textContent || target.innerHTML;
                    html = "";
                    // 1. Zeile key ist ein
                    if (str = TypeOfToken[key]) { // mal ausprobieren.
                        html += key + " ist ein " + str + "<br>\n";
                        /* ungeeignet genauer
                         if (str = PunctToExprName[key]) {
                         html += str + "<br>\n";
                         }
                         */
                    }
                    // 2. Zeile annotation
                    if ((str = annotations[key])) html += str;
                    else {
                        if (str = classAnnotations[className]) html += str + "<br>\n";
                        else html += key + " wird demn&auml;chst hier n&auml;her erl&auml;utert.<br>\n";
                    }
                    /*
                     var nodeid;
                     if (oid=target.getAttribute("data-syntaxjs-oid")) {
                     html += "<br>Newsflash: dieses Token hat eine spezielle Id, die es ermoeglicht in den anderen Syntaxtree zu navigieren.<br>";
                     }
                     */
                    annotationDiv.innerHTML = html;
                    annotationDiv.innerHTML += development_version;
                    annotationDiv.style.position = "absolute";
                    annotationDiv.style.top = (target.offsetTop + (4 * target.offsetHeight)) + "px";
                    annotationDiv.style.left = target.offsetLeft + "px";
                    target.offsetParent.appendChild(annotationDiv);
                }
            }
        }


        function setLanguage(lang) {
            var pack = require("annotations."+lang);
            classAnnotations = pack.classAnnotations;
            annotations = pack.annotations;
            buttonNames = pack.buttonNames;
        }

        function selectLanguage(e) {
            var list = document.createElement("ol");
            var languages = require("i18n").languages;
            for (var key in languages) {
                var node = document.createElement("li");
                li.className = ClassNames["language-li"];
                li.setAttribute("data-syntaxjs-value", key);
                li.onclick = function (e) {
                    setLanguage(lang);
                };
                li.innerHTML = key;
                list.appendChild(li);
            }
            e.target.appendChild(list);
            list.onclick = function() {
                list.parentNode.removeChild(list);
            }
        }

        function addLanguageButton(parentSelector) {
            var parent = document.querySelector(parentSelector);
            if (parent) {
                var button = document.createElement("button");
                button.className = ClassNames["language"];
                button.innerHTML = buttonNames["language"];
                button.onclick = selectLanguage;
                parent.appendChild(button);
            } else {
                throw new TypeError("syntaxjs.highlighter.addLanguageButton() can not select element to add language button");
            }
        }


        
        /*
         Startet den Highlighter *****
         */
        
        function defaultOptions() {
            var options = Object.create(null);
            options["PRE"] = {
                controls: false,
                syntaxerrors: true
            };
            options["CODE"] = {
                controls: false,
                annotate: true
            };
            return options;
        }
        
        function startHighlighterOnLoad() {
            var config;
            var script = document.querySelector("script[data-syntaxjs-config]");
            if (script) config = script.getAttribute("data-syntaxjs-config");
            if (config) config = JSON.parse(config);
            else config = defaultOptions();
            var onload = function (e) {
                setTimeout(highlightElements.bind(null,config), 0);
            };
            addEventListener(window, "DOMContentLoaded", onload, false);
        }
        /* -------------------------------- */
        exports.startHighlighterOnLoad = startHighlighterOnLoad;
        exports.highlightElements = highlightElements;
        exports.addLanguageButton = addLanguageButton;
        return exports;

    });

}