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
    type: "fade",
    rewind: true,
    autoplay: true,
    autoWidth: false,

    perPage: 1,
    perMove: 1,
    gap: ".25rem",
    arrows: false,
    pagination: false,
    breakpoints: {
      768: {
        destroy: true,
      },
    },
  }).mount();
});
