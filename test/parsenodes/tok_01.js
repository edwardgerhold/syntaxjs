var s = require("../../syntax0.js").syntaxjs;

console.dir(s.tokenize("let x = 10; x;"));
console.dir(s.tokenize.nextToken());
console.dir(s.tokenize.nextToken());
console.dir(s.tokenize.nextToken());
console.dir(s.tokenize.nextToken());
console.dir(s.tokenize.nextToken());
console.dir(s.tokenize.nextToken());
console.dir(s.tokenize.nextToken());
console.dir(s.tokenize.nextToken());

