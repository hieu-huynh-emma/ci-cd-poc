class CustomElement extends HTMLElement {
	props = null

	_data = null
	get data() {
		return this._data
	}

	set data(newVal) {
		this._data = newVal
	}

	static get observedAttributes() {
		return ['disabled', "data"];
	}

	_value = null
	get value() {
		return this._value
	}

	set value(newVal) {
		if (newVal === this._value) return
		this._value = newVal

		this.onValueChange(newVal)
	}

	_loading = false;
	get loading() {
		return this._loading
	}

	set loading(newVal) {
		if (newVal === this._loading) return
		this._loading = newVal
		this.onLoad(newVal)
	}

	_disabled = false;
	get disabled() {
		return this._disabled
	}

	set disabled(isDisabled) {
		if (isDisabled === this._disabled) return
		this._disabled = isDisabled
		this.onDisabledChange(isDisabled)
	}

	_readOnly = false;
	get readOnly() {
		return this._readOnly
	}

	set readOnly(isReadOnly) {
		if (isReadOnly === this._readOnly) return
		this._readOnly = isReadOnly
		this.onReadOnlyChanged(isReadOnly)
	}


	constructor() {
		super();
		this.$el = $(this);
		this.setup()
	}

	connectedCallback() {
		this.extractProps();
		this.init();

		this.beforeMount()
		this.render();

		setTimeout(() => {
			$(this).ready(this.mounted.bind(this))
		}, 0)
	}

	disconnectedCallback() {
		this.mutationObserver?.disconnect()

		this.onDestroy()
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this[name] = this.parseProp(newValue)

		this.render()
	}

	setup() {
		this.mutationObserver = new MutationObserver(this.onMutation.bind(this));
	}

	init() {
		this.$el.addClass(`${this.tagName.toLowerCase()}`)
	}

	extractProps() {
		const isObject = typeof this.props === 'object' && this.props !== null

		if (!isObject) return

		this.props = Object.entries(this.props).reduce((r, [propName, defaultValue]) => {

			const rawVal = this.getAttribute(`:${propName.toLowerCase()}`)

			const propVal = this.parseProp(rawVal)

			r[propName] = propVal || defaultValue

			return r
		}, {});

		this.value = this.getAttribute(`:value`)

		this.readOnly = this.hasAttribute('readOnly') || this.getAttribute('readOnly') === 'readOnly'
	}

	parseProp(rawVal) {
		let val

		try {
			val = JSON.parse(rawVal);
		} catch {
			val = rawVal
		}
		return val
	}


	beforeMount() {
	}

	template() {

	}

	render() {
		if (this.template()) {
			this.innerHTML = this.template();

			this.onUpdated();
		}
	}

	mounted() {
	}

	onUpdated() {}

	onMutation() {
	}

	onDestroy() {
	}

	onValueChange() {
	}

	onLoad(isLoading) {
		this.$el[!!isLoading ? 'addClass' : 'removeClass']('is-loading')

		const firstLoadingOverlays = this.$el.find('loading-overlay').first().get(0)

		if (!!firstLoadingOverlays) {
			firstLoadingOverlays[isLoading ? 'show' : 'hide']()
		}
	}

	onDisabledChange(isDisabled) {
		if (!!isDisabled) {
			this.$el.attr('disabled', 'disabled')
		} else {
			this.$el.removeAttr('disabled')
		}
	}

	onReadOnlyChanged(isReadOnly) {
		this.$el[!!isReadOnly ? 'attr' : 'removeAttr']('readOnly', 'readOnly')
	}
}

class CustomButton extends CustomElement {
	constructor() {
		super();
	}

	setup() {
		super.setup();

		this.addEventListener('click', (event) => {
			event.preventDefault();

			if (this.disabled || this.readOnly) {
				event.stopImmediatePropagation()
				return
			}

			this.onClick(event);
		});

		this.$el.addClass("cursor-pointer")
	}

	onClick(e) {
	}
}

class ResponsiveComponent extends CustomElement {
	props = {}

	_isMobile = null;
	get isMobile() {
		return this._isMobile
	}

	set isMobile(isMobile) {
		if (isMobile === this._isMobile) return
		this._isMobile = isMobile

		this.onLayoutModeChange(isMobile)
	}

	constructor() {
		super()
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this.resizeObserver?.disconnect()
	}


	setup() {
		super.setup();

		this.resizeObserver = new ResizeObserver(debounce(this.onScreenResize.bind(this), 500));

		this.templates = [...this.querySelectorAll("template")].reduce((r, node) => {
			r[node.getAttribute('name')] = node.content
			return r
		}, {})
	}

	beforeMount() {
		super.beforeMount();

		this.resizeObserver.observe(document.body);
	}


	render() {
		if (this.isMobile === null) return

		const tpl = this.templates[this.isMobile ? 'mobile' : 'desktop']

		this.$el.html(tpl.cloneNode(true))
	}

	onScreenResize(entries) {
		const [entry] = entries

		const screenWidth = entry.contentRect.width

		this.isMobile = screenWidth <= 769
	}

	onLayoutModeChange(isMobile) {
		if (isMobile) {
			this.$el.addClass('mobile').removeClass('desktop')
		} else {
			this.$el.removeClass('mobile').addClass('desktop')
		}

		this.render();
	}
}

customElements.define('responsive-component', ResponsiveComponent);


class ShadowElement extends CustomElement {
	template

	constructor() {
		super();

	}

	connectedCallback() {
		this.extractProps();
		this.init();

		this.beforeMount()
		this.render();

		setTimeout(() => {
			$(this).ready(this.mounted.bind(this))
		}, 0)
	}

	beforeMount() {
		this.slots = this.$el.find("[slot]").toArray().reduce(function (r, slot, i) {
			const $slot = $(slot)
			const slotName = $slot.attr('slot')

			r[slotName] = $slot
			return r
		}, {});
	}

	render() {
		if (!this.template) return

		this.$el.html(this.template.innerHTML);

		this.renderSlots();

	}

	renderSlots() {
		Object.entries(this.slots).forEach(([name, $slot]) => {
			const $outlet = this.$el.find(`slot[name="${name}"]`)

			if ($outlet.length) {
				$outlet.replaceWith($slot)
			}
		})
	}

}
