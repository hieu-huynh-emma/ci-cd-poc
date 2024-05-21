$("#product-carousel-section").ready(async function () {
  await ResourceCoordinator.requestVendor("Splide");

  new Splide("#product-carousel-section .splide", {
    gap: ".5rem",
    padding: { right: 50 },
    mediaQuery: "min",
    arrows: false,
    pagination: true,
    breakpoints: {
      640: {
        perPage: 1,
        perMove: 1,
        padding: false,
        arrows: true,
      },
      768: {
        perPage: 2,
        gap: "1rem",
      },
      840: {
        perPage: 3,
      },
      1200: {
        perPage: 4,
        gap: "1.5rem",
      }
    },
  }).mount();
});
