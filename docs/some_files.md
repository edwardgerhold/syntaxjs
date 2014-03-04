FILES IN THE PROJECT
===================

Currently everything is underspecified.


The first megabyte, whitespaces and a few comments inclusive, had been written
with mcedit of the midnight commander on a Pentium III Computer in a dorm in 
Berlin, Germany. The computer wasn´t powerful enough to let me use an IDE or 
a better Text Editor like Sublime Text 2. At the 28th of December, 2013, i 
bought an used notebook for 199EUR (which is really already too much money for me)
and suddenly i have the possibility to use IDEs and tools.

Basic knowledge of software engineering mainly forbid me to write a big single
file. But i hadn´t really had an option. Now i have to spend a few hours with
sorting by cutting and pasting. And a few hours with splitting the files into
modules.

To do it correctly, i have to keep track of everything i do. For this, documents
like this will hold the informations.

Directories
===========


* /	- Root directory

contains syntax0.js, the current development file, which will be split into
modules in the coming days for us, to make it easy for us, to share and edit files.


* /css - Stylesheets for the Syntaxhighlighter
will contain the stylesheets for the browser, probably modern sass or less, but until we do, just css.

* /docs - Documentation and technical papers
Will contain documentation and useful documents explaining difficult things you need to know to write your own, or to help us making this become a good tool.

* /lib - JavaScript
 here the js files will go into, currently everything is stored in the big /syntax0.js, which
was my development file on my Pentium III. 

* /test	- Testing
files related to tests will be put into /test

* /tools
Will contain useful stuff like tester.js or promise.js

Files
=====

Some files
* /README.md - Each directory should get a leading README.md and one index.html (for a website) to explain what´s inside the directory
* /es6 - a script to copy into /usr/local/bin and chmod +x after editing the directory variable inside, replaces "node $path/syntax0.js $1" with "es6 $1".
* /syntax0.js - Currently the one and only file, containing all "modules". (the modules are placeholders for real modules, which will arrive within the next days).
* /package.json - So npm install syntaxjs would work.
* /tools/tester.js - An easy to use unit testing tool.

```javascript
var Test = require("tools/tester0.js").Test;
var test = new Test();
test.add(function (test) {
    this.assert(this === test, "The test library is passed as argument and as this value into each added testfunction");
    test.assert();
});
test.run();
test.print(); 
// test.html({ el: "#findMeById" }); in the browser

```


Some documents
* /docs/parameters_es6.html	- some words about the new plalr(1) grammar production parameters and ll(1) parsers.
* /docs/contains-symboltable.html - some interesting idea to save symbols and contains information in constant time while parsing.
* /docs/parserapi.html - some additions to mozillas parser api

Some tests (a few may be out of date, or wrong, i didnt manage it, to write a testsuite until today)

* test/direct
    some filename.js which can be run with "node syntax.js filename.js".

* test/mktest
    with ./mktest number it copies test0.js to testnumber.js and  and code0.js to codenumber.js,
    code.js is a file with a code, which will be tested.
    test.js is a file which starts tester.js and evaluates code.js with syntax.js and
    executes tester.js on the results and environments of syntaxjs.
    
* test/node
    these files are supposed to be run with "node $name"
    
* test/test262
    this is not only a reminder. with ./test262.py --command="node syntax0.js" --tests=/test262/"
    you can start the test262 suite.
    If the shell is configured for auto-start you have to press ctrl-d after every test (the
    prompt is invisible) and you get the results.
    