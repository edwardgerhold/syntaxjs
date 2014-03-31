/**
 * Created by root on 31.03.14.
 */

// ===========================================================================================================
// floor, ceil, abs, min, max
// ===========================================================================================================

var floor = Math.floor;
var ceil = Math.ceil;
var abs = Math.abs;
var min = Math.min;
var max = Math.max;

function _floor(x) {
    return x - (x % 1);
}

function _ceil(x) {
    return x - (x % 1) + 1;
}

function _abs(x) {
    return x < 0 ? -x : x;
}

function sign(x) {
    return x < 0 ? -1 : 1;
}

function _min() {
    var min = Infinity;
    var n;
    for (var i = 0, j = arguments.length; i < j; i++)
        if ((n = arguments[i]) < min) min = n;
    return min;
}

function _max() {
    var max = -Infinity;
    var n;
    for (var i = 0, j = arguments.length; i < j; i++)
        if ((n = arguments[i]) > max) max = n;
    return max;
}




