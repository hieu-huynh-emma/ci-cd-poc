const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const allEmmaProducts = comparisonConfig.emmaProducts.map(({ info, competitors, specs }) => {

  const queenVariant = info.variants.find(variant => variant.title.includes('Queen'));

  return {
    id: info.id,
    handle: info.handle,
    label: info.title.replace("Mattress", "").trim(),
    price: currencyFormatter.format(queenVariant.price / 100),
    originalPrice: currencyFormatter.format(queenVariant.compare_at_price / 100),
    specs: Object.values(specs),
    specLabels: Object.keys(specs),
    competitors
  }
});

const allSpecLabels = allEmmaProducts[0].specLabels;

let allCompetitors = allEmmaProducts[0].competitors;

// ----- COMPARISON TABLE ----- //

function renderAllColHeaders() {
  const $table = $('#product-comparison .comparison-table');

  const emmaColHeader = $($.parseHTML(`<div
				class="comparison-table-cell comparison-table-cell--highlight grid-row-1 col-start-1 md:col-start-2 column-header"
			>
				<div class="emma column-header">
					<div class="emma__brand">
						<img src="${comparisonConfig.emmaLogo}" alt="">
					</div>
					<select class="emma__product-selector"></select>
				</div>
			</div>`));

  const competitorHeaders = $($.parseHTML(`
<div data-competitor-col-index="0" class="comparison-table-cell grid-row-1 col-start-2 md:col-start-3 column-header">
  <div class="competitor column-header">
    <p class="competitor__brand"></p>
    <select data-col="3" class="product-selector"></select></div>
</div>
<div data-competitor-col-index="1" class="comparison-table-cell grid-row-1 lg:col-start-4 column-header">
  <div class="competitor column-header">
    <p class="competitor__brand"></p>
    <select class="product-selector"></select></div>
</div>
`));

  $table.append(emmaColHeader);
  $table.append(competitorHeaders)

}

function renderAllRowHeaders() {
  const $table = $('#product-comparison .comparison-table');

  allSpecLabels.forEach((featureName, i) => {
    const $rowHeader = $($.parseHTML(`<div class="comparison-table-cell grid-row-${i + 2} row-header">${featureName}</div>`))

    $table.append($rowHeader)
  });
}

function renderAllCells() {
  const $table = $('#product-comparison .comparison-table');

  const $baseCell = $($.parseHTML(`<div class="comparison-table-cell">
    <p class="cell-header"></p>
    <p class="cell-content"></p>
</div>`))

  allSpecLabels.forEach((featureName, i) => {

    const $cell = $baseCell.clone(true).addClass(`grid-row-${i + 2}`);

    if (i === allSpecLabels.length - 1) {
      $cell.addClass(`last-specs`)
    }

    $cell.find('.cell-header').text(featureName)

    const emmaCell = $cell.clone(true).addClass("comparison-table-cell--highlight");

    $table.append(emmaCell)

    Array.from(Array(2).keys()).forEach(competitorColIndex => {
      const $competitorCell = $cell.clone(true).attr("data-competitor-col-index", competitorColIndex)

      $table.append($competitorCell)
    })
  });
}

function renderProductSelector(config) {
  const { isCompetitor = false, competitorColIndex, emmaHandle } = config

  const $productSelector = !!isCompetitor
    ? $(`#product-comparison .comparison-table-cell[data-competitor-col-index="${competitorColIndex}"] .product-selector`)
    : $("#product-comparison .emma__product-selector");

  if (!$productSelector.length) return

  $productSelector.empty()

  const optionsRenderFn = renderProductSelectorOptions.bind(null, config, $productSelector)

  !!isCompetitor ? allCompetitors.forEach(optionsRenderFn) : allEmmaProducts.forEach(optionsRenderFn)

  $productSelector.change(handleProductChange)

  return $productSelector
}

