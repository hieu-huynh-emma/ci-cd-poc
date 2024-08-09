import { allFulfilled, fetchMetaobjects, fetchProduct, fetchVariant } from "data-fetcher";

const CROSS_SELLING_CHANGE_EVENT = `cross-selling:variant-change`;

class CrossSellEngine extends CustomElement {
  crossSellProducts = [];
  props = {
    productId: 0,
    variantId: 0,
    trackId: "",
    sizeCompatible: false,
    mode: "Product",
    switchable: false,
  };

  constructor() {
    super();
  }

  render() {
    if (!this.crossSellProducts.length) return;

    this.$el.html(this.template());
    this.$el.removeClass("is-loading");
  }

  template() {
    return this.crossSellProducts.reduce((r, o) => r + this.renderCrossSellWidget(o), ``);
  }

  async mounted() {
    super.mounted();
    const { variantId, mode, productId } = this.props;
    console.log("=>(cross-sell-widget.js:34) mode", mode);

    if (mode === "Variant") {
      this.onVariantChange(variantId);
    } else {
      this.onProductChange(productId);
    }

    this.$el.addClass("is-mounted");
  }

  async onVariantChange(variantId) {
    this.innerHTML = `<div class="skeleton"></div>`;
    this.$el.addClass("is-loading");

    const variant = await fetchVariant(generateShopifyGid("ProductVariant", variantId));

    const metaobjectIds = variant.crossSellMetafield;

    if (!metaobjectIds) {
      this.innerHTML = ``;
      this.$el.hide();
      this.$el.removeClass("is-loading");
      return;
    }

    const metaobjects = await fetchMetaobjects(metaobjectIds);

    this.crossSellProducts = await this.composeCrossSellData(metaobjects);

    this.render();
  }

  async onProductChange(productId) {
    this.innerHTML = `<div class="skeleton"></div>`;
    this.$el.addClass("is-loading");

    const product = await fetchProduct(generateShopifyGid("Product", productId));

    const metaobjectIds = product.crossSellMetafield;

    if (!metaobjectIds.length) {
      this.innerHTML = ``;
      this.$el.hide();
      this.$el.removeClass("is-loading");
      return;
    }

    const metaobjects = await fetchMetaobjects(metaobjectIds);

    this.crossSellProducts = await this.composeCrossSellData(metaobjects);

    this.render();
  }

  composeCrossSellData(metaobjects) {
    return allFulfilled(
      metaobjects.map(async (metaobject) => {
        const variant = await fetchVariant(metaobject.variantId);
        return {
          title: metaobject.title,
          variant,
          parent: await fetchProduct(metaobject.productId || variant.product.id)
        };
      }),
    );
  }

  renderCrossSellWidget(metaobject) {
    const { trackId, switchable } = this.props;
    const {
      qty,
      variant: { id, price, originalPrice, product },
      parent,
    } = metaobject;

    const { title, displayName, handle, featuredImage } = product;

    return `<cross-sell-widget
              name="cross-sell"
              type="widget"
              id="cross-sell-${handle}"
              :eventName="cross_selling"
              data-product-id="${product.id}"
              data-variant-id="${id}"
              data-price="${price}"
              data-original-price="${originalPrice}"
              :variantId="${id}"
              data-abtasty-cross-sell
            > 
                   <script name="variant" type="application/json">${JSON.stringify(metaobject.variant)}</script>
                   <script name="parent" type="application/json">${JSON.stringify(parent)}</script>
            
                   <tracked-button :trackId="${trackId}" class="auxiliary-container">
                      <div class="widget-checkbox">
                          <input type="checkbox" class="widget-checkbox__input"/>
                      </div>
                      
                      <div class="product-details">
                        <div class="self-center">
                          <img
                            class="mx-auto h-auto"
                            src="${featuredImage}"
                            alt=""
                            width="48"
                            height="48"
                          >
                        </div>
                          <div class="product-content">
                            <p class="text-sm font-semibold">
                            ${qty > 1 ? `${qty}x ` : ""} ${displayName || title}
                            </p>
                            
                            <cross-sell-variant-selector class="${switchable ? "" : "hidden"}" :variantId="${id}"></cross-sell-variant-selector>
                            
                          </div>
                            <cross-sell-price></cross-sell-price>
                        </div>
                   </tracked-button>  
            </cross-sell-widget>
                `;
  }
}

