$("#affirm-widget").ready(async () => {
  await ResourceCoordinator.requestVendor("Fancybox")
  // Enable Fancybox for any element with the `data-fancybox` attribute
  Fancybox.bind('[data-fancybox]', {})
})
