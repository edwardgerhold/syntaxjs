
var x = "root";

function f(a) {
    var x = "f";
    return g(a);
}

function g(a) {
    var x = "g";
    return h(a);
}

function h(a) {
    var x = "h";
    return a;
}

