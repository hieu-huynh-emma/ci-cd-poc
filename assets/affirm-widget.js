import { EVENTS } from "./data-constants.js";

if (!customElements.get("affirm-widget")) {
    class AffirmWidget extends CustomElement {
        props = {
            page: "product",
            placement: "", // promotion-line
            amount: 0,
        };
        installmentCount = 12;

        initialized = false;

        constructor() {
            super();
        }

        render() {
            if (!this.initialized) return;

            const { placement } = this.props;

            let template = "";

            switch (placement) {
                case "promotion-badge":
                    template = document.querySelector(`#affirm-promotion-badge-tpl`).innerHTML;
                    break;
                case "promotion-line":
                    template = document.querySelector(`#affirm-promotion-line-tpl`).innerHTML;
                    break;
            }

            this.$el.html(template);
        }

        mounted() {
            const { placement, amount, page } = this.props;

            switch (placement) {
                case "promotion-badge":
                    switch (page) {
                        case "product":
                            window.addEventListener("productVariantChange", debounce(this.onVariantChange.bind(this), 100));
                            this.onVariantChange();
                            break;
                        case "cart":
                            document.addEventListener(EVENTS.CART_LOADED, debounce(this.onCartTotalChange.bind(this), 45));
                            document.addEventListener(EVENTS.CART_UPDATED, debounce(this.onCartTotalChange.bind(this), 45));
                            this.onCartTotalChange()
                            break;
                    }

                    break;
                case "promotion-line":
                    this.refresh(amount);
                    break;
            }


        }

        onVariantChange() {
            const $productPrice = $("product-price");

            const { price } = $productPrice.data();

            this.refresh(price);
        }

        onCartTotalChange() {
            const cartTotal = window.Cart.state.cost.total.amount;

            this.refresh(cartTotal);
        }

        // setObserver(promo) {
        //   const targetNode = document.querySelector(promo);
        //   const config = { attributes: true, childList: true, subtree: true };
        //
        //   const callback = (mutationsList) => {
        //     for (let mutation of mutationsList) {
        //       this.onCartTotalChange();
        //     }
        //   };
        //
        //   const observer = new MutationObserver(callback);
        //   if (targetNode) observer.observe(targetNode, config);
        // }


        refresh(price) {
            if (price < 300) {
                return;
            }

            if (!this.initialized) this.initialized = true;

            this.render();

            const installmentData = this.computeInstallment(price, this.installmentCount);

            this.renderInstallmentAmount(installmentData.displayAmountInCurrency);
        }

        computeInstallment(price, terms) {
            const rawAmount = price / terms;
            const amount = parseFloat(rawAmount).toFixed(2);
            const displayAmount = parseFloat(Math.ceil(rawAmount)).toFixed(2);
            const displayAmountInCurrency = Currency.format(displayAmount);

            return {
                rawAmount,
                amount,
                displayAmount,
                displayAmountInCurrency,
            };
        }

        renderInstallmentAmount(amountText) {
            const amountEl = this.querySelector(`[slot="installment-amount"]`);

            setTimeout(() => {
                amountEl.textContent = amountText;
            }, 10);
        }
    }

    customElements.define("affirm-widget", AffirmWidget);


}

