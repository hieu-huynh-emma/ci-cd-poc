$("#social-proof-old-section").ready(async function () {
  await ResourceCoordinator.requestVendor('Splide');

  new Splide('#social-proof-old-section .splide', {
    autoWidth: true,
    padding: { right: '5rem' },
    perPage: 4,
    perMove: 1,
    gap: '20px',
    pagination: true,
    breakpoints: {
      768: {
        perPage: 1,
        arrows: false,
        gap: '8px',
      }
    }
  }).mount();
})
