
if(!customElements.get("coupon-tag")) {
    customElements.define("coupon-tag", class CouponTag extends Element {
        props = {
            name: "",
            amount: 0,
            removable: true,
            variant: "",
        };

        setup(props) {
            props.variant && this.$el.attr("variant", props.variant);

            this.removeEvent = new CustomEvent("remove-coupon", { bubbles: true, detail: {name: props.name} });
        }

        template() {
            const money = Currency.format(this.amount);
            return `
                <loading-overlay></loading-overlay>
                <svg slot="icon" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clip-path="url(#clip0_3748_23153)">
                        <path d="M10.295 6.705L6.71 10.29C6.61713 10.383 6.50684 10.4567 6.38544 10.5071C6.26404 10.5574 6.13392 10.5833 6.0025 10.5833C5.87109 10.5833 5.74096 10.5574 5.61956 10.5071C5.49816 10.4567 5.38787 10.383 5.295 10.29L1 6V1H6L10.295 5.295C10.4813 5.48236 10.5858 5.73582 10.5858 6C10.5858 6.26419 10.4813 6.51764 10.295 6.705V6.705Z"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        <path d="M3.5 3.5H3.51" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                      </g>
                      <defs>
                        <clipPath id="clip0_3748_23153">
                          <rect width="12" height="12" fill="currentColor"></rect>
                        </clipPath>
                      </defs>
                </svg>

                <p slot="code" class="paragraph-12">
                  ${this.name} ${!!this.amount ? `<span>(-${money})</span>` : ""}
                </p>

                ${this.removable
                ? `<div slot="remove-button" class="remove-button">
                    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                        <path d="M6 6L18 18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </div>`
                : ""
            }
            `;
        }

        mounted() {
            const $removeBtn = this.$el.find(`[slot="remove-button"]`);

            $removeBtn.on("click", () => {
                this.dispatchEvent(this.removeEvent);
            });
        }
    });

}
if(!customElements.get("coupon-viewer")) {
    customElements.define("coupon-viewer", class CouponViewer extends Element {
        props = {
            allocations: [],
            removable: true,
            variant: "",
        };

        render() {
            if (!this.allocations?.length) return this.$el.empty();

            super.render();
        }

        template() {
            return this.allocations.map(allocation => `
                 <coupon-tag :variant="${this.variant}" :name="${allocation.name}" :amount="${allocation.discountedAmount?.amount ?? 0}" :removable="${this.removable}"></coupon-tag>
            `).join("");
        }
    });
}
