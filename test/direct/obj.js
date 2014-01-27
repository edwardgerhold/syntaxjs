let obj = { 
f: function () { return 10; }, 
g() { return 20; } 
};
console.log(obj.f()+obj.g());	// formalparameters macht bei schl. keinen bug.
let dict = { 
get a () { return obj.f(); }, 
get b() { return obj.g(); }, 
set c(v) { this.v = v; } 
};
console.log(dict.a);
console.log(dict.b);
console.log(dict.c=20);
console.log(dict.v);
