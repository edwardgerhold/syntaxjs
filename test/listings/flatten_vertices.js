function vector(a,b,c) {
    return [a,b,c];
}
function matrix(v1,v2,v3,v4) {
    return [v1,v2,v3,v4];
}

function flatten(array) {
    let a, b, i;
    for (i=0; i < array.length; i++) {
	a = array[i];
	if (Array.isArray(a)) {
	    array = array.slice(0, i).concat(flatten(a)).concat(array.slice(i+1));
	} 
    }
    return array;
}

let matze = [
[    [1,2,3], [1,2,3], [1,2,3], [1,2,3]],
[    [1,2,3], [1,2,3], [1,2,3], [1,2,3]],
[    [1,2,3], [1,2,3], [1,2,3], [1,2,3]],    
    [1,2,3], [1,2,3], [1,2,3], [1,2,3]
];

console.log(JSON.stringify(flatten(matze)));