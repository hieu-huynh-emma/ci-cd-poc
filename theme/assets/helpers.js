function parsePhoneNumbers(phone) {
    const tel = `+1 ${phone}`;
    const vanityPhone = `1 ${phone}`;

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
        window.fcWidget.open({ name: "How we can help?" });
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

function isTabletViewport() {
    const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    return screenWidth < 1024;
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
    return gid.split("/").pop().split("?").shift();
}

function generateShopifyGid(entityType, id) {
    return `gid://shopify/${entityType}/${id}`;
}

function waitForAnimation(element) {
    return new Promise((resolve) => {
        element.addEventListener("animationend", resolve);
    });
}

function generateUUID() {
    const timestamp = Date.now();
    // Multiply by 1e17 (10^17) to ensure large number that can mimic actual UUID randomness
    const random = Math.floor(Math.random() * 1e17).toString(16);

    return `${timestamp.toString(16)}${random.padStart(12, "0")}`;
}
