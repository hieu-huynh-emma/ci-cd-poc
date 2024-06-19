(() => {
    const $smartTabs = $("#sale-catalog-section smart-tabs")
    console.log("=>(sale-catalog.js:3) $smartTabs", $smartTabs);

    const $tabLabels = $smartTabs.find(".smart-tab-label-text-wrapper")
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
