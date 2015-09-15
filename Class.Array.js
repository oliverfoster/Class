;define("Class.Array", [ "util", "Class"], function(util, Class) {

	var ClassArray = Class.constructor();

	util.extend(ClassArray.prototype = [], Class.prototype);
	
	ClassArray.extend = Class.extend;

	Class.registerClass("Class.Array", ClassArray);

	ClassArray.prototype.classChain = ClassArray.prototype.className;

	return ClassArray;

});