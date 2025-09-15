import CrossSell from "./cross-sell.js";
import { METAFIELD } from "./data-constants.js";


if (!customElements.get("promotional-panel")) {
    customElements.define("promotional-panel", class extends CustomElement {
            props = {
                isBundle: false,
            };
            items = [];

            compositeData;

            get refs() {
                return {
                    $productList: this.$el.find(".product-list"),
                };
            }

            constructor() {
                super();
                this.compositeData = JSON.parse(this.querySelector(`script#Promotional-Product-JSON[type="application/json"]`).textContent);
            }

            render() {
                if (!this.items.length) return;

                const { $productList } = this.refs;

                $productList.html(this.template());
            }

            template() {
                return this.items.reduce((r, product, i) => {
                    const last = i + 1 === this.items.length;

                    return r + this.renderWidget(product, { index: i, last });
                }, ``);
            }

            prepare() {
                const { $productList } = this.refs;
                $productList.html(`<div class="skeleton"></div>`);
            }

            beforeMount() {
                // if (this.props.isBundle) {
                this.listenToParent();

                this.onParentVariantChange();
                // }
            }

            async mounted() {
                super.mounted();

                this.$el.addClass("is-mounted");
            }

            async update(variantId) {
                const { entries } = (await CrossSell.API.perVariant(variantId, METAFIELD.PROMOTIONAL_PRODUCT));
                console.log("=>(promotional-panel.js:54) entries", entries);

                this.items = entries;
            }

            listenToParent() {
                window.addEventListener("productVariantChange", debounce(this.onParentVariantChange.bind(this), 100));
            }

            onParentVariantChange() {
                // const productSize = $(`product-buybox select[name="options[Size]"]`).val().split("|")[0].trim();

                // this.toggleAttribute("hidden", !!["Twin", "Twin XL"].includes(productSize));


                // const variantId = this.findCompatibleSize()
                //
                // if (!variantId) return
                //
                // this.onChange(variantId);
            }

            findCompatibleSize() {
                const allVariants = this.compositeData.variants;

                const isConfigurable = allVariants.length > 1;

                if (isConfigurable) {
                    const productSize = $(`product-buybox select[name="options[Size]"]`).val().split("|")[0].trim();
                    const selectedVariant = allVariants.find((variant) => variant.title.includes(productSize));

                    if (!selectedVariant) return null;

                    return selectedVariant.id;
                }

                return null;
            }


            async onChange(variantId) {
                this.prepare();

                await this.update(variantId);

                this.render();

                this.$el.removeClass("is-loading");
            }

            renderWidget(metaobject, { last }) {
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
                            <div class="product__name paragraph-14">
                            <span>
                                ${displayName || title}
                            </span>
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
                      </div>
                `;
            }
        },
    );
}

