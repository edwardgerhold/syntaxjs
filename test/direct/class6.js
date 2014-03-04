class C extends Array {
    constructor(...args) {
	super(...args);
    }
}

let c = new C(7);
c.push(1);
c.push(2);
c.length;