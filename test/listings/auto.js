var el = "#testreport000"; 

/* Meine Alphabete */
var alpha = Object.create(null);
var abc = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","r","s","t","u","v","w","x","y","z"];
abc.forEach(function (a) { alpha[a] = 1; /*alpha[a.toUpperCase()] = 1; */ });
var num = [1,2,3,4,5,6,7,8,9,0];
var digit = Object.create(null);
num.forEach(function (d) { digit[d] = 1; });
var space = Object.create(null);
var spc = [" ", "\t", "\n" ];
spc.forEach(function (s) { space[s] = 1; });


// console.dir(alpha);

/* Die Variablen fuer den aktuellen Textzeiger, das Token, der Array mit den Token */
console.log( "Zwischenstop");

var pos = -1;
var ch;
var lookahead;
var token, tokens;
var text, len;

/* Alle Variablen resetten, ein Zeichen voranschreiten, parse nimmt source und returnt token */

function reset(t) {
    text = t;
    pos = 0;
    ch = undefined;
    lookahead = text[0];
    token = undefined;
    tokens = [];
    len = text.length;
}

function advance() {
    ch = lookahead;
    lookahead = text[++pos];
    return ch;
} 

function parse (t) {
    reset(t);
    return delta("start", advance());
}

console.log( "Zwischenstop 2");

/* Der Name ist an die Transitionsfunktion angelehnt. Der Rest ist Marke Eigenbau. */

function delta(state, ch) {
	console.log("delta with state "+state+ " and ch "+ch + " and pos " +pos) ;
	switch (state) {
	case "start":
	    if (ch === undefined) state = "exit";
	    else if (alpha[ch]) state = "alpha";
	    else if (digit[ch]) state = "number";
	    else if (space[ch]) state = "space";
	    else state = "err";
	    token = "";
	    return delta(state, ch);
	break;
	case "alpha":
	    token += ch;
	    if (!alpha[lookahead]) { // falls kein weiterer buchstabe kommt, aendere zustand auf start
		state = "start";
		tokens.push({ type: "Word", value: token });
	    }
	    return delta(state, advance()); // ansonsten wiederhole den zustand
	break;
	case "number":
	    token += ch;
	    if (!digit[lookahead]) {
		state = "start";
		tokens.push({ type: "Number", value: token });
	    }
	    return delta(state, advance());    
	break;
	case "space":
	    token += ch;
	    if (!space[lookahead]) {
		state = "start";
		tokens.push({ type: "Space", value: token });
	    }
	    return delta(state, advance());
	break;
	case "err": 
	    console.log( "invalid character");
	    state = "exit";
	    return delta(state, undefined);
	break;
	case "exit":
	    return tokens;
	break;
    }
}

/* Erinnert mich daran, dass HTML5 einen Automaten vorschreibt. */

function print (token, num) { 
    console.log( "#"+num+" { "+token.type+" => "+token.value+" };"); 
}

/* Aber erstmal sollte ich lernen, wie der formal richtige Automat aussieht. */


console.log( "Zwischenstop 3");

try {
var a1 = parse("abcdef");
a1.forEach(print);
var a2 = parse("abcdef123434");
a2.forEach(print);
var a3 = parse("abcdef 123434");
a3.forEach(print);
var a4 = parse("abcdef 123434");
a4.forEach(print);
} catch (ex) {
console.log( "["+ex.name+"]: "+ex.message+" - "+ex.stack);
}

a1 = parse("ab");
a1.forEach(print);
console.log( "Zwischenstop 4");

/* Danach kann ich ihn immernoch verbessern */

/* Gottseidank weiss ich jetzt, dass der Code nicht funktioniert, obwohl er funktionert. */

