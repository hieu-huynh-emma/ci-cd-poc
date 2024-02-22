$(".sitemap").ready(async function () {
    await ResourceCoordinator.requestVendor('Beefup');

    $('.sitemap.is-mobile .sitemap__item').beefup({
        trigger: ".sitemap__header",
        content: ".site-footer__links",
        openSpeed: 500,
        closeSpeed: 250
    });
})
