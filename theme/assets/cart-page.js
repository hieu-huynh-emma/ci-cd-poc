class CartSummary extends CustomElement {
	props = {
		originalPrice: 0
	};

	beforeMount() {
		// this.mutationObserver.observe(this, {
		// 	childList: true,
		// 	subtree: true,
		// 	characterDataOldValue: true
		// });
	}

	mounted() {
		const $originalPriceEl = this.$el.find('#CartOriginalPrice')
		const $totalPriceEl = this.$el.find("#CartTotalPrice")
		const $totalSavedEl = this.$el.find("#CartTotalSaved")

		const totalPrice = $totalPriceEl.data("total")
		const originalPrice = $totalPriceEl.data("original-price")

		if (totalPrice === originalPrice) {
			$originalPriceEl.addClass('hidden')
			$totalSavedEl.addClass('hidden')
		}
	}

	onMutation(mutationRecords) {
		console.log('mutation')

		const hasCartTotalsChanged = mutationRecords.some(r => r.target.id === "CartTotals")

		const hasTotalPriceChanged = mutationRecords.some(r => r.target.id === "CartTotalPrice" && !!r.addedNodes.length)

		if (!!hasCartTotalsChanged || !!hasTotalPriceChanged) {
			this.onPriceChange()
		}
	}

	onPriceChange() {
		console.log('onPriceChange')

		const $originalPriceEl = this.$el.find('#CartOriginalPrice')
		const $totalPriceEl = this.$el.find("#CartTotalPrice")
		const $totalSavedEl = this.$el.find("#CartTotalSaved")

		const totalPrice = parseFloat($totalPriceEl.data("total"))
		const discountedTotal = parseFloat($totalPriceEl.data("discounted-total") || 0)
		const originalPrice = parseFloat($totalPriceEl.data("original-price"))

		if (originalPrice > totalPrice || (!!discountedTotal && originalPrice > discountedTotal)) {
			$originalPriceEl.removeClass('hidden')
			$totalSavedEl.removeClass('hidden')
		} else {
			$originalPriceEl.addClass('hidden')
			$totalSavedEl.addClass('hidden')
		}
	}

	clearTotalPrice() {
		const $totalPriceEl = this.$el.find("#CartTotalPrice")

		const totalPrice = $totalPriceEl.data("total")
		const originalPrice = $totalPriceEl.data("original-price")

		this.refreshCartPrices(totalPrice, originalPrice)
	}

	computeDiscountedTotal() {
		console.log('computeDiscountedTotal')
		const cartRedeemEl = document.getElementById('CartRedeemCode');
		const codeRedeemed = cartRedeemEl.codeRedeemed

		const cart = document.getElementById('CartDrawer');

		const checkout = cart.checkout

		const $totalPriceEl = this.$el.find("#CartTotalPrice")

		if (!codeRedeemed) {
			$totalPriceEl.data('discounted-total', 0)

			return
		}

		if (!cart || !checkout) return

		const totalPrice = parseFloat(checkout.total_price)
		const originalPrice = parseFloat(checkout.line_items.reduce((r, item) => r + item.quantity * (+item.compare_at_price || +item.price), 0));

		this.refreshCartPrices(totalPrice, originalPrice)
	}

	refreshCartPrices(finalPrice, originalPrice) {
		const $totalPriceEl = this.$el.find("#CartTotalPrice");
		const $totalSavedEl = this.$el.find('#CartTotalSaved');

		const totalSaved = originalPrice - finalPrice

		const totalPriceInCurrency = Currency.format(finalPrice, {maximumFractionDigits: finalPrice % 1 === 0 ? 0 : 2});
		const totalSavedInCurrency = Currency.format(totalSaved, {maximumFractionDigits: totalSaved % 1 === 0 ? 0 : 2});

		$totalPriceEl.data('discounted-total', finalPrice)

		$totalPriceEl.text(totalPriceInCurrency)
		$totalSavedEl.find(".saved-amount").text(totalSavedInCurrency)
	}
}

customElements.define("cart-summary", CartSummary);
