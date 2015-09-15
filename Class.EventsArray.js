;define("Class.EventsArray", [ "util", "Class", "Class.Events", "Class.Array" ],function(util, Class) {

	Class.Array.extend("Class.EventsArray", util.extend({}, Class.Events.prototype, {

		push: function(model, options) {
			options = options || {};
			options.trigger = options.trigger === undefined ? true : options.trigger;

			Array.prototype.push.call(this, model);

			if (options.trigger) {
				this.trigger("object:add", this, model);
			}

			return this;
		},

		unshift: function(model, options) {
			options = options || {};
			options.trigger = options.trigger === undefined ? true : options.trigger;
			
			Array.prototype.unshift.call(this, model);

			if (options.trigger) {
				this.trigger("object:add", this, model);
			}

			return this;
		},

		pop: function(options) {
			options = options || {};
			options.trigger = options.trigger === undefined ? true : options.trigger;
			
			var value = Array.prototype.pop.call(this);

			if (options.trigger) {
				this.trigger("remove", this, value);
			}

			return value;
		},

		shift: function(model, options) {
			options = options || {};
			options.trigger = options.trigger === undefined ? true : options.trigger;
			
			var value = Array.prototype.shift.call(this);
			
			if (options.trigger) {
				this.trigger("object:remove", this, value);
			}

			return value;
		},

		splice: function(index, remove, model, options) {
			var value;
			if (remove === undefined) remove = 0;

			if (model === undefined || !model.className) {
				options = model;
				value = Array.prototype.splice.call(this, index, remove);
			} else {
				value = Array.prototype.splice.call(this, index, remove, model);
			}

			options = options || {};
			options.trigger = options.trigger === undefined ? true : options.trigger;

			if (options.trigger && remove > 0) {
				this.trigger("object:remove", this, value);
			}
			
			return value;
		}
	}));

	return Class.EventsArray;

});