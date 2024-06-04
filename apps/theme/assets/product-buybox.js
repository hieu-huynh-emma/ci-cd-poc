class ProductBuybox extends CustomElement {
  props = {};

  get refs() {
    return {
      $addToCart: $(".add-to-cart-btn"),
      $fixAddToCart: $("#fixture-add-to-cart"),
    };
  }

  mounted() {
    super.mounted();

    this.portal();

    const { $addToCart, $fixAddToCart } = this.refs;
    $addToCart.click(() => {
      $fixAddToCart.trigger("click");
    });
  }

  portal() {
    const showSticky = $("#show_sticky_buybox").val();

    const $stickyBuybox = $("sticky-buybox");

    if (!!+showSticky) {
      const $body = $("body");

      $body.append($stickyBuybox);
    } else {
      $stickyBuybox.remove();
    }
  }
}

customElements.define("product-buybox", ProductBuybox);

class StickyBuybox extends CustomElement {
  props = {};

  threshold;

  previousY = 0;

  get refs() {
    const $buybox = $("product-buybox");
    const $productOptions = $buybox.find("#attribute-configurator");
    const $productPrice = $buybox.find("product-price");
    const $productBuynow = $buybox.find(".product-form__controls-group");

    const $proxySelect = this.$el.find("select");
    const primaryId = $proxySelect.data("id");
    const $primarySelect = $(`select#${primaryId}`);

    const $proxyQtySelect = this.$el.find("quantity-input");
    const $primaryQtySelect = $("product-buybox quantity-input");

    return {
      $doc: $(document),
      $outlet: this.$el.find(".buybox-outlet"),
      $buybox,
      $productOptions,
      $productPrice,
      $productBuynow,
      $productMedia: $("product-media"),
      $productTitle: $("#product-title"),

      $addToCart: $(".add-to-cart-btn"),
      $fixAddToCart: $("#fixture-add-to-cart"),

      $proxySelect,
      $primarySelect,
      $proxyQtySelect,
      $primaryQtySelect,
    };
  }

  constructor() {
    super();
    const $announcementBar = $(".announcement-bar-wrapper");
    const $header = $(".site-header-wrapper");

    this.threshold = $announcementBar.height() + $header.height() + 20;

    const observer = new IntersectionObserver(debounce(this.onIntersect.bind(this), 100), {
      rootMargin: `-${this.threshold}px 0px 0px 0px`,
    });

    const addToCartBtn = document.querySelector("product-buybox .add-to-cart-btn");
    observer.observe(addToCartBtn);
  }

  mounted() {
    console.log("=>(product-buybox.js:21) mounted");
    super.mounted();

    const { $addToCart, $fixAddToCart, $proxySelect, $primarySelect, $proxyQtySelect, $primaryQtySelect } = this.refs;
    $addToCart.click(() => {
      $fixAddToCart.trigger("click");
    });

    this.renderProductInfo();

    $proxySelect.on("change", () => {
      $primarySelect
        .val($proxySelect.val())
        .get(0)
        .dispatchEvent(new Event("change", { bubbles: true }));
    });

    $proxyQtySelect.on("change", () => {
      $primaryQtySelect.find("input").val($proxyQtySelect.find("input").val());
    });

    // return;
    // const { $outlet, $productOptions, $productPrice, $productBuynow } = this.refs;

    // this.renderProductInfo();

    // $outlet.append($productOptions, $productPrice, $productBuynow);
  }

  onIntersect([entry]) {
    const {
      boundingClientRect: { y },
      isIntersecting,
    } = entry;

    let isVisible = false;
    console.log("=>(product-buybox.js:119) y", y);
    console.log("=>(product-buybox.js:120) this.previousY", this.previousY);

    if (y < this.previousY) {
      // Scrolling Down
      console.log("scrolling down");
      if (isIntersecting) {
        console.log("add-to-cart button in view");
      } else {
        console.log("add-to-cart button out of view");
        isVisible = true;
      }
    } else {
      // Scrolling Up
      console.log("scrolling up");
    }

    // console.log("=>(product-buybox.js:119) rootY", rootBounds.y);

    // const rootBoundY = rootBounds?.y ?? this.threshold;
    // console.log("=>(product-buybox.js:120) this.threshold", this.threshold);
    //
    // const isVisible = bottom <= 0 || bottom <= rootBoundY;
    // console.log("=>(product-buybox.js:120) isVisible", isVisible);

    this.toggle(isVisible);

    if (y !== this.previousY) this.previousY = y;
  }

  toggle(isVisible) {
    if (isVisible) {
      this.sync();
    }

    this.$el[isVisible ? "show" : "hide"]();
  }

  // Sync the value between primary components and proxy components
  sync() {
    const { $primarySelect, $proxySelect, $primaryQtySelect, $proxyQtySelect } = this.refs;
    $proxySelect.val($primarySelect.val());

    $proxyQtySelect.find("input").val($primaryQtySelect.find("input").val());
  }

  renderProductInfo() {
    const { $productMedia, $productTitle } = this.refs;

    const $leadItemURl = $productMedia.find("input#lead-item-url").val();

    this.$el.find(".product-image").attr("src", $leadItemURl);
    this.$el.find(".product-title").text($productTitle.text());
  }
}

customElements.define("sticky-buybox", StickyBuybox);
