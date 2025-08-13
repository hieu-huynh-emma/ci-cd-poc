if (!customElements.get("payment-providers")) {
    customElements.define("payment-providers", class PaymentProviders extends Element {
        props = {
            sectionName: "payment-providers",
        };

        beforeMount() {

        }

        render() {
            fetch(`?sections=${this.sectionName}`)
                .then((response) => response.json())
                .then((res) => {
                    const html = new DOMParser().parseFromString(res[this.sectionName], "text/html");

                    this.$el.html(
                        html.querySelector(".payment-providers__listing").innerHTML,
                    );
                });
        }
    });
}
