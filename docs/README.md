useful and useless documents
============================

* parameters_es6.html shows a stack for LL(1) Parsers with Mozilla API to activate and deactivate the new PLALR(1) Parameterized Goals.

I simply demonstrate an object, which holds properties named after the Parameters "Default", "In", "Yield", "Return", "GeneratorParameter", which are arrays. Then i show the getParameter, push-
and popParameter functions to enable and disable the parameters. With the arrays the nesting is preserved, so arbitrary production sequences could be imagined. In reality i don´t know
by heart which one is turned of when and for what. The implementation is incomplete and so is my observation. I still have code in with a noInStack for the NoIn Grammar, and some separate
stacks for yieldIsId, defaultIsId, with which i have tested the basic idea. Meanwhile i bet it´s proof to use stacks in an LL(1) everywhere, to evaluate arbritary code, that works too fine for
me, that it isn´t a standard idea. I just haven´t heard.

* parserapi.html is the attempt to write the differences beetween syntax.js and the mozilla parser api, which is first on google, if you search for JavaScript and Abstract Syntax Trees.

The most meaningful is to resolve the incompabilities beetween syntax.js and esprima. With a couple of edits, the parser should be exchangable. Today, i don´t know about the output of 
esprimas harmony branch, i haven´t tested yet. But in the later days, this will be one of the issues on the list, to make both compatible. This doc actually is incomplete, but will be
overworked over time.

Missing documents
=================

* the main syntax.js user documentation

    With 16 years i wrote my first tools ever, and my only releases until today. I didnt know how to program. Much less than today. But i wrote documentations. Clean and plain englisch
    documentations explaining line by line, feature by feature. Even our friend who read them for corrections had almost nothing to correct. I remember our Logo and the Chapters, all in
    ASCII in ´93-´95, but i haven´t written anything comparable until today.


* the syntax.js developer documentation

    internally
    
    - Lists become [] (forward iteration is the most used)
    - Stacks become [] (push and pop)
    
    open
    
        - Priority Queues for the Task Queues: Open, i could at once take a BST i wrote, it has removeMin(). I have balanced trees written.

    
    language
    
    - Objects become OrdinaryObjects()
    - Functions become OrdinaryFunctions()
    - Arrays become ExoticArrayObjects()
    
    