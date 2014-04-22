let ab = new ArrayBuffer(1000);
let dv = new DataView(ab);
dv.setInt32(0,100);
console.log(dv.getInt32(0));