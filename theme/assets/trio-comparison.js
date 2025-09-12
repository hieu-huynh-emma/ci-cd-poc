$("#trio-comparison-section").ready(async () => {
  await ResourceCoordinator.requestVendor("Splide");

  new Splide("#trio-comparison-section .splide", {
    mediaQuery: "min",
    arrows: false,
    pagination: true,
    fixedWidth: 304,
    gap: "1rem",
    breakpoints: {
      992: {
        destroy: true
      },
    },
  }).mount();
});
