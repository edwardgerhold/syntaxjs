class C {
    method(a,b,c=3) {
	console.log("method");
	return a+b+c;
    }
    noDefaults(a,b) {
	console.log("nodefaults");
	return a+b;
    }
}

let c = new C();
c.noDefaults(1,2);
c.method(1,2);
    
