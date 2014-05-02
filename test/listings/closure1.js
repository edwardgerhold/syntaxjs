function f(a) {
    return function f2(b) {
	return a + b;
    }
}

console.log("f(1)(2) === " + f(1)(2));
console.log("f(1)(2) === " + f(3)(4));

function g(...rest) {
    return function h(b) {
	return rest.map(x => x*b);
    }    
}

console.log("g(1,2,3)(3) === "+ g(1,2,3)(3).join());
console.log("g(1,2,3)(5) === "+ g(1,2,3)(5).join());


