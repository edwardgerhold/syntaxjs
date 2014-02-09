function f() {
    "use strict";
    this.xxx = 10;
}
function g() {
    this.xxx = 10;
}
try {
  f();
} catch (ex) {
    console.log("error with strictmode");
}

try {
  g();
} catch (ex) {
    console.log("error with nonstrictmode");
}