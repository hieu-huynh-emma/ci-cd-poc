$("#announcement-bar").ready(async () => {
  await ResourceCoordinator.requestVendor("Tippy");
  await ResourceCoordinator.requestVendor("Splide");

  const tooltipContent = $("#announcement-bar").data("tooltip");

  setTimeout(() => {
    tippy("#announcement-bar .anno-tooltip", {
      content: tooltipContent,
    });
  }, 500);


  new Splide("#announcement_slide .splide", {
    mediaQuery: "min",
    rewind: true,
    autoplay: true,
    autoWidth: false,
    interval: 40000,
    perPage: 1,
    perMove: 1,
    gap: ".25rem",
    arrows: true,
    pagination: false
  }).mount();
});
