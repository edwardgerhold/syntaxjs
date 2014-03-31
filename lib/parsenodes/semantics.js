
/*

    BIG FAT MISINTERPRETATION OF ECMA-262
    
    Static Semantics: Name of a Production equals 
    a Property of the Production collected at runtime.
    
    For the first try i used the "Contains" algorithm
    or a second recursion on the node to determine the
    static semantics values.
    
    
    This requires a SOLID and not "dirty" augmentation
    of the used parser api AST, making sure, all extra
    properties exist on the right objects.
    
    This will be handimplemented in the parser.js by
    going from production to production with the draft text.
    
    
    Currently these slow algorithms are still running.


*/


define("slower-static-semantics", function (require, exports, modules) {

    var debugmode = false;

    function debug() {
        if (debugmode && typeof importScripts !== "function") console.log.apply(console, arguments);
    }

    function debugdir() {
        if (debugmode && typeof importScripts !== "function") console.dir.apply(console, arguments);
    }

    exports.UTF16Encode = UTF16Encode;
    exports.UTF16Decode = UTF16Decode;

    function UTF16Encode(cp) {
        Assert(0 <= cp <= 0x10FFFF, "utf16encode: cp has to be beetween 0 and 0x10FFFF");
        if (cp <= 65535) return cp;
        var cu1 = Math.floor((cp - 65536) % 1024) + 55296;
        var cu2 = ((cp - 65536) % 1024) + 56320;
        return [cu1, cu2];
    }

    function UTF16Decode(lead, trail) {
        Assert(0xD800 <= lead <= 0xD8FF, "utf16decode: lead has to be beetween 0xD800 and 0xD8FF");
        Assert(0xDC00 <= trail <= 0xDFFF, "utf16decode: trail has to be beetween 0xDC00 and 0xDFFF");
        var cp = (lead - 55296) * 1024 + (trail - 564320);
        return cp;
    }

    function TailPosition(node, nonTerminal) {
        // Assert(nonTerminal is a parsed grammar production)
    }

    function HasProductionInTailPosition(node, nonTerminal) {
        if (Array.isArray(node)) {
            for (var i = 0, j = node.length; i < j; i++) {
                if (HasProductionInTailPosition(node[i], nonTerminal)) return true;
            }
            return false;
        } else if (node) {
            if (node.type === "ReturnStatement" && node.argument === nonTerminal) return true;
        }
    }
    exports.TailPosition = TailPosition;
    exports.HasProductionInTailPosition = HasProductionInTailPosition;

    exports.IsAnonymousFunctionDefinition = IsAnonymousFunctionDefinition;

    function IsAnonymousFunctionDefinition(node) {
        var type = node.type;
        var id = node.id;
        var expr = node.expression;
        if (!id) {
            if ((expr && (type === "FunctionDeclaration" || type === "GeneratorDeclaration")) || (type === "FunctionExpression" || type === "GeneratorExpression")) {
                return true;
            }
        }
        return false;
    }

    exports.IsIdentifierRef = IsIdentifierRef;

    function IsIdentifierRef(node) {
        var type = node.type;
        if (type === "Identifier") return true;
        else if (type === "RestParameter") return true;
        else if (type === "DefaultParameter") return true;
        return false;
    }

    function ImportEntriesForModule(module, importClause) {

    }

    function ExportEntriesForModule(module, exportClause) {

    }

    function UnknownExportEntries(node, list) {
        var nodetype = node.type;
        list = list || [];
        if (nodetype === "ModuleDeclaration") {
            var body = node.body;
            var decl;
            for (var i = 0, j = body.length; i < j; i++) {
                if (decl = body[i]) UnknownExportEntries(decl, list);
            }
        } else if (nodetype === "ExportDeclaration") {
            list = list.concat(BoundNames(node.exports));
        }
        return list;
    }

    function KnownExportEntries(node) {
        var nodetype = node.type;
        list = list || [];
        if (nodetype === "ModuleDeclaration") {
            var body = node.body;
            var decl;
            for (var i = 0, j = body.length; i < j; i++) {
                if (decl = body[i]) KnownExportEntries(decl, list);
            }
        } else if (nodetype === "ExportDeclaration") {

        }
        return list;
    }

    function ExportedBindings(node) {}

    function ExportedEntries(node) {}

    function ImportedBindings(node) {}

    function ImportedEntries(node) {}

    function ModuleRequests(node) {}

    function ImportedNames(node) {}

    function ExportedNames(node) {}

    exports.ModuleRequests = ModuleRequests;
    exports.ImportEntriesForModule = ImportEntriesForModule;
    exports.ExportEntriesForModule = ExportEntriesForModule;
    exports.ImportedEntries = ImportedEntries;
    exports.ImportedBindings = ImportedBindings;
    exports.ExportedEntries = ExportedEntries;
    exports.ExportedBindings = ExportedBindings;

    exports.IsFunctionDeclaration = IsFunctionDeclaration;
    exports.IsFunctionExpression = IsFunctionExpression;
    exports.IsGeneratorDeclaration = IsGeneratorDeclaration;
    exports.IsGeneratorExpression = IsGeneratorExpression;
    exports.IsVarDeclaration = IsVarDeclaration;

    function IsFunctionDeclaration(node) {
        return node.type === "FunctionDeclaration";
    }

    function IsFunctionExpression(node) {
        var type = node.type;
        return (type === "FunctionDeclaration" && node.expression) || type === "FunctionExpression";
    }

    function IsGeneratorDeclaration(node) {
        var type = node.type;
        return (type === "FunctionDeclaration" && node.generator) || type === "GeneratorDeclaration";
    }

    function IsGeneratorExpression(node) {
        var type = node.type;
        return (type === "FunctionDeclaration" && node.expression && node.generator) || type === "GeneratorExpression";
    }

    function IsVarDeclaration(node) {
        if (node.kind === "var" && node.type === "VariableDeclaration") return true;
        return false;
    }

    var isStrictDirective = {
        "'use strict'": true,
        '"use strict"': true
    };
    exports.isStrictDirective = isStrictDirective;

    exports.IsStrict = IsStrict;

    function IsStrict(node) {
        var n;
        if (!Array.isArray(node)) {
            if (node) {
                var type = node.type;
                if (node.strict) return true;
                else if (type === "Directive" && isStrictDirective[node.value]) return true;
                else if (type === "ModuleDeclaration") return true;
                else if (type === "GeneratorDeclaration") return true;
                else if (type === "ClassDeclaration") return true;
            }
        } else if (node) {

            var i = 0;
            var n;
            while ((n = node[i]) && n.type === "Directive") {
                i++;
                if (isStrictDirective[node.value]) return true;
            }
        }
        return false;
    }

    var IsIteration = {
        "ForStatement": true,
        "ForInStatement": true,
        "ForOfStatement": true,
        "WhileStatement": true,
        "DoWhileStatement": true

    };

    function Contains(R, S) {

        var contains = false;
        var body, node, type;

        if (typeof R !== "object") return false;

        if (!Array.isArray(S)) S = [S];
        if (Array.isArray(R)) body = R;
        else if (R.body) body = R.body;

        if (Array.isArray(body)) {

            for (var i = 0, j = body.length; i < j; i++) {
                node = body[i];
                type = node.type;
                if (type === "ClassDeclaration") continue;
                if (type === "FunctionDeclaration") continue;
                if (type === "GeneratorDeclaration") continue;

                if (IsIteration[type] && Contains(node, S)) {
                    contains = true;
                    return contains;
                }

                for (var k = 0, l = S.length; k < l; k++) {
                    if (type === S[k]) {
                        contains = true;
                        return contains;
                    }
                }

            }
        }
        return contains;
    }

    function BoundNames(list, names) {
        var item;
        names = names || [];
        var name;
        var node;
        var type;


        if (typeof list === "string") {
            names.push(list);
            debug("BoundNames: " + names.join(","));
            return names;

        } else if (!Array.isArray(list)) {

            // BoundNames einzeln
            if (node = list) {

            type = node.type;

            if (type === "ArrayPattern" || type == "ObjectPattern") {
                names = BoundNames(node.elements, names);
            } else if (type === "ForDeclaration") names = BoundNames(node.id, names);
            else if (type === "ExportStatement") names = BoundNames(node.exports, names);
            else if ((type === "FunctionDeclaration") || (type === "VariableDeclarator")) names.push(node.id);
            else if (type === "GeneratorDeclaration") names.push(node.id);
            else if (type === "Identifier") names.push(node.name);
            else if (type === "DefaultParameter") names.push(node.id);
            else if (type === "RestParameter") names.push(node.id);

            }
            debug("BoundNames: " + names.join(","));
            return names;

        } else {

            // BoundNames Formals oder andere Listen.
            var name;
            for (var i = 0, j = list.length; i < j; i++) {
                if (node = list[i]) {
                    type = node.type;
                    if (type === "ArrayPattern" || type == "ObjectPattern") {
                        names = BoundNames(node.elements, names);
                    } else if (type === "Identifier") {
                        name = node.name;
                        names.push(name);
                    } else if (type === "BindingElement") {
                        name = node.as.name || node.as.value;
                        names.push(name);
                    } else if (type === "DefaultParameter") {
                        name = node.id;
                        names.push(name);
                    } else if (type === "RestParameter") {
                        name = node.id;
                        names.push(name);
                    }
                }
            }

            debug("BoundNames: " + names.join(","));
            return names;

        }
    }

    var BreakableStatement = {

    };
    var IterationStatement = {
        "ForStatement": true,
        "WhileStatement": true,
        "DoWhileStatement": true,
        "ForInStatement": true,
        "ForOfStatement": true
    };

    function VarDeclaredNames(body, names) {

        var node, decl, i, j, k, l;
        if (!names) names = [];
        if (!body) return names;
        for (i = 0, j = body.length; i < j; i++) {

            if (node = body[i]) {

                var type = node.type;
                if (type === "VariableDeclaration" && node.kind === "var") {
                    var decls = node.declarations;

                    for (k = 0, l = decls.length; k < l; k++) {
                        if (decl = decls[k]) {
                            names = BoundNames(decl, names);
                        }
                    }
                } else if (type === "FunctionDeclaration" && !node.expression && !node.expression) {
                    names.push(node.id);
                } else if (type === "IfStatement") {
                    names = VarDeclaredNames(node.consequent, names);
                    names = VarDeclaredNames(node.alternate, names);
                } else if (type === "SwitchStatement") {
                    names = VarDeclaredNames(node.discriminant, names);
                    names = VarDeclaredNames(node.cases);
                } else if (IterationStatement[type]) {
                    if (type === "ForStatement") {
                        names = VarDeclaredNames(node.init, names);
                    } else if (type === "ForInStatement") {
                        if (node.left && node.left.type) {
                            if (node.left.type === "Identifier") names.push(node.left.name);
                        } else
                            names = VarDeclaredNames(node.left, names);
                    } else if (type === "ForOfStatement") {
                        if (node.left && node.left.type) {
                            if (node.left.type === "Identifier") names.push(node.left.name);
                        } else
                            names = VarDeclaredNames(node.left, names);
                    }
                    names = VarDeclaredNames(node.body, names);
                } else if (type === "ExportStatement") {
                    if (node.exports.type === "VariableDeclaration") names = VarDeclaredNames(node.exports, names);
                }
            }
        }

        debug("VarDeclaresNames: " + names.join(","));

        return names;
    }

    function VarScopedDeclarations(body, list) {
        var node, decl, i, j, k, l;
        var top;
        list = list || [];
        if (!Array.isArray(body)) body = [body];
        for (i = 0, j = body.length; i < j; i++) {
            if (node = body[i]) {

                var type = node.type;
                if (type === "VariableDeclaration" && node.kind === "var") {
                    var decls = node.declarations;

                    for (k = 0, l = decls.length; k < l; k++) {
                        if (decl = decls[k]) {
                            list.push(decl);
                        }
                    }
                } else if (type === "FunctionDeclaration") {
                    if (!node.expression) list.push(node);
                } else if (type === "IfStatement") {
                    VarScopedDeclarations(node.consequent, list);
                    VarScopedDeclarations(node.alternate, list);
                } else if (type === "SwitchStatement") {
                    VarScopedDeclarations(node.cases, list);
                } else if (IterationStatement[type]) {

                    if (type === "ForStatement") {
                        list = VarScopedDeclarations(node.init, list);
                    } else if (type === "ForInStatement") {
                        if (node.left && node.left.type) {
                            if (node.left.type === "Identifier") list.push(node.left.name);
                        } else

                            list = VarScopedDeclarations(node.left, list);
                    } else if (type === "ForOfStatement") {
                        if (node.left && node.left.type) {
                            if (node.left.type === "Identifier") list.push(node.left.name);
                        } else

                            list = VarScopedDeclarations(node.left, list);
                    }
                    list = VarScopedDeclarations(node.body, list);
                }
            }
        }

        debug("VarScopedDeclarations: " + list.length);

        return list;
    }

    function LexicallyDeclaredNames(body, names) {
        var node, decl, i, j, k, l;
        if (!names) names = [];
        if (!body) return names;
        for (i = 0, j = body.length; i < j; i++) {
            if (node = body[i]) {
                var type = node.type;
                if (type === "LexicalDeclaration" || (type === "VariableDeclaration" && (node.kind === "let" || node.kind === "const"))) {
                    var decls = node.declarations;

                    for (k = 0, l = decls.length; k < l; k++) {
                        if (decl = decls[k]) {
                            names = BoundNames(decl, names);
                        }
                    }
                } else if (type === "GeneratorDeclaration") {
                    names = BoundNames(node, names);
                }
            }
        }

        debug("LexicallyDeclaresNames: " + names.join(","));

        return names;
    }

    function LexicallyScopedDeclarations(body, list) {
        if (!body) return;
        var node, decl, i, j, k, l;
        list = list || [];
        if (!body) return list;
        if (!Array.isArray(body)) body = [body];
        for (i = 0, j = body.length; i < j; i++) {
            if (node = body[i]) {

                var type = node.type;
                if (type === "LexicalDeclaration" || (type === "VariableDeclaration" && node.kind !== "var")) {
                    var decls = node.declarations;

                    for (k = 0, l = decls.length; k < l; k++) {
                        if (decl = decls[k]) {
                            list.push(decl);
                        }
                    }
                } else if (type === "GeneratorDeclaration") {
                    list.push(node);
                }
            }
        }
        debug("LexicallyScopedDeclarations: " + list.length);

        return list;
    }

    function LexicalDeclarations(body, list) {
        if (!body) return;
        var node, decl, i, j, k, l;
        list = list || [];

        if (!body) return list;
        if (!Array.isArray(body)) body = [body];

        for (i = 0, j = body.length; i < j; i++) {
            if (node = body[i]) {
                var type = node.type;

                if (type === "LexicalDeclaration" || (type === "VariableDeclaration" && node.kind !== "var")) {
                    var decls = node.declarations;

                    for (k = 0, l = decls.length; k < l; k++) {
                        if (decl = decls[k]) {
                            list.push(decl);
                        }
                    }

                } else if (type === "GeneratorDeclaration") {
                    list.push(node);
                }
            }
        }

        debug("LexicalDeclarations: " + list.length);
        //debug(list.map(function (x) { return x.id; }).join());

        return list;
    }

    exports.DeclaredNames = DeclaredNames;
    function DeclaredNames (node) {
        var lexNames = LexicallyDeclaredNames(node);
        var varNames = VarDeclaredNames(node);
        var names = lexNames.concat(varNames);
        return names;
    }



    function ReferencesSuper(node) {
        var type;
        var stmt, contains = false;

        if (node && !Array.isArray(node)) {
            type = node.type;
            if (type === "SuperExpression") return true;
            if (type === "MethodDefinition") {
                contains = ReferencesSuper(node.params);
                if (contains) return true;
                contains = ReferencesSuper(node.body);
                if (contains) return true;
            } else if (type === "NewExpression" || type === "CallExpression") {
                if (ReferencesSuper(node.callee)) return true;
            } else if (type === "MemberExpression") {
                if (ReferencesSuper(node.object)) return true;
            }
        }

        if (node && Array.isArray(node)) {

            for (var i = 0, j = node.length; i < j; i++) {
                if (stmt = node[i]) {
                    type = stmt.type;
                    if (ReferencesSuper(stmt)) return true;
                } else if (IsIteration[stmt.type]) {
                    if (ReferencesSuper(stmt.body)) return true;
                }
            }

        }
        return false;
    }

    function ConstructorMethod(defs) {
        var C, def;
        if (Array.isArray(defs)) {
            for (var i = 0, j = defs.length; i < j; i++) {
                if (def = defs[i]) {
                    if (def.isConstructor) return def;
                    if (def.id === "constructor") return def;
                    if (def.ctor) return def.ctor;
                }
            }
        } else {
            def = defs;
            if (!def) return null;
            if (def.isConstructor) return def;
            if (def.id === "constructor") return def;
            if (def.ctor) return def.ctor;
        }
        return null;
    }

    function PrototypeMethodDefinitions(defs, checkList) {
        var def, list = [];
        for (var i = 0, j = defs.length; i < j; i++) {
            def = defs[i];
            if (def && def.type === "MethodDefinition") {
                if (def.isProtototype) list.pus(def);
                else if (!def.static && !def.isConstructor) list.push(def);
            }
        }
        return list;
    }

    function StaticMethodDefinitions(defs, checkList) {
        var def, list = [],
            checkList = Object.create(null);
        for (var i = 0, j = defs.length; i < j; i++) {
            def = defs[i];
            if (def && def.type === "MethodDefinition") {
                if (def.static) {
                    if (def.id && checkList[def.id] && def.kind !== "get" && def.kind !== "set") return withError("Syntax", "duplicate static method definition: " + def.id);
                    else {
                        checkList[def.id] = def.kind;
                        list.push(def);
                    }
                }
            }
        }
        return list;
    }

    function SpecialMethod() {
        if (node.kind === "get" || node.kind === "set") return true;
    }

    function HasInitialiser(node) {
        var type = node.type;
        if (node.id && node.init) return true;
        else if (type === "AssignmentExpression" && node.operator === "=") return true;
        else if (type === "VariableDeclarator" && node.init) return true;
        else if (type === "DefaultParameter") return true;
    }

    var isComplexParameter = {
        "RestParameter": true,
        "ObjectPattern": true,
        "ArrayPattern": true,
        "Identifier": false,
    };

    function IsSimpleParameterList(list) {
        var p;
        for (var i = 0, j = list.length; i < j; i++) {
            if (p = list[i]) {
                if (isComplexParameter[p.type]) return false;
            }
        }
        return true;
    }

    function ExpectedArgumentCount(list) {
        var p;
        for (var i = 0, j = list.length; i < j; i++) {
            if (p = list[i]) {
                if (p.type === "RestParameter" || p.type === "DefaultParameter") return i;
            }
        }
        return j;
    }

    function IsValidSimpleAssignmentTarget(node) {
        var type = node.type;
        if (type === "Identifier") return true;
        if (type === "ArrayPattern") return true;
        if (type === "ObjectPattern") return true;
        if (type === "BinaryExpression") return false;
        return false;
    }

    exports.StringValue = StringValue;

    function StringValue(node) {
	if (!node) return;
        switch (node.type) {
        case "Identifier":
            return node.name;
        case "StringLiteral":
            return node.value.slice(1, node.value.length - 1);
        case "NumericLiteral":
            return node.value;
        case "DefaultParameter":
        case "RestParameter":
            return node.id;
        case "FunctionExpression":
        case "GeneratorExpression":
        case "FunctionDeclaration":
        case "GeneratorDeclaration":
            return node.id
        }
    }

    function PropName(node) {
        if (typeof node === "string") return node;
        var type = node.type;
        var id = node.id;
        if (type === "Identifier") return StringValue(node);
        if (typeof id === "string") return id;
        if (type === "MethodDefinition") return PropName(id);
        if (typeof id === "object") return PropName(id);
    }

    function PropNameList(node, checkList) {
        var list, body;
        if (body = node.properties) {

        } else if (body = node.elements) {

        } else if (body = node.body) {

        }
    }

    function ElisionWidth(E) {
        return E && E.width || 0;
    }

    function IsConstantDeclaration(node) {
        if (node.kind === "const") return true;
        return false;
    }
    var LetOrConst = {
        __proto__: null,
        "let": true,
        "const": true
    };

    function IsLexicalDeclaration(node) {
        var type = node.type;
        var kind = node.kind;
        if (LetOrConst[kind]) return true;
        if (type === "LexicalDeclaration") return true;
        if (type === "VariableDeclaration") {
            if (LetOrConst[kind]) return true;
        }
        return false;
    }

    function dupesInTheTwoLists(list1, list2, memo) {
        var hasDupe = false;
        var memo = memo || Object.create(null);
        for (var i = 0, j = list1.length; i < j; i++) memo[list1[i]] = true;
        for (i = 0, j = list2.length; i < j; i++)
            if (memo[list2[i]]) hasDupe = true;
            else memo[list2[i]] = true;
    }

    function dupesInTheList(list, memo) {
        var hasDupe = false;
        var memo = memo || Object.create(null);
        for (var i = 0, j = list.length; i < j; i++) {
            if (memo[list[i]]) hasDupe = true;
            else memo[list[i]] = true;
        }
        return hasDupe;
    }

    function TV(t) {}

    function TRV(t) {}

    function CV(lit) {
        return lit.name || lit.value;
    }

    var MVHexDecimal = {
        __proto__: null,
        0: 0,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7,
        8: 8,
        9: 9,
        A: 10,
        B: 11,
        C: 12,
        D: 13,
        E: 14,
        F: 15,
        a: 10,
        b: 11,
        c: 12,
        d: 13,
        e: 14,
        f: 15
    };

    function MV(value) {
        return +value;
    }

    var numberSplitter = /([0-9]+)(?:\.)?([0-9]*)?(?:([+-])?(?:[eE])([0-9]+))?/;
    // 1               2          3               4
    function _MV(value) {
        var number = 0;
        var ch;
        var mv;
        var vlen = value.length;
        var len;
        var pos;
        if (typeof value === "string") {
            mv = 0;
            var first = value[0];
            var second = value[1];
            var i, j;
            var n;
            if (first == "0") {
                if (second === "x") {

                    for (i = 2, j = vlen; i < j; i++) {
                        ch = value[i];
                        pos = vlen - (i - 2);
                        n = MVHexDecimal[ch];
                        if (pos > 0) n = n * (pos * 15)
                        mv += n;
                    }
                    return mv;

                } else if (second === "b") {
                    len = vlen - 2;
                    for (i = 2, j = vlen; i < j; i++) {
                        ch = value[i];
                        pos = vlen - (i - 2);
                        if (ch == 1) {
                            n += Math.pow(2, pos);
                        }
                        mv += n;
                    }
                    return mv;

                } else if (second === "o") {
                    len = vlen - 2;

                    return mv;
                }
            } else if (first === ".") {
                for (i = 1, j = value.length; i < j; i++) {
                    ch = value[i];
                    pos = i;
                    n = MVHexDecimal[ch];
                    n = n / (10 * pos)
                    mv += n;
                }
                return mv;

            }

            var parts = numberSplitter.exec(value);
            var intg = parts[1];
            var fp = parts[2];
            var sgn = parts[3];
            var exp = parts[4];

            mv = 0;
            if (intg) {

                for (i = 0, j = intg.length; i < j; i++) {
                    ch = intg[i];
                    pos = j - i;
                    n = MVHexDecimal[ch];
                    if (pos > 0) n = n * (pos * 10)
                    mv += n;
                }

            }
            if (fp) {
                for (i = 0, j = fp.length; i < j; i++) {
                    ch = fp[i];
                    pos = i + 1;
                    n = MVHexDecimal[ch];
                    n = n / (10 * pos)
                    mv += n;
                }
            }
            if (exp) {
                for (i = 0, j = exp.length; i < j; i++) {
                    ch = exp[i];
                    pos = j - i;
                    n = MVHexDecimal[ch];
                    if (pos > 0) n = n * (Math.pow(10, -pos))
                    mv += n;
                }
                if (sgn == "-") {
                    mv = -mv;
                }
            }

            return mv;
        }

        return +value;
    }

    function SV(value) {
        return "" + value;
    }

    function isDuplicateProperty(id, checkList) {
        if (checkList[id]) {
            return withError("Type", "duplicate property or method definition: " + id);
        } else return false;
    }

    exports.Contains = Contains;
    exports.BoundNames = BoundNames;
    exports.VarDeclaredNames = VarDeclaredNames;
    exports.LexicallyDeclaredNames = LexicallyDeclaredNames;
    exports.VarScopedDeclarations = VarScopedDeclarations;
    exports.LexicallyScopedDeclarations = LexicallyScopedDeclarations;
    exports.LexicalDeclarations = LexicalDeclarations;
    exports.ReferencesSuper = ReferencesSuper;
    exports.ConstructorMethod = ConstructorMethod;
    exports.PrototypeMethodDefinitions = PrototypeMethodDefinitions;
    exports.StaticMethodDefinitions = StaticMethodDefinitions;
    exports.SpecialMethod = SpecialMethod;
    exports.HasInitialiser = HasInitialiser;
    exports.IsSimpleParameterList = IsSimpleParameterList;
    exports.ExpectedArgumentCount = ExpectedArgumentCount;
    exports.IsValidSimpleAssignmentTarget = IsValidSimpleAssignmentTarget;
    exports.PropName = PropName;
    exports.PropNameList = PropNameList;
    exports.IsConstantDeclaration = IsConstantDeclaration;
    exports.IsLexicalDeclaration = IsLexicalDeclaration;
    exports.ElisionWidth = ElisionWidth;

    exports.ImportedNames = ImportedNames;
    exports.ExportedNames = ExportedNames;

    exports.dupesInTheTwoLists = dupesInTheTwoLists;
    exports.dupesInTheList = dupesInTheList;
    exports.isDuplicateProperty = isDuplicateProperty;

    exports.TV = TV;
    exports.TRV = TRV;
    exports.CV = CV;
    exports.MV = MV;
    exports.SV = SV;

});