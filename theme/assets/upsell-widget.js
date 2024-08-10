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

    const isJointProduct = $("joint-product-engine").length;

    if (isJointProduct) {
      const jointProductData = JSON.parse(document.querySelector(`#joint-product-data`).textContent);
      const jointProductUpsellData = JSON.parse(document.querySelector(`#joint-product-upsell-data`).textContent);

      const activeIndex = $("joint-product-engine").get(0).activeIndex;

      this.products.target = jointProductUpsellData[activeIndex];
      this.products.current = jointProductData[activeIndex];
    } else {
      this.products.target = JSON.parse(this.querySelector(`script[type="application/json"]`).textContent);
      this.products.current = JSON.parse(document.querySelector(`[id^="ProductJson-"]`).textContent);
    }
  }

  mounted() {
    super.mounted();

    this.onVariantChange();
  }

  onVariantChange() {
    const data = this.composeUpsellData();

    this.renderPriceDisparity(data);
    this.renderSize(data);

    this.updateTargetURL(data);
  }

  composeUpsellData() {
    const currentVariantId = +$(".product-form__variants option:selected").val();

    const variant = this.products.current.variants.find(({ id }) => id === currentVariantId);

    if (!variant) return;

    const hasOnlyDefaultVariant = this.products.current.variants.length === 1;

    const currentSize = variant.title.split("|")[0].trim().split("/")[0].trim();

    const targetVariant = hasOnlyDefaultVariant ? this.products.target.variants[0] : this.products.target.variants.find(({ title }) => title.includes(currentSize));

    if (!targetVariant) return;

    const targetSize = targetVariant.title.split("|")[0].trim();

    const priceDisparity = targetVariant.price - variant.price;

    const originalPriceDisparity = targetVariant.compare_at_price - variant.compare_at_price;

    return {
      id: targetVariant.id,
      handle: this.products.target.handle,
      size: targetSize,
      priceDisparity,
      originalPriceDisparity,
    };
  }

  renderPriceDisparity(data = {}) {
    const { priceDisparity, originalPriceDisparity } = data;
    if (!priceDisparity) return;

    const priceDisparityInCurrency = Currency.format(parseFloat(priceDisparity / 100));

    const $priceDisparityEl = $("#upsell-price-disparity");

    $priceDisparityEl.text(`+${priceDisparityInCurrency}`);

    const $originalDisparityEl = $("#upsell-original-price-disparity");

    const originalPriceDisparityInCurrency = Currency.format(parseFloat(originalPriceDisparity / 100));

    $originalDisparityEl.text(originalPriceDisparity > 0 ? `+${originalPriceDisparityInCurrency}` : "");
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
