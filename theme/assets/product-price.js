class ProductPrice extends CustomElement {
  defaultPrice = {};

  constructor() {
    super();

    window.addEventListener("productPriceChange", debounce(this.onPriceChange.bind(this), 100));
  }

  mounted() {
    super.mounted();

    this.defaultPrice = this.computePrice();
    this.updateMetadata(this.defaultPrice);
  }

  onPriceChange() {
    let priceData = null;

    const $crossSells = $("cross-sell-widget").filter(function() {
      return $(this).find(".widget-checkbox__input").is(":checked");
    });

    if ($crossSells.length) {
      priceData = this.computeCrossSell($crossSells);
    }

    const $bundleCrossSell = $("bundle-cross-sell").filter(function() {
      return $(this).find("#offer-switch").is(":checked");
    });


    if ($bundleCrossSell.length) {
      priceData = this.computeBundleCrossSell($bundleCrossSell);
    }

    const finalPrice = priceData || this.defaultPrice;

    this.renderPriceTag(finalPrice);
    console.log("jskdlf");
    this.updateMetadata(finalPrice);
  }

  computePrice() {
    const price = +this.$el.find("#price").val();

    const originalPrice = +this.$el.find("#originalPrice").val() || price;

    return {
      price,
      originalPrice,
    };
  }

  computeCrossSell($crossSells) {
    let totalCrossSellPrices = 0,
      totalCrossSellOriginalPrices = 0;

    if ($crossSells.length) {
      $crossSells.each(function() {
        const $el = $(this);
        totalCrossSellPrices += +$el.data("price");
        totalCrossSellOriginalPrices += +$el.data("originalPrice") || +$el.data("price");
      });
    }

    const finalPrice = this.defaultPrice.price + totalCrossSellPrices,
      finalOriginalPrice = this.defaultPrice.originalPrice + totalCrossSellOriginalPrices;

    return {
      price: finalPrice,
      originalPrice: finalOriginalPrice,
    };
  }

  computeBundleCrossSell($bundleCrossSell) {
    const productSize = $(`select[name="options[Size]"]`).val().split("|")[0].trim();
    const bundleCrossSellData = JSON.parse($bundleCrossSell.find(`script#BundleCrossSell-JSON`).text());
    const bundleVariant = bundleCrossSellData.variants.find((variant) => variant.title.includes(productSize));

    const bundleOriginalPrice = bundleVariant.compare_at_price / 100,
      bundlePrice = bundleVariant.price / 100;

    return {
      price: bundlePrice,
      originalPrice: bundleOriginalPrice,
    };
  }

  renderPriceTag({
                   price,
                   originalPrice,
                 }) {

    const totalSaved = Math.max(0, originalPrice - price),
      priceInCurrency = Currency.format(price, { maximumFractionDigits: price % 1 === 0 ? 0 : 2 }),
      originalPriceInCurrency = Currency.format(originalPrice, { maximumFractionDigits: originalPrice % 1 === 0 ? 0 : 2 });

    this.$el.find("[data-sale-price]").text(priceInCurrency);

    this.$el.find("[data-regular-price]").text(totalSaved ? originalPriceInCurrency : "");
  }

  updateMetadata(pricing) {
    console.log("=>(product-price.js:98) pricing", pricing);
    this.$el.data({
      price: pricing.price,
      originalPrice: pricing.originalPrice,
    });
  }
}

customElements.define("product-price", ProductPrice);
