function openChatSupport() {
  if (!window.fcWidget.isOpen()) {
    window.fcWidget.open();
  }
}

function getComparisonCompetitor(competitors) {
  const params = new URLSearchParams(window.location.search)
  const competitorParam = params.get('competitor') ?? 'Casper'
  const competitor = competitors.find(c => c.brandRoute === competitorParam)
  return competitor ?? competitors.find(c => c.brandRoute === 'Casper')
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
