/**
 * Created by root on 17.04.14.
 *
 * The Symbol Table (the good old)
 * shall be the final "static semantic tool" for all duplicate names,
 * which can hold the "lexnames" and "varnames" and "boundnames"
 * and return a list of the current scope chain
 * having the functions loosely in the parser is awkward
 * i´ve tried it now three or four times with different variations
 * i´d left some earlier words in /docs about
 *
 * The good old symbol table, able to return arrays with names or decls,
 * seems to be the best idea for me. And for later code stuff, it´s good
 * to have.
 *
 * To define the interfaces i will take a little help from T.Parr´s
 * Language Implementation Patterns, a very good book i am excited of.
 * I think it´s better to take the literature, to write the same interfaces.
 *
 */
define("symboltable", function () {
    function SymbolTable() {
        return Object.create(SymbolTable.prototype);
    }
    SymbolTable.prototype = {
    };
    return {
        SymbolTable: SymbolTable
    };
});