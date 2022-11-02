class CartItems extends CustomElement {
  get refs() {
    return {
      allItems: this.querySelectorAll('cart-item'),
      cartSummary: document.getElementById('CartDrawerSummary'),
      cartRedeem: document.getElementById('CartRedeemCode'),
      cartUpsell: document.getElementById('CartDrawerUpsell'),
      cartFooter: document.getElementById('CartDrawerFooter'),
      cartAffirm: document.getElementById('CartDrawerAffirm'),
      scrollableContent: this.closest('cart-scrollable-content')
    }
  }

  beforeMount() {
    this.$cart = document.getElementById('CartDrawer');

    this.debouncedOnChange = debounce(this.onQuantityChange.bind(this), 300);

    this.addEventListener('change', this.debouncedOnChange.bind(this));
  }

  async onQuantityChange(event) {
    const quantityAdjuster = event.target
    // const cartItem = quantityAdjuster.closest('cart-item')
    const value = quantityAdjuster.value

    // const hasGWP = await this.gwpGuard(cartItem, value)
    //
    // if (hasGWP) return

    await this.updateCartItem(value, $(quantityAdjuster).data('index'))
  }

  async updateCartItem(value, index) {
    if (value === 0) {
      await this.removeFromCart(index - 1)
    } else {
      await this.updateQuantity(index, value);
    }
  }

  async requestCart(payload = {}, url = routes.cart_change_url) {
    const { cartSummary, cartRedeem, cartAffirm } = this.refs
    console.log('requestCart')

    try {
      const state = await fetch(`${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': `application/json` },
        body: JSON.stringify({
          ...payload,
          sections: this.getSectionsToRender().map((section) => section.section),
          sections_url: window.location.pathname
        })
      }).then(res => res.json())

      await cartAffirm.refreshAffirm()

      const codeRedeemed = cartRedeem.codeRedeemed

      if (!!codeRedeemed && state.item_count !== 0) {
        await this.$cart.parseCheckoutPage();

        await this.$cart.getCheckoutData();

        this.refreshSections(state)

        const isApplicable = cartRedeem.checkCodeApplicable()

        if (!isApplicable) return state

        cartSummary.computeDiscountedTotal()
        cartRedeem.refreshDiscountTag();
      } else {
        this.refreshSections(state)
      }

      if (state.item_count === 0) {
        await this.emptyCart()
      }

      return state
    } catch (e) {
      console.log(e)
    }
  }

  async addToCart(variantId, qty) {
    const data = {
      "id": variantId,
      "quantity": qty
    };

    return this.requestCart(data, routes.cart_add_url)
  };

  async updateGWP(cartItem, value) {
    const targetProductKey = cartItem.props.key

    const data = {
      updates: {
        [targetProductKey]: value,
        [this.props.freeGiftId]: value
      }
    };
    const { cartSummary, scrollableContent } = this.refs

    scrollableContent.loading = true
    cartSummary.loading = true

    await this.requestCart(data, routes.cart_update_url)

    scrollableContent.loading = false
    cartSummary.loading = false
  }

  async removeFromCart(index) {
    return this.updateQuantity(index + 1, 0)
  }

  async emptyCart() {
    console.log('emptyCart')
    const cartRedeemEl = document.getElementById('CartRedeemCode');
    const codeRedeemed = cartRedeemEl.codeRedeemed

    $("#CartDrawer").addClass('is-empty')

    if (!!codeRedeemed) {
      await cartRedeemEl.removeDiscount()
    }
  }

  async switchVariant(variantId, qty = 1, key) {
    console.log('switchVariant')
    const { cartSummary, scrollableContent } = this.refs

    scrollableContent.loading = true
    cartSummary.loading = true

    const data = {
      updates: {
        [key]: 0,
        [variantId]: 1
      }
    };

    await this.requestCart(data, routes.cart_update_url)

    scrollableContent.loading = false
    cartSummary.loading = false

  }

  async updateQuantity(line, quantity) {
    console.log('updateQuantity')

    if (!line) return

    const { cartUpsell, cartSummary, cartFooter, cartAffirm } = this.refs

    const $lineItem = this.$el.find(`#CartDrawer-Item-${line}`);

    const lineItemNode = $lineItem.get(0)

    lineItemNode.loading = true;
    cartSummary.loading = true

    this.disabled = true
    cartUpsell.disabled = true
    cartAffirm.disabled = true
    cartFooter.disabled = true


    const payload = {
      line,
      quantity
    };

    try {
      await this.requestCart(payload)

    } catch (e) {
      console.log(e)

    } finally {
      console.log('updateQuantity finally')
      lineItemNode.loading = false
      cartSummary.loading = false

      this.disabled = false
      cartUpsell.disabled = false
      cartFooter.disabled = false
      cartAffirm.disabled = false
    }
  }

  async gwpGuard(cartItem, value) {
    const productId = cartItem.props.productId;
    const hasFreeGift = !!this.$el.find(`cart-item[\\:variantId='${this.props.freeGiftId}']`).length

    if (productId === this.props.gwpTargetProductId && hasFreeGift) {
      await this.updateGWP(cartItem, value)

      return true
    }

    return false
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section'
      },
      {
        id: 'main-cart-footer',
        section: document.getElementById('main-cart-footer').dataset.id,
        selector: '.js-contents',
      }
    ];
  }

  refreshSections(state) {
    this.getSectionsToRender().forEach((section => {
      const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

      elementToReplace.innerHTML =
        this.getSectionInnerHTML(state.sections[section.section], section.selector);
    }));
  }

  getSectionInnerHTML(html, selector = ".shopify-section") {
    const el = new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector)

    return el?.innerHTML ?? ""
  }
}

