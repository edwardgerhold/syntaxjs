syntax.js (*1)
=========
Not bugfree(*) but relativly compliant EcmaScript 6 (7**) Interpreter(*****) written 
in EcmaScript 5 (could run in 3 with shims i bet, or be factored down with __proto__:null
and syntaxjs[xxx] = yz instead of using Object.defineProperty, ok, the most interesting
is to use "use strict" to let it throw if something is really wrong).

This project was started on a PIII/933 with mcedit in a dorm 
and is now continued on a notebook with 2 cores still in the dorm. It´s a fun 
project. And pretty soon able to run itself. (***)

Hmm, i notice difficulties with writing plain text with myself nowadays.
I´m working on it.

(*) still doesn´t run arbitrary JavaScript code, but all lockups are removed.
I rewrote the Expression, for those who noticed but don´t like to look again,
wether i have changed it, or not. The bugs are no longer in the parser, but
in the runtime itself. It is able to parse itself with over 200,000 nodes.
But sucks within define.

(**) contains at last one implemented ES7 proposal and stubs for the other

(***) serious documentation and proper seriously written license (with
the same meaning) will take a while and a day more or two. 
A few JSDoc comments will replace the chaotic few comments left between.

(****) typed mem and stack machine is a must for me but it will still take
a while. But then we´ll also have Weak Maps, Weak Sets, and Weak Refs. 

New Access to Modules
=====================

syntaxjs.define and syntaxjs.require can define and load modules for the
use in syntaxjs. After a while without a public api i found that some 
access would be cool, and to add the functions to the syntaxjs object solves
all my problems with defining another require e.g. under node.js.
This require btw. is serving the AMD format, but is only doing sync requests
to require.cache.
All modules with all their properties can be found  syntaxjs.require.cache[name];
Now my modules make more sense i find.

```js
// npm install -g 
> var syntaxjs = require("syntaxjs")
> var format = syntaxjs.require("i18n").format;
> console.log(format("%s %s %s", "i", "am", "novice"));
> i am novice

```

This shows the latest module i18n. It now carries a format and a raw 
function

Latest Mistake
==============

I spotted that an AssignmentElement for Destructuring of Objects
may contain a { x: LeftHandSideExpression() } which can be any target where
we can assign something to (PutValue(lhsRef, value) does that then.) Currently
only Aliasnames worked. I hadn´t checked it for a long time, since last year
november i guess.


New: Multiple Realms
======================

```bash
npm install -g  #to install syntaxjs from it´s directory
```
Then call it in your javascript to evaluate es6 code.

```javascript
var realm = require("syntaxjs").createRealm();
realm.eval("let x = 10");
realm.eval("x"); 
// 10

var realm2 = require("syntaxjs").createRealm();
realm2.eval("x");
// Error: GetValue: 'x' is an unresolvable Reference

realm2.eval("let x = 20");
realm2.eval("x");
// 20
realm.eval("x");
// 10
```

Regular Usage
=============
It can be tried with simply typing node syntax0.js. 

```
linux-www5:~ # node syntax0.js [exec_me.js]
````

node syntax0.js [filename.js] executes a file
or just starts a readline shell when called without arguments

```javascript
es6> let f = x => x*x;  // all working again
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
es6> let name = "Edward";
undefined
es6> String.raw(`${name} is stupid`);
Edward is stupid
es6> String.raw`${name} is stupid`;
Edward is stupid
es6> Object.create(null)
{ Bindings: {}, Symbols: {}, Prototype: null, Extensible: true }
es6> for (let i = 0; 
...> i < 3; i++) console.log(i);
0
1
2
undefined
es6> .print id
{
    "type": "Program",
    "body": [
	{
	    "type": "ExpressionStatement",
	    "expression": {
		"type": "Identifier",
		"name": "id",
		"loc": { "start": { "line": 1, "column": 1 }, "end":{ "line": 1, "column": 2 } }
	    },
	    "loc": { "start": { "line": 1, "column": 1 }, "end":{ "line": 1, "column": 2 } }
	},
    ],
    "loc": { "start": { "line": 1, "column": 1 }, "end":{ "line": 1, "column": 2 } }
}
```


Not yet complete
================

Examples:
```
// get an object by calling eval
es5> var obj1 = syntaxjs.eval("{ a: 1, b: 2 }"); // .toValue if i didn´t rename for now.
{
    /* large internal object representation made of three objects and properties with one more each descriptor */
}
es5> var a = obj1[SLOTS.GET]("a", obj1); // probably a completion record is returned as i don´t filter it on this access

