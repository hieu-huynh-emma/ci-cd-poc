class LoadingOverlay extends HTMLElement {
  props = {
    type: "spinner",
  }

  constructor() {
    super();

    this.$el = $(this)
  }


  connectedCallback() {
    this.render()
  }
  render() {
    const { type } = this.props


    const allTypes = {
      'spinner': this.renderSpinner()
    }

    const template = allTypes[type || 'spinner']

    this.$el.html(template)
  }

  renderSpinner() {
    return `
      <svg
        aria-hidden="true" focusable="false" role="presentation" class="spinner" viewBox="0 0 66 66"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
      </svg>
    `
  }

  show() {
    this.$el.removeClass('hidden')
  }

  hide() {
    this.$el.addClass('hidden')
  }
}

customElements.define("loading-overlay", LoadingOverlay);
