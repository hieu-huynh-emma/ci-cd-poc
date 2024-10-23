class CartDrawer extends CustomElement {
  shopifyCheckoutToken = null;
  shopifyAuthorizationToken = null;

  checkout = {};

  firstVisit = true

  get refs() {
    return {
      cartSurface: document.querySelector('cart-surface'),
      scrollableContent: this.$el.find('cart-scrollable-content').get(0),
      cartSummary: document.getElementById('CartDrawerSummary'),
      cartRedeem: document.getElementById('CartRedeemCode'),
      cartItems: this.querySelector('cart-drawer-items'),
      cartRecommendation: this.querySelector("cart-recommendation"),
      cartIconBubble: document.getElementById('cart-icon-bubble')
    }
  }

  async mounted() {
    this.renderShipOutTime();

    const { cartRedeem, cartSurface } = this.refs

    const isEmpty = cartSurface.$el.hasClass('is-empty')

    if (!isEmpty) {
      await this.loadCheckout();
      cartRedeem.renderDiscountTag();
    }
  }

  renderShipOutTime() {
    const $shipOutTime = this.$el.find(".cart-banner")

    if (!$shipOutTime.length) return

    const dateInEst = (new Date()).toLocaleString('en-US', { timeZone: 'America/New_York', hour12: false })
    const currentHour = new Date(dateInEst).getHours()

    $shipOutTime.find('.cart-banner__content').text((currentHour > 14) ? $shipOutTime.data('shipNext') : $shipOutTime.data('shipNow'))
  }

  async loadCheckout() {
    const { cartItems, cartRecommendation, cartRedeem, cartIconBubble } = this.refs

    this.loading = true
    cartItems.disabled = true
    cartRedeem.loading = true
    cartIconBubble.loading = true
    cartRecommendation.disabled = true

    try {
      await this.parseCheckoutPage();

      await this.getCheckoutData();

    } catch (e) {
      toastr.error(e)
    } finally {
      this.loading = false
      cartItems.disabled = false
      cartRedeem.loading = false
      cartIconBubble.loading = false
      cartRecommendation.disabled = false
    }
  }

  async parseCheckoutPage() {
    let gettingShopifyCheckoutPagePromise = fetch('/checkout', { method: 'get' });
    const response = (await gettingShopifyCheckoutPagePromise).clone();
    gettingShopifyCheckoutPagePromise = null;
    try {
      const urlParts = response.url.split('/checkouts/');
      if (urlParts.length < 2) {
        return false;
      }
      this.shopifyCheckoutToken = urlParts[1].split('?')[0].split('/')[0]
      const text = await response.text();
      let parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const metaEl = doc.querySelector('meta[name="shopify-checkout-authorization-token"]');
      if (!metaEl) {
        return false;
      }
      this.shopifyAuthorizationToken = metaEl.getAttribute('content');


      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async getCheckoutData() {
    const response = await this.requestCheckout();
    this.checkout = response.checkout;

    return this.checkout
  }

  async updateCheckoutData(payload) {
    const response = await this.requestCheckout(payload, 'PUT');
    this.checkout = response.checkout;
  }

  async requestCheckout(payload, method = 'get') {
    const response = await fetch(
      `/wallets/checkouts/${this.shopifyCheckoutToken}?source=cartDrawer`,
      {
        method,
        mode: 'cors',
        headers: {
          'Accept': '*/*',
          'Cache-Control': 'max-age=0',
          'x-shopify-checkout-authorization-token': this.shopifyAuthorizationToken,
          'Content-Type': 'application/json'
        },
        ...(!!payload ? { body: JSON.stringify(payload) } : {})
      });
    if (response.status === 429) {
      throw "You have tried applying discount codes too many times. Please try again later";
    }
    if (response.ok) {
      return response.json();
    } else {
      throw await response.json();
    }
  }

  setSummaryAccessibility(cartDrawerNote) {
    cartDrawerNote.setAttribute("role", "button");
    cartDrawerNote.setAttribute("aria-expanded", "false");

    if (cartDrawerNote.nextElementSibling.getAttribute("id")) {
      cartDrawerNote.setAttribute(
        "aria-controls",
        cartDrawerNote.nextElementSibling.id
      );
    }

    cartDrawerNote.addEventListener("click", (event) => {
      event.currentTarget.setAttribute(
        "aria-expanded",
        !event.currentTarget.closest("details").hasAttribute("open")
      );
    });

    cartDrawerNote.parentElement.addEventListener("keyup", onKeyUpEscape);
  }

  renderContents(parsedState) {
    this.getSectionsToRender().forEach((section) => {
      const sectionElement = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

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
        id: "shopify-section-cart-drawer-summary",
        section: "cart-drawer-summary",
        selector: ".summary-list",
      },

      {
        id: "shopify-section-cart-drawer-summary",
        section: "cart-drawer-summary",
        selector: "#CartTotals",
      },

      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
        selector: ".cart-icon-bubble"
      },
      {
        id: "shopify-section-cart-drawer-header",
        section: "cart-drawer-header",
        selector: ".drawer-title-container",
      },
      {
        id: "shopify-section-cart-drawer-upsell",
        section: "cart-drawer-upsell"
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
}

customElements.define("cart-drawer", CartDrawer);

class CartDrawerSummary extends CustomElement {
  props = {
    originalPrice: 0
  };

  beforeMount() {
    this.mutationObserver.observe(this, {
      childList: true,
      subtree: true,
      characterDataOldValue: true
    });
  }

  mounted() {
    // Extend - Dispatch refreshAjaxSideCart on cart load
    window.setTimeout(function() {
      window.dispatchEvent(new CustomEvent('refreshAjaxSideCart'))
    }, 1000)
    // Extend - End code

    const $originalPriceEl = this.$el.find('#CartOriginalPrice')
    const $totalPriceEl = this.$el.find("#CartTotalPrice")
    const $totalSavedEl = this.$el.find("#CartTotalSaved")

    const totalPrice = $totalPriceEl.data("total")
    const originalPrice = $totalPriceEl.data("original-price")

    if (totalPrice === originalPrice) {
      $originalPriceEl.addClass('hidden')
      $totalSavedEl.addClass('hidden')
    }
  }

  onMutation(mutationRecords) {
    console.log('mutation')
    // Extend - Dispatch refreshAjaxSideCart on cart load
    window.dispatchEvent(new CustomEvent('refreshAjaxSideCart'))
    // Extend - End code

    const hasCartTotalsChanged = mutationRecords.some(r => r.target.id === "CartTotals")

    const hasTotalPriceChanged = mutationRecords.some(r => r.target.id === "CartTotalPrice" && !!r.addedNodes.length)

    if (!!hasCartTotalsChanged || !!hasTotalPriceChanged) {
      this.onPriceChange()
    }
  }

  onPriceChange() {
    console.log('onPriceChange')

    const $originalPriceEl = this.$el.find('#CartOriginalPrice')
    const $totalPriceEl = this.$el.find("#CartTotalPrice")
    const $totalSavedEl = this.$el.find("#CartTotalSaved")

    const totalPrice = parseFloat($totalPriceEl.data("total"))
    const discountedTotal = parseFloat($totalPriceEl.data("discounted-total") || 0)
    const originalPrice = parseFloat($totalPriceEl.data("original-price"))

    if (originalPrice > totalPrice || (!!discountedTotal && originalPrice > discountedTotal)) {
      $originalPriceEl.removeClass('hidden')
      $totalSavedEl.removeClass('hidden')
    } else {
      $originalPriceEl.addClass('hidden')
      $totalSavedEl.addClass('hidden')
    }


    // this.refreshKlarnaWidget(discountedTotal || totalPrice)
  }

  clearTotalPrice() {
    const $totalPriceEl = this.$el.find("#CartTotalPrice")

    const totalPrice = $totalPriceEl.data("total")
    const originalPrice = $totalPriceEl.data("original-price")

    this.refreshCartPrices(totalPrice, originalPrice)
  }

  computeDiscountedTotal() {
    console.log('computeDiscountedTotal')
    const cartRedeemEl = document.getElementById('CartRedeemCode');
    const codeRedeemed = cartRedeemEl.codeRedeemed

    const cart = document.getElementById('CartDrawer');

    const checkout = cart.checkout

    const $totalPriceEl = this.$el.find("#CartTotalPrice")

    if (!codeRedeemed) {
      $totalPriceEl.data('discounted-total', 0)

      return
    }

    if (!cart || !checkout) return

    const totalPrice = parseFloat(checkout.total_price)
    const originalPrice = parseFloat(checkout.line_items.reduce((r, item) => r + item.quantity * (+item.compare_at_price || +item.price), 0));

    this.refreshCartPrices(totalPrice, originalPrice)
  }

  refreshCartPrices(finalPrice, originalPrice) {
    const $totalPriceEl = this.$el.find("#CartTotalPrice");
    const $totalSavedEl = this.$el.find('#CartTotalSaved');

    const totalSaved = originalPrice - finalPrice

    const totalPriceInCurrency = Currency.format(finalPrice, { maximumFractionDigits: finalPrice % 1 === 0 ? 0 : 2 });
    const totalSavedInCurrency = Currency.format(totalSaved, { maximumFractionDigits: totalSaved % 1 === 0 ? 0 : 2 });

    $totalPriceEl.data('discounted-total', finalPrice)

    $totalPriceEl.text(totalPriceInCurrency)
    $totalSavedEl.find(".saved-amount").text(totalSavedInCurrency)
  }

  refreshKlarnaWidget(totalPrice) {

    document.getElementsByTagName("klarna-placement")[0].setAttribute("data-purchase-amount", parseFloat(totalPrice * 100).toFixed(0));

    window.KlarnaOnsiteService.push({ eventName: 'refresh-placements' })
  }
}

customElements.define("cart-drawer-summary", CartDrawerSummary);

class CartDrawerFooter extends CustomElement {
  get refs() {
    return {
      checkoutBtn: this.$el.find("button")
    }
  }

  onDisabledChange(isDisabled) {
    super.onDisabledChange(isDisabled);

    const { checkoutBtn } = this.refs

    checkoutBtn[!!isDisabled ? 'attr' : 'removeAttr']('disabled', 'disabled')
  }
}

customElements.define("cart-drawer-footer", CartDrawerFooter);

class CartRedeemCode extends CustomElement {

  get refs() {
    return {
      $discountViewer: this.$el.find(".discount-viewer"),
      $redeemBox: this.$el.find(".redeem-box"),
      cartSummary: this.closest('cart-drawer-summary'),
      scrollableContent: this.$el.find('cart-scrollable-content').get(0),
      cartItems: document.getElementById('CartDrawerItems'),
      cartRecommendation: document.getElementById('CartDrawerUpsell'),
      cartIconBubble: document.getElementById('cart-icon-bubble')
    }
  }

  codeRedeemed = false

  beforeMount() {
    this.$cart = document.getElementById('CartDrawer');

    this.$input = this.$el.find("input")
    this.$applyBtn = this.$el.find('#CartApplyDiscount');
    this.$removeBtn = this.$el.find("#CartRemoveDiscount")

    this.$input.on('keypress', (e) => {
      if (e.which == 13) {
        this.applyDiscount()
      }
    });
    this.$applyBtn.click(this.applyDiscount.bind(this))
    this.$removeBtn.click(this.removeDiscount.bind(this))
  }

  onLoad(isLoading) {
    super.onLoad(isLoading)

    this.$input.attr('disabled', !!isLoading);
    this.$applyBtn.attr('disabled', !!isLoading);
    this.$removeBtn.attr('disabled', !!isLoading);
  }

  async applyDiscount() {
    const { cartItems, cartIconBubble, cartRecommendation } = this.refs
    const code = this.$input.val();

    if (!code) {
      return;
    }

    this.loading = true
    cartItems.disabled = true
    cartIconBubble.loading = true
    cartRecommendation.disabled = true

    try {
      await this.$cart.parseCheckoutPage();

      await this.$cart.getCheckoutData();

      await this.$cart.updateCheckoutData({
        checkout: {
          discount_code: code
        }
      });

      this.renderDiscountTag()
    } catch (e) {
      if (e.errors) {
        Object.entries(e.errors).forEach(([k, list]) => {
          list.forEach(e => {
            toastr.error(e.message)
          })
        })
      } else {
        toastr.error(e)
      }
    } finally {
      this.loading = false
      cartItems.disabled = false
      cartIconBubble.loading = false
      cartRecommendation.disabled = false
    }
  }

  async removeDiscount() {
    console.log('removeDiscount')
    const { cartSummary } = this.refs

    this.loading = true

    try {
      await this.$cart.updateCheckoutData({
        checkout: {
          clear_discount: 1
        }
      });

      this.$input.val('')

      this.toggleDiscountCode(false);

      cartSummary.clearTotalPrice()
    } catch (e) {
      toastr.error(e)
    } finally {
      this.loading = false
    }
  }

  toggleDiscountCode(isRedeemed = true) {
    if (this.codeRedeemed === isRedeemed) return
    console.log('toggleDiscountCode')
    const { cartSummary } = this.refs

    const $discountViewer = this.$el.find(".discount-viewer");
    const $redeemBox = this.$el.find(".redeem-box")
    this.$cart = document.getElementById('CartDrawer');

    if (isRedeemed) {
      this.codeRedeemed = true
      $discountViewer.removeClass('hidden')
      $redeemBox.addClass('hidden')

      this.refreshDiscountTag();
      cartSummary.computeDiscountedTotal();

    } else {
      this.codeRedeemed = false

      $discountViewer.addClass('hidden')
      $redeemBox.removeClass('hidden')
    }
  }

  // Always check everytime items change
  checkCodeApplicable() {
    console.log('checkCodeApplicable')
    const appliedDiscount = this.$cart.checkout.applied_discount
    const notApplicable = !!appliedDiscount && !appliedDiscount.applicable

    if (notApplicable) {
      toastr.warning(appliedDiscount.non_applicable_reason, "", {
        iconClass: "toast-warning toast-chambray"
      })
    }

    if (!appliedDiscount || !appliedDiscount.applicable) {
      if (notApplicable) this.removeDiscount()

      return false
    }

    return true
  }

  refreshDiscountTag() {
    console.log('refreshDiscountTag')
    const appliedDiscount = this.$cart.checkout.applied_discount
    const $discountViewer = this.$el.find(".discount-viewer");

    if (!appliedDiscount || !appliedDiscount.applicable || !$discountViewer.length) return

    const discountedAmount = Currency.format(appliedDiscount.amount, { maximumFractionDigits: 2 })

    $discountViewer.find('.discount-viewer__content').html(`
        ${appliedDiscount.title} <span class="discounted-amount font-normal">(-${discountedAmount})</span>
      `)
  }

  renderDiscountTag() {
    const isApplicable = this.checkCodeApplicable()

    this.toggleDiscountCode(isApplicable)
  }
}

customElements.define("cart-redeem-code", CartRedeemCode);




