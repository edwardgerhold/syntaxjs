let object = {
    name: "Edward",
    method() {
	let f;
	f = () => this.name;
	var s;
	s = f();
	console.log("s = "+s);
	return s;
    },
    method2() {
	return this.name;
    }
    
};

console.log(object.method());
console.log(object.method2());