$(document).ready(function () {
    languageSwitching()
    freshChat()

});

// language-switch
function languageSwitching() {
    setTimeout(function () {
        // Ometria workaround
        if ($('html').attr('lang') === 'fr') {
            const newsletterFormTags = $(`footer input[name="contact[tags]"]`)

            newsletterFormTags.val(newsletterFormTags.val() + ",locale=fr")
        }
    }, 500)
}

function freshChat() {
    var fc_JS = document.createElement('script', {is: "delay-script"});
    fc_JS.setAttribute("url", 'https://wchat.eu.freshchat.com/js/widget.js?t=' + Date.now());
    fc_JS.setAttribute("phase", "interactive");

    (document.body ? document.body : document.getElementsByTagName('head')[0]).appendChild(fc_JS);
    window.fcSettings = {
        token: 'b2b2897c-9240-4bdd-a965-9f4381519c6e',
        host: 'https://wchat.eu.freshchat.com',
        locale: 'en',
        tags: ['ca'],
        faqTags: {
            filterType: 'article',
            tags: ['general', 'shop_ca', 'faq_ca']
        }
    };
}
