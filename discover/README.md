# Discover 

In this directory i will discover the math of converting numbers.
The art of assigning bits.
These exercises are neccessary, if i want to get Ecma-262 right.

Files

##### Number Conversion

4. mv1.js - converting a string into hex, oct or base10 (rounding errors, extra indexOf for the .) 
3. mv2.js - converting a string into hex, oct or base10 (rounding errors)
2. mv3.js - has no rounding errors (multiplying for the . by Math.pow(base10, -dotPosition)) 
1. mv4.js - almost "feature complete" conversion of a numeric literal into a number.
With a lot of complexity and hash tables for faster lookups than a linear number of ifs,
with possible rounding error at e.g. 0.0000999999999 (0.0001), but not many, 
which have to be debugged.

5. horner1.js - Converting a decimal nval*=10, nval+=decVals[string[i]], maybe better with += Math.pow(base, k);, maybe not, e.+- are still missign in file 1.
6. 10to16.js - Converting with the euclidian algorithm by finding and dividing from the highest power of 16 being <= the number.

I noticed, the decimal value has still no exponent conversion. The e is not checked.

##### Bits

1. bitstrings.js - i check | to set bits and & to test bits and Number.prototype.toString(2) to show the string of bits with lpad
2. bits2_flags.js - i set/unset the Bits 2 and 4 for [[Configurable]] and [[Enumerable]] with +=/-= or |=/^= and test with &.

##### Heap

1. heap0.js - something old i found on my disk. it tells a story of a typed array heap. With Garbage Collector!


###### notes

I ask myself wether gists make more sense or wether this project will have some
educational documentation, how to hack an own Ecma Script Interpreter? I would like
to do the latter and write up documentation. But i see, i need a little bit of time,
until i realize, what to do, this time.

In this directory /discover for example i will keep JavaScript Versions of SV and
MV and TRV and Bitmanipulation for Property Descriptors, Heap Information for Objects,
a simulation of a Stack based virtual Machine, all the neccessary basics and functions
will be targeted into this directory. And the name says it, it´s for pure discovery;
The main file of the project is still the large 1 megabyte script in the root.

