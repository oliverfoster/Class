;define("Class.Collection", [ "util", "Class", "Class.EventsArray" ], function(util, Class) {

	Class.EventsArray.extend("Class.Collection", {

		initialize: Class.ascend(function initialize(models) {
			this.attachEvents();

			if (!models || !util.isArray(models)) return;
			
			for (var i = 0, l = models.length; i < l; i++) {
				this.push(models[i]);
			}
		}),

		attachEvents: Class.ascend(function attachEvents() {

			this.on("object:add", this, function(eventName, selector, model) {
				this.on("object:change", model, onChildChange);
				this.on("object:remove", model, onChildRemove);
			});

			this.on("object:remove", this, function(eventName, selector, model) {
				this.off("object:change", model, onChildChange);
				this.off("object:remove", model, onChildRemove);
			});

			function onChildChange(eventName, model, name, value) {
				this.trigger("object:changeChild:"+name, this, model, name, value);
			}

			function onChildRemove(eventName, model) {
				this.trigger("object:removeChild:"+name, this, model);
				var index = util.indexOf(this, "uid", [model.uid]);
				this.splice(index, 1, {trigger:false});
			}

		}),

		get: function(name, options) {
			options = options || {};
			options.trigger = options.trigger === undefined ? true : options.trigger;

			var value;
			switch (typeof name) {
			case "string":
				value = [];
				for (var i = 0, l = this.length; i < l; i++) {
					if (this[i].model) {
						this[i].model.get(name, options);
					} else {
						this[i].get(name, options);
					}
				}
				break;
			default:
				value = this.slice(0);
			}

			if (options.trigger === true) {
				this.trigger("object:get:"+name, this, name, value);
			}

			return value;
		},

		set: function(name, value, options) {
			options = options || {};
			options.trigger = options.trigger === undefined ? true : options.trigger;

			switch (typeof name) {
			case "string": break;
			case "object":
				for (var k in name) {
					this.set(k, name[k], options);
				}
			default:
				return this;
			}


			for (var i = 0, l = this.length - 1; i < l; i++) {
				if (this[i].model) {
					this[i].model.set(name, value, options);
				} else {
					this[i].set(name, value, options);
				}
			}

			if (options.trigger === true) {
				this.trigger("object:set:"+name, this, name, value);
			}
			
			return this;
		},

		removeChildren: function() {
			var returns = [];
			for (var i = this.length -1, l = -1; i > l; i--) {
				var value = this.pop();
				value.remove();
				returns.push(value);
			}
			return returns;
		}

	});

	return Class.Collection;

});