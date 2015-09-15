;define("Class.View", [ "util", "Class", "Class.Events" ], function(util, Class) {

	var data = {
		uid: 0
	};

	var $document = $(document);
	var $window = $(window);

	Class.Events.extend("Class.View", {

		__handlers__: [],
		
		$el: $document,

		initialize: Class.ascend(function initialize(options) {
			if (options && options.model) {
				this.model = options.model;
			}
		}),

		postInitialize: Class.ascend(function postInitialize(options) {
			this.preRender();
			this.render();
		}),

		preRender: function() {},

		$: function(selector) {
			if (selector === undefined) return this.$el;
			return this.$el.find(selector);
		},

		render: function() {
			util.defer(this.postRender, this);
		},

		postRender: function() {
			this.attachEvents();
			if (this.model) this.updateClasses();
		},

		updateClasses: function() {
			this.$el.addClass(this.model._classes);
		},

		attachEvents: Class.ascend(function attachEvents() {
			
			if (!this.events) return;

			var events;
			if (typeof this.events == "function") events = this.events();
			else events = this.events;

			for (var k in events) {
				var eventName;
				var selector;
				var firstSpaceIndex = util.indexOf(k," ");
				if (firstSpaceIndex == -1) {
					eventName = k;
					selector = "";
				} else {
					eventName = k.substr(0, firstSpaceIndex);
					selector = util.trim(k.substr(firstSpaceIndex+1));
				}
				if (eventName.substr(0,1) == "!") {
					eventName = eventName.slice(1);
					this.one(eventName, selector, this[events[k]]);
				} else {
					this.on(eventName, selector, this[events[k]]);
				}
			}

		}),
		
		remove: Class.descend(function remove() {
			this.$el.remove();
		})

	}, {

		getSelectorNamespacesParentElement: function(namespaces, $context) {
			switch (namespaces[0]) {
			case "window":
				return $window;
			case "document":
				return $document;
			case "el":
			default:
				return $context;
			}
		},

		normalizeNamespaces: function(namespaces) {
			if (namespaces.length > 1) return namespaces.slice(1).join(":");
			switch (namespaces[0]) {
			case "window":case "document":case "el":
				return "";
			default:
				return namespaces.join(":");
			}
		},

		normalizeNamespace: function(name) {
			var namespaces = Class.Events.getEventNamespaces(name);
			return Class.View.normalizeNamespaces(namespaces);
		}

	});

	Class.Events.extendClassEventHandlers(Class.View, Class.Events);

	Class.Events.addClassEventHandler(Class.View, {

		"type": "DOM",

		"validate": function(namespaces, selector, context) {
			if (namespaces === null) return true;
			if (selector === null) return true;
			if (context.__events__ === undefined) return false;
			if (namespaces[0] == "dom") return true;
		},

		"on": function(name, selector, callback) {
			if (!callback._callbackUID) callback._callbackUID = "callback"+(++data.uid);

			var namespaces = Class.Events.getEventNamespaces(selector);
			var normSelector = Class.View.normalizeNamespaces(namespaces);

			if (find(this.__events__, {
				type: "Dom",
				name: name,
				callbackUID: callback._callbackUID,
				contextUID: this.uid,
				selector: normSelector,
				one: false
			})) return;

			var eventObject = {
				type: "Dom",
				uid: "dom"+(++data.uid),
				name: name,
				callbackUID: callback._callbackUID,
				callback: callback,
				selector: normSelector,
				contextUID: this.uid,
				context: this,
				one: false,
				trigger: util.bind(this.trigger, this, name, selector)
			};

			if (!this.__events__) this.__events__ = [];
			this.__events__.push(eventObject);
			if (this.__events__[name] === undefined) this.__events__[name] = 1;
			else this.__events__[name]++;

			$ele = Class.View.getSelectorNamespacesParentElement(namespaces, this.$el);
			$ele.on(Class.View.normalizeNamespace(name), normSelector, eventObject.trigger);
		},

		"one": function(name, selector, callback) {
			if (!callback._callbackUID) callback._callbackUID = "callback"+(++data.uid);

			var namespaces = Class.Events.getEventNamespaces(selector);
			var normSelector = Class.View.normalizeNamespaces(namespaces);

			if (util.find(this.__events__, {
				type: "Dom",
				name: name,
				callbackUID: callback._callbackUID,
				contextUID: this.uid,
				selector: normSelector,
				one: true
			})) return;

			var eventObject = {
				type: "Dom",
				uid: "dom"+(++data.uid),
				name: name,
				callbackUID: callback._callbackUID,
				callback: callback,
				selector: normSelector,
				contextUID: this.uid,
				context: this,
				one: true,
				trigger: util.bind(this.trigger, this, name, selector, callback)
			};

			if (!this.__events__) this.__events__ = [];
			this.__events__.push(eventObject);
			if (this.__events__[name] === undefined) this.__events__[name] = 1;
			else this.__events__[name]++;

			$ele = Class.View.getSelectorNamespacesParentElement(namespaces, this.$el);
			$ele.on(Class.View.normalizeNamespace(name), normSelector, eventObject.trigger);
		},

		"off": function(name, selector, callback) {

			var removed;
			if (name === null && selector === null && callback === null) {
				removed = util.remove(this.__events__, {
					type: "Dom"
				});
			} else if (!name && selector === "" && !callback) {
				removed = util.remove(this.__events__, {
					type: "Dom",
					contextUID: this.uid
				});
			} else if (!name && !callback) {
				selector = Class.View.normalizeNamespace(selector);
				removed = util.remove(this.__events__, {
					type: "Dom",
					selector: selector,
					contextUID: this.uid
				});
			} else if (name && !callback) {
				selector = Class.View.normalizeNamespace(selector);
				removed = util.remove(this.__events__, {
					type: "Dom",
					name: name,
					selector: selector,
					contextUID: this.uid
				});
			} else if (!name && callback) {
				selector = Class.View.normalizeNamespace(selector);
				removed = util.remove(this.__events__, {
					type: "Dom",
					selector: selector,
					contextUID: this.uid,
					callbackUID: callback._callbackUID
				});
			} else if (name && callback) {
				selector = Class.View.normalizeNamespace(selector);
				removed = util.remove(this.__events__, {
					type: "Dom",
					name: name,
					selector: selector,
					contextUID: this.uid,
					callbackUID: callback._callbackUID
				});
				if (this.__events__[name] !== undefined) this.__events__[name]--;
				if (this.__events__[name] === 0) delete this.__events__[name];
				return;
			} else {
				throw "Cannot remove events using supplied layout";
			}

			for (var i = 0, l = removed.length; i < l; i++) {
				var eventObject = removed[i];
				$ele = Class.View.getSelectorNamespacesParentElement(eventObject.selector, this.$el);
				$ele.off(Class.View.normalizeNamespace(eventObject.name), eventObject.selector, eventObject.trigger);
			}

		},

		"trigger": function(name, selector, args) {
			if (!this.__events__) return;

			var normSelector = Class.View.normalizeNamespace(selector);

			var namespaces = Class.Events.getEventNamespaces(name);
			var currentName = namespaces.shift();

			while (true) {

				if (this.__events__[currentName]) {
					var selected = util.where(this.__events__, {
						type: "Dom",
						name: currentName,
						selector: normSelector
					});

					for (var k = 0, l = selected.length; k < l; k++) {
						var eventObject = selected[k];
						eventObject.callback.apply(eventObject.context, args);
						
						if (eventObject.one) {
							this.off(name, normSelector, eventObject.callback);
						}
					}
				}

				if (namespaces.length === 0) return;
				currentName+=":"+namespaces.shift();
			}
		}

	});

	return Class.View;

});