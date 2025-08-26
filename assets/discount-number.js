window.addEventListener('DOMContentLoaded', (event) => {

	document.querySelectorAll('.grid__item')?.forEach(function(item) {
		let id = item.querySelector('.card-wrapper').getAttribute('data-id');
		if(item.querySelector(`#discount_number-${ id}`)?.getAttribute('data-discount')){
			let numbers = item.querySelector(`#discount_number-${ id}`).getAttribute('data-discount').split(',').map((item) => {
				return parseInt(item);
			}).filter((el) => {
				return !Number.isNaN(el);
			});

			let max_discount = Math.max.apply(null, numbers)
			if(item.querySelector(`span[for="discount_number-${ id }"]`)){

				item.querySelector(`span[for="discount_number-${ id }"]`).innerHTML = `${max_discount}% OFF`;
			}

		}

	})
});
