# Discover (The Lamer Corner)

Here is a special directory, where i put files, which are more interesting for
the beginner, than for the professional and experienced computer scientists.
I save a few tries here, where i convert numbers, or transform them.

I know multiplying and dividing by 2 by shifting the bits. 

I try to multiply the number at place x with the base to the power of x to
make strings to numbers.

I still have to write something up to go the other way round.


Files

* mv1.js - converting a string into hex, oct or base10 (rounding errors, extra indexOf for the .) 
* mv2.js - converting a string into hex, oct or base10 (rounding errors)
* mv3.js - has no rounding errors (shifting . by Math.pow(base10, -dotPosition)) 

I noticed, the decimal value has still no exponent conversion. The e is not checked.

* bitstrings.js - i check | to set bits and & to test bits and Number.prototype.toString(2) to show the string of bits with lpad

	
