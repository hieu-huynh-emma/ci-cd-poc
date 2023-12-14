 $("#main_hero_carousel").ready(async () => {
    await ResourceCoordinator.requestVendor('Splide');

    new Splide('#main_hero_carousel .splide', {
        autoWidth: false,
        padding: {right: '0rem'},
        perPage: 1,
        perMove: 1,
        gap: '0px',
        pagination: true,
      arrows:false,
      type    : 'loop',
        autoplay: "true",

      
    }).mount();
})