var x = 1;
console.log("1 ohne block x="+x);
{
    let x = 10;
    let y = 20;
    console.log("10 erster block x="+x);
    console.log("20 erster block y="+y);
    {
	let x = 100;
	let a = 100;
	console.log("100 zweiter block x="+x);
	console.log("100 zweiter block a="+a);
    }
    console.log("10 erster block 2. x="+x);
}
console.log("1 ohne block 2. x="+x);