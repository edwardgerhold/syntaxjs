function f(...rest) {
    return rest.join();
}
console.log(f(1,2,3,4));

let g = (...rest) => { return rest.join(); };
console.log(g(2,3,4,5));


