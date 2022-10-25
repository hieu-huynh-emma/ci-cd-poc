class CartScrollableContent extends CustomElement {
}

customElements.define('cart-scrollable-content', CartScrollableContent);

class CartIconBubble extends CustomButton {

  setupTooltips() {
    tippy('cart-icon-bubble', {
      content: "Loading... Please Wait",
      onShow(instance) {
        const $el = $(instance.reference)

        return !!$el.hasClass('is-loading')
      },
    });
  }

  onLoad(isLoading) {
    super.onLoad(isLoading);

    this.disabled = !!isLoading
  }

  onDisabledChange(isDisabled) {
    this.$el[!!isDisabled ? 'addClass' : 'removeClass']('is-disabled')
  }
}

customElements.define('cart-icon-bubble', CartIconBubble);
