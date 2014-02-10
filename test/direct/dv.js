let ab = new ArrayBuffer(2048);
let dv = new DataView(ab);
console.log("dv.buffer == ab ? "+(dv.buffer === ab));
console.log("dv.byteLength = "+ dv.byteLength);
console.log("dv.byteOffset = "+ dv.byteOffset);


let ab2 = new ArrayBuffer(3072);
let dv2 = new DataView(ab2,1024);
console.log("dv2.buffer == ab2 ? "+(dv2.buffer === ab2));
console.log("dv2.byteLength = "+ dv2.byteLength);
console.log("dv2.byteOffset = "+ dv2.byteOffset);

