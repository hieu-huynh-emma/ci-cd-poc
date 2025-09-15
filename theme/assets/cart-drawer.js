if (!customElements.get("cart-drawer")) {
    customElements.define("cart-drawer", class CartDrawer extends CustomElement {
        // shopifyCheckoutToken = null;
        // shopifyAuthorizationToken = null;

        // checkout = {};

        // firstVisit = true

        get refs() {
            return {
                cartSurface: document.querySelector('cart-surface'),
                scrollableContent: this.$el.find('cart-scrollable-content').get(0),
                // cartSummary: document.getElementById('CartDrawerSummary'),
                // cartRedeem: document.getElementById('CartRedeemCode'),
                cartItems: this.querySelector('cart-drawer-items'),
                cartRecommendation: this.querySelector("cart-recommendation") || {}
            }
        }

        async mounted() {
            this.renderShipOutTime();
        }

        renderShipOutTime() {
            const $shipOutTime = this.$el.find(".cart-banner")

            if (!$shipOutTime.length) return

            const dateInEst = (new Date()).toLocaleString('en-US', {timeZone: 'America/New_York', hour12: false})
            const currentHour = new Date(dateInEst).getHours()

            $shipOutTime.find('.cart-banner__content')
                        .text((currentHour > 14) ? $shipOutTime.data('shipNext') : $shipOutTime.data('shipNow'))
        }

        renderContents(parsedState) {
            this.getSectionsToRender().forEach((section) => {
                const sectionElement = document.getElementById(section.id)
                                               .querySelector(section.selector) || document.getElementById(section.id);

                sectionElement.innerHTML = this.getSectionInnerHTML(
                    parsedState.sections[section.section],
                    section.selector
                );
            });
        }

        getSectionInnerHTML(html, selector = ".shopify-section") {
            return new DOMParser()
            .parseFromString(html, "text/html")
            .querySelector(selector).innerHTML;
        }

        getSectionsToRender() {
            return [
                {
                    id: 'shopify-section-cart-drawer-items',
                    section: "cart-drawer-items",
                    selector: "cart-drawer-items"
                },
                {
                    id: "shopify-section-cart-drawer-header",
                    section: "cart-drawer-header",
                    selector: ".drawer-title-container",
                }
                , {
                    id: "shopify-section-cart-recommendation", section: "cart-recommendation"
                }
            ];
        }

        getSectionDOM(html, selector = ".shopify-section") {
            return new DOMParser()
            .parseFromString(html, "text/html")
            .querySelector(selector);
        }

        onLoad(isLoading) {
            this.$el[!!isLoading ? 'addClass' : 'removeClass']('is-loading')
        }

        async refresh() {
            try {
                const url = new URL(window.location.origin)

                const renderSections = this.getSectionsToRender().map((section) => section.section).join(',')
                url.searchParams.append("sections", renderSections)

                const cartSections = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json', 'Accept': `application/json`
                    }
                }).then(res => res.json());

                this.renderContents({sections: cartSections})
            } catch (e) {
                console.error(e)
            }
        }
    });
}

if (!customElements.get("cart-scrollable-content")) {
    customElements.define("cart-scrollable-content", class CartScrollableContent extends CustomElement {
    });
}

if (!customElements.get("cart-drawer-footer")) {
    customElements.define("cart-drawer-footer", class CartDrawerFooter extends CustomElement {
        get refs() {
            return {
                checkoutBtn: this.$el.find("button")
            }
        }

        onDisabledChange(isDisabled) {
            super.onDisabledChange(isDisabled);

            const {checkoutBtn} = this.refs

            checkoutBtn[!!isDisabled ? 'attr' : 'removeAttr']('disabled', 'disabled')
        }
    });
}




