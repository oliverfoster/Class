;define("util", function() {

	var nameSeparator = /[^.]*/g;
	var trimREX = /(^\ +)|(\ +)$/g;

	var g = {

		trim: function(str) {
			return str.replace(trimREX, "");
		},

		keys: function(o1) {
			var keys = [];
			for (var k in o1) {
				keys.push(k);
			}
			return keys;
		},

		each: function(o1, cb) {
			if (g.isArray(o1)) {
				for (var i = 0, l = o1.length; i < l; i++) {
					cb.call(o1, o1[i], i);
				}
			} else {
				for (var k in o1) {
					cb.call(o1, o1[k], k);
				}
			}
		},

		some: function(obj, predicate, context) {
			predicate = g.bind(predicate, context);
			var keys = !g.isArray(obj) && g.keys(obj),
				length = (keys || obj).length;
			for (var index = 0; index < length; index++) {
				var currentKey = keys ? keys[index] : index;
				if (predicate(obj[currentKey], currentKey, obj)) return true;
			}
			return false;
		},

		map: function(obj, iteratee, context) {
			iteratee = g.bind(iteratee, context);
			var keys = !g.isArray(obj) && g.keys(obj),
				length = (keys || obj).length,
				results = Array(length);
			for (var index = 0; index < length; index++) {
				var currentKey = keys ? keys[index] : index;
				results[index] = iteratee(obj[currentKey], currentKey, obj);
				}
			return results;
		},

		result: function(object, property, fallback) {
			var value = object == null ? void 0 : object[property];
			if (value === void 0) {
				value = fallback;
			}
			return g.isFunction(value) ? value.call(object) : value;
		},

		values: function(o1) {
			var values = [];
			for (var k in o1) {
				values.push(o1[k]);
			}
			return values;
		},

	    clone: function(into, using) {

	    	var typeofInto = typeof into;
	    	if (typeofInto === "function") typeofInto = "object";

	    	var args = [].slice.call(arguments, 1);
			for (var i = 0, l = args.length; i <l; i++) {
				using = args[i];

		        var typeofUsing = typeof using;
		        if (typeofUsing === "function") typeofUsing = "object";

		        if ((into === undefined || using === undefined)) {
	                if (using !== undefined) {
	                    if (using instanceof Array) {
	                        into = [];
	                        typeofInto = "object";
	                    } else if (typeof using == "object") {
	                        into = {};
	                        typeofInto = "object";
	                    } else {
	                        return using;
	                    }
	                    break;
	                }
		        }
		        if (typeofInto == typeofUsing) {
		            //if the return values types are equal
		            switch (typeofInto) {
		            case "object":
		                var isArrayInto = into instanceof Array;
		                var isArrayUsing = using instanceof Array;
		                if (isArrayInto == isArrayUsing && isArrayInto) {
		                    //if both are arrays
	                        for (var i = 0, l = using.length; i < l; i++) {
	                            if (into[i] === undefined) {
	                                if (using[k] instanceof Array) {
	                                    into.push([]);
	                                } else if (typeof using[k] == "object") {
	                                    into.push({});
	                                } else {
	                                    into.push(undefined);
	                                }
	                            }
	                            if (i > into.length - 1) into.push(using[i]);
	                            else into[i] = g.clone(into[i], using[i]);
	                        }

	                        return into;
		                    
		                }
		                //if both are objects
		                
	                    for (var k in using) {
	                        if (into[k] === undefined) {
	                            if (using[k] instanceof Array) {
	                                into[k] = [];
	                            } else if (typeof using[k] == "object") {
	                                into[k] = {};
	                            } else {
	                                into[k] = undefined;
	                            }
	                        }
	                        into[k] = g.clone(into[k], using[k]);
	                    }

	                    return into;
		                
		            case "string": case "number": case "boolean":
		                return using;
		            }

		        } else {
		            //if the values have different types and both are defined, throw an error
		            throw "Cannot clone different types";
		        }
		    }
		    return into;
	        
	    },

	    merge: function(into, using) {

	        var typeofInto = typeof into;
	    	if (typeofInto === "function") typeofInto = "object";

	    	var args = [].slice.call(arguments, 1);
			for (var i = 0, l = args.length; i <l; i++) {
				using = args[i];

		        var typeofUsing = typeof using;
		        if (typeofUsing === "function") typeofUsing = "object";

		        if ((into === undefined || using === undefined)) {
		            //if one return value is undefined, use the one which is defined or return undefined
	                return into || using;
		        }
		        if (typeofInto == typeofUsing) {
		            //if the return values types are equal
		            switch (typeofInto) {
		            case "object":
		                var isArrayInto = into instanceof Array;
		                var isArrayUsing = using instanceof Array;
		                if (isArrayInto == isArrayUsing && isArrayInto) {
		                    //if both are arrays
	                        //go through item and extend for each index
	                        for (var i = 0, l = using.length; i < l; i++) {
	                            if (i > into.length - 1) into.push(using[i]);
	                            else into[i] = g.merge(into[i], using[i]);
	                        }

		                    return into;
		                    
		                }
		                //if both are objects
	                    //go through item and extend for each index
	                    for (var k in using) {
	                        into[k] = g.merge(into[k], using[k]);
	                    }
	                    return into;
		                
		            case "string": case "number": case "boolean":
		                return using;     
		            }
		        } else {
		            //if the values have different types and both are defined, throw an error
		            throw "Cannot merge different types";
		        }
		    }
		    return into;
	        
	    },

	    concat: function(into, using) {
	    	var typeofInto = typeof into;
	    	if (typeofInto === "function") typeofInto = "object";

	    	var args = [].slice.call(arguments, 1);
			for (var i = 0, l = args.length; i <l; i++) {
				using = args[i];
		        
		        var typeofUsing = typeof using;
		        if (typeofUsing === "function") typeofUsing = "object";

		        if ((into === undefined || using === undefined)) {
		            //if one return value is undefined, use the one which is defined or return undefined
		            return into || using;
		        }
		        if (typeofInto == typeofUsing) {
		            //if the return values types are equal
		            switch (typeofInto) {
		            case "object":
		                var isArrayInto = into instanceof Array;
		                var isArrayUsing = using instanceof Array;
		                if (isArrayInto == isArrayUsing && isArrayInto) {
		                    //if both are arrays
	                        //concatinate the results
	                        return into.concat(using);
		                    
		                }
		                //if both are objects
	                    //shallow extend the results
	                    for (var k in using) {
	                    	into[k] = g.concat(into[k], using[k]);
	                    }
	                    return into;
		                
		            case "string": case "number": 

	                    //concatinate the results
	                    return into + using;

		            case "boolean":
		                
	                    //concatinate the results
	                    return into || using;
		                
		            }
		        } else {
		            //if the values have different types and both are defined, throw an error
		            throw "Cannot concat different types";
		        }
		    }
		    return into;
	        
	    },

	    extend: function(t, f) {
			var args = [].slice.call(arguments, 1);
			for (var i = 0, l = args.length; i <l; i++) {
				f = args[i];
				for (var k in f) {t[k] = f[k];}
			}
			return t;
		},

		pluck: function(a, n) {
			if (g.isArray(a) && typeof n == "string") {
				var values = [];
				for (var i = 0, l = a.length; i < l; i++) {
					if (a[i][n] !== undefined) {
						values.push(a[i][n]);
					}
				}
				return values;
			}
		},

		equal: function(v1,v2) {
			if (!v1 || !v2) {
				return v1 === v2;
			} else {
				var v1Type = typeof v1;
				var v2Type = typeof v2;
				if (v1Type == v2Type) {
					if (v1Type == "number" || v1Type == "string" || v1Type === "boolean") {
						return v1==v2;
					}
					switch(v1Type) {
					case "object":
						if (v1 instanceof Array && v2 instanceof Array) {
							return v1===v2;
						}
						var isEqual = true;
						for (var k in v2) {
							if (v1[k] !== v2[k]) {
								isEqual = false;
								break;
							}
						}
						return isEqual;
					}
				} else {
					return false;
				}
			}
		},

		indexOf: function(a, n, uids) {
			var aIsArray = g.isArray(a);
			var uidsIsArray = g.isArray(uids);
			var nIsArray = g.isArray(n);
			var uidsType = typeof uids;
			var aType = typeof a;
			var nType = typeof n;
			var values = [];
			if (aIsArray && nType == "string" && uidsIsArray) {
				var values = [];
				var uids = [].concat(uids);
				for (var i = a.length-1, l = -1; i > l; i--) {
					var uidIndex = g.indexOf(uids, a[i][n]);
					if ( uidIndex !== -1) {
						return uidIndex;
					}
				}
			} else if (aIsArray && !nIsArray && nType == "object" && uidsType == "undefined") {
				var uids = [].concat(uids);
				for (var i = a.length-1, l = -1; i > l; i--) {
					var isEqual = true;
					for (var k in n) {
						if (!g.equal(a[i][k],n[k])) {
							isEqual = false;
							break;
						}
					}
					if (isEqual) return i;
				}
			} else if (aIsArray && nType == "function") {
				for (var i = a.length-1, l = -1; i > l; i--) {
					if (n(a[i], i)) return i;
				}
			} else if (aIsArray && nType == "undefined") {
				for (var i = a.length-1, l = -1; i > l; i--) {
					return i;
				}
			} else if (aIsArray) {
				for (var i = 0, l = a.length; i < l; i++) {
					if (g.equal(a[i],n)) return i;
				}
			} else if (aType == "string") {
				return a.indexOf(n);
			}

			return -1;
		},


		remove: function(a, n, uids) {
			var aIsArray = g.isArray(a);
			var uidsIsArray = g.isArray(uids);
			var nIsArray = g.isArray(n);
			var uidsType = typeof uids;
			var nType = typeof n;
			var values = [];
			if (aIsArray && nType == "string" && uidsIsArray) {
				var values = [];
				var uids = [].concat(uids);
				for (var i = a.length-1, l = -1; i > l; i--) {
					var uidIndex = g.indexOf(uids, a[i][n]);
					if ( uidIndex !== -1) {
						values.push(a.splice(i,1)[0]);
						uids.splice(uidIndex, 1);
					}
				}
			} else if (aIsArray && !nIsArray && nType == "object" && uidsType == "undefined") {
				var uids = [].concat(uids);
				for (var i = a.length-1, l = -1; i > l; i--) {
					var isEqual = true;
					for (var k in n) {
						if (!g.equal(a[i][k],n[k])) {
							isEqual = false;
							break;
						}
					}
					if (isEqual) values.push(a.splice(i,1)[0]);
				}
			} else if (aIsArray && nType == "function") {
				for (var i = a.length-1, l = -1; i > l; i--) {
					if (n(a[i], i)) values.push(a.splice(i,1)[0]);
				}
			} else if (aIsArray && nType == "undefined") {
				for (var i = a.length-1, l = -1; i > l; i--) {
					values.push(a.splice(i,1)[0]);
				}
			}
			return values;
		},

		where: function(a, n, uids) {
			var aIsArray = g.isArray(a);
			var uidsIsArray = g.isArray(uids);
			var nIsArray = g.isArray(n);
			var uidsType = typeof uids;
			var nType = typeof n;
			var values = [];
			if (aIsArray && nType == "string" && uidsIsArray) {
				var uids = [].concat(uids);
				for (var i = a.length-1, l = -1; i > l; i--) {
					var uidIndex = g.indexOf(uids, a[i][n]);
					if ( uidIndex !== -1) {
						values.push(a[i]);
						uids.splice(uidIndex, 1);
					}
				}
			} else if (aIsArray && !nIsArray && nType == "object" && uidsType == "undefined") {
				var uids = [].concat(uids);
				for (var i = a.length-1, l = -1; i > l; i--) {
					var isEqual = true;
					for (var k in n) {
						if (!g.equal(a[i][k],n[k])) {
							isEqual = false;
							break;
						}
					}
					if (isEqual) values.push(a[i]);
				}
			} else if (aIsArray && nType == "function") {
				for (var i = a.length-1, l = -1; i > l; i--) {
					if (n(a[i], i)) values.push(a[i]);
				}
			} else if (aIsArray && nType == "undefined") {
				for (var i = a.length-1, l = -1; i > l; i--) {
					values.push(a[i]);
				}
			}
			return values;
		},

		find: function(a, n, uids) {
			var aIsArray = g.isArray(a);
			var uidsIsArray = g.isArray(uids);
			var nIsArray = g.isArray(n);
			var uidsType = typeof uids;
			var nType = typeof n;
			if (aIsArray && nType == "string" && uidsIsArray) {
				var uids = [].concat(uids);
				for (var i = a.length-1, l = -1; i > l; i--) {
					var uidIndex = g.indexOf(uids, a[i][n]);
					if ( uidIndex !== -1) {
						return a[i];
					}
				}
			} else if (aIsArray && !nIsArray && nType == "object" && uidsType == "undefined") {
				var uids = [].concat(uids);
				for (var i = a.length-1, l = -1; i > l; i--) {
					var isEqual = true;
					for (var k in n) {
						if (!g.equal(a[i][k],n[k])) {
							isEqual = false;
							break;
						}
					}
					if (isEqual) return a[i];
				}
			} else if (aIsArray && nType == "function") {
				for (var i = a.length-1, l = -1; i > l; i--) {
					if (n(a[i], i)) return a[i];
				}
			} else if (aIsArray && nType == "undefined") {
				for (var i = a.length-1, l = -1; i > l; i--) {
					return a[i];
				}
			}
		},

		get: function(name) {
			if (name === undefined) return this;
			var matches = name.match(nameSeparator);
			var names = [];
			for (var i = 0, l = matches.length; i < l; i++) {
				var name = matches[i].replace(trimREX, "");
				if (name === "") continue;
				names.push(name);
			}
			var parent = this;
			for (var i = 0, l = names.length - 1; i < l; i++) {
				var name = names[i];
				if (parent[name] === undefined) return undefined;
				parent = parent[name];
			}
			return parent[names[names.length-1]];
		},

		set: function(name, value) {
			var matches = name.match(nameSeparator);
			var names = [];
			for (var i = 0, l = matches.length; i < l; i++) {
				var name = matches[i].replace(trimREX, "");
				if (name === "") continue;
				names.push(name);
			}
			var parent = this;
			for (var i = 0, l = names.length - 1; i < l; i++) {
				var name = names[i];
				switch(typeof parent[name]) {
				case "string": parent[name] = new String(parent[name]); break;
				case "number": parent[name] = new Number(parent[name]); break;
				case "boolean": parent[name] = new Boolean(parent[name]); break;
				case "undefined": parent[name] = {}; break;
				case "null": parent[name] = {}; break;
				case "object":
					if (parent[name] === null) {
						parent[name] = {}; break;
					}
				}
				parent = parent[name];
			}
			var name = names[names.length-1];
			switch(typeof parent[name]) {
			case "object": 
				switch (typeof value) {
				case "string":
					var n = new String(value);
					g.extend(n, parent[name]);
					return parent[name] = n;
					break;
				case "number":
					var n = new Number(value);
					g.extend(n, parent[name]);
					return parent[name] = n;
					break;
				case "boolean":
					var n = new Boolean(value);
					g.extend(n, parent[name]);
					return parent[name] = n;
					break;
				case "object": case "function":
					g.extend(value, parent[name]);
					return parent[name] = value;
					break;
				}
			}
			return parent[name] = value;
		},

		bind: function(f, o) {
			var args = [].slice.call(arguments, 2);
			return function () {
				var args2 = [].concat(args, [].slice.call(arguments,0));
				return f.apply(o, args2);
			};
		},

		throttle: function(c, ti, th) {
			var t = function() {
				this.c = c;
				this.ti = ti;
				this.th = th;
				if (this.to) {
					clearTimeout(this.to);
					this.to = null;
				}
				this.to = setTimeout(util.bind(function() {
					this.c.apply(this.th);
				}, this), this.ti);
			};
			return util.bind(t,t);
		},

		defer: function(c, th) {
			var args = arguments;
			setTimeout(function() {
				c.apply(th, arguments);
			}, 0);
		},

		delay: function(c, t, th) {
			var args = arguments;
			setTimeout(function() {
				c.apply(th, arguments);
			}, t);
		},

		isArray: function(a) {
			if (typeof a == "object" && a instanceof Array) return true;
			return false;
		},

		isRegExp: function(r) {
			if (typeof a == "object" && a instanceof RegExp) return true;
			return false;
		},

		isFunction: function(f) {
			if (typeof a == "function") return true;
			return false;
		}
	};

	var context = window || global;

	if (context.module && context.module.exports ) {
		module.exports = g;
	} else {
		//g.extend(context.util = {}, g);

	}

	return g;
});