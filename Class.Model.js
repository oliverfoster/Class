;define("Class.Model", [ "util", "Class", "Class.Events" ], function(util, Class) {

	var prohibited;

	Class.Events.extend("Class.Model", {

		"__prohibited__": null,
		"defaults": null,

		initialize: Class.ascend(function initialize(a) {

			if (!a) return;
			switch (typeof a) {
			case "object":

				for (var k in a) {
					if (util.indexOf(this.__prohibited__, k) > -1) {
						console.error("Cannot change restricted Model attribute '" + k + "'");
						continue;
					}
					this[k] = a[k];
				}

				this.attachEvents();
				break;

			case "string":

				$.getJSON(a, util.bind(function(d) {
					for (var k in d) {
						if (util.indexOf(this.__prohibited__, k) > -1) {
							console.error("Cannot change restricted Model attribute '" + k + "'");
							continue;
						}
						this[k] = d[k];
					}
					
					this.attachEvents();
					this.trigger("object:loaded", this);
				},this));

			}

			if (this.defaults) {
				if (typeof this.defaults == "function") this.defaults = this.defaults();
				for (var k in this.defaults) {
					if (this[k] === undefined) this[k] = util.clone(this.defaults[k])
				}
			}

		}),

		get: function(name, options) {
			var value;
			switch (typeof name) {
			case "string":

				value = util.get.apply(this, arguments);
				break;

			default:

				value = {};
				util.each(this, function(item, k) {
					if (util.indexOf(this.__prohibited__, k) > -1) return;
					value[k] = item;
				});
			}

			options = options || {};
			options.trigger = options.trigger === undefined ? true : options.trigger;

			if (options.trigger === true) {
				this.trigger("object:get:"+name, this, name, value);
			}

			return value;
		},

		set: function(name, value, options) {
			
			switch (typeof name) {
			case "string":
				if (util.indexOf(this.__prohibited__, name) > -1) {
					console.error("Cannot change restricted Model attribute '" + name + "'");
					return this;
				}
				break;
			case "object":
				for (var k in name) {
					this.set(k, name[k]);
				}
			default:
				return this;
			}

			options = options || {};
			options.trigger = options.trigger === undefined ? true : options.trigger;

			var prev;
			if (options.trigger === true) {
				prev = this.get(name);
			}

			util.set.apply(this, arguments);

			if (options.trigger === true) {
				this.trigger("object:set:"+name, this, name, value);
				if (prev != value) {
					this.trigger("object:change:"+name, this, name, value);
				}
			}

			return this;
		}

	},{
		
		extend: function() {
			var newClass = Class.extend.apply(this, arguments);
			newClass.prototype.__prohibited__ = util.keys(newClass.prototype);
		}

	});

	Class.Model.prototype.__prohibited__ = util.keys(Class.Model.prototype);
	
	return Class.Model;

});