$('#featured-faqs-section').ready(async function () {
    await ResourceCoordinator.requestVendor('Beefup');

    $('#featured-faqs-section .faq').beefup({
        trigger: ".faq__header",
        content: ".faq__answer",
        openSpeed: 500,
        closeSpeed: 250
    });
})
