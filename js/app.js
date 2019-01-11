Object.createClass = function (p_definitions, p_subClass) {
	p_definitions = p_definitions || {}
	klass = p_definitions.constructor || function () { }
	delete p_definitions.constructor
	if (typeof p_subClass === 'function') {
		klass.prototype = Object.create(p_subClass.prototype)
		klass.prototype.constructor = klass
	}
	Object.assign(klass.prototype, p_definitions)
	return klass
}

Component = Object.createClass({
	tag: 'div',
	constructor: function () {
		this.$ = document.createElement(this.constructor.prototype.tag || 'div')
		Object.assign(this.$, this.constructor.prototype)
		var args = Array.prototype.slice.call(arguments)
		setTimeout(function () {
			this.$.init.apply(this.$, args)
		}.bind(this))
		return this.$;
	},
	init: function () { }
}, HTMLElement)
Component.create = function (p_definitions, p_subClass) {
	p_definitions = p_definitions || {}
	classComponent = Object.createClass(Object.assign({}, Component.prototype, p_definitions), p_subClass)
	return classComponent
}

!(function () {

	var TestButton = Component.create({
		tag: 'button',
		constructor: function () {
			return Component.call(this)
		},
		init: function () {
			this.textContent = 'teste-button'
		}
	})

	document.body.appendChild(new TestButton());

})()