const main = new Splide('#main-carousel', {
  type: 'fade',
  rewind: true,
  pagination: false,
  arrows: false,
});
const thumbnails = new Splide('#thumbnail-carousel', {
  fixedWidth: 100,
  gap: 10,
  rewind: true,
  pagination: false,
  isNavigation: true
});

main.sync(thumbnails);
main.mount();
thumbnails.mount();