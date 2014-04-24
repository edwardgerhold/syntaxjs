function a() {
    return b();
    function b() {
	return c();
	function c() {
    	    return d();
	    function d() {
		return e();
		function e() {
		    return f();
		    function f() {
		        return g();
			function g() {
			    return h();
			    function h() {
			        return i();
				function i() {
				    return j();
				    function j() {
				        return k();
					function k() {
					    return l();
					    function l() {
						return m();
						function m() {
						    return "Hallo Leute - Das ist nur 12 Funktionen tief";
						}
					    }
					}
				    }
				}
			    }
			}
		    }
		}
	    }
	}
    }
}
console.log(a());
