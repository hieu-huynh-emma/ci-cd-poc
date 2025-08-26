(async (sectionId) => {
  await ResourceCoordinator.requestVendor('Splide');

  new Splide(`#${sectionId} .splide`, {
    gap: '1.5rem',
    mediaQuery: 'min',
    type: 'loop',
    perMove: 1,
    pagination: false,
    arrows: false,
    autoWidth: true,
    autoplay: "true",
    focus: 'center',
    breakpoints: {
      768: {
        gap: '2rem',
      },
      992: {
        gap: '3rem',
      },
      1024: {
        gap: '4rem',
      },
      1200: {
        gap: '5rem',
      }
    }
  }).mount();

})(document.currentScript.closest('section.logo-carousel').id);
