$("#competitor-reviews-section").ready(async function () {
  await ResourceCoordinator.requestVendor("Splide");

  new Splide('#competitor-reviews-section .splide', {
    perPage: 3,
    perMove: 1,
    gap: '40px',
    breakpoints: {
      768: { perPage: 1, gap: '20px' },
    },
  }).mount()
})
