let f = a => a;
console.log(f(10));
console.log(f(f(f(10)));
let g = (a=1,b=20) => { return a+b; };
console.log(g.toString());
console.log(g());


