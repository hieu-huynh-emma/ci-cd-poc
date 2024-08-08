class BundleCrossSell extends CustomElement {
  crossSellProducts = [];

  bundleCrossSellData;
  primaryVariant;

  constructor() {
    super();

    window.addEventListener("productVariantChange", debounce(this.onVariantChange.bind(this), 100));

    this.bundleCrossSellData = JSON.parse(this.querySelector(`script#BundleCrossSell-JSON`).textContent);

  }

  get refs() {
    return {
      $priceTag: this.$el.find("#BundleCrossSell-PriceTag"),
    };
  }

  async mounted() {
    super.mounted();

    await ResourceCoordinator.requestVendor("AsSwitch");

    this.onVariantChange();

    this.$el.addClass("is-mounted");
  }

  render() {
    if (!this.crossSellProducts.length) return;
    this.renderSwitcher();
    this.$el.find(".bundle-items").html(this.template());
    this.renderPriceTag();
    this.$el.removeClass("is-loading");
    this.$el.find(".skeleton").remove();
  }

  template() {
    return this.crossSellProducts.reduce((r, product, i) => {
      const last = i + 1 === this.crossSellProducts.length;

      return r + this.renderWidget(product, { index: i, last });
    }, ``);
  }

  async onVariantChange() {
    this.$el.append(`<div class="skeleton"></div>`);

    this.$el.addClass("is-loading");

    const currentVariantId = +$(".product-form__variants option:selected").val();

    this.primaryVariant = await this.fetchVariant(generateShopifyGid("ProductVariant", currentVariantId));

    const crossSellMetafield = this.primaryVariant.crossSellMetafield;

    if (!crossSellMetafield) {
      this.innerHTML = ``;
      this.$el.hide();
      this.$el.removeClass("is-loading");
      return;
    }
    const metaobjectIds = JSON.parse(crossSellMetafield.value);

    this.crossSellProducts = await Promise.allSettled(metaobjectIds.map((id) => this.fetchMetaObject(id))).then((results) =>
      results.filter((x) => x.status === "fulfilled").map((x) => x.value),
    );

    this.render();
  }

  onSwitch() {
    window.dispatchEvent(new Event("productPriceChange"));
  }

  fetchVariant(gid) {
    return storefrontApi({
      method: "POST",
      data: JSON.stringify({
        query: `query getVariantById($id: ID!) {
    node(id: $id) {
        ... on ProductVariant {
            id
            title
            quantityAvailable
            price {
                amount
            }
            compareAtPrice {
                amount
            }
            metafields(
                identifiers: [{ namespace: "accentuate", key: "optin_bundle_item" }]
            ) {
                value
                id
                key
                namespace
            }
            product {
                id
                handle
                onlineStoreUrl
                title
                featuredImage {
                    id
                    src
                    width
                    height
                }
                availableForSale
                variants(first: 10) {
                    edges {
                        cursor
                        node {
                            id
                            title
                            quantityAvailable
                            price {
                                amount
                                currencyCode
                            }
                        }
                    }
                }
                metafields(identifiers: [{ namespace: "accentuate", key: "isolated_image" },{ namespace: "accentuate", key: "display_name" }]) {
                    value
                    id
                    key
                    namespace
                }
            }
        }
    }
}
`,
        variables: {
          id: gid,
        },
      }),
    }).then((res) => this.variantMapper(res.data.data.node));
  }

  fetchMetaObject(gid) {
    return storefrontApi({
      method: "POST",
      data: JSON.stringify({
        query: `query getMetaObject($id: ID!) {
    metaobject(id: $id) {
        id
        type
        updatedAt
        handle
        fields {
            key
            value
            type
        }
        fields {
            key
            value
            type
        }
    }
}`,
        variables: {
          id: gid,
        },
      }),
    }).then(async (res) => {
      const data = res.data.data.metaobject;

      const metaobject = await Promise.allSettled(
        data.fields.map(async ({ key, value, type }) => {
          let data = value;

          if (type === "variant_reference") {
            data = await this.fetchVariant(value);
          }

          return [key, data];
        }),
      ).then((results) =>
        results
          .filter((x) => x.status === "fulfilled")
          .reduce((r, x) => {
            r[x.value[0]] = x.value[1];
            return r;
          }, {}),
      );

      return metaobject;
    });
  }

  variantMapper(variant) {
    const {
      id: gid,
      price: { amount: price = 0 },
      compareAtPrice,
      metafields = [],
      product,
      ...rest
    } = variant;

    const originalPrice = compareAtPrice?.amount ?? price;
    const totalSaved = Math.max(0, originalPrice - price);

    const crossSellMetafield = metafields
      .filter((m) => !!m)
      .find(({ namespace, key } = {}) => namespace === "accentuate" && key === "optin_bundle_item");

    return {
      id: extractIdFromGid(gid),
      price,
      originalPrice,
      totalSaved,
      gid,
      ...(crossSellMetafield ? { crossSellMetafield } : {}),
      ...(product ? { product: this.productMapper(product) } : {}),
      ...rest,
    };
  }

  productMapper(product) {
    const { featuredImage: imgSource, metafields = [], variants, ...rest } = product;

    const accentuateImg = metafields.filter((m) => !!m).find(({
                                                                namespace,
                                                                key,
                                                              } = {}) => namespace === "accentuate" && key === "isolated_image");
    const featuredImage = accentuateImg ? `${JSON.parse(accentuateImg.value)[0].src}&transform=resize=720` : imgSource.src + `&width=720`;

    const displayName = metafields.filter((m) => !!m).find(({
                                                              namespace,
                                                              key,
                                                            } = {}) => namespace === "accentuate" && key === "display_name")?.value;
    return {
      featuredImage,
      variants: variants.edges.map(({ node }) => node),
      displayName,
      ...rest,
    };
  }

  async renderSwitcher() {
    const $switcherContainer = this.$el.find("#BundleCrossSell-Switcher")

    $switcherContainer.html(`<input id="offer-switch" class="hidden" type="checkbox" />`)

    const switcher = $switcherContainer.find("#offer-switch")

    switcher.asSwitch({
      dragable: false,
      clickable: true,
    });

    switcher.change(this.onSwitch.bind(this));
  }

  renderWidget(metaobject, { last }) {
    const {
      qty = 1,
      product: { product },
    } = metaobject;

    const { title, handle, displayName, featuredImage } = product;


    return `
    <div class="flex">
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
                 ${qty > 1 ? `${qty}x ` : ""} ${displayName || title}
                
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

  renderPriceTag() {
    const { $priceTag } = this.refs;

    const productSize = this.primaryVariant.title.split("|")[0].trim();

    const bundleVariant = this.bundleCrossSellData.variants.find((variant) => variant.title.includes(productSize));

    const bundleOriginalPrice = bundleVariant.compare_at_price / 100,
      bundlePrice = bundleVariant.price / 100,
      accessoryPrice = bundlePrice - +this.primaryVariant.price,
      accessoryOriginalPrice = bundleOriginalPrice - +this.primaryVariant.originalPrice,
      accessoryTotalSaved = accessoryOriginalPrice - accessoryPrice;

    const priceInCurrency = Currency.format(parseFloat(accessoryPrice)),
      originalPriceInCurrency = Currency.format(parseFloat(accessoryOriginalPrice));

    $priceTag.html(
      `${accessoryTotalSaved ? `<span class="text-sm line-through">${originalPriceInCurrency}</span>` : ""}
       <span class="text-tango text-md font-semibold">${priceInCurrency}</span>`,
    );
  }
}

customElements.define("bundle-cross-sell", BundleCrossSell);
