class C extends Array {
    constructor(...args) {
	super(...args);
    }
    method() {
	return "method called";
    }
    static method() {
	return "static method called";
    }/*
    push(...args) {
	return super(...args);
    }
    pop(...args) {
	return super(...args);
    }  */  
}