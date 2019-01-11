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
		var args = Array.prototype.slice.call(arguments)
		this.$ = this._getElement(args[0] || {})
		Object.assign(this.$, this.constructor.prototype)
		setTimeout(function () {
			this.$.init.apply(this.$, args)
		}.bind(this))
		return this.$;
	},
	init: function () { },
	_getElement: function () {
		if (!!this.constructor.prototype.TEMPLATE) {
			template = document.createElement('div')
			template.innerHTML = this.constructor.prototype.TEMPLATE
			return template.firstElementChild
		}
		return document.createElement(this.constructor.prototype.tag || 'div')
	}
}, HTMLElement)
Component.create = function (p_definitions, p_subClass) {
	p_definitions = p_definitions || {}
	if (typeof p_definitions.TEMPLATE === 'function') {
		templateMatch = p_definitions.TEMPLATE.toString().match(/[^]*\/\*([^]*)\*\/\}$/)
		if (!!templateMatch) {
			p_definitions.TEMPLATE = templateMatch[1].replace(/^\s*(.*?)\s*$/, '$1')
		}
	}
	if ({}.constructor === p_definitions.constructor) {
		p_definitions.constructor = function () {
			return Component.apply(this, Array.prototype.slice.call(arguments))
		}
	}
	classComponent = Object.createClass(Object.assign({}, Component.prototype, p_definitions), p_subClass)
	return classComponent
}

!(function () {

	var ShoppingHistory = Component.create({
		TEMPLATE: (function () {/*
			<div class="shopping-history">
				<div class="visited-block">
					<h2 class="visited-block__title">Você visitou:</h2>
				</div>
			</div>
		*/}),

		init: function () {
			this.visitedBlock = this.querySelector('.visited-block') || this
			this.visitedBlock.appendChild(new TestButton());
		}
	})

	var TestButton = Component.create({
		tag: 'button',
		init: function () {
			this.textContent = 'teste-button'
		}
	})

	document.body.appendChild(new ShoppingHistory());

})()