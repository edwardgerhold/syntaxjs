function f() {
    return super();
}

let obj1 = {
    f() {
	return "yes";
    }
};

debug(obj1);
 
let obj2 = {
     __proto__: obj1
};                

debug(obj2);

obj2.f = f.toMethod(obj1, "f");

console.log(obj2.f());
