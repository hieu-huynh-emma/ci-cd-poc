$("section.featured-awards").ready(async () => {

  await ResourceCoordinator.requestVendor("Splide");

  new Splide(`section.featured-awards .splide`, {
    gap: 40,
    type: "loop",
    fixedWidth: 126,
    pagination: false,
    arrows: true,
    autoplay: true,
    trimSpace: false,
    breakpoints: {
      768: {
        gap: 32,
        fixedWidth: 100,
        pagination: true,
        arrows: false,
      },
    },
  }).mount();
});
