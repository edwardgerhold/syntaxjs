syntaxjs
========

Very cool EcmaScript 6 Interpreter



Changelist
==========

For the old interpreter goes...

- Replacing recursive descent with queue based iteration.
a) for fixing the generator "problem"
b) for getting almost unlimited depth

- Polishing the old api (i don´t add stuff, i just fix, replace and clean
up and switch to working on the better new api. Unfinished functions can now
be shimmed or easily completed with native js and i´ll do with the array approach
again.)

* Polishing means replacing the dirty functions with some stiff consistent.
* cleaning TaskQueue/EventQueue and making one loop around
the queues (inclusive Script Execution) and leaving if all queues are empty.
* Connecting the loader piece, i will have to complete the exportlists from
static semantics
* Making Static Semantics Caching their BoundNames, lexNames, varNames, etc.
I need to put them onto the ast, that they get only called once, like in loops
where they run every iteration
* Removing the execute function (by replacing with the task queue loop)
* Replacing Evaluate with a Stack (or better FIFO Queue) based Form, that
i can keep the eval state by suspending, and to finally choose one of my 
solutions for instead of commenting all and finishing none
* Whatever, the unclean stuff. No new features. Only large deletions.

Using native JS Objects would be could if there were Weak References from beginning
or some GC Reflection to force some objects to get collected. But native objects also
mean, to be 100% 3 times to 10 times larger than a regular js object.

With the new object situation i can put into the first int the type, the pointer
to the function table for the slot, various flags like isExtensible or isCallable,
and am full of information after only 4 bytes. Even a property is larger than 4 bytes.

Handling to rewrite does not only force me to rewrite it, it isn´t, it would
be possibly to reuse a half of the code, after replacing e.g. CreateBuiltinFunction,
i can reuse the whole intrinsic code to use non-heap-allocated objects with their
native functions (what i will do, to make both realms work together)


For the new one:
----------------
Complete re-design

Writing the new api.

Based on typed array, constant pools, lots of pointers, bytecodes, bitflags.
A bit of HEAP for the CODE, some HEAP for the STACK and some HEAP for the 
Objects. 

There is now bytecode (int code) with 2-byte-wide instructions and a 2-byte-flag
space each intcode (aligning with one byte and losing ints and doubles is too much 
for me).

Strings go into constant pool or come encoded and decoded by codepoints into uint16arrays
precalculated with the famous unicode surrogate pair formula.

This time the environments are stack allocated arrays. Local vars are recognized
by number in the order of appearance, and the environments are typed arrays, stack
allocated instead of deeply nested javascript objects.

Same for Objects, Execution Contexts, Environments, Intrinsics. I can write it again.
I thought i can refactor and keep the half of the code. But i think, when i rewrite
this, i can rewrite everything, it didn´t take that long. The longest where the breaks
and the search for bugs in the misdesign.

This time i will do a typed compilation from the AST into Basic Blocks with label-offsets
and gotos at the end. I hope to save some instructions and bytes with. Else i have
a proof of concept, what it costs if i do so, and if my brain melts or is grown now.

obj
---

[0] flags|slots|----|type
[1] ptr propnamelist constant pool ?


do i save enough time with the 32 byte object to use String.fromCharCode() and
.charCodeAt(0) to restore/save property keys? I think encoding and decoding
the strings is the most expensive. The cries for the Uint16 for Strings was 
there on es-discuss, but not heard loud enough



call (i wouldn´t write it exactly like this, i just want to adress locals[0],
but not to copy arrays before, of course, this is just hypothetical and hiding
my primary goals)
----

[0] retaddr
[1] ptr to local slots
[2] ptr to local regs
[3] gthis
[4] genv
[5] generator

var locals = HEAP32.subarray(call[1], numberOfLocals * sizeOfLocals);
var regs = HEAP32.subarray(call[2], numberOfRegisters * sizeOfRegisters);


Using the Array based Environments requires rewriting everything. But it´s worth
the thing. I didn´t write that long on the other stuff. And it was new, and i was
wrong (not really wrong, but only 2nd best solution, taking the duller one).



However,,

scratchpad notes from eddie
i can formulate this much better
and the best is, for you and me i will do

i just force me to go the way and hack the day.



