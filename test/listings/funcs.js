function f() {
    var a = "Hallo";
    var b = "Welt";
    var c = "Geld";
    
    f.state = !!(!f.state);
    if (f.state) {
	print(a + " " + b);
    } else {
	print(a + " " + c);
    }
}

f()
f()
f();