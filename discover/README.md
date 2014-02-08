# Discover 

In this directory i will discover the math of converting numbers.
The art of assigning bits.
These exercises are neccessary, if i want to get Ecma-262 right.

Files

* mv1.js - converting a string into hex, oct or base10 (rounding errors, extra indexOf for the .) 
* mv2.js - converting a string into hex, oct or base10 (rounding errors)
* mv3.js - has no rounding errors (multiplying for the . by Math.pow(base10, -dotPosition)) 

I noticed, the decimal value has still no exponent conversion. The e is not checked.

* bitstrings.js - i check | to set bits and & to test bits and Number.prototype.toString(2) to show the string of bits with lpad
* bits2_flags.js - i set/unset the Bits 2 and 4 for [[Configurable]] and [[Enumerable]] with +/- or |/^.
	

