class LazyComponent extends HTMLElement {
    isLoaded = false

    constructor() {
        super();
        this.intersectionObserver = new IntersectionObserver(this.onIntersection.bind(this))

        this.$el = $(this);

        this.innerHTML = `
            <loading-overlay></loading-overlay>
            ${this.innerHTML}
        `

        this.lazyScripts = [...this.querySelectorAll('lazy-script')];

        if (window.LazyResourceDefined) {
            this.init();
        } else {
            window.addEventListener('LazyResourceDefined', this.init.bind(this))
        }
    }

    onIntersection(entries) {
        entries.forEach(entry => {
            const isIntersecting = entry.isIntersecting

            if (isIntersecting && !this.isLoaded) {
                this.load()
            }
        })
    }

    async init() {
        this.intersectionObserver.observe(this);

        await Promise.allSettled(this.lazyScripts.map(s => s.whenLoaded()));

        await this.cleanup()
    }

    load() {
        this.intersectionObserver.disconnect();

        setTimeout(this.loadTemplate.bind(this), 0);

        this.lazyScripts.forEach(s => s.load())

        this.isLoaded = true
    }
    loadTemplate() {
        const template = this.querySelector("template")

        if (!template) return

        try {
            template.outerHTML = `
                <div class="lazy-content hidden">
                    ${template.innerHTML} 
                </div> 
            `
        } catch (e) {
            console.log(e)
        }
    }

    async cleanup() {
        const lazyContent = this.querySelector(".lazy-content");
        const loadingOverlay = this.$el.find('loading-overlay')

        $(lazyContent).contents().unwrap();

        await loadingOverlay.fadeOut(500).promise()

        loadingOverlay.remove()

        this.$el.contents().unwrap();
    }
}

customElements.define('lazy-component', LazyComponent);
