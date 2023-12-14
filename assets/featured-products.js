$("#featured-products-section").ready(async () => {
    await ResourceCoordinator.requestVendor('Splide');

    new Splide('#featured-products-section .splide', {
        autoWidth: false,
        padding: {right: '0rem'},
        perPage: 4,
        perMove: 1,
        gap: '20px',
        pagination: true,
      arrows:false,
        breakpoints: {
            881: {
               autoWidth: true,
                perPage: 1,
                arrows: false,
                pagination: true,
                gap: '12px',
            }
        }
    }).mount();
})
