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

Story
=====

In short. It was a syntax highlighter. Now it is an ES6 Interpreter. With Bugs.
End open. It can become some tool for IDEs. It can become a tool for implementing
language features. It can become some LLVM Compiler, transferring JS into LLVM,
maybe by providing a C++ Library with one dynamic datatype a C++ Generator could be 
added. It could become optimized. Currently it´s quite slow, it´s implementing the
ES-262 Algorithms in JavaScript on top of native ES-262 Algorithms in full length.
In most cases. 
It uses Mozilla Parser API. It uses the ES-262 Edition 6 Specification Algorithms.
It has inconsistencies. Misleading identifiers. Stupid Code. Temporary Hackcode.
The compiler is missing. But is a requirement from the beginning on.
There exist Interfaces for. All newer code uses them. Some older code still does not.
Other code has been refactored to use.

Design
======

It´s split into modules. Currently into big modules. I´ve read about software design.
I´ve seen the readings last time. But this came evolutionary from programming and was
no design from requirements analysis on.

I´ve walked the following way: I´ve written a parser in January. A year ago for my
syntaxhighlighter. In July i came in touch with the specification and in August i
already hacked my first 10000 lines of code together. Then i hacked more and more
functions from the draft into the code. Meanwhile i rewrote pieces of the code. In
beetween i wrote ExecuteTheCode. It´s still not the final function, but a working 
mess. Nothing special, but it reads like it will be one of these functions, which 
won´t be forever. I will mention more Issues over this document.


Self written define
===================

This is just the usual placeholder. Maybe a bit bloated up with function
Module, function require and function define and not quite the right, but
i had no experience. The modules are saved in require.cache.

Big Issue Exports
=================
a) i use a exports object here, and return a function there
It should be reconfigured to only use exports object
For example the lib/parser 


Top Level Modules in the Code
=============================
All saved in the Object require.cache on the require function of the file.

Removing the pathnames and putting them into the paths is one of the tasks. 
I think together with this step belongs a command which builds them together.
I think the command will be placed into /the tools directory, which i explain
later. Or into the root directory.


define("lib/i18n-messages")
===========================

This is not in use. But should be. It is the official module, where the function lives,
which is capable of translating all error messages into another language. But the thing
is the following. a) it doesn´t handle variable substitution and b) i will have to replace
all messages by regexp and manually. c) the error messages are not completly defined in this
object and i have to elaborate by reading the code, which messages i say like "not an
object", "not a function", "can not convert to primitive", "has not all internal properties"
"is unresolvable reference" "is not allowed in strict mode" 

Something else not worth being mentioned, is ES-402. Oh, Unicode, i understand. I should
mention the unicode support. Wait. Later down. But i can tell you directly. It´s still open.


define("lib/some-lex-and-parse-tables") 
=======================================
(rename to tables)

There are some unused tables inside, like the UriAlpha and co, from the Encode and Decode 
function. I made a mistake.
I exported anything, and not only, what i need. Now i would like to have an analyzer, which
tells me wether the variables are used, or not. Otherwise i will have to manually reduce the


define("lib/standalone-tokenizer")
==================================

It´s standalone. And it´s inline.

EcmaScript requires setting InputElementDiv, -RegExp, TemplateTail.
I do the first two manually by checking which input i have got. Only
tests will tell, if that fails somewhere. But for the third, i have 
to change the tokenizer and parser anyways.

Issue: I have to rewrite the piece for the Template String. Currently
it´s grabbed as one String from the first to the last backtick. I think
that they can be nested by the grammar. The runtime uses a regexp to 
create the rawStrings and cookedStrings. It´s a thing which has to be 
corrected. The template String is split into head, middle and tail in the
specification. 

