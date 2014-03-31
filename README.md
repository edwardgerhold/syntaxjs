syntaxjs
========

Not bugfree EcmaScript 6 Interpreter written in EcmaScript 5

This is a true ECMA-262 implementation. But it isn´t completed yet. 
It´s "feature complete" like ES6 already is, but the features aren´t 
completed yet. Some things fail, some don´t, some didn´t before,
some do now. It´s a chaotic mess from someone who learns coding in
his first project. I have to learn how to use better build tools,
and how to write tests.

Yes, and i read es-discuss but have never written a line. I came to the point where
i wanted to start, then i deferred again, then nothing was going on and i was doing
something else, however. es-discuss helped me a lot in understand what is inside of
the ECMA-262 standard but the real thing is reading the spec. I´ve read it since over
half a year now. Two months daily. Last time an hour ago in the bus.

```
es6> function *gen() { yield 10; }
undefined
es6> let it = gen();
undefined
es6> it.next();
10
```

= New: Multiple Realms

Creation of an eval realm.
You can have as many realms as you want.
Each realm has own environments, and is independent from each other.
The intrinsic objects (the global builtins) are created once each realm.
About optimizing that code i know something on my list, but that´s out of scope here.
Just install syntaxjs for node.js.

```bash
npm install -g  #to install syntaxjs from it´s directory
```

Then call it in you javascript to evaluate es6 code.


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

Here i find myself missing a state snapshot of the object for the outside world


Previously:

Caveat: Objects are coming out as their ES6 internal representation.
I know about adding adapters and transformers, for or to create JSON message passing,
it´s on the list. But for now, you can use [[Get]], [[DefineOwnProperty]], [[Set]],
[[GetOwnProperty]] on the objects returned directly. If you want to know, how they
work, refer to Ecma-262 Edition 6. I did it relative wordwise
(with foreign misinterpretations).

Comment:
The method TransformObjectToJSObject(obj) is already existing and used in the
functions ending with Xform but i didn´t code it out yet and it isn´t completed.

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

= Regular Usage
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
Edward is a stupid
es6> ObjeOct.create(null)
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

= Standard Steps

It´s really an interpreter

Source Code is entered
It´s tokenized
It´s parsed in Parser_API format + glue code
It´s executed by visiting the nodes and returning the results in Completion Records
If exceptions are thrown they are converted into real exceptions at the end of the eval call.
Execution possibly calls JSON Parser
or calls CodeGenerator (installed for checking out an own codegen in Function.prototype.toString())
The value is returned

The async versions
```
realm.evalAsync("let x = 10; x").then(function (value) { console.log(value); }, function (err) { throw err; });

```
are existing and of course already imagined with message passing and json transmissions over rest but not coded out yet.
The -Xform ending means, that this function like evalAsyncXform also tries to translate properties behind getters
and setters in EcmaScript 5. The right stuff. But i didn´t code it out yet.

= Parser_API

It´s using Mozilla Parser_API for AST representation.

Currently the interpreter bases on a simple indirect recursive visitor algorithm.
Equal to the visitor pattern by calling visitor[node.type](node) to get the right
function, because arguments can´t be overloaded and i wanted no big switch statement
but a function each node.type.

The visitor pattern is used for evaluation[node.type](node);

The parser is written with this.* on each call to a subroutine of the parser object.
So the parser[key] could be decorated by using the this and calling with the this value.

New Token
I think this token will make it, it´s almost the same as the node


```
> syntaxjs.tokenize("`ich ${bin} ein ${  template()  }`")
[{
    type: "TemplateLiteral",
    value: ["ich ", "bin", " ein ", "  template()  ",""]
}]

```

New Nodes

For ES6 i had to add a couple of nodes
There is a file docs/parserapi.html where i try to describe.
TemplateLiteral (contains an Array of Spans from TemplateHead to TemplateTail with the unparsed Expressions
between)

The answer for new static properties on the AST supporting the old Parser_API AST is the "Static Semantics"
of the ECMA-262 Specification. They form (long named) the complete required AST properties (say static
variables as lists or single values each node, which will be collected when parsing, say ast properties).
One should update parser api for.
Example: MethodDefinitions should have .static (static class property) and .special (getter, setter)
properties,
ExpressionStatements containing a function or not should have "isAnonymousFunctionDefinition" and
"isValidAssignmentTarget" to reveal what they possess in constant time to the compiler. Waiting for
the next node and checking it´s field is way to much if such properties can help you go constant.

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
Seems obvious that i´ll change it to use raw and cooked when creating the template literal node. Which is
better for the compiler. This is from March 2014. Before the TemplateLiteral was a string, split later with
a RegExp for Evaluation. It worked, but wasn´t good and far away from the specification which lexed it already
into parts.

```{ type: "LexicalDeclaration", declarations, kind }``` (should be spread into LetDeclaration and ConstDeclaration for making the best possible)
```{ type: "ForDeclaration", kind }``` (for-of has a ForDeclaration rule, ArrayComprehension and GeneratorComprehension have a ForBinding,
possibly this could be refactored, but currently it is supporting the system to work)

