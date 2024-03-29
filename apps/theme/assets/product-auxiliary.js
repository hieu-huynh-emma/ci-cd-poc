class ProductAuxiliary extends CustomElement {
  props = {
    trackable: true,
    eventName: "",
    variantId: 0,
  };

  product = {};

  constructor() {
    super();
    this.$el.click(this.onClick.bind(this));
    this.intersectionOberser = new IntersectionObserver(this.onIntersect);

  }

  mounted() {
    super.mounted();
    this.product = JSON.parse(this.querySelector(`script[type="application/json"]`)?.textContent);

  }


  beforeMount() {
    const { trackable } = this.props;
    if (trackable) {
      this.intersectionOberser.observe(this);
    }
  }

  onClick() {
    const { eventName, trackable, variantId } = this.props;

    if (trackable) {
      window.dataLayer.push({
        "event": eventName + "_clicked",
        "product_name": this.product.title,
        "product_id": this.product.id,
        "quantity": 1,
        ...(variantId ? { "variant_id": variantId } : {}),
        "timestamp": new Date().toISOString(),
      });
    }
  }


  onIntersect = (entries) => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      this.trackComponentView();
      this.intersectionOberser.unobserve(this);
    }
  };

  trackComponentView = () => {
    const { eventName, variantId } = this.props;

    window.dataLayer.push({
      "event": eventName + "_viewed",
      "product_name": this.product.title,
      "product_id": this.product.id,
      "quantity": 1,
      ...(variantId ? { "variant_id": variantId } : {}),
      "timestamp": new Date().toISOString(),
    });
  };
}

customElements.define("product-auxiliary", ProductAuxiliary);


