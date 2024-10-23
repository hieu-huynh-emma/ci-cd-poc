import { productLiquidMapper } from "data-processor";

if (!customElements.get("cart-recommendation")) {
  class CartRecommendation extends CustomElement {
    props = {
      heading: ""
    }

    get refs() {
      return {
        collection: JSON.parse(document.querySelector('#CartRecommendation-JSON').textContent),
        cartItems: JSON.parse(document.querySelector("#CartItems-JSON").textContent),
        allRecommendationItems: this.querySelectorAll("cart-recommendation-item"),
      }
    }

    constructor() {
      super();
    }

    template() {
      const { heading } = this.props
      const { collection, cartItems } = this.refs

      if (!collection) return "";

      const cartItemIds = cartItems.map(i => i.product_id)

      const availableProducts = collection.filter(({ id }) => !cartItemIds.includes(id));

      if (!availableProducts.length) {
        return ""
      }

      return `
          <h2 class="section-header">${heading}</h2>

          <div class="section-body">
            ${this.renderRecommendationList(availableProducts)}
          </div>
    `
    }

    renderRecommendationList(products) {
      return products.map((o) => {
        const product = productLiquidMapper(_.mapKeys(o, (v, k) => _.camelCase(k)));

        return `<cart-recommendation-item data="${_.escape(JSON.stringify(product))}"></cart-recommendation-item>`

      }).join("");
    }

    onDisabledChange(isDisabled) {
      super.onDisabledChange(isDisabled);

      const { allRecommendationItems } = this.refs

      allRecommendationItems.forEach(item => item.disabled = isDisabled)
    }

  }

  class CartRecommendationItem extends CustomElement {
    props = {
      index: 0
    }

    currentVariant

    get refs() {
      return {
        $addBtn: this.$el.find("button"),
        $variantSelector: this.$el.find("variant-selector")
      }
    }

    constructor() {
      super();
    }

    template() {
      return document.querySelector("#cart-recommendation-item-tpl").innerHTML
    }

    render() {
      if (!this.data) return

      super.render()

      const {
        title,
        featuredImage,
        variants,
        firstAvailableVariant
      } = this.data

      this.currentVariant = firstAvailableVariant


      this.slots = {
        title: `<h3 class="product-title">${title}</h3>`,
        media: `<img
            src="${featuredImage}"
            alt=""
            class="card-media__image"
            loading="lazy"
        />`,
        "product-pricing": `<price-tag data="${_.escape(JSON.stringify(this.currentVariant))}"></price-tag>`,
        "variant-selector": ` <variant-selector
          slot="variant-selector"
          :value="${this.currentVariant.id}"
          :options="${_.escape(JSON.stringify(variants))}"
        >
        </variant-selector>`
      }

      this.renderSlots();

      this.onUpdated();
    }

    renderSlots() {
      Object.entries(this.slots).forEach(([name, html]) => {
        const $outlet = this.$el.find(`slot[name="${name}"]`)

        if ($outlet.length) {
          $outlet.html(html)
        }
      })
    }

    mounted() {
      setTimeout(this.registerListeners.bind(this), 10)
    }

    registerListeners() {
      const { $addBtn } = this.refs;

      const variantSelector = this.querySelector("variant-selector")

      variantSelector?.addEventListener('change', this.onVariantChange.bind(this));

      $addBtn.click(this.onAddUpsell.bind(this))
    }

    onDisabledChange(isDisabled) {
      super.onDisabledChange(isDisabled);

      const { $addBtn, $variantSelector } = this.refs

      $addBtn.attr('disabled', isDisabled)
      $variantSelector.attr('disabled', isDisabled)
    }

    onVariantChange() {
      const $selectedOption = this.$el.find(':selected');

      const variantId = $selectedOption.val()

      if (!variantId) return

      this.currentVariant = this.data.variants.find((v) => +v.id === +variantId)

      if (!this.currentVariant) return

      this.refreshPrice()
    }

    refreshPrice() {
      const $priceTag = this.$el.find("price-tag");

      $priceTag.attr("data", JSON.stringify(this.currentVariant))
    }

    async onAddUpsell(e) {
      e.stopPropagation();

      if (!this.currentVariant) return

      const cartItems = document.getElementById('CartDrawerItems')
      const cartSummaryNode = document.getElementById('CartDrawerSummary');

      const scrollableContentEl = document.querySelector("cart-scrollable-content")

      scrollableContentEl.loading = true
      cartSummaryNode.loading = true

      await cartItems.addToCart(this.currentVariant.id, 1);

      scrollableContentEl.loading = false
      cartSummaryNode.loading = false

    }

  }

  customElements.define("cart-recommendation-item", CartRecommendationItem);

  customElements.define("cart-recommendation", CartRecommendation)
}