customElements.define('cart-items', CartItems);

class CartDrawerItems extends CartItems {
  props = {
    freeGiftId: 0,
    gwpTargetProductId: 0
  }

  beforeMount() {
    super.beforeMount();

    this.$el.attr('id', `CartDrawerItems`)
  }

  getSectionsToRender() {
    return [
      {
        id: 'CartDrawerItems',
        section: "cart-drawer-items",
        selector: "#CartDrawer-CartItems",
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
        selector: ".drawer-header",
      },
      {
        id: "shopify-section-cart-drawer-upsell",
        section: "cart-drawer-upsell"
      }
    ];
  }

  onDisabledChange(isDisabled) {
    super.onDisabledChange(isDisabled);

    const { allItems } = this.refs

    if (!allItems.length) return

    if (isDisabled) {
      allItems.forEach(item => item.disabled = true)
    } else {
      allItems.forEach(item => item.disabled = false)
    }
  }

  onLoad(isLoading) {
    this.$el[!!isLoading ? 'addClass' : 'removeClass']('is-loading')
  }
}

customElements.define("cart-drawer-items", CartDrawerItems);

class CartItem extends CustomElement {
  props = {
    productId: "",
    variantId: "",
    index: 0,
    key: "",
    originalPrice: 0,
    quantity: 0
  };

  get refs() {
    return {
      removeBtn: this.querySelector("cart-item-remove-button"),
      quantityAdjuster: this.querySelector("quantity-adjuster"),
      variantSelector: this.querySelector("cart-variant-selector"),
    }
  }

  mounted() {
    const { index } = this.props

    this.$el.addClass("cart-item")
    this.$el.attr('id', `CartDrawer-Item-${index + 1}`)
  }

  update(cart) {
    const { variantId } = this.props;

    const itemData = cart.items.find(({ id }) => +id === +variantId)

    if (!!itemData) {
      this.renderPricing(itemData)
    } else {
      this.$el.remove()
    }
  }

  renderPricing(item) {
    const { originalPrice } = this.props;
    const $originalPrice = this.$el.find('.cart-item-pricing__price--original')
    const $price = this.$el.find('.cart-item-pricing__price:not(.cart-item-pricing__price--original)')

    $originalPrice.text(currencyFormatter.format(originalPrice * item.quantity * 10))

    $price.text(currencyFormatter.format(item.final_line_price * 10))
  }

  onDisabledChange(isDisabled) {
    super.onDisabledChange(isDisabled);

    const { removeBtn, quantityAdjuster, variantSelector } = this.refs;

    if (!!isDisabled) {
      removeBtn.disabled = true;
      quantityAdjuster.disabled = true;
      variantSelector.disabled = true;

    } else {
      removeBtn.disabled = false;
      quantityAdjuster.disabled = false;
      variantSelector.disabled = false;
    }
  }
}

customElements.define('cart-item', CartItem);


class CartItemRemoveButton extends CustomButton {
  props = {
    index: 0,
  };

  onClick() {
    const { index } = this.props

    this.closest('cart-drawer-items').removeFromCart(index);
  }
}

customElements.define('cart-item-remove-button', CartItemRemoveButton);
