// expensive version
// my first impressions in converting numbers

// this one produces rounding errors and is a) linear
// and b) one extra n iteration, because i search for "." to make it easy for the first try

// for the JavaScript Version i should stick with +str and parseFloat and parseInt(str, base).
// anything else is more complexity than it already has. I mean, i added Type checking, too. ;-).

var hexVals = { 0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,a:10,A:10,b:11,B:11,c:12,C:12,d:13,D:13,E:14,e:14,f:15,F:15 };
var isX = {x:true,X:true};

function MV (string, type) {
	var nval = 0;
	if (type === undefined || type === "dec") {
		var dot = string.indexOf(".");
		if (dot == -1) {
			for (var i = string.length-1, j = 0, k = 0; i >= j; i--, k++) {
				nval += Math.pow(10, k) * string[i];
			}
		} else {
			// i could recursivly call mv to do left of dot and right of dot.
			for (var i = dot-1, j = 0, k = 0; i >= j; i--, k++) {
				nval += Math.pow(10, k) * string[i];
			}
			for (i = dot+1, j = string.length, k = -1; i < j; i++, k--) {
				nval += Math.pow(10, k) * string[i];
			}
		} 
	} else if (type == "oct") {
		for (var i = string.length-1, j = 0, k=0; i >= j; i--, k++) {
			nval += Math.pow(8, k) * string[i];
		}
	} else if (type == "hex") {
		if (isX[string[1]]) x = 2; else x = 0;
		for (var i = string.length-1, j = 0+x, k=0; i >= j; i--, k++) {
			nval += Math.pow(16, k) * hexVals[string[i]];
		}
	}
	return nval;
}

// on the blackboard i have seen conversion by dividing through 2 and adding bits
// i am a bit confused about which of the things to do, but a while of practice can help here.

var numbers = [
	"1234", "12.34", "115134", "121.354", "8748", "4845.457"
];
numbers.forEach(function (nStr) {
	console.log(nStr+":" + MV(nStr));
});

var octNumbers = [
	"167", "123", "366", "235", "235", "252"
];
octNumbers.forEach(function (nStr) {
	console.log(nStr+":" + MV(nStr, "oct") + " = "+parseInt(nStr,8));
});

var hexNumbers = [
	"0xff", "123abcde", "cdefabcd", "012345", "f", "a", "7", "ab", "fe"
];
hexNumbers.forEach(function (nStr) {
	console.log(nStr+":" + MV(nStr, "hex"));
});
/*
1234:1234
12.34:12.34
115134:115134
121.354:121.354
8748:8748
4845.457:4845.456999999999
167:119 = 119
123:83 = 83
366:246 = 246
235:157 = 157
235:157 = 157
252:170 = 170
0xff:255
123abcde:305839326
cdefabcd:3455036365
012345:74565
f:15
a:10
7:7
ab:171
fe:254
*/
