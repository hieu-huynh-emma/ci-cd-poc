document.addEventListener('DOMContentLoaded', () => {
    // Dont use "https://emma-sleep.ca" because it'll be auto converted to "https://qc.emma-sleep.ca" by shopify on french domain
    const franceUrl = "https://qc.emma-sleep.ca";
    const englishUrl = "https://emma-sleep.ca";

    setTimeout(function () {
        renderLanguageRedirection();

        // Ometria workaround
        if ($('html').attr('lang') === 'fr') {
            const newsletterFormTags = $(`footer input[name="contact[tags]"]`)

            newsletterFormTags.val(newsletterFormTags.val() + ",locale=fr")
        }
    }, 500)

    function renderLanguageRedirection() {
        const currentLanguage = $('html').attr('lang');
        const $languageRedirection = $(".language-redirection");
        $languageRedirection.text(currentLanguage === 'en' ? "Français" : "English");
        // $languageRedirection.attr("href", currentLanguage === 'en' ? franceUrl : englishUrl);

        $languageRedirection.get(0).props.trackId = currentLanguage === 'en' ? "French_website" : "English_website"
    }

    $('.language-redirection').click(function (e) {
        e.preventDefault()
        const currentLanguage = $('html').attr('lang');

        Weglot.switchTo(currentLanguage === 'en' ? "fr" : "en")
    })
})
