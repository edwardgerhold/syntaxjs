let compr = [for (x of [1,2,3,4,5,6]) if (x >2) x+2];
console.log(compr.join());

let a2 = ["E","d","w","a","r","d"];

let c2 = [for (x of a2) if (x == "E" || x === "a") x];

console.log(c2.join());
