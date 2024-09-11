$("#featured-catalog-section").ready(async function () {
  await ResourceCoordinator.requestVendor("Splide");

  new Splide("#featured-catalog-section .splide", {
    gap: "1rem",
    mediaQuery: "min",
    arrows: false,
    pagination: true,
    fixedWidth: 304,
    breakpoints: {
      768: {
        gap: "1.5rem",
        arrows: true,
        pagination: false
      }
    },
  }).mount();
});
