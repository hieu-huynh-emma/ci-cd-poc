$("#mattress-layers-section").ready(async () => {
    const $layerSpecs = $("#mattress-layers-section .layer-info-item")
    const $internalLayers = $("#mattress-layers-section .internal-layer-item")
    const $coverLayer = $("#mattress-layers-section .cover-layer-item")
    const $baseLayer = $("#mattress-layers-section .base-layer-item")
    const $outerContainer = $("#mattress-layers-section .outer-container")

    $coverLayer.click(function () {
        $(this).addClass("active move-up");
        $outerContainer.removeClass("move-up")
        $internalLayers.removeClass("move-up move-down active")
        $baseLayer.removeClass("active");
        $layerSpecs.addClass('hidden')
        $layerSpecs.filter(".cover-layer").removeClass('hidden');
    });
    $internalLayers.each(function (i) {
        const $layer = $(this);
        $layer.click(() => {
            $layer.removeClass("move-up move-down").addClass("active");

            $layer.siblings().each(function () {
                $(this).removeClass("active move-up move-down");
            });

            $outerContainer.addClass('move-up')
            $baseLayer.removeClass("active");

            $layerSpecs.addClass('hidden')
            $layerSpecs.eq(i+1).removeClass('hidden');

            $layer.prevAll().addClass("move-up")

            const isCoverLayer = $layer.hasClass('cover-layer')

            if (!isCoverLayer) {
                $layer.nextUntil($baseLayer).addClass("move-down")
            }
        });
    });
    $baseLayer.click(function () {
        $(this).addClass("active");
        $outerContainer.addClass('move-up')
        $coverLayer.removeClass("active")
        $internalLayers.removeClass("move-up move-down active")

        $layerSpecs.addClass('hidden')
        $layerSpecs.filter(".base-layer").removeClass('hidden');

    });


    $coverLayer.trigger("click")
});
