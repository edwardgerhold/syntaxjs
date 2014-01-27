var s = "";
for (let i = 0, j = 10; i < j; i++) {
    s = s+i;
}

const C = 1024;
let a = 0,b = 0,
c = 0,d=0;
var w,x,y,z;

const obj = {
    count: 0,
    up (x=1) {
	this.count += x;
    },
    dn (x=1) {
	this.count -= x;
    }
};

function f() {
    ++a;
}


function args (a,b,c,d) {
    var hmm;
    hmm = arguments;
    return hmm;
}


function args_evaluation_before_args_questionmark_to_me_period (a,b,c,d) {
    var hmm = arguments; // bug, ergibt Reference Error per GetValue: hmmm ist unresolvable reference.
    return hmm;
}


function recur(i) {
    ++b;
    if (i > 0 && i % 2) recur(i-2);
    if (i > 0) recur(i-1);
}

function r(...rest) {
    return rest;
}

/*
function p({x,y}, [z,d]) { // muss den parser nochmal updaten. 
    return [x,y,z,d];
}
*/
/*
function add([a,b]) {
    return a + b;
}*/
/*
function pp({x,y}) { 
    return {x,y};
}
*/
