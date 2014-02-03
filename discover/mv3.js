// still expensive version
// my first impressions in converting numbers

var hexVals = { 0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,a:10,A:10,b:11,B:11,c:12,C:12,d:13,D:13,E:14,e:14,f:15,F:15 };
var octVals = { 0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:NaN,9:NaN};
var isX = {x:true,X:true};
var isO = {o:true,O:true};

function MV (string, type) {
	var nval = 0;
	var w, x = 0, y;
	var base;
	var vals;
	if (isX[string[1]]) type = "hex", x = 2;
	else if (isO[string[1]]) type = "oct", x = 2;
	if (type === undefined || type === "dec") {
		base = 10;
		for (var i = string.length-1, j = 0, k = 0; i >= j; i--, k++) {
			if ((w =string[i]) !== ".") nval += Math.pow(base, k) * w;
			else y = i+1, k-=1;
		}
		if (y != undefined) nval *= Math.pow(base,-(string.length-y));
		return nval;
	} else if (type === "oct") {
		base = 8;
		vals = octVals;
	} else if (type === "hex") {
		base = 16;
		vals = hexVals;
	}
	for (var i = string.length-1, j = 0+x, k = 0; i >= j; i--, k++) {
		nval += Math.pow(base, k) * vals[string[i]];
	}
	return nval;
}


var numbers = [
	"1234", "12.34", "115134", "121.354", "8748", "4845.457"
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

/*
1234:1234 = 1234 (1234)
12.34:12.34 = 12 (12.34)
115134:115134 = 115134 (115134)
121.354:121.354 = 121 (121.354)
8748:8748 = 8748 (8748)
4845.457:4845.457 = 4845 (4845.457)
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
*/