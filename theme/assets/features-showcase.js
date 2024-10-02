$(document).ready(function() {
  initSplide();


  async function initSplide() {
    await ResourceCoordinator.requestVendor("Splide");

    new Splide("section#features-showcase .splide", {
      perPage: 1,
      perMove: 1,
      gap: "40px",
      rewind: true,
    }).mount();
  }
});
