let str = "let a = [2];\
a.unshift(1);\
console.log(a.join());";
print(str);
let a = [2];
a.unshift(1);
print(a.join());

str = "let b = [2,3,4,5];\
let x = b.filter(e => e > 3);\
print(x.join());";
print(str);
let b = [2,3,4,5];
let x = b.filter(e => e > 3);
print(x.join());

str="a = [5,3463,636];\
a.forEach(print);";

print(str);
a = [5,3463,636];
a.forEach(print);
