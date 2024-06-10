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

      const main = new Splide("product-media .main-carousel .splide", {
        type: "fade",
        pagination: false,
        arrows: false,
        breakpoints: {
          769: {
            arrows: true,
          },
        },
      });
      const thumbnails = new Splide("product-media .thumbnail-carousel", {
        mediaQuery: "min",
        fixedWidth: 80,
        gap: 8,
        rewind: true,
        pagination: false,
        isNavigation: true,
        arrows: false,
        breakpoints: {
          769: {
            fixedWidth: "initial",
            autoHeight: true,
            direction: "ttb",
            height: "100%",
            padding: { top: 16, bottom: 16 },
            focus: "center",
            arrows: true,
          },
        },
      });

      main.sync(thumbnails);

      main.on("mounted", function () {
        $("product-media").addClass("is-initialized");
      });

      let drift;
      let triggerEl;

      const $mainCarousel = $("product-media .main-carousel");

      main.on("active", ({ slide }) => {
        if (drift) drift.destroy();
        const currentLanguage = $("html").attr("lang");

        const mediaItemEl = slide.querySelector(`.media-item`);

        const slideType = mediaItemEl.dataset.type;

        $mainCarousel.attr("data-type", slideType);

        if (slideType === "image") {
          triggerEl = mediaItemEl.querySelector(`[lang="${currentLanguage}"]`);
          drift = new Drift(triggerEl, {
            paneContainer: $mainCarousel.find(".zoom-container").get(0),
            zoomFactor: 2,
          });
        }

        if (slideType === "video") {
          const videoEl = slide.querySelector("video");

          videoEl.play();
        }
      });

      $mainCarousel.click(function () {
        if (!drift) return;

        const $pane = $(this);

        const isEnabled = $pane.hasClass("zoom-enabled");

        if (isEnabled) {
          // drift.disable();
          $pane.removeClass("zoom-enabled");
        } else {
          // drift.enable();
          $pane.addClass("zoom-enabled");
        }
      });

      main.mount();
      thumbnails.mount();
    });
  }
}

customElements.define("product-media", ProductMedia);
