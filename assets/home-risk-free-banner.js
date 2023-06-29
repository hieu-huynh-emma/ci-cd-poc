$(document).ready(function () {
  new Splide('#home-risk-free-banner-section .splide', {
    gap: '16px',
    pagination: false,
    autoplay: true,
    interval: 3000,
    type: 'loop',
    width: '100%',
    perPage: 1,
    perMove: 1,
    mediaQuery: 'min',
    breakpoints: {
      1024: {
        destroy: true,
      },
    },
  }).mount()
})
