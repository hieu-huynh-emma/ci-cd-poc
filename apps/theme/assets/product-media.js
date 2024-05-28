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
      await ResourceCoordinator.requestVendor("DriftZoom");

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
          },
        },
      });

      main.sync(thumbnails);

      main.on("mounted", function () {
        $("product-media").addClass("is-initialized");
      });

      let drift;
      let triggerEl;

      main.on("active", ({ slide }) => {
        if (drift) drift.destroy();
        const currentLanguage = $("html").attr("lang");
        triggerEl = slide.querySelector(`.media-item[lang="${currentLanguage}"]`);
        drift = new Drift(triggerEl, {
          paneContainer: document.querySelector("product-media .main-carousel"),
          zoomFactor: 2
        });

        drift.disable();
      });

      $("product-media .main-carousel").click(function () {
        if (!drift) return;

        const $pane = $(this);

        const isEnabled = $pane.hasClass("zoom-enabled");

        if (isEnabled) {
          drift.disable();
          $pane.removeClass("zoom-enabled");
          triggerEl.dispatchEvent(new Event("mouseleave"));
        } else {
          drift.enable();
          $pane.addClass("zoom-enabled");
          triggerEl.dispatchEvent(new Event("mouseenter"));
        }
      });

      main.mount();
      thumbnails.mount();
    });
  }
}

customElements.define("product-media", ProductMedia);
