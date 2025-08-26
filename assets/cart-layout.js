import { EVENTS } from "./data-constants.js";

if (!customElements.get("cart-layout")) {
  customElements.define("cart-layout", class CartLayout extends Element {
    props = {
      sectionId: "",
      count: 0,
    };
    schema = [
      {
        sectionId: "cart-summary",
        reposition: true,
      },
      {
        sectionId: "cart-upsell",
        disabledOnMobile: true,
        reposition: true,

      },
      {
        sectionId: "cart-usps",
        reposition: true,

      },
      {
        sectionId: "contact-us",
        reveal: true,
      },
    ];

    templateId = "";

    get refs() {
      return {
        $loaderEl: this.$el.find("main > loader-element"),
      };
    }

    setup() {
      this.templateId = this.sectionId.split("__")[0];

      this.schema.forEach(this.loadSection.bind(this));
      this.$el.addClass("is-initialized");
    }

    setupListeners() {
      document.addEventListener(EVENTS.CART_LOADED, this.onCartChange.bind(this), { once: true });

      document.addEventListener(EVENTS.CART_UPDATED, this.onCartChange.bind(this));

      window.addEventListener("load", () => {
        this.querySelectorAll(`[name="additional-info"], [name="usps"]`).forEach((el) => {
          if (el.querySelector("*:not(template)")) {
            el.removeAttribute("hidden");
          }
        });
      });
    }

    onCartChange() {
      if (!window.Cart?.state) return;

      const { $loaderEl } = this.refs;

      if ($loaderEl.length) $loaderEl.remove();

      this.count = window.Cart.state.totalQuantity || 0;
    }

    render() {
      const $cartEmpty = this.$el.find(".cart-empty");
      const $cartLines = this.$el.find("cart-lines");
      const $cartDisclaimer = this.$el.find(".cart-disclaimer");
      const $deliveryWidget = this.$el.find(".delivery-widget__manual");

      const $summaryPanel = this.$el.find(".cart-panel[name='summary']");
      const $affirmWidgetBlock = this.$el.find(".cart-block[name='affirm-widget']");

      if (!this.count) {
        $cartEmpty.attr("hidden", false);

        $cartLines.attr("hidden", true);
        $cartDisclaimer.attr("hidden", true);
        $deliveryWidget.attr("hidden", true);
        $summaryPanel.attr("hidden", true);
        $affirmWidgetBlock.attr("hidden", true);
      } else {
        $cartEmpty.attr("hidden", true);

        $cartLines.attr("hidden", false);
        $cartDisclaimer.attr("hidden", false);
        $deliveryWidget.attr("hidden", false);
        $summaryPanel.attr("hidden", false);
        $affirmWidgetBlock.attr("hidden", false);
      }
    }

    loadSection({
                  sectionId,
                  disabledOnMobile,
                  type,
                  outletQuery,
                  insertPosition,
                  reveal = false,
                  reposition = false,
                  blocks = [],
                }) {
      const sectionEl = document.querySelector(`#shopify-section-${this.templateId}__${sectionId}`);

      if (!sectionEl) return;

      const screenWidth = window.innerWidth;

      const isMobileScreen = screenWidth < 769;

      if (isMobileScreen && disabledOnMobile) return;

      if (reposition) {
        const processedEl = type === "clone" ? sectionEl.cloneNode(true) : sectionEl.parentElement.removeChild(sectionEl);

        if (outletQuery) {
          const outletEl = document.querySelector(outletQuery);
          outletEl?.insertAdjacentElement(insertPosition, processedEl);
        } else {
          const sectionPlaceholderEl = document.querySelector(`#cart-layout #${sectionId}-placeholder`);
          sectionPlaceholderEl?.replaceWith(processedEl);
        }

        if (blocks.length > 0) {
          blocks.forEach(({ query, insertPosition, outletQuery }) => {
            try {
              const blockEl = sectionEl.querySelector(query);
              if (!blockEl) return;
              const detachedBlockEl = blockEl.parentElement.removeChild(blockEl);
              const outletEl = document.querySelector(outletQuery);

              outletEl.insertAdjacentElement(insertPosition, detachedBlockEl);
            } catch (e) {
              console.error(e);
            }
          });
        }
        setTimeout(() => {
          sectionEl.classList.add("is-initialized");
        }, 500);
      }

      if (reveal || reposition) {
        sectionEl.classList.remove("hidden", "hide-until-initialized");
      }
    }


  });
}
