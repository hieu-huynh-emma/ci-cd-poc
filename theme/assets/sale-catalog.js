(() => {
    const $smartTabs = $("#sale-catalog-section smart-tabs")

    const $tabLabels = $smartTabs.find(".smart-tab-label-container")
    const $tabItems = $smartTabs.find("smart-tab-item")

    $tabItems.each(function (i) {
        const trackId = $(this).data("trackId")
        const $label = $tabLabels.eq(i)
        $label.html(`
        <tracked-button :trackId="${trackId}">
        ${$label.html()}
        </tracked-button>
       `)
    })
})()
