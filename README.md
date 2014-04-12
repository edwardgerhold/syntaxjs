syntaxjs
========

Not bugfree(*) EcmaScript 6 (7**) Interpreter written in EcmaScript 5.
This project was started on a PIII/933 with mcedit in a dorm and is
now continued on a notebook with 2 cores still in the dorm.
It´s a fun project. 

I have a lack in actual software engineering practices,
and maybe had to reinvent the wheel first (that´s what the oldest code is)
before i got through the parsing and interpreting lectures. I´m even behind
with the typed memory system. But i see this as an opportunity to learn, how
to work through "old, bad, dirty, chaotic, inconsistently designed, error 
prone, legacy code" and to figure out how to use build tools and github. 
If i would be better with these tools, i would replace the build process.
It´s like using grunt for build tasks, and sweetjs for macros like ReturnIfAbrupt
and maybe that or something else for including file snippets in the code,
and even make my JSDoc comments correct.

Hmm, i notice difficulties with writing plain text with myself nowadays.
I´m working on it.

(*) found the stupid lockup bug from march in the old lookahead fn,
which i edited in march, while new tests where missing.

(**) contains at last one implemented proposal and more

The Good and the Bad: Crushing all style conventions (for code readers)
======================================================================
I just came back from buying food and thought, what´s next?
Now i´m typing this code style paragraph.

The ECMA-262 Specification uses FirstLetterCaps with CamelCase.
I see in my new Webstorm Trial, that modern IDE´s get the hint,
that the "Constructor" does return a primitive value, which would
get lost.

You can breathe up. Syntax.js is "new" free. All Objects created
are created via Object.create (or nodes are directly returned), so
that no "new" will ever appear anywhere. Except for real native JS 
Constructors like Object, Array, etc. Of course, i can´t change
ArrayBuffer or other real native Builtins from the engines. You 
should use them like you always do. But all objects created by 
Syntax.js just follow the "No new required" rules, that people
don´t get mad figuring out what´s a constructor and what´s not.

So the Functions and Objects have evil "Caps" turned on. 
Here i have some inconsistent stylistic things done, which should be aligned.
All non-ECMA-262 definitions should start with a lower case 
letter, except for "Constructors" (but they´ll be usable without 
new).

Means, the Code makes very bad use of identifiers. Currently.
I can take a list of all my CapsFirstFunctionsAndVariables, and put a tool 
on the code to rewrite all the names.


New, old idea:
==============
1. Get rid of shared state and create a new set of all pieces each realm

I shouldn´t share states between realms, when using tokenizer, parser,
runtime. I should put that all into a function which creates altogether
once each realm and rewrite syntaxjs.eval to use a hidden created REALM,
the old shared state from the first parts of the implementation is still
active. I push and pop the states onto and from the stack to change between
realms. In reality (in a already finished system) this would cost and be 
lousy (it IS lousy). So one of my aims when reworking tokenizer and parser
is to get rid of the original execute function called by "syntaxjs.eval" and
create with each realm (one should be created by default) a complete new set
of parser and runtime (that they do not share any variable but the function
which created them, say, they have the same parent function).

Kicking the old syntax highlighter (lib/highlighter/highlighter-app.hs)
=======================================================================

Probably one of the best ideas, coz this thing (it´s nowadays broken
anyways) depends on the standalone tokenizer. I will create a list of
tokens on demand with the new parser. 

Kicking the syntax highlighter makes most sense. a) nobody uses it,
because it is no application but a homepage hack, where that toValue
Button originated from.
b) I can get rid of the stupidest dependency on my tokenizer. 
c) When i let the parser do the listings for the highlighter, i can
show AST informations, and that was the questions, with which i left
my tokenizer (one year ago, without knowing, that i´ll do a runtime for).
d) I can REWRITE IT!!!!! It needs some polish and some furniture to play
sit on. 

Wow. 17 Minutes. For that lousy english. Ok, i´ll better return to the
project.

Now back to the usage:
======================

It needs node.js to build. And to use the shell. 


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


Again, the Realms are working independently, but they share parser,
tokenizer, runtime on each invocation, which makes a save and restore
of the last state, which could be interrupted necessary, unless i get
rid of the shared state.

A set of factories will return tokenizer objects, parser objects, 
runtime objects.

Probably in some days, or say weeks, i do not know what happens between.
(This is not a business work, but a homework, which can be interrupted easily.)


Regular Usage
=============
It can be tried with simply typing node syntax0.js. 

```
linux-www5:~ # node syntax0.js [exec_me.js]
````

node syntax0.js [filename.js] executes a file
or just starts a readline shell when called without arguments

```javascript
es6> let f = x => x*x; // can be that the actual version is hanging if no parens are used and whitespaces around the arrow for whatever reasons i haven´t noticed now. It was error free soon ago.
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
es5> var a = obj1["Get"]("a", obj1); // probably a completion record is returned as i don´t filter it on this access

// i think the actual function is doing it wrong (why it´s not completed)

es5> var obj2 = realm.evalXform("{ a:1, b:2 }");
{ a:getter/setter, b:getter/setter }

// the better xformer captures a snapshot of the state which can be deeply converted into a static snapshot

es5> var obj2 = realm.evalXform("{ a:1, b:2 }");
{ a:1, b:2 }
es5> obj2.a;

```

Solution:
The solution will be not to create a living model of the object, which i suspect my transform function
to create, but to create a snapshot of the current state of the object. That needs no getters and setters
and returns recursivly objects and arrays with object and array prototypes.

* got a new debug function added to global scope.


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
```
realm.evalAsync("let x = 10; x").then(function (value) { console.log(value); }, function (err) { throw err; });

```

Parser_API
==========

It´s using Mozilla Parser_API for AST representation.
With a couple of differences. It´s not perfect. It´s a work.


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
	code[1] = ptr & 0xFFFFFF;  // oh it´s wrong
	code[2] = ptr & 0xFFFF;
	code[3] = ptr & 0xFF;
	return code;
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
        return value + "\n";
    };
    builder.multiLineComment= function (value, loc) {
        return value;
    };
    builder.lineTerminator= function (value, loc) {
        return value;
    };
```
