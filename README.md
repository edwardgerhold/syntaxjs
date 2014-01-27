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

Have to write up the documentation

I have already taken an english book for, but it will take 
another few days until i have read some useful and utility words.

The program starts with a simple shell created with the "readline" interface
in node.js. In the browser normally it self attaches a DOMContentLoaded event
an scans for PREs and CODEs to highlight them with controls or only colorized.
data-syntaxjs-highlight=false can turn it off, data-syntaxjs-controls=true can
turn controls on. Regulary it´s preconfigured, like my homepage starts with the
highlighter, but...currently it´s broken. Due to some edit in december.

In december i broke the program. I tried to find it with a few edits, but that
didn´t help this time. It got a little away from the es-262 algorithms. Also 
since december i have to repair them, to meet the specification logics again.
But i am not inactive, living with my broken program, until i fixed it, i work
on the other features, from time to time. Sometimes a little oftener, like now,
other days i have some longer breaks.

Last year i only had a PIII with 933MHz and 512MB. It wasn´t just waiting long
for the programs. A simple Editor like Sublime Text wasn´t usable on, it took
to long for a response. In mcedit i had to turn off syntaxhighlighting and wrote
most of the code until january with the blue editor from the midnight commander.

I think i will split the thing into files, and require myself to run a little
./build before checking out the next version. Editing one file is great, but
i could take a) a watcher to watch for edits and rebuild all the time i save
the file, or b) do it manually. But the time of the large single file is counted
up.

While the program is broken, i mean with broken, the old version on my homepage
works and shows some demos, and it´s bugs in a series of a couple of tests with
tester.js from the test-dir, which is cool because you can highlight code and test
it under the element after executing it with the program, i will continue working
on other features.

Broken is quite magic in this sense. A few functions fail here, others have mistakes
there. There is a type o, there is a logic bug. This code is missing, and this i am
not even knowing how to realize, today. But i think, this is feasable, even for 
non computer scientists, or us dull bums in the dorms, the specification is easy
to read, easy to realise and, you have to read it, incomplete. But great. It teaches
me a lot, and courses in the internet help me further. The binary and floating point
stuff, i am learning. The compiler, i have taken the class already. I´ll finish 
the ast code first and do the incredible search and replace and add interfaces thing.
Which software engineers categorize under unneccessary extra work.

Mmmh. I have an english book on the shelf, i hear it almost natively, but i can´t
write. Ok, i can read and write, but i forgot practicing a lot of words over time,
so i will upgrade here, too. In the history a deleted first documentation is. I
explained the story of the program, how i came from a syntaxhighlighter to my own
eval function. I explained all the bugs in the modules. And which Datatypes i took
for what. And what is in the code and what´s obsolete.

I will have to tell you again.

Hope to annoy you not too much with the bugs!
