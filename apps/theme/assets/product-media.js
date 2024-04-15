class ProductMedia extends CustomElement {
  constructor() {
    super();
  }

  render() {
    const tpl = this.querySelector("template");

    this.$el.html(tpl.content);
  }

  mounted() {
    super.mounted();

    $("product-media").ready(async () => {
      await ResourceCoordinator.requestVendor("Splide");

      const main = new Splide("product-media .main-carousel", {
        type: "fade",
        rewind: true,
        pagination: false,
        arrows: true,
      });
      const thumbnails = new Splide("product-media .thumbnail-carousel", {
        fixedWidth: 80,
        gap: 10,
        rewind: true,
        pagination: false,
        arrows: false,
        isNavigation: true,
        breakpoints: {
          769: {
            gap: 8,
          }
        }
      });

      main.sync(thumbnails);
      main.mount();
      thumbnails.mount();
    });
  }
}

customElements.define("product-media", ProductMedia);
