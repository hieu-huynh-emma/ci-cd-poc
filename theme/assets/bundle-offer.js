import CrossSell from "./cross-sell.js";
import { METAFIELD } from "./data-constants.js";
import { allFulfilled, fetchVariant } from "./data-fetcher.js";

class BundleCrossSell extends CrossSell.Manager {
    props = {
        productId: "",
        variantId: "",
    };
    items = [];

    targetVariant;

    get refs() {
        return {
            $priceTag: this.$el.find("#BundleCrossSell-PriceTag"),
        };
    }

    constructor() {
        super();
        this.listenToParent();
        this.data = JSON.parse(this.querySelector(`script[slot="data"]`).textContent);

    }

    render() {
        if (!this.items.length) {
            this.$el.addClass("hidden")
        } else {
            this.$el.removeClass("hidden")
            this.renderSwitcher();
            this.$el.find(".bundle-items").html(this.template());
        }
        this.$el.removeClass("is-loading");
        this.$el.find(".skeleton").remove();
    }

    template() {
        return this.items.reduce((r, product, i) => {
            const last = i + 1 === this.items.length;

            return r + this.renderWidget(product, { index: i, last });
        }, ``);
    }

    onParentVariantChange() {

        let targetVariantId = null;

        const productSize = $(`product-buybox select[name="options[Size]"]`).val().split("|")[0].trim();
        const allVariants = this.data.variants;

        const isSingle = allVariants.length === 1;

        if (!isSingle) {
            const selectedVariant = allVariants.find(this.findMatchingSizes.bind(this, productSize));

            if (selectedVariant) {
                targetVariantId = selectedVariant.id;
            }

        } else {
            targetVariantId = allVariants[0].id;
        }

        if (!targetVariantId) return;

        this.targetVariant = allVariants.find(({ id }) => +id === +targetVariantId);

        this.onChange(targetVariantId);
    }

    findMatchingSizes(targetSize, variant) {
        const sizes = new Set([...variant.title.split(" / "), variant.title.split("|")[0].trim()]);

        if (sizes.has("Cal King")) sizes.add("California King");

        return sizes.has(targetSize);
    }

    prepare() {
        this.$el.append(`<div class="skeleton"></div>`);
        this.$el.addClass("is-loading");
    }

    async mounted() {
        super.mounted();

        await ResourceCoordinator.requestVendor("AsSwitch");

        this.onParentVariantChange();

        this.$el.addClass("is-mounted");
    }


    async update(variantId) {
        const variant = await CrossSell.API.perVariant(variantId);
        const variantIds = variant.metafields[METAFIELD.CONFIGURABLE_ITEM] || [];
        this.items = await allFulfilled(variantIds.map(async variantId => fetchVariant(variantId)));
    }

    onSwitch() {
        window.dispatchEvent(new Event("productPriceChange"));
    }

    async renderSwitcher() {
        const $switcherContainer = this.$el.find("#BundleCrossSell-Switcher");

        const alreadyInitialized = $switcherContainer.find(".asSwitch").length;

        if (alreadyInitialized) return;
        $switcherContainer.html(`<input id="offer-switch" class="hidden" type="checkbox" />`);

        const switcher = $switcherContainer.find("#offer-switch");

        switcher.asSwitch({
            dragable: false,
            clickable: true,
        });

        switcher.change(this.onSwitch.bind(this));
    }

