class CustomElement extends HTMLElement {
  props = null

  static get observedAttributes() {
    return ['disabled'];
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
    this.$el = $(this)
    this.mutationObserver = new MutationObserver(this.onMutation.bind(this));
  }

  connectedCallback() {
    this.extractProps();
    this.init();

    this.beforeMount()
    this.render();

    setTimeout(() => {
      $(this).ready(this.mounted.bind(this))

      this.setupTooltips()
    }, 0)
  }

  disconnectedCallback() {
    this.mutationObserver.disconnect()

    this.onDestroy()
  }

  init() {
    this.$el.addClass(`${this.tagName.toLowerCase()}`)
  }

  extractProps() {
    const isObject = typeof this.props === 'object' && this.props !== null

    if (!isObject) return

    this.props = Object.entries(this.props).reduce((r, [propName, defaultValue]) => {
      let propVal


      const rawVal = this.getAttribute(`:${propName.toLowerCase()}`)

      try {
        propVal = JSON.parse(rawVal);
      } catch {
        propVal = rawVal
      }

      r[propName] = propVal || defaultValue

      return r
    }, {});

    this.value = this.getAttribute(`:value`)

    this.readOnly = this.hasAttribute('readOnly') || this.getAttribute('readOnly') === 'readOnly'
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "disabled") {
      this.disabled = newValue === 'disabled'
    }
  }

  beforeMount() {
  }

  render() {
  }

  mounted() {
  }

  setupTooltips() {}

  onMutation() {
  }

  onDestroy() {
  }

  onValueChange() {
  }

  onLoad(isLoading) {
    this.$el[!!isLoading ? 'addClass' : 'removeClass']('is-loading')

    const firstLoadingOverlays = this.$el.find('loading-overlay').first().get(0)

    if(!!firstLoadingOverlays) {
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

    this.addEventListener('click', (event) => {
      event.preventDefault();

      if (this.disabled || this.readOnly) {
        event.stopImmediatePropagation()
        return
      }

      this.onClick(event);
    });

  }

  onClick(e) {

  }
}
