JULY 24 - I am working on Pro PHP MVC, a book by Christopher Pitt, which aims
at people, who want to learn a modern PHP MVC Framework. I wrote the library
down, in the last two weeks i only read that book and only cared for understanding
it.

* I think to return to syntax.js in August, like i switch each month a main topic.
But without being back, i would like to state for anyone, who uses it, or monkey
patched it, and thinks, it´s the right time to send my stuff in...

* If you repaired any feature and would like to share it, send it in. Anyways,
you can send your stuff anytime, if you get interested. 

* Much of todays code will go away in the coming months. Recursive Evaluation
will be replaced by a stack based one, to make the generator simple and possible.

* The recursion in the parser needs a patch, too, coz arbitrary and long expressions
can blow up the call stack. I know removing the whole recursion is difficult, but
breaking up some places with temporary results from the stack, to restart the recursion
should help a lot.

* The Numeric Conversion, Type Operations are very slow. 

* The return if abrupt handler should be replaced with a realm-local Flag, that
some abrupt exception happened (just a bool) that we don´t need to call a function
for, coz functions are still the _slowest_ code one can write. Everything wrapped
in functions gets a lot slower, i think, coz functions just cost initialization and
such.

* After replacing return if abrupt it will go faster. Just re-using the completion
breaks, there have to be some cases found, where the re-used completion is not usable,
that´s where deferred exceptions have to be kept, they also can´t set if abrupt, so 
here is a little careful search neccessary. Didn´t remove completion creation and
set abrupt as flag. The gag is. That was the first i wrote, when starting the project,
later i switched to just type down the spec.

* There are still the unicode polyfills to be used and the correct use of unicde
to do. If you patched my code with esprimas regular expression for unicode, just
send it in. I would like to take that, if i can´t do better. The table from m.b. 
is a meg, but also not ready.

* I started Ecma-402 Internationalization API for everyone, and internationalizing
the system. I you would like to replace all messages and strings, to translate the
software, just help.


* I didn´t release any new bugs for more than four weeks, maybe you did some with
the thing. Just send. If you would like to take over some (we will get the asm.js
Assembly-like Bytecode Interpreter running soon, too), just do. I would like to make
this some interpreter, which is reliably parsing and interpreting EcmaScript just like
the spec says, to do all the tooling stuff with the resulting library.

* If you have some places to be exchanged with design patterns, or have done so,
just send. 

Thanks for your fun, patience, work, interest, the good and the bad

This will become better software, as it will be continued
Just for the js community. Maybe it can help learning what´s behing the curtain
of business logic secrets by just showing some possible version.

The ast interpreter is slow. The functions are. The conversions, the three objects 
to make one object. That´s why i want to serialize the whole by writing the assembly,
which should be so typed, that only some js will be considered neccessary and be 
run outside of the difficult asm.js compatible arithmetic interpreter. My vision.

Edward




----------------------------------------------------------------------------

APRIL - MAY 2014 - syntax.js had been my most active and actual project

JUNE 2014 - For developing the bytecode i take a break for a week but took
a break for over four weeks learning the basics of intel and generic assembly
code.

```asm
section .text	; 
global strlen   ; int strlen(char *str) or extern "C" int strlen(char *str)
strlen: 	; Good to know is, char *str is implicitly right in rdi.
mov al, 0	; we search with al for \0
cld		; we clear the direction flag DF
rep scasb; 	; scasb compares the byte at rsi with al  and increases the pointer
mov rax, rbx; 	; rbx has the counter of rep scasb, we return it
ret		; pop return address of the stack and jmp to
``` 

Earlier i tried my first bytecode mainly with the HEAP32. Now i do not fear
Register Encoding like in Mod/RM, and i must say, my idea how to encode this
was almost similar. Now from trying assembly with a couple of listings and books
i have no fear or and nothing left unclear, how to write a good vm. 

JULY 2014 - Leaving this message on the first weekend of July. I´m about to continue
very soon.

syntax.js
=========

Usage: node syntax0.js [filename.js]

```js
linux-qc59:/syntaxjs # ./es6
es6> let x = 10, y = [for (a of [1,2,3]) x*a];
undefined
es6> y.join()
10,20,30

```

```
linux-qc59:/syntaxjs # npm install -g
linux-qc59:/syntaxjs # node
>var s = require("syntaxjs");
undefined
>var realm = s.createRealm();
undefined
>realm.eval("let x = 10; eval('x')");
10
```

Syntax.js is a lot of fun.

It is a ES6 AST Interpreter.

But i am tired of the AST Interpreter.

I am gonna write a ByteCode Interpreter.

For that i took a break in June.

Gonna continue soon.

Eddie.


DEPRECATED
==========

These notes did not describe completly what i wanted to do
