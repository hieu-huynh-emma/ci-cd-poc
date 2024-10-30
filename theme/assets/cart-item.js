class CartItems extends CustomElement {
	get refs() {
		return {

			allItems: this.querySelectorAll('cart-item'),
			cartSummary: document.getElementById('CartDrawerSummary'),
			cartRedeem: document.getElementById('CartRedeemCode'),
			cartRecommendation: document.querySelector("cart-recommendation") || {},
			cartFooter: document.getElementById('CartDrawerFooter'),
			scrollableContent: this.closest('cart-scrollable-content')
		}
	}

	get data() {
		const allMattresses = JSON.parse(document.getElementById("All-Mattresses-JSON").textContent)
		const allMattressIds = allMattresses.map(({id}) => id)
		return {
			allMattresses, allMattressIds, addonServiceIds: Shop.addonServiceIds
		}
	}

	beforeMount() {
		this.$cart = document.getElementById('CartDrawer');

		this.debouncedOnChange = debounce(this.onQuantityChange.bind(this), 300);

		this.addEventListener('change', this.debouncedOnChange.bind(this));

		// Extend - handleRefresh(e)
		// creates the cart based on the cart that is passed in from event listener
		async function handleRefresh(e) {

			if (e.detail.varId && e.detail.qty) {
				const data = {
					"id": e.detail.varId, "quantity": e.detail.qty
				};
				await this.updateCart(data, routes.cart_update_url);
			} else if (e.detail.varId === 0 && e.detail.qty === 0) {
				const data = {
					"id": e.detail.varId, "quantity": e.detail.qty
				};
				await this.updateCart(data, routes.cart_update_url);
			}
		}

		// called by ajax-side-cart-integration
		window.addEventListener('handleRefresh', handleRefresh.bind(this));
		// Extend - End Extend Code
	}

	mounted() {
		super.mounted();
	}

	async onQuantityChange(event) {
		const quantityAdjuster = event.target
		const value = quantityAdjuster.value

		await this.updateCartItem(value, $(quantityAdjuster).data('index'))
	}

	async updateCartItem(value, index) {
		if (value === 0) {
			await this.removeByIndex(index - 1)
		} else {
			await this.updateQuantityByLine(index, value);
		}
	}

	async retrieveCart() {
		return this.requestCart({
			url: '/cart.json', method: 'GET'
		})
	}

	async requestCart({
						  url = routes.cart_change_url, method = 'POST', payload = {}
					  } = {}) {
		const config = {
			method, headers: {
				'Content-Type': 'application/json', 'Accept': `application/json`
			}
		}
		if (method === 'POST') {
			config.body = JSON.stringify({
				...payload,
				sections: this.getSectionsToRender().map((section) => section.section),
				sections_url: window.location.pathname
			})
		}

		return fetch(`${url}`, config).then(res => res.json())
	}

	async updateCart(payload = {}, url = routes.cart_change_url) {
		const {cartSummary, cartRedeem} = this.refs

		try {
			const state = await this.requestCart({
				url, payload
			})

			const codeRedeemed = cartRedeem.codeRedeemed

			if (state.item_count === 0) {
				await this.resetCart()
			}

			if (!!codeRedeemed && state.item_count !== 0) {
				await this.$cart.parseCheckoutPage();

				await this.$cart.getCheckoutData();

				this.refreshSections(state)

				const isApplicable = cartRedeem.checkCodeApplicable()

				if (!isApplicable) return state

				cartSummary.computeDiscountedTotal()
				cartRedeem.refreshDiscountTag();
			} else {
				this.refreshSections(state)
			}

			return state
		} catch (e) {
			console.log(e)
		}
	}

	async addToCart(variantId, qty) {
		const data = {
			"id": variantId, "quantity": qty
		};

		return this.updateCart(data, routes.cart_add_url)
	};

	async removeByIndex(index) {
		const cart = await this.retrieveCart();

		if (cart.items.length == 1) {
			return this.emptyCart();
		}
		const cartItem = this.$el.find(`cart-item[\\:index='${index}']`)[0];
		const addonServiceFor = cartItem.props.addonServiceFor

		await this.updateQuantityByLine(index + 1, 0);
	}

	async removeByKey(key) {
		const cart = await this.retrieveCart();

		if (cart.items.length == 1) {
			return this.emptyCart();
		}
		const cartItem = this.$el.find(`cart-item[\\:key='${key}']`)[0];
		const addonServiceFor = cartItem.props.addonServiceFor

		await this.updateQuantityByKey(key, 0);

		if (!!addonServiceFor) {
			return this.removeAddon(addonServiceFor)
		} else {
			await this.addonServiceGuard()
		}
	}

	async emptyCart() {
		console.log('emptyCart')
		const state = await this.requestCart({
			url: routes.cart_clear_url
		})

		this.refreshSections(state)

		await this.resetCart()
	}

	async resetCart() {
		console.log('resetCart')
		const cartRedeemEl = document.getElementById('CartRedeemCode');
		const codeRedeemed = cartRedeemEl.codeRedeemed

		$("cart-surface").addClass('is-empty')

		if (!!codeRedeemed) {
			await cartRedeemEl.removeDiscount()
		}
	}

	async switchVariant(variantId, qty = 1, key) {

		const {
			cartSummary, scrollableContent
		} = this.refs

		const sourceItem = this.$el.find(`cart-item[\\:key='${key}']`)[0]
		const hasAdditionalService = sourceItem.props.hasAdditionalService

		scrollableContent.loading = true
		cartSummary.loading = true

		await this.updateCart({updates: {[key]: 0}}, routes.cart_update_url)

		const data = {
			id: variantId, quantity: qty, ...(hasAdditionalService ? {
				properties: {
					hasAdditionalService: true
				}
			} : {})
		};

		await this.updateCart(data, routes.cart_add_url)

		scrollableContent.loading = false
		cartSummary.loading = false

	}

	async updateQuantityByLine(line, quantity) {
		console.log('updateQuantityByLine')

		if (!line) return

		const $lineItem = this.$el.find(`#CartDrawer-Item-${line}`);

		const payload = {
			line, quantity
		};

		await this.updateQuantity($lineItem, payload)
	}

	async updateQuantityByKey(key, quantity) {
		console.log('updateQuantityByKey')

		if (!key) return

		const $lineItem = this.$el.find(`cart-item[\\:key='${key}']`);

		const payload = {
			id: key, quantity
		};

		await this.updateQuantity($lineItem, payload)
	}

	async updateQuantity($lineItem, payload) {
		console.log('updateQuantity')

		const {cartRecommendation, cartSummary, cartFooter} = this.refs

		const lineItemNode = $lineItem.get(0)

		lineItemNode.loading = true;
		cartSummary.loading = true

		this.disabled = true
		cartRecommendation.disabled = true
		cartFooter.disabled = true


		try {
			await this.updateCart(payload)

		} catch (e) {
			console.log(e)

		} finally {
			console.log('updateQuantity finally')
			lineItemNode.loading = false
			cartSummary.loading = false

			this.disabled = false
			cartRecommendation.disabled = false
			cartFooter.disabled = false
		}
	}


	getSectionsToRender() {
		return [
			{
				id: 'main-cart-items',
				section: document.getElementById('main-cart-items').dataset.id,
				selector: '.js-contents',
			},
			{
				id: 'cart-icon-bubble', section: 'cart-icon-bubble', selector: '.shopify-section'
			},
			{
				id: 'cart-live-region-text', section: 'cart-live-region-text', selector: '.shopify-section'
			},
			{
				id: 'main-cart-footer',
				section: document.getElementById('main-cart-footer').dataset.id,
				selector: '.js-contents',
			}
		];
	}

	refreshSections(state) {
		this.getSectionsToRender().forEach((section => {
			const elementToReplace = document.getElementById(section.id)
			.querySelector(section.selector) || document.getElementById(section.id);

			elementToReplace.innerHTML = this.getSectionInnerHTML(state.sections[section.section], section.selector);
		}));
	}

	getSectionInnerHTML(html, selector = ".shopify-section") {
		const el = new DOMParser()
		.parseFromString(html, 'text/html')
		.querySelector(selector)

		return el?.innerHTML ?? ""
	}
}