How the tokenizer works. I iterate from source[0] to source[source.length-1].
The variables are called i, j. The actual character is ch. The lookahead is
lookahead. Functions like Comment(), RegularExpressionLiteral(), StringLiteral(),
Punctuation(), Identifier(), TemplateStrings() are called. The DivPunctuator()
got it´s own function, that is where the InputElementDiv and -RegExp state is 
counting, what happens. When looking for Punctuators() i increase the lookahead,
and look for 4 characters first, then 3, then 2, then one.

I have refactored it once, that it looks half-complete and in cases of looking
up the characters a little optimized, but it is far away from perfection. I have
next to dead code and wrong words for the variables of course some code open.
Like splitting up the template Literal into a list of tokens instead of just grabbing
the TemplateString and splitting it later.


define("lib/parser")
====================

After having a syntaxhighlighter which bases on a tokenizer, i added a parser.
I took the Mozilla Parser API for, because it was one of two matches, the other
was a json format, and it seemed to have already little but popular tool support.
I´ve seen esprimas website. I have downloaded the project, browsed from top to 
bottom, but never took a line of code or an idea (i didnt even check the thing)
but JSON.stringify(x, null, 4); I wrote my own parser. It wasnt even recursive
descent. Or better, it was recursive descent, but i hadn´t had a good algorithm.
The first version hat many Array.indexOfs in the tokenizer and the parser. Later
in March i took algorithms class by video and removed them all and replaced them
with object literals to look for a key in constant time. I wrote some parser, which
was suitable for my homepage to put some ast into a window by pressing a button.
I also invented a little evaluation, but didn´t complete it. Btw. It would be 100x
faster, than what i wrote now, it was small and very reasonable code. But it had
no hand and no feet to do what JavaScript does.

In the future, over half a year later, where i resume with the specification, i 
have to fix a lot of bugs in the parser and to complete a lot of features more.
It had no comprehensions, no generators, the destructuring it had, had to be 
refactored, i changed default params, and and and. But i also did something to
write a good parser. I took video class about Compilers from Berkeley, Stanford
and learned about left and right derivations, and how it´s written and spoken.
Today i know, what Epsilon is. The empty String. And how to write half a good 
recursive descent, or LL(1) Parser.


define("lib/slow-static-semantics")
===================================
(rename to statics)

This is propably not living very much longer,
they are about to become replaced by a symbol table.

The functions in here, like VarDeclaredNames,
LexicallyScopedDeclarations, IsStrict, ...
they are O(nodes) Algorithms scanning the Code and
creating lists of values.

Most of these Steps can be replaced by using a symbol
table while parsing, to record the lexicals and variables,
to record which node is contained where.


define("lib/api")
=================

Here live
a) datatypes like reference, function environment, code realm, execution contet
b) essential methods
c) createRealm()
d) which contains createIntrinsics()


define("lib/runtime")
=====================

The runtime is currently only executing ast code. I have plans to
use the same code (with little changes, where i access properties
of the nodes or iterate through a statementlist) for the bytecode.
I hadnt even had this idea three months ago. I thought i would have
to write it once again for. But we can use it for both later.

Runtime Semantics:
This module implements all these functions under runtime semantics
with their specification names and specification algorithms.

Separation by AST
=================
I have separated the AST Runtime from the other EcmaScript Functions, 
to make it easier to distinguish beetween the AST stuff and all other 
functions. The reason is, that i want to add the compiler and the
bytecode handling some day. It will be easier to replace the remaining 
AST accesses by interface functions.
Btw. It took a while until i invented getNodeOrCode(obj, property) 
as the interface for accessing node.body and other ast properties so,
that a bytecode could be introduced without changing the code anymore.
Now i have to update the runtime manually to hide all node accesses
behind this interface. It is easy to map this all with objects.


Unicode
=======

I have changed a prolyfill for String.isIdentifierStart and -Part by
M.Bynes from Array into Object and made it a lookup table for the units.
It´s currently not installed, coz it is one megabyte big. (reduced to 6.3)
But i see, for this repo it´s optimal. I will add this and license for soon.

