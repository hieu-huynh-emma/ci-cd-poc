if (!customElements.get("product-media")) {
    class ProductMedia extends CustomElement {
        get refs() {
            return {
                $placeholder: this.$el.find("slot[name='placeholder']")
            }
        }

        constructor() {
            super();
        }

        render() {
            const tpl = this.$el.find("#ProductMedia-Template").get(0);

            this.$el.append(tpl.content);
        }

        mounted() {
            super.mounted();

            $("product-media").ready(async () => {
                await ResourceCoordinator.requestVendor("Splide");
                await ResourceCoordinator.requestVendor("DriftZoom");

                const main = new Splide(this.querySelector(".main-carousel .splide"), {
                    type: "fade",
                    pagination: false,
                    arrows: false,
                    height: "100%",
                    breakpoints: {
                        769: {
                            arrows: true,
                        },
                    },
                });
                const thumbnails = new Splide(this.querySelector(".thumbnail-carousel"), {
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
                            padding: {top: 16, bottom: 16},
                            focus: "center",
                            arrows: true,
                        },
                    },
                });

                main.sync(thumbnails);

                main.on("mounted", this.onActive.bind(this));

                let drift;
                let triggerEl;

                const $mainCarousel = this.$el.find(".main-carousel");

                main.on("active", ({slide}) => {
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

        onActive() {
            const {$placeholder} = this.refs;
            this.$el.addClass("is-initialized");

            $placeholder.remove()
        }
    }

    customElements.define("product-media", ProductMedia);

}
