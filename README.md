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
