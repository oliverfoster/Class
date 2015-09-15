;define("Class", ["util"], function(util) {

	function constructor() {
		var f = function Class() {
			if (g._data.__unloaded__) {
				debugger; throw "Cannot create class instances on unload";
			}
			this.uid = "ci"+(++g._data.uid);
			this.className = this.className;
			g._data.instances.push(this);
			g._data.instances[this.uid] = this;
			if (arguments.length == 1 && util.isArray(arguments[0]) && arguments[0].type == "apply") {
				this.initialize.apply(this, arguments[0]);
				this.postInitialize.apply(this, arguments[0]);
			} else {
				this.initialize.apply(this, arguments);
				this.postInitialize.apply(this, arguments);
			}
		};
		return f;
	}

	var g = constructor();

	var classes = g;
	var context = classes;

	util.extend(g, {

		_data: {
			uid: 0,
			instances: [],
			classes: [],
			__unloaded__: false
		},

		constructor: constructor,

		prototype: {
			"__chain__": null,
			"uid": null,
			"className": null,
			"classChain": null,
			classRemoved: false,
			initialize: function() {
				//console.log("created", this.uid);
			},
			postInitialize: function() {},
			remove: function() {
				g.removeInstance(this.uid);
				this.classRemoved = true;
			}
		},

		setNS: function(o) {
			context = o;
			return this;
		},

		getNS: function() {
			return context;
		},

		resetNS: function() {
			context = classes;
			return context;
		},

		extend: function(name, o, b) {
			var hasName = false;
			if (o === undefined) o = name;
			else {
				hasName = true;
			}

			var currentClass = this;

			var Surrogate = function Class() { this.constructor = currentClass; };
		    Surrogate.prototype = currentClass.prototype;
		    
			var n = g.constructor();
			n.prototype = new Surrogate();
			util.extend(n.prototype, o);
			n.extend = this.extend;
			util.extend(n, b);

			var parents = g.parents(n.prototype);
			
			n.classChain = n.prototype.classChain = util.pluck(parents, "className").join(" ");

			if (hasName) {
				g.registerClass(name, n);
				n.classChain = n.prototype.classChain+= (n.prototype.classChain === "" ? name : " " + name);
			} else {
				n.className = undefined;
				g._data.classes.push(n);
			}

			n.prototype.__chain__ = parents;
			n.prototype.__chain__.push(n.prototype);

			return n;
		},

		ascend: function(cb, defer) {
			var f = function ascend() {
				if (this.classRemoved) return;
				var parents = this.__chain__;
				var name = cb.name;
				var returnValue;
				var iterationValue;
				var defered = [];
				for (var i = 0, l = parents.length; i < l; i++) {
					if (!parents[i].hasOwnProperty(name)) continue;
					if (typeof parents[i][name] == "function") {
						if (parents[i][name]._defer) {
							defered.push(parents[i]);
							continue;
						}
						if (parents[i][name]._original) {
							iterationValue = parents[i][name]._original.apply(this, arguments);
						} else {
							iterationValue = parents[i][name].apply(this, arguments);
						}
					}
					returnValue = util.concat(returnValue, iterationValue);
				}
				for (var i = 0, l = defered.length; i < l; i++) {
					if (typeof defered[i][name] == "function") {
						if (defered[i][name]._original) {
							iterationValue = defered[i][name]._original.apply(this, arguments);
						} else {
							iterationValue = defered[i][name].apply(this, arguments);
						}
					}
					returnValue = util.concat(returnValue, iterationValue);
				}
				return returnValue;
			};
			f._original = cb;
			f._defer = defer;
			return f;
		},

		descend: function(cb, defer) {
			var f = function descend() {
				if (this.classRemoved) return;
				var parents = this.__chain__;
				var name = cb.name;
				var returnValue;
				var iterationValue;
				var defered = [];
				for (var i = parents.length-1, l = -1; i > l; i--) {
					if (!parents[i].hasOwnProperty(name)) continue;
					if (typeof parents[i][name] == "function") {
						if (parents[i][name]._defer) {
							defered.push(parents[i]);
							continue;
						}
						if (parents[i][name]._original) {
							iterationValue = parents[i][name]._original.apply(this, arguments);
						} else {
							iterationValue = parents[i][name].apply(this, arguments);
						}
					}
					returnValue = util.concat(returnValue, iterationValue);
				}
				for (var i = 0, l = defered.length; i < l; i++) {
					if (typeof defered[i][name] == "function") {
						if (defered[i][name]._original) {
							iterationValue = defered[i][name]._original.apply(this, arguments);
						} else {
							iterationValue = defered[i][name].apply(this, arguments);
						}
					}
					returnValue = util.concat(returnValue, iterationValue);
				}
				return returnValue;
			};
			f._original = cb;
			f._defer = defer;
			return f;
		},

		parents: function(o) {
			var parents = [];
			var level = o;
			var c = true, d = 0;
			if (Object.getPrototypeOf) {
				while (level && d < 1000) {
					var proto = Object.getPrototypeOf(level);
					if (!proto || !proto.initialize) break;
					parents.unshift(proto);
					level = proto;
					d++;
				}
			} else {
				while (level && d < 1000) {
					var proto = level.__proto__;
					if (!proto || !proto.initialize) break;
					parents.unshift(proto);
					level = proto;
					d++;
				}
			}
			return parents;
		},

		parent: function(o) {
			if (Object.getPrototypeOf) {
				return Object.getPrototypeOf(o);
			} else {
				return o.__proto__;
			}
		},

		getInstance: function(uid) {
			if (uid === undefined) {
				return g._data.instances;
			} else if (util.isArray(uid)) {
				var instances = util.where(g._data.instances, "uid", uid);
				return instances;
			}
			return g._data.instances[uid];
		},

		removeInstance: function(uid) {
			if (!util.isArray(uid)) uid = [uid];
			util.remove(g._data.instances, "uid", uid);
			for (var i = 0, l = uid.length; i < l; i++) {
				if (g._data.instances[uid]) delete g._data.instances[uid];
			}
			//console.log("removed", uid);
		},

		getClass: function(name) {
			if (name === undefined) {
				return g._data.classes;
			} else if (util.isArray(name)) {
				var classes = util.where(g._data.classes, "className", name);
				return classes;
			}
			return g._data.classes[name];
		},

		getClassesOf: function(name, absoluteOnly) {
			return util.where(g.getClass(), function(item, index) {
				if (absoluteOnly && item.className === name) return true;
				else if (!absoluteOnly && util.indexOf(item.classChain.split(" "), name) > -1) return true;
				return false;
			});
		},

		getInstancesOf: function(name, absoluteOnly) {
			return util.where(g.getInstance(), function(item, index) {
				if (absoluteOnly && item.className === name) return true;
				else if (!absoluteOnly && util.indexOf(item.classChain.split(" "), name) > -1) return true;
				return false;
			});
		},

		registerClass: function(name, cls) {
			cls.className = name;
			cls.prototype.className = name;
			g._data.classes.push(cls);
			g._data.classes[name] = cls;
			util.set.call(context, name, cls);
		},

		unload: function() {
			g._data.__unloaded__ = true;
			for (var i = g._data.instances.length-1, l = -1; i > l; i--) {
				g._data.instances[i].remove();
			}
			for (var i = g._data.instances.length-1, l = -1; i > l; i--) {
				g._data.instances[i].remove();
			}
			g._data.classes = [];
			for (var k in g) {
				delete g[k];
			}
		}
		
	});

	g.registerClass("Class", g)
	
	if (window) {
		window.addEventListener("unload", function() {
			if (g.unload) g.unload();
		});
	}

	return g;

});