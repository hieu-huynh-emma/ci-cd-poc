if (!customElements.get("quantity-adjuster-button")) {
    customElements.define("quantity-adjuster-button", class QuantityAdjusterButton extends Button {
        props = {
            size: 0, name: "",
            variant: null,
        };

        setup(props) {
            const { variant } = props;
            this.$el.css({
                width: props.size + "px",
                height: props.size + "px",
            });
            if (variant) this.$el.attr("variant", variant);
        }

        template() {
            return `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    ${this.name === "plus"
                ? `
                            <rect x="5.20007" y="9.20007" width="9.6" height="1.6" rx="0.8"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M10.8001 5.80007V14.2001C10.8001 14.5314 10.4419 14.8001 10.0001 14.8001C9.55825 14.8001 9.20007 14.5314 9.20007 14.2001V5.80007C9.20007 5.4687 9.55825 5.20007 10.0001 5.20007C10.4419 5.20007 10.8001 5.4687 10.8001 5.80007Z" />
                        `
                : `<rect x="5.20007" y="9.20007" width="9.6" height="1.6" rx="0.8" />`
            }
                </svg>
            `;
        }

        onDisabledChange(isDisabled) {
            this.$el[!!isDisabled ? "addClass" : "removeClass"]("is-disabled");
        }
    });
}

if (!customElements.get("quantity-adjuster")) {
    customElements.define("quantity-adjuster", class QuantityAdjuster extends Element {
        props = {
            index: 0, size: 32, min: null, max: null, inventoryPolicy: "",
            variant: null,
        };

        get refs() {
            return {
                minusBtn: this.querySelector(`quantity-adjuster-button[\\:name=minus]`),
                plusBtn: this.querySelector(`quantity-adjuster-button[\\:name=plus]`),
            };
        }


        setup(props) {
            const { index, variant } = props;

            this.changeEvent = new CustomEvent("change", { bubbles: true });

            this.$el.addClass("quantity-adjuster");
            this.$el.attr("id", `Drawer-quantity-${index + 1}`);
            this.$el.attr("name", "updates[]");
            this.$el.attr("data-index", index + 1);

            if (variant) this.$el.attr("variant", variant);

            switch (this.variant) {
                case "mini":
                    this.engageMiniVariant();
                    break;
                default:
                    break;
            }
        }


        async mounted() {
            this.$val = this.$el.find(".quantity-adjuster__value");

            this.checkThreshold(this.value);

            this.$el.find("quantity-adjuster-button").click((e => {
                e.preventDefault();

                this.onButtonClick($(e.currentTarget));
            }));

            await ResourceCoordinator.requestVendor("Tippy");

            tippy("quantity-adjuster-button.is-disabled[\\:name=plus]", {
                content: "Out of stock",
            });
        }

        engageMiniVariant() {
            this.size = 18;
        }

        onValueChange(val) {
            const isExceed = this.checkThreshold(val);

            if (isExceed) return;

            this.$val?.text(val);
        }

        checkThreshold(val) {
            const { min, max, inventoryPolicy } = this.props;
            const { minusBtn, plusBtn } = this.refs;

            if (!minusBtn || !plusBtn) return;

            if (inventoryPolicy === "continue") return false;

            const minThresholdExceed = isNumber(min) && val <= min;
            const maxThresholdExceed = isNumber(max) && val >= max;

            minusBtn.disabled = !!minThresholdExceed;
            plusBtn.disabled = !!maxThresholdExceed;

            if (minThresholdExceed || maxThresholdExceed) {
                this.value = Math.min(Math.max(val, min), max);

                return false;
            }

            return false;
        }

        template() {
            return `
            <quantity-adjuster-button :name="minus" :size="${this.size}" :variant="${this.variant}"></quantity-adjuster-button>
            <p class="quantity-adjuster__value">${this.value}</p>
            <quantity-adjuster-button :name="plus" :size="${this.size}" :variant="${this.variant}"></quantity-adjuster-button>
            `;
        }

        onButtonClick($button) {
            const previousValue = this.$val.text();

            this.value = $button.get(0).name === "plus" ? +this.value + 1 : +this.value - 1;

            if (+previousValue !== +this.value) this.dispatchEvent(this.changeEvent);
        }
    });
}