customElements.define('cart-items', CartItems);

class CartDrawerItems extends CartItems {

	beforeMount() {
		super.beforeMount();

		this.$el.attr('id', `CartDrawerItems`)
	}

	getSectionsToRender() {
		return [{
			id: 'shopify-section-cart-drawer-items',
			section: "cart-drawer-items",
			selector: "cart-drawer-items"
		}, {
			id: "shopify-section-cart-drawer-summary",
			section: "cart-drawer-summary",
			selector: ".summary-list",
		},

			{
				id: "shopify-section-cart-drawer-summary",
				section: "cart-drawer-summary",
				selector: "#CartTotals",
			},

			{
				id: "cart-icon-bubble", section: "cart-icon-bubble", selector: ".cart-icon-bubble"
			}, {
				id: "shopify-section-cart-drawer-header",
				section: "cart-drawer-header",
				selector: ".drawer-title-container",
			}
			// {
			// 	id: "shopify-section-cart-recommendation", section: "cart-recommendation"
			// }
		];
	}

	onDisabledChange(isDisabled) {
		super.onDisabledChange(isDisabled);

		const {allItems} = this.refs

		if (!allItems.length) return

		if (isDisabled) {
			allItems.forEach(item => item.disabled = true)
		} else {
			allItems.forEach(item => item.disabled = false)
		}
	}

