function openChatSupport() {
  if (!window.fcWidget.isOpen()) {
    window.fcWidget.open();
  }
}

function getComparisonCompetitor(competitors) {
  const emmaWithCompetitor = location.pathname.replace('/pages/', '')
  const competitorParam = emmaWithCompetitor.replace('emma-vs-', '')
  const competitor = competitors.find(c => c.brandName.toLowerCase().split(' ').join('-') === competitorParam)
  return competitor ?? competitors.find(c => c.brandName.toLowerCase().split(' ').join('-') === 'casper')
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const Currency = {
  format: (val, options) => {
    const defaultOptions = {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }

    return new Intl.NumberFormat('en-US', {
      ...defaultOptions,
      ...options
    }).format(val)
  }
}


function isFunction(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}

function isNumber(n) {
  return typeof n === 'number' && isFinite(n);
}

function waitUntil(conditionFunction) {
  const poll = resolve => {
    if (conditionFunction()) resolve();
    else setTimeout(_ => poll(resolve), 400);
  }

  return new Promise(poll);
}

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
