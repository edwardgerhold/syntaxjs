module test {
    function assert(actual, expected, message) {
	var pass = actual === expected;
	if (!pass)  {
	    throw new Error(message);	
	}
    }
    export assert;
}
module rest {
    let a = 10;
    let b = 20;
    let c = 30;

    function add () {
	import assert from test;
	assert(a+b+c, 60, "a+b+c ergeben 60");
    }
    
    export add;
}