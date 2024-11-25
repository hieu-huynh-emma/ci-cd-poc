if (!customElements.get("picture-tag")) {
    customElements.define("picture-tag", class extends CustomElement {
        props = {
            src: "",
            "desktop.src": "",
            "mobile.src": "",
            alt: "",
            fit: "none" // cover | contain | fill | scale-down
        }

        url = ""

        breakpoints = [
            // Small Devices (phones)
            481,
            576,
            // Medium Devices (tablets)
            768,
            // Large Devices (desktops, 992px and up)
            992,
            // Extra Large Devices (large desktops, 1200px and up)
            1200
        ];

        srcsets = []

        placeholder = ""


        constructor() {super();}

        template() {
            const {alt, width, height, fit} = this.props
            return `<picture>
                        <img
                            src="${this.placeholder}"
                            alt="${alt}"
                            width="${width}"
                            height="${height}"
                            class="lazyload object-${fit}" />
                     </picture>`
        }

        renderSourceSets(srcsets) {
            return srcsets.map(({breakpoint, srcset}) => {
                return ` <source media="(max-width: ${breakpoint})" data-srcset="${srcset}">`
            }).join('');
        }

        beforeMount() {
            super.beforeMount();

            const {src} = this.props

            this.url = new URL(src, location.origin)

            this.placeholder = this.resizeUrl(this.url, 100);

            this.props.width = this.$el.attr('width') ?? 'auto'
            this.props.height = this.$el.attr('height') ?? 'auto'

        }

        mounted() {
            super.mounted();

            this.srcsets = this.generateSourceSets(this.url)

            this.$el.find('picture').prepend(this.renderSourceSets(this.srcsets))
        }

        generateSourceSets(url) {

            return this.breakpoints.reduce((acc, breakpoint, i) => {

                const sizes = [
                    ...acc, {
                        breakpoint: breakpoint + 'px',
                        srcset: this.resizeUrl(url, breakpoint)
                    },
                ]

                const lastIndex = i === this.breakpoints.length - 1;

                if (lastIndex) {

                    url.searchParams.delete("width");

                    sizes.push({
                        breakpoint: breakpoint + 'px',
                        srcset: this.resizeUrl(url, breakpoint)
                    })
                }

                return sizes
            }, [])
        }

        resizeUrl(url, size) {
            const isAccentuateHosting = url.toString().includes("accentuate.io")

            if (!isAccentuateHosting) {
                url.searchParams.set("width", size.toString());
            } else {
                url.searchParams.set("transform", `resize=${size.toString()}`)
            }

            return url.toString()
        }
    })
}
