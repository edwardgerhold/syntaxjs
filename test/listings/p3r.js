// call with node 
var fs = require("fs");
var sjs = require("../../syntax0.js");
var realm = sjs.createRealm();
console.dir(realm.evalFile("p2.js"));