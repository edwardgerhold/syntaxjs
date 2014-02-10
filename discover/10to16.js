/*
 Decimal to Hexadecimal seen in "Digitaltechnik und Entwurfsverfahren"
 The Lecture 1 (c) KIT http://webcast.informatik.kit.edu
    
    Euclidean Algorithm.
    Get the highest power of 16 being less or equal than the number.
    Divide by that power. You get a letter.
    Take the rest. 
    Take one off the power. Divide by that power. You get the next letter.


 This file
 Written by Edward Gerhold for educational purposes. :-)

    The function
*/

var hexLett = {0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:"A",11:"B",12:"C",13:"D",14:"E",15:"F"};
var hexVals = {0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,A:10,B:11,C:12,D:13,E:14,F:15};
var decVals = {0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9};

function string10ToBase16(base10string) {
    var number = +base10string; // stringToBase10(base10string)
    var remainder;
    var sval = "";
    var i = 0;
    while (Math.pow(16, i+1) <= number) ++i;
    while (Math.pow(16, i) > number) --i;
    remainder = number;
    while (remainder > 10e-8) {
	number = Math.floor(remainder / Math.pow(16, i));
	remainder = remainder % Math.pow(16, i);
    	sval += hexLett[number];
	i = i - 1;
    }
    return sval;
}

console.log(string10ToBase16("1"));
console.log(string10ToBase16("15"));
console.log(string10ToBase16("16"));
console.log(string10ToBase16("32"));
console.log(string10ToBase16("33"));
console.log(string10ToBase16("255"));
console.log(string10ToBase16("65565"));
console.log(string10ToBase16("65564"));
console.log(string10ToBase16("65563"));
/*
1
F
1
2
21
FF
1001D
1001C
1001B
*/