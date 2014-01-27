let raw = String.raw;
let a = 10, b = 20, c = 30;

console.log("raw`${a}+${b}+${c}`");
console.log(raw`${a}+${b}+${c}`);


var name = "Edward";
var value = "Gerhold";
var templ = `${name}=${value}`;

console.dir(templ);

console.log("String.raw(templ)");
console.log(String.raw(templ));