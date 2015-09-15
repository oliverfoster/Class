;define("Class.Events", [ "util", "Class" ],function(util, Class) {

	var data = {
		uid: 0
	};

	var namespaceREX = /[^:]*/g;

	Class.extend("Class.Events", {

		"__events__": null,

		attachEvents: function() {},

		remove: Class.descend(function remove() {
			this.trigger("object:remove", this);
			this.detachEvents();
		}),

		detachEvents: function() {
			this.off();
		},

		on: function(name, selector, callback) {
			if (typeof name != "string") throw "Event name must be a string";
			switch (arguments.length) {
			case 3: break;
			case 2:
				callback = selector;
				selector = this;
			}
			if (typeof callback != "function") throw "Event callback must be an function";
			var selectedHandlers = Class.Events.findInstanceEventHandlers(this, name, selector, this);
			if (!selectedHandlers) throw "Event handlers not found";
			for (var i = 0, l = selectedHandlers.length; i < l; i++) {
				selectedHandlers[i].on.call(this, name, selector, callback);
			}
			return this;
		},

		one: function(name, selector, callback) {
			if (typeof name != "string") throw "Event name must be a string";
			switch (arguments.length) {
			case 3: break;
			case 2:
				callback = selector;
				selector = this;
				break;
			default:
				throw "Too few arguments";
			}
			if (typeof callback != "function") throw "Event callback must be an function";
			var selectedHandlers = Class.Events.findInstanceEventHandlers(this, name, selector, this);
			if (!selectedHandlers) throw "Event handlers not found";
			for (var i = 0, l = selectedHandlers.length; i < l; i++) {
				selectedHandlers[i].one.call(this, name, selector, callback);
			}
			return this;
		},

		off: function(name, selector, callback) {
			switch (arguments.length) {
			case 3: 
				if (name && typeof name != "string") throw "Event name must be a string";
				if (!selector && selector !== "") selector = this;
				if (callback && typeof callback != "function") throw "Event callback must be an function";
				break;
			case 2:
				if (name && typeof name != "string") throw "Event name must be a string";
				if (typeof selector == "function") {
					callback = selector;
					selector = this;
				} else {
					if (!selector && selector !== "") selector = this;
					callback = null;
				}
				break;
			case 1:
				if (name && typeof name != "string") throw "Event name must be a string";
				selector = this;
				callback = null;
				break;
			case 0:
				name = null;
				callback = null;
				selector = null;
				break;
			default:
				throw "Too many arguments";
			}
			var selectedHandlers = Class.Events.findInstanceEventHandlers(this, name, selector, this);
			if (!selectedHandlers) throw "Event handlers not found";
			for (var i = 0, l = selectedHandlers.length; i < l; i++) {
				selectedHandlers[i].off.call(this, name, selector, callback);
			}
			return this;
		},

		trigger: function(name, selector) {
			if (typeof name != "string") throw "Event name must be a string";
			var args;
			switch (arguments.length) {
			case 1:
			case 0:
				throw "Too few arguments";
			default:
				args = arguments;
				break;
			}
			var selectedHandlers = Class.Events.findInstanceEventHandlers(this, name, selector, this);
			if (!selectedHandlers) throw "Event handlers not found";
			for (var i = 0, l = selectedHandlers.length; i < l; i++) {
				selectedHandlers[i].trigger.call(this, name, selector, args);
			}
			return this;
		}

	},{

		addClassEventHandler: function(subject, handler) {
			if (!subject.prototype.__handlers__) subject.prototype.__handlers__ = [];
			subject.prototype.__handlers__.push(handler);
		},

		getClassEventHandlers: function(subject) {
			return subject.prototype.__handlers__.slice(0);
		},

		extendClassEventHandlers: function(into, from) {
			into.prototype.__handlers__ = into.prototype.__handlers__.concat(from.prototype.__handlers__);
		},

		findInstanceEventHandlers: function(subject, name, selector, context) {
			var namespaces;
			if (name === null) namespaces = null;
			else namespaces = Class.Events.getEventNamespaces(name);
			var selectedHandlers = [];
			for (var i = 0, l = subject.__handlers__.length; i < l; i++) {
				if (subject.__handlers__[i].validate(namespaces, selector, context)) selectedHandlers.push(subject.__handlers__[i]);
			}
			return selectedHandlers;
		},

		getEventNamespaces: function(name) {
			var matches = name.match(namespaceREX);
			var namespaces = [];
			for (var i = 0, l = matches.length; i < l; i++) {
				var namespace = util.trim(matches[i]);
				if (namespace === "") continue;
				namespaces.push(namespace);
			}
			return namespaces;
		}

	});


	Class.Events.addClassEventHandler(Class.Events, {

		"type": "Object",

		"validate": function(namespaces, selector, context) {
			if (namespaces === null) return true;
			if (selector === null) return true;
			if (selector.__events__ === undefined) return false;
			if (namespaces[0] == "object") return true;
		},
		
		"on": function(name, selector, callback) {
			if (!selector.uid) throw "Cannot listen to an object with no uid";

			if (!callback._callbackUID) callback._callbackUID = "callback"+(++data.uid);

			if (util.find(selector.__events__, {
				type: "Object",
				name: name,
				callbackUID: callback._callbackUID,
				contextUID: this.uid,
				selectorUID: selector.uid,
				one: false
			})) return;

			var eventObject = {
				type: "Object",
				uid: "object"+(++data.uid),
				name: name,
				callbackUID: callback._callbackUID,
				callback: callback,
				selectorUID: selector.uid,
				selector: selector,
				contextUID: this.uid,
				context: this,
				one: false
			};

			if (eventObject.contextUID != eventObject.selectorUID) {
				if (!this.__events__) this.__events__ = [];
				this.__events__.push(eventObject);
				if (this.__events__[name] === undefined) this.__events__[name] = 1;
				else this.__events__[name]++;
			}

			if (!selector.__events__) selector.__events__ = [];
			selector.__events__.push(eventObject);
			if (selector.__events__[name] === undefined) selector.__events__[name] = 1;
			else selector.__events__[name]++;
		},

		"one": function(name, selector, callback) {
			if (!selector.uid) throw "Cannot listen to an object with no uid";

			if (!callback._callbackUID) callback._callbackUID = "callback"+(++data.uid);

			if (util.find(selector.__events__, {
				type: "Object",
				name: name,
				callbackUID: callback._callbackUID,
				contextUID: this.uid,
				selectorUID: selector.uid,
				one: true
			})) return;

			var eventObject = {
				type: "Object",
				uid: "object"+(++data.uid),
				name: name,
				callbackUID: callback._callbackUID,
				callback: callback,
				selectorUID: selector.uid,
				selector: selector,
				contextUID: this.uid,
				context: this,
				one: true
			};

			if (eventObject.contextUID != eventObject.selectorUID) {
				if (!this.__events__) this.__events__ = [];
				this.__events__.push(eventObject);
				if (this.__events__[name] === undefined) this.__events__[name] = 1;
				else this.__events__[name]++;
			}

			if (!selector.__events__) selector.__events__ = [];
			selector.__events__.push(eventObject);
			if (selector.__events__[name] === undefined) selector.__events__[name] = 1;
			else selector.__events__[name]++;
		},

		"off": function(name, selector, callback) {

			var removed;
			if (name === null && selector === null && callback === null) {
				removed = util.remove(this.__events__, {
					type: "Object"
				});
			} else if (!name && selector && !callback) {
				removed = util.remove(selector.__events__, {
					type: "Object",
					selectorUID: selector.uid,
					contextUID: this.uid
				});
			} else if (name && selector && !callback) {
				removed = util.remove(selector.__events__, {
					type: "Object",
					name: name,
					selectorUID: selector.uid,
					contextUID: this.uid
				});
			} else if (!name && selector && callback) {
				removed = util.remove(selector.__events__, {
					type: "Object",
					selectorUID: selector.uid,
					contextUID: this.uid,
					callbackUID: callback._callbackUID
				});
			} else if (name && selector && callback) {
				util.remove(selector.__events__, {
					type: "Object",
					name: name,
					selectorUID: selector.uid,
					contextUID: this.uid,
					callbackUID: callback._callbackUID
				});
				util.remove(this.__events__, {
					type: "Object",
					name: name,
					selectorUID: selector.uid,
					contextUID: this.uid,
					callbackUID: callback._callbackUID
				});
				if (this.__events__[name] !== undefined) this.__events__[name]--;
				if (this.__events__[name] === 0) delete this.__events__[name];
				if (selector.__events__[name] !== undefined) selector.__events__[name]--;
				if (selector.__events__[name] === 0) delete selector.__events__[name];
				return;
			} else {
				throw "Cannot remove events using supplied layout";
			}

			for (var i = 0, l = removed.length; i < l; i++) {
				var eventObject = removed[i];
				if (eventObject.selectorUID !== eventObject.contextUID) {
					eventObject.context.off(eventObject.name, eventObject.selector, eventObject.callback);
				}
			}

		},

		"trigger": function(name, selector, args) {
			if (!selector.__events__) return;

			var namespaces = Class.Events.getEventNamespaces(name);
			var currentName = namespaces.shift();

			while (true) {
				
				if (selector.__events__[currentName]) {
					var selected = util.where(selector.__events__, {
						type: "Object",
						name: currentName,
						selectorUID: selector.uid
					});

					for (var k = 0, l = selected.length; k < l; k++) {
						var eventObject = selected[k];
						eventObject.callback.apply(eventObject.context, args);
						
						if (eventObject.one) {
							this.off(name, selector, eventObject.callback);
						}
					}
				}

				if (namespaces.length === 0) return;
				currentName+=":"+namespaces.shift();
			}
		}

	});

	return Class.Events;
	
});