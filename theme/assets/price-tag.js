class PriceTag extends CustomElement {
  template = null

  constructor() {
    super()
  }

  render() {
    if (!this.data) return

    const { originalPrice, price, totalSaved, available } = this.data;

    if (!available) {
      this.$el.html(window.variantStrings.soldOut)
      return
    }


    const priceInCurrency = Currency.format(parseFloat(price)),
      originalPriceInCurrency = Currency.format(parseFloat(originalPrice));

    this.$el.html(`
      <span class="price-tag__price font-bold">${priceInCurrency}</span>
    `)

    if (totalSaved) {
      this.$el.append(`<del class="price-tag__original-price">${originalPriceInCurrency}</del>`)
    }
  }
}

customElements.define("price-tag", PriceTag);