// i think the actual function is doing it wrong (why it´s not completed)

es5> var obj2 = realm.evalXform("{ a:1, b:2 }");
{ a:getter/setter, b:getter/setter }

// the better xformer captures a snapshot of the state which can be deeply converted into a static snapshot

es5> var obj2 = realm.evalXform("{ a:1, b:2 }");
{ a:1, b:2 }
es5> obj2.a;
```

debug(param)


```js
es6> debug({a:1,b:2,c:3,d(){},[Symbol.create]:true})
Type() results in object
[object Object]
{
        [[Prototype]]: [object Object]
        [[Extensible]]: true
        [[Bindings]]:
                a: (number) ecw
                b: (number) ecw
                c: (number) ecw
                d: (object) ecw
        [[Symbols]]:
}		@@create: (symbol) ---
undefined
```

The async versions

```js
var realm = syntaxjs.createRealm();
realm.evalAsync("let x = 10; x").then(function (value) { console.log(value); }, function (err) { console.error(err); });
// i entered it twice and got an exception for the already declared x in the realm.
```


This one works i tested it recently.

Parser_API
==========

It´s using Mozilla Parser_API for AST representation.

BUT: It´s a little incompatible with the latest draft i´ve seen. It was with an earlier,
but the latest hat "default" and "rest" on function declaration nodes. I didn´t know if 
i would have to set default to a sparse array with holes, wherever no default is assigned.
And the Rest is of course cool extracted, but also in my .params list. Which is then passed
to the Ecma Specification Algorithm "BindingInitialisation" as one Array after "ArgumentsListEvaluation",
which fetches the values of the passed Parameters, while the former processes the Bound Names of
the params to put each value into (with env.InitializeBinding (Identifiers) or PutValue (any Reference)).

Well, the Format might change inside.


```
> syntaxjs.tokenize("`ich ${bin} ein ${  template()  }`")
[{
    type: "TemplateLiteral",
    value: ["ich ", "bin", " ein ", "  template()  ",""]
}]

```

* New Nodes
* Semantic Analysis 
* Contains
* Properties 
* Expressions being flagged
* Template Literal Node

```
    // now (it´s not an effort to rename value to spans. It´s a new node which will carry .raw and .cooked)
    {
        type: "TemplateLiteral",
        spans: ["ich ", "bin", " ein ", "  template()  ",""]
    }

    // later better (compiler has raw and cooked, which are anyways _static_ semantics, ready)

    {
        type: "TemplateLiteral",
        raw: ["ich "," ein ",""]
        cooked: ["bin", "  template()  "]
        noSubstitution: false               // true if raw.length == 1 && cooked.length == 0
     }
