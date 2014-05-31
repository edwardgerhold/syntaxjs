define("graph", function (require,exports) {

/*

    Graph for Identifiers

    For combination with the symbol table

    for use in the compiler in syntax.js

 */


    var RED = 1;
    var GREEN = 2;
    var BLUE = 3;
    var YELLOW = 4;


    function Vertex(k,v) {
        return {
            __proto__: Vertex.prototype,
            name: k,
            value: v,
            edges: Object.create(null),
            indegree: 0,        // === number of edges to me
            outdegree: 0,        // === number of edges from me
            color: 0
        };
    }
    Vertex.prototype = {
        constructor: Vertex
    };
    function FastGraph (di) {
        this.digraph = !!di;
        this.vertices = Object.create(null);
        this.size = 0;  // === number of vertices.
    }

    FastGraph.prototype = {
        constructor: FastGraph,
        toString: function () { return "[object FastGraph]"; },
        insert: fast_insert,
        remove: fast_remove,
        connect: fast_connect,
        disconnect: fast_disconnect,
        find: fast_find,
        find_ingoing: fast_find_ingoing,
        dfs: fast_dfs
    };

    function fast_connect(k,l, weight) {
        weight = weight || 1;
        var v = this.vertices[k];
        var w = this.vertices[l];
        if (v && w) {
            v.edges[l] = weight;
            v.outdegree += 1;
            w.indegree += 1;
            if (this.digraph) {
                w.edges[k] = weight;
                w.outdegree += 1;
                v.indegree += 1;
            }
        }
    }

    function fast_disconnect(k, l) {
        var v = this.vertices[k];
        var w = this.vertices[l];
        if (v !== undefined && w !== undefined) {
            v.edges[l] = undefined;
            v.outdegree -= 1;
            w.indegree -= 1;

            if (w.edges[k]) {
                w.edges[k] = undefined;
                w.outdegree -= 1;
                v.indegree -=1;
            }
        }
    }

    function fast_insert(k, v) {
        var v = this.vertices[k];
        if (!v) {
            v = this.vertices[k] = Vertex(k,v);
            if (v) this.size += 1;
        } else {
            throw new TypeError("Vertex exists!");
        }
    }
    function fast_remove(k) {
        var v = this.vertices[k];
        for (var x in this.vertices) {
            var w = this.vertices[x];
            if (w) w.edges[k] = undefined;
        }
        this.vertices[k] = undefined;
        this.size -= 1;
        v.edges = undefined;
        return v.value;
    }


    function fast_find (k) {
        return this.vertices[k];
    }
    function fast_find_ingoing (k) {
        var list = [];
        for (var l in this.vertices) {
            v = this.vertices[l];
            if (v.edges[k] != undefined) {
                list.push(v)
            }
        }
        return list;
    }

    function fast_dfs (v, f) {
        var node = this.vertices[Object.keys(this.vertices)[0]];
        var visited = Object.create(null);
        var queue = [node];
        var that = this;
        while (node = queue.pop()) {

            if (!node) continue;
            visited[node.key] = true;
            f(node);
            var e = node.edges;
            if (e)
            Object.keys(e).forEach(function (key) {
               if (!visited[key]) queue.push(that.vertices[key]);
            });
        }
    }


    exports.FastGraph = FastGraph;
   // exports.Graph = Graph;


    /**
     *
     * @param v
     * @param f
     * @returns {null}

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


    */

});