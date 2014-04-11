This directory is powered by /tools/testmaker.js 
which is a json testrunner for /tools/tester.js

run ./testall to execute all .json files sequentially

run ./test filename.json to test only one


The tests may be seen with a little delay each time they start,
because each test initialiser initialises a whole set of new 
builtin objects. Which means each time the interpreter is 
initialized completly again.  

