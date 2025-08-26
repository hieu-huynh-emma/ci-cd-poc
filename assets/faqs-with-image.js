(async () => {
    await ResourceCoordinator.requestVendor("Beefup");

    $(".faqs-with-image .faq").beefup({
        trigger: ".faq__header",
        content: ".faq__answer",
        openSpeed: 500,
        closeSpeed: 250,
        openSingle: true,
    });
})();
