function F () {
    this.good = true;
}

class C {

    method() {
	return "Methode";
    }
    
    static method() {
	return "Statische Methode";
    }
    
}
console.log(C.method());
let c = new C();
console.log(c.method());
console.log(c.good);

class D extends C {
    method() {
	return "overwritten method";
    }
}

let d = new D();
console.log(d.method());