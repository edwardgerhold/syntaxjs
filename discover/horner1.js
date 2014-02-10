/*
 "Horner Schema" seen in "Digitaltechnik und Entwurfsverfahren"
 The Lecture 1 (c) KIT http://webcast.informatik.kit.edu
    
    The formula i can read:
    Xb is the epsilon sum of z[i] times b^i from i=0 to n.

    Taken from the Slide with help of:
    15741 = (((1*10+5)*10+7)*10+4)*10+1
    

 This file
 Written by Edward Gerhold for educational purposes. :-)

    The function
*/

var decVals = {0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9};

function stringToBase10(string) {
    var nval = decVals[string[0]];
    for (var i = 1, j = string.length; i < j; i++) {
	nval *= 10, nval += decVals[string[i]];
    }
    return nval;
}
console.log(stringToBase10("1234567890"));
console.log(stringToBase10("1000000"));
/*
1234567890
1000000
*/
