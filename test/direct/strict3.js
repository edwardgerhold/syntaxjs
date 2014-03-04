// shouldnt throw and clobber the global

function F() {
    this.xxx = "gdfgdfg";
}

F();


