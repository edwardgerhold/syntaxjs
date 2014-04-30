syntax.js
=========
(the name is the original name of the original 99 line syntaxhighlighter from x-mas 2012)


Not bugfree(*) but compliant EcmaScript 6 (7**) Interpreter(*****) written 
in EcmaScript 5. This project was started on a PIII/933 with mcedit in a dorm 
and is now continued on a notebook with 2 cores still in the dorm. It´s a fun 
project. And pretty soon able to run itself. (***)

Hmm, i notice difficulties with writing plain text with myself nowadays.
I´m working on it.

(*) still doesn´t run arbitrary JavaScript code, but all lockups are removed.

(**) contains at last one implemented ES7 proposal and stubs for the other

(***) serious documentation and proper seriously written license (with
the same meaning) will take a while and a day more or two. 
A few JSDoc comments will replace the chaotic few comments left between.

(****) typed mem and stack machine is a must for me but it will still take
a while. But then we´ll also have Weak Maps, Weak Sets, and Weak Refs. 


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
es5> var a = obj1["Get"]("a", obj1); // probably a completion record is returned as i don´t filter it on this access

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

```
realm.evalAsync("let x = 10; x").then(function (value) { console.log(value); }, function (err) { throw err; });
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


