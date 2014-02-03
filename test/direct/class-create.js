// Discovered on es-discuss
// Correct pattern to initialize a custom object with class

class C {

    // C[@@create] returns the object to be intialized 
    static [Symbol.create]() {
	return {
	    __id__: Math.random(),
	    __creator__: "C"
	};
    }

    // C intialises the object after @@create
    constructor (...args) {
	this.__options__ = args;
    }

}

let c = new C();
console.dir(c);
