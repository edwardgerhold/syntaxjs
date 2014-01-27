Tests
=====

A real test suite for syntaxjs is not existing
and i only have a few files for manually testing
a little. A few single files are not usable anymore.

The goal is to run test262 later. And that will be the 
testsuite then. For it i will go to TypedArrays, too, 
to make sure we have GC and real WeakMaps. But it´s
quite a long way until there.


/node
=====
    scripts to be executed by calling them with 
    
*	node <name>

/direct
======
    scripts to be executed directly by the interpreter with 
    

*	node syntax.js name
	or with
*	./test name

/mktest
=======
    scripts to be executed with 

*	node testxx.js
	
/test262
========
    script to start test262 with
	
*	./test262.py --command="node syntax0.js" --tests=/test262root/
	
    if it´s really working just ctrl-d has to be pressed to leave each
    test as long as the debuggee is prompting for shell input automatically