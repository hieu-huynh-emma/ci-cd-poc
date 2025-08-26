if (!customElements.get("loading-overlay")) {

    customElements.define("loading-overlay", class LoadingOverlay extends Element {
            props = {
                spinner: false,
            }

            template() {
                return this.spinner ? this.renderSpinner() : ""
            }

            renderSpinner() {
                return `
                 <svg
                    aria-hidden="true" focusable="false" role="presentation" class="spinner" width="32" height="32" viewBox="0 0 66 66"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
                  </svg>
                `
            }

            mounted() {
                this.hide()
            }

            show() {
                requestAnimationFrame(() => {
                    this.$el.attr('hidden', false)
                })
            }

            hide() {
                requestAnimationFrame(() => {
                    this.setAttribute("hidden", "hidden")
                })
            }
        }
    );

}