```

```{ type: "LexicalDeclaration", declarations, kind }``` (should be spread into LetDeclaration and ConstDeclaration for making the best possible)
```{ type: "ForDeclaration", kind }``` (for-of has a ForDeclaration rule, ArrayComprehension and GeneratorComprehension have a ForBinding,
possibly this could be refactored, but currently it is supporting the system to work)

```{ type: "Module", body }``` (new top level production, has other rules than "Program")
```{ type: "ModuleDeclaration", id, strict, body }```
```{ type: "ImportStatement", imports }```
```{ type: "ExportStatement", exports }```

```{ type: "RestParameter", argument: id }``` latest parserapi draft covers .rest at functions, but not in patterns, etc.
```{ type: "SpreadExpression", argument: id }``` spread expressions are the ...spread for any array or arguments list.
```{ type: "DefaultArgument", id: name/pattern, init: expression }``` id can be
```{ type: "MethodDefinition", id, generator, computed, formals, body }``` This makes it convenient to parse methods with concise syntax,
.computed is for get [s]() computed property names (needed)
```{ type: "BindingElement", id: identifier[, as: identifier] }``` in ObjectPattern["properties"]

.computed is IsComputedPropertyName (in objectliterals, resolves to a symbol)
.computed in MemberExpression stands for obj[key] 
But .computed in PropertyDefinitionLists (objectExpr.properties) stands for { [s]: prop } keys.
I have to remove limitation to evaluation to a symbol, i guess.

 ```
    isConstantDeclaration = { "const" : true };
    if (isConstantDeclaration[node.kind]) used in instantiation

    if (node.const) used in instantiation

    if (varDecl.kind === "const") the only possibility today, but assume you have a varDecl.declarations[i] in the hand. There is no .kind.

 ```

Builder incomplete
==================

```
    var builder = {};
    // The original Parser_API builder has a different signature for each node.type
    
    builder.functionDeclaration = function fdecl(id, formals, body, strict, generator, expression, loc) {
	// much parameters to pass exactly when doing the interfacing
	// is a little to learn for the beginning and easy after being introduced to
    };

```

propose ```function [node.type](node) { ...process node here.. }```

```
    var builder = {};
    // a codegenerator
    builder["VariableStatement"] = function (node) {
	var src= node.kind + " ";
	foreach(node.declarations, function (decl) {
	    src += decl.id 
	    if (decl.init) src += " = "+builder[decl.init.type](decl.init);
	});
	src += ";";
	return src;	
    };
    // or a compiler
    builder["ReturnStatement"] = function (node) {
	var code = alloc(4); 
	var ptr = heap.store(builder[node.argument.type](node.argument)));
	code[0] = byteCode["return"];
	ptr = ptr || 0;
	code[1] = (ptr >> 16) & 0xFF;  // oh it´s wrong
	code[2] = (ptr >> 8)  & 0xFF;  // am i mismatching three address
	code[3] = ptr	      & 0xFF;  // and write a three-byte address??? hehe
	return code;		       // cosmic waves decoded in the back of the head without getting the full meaning, but a similarity, he?
    };

```

Missing
=========

* Developer Documentation

= Bugs


```
// this is the only practically not working yet
// i shouldn´t show it first
es6> function *gen() { yield 10; }
undefined
es6> let it = gen();
undefined
es6> it.next().value;
10
// About the stack machine, or a parent pointer plus instruction index
```


Design Issues
============

- Design Patterns
- Other JS Engines

```
function load() { [native code] }
jjs> load("/s/syntax0.js");

syntax.js was successfully loaded
jjs> jjs> syntaxjs
Exception in thread "main" ECMAScript Exception: TypeError: Cannot get default string value
        at jdk.nashorn.internal.runtime.ECMAErrors.error(ECMAErrors.java:56)
        at jdk.nashorn.internal.runtime.ECMAErrors.typeError(ECMAErrors.java:212)
        at jdk.nashorn.internal.runtime.ECMAErrors.typeError(ECMAErrors.java:184)
        at jdk.nashorn.internal.objects.Global.getDefaultValue(Global.java:586)
        at jdk.nashorn.internal.runtime.ScriptObject.getDefaultValue(ScriptObject.java:1257)
        at jdk.nashorn.internal.runtime.JSType.toPrimitive(JSType.java:256)
        at jdk.nashorn.internal.runtime.JSType.toPrimitive(JSType.java:252)
        at jdk.nashorn.internal.runtime.JSType.toStringImpl(JSType.java:993)
        at jdk.nashorn.internal.runtime.JSType.toString(JSType.java:326)
        at jdk.nashorn.tools.Shell.readEvalPrint(Shell.java:449)
        at jdk.nashorn.tools.Shell.run(Shell.java:155)
        at jdk.nashorn.tools.Shell.main(Shell.java:130)
        at jdk.nashorn.tools.Shell.main(Shell.java:109)
