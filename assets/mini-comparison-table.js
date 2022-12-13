const MiniComparisonTable = {
  $table: $(".mini-comparison-table"),
  config: MiniComparisonTableConfig,
  renderAllColHeaders: function () {
    const { product: { title }, competitors = [] } = this.config;

    const $emmaHeader = $(
      $.parseHTML(`
        <div class="mini-comparison-table-cell mini-comparison-table-cell--highlight grid-row-1 col-start-1 md:col-start-2 column-header">
          Emma
        </div>
      `)
    );

    this.$table.append($emmaHeader);

    competitors.forEach(({ brandName }, competitorColIndex) => {
      const $competitorHeader = $(
        $.parseHTML(`
          <div data-competitor-col-index="${competitorColIndex}" class="mini-comparison-table-cell grid-row-1 col-start-${
          competitorColIndex + 3
        } column-header">
            ${brandName}
          </div>
        `)
      );

      if (competitorColIndex === competitors.length - 1)
        $competitorHeader.addClass("last-col");

      this.$table.append($competitorHeader);
    });
  },
  renderAllRowHeaders: function () {
    const {
      specs = {},
    } = this.config;
    const rowLabels = Object.keys(specs);

    rowLabels.forEach((label, i) => {
      const $rowHeader = $(
        $.parseHTML(
          `<div class="mini-comparison-table-cell grid-row-${
            i + 2
          } row-header">${label}</div>`
        )
      );

      if (i === rowLabels.length - 1) {
        $rowHeader.addClass(`last-row`);
      }

      this.$table.append($rowHeader);
    });
  },
  renderAllCells: function () {
    const {
      specs = {},
      competitors = [],
    } = this.config;

    const $baseCell = $(
      $.parseHTML(`<div class="mini-comparison-table-cell">
      </div>`)
    );

    Object.entries(specs).forEach(([specName, specVal], i) => {
      const $cell = $baseCell.clone(true).addClass(`grid-row-${i + 2}`);
      if (i === Object.keys(specs).length - 1) {
        $cell.addClass(`last-row`);
      }

      const $emmaCell = $cell
        .clone(true)
        .addClass("mini-comparison-table-cell--highlight");

      this.populateEmmaCell($emmaCell, specName, specVal);

      this.$table.append($emmaCell);

      competitors.forEach(({ specs }, competitorColIndex) => {
        const $competitorCell = $cell
          .clone(true)
          .attr("data-competitor-col-index", competitorColIndex);

        if (competitorColIndex === competitors.length - 1)
          $competitorCell.addClass("last-col");

        $competitorCell.html(specs[i]);

        this.$table.append($competitorCell);
      });
    });
  },

  populateEmmaCell: function ($cell, specName, specVal) {
    const { product, pillow, protector, topper, specs = {} } = this.config

    let cellVal = specVal

    const productQueenVariant = product.variants.find(variant => variant.title.includes('Queen'));
    const price = +productQueenVariant.price / 100
    const originalPrice = +productQueenVariant.compare_at_price / 100

    const pillowPrice = +pillow.variants[0].price / 100
    const pillowOriginalPrice = +pillow.variants[0].compare_at_price / 100

    const protectorQueenVariant = protector.variants.find(variant => variant.title.includes('Queen'));
    const protectorPrice = +protectorQueenVariant.price / 100
    const protectorOriginalPrice = +protectorQueenVariant.compare_at_price / 100

    const topperQueenVariant = topper.variants.find(variant => variant.title.includes('Queen'));
    const topperPrice = +topperQueenVariant.price / 100
    const topperOriginalPrice = +topperQueenVariant.compare_at_price / 100

    const totalPrice = price + pillowPrice + protectorPrice + topperPrice

    switch (specName) {
      case 'Mattress':
        cellVal = `${Currency.format(price)} <span class='hidden lg:block line-through font-medium text-sm'>${Currency.format(originalPrice)}</span>`
        break;
      case "Pillows":
        cellVal = `${Currency.format(pillowPrice)} <span class='hidden lg:block line-through font-medium text-sm'>${Currency.format(pillowOriginalPrice)}</span>`
        break;
      case "Protector":
        cellVal = `${Currency.format(protectorPrice)} <span class='hidden lg:block line-through font-medium text-sm'>${Currency.format(protectorOriginalPrice)}</span>`
        break;
      case "Topper":
        cellVal = `${Currency.format(topperPrice)} <span class='hidden lg:block line-through font-medium text-sm'>${Currency.format(topperOriginalPrice)}</span>`
        break;
      case "Total Price":
        cellVal = Currency.format(totalPrice)
        break;
    }

    $cell.html(cellVal)
  },

  init: function () {
    this.renderAllColHeaders();
    this.renderAllRowHeaders();
    this.renderAllCells()
  },
};

$(document).ready(function () {
  MiniComparisonTable.init();
});
