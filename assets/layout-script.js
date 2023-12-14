$(document).ready(function () {
  languageSwitching()
  freshChat()

});
// language-switch
  function languageSwitching() {
  // Dont use "https://emma-sleep.ca" because it'll be auto converted to "https://qc.emma-sleep.ca" by shopify on french domain
  const franceUrl = "https://qc.emma-sleep.ca";
  const englishUrl = "https://emma-sleep.ca";

  setTimeout(function() {
    renderLanguageRedirection();

    // Ometria workaround
    if($('html').attr('lang') === 'fr') {
      const newsletterFormTags = $(`footer input[name="contact[tags]"]`)

      newsletterFormTags.val(newsletterFormTags.val() + ",locale=fr")
    }
  }, 500)

  function renderLanguageRedirection() {
    const currentLanguage = $('html').attr('lang');
    const $languageRedirection = $(".language-redirection");
    $languageRedirection.text(currentLanguage === 'en' ? "Français" : "English");
    // $languageRedirection.attr("href", currentLanguage === 'en' ? franceUrl : englishUrl);
  }

  $('.language-redirection').click(function(e) {
    e.preventDefault()
    const currentLanguage = $('html').attr('lang');
    
    Weglot.switchTo(currentLanguage === 'en' ? "fr" : "en")
  })
}
function freshChat() {
  var fc_JS=document.createElement('script');
  fc_JS.setAttribute("src", 'https://wchat.eu.freshchat.com/js/widget.js?t='+Date.now());
  (document.body?document.body:document.getElementsByTagName('head')[0]).appendChild(fc_JS);
  window.fcSettings = {
    token:'b2b2897c-9240-4bdd-a965-9f4381519c6e',
    host : 'https://wchat.eu.freshchat.com',
    locale: 'en',
    tags: ['ca'],
    faqTags: {
      filterType: 'article',
      tags: ['general', 'shop_ca', 'faq_ca']
    }
  };
}