```

Spidermonkey


```
js> load("syntax0.js");
syntaxjs was successfully loaded
js> syntaxjs
null
// es ist bloss ein "Object.create(null)"
js> syntaxjs.eval("10")
10
js> var realm = syntaxjs.createRealm();
js>
/s/syntax0.js:23412:57 ReferenceError: process is not defined

```

- Heap
- Compiler
- Syntax Highlighter

Tests
=====


I am writing new tests in /test/json.

Run ./testall in the root dir or from /test/json

I will change testmaker.js to write down unit tests
for other libraries from the .json files.

The final test shall be test262 which can be run, too,
but that is another story. First i need new tests from
myself for myself to finish this program.


```
testmaker.js 0.0.0 for tester.js for syntax.js by Edward
{
	"test1":	
	{
	    "init": 
		"let x = 10;",
	    "tests": 
	    [
		["x",10],
		["x+x;", 20]
	    ]
	},
	
	"test2": 
	{
	    "init": 
		"const x = 20;",
	    "tests": 
	    [
		["x = 30; x;", 20],
		["x-=10", 10],
		["x", 20]
	    ]
	}
}

2 tests completed in : 2ms
Number of Tests: 2
Executed assertions: 2
Passed assertions: 2
Failed assertions: 0
Unexpected exceptions: 0
PASS: assert: actual=10, expected=10: message=x
PASS: assert: actual=20, expected=20: message=x+x;
3 tests completed in : 1ms
Number of Tests: 3
Executed assertions: 3
Passed assertions: 3
Failed assertions: 0
Unexpected exceptions: 0
PASS: assert: actual=20, expected=20: message=x = 30; x;
PASS: assert: actual=10, expected=10: message=x-=10
PASS: assert: actual=20, expected=20: message=x
# testmaker.js finished work for now
```

CST
===

```
es6> function f() { /* 32 */ ; /* 3453 */ ; /* 34534 */ ; /* 6345 */ }
undefined
es6> f.toString()
function f () {
    ;undefined;
    ;undefined;
}
es6>
```

Ok, that didn´t work. But with some change.

```
linux-dww5:/s : es6 extras.js 
-evaluating extras.js-
function f () {
       
    /* 1 */;
    /* 2 */;
    /* 3 */
    ;/*4*/
    /*5*/;
    /*6*//*7*//*8*/;/*9*/
;
}
undefined
es6> 
```


```js

function f() {
    /* 1 */;
    /* 2 */;/* 3 */
    ;/*4*/
    /*5*/;/*6*//*7*//*8*/;/*9*/
}
console.log(f.toString());

```


```js
    builder.emptyStatement = function emptyStatement(loc, extras) {
        var src = "";
        if (extras && extras.before) src += callBuilder(extras.before);
        src += ";";
        if (extras && extras.after) src += callBuilder(extras.after);
        return src;
    };
```

    
```js
    builder.whiteSpace = function (value, loc) {
        return value;
    };
    builder.lineComment = function(value, loc) {
        return value;
    };
    builder.multiLineComment= function (value, loc) {
        return value;
    };
    builder.lineTerminator= function (value, loc) {
        return value;
    };
```

New: Old Tokenizer will go
=========================

Mainly for my old syntax highlighter, the tokenizer pushed the tokens, whitespaces
inclusive into an array. The parser processes the array, and my first lookahead function,
i called it righthand wayback, skipped them twice instead of re-assigning the lookahead(1)
to lookahead(0) (the current token we are exactly on). It was funny reading the code again.
The Syntaxhighlighter depends on the whitespaces, else it produces spans without
whitespaces.

```js

// the old tokenizer tokenizes into an array (arrays are also lists in my cases)
var arrayTokenizer = require("syntaxjs").tokenizeIntoArray;
var tokens = arrayTokenizer(source); // currently produces whitespaces, will be removed

// instead for whitespaces and tokens in a list, i improve with a new function
var tokensWithWhiteSpaces = require("syntaxjs").tokenize.tokenizeIntoArrayWithWhiteSpaces(code);

