import CrossSell from "cross-sell";
import { CROSS_SELLING_CHANGE_EVENT } from "data-constants";


class CrossSellPanel extends CrossSell.Manager {
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

  template() {
    const { trackId, switchable } = this.props;

    return this.crossSellProducts.reduce((r, metaobject) => {
      const {
        qty,
        variant: { id, price, originalPrice, product },
        parent,
      } = metaobject;

      const { title, displayName, handle, featuredImage } = product;

      return r += `<cross-sell-widget
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
            </cross-sell-widget>`;
    }, ``);
  }

  beforeMount() {
    const { mode } = this.props;

    (mode === "Variant") && this.listenToParent();
  }

  mounted() {
    super.mounted();

    const { variantId, mode, productId } = this.props;

    const initialId = (mode === "Variant") ? variantId : productId;

    this.onChange(initialId);
  }

  async update(entityId) {
    const { mode } = this.props;
    const { entries } = (await ((mode === "Variant") ? CrossSell.API.perVariant(entityId) : CrossSell.API.perProduct(entityId)));

    this.crossSellProducts = entries;
  }
}

customElements.define("cross-sell-panel", CrossSellPanel);

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
      this.updateMetadata();

      if (this.isIncluded) {
        window.dispatchEvent(new Event("productPriceChange"));
      }
    });
  }

  onClick(e) {
    super.onClick();

    e.preventDefault();

    const { $variantSelector, $checkboxInput } = this.refs;

    if ($variantSelector.get(0).contains(e.target)) return;

    this.isIncluded = !$checkboxInput.is(":checked");

    $checkboxInput.prop("checked", this.isIncluded);

    window.dispatchEvent(new Event("productPriceChange"));
  }

  updateMetadata() {
    const { $variantSelector } = this.refs;
    const $selectedOption = $variantSelector.get(0).getSelected();

    this.$el.data({
      price: $selectedOption.data("price"),
      originalPrice: $selectedOption.data("originalPrice"),
      variantId: $selectedOption.val(),
    });
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
