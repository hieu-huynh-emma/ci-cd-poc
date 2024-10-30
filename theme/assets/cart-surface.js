class CartIconBubble extends CustomButton {
	async setupTooltips() {
		await ResourceCoordinator.requestVendor('Tippy');

		tippy('cart-icon-bubble', {
			content: "Loading... Please Wait",
			onShow(instance) {
				const $el = $(instance.reference)

				return !!$el.hasClass('is-loading')
			},
		});
	}

	mounted() {
		super.mounted();

		$(window).on("complete", this.setupTooltips)
	}

	onLoad(isLoading) {
		super.onLoad(isLoading);

		this.disabled = !!isLoading
	}

	onDisabledChange(isDisabled) {
		this.$el[!!isDisabled ? 'addClass' : 'removeClass']('is-disabled')
	}
}

customElements.define('cart-icon-bubble', CartIconBubble);

class CartSurface extends CustomElement {

	isInitialized

	resources = {
		stylesheets: ['cart-drawer.css', "cart-recommendation.css"],
		scripts: ['cart.js', 'cart-drawer.js', 'cart-item.js', 'quantity-adjuster.js']
	}

	constructor() {
		super();
	}

	mounted() {
		super.mounted();

		this.querySelector("#CartDrawer-Overlay").addEventListener(
			"click",
			this.close.bind(this)
		);

		this.addEventListener(
			"keyup",
			(evt) => evt.code === "Escape" && this.close()
		);

		this.setCartIconBubbleAccessibility();
		this.setCloseIconAccessibility();
	}

	get refs() {
		return {
			cartIconBubble: document.getElementById('cart-icon-bubble'),
			closeIcon: document.getElementById('CartDrawer-Close'),
			cartSkeleton: document.getElementById('CartDrawer-Skeleton'),
			cartMarkup: document.getElementById('CartDrawer-Markup'),
			cartDrawer: document.getElementById('CartDrawer')
		}
	}

	async open(triggeredBy) {

		if (triggeredBy) this.setActiveElement(triggeredBy);

		setTimeout(() => {
			this.classList.add("animate", "active");
			this.querySelector("#CartDrawer-Frame").classList.add("animate", "active");
		});

		this.addEventListener(
			"transitionend",
			() => {
				const containerToTrapFocusOn = document.getElementById("CartDrawer-Crust");
				const focusElement =
					this.querySelector("#CartDrawer") || this.querySelector("#CartDrawer-Close");
				trapFocus(containerToTrapFocusOn, focusElement);
			},
			{once: true}
		);

		document.body.classList.add("no-scroll");

		await this.prepare();
	}

	close() {
		this.classList.remove("animate", "active");
		this.querySelector("#CartDrawer-Frame").classList.remove("animate", "active");
		removeTrapFocus(this.activeElement);
		document.body.classList.remove("no-scroll");
	}

	async prepare() {
		this.loading = true
		const isLoaded = (typeof CartDrawer === 'function');

		if (!isLoaded) {
			await ResourceCoordinator.requestVendor('Toastr');

			await this.loadCartDrawer();
		}

		this.loading = false
	}

	async loadCartDrawer() {
		await ResourceCoordinator.requestVendor("Swiper")

		await this.loadStyleSheets()

		const result = await fetch(window.location.pathname + "?sections=" + this.getSectionsToRender().join(','))
		.then(res => res.json());

		this.renderContents(result);

		await this.loadScripts();

		$("#CartDrawer-Frame .cart-drawer-skeleton").remove()
	}

	renderContents(parsedState) {
		this.getSectionsToRender().forEach(section => {
			const sectionElement = document.getElementById(section + "-placeholder");

			$(sectionElement).replaceWith(parsedState[section])
		})
	}

	getSectionsToRender() {
		return ["cart-drawer-empty", "cart-drawer-items", "cart-recommendation", "cart-drawer-summary", "cart-customer-support"];
	}

	getCartPartsToRender() {
		return [
			{
				id: 'shopify-section-cart-drawer-items',
				section: "cart-drawer-items",
				selector: "cart-drawer-items"
			},
			{
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
				id: "cart-icon-bubble",
				section: "cart-icon-bubble",
				selector: ".cart-icon-bubble"
			},
			{
				id: "shopify-section-cart-drawer-header",
				section: "cart-drawer-header",
				selector: ".drawer-title-container",
			}
			// {
			// 	id: "shopify-section-cart-recommendation",
			// 	section: "cart-recommendation"
			// }
		];
	}


	async loadStyleSheets() {
		await Promise.allSettled(this.resources.stylesheets.map(url => $.getStylesheet(Shop.assetUrl + url)))
	}

	async loadScripts() {
		await Promise.allSettled(this.resources.scripts.map(url => $.getScript(Shop.assetUrl + url)))
	}

	setCartIconBubbleAccessibility() {
		const {cartIconBubble} = this.refs

		cartIconBubble.addEventListener("click", (event) => {
			event.preventDefault();
			this.open(cartIconBubble);
		});
		cartIconBubble.addEventListener("keydown", (event) => {
			if (event.code.toUpperCase() === "SPACE") {
				event.preventDefault();
				this.open(cartIconBubble);
			}
		});

		cartIconBubble.disabled = false
	}

	setCloseIconAccessibility() {
		const {closeIcon} = this.refs;

		closeIcon.addEventListener("click", (event) => {
			event.preventDefault();
			this.close()
		});
	}

	setActiveElement(element) {
		this.activeElement = element;
	}


}

customElements.define('cart-surface', CartSurface);
