// $("#announcement-bar").ready(async () => {
//     await ResourceCoordinator.requestVendor('Tippy');

//     const tooltipContent = $("#announcement-bar").data('tooltip')

//     setTimeout(() => {
//         tippy('#announcement-bar .anno-tooltip', {
//             content: tooltipContent
//         });
//     }, 500)
// });
  $("#test_slide").ready(async () => {
    await ResourceCoordinator.requestVendor('Splide');
    new Splide('#announcement_slide .splide', {
      type: "fade",
  rewind: true,
  autoplay: true,
      arrows:'false',
        autoWidth: false,
        padding: {right: '0rem'},
        perPage: 1,
        perMove: 1,
        gap: '20px',
        pagination: false,
        breakpoints: {
            768: {
                perPage: 1,
                arrows: false,
                pagination: false,
                gap: '12px',
            }
        }
    }).mount();
})
