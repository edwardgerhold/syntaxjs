var b = 0;

function recur(i) {
    console.log("parm = "+i);
    console.log("b vorher = "+b);
    ++b;
    console.log("b nachher = "+b);
    console.log("i="+i+", b="+b);
    console.log("1. vgl= "+ ((i > 0) && (i % 2)));
    
    if ((i > 0) && (i % 2)) {
	recur(i-2);
    }
    console.log("2. vgl = "+(i>0));
    if (i > 0) recur(i-1);
    
}

recur(10);
