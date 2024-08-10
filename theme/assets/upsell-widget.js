class UpsellWidget extends ProductAuxiliary {
  props = {
    trackable: true,
    eventName: "",
    variantId: 0,
    adjustablePriceGap: false,
  };

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

  beforeMount() {
    const { adjustablePriceGap } = this.props;

    if (adjustablePriceGap) {
      window.addEventListener("productPriceChange", debounce(this.renderPriceDisparity.bind(this), 100));
    }
  }

  mounted() {
    super.mounted();

    this.onVariantChange();
  }

  onVariantChange() {
    this.data = this.composeUpsellData();

    this.renderPriceDisparity();
    this.renderSize();

    this.updateTargetURL();
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

    return {
      id: targetVariant.id,
      handle: this.products.target.handle,
      size: targetSize,
      target: targetVariant,
    };
  }

  renderPriceDisparity() {
    if (!this.data) return;

    const { target } = this.data;

    const $productPrice = $("product-price");

    const { price, originalPrice } = $productPrice.data();

    const priceDisparity = parseFloat(target.price / 100) - price;

    const originalPriceDisparity = parseFloat(target.compare_at_price / 100) - originalPrice;

    if (!priceDisparity) return;

    const priceDisparityInCurrency = Currency.format(priceDisparity);

    const $priceDisparityEl = $("#upsell-price-disparity");

    $priceDisparityEl.text(`+${priceDisparityInCurrency}`);

    const $originalDisparityEl = $("#upsell-original-price-disparity");

    const originalPriceDisparityInCurrency = Currency.format(originalPriceDisparity);

    $originalDisparityEl.text(originalPriceDisparity > 0 ? `+${originalPriceDisparityInCurrency}` : "");
  }

  renderSize() {
    if (!this.data) return;

    const { size } = this.data;
    const $size = $("#upsell-product-size");

    $size.text(!!size ? ` (${size})` : "");
  }

  updateTargetURL() {
    if (!this.data) return;

    const { id, handle } = this.data;

    const $productBtn = $("upsell-widget .product-button");

    // const url = window.location.origin + `/products/${handle}`;

    const url = new URL(`${window.location.origin}/products/${handle}`);

    url.searchParams.set("variant", id);

    $productBtn.attr("href", url.toString());
  }
}

customElements.define("upsell-widget", UpsellWidget);
