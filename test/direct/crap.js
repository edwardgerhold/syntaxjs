// Das ist Zeugs zum abtesten, kein Programm, halt ein bisschen Schrott, von der Idee zum ersten Eingetippten

var name = "Edward";
var es6 = "ist toll";
var tmpl = `${name} findet es6 ${es6}!`;
var template = "Eine Korrektur am Ablauf ist noch vorzunehmen.";
var idiot = `${template}`;

var ii = 0;
var jj = 10;
var s = "";

for (let i = 0, j = 10; i < j; i++) {
    s = s+i;
}

function F(a) {
    return a;
}


F[Symbol.create] = Function[Symbol.create];

const C = 1024;
const O = {
    name: "Eddie",
    count: 0,
    [Symbol.toStringTag]: "Eddie",
    member() { return this.name; }
};
var fun_expr = () => "ein Statement wert";
var _content = `${O.member()} sagt auch es6 sei ${fun_expr()}!`;


let a = 0,b = 0,
c = 0,d=0;
var w,x,y,z;


function objup () {
    return O.count += 1;
}
function objsub () { return O.count -= 1; }
function objmul () { return O.count *= O.count; }
function objdiv () { return O.count /= O.count; }
function objrest (n) { return O.count % n; }


function f() {
    ++a;
}
function args (a,b,c,d) {
    return arguments;
}
function recur(i) {
    ++b;
    if (i > 0) recur(i-1);
}

function testInstantiateFunctionDeclaration(x,y,...z) {
    var a,b,c,d;
    const e,f,g,h;
    let i,j,k,l;
    a=x;
    e=y;
    i=z;
    return [a,e,...i];
}

let dest_help = () => O;

let apropos = (a,b,c) => [a,b,c];

let rest_dazu = (...rest) => rest; 

let test_cover_by_defaults = (a=1,b=2,c=3) => [a,b,c];

let [gg,hh,...missing] = [1,2,3,4,5,6,7,8,9,10,"und den Rest in die lhs",11,12,13,14,15,16,17,18,19,20];

let aa = [1,2,3];
let it1 = aa.keys();
let it2 = aa.values();
let it3 = aa.entries();
let r1 = it1.next();
let r2 = it2.next();
let r3 = it3.next();
