class SiteNav extends CustomElement {

    activeIndex = null;

    isLoaded = false

    isOpen = false

    get refs() {
        const navDropdown = document.querySelector('nav-dropdown'),
            $navDropdown = $(navDropdown),
            $siteSubnav = $navDropdown.find('site-subnav');

        return {
            $navDropdown,
            navDropdown,
            $siteSubnav,
            siteSubnavEl: $siteSubnav.get(0)
        }
    }

    constructor() {
        super()
    }

    async prepare() {
        const {navDropdown} = this.refs

        navDropdown.open();

        await this.refs.navDropdown.loadSubnav();

        this.isLoaded = true
    }

    changeActive(index = 0) {
        this.activeIndex = index
    }

    open() {
        this.$el.slideDown(500)
        this.isOpen = true
    }

    close() {
        this.$el.slideUp(250)
        this.isOpen = false
    }
}

customElements.define('site-nav', SiteNav);

class SiteNavItem extends CustomElement {
    props = {
        index: 0,
        name: "",
        hasDropdown: false,
        isMinimal: false
    }

    active = false

    get refs() {
        const $siteNav = this.$el.closest('site-nav'),
            siteNav = $siteNav.get(0)

        return {
            $siteNav,
            siteNav,
            ...$siteNav.get(0).refs
        }
    }

    constructor() {
        super();
    }

    setup() {
        if (isMobileViewport()) {
            this.addEventListener('click', this.prepareMobileDropdown)
        } else {
            this.addEventListener('mouseover', debounce(this.onMouseOver.bind(this), 100))
        }
    }

    init() {
        super.init();

        this.$el.attr('aria-haspopup', true)
    }

    async onMouseOver() {
        const {siteNav, siteSubnavEl, navDropdown} = this.refs
        const {isMinimal, index} = this.props

        if (isMinimal) return

        if (siteNav.activeIndex === index) return

        siteNav.changeActive(index)

        // if (!siteNav.isLoaded) {
        //     await siteNav.prepare();
        //
        //     if (!!siteSubnavEl) siteSubnavEl.eagerLoadSpotlight()
        //
        //     return
        // }

        navDropdown.open();
        siteSubnavEl.refresh()
    }

    async prepareMobileDropdown() {
        const {isMinimal} = this.props

        await this.clear();

        if (!!this.active) {
            this.active = false
            return
        }

        isMinimal ? this.toggleMinimalDropdown() : await this.openMobileDropdown();

        this.active = !this.active

        this.scrollIntoView({
            behavior: "smooth"
        })
    }

    async clear() {
        const {$siteNav, siteNavItems, navDropdown} = this.refs

        this.$el.siblings().each(function () {
            this.active = false
        })
        await navDropdown.close();
        $siteNav.find('.minimal-nav-dropdown').each(function () {
            $(this).slideUp()
        })
    }

    async openMobileDropdown() {
        const {index} = this.props
        const {siteNav, navDropdown} = this.refs

        siteNav.changeActive(index);

        navDropdown.attach();

        // if (!siteNav.isLoaded) {
        //     await siteNav.prepare()
        // }

        await navDropdown.open();
    }

    toggleMinimalDropdown() {
        const $minimalDropdown = this.$el.find(".minimal-nav-dropdown")


        $minimalDropdown[this.active ? 'slideUp' : 'slideDown']();
    }
}

customElements.define('site-nav-item', SiteNavItem);

class NavDropdown extends CustomElement {

    isOpen = false

    get refs() {
        const siteNav = document.querySelector('site-nav'),
            $siteNav = $(siteNav),
            $siteSubnav = this.$el.find('site-subnav'),
            $cartToggler = $(document.querySelector('nav-toggler')),
            activeSiteNavItem = $siteNav.find(`site-nav-item[\\:index="${siteNav.activeIndex}"]`)
        return {
            $siteNav,
            siteNav,
            $siteSubnav,
            siteSubnavEl: $siteSubnav.get(0),
            $cartToggler,
            activeSiteNavItem

        }
    }

    async loadSubnav() {
        const template = document.getElementById('site-subnav-tpl')

        if (!template) return

        setTimeout(() => {
            this.innerHTML = template.innerHTML;
        }, 500)

        await $.getScript(Shop.assetUrl + 'site-subnav.js')
    }

    onMouseMove = debounce((e) => {
        const {siteNav} = this.refs

        const isOutside = (!this.contains(e.target) && !siteNav.contains(e.target)) || !!e.target.closest(`site-nav-item[\\:isMinimal="true"]`)

        if (isOutside) this.close()
    }, 100)

    open() {
        this.isOpen = true

        return this.$el.slideDown({
            duration: 150,
            start: () => {
                this.$el.css({
                    display: "flex"
                });

                $(document).on("mousemove", this.onMouseMove)
            }
        }).promise();
    }

    close() {
        const {siteNav} = this.refs

        this.isOpen = false;

        $(document).off('mousemove');
        siteNav.activeIndex = null

        return this.$el.slideUp({
            duration: 100,
            done: function () {
                $(this).css({
                    display: "none"
                })
            }
        }).promise()
    }

    attach() {
        const {activeSiteNavItem} = this.refs

        this.$el.detach().appendTo(activeSiteNavItem)
    }
}

customElements.define('nav-dropdown', NavDropdown);

