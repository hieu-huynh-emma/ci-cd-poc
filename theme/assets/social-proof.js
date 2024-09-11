$("#social-proof-section").ready(async function () {
  await ResourceCoordinator.requestVendor('Splide');

  new Splide('#social-proof-section .splide', {
    perPage: 4,
    perMove: 4,
    gap: '16px',
    loop: true,
    autoWidth: true,
    pagination: false,
    breakpoints: {
      640: {
        perPage: 1,
        perMove: 1,
        arrows: false,
        gap: '8px',
        pagination: true
      },
      912: {
        perPage: 2,
        perMove: 2
      },
      1200: {
        perPage: 3,
        perMove: 3
      },
    },
  }).mount();
})
