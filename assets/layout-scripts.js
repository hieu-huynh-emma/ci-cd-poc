$(document).ready(function () {
  navigationHamburger()
  languageSwitching()
  navigationAccordion()
  cartDrawer()
  storeLocalization()
  freshChat()
  cartDrawerCustomerSupport()
  contactUs()
  switchAffirmMessage()
});

function switchAffirmMessage() {
  const lang = $('html').attr('lang')
  if (lang === 'en') {
    $('.fr_pop').hide()
    $('.pro_info').css('display', 'block')
    $('.img_bann.first_bann').addClass('eng')
    $('.img_bann.sec_bann').addClass('eng')
  } else {
    $('.pro_info').hide()
    $('.fr_pop').css('display', 'block')
    $('.img_bann').addClass('updfr')
    $('.img_bann>.tImHU').css('background', 'rgba(255,137,0,1)')
    $('.img_bann').css('display', 'flex')
    $('.img_bann.first_bann').css('background-image', '')
  }
}


function contactUs() {
  $('#ContactUsSection .live-chat').click(openChatSupport)
}

function cartDrawerCustomerSupport() {
  $("#CartDrawerCustomerSupport .live-chat").click(openChatSupport)
}

function navigationHamburger() {
  $('#hamburger-navigation-button').click(function () {
    $('#hamburger-navigation').toggle()
  })
}

function languageSwitching() {
  // Dont use "https://emma-sleep.ca" because it'll be auto converted to "https://qc.emma-sleep.ca" by shopify on french domain
  const franceUrl = "https://qc.emma-sleep.ca";
  const englishUrl = "https://emma-sleep" + ".ca";

  setTimeout(function() {
    renderLanguageRedirection();
  }, 2000)

  function renderLanguageRedirection() {
    const currentLanguage = $('html').attr('lang');
    const $languageRedirection = $(".language-redirection");
    $languageRedirection.text(currentLanguage === 'en' ? "FRANÇAIS" : "ENGLISH");
    $languageRedirection.attr("href", currentLanguage === 'en' ? franceUrl : englishUrl);
  }

  $('.language-redirection').click(function(e) {
    e.preventDefault()
    const currentLanguage = $('html').attr('lang');
    location.href = currentLanguage === 'en' ? franceUrl : englishUrl;
  })
}

function navigationAccordion() {
  $('.navigation-accordion-wrapper').beefup({
    trigger: '.navigation-accordion',
    content: '.navigation-accordion__content',
    openSpeed: 100,
    closeSpeed: 100,
    openSingle: true
  })
}

function cartDrawer() {
  document.addEventListener('DOMContentLoaded', function () {
    function isIE() {
      const ua = window.navigator.userAgent;
      const msie = ua.indexOf('MSIE ');
      const trident = ua.indexOf('Trident/');

      return (msie > 0 || trident > 0);
    }

    if (!isIE()) return;
    const cartSubmitInput = document.createElement('input');
    cartSubmitInput.setAttribute('name', 'checkout');
    cartSubmitInput.setAttribute('type', 'hidden');
    document.querySelector('#cart').appendChild(cartSubmitInput);
    document.querySelector('#checkout').addEventListener('click', function (event) {
      document.querySelector('#cart').submit();
    });
  })
}

