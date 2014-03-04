console.log("start");
let array = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
function *forLoop() {
    for (let i = 0, j = array.length; i < j; i++) {
	yield array[i];
    }
}

let iterator = forLoop();
let result;
console.log("while:");
while (result = iterator.next()) {
    if (result.done) break;
    console.log(result.value);
}
console.log("end while");
