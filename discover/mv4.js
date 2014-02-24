// my first impressions in converting numbers

// this version has no rounding errors.
// i do not add pieces under zero, i shift the .
// and raise by the exponent.
// by that way, it saves time in the function, too.

var decVals = { 0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9 };
var hexVals = { 0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,a:10,A:10,b:11,B:11,c:12,C:12,d:13,D:13,E:14,e:14,f:15,F:15 };
var octVals = { 0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:NaN,9:NaN};
var binVals = { 0:0,1:1 }; // undefined coerces to NaN
var isX = {x:true,X:true};
var isO = {o:true,O:true};
var isB = {b:true,B:true};
var isExp = {e:true, E:true};
var isDot = {".":true};
var isSign = {"+":true,"-":true};
var isExpOrSign = {e:true,E:true,"+":true,"-":true};
var signVal = {"+":1,"-":-1};

function MV (string, type) {
	var nval = 0;
	var v, w, x = 0, y;
	var base, vals;
	var exp = 0;
	var expSign = 1;
	var strlenExp = 0;
	var sign = 1;
	w = string[0];
	if (isSign[w]) sign = signVal[w], x = 1;
	w = string[x+1];
	if (isX[w]) type = "hex", x += 2;
	else if (isB[w]) type = "bin", x += 2;
	else if (isO[w]) type = "oct", x += 2;
	if ((x > 1) && string[x-2] != "0") throw new SyntaxError("invalid start of a numeric literal");
	if (type === undefined || type === "dec") {
		base = 10;
		for (var i = string.length-1, j = 0, k = 0; i >= j; i--, k++) {
			if ((w = string[i]) !== ".") {
			    if (!isExpOrSign[w]) {
			    	if ((w=decVals[w]) === undefined) throw new SyntaxError("invalid character "+w+" in numeric literal of type decimal");
			    	nval += Math.pow(base, k) * w;
			    } else {		
			    	if (!isSign[w]) {
			    		exp = nval - expSign;
			    		nval = 0;
			    		k = 0;
			    	} else {
			    		strlenExp = string.length - i - 1;
			    		expSign = signVal[w];
			    		k -= 1;
			    	}
			    }
			} else y = i+1, k-=1;
		}
		var exp2; 
		if (exp != undefined) exp2 = expSign * exp;
		if (y != undefined) exp2 = exp2 - (string.length-strlenExp-y);
		nval *= Math.pow(base, exp2);	// der dot.
		return sign * nval;
	} else if (type === "bin") {
	    base = 2;
	    vals = binVals;
	} else if (type === "oct") {
	    base = 8;
	    vals = octVals;
	} else if (type === "hex") {
    	base = 16;
    	vals = hexVals;
	}
	for (var i = string.length-1, j = 0+x, k = 0; i >= j; i--, k++) {
		if ((v = vals[string[i]]) === undefined) throw new SyntaxError("invalid character "+v+" in numeric literal of type "+type);
		nval += Math.pow(base, k) * v;
	}
	return sign * nval;
}


var numbers = [
	"1234", "12.34", "115134", "121.354", "8748", "4845.457", "10e1","10e3","10e4","10e6","1e7","123.123e45",
	"10e-1","10e-3","10e-4","10e-6","1e-7","123.123e-45"
];
numbers.forEach(function (nStr) {
	console.log(nStr+":" + MV(nStr)+ " = "+parseInt(nStr,10) + " ("+parseFloat(nStr,10)+")");
});

var octNumbers = [
	"0o167", "0o123", "0o366", "0o235", "0o235", "0o252"
];
octNumbers.forEach(function (nStr) {
	console.log(nStr+":" + MV(nStr, "oct") + " = "+parseInt(nStr.substr(2),8));
});

var hexNumbers = [
	"0xff", "0x123abcde", "0xcdefabcd", "0x012345", "0xf", "0xa", "0x7", "0xab", "0xfe"
];
hexNumbers.forEach(function (nStr) {
	console.log(nStr+":" + MV(nStr, "hex") + " = "+ parseInt(nStr.substr(2), 16));
});

var binNumbers = [
	"0b1", "0b11", "0b10", "0b1111", "0b1001", "0b1000", "0b1010", "0b1111111"
];
binNumbers.forEach(function (nStr) {
	console.log(nStr+":" + MV(nStr, "hex") + " = "+ parseInt(nStr.substr(2), 2));
});

/*
1234:1234 = 1234 (1234)
12.34:12.34 = 12 (12.34)
115134:115134 = 115134 (115134)
121.354:121.354 = 121 (121.354)
8748:8748 = 8748 (8748)
4845.457:4845.457 = 4845 (4845.457)
10e1:100 = 10 (100)
10e3:10000 = 10 (10000)
10e4:100000 = 10 (100000)
10e6:10000000 = 10 (10000000)
1e7:10000000 = 1 (10000000)
123.123e45:1.23123e+44 = 123 (1.23123e+47)	// <..
10e-1:1 = 10 (1)
10e-3:0.01 = 10 (0.01)
10e-4:0.001 = 10 (0.001)
10e-6:0.000009999999999999999 = 10 (0.00001)	// <..
1e-7:1e-7 = 1 (1e-7)
123.123e-45:1.23123e-45 = 123 (1.23123e-43)			// <..
0o167:119 = 119
0o123:83 = 83
0o366:246 = 246
0o235:157 = 157
0o235:157 = 157
0o252:170 = 170
0xff:255 = 255
0x123abcde:305839326 = 305839326
0xcdefabcd:3455036365 = 3455036365
0x012345:74565 = 74565
0xf:15 = 15
0xa:10 = 10
0x7:7 = 7
0xab:171 = 171
0xfe:254 = 254
0b1:1 = 1
0b11:3 = 3
0b10:2 = 2
0b1111:15 = 15
0b1001:9 = 9
0b1000:8 = 8
0b1010:10 = 10
0b1111111:127 = 127
*/