class D {

    static method() {
	return 100;
    }
    
    method() {
	return 500;
    }
}

console.log(D.method());
console.log((new D).method());