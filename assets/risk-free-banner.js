$("#risk-free-banner-section").ready(async function () {
    await ResourceCoordinator.requestVendor('Splide');

    new Splide('#risk-free-banner .splide', {
        pagination: false,
        autoplay: true,
        interval: 3000,
        type: 'loop',
        perPage: 1,
        perMove: 1,
        mediaQuery: 'min',
        breakpoints: {
            768: {
                destroy: true,
            }
        }
    }).mount();
})
