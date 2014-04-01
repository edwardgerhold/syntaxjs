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
something else, however. es-discuss helped me a lot in understanding what is inside of
the ECMA-262 standard but the real thing is reading the spec. I´ve read it since over
half a year now. Three months daily. Last time an hour ago in the bus.

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
It´s about moving all call_function out of create intrinsics for only being created once.
Fine optimization portion for creating few intrinsics with a few realms, or?
Just install syntaxjs for node.js.

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
Equal to the visitor/interpreter pattern by calling visitor[node.type](node) to get the right
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
properties, it´s ugly to test oneself wether it´s a get or a set after the parser had that already.

ExpressionStatements and Expressions (Assignment, Binary) containing a function or should have "isAnonymousFunctionDefinition" (righthandside or syntax error, eh, function () is not allowed ;-)) and
"isValidAssignmentTarget" (lefthandside) to reveal what they possess in constant time to the compiler. Waiting for
the next node and checking it´s field is way to much if such properties can help you go constant.
Hmm. I should elaborate the list here. That you can read it.

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
```{ type: "DefaultArgument", id: name/pattern, init: expression }``` id can be
```{ type: "MethodDefinition", id, generator, computed, formals, body }``` This makes it convenient to parse methods with concise syntax,
.computed is for get [s]() computed property names (needed)
```{ type: "BindingElement", id: identifier[, as: identifier] }``` in ObjectPattern["properties"]

.computed is IsComputedPropertyName (in objectliterals, resolves to a symbol)

.computed in MemberExpression stands for obj[key] 
But .computed in PropertyDefinitionLists stands for { [s]: prop } keys.

together with of .const for IsConstantDeclaration
a LetDeclarations and ConstDeclarations should be
 made with the "LexicalDeclaration" to cover each
 case uniquely.
 I changed VariableDeclaration to Variable- and Lexical- for alignment with the spec grammar, but LetDeclaration
 and ConstDeclaration would be the nicest readable making no trouble collecting them, like looking and kind="let"

 ```
    isConstantDeclaration = { "const" : true };
    if (isConstantDeclaration[node.kind]) used in instantiation

    if (node.const) used in instantiation

    if (varDecl.kind === "const") the only possibility today, but assume you have a varDecl.declarations[i] in the hand. There is no .kind.

 ```


Wrong Implementation?

.kind should be on all declarations, that´s why i added it on the fly for letting the latter example run easy
without reconsidering a declarations node which is not in the LexicallyDeclaredNames list. (One should elaborate
wether a Let and Const List is easier to use in InstantiateXxxDeclaration or not)

A little difference from the Parser_API by mistake is that i haven´t used "default" and "rest" in
the function nodes because of the "RestParameter" and "DefaultArgument" nodes i introduced already.
I wasn´t sure how to fill the default´s array. With the number of argument nodes and a null everywhere,
where no default is? (Oh my god)

Additional Builder (Parser_API Builder, not Builder Pattern self)
The codegen module is using the builder Pattern in combination with callBuilder(node) for perfection (is clean, read).
Will be used for the compiler later, for sure, because i´ve interfaced with already.

```
    var builder = {};
    // The original Parser_API builder has a different signature for each node.type
    
    builder.functionDeclaration = function fdecl(id, formals, body, strict, generator, expression, loc) {
	// much parameters to pass exactly when doing the interfacing
	// is a little to learn for the beginning and easy after being introduced to
    };

```
Here i have another interface to propose ```function [node.type](node) { ...process node here.. }```
which is used for the visitor, the interpreter and could be used for any kind of Parser_API Visitor
and Builder.
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
	var ptr = heap.store(node.argument);
	code[0] = byteCode["return"];
	ptr = ptr || 0;
	code[1] = ptr & 0xFFFFFF;
	code[2] = ptr & 0xFFFF;
	code[3] = ptr & 0xFF;
	return code;
    };

