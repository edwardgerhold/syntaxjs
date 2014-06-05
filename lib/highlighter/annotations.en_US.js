define("annotations.en_US", function (require, exports) {

    /* soon, that one english version exists for all non-german speaking */

    /* sooner, the surrogate code is added and a test for the unicode, to allow anyone to type js and strings
       */

    var classAnnotations= {
        "syntaxjs-comment": "Comment",
        "syntaxjs-string": "A chain of characters, called string",
        "syntaxjs-regexp": "A regular expression, the dominating example for teaching automata theory and a very good proof string matching thesis",
        "syntaxjs-template": "Template Strings are new in ES6",
        "syntaxjs-number": "A sixty-four bit floating point, with 11 bits for the exponent, 1 bit for the sign and 52 bits for the normalized number",
        "syntaxjs-null": "null is the NULL-Pointer equivalent for javascript. It´s useful that it´s different from undefined.",
        "syntaxjs-boolean": "booleans are true or false and equal to the numbers 1..n or 0, empty strings '' are false, {} and [] are true",
        "syntaxjs-identifier": "Identifier are names for variables, and can be the name of a label: for a labelled statement.",
        "syntaxjs-undefined": "undefined is the special value which tells that this value is undefined and it´s boolean value is false"
    };
    var buttonNames = {
        __proto__: null,
        "eval": "Eval (Browser´s)",
        "original": "Original",
        "linecount": "Linenumbers",
        "editor": "Add/Hide Editor (Alpha)",
        "wordcount": "Wordcount",
        "minify": "Minifier",
        "token": "Tokens",
        "highlight": "Highlighted",
        "ast": "Abstract Syntax Tree",
        "value": "Evaluate(AST)",
        "infos": "Informations",
        "source": "ToSource(AST)",
        "beauty": "Beautyfier",
        "shell": "Shell simulations"
    };

    var annotations = Object.create(null);
    annotations["&"] = "Bitweise UND Verknuepfung. Hier werden die Bits der Operanden (als int 1,2,4,8,16,...) einzeln verknuepft.";
    annotations["|"] = "Bitweise ODER Verknuepfung. Hier werden die Bits der Operanden  (als int 1,2,4,8,16,...) einzeln verknuepft.";
    annotations["<"] = "Kleiner als. Ist Links < Rechts ergibt true oder false";
    annotations[">"] = "Groesser als. Ist Links > Rechts ergibt true, ist Links groesser als Rechts, ansonsten false";
    annotations[">="] = "Groesser-Gleich. Ist Links groesser oder gleich Rechts ergibt der Ausdruck Links >= Rechts true, sonst false.";
    annotations["<="] = "Kleiner-Gleich. Ist Links kleiner oder gleich Rechts ergibt der Ausdruck Links &lt;= Rechts true, sonst false.";
    annotations["<<"] = "Left-Shift. Entspricht einer Multiplikation der linken Seite mit 2, so oft, wie rechts vom Operator steht. 1 << 3 === 1*2*2*2. 4 << 3 === 4*2*2*2. Links ueberlaufende Bits werden abgetrennt.";
    annotations[">>"] = "Right-Shift. Entspricht einer Division der linken Seite durch 2, so oft, wie rechts vom Operator steht. 10 >> 1 === 5. 1 >> 1 = 0. Rechts ueberlaufende Bits werden abgetrennt.";
    annotations["%"] = "Rest. Die Modulus Operation gibt den Rest. 15 % 8 ergibt 7. 2 % 1 ergibt 0. Mit n % 2 === 0 kann man testen, ob n gerade oder ungerade ist. Anders als in einigen anderen Sprachen gibt es hier ein Fliesskommaergebnis und nicht nur eine Integerzahl.";
    annotations[";"] = "Das Semikolon gibt das Ende eines Statements an. Oder kann als einzelnes EmptyStatement solo stehen.";
    annotations["..."] = "...rest steht fuer den RestParameter, der alle nicht definierten Parameter aufnimmt, die nach dem letzten definierten kommen. Und ...spread, die SpreadExpression, das Gegenstueck zu ...rest, ist aehnlich .apply, nur besser, und breitet einen Array abc=[1,2,3] bei f(...abc) auf f(1,2,3) aus und arbeitet auch bei Kontruktoren, was apply nicht kann, dass man ihnen mit ES6 dynamische Parameter zuweisen kann. Workaround fuer Parameter: options-Objekt statt benannte Parameter nehmen und nur einen new f({opt:true,opt2:false}) uebergeben.";
    annotations["undefined"] = "undefiniert, noch kein Wert zugewiesen oder letzter Wert geloescht";
    annotations["this"] = "this ist ein spezielles Wort, was auf das aktuelle, in dem man sich befindende, Objekt anzeigt. this kann mit call und apply explizit uebergeben werden. 'use strict' setzt this in globalen Funktionen auf undefined.";
    annotations["super"] = "super ist ein spezielles Wort, was in Klassen verfuegbar ist, und direkt auf das Objekt, von dem extended wird, zeigt und dessen Methoden ruft. Ruft man in einer Klassenmethode super, wird versucht, die gleiche Funktion beim Vater zu rufen.";
    annotations["void"] = "Der void UnaryOperator macht gar nichts und ergibt undefined. Er ist mitunter mal nuetzlich.";
    annotations["typeof"] = "Der typeof UnaryOperator findet raus, was der dahinterstehende Identifier oder das folgende Literal fuer ein Typ ist. typeof .77 === \"number\" oder typeof x === \"object\".";
    annotations["delete"] = "delete loescht eine Objekteigenschaft oder Variable und gibt im Erfolgsfall true zur&uuml;ck und im Versagensfall false.";
    annotations["const"] = "const gehoert zu den LexicalDeclarations und deklariert eine Read-Only Variable. Die kann man nur einmal setzen und nicht mehr ueberschreiben.";
    annotations["let"] = "let ist ab ES6 das neue var. Es ist Block-Scoped (blockweit sichtbar), wie man es von anderen Programmiersprachen kennt. let ist eine LexicalDeclaration.";
    annotations["=>"] = "Der => Pfeil nach einer (x,y) => {} oder einem Identifier wie bei x => x*x, leitet eine Arrow Function ein. Ohne Block {} haben sie ein implizites return (letzter Wert) und ein lexikalisches this, dass man kein var that benoetigt. Ab ES6";
    annotations["__proto__"] = "__proto__ ist ein ganz frueher von Mozilla eingefuehrter, heute praktisch allgegenwaertiger, Link, der zum Prototype fuehrt. Wenn man ihn setzt, setzt man den Prototype des Objekts, dem man ihn setzt, zur Laufzeit. Man kann unter den Header praktisch andere Koerper schrauben, wenn man dazu Daten im Constructor traegt. Das ist aber nur eine kewle Idee. In ES6 soll __proto__ womoeglich Standard werden."; // ergibt [Object object] statt der Annotation in einem {} Objekt
    annotations["constructor"] = "Sorgt dafuer, dass instanceof true ist. Ist der offizielle Link vom Prototype zurueck zur Constructor Funktion. Superclass.prototype.constructor() ist praktisch, um zu extenden. Hat ein F.prototype eine constructor Property, wird diese bei new F gerufen. Sie sorgt dafuer, dass instanceof true ist. new F ist sowas wie (aber nur sowas wie) F.protoype.constructor.apply({}, arguments); wobei das neue {} zurueckgegeben wird...";
    annotations["{}"] = "Ist meist ein Objektliteral. var obj = {}; f.bind({}, g); Kann aber auch ein leerer, vergessener Statementblock sein. if (0) {} else {}.";
    annotations["[]"] = "In JavaScript gibt es zwei eckige Klammern nur als ArrayLiteral [1,2,3,4]. Eine Angabe wie var array[] gibt es _nicht_ in JavaScript. [] steht immer fuer sich und fuer einen leeren Array. Mit . kann man direkt Funktionen rufen, wie var array = [].push(\"a\") was klueger var array = [\"a\"] bedeutet.";
    annotations["!"] = "UnaryOperator !. Negiert die Aussage, bedeutet dass !true == false und !false == true, die Formel !!zwerg wandelt in Boolean(zwerg) um";
    annotations["+"] = "BinaryOperator/UnaryOperator Bedeutetet Addition. Sobald einer der beiden aber ein String ist, Konkatenation (1+2==3, aber 1+'2'=='12'). Wird ebenfalls zur Stringkonkatenation ganzer_string = string1 + string2 benutzt. Als UnaryOperator ist es ein positives Vorzeichen UND es versucht die Variable dahinter in eine Number zu konvertieren.";
    annotations["+="] = "AssignmentOperator. Addieren und zuweisen. left += right ist das Gleiche wie left = left + right;";
    annotations["-="] = "AssignmentOperator. Subtrahieren und zuweisen. left -= right ist das Gleiche wie left = left - right;";
    annotations["*="] = "AssignmentOperator. Multiplizieren und zuweisen. left *= right ist das Gleiche wie left = left * right;";
    annotations["/="] = "AssignmentOperator. Dividieren und Zuweisen. left /= right ist das Gleiche wie left = left / right;";
    annotations["%="] = "AssignmentOperator. Rest nehmen und Zuweisen. left %= right ist das Gleiche wie left = left % right;";
    annotations["|="] = "Bitweises OR und Zuweisung. wenn a = 10 (0b1010) und b = 20 (0b10100), dann setzt a |= b die Variable a auf 30.";
    annotations["&="] = "Bitweises UND und Zuweisung. Wenn a = 10 (0b1010) und b = 20 (0b10100) dann ist a &= b === 0 (0b0)";
    annotations["^="] = "Bitweises XOR und Zuweisung. Ist a = 10 (0b1010) und b = 20 (0b10100), dann ist nach a ^= b das a = 30 (0b11110) und nach nochmal a^=b wieder 10, da XOR sein eigenes Invers ist.";
    annotations["^"] = "XOR. Wenn man a = 10 (0b1010) mit b = 20 (0b10100) XORt erhaelt man 30 (0b11110) und XORt man b ^ a, erhaelt man auch 30. Weist man das der einen Variable gleich zu und XORt nochmal mit der anderen, erhaelt man den Originalwert zurueck.";
    annotations["="] = "Ein = dient der Zuweisung von der rechten Seite (right-hand-side) zur linken Seite (left-hand-side). Mit = kann man keine Vergleiche anstellen.<br>= ist ein AssignmentOperator, wie &uuml;brigens auch +=, %=, *=, -=, <<=, etc.";
    annotations["=="] = "Ein doppeltes == dient einem Vergleich. Wenn die Typen nicht gleich sind, wird versucht, die rechte Seite zum Typen der linken zu konvertieren. (1 == \"1\"; dank type coercion)";
    annotations["==="] = "Ein dreifaches === ist ein strikter Vergleich. Hier muss auch der Typ uebereinstimmen (1 !== \"1\"; da strict und eine Number 1 kein String \"1\" ist) Bei Objekten und Arrays wird ihre Reference (Adresse) verglichen. Will man die Felder alle pruefen, muss man das selbst schreiben, siehe deepEqual Funktionsvorschlag im assert-Modul in node.js oder CommonJS deepEqual in Unit/Test/10 ";
    annotations["!="] = "Ein einfaches not-equal, mit type coercion (Rechte Seite dem Typ der Linken anpassen). Hier ist 0 == '0' und '1' != '2'";
    annotations["!=="] = "Ein strict-not-equal. Keine Umwandlung des Typs der rechten Seite zum Typ der linken Seite. Der Typ muss gleich sein. Hier muess 5 === 5 sein und nicht 5 === '5' (was Number 5 !== String '5' waere, was mit == wiederum gleich waere)";
    annotations["!!"] = "!! (Bangbang) wandelt eine Variable in ihren Booleanwert um. Aus !![1] (ein Array mit einer 1 als Index Element 0) wird zum Beispiel true und aus !!undefined und !!null wird jeweils false";
    annotations[":"] = "Ein Doppelpunkt steht in einem Objekt { a: 1, b: 2 } zwischen Propertyname und Wert.<br>\nBeim conditional Operator ?: (ConditionalExpression) steht er zwischen der linken (true) und rechten (false) Seite nach dem ?.<br>\nBei LabeledStatenebts steht er nach dem Identifier fuer das Label -> loop: while(1) { break loop; }";
    annotations[","] = "Mit dem Komma-Operator kann man 1.) Befehle nacheinander als ein Statement ausf&uuml;hren. Das letzte Ergebnis bleibt stehen. Bei einem if braucht man beispielsweise keine geschweiften Klammern nach der Kondition oder fuer den else-Teil, nimmt man Kommas. 2.) Das Komma trennt Eigenschaften im Objekt, trennt 3.) Elemente im Array. -- Der Komma Operator -- Ein Komma trennt im Array [a,b,c] die Elemente  voneinander. Im Objekt die Properties { a: 1, b: c }. Ein Komma kann zum trennen von Befehlen genommen werden, a(),b(),c(). Ergebnis ist der letzte Aufruf.";
    annotations[";"] = "Das Semikolon ist der Befehlstrenner. Ein Zeilenumbruch kann eine automatische Semikoloneinf&uuml;gung ausl&ouml;sen.";
    annotations["("] = "Oeffnende runde Klammer. Wenn etwas in runden Klammern steht wird es zuerst berechnet, alles in der Klammer zusammen ist eine Expression,  und das Ergebnis tritt an deren Stelle.\n Beispiel: ((cx = vx()) == 12) vergleicht cx == 12, nachdem das Resultat von vx() der cx zugewiesen wurde.<br>Ausserdem: Runde Klammern leiten Funktionsargumente ein function f (a, b, c), oder gruppieren die Argumente bei Invokationen f(a,b,c).<br>\nUnd um die Kondition des IfStatements, ForStatements, WhileStatements, SwitchStatements sind runde Klammern Pflicht.";
    annotations[")"] = "Schliessende runde Klammer. Wenn etwas in runden Klammern steht wird es zuerst berechnet, alles in der Klammer zusammen ist eine Expression,  und das Ergebnis tritt an deren Stelle.\n Beispiel: ((cx = vx()) == 12) vergleicht cx == 12,  nachdem das Resultat von vx() der cx zugewiesen wurde.<br>Ausserdem: Runde Klammern leiten Funktionsargumente ein function f (a, b, c), oder gruppieren die Argumente bei Invokationen f(a,b,c).<br>\nUnd um die Kondition des IfStatements, ForStatements, WhileStatements, SwitchStatements sind runde Klammern Pflicht. ";
    annotations["{"] = "Oeffnende geschweifte Klammern klammern Statements als BlockStatement ein. (if (x) {Statements} else {Statements}. FunctionBodies function f() {body} ebenso wie Objekte { a: 1, b:2 } ein.<br>\n Neu ist in EcmaScript 6 das Destructuring. let {first, last} = {first:'Vorname', last:'Nachname'} erzeugt die Variablen first und last mit den Inhalten der Objektproperties.";
    annotations["}"] = "Schliessende geschweifte Klammern klammern Statements (if (x) {/*{Statementblock}*/} else {/*{Statementblock}*/}, FunctionBodies function f() { /*body*/ } ebenso wie Objekte { a: 1, b:2 } ein.<br>\n Neu ist in EcmaScript 6 das Destructuring. let {first, last} = {first:'Vorname', last:'Nachname'} erzeugt die Variablen first und last mit den Inhalten der Objektproperties.";
    annotations["["] = "&Ouml;ffnende eckige Klammer. Eckige Klammern sind f&uuml;r [1,3,4] Arrays, ab ES6 Comprehensions [v for (v of [0,1,2,3])if (v > 1)] === [2,3],<br>\nobject[key] Subscript Operationen. Und sie umschliessen in ES6 [symbol]definierte Properties in Klassen und Objektliteralen.";
    annotations["]"] = "Schliessende eckige Klammer. Eckige Klammern sind f&uuml;r [1,3,4] Arrays, ab ES6 Comprehensions [v for (v of [0,1,2,3]) if (v > 1)] === [2,3],<br>\nobject[key] Subscript Operationen. Und sie umschliessen in ES6 [symbol]definierte Properties in Klassen und Objektliteralen. Klammern muessen immer in der richtigen Reihenfolge geschachtelt sein.";
    annotations["!!"] = "Zwei Ausrufezeichen wandeln den Ausdruck dahinter in einen Booleanwert um. Den kann man in einer logischen Verknuepfung auswerten, anstelle ein Objekt oder anderes Ergebnis, was der Ausdruck sonst ist, zwischen die Elemente der logischen Verknuefung (normal nur wahr und falsch) zu pappen..";
    annotations["||"] = "Der Default Operator || wertet, wenn der Ausdruck links falsch ist, den Ausdruck rechts aus.<br>Man kann damit logische Verknuepfungen und Regeln aufbauen. Mit variable = variable || 'defaultvalue' wird variable ein Wert zugewiesen, wenn ihrer undefined, null, false oder '' ist. Wurde variable gar nicht erst deklariert (mit var, let oder Parametern), gibt es einen ReferenceError: Undefinierte Variable.";
    annotations["&&"] = "Der Guard Operator && wertet den rechten Ausdruck nur aus, wenn der linke Ausdruck wahr ist.<br>Man kann damit logische Verknuepfungen und Regeln erstellen. Oder mit if (obj && obj.p) z.B. erstmal pruefen, ob eine Variable vorhanden ist. Ist sie (obj) es nicht, wird gar nicht auf den Folgewert (obj.p) zugegriffen und false anstelle des Ausdrucks gesetzt. Bei if (a && b) muessen beide wahr sein um in den if Block zu gelangen.";
    annotations["var"] = "Mit var deklariert man eine Variable. Sie wird intern nach oben gehoben und ist in der gesamten Funktion zu sehen. Zuerst mit undefined. Dann aber der Zeile, wo sie mit = einen Wert bekommt, gibt sie den Wert aus. Ab ES6 wird es let geben, womit man die Variable auf den Block beschraenkt. Sowie const, womit man nur lesbare Konstanten initialisieren kann. Eine const Variable kann man nur einmalig einen Wert zuweisen. var kann man jederzeit setzen. Ein var gilt fuer ihre Funktion und alle darin geschriebenen Funktionen. Ein Sonderfall ist noch die Funktion eval, die unter Umstaenden auch auf ihre Variablen zugreifen kann.";
    annotations["instanceof"] = "Ein binaerer Operator, object instanceof function. Prueft ob ein Objekt eine Instanz eines bestimmten Constructors ist. Hat dessen Prototype die Funktion als Constructor, ist instanceof auf jeden Fall true. Kann in JavaScript getrost vernachlaessigt werden und mit Duck-Typing (hasOwnProperty) und Einschaetzen des Objekts koennen Aufgaben besser geloest werden.";
    annotations["function"] = "Funktionen sind normale Objekte. Rufbare Objekte (engl. Callable). Man kann ihnen Properties zuweisen. Sie haben auch welche, wie ihren .name. Und Methoden wie .bind oder .call und .apply. In JavaScript sind functions first-class. Sie koennen als Statement gerufen werden, oder in Expressions. Sie koennen als Parameter uebergeben werden. Einfach einem Objekt, Array, einer Funktion mit . oder  [subscript] zuweisen. Mit () hinter dem Namen, kann man functions rufen. Wenn man sie einer Variable zuweist, wenn man sie schreibt, braucht sie keinen Namen. Das ist eine FunctionExpression. Eine FunctionDeclaration ist function gefolgt von einem Namen, Argumenten, dem FunctionBody Block und keinem Semikolon. Expresions haben ein Semikolon wie ein normaler Ausdruck hat.";
    annotations["arguments"] = "Das Arguments Objekt enthaelt alle Parameter, die beim Aufruf einer Funktion uebergeben wurden und ist nur innerhalb dieser gerufenen Funktion sichtbar. Ab ES6 gibt es ...rest RestParameter, die das arbeiten leichter machen.";
    annotations["JSRuntime"] = "JSRuntime ist die SpiderMonkey Laufzeitstruktur. Wird mit JSRuntime *rt = JS_CreateRuntime(bytes); gestartet. Mit der rt kann man dann den JSContext(rt, heapsize) erzeugen.";

    return {
        annotations: annotations,
        buttonNames: buttonNames,
        classAnnotations: classAnnotations
    };

});
