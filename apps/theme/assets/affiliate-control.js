class AffiliateControl extends CustomElement {

    urlParams

    get refs() {
        return {
            allAffiliates: JSON.parse(document.querySelector('#All-Affiliates-JSON').textContent)
        };
    }

    constructor() {
        super();

        this.urlParams = new URLSearchParams(window.location.search);
    }

    beforeMount() {
        super.beforeMount();

        const affiliate = this.guardAffiliate()

        if (affiliate) this.activate(affiliate)
    }

    activate() {
    }

    guardAffiliate() {
        const {allAffiliates} = this.refs;

        const utmSource = this.urlParams.get('utm_source');

        if (!utmSource) return;

        const affiliate = allAffiliates.find(affiliate => this.validateAffiliateSource(affiliate, utmSource))

        if (!affiliate) return;

        return affiliate
    }

    validateAffiliateSource(affiliate, utmSource) {
        const {type, settings: {id, source}} = affiliate

        if (type === 'shareasale') {
            return `Shareasale-${id}` === utmSource
        }

        return source === utmSource
    }

}

class AffiliateLayout extends AffiliateControl {

    constructor() {
        super();
    }

    activate(affiliate) {
        super.init();

        this.blockSearchIndexing();

        this.renderBanner(affiliate);

        this.renderBadge(affiliate);
    }

    blockSearchIndexing() {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'robots');
        meta.setAttribute('content', 'noindex');

        document.getElementsByTagName('head')[0].appendChild(meta);
    }

    renderBanner(affiliate) {
        const {settings: {url, logo, message, background_color, text_color}} = affiliate;

        const $banner = $('<div>', {
            id: 'affiliate-announcement-bar-section',
            css: {
                '--bg-color': background_color,
                '--text-color': text_color,
                'display': 'flex'
            }
        });

        $banner.html(`
          <a href="${url || '#'}" class="affiliate-container">
            ${logo ? `<img class="affiliate-logo" src="${logo}"/>` : ''}
            <p>${message}</p>
          </a>
        `);
        $(this).append($banner);

    }

    renderBadge(affiliate) {
        const {settings: {badge}} = affiliate;

        const $container = $('.promotion-overlay .product-badges');

        console.log(badge)

        if (badge) $container.append(`<div class="product-badge">
                        <img src="${badge}&crop=center&height=108" alt="affiliate-badge">
                    </div>`);
    }
}


customElements.define('affiliate-layout', AffiliateLayout);

class AffiliateAutoCoupon extends AffiliateControl {
    props = {
        success: '',
        error: ''
    };

    constructor() {
        super();
    }

    activate(affiliate) {
        const utmCode = this.urlParams.get('utm_code');
        const {type, settings: {discount_code}} = affiliate

        const coupon = type === 'shareasale' ? discount_code : utmCode

        if (!coupon) return;

        this.applyDiscountCode(coupon);
    }

    async applyDiscountCode(code) {
        await fetch(`/discount/${code}`);

        await ResourceCoordinator.requestVendor('Toastr')

        // Trigger GA event
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'coupon_code_added',
            'coupon_code': code,
            'coupon_code_method': 'auto_applied',
            'coupon_code_applied': true,
            'gtm.uniqueEventId': 1
        });

        const {success} = this.props;


        toastr.success(success.replace('{discount_code}', code.toUpperCase()), '', {
            iconClass: ''
        });
    }
}

customElements.define('affiliate-auto-coupon', AffiliateAutoCoupon);
