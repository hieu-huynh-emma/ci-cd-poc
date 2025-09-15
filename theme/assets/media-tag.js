if (!customElements.get("picture-tag")) {
    customElements.define("picture-tag", class extends CustomElement {
        props = {
            src: "",
            "desktop.src": "",
            "mobile.src": "",
            placeholderWidth: 100,
            alt: "",
            fit: "cover", // none | contain | fill | scale-down
        };

        url = "";

        breakpoints = [
            // Small Devices (phones)
            481,
            576,
            // Medium Devices (tablets)
            768,
            // Large Devices (desktops, 992px and up)
            992,
            // Extra Large Devices (large desktops, 1200px and up)
            1200,
        ];

        srcsets = [];

        placeholder = "";


        constructor() {
            super();
        }

        template() {
            const { alt, width, height, fit } = this.props;
            return `<picture>
                        <img
                            src="${this.placeholder}"
                            alt="${alt}"
                            width="${width}"
                            height="${height}"
                            class="lazyload object-${fit}" />
                     </picture>`;
        }

        renderSourceSets(srcsets) {
            const domLoaded = document.readyState === "complete";

            return srcsets.map(({ mediaQuery, breakpoint, srcset }) => {
                return ` <source media="(${mediaQuery}-width: ${breakpoint})" ${!domLoaded ? "data-" : ""}srcset="${srcset}">`;
            }).join("");
        }

        beforeMount() {
            super.beforeMount();

            const { src, placeholderWidth } = this.props;

            this.url = new URL(src, location.origin);

            this.placeholder = this.resizeUrl(this.url, placeholderWidth);

            this.props.width = this.$el.attr("width") ?? "auto";
            this.props.height = this.$el.attr("height") ?? "auto";

        }

        mounted() {
            super.mounted();

            this.srcsets = this.generateSourceSets(this.url);

            this.$el.find("picture").prepend(this.renderSourceSets(this.srcsets));
        }

        generateSourceSets(url) {

            return this.breakpoints.reduce((acc, breakpoint, i) => {

                const sizes = [
                    ...acc, {
                        mediaQuery: "max",
                        breakpoint: breakpoint + "px",
                        srcset: this.resizeUrl(url, breakpoint),
                    },
                ];

                const lastIndex = i === this.breakpoints.length - 1;

                if (lastIndex) {

                    url.searchParams.delete("width");

                    sizes.push({
                        mediaQuery: "min",
                        breakpoint: breakpoint + "px",
                        srcset: this.resizeUrl(url, breakpoint),
                    });
                }

                return sizes;
            }, []);
        }

        resizeUrl(url, size) {
            const isAccentuateHosting = url.toString().includes("accentuate.io");

            if (!isAccentuateHosting) {
                url.searchParams.set("width", size.toString());
            } else {
                url.searchParams.set("transform", `resize=${size.toString()}`);
            }

            return url.toString();
        }
    });
}

if (!customElements.get("svg-tag")) {
    customElements.define("svg-tag", class extends Element {
        props = {
            src: "",
            placeholderWidth: 100,
            width: null,
            height: null,
        };
        placeholder = "";

        async render() {
            if (!this.verifySource(this.src)) {
                throw new Error("Invalid SVG source");
            }
            const svgRaw = await this.fetchSVG(this.src);

            this.$el.html(svgRaw);

            const svg = this.firstChild;

            svg.setAttribute("width", this.width || svg.getAttribute("width"));
            svg.setAttribute("height", this.height || svg.getAttribute("height"));
        }

        verifySource(url) {
            return url.split("?")[0].endsWith(".svg");
        }

        fetchSVG(url) {
            return fetch(url).then(res => res.text());
        }
    });
}
