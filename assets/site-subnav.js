class SiteSubnav extends CustomElement {

    data = {}

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

        // console.log(document.getElementById("main-navigation-menu").textContent)
        this.eagerLoadSpotlight();
    }

    refresh() {
        this.getActiveNavLink()

        this.render();

        this.clear()
    }

    template() {

        if (!this.data) return null

        const {title, url} = this.data;

        return `
        <div class="subnav-container ${title}" data-name="${title}">
          <p class="subnav-container__title paragraph-20 font-semibold weglot-tr">${title}</p>

          <ul
            class="subnav-container__links"
          >
            ${this.renderSubnavItems()}
          </ul>

          <a href="${url}" class="compare-btn btn btn--secondary btn--compact weglot-tr">
            ${title === "Mattresses" ? "Compare " : "Shop " + title}
          </a>
        </div>

        <nav-spotlight class="spotlight"></nav-spotlight>
    `
    }

    getActiveNavLink() {
        const {siteNav, mainNavigationMenu} = this.refs;

        this.parentIndex = siteNav.activeIndex

        this.data = mainNavigationMenu[this.parentIndex]
    }

   renderSubnavItems() {
        const {children} = this.data

        return children.map((childlink, i) => {

            return `<site-subnav-item
                :path="[${this.parentIndex}].children[${i}]"
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
                      <p class="font-semibold font-inter weglot-tr">
                    ${childlink.title}
                  </p>
                 ${childlink.subnavHtmlContent } 
                   </div>
              <img src="${childlink.submenuThumbImage }&transform=resize=600" class="spotlight__image w-full h-full object-contain" loading="lazy" />
                  </div>
                </a>
              </site-subnav-item>`
        }).join('')
    }

    eagerLoadSpotlight() {
        const {$subNavItems} = this.refs;

        const firstSubNavItem = $subNavItems.first().get(0)

        firstSubNavItem?.renderSpotLight()
    }

    clear() {
        const {$subNavItems} = this.refs;

        const firstSubNavItem = $subNavItems.first().get(0)

        firstSubNavItem?.renderSpotLight()
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

class NavSpotlight extends CustomElement {
    props = {}

    data = {
        name: "",
        price: "",
        originalPrice: "",
        imageUrl: null,
        url: "#",
        badgeText: ""
    }
    constructor() {
        super();
    }

    init() {
        super.init();
    }

    template() {
        const {name, price, originalPrice, url, imageUrl, badgeText} = this.data
        return `
      <div class="spotlight-media bg-wild-sand">
        ${badgeText ? `<p class="spotlight__badge absolute top-5 left-4 text-[13px] weglot-tr">${badgeText}</p>` : ""}
        <a href="${url}" class="spotlight__link">
          <img src="${imageUrl}" class="spotlight__image w-full h-full object-contain" loading="lazy" />
        </a>
      </div>

      <div class="spotlight-body">
        <a href="${url}" class="spotlight__link">
          <p class="spotlight__name text-xl font-semibold weglot-tr">${name}</p>
        </a>
        <p class="text-md">
          ${originalPrice ? `<span class="weglot-tr">From</span> ` : ""}<span class="spotlight__price text-scarlet font-bold">${price}</span>
          ${originalPrice ? `<span class="spotlight__original-price line-through text-xs">${originalPrice}</span>` : ""}
        </p>
      </div>
    `
    }

    refresh({name, price, url, originalPrice,featuredImage, accentuate}) {

        this.data.name = name;
        this.data.price = currencyFormatter.format(price / 100);
        this.data.originalPrice = originalPrice ? currencyFormatter.format(originalPrice / 100) : null
        this.data.imageUrl = accentuate.navigation_spotlight_image? `${accentuate.navigation_spotlight_image[0].src}&transform=resize=600` : featuredImage;
        this.data.url = url;

        const discountedAmount = originalPrice - price;

        const discountedPrice = accentuate.upto_discount || (100 * discountedAmount / originalPrice).toFixed(0);

        this.data.badgeText = discountedPrice  > 0 ? `Up to ${discountedPrice}% off` : "";

        this.render()
    }
}

customElements.define('nav-spotlight', NavSpotlight);