customElements.define("cross-sell-engine", CrossSellEngine);

class CrossSellWidget extends ProductAuxiliary {
  get refs() {
    return {
      $checkboxInput: this.$el.find(".widget-checkbox__input"),
      $variantSelector: this.$el.find("cross-sell-variant-selector"),
    };
  }

  constructor() {
    super();

    this.addEventListener("change", () => {
      this.dispatchEvent(new Event(CROSS_SELLING_CHANGE_EVENT));
      this.updateMetadata()

      if(this.isIncluded) {
        window.dispatchEvent(new Event("productPriceChange"));
      }
    });
  }

  onClick(e) {
    super.onClick();

    e.preventDefault();

    const { $variantSelector, $checkboxInput } = this.refs;
    console.log("=>(cross-sell-widget.js:183) $variantSelector", $variantSelector);

    if ($variantSelector.get(0).contains(e.target)) return;

    this.isIncluded =  !$checkboxInput.is(":checked");

    $checkboxInput.prop("checked", this.isIncluded);

    window.dispatchEvent(new Event("productPriceChange"));
  }

  updateMetadata() {
    const { $variantSelector } = this.refs;
    const $selectedOption = $variantSelector.get(0).getSelected();

    this.$el.data( {
      price: $selectedOption.data("price"),
      originalPrice: $selectedOption.data("originalPrice"),
      variantId: $selectedOption.val()
    })
  }
}

customElements.define("cross-sell-widget", CrossSellWidget);

class CrossSellVariantSelector extends CustomElement {
  product = {};
  props = {
    variantId: 0,
  };

  get refs() {
    return {
      $widget: this.$el.closest("cross-sell-widget"),
    };
  }

  constructor() {
    super();

    this.product = JSON.parse(this.$el.closest("cross-sell-widget").find("script[type='application/json'][name='parent']").text());
  }

  mounted() {
    super.mounted();

    this.dispatchEvent(new Event("change", { bubbles: true }));
  }

  template() {
    const { product } = this;
    return `
       <select
          id="cross-sell-product-select-{{ product.id }}"
          data-id="{{ product.id }}"
        >
            ${product.variants.map(this.renderVariantSelectorOption.bind(this)).join("")}
        </select>
    `;
  }

  renderVariantSelectorOption(v) {
    const { variantId } = this.props;
    if (!v.available) return `<option disabled="disabled">${v.title} - Sold out</option>`;

    return `<option
        ${+variantId === +v.id ? "selected" : ""}
        data-sku="${v.sku}"
        data-price="${v.price}"
        data-original-price="${v.originalPrice}"
        value="${v.id}"
      >
        ${v.title}
      </option>`;
  }

  getSelected() {
    return this.$el.find(":selected");
  }
}

customElements.define("cross-sell-variant-selector", CrossSellVariantSelector);

class CrossSellPrice extends CustomElement {
  get refs() {
    const $widget = this.$el.closest("cross-sell-widget");
    return {
      $widget,
      $variantSelector: $widget.find("cross-sell-variant-selector"),
    };
  }

  pricing = { price, originalPrice };

  constructor() {
    super();
    const { $widget } = this.refs;
    this.variant = JSON.parse(this.$el.closest("cross-sell-widget").find("script[type='application/json'][name='variant']").text());

    $widget.on(CROSS_SELLING_CHANGE_EVENT, this.updatePrice.bind(this));
  }

  template() {
    const { price, originalPrice } = this.pricing;

    const totalSaved = Math.max(0, originalPrice - price),
      priceInCurrency = Currency.format(parseFloat(price)),
      originalPriceInCurrency = Currency.format(parseFloat(originalPrice));

    return `
        <p class="product-price-container">
            <span class="text-scarlet font-bold">${priceInCurrency}</span>
            ${totalSaved ? `<del class="line-through text-xs">${originalPriceInCurrency}</del>` : ""}
        </p>
    `;
  }

  updatePrice() {
    const { $variantSelector } = this.refs;
    const $selectedOption = $variantSelector.get(0).getSelected();

    this.pricing = {
      price: $selectedOption.data("price"),
      originalPrice: $selectedOption.data("originalPrice"),
    };

    this.render();
  }
}

customElements.define("cross-sell-price", CrossSellPrice);
