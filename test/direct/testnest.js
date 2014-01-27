function f() {
    function g() {
	function h() {
	    function i() {
		debugger;
		return 10;
	    }
	    return i();
	}
	return h();
    }
    return g();
}
