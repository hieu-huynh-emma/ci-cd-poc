if (!customElements.get("cart-cta")) {
  customElements.define("cart-cta", class CartCTA extends Element {
    props = {};

    mounted() {
      this.$el.find("loader-element").remove();
    }

  });
}

if (!customElements.get("checkout-button")) {
  customElements.define("checkout-button", class CheckoutButton extends Button {
    props = {
      trackId: "Check_out",
    };

    constructor() {
      super();
    }

    mounted() {
      this.loader = $("<loader-element :type='spinner'></loader-element>").get(0);
      this.prepend(this.loader);

      this.loader.hide();
    }

    onClick(e) {
      super.onClick(e);

      if (this.trackId) {
        window.dataLayer.push({
          event: "click",
          click_type: this.trackId,
        });
      }

      if (
        typeof window.ABTasty !== "undefined" &&
        typeof window.ABTasty.eventState !== "undefined" &&
        !!window.ABTasty.eventState["executedCampaign"] &&
        window.ABTasty.eventState["executedCampaign"].status === "complete" &&
        typeof window.ABTastyClickTracking !== "undefined"
      ) {
        window.ABTastyClickTracking?.("Checkout Button CTR");
      }


      this.loading = true;

      window.location.href = window.Cart.checkoutUrl;

    }

    onLoad(isLoading) {
      super.onLoad(isLoading);

      this.loader?.[isLoading ? "show" : "hide"]();
    }
  });
}


