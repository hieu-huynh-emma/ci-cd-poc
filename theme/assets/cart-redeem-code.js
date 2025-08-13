import {EVENTS} from "./data-constants.js";

if (!customElements.get("cart-redeem-code")) {
    customElements.define("cart-redeem-code", class CartRedeemCode extends Element {

        _providers = ["Tippy", "Toastr"];


        get refs() {
            return {
                $discountViewer: this.$el.find(".discount-viewer"),
                $redeemBox: this.$el.find(".redeem-box"),
                $appliedCouponEl: this.$el.find("#AppliedCouponCode"),
                $applyBtn: this.$el.find("#CouponApplyButton"),
                $inputField: this.$el.find("#CouponRedeemInput"),
                $removeBtn: this.$el.find("#CouponRemoveButton"),
                $redeemMsg: this.$el.find("#redeem-msg"),
            };
        }

        setupListeners() {
            document.addEventListener(EVENTS.CART_LOADED, this.onCartChange.bind(this));

            document.addEventListener(EVENTS.CART_UPDATED, this.onCartChange.bind(this));

            this.addEventListener("remove-coupon", this.removeDiscount.bind(this));
        }


        template() {
            return `
                 <div class="redeem-box invisible-on-loading">
                    <input
                        id="CouponRedeemInput" class="redeem-code__input" placeholder="Type Promo Code Here"
                        onkeypress="return (event.key !== 'Enter')"
                    />
                    <button type="button" id="CouponApplyButton">
                        <loading-overlay :spinner="true"></loading-overlay>
                        <span>Apply</span>
                    </button>
                </div>
                <span class="hidden" id="redeem-msg"></span>

            `;
        }

        mounted() {
            const {$applyBtn, $inputField} = this.refs;

            $inputField.on("keypress", (e) => {
                if (e.which == 13) {
                    this.applyDiscount();
                }
            });
            $applyBtn.on("click", this.applyDiscount.bind(this));

            this.renderCouponTag();
        }

        renderCouponTag() {
            const allocations = window.Cart.state.discount.allocations;

            this.reset()

            const isApplicable = Array.isArray(allocations) && allocations.length > 0;

            if (isApplicable) {
                this.$el.append(`<coupon-viewer :allocations="${encodeURIComponent(JSON.stringify(allocations))}"></coupon-viewer>`);

                this.disabled = true;
                
                if (typeof tippy === "function") {
                    tippy(this.querySelector(".redeem-box"), {
                      content: "Only 1 coupon can be applied at a time",
                    });
                  } else {
                    console.warn("Tippy is not defined");
                  }
            }
        }

        onDisabled(isDisabled) {
            // super.onDisabled(isDisabled);

            const {$inputField, $applyBtn, $removeBtn} = this.refs;

            // $inputField.attr("disabled", isDisabled);
            // $applyBtn.attr("disabled", isDisabled);
            // $removeBtn.attr("disabled", isDisabled);
        }

        onCartChange() {
            if (!window.Cart?.state) return;

            this.renderCouponTag();
        }

        async applyDiscount() {

            const {$inputField} = this.refs;
            const code = $inputField.val();

            if (!code) {
                return;
            }

            this.loading = true;

            try {

                const allocations = window.Cart.state.discount.allocations || [];
                const discountCodes = allocations.map(({name}) => name)

                if (discountCodes.includes(code)) {
                    throw new Error("Discount has been applied already.");
                }

                if (discountCodes.length >= 3) {

                    const errorMsg = `<p class="text-sm">You've reached the maximum number of discount codes. Remove an existing code to use <strong>${code}</strong>.</p>`;
                    if (this.$el.find("#redeem-msg").length){
                        this.$el.find("#redeem-msg")[0].classList.remove("hidden");
                        this.$el.find("#redeem-msg")[0].innerHTML = errorMsg;
                    } 
                    this.loading = false;
                    return;
                }

                  const cart =  await window.Cart.applyCoupon([...discountCodes, code]);
                  const appliedCode = cart.discountCodes.find(d => d.code === code || d.name === code);
                const isApplicable = !!appliedCode?.applicable;
                
                if (!isApplicable) {
                    await window.Cart.clearCoupon(discountCodes);
                    await window.Cart.retrieveCart();
                    throw new Error(`Coupon code "${code}" is invalid. Please try another code.`)
                }

                await window.Cart.retrieveCart();
                this.renderCouponTag();

            } catch (e) {
                const [errorMsg] = await translateWeglot([e]);

                toastr.error(errorMsg);
            }

            $inputField.val("");

            this.loading = false;

        }

        async removeDiscount(e) {
            const targetCode = e.detail.name

            const {$inputField} = this.refs;

            this.loading = true;
           const allocations = window.Cart.state.discount.allocations || [];
            const discountCodes = allocations.filter(({name}) => name!==targetCode).map(({name}) => name)

            await window.Cart.clearCoupon(discountCodes);
         
            if (this.$el.find("#redeem-msg").length){
                this.$el.find("#redeem-msg")[0].classList.add("hidden");
            } 
            this.loading = false;
            await window.Cart.retrieveCart();
            this.renderCouponTag();

            $inputField.val("");

        }

        reset() {
            this.$el.find("coupon-viewer").remove();
            this.disabled = false;
        }
    });
}
