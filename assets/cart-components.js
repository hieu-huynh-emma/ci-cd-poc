import { EVENTS } from "./data-constants.js";


if (!customElements.get("cart-summary-line")) {
    customElements.define("cart-summary-line", class CartSummaryLine extends Element {
        props = {
            key: "",
            label: "Label",
            content: "",
            static: false,
            emphasis: false,
        };

        get refs() {
            return {
                $contentPlaceholder: this.$el.find("dd"),
            };
        }

        setup(props) {
            if (props.emphasis) this.$el.addClass("font-semibold");

        }

        setupListeners(props) {
            if (!props.static) {
                document.addEventListener(EVENTS.CART_LOADED, this.onLoaded.bind(this));
            }
        }

        onLoaded() {
            document.addEventListener(EVENTS.CART_UPDATED, this.onUpdated.bind(this));
            document.addEventListener(EVENTS.CART_FETCHING_START, () => {
                this.fetching = true;
            });
            document.addEventListener(EVENTS.CART_FETCHING_END, () => {
                this.fetching = false;
            });

            this.onUpdated()
        }

        onUpdated() {
            const money = this.getByPath(window.Cart?.state, this.key);
            if (!money) return;

            const { $contentPlaceholder } = this.refs;

            $contentPlaceholder.text(money.formatted);
        }

        getByPath(source, path) {
            if (!source) return;
            const breakdown = path.split(".");
            let destination = source;

            breakdown.forEach((trail) => destination = destination[trail]);

            return destination;
        }

        template() {
            return `
               
                 <dt>${this.label}</dt>
    
                 <div>
                      <loader-element></loader-element>
                      <dd>${this.content}</dd>
                  </div>
                 
            `;
        }
    });
}

if (!customElements.get("cart-title")) {
    customElements.define("cart-title", class CartTitle extends Element {
        props = {
            count: 0,
        };

        setup() {
            document.addEventListener(EVENTS.CART_LOADED, this.onCartChange.bind(this));
            document.addEventListener(EVENTS.CART_UPDATED, this.onCartChange.bind(this));
        }

        mounted() {
            this.onCartChange();
        }

        onCartChange() {
            this.count = window.Cart?.state?.totalQuantity ?? 0;
        }

        template() {
            return !this.count
                ? "Your cart is empty"
                : `Cart${this.count ? ` (${this.count})` : ""}
                `;
        }
    });
}

