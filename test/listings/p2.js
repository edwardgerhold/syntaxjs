var resolve, reject;
var p = new Promise((r, re) => { resolve = r; reject = re; });

var handler = (value) => print(value), value;

var handler2 = function (value) { print(value); return value; };

p.then(handler, handler);

resolve("Hallo");

p.then(handler, handler);
p.then(handler2, handler);
p.then(handler2, handler);



