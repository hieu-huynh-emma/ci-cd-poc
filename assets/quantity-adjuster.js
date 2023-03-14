class QuantityAdjusterButton extends CustomButton {
  props = {
    size: null,
    name: ""
  };

  render() {
    const { name, size } = this.props

    const template = `
        <svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          ${name === 'plus'
      ? `
                <path
                  d="M10.0003 18.3337C14.6027 18.3337 18.3337 14.6027 18.3337 10.0003C18.3337 5.39795 14.6027 1.66699 10.0003 1.66699C5.39795 1.66699 1.66699 5.39795 1.66699 10.0003C1.66699 14.6027 5.39795 18.3337 10.0003 18.3337Z"
                  stroke="#2E2F3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                />
                <path d="M10 6.66699V13.3337" stroke="#2E2F3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M6.66699 10H13.3337" stroke="#2E2F3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />`
      : `
              <path
                d="M10.0003 18.3337C14.6027 18.3337 18.3337 14.6027 18.3337 10.0003C18.3337 5.39795 14.6027 1.66699 10.0003 1.66699C5.39795 1.66699 1.66699 5.39795 1.66699 10.0003C1.66699 14.6027 5.39795 18.3337 10.0003 18.3337Z"
                stroke="#2E2F3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
              />
              <path d="M6.66699 10H13.3337" stroke="#2E2F3C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            `
    }
      </svg>
    `;

    this.$el.html(template)
  }

  onDisabledChange(isDisabled) {
    this.$el[!!isDisabled ? 'addClass' : 'removeClass']('is-disabled')
  }
}

customElements.define('quantity-adjuster-button', QuantityAdjusterButton);


class QuantityAdjuster extends CustomElement {
  props = {
    index: 0,
    size: 12,
    min: null,
    max: null,
    inventoryPolicy: ""
  };

  get refs() {
    return {
      minusBtn: this.querySelector(`quantity-adjuster-button[\\:name=minus]`),
      plusBtn: this.querySelector(`quantity-adjuster-button[\\:name=plus]`)
    }
  }

  beforeMount() {
    const { index } = this.props

    this.changeEvent = new Event('change', { bubbles: true })

    this.$el.addClass("quantity-adjuster")
    this.$el.attr('id', `Drawer-quantity-${index + 1}`)
    this.$el.attr('name', "updates[]")
    this.$el.attr('data-index', index + 1)
  }

  mounted() {
    this.$val = this.$el.find('.quantity-adjuster__value');

    this.checkThreshold(this.value)

    this.$el.find('quantity-adjuster-button').click((e => {
      e.preventDefault();

      this.onButtonClick($(e.currentTarget))
    }))

    tippy('quantity-adjuster-button.is-disabled[\\:name=plus]', {
      content: "Out of stock",
    });
  }

  onValueChange(val) {
    const isExceed = this.checkThreshold(val)

    if (isExceed) return

    this.$val?.text(val);
  }

  checkThreshold(val) {
    const { min, max, inventoryPolicy } = this.props;
    const { minusBtn, plusBtn } = this.refs

    if (!minusBtn || !plusBtn) return

    if (inventoryPolicy === 'continue') return true

    const minThresholdExceed = isNumber(min) && val <= min
    const maxThresholdExceed = isNumber(max) && val >= max

    minusBtn.disabled = !!minThresholdExceed
    plusBtn.disabled = !!maxThresholdExceed

    if (minThresholdExceed || maxThresholdExceed) {
      this.value = Math.min(Math.max(val, min), max)

      return false
    }

    return true
  }

  render() {
    const { size } = this.props

    const template = `
        <quantity-adjuster-button :name="minus" :size="${size}"></quantity-adjuster-button>
        <p class="quantity-adjuster__value">${this.value}</p>
        <quantity-adjuster-button :name="plus" :size="${size}"></quantity-adjuster-button>
    `;

    this.$el.html(template)
  }

  onButtonClick($button) {
    const previousValue = this.$val.text();

    this.value = $button.attr(':name') === 'plus' ? +this.value + 1 : +this.value - 1;

    if (+previousValue !== +this.value) this.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-adjuster', QuantityAdjuster);
