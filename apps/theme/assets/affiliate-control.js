class AffiliateControl extends HTMLElement {


    get refs() {
        return {
            allAffiliates: JSON.parse(document.querySelector('#All-Affiliates-JSON').textContent)
        }
    }

    constructor() {
        super();
    }

    connectedCallback() {
        this.guardAffiliate()
    }

    blockSearchIndexing() {
        const meta = document.createElement('meta');
        meta.setAttribute("name", "robots");
        meta.setAttribute("content", "noindex");

        document.getElementsByTagName('head')[0].appendChild(meta);
    }

    renderBanner(affiliate) {
        const {url, logo, message, background_color, text_color} = affiliate;

        const $banner = $('<div>', {
            id: "affiliate-announcement-bar-section",
            css: {
                '--bg-color': background_color,
                '--text-color': text_color,
                'display': "flex"
            }
        })

        $banner.html(`
          <a href="${url || "#"}" class="affiliate-container">
            ${logo ? `<img class="affiliate-logo" src="${logo}"/>` : ""}
            <p>${message}</p>
          </a>
        `)
        $(this).append($banner)

    }

    renderBadge(affiliate) {
        const {badge} = affiliate;

        const $container = $(".affiliate-badge")

        if (badge) $container.append(`<img src="${badge}" />`)

    }

    guardAffiliate() {
        const {allAffiliates} = this.refs

        const urlParams = new URLSearchParams(window.location.search);

        const utmSource = urlParams.get("utm_source");

        if (!utmSource) return

        const affiliate = allAffiliates.find(({platform, id}) => `${platform}-${id}` === utmSource);
        console.log("=>(affiliate-control.js:67) affiliate", affiliate);

        if (!affiliate) return


        this.blockSearchIndexing();

        this.renderBanner(affiliate)

        this.renderBadge(affiliate)
    }

}

customElements.define('affiliate-control', AffiliateControl);

