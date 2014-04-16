
class C {
    constructor(...args) {
	    args.forEach((x,i) => this[i] = x);
    }
    method () {
    	return "method from class C";
    }
}

class D extends C {
    constructor (...args) {
	super(...args);
    }

    method() {
	return "method from class D " + super();
    }
}

let d = new D("tach");

console.log(d.method());
console.log(d[0]);


class E extends D {
    method() {
        return "method from class E " + super();
    }

}

let e = new E("Edward");
console.log(e.method());
console.log(e[0]);
