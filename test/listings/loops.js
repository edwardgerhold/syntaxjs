let str="let i = 0;\
let add = (a,b=2*i) => a+b;\
while (++i < 10) print(add(i));\
";

print(str);

let i = 0;
let add = (a,b=2*i) => a+b;
while (++i < 10) print(add(i));

str="for (let a = 0, b = 10; a < b; a+=1) {\
    let binding;\
    print(\"iteration \"+a+\", binding = \"+binding);\
    binding = add(a,b);\
    print(\"binding now\"+binding);\
}";

print(str);

for (let a = 0, b = 10; a < b; a+=1) {
    let binding;    
    print("iteration "+a+", binding = "+binding);
    binding = add(a,b);
    print("binding now a+b="+binding);
}

str = "let name = '';\
for (let x of ['E','d','w','a','r','d']) {\
    name += x\
}\
print(name);";

print(str);

let name = '';
for (let x of ['E','d','w','a','r','d']) {
    name += x
}
print(name);

str = "name='';\
let s = [for (x of ['E','d','w','a','r','d']) name+=x];\
print(name);";

print(str);

name='';
let s = [for (x of ['E','d','w','a','r','d']) name+=x];
print(name);
