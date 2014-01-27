function f(a=10, b) {
    return a + b;
}

function g(...rest) {
    let [y,...less] = rest;
    console.log("y = "+y);
    return less;
}

function h(b) {
    let x = [];
    for (let i = 0; i < b; i++) {
	x.push(f(undefined,i));
    }
    return g(x);
}

console.log(h(10));