// the new tokenizer is stepwise by default
var tokenize =  require("syntaxjs").tokenize
var firstToken = tokenize(code);
var nextToken;
var ltNext;
while (nextToken = tokenize.nextToken()) {
    nextToken == tokenize.token; // the next token. (assigned to lookahead(1) in the parser)
    ltNext = tokenize.ltNext;	// lineterminator between token
}

```

The API is not complete. The exports are not clean yet. The new tokenizer fails
some tests, for whatever reason of the skipped lineterminators it is. So i have
still some lines to edit here.

(*1)
====
(the name is the original name of the original 99 line syntaxhighlighter from x-mas 2012,
it got a part of the parser (first with keywords.indexOf(value) worst quadratic complexity,
in june 2013 i decided to continue my homepage highlighter. A month later i started reading
the famous 6th edition of EcmaScript. I started with a visitor pattern for the interpreter,
and noticed later, that i need a stack under it for generators, or at last parent pointers,
which aren´t in mozilla´s parser api suggestion yet, or i would have to traverse the tree 
once to get the node we left, compared by identitity and then the next node in the execution.
A stack for each StatementList and an InstructionIndex gives that complex stuff for free.
To reduce the callstack anyways i´ve started with the vm project to add a stack/register
based runtime. The cool is, the visitor is a good fallback or interpreter demo and no loss.
Same for typed memory. In august 2013 i had already the option to refactor my few lines for
typed memory or to continue and do a big search and replace later. I chose the latter,
for whichever reason, sometimes i felt blamed, since i put it online, sometimes i felt
angry to have not used the typed heap from the beginning on, and on the other hand
i tell myself, that is good training for me, because i am unexperienced, have no job
in this branch and need to get practically a bit more experienced. In 2013 i only had an
old computer with 933mhz, 1cpu and 512megs of RAM. Even sublime was to slow and had too long
delays, that i took mcedit of the midnight commander (i had to turn of highlighting)
and wrote down, on a heavy to press keyboard (i wasted three cheap keyboards for 5-8 Euros 
in the coming half year), what i could. Later in December i broke after a longer editing 
session the program a little, that i was shocked not to find it at once (there where
many typos and mistakes to fix, and i lost strict mode´s thisArgs till today), and in
February and March i learned Java by University Lecture and really hard time hacking
of Data Structures and Design Patterns (I printed Head First Design Patterns from
the owners Site and tried them all out, and was impressed by the impressing Art of
their written language), and in April i continued the tool every day a bit. A third of
the commits contain little changes, 10% are fixes for my own stupidness, the numbers
may be wrong, but after i decided to support getify´s CST, i had only one option,
to continue the program, which can implement it, and on the other hand, i also wanted
to complete the program at least together with ES6, i´m stuck for a native engine until
ES7 because i still have to do the byte code interpreter and typed memory system i have
designed for longer now and don´t want to write my object the same way to replace them
later. So i decided to gather more experience before i change languages. My latest idea is
to learn how to transfer this interpreters runtime into some "use asm" compatible 
fetch, decode, execute of the stack. The encoding of strings (esprima uses code points,
i use strings, but i would use code points, if i become somewhat smarter in using them)
is a bit less difficult than looping and using String.fromCharCode by just using
a constant pool. For registers we have a lot of variables (unlimited?). For transferring
the algorithms into some basic block interpreting algorithms is done relativly fast
by copy and paste, if i make it, to enter the main loop. The old execute function
of syntaxjs.eval shows, where the machine has to go. First there is this main loop,
then this one can call evaluate, or relativly perform everything from the loop, which
means to reduce the callstack to a single node´s height. Currently it grows with
the nesting but should hold for a couple of programs, because callstacks are relativly
big. But the AST is minimum of 10x bigger than the regular program. Another calculated
down format is to use "return" for return or "break" for break or "function" for function,
which can be replaced by numbers, and then constant pool data or three byte instructions
or loads and stores. I have to get into it, and to copy and paste the runOFtime for.
One can start with a single command an then add each function singularly.
