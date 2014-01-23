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

Update: In regular js space it creates an object "syntaxjs". Within the inner Environment,
Reflect.parse(code) and Reflect.parseGoal("GoalSymbol", code) are available. A quick
look onto the ast can be achieved by typing .print first. Example ".print var x = 10;" 
There is a little primitive api on the syntaxjs object for tokenizing, creating asts, 
evaluating, and converting an ast back into source. A syntax highlighter with controls
starts for free in the browser, but my current view on localhost shows, that i broke 
the default options, last time i moved the code around and out of the export section. 
Nothing difficult. Will be under the next commits so i can show you. 
Unchecked: Possibly the line if (syntaxjs.system == "node") syntaxjs.nodeShell() has to get
another check against nodes module.parent if the shell starts even when requiring 
the program. I enabled starting the shell automatically just for convenience.


```javascript
var code = "let x = 10, y = 20, z = 30";	// You can pass source directly into each of the functions
						// or what you´ve received from previous step [toValue(createAst(tokenize(source)))]
var ast = syntaxjs.createAst(code);		// createAst and tokenize return Ast and Array.
var result = syntaxjs.toValue(ast, true); 	// true keeps the environment alive, else each toValue restarts
result = syntaxjs.toValue("x+y*c");		// but that will be replaced by returning a realm object
						// with it´s own evaluation function 
var source = syntaxjs.toJsLang(ast); 		// let x = 10, y = 20, z = 30;		
```

Some issues

Generators don´t work. The path into the Iterations has to be recorded first.
Because it is using indirect recursion evaluation on some mozilla api like AST.

I possibly broke for of. And for (x of "abc") possibly puts out "[ o o o o o 
of [object Object] instead of a string iteration. This is one of the features
which worked where i wonder what i did to break it. 

There are a lot of issues i know about. But to explain i would have to
write something understandable up. But i know the way through them.
Update: I think to keep this repository and to transform the project for.

There are possibly a lot of features broken. Currently i speak of the worst
version ever. Last month i ruined the system and have not really searched for 
the main cause yet. Today i suddenly had the feeling to create a repository.
In reality i celebrated the publication of the latest draft.

Update: The /test directory will be installed soon. I have a couple of files but the
main goal is to run "test262.py --command="node syntax0.js" --tests=/test262"
On the shell you have to press CTRL-D each Test, coz it´s configured to jump 
into the shell after executing a file, for development, that i can look into
the resulting environment.

For the project i have a standard directory tree, and package in mind. 
I think the submodules will go into /lib, the css into /css and the docs
into /docs, tests into /test and /tools into tools.

Next i will remove the bug which broke my browser version, rewrite this
readme to specify the program and it´s internals, that you can read it,
make my mind up not to commit too much edited readme (won´t ever happen
again because i write a main documentation into this file until the next
commit)

Times - i have no job, but i am not sitting at the computer the whole day.
I leave, for hours, for days. Then i return and do something. Sometimes i
left a note on my homepage, here i shouldn´t.

I know nothing about the githup pages or the wiki. If i want to talk, i 
should move it into there. So the next will be a documentation here. And
probably, the draft is out, but i didnt code yesterday and not today, i 
will continue. Removing the browser bug will take a few minutes. Maybe
i search for ten minutes and remove it in twenty seconds. 

Whatever, i already started talking in the README.md. I didnt want that.
So i leave putting a few commands into the shell up to you. I gonna inform
you how the thing works the next days with a replaced README.md containing
the internals. 

Hope not to annoy you too much with the bugs.


---

Notes for myself about what to write into the documentation

A hint for myself: When restarting the README: Start clean, talk clear, precise,
no commas, no personal words, just the data, the code, the bugs. That everyone
at once understands, how the program works. You leave the computer after submitting
this notice? Well, others wouldnt even write that up. The same for you. But if you
take the computer again, take your time, write us an hour or two a clean and sober documentation up.

As well as for the README i should check out the wiki and what i have got with a github account
I signed 2012 but i had no project, i learned almost nothing about github.

Working -

* the story, from a syntaxhighlighter to a parser to a interpreter to become a useful tool 
* The main object syntaxjs
* Starting the Shell
* Requiring it 
* tokenize() - Explaining the tokenizer internals
* createAst() - Explaining the parser internals
* toValue() - Explaining the Interpreter internals
* highlightElements() - Explaining the Highlighter with GUI
* highlight() - Explaining the text only highlighting function returning a string with span elements
* CSS Classes and DOM Layout of the Highlighter 
* toJsLang() - How the AST is recursivly retransformed into a string

Open Tasks - 

* compile() - The missing piece and what i have done to make sure,
it is feasible to add the compiler later
* Heap Model		- theoretically complete, most is about load and store, hashing datastructures, and bitflags to reduce size
* Byte Code Model 	- at the beginning i asked myself "self-defined opcodes?" "is there something" meanwhile the program progressed
* Garbage Collection    - how i implemented a mark and sweep gc on a typed array in about hundred lines of code a little earlier

More Internals - 

* My AMD "Model" - Why my module system with the exports is weak and sucks - how it works and what i experience with

* My Data Structures - I use Arrays as List, if the Specification says List i used an Array.
		    If the specification says Array, it is a special defined Object called "ArrayExoticObject".
		    If i can use stringkeys, i replace Lists with Object Literals to save complexity like O(n) .indexOfs.
		    
* Identifiers and Names - I broke almost every rule with Capitalizing Most. And a handful of Datastructures use new,
    the others Object.create. Why i don´t like my own inconsistency, but can live with it.

* My LLVM Dream - How i dreamed to compile the engine later from JavaScript to C++.

* BUGLIST
* All open bugs.

    For that i should also check out the github bugtracker to

---

Hope not to annoy you too much with the notes.

I couldnt free my mind to reflect about redoing the page otherwise.

While typing i have a strong wish to fetch the vocabulary book from the shelf, it is needed here.


Ok, i submit this **** now and restart with the documentation.