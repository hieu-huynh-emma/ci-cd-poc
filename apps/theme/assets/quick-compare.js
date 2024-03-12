class QuickCompare extends CustomElement {
	constructor(props) {
		super(props);
	}

	mounted() {
		super.mounted();

		this.$table = $('.quick-compare-table');
		this.config = JSON.parse(this.querySelector('script[type=\'application/json\'][name=\'data\']').textContent);

		this.renderAllColHeaders();
		this.renderAllRowHeaders();
		this.renderAllCells();
	}

	renderAllColHeaders() {
		const { product: { title }, competitors = [] } = this.config;

		const $emmaHeader = $(
			$.parseHTML(`
        <div class="quick-compare-table-cell quick-compare-table-cell--highlight grid-row-1 col-start-1 md:col-start-2 column-header">
          Emma
        </div>
      `)
		);

		this.$table.append($emmaHeader);

		competitors.forEach(({ brandName }, competitorColIndex) => {
			const $competitorHeader = $(
				$.parseHTML(`
          <div data-competitor-col-index="${competitorColIndex}" class="quick-compare-table-cell grid-row-1 col-start-${
					competitorColIndex + 3
				} column-header">
            ${brandName}
          </div>
        `)
			);

			if (competitorColIndex === competitors.length - 1)
				$competitorHeader.addClass('last-col');

			this.$table.append($competitorHeader);
		});
	}

	renderAllRowHeaders() {
		const {
			specs = {}
		} = this.config;
		const rowLabels = Object.keys(specs);

		rowLabels.forEach((label, i) => {
			const $rowHeader = $(
				$.parseHTML(
					`<div class="quick-compare-table-cell grid-row-${
						i + 2
					} row-header">${label}</div>`
				)
			);

			if (i === rowLabels.length - 1) {
				$rowHeader.addClass(`last-row`);
			}

			this.$table.append($rowHeader);
		});
	}

	renderAllCells() {
		const {
			specs = {},
			competitors = []
		} = this.config;

		const $baseCell = $(
			$.parseHTML(`<div class="quick-compare-table-cell">
      </div>`)
		);

		Object.entries(specs).forEach(([specName, specVal], i) => {
			const $cell = $baseCell.clone(true).addClass(`grid-row-${i + 2}`);
			if (i === Object.keys(specs).length - 1) {
				$cell.addClass(`last-row`);
			}

			const $emmaCell = $cell
				.clone(true)
				.addClass('quick-compare-table-cell--highlight');

			this.populateEmmaCell($emmaCell, specName, specVal);

			this.$table.append($emmaCell);

			competitors.forEach(({ specs }, competitorColIndex) => {
				const $competitorCell = $cell
					.clone(true)
					.attr('data-competitor-col-index', competitorColIndex);

				if (competitorColIndex === competitors.length - 1)
					$competitorCell.addClass('last-col');

				$competitorCell.html(specs[i]);

				this.$table.append($competitorCell);
			});
		});
	}

	populateEmmaCell($cell, specName, specVal) {
		const { product, pillow, protector, specs = {} } = this.config;

		let cellVal = specVal;

		const productQueenVariant = product.variants.find(variant => variant.title.includes('Queen'));
		console.log(productQueenVariant);
		const price = +productQueenVariant.price / 100;
		const originalPrice = +productQueenVariant.compare_at_price / 100;

		const pillowPrice = +pillow.variants[0].price / 100;
		const pillowOriginalPrice = +pillow.variants[0].compare_at_price / 100;

		const protectorQueenVariant = protector.variants.find(variant => variant.title.includes('Queen'));
		const protectorPrice = +protectorQueenVariant.price / 100;
		const protectorOriginalPrice = +protectorQueenVariant.compare_at_price / 100;

		const totalPrice = price + pillowPrice + protectorPrice;

		switch (specName) {
			case 'Price':
				cellVal = `${Currency.format(price)} <span class='hidden lg:block line-through font-medium text-sm'>${Currency.format(originalPrice)}</span>`;
				break;
			case 'Pillows':
				cellVal = `${Currency.format(pillowPrice)} <span class='hidden lg:block line-through font-medium text-sm'>${Currency.format(pillowOriginalPrice)}</span>`;
				break;
			case 'Protector':
				cellVal = `${Currency.format(protectorPrice)} <span class='hidden lg:block line-through font-medium text-sm'>${Currency.format(protectorOriginalPrice)}</span>`;
				break;
			case 'Total Price':
				cellVal = Currency.format(totalPrice);
				break;
		}

		$cell.html(cellVal);
	}
}

customElements.define('quick-compare', QuickCompare);
