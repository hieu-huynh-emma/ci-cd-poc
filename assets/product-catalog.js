$(document).ready(function () {
  new Splide('#product-catalog-section .splide', {
    gap: '8px',
    padding: { right: '50' },
    autoWidth: true,
    mediaQuery: 'min',
    arrows: false,
    pagination: true,
    breakpoints: {
      768: {
        perPage: 4,
        padding: false,
        arrows: true,
        gap: '32px'
      },
    },
  }).mount();
})