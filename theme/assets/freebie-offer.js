import { METAFIELD } from "./data-constants.js";
import { allFulfilled, fetchVariant } from "./data-fetcher.js";

const FreebieAPI = {
    async perVariant(variantId, metafield = METAFIELD.FREEBIE_PRODUCT_VARIANT) {
        const variant = await fetchVariant(generateShopifyGid("ProductVariant", variantId));
        const variantIds = variant.metafields[metafield];

        return allFulfilled(variantIds.map(async variantId => fetchVariant(variantId)));
    },

};


if (!customElements.get("freebie-offer")) {
    class FreebieOffer extends CustomElement {
        items = [];

        initialized = false

        bundleCrossSellData;
        primaryVariant;

        get refs() {
            return {
                $priceTag: this.$el.find("#BundleCrossSell-PriceTag"),
            };
        }

        constructor() {
            super();
            // this.bundleCrossSellData = JSON.parse(this.querySelector(`script#BundleCrossSell-JSON`).textContent);
        }

        async render() {
            console.log("render")
            if(!this.initialized) {
                this.initialized = true
            } else {
                if (!this.items.length) return;

                this.$el.find(".bundle-items").html(this.template());
            }

            await this.renderSwitcher();


            // this.renderPriceTag();

            this.$el.removeClass("is-loading");

            this.$el.find(".skeleton").remove();
        }

        template() {
            return this.items.reduce((r, variantObj, i) => {
                const last = i + 1 === this.items.length;

                return r + this.renderWidget(variantObj, { index: i, last });
            }, ``);
        }

        prepare() {
            this.$el.append(`<div class="skeleton"></div>`);
            this.$el.addClass("is-loading");
        }

        async mounted() {
            window.addEventListener("productVariantChange", debounce(this.onParentVariantChange.bind(this), 100));

            this.$el.addClass("is-mounted");
        }

        async update(variantId) {
            this.items = (await FreebieAPI.perVariant(variantId));
        }

        onSwitch() {
            window.dispatchEvent(new Event("productPriceChange"));
        }

        onParentVariantChange() {
            const currentParentVariantId = +$(".product-form__variants option:selected").val();
            if (!currentParentVariantId) return;

            this.onChange(currentParentVariantId);
        }

        async onChange(id) {
            this.prepare();

            await this.update(id);

            this.render();

            this.$el.removeClass("is-loading");
        }


        async renderSwitcher() {
            await ResourceCoordinator.requestVendor("AsSwitch");

            const $switcherContainer = this.$el.find("#BundleCrossSell-Switcher");

            const alreadyInitialized = $switcherContainer.find(".asSwitch").length;

            if (alreadyInitialized) return;

            setTimeout(() => {
                const switcher = $switcherContainer.find("#offer-switch");

                switcher.asSwitch({
                    dragable: false,
                    clickable: true,
                });

                switcher.change(this.onSwitch.bind(this));
            }, 45);
        }

        renderWidget(variantObj, { index, last }) {
            const { product } = variantObj;

            const { title, handle, displayName, featuredImage, metafields} = product;

            const bundleQty = metafields['bundle_quantity'] || 1

            return `<div class="flex">
            <div id="product-configuration-${handle}"
                 class="product-bundle-item">
              <div class="quantity-badge">
               ${bundleQty}
              </div>
              <div class="product-bundle-item__media">
                    <picture-tag
                        :src="${featuredImage}"
                        :fit="contain"
                        width="120"
                        height="80"
                        class="product-bundle-item__image"
                    >
                    </picture-tag>
              </div>
              <div class="product-bundle-item__details">
                <div class="product__name">
                    <span>${displayName || title}</span>
                </div>
              </div>
            </div>
            ${!last ? `
              <div class="vertical-line-break">
                <svg class="promo-plus-sign" xmlns="http://www.w3.org/2000/svg" width="19" height="19"
                     viewBox="0 0 19 19"
                     fill="none">
                  <ellipse cx="9.16309" cy="9.13953" rx="9.16309" ry="9.13953" fill="#FFDDB5" />
                  <path
                      d="M8.4498 12H9.53512V9.87506H11.6601V8.78974H9.53512V6.6648H8.4498V8.78974H6.32486V9.87506H8.4498V12Z"
                      fill="#F70" />
                </svg>
              </div>
            ` : ""}
          </div>`;
        }

        renderPriceTag() {
            const { $priceTag } = this.refs;

            const {originalPrice} = this.getPricing()

            $priceTag.html(`
               <span class="text-sm line-through">${originalPrice}</span>
               <span class="text-tango text-md font-semibold">FREE!</span>`,
            );
        }


        destroy() {
            this.$el.empty();
            this.$el.addClass("hidden");
        }

        getPricing() {
            const originalPrice = this.items.reduce((acc, variant) => acc += variant.originalPrice, 0);

            return {price: 0, originalPrice}
        }
    }

    customElements.define("freebie-offer", FreebieOffer);
}
