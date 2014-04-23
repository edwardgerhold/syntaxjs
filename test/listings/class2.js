
class C {
    constructor(...args) {
	args.forEach((x,i) => this[i] = x);
    }
    method () {
	return { instance: true, xxx: true };
    }
}

class D extends C {
    constructor (...args) {
	super(...args);
    }
    method() {
	return super();
    }
}
let d = new D("tach");
let obj = d.method();

console.dir(obj);
