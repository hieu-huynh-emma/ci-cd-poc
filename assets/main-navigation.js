class NavToggler extends CustomButton {
    get refs() {
        const $siteNav = $("#navbar"),
            navOverlay = document.querySelector('nav-overlay');


        return {
            $siteNav,
            $hamburgerIcon: this.$el.find(".hamburger-icon"),
            $closeIcon: this.$el.find(".close-icon"),
            navOverlay
        }
    }

    constructor() {
        super();
    }

    setup() {
        this.setAccessibility()

        this.addEventListener('click', this.toggle)
    }

    setAccessibility() {
        this.$el.attr({
            "role": "button",
            "aria-haspopup": "dialog"
        })
    }

    toggle() {
        const {$siteNav, $hamburgerIcon, $closeIcon, navOverlay} = this.refs;

        const openClass = "site-nav--is-open"
        const isOpen = $siteNav.hasClass(openClass);

        if (isOpen) {
            $siteNav.slideUp(100);
            $siteNav.removeClass(openClass);
            $hamburgerIcon.show()
            $closeIcon.hide();
            $(document.body).removeClass('no-scroll')
        } else {
            $siteNav.slideDown(100)
            $siteNav.addClass(openClass)
            $hamburgerIcon.hide()
            $closeIcon.show()
            $(document.body).addClass('no-scroll')

            navOverlay.open()
        }
    }
}

customElements.define('nav-toggler', NavToggler);

class NavOverlay extends CustomElement {
    get refs() {
        const $navToggler = $('nav-toggler');
        return {
            $navToggler
        }
    }

    constructor() {
        super();
    }

    open() {
        const {$navToggler} = this.refs;

        this.$el.click(debounce(() => {
            this.$el.off('click')
            $navToggler.trigger('click');
        }, 100))
    }
}

customElements.define('nav-overlay', NavOverlay);

