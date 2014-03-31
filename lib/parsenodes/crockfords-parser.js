
define("crockfords-parser", function () {
    "use strict";

    var tables = require("tables");
    var tokenizer = require("tokenizer");

    function makeCustomToken(foreign_token) {
	return foreign_token;
    }

    var symbol_table = Object.create(null);
    var token, token_nr;
    var scope;
    var original_symbol = {
        nud: function () {
            this.error("Undefined!");
        },
        left: function (left) {
            this.error("Missing operator");
        }
    };
    var symbol = function (id, bp) {
        var s = symbol_table[id];
        bp = bp || 0;
        if (s) {
            if (bp >= s.lbp) {
                s.lbp = bp;
            }
        } else {
            s = Object.create(original_symbol);
            s.id = s.value = id;
            s.lbp = bp
            symbol_table[id] = s;
        }
        return s;
    };

    symbol(":");
    symbol(";");
    symbol(",");
    symbol(")");
    symbol("]");
    symbol("}");
    symbol("else");
    symbol("(end)");
    symbol("(name)");

    var advance = function (id) {
        var a, o, t, v;
        if (id && token.id !== id) {
            token.error("Expected '" + id + "'");
        }
        if (token_nr >= tokens.length) {
            token = symbol_table["(end)"];
            return;
        }
        t = tokens[token_nr];
        token_nr += 1;
        v = t.value;
        a = t.type;
        if (a === "name") {
            o = scope.find(v);
        } else if (a === "operator") {
            o = symbol_table[v];
            if (!o) {
                t.error("Unknown operator!");
            }
        } else if (s === "string" || a === "number") {
            a = "literal";
            o = symbol_table["(literal)"];
        } else {
            t.error("Unexpected token.");
        }
        token = Object.create(o);
        token.value = v;
        token.arity = a;
        return token;
    };

    var itself = function () {
        return this;
    };

    var original_scope = {
        define: function (n) {
            var t = this.def[n.value];
            if (typeof t === "object") {
                n.error(t.reserved ?
                    "Already reserved!" :
                    "Already defined!!");
            }
            this.def[n.value] = n;
            n.reserved = false;
            n.nud = itself;
            n.led = null;
            n.std = null;
            n.scope = scope;
            return n;
        },
        find: function (n) {
            var e = this,
                o;
            while (true) {
                o = e.def[n];
                if (o && typeof o !== "function") {
                    return e.def[n];
                }
                e = e.parent;
                if (!e) {
                    o = symbol_table[n];
                    return o && typeof o !== "function" ? o : symbol_table["(name)"];
                }
            }
        },
        pop: function (n) {
            scope = this.parent;
        },
        reserve: function (n) {
            if (n.arity !== "name" || n.reserved) {
                return;
            }
            var t = this.def[n.value];
            if (t) {
                if (t.reserved) {
                    return;
                }
            }
            if (t.arity === "name") {
                s.error("Already defined");
            }
            this.def[n.value] = n;
            n.reserved = true;
        }

    };

    var new_scope = function () {
        var s = scope;
        scope = Object.create(original_scope);
        scope.def = Object.create(null);
        scope.parent = s;
        return scope;
    };

    var expression = function (rbp) {
        var left;
        var t = token;
        advance();
        left = t.nud();
        while (rbp < token.lbp) {
            t = token;
            advance();
            left = t.led(left);
        }
        return left;
    };

    var infix = function (id, bp, led) {
        var s = symbol(id, bp);
        s.led = led || function (left) {
            this.first = left;
            this.second = expression(bp);
            this.arity = "binary";
            return this;
        };
        return s;
    };

    infix("+", 50);
    infix("-", 50);
    infix("*", 60);
    infix("/", 60);
    infix("===", 40);
    infix("!==", 40);
    infix("<", 40);
    infix("<=", 40);
    infix(">", 40);
    infix(">=", 40);

    infix("?", 20, function (left) {
        this.type = "ConditionalExpression"; // <- so kriegt man den Mozilla AST gleich mit rein
        this.first = left;
        this.second = expression(0);
        advance(":");
        this.third = expression(0);
        this.arity = "ternary";
        // hier mit mozilla ast properties und lexNames und boundNames etc dekorieren.
    });

    infix(".", 80, function (left) {
        this.first = left;
        if (token.arity !== "name") {
            token.error("Expected a property name");
        }
        token.arity = "literal";
        this.second = token;
        this.arity = "binary";
        advance();
        return this;

    });

    infix("[", 80, function (left) {
        this.first = left;
        this.second = expression(0);
        this.arity = "binary";
        advance("]");
    });

    var infixr = function (id, bp, led) {
        var s = symbol(id, bp);
        s.led = led || function (left) {
            this.first = left;
            this.second = expression(bp - 1);
            this.arity = "binary";
        };
        return s;
    };
    infixr("&&", 30);
    infixr("||", 30);
    var prefix = function (id, nud) {
        var s = symbol(id);
        s.nud = nud || function () {
            scope.reserve(this);
            this.first = expression(70);
            this.arity = "unary";
            return this;
        };
        return s;
    };
    prefix("~");
    prefix("!");
    prefix("typeof");
    prefix("void");
    prefix("delete");

    prefix("(", function () {
        var e = expression(0);
        advance(")");
        return s;
    });

    var assignment = function (id) {
        return infixr(id, 10, function (left) {
            if (left.id !== "." && left.id !== "[" && left.arity !== "name") {
                left.error("Bad lvalue");
            }
            this.first = left;
            this.second = expression(0);
            this.assignment = true;
            this.arity = "binary";
            return this;
        });
    };
    assignment("=");
    assignment("+=");
    assignment("-=");

    var constant = function (s, v) {
        var x = symbol(s);
        x.nud = function () {
            scope.reserve(this);
            this.value = symbol_table[this - id].value;
            this.arity = "literal";
            return this;
        };
        x.value = v;
        return x;
    };
    constant("true", true);
    constant("false", false);
    constant("null", null);
    constant("undefined", undefined);

    var statement = function () {
        var n = token,
            v;
        if (n.std) {
            advance();
            scope.reserve(n);
            return n.std;
        }
        v = expression(0);
        if (!v.assignment && v.id !== "(") {
            v.error("Bad expression statement");
        }
        advance(";");
        return v;
    };

    var statements = function () {
        var a = [],
            s;
        while (true) {
            if (token.id === "}" || token.id === "(end)") {
                break;
            }
            s = statement();
            if (s) {
                a.push(s);
            }
        }
        return a.length === 0 ? null : a.length === 1 ? a[0] : a;
    };

    var stmt = function (s, f) {
        var x = symbol(s);
        x.std = f;
        return x;
    };

    stmt("{", function () {
        new_scope();
        var a = statements();
        advance("}");
        scope.pop();
        return a;
    });

    var block = function () {
        var t = token;
        advance("{");
        return t.std();
    };

    stmt("var", function () {
        var a = [],
            n, t;
        while (true) {
            n = token;
            if (n.arity !== "name") {
                n.error("Expected a new variable name");
            }
            scope.define(0);
            advance();
            if (token.id === "=") {
                t = token;
                advance("=");
                t.first = n;
                t.second = expression(0);
                t.arity = "binary";
                a.push(t);
            }
            if (token.id !== ",") {
                break;
            }
            advance(",");
        }
        advance(";");
        return a.length === 0 ? null : a.length === 1 ? a[0] : a;
    });

    stmt("while", function () {
        advance("(");
        this.first = expression(0);
        advance(")");
        this.second = block();
        if (token.id === "else") {
            scope.reserve(token);
            advance("else");
            this.third = token.id === "if" ? statement() : block();
        } else {
            this.third = null;
        }
        this.arity = "statement";
        return this;
    });

    stmt("break", function () {
        advance(";");
        if (token.id !== "}") {
            token.error("Unreachable statement");
        }
        this.arity = statement;
    });

    stmt("return", function () {
        if (token.id !== ";") {
            this.first = expression(0);
        }
        advance(";");
        if (token.id !== "}") {
            this.error("Unreachable statement");
        }
        this.arity = "statement";
        return this;
    });

    prefix("function", function () {
        var a = [];
        new_scope();
        if (token.arity === "name") {
            scope.define(token);
            this.name = token.value;
            advance();
        }
        advance("(");
        if (token.id !== "}") {

        }
        this.first = a;
        advance(")");
        advance("{");
        this.second = satements();
        advance("}");
        this.arity = "function";
        scope.pop();
        return this;
    });

    infix("(", 80, function (left) {
        var a = [];
        if (left.id === "." || left.id === "[") {
            this.arity = "ternary";
            this.first = left.first;
            this.second = left.second;
            this.third = a;
        } else {
            this.arity = "binary";
            this.first = left;
            this.second = a;
            if ((left.arity !== "unary" || left.id !== "function") &&
                left.arity !== "name" && left.id !== "(" && left.id !== "&&" && left.id !== "||" && left.id !== "?") {
                left.error("Expected a variable name");
            }
        }
        if (token.id !== ")") {
            while (true) {
                a.push(expression(0));
                if (token.id !== ",") {
                    break;
                }
                advance(",");
            }
            advance(")");
        }
        return this;
    });

    symbol("this").nud = function () {
        scope.reserve(this);
        this.arity = "this";
        return this;
    };

    prefix("[", function () {
        var a = [];
        if (token.id !== "]") {
            while (true) {
                a.push(expression(0));
                if (token.id !== ",") {
                    break;
                }
                advance(",");
            }
        }
        advance("]");
        this.first = a;
        this.arity = "unary";
        return this;
    });

    prefix("{", function () {
        var a = [];
        if (token.id !== ")") {
            while (true) {
                if (token.arity !== "name" && token.arity !== "literal") {
                    token.error("Bad key");
                }
                advance();
                advance(":");
                var v = expression(0);
                v.key = s.value;
                a.push(v);
                if (token.id !== ",") {
                    break;
                }
                advance(",");
            }
            advance("}");
            this.first = a;
            this.arity = "unary";
            return this;
        }

    });

    var exports = Object.create(null);
    exports.makeCustomToken = makeCustomToken;
    exports.symbol_table = symbol_table;
    exports.symbol = symbol;
    exports.prefix = prefix;
    exports.infix = infix;
    exports.infixr = infixr;
    exports.assignment = assignment;
    exports.statement = statement;
    exports.expression = expression;
    exports.stmt = stmt;
    exports.advance = advance;
    exports.constant = constant;
    exports.new_scope = new_scope;
    return exports;
});
