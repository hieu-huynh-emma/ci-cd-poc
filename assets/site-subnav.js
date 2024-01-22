class SiteSubnav extends CustomElement {
    parentIndex = null

    data = {
        title: "",
        url: ""
    }

    get refs() {
        const siteNav = document.querySelector('site-nav')

        return {
            $subNavItems: this.$el.find("site-subnav-item"),
            siteNav,
            mainNavigationMenu: JSON.parse(document.getElementById("main-navigation-menu").textContent)
        }
    }

    beforeMount() {
        super.beforeMount();

        this.getActiveNavLink()
    }

    mounted() {
        super.mounted();
    }

    refresh() {
        const {siteNav} = this.refs;

        if (siteNav.activeIndex === this.parentIndex) return

        this.getActiveNavLink()

        this.render();
    }

    render() {
        this.innerHTML = this.template();
    }

    template() {
        if (!this.data) return null

        const {title} = this.data;

        return `
        <div class="subnav-container ${title}" data-name="${title}">
            <nav-sidebar :parentIndex="${this.parentIndex}"></nav-sidebar>
        </div>

        <nav-spotlight class="spotlight" :parentIndex="${this.parentIndex}"></nav-spotlight>
    `
    }

    getActiveNavLink() {
        const {siteNav, mainNavigationMenu} = this.refs;

        this.parentIndex = siteNav.activeIndex

        this.data = mainNavigationMenu[this.parentIndex]
    }
}

customElements.define('site-subnav', SiteSubnav);

class SiteSubavItem extends CustomElement {
    props = {
        path: ""
    }

    data = {}

    get refs() {
        const $navSpotlight = this.$el.closest("site-subnav").find('nav-spotlight'),
            navSpotlight = $navSpotlight.get(0)
        return {
            navSpotlight,
            mainNavigationMenu: JSON.parse(document.getElementById("main-navigation-menu").textContent)
        }
    }

    constructor() {
        super();
    }

    setup() {
    }

    mounted() {
        super.mounted();
        this.$el.on('mouseover', this.renderSpotLight)
    }

    beforeMount() {
        super.beforeMount();
        const {mainNavigationMenu} = this.refs
        const {path} = this.props

        this.data = _.get(mainNavigationMenu, path)
    }

    renderSpotLight = debounce(() => {
        const {object, featuredImage, url, accentuate} = this.data
        const {navSpotlight} = this.refs;

        navSpotlight?.refresh({
            name: object.title,
            price: object.price,
            originalPrice: object.compare_at_price,
            url: url,
            featuredImage,
            accentuate
        })
    }, 200)
}

customElements.define('site-subnav-item', SiteSubavItem);

class NavSidebar extends CustomElement {
    props = {
        parentIndex: 0
    }

    get refs() {
        const siteNav = document.querySelector('site-nav')

        return {
            $subNavItems: this.$el.find("site-subnav-item"),
            siteNav,
            $navSpotlight: this.$el.find('nav-spotlight'),
            mainNavigationMenu: JSON.parse(document.getElementById("main-navigation-menu").textContent)
        }
    }

    async render() {
        if (!isMobileViewport()) {
            this.innerHTML = `<loading-overlay></loading-overlay>`
        }

        this.innerHTML = await this.template();

        this.populateSpotlight()
    }

    populateSpotlight() {
        const {$subNavItems, $navSpotlight} = this.refs;

        const firstSubNavItem = $subNavItems.first().get(0)

        if ($navSpotlight.get(0)?.mounted) {
            console.log('mounted')
            firstSubNavItem?.renderSpotLight()
        } else {
            $navSpotlight.on('mounted', () => {
                firstSubNavItem?.renderSpotLight()

            })
        }
    }

    async template() {
        const {mainNavigationMenu} = this.refs;
        const {parentIndex} = this.props

        this.data = mainNavigationMenu[parentIndex]

        if (!this.data) return null

        const {title, url} = this.data
        const btnText = title === "Mattresses" ? "Compare " : "Shop " + title

        const [i18nTitle, i18nBtnText] = await translateWeglot([title, btnText]);

        const navItems = await this.renderSubnavItems();

        return `
          <p class="subnav-container__title paragraph-20 font-semibold">${i18nTitle}</p>

          <ul
            class="subnav-container__links"
          >
            ${navItems.join('')}
          </ul>

          <a href="${url}" class="compare-btn btn btn--secondary btn--compact">
            ${i18nBtnText}
          </a>
    `
    }