function renderProductSelectorOptions(config, $productSelector, competitorOrProduct, optionIndex) {
  const { isCompetitor = false, competitorColIndex } = config

  const handle = competitorOrProduct.handle

  const specs = competitorOrProduct.specs
  const label = !!isCompetitor ? competitorOrProduct.productName : competitorOrProduct.label
  const data = !!isCompetitor ? {
    specs,
    brandName: competitorOrProduct.brandName,
    isCompetitor: true,
    competitorColIndex
  } : { specs, handle, productIndex: optionIndex }


  const option = $($.parseHTML(`<option ${competitorColIndex === optionIndex ? "selected" : ""} value="${handle}">${label}</option>`)).data(data);

  $productSelector.append(option)

}

function handleProductChange() {
  const $selectedOption = $(this).find(':selected')
  const specs = $selectedOption.data("specs");
  const isCompetitor = $selectedOption.data("isCompetitor")
  const competitorColIndex = $selectedOption.data("competitorColIndex")
  const brandName = $selectedOption.data("brandName");
  const productIndex = $selectedOption.data('productIndex')

  updateSpecs(!!isCompetitor ? { isCompetitor, specs, competitorColIndex } : { specs });

  if (!isCompetitor) {
    allCompetitors = allEmmaProducts[productIndex].competitors;

    updateCompetitors();

    updatePrice(productIndex)

    updateButtonHref(productIndex);
  } else {
    updateBrandName(competitorColIndex, brandName)
  }

}

function updateSpecs({ specs = [], isCompetitor = false, competitorColIndex }) {
  let $allRows = !!isCompetitor
    ? $(`#product-comparison .comparison-table-cell[data-competitor-col-index="${competitorColIndex}"]:not(.column-header)`)
    : $(`#product-comparison .comparison-table-cell--highlight:not(.column-header)`);

  $allRows.each(function (index) {
    $(this).find('.cell-content').text(specs[index] || "")
  })
}

function updateBrandName(competitorColIndex, brandName) {
  const $columnHeader = $(`#product-comparison .comparison-table-cell[data-competitor-col-index="${competitorColIndex}"].column-header`)

  $columnHeader.find('.competitor__brand').text(brandName);
}

// ----- Emma ----- //

function updatePrice(productIndex) {
  const $priceCell = $(`#product-comparison .comparison-table-cell--highlight.grid-row-2:not(.column-header)`)

  const productInfo = allEmmaProducts[productIndex]

  $priceCell.find('.cell-content').html(`
    ${productInfo.price} <span class="price--original">${productInfo.originalPrice}</span>
  `)
}

function updateButtonHref(productIndex) {
  const productInfo = allEmmaProducts[productIndex];
  const $buyNowBtn = $("#product-comparison .comparison-table .emma-buy-now-btn");

  $buyNowBtn.attr('href', `/products/${productInfo.handle}`)
}


// ----- Competitors ----- //

function updateCompetitors() {
  const $emmaSelectedProduct = $('#product-comparison .emma__product-selector').find(':selected');
  const emmaHandle = $emmaSelectedProduct.data('handle');

  Array.from(Array(2).keys()).forEach((competitorColIndex) => {
    const competitorInfo = allCompetitors[competitorColIndex];
    const specs = competitorInfo.specs

    updateBrandName(competitorColIndex, competitorInfo.brandName)
    updateSpecs({ isCompetitor: true, competitorColIndex, specs });

    renderProductSelector({ isCompetitor: true, competitorColIndex, emmaHandle })
  })
}

// ----- Initialize ----- //

function initialTable() {
  renderAllColHeaders();

  renderAllRowHeaders();

  renderAllCells()
}

function initializeEmma() {
  const productIndex = 0
  const specs = allEmmaProducts[productIndex].specs

  return new Promise((resolve) => {
    renderProductSelector({ isCompetitor: false });

    updateSpecs({ isCompetitor: false, specs });

    updatePrice(productIndex);

    updateButtonHref(productIndex)

    resolve()
  })
}

$(document).ready(async function () {
  console.log('kjlkfsd')
  initialTable();

  await initializeEmma();

  updateCompetitors();

  $('#product-comparison .product-selector, #product-comparison .emma__product-selector').select2({
    minimumResultsForSearch: -1,
    dropdownAutoWidth: true,
    width: 'auto'
  });

})
