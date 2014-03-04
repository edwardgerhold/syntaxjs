//try {

    class C extends Array {
	method () { return this.length; }
    };

    let c = new C();

//} catch (ex) {
//    console.log(ex);
//}


class D {
    constructor(a,b,c) {
	this.one = a;
	this.two = b;
	this.three = c;
    }
    method () { return 10; }
}

let d = new D(1,2,3);

console.log(d.one);
console.log(d.two);
console.log(d.three);