    renderWidget(variant, { last }) {
        const { product } = variant;
        const { title, handle, displayName, featuredImage, metafields } = product;
        const bundleQty = metafields["bundle_quantity"] || 1;

        return `<div class="flex">
            <div id="product-configuration-${handle}"
                 class="product-bundle-item">
              <div class="quantity-badge">
                ${bundleQty}
              </div>
              <div class="product-bundle-item__media">
              
                <img
                    src="${featuredImage}"
                    width="120"
                    height="80"
                    alt=""
                    class="product-bundle-item__image"
                    loading="lazy"
                >
              </div>
              <div class="product-bundle-item__details">
                <div class="product__name paragraph-14">
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


        const { formattedOriginalPrice, formattedPrice, saleDiscount } = this.getPricing();
        //     accessoryPrice = bundlePrice - +this.data.price,
        //     accessoryOriginalPrice = bundleOriginalPrice - +this.data.originalPrice,


        $priceTag.html(
            `${saleDiscount ? `<span class="text-sm line-through">${formattedOriginalPrice}</span>` : ""}
       <span class="text-tango text-md font-semibold">${formattedPrice}</span>`,
        );
    }

    getPricing() {
        const originalPrice = (this.targetVariant.compare_at_price || 0) / 100,
            price = this.targetVariant.price / 100,
            saleDiscount = originalPrice - price;


        const formattedPrice = Currency.format(parseFloat(price)),
            formattedOriginalPrice = Currency.format(parseFloat(originalPrice));

        return { price, originalPrice, saleDiscount, formattedPrice, formattedOriginalPrice };
    }
}

customElements.define("bundle-cross-sell", BundleCrossSell);


class FreebieBundle extends CrossSell.Manager {
    items = [];

    bundleCrossSellData;
    primaryVariant;

    get refs() {
        return {
            $priceTag: this.$el.find("#BundleCrossSell-PriceTag"),
        };
    }

    constructor() {
        super();
        this.listenToParent();
        this.bundleCrossSellData = JSON.parse(this.querySelector(`script#BundleCrossSell-JSON`).textContent);

    }

    async render() {
        // if (!this.items.length) return;
        await this.renderSwitcher();
        // this.$el.find(".bundle-items").html(this.template());
        // this.renderPriceTag();
        this.$el.removeClass("is-loading");
        this.$el.find(".ske-free").remove();
    }

    template() {
        return this.items.reduce((r, product, i) => {
            const last = i + 1 === this.items.length;

            return r + this.renderWidget(product, { index: i, last });
        }, ``);
    }

    prepare() {
        this.$el.append(`<div class="skeleton"></div>`);
        this.$el.addClass("is-loading");
    }

    async mounted() {
        super.mounted();


        // this.onParentVariantChange();

        this.$el.addClass("is-mounted");
    }

    async update(variantId) {
        const { entries, main } = (await CrossSell.API.perVariant(variantId, METAFIELD.FREEBIE_BUNDLE));

        this.items = entries;

        this.primaryVariant = main;
    }

    onSwitch() {
        window.dispatchEvent(new Event("productPriceChange"));
    }

    async renderSwitcher() {
        await ResourceCoordinator.requestVendor("AsSwitch");

        const $switcherContainer = this.$el.find("#BundleCrossSell-Switcher");

        const alreadyInitialized = $switcherContainer.find(".asSwitch").length;

        if (alreadyInitialized) return;

        $switcherContainer.html(`<input id="offer-switch" class="hidden" type="checkbox" />`);

        setTimeout(() => {
            const switcher = $switcherContainer.find("#offer-switch");

            switcher.asSwitch({
                dragable: false,
                clickable: true,
            });

            switcher.change(this.onSwitch.bind(this));
        }, 45);
    }

    renderWidget(metaobject, { index, last }) {
        const {
            qty = 1,
            variant: { product },
        } = metaobject;
        const { title, handle, displayName, featuredImage } = product;

        return `<div class="flex">
            <div id="product-configuration-${handle}"
                 class="product-bundle-item">
              <div class="quantity-badge">
                 ${qty}
              </div>
              <div class="product-bundle-item__media">
              
                <img
                    src="${featuredImage}"
                    width="120"
                    height="80"
                    alt=""
                    class="product-bundle-item__image"
                    loading="lazy"
                >
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

    listenToParent() {
    }

    renderPriceTag() {
        const { $priceTag } = this.refs;
        // console.log(this.bundleCrossSellData)

        const productSize = this.primaryVariant.title.split("|")[0].trim();

        const singleVariant = this.bundleCrossSellData.variants.length === 1;

        let bundleVariant;

        if (singleVariant) {
            bundleVariant = this.bundleCrossSellData.variants[0];
        } else {
            bundleVariant = this.bundleCrossSellData.variants.find((variant) => variant.title.includes(productSize));
        }

        const bundleOriginalPrice = (bundleVariant.compare_at_price || 0) / 100;
        const originalPriceInCurrency = Currency.format(parseFloat(bundleOriginalPrice));

        $priceTag.html(`
           <span class="text-sm line-through">${originalPriceInCurrency}</span>
           <span class="text-tango text-md font-semibold">FREE!</span>`,
        );
    }
}

customElements.define("freebie-bundle", FreebieBundle);
