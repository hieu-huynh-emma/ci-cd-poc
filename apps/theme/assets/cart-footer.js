class CartFooter extends CustomElement {
	agreementChecked = false
	get refs() {
		return {
			$checkoutBtn: this.$el.find(`button[name="checkout"]`),
			$wrapper: this.$el.find('#toc-agreement'),
			$agreementCheckbox: this.$el.find('#toc-agreement .agreement-checkbox')
		}
	}

	mounted() {
		super.mounted();

		const { $wrapper, $agreementCheckbox, $checkoutBtn } = this.refs

		$agreementCheckbox.prop('checked', this.agreementChecked)
		$checkoutBtn.prop('disabled', !this.agreementChecked)

		$wrapper.click(() => {
			this.agreementChecked = !this.agreementChecked

			$checkoutBtn.prop('disabled', !this.agreementChecked)
			$agreementCheckbox.prop('checked', this.agreementChecked);
		})
	}

	onDisabledChange(isDisabled) {
		super.onDisabledChange(isDisabled);

		const { $checkoutBtn } = this.refs

		$checkoutBtn[(!!isDisabled || !this.agreementChecked) ? 'attr' : 'removeAttr']('disabled', 'disabled')
	}
}

customElements.define("cart-footer", CartFooter);
