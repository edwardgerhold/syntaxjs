function *gen (x) {
    yield 1;
    yield x;
}

let it = gen(10);

console.log(it.next());
console.log(it.next());
console.log(it.next());
