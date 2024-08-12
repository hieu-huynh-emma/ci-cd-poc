class CartFooter extends CustomElement {

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

customElements.define("cart-footer", CartFooter);
