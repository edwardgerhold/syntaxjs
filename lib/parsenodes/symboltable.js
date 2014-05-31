/**
 
 */
define("symboltable", function (require, exports, module) {


	function Environment (outer) {
        if (!(this instanceof Environment)) return new Environment(outer);
		this.bindings = Object.create(null);
		this.names = Object.create(null);
		this.outer = outer || null;
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
        if (!(this instanceof Scope)) return new Scope(outer);
		this.varEnv = new Environment(this.varEnv);
		this.lexEnv = this.varEnv;
		this.contains = Object.create(null);
		this.outer = outer || null;
	}
    Scope.prototype = Object.create(null);

    function SymbolTable() {
        if (!(this instanceof SymbolTable)) return new SymbolTable();
        this.scope = new Scope(this.Scope);
    }
    SymbolTable.prototype = {
    	newScope: function () {
    		this.scope = new Scope(this.scope);
    	},
    	oldScope: function () {
    		if (this.scope)
    		this.scope = this.scope.outer;
    	},    	
    	newBlock: function () {
    		this.scope.lexEnv = new Environment(this.scope.lexEnv);
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
            return getNameList.call(this, this.scope.varEnv.names);
        },
        lexNames: function () {
            return getNameList.call(this, this.scope.lexEnv.names);
        },
        varDecls: function () {
            return getDeclList.call(this, this.scope.varEnv.bindings);
        },
        lexDecls: function () {
            return getDeclList.call(this, this.scope.lexEnv.bindings);
        }
    };

    function getNameList(names) {
        var list = [];
        for (var name in names) {
            list.push(name);
        }
        return list;
    }
    function getDeclList(bindings) {
        var list = [];
        for (var name in bindings) {
            list.push(bindings[name]);
        }
        return list;
    }
    return module.exports = {
        SymbolTable: SymbolTable,
        Scope: Scope,
        Environment: Environment
    };

});