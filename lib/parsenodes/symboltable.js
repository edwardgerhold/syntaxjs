/**
 
 */
define("symboltable", function (require, exports, module) {

	function Environment (outer) {
		var env = Object.create(Environment.prototype);
		env.bindings = Object.create(null);
		env.names = Object.create(null);
		env.outer = outer || null;
		return env;
 	}
	Environment.prototype = {
        putVar: function (decl, type) {
            var name = getName(decl);
            var thisName = this.names[name];            
            this.bindings[name] = decl;
            this.names[name] = type || true;
        },
		put: function (decl, type) {
            var name = getName(decl);
			var thisName = this.names[name];
			if ((thisName === true && type != "static") ||
                (thisName === "static" && type != true) ||
			    (thisName === "get" && type !== "set") ||
			    (thisName === "set" && type !== "get")) { 			    
				throw new SyntaxError("Duplicate identifier in environment scope: "+name);
			}
			this.bindings[name] = decl;
			this.names[name] = type || true;
		}
	};

    function getName(decl) {
        if (typeof decl.id === "object") return decl.id.name;
        if (typeof decl.id === "string") return decl.name;
    }

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
    	putVar: function (decl, type) {
    		return this.scope.varEnv.putVar(decl, type);
    	},
    	putLex: function (decl, type) {
    		return this.scope.lexEnv.put(decl, type);
    	},
        hasVar: function (name) {
           return this.scope.varEnv.names[name] === true;
        },
        hasLex: function (name) {
            return Object.hasOwnProperty.call(this.scope.lexEnv.names, name);
        },
        varNames: function () {
            return getList.call(this, this.scope.varEnv.names);
        },
        lexNames: function () {
            return getList.call(this, this.scope.lexEnv.names);
        },
        varDecls: function () {
            return getList.call(this, this.scope.varEnv.bindings);
        },
        lexDecls: function () {
            return getList.call(this, this.scope.lexEnv.bindings);
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