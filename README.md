syntaxjs
========

Not bugfree EcmaScript 6 Interpreter written in EcmaScript 5

It can be tried with simply typing node syntax0.js. 

linux-www5:~ # node syntax0.js [exec_me.js]

```javascript
es6> let f = x => x*x;
undefined
es6> f(100);
10000
es6>
undefined
es6> let s = Symbol.for("Test");
undefined
es6> let obj = { [s]() { return Symbol.keyFor(s); } };
undefined
es6> Object.getOwnPropertyDescriptor(obj, s).value.name;
[Test]
es6> obj[s]()
Test
es6>
undefined
es6>
```
Sometimes i break code here, sometimes there. 

The other day, i fix it :-)

Current status is "broken". A couple of mistakes is uncleared since december.
But not the problem. 

- Currently underspecified, but the documents may arrive fast the next days.
- Have to write up the documentation, and to split the file up into modules, that you can edit pieces of.
- Have filled out a few issues for myself.
- Have an english book at hand, next time i will write better.
- Then i will have to tell you again.

Hope to annoy you not too much with the bugs!








































I see from writing this below, i am not able to do so. I have to write up
the technical documentation in separate files instead of a note in the README.md,
because even temporarily i could not tell you, just the documentation will tell you,
so i can tell me, to write the documentation up for you. Everything else i a 
useless commit. And on day i got a dozen of them. And a third of my firsts are.


Notes 
=====

My personal MUST is learning bit operations asap. It´s time for me to do the 
encoding and decoding by myself not only because i am grown. No, the program
needs these operations, to work correct. At the moment i´m just unsure which
to use when. Probably i´m unsure to use &= and |= and +2, -2, +4, -4, +8, -8
to set and unset Bits of a Byte. << and >> just multiply and divide. Whatever.
I want to print 754, probably next tuesday. I need it for the Java and the C
Version anyways, or else it´s impossible to finish it.

NOTE For anyone expecting more files to edit and requiring it for continuing this,
i will do this within the next days, or hours. Maybe with a "watchandbuild.js" and
maybe with "include.js" or "inline.js". I think about #include "file.js" to inline
the file in a file, that makes it easy for me for the beginning, to split the thing
into modules. I´d say, the single file days are counted.

To make way for the heap and the compiler, which are easy, but meaningful things,
except setInternalSlot to replace all Object.member accesses, all regular objects
have to go through rec = genericRecord(object) and setRecordValue(rec, name, value) 
and getRecordValue(object, name) interfaces, that they can be replaced with a binary
version.

Technical Issues
===============

These will take a week longer, coz first i have a) to correct the current code
to work with and b) just to write the code up: Heap and compiler will start as
completly separate things. Which they are in fact. I can run "bytecode" without
the heap. And can use the heap without bytecode. But both are on top of my list
as MUST criteria for myself.
 
Heap. It´s just a number of pointers and some offsets to a key and a value. Or
to an array of offsets, which is a hash table in case of property maps, where
a two pointer entry in a hash encoded slot points to the key and to the value, 
or something less impressive and even so simple will do the job. Later of course,
there will be specialised PropertyDescriptors, with a Byte for the Flags, (smallest
possible in the typed array, +16 = enumerable +32 = configurable,
 +64 = writeable +1 = accessor) and records with Key: Value fields. The hashes
 i talked about with the double pointer to key (a string encoded) and a value.
 Which has an ID and maybe a SIZE of bytes or slots and maybe, maybe maybe.
 
Heap. Garbage Collecting is there easy and for free. I think about adding the Reference
 Count to and have heard and seen freelists. MIT and Berkeley (and others) got good
 Classes, and i saw Compilers and Automaton by Prof. Aiken and Prof. Ullman.
 
Compiler. The Mozilla AST has Interfaces to crunch it, to return custom nodes from
the nodes, so we can return arrays with little opcodes there, to push them onto
the stack.

Machine. Like working with the bits, this will be my first machine and implemented
after a amateurish version of a recursive descent evaluator. This will change to
some stack machine and even to some register machine, coz i will design some registers
for. The thing is, that leads then to llvm ir, from which i have read documentation
already because of inspiration by emscripten, to use LLVM. I see much value and
possibilities in using the LLVM Compiler API to make Translations or just to implement
another JavaScript Machine.
 