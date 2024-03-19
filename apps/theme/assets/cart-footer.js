class CartFooter extends CustomElement {
	agreementChecked = false
	get refs() {
		return {
			$checkoutBtn: this.$el.find(`button[name="checkout"]`),
			$agreementCheckbox: this.$el.find('#toc-agreement .agreement-checkbox')
		}
	}

	mounted() {
		super.mounted();

		const { $agreementCheckbox, $checkoutBtn } = this.refs

		$agreementCheckbox.prop('checked', this.agreementChecked)
		$checkoutBtn.prop('disabled', !this.agreementChecked)

		$agreementCheckbox.click(e => {
			$checkoutBtn.prop('disabled', !e.target.checked)
			this.agreementChecked = e.target.checked
		})
	}

	onDisabledChange(isDisabled) {
		super.onDisabledChange(isDisabled);

		const { $checkoutBtn } = this.refs

		$checkoutBtn[(!!isDisabled || !this.agreementChecked) ? 'attr' : 'removeAttr']('disabled', 'disabled')
	}
}

customElements.define("cart-footer", CartFooter);
