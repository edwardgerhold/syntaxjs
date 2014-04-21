/**
 
 */
define("symboltable", function (require, exports, module) {

	function Environment (outer) {
		var env = Object.create(Environment.prototype);
		env.bindings = Object.create(outer ? outer.bindings : null);
		env.names = Object.create(outer ? outer.names : null);
		env.outer = outer || null;
		return env;
 	}
	Environment.prototype = {
		put: function (decl, type) {
			var name = decl.id.name;		
			if (this.names[name] === true) {
			    throw new SyntaxError("duplicate identifier in environment scope");
			}
			this.bindings[name] = decl;
			this.names[name] = type || true;
		}
	};

	function Scope (outer) {
		var scope = Object.create(null);        
		scope.varEnv = Environment(scope.varEnv);
		scope.lexEnv = scope.varEnv;
		scope.contains = Object.create(null);
		scope.outer = outer || null;		
		return scope;		
	}

    function SymbolTable() {
        var table = Object.create(SymbolTable.prototype);        
        table.newScope();
        return table;
    }
    SymbolTable.prototype = {
    	newScope: function () {
    		this.scope = Scope(this.scope);            
    	},
    	oldScope: function () {
    		if (this.scope)
    		this.scope = this.scope.outer;
    	},    	
    	newBlock: function () {
    		this.scope.lexEnv = Environment(this.scope.lexEnv);
    	},
    	oldBlock: function () {
            if (this.scope)
    		this.scope.lexEnv = this.scope.lexEnv.outer;
    	},
    	putVar: function (decl) {
    		return this.scope.varEnv.put(decl);
    	},
    	putLex: function (decl) {
    		return this.scope.lexEnv.put(decl);
    	},
        hasVar: function (name) {
           return name in this.scope.varEnv.names;
        },
        hasLex: function (name) {
            return name in this.scope.lexEnv.names;
        },
        varNames: function () {
            return getList.call(this, this.scope.varEnv.names);
        },
        lexNames: function () {
            return getList.call(this, this.scope.lexEnv.names);
        }

    };
    function getList(names) {
        var list = [];
        for (var name in names) {
            list.push(name);
        }
        return list;
    }
    return module.exports = {
        SymbolTable: SymbolTable,
        Scope: Scope,
        Environment: Environment
    };

});