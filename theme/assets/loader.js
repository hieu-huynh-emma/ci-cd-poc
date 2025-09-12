if (!customElements.get("loader-element")) {
    class Loader extends Element {
        props = {
            type: "skeleton", // skeleton | spinner
        };

        beforeMount() {
            this.setAttribute('hidden', true)
        }

        template() {
            return this.type === "spinner" ? this.renderSpinner() : "";
        }

        renderSpinner() {
            return `
                <div class="spinner-overlay"></div>
                 <svg
                    aria-hidden="true" focusable="false" role="presentation" class="spinner" width="32" height="32" viewBox="0 0 66 66"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
                  </svg>
                `;
        }

        show() {
            this.toggleAttribute("hidden", false);
        }

        hide() {
            this.toggleAttribute("hidden", true);
        }
    }

    customElements.define("loader-element", Loader);
}
