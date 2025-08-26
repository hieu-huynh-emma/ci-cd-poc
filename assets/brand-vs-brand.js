$("#brand-vs-brand-section").ready(async function () {
  await ResourceCoordinator.requestVendor('Splide');

  new Splide('#brand-vs-brand-section .splide', {
    gap: '20px',
    padding: '8.5rem',
    autoWidth: true,
    type: 'loop',
    breakpoints: {
      412: {
        padding: '7rem',
      }
    }
  }).mount();
})
