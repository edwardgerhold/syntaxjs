/**
 * Created by root on 03.03.14.
 *
 * var parser = { a: function() { return node; }, b: function () { return node; } };
 * var decoration = { a: function (node) { node.x = true; return recode(node); }, b: function (node) { return recode(node); } };
 * var newParser = require("make-decorator").makeDecorator(parser, decoration);
 * makeFunction can be replaced by calling makeDecorator with fMaker (origO, decoratorO, function (origF, decF) { return decF.call(this, arguments); } }); or similar function
 */

define("make-decorator", function (require, exports) {

    function makeFunction (origF, decF) {
        return function () {
            return decF(origF.call(this, arguments));
        };
    }
    function makeFunction2 (origF, decF) {
        return function () {
            origF.call(this, arguments);
            decF.call(this, arguments);
        };
    }

    function makeDecorator(origObject, decoratingObj, fMaker) {
        var extended = {};
        if (fMaker == undefined) fMaker = makeFunction;
        for (var k in origObject) {
            if (Object.hasOwnProperty.call(origObject, k)
                && typeof origObject[k] === "function"
                && typeof decoratingObj[k] === "function")
            {
                extended[k] = fMaker(origObject[k], decoratingObj[k]);
            }
        }
        extended._decorated = origObject;
        return extended;
    }

    exports.makeDecorator = makeDecorator;
    exports.makeFunction = makeFunction;
    return exports;

});