Encoding and Decoding
=====================
These algorithms are not hard, but i am still a little unsure, because
this is my first practice in converting code units into code points and
and code units into real characters.

I am currently looking readings and calculate with, but i come to a new
practice here. How can i tell, i can & and | and i can shift down >> and
up, but i don´t have finished the encoding and decoding steps yet.


Floating Point
==============

I train it a lot. In my highlighter mouseover i say "11 bit exponent and
53 bit mantisse". You could see, that i didn´t even mention the sign. 
Meanwhile i looked for NaN and Infinity Representations, and i know that
it results in the same result, just for convenience.
There are readings where base 2 is converted to base 10 and to base 16 and
all that together with this floating point.


MV, SV, CV, TRV
================

These functions translate values from strings to mathematical values,
string values of numbers, they are charactervalues, template raw values.
These semantics define, how numbers are displayed as string, or how 
strings are converted into numbers.
Another good idea is to watch computer science about computational structures,
or where they get into converting numbers by changing base.
I discovered all this by discovering the EcmaScript Standard.

These function are currently _not_ used. JavaScript provides
easy String-to-Number (+s) or number to string (""+n) conversions.
I used them at the beginning. I even implemented the reference type
over one month later, when i needed it for the algorithms. In a native
version, MV is one of the FIRST to do.


Environments
============
DeclarativeEnvironment
GlobalEnvironment
ObjectEnvironment
FunctionEnvironment

are the environments which i programmed under 

Ordinary Objects
================
internally the objects are created with ObjectCreate()
but OrdinaryFunction and OrdinaryObject are their "classes",
and ___ExoticObject define more spezialized objects.

```javascript
var ObjectConstructor = OrdinaryFunction();
setInternalSlot(ObjectConstructor, "Prototype", FunctionPrototype);
var ObjectPrototype = OrdinaryObject();
setInternalSlot(ObjectPrototype, "Prototype", null);

```

Issues
=======
Generators: Have to record nodes, the iteration nesting, because the AST is not navigable.
Currently it´s not working. I had results from it.next().value but only without iterations.

Classes: Somewhere is something defect. With the new draft new NeedsSuper comes and i will
correct my algorithms.


Using syntax.js
===============

syntaxjs.createRealm()

- when it´s debugged, the api will change and this will return a realm with an own evaluation function.
	It has it´s own intrinsics

tokens = syntaxjs.tokenize(code)
ast = syntaxjs.createAst(code|tokens)
value = syntaxjs.toValue(code|tokens|ast)
string = syntaxjs.toJsLang(ast)

highlighted_in_spans = syntaxjs.highlight(code);

syntaxjs.highlightElements(); 
	// searches for PRE elements and for CODE elements. first are seen as big for a view, last as just to be highlighted for paragraphs.

syntaxjs.system = node|browser|worker; 
	// just help

syntaxjs.nodeShell() start the shell manually under node.js

Forgotten Stuff
===============

Cyclic dependencies in the Modules
- i call some api in the json part which has been moved into the parser module
- i call some static semantics for generator function and require the parser
- i require the code generator in function.prototype.toString and have
to update the code generator for symbol properties in [].


Specification Terms
===================
Execution Context -	or Activation Record, holds the environments and a realm, plus a state and a generator maybe
CompletionRecord - after each function this record is generated and it is a wonderful specification device


My Data Structures
==================
JS Arrays as Lists

In the parser:
ContainsTable - contains a node a production? check in constant time
SymbolTable	- variable names and lexical declarations

"yieldStack, defaultStack, noInStack" the stacks for each parameter of the new plalr(1)
should be replaced with the parameters = { "yield": [], "default": [], "noIn" }
which are "Yield", "Return", "In", "GeneratorParameter", according to the rules
in 5.1.5 Grammar Notation.


Up next: Completing the missing information with practical code examples
of how this programm works. It´s just 345 lines here. A README can have a thousand and more. 
:-).


Hope to annoy you not too much with the bugs!

