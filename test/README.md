Tests
=====


The current tests will be done with testmaker.js and tester.js
and only include the tests in the json directory.

All other tests should are now removed, as they were not up to
date, or half of them not working, and it shouldn´t be that you 
should figure out wether the file is invalid or the tool has bugs.

Tests
=====

A real test suite for syntaxjs is not existing
and i only have a few files for manually testing
a little. A few single files are not usable anymore.


The goal is to run test262 later. And that will be the 
testsuite then. For it i will go to TypedArrays, too, 
to make sure we have GC and real WeakMaps. But it´s
quite a long way until there.

New Status: New and valid tests will be stored in 
the json directory, as they can easily be translated
into other test libraries source code from reading the
json. They can be run with ./testall. But they are not
much.

Earlier: I used syntax.js/tester.js on my homepage for
full colored HTML tests. 

./testall
======

in the root directory of the project is a script ./testall
for unix which can be sourced to call all testmaker.json files.

/json directory
=====

the testxxx.json files contain init and tests each file and can be run
by calling ./test file.json or ./testall to loop over *.json.

/mocha directory
======

currently no support, testmaker.js shall convert all .json files to
mocha tests.
	
/test262 directory
========
    script to start test262 with
	
*	./test262.py --command="node syntax0.js" --tests=/test262root/
	
    if it´s really working just ctrl-d has to be pressed to leave each
    test as long as the debuggee is prompting for shell input automatically
    
    will get some support by me, that one has not to hit ctrl-d all of the
    time.