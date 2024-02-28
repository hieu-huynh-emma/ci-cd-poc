const EXPRESS_CHECKOUT_READY_EVENT = `express-checkout-ready`

class ExpressCheckoutButton extends CustomElement {
    props = {
        provider: ""
    }

    get refs() {
        return {
            $checkoutBtnContent: $("#content_for_additional_checkout_buttons")
        }
    }

    constructor() {
        super();

        window.addEventListener(EXPRESS_CHECKOUT_READY_EVENT, this.renderExpressButton.bind(this))
    }

    renderExpressButton() {
        const {provider} = this.props;
        const {$checkoutBtnContent} = this.refs

        let $btn = ""

        switch (provider) {
            case 'paypal':
                $btn = $checkoutBtnContent.find(`iframe[title*="PayPal"]`)
                break
        }

        this.$el.html($btn)
    }
}

customElements.define('express-checkout-button', ExpressCheckoutButton);

class ExpressCheckoutExtractor extends HTMLElement {
    mutationObserver = null

    constructor() {
        super();

        this.mutationObserver = new MutationObserver(this.onExpressCheckoutReady.bind(this));
    }

    connectedCallback() {
        this.mutationObserver.observe(
            document.querySelector("#content_for_additional_checkout_buttons"),
            {
                childList: true,
                subtree: true,
            },
        );
    }

    onExpressCheckoutReady(mutations) {
        this.mutationObserver.disconnect();
        mutations.forEach(function () {
            window.dispatchEvent(new Event(EXPRESS_CHECKOUT_READY_EVENT))
        })
    }
}

customElements.define('express-checkout-extractor', ExpressCheckoutExtractor);

