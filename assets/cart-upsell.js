class CartUpsell extends CustomElement {
  props = {
    value: null,
    options: [],
    quantity: 0,
    index: 0,
    productId: 0
  };

  get refs() {
    return {
      allAddButtons: this.$el.find('button'),
      allVariantSelectors: this.$el.find('variant-selector')
    }
  }


  mounted() {
    let observer = new MutationObserver(this.onMutation.bind(this));

    observer.observe(this, {
      childList: true,
      subtree: true,
      characterDataOldValue: true
    });

    this.initSwiper()

    this.$el.find("button").click(this.onAddUpsell)
  }

  initSwiper() {
    new Swiper('#shopify-section-cart-drawer-upsell .swiper', {
      preventClicksPropagation: false,
      preventClicks: false,
      touchStartPreventDefault: false,
      loop: true,
      slidesPerView: "auto",
      loopedSlides: 1,
      spaceBetween: 16,
      navigation: {
        nextEl: ".swiper-arrow--next",
        prevEl: ".swiper-arrow--prev",
      },
      scrollbar: {
        el: ".swiper-scrollbar",
        hide: true,
      },
    });
  }

  onMutation(mutationRecords) {
    const cartUpsellRecord = mutationRecords.find(r => $(r.target).hasClass('cart-upsell'))

    if (!!cartUpsellRecord) {
      const swiper = $(cartUpsellRecord.target).find(".swiper")
      if (!swiper.hasClass('swiper-initialize')) {
        this.initSwiper()

        this.$el.find("button").click(this.onAddUpsell)
      }
    }
  }

  async onAddUpsell(e) {
    e.stopPropagation();
    const cartItems = document.getElementById('CartDrawerItems')
    const cartSummaryNode = document.getElementById('CartDrawerSummary');

    const $upsellItem = $(this).closest('.upsell-item')
    const $upsellVariantSelector = $upsellItem.find('.variant-selector select')

    const variantId = $upsellVariantSelector.find(":selected").val()

    const scrollableContentEl = $(this).closest('cart-scrollable-content').get(0);

    scrollableContentEl.loading = true
    cartSummaryNode.loading = true

    const productId = $upsellItem.attr(':productid')

    const { freeGiftId, gwpTargetProductIds } = cartItems.props

    const isGWPTargetProduct = freeGiftId && gwpTargetProductIds.includes(+productId)

    await cartItems.addToCart(variantId, 1, isGWPTargetProduct ? { hasGWP: true } : {});

    isGWPTargetProduct && await cartItems.addToCart(freeGiftId, 1, { freeGift: true });

    scrollableContentEl.loading = false
    cartSummaryNode.loading = false

  }

  onDisabledChange(isDisabled) {
    super.onDisabledChange(isDisabled);

    const { allAddButtons, allVariantSelectors } = this.refs

    if (isDisabled) {
      allAddButtons.attr('disabled', true)
      allVariantSelectors.attr('disabled', true)
    } else {
      allAddButtons.attr('disabled', false)
      allVariantSelectors.attr('disabled', false)
    }
  }
}

customElements.define('cart-upsell', CartUpsell);

class CartUpsellItem extends CustomElement {
  beforeMount() {
    super.beforeMount();

    const variantSelector = this.querySelector('variant-selector')

    variantSelector.addEventListener('change', this.refreshPrice.bind(this));

  }

  refreshPrice() {
    const $selectedOption = this.$el.find(':selected');
    const $pricingEl = this.$el.find('.upsell-item__pricing')


    const price = $selectedOption.data('price')
    const originalPrice = $selectedOption.data('originalPrice')
    const priceInCurrency = Currency.format(price, { maximumFractionDigits: price % 1 === 0 ? 0 : 2 });
    const originalPriceInCurrency = Currency.format(originalPrice, { maximumFractionDigits: originalPrice % 1 === 0 ? 0 : 2 });

    $pricingEl.html(`
      <div class="text-chambray">+${priceInCurrency}</div>
      ${(originalPrice > price) ? `<div class="font-light text-comet line-through">${originalPriceInCurrency}</div>` : ""}
    `)
  }
}

customElements.define('cart-upsell-item', CartUpsellItem);