if (!customElements.get("express-checkout-controller")) {
  customElements.define("express-checkout-button", class ExpressCheckoutButton extends Button {
    props = {
      provider: "",
      trackId: "Express_Checkout",
    };

    target;

    setup() {
      this.$el.css({ "transform": "scale(0)" });
      const observer = new MutationObserver(() => {
        observer.disconnect();
        this.renderButton();
      });

      window.addEventListener("load", () => {

        const additionalCheckoutButtons = document.querySelector("#content_for_additional_checkout_buttons");

        if (!additionalCheckoutButtons.innerHTML.trim().length) {
          observer.observe(document.querySelector("#content_for_additional_checkout_buttons"), {
            childList: true,
            subtree: true,
          });
        } else {
          this.renderButton();
        }

      });
    }

    renderButton() {
      console.log("%c 1 --> Line: 100||cart-cta.js\n 2: ", "color:#f0f;", 2);

      const expressCheckout = document.querySelector("#dynamic-checkout-cart");

      if (!expressCheckout) return;

      let target = "", markup = "";

      const markups = {
        "paypal": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMTAwIDMyIiB4bWxucz0iaHR0cDomI3gyRjsmI3gyRjt3d3cudzMub3JnJiN4MkY7MjAwMCYjeDJGO3N2ZyIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pbllNaW4gbWVldCI+PHBhdGggZmlsbD0iIzAwMzA4NyIgZD0iTSAxMiA0LjkxNyBMIDQuMiA0LjkxNyBDIDMuNyA0LjkxNyAzLjIgNS4zMTcgMy4xIDUuODE3IEwgMCAyNS44MTcgQyAtMC4xIDI2LjIxNyAwLjIgMjYuNTE3IDAuNiAyNi41MTcgTCA0LjMgMjYuNTE3IEMgNC44IDI2LjUxNyA1LjMgMjYuMTE3IDUuNCAyNS42MTcgTCA2LjIgMjAuMjE3IEMgNi4zIDE5LjcxNyA2LjcgMTkuMzE3IDcuMyAxOS4zMTcgTCA5LjggMTkuMzE3IEMgMTQuOSAxOS4zMTcgMTcuOSAxNi44MTcgMTguNyAxMS45MTcgQyAxOSA5LjgxNyAxOC43IDguMTE3IDE3LjcgNi45MTcgQyAxNi42IDUuNjE3IDE0LjYgNC45MTcgMTIgNC45MTcgWiBNIDEyLjkgMTIuMjE3IEMgMTIuNSAxNS4wMTcgMTAuMyAxNS4wMTcgOC4zIDE1LjAxNyBMIDcuMSAxNS4wMTcgTCA3LjkgOS44MTcgQyA3LjkgOS41MTcgOC4yIDkuMzE3IDguNSA5LjMxNyBMIDkgOS4zMTcgQyAxMC40IDkuMzE3IDExLjcgOS4zMTcgMTIuNCAxMC4xMTcgQyAxMi45IDEwLjUxNyAxMy4xIDExLjIxNyAxMi45IDEyLjIxNyBaIj48L3BhdGg+PHBhdGggZmlsbD0iIzAwMzA4NyIgZD0iTSAzNS4yIDEyLjExNyBMIDMxLjUgMTIuMTE3IEMgMzEuMiAxMi4xMTcgMzAuOSAxMi4zMTcgMzAuOSAxMi42MTcgTCAzMC43IDEzLjYxNyBMIDMwLjQgMTMuMjE3IEMgMjkuNiAxMi4wMTcgMjcuOCAxMS42MTcgMjYgMTEuNjE3IEMgMjEuOSAxMS42MTcgMTguNCAxNC43MTcgMTcuNyAxOS4xMTcgQyAxNy4zIDIxLjMxNyAxNy44IDIzLjQxNyAxOS4xIDI0LjgxNyBDIDIwLjIgMjYuMTE3IDIxLjkgMjYuNzE3IDIzLjggMjYuNzE3IEMgMjcuMSAyNi43MTcgMjkgMjQuNjE3IDI5IDI0LjYxNyBMIDI4LjggMjUuNjE3IEMgMjguNyAyNi4wMTcgMjkgMjYuNDE3IDI5LjQgMjYuNDE3IEwgMzIuOCAyNi40MTcgQyAzMy4zIDI2LjQxNyAzMy44IDI2LjAxNyAzMy45IDI1LjUxNyBMIDM1LjkgMTIuNzE3IEMgMzYgMTIuNTE3IDM1LjYgMTIuMTE3IDM1LjIgMTIuMTE3IFogTSAzMC4xIDE5LjMxNyBDIDI5LjcgMjEuNDE3IDI4LjEgMjIuOTE3IDI1LjkgMjIuOTE3IEMgMjQuOCAyMi45MTcgMjQgMjIuNjE3IDIzLjQgMjEuOTE3IEMgMjIuOCAyMS4yMTcgMjIuNiAyMC4zMTcgMjIuOCAxOS4zMTcgQyAyMy4xIDE3LjIxNyAyNC45IDE1LjcxNyAyNyAxNS43MTcgQyAyOC4xIDE1LjcxNyAyOC45IDE2LjExNyAyOS41IDE2LjcxNyBDIDMwIDE3LjQxNyAzMC4yIDE4LjMxNyAzMC4xIDE5LjMxNyBaIj48L3BhdGg+PHBhdGggZmlsbD0iIzAwMzA4NyIgZD0iTSA1NS4xIDEyLjExNyBMIDUxLjQgMTIuMTE3IEMgNTEgMTIuMTE3IDUwLjcgMTIuMzE3IDUwLjUgMTIuNjE3IEwgNDUuMyAyMC4yMTcgTCA0My4xIDEyLjkxNyBDIDQzIDEyLjQxNyA0Mi41IDEyLjExNyA0Mi4xIDEyLjExNyBMIDM4LjQgMTIuMTE3IEMgMzggMTIuMTE3IDM3LjYgMTIuNTE3IDM3LjggMTMuMDE3IEwgNDEuOSAyNS4xMTcgTCAzOCAzMC41MTcgQyAzNy43IDMwLjkxNyAzOCAzMS41MTcgMzguNSAzMS41MTcgTCA0Mi4yIDMxLjUxNyBDIDQyLjYgMzEuNTE3IDQyLjkgMzEuMzE3IDQzLjEgMzEuMDE3IEwgNTUuNiAxMy4wMTcgQyA1NS45IDEyLjcxNyA1NS42IDEyLjExNyA1NS4xIDEyLjExNyBaIj48L3BhdGg+PHBhdGggZmlsbD0iIzAwOWNkZSIgZD0iTSA2Ny41IDQuOTE3IEwgNTkuNyA0LjkxNyBDIDU5LjIgNC45MTcgNTguNyA1LjMxNyA1OC42IDUuODE3IEwgNTUuNSAyNS43MTcgQyA1NS40IDI2LjExNyA1NS43IDI2LjQxNyA1Ni4xIDI2LjQxNyBMIDYwLjEgMjYuNDE3IEMgNjAuNSAyNi40MTcgNjAuOCAyNi4xMTcgNjAuOCAyNS44MTcgTCA2MS43IDIwLjExNyBDIDYxLjggMTkuNjE3IDYyLjIgMTkuMjE3IDYyLjggMTkuMjE3IEwgNjUuMyAxOS4yMTcgQyA3MC40IDE5LjIxNyA3My40IDE2LjcxNyA3NC4yIDExLjgxNyBDIDc0LjUgOS43MTcgNzQuMiA4LjAxNyA3My4yIDYuODE3IEMgNzIgNS42MTcgNzAuMSA0LjkxNyA2Ny41IDQuOTE3IFogTSA2OC40IDEyLjIxNyBDIDY4IDE1LjAxNyA2NS44IDE1LjAxNyA2My44IDE1LjAxNyBMIDYyLjYgMTUuMDE3IEwgNjMuNCA5LjgxNyBDIDYzLjQgOS41MTcgNjMuNyA5LjMxNyA2NCA5LjMxNyBMIDY0LjUgOS4zMTcgQyA2NS45IDkuMzE3IDY3LjIgOS4zMTcgNjcuOSAxMC4xMTcgQyA2OC40IDEwLjUxNyA2OC41IDExLjIxNyA2OC40IDEyLjIxNyBaIj48L3BhdGg+PHBhdGggZmlsbD0iIzAwOWNkZSIgZD0iTSA5MC43IDEyLjExNyBMIDg3IDEyLjExNyBDIDg2LjcgMTIuMTE3IDg2LjQgMTIuMzE3IDg2LjQgMTIuNjE3IEwgODYuMiAxMy42MTcgTCA4NS45IDEzLjIxNyBDIDg1LjEgMTIuMDE3IDgzLjMgMTEuNjE3IDgxLjUgMTEuNjE3IEMgNzcuNCAxMS42MTcgNzMuOSAxNC43MTcgNzMuMiAxOS4xMTcgQyA3Mi44IDIxLjMxNyA3My4zIDIzLjQxNyA3NC42IDI0LjgxNyBDIDc1LjcgMjYuMTE3IDc3LjQgMjYuNzE3IDc5LjMgMjYuNzE3IEMgODIuNiAyNi43MTcgODQuNSAyNC42MTcgODQuNSAyNC42MTcgTCA4NC4zIDI1LjYxNyBDIDg0LjIgMjYuMDE3IDg0LjUgMjYuNDE3IDg0LjkgMjYuNDE3IEwgODguMyAyNi40MTcgQyA4OC44IDI2LjQxNyA4OS4zIDI2LjAxNyA4OS40IDI1LjUxNyBMIDkxLjQgMTIuNzE3IEMgOTEuNCAxMi41MTcgOTEuMSAxMi4xMTcgOTAuNyAxMi4xMTcgWiBNIDg1LjUgMTkuMzE3IEMgODUuMSAyMS40MTcgODMuNSAyMi45MTcgODEuMyAyMi45MTcgQyA4MC4yIDIyLjkxNyA3OS40IDIyLjYxNyA3OC44IDIxLjkxNyBDIDc4LjIgMjEuMjE3IDc4IDIwLjMxNyA3OC4yIDE5LjMxNyBDIDc4LjUgMTcuMjE3IDgwLjMgMTUuNzE3IDgyLjQgMTUuNzE3IEMgODMuNSAxNS43MTcgODQuMyAxNi4xMTcgODQuOSAxNi43MTcgQyA4NS41IDE3LjQxNyA4NS43IDE4LjMxNyA4NS41IDE5LjMxNyBaIj48L3BhdGg+PHBhdGggZmlsbD0iIzAwOWNkZSIgZD0iTSA5NS4xIDUuNDE3IEwgOTEuOSAyNS43MTcgQyA5MS44IDI2LjExNyA5Mi4xIDI2LjQxNyA5Mi41IDI2LjQxNyBMIDk1LjcgMjYuNDE3IEMgOTYuMiAyNi40MTcgOTYuNyAyNi4wMTcgOTYuOCAyNS41MTcgTCAxMDAgNS42MTcgQyAxMDAuMSA1LjIxNyA5OS44IDQuOTE3IDk5LjQgNC45MTcgTCA5NS44IDQuOTE3IEMgOTUuNCA0LjkxNyA5NS4yIDUuMTE3IDk1LjEgNS40MTcgWiI+PC9wYXRoPjwvc3ZnPg",
        "shop-pay": "data:image/jpeg;base64,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",
      };

      switch (this.provider) {
        case "paypal":
          target = "shopify-paypal-button";
          markup = markups[this.provider];
          break;
        case "shop-pay":
          target = "shop-pay-wallet-button";
          markup = markups[this.provider];
          break;
        case "google-pay":
          target = "shopify-google-pay-button";
          break;
        default:
      }

      const template = expressCheckout.querySelector(target);

      if (!template) return;

      this.$el.find(`[slot="source"]`).append(template);

      if (markup) {
        this.$el.append(`<img height="20" class="paypal-button-logo paypal-button-logo-paypal paypal-button-logo-gold" src="${markup}" alt="" aria-label="paypal">`);
      }

      this.$el.css({ "transform": "scale(1)" });

    }

    template() {
      return `
               <div slot="source"></div>
            `;
    }

    onClick(e) {
      super.onClick(e);

      if (this.trackId) {
        window.dataLayer.push({
          event: "click",
          click_type: this.trackId,
        });
      }
      if (
        typeof window.ABTasty !== "undefined" &&
        typeof window.ABTasty.eventState !== "undefined" &&
        !!window.ABTasty.eventState["executedCampaign"] &&
        window.ABTasty.eventState["executedCampaign"].status === "complete" &&
        typeof window.ABTastyClickTracking !== "undefined"
      ) {
        window.ABTastyClickTracking?.("Checkout Button CTR");
      }
    }
  });
}


