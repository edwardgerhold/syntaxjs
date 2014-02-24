// expensive version
// my first impressions in converting numbers

// this one produces rounding errors and is a) linear
// and b) 2* linear, because i search for "." to make it easy for the first try

function MV (string, type) {
	var nval = 0;
	if (type === undefined || type === "dec") {
		var dot = string.indexOf(".");
		if (dot == -1) {
			for (var i = string.length-1, j = 0, k = 0; i >= j; i--, k++) {
				nval += Math.pow(10, k) * string[i];
			}
		} else {

			for (var i = dot-1, j = 0, k = 0; i >= j; i--, k++) {
				nval += Math.pow(10, k) * string[i];
			}
			for (i = dot+1, j = string.length, k = -1; i < j; i++, k--) {
				nval += Math.pow(10, k) * string[i];
			}
		} 
	} else if (type == "oct") {


	} else if (type == "hex") {

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
