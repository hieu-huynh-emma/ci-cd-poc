import {allFulfilled, allSettled, fetchMetaobjects, fetchProduct, fetchVariant} from "data-fetcher";


class CrossSellEngine extends CustomElement {
    crossSellProducts = [];
    props = {
        productId: 0,
        variantId: 0,
        trackId: "",
        sizeCompatible: false,
        variantMode: false
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
        return this.crossSellProducts.reduce((r, product) => r + this.renderCrossSellWidget(product), ``);
    }

    async mounted() {
        super.mounted();
        const {variantId, variantMode, productId} = this.props;

        if (!!variantMode) {
            this.onVariantChange(variantId);
        } else {
            this.onProductChange(productId)
        }

        this.$el.addClass("is-mounted");
    }

    async onVariantChange(variantId) {
        this.innerHTML = `<div class="skeleton"></div>`;
        this.$el.addClass("is-loading");

        const variant = await fetchVariant(generateShopifyGid("ProductVariant", variantId));

        const crossSellMetafield = variant.crossSellMetafield;

        if (!crossSellMetafield) {
            this.innerHTML = ``;
            this.$el.hide()
            this.$el.removeClass("is-loading");
            return;
        }

        const metaobjectIds = JSON.parse(crossSellMetafield.value);

        this.crossSellProducts = await fetchMetaobjects(metaobjectIds)

        this.render();
    }

    async onProductChange(productId) {
        this.innerHTML = `<div class="skeleton"></div>`;
        this.$el.addClass("is-loading");

        const product = await fetchProduct(generateShopifyGid("Product", productId));

        const metaobjectIds = product.crossSellingProducts;

        if (!metaobjectIds.length) {
            this.innerHTML = ``;
            this.$el.hide()
            this.$el.removeClass("is-loading");
            return;
        }

        const metaobjects = await fetchMetaobjects(metaobjectIds)
        console.log("=>(cross-sell-widget.js:88) this.crossSellProducts", metaobjects);

        this.crossSellProducts = await this.composeCrossSellData(metaobjects)
        console.log("=>(cross-sell-widget.js:89) this.crossSellProducts", this.crossSellProducts);

        this.render();
    }

    composeCrossSellData(metaobjects) {
        return allFulfilled(metaobjects.map(async (metaobject) => {
            return {
                title: metaobject.title,
                product: await fetchVariant(metaobject.variantId),
            }
        }))
    }


    renderCrossSellWidget(metaobject) {
        const {trackId, sizeCompatible} = this.props
        const {
            qty,
            product: {
                id,
                price,
                originalPrice,
                product,
            },
        } = metaobject;

        const {title, displayName, handle, featuredImage} = product;

        const totalSaved = Math.max(0, originalPrice - price),
            priceInCurrency = Currency.format(parseFloat(price)),
            originalPriceInCurrency = Currency.format(parseFloat(originalPrice));

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
       <script type="application/json">${JSON.stringify(product)}</script>
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
              </div>
              <p class="product-price-container">
                <span class="text-scarlet font-bold">${priceInCurrency}</span>
                ${totalSaved ? `<del class="line-through text-xs">${originalPriceInCurrency}</del>` : ""}
               
              </p>
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
        };
    }

    constructor() {
        super();
    }

    onClick(e) {
        super.onClick();

        e.preventDefault();

        const {$checkboxInput} = this.refs;

        const serviceIncluded = $checkboxInput.is(":checked");

        if (!serviceIncluded) {
            $checkboxInput.prop("checked", true);
        } else {
            $checkboxInput.prop("checked", false);
        }

        window.dispatchEvent(new Event("productPriceChange"))
    }
}

customElements.define("cross-sell-widget", CrossSellWidget);