function storeLocalization() {

  const GEOLOCATION_API_KEY = "dedf743cfea543cfa1ce4f08be16125b";

  const allStores = [
    {
      "languageCode": "en",
      "countryCode": "AU",
      "storeName": "Emma Australia (AU)",
      "storeUrl": "https://www.emma-sleep.com.au/",
    },
    {
      "languageCode": "de",
      "countryCode": "AT",
      "storeName": "Emma Austria (AT)",
      "storeUrl": "https://www.emma-matratze.at/",
    },
    {
      "languageCode": "fr",
      "countryCode": "BE",
      "storeName": "Emma Belgium (FR)",
      "storeUrl": "https://www.emma-matelas.be/",
    },
    {
      "languageCode": "nl",
      "countryCode": "BE",
      "storeName": "Emma Belgium (NL)",
      "storeUrl": "https://www.emma-matras.be/",
    },
    {
      "languageCode": "pt",
      "countryCode": "BR",
      "storeName": "Emma Brazil (BR)",
      "storeUrl": "https://www.colchoesemma.com.br/",
    },
    {
      "languageCode": "en",
      "countryCode": "CA",
      "storeName": "Emma Canada (EN)",
      "storeUrl": "https://www.emma-sleep.ca/",
    },
    {
      "languageCode": "fr",
      "countryCode": "CA",
      "storeName": "Emma Canada (FR)",
      "storeUrl": "https://qc.emma-sleep.ca/",
    },
    {
      "languageCode": "es",
      "countryCode": "CL",
      "storeName": "Emma Chile (CL)",
      "storeUrl": "https://www.emma-colchon.cl/",
    },
    {
      "languageCode": "da",
      "countryCode": "DK",
      "storeName": "Emma Denmark (DK)",
      "storeUrl": "https://www.emma.dk/",
    },
    {
      "languageCode": "fr",
      "countryCode": "FR",
      "storeName": "Emma France (FR)",
      "storeUrl": "https://www.emma.fr/",
    },
    {
      "languageCode": "de",
      "countryCode": "DE",
      "storeName": "Emma Germany (DE)",
      "storeUrl": "https://www.emma-matratze.de/",
    },
    {
      "languageCode": "en",
      "countryCode": "HK",
      "storeName": "Emma Hong Kong SAR China (EN)",
      "storeUrl": "https://www.emma-mattress.hk/en/",
    },
    {
      "languageCode": "zh",
      "countryCode": "HK",
      "storeName": "Emma Hong Kong SAR China (簡体中文)",
      "storeUrl": "https://www.emma-mattress.hk/cn/",
    },
    {
      "languageCode": "zh",
      "countryCode": "HK",
      "storeName": "Emma Hong Kong SAR China (繁體中文)",
      "storeUrl": "https://www.emma-mattress.hk/zh/",
    },
    {
      "languageCode": "en",
      "countryCode": "IN",
      "storeName": "Emma India (IN)",
      "storeUrl": "https://www.emma-mattress.in/",
    },
    {
      "languageCode": "id",
      "countryCode": "ID",
      "storeName": "Emma Indonesia (ID)",
      "storeUrl": "https://www.emma-sleep.co.id/",
    },
    {
      "languageCode": "en",
      "countryCode": "IE",
      "storeName": "Emma Ireland (IE)",
      "storeUrl": "https://www.emma-sleep.ie/",
    },
    {
      "languageCode": "it",
      "countryCode": "IT",
      "storeName": "Emma Italy (IT)",
      "storeUrl": "https://www.emma-materasso.it/",
    },
    {
      "languageCode": "en",
      "countryCode": "JP",
      "storeName": "Emma Japan (JP)",
      "storeUrl": "https://www.emma-sleep.jp/",
    },
    {
      "languageCode": "en",
      "countryCode": "MY",
      "storeName": "Emma Malaysia (MY)",
      "storeUrl": "https://www.emma-sleep.com.my/",
    },
    {
      "languageCode": "es",
      "countryCode": "MX",
      "storeName": "Emma Mexico (MX)",
      "storeUrl": "https://www.emma-colchon.com.mx/",
    },
    {
      "languageCode": "nl",
      "countryCode": "NL",
      "storeName": "Emma Netherlands (NL)",
      "storeUrl": "https://www.emma-sleep.nl/",
    },
    {
      "languageCode": "en",
      "countryCode": "NZ",
      "storeName": "Emma New Zealand (NZ)",
      "storeUrl": "https://www.emma-sleep.co.nz/",
    },
    {
      "languageCode": "en",
      "countryCode": "PH",
      "storeName": "Emma Philippines (PH)",
      "storeUrl": "https://www.emma-sleep.com.ph/",
    },
    {
      "languageCode": "pl",
      "countryCode": "PL",
      "storeName": "Emma Poland (PL)",
      "storeUrl": "https://www.emma-materac.pl/",
    },
    {
      "languageCode": "pt",
      "countryCode": "PT",
      "storeName": "Emma Portugal (PT)",
      "storeUrl": "https://www.colchaoemma.pt/",
    },
    {
      "languageCode": "en",
      "countryCode": "SG",
      "storeName": "Emma Singapore (SG)",
      "storeUrl": "https://www.emma-sleep.com.sg/",
    },
    {
      "languageCode": "ko",
      "countryCode": "KR",
      "storeName": "Emma South Korea (KR)",
      "storeUrl": "https://www.emma-mattress.co.kr/",
    },
    {
      "languageCode": "es",
      "countryCode": "ES",
      "storeName": "Emma Spain (ES)",
      "storeUrl": "https://www.emma-colchon.es/",
    },
    {
      "languageCode": "sv",
      "countryCode": "SE",
      "storeName": "Emma Sweden (SE)",
      "storeUrl": "https://www.emma.se/",
    },
    {
      "languageCode": "de",
      "countryCode": "CH",
      "storeName": "Emma Switzerland (CH)",
      "storeUrl": "https://www.emma-matratze.ch/",
    },
    {
      "languageCode": "fr",
      "countryCode": "CH",
      "storeName": "Emma Switzerland (FR)",
      "storeUrl": "https://www.emma-matelas.ch/",
    },
    {
      "languageCode": "it",
      "countryCode": "CH",
      "storeName": "Emma Switzerland (IT)",
      "storeUrl": "https://www.emma-materasso.ch/",
    },
    {
      "languageCode": "en",
      "countryCode": "TW",
      "storeName": "Emma Taiwan (TW_EN)",
      "storeUrl": "https://www.emma-sleep.com.tw/en/",
    },
    {
      "languageCode": "zh",
      "countryCode": "TW",
      "storeName": "Emma Taiwan (TW_ZH)",
      "storeUrl": "https://www.emma-sleep.com.tw/",
    },
    {
      "languageCode": "th",
      "countryCode": "TH",
      "storeName": "Emma Thailand (TH)",
      "storeUrl": "https://www.emma.co.th/",
    },
    {
      "languageCode": "en",
      "countryCode": "GB",
      "storeName": "Emma U.K. (UK)",
      "storeUrl": "https://www.emma-sleep.co.uk/",
    },
    {
      "languageCode": "en",
      "countryCode": "US",
      "storeName": "Emma U.S. (US)",
      "storeUrl": "https://www.emma-sleep.com/",
    },
    {
      "languageCode": "en",
      "countryCode": "VN",
      "storeName": "Emma Vietnam (VN)",
      "storeUrl": "https://www.emma-sleep.vn/",
    },
  ];

  function checkGeolocation() {
    fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${GEOLOCATION_API_KEY}`)
      .then(res => res.json())
      .then(ipgeo => {
        localizationGuard(ipgeo);
      });
  }

  function localizationGuard(ipgeo) {
    const popupShowed = !!sessionStorage.getItem("storeLocalizationPopupShowed");

    if (!popupShowed && ipgeo.country_code2 !== "CA") {
      showPopup();

      sessionStorage.setItem("storeLocalizationPopupShowed", "true");

      renderQuickRedirectElement();

      checkCountryAvailability(ipgeo);

      renderStoreOptions();
    }
  }

  // Automatically redirect all customers from Quebec to Canada French subdomain
  function quebecProvinceGuard(ipgeo) {
    const quebecUrl = "https://qc.emma-sleep.ca";

    const isInQuebecOrComingFromThere = location.origin === quebecUrl || document.referrer.includes(quebecUrl);

    const keepInEnglishSite = !!sessionStorage.getItem("keepInEnglishSite");

    if (isInQuebecOrComingFromThere) sessionStorage.setItem("keepInEnglishSite", "true");

    if (!isInQuebecOrComingFromThere && !keepInEnglishSite && ipgeo.state_prov === "Quebec") window.location.href = quebecUrl;
  }

  function redirectToOtherStore() {
    const $selectedOption = $(this).find("option:selected");

    const url = $selectedOption.val();

    const store = allStores.find(({ storeUrl }) => storeUrl === url);

    changeRedirectButton(store);
  }

  function showPopup() {
    $("#store-localization-popup").modal({
      fadeDuration: 100,
      modalClass: "",
      closeText: "×",
    });
  }

  function closePopup() {
    $.modal.close();
  }

  function renderStoreOptions() {
    const $countryDropdown = $(".change-country__dropdown");

    allStores.forEach(store => {
      const opt = document.createElement("option");
      opt.value = store.storeUrl;
      opt.text = store.storeName;
      opt.dataset.languageCode = store.languageCode;
      opt.dataset.countryCode = store.countryCode;

      $countryDropdown.append(opt);
    });


    $countryDropdown.change(redirectToOtherStore);
  }

  function checkCountryAvailability(ipgeo) {
    const allStoreCountryCodes = allStores.map(({ countryCode }) => countryCode);

    if (allStoreCountryCodes.includes(ipgeo.country_code2)) {
      const selectCountryTextEl = document.querySelector("#store-localization-popup .change-country__dropdown-label");

      selectCountryTextEl.textContent = `Alternatively you can choose your country from the list below:`;

      const store = allStores.find(({ countryCode }) => countryCode === ipgeo.country_code2);

      changeRedirectButton(store);
    }
  }

  function renderQuickRedirectElement() {
    const changeCountryEl = document.querySelector("#store-localization-popup .change-country");
    const el = document.createElement("div");
    el.classList.add("quick-redirect");
    el.innerHTML = `<a class="redirect-button"></a>`;

    changeCountryEl.firstElementChild.insertAdjacentElement("afterend", el);
  }

  function changeRedirectButton(store) {
    if (!store) return;

    const redirectBtnEl = document.querySelector("#store-localization-popup .change-country .redirect-button");

    redirectBtnEl.href = store.storeUrl;
    redirectBtnEl.text = `Go to ${store.storeName}`;
  }

  checkGeolocation();
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
