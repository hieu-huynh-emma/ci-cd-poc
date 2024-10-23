if (!customElements.get("variant-selector")) {
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

    beforeMount() {
      // Hide if product has only default variant
      if (this.props.options.length === 1) this.remove()
    }

    template() {
      const { value, options } = this.props

      return `<select>
      ${options.map(this.renderOption.bind(this, value)).join("")}
    </select>`
    }

    renderOption(value, o) {
      const price = o.price / 100,
        originalPrice = o.compare_at_price / 100;

      return `<option
                ${value === o.id ? 'selected' : ""}
                ${o.available ? "" : "disabled"}
                data-price="${price}"
                data-original-price="${originalPrice}"
                data-sku="${o.sku}"
                value="${o.id}"
            >
              ${o.title}${o.available ? "" : `- ${window.variantStrings.soldOut}`}
            </option>
    `
    }

    async mounted() {
      const { $select } = this.refs

      $select.change(this.handleSelectVariant.bind(this));

      $select.trigger('change');

      // await ResourceCoordinator.requestVendor('Select2');

      // $select.select2({
      //   minimumResultsForSearch: -1,
      //   dropdownAutoWidth: true,
      //   width: 'auto'
      // });

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

  customElements.define("variant-selector", VariantSelector);

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

  customElements.define("cart-variant-selector", CartVariantSelector);
}


