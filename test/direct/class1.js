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