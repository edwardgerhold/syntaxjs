Mozilla AST Augmentation
========================

Add the fields of "statics semantics" with the appropriate name
next to the working mozilla ast and be sure, that you would like
to experience a better structure for the parser api ast (v2.00??)
during development.

Notice that some of the requirements are completly met and the fields
just have other names. But when getting varnames and lexnames the thing
is, a regular parse has the lists spread over the statement list. that
has to come together again. Here are some notes.


Constant Time Static Semantics
==============================

For Ecma-262 Edition 6

The Static Semantics of ECMA-262 are comparable to AST-Node Properties with
the same name and behaviour. 

The thing is that you can or better must not add another stage to validate the
node to the parse-and-eval process, but to collect them while collecting the

_Adding static semantic fields of ES6 to the AST_

1. To each appropriate node for each one listed in the grammar.
2. Add, if needed.

* A StringList "boundNames" = []	(they are iterated from first to last)
* A StringList "varDeclaredNames"  = [] (for first to last iteration)
* A StringList "lexDeclaredNames" = []	(same)
* A NodeList "varDeclarations" = []	(same)
* A NodeList "lexDeclarations" = []	(same)

* A Boolean "hasSuperReference" 	(add up to top-level-function containing it)
* A Boolean "validAssignmentTarget"     (mark your patterns wether they are in position)
* A Boolean "anonymousFunctionDefinition" (mark anonymous functions, like node.id not existing in regular parser api)
* A Boolean "inTailPosition" (set if you are parsing a tail position (a call on return))

* A Boolean "HasComputedPropertyKey"
* A Boolean "SpecialMethod"

* A String PropName is on PropertyDefinitions
* A Boolean isConstantDeclaration in LexicalDeclarations (like kind="let" in variableStatement)

Still separating an not implemented yet by me.

* List importEntries (All, known, unknown)
* List exportEntries
* List unknownImportEntries
* List unknownExportEntries
* List knownExports
* List knownImports


* For "Contains" generally a recursive pseudocode is defined at the beginning of the
code. For simple translation i would prefer to fixcode a boolean flag for the nodes asking
for contains.


You can take the Table of Contents to figure out which fields to place in which nodes.
It is written so nicely, that you can read, whatd


Got me? I tried around to add some extra lists in scope to carry the declarations,
but "Mozilla AST", which is just a possible Reflection , does not meet the perfect 
requirements, like VariableDeclarations parsed in Blocks can have multiple nodes in
one block appearing each time with a var statement, but later we need only one list
to initialise all the names with createMutableBinding.

Apropos VariableDeclarations
============================

Optimizing the number of VariableDeclarations by reducing them to one
list each kind (one for all vars, one for all lets in the scope one for
all consts).

All Blockstatements can have a reduction to one VariableStatementList, 
too.

_How?_
1. Instantiate a VariableStatement being your toplevel var statement each kind.
2. If you come along a variable statement, push it into the declarations list
and forget about saving the original statement with an extra entry in the
StatementList.
(which is same as static semantics vardeclarations, but with parser api nodes)

A dedicated Top-Level VariableDeclarationList,
which gathers all "var" Statements of one function in one list.
And not line by line with a new node

Other thing could be to add the optimizing of the VariableDeclarations into the
VariableStatement. That they will be collected, but with correct loc information
already in only one node each kind "var", "let", "const" being added to the declarations.


