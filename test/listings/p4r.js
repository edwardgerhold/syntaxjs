// call with node 
var fs = require("fs");
var sjs = require("../../syntax0.js");
var realm = sjs.createRealm();
setTimeout(function () { console.log("Test"); });
realm.evalAsync("let x = 10; x;").then(function (result) {
    console.log("RESULT " + result);
});

