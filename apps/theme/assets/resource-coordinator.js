$.getStylesheet = function (href) {
    const $d = $.Deferred();

    const url = new URL(href, "https://cdn.shopify.com/")

    if(!url.searchParams.has('v')) url.searchParams.set('v', Date.now())

    const $link = $('<link/>', {
        rel: 'stylesheet',
        type: 'text/css',
        href: url.toString()
    }).appendTo('head');
    $d.resolve($link);
    return $d.promise();
};

$.getVendorStylesheet = function (href) {
    const $d = $.Deferred();
    const $link = $('<link/>', {
        rel: 'stylesheet',
        type: 'text/css',
        href: href
    }).insertBefore('#vendor-custom-styles');
    $d.resolve($link);
    return $d.promise();
};

window.ResourceCoordinator = new class {
    cached = [];

    resources = new Map()

    constructor() {
    }

    registerVendor(vendorId, urls = [], postFetch) {
        this.resources.set(vendorId, {urls, postFetch})
    }

    async requestVendor(vendorId) {
        if (!vendorId) throw new Error("Please enter resource vendorId")

        if (this.cached.includes(vendorId)) return

        const resource = this.resources.get(vendorId)

        if (!resource) throw new Error("Cannot find resource!");

        const {urls, postFetch} = resource


        const [stylesheets, scripts] = partition(urls, url => url.match(/.css$/g))

        await this.loadVendorStylesheets(stylesheets)
        await this.loadVendorScripts(scripts);

        postFetch?.()

        this.cached.push(vendorId)
    }

    async loadVendorStylesheets(urls) {
        if (!urls.length) return

        await Promise.allSettled(urls.map(url => $.getVendorStylesheet(url)));
    }

    async loadVendorScripts(urls) {
        if (!urls.length) return
        await Promise.allSettled(urls.map(url => $.when($.getScript(url))))
    }
}

ResourceCoordinator.registerVendor(
    "Toastr",
    [
        "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css",
        "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"
    ],
    () => {
        toastr.options.closeButton = true;
        toastr.options.timeOut = 10 * 1000
        toastr.options.preventOpenDuplicates = true
    });

ResourceCoordinator.registerVendor(
    "Mediabox",
    [
        "https://cdn.jsdelivr.net/npm/mediabox@1.1.3/dist/mediabox.min.css",
        "https://cdn.jsdelivr.net/npm/mediabox@1.1.3/dist/mediabox.min.js"
    ])

ResourceCoordinator.registerVendor("Beefup", ["https://cdn.jsdelivr.net/npm/beefup@1.1.7/dist/js/jquery.beefup.min.js"])


ResourceCoordinator.registerVendor(
    "JqueryModal",
    [
        "https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.9.1/jquery.modal.min.css",
        "https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.9.1/jquery.modal.min.js"
    ])

ResourceCoordinator.registerVendor(
    "Select2",
    [
        "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css",
        "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"
    ])

ResourceCoordinator.registerVendor(
    "Swiper",
    [
        "https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.css",
        "https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.js"
    ])

ResourceCoordinator.registerVendor(
    "Splide",
    [
        "https://cdn.jsdelivr.net/npm/@splidejs/splide@4.0.1/dist/css/splide.min.css",
        "https://cdn.jsdelivr.net/npm/@splidejs/splide@4.0.1/dist/css/splide-core.min.css",
        "https://cdn.jsdelivr.net/npm/@splidejs/splide@4.0.1/dist/css/themes/splide-default.min.css",
        "https://cdn.jsdelivr.net/npm/@splidejs/splide@4.0.1/dist/js/splide.min.js"
    ])

ResourceCoordinator.registerVendor(
    "Tippy",
    ["https://unpkg.com/@popperjs/core@2", "https://unpkg.com/tippy.js@6"]
)
