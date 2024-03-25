class ProductMedia extends ResponsiveComponent {
  constructor() {
    super();
  }

  render() {
    if (this.isMobile === null) return

    const tpl = this.templates[this.isMobile ? 'mobile' : 'desktop']

    if(this.isMobile) {
      this.$el.html(tpl.cloneNode(true))
    } else {
      this.$el.append(tpl.cloneNode(true))
    }
  }

  onLayoutModeChange(isMobile) {
    super.onLayoutModeChange(isMobile);

    if (isMobile) {
      $("product-media").ready(async () => {
        await ResourceCoordinator.requestVendor("Splide");

        const main = new Splide("product-media .main-carousel", {
          type: "fade",
          rewind: true,
          pagination: true,
          arrows: true,
        });
        // const thumbnails = new Splide("product-media .thumbnail-carousel", {
        //   fixedWidth: 100,
        //   gap: 10,
        //   rewind: true,
        //   pagination: false,
        //   isNavigation: true,
        // });

        // main.sync(thumbnails);
        main.mount();
        // thumbnails.mount();
      });
    }
  }
}

customElements.define("product-media", ProductMedia);