    async renderSubnavItems() {
        const {children} = this.data
        const {parentIndex} = this.props

        return Promise.all(children.map(async (childlink, i) => {
            const [i18nTitle] = await translateWeglot([childlink.title])

            return `<site-subnav-item
                :path="[${parentIndex}].children[${i}]"
                class="site-subnav__item"
              >
                <a
                  href="${childlink.url}"
                  class="site-subnav__link"
                  ${childlink.active ? `aria-current="page"` : ""}
                  tabindex="-1"
                >
                 <p class="subnav-container__badge">${childlink.promotionCapsule}</p>
                  <div class="sub-item-content">
                     <div class="title_dis">
                      <p class="font-semibold font-inter">
                        ${i18nTitle}
                      </p>
                 ${childlink.subnavHtmlContent} 
                   </div>
              <img src="${childlink.submenuThumbImage}&transform=resize=600" class="spotlight__image w-full h-full object-contain" loading="lazy" />
                  </div>
                </a>
              </site-subnav-item>`
        }))
    }

}

customElements.define('nav-sidebar', NavSidebar);

class NavSpotlight extends CustomElement {
    props = {
        parentIndex: 0
    }

    data = {
        name: "",
        price: "",
        originalPrice: "",
        imageUrl: null,
        url: "#",
        badgeText: ""
    }

    get refs() {
        return {
            mainNavigationMenu: JSON.parse(document.getElementById("main-navigation-menu").textContent)
        }
    }

    constructor() {
        super();
    }

    async connectedCallback() {
        this.extractProps();
        this.init();

        this.beforeMount()
        await this.render();

        setTimeout(() => {
            $(this).ready(this.mounted.bind(this))
        }, 0)
    }

    init() {
        super.init();
    }

    async render() {
        this.$el.css("opacity", 0)
        this.innerHTML = await this.template();
        setTimeout(() => {
            this.$el.css("opacity", 1)
        }, 500)
    }

    mounted() {
        super.mounted();
        const {parentIndex} = this.props

        const path = `[${parentIndex}].children[0]`;
        const {mainNavigationMenu} = this.refs

        const data = _.get(mainNavigationMenu, path)
        const {object, featuredImage, url, accentuate} = data

        this.refresh({
            name: object.title,
            price: object.price,
            originalPrice: object.compare_at_price,
            url: url,
            featuredImage,
            accentuate
        })
    }

    async template() {
        const {name, price, originalPrice, url, imageUrl, badgeText} = this.data;

        const [i18nBadge, i18nName, i18nFromText] = await translateWeglot([badgeText, name, 'From'])

        return `
      <div class="spotlight-media bg-wild-sand">
        ${badgeText ? `<p class="spotlight__badge absolute top-5 left-4 text-[13px]">${i18nBadge}</p>` : ""}
        <a href="${url}" class="spotlight__link">
          <img src="${imageUrl}" class="spotlight__image w-full h-full object-contain" loading="lazy" />
        </a>
      </div>

      <div class="spotlight-body">
        <a href="${url}" class="spotlight__link">
          <p class="spotlight__name text-xl font-semibold">${i18nName}</p>
        </a>
        <div class="flex items-center gap-2 text-md">
          ${originalPrice ? `<p class="inline">${i18nFromText}</p> ` : ""}<span class="spotlight__price text-scarlet font-bold">${price}</span>
          ${originalPrice ? `<span class="spotlight__original-price line-through text-xs">${originalPrice}</span>` : ""}
        </div>
      </div>
    `
    }

    refresh({name, price, url, originalPrice, featuredImage, accentuate}) {

        this.data.name = name;
        this.data.price = currencyFormatter.format(price / 100);
        this.data.originalPrice = originalPrice ? currencyFormatter.format(originalPrice / 100) : null
        this.data.imageUrl = accentuate.navigation_spotlight_image ? `${accentuate.navigation_spotlight_image[0].src}&transform=resize=600` : featuredImage;
        this.data.url = url;

        const discountedAmount = originalPrice - price;

        const discountedPrice = accentuate.upto_discount || (100 * discountedAmount / originalPrice).toFixed(0);

        this.data.badgeText = discountedPrice > 0 ? `Up to ${discountedPrice}% off` : "";

        this.render()
    }
}

customElements.define('nav-spotlight', NavSpotlight);
