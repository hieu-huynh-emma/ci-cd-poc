function parsePhoneNumbers(phone) {
  const parts = phone.split("-");

  const tel = `+1${parts[0]}${parts[1]}${parts[2]}`;
  const vanityPhone = `1 (${parts[0]}) ${parts[1]} EMMA`;

  return { tel, vanityPhone };
}

function getComparisonCompetitor(competitors) {
  const emmaWithCompetitor = location.pathname.replace("/pages/", "");
  const competitorParam = emmaWithCompetitor.replace("emma-vs-", "");
  const competitor = competitors.find((c) => c.brandName.toLowerCase().split(" ").join("-") === competitorParam);
  return competitor ?? competitors.find((c) => c.brandName.toLowerCase().split(" ").join("-") === "casper");
}

function openChatSupport() {
  if (!window.fcWidget.isOpen()) {
    window.fcWidget.open();
  }
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const Currency = {
  format: (n, options) => {
    const defaultOptions = {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: n % 1 === 0 ? 0 : 2,
    };

    return new Intl.NumberFormat("en-US", {
      ...defaultOptions,
      ...options,
    }).format(n);
  },
};

function getTimeParts(delta) {
  const days = Math.floor(delta / 86400);
  delta -= days * 86400;

  const hours = Math.floor(delta / 3600) % 24;
  delta -= hours * 3600;

  const minutes = Math.floor(delta / 60) % 60;
  delta -= minutes * 60;

  const seconds = Math.floor(delta % 60); // in theory the modulus is not required

  return [days, hours, minutes, seconds];
}

function isFunction(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}

function isNumber(n) {
  return typeof n === "number" && isFinite(n);
}

function wait(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

function waitUntil(conditionFunction) {
  const poll = (resolve) => {
    if (conditionFunction()) resolve();
    else setTimeout((_) => poll(resolve), 400);
  };

  return new Promise(poll);
}

function isMobileViewport() {
  const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  return screenWidth < 769;
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function partition(collection, predicate) {
  return collection.reduce((r, value) => (r[predicate(value) ? 0 : 1].push(value), r), [[], []]);
}

function translateWeglot(words) {
  return Promise.all(
    words.map((w) =>
      Weglot.translate({
        words: [{ t: 1, w }],
        languageTo: Weglot.getCurrentLang(),
      }),
    ),
  );
}

function extractIdFromGid(gid) {
  return gid.split("/").pop();
}

function generateShopifyGid(entityType, id) {
  return `gid://shopify/${entityType}/${id}`;
}
