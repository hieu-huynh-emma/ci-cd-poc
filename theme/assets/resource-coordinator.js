$.getStylesheet = function(href) {
    const $d = $.Deferred();

    const url = new URL(href, "https://cdn.shopify.com/");

    if (!url.searchParams.has("v")) url.searchParams.set("v", Date.now());

    const $link = $("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        href: url.toString(),
    }).appendTo("head");
    $d.resolve($link);
    return $d.promise();
};

$.getVendorStylesheet = function(href) {
    const $d = $.Deferred();
    const $link = $("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        href: href,
    }).insertBefore("#vendor-custom-styles");
    $d.resolve($link);
    return $d.promise();
};

window.ResourceCoordinator = new (class {
    cached = [];
    queue = [];
    isRunning = false;

    resources = new Map();

    constructor() {
    }

    registerVendor(vendorId, urls = [], waitForGlobalName, postFetch) {
        this.resources.set(vendorId, { urls, postFetch, waitForGlobalName});
    }

    async requestVendor(vendorId) {
        if (!vendorId) {
            return Promise.reject("Please enter resource vendorId");
        }

        return new Promise((resolve) => {
            this.queue.push(vendorId);

            window.addEventListener("resource-coordinator-finish", resolve);

            this.checkQueue();
        });
    }

    checkQueue() {
        if (this.queue.length && !this.isRunning) {
            this.startQueue();
        }
    }

    async startQueue() {
        if (!this.queue.length) {
            this.isRunning = false;
            window.dispatchEvent(new Event("resource-coordinator-finish"));
            return;
        }

        this.isRunning = true;

        let vendorId = this.queue.shift();

        await this.consumeQueue(vendorId);

        this.startQueue();
    }

    async consumeQueue(vendorId) {
        if (this.cached.includes(vendorId)) return;

        const resource = this.resources.get(vendorId);

        if (!resource) throw new Error("Cannot find resource!");

        const { urls, postFetch, waitForGlobalName } = resource;

        const [stylesheets, scripts] = partition(urls, (url) => url.match(/.css$/g));

        await this.loadVendorStylesheets(stylesheets);
        await this.loadVendorScripts(scripts);
        if (waitForGlobalName) await this.waitForGlobal(waitForGlobalName);

        postFetch?.();

        this.cached.push(vendorId);
    }

    async loadVendorStylesheets(urls) {
        if (!urls.length) return;

        await Promise.allSettled(urls.map((url) => $.getVendorStylesheet(url)));
    }

    async loadVendorScripts(urls) {
        if (!urls.length) return;
        await Promise.allSettled(urls.map((url) => $.getScript(url)));
    }

    waitForGlobal(name, maxWait = 5000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            (function check() {
                if (window[name]) return resolve(window[name]);
                if (Date.now() - start > maxWait) return reject(`${name} not available in time`);
                requestAnimationFrame(check);
            })();
        });
    }
})();

ResourceCoordinator.registerVendor(
    "Toastr",
    ["https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css", "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"],
    "toastr",
    () => {
        toastr.options.closeButton = true;
        toastr.options.timeOut = 10 * 1000;
        toastr.options.preventOpenDuplicates = true;
    },
);

ResourceCoordinator.registerVendor("Mediabox", [
    "https://cdn.jsdelivr.net/npm/mediabox@1.1.3/dist/mediabox.min.css",
    "https://cdn.jsdelivr.net/npm/mediabox@1.1.3/dist/mediabox.min.js",
]);

ResourceCoordinator.registerVendor("Beefup", ["https://cdn.jsdelivr.net/npm/beefup@1.1.7/dist/js/jquery.beefup.min.js"]);

ResourceCoordinator.registerVendor("JqueryModal", [
    "https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.9.1/jquery.modal.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.9.1/jquery.modal.min.js",
]);

ResourceCoordinator.registerVendor("Select2", [
    "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css",
    "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js",
]);

ResourceCoordinator.registerVendor("Swiper", [
    "https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.css",
    "https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.js",
]);

ResourceCoordinator.registerVendor("Splide", [
    Shop.assetUrl + "splide@4.0.1.min.css",
    Shop.assetUrl + "splide@4.0.1.min.js",
    "Splide"
]);

ResourceCoordinator.registerVendor("Tippy", [
    Shop.assetUrl + "popper.min.js" ,
    Shop.assetUrl + "tippy.min.js" ,
    "tippy"
]);

ResourceCoordinator.registerVendor("DriftZoom", ["https://cdnjs.cloudflare.com/ajax/libs/drift-zoom/1.5.1/Drift.min.js"]);
ResourceCoordinator.registerVendor("MultiClamp", [Shop.assetUrl + "MultiClamp.min.js"]);

ResourceCoordinator.registerVendor("AsSwitch", ["https://cdn.jsdelivr.net/npm/jquery-asSwitch@0.2.3/dist/jquery-asSwitch.min.js", "https://cdn.jsdelivr.net/npm/jquery-asSwitch@0.2.3/dist/css/asSwitch.min.css"]);

ResourceCoordinator.registerVendor("Fancybox", [
    Shop.assetUrl + "fancybox.js",
    Shop.assetUrl + "fancybox.css",
    // Shop.assetUrl + "fancybox.carousel.js",
    // Shop.assetUrl + "fancybox.carousel.css",
    // Shop.assetUrl + "fancybox.carousel.autoplay.js",
    // Shop.assetUrl + "fancybox.carousel.autoplay.css",
    // Shop.assetUrl + "fancybox.carousel.thumbs.js",
    // Shop.assetUrl + "fancybox.carousel.thumbs.css"
]);
ResourceCoordinator.registerVendor("FsLightbox", [Shop.assetUrl + "fslightbox.js"]);
