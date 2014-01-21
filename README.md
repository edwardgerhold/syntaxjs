syntaxjs
========

Not bugfree EcmaScript 6 Interpreter written in EcmaScript 5

It can be tried with simply typing node syntax0.js. 

'''bash
linux-www5:~ # node syntax0.js
'''

Generators don´t work. The path into the Iterations has to be recorded first.
Because it is using indirect recursion evaluation on some mozilla api like AST.

I possibly broke for of. And for (x of "abc") possibly puts out "[ o o o o o 
of [object Object] instead of a string iteration. This is one of the features
which worked where i wonder what i did to break it. 

There are a lot of issues i know about. But to explain i would have to
write something understandable up. But i would know the way through them.

There are possibly a lot of features broken. Currently i speak of the worst
version ever. Last month i ruined the system and have not search for the main
cause yet. Today i suddenly had the feeling to create a repository.

Hope not to annoy you too much with the bugs.
