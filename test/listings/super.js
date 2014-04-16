function f() {
    return super();
}

var obj1 = {
    f() {
	return "yes";
    }
};

debug(obj1);

var obj2 = {
    __proto__: obj1
};

debug(obj2);

obj2.f = f.toMethod(obj2);

console.log(obj2.f());
