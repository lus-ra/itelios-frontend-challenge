Object.isNil = function(p_value){
	return typeof p_value === 'undefined' || p_value === null
}
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
		this.$ = this._getElement(this._parseData(args[0]) || args[0] || {})
		Object.assign(this.$, this.constructor.prototype)
		this.$.init.apply(this.$, args)
		return this.$;
	},
	init: function () { },
	_parseData: function (p_data) {
		return p_data
	},
	_getElement: function (p_data) {
		if (!!this.constructor.prototype.TEMPLATE) {
			template = document.createElement('div')
			var templateString = this.constructor.prototype.TEMPLATE
			if (!!p_data) {
				var regex = /\{\{([^\{\}]+)\}\}/gi;
				var template
				while ((m = regex.exec(templateString)) !== null) {
					if (m.index === regex.lastIndex) {
						regex.lastIndex++;
					}
					templateString = templateString.replace(m[0], eval('p_data.' + m[1]) || '')
				}
			}
			template.innerHTML = templateString
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

	var ProductCard = Component.create({
		TEMPLATE: (function () {/*
			<div class="product-card">
				<div class="product-card__image"><img class="bitmap" src="{{imageName}}" alt="" title="{{name}}"/></div>
				<div class="product-card__info">
					<div class="product-card__description">{{name}}</div>
					<div class="product-card__prices">
						<p class='product-card__prices-old'>De: <strong>{{oldPrice}}</strong></p>
						<p>Por: <strong>{{price}}</strong></p>
					</div>
					<div class="product-card__conditions">{{productInfo.paymentConditions}}</div>
					<div class="product-card__cart">
						<button class="add-cart">adicionar ao carrinho <svg class="add-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="black"><path d="M0 0h24v24H0zm18.31 6l-2.76 5z" fill="none"/><path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z" fill="inherit"/></svg></button>
					</div>
				</div>
			</div>
		*/}),

		_parseData: function (p_data) {
			p_data = p_data || {}
			var maxChars = 90
			if (p_data.name.length > 90) {
				p_data.name = p_data.name.slice(0, 90).split(' ').slice(0, -1).join(' ') + '...'
			}
			if (p_data.productInfo && (conditions = p_data.productInfo.paymentConditions)) {
				p_data.productInfo.paymentConditions = conditions.replace(/([\dx].+[\d])/gi, '<strong>$1</strong>');
			}
			return p_data
		},

		init: function (p_data) {
			this._data = p_data
			this.pricesContainer = this.querySelector('.product-card__prices')
			this.pricesContainer.style.visibility = 'visible';
			this.oldPrice = this.querySelector('.product-card__prices-old')
			this.conditions = this.querySelector('.product-card__conditions')
			if (Object.isNil(this._data.oldPrice)) {
				this.oldPrice.textContent = ''
			}
			if (Object.isNil(this._data.productInfo.paymentConditions)) {
				this.priceConditions.parentElement.removeChild(this.conditions)
			}
		}
	})

	var RecommendedList = Component.create({
		TEMPLATE: (function () {/*
			<div class="recommended-list">
				<h2 class="recommended-list__title">e talvez se interesse por:</h2>
				<div class="recommended-list__items">
					<div class="recommended-list__container"></div>
				</div>
			</div>
		*/}),

		init: function (p_data) {
			this._didBulletChanged = this._didBulletChanged.bind(this)
			this._invalidate = this._invalidate.bind(this)
			this._data = p_data || []
			this._items = []

			this.viewItems = this.querySelector('.recommended-list__items')
			this.viewItemsContainer = this.querySelector('.recommended-list__container')
			this.viewItems.style.display = 'none'

			var length = this._data.length
			var width = 0
			while (length--) {
				item = this._data[length]
				var product = new ProductCard(item)
				this.viewItemsContainer.appendChild(product)
			}

			this.navBullets = new Bullets()
			this.navBullets.addEventListener('changed', this._didBulletChanged)
			this.viewItems.appendChild(this.navBullets)
			this.navBullets.setTotal(Math.ceil(this._data.length/3))
			
			window.addEventListener('resize', this._invalidate)
			setTimeout(this._invalidate);
		},

		_invalidate: function() {
			var length = this._data.length
			var width = 0
			var index = this.navBullets.currentIndex;

			this.viewItems.style.display = 'block'
			while (length--) {
				item = this.viewItemsContainer.children[length]
				width += item.offsetWidth
			}
			this.viewItemsContainer.style.width = width + 'px'
			this.navBullets.style.top = (this.viewItemsContainer.offsetHeight * 1.02) + 'px'

			var maxWidth = Math.max(((-this.viewItems.offsetWidth+1) * index), Math.min(0, (this.viewItems.offsetWidth - this.viewItemsContainer.offsetWidth) + this._data.length-1))
			this.viewItemsContainer.style.left = maxWidth + 'px'
		},

		_didBulletChanged: function(event) {
			this._invalidate()
		}
	})

	var Bullets = Component.create({
		TEMPLATE: (function(){/*
			<nav class='bullets'>
				<ul></ul>
			</nav>
		*/}),
		init: function(){
			this.currentIndex = 0
			this.list = this.querySelector('ul')
			this.list.items = []
			this._didItemClick = this._didItemClick.bind(this)
		},
		setIndex: function(p_index) {
			p_index = p_index || 0;
			item = this.list.items[p_index]
			if(!!item){
				var length = this.list.items.length
				var item;
				this.currentIndex = p_index;
				while(length--) {
					item = this.list.items[length]
					item.classList.remove('selected')
					if(item.index === this.currentIndex) {
						item.classList.add('selected')
					}
				}
				this.dispatchEvent(new CustomEvent('changed', {detail:this.currentIndex}))
			}
		},
		setTotal: function(p_total){
			this.total = p_total;
			this._redraw()
			this.setIndex(this.currentIndex)
		},
		_redraw: function(){
			var length = this.total
			var index = 0
			this._clear()
			while(length--) {
				item = document.createElement('li')
				button = document.createElement('a')
				button.innerHTML = '&#x2B24'
				button.href = 'javascript:void(0);';
				item.index = button.index = index
				button.addEventListener('click', this._didItemClick)
				item.appendChild(button)
				this.list.appendChild(item)
				this.list.items.push(button)
				index++;
			}
		},
		_clear: function(){
			this.list.items = this.list.items || []
			while(this.list.children.length || 0) {
				item = this.list.shift()
				item.removeEventListener('click', this._didItemClick)
			}
			this.list.innerHTML = ''
		},
		_didItemClick: function(event) {
			this.setIndex(event.target.index)
		}
	})

	var ShoppingHistory = Component.create({

		TEMPLATE: (function () {/*
			<div class="shopping-history">
				<div class="visited-block">
					<h2 class="visited-block__title">Você visitou:</h2>
				</div>
			</div>
		*/}),

		init: function (p_config) {
			fetch(p_config)
				.then(function (response) {
					return response.json()
				})
				.then(this.render.bind(this))
				.catch(function () { })
		},

		render: function (p_data) {
			this._data = p_data[0].data
			this.visitedBlock = this.querySelector('.visited-block') || this

			this.visitedCard = new ProductCard(this._data.item)
			this.visitedBlock.appendChild(this.visitedCard)

			this.recommendedList = new RecommendedList(this._data.recommendation)
			this.appendChild(this.recommendedList)
		}

	})

	var View = Component.create({

		TEMPLATE: (function () {/*
			<main role="document"></main>
		*/}),

		init: function (p_config) {
			var history = new ShoppingHistory(p_config.products)
			this.appendChild(history)
		}
	})
	View.start = function (p_config) {
		window.onload = function () {
			if(!!(requestFonts = document.querySelector('.--request-fonts'))) {
				requestFonts.parentElement.removeChild(requestFonts);
			}
			document.body.appendChild(new View(p_config))
		}
	}
	View.start({
		products: 'products.json'
	})

}())

