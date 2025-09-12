class OldCartFooter extends CustomElement {

    agreementChecked = false;

    get refs() {
        return {
            $checkoutBtn: this.$el.find(`button[name="checkout"]`),
            $wrapper: this.$el.find("#toc-agreement"),
            $agreementCheckbox: this.$el.find("#toc-agreement .agreement-checkbox"),
        };
    }

    mounted() {
        super.mounted();

        this.$el.find("loader-element").remove();

        const { $wrapper, $agreementCheckbox, $checkoutBtn } = this.refs;

        $checkoutBtn.click(this.onCheckoutClick.bind(this));

        $wrapper.click(() => {
            this.agreementChecked = !this.agreementChecked;

            $checkoutBtn.prop("disabled", !this.agreementChecked);
            $agreementCheckbox.prop("checked", this.agreementChecked);
            $("#toc-agreement .checkbox-icon.checkbox-icon--unchecked")[!this.agreementChecked ? "addClass" : "removeClass"]("checkbox-icon--error");

        });
    }

    onCheckoutClick(e) {
        const { $agreementCheckbox, $checkoutBtn } = this.refs;

        $agreementCheckbox.prop("checked", this.agreementChecked);
        $checkoutBtn.prop("disabled", !this.agreementChecked);
        $("#toc-agreement .checkbox-icon.checkbox-icon--unchecked")[!this.agreementChecked ? "addClass" : "removeClass"]("checkbox-icon--error");

        if (!$agreementCheckbox.is(":checked")) {
            e.preventDefault();

            this.showError();
        } else {
            if (
                typeof window.ABTasty !== 'undefined' &&
                typeof window.ABTasty.eventState !== 'undefined' &&
                !!window.ABTasty.eventState['executedCampaign'] &&
                window.ABTasty.eventState['executedCampaign'].status === 'complete' &&
                typeof window.ABTastyClickTracking !== 'undefined'
            ) {
                window.ABTastyClickTracking?.('Checkout Button CTR');
            }
        }
    }

    async showError() {
        const [errorMsg] = await translateWeglot(["You must agree with the terms and conditions of sales to checkout."]);
        toastr.error(errorMsg);
    }

    onDisabledChange(isDisabled) {
        super.onDisabledChange(isDisabled);

        const { $checkoutBtn } = this.refs;

        $checkoutBtn[(!!isDisabled || !this.agreementChecked) ? "attr" : "removeAttr"]("disabled", "disabled");
    }
}

customElements.define("old-cart-footer", OldCartFooter);