```
It´s easier, or?
I use a function callBuilder(node) with a giant switch to map the node and
it´s arguments (via switch decision i do each manually) to the right interface
and call apply with the arguments array i created in the switch.

TO DO: the options argument of Reflect.parse is not inclusive in the current version.

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
highlighter app for the builder. No matter, wether it´s createProgram(body, loc) or
createGUIButton(),  factories and builders will find it´s way here.

The Composite/Strategy/ and MVC for the highlighter is not an option right now, but i´ve
suddenly checked how the good GUI´s are designed today.

The visitor/interpreter is doing it´s job very well in it´s variation.

Decorators are coming to all the parser/lexer/evaluation functions. I´ll fix the latter with this, too.
I think evaluation[node.type](node) is already decoratable. The parser definitly is.
This makes analysis possible and hurts with a thisexpression, which should be constant in modern engines
and be not slower then accessing the scope anyways for the function.

I will change the fswraps into an adapter. And will use an adapterMaker which returns a browser/worker/node
adapter by passing in an object with three functions.

- Other JS Engines

I noticed it is not running in nashorn.
That´s a real problem.
It should
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
should interface with the java api here and bring it forward (think but have barrier of no experience with)

and it doesn´t in Spidermonkey
where i will check for load and print and look

ok i have tested it as i´ve written this

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

seems like i have to fix something

(spidermonkey is already working so far. but i have to take a list
for print/console.log and other functions/properties provided/not provided
to make some duck typing system complete)

- Heap

Is for storing all objects and data
Will be used by the final compiler for storing the compiled code.
Was deferred while coding the interpreter.

But was already recognized - that´s why there are callInternalSlot, setInternalSlot, getInternalSlot
and other Interfaces for handling the code later. The theory with the lookup table for functions is
already made and i can reference native (js is "native" here) and compiled functions with. The secret
is a special bit on the byte telling me, to read the function outside of the heap is what i add here.

- Compiler

Stores all the AST refactored for the operand stack and the fetch-decode-exec cycles in a typed array.
Was deferred for completion of the AST runtime

Was also already recognized. But i hadn´t read about compilers before and had to fetch informations and
lectures from american and german universities to catch the right class. Then i´ve read some books and
meanwhile i´m behind myself with the code which seems to be promising to get it.

- Syntax Highlighter

Is the OLDEST part in the System which kept me away from letting the tokenizers stand alone mode die 
in favor for real input element goals on next() calls everywhere the grammar says.

Bases on the tokenizer and blocked my development for a while or a few times, because i won´t take
my time to change break the program (last year it served my homepage with the tests and i had no
experience how to treat software or my efforts with value).

Should be refactored to use the AST instead of the tokens, well, the tokens AND the AST for highlighting
is more than only the tokens, coz scope and eval results are inclusive.
requires data-astnodeid for mouseover/touch annotation of expression types

(HAS TO BE REPAIRED, GOT BROKEN BY A BYTE OF MISTAKE IN DECEMBER WHICH HASN´T
BEEN SPOTTED YET! IT MUST BE SO STUPID THAT I DIDN`T FIND AT ONCE IN DECEMBER
OR IN EARLY JANUARY)

= Tests

* There are some handwritten files, and some handwritten tests existing, but
the final testsuite shall be test262, the official testsuite for ecmascript,
which can already be run from the commandline.

* I will write new tests.

FOR APRIL 2014:

* NEW TEST WILL BE IN /TEST/HIGHLIGHTER in HTML FORMAT. I JUST BEGUN WITH.
THEY WILL USE A PRE ELEMENT FOR A CODE SNIPPET AND SYNTAXJS TO EVALUATE IT
AFTER GRABBING IT WITH QUERYSELECTOR AND TESTER.JS WILL VERIFY THE RESULTS
WITH THE EXPECTATION PROVIDED. ALL IN COLORS IN HTML WITH THE HIGHLIGHTER.



