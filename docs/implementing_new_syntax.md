# Implementing new Syntax

With the Example of the Concurrency Strawman

http://wiki.ecmascript.org/doku.php?id=strawman:concurrency

Months ago i was looking at the experimental syntax for promises.

```js
  function add(x, y) { return x + y; }
  const sumP = add ! (3, 5); //sumP resolves in a later turn to 8.
```

Today i have a code base where i can implement it. The good is, 
with the same methods you can implement new syntax, too. To 
document it, i thought it would be ok, if i document implementing
one of these specials.


# 1. Updating the Parser

First we take a look at the grammar and look for the equally named 
functions in the parser module. The grammar is to be found in the 
file http://wiki.ecmascript.org/doku.php?id=strawman:concurrency

```js
Attempted Concrete Syntax:

  MemberExpression : ...
      MemberExpression [nlth] ! [ Expression ]
      MemberExpression [nlth] ! IdentifierName
  CallExpression : ...
      CallExpression [nlth] ! [ Expression ] Arguments
      CallExpression [nlth] ! IdentifierName Arguments
      MemberExpression [nlth] ! Arguments
      CallExpression [nlth] ! Arguments
      CallExpression [nlth] ! [ Expression ]
      CallExpression [nlth] ! IdentifierName
  UnaryExpression : ...
      delete CallExpression [nlth] ! [ Expression ]
      delete CallExpression [nlth] ! IdentifierName
  LeftHandSideExpression :
      Identifier
      CallExpression [ Expression ]
      CallExpression . IdentifierName
      CallExpression [nlth] ! [ Expression ]
      CallExpression [nlth] ! IdentifierName
```

You see, Member and Callexpressions get a new "." beetween their
parts. The Lefthandside is enhanced and the delete syntax is updated, too.
The functions we look for, are the same named functions in the parser module.

```js
parser.MemberExpression = MemberExpression;
parser.CallExpression = CallExpression;
parser.UnaryExpression = UnaryExpression;

```


Then we read the functions code, how the other MemberExpressions with 
. and [] and () are implemented and try to figure it out. How to use 
an equal formulation for the new Syntax. Here we gonna add a "!" to it.

```js

```

_Adding a new property to the AST_

For the infix "!" called bang or eventually, we add a new property to
the nodes called .eventual, this can be compiled or tested by the 
evaluation for taking the right rules then.

```js
node.type = "MemberExpression";
node.object = object;
node.computed = true; // is a [expression], false would be an Identifier Propname
node.eventual = true; // is a ! operation
```

# 2. Updating the Code Evaluation 

We gotta search for equally named functions relating to the parse node 
functions. For the MemberExpression we look for MemberExpression, for
the CallExpression for CallExpression, for the .


This time i will write some evaluation of a or to a promise using the
existing new native es6 Promise.


_In function MemberExpression_


```js
// ... evaluation.MemberExpression ...

var eventual = getCode(node, "eventual");
var computed = getCode(node, "computed");
var object = getCode(node, "object");

if (eventual) {
    // 
    var p = GetValue(Evaluate(object));
    if (isAbrupt(p)) return p;
    if (!IsPromise(p)) return withError("Type", "Object has to evaluate to a promise!");
    if (computed) {
	// p ! [expr]
    } else {
	// p ! name
    }
} else if (computed) {

    // normale object[expr]
} else {

    // object.identifier
}
```

I search for the place, where the Object is evaluated.
I check for my node.eventual property, wheter it is a ! eventual expression.
If yes, i assert, the object evaluates to a promise.
If it does not, i throw an error. It is not for creating a promise i guess.
I coulndt write it to the same binding i just evaluated for the expression,
so it has already to a promise, i guess.

_In function CallExpression_

I will do something similar. Look for the right place to insert the
code and do so.

I will call the promises functions for adding a special function doing the
job. What exactly i will find out, when i continue this task here.

# 3. Writing test cases for tester.js or test262

_Adding asynchronous tests to tester.js_

I already added some simple async tests to another old testing script.
I just called a callback after having been called back to test the values.

```js
// Adapted from the strawman:concurrency page

let r = new Realm();
let funP = r.evalLater(""+function (x,y) { return x + y; });
let sumP = funP ! (3,5);

// Here skipping vat.terminateAsap(new Error("die")) to let sumP become rejected 
// if the vat terminates first, which is explained on the strawman:concurrency page```
```

Ok, here we are leaving reality. The code is not added to syntaxjs yet. And
until it is, i leave this out for now.

_Invent the evalAsync Operation for syntaxjs_

```js
var Test = require("tester.js").Test;
var test = new Test();
test.add(function (utils) {

    var code = "...";
    
    var resultP = syntaxjs.asyncToValue(code);	
    resultP.then(function (value) {
        utils.assert(value, 8, "funP ! (3,5) should evaluate to 8");
    })
});
```

