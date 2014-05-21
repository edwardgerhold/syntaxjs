var s = require("../../syntax0.js").syntaxjs;


var realm = s.createRealm();

var r = realm.eval0("10");
console.log(r);

var r = realm.eval0("true");
console.log(r);


var r = realm.eval0("'abc'");
console.log(r);