```{ type: "Module", body }``` (new top level production, has other rules than "Program")
```{ type: "ModuleDeclaration", id, strict, body }```
```{ type: "ImportStatement", imports }```
```{ type: "ExportStatement", exports }```

```{ type: "RestParameter", argument: id }``` latest parserapi draft covers .rest at functions, but not in patterns, etc.
```{ type: "SpreadExpression", argument: id }``` spread expressions are the ...spread for any array or arguments list.
```{ type: "DefaultArgument", id: name, init: expression }```
```{ type: "MethodDefinition", id, generator, formals, body }``` This makes it convenient to parse methods with concise syntax
```{ type: "BindingElement", id: identifier[, as: identifier] }``` in ObjectPattern["properties"]


Wrong Implementation?

A little difference from the Parser_API by mistake is that i haven´t used "default" and "rest" in
the function nodes because of the "RestParameter" and "DefaultArgument" nodes i introduced already.
I wasn´t sure how to fill the default´s array. With the number of argument nodes and a null everywhere,
where no default is?
(Oh my god)

Additional Builder
Will be used for the compiler later, for sure, because i´ve interfaced with already.

But i have another interface to propose ```function [node.type](node) { ...process node here.. }```
which is used for the visitor, the interpreter and could be used by any kind of builder

Additional Decorators
With the requirement for this.* calls for function [node.type] being on a object[node.type] these
functions can be decorated for any kind of additional or changing behaviour with the cost of decorators.



= Missing

* Developer Documentation

After splitting up the files i see more room for good comments and putting relevant information into
the files. This will happen over the time.

I think the best is to annotate the code now, because i´ve split the code up.

= Bugs

I have a few big things on my list
And know the hundred and fifty open bugs

I know what´s going wrong
But it takes time until i repair them

= Design Issues

- Design Patterns

They are coming into this. I have read the Head First book in March. And i know they are communicatable,
means, you understand at once what i´ve written, or what that skeleton is for.

There are factory methods for the tokens and nodes planned as well as a refactoring of the
highlighter app for the builder.

The visitor/interpreter is doing it´s job very well in his variation.
Decorators are coming to all the parser/lexer/evaluation functions. I´ll fix the latter with this, too.
This makes analysis possible and hurts with a thisexpression, which should be constant in modern engines
and be not slower then accessing the scope anyways for the function.

I will change the fswraps into an adapter. And will use an adapterMaker which returns a browser/worker/node
adapter by passing in an object with three functions.



- Heap

Is for storing all objects and data
Will be used by the final compiler for storing the compiled code.
Was deferred while coding the interpreter.

But was already recognized - that´s why there are callInternalSlot and other Interfaces for handling
the code later.

- Compiler

Stores all the AST refactored for the operand stack and the fetch-decode-exec cycles in a typed array.
Was deferred for completion of the AST runtime

Was also already recognized. But i hadn´t read about compilers before and had to fetch informations and
lectures from american and german universities to catch the right class. Then i´ve read some books and
meanwhile i´m behind myself with the code which seems to be promising to get it.

Yes, and i´ve already checked out LLVM and the Docs and know what kind of compiler i could write with.
Inspired by the famous emscripten and being far away from C++ and Linux i got behind what LLVM really is.
Already in November, December. When i printed the manual and got to read it. In Feb. i started Java so in
the typed version i´m a bit behind, but till ES7 we should come together :-)

- Syntax Highlighter

Is the OLDEST part in the System and keeping me away from letting the tokenizers stand alone mode
die in favor for real input element goals on next calls everywhere the grammar says.

Bases on the tokenizer and blocked my development for a while or a few times, because i won´t take
my time to change break the program (last year it served my homepage with the tests and i had no
experience how to treat software or my efforts with value).

Should be refactored to use the AST instead of the tokens, well, the tokens AND the AST for highlighting
is more than only the tokens, coz scope and eval results are inclusive.
requires data-astnodeid for mouseover/touch annotation of expression types

= Tests

* There are some handwritten files, and some handwritten tests existing, but
the final testsuite shall be test262, the official testsuite for ecmascript,
which can already be run from the commandline.



News: I have cleared myself up to write tests manually again with tester.js
but to collect them, because i have to test the system to repair the latest bugs again.
I didn´t test with new tests since december after i broke the whole thing through once
(with thousands of new lines and even thousands of otherwhere deleted lines) and managed
it to repair it except for the highlighter startup,.

 Means - new tests are coming. I will write them in single files, which will be run from
 the console OR and that will be improved if i can´t do it via syntaxjs and testerjs now
 the browser without change. Previously i manually implemented the tests inside the HTML
 page and ran test against code in some elements. I will do both and try to cover the whole
 thing so far that it proves that test262 should be run against.


= syntaxjs.* properties

I will rename createAst to parse()
and toValue to eval()
and tokenize to lex if tokenize isnt kept
and rename the other to the equivalent.
Didn´t do till today coz i didnt publish it
Then thinking about makes it clear.
.eval()
.parse()
and not
.toValue()
.createAst()
i think people will like the former and
maybe use but not be satisfied with  the latter
But i can be wrong.

The list of syntax.js properties will be for a future README
i will fix them as soon as i have renamed them altogether for a commit.
