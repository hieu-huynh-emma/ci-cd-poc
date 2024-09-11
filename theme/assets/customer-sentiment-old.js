$("#customer-sentiment-old-section").ready(async function () {
    await ResourceCoordinator.requestVendor('Splide');

    new Splide('#customer-sentiment-old-section .splide', {
        autoWidth: true,
        padding: {right: '5rem'},
        perPage: 4,
        perMove: 1,
        gap: '20px',
        pagination: false,
        breakpoints: {
            768: {
                perPage: 1,
                arrows: false,
                pagination: true,
                gap: '8px',
            }
        }
    }).mount();
})
