import { EVENTS } from "./data-constants.js";

if (!customElements.get("cart-upsell")) {
  customElements.define("cart-upsell", class CartUpsell extends Element {
    props = {
      value: null,
      options: [],
      quantity: 0,
      index: 0,
      productId: 0,
    };

    eligibleProductIds = new Set();

    get refs() {
      return {
        allAddButtons: this.$el.find("button"),
        allVariantSelectors: this.$el.find("variant-selector"),
      };
    }


    async setup() {
      this.addEventListener("submit", this.onAddUpsell.bind(this));

      Array.from(this.querySelectorAll("li.splide__slide")).forEach(slide => {
        this.eligibleProductIds.add(slide.getAttribute("productId"));
      });

      await this.initCarousel();

      this.$el.attr("hidden", false);

    }

    setupListeners() {
      document.addEventListener(EVENTS.CART_LOADED, this.removeInclusion.bind(this));

      document.addEventListener(EVENTS.CART_UPDATED, this.removeInclusion.bind(this));
    }

    removeInclusion() {
      const lineProductIds = new Set(window.Cart.state.lines.map(line => extractIdFromGid(line.merchandise.product.id)));

      const includedIds = this.eligibleProductIds.intersection(lineProductIds);

      $("#cart-upsell-section")[(includedIds.size === this.eligibleProductIds.size) ? "addClass" : "removeClass"]("hidden");

      this.querySelectorAll("li.splide__slide").forEach(slide => {
        const $el = $(slide);
        const productId = $el.attr("productId");

        $el[includedIds.has(productId) ? "addClass" : "removeClass"]("hidden");
      });
    }

    async initCarousel() {
      await ResourceCoordinator.requestVendor("Splide");

      this.carousel = new Splide(this.querySelector(".splide"), {
        gap: "1rem",
        mediaQuery: "min",
        arrows: false,
        pagination: true,
        fixedWidth: 304,
        breakpoints: {
          768: {
            gap: "1.5rem",
            arrows: true,
            pagination: false,
          },
        },
      }).mount();
    }

    onDisabled(isDisabled) {
      super.onDisabled(isDisabled);

      const { allAddButtons, allVariantSelectors } = this.refs;

      if (isDisabled) {
        allAddButtons.attr("disabled", true);
        allVariantSelectors.attr("disabled", true);
      } else {
        allAddButtons.attr("disabled", false);
        allVariantSelectors.attr("disabled", false);
      }
    }

    async onAddUpsell(e) {
      e.stopPropagation();
      const upsellItem = e.target;

      const variantId = upsellItem.single
        ? upsellItem.$el.find("input[name='id']").val()
        : upsellItem.$el.find("select option:selected").val();

      await window.Cart.addSingle(variantId, 1);

      this.carousel.remove(upsellItem.index);

    }
  });

  customElements.define("cart-upsell-item", class CartUpsellItem extends Element {
    props = {
      index: 0,
      single: false,
    };

    setup() {
      this.submitEvent = new CustomEvent("submit", { bubbles: true });

      this.querySelector("button").addEventListener("click", this.onSubmit.bind(this));

      const variantSelector = this.querySelector("variant-selector");

      variantSelector.addEventListener("change", this.refreshPrice.bind(this));
    }

    onSubmit() {
      this.dispatchEvent(this.submitEvent);
    }


    refreshPrice() {
      const $selectedOption = this.$el.find(":selected");
      const $pricingEl = this.$el.find(".upsell-item__pricing");


      const price = $selectedOption.data("price");
      const originalPrice = $selectedOption.data("originalPrice");
      const priceInCurrency = Currency.format(price, { maximumFractionDigits: price % 1 === 0 ? 0 : 2 });
      const originalPriceInCurrency = Currency.format(originalPrice, { maximumFractionDigits: originalPrice % 1 === 0 ? 0 : 2 });

      $pricingEl.html(`
      <div class="text-chambray">+${priceInCurrency}</div>
      ${(originalPrice > price) ? `<div class="font-light text-comet line-through">${originalPriceInCurrency}</div>` : ""}
    `);
    }
  });
}




