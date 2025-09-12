class MattressLayers extends CustomElement {
  constructor() {
    super();
  }

  mounted() {
    super.mounted();

    this.init();

    const $layerSpecs = this.$el.find(".layer-spec");
    const $internalLayers = this.$el.find(".internal-layer-item");
    const $coverLayer = this.$el.find(".cover-layer-item");
    const $baseLayer = this.$el.find(".base-layer-item");
    const $outerContainer = this.$el.find(".outer-container");

    $coverLayer.click(function () {
      $(this).addClass("active move-up");
      $outerContainer.removeClass("move-up");
      $internalLayers.removeClass("move-up move-down active");
      $baseLayer.removeClass("active");


      $layerSpecs.filter(`[data-layer-index="${$(this).data("layerIndex")}"]:not(.is-open)`).find(".spec-header").trigger("click");
    });
    $internalLayers.each(function (i) {
      const $layer = $(this);
      $layer.click(() => {
        $layer.removeClass("move-up move-down").addClass("active");

        $layer.siblings().each(function () {
          $(this).removeClass("active move-up move-down");
        });

        $outerContainer.addClass("move-up");
        $baseLayer.removeClass("active");

        // $layerSpecs.addClass("hidden");
        $layerSpecs.filter(`[data-layer-index="${$(this).data("layerIndex")}"]:not(.is-open)`).find(".spec-header").trigger("click");

        $layer.prevAll().addClass("move-up");

        const isCoverLayer = $layer.hasClass("cover-layer");

        if (!isCoverLayer) {
          $layer.nextUntil($baseLayer).addClass("move-down");
        }
      });
    });
    $baseLayer.click(function () {
      $(this).addClass("active");
      $outerContainer.addClass("move-up");
      $coverLayer.removeClass("active");
      $internalLayers.removeClass("move-up move-down active");

      // $layerSpecs.addClass("hidden");
      $layerSpecs.filter(`[data-layer-index="${$(this).data("layerIndex")}"]:not(.is-open)`).find(".spec-header").trigger("click");
    });

    setTimeout(() => {
      $coverLayer.trigger("click");
    }, 100)
  }

  async init() {
    await ResourceCoordinator.requestVendor("Beefup");

    const $layerItems = $(".layer-item");

    $("#mattress-layers-section .layer-spec").beefup({
      trigger: ".spec-header",
      content: ".spec-content",
      openSpeed: 500,
      closeSpeed: 250,
      openSingle: true,
      onOpen: function ($this) {
        $layerItems.filter(`[data-layer-index="${$this.data("layerIndex")}"]:not(.active)`).trigger("click");
      },
    });
  }
}

customElements.define("mattress-layers", MattressLayers);
