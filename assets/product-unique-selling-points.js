if (!customElements.get("product-unique-selling-points")) {


    customElements.define("product-unique-selling-points", class extends CustomElement {
        props = {
            paymentProviderSection: ""
        }

        mounted() {
            super.mounted();

            this.renderPaymentProviders()
        }

        renderPaymentProviders() {
            const $paymentProviderEl = this.$el.find(".payment-providers")

            if (!$paymentProviderEl.length) return

            const {paymentProviderSection} = this.props

            fetch(`?sections=${paymentProviderSection}`)
            .then((response) => response.json())
            .then((res) => {
                const html = new DOMParser().parseFromString(res[paymentProviderSection], 'text/html');

                $paymentProviderEl.find('.payment-providers__listing_new').html(
                    html.querySelector('.payment-providers__listing').innerHTML
                );
            });
        }
    });

}
