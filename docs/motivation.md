= The syntax.js Project =

== Motivation ==

In 2012 i watched Douglas Crockfords "On JavaScript" and his "Classes" and
afterwars the YUI Conf Talks and learned a lot about JavaScript and the design
of YUI.

In December 2012 i wrote a 99 line syntax highlighter which matched the token
by regular expressions. This had some issues that it was not 100% correct, say,
the regexp where 95% correct, but needed more work. I thought it would be easier
to tokenize it and to highlight the tokens.

First i wrote some worst-case performant lookups of Arrays containing the 
keywords and operators with .indexOf, which leads to O(n) each lookup and
to a noticable rise of computations during lexing the elements.

I wrote a little highlighting function to replace the things with spans with
classes depending on the results. In January i wrote a Mozilla AST Parser for
the Tokens i created. I added a button to show the syntax tree. I say, esprima
influenced it, by just a look at the websites demo, forever.

Three months later i took my first algorithms class by video, namely CS61B
from the Berkeley University. MIT´s OpenCourseWare followed. I replaced the
evil Array.prototype.indexOf by table[key] and changed the Arrays of ["var, "let", "const"]
to { "var": true, "let":true, "const": true } to return set-containment in 
constant time. I saw a dramatic speedup on the screen because i wrote it with
mcedit on a 933 MHz PC with 512Megs and OpenSuse 12. It was slow all the time
and most of the time in reality i spend with waiting for the programs to react.

The good was, i wasn´t that bad at writing code with mistakes. I didnt write
good code, maximally sufficient code, sometimes dull and insuffiently named 
code, i had not to debug so many mistakes and most of the times a made some
typos and forgot to review the code again before saving and just continued 
typing.

The parser hat a little evaluation function already in February and could map
some of the AST to some JavaScript, but not to ECMA-262 internal structures.
It gave first results when pressing evaluate.

Sometimes things influence you. While i wrote it, a little rabbit was guest
at our home. The rabbit was ill and died half a year later. We cared for him
until he did. It made me think to continue the program we wrote together. I
talked with the rabbit while working on the first piece of the syntax highlighter.

I started fixing the parser and made my thoughts about continuing evaluation
and two weeks later, in July 2013 i finally picked the ECMA-262 Draft up. I
found a possibility to get it printed, coz i thought i could get it implemented.
In JavaScript, coz i have no practice in typed languages. And why not. It does
not matter if ES6 arrives. I would need such Code for JS Tools anyways. So i
thought i could do it in a few months.

I thought three or four months. Or till the end of the year. And now, a quarter
year, no, another two months later, where almost nothing happened, i am still
not finished. Sometimes i am to lazy, sometimes my girlfriend watches video with
my new used laptop i bought in december, sometimes i have other things scheduled,
and i am poor and spend some hours collecting bottles to get through the month with
food for me, the rabbits, my girlfriend. 

So here and there i did a lot less than
someone doing it eight or ten or twelve hours a day. My head was there oftener
than my hands at the computer, that made me think a lot about the specification.
Now i think i can implement it in any language and even write the compilers for.
I thought i should make it to my capability in future terms, by implementing them
in any language, or at last three languages, mainly javascript, java and c++.

How the code grew? From July to August it raised to over ten thousand lines. A two
or three months later i was over twenty thousand lines. Now i am at around 28000 lines.
I think there are 5000 lines of comments and blank lines to be discarded and another
1000 or more lines to be replaced by refactoring the DefineOwnProperty calls in the
intrinsics section.

The most things which are missing are the builtin functions.

