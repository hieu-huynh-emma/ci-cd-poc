class VariantSelector extends CustomElement {
  props = {
    value: null,
    options: []
  };

  constructor() {
    super();

    this.changeEvent = new Event('change')
  }

  get refs() {
    return {
      $select: this.$el.find('select')
    }
  }

  render() {
    const { value, options } = this.props

    const availOptions = options.filter(({ available }) => !!available);

    const template = `
    <select>
      ${availOptions.map(o => `<option ${value === o.id ? 'selected' : ""} data-price="${o.price / 100}" data-original-price="${o.compare_at_price / 100}" data-sku="${o.sku}" value="${o.id}">${o.title}</option>`).join("")}
    </select>`

    this.innerHTML = template
  }

 async mounted() {
    const { $select } = this.refs

    $select.change(this.handleSelectVariant.bind(this));

   await ResourceCoordinator.requestVendor('Select2');

   $select.select2({
      minimumResultsForSearch: -1,
      dropdownAutoWidth: true,
      width: 'auto'
    });

  }

  onDisabledChange(isDisabled) {
    super.onDisabledChange(isDisabled);

    const { $select } = this.refs

    $select.attr('disabled', !!isDisabled)
  }

  handleSelectVariant(e) {
    this.dispatchEvent(this.changeEvent);
  }
}

customElements.define('variant-selector', VariantSelector);


class CartVariantSelector extends VariantSelector {
  props = {
    value: null,
    options: [],
    quantity: 0,
    key: 0
  };

  async handleSelectVariant(e) {
    super.handleSelectVariant(e);

    const { key, quantity } = this.props

    const $selectedOption = $(this).find(':selected')
    const variantId = $selectedOption.val()


    await this.closest('cart-drawer-items').switchVariant(variantId, quantity, key);
  }

}

customElements.define('cart-variant-selector', CartVariantSelector);
