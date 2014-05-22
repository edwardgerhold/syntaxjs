define("slower-static-semantics", function (require, exports) {
    "use strict";
    var debugmode = false;
    var hasConsole = typeof console === "object" && console && typeof console.log === "function";
    var isStrictDirective = {
        "'use strict'": true,
        '"use strict"': true
    };
    var IsIteration = {
        "ForStatement": true,
        "ForInStatement": true,
        "ForOfStatement": true,
        "WhileStatement": true,
        "DoWhileStatement": true
    };
    var BreakableStatement = {
        "BreakStatement":true,
        "ContinueStatement":true,
        "ThrowStatement":true
    };
    var IterationStatement = {
        "ForStatement": true,
        "WhileStatement": true,
        "DoWhileStatement": true,
        "ForInStatement": true,
        "ForOfStatement": true
    };
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
    var LetOrConst = {
        __proto__: null,
        "let": true,
        "const": true
    };
    var isComplexParameter = {
        "RestParameter": true,
        "ObjectPattern": true,
        "ArrayPattern": true,
        "Identifier": false
    };
    function debug() {
        if (debugmode && hasConsole) console.log.apply(console, arguments);
    }
    function debugdir() {
        if (debugmode && hasConsole) console.dir.apply(console, arguments);
    }
    function UTF16Encode(cp) {
        Assert(0 <= cp && cp <= 0x10FFFF, "utf16encode: cp has to be beetween 0 and 0x10FFFF");
        if (cp <= 65535) return cp;
        var cu1 = Math.floor((cp - 65536) % 1024) + 55296;
        var cu2 = ((cp - 65536) % 1024) + 56320;
        return [cu1, cu2];
    }
    function UTF16Decode(lead, trail) {
        Assert(0xD800 <= lead && lead <= 0xD8FF, "utf16decode: lead has to be beetween 0xD800 and 0xD8FF");
        Assert(0xDC00 <= trail && trail <= 0xDFFF, "utf16decode: trail has to be beetween 0xDC00 and 0xDFFF");
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

    function IsIdentifier(obj) {
        return obj.type == "Identifier";
    }
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
        return node.kind === "var" && node.type === "VariableDeclaration";

    }
    function IsStrict(node) {
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
    function Contains(R, S) {
        var contains = false;
        var body, node, type;
        if (typeof R !== "object") return false;
        if (!Array.isArray(S)) S = [S];
        if (Array.isArray(R)) body = R;

        else if (R.body) body = R.body;

        else if (typeof R === "object" && R) {
            return (S.indexOf(R.type) > -1);
        }
        if (Array.isArray(body)) {
            for (var i = 0, j = body.length; i < j; i++) {
                node = body[i];
                type = node.type;
                switch (type) {
                        case "ClassDeclaration": continue;
                        case "FunctionDeclaration": continue;
                        case "FunctionExpression": continue;
                        case "GeneratorDeclaration": continue;
                        case "GeneratorExpression": continue;
                        case "ArrowExpression": continue;
                        case "ExpressionStatement":
                            node = node.expression;
                            break;
                }
                if (IsIteration[type] && Contains(node, S)) return true;
                if (S.indexOf(type) > -1) return true;
            }
        }
        return false;
    }
    function BoundNames(list, names) {
        var item, name, node, type;
        names = names || [];
        if (typeof list === "string") {
            names.push(list);
            //debug("BoundNames: " + names.join(","));
            return names;
        } else if (!Array.isArray(list)) {
            if (node = list) {
                type = node.type;
                switch (type) {
                    case "ArrayPattern":
                    case "ObjectPattern": names = BoundNames(node.elements, names); break;
                    case "ForDeclaration": names = BoundNames(node.id, names); break;
                    case "ExportStatement": names = BoundNames(node.exports, names); break;
                    /* alle nach id.name (identifier node) transformieren !!! */
                    case "FunctionDeclaration":names.push(node.id); break;
                    case "VariableDeclarator": names.push(node.id.name); break;
                    case "GeneratorDeclaration": names.push(node.id); break;
                    case "Identifier": names.push(node.name); break;
                    case "DefaultParameter": names.push(node.id); break;
                    case "RestParameter": names.push(node.id); break;
                }
            }
            //debug("BoundNames: " + names.join(","));
            return names;
        } else {
            // BoundNames Formals oder andere Listen.
            for (var i = 0, j = list.length; i < j; i++) {
                if (node = list[i]) {
                    type = node.type;
                    if (type === "ArrayPattern" || type == "ObjectPattern") {
                        names = BoundNames(node.elements, names);
                    } else if (type === "Identifier") {
                        name = node.name;
                        names.push(name);
                    } else if (type === "BindingElement") {
                        name = node.target.name || node.target.value;
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
            //debug("BoundNames: " + names.join(","));
            return names;
        }
    }
    function VarDeclaredNames(body, names) {
        var node, decl, i, j, k, l;
        names = names || [];
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
                } else if (type === "BlockStatement") {
                    names = VarDeclaredNames(node.body, names);
                } else if (type === "FunctionDeclaration" && !node.expression && !node.expression) {
                    names.push(node.id);
                } else if (type === "IfStatement") {
                    names = VarDeclaredNames(node.consequent, names);
                    names = VarDeclaredNames(node.alternate, names);
	            } else if (type === "WhileStatement") {
                    VarDeclaredNames(node.body, names);
                } else if (type === "DoWhileStatement") {
                    VarDeclaredNames(node.body, names);
                } else if (type === "TryStatement") {
                    VarDeclaredNames(node.guard, names);
                } else if (type === "CatchClause") {
                    VarDeclaredNames(node.block, names);
                } else if (type === "Finally") {
                    VarDeclaredNames(node.block, names);
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
        //debug("VarDeclaresNames: " + names.join(","));
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
                } else if (type === "BlockStatement") {
                    VarScopedDeclarations(node.body, list);
                } else if (type === "FunctionDeclaration") {
                    if (!node.expression) list.push(node);
                } else if (type === "IfStatement") {
                    VarScopedDeclarations(node.consequent, list);
                    VarScopedDeclarations(node.alternate, list);
                } else if (type === "WhileStatement") {
                    VarScopedDeclarations(node.body, list);
                } else if (type === "DoWhileStatement") {
                    VarScopedDeclarations(node.body, list);
                } else if (type === "TryStatement") {
                    VarScopedDeclarations(node.handler, list);
                } else if (type === "CatchClause") {
                    VarScopedDeclarations(node.block, list);
                } else if (type === "Finally") {
                    VarScopedDeclarations(node.block, list);
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

        //debug("VarScopedDeclarations: " + list.length);

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

        //debug("LexicallyDeclaresNames: " + names.join(","));

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
        //debug("LexicallyScopedDeclarations: " + list.length);

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

        //debug("LexicalDeclarations: " + list.length);
        //debug(list.map(function (x) { return x.id; }).join());

        return list;
    }
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
            if (type === "MethodDefinition" || type == "FunctionDeclaration" || type == "GeneratorDeclaration") {
                if (node.needsSuper == true) return true;
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
                    if (def.id.name === "constructor") return def;
                    if (def.ctor) return def.ctor;
                }
            }
        } else {
            def = defs;
            if (!def) return null;
            if (def.isConstructor) return def;
            if (def.id.name === "constructor") return def;
            if (def.ctor) return def.ctor;
        }
        return null;
    }
    function PrototypeMethodDefinitions(defs, checkList) {
        var def, list = [];
        for (var i = 0, j = defs.length; i < j; i++) {
            def = defs[i];
            if (def && def.type === "MethodDefinition") {
                if (def.isPrototype) list.push(def);
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
                    var id = def.id && def.id.name;
                    if (id && checkList[id] && def.kind !== "get" && def.kind !== "set") return newSyntaxError( "duplicate static method definition: " + id);
                    else {
                        checkList[id] = def.kind;
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
    function HasInitializer(node) {
        var type = node.type;
        if (node.id && node.init) return true;
        else if (type === "AssignmentExpression" && node.operator === "=") return true;
        else if (type === "VariableDeclarator" && node.init) return true;
        else if (type === "DefaultParameter") return true;
    }
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
                return node.id;
        }
    }
    function PropName(node) {
        if (typeof node === "string") return node;
        var type = node.type;
        var id = node.id;
        if (type === "StringLiteral") return StringValue(node);
        if (type === "Identifier") return StringValue(node);
        if (typeof id === "string") return id;
        if (type === "MethodDefinition") return PropName(id);
        if (typeof id === "object") return StringValue(id);
    }
    function ElisionWidth(E) {
        return (E && E.width)|0;
    }
    function IsConstantDeclaration(node) {
        return node.kind === "const";
    }
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
        for (var i = 0, j = list1.length; i < j; i++) {
            if (memo[list1[i]]) return true;
            else memo[list1[i]] = true;
        }
        for (i = 0, j = list2.length; i < j; i++)
            if (memo[list2[i]]) return true;
            else memo[list2[i]] = true;
        return false;
    }
    function dupesInTheList(list, memo) {
        var hasDupe = false;
        var memo = memo || Object.create(null);
        for (var i = 0, j = list.length; i < j; i++) {
            if (memo[list[i]]) return true;
            else memo[list[i]] = true;
        }
        return false;
    }
    function TV(t) {}
    function TRV(t) {}
    function CV(lit) {
        return lit.name || lit.value;
    }
    function MV(value) {
        return +value;
    }
    function SV(value) {
        return "" + value;
    }
    function isDuplicateProperty(id, checkList) {
        if (checkList[id]) {
            return newTypeError( "duplicate property or method definition: " + id);
        } else return false;
    }

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
    exports.IsIdentifierRef = IsIdentifierRef;
    exports.TailPosition = TailPosition;
    exports.HasProductionInTailPosition = HasProductionInTailPosition;
    exports.IsAnonymousFunctionDefinition = IsAnonymousFunctionDefinition;
    exports.UTF16Encode = UTF16Encode;
    exports.UTF16Decode = UTF16Decode;
    exports.isStrictDirective = isStrictDirective;
    exports.IsStrict = IsStrict;
    exports.DeclaredNames = DeclaredNames;
    exports.StringValue = StringValue;
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
    exports.HasInitializer = HasInitializer;
    exports.IsSimpleParameterList = IsSimpleParameterList;
    exports.ExpectedArgumentCount = ExpectedArgumentCount;
    exports.IsValidSimpleAssignmentTarget = IsValidSimpleAssignmentTarget;
    exports.PropName = PropName;
    exports.IsConstantDeclaration = IsConstantDeclaration;
    exports.IsLexicalDeclaration = IsLexicalDeclaration;
    exports.ElisionWidth = ElisionWidth;
    exports.ExportedNames = ExportedNames;
    exports.dupesInTheTwoLists = dupesInTheTwoLists;
    exports.dupesInTheList = dupesInTheList;
    exports.isDuplicateProperty = isDuplicateProperty;
    exports.TV = TV;
    exports.TRV = TRV;
    exports.CV = CV;
    exports.MV = MV;
    exports.SV = SV;
    exports.IsIdentifier = IsIdentifier;

});