	onLoad(isLoading) {
		this.$el[!!isLoading ? 'addClass' : 'removeClass']('is-loading')
	}
}

customElements.define("cart-drawer-items", CartDrawerItems);

class CartItem extends CustomElement {
	props = {
		productId: "",
		variantId: "",
		addonService: null,
		index: 0,
		itemId: 0,
		key: "",
		originalPrice: 0,
		quantity: 0,
		addonServiceFor: ""
	};

	get refs() {
		return {
			removeBtn: this.querySelector("cart-item-remove-button"),
			quantityAdjuster: this.querySelector("quantity-adjuster"), // variantSelector: this.querySelector("cart-variant-selector"),

			$cartItemProperties: this.$el.find(".cart-item-properties")
		}
	}

	mounted() {
		const {index} = this.props

		this.$el.addClass("cart-item")
		this.$el.attr('id', `CartDrawer-Item-${index + 1}`)
	}

	update(cart) {
		const {variantId} = this.props;

		const itemData = cart.items.find(({id}) => +id === +variantId)

		if (!!itemData) {
			this.renderPricing(itemData)
		} else {
			this.$el.remove()
		}
	}

	renderBundle() {
		const $bundle = this.$el.find(".cart-item-bundle");

		if (!$bundle.length) return;

		$bundle.beefup({
			trigger: ".accordion__header",
			content: ".cart-item-bundle-products",
			openSpeed: 100,
			closeSpeed: 100,
		});
	}

	renderPricing(item) {
		const {originalPrice} = this.props;
		const $originalPrice = this.$el.find('.cart-item-pricing__price--original')
		const $price = this.$el.find('.cart-item-pricing__price:not(.cart-item-pricing__price--original)')

		$originalPrice.text(currencyFormatter.format(originalPrice * item.quantity * 10))

		$price.text(currencyFormatter.format(item.final_line_price * 10))
	}

	onLoad(isLoading) {
		super.onLoad(isLoading);
		const firstLoadingOverlays = this.$el.find('loading-overlay')
		.first()
		.get(0)
	}

	onDisabledChange(isDisabled) {
		super.onDisabledChange(isDisabled);

		const {
			removeBtn, quantityAdjuster, variantSelector
		} = this.refs;

		if (!!isDisabled) {
			removeBtn.disabled = true;
			quantityAdjuster.disabled = true;
			// variantSelector.disabled = true;

		} else {
			removeBtn.disabled = false;
			quantityAdjuster.disabled = false;
			// variantSelector.disabled = false;
		}
	}
}

customElements.define('cart-item', CartItem);


class CartItemRemoveButton extends CustomButton {
	props = {
		index: 0,
	};

	onClick() {
		const {index} = this.props

		this.closest('cart-drawer-items')
		.removeByIndex(index);
	}
}

customElements.define('cart-item-remove-button', CartItemRemoveButton);




