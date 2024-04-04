class CrossSellEngine extends CustomElement {
  crossSellProducts = [];
  props = {
    variantId: 0,
    product: {},
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
    const { variantId } = this.props;

    this.onVariantChange(variantId);

    this.$el.addClass("is-mounted");

  }

  async onVariantChange(variantId) {
    this.innerHTML = `<div class="skeleton"></div>`;
    this.$el.addClass("is-loading");

    const variant = await this.fetchVariant(generateShopifyGid("ProductVariant", variantId));

    const crossSellMetafield = variant.crossSellMetafield;

    if (!crossSellMetafield) {
      this.innerHTML = ``;
      this.$el.hide()
      this.$el.removeClass("is-loading");
      return;
    }
    ;

    const metaobjectIds = JSON.parse(crossSellMetafield.value);

    this.crossSellProducts = await Promise.allSettled(metaobjectIds.map((id) => this.fetchMetaObject(id))).then((results) =>
      results.filter((x) => x.status === "fulfilled").map((x) => x.value),
    );

    this.render();
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
                identifiers: [{ namespace: "accentuate", key: "proxy_cross_selling_products" }]
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
                metafields(identifiers: [{ namespace: "accentuate", key: "featured_image" }]) {
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

  renderCrossSellWidget(metaobject) {
    const {
      qty,
      variant: {
        id,
        price,
        originalPrice,
        product,
      },
    } = metaobject;

    const { title, handle, featuredImage } = product;

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
> 
    <script type="application/json">${JSON.stringify(product)}</script>
    <div class="auxiliary-container">
      <div class="widget-checkbox">
          <input type="checkbox" class="widget-checkbox__input"/>
           <i class="widget-checkbox__icon widget-checkbox__icon--checked">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                      <path
                              data-name="Icon ionic-md-checkmark-circle-outline"
                              d="m9.275 11.475-1.4 1.4 4.5 4.5 10-10-1.4-1.4-8.6 8.55zm12.1 1.9a7.966 7.966 0 1 1-5.8-7.7l1.55-1.55a9.3 9.3 0 0 0-3.75-.75 10 10 0 1 0 10 10z"
                              transform="translate(-3.375 -3.375)" style="fill:#14aa60"
                      ></path>
                  </svg>
              </i>

          <i class="widget-checkbox__icon widget-checkbox__icon--unchecked">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                   xmlns="http://www.w3.org/2000/svg">
                  <path
                          d="M19.25 10C19.25 15.1086 15.1086 19.25 10 19.25C4.89137 19.25 0.75 15.1086 0.75 10C0.75 4.89137 4.89137 0.75 10 0.75C15.1086 0.75 19.25 4.89137 19.25 10Z"
                          stroke="black" stroke-width="1.5"
                  />
                  <path d="M6 9.90637H13.689" stroke="black" stroke-width="1.6" stroke-linecap="round"/>
                  <path d="M10 6V13.689" stroke="black" stroke-width="1.6" stroke-linecap="round"/>
              </svg>
          </i>

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
            ${qty > 1 ? `${qty}x ` : ""} ${title}
            </p>
          </div>
          <p class="product-price-container">
            <span class="text-scarlet font-bold">${priceInCurrency}</span>
            ${totalSaved ? `<del class="line-through text-xs">${originalPriceInCurrency}</del>` : ""}
           
          </p>
        </div>
      </div>
</cross-sell-widget>
    `;
  }

  variantMapper(variant) {
    const {
      id: gid,
      price: { amount: price = 0 },
      compareAtPrice,
      metafields = [],
      product,
      ...rest
    }
      = variant;

    const originalPrice = compareAtPrice?.amount ?? 0;

    const crossSellMetafield = metafields.filter(m => !!m).find(({
                                                                   namespace,
                                                                   key,
                                                                 } = {}) => namespace === "accentuate" && key === "proxy_cross_selling_products");


    return {
      id: extractIdFromGid(gid),
      price,
      originalPrice,
      gid,
      ...(crossSellMetafield ? { crossSellMetafield } : {}),
      ...(product ? { product: this.productMapper(product) } : {}),
      ...rest,
    };
  }

  productMapper(product) {
    const { featuredImage: imgSource, metafields = [], variants, ...rest } = product;

    const accentuateImg = metafields.filter(m => !!m).find(({
                                                              namespace,
                                                              key,
                                                            } = {}) => namespace === "accentuate" && key === "featured_image");
    const featuredImage = accentuateImg ? `${JSON.parse(accentuateImg.value)[0].src}&transform=resize=720` : imgSource.src + `&width=720`;

    return {
      featuredImage,
      variants: variants.edges.map(({ node }) => node),
      ...rest,
    };
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

    const { $checkboxInput } = this.refs;

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
