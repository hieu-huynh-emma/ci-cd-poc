class UpsellWidget extends ProductAuxiliary {
  products = {
    current: {},
    target: {},
  };

  get refs() {
    return {};
  }

  constructor() {
    super();

    window.addEventListener("productVariantChange", debounce(this.onVariantChange.bind(this), 100));

    this.products.target = JSON.parse(this.querySelector(`script[type="application/json"]`).textContent);
    this.products.current = JSON.parse(document.querySelector(`[id^="ProductJson-"]`).textContent);
  }

  mounted() {
    super.mounted();

    this.onVariantChange();
  }

  onVariantChange() {
    const data = this.composeUpsellData();
    console.log("=>(upsell-widget.js:28) data", data);

    this.renderPriceDisparity(data);
    this.renderSize(data);

    this.updateTargetURL(data);
  }

  composeUpsellData() {
    const currentVariantId = +$(".product-form__variants option:selected").val();

    const variant = this.products.current.variants.find(({ id }) => id === currentVariantId);

    if (!variant) return;

    const currentSize = variant.title.split("|")[0].trim();

    const targetVariant = this.products.target.variants.find(({ title }) => {
      const targetSize = title.split("|")[0].trim();
      return targetSize === currentSize;
    });

    if (!targetVariant) return;

    const priceDisparity = targetVariant.price - variant.price;
    const originalPriceDisparity = targetVariant.compare_at_price - variant.compare_at_price;

    return {
      id: targetVariant.id,
      handle: this.products.target.handle,
      size: currentSize,
      priceDisparity,
      originalPriceDisparity,
    };
  }

  renderPriceDisparity(data = {}) {
    const { priceDisparity, originalPriceDisparity } = data;
    if (!priceDisparity) return;

    const priceDisparityInCurrency = Currency.format(parseFloat(priceDisparity / 100));
    const originalPriceDisparityInCurrency = Currency.format(parseFloat(originalPriceDisparity / 100));

    const $priceDisparityEl = $("#upsell-price-disparity");

    $priceDisparityEl.text(`+${priceDisparityInCurrency}`);

    const $originalDisparityEl = $("#upsell-original-price-disparity")

    $originalDisparityEl.text(`+${originalPriceDisparityInCurrency}`)
  }

  renderSize(data) {
    const { size } = data;
    const $size = $("#upsell-product-size");

    $size.text(!!size ? ` (${size})` : "");
  }

  updateTargetURL(data) {
    if (!data) return;

    const { id, handle } = data;

    const $productBtn = $("upsell-widget .product-button");

    // const url = window.location.origin + `/products/${handle}`;

    const url = new URL(`${window.location.origin}/products/${handle}`);

    url.searchParams.set("variant", id);

    $productBtn.attr("href", url.toString());
  }
}

customElements.define("upsell-widget", UpsellWidget);
