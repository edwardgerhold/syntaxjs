
if (typeof window != "undefined") {


    define("highlight-gui", ["tables", "tokenizer", "parser", "runtime", "builder", "heap", "highlight"],
        function (tables, tokenize, parse, Evaluate, builder, heap, highlight) {

            "use strict";

            function addEventListener(element, type, func, capture) {
                if (typeof element.attachEvent === "function" && typeof element.addEventListener !== "function") {
                    if (type == "DOMContentLoaded") type = "load";
                    return element.attachEvent("on" + type, func);
                } else return element.addEventListener(type, func, capture);
            }

            var DOM = tables.DOM;
            var HTML5Objects = tables.HTML5Objects;
            var NodeJSObjects = tables.NodeJSObjects;
            var Builtins = tables.Builtins;
            var Comment = tables.Comment;
            var Parentheses = tables.Parentheses;
            var Quotes = tables.Quotes;
            var Punctuators = tables.Punctuators;
            var WhiteSpaces = tables.WhiteSpaces;
            var PunctToExprName = tables.PunctToExprName;
            var LineTerminators = tables.LineTerminators;
            var ParensSemicolonComma = tables.ParensSemicolonComma;
            var Types = tables.Types;
            var SemicolonInsertionPoint = tables.SemicolonInsertionPoint;
            var ReservedWord = tables.ReservedWord;
            var TypeOfToken = tables.TypeOfToken;
            var Keywords = tables.Keywords;
            var IsAnyLiteral = tables.IsAnyLiteral;
            var BinaryOperators = tables.BinaryOperators;
            var AssignmentOperators = tables.AssignmentOperators;
            var RelationalOperators = tables.RelationalOperators;
            var UnaryOperators = tables.UnaryOperators;
            var UpdateOperators = tables.UpdateOperators;
            var EqualityOperators = tables.EqualityOperators;
            var RelationalOperators = tables.RelationalOperators;
            var LogicalOperators = tables.LogicalOperators;
            var BitwiseOperators = tables.BitwiseOperators;
            var InOperator = tables.InOperator;
            var OpenParens = tables.OpenParens;
            var ExprEndOfs = tables.ExprEndOfs;
            var OperatorPrecedence = tables.OperatorPrecedence;
            var RegExpFlags = tables.RegExpFlags;
            var RegExpNoneOfs = tables.RegExpNoneOfs;

            var GUI = {};

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

            var DataAttributes = {
                "id": "data-syntaxjs",
                "highlight": "data-syntaxjs-highlight",
                "controls": "data-syntaxjs-controls",
                "language": "data-syntaxjs-language",
                "shell": "data-syntaxjs-shell"
            };

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
                "shell": "syntaxjs-shell-button"

            };
            var ClassTests = {};
            for (var k in ClassNames) {
                ClassTests[k] = true;
            }

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

            var ButtonNames = {
                __proto__: null,
                "eval": "Eval (Browser)",
                "original": "OriginalText",
                "linecount": "Zeilennummern",
                "editor": "Add/Hide Editor (Alpha)",
                "wordcount": "Wordcount",
                "minify": "Minifier",
                "token": "Tokens",
                "highlight": "Highlighted",
                "ast": "Abstract Syntax Tree",
                "value": "Evaluate(AST)",
                "infos": "Informationen",
                "source": "ToSource(AST)",
                "beauty": "Beautyfier",
                "shell": "shell input el"
            };

            var TagNames = {
                "PRE": true,
                "SPAN": true
            };

            var a = Object.create(null);
            var annotationDiv;
            var Annotations = a;
            
            var ClassAnnotations = {
                "syntaxjs-comment": "Kommentar",
                "syntaxjs-string": "Ein Zeichenkette, String genannt",
                "syntaxjs-regexp": "Regulaerer Ausdruck",
                "syntaxjs-template": "TemplateStrings sind neu in ES6",
                "syntaxjs-number": "Der Number Type ist ein 64 Bit Floating Point mit 11 Bit Exponent und 53 Bit Mantisse. Das MSB steht für das Vorzeichen.",
                "syntaxjs-null": "Das NullLiteral ist der NULL-Pointer im JavaScript. Sein Boolean Wert ist false.",
                "syntaxjs-boolean": "Booleans stehen fuer 0 und 1 und koennen falsch oder wahr, false oder true sein. Damit kann man logische Verknuepfungen aufstellen.",
                "syntaxjs-identifier": "Identifier sind Bezeichner. Der Parser liest Labels, die mit einem Doppelpunkt enden als Identifier ein. Identifier sind in der Regel die Namen von Variablen, oder von Objekteigenschaften. Sie werden aufgeloest (sie zeigen auf einen Speicherbereich) und geben einen Datentypen zurueck. In JavaScript entweder einen Primitive Type wie true, false, null oder undefined, oder einen Reference Type wie Object. Identifier identifizieren Objekte oder Variablen.",
            };

            a["&"] = "Bitweise UND Verknuepfung. Hier werden die Bits der Operanden (als int 1,2,4,8,16,...) einzeln verknuepft.",
            a["|"] = "Bitweise ODER Verknuepfung. Hier werden die Bits der Operanden  (als int 1,2,4,8,16,...) einzeln verknuepft.",
            a["<"] = "Kleiner als. Ist Links < Rechts ergibt true oder false",
            a[">"] = "Groesser als. Ist Links > Rechts ergibt true, ist Links groesser als Rechts, ansonsten false",
            a[">="] = "Groesser-Gleich. Ist Links groesser oder gleich Rechts ergibt der Ausdruck Links >= Rechts true, sonst false.",
            a["<="] = "Kleiner-Gleich. Ist Links kleiner oder gleich Rechts ergibt der Ausdruck Links &lt;= Rechts true, sonst false.",
            a["<<"] = "Left-Shift. Entspricht einer Multiplikation der linken Seite mit 2, so oft, wie rechts vom Operator steht. 1 << 3 === 1*2*2*2. 4 << 3 === 4*2*2*2. Links ueberlaufende Bits werden abgetrennt.",
            a[">>"] = "Right-Shift. Entspricht einer Division der linken Seite durch 2, so oft, wie rechts vom Operator steht. 10 >> 1 === 5. 1 >> 1 = 0. Rechts ueberlaufende Bits werden abgetrennt.",
            a["%"] = "Rest. Die Modulus Operation gibt den Rest. 15 % 8 ergibt 7. 2 % 1 ergibt 0. Mit n % 2 === 0 kann man testen, ob n gerade oder ungerade ist. Anders als in einigen anderen Sprachen gibt es hier ein Fliesskommaergebnis und nicht nur eine Integerzahl.",
            a[";"] = "Das Semikolon gibt das Ende eines Statements an. Oder kann als einzelnes EmptyStatement solo stehen.",
            a["..."] = "...rest steht fuer den RestParameter, der alle nicht definierten Parameter aufnimmt, die nach dem letzten definierten kommen. Und ...spread, die SpreadExpression, das Gegenstueck zu ...rest, ist aehnlich .apply, nur besser, und breitet einen Array abc=[1,2,3] bei f(...abc) auf f(1,2,3) aus und arbeitet auch bei Kontruktoren, was apply nicht kann, dass man ihnen mit ES6 dynamische Parameter zuweisen kann. Workaround fuer Parameter: options-Objekt statt benannte Parameter nehmen und nur einen new f({opt:true,opt2:false}) uebergeben.",
            a["undefined"] = "undefiniert, noch kein Wert zugewiesen oder letzter Wert geloescht",
            a["this"] = "this ist ein spezielles Wort, was auf das aktuelle, in dem man sich befindende, Objekt anzeigt. this kann mit call und apply explizit uebergeben werden. 'use strict' setzt this in globalen Funktionen auf undefined.",
            a["super"] = "super ist ein spezielles Wort, was in Klassen verfuegbar ist, und direkt auf das Objekt, von dem extended wird, zeigt und dessen Methoden ruft. Ruft man in einer Klassenmethode super, wird versucht, die gleiche Funktion beim Vater zu rufen.",
            a["void"] = "Der void UnaryOperator macht gar nichts und ergibt undefined. Er ist mitunter mal nuetzlich.",
            a["typeof"] = "Der typeof UnaryOperator findet raus, was der dahinterstehende Identifier oder das folgende Literal fuer ein Typ ist. typeof .77 === \"number\" oder typeof x === \"object\".",
            a["delete"] = "delete loescht eine Objekteigenschaft oder Variable und gibt im Erfolgsfall true zur&uuml;ck und im Versagensfall false.",
            a["const"] = "const gehoert zu den LexicalDeclarations und deklariert eine Read-Only Variable. Die kann man nur einmal setzen und nicht mehr ueberschreiben.",
            a["let"] = "let ist ab ES6 das neue var. Es ist Block-Scoped (blockweit sichtbar), wie man es von anderen Programmiersprachen kennt. let ist eine LexicalDeclaration.",
            a["=>"] = "Der => Pfeil nach einer (x,y) => {} oder einem Identifier wie bei x => x*x, leitet eine Arrow Function ein. Ohne Block {} haben sie ein implizites return (letzter Wert) und ein lexikalisches this, dass man kein var that benoetigt. Ab ES6",
            a["__proto__"] = "__proto__ ist ein ganz frueher von Mozilla eingefuehrter, heute praktisch allgegenwaertiger, Link, der zum Prototype fuehrt. Wenn man ihn setzt, setzt man den Prototype des Objekts, dem man ihn setzt, zur Laufzeit. Man kann unter den Header praktisch andere Koerper schrauben, wenn man dazu Daten im Constructor traegt. Das ist aber nur eine kewle Idee. In ES6 soll __proto__ womoeglich Standard werden.", // ergibt [Object object] statt der Annotation in einem {} Objekt
            a["constructor"] = "Sorgt dafuer, dass instanceof true ist. Ist der offizielle Link vom Prototype zurueck zur Constructor Funktion. Superclass.prototype.constructor() ist praktisch, um zu extenden. Hat ein F.prototype eine constructor Property, wird diese bei new F gerufen. Sie sorgt dafuer, dass instanceof true ist. new F ist sowas wie (aber nur sowas wie) F.protoype.constructor.apply({}, arguments); wobei das neue {} zurueckgegeben wird...",
            a["{}"] = "Ist meist ein Objektliteral. var obj = {}; f.bind({}, g); Kann aber auch ein leerer, vergessener Statementblock sein. if (0) {} else {}.",
            a["[]"] = "In JavaScript gibt es zwei eckige Klammern nur als ArrayLiteral [1,2,3,4]. Eine Angabe wie var array[] gibt es _nicht_ in JavaScript. [] steht immer fuer sich und fuer einen leeren Array. Mit . kann man direkt Funktionen rufen, wie var array = [].push(\"a\") was klueger var array = [\"a\"] bedeutet.",
            a["!"] = "UnaryOperator !. Negiert die Aussage, bedeutet dass !true == false und !false == true, die Formel !!zwerg wandelt in Boolean(zwerg) um",
            a["+"] = "BinaryOperator/UnaryOperator Bedeutetet Addition. Sobald einer der beiden aber ein String ist, Konkatenation (1+2==3, aber 1+'2'=='12'). Wird ebenfalls zur Stringkonkatenation ganzer_string = string1 + string2 benutzt. Als UnaryOperator ist es ein positives Vorzeichen UND es versucht die Variable dahinter in eine Number zu konvertieren.",
            a["+="] = "AssignmentOperator. Addieren und zuweisen. left += right ist das Gleiche wie left = left + right;",
            a["-="] = "AssignmentOperator. Subtrahieren und zuweisen. left -= right ist das Gleiche wie left = left - right;",
            a["*="] = "AssignmentOperator. Multiplizieren und zuweisen. left *= right ist das Gleiche wie left = left * right;",
            a["/="] = "AssignmentOperator. Dividieren und Zuweisen. left /= right ist das Gleiche wie left = left / right;",
            a["%="] = "AssignmentOperator. Rest nehmen und Zuweisen. left %= right ist das Gleiche wie left = left % right;",
            a["|="] = "Bitweises OR und Zuweisung. wenn a = 10 (0b1010) und b = 20 (0b10100), dann setzt a |= b die Variable a auf 30.",
            a["&="] = "Bitweises UND und Zuweisung. Wenn a = 10 (0b1010) und b = 20 (0b10100) dann ist a &= b === 0 (0b0)",
            a["^="] = "Bitweises XOR und Zuweisung. Ist a = 10 (0b1010) und b = 20 (0b10100), dann ist nach a ^= b das a = 30 (0b11110) und nach nochmal a^=b wieder 10, da XOR sein eigenes Invers ist.",
            a["^"] = "XOR. Wenn man a = 10 (0b1010) mit b = 20 (0b10100) XORt erhaelt man 30 (0b11110) und XORt man b ^ a, erhaelt man auch 30. Weist man das der einen Variable gleich zu und XORt nochmal mit der anderen, erhaelt man den Originalwert zurueck.",
            a["="] = "Ein = dient der Zuweisung von der rechten Seite (right-hand-side) zur linken Seite (left-hand-side). Mit = kann man keine Vergleiche anstellen.<br>= ist ein AssignmentOperator, wie &uuml;brigens auch +=, %=, *=, -=, <<=, etc.",
            a["=="] = "Ein doppeltes == dient einem Vergleich. Wenn die Typen nicht gleich sind, wird versucht, die rechte Seite zum Typen der linken zu konvertieren. (1 == \"1\", dank type coercion)",
            a["==="] = "Ein dreifaches === ist ein strikter Vergleich. Hier muss auch der Typ uebereinstimmen (1 !== \"1\", da strict und eine Number 1 kein String \"1\" ist) Bei Objekten und Arrays wird ihre Reference (Adresse) verglichen. Will man die Felder alle pruefen, muss man das selbst schreiben, siehe deepEqual Funktionsvorschlag im assert-Modul in node.js oder CommonJS deepEqual in Unit/Test/10 ",
            a["!="] = "Ein einfaches not-equal, mit type coercion (Rechte Seite dem Typ der Linken anpassen). Hier ist 0 == '0' und '1' != '2'",
            a["!=="] = "Ein strict-not-equal. Keine Umwandlung des Typs der rechten Seite zum Typ der linken Seite. Der Typ muss gleich sein. Hier muess 5 === 5 sein und nicht 5 === '5' (was Number 5 !== String '5' waere, was mit == wiederum gleich waere)",
            a["!!"] = "!! (Bangbang) wandelt eine Variable in ihren Booleanwert um. Aus !![1] (ein Array mit einer 1 als Index Element 0) wird zum Beispiel true und aus !!undefined und !!null wird jeweils false",
            a[":"] = "Ein Doppelpunkt steht in einem Objekt { a: 1, b: 2 } zwischen Propertyname und Wert.<br>\nBeim conditional Operator ?: (ConditionalExpression) steht er zwischen der linken (true) und rechten (false) Seite nach dem ?.<br>\nBei LabeledStatenebts steht er nach dem Identifier fuer das Label -> loop: while(1) { break loop; }",
            a[","] = "Mit dem Komma-Operator kann man 1.) Befehle nacheinander als ein Statement ausf&uuml;hren. Das letzte Ergebnis bleibt stehen. Bei einem if braucht man beispielsweise keine geschweiften Klammern nach der Kondition oder fuer den else-Teil, nimmt man Kommas. 2.) Das Komma trennt Eigenschaften im Objekt, trennt 3.) Elemente im Array. -- Der Komma Operator -- Ein Komma trennt im Array [a,b,c] die Elemente  voneinander. Im Objekt die Properties { a: 1, b: c }. Ein Komma kann zum trennen von Befehlen genommen werden, a(),b(),c(). Ergebnis ist der letzte Aufruf.",
            a["("] = "Oeffnende runde Klammer. Wenn etwas in runden Klammern steht wird es zuerst berechnet, alles in der Klammer zusammen ist eine Expression,  und das Ergebnis tritt an deren Stelle.\n Beispiel: ((cx = vx()) == 12) vergleicht cx == 12, nachdem das Resultat von vx() der cx zugewiesen wurde.<br>Ausserdem: Runde Klammern leiten Funktionsargumente ein function f (a, b, c), oder gruppieren die Argumente bei Invokationen f(a,b,c).<br>\nUnd um die Kondition des IfStatements, ForStatements, WhileStatements, SwitchStatements sind runde Klammern Pflicht.",
            a[")"] = "Schliessende runde Klammer. Wenn etwas in runden Klammern steht wird es zuerst berechnet, alles in der Klammer zusammen ist eine Expression,  und das Ergebnis tritt an deren Stelle.\n Beispiel: ((cx = vx()) == 12) vergleicht cx == 12,  nachdem das Resultat von vx() der cx zugewiesen wurde.<br>Ausserdem: Runde Klammern leiten Funktionsargumente ein function f (a, b, c), oder gruppieren die Argumente bei Invokationen f(a,b,c).<br>\nUnd um die Kondition des IfStatements, ForStatements, WhileStatements, SwitchStatements sind runde Klammern Pflicht. ",
            a["{"] = "Oeffnende geschweifte Klammern klammern Statements als BlockStatement ein. (if (x) {Statements} else {Statements}. FunctionBodies function f() {body} ebenso wie Objekte { a: 1, b:2 } ein.<br>\n Neu ist in EcmaScript 6 das Destructuring. let {first, last} = {first:'Vorname', last:'Nachname'} erzeugt die Variablen first und last mit den Inhalten der Objektproperties.",
            a["}"] = "Schliessende geschweifte Klammern klammern Statements (if (x) {/*{Statementblock}*/} else {/*{Statementblock}*/}, FunctionBodies function f() { /*body*/ } ebenso wie Objekte { a: 1, b:2 } ein.<br>\n Neu ist in EcmaScript 6 das Destructuring. let {first, last} = {first:'Vorname', last:'Nachname'} erzeugt die Variablen first und last mit den Inhalten der Objektproperties.",
            a["["] = "&Ouml;ffnende eckige Klammer. Eckige Klammern sind f&uuml;r [1,3,4] Arrays, ab ES6 Comprehensions [v for (v of [0,1,2,3])if (v > 1)] === [2,3],<br>\nobject[key] Subscript Operationen. Und sie umschliessen in ES6 [symbol]definierte Properties in Klassen und Objektliteralen.",
            a["]"] = "Schliessende eckige Klammer. Eckige Klammern sind f&uuml;r [1,3,4] Arrays, ab ES6 Comprehensions [v for (v of [0,1,2,3]) if (v > 1)] === [2,3],<br>\nobject[key] Subscript Operationen. Und sie umschliessen in ES6 [symbol]definierte Properties in Klassen und Objektliteralen. Klammern muessen immer in der richtigen Reihenfolge geschachtelt sein.",
            a["!!"] = "Zwei Ausrufezeichen wandeln den Ausdruck dahinter in einen Booleanwert um. Den kann man in einer logischen Verknuepfung auswerten, anstelle ein Objekt oder anderes Ergebnis, was der Ausdruck sonst ist, zwischen die Elemente der logischen Verknuefung (normal nur wahr und falsch) zu pappen..",
            a["||"] = "Der Default Operator || wertet, wenn der Ausdruck links falsch ist, den Ausdruck rechts aus.<br>Man kann damit logische Verknuepfungen und Regeln aufbauen. Mit variable = variable || 'defaultvalue' wird variable ein Wert zugewiesen, wenn ihrer undefined, null, false oder '' ist. Wurde variable gar nicht erst deklariert (mit var, let oder Parametern), gibt es einen ReferenceError: Undefinierte Variable.",
            a["&&"] = "Der Guard Operator && wertet den rechten Ausdruck nur aus, wenn der linke Ausdruck wahr ist.<br>Man kann damit logische Verknuepfungen und Regeln erstellen. Oder mit if (obj && obj.p) z.B. erstmal pruefen, ob eine Variable vorhanden ist. Ist sie (obj) es nicht, wird gar nicht auf den Folgewert (obj.p) zugegriffen und false anstelle des Ausdrucks gesetzt. Bei if (a && b) muessen beide wahr sein um in den if Block zu gelangen.",
            a["var"] = "Mit var deklariert man eine Variable. Sie wird intern nach oben gehoben und ist in der gesamten Funktion zu sehen. Zuerst mit undefined. Dann aber der Zeile, wo sie mit = einen Wert bekommt, gibt sie den Wert aus. Ab ES6 wird es let geben, womit man die Variable auf den Block beschraenkt. Sowie const, womit man nur lesbare Konstanten initialisieren kann. Eine const Variable kann man nur einmalig einen Wert zuweisen. var kann man jederzeit setzen. Ein var gilt fuer ihre Funktion und alle darin geschriebenen Funktionen. Ein Sonderfall ist noch die Funktion eval, die unter Umstaenden auch auf ihre Variablen zugreifen kann.",
            a["instanceof"] = "Ein binaerer Operator, object instanceof function. Prueft ob ein Objekt eine Instanz eines bestimmten Constructors ist. Hat dessen Prototype die Funktion als Constructor, ist instanceof auf jeden Fall true. Kann in JavaScript getrost vernachlaessigt werden und mit Duck-Typing (hasOwnProperty) und Einschaetzen des Objekts koennen Aufgaben besser geloest werden.",
            a["function"] = "Funktionen sind normale Objekte. Rufbare Objekte (engl. Callable). Man kann ihnen Properties zuweisen. Sie haben auch welche, wie ihren .name. Und Methoden wie .bind oder .call und .apply. In JavaScript sind functions first-class. Sie koennen als Statement gerufen werden, oder in Expressions. Sie koennen als Parameter uebergeben werden. Einfach einem Objekt, Array, einer Funktion mit . oder  [subscript] zuweisen. Mit () hinter dem Namen, kann man functions rufen. Wenn man sie einer Variable zuweist, wenn man sie schreibt, braucht sie keinen Namen. Das ist eine FunctionExpression. Eine FunctionDeclaration ist function gefolgt von einem Namen, Argumenten, dem FunctionBody Block und keinem Semikolon. Expresions haben ein Semikolon wie ein normaler Ausdruck hat.",
            a["arguments"] = "Das Arguments Objekt enthaelt alle Parameter, die beim Aufruf einer Funktion uebergeben wurden und ist nur innerhalb dieser gerufenen Funktion sichtbar. Ab ES6 gibt es ...rest RestParameter, die das arbeiten leichter machen.",
            a["JSRuntime"] = "JSRuntime ist die SpiderMonkey Laufzeitstruktur. Wird mit JSRuntime *rt = JS_CreateRuntime(bytes); gestartet. Mit der rt kann man dann den JSContext(rt, heapsize) erzeugen.";

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
                button.innerHTML = ButtonNames[bname];
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
            var globalControlsAttribute = document.documentElement.getAttribute("data-syntaxjs-controls");
            var globalControls = globalControlsAttribute !== undefined ? Duties[globalControlsAttribute] : false;

            function highlightElements(options) {

                var elements;
                var element, rec, hl, ctrl;
                var controls, tag, att;
                var annotate;
                var delegate;
                var syntaxerrors;
                var att1, att2;
                var opt;
                var opt_rec;
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
                                    syntaxerrors = opts.syntaxerrors !== undefined ? opts.syntaxerrors : true;
                                    annotate =  opts.annotate !== undefined ? opts.annotate : true;
                                    delegate =  opts.delegate !== undefined ? opts.delegate : true;
                                } else {
                                    syntaxerrors = annotate = delegate = true;
                                    controls = false;
                                }

                                for (var a = 0, b = elements.length; a < b; a++) {

                                    if (element = elements[a]) {

                                        name = element.tagName;
                                        att1 = element.getAttribute("data-syntaxjs-highlight");
                                        att2 = element.getAttribute("data-syntaxjs-controls");

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
                });
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
                        consoleElement.innerHTML += value += "<br>\n";
                    }
                });
            }

            //
            // count_word adds 1 to the existing wordcount_obj[word] or creates a new entry [word] set to 1 on the wordcount_obj.
            //

            function count_word(word, wordcount_obj) {
                var n;
                wordcount_obj[word] = typeof (n = wordcount_obj[word]) === "number" ? n + 1 : 1;
            }
            /// Array.prototype.sort(sort_alpha) sortiert Worte.

            function sort_alpha(w1, w2) {
                var i, b1, b2;
                i = -1
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
                var wordcount

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
                var element = rec.element;
                return make_button(rec, "source", "source", function (e) {
                    if (!source) {
                        try {
                            source = JSON.stringify(rec.ast.toSource(), null, 4);
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

                function enter(e) {
                    if (e.keyCode === 13) {
                        code = input.value;
                        if (code === ".clear") {
                            consoleElement.innerHTML = "-cleared console-<br>\n";
                        } else if (code === ".quit") {
                            consoleElement += "Quitting the Shell...";
                            input.parentNode.removeChild(input);
                            input = null;
                         } else {
                            try {
                                val = syntaxjs.toValue(code, true); // brauche map fuers realm
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
                        val = syntaxjs.toValue(code, true, true);
                    } catch (ex) {
                        val = ex.message + "<br>\n" + ("" + ex.stack).split("\n").join("<br>n");
                    } finally {
                        consoleElement.innerHTML += "re-initialized code<br><br>\n" + val + "<br>\n";
                        consoleElement.scrollToBottom && consoleElement.scrollToBottom();
                        input.value = "";
                    }

                });
            }

            /* War das 1. Feature */

            var development_version = "<br><sub>ohne Gew&auml;hr</sub>";
            var NoOvers = {};
            NoOvers[ClassNames["info"]] = true;
            var clas = /syntaxjs-/;

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
                        /*
                        var oid;
                        if (oid=target.getAttribute("data-syntaxjs-oid")) {
                        
                        }
                        */
                        /*
                        Falls parse tree:
                        Was muss ich tun, um zu wissen, dass ich, wenn ich ueber a+b+c und dem
                        2. + hover, dass ich in der expression a+b+c bin?
                        Wie lege ich den Code Flow aus dem AST ab?
                        gebe ast-node eine id?
                        speichere alle nodes untereinander by id?
                        o(1) zugriff fuer die suche im tree?
                        in tokens objekt zu T
                        speichere: "node.type"
                        sagt mir, gehoere zu "binaryexpression"
                        speichere: parentnode ???
                    */
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
                        if ((str = Annotations[key])) html += str;
                        else {
                            if (str = ClassAnnotations[className]) html += str + "<br>\n";
                            else html += key + " wird demn&auml;chst hier n&auml;her erl&auml;utert.<br>\n";
                        }

                        /*
                        var oid;
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

            annotationDiv = document.createElement("div");
            annotationDiv.className = "syntaxjs-annotation";

            /*
        Startet den Highlighter *****
    */

            function defaultOptions() {
                    var options = Object.create(null);
                    options["PRE"] = {
                            controls: false,
                            annotate: true,
                            syntaxerrors: true,
                            delegate: true // das war die worker option
                    };
                    options["CODE"] = {
                            syntaxerrors: false,
                            controls: false,
                            annotate: true,
                            delegate: true // das war die worker option
                    };
                    return options;
            }

            function startHighlighterOnLoad() {
                
                var script = document.querySelector("script[data-syntaxjs-config]");
                
                var config;
                
                if (script) config = script.getAttribute("data-syntaxjs-config");

                if (config) config = JSON.parse(config);
                else config = defaultOptions();        
                
                var onload = function (e) {
                    setTimeout(function () { highlightElements(config); }, 0);
                };
                
                addEventListener(window, "DOMContentLoaded", onload, false);
            }

            /* -------------------------------- */            
            
            GUI.startHighlighterOnLoad = startHighlighterOnLoad;
            GUI.highlightElements = highlightElements;
            return GUI;
        });

}