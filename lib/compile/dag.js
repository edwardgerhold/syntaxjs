define("graph", function (require,exports) {

    /**
    *
    * Before re-using this graph for registerallocation,
    * i got to make it fast and to replace the adjacents array
    * with adjacents[identifier] 
    *
    *
    * Using arrays for adjacents (like adjacency lists) is too expensive
    * for a register-allocation-graph which holds "identifier names" which
    * can easily be hashed.
    * With arrays this thing will be much too slow,
    * so i have to rework it in under an hour when i have time for
    *
    * it could be rewritten in minutes, i should try a new technique,
    * instead of editing it, just rewriting the file 
    * 
    * or i go function by function top to bottom, that goes, too, but not scrolling
    *
    *
    * then i can look for possible register usages
    * (register allocation is explained in aikens videos about compilers on youtube)
    *
    *
    * anyways, it has bfs, dfs, and a working shortest path for non negative weights (a dijkstra)
    */

    function Graph(options) {
        "use strict";

        var me = this;
        var vertices = [];
        var fastXS = Object.create(null);
        

        function isString(x) {return typeof x === "string";}
        function isFunction(x) {return typeof x === "function";}
        function isVertex(x) {return x instanceof Vertex;}

        function Edge(o, d, w) {
            return Object.seal({
                constructor: Edge,
                __proto__: Edge.prototype,
                o: o,
                d: d,
                w: w || null
            });
        }

        function Vertex(key, value) {
            return Object.seal({
                constructor: Vertex,
                __proto_: Vertex.prototype,
                key: key,
                value: value || null,
                adjacents: [],
                cursor: { x: 0, y: 0, z: 0 }
            });
        }

        function get(u) {
    	    return fastXS[u];
        }

        function getedge(u, v) {
            var e;
            var a = get(u);
            var b = get(v);
            var l = a.adjacents;
            
	    /*
	    
		just return a.adjacents[key] here
		
		an identifier graph has unique keys
		
	    */
            
            for (var f in l) {
                if (Object.prototype.hasOwnProperty.call(l, f)) {
                    e = l[f];
                    if (e.d === b) return e;
                }
            }
            return null;
        }

        function indegree(u) {
            var deg = 0;
            if (!isVertex(u)) u = get(u);
            // O(V*E)
            vertices.forEach(function (v) {
                v.adjacents.forEach(function (e) {
                    if (e.d === u) ++deg;
                });
            });
            return deg;
        }

        function outdegree(u) {
            if (!isVertex(u)) u = get(u);
            return u.adjacents.length;
        }


        function connect(u, v, w) {
            var a, b, e;
            a = get(u);
            b = get(v);
            if (!a || !b) {
                return null;
            } else {
                e = new Edge(a, b, w);
                
                
            	/*
            	new
            	*/
            	
        	a.adjacents[v] = e;
            	    
            	/*
            	old    
                */
                
                a.adjacents.push(e);
                return true;
            }
            return null;
        }

        function disconnect(u, v) {
            var a, b, e, succ = null;
            a = get(u);
            b = get(v);
            /*
            new
            */

            a.adjacents[v] = undefined;
            
            /*
            old
            */
            
            a.adjacents = a.adjacents.filter(function (x) {
                if (x.d === b) {
                    succ = true;
                    return false;
                }
                return true;
            });
            return succ;
        }

        function insert(k, v, u, w) {
            var a;
            if (k === undefined) throw "insert key";
            a = get(k);
            if (!a) {
                a = new Vertex(k, v);
                vertices.push(a);
                fastXS[k] = a;
                if (u) connect(k, u, w);
                return true;
            } else {
                return null;
            }
        }

        function find(k) {
            var a = get(k);
            if (!a) return null;
            else return { key: a.key, value: a.value };
        }

        function remove(k) {
            var a;
            if (k === undefined) throw "remove key";
            a = get(k);
            if (a) {
                // O(V*E)
                vertices.forEach(function (u) {
                    if (u != a)
                        u.adjacents.forEach(function (v) {
                            disconnect(v, u);
                        });
                });
                a.adjacents = [];
                vertices = vertices.filter(function (v) {
                    return v.key !== k;
                });
            } else {
                return null;
            }
            return true;
        }

        function update(k, v) {
            var a = get(k);
            var old;
            if (a) {
                old = a.value;
                a.value = v;
                return old;
            }
            return null;
        }

        function setweight(u, v, w) {
            var e, old;
            e = getedge(u, v);
            if (e) {
                old = e.w;
                e.w = w;
                return old;
            }
            return null;
        }

        function getweight(u, v) {
            var e = getedge(u, v);
            if (e) return e.w;
            return null;
        }

        function dfs(v, f) {
            var visited = [];
            if (isFunction(v) && !f) {
                f = v;
                v = vertices[0];
            }
            else v = get(v);
            if (!v) return null;
            f(v.key, v.value, null);
            visited.push(v);
            traverse(v.adjacents);
            function traverse(adj) {
                for (var i = 0, j = adj.length; i < j; i++) {
                    v = adj[i].d;
                    if (visited.indexOf(v) === -1) {
                        f(v.key, v.value);
                        visited.push(v);
                        if (v.adjacents.length) traverse(v.adjacents);
                    }
                }
            }
        }

        function bfs(v, f) {
            var nodes = [];
            var visited = [];
            var e;
            if (isFunction(v) && !f) {
                f = v;
                v = vertices[0];
            }
            else v = get(v);
            if (!v) return null;
            nodes[0] = [
                { v: v, e: { o: { key: null, value: null }, w: 0 }}
            ]
            visited.push(v);
            summarize(v, 1);
            nodes.forEach(function (level) {
                level.forEach(function (data) {
                    f(data.v.key, data.v.value, data.e.o.key, data.e.w);
                });
            });
            function summarize(v, depth) {
                if (!nodes[depth]) nodes[depth] = [];
                var edges = v.adjacents;
                var v;
                for (var i = 0, j = edges.length; i < j; i++) {
                    e = edges[i];
                    if (e) {
                        v = e.d;
                        if (visited.indexOf(v) === -1) {
                            nodes[depth].push({ v: v, e: e });
                            visited.push(v);
                            summarize(v, depth + 1);
                        }
                    }
                }
            }
        }

        function shortest(u, v) {

            var a = get(u);
            var b = get(v);
            var Q = [];
            var S = {};
            var d = {};
            var s, path;

            function search(e) {
                var v = e.d;
                var o = e.o;
                var w = e.w;
                var dist = d[o.key] + w;
                var visited = d[v.key] !== undefined;
                if (!d[v.key] || dist <= d[v.key]) {
                    d[v.key] = dist;
                    S[dist] = { v: v, w: w, o: o, d: dist, p: d[o.key] };
                }
                if (v.key === b.key) Q.push(d[v.key]);
                else if (!visited) v.adjacents.forEach(search);
            }

            if (!a || !b) throw "there is no u or no v";
            d[a.key] = 0;
            
            a.adjacents.forEach(search);
            
            Q.sort(function (a, b) {
                return a < b;
            });
            s = S[Q.pop()];
            path = [];
            do {
                path.push({ key: s.v.key, w: s.w, d: d[s.v.key] });
            } while (s = S[s.p]);
            return path.reverse();
        }

        function print() {
            vertices.forEach(function (v, i) {
                console.log((i + 1) + ". vertex: " + v.key + ", " + v.value);
                v.adjacents.forEach(function (e, j) {
                    console.log((i + 1) + ".; edge (" + (j + 1) + "): o=" + e.o.key + ", d=" + e.d.key + ", w=" + e.w);
                });
            });
        }




        var me = this;
        if (me instanceof Graph === false) return new Graph(options);
        me.insert = insert;
        me.find = find;
        me.remove = remove;
        me.update = update;
        me.setweight = setweight;
        me.getweight = getweight;
        me.connect = connect;
        me.bfs = bfs;
        me.dfs = dfs;
        me.shortest = shortest;
        me.print = print;
        me.indegree = indegree;
        me.outdegree = outdegree;
        return Object.freeze(me);
    }

    exports.Graph = Graph;

});