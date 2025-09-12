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
            // const {cartRedeem, cartSurface} = this.refs

            // const isEmpty = cartSurface.$el.hasClass('is-empty')
            //
            // if (!isEmpty) {
            // 	await this.loadCheckout();
            // 	cartRedeem.renderDiscountTag();
            // }
        }

        renderShipOutTime() {
            const $shipOutTime = this.$el.find(".cart-banner")

            if (!$shipOutTime.length) return

            const dateInEst = (new Date()).toLocaleString('en-US', {timeZone: 'America/New_York', hour12: false})
            const currentHour = new Date(dateInEst).getHours()

            $shipOutTime.find('.cart-banner__content')
                        .text((currentHour > 14) ? $shipOutTime.data('shipNext') : $shipOutTime.data('shipNow'))
        }

        // async loadCheckout() {
        //
        // 	this.loading = true
        // 	cartItems.disabled = true
        // 	cartRedeem.loading = true
        // 	cartRecommendation.disabled = true
        //
        // 	try {
        // 		await this.parseCheckoutPage();
        //
        // 		await this.getCheckoutData();
        //
        // 	} catch (e) {
        // 		toastr.error(e)
        // 	} finally {
        // 		this.loading = false
        // 		cartItems.disabled = false
        // 		cartRedeem.loading = false
        // 		cartRecommendation.disabled = false
        // 	}
        // }

        // async parseCheckoutPage() {
        // 	let gettingShopifyCheckoutPagePromise = fetch('/checkout', {method: 'get'});
        // 	const response = (await gettingShopifyCheckoutPagePromise).clone();
        // 	gettingShopifyCheckoutPagePromise = null;
        // 	try {
        // 		const urlParts = response.url.split('/checkouts/');
        // 		if (urlParts.length < 2) {
        // 			return false;
        // 		}
        // 		this.shopifyCheckoutToken = urlParts[1].split('?')[0].split('/')[0]
        // 		const text = await response.text();
        // 		let parser = new DOMParser();
        // 		const doc = parser.parseFromString(text, 'text/html');
        // 		const metaEl = doc.querySelector('meta[name="shopify-checkout-authorization-token"]');
        // 		if (!metaEl) {
        // 			return false;
        // 		}
        // 		this.shopifyAuthorizationToken = metaEl.getAttribute('content');
        //
        //
        // 		return true;
        // 	} catch (e) {
        // 		console.log(e);
        // 		return false;
        // 	}
        // }

        // async getCheckoutData() {
        // 	const response = await this.requestCheckout();
        // 	this.checkout = response.checkout;
        //
        // 	return this.checkout
        // }

        // async updateCheckoutData(payload) {
        // 	const response = await this.requestCheckout(payload, 'PUT');
        // 	this.checkout = response.checkout;
        // }

        // async requestCheckout(payload, method = 'get') {
        // 	const response = await fetch(
        // 		`/wallets/checkouts/${this.shopifyCheckoutToken}?source=cartDrawer`,
        // 		{
        // 			method,
        // 			mode: 'cors',
        // 			headers: {
        // 				'Accept': '*/*',
        // 				'Cache-Control': 'max-age=0',
        // 				'x-shopify-checkout-authorization-token': this.shopifyAuthorizationToken,
        // 				'Content-Type': 'application/json'
        // 			},
        // 			...(!!payload ? {body: JSON.stringify(payload)} : {})
        // 		});
        // 	if (response.status === 429) {
        // 		throw "You have tried applying discount codes too many times. Please try again later";
        // 	}
        // 	if (response.ok) {
        // 		return response.json();
        // 	} else {
        // 		throw await response.json();
        // 	}
        // }

        // setSummaryAccessibility(cartDrawerNote) {
        //     cartDrawerNote.setAttribute("role", "button");
        //     cartDrawerNote.setAttribute("aria-expanded", "false");
        //
        //     if (cartDrawerNote.nextElementSibling.getAttribute("id")) {
        //         cartDrawerNote.setAttribute(
        //             "aria-controls",
        //             cartDrawerNote.nextElementSibling.id
        //         );
        //     }
        //
        //     cartDrawerNote.addEventListener("click", (event) => {
        //         event.currentTarget.setAttribute(
        //             "aria-expanded",
        //             !event.currentTarget.closest("details").hasAttribute("open")
        //         );
        //     });
        //
        //     cartDrawerNote.parentElement.addEventListener("keyup", onKeyUpEscape);
        // }

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




