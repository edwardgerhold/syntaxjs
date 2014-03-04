class C {
    constructor(...args) {
	this.name = "Klasse C";
	this.pupil = "Eddie";
	this.sum = 0;
	args.forEach(a => this.sum+=a);
	
    }
}

let c = new C(1,2,3);
console.log(c.name);
console.log(c.pupil);
console.log(c.sum);
