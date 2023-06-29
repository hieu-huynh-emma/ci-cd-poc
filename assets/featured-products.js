$(document).ready(function () {
  new Splide('#featured-products-section .splide', {
    autoWidth: true,
    padding: { right: '5rem' },
    perPage: 4,
    perMove: 1,
    gap: '20px',
    pagination: false,
    breakpoints: {
      768: {
        perPage: 1,
        arrows: false,
        pagination: true,
        gap: '12px',
      }
    }
  }).mount();
})
