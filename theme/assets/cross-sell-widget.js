import CrossSell from "./cross-sell.js";
import {CROSS_SELLING_CHANGE_EVENT, METAFIELD} from "./data-constants.js";


class CrossSellPanel extends CrossSell.Manager {
    props = {
        version: 1,
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
        const {trackId, switchable, version} = this.props;

        if (+version === 2) {
            return this.crossSellProducts.reduce((r, metaobject) => {
                const {
                    qty,
                    variant: {id, price, title: variantTitle, originalPrice, product, available},
                    parent,
                } = metaobject;

                const {title, displayName, handle, featuredImage, hasOnlyDefaultVariant, metafields} = product;

                const promotionText = metafields?.cross_selling_promotion_text;
                const promotionBadge = metafields?.cross_selling_promotion_badge;

                if (!available) return r;

                return r += `<cross-sell-widget
              :version="2"
              variant="advanced"
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
                       <div class="postitive self-center">
                            ${!!promotionBadge ? `<div slot="badge">
                                ${promotionBadge}
                            </div>` : ""}
                       
                          <img
                            class="w-full"
                            src="${featuredImage}"
                            alt=""
                            width="48"
                            height="48"
                          >
                        </div>
                  
                       <div class="product-content">
                            ${!!promotionText ? `
                                 <div slot="top-promotion-text" class="text-primary">
                                      <svg fill="currentColor" width="18" height="18" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"  viewBox="0 0 352.8 352.8" xml:space="preserve">
                                        <g  transform="translate(9.5 9.5)">
                                            <path d="M174.1,343.3c-12.5,0-24.2-4.8-33-13.6c0,0,0,0-0.1-0.1L-5.9,182.9c-2.3-2.3-3.7-5.5-3.7-8.8V3   C-9.5-3.9-3.9-9.5,3-9.5h171c3.3,0,6.5,1.3,8.8,3.7l146.9,146.9c18.1,18.2,18.1,47.7,0,65.9c0,0,0,0,0,0L207.1,329.6   C198.3,338.4,186.6,343.3,174.1,343.3C174.1,343.3,174.1,343.3,174.1,343.3z M158.7,311.9C158.7,312,158.8,312,158.7,311.9   c4.1,4.1,9.6,6.4,15.3,6.4c0,0,0,0,0,0c5.8,0,11.2-2.3,15.3-6.4l122.6-122.6c8.4-8.4,8.4-22.2,0-30.6L168.8,15.5H15.5v153.3   L158.7,311.9C158.7,311.9,158.7,311.9,158.7,311.9z M320.9,198.1L320.9,198.1L320.9,198.1z"/>
                                            <path d="M88.5,101c-0.4,0-0.8,0-1.2-0.1c-0.4,0-0.8-0.1-1.2-0.2c-0.8-0.2-1.6-0.4-2.3-0.7c-0.8-0.3-1.5-0.7-2.2-1.2   c-0.3-0.2-0.7-0.5-1-0.7c-0.3-0.3-0.6-0.5-0.9-0.8c-0.3-0.3-0.6-0.6-0.8-0.9c-0.3-0.3-0.5-0.6-0.7-1c-0.4-0.7-0.8-1.4-1.1-2.1   c-0.3-0.8-0.5-1.5-0.7-2.3c-0.1-0.4-0.1-0.8-0.2-1.2c0-0.4-0.1-0.8-0.1-1.2c0-0.4,0-0.8,0.1-1.2c0-0.4,0.1-0.8,0.2-1.2   c0.2-0.8,0.4-1.6,0.7-2.3c0.3-0.8,0.7-1.5,1.1-2.2c0.2-0.3,0.5-0.7,0.7-1c0.3-0.3,0.5-0.6,0.8-0.9c0.3-0.3,0.6-0.6,0.9-0.8   c0.3-0.3,0.6-0.5,1-0.7c0.7-0.4,1.4-0.8,2.2-1.1c0.8-0.3,1.5-0.5,2.3-0.7c0.4-0.1,0.8-0.1,1.2-0.2c0.8-0.1,1.6-0.1,2.5,0   c0.4,0,0.8,0.1,1.2,0.2c0.8,0.2,1.6,0.4,2.3,0.7c0.8,0.3,1.5,0.7,2.2,1.1c0.3,0.2,0.7,0.5,1,0.7c0.3,0.3,0.6,0.5,0.9,0.8   c0.3,0.3,0.6,0.6,0.8,0.9c0.3,0.3,0.5,0.6,0.7,1c0.4,0.7,0.8,1.4,1.1,2.2c0.3,0.8,0.5,1.5,0.7,2.3c0.1,0.4,0.1,0.8,0.2,1.2   c0,0.4,0.1,0.8,0.1,1.2c0,0.4,0,0.8-0.1,1.2c0,0.4-0.1,0.8-0.2,1.2c-0.2,0.8-0.4,1.6-0.7,2.3c-0.3,0.8-0.7,1.5-1.1,2.1   c-0.2,0.3-0.5,0.7-0.7,1c-0.2,0.3-0.5,0.6-0.8,0.9c-0.3,0.3-0.6,0.6-0.9,0.8c-0.3,0.3-0.6,0.5-1,0.7c-0.7,0.5-1.4,0.8-2.2,1.2   c-0.8,0.3-1.5,0.5-2.3,0.7c-0.4,0.1-0.8,0.1-1.2,0.2C89.3,101,88.9,101,88.5,101z"/>
                                        </g>
                                      </svg>
                                     <div class="rtf-viewer">
                                       ${promotionText}
                                     </div>
                                 </div>
                            ` : ""
                }
                            <p slot="product-title" class="font-semibold">
                                ${qty > 1 ? `${qty}x ` : ""} ${displayName || title}
                            </p>
                            
                            ${hasOnlyDefaultVariant ? "" : `
                                <p slot="variant-title">${variantTitle}</p>
                            `}
                            
                            <cross-sell-variant-selector class="${switchable ? "" : "hidden"}" :variantId="${id}"></cross-sell-variant-selector>
                            
                       </div>
                       
                       <div class="widget-cta">
                          <input type="checkbox" class="checkbox-input"/>
                          
                          <cross-sell-price></cross-sell-price>
                          
                          <button slot="add-button" type="button">
                            <svg slot="check-icon" fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 448 512">
                            <path d="M438.6 105.4C451.1 117.9 451.1 138.1 438.6 150.6L182.6 406.6C170.1 419.1 149.9 419.1 137.4 406.6L9.372 278.6C-3.124 266.1-3.124 245.9 9.372 233.4C21.87 220.9 42.13 220.9 54.63 233.4L159.1 338.7L393.4 105.4C405.9 92.88 426.1 92.88 438.6 105.4H438.6z"/>
                            </svg>
                            <span slot="add-text">Add</span>
                            <span slot="added-text">Added</span>
                          </button>
                          
                     
                      </div>
                   </tracked-button>  
            </cross-sell-widget>`;
            }, ``);
        }

        return this.crossSellProducts.reduce((r, metaobject) => {
            const {
                qty,
                variant: {id, price, originalPrice, product, available},
                parent,
            } = metaobject;

            const {title, displayName, handle, featuredImage} = product;

            if (!available) return r;

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
        const {mode} = this.props;

        (mode === "Variant") && this.listenToParent();
    }

    mounted() {
        super.mounted();

        const {variantId, mode, productId} = this.props;

        const initialId = (mode === "Variant") ? variantId : productId;

        this.onChange(initialId);
    }

    async update(entityId) {
        const {mode} = this.props;

        let entries = [];

        if (mode === "Variant") {
            const variantObj = await CrossSell.API.perVariant(entityId);

            const metaobjectIds = variantObj.metafields[METAFIELD.CROSS_SELLING_PRODUCT];

            entries = await CrossSell.API.compose(metaobjectIds);
        } else {
            ({entries} = await CrossSell.API.perProduct(entityId));
        }

        if (!entries.length) {
            this.destroy();
            return;
        }

        this.crossSellProducts = entries;
    }
}

customElements.define("cross-sell-panel", CrossSellPanel);

class CrossSellWidget extends ProductAuxiliary {
    props = {
        version: 1,
        trackable: true,
        eventName: "",
        variantId: 0,
    }

    get refs() {
        return {
            $checkboxInput: +this.props.version === 2 ? this.$el.find(".checkbox-input") : this.$el.find(".widget-checkbox__input"),
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

        const {$variantSelector, $checkboxInput} = this.refs;

        if ($variantSelector.get(0).contains(e.target)) return;

        this.isIncluded = !$checkboxInput.is(":checked");

        $checkboxInput.prop("checked", this.isIncluded);

        window.dispatchEvent(new Event("productPriceChange"));
    }

    updateMetadata() {
        const {$variantSelector} = this.refs;
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

        this.product = JSON.parse(this.$el.closest("cross-sell-widget")
                                      .find("script[type='application/json'][name='parent']").text());
    }

    mounted() {
        super.mounted();

        this.dispatchEvent(new Event("change", {bubbles: true}));
    }

    template() {
        const {product} = this;
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
        const {variantId} = this.props;
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

    pricing = {price, originalPrice};

    constructor() {
        super();
        const {$widget} = this.refs;
        this.variant = JSON.parse(this.$el.closest("cross-sell-widget")
                                      .find("script[type='application/json'][name='variant']").text());

        $widget.on(CROSS_SELLING_CHANGE_EVENT, this.updatePrice.bind(this));
    }

    template() {
        const {price, originalPrice} = this.pricing;

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
        const {$variantSelector} = this.refs;
        const $selectedOption = $variantSelector.get(0).getSelected();

        this.pricing = {
            price: $selectedOption.data("price"),
            originalPrice: $selectedOption.data("originalPrice"),
        };

        this.render();
    }
}

customElements.define("cross-sell-price", CrossSellPrice);
