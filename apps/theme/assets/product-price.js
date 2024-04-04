class ProductPrice extends CustomElement {
  constructor() {
    super();

    window.addEventListener("productPriceChange", debounce(this.onPriceChange.bind(this), 100));
  }

  onPriceChange() {
    const price = +this.$el.find("#price").val(),
      originalPrice = +this.$el.find("#originalPrice").val() || price;


    const $crossSells = $("cross-sell-widget").filter(function () {
      return $(this).find(".widget-checkbox__input").is(":checked");
    });

    let totalCrossSellPrices = 0,
      totalCrossSellOriginalPrices = 0;

    if ($crossSells.length) {
      $crossSells.each(function () {
        const $el = $(this);
        totalCrossSellPrices += +$el.data("price");
        totalCrossSellOriginalPrices += +$el.data("originalPrice") || +$el.data("price");
      });
    }

    const finalPrice = price + totalCrossSellPrices,
      finalOriginalPrice = originalPrice + totalCrossSellOriginalPrices,
      totalSaved = Math.max(0, finalOriginalPrice - finalPrice),
      priceInCurrency = Currency.format(finalPrice, { maximumFractionDigits: finalPrice % 1 === 0 ? 0 : 2 }),
      originalPriceInCurrency = Currency.format(finalOriginalPrice, { maximumFractionDigits: finalOriginalPrice % 1 === 0 ? 0 : 2 });

    $("[data-sale-price]").text(priceInCurrency);

    $("[data-regular-price]").text(totalSaved ? originalPriceInCurrency : "");
  }
}

customElements.define("product-price", ProductPrice);