if (!customElements.get("express-checkout-controller")) {
  customElements.define("express-checkout-controller", class ExpressCheckoutController extends Button {
    props = {
      wallet: "Paypal", // PayPal, ShopPay, GooglePay, ApplePay
    };

    setup(props) {
      const shopifyAcceleratedCheckout = document.querySelector("shopify-accelerated-checkout-cart");
      let walletContainer;

      const observer = new MutationObserver((mutations) => {
        walletContainer = shopifyAcceleratedCheckout.wrapper;

        if (walletContainer) {
          observer.disconnect();

          walletContainer.insertAdjacentHTML("afterbegin", `
                <style>
                  .accelerated-checkout-button-container .wallet-cart-button-container {
                    display: none
                  }
                  .accelerated-checkout-button-container .wallet-cart-button-container:has(slot[name="button-${props.wallet}"]) {
                    display: block
                  }
                </style>
          `);

          this.$el.css({ "--scale": 1 });

        }
      });

      window.addEventListener("load", () => {

        observer.observe(shopifyAcceleratedCheckout, {
          childList: true,
          subtree: true,
        });
      });

    }

    onClick(e) {
      super.onClick(e);
      let trackId;

      switch (this.provider) {
        case "paypal":
          trackId = "Paypal_cart";
          break;
        case "google-pay":
          trackId = "GooglePay_cart";
          break;
        default:
          trackId = "ShopPay_cart";
      }

      window.dataLayer.push({
        event: "click",
        click_type: this.trackId,
      });

      if (
        typeof window.ABTasty !== "undefined" &&
        typeof window.ABTasty.eventState !== "undefined" &&
        !!window.ABTasty.eventState["executedCampaign"] &&
        window.ABTasty.eventState["executedCampaign"].status === "complete" &&
        typeof window.ABTastyClickTracking !== "undefined"
      ) {
        window.ABTastyClickTracking?.("Checkout Button CTR");
      }
    }
  });
}