if (!customElements.get("cart-toc-agreement")) {
    customElements.define("cart-toc-agreement", class CartTocAgreement extends Button {
        props = {
        };
        agreementChecked = false;
        clickedTimestamp = Date.now();
        get refs() {
            return {
                $checkoutBtn: $(document.querySelector(`cart-layout button[name="checkout"]`)),
                agreementCheckbox: this.querySelector(".agreement-checkbox"),
                $uncheckedIcon:  this.$el.find(".checkbox-icon.checkbox-icon--unchecked")
            };
        }
        setup() {
            this.refs.$checkoutBtn.on("click", this.onCheckoutClick.bind(this));
        }

        template() {
           return `
            <input key="${Date.now()}" type="checkbox" class="agreement-checkbox checkbox-input-overlay" required="required">
            <div class="checkbox-icons">
                <i class="checkbox-icon checkbox-icon--checked">
                    <svg xmlns="http://www.w3.org/2000/svg"
                         width="24" height="24" viewBox="0 0 24 24" version="1.1"
                         fill="#000000">
        
                        <g id="SVGRepo_bgCarrier" stroke-width="0"/>
        
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round"
                           stroke-linejoin="round"/>
        
                        <g id="SVGRepo_iconCarrier">
                            <g id="🔍-Product-Icons" stroke="none" stroke-width="1" fill="none"
                               fill-rule="evenodd">
                                <g id="ic_fluent_checkbox_checked_24_regular" fill="currentColor"
                                   fill-rule="nonzero">
                                    <path
                                        d="M18.25,3 C19.7687831,3 21,4.23121694 21,5.75 L21,18.25 C21,19.7687831 19.7687831,21 18.25,21 L5.75,21 C4.23121694,21 3,19.7687831 3,18.25 L3,5.75 C3,4.23121694 4.23121694,3 5.75,3 L18.25,3 Z M18.25,4.5 L5.75,4.5 C5.05964406,4.5 4.5,5.05964406 4.5,5.75 L4.5,18.25 C4.5,18.9403559 5.05964406,19.5 5.75,19.5 L18.25,19.5 C18.9403559,19.5 19.5,18.9403559 19.5,18.25 L19.5,5.75 C19.5,5.05964406 18.9403559,4.5 18.25,4.5 Z M10,14.4393398 L16.4696699,7.96966991 C16.7625631,7.6767767 17.2374369,7.6767767 17.5303301,7.96966991 C17.7965966,8.23593648 17.8208027,8.65260016 17.6029482,8.94621165 L17.5303301,9.03033009 L10.5303301,16.0303301 C10.2640635,16.2965966 9.84739984,16.3208027 9.55378835,16.1029482 L9.46966991,16.0303301 L6.46966991,13.0303301 C6.1767767,12.7374369 6.1767767,12.2625631 6.46966991,11.9696699 C6.73593648,11.7034034 7.15260016,11.6791973 7.44621165,11.8970518 L7.53033009,11.9696699 L10,14.4393398 L16.4696699,7.96966991 L10,14.4393398 Z"
                                        id="🎨Color"></path>
                                </g>
                            </g>
                        </g>
        
                    </svg>
                </i>
                <i class="checkbox-icon checkbox-icon--unchecked">
                    <svg xmlns="http://www.w3.org/2000/svg"
                         width="24" height="24" viewBox="0 0 24 24" version="1.1">
                            <g id="ic_fluent_checkbox_unchecked_24_regular" fill="currentColor"
                               fill-rule="nonzero">
                                <path
                                    d="M5.75,3 L18.25,3 C19.7687831,3 21,4.23121694 21,5.75 L21,18.25 C21,19.7687831 19.7687831,21 18.25,21 L5.75,21 C4.23121694,21 3,19.7687831 3,18.25 L3,5.75 C3,4.23121694 4.23121694,3 5.75,3 Z M5.75,4.5 C5.05964406,4.5 4.5,5.05964406 4.5,5.75 L4.5,18.25 C4.5,18.9403559 5.05964406,19.5 5.75,19.5 L18.25,19.5 C18.9403559,19.5 19.5,18.9403559 19.5,18.25 L19.5,5.75 C19.5,5.05964406 18.9403559,4.5 18.25,4.5 L5.75,4.5 Z"
                                    id="🎨Color">
        
                                </path>
                            </g>
                    </svg>
                </i>
            </div>
            <label class="checkbox-content cursor-pointer" for="agreement-checkbox">
                I agree with the <a href="/pages/terms-and-conditions" target="_blank">Terms and
                    Conditions</a>.
            </label>
           `
        }

        onUpdated() {
              this.refs.agreementCheckbox.checked = this.agreementChecked;
        }
        _init() {
            this.$el.click(event => {
                if((Date.now() - this.clickedTimestamp) < 50) {
                    return
                }
                this.clickedTimestamp = Date.now()

                if (this.disabled || this.readOnly) {
                    event.stopPropagation();
                    event.preventDefault();
                    event.cancelBubble = true;
                    event.stopImmediatePropagation();

                    return false
                }

                console.log("clicked")
                this.onClick(event);

            });

            this.$el.addClass("cursor-pointer");
        }
        onClick(e) {
            super.onClick(e);

            const {$checkoutBtn,agreementCheckbox, $uncheckedIcon} = this.refs

            this.agreementChecked = !this.agreementChecked;

            $checkoutBtn.prop("disabled", !this.agreementChecked);

            agreementCheckbox.checked = this.agreementChecked;

            $uncheckedIcon[!this.agreementChecked ? "addClass" : "removeClass"]("checkbox-icon--error");
        }

        onCheckoutClick(e) {
            const { agreementCheckbox, $checkoutBtn, $uncheckedIcon } = this.refs;

            agreementCheckbox.checked = this.agreementChecked;
            $checkoutBtn.prop("disabled", !this.agreementChecked);

            $uncheckedIcon[!this.agreementChecked ? "addClass" : "removeClass"]("checkbox-icon--error");

            if (!agreementCheckbox.checked) {
                e.preventDefault();

                this.showError();
            }
        }

        async showError() {
            await ResourceCoordinator.requestVendor("Toastr")
            const [errorMsg] = await translateWeglot(["You must agree with the terms and conditions of sales to checkout."]);
            toastr.error(errorMsg);
        }

        onDisabled(isDisabled) {
            super.onDisabledChange(isDisabled);

            const { $checkoutBtn } = this.refs;

            $checkoutBtn[(!!isDisabled || !this.agreementChecked) ? "attr" : "removeAttr"]("disabled", "disabled");
        }
    });
}
