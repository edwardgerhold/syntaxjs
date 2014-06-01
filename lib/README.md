













These files have to be reordered inside some days. Two, three, four get merged.
Maybe i split out another piece. Then i can write up again, what´s inside these directories.


Splitting up continues
======================

(comment in between)



* ast-api/


    covers what was in api.js
    this means the ECMA-262 api functions 
    plus primitive types and exotic objects


* intrinsics/
    createIntrinsics is called once every realm
    covers what was in create_intrinsics.js
    this means the ECMA-262 standard builtin library
    definitions

    the declarations have been moved independent


* parsenodes/
    covers mozilla parser_api related stupp

* compile/
    currently the compiler is fiction but some files exist
    (this will stay no fiction like others did the same before)

* unicode/
    here i will put some work for unicde support in
    first is the table from mister bynens i edited for fast xs of code points
    in the identifier part and start sets.

* highlighter/
    the syntax highlighter has an app and a separate text-to-span-html function.
    
some exchange from intrinsics to api is already seen
which was on my refactoring list since lazydefineproperty
and a hint to put the functions where. under the exotic objects
and in relative files.


(old content)

Just split it up
================

Have to describe it

Here are stitchwords


* /lib - JavaScript

here the js files will go into, currently everything is stored in the big /syntax0.js, which
was my development file on my Pentium III. 

* lib/amd-prolly.js
    
    has makePromise, define, module, require

* lib/i18n.js

    placeholder for i18n functions and the message table
    with a default language
    
* lib/tables.js

    hashsets shared by the tokenizer, parser, runtime.
    each of them access a few tables from the module
    
    the tables are faster than if-else-if or switch()
    coz it is just one get per key, no O(n) comparison
    of if conditions or case expressions.

* lib/tokenizer.js

    the tokenizer was separate for use in my syntaxhighlighter.
    this is how the project begun.

    is integrated with a few edits in the parser again, what
    is not even a requirement, but standalone requires checking
    last token and lookahead to decide which inputelementgoal 
    comes. remember /regexps/ are lefthandsides of a member
    expressions and not replacing a / operator position if no
    lineterminator or semicolon follows after an identifier or
    literal. (and a little more i hacked into for)
    
    has still to get template tokenization, just get´s `...`
    which is split later by a not-conforming implementation
    giving almost same results. i in the issue tracker, too.

* lib/crockfords-parser.js

    this parser is not in use, but lightweight, fast, functional,
    it´s a write-up of crockfords tutorial, not continued yet,
    but it´s here, because it will also get it´s time!
    
* lib/semantics.js

    static semantics which run very slow, coz they recursivly
    analyze the ast
    
    in parser.js replacement objects are already prepared.
    will take some sessions, till i come to and replace.
    
* lib/parser.js

    is a recursive descent parser. this is no esprima copy.
    mozilla ast was the one ast the other was jsonml and i
    preferred this one, maybe because of the existing tools.
    a long term goal is to let this become interchangable
    with esprima. That esprima ast could use evaluation,
    compilation, generation,
    
    have some observer based extensions in mind getting
    called with the node to process it.
    
    and some decorator based enhancements for parse()
    in mind returning a new parse()
    
    and some parser adapter to exchange this and esprima
    (which i don´t know yet, coz our es6 ast will vary,
    i´ve never seen his yet, but want the compatiblity
    for the long term goals)
    
* lib/heap.js

    sorry, unfinished, coz i was typing down the draft,
    deferring it a little, coz i had already a lot of
    functions working. (learned about what to do first
    by)

* lib/compiler.js

    future music. still have no official instruction set.
    i didn´t know one before.
    I could use own numbers at once.
    I looked, what emscripten does, but not enough to make
    sure the stuff it compiles is same as the compiled stuff
    in the typed array of an asm.js compiled project.
    see, where it should go
    
* lib/llvm-codegen.js

    deferred generate llvm ir from javascript,
    write your api in a typed language for
    this is a special project meaningful after finishing
    the interpreter (i mean then i should have gotten it)
    
* lib/jscodegen.js

    recreates js-strings from the AST.
    this is used by Function.prototype.toString() in Evaluate, too.
    
* lib/api.js

    the essential methods and data types of the ecma-262 specification
    all ast-independet functions
    
    the object system relies a little on prototype methods, but has
    a useless mapping-gate beetween which simulates the bytecode interface,
    and some working functions like getinternalslot and setinternalslot
    and callinternalslot, which are called with the object as arguments,
    not on the object. i already removed most of .member direct accesses
    on any of the ordinary objects, coz the callinternalslot and all other
    accessing functions can be 
    exchanged by createASTEvaluator(), or createHeapEvaluator()
    
    i have lot´s of plans for except for design pattern, which i just
    started with, but they will be essentially very soon, coz i can 
    communicate the source then to you.
    
* lib/runtime.js

    the runtime semantics for ecma-262.
    can be reused with bytecode after enhancing it with some functionality,
    i described currently in the main readme and later in /docs
    
* lib/highlighter.js

    a browser-independet highlighter function, which returns tokens replaced
    by spans. got some hashtables for classnames.
    
* lib/highlighter-app.js

    a browser app, this finds pre and code and highlight´s both. pre with
    menu, if desired, and code like a bold or italics
    has mouseover features with annotation
    
    cooler would be a subexpression-evaluation showing intermediate results
    when mousing over. The interpreter could do that, so i have ideas like
    doing this via observer-notifier, where i notify the highlighter about
    the evaluated node and the result, that it can update it´s annotation
    or view. but i hadn´t time for yet because the rest is unstable.

    createFeaturingElements is a perfect thing for one of these patterns,
    i read in the books like "head first design patterns" since some hours
    the last days. So i already have in mind to change the code for you to
    make it more impressive or better said "readable"

* lib/worker.js

    was the web worker startup. worked, hat to disable console.log for.
    should be able to receive messages like parse or tokenize and some
    data.
    
    worker computation can help e.g. the highlighter to calculate and
    highlight and evaluate the stuff for the sub-expression informations.
    what´s the result of (a+b) in (a+b)+c ? just mouseover and read.
    (is not impl but a feature idea i write down to make sure to write)
    
* lib/fswraps.js

    fs.readFileSync wrapped ?
    whatever i wanted this for
    to read files.
    
* lib/shell.js

    a fs.readline interface with multiline-input by scanning open parens
    nothing special, but the thing that starts if node syntax0.js is called
    (can be disabled by replacing syntaxjs.nodeShell() in app.js);
    
    has a special option
    (mainly in the wrong module?)
    takes a second argument on the command line node syntax0.js [filename]
    and evaluates that passed filename.
    this makes test-262 possible i guess. but i am missing some points, what´s
    going on inside yet, so it will take a while till test262 is reliably working with.

* lib/syntaxjs.js

    here i assemble the modules to the syntaxjs object
    
    the thing is this can be replaced by some design patterns.
    a builder for example or a factory, depending on a config 
    object.

     (??? what? what did i mean?) (Delete is an option, heh)

* lib/app.js

    the old main if-else-block from the end of the file,
    deciding what to start on which platform.
    
    (there are patterns for)
    

