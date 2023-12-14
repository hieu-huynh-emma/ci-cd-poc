(async (sectionId) => {
    function renderAwardQuote(slide) {
        if (slide.isClone) return
        const awardNameEl = $(slide.slide).data('heading')
        const awardName = $($.parseHTML(awardNameEl)).text()

        $(`#${sectionId} .award-name`).text(awardName)
    }

    await ResourceCoordinator.requestVendor('Splide');

    const awardCarousel = new Splide(`#${sectionId} .splide`, {
        gap: '1.6rem',
        type: 'loop',
        perMove: 1,
        perPage: 5,
        pagination: false,
        arrows: true,
        focus: 'center',
        breakpoints: {
            768: {
                perPage: 3,
                pagination: true,
                arrows: false
            }
        }
    })

    awardCarousel.on('active', renderAwardQuote);

    setTimeout(() => {
        awardCarousel.mount();
    })
})(document.currentScript.closest('section.logo-carousel').id);
