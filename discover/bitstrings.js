/*

  Trying | to set bits
  trying & to ask for bits
  comparing with a resulting integer (a sum of powers of 2)
  left padding a string created with Number.prototype.toString(2) to 52 bits to look at it
  
  This file has the same aim like mv?.js have, to teach me a few rules to work with numbers
  and strings.
  
  For a correct numeric parsing and processing i should use +value and parseFloat and parseInt
  and Number.prototype.toString to receive results without rounding errors.
  
  You see mv1+2 had rounding errors. mv3 has none, coz i shifted the . by Math.pow(base10, -commaPos).
  All this has to be noticed and captured.
  
  For that i made the special directory /discover

*/

// Left padding. http://wiki.ecmascript.org/doku.php?id=strawman:string_extensions hat String.prototype.lpad 

function lpad(s) {
    var lpad = "";
    var len = 52-s.length;
    var i = 0;
    while (i < len) {
	lpad += "0"
	i++;
    }
    return lpad + s;
}

// Macht einen 52 Bit String aus dem Base-2 toString durch left padding mit 000
function bitstr(n) {
    return lpad((+n).toString(2));
}

// Ausprobieren

console.log("ausgabe");
console.log(bitstr(128));
console.log(bitstr(127));
console.log(bitstr(128 | 127));

/*

 Bits verknüpft man mit |
 
 Wenn man alle Bits setzen will, muss man sie ODERn.
 
*/
console.log("oder");
console.log(bitstr(1 | 2 | 4 | 8 | 16 | 32 | 64 | 128)); // whole byte set
console.log(bitstr(1 | 32));				// 0(1) und 5(6) set
console.log(bitstr(1 | 2 | 32));			// 0,1,5 set
console.log(bitstr(1 | 2 | 4 | 32));			// 0,1,2,5 set

console.log((1 | 2 | 4 | 32) === 39)			// 39 is the number
/*
 Bits testet man mit &

 Werden die Bits benötigt, um die Zahl darzustellen,
 kommt die gleiche Zahl bei der Verknüpfung raus

*/
console.log("und");
console.log(bitstr(127 & 32)); // enthaelt 32
console.log(bitstr(128 & 32)); // enthaelt 32 nicht
console.log(bitstr(127 & 64)); // enthaelt auch 64 
console.log(bitstr(128  & 64)); // enthaelt 64 nicht

console.log((127 & 64) === 64); // enthaelt auch 64 
console.log((128  & 64) === 0); // enthaelt 64 nicht

/*
ausgabe
0000000000000000000000000000000000000000000010000000
0000000000000000000000000000000000000000000001111111
0000000000000000000000000000000000000000000011111111
oder
0000000000000000000000000000000000000000000011111111
0000000000000000000000000000000000000000000000100001
0000000000000000000000000000000000000000000000100011
0000000000000000000000000000000000000000000000100111
true
und
0000000000000000000000000000000000000000000000100000
0000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000001000000
0000000000000000000000000000000000000000000000000000
true
true
*/