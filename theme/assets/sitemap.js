$("section#sitemap").ready(async function() {
  await ResourceCoordinator.requestVendor("Beefup");

  $(".sitemap.is-mobile .sitemap-item").beefup({
    trigger: ".sitemap-item-header",
    content: ".site-footer__links",
    openSpeed: 500,
    closeSpeed: 250,
  });
});

