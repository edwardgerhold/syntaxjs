/*

    This file shows a principle for setting a property descriptors boolean
    attributes as bits (a multiple of two) by adding or subtracting it´s 
    value (or using & and and ^ xor). Testing with &. 

*/

var desc = { flags: 0 };

function setEnumerable(descriptor, value) {
    if (value) {
	if ((descriptor.flags & 4) === 0) descriptor.flags |= 4; /* += 4 */
    } else {
	if ((descriptor.flags & 4) === 4) descriptor.flags ^= 4; /* -= 4 */
    }
}
function isEnumerable(descriptor) {
    return (descriptor.flags & 4) === 4;
}

function setConfigurable(descriptor, value) {
    if (value) {
	if ((descriptor.flags & 2) === 0) descriptor.flags += 2; /* |= 2 */
    } else {
	if ((descriptor.flags & 2) === 2) descriptor.flags -= 2; /* ^= 2 */
    }
}
function isConfigurable(descriptor) {
    return (descriptor.flags & 2) === 2;
}	

setEnumerable(desc, false);
console.log(isEnumerable(desc));
setEnumerable(desc, true);
console.log(isEnumerable(desc));
setConfigurable(desc, false);
console.log(isConfigurable(desc));
setConfigurable(desc, true);
console.log(isConfigurable(desc));
setEnumerable(desc, false);
setConfigurable(desc, false);
console.log(isEnumerable(desc));
console.log(isConfigurable(desc));
setEnumerable(desc, true);
setConfigurable(desc, false);
console.log(isEnumerable(desc));
console.log(isConfigurable(desc));
setEnumerable(desc, false);
setConfigurable(desc, true);
console.log(isEnumerable(desc));
console.log(isConfigurable(desc));
setEnumerable(desc, true);
setConfigurable(desc, true);
console.log(isEnumerable(desc));
console.log(isConfigurable(desc));
setEnumerable(desc, false);
setConfigurable(desc, false);
console.log(isEnumerable(desc));
console.log(isConfigurable(desc));