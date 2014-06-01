let a = [1,6,2,7,3];

console.log(a.sort(function (a, b) {
    console.log("a="+a);
    console.log("b="+b);
    console.log("r="+(a > b));
    return a > b;
}).join());

console.log(a.sort().join());