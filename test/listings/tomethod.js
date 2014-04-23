// function to call a super somewhere
function f() {
    return super();
}

// some object with a method
let obj1 = {
    f() {
	return "Yes, ich bin eine mit super() gerufene Methode";
    }
};

debug(obj1);
 

let obj2 = {
    // __proto__:obj1 /* irrelevant */
    h() {
	return "Oh no, i am yet another object, which got bound with toMethod()";
    }
};                

debug(obj2);

obj2.f = f.toMethod(obj1, "f");

console.log(obj2.f());

var f2 = f.toMethod(obj1, "f");

console.log(f2());

var f3 = f.toMethod(obj2, "h");

console.log(f3());
