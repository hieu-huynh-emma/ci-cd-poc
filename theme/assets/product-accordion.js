$(document).ready(async function () {
    await ResourceCoordinator.requestVendor('Beefup');

    $('.accordion').beefup({
        trigger: ".accordion__header",
        content: ".accordion__content",
        openSpeed: 500,
        closeSpeed: 250
    });
});
