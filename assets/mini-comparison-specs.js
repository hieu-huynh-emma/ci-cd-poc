const MiniComparisonTable = {
    renderAllColHeaders: function () {
        const { product: { title }, competitors = [] } = this.props;

        const className = 'mini-comparison-table-cell grid-row-1 column-header'

        const $emmaHeader = $(
            $.parseHTML(`
        <div class="${className} mini-comparison-table-cell--highlight col-start-1 md:col-start-2 ">
          ${title}
        </div>
      `)
        );

        this.$table.append($emmaHeader);

        competitors.forEach(({ productName }, competitorColIndex) => {
            const $competitorHeader = $(
                $.parseHTML(`
          <div class="${className} col-start-${competitorColIndex + 3} ${competitorColIndex === competitors.length - 1 ? ' last-col' : ''}" data-competitor-col-index="${competitorColIndex}">
            ${productName}
          </div>
        `)
            );

            this.$table.append($competitorHeader);
        });
    },

    generateClassName: function (isRowHeader, label, objLenght, position, isHighLightColumn) {
        return `mini-comparison-table-cell grid-row-${position + 2}${isRowHeader ? ' row-header' : ''}${label && label === 'Price' ? ' row-highlight' : ''}${position === Object.keys(objLenght).length - 1 ? ' last-row' : ''}${isHighLightColumn ? ' mini-comparison-table-cell--highlight' : ''}`;
    },

    generateValue: function(valueStr) {
        const { checkGreenIcon, cancelIcon } = this.props;
        let value = valueStr;
        if (value === "Yes") {
            value = `<img class="compare-icon" src="${checkGreenIcon}" alt="">`
        } else if (value === "No") {
            value = `<img class="compare-icon" src="${cancelIcon}" alt="">`;
        }
        return value;
    },

    renderAllRowHeaders: function () {
        const {
            specs = {},
        } = this.props;

        Object.keys(specs).forEach((label, i) => {
            this.$table.append(`<div class="${this.generateClassName(true, label, specs, i)}">${label}</div>`);
        });
    },

    renderAllCells: function () {
        const {
            specs = {},
            competitors = [],
            variantForCompare
        } = this.props;

        Object.entries(specs).forEach(([specName, specVal], i) => {
            let value = specVal;

            if (specName === 'Price') {
                const { price, compare_at_price } = variantForCompare

                value = Currency.format(parseFloat(price) / 100);
                if (compare_at_price) {
                    value += ` <span class="line-through font-medium text-sm">${Currency.format(parseFloat(compare_at_price) / 100)}</span>`;
                }
            }

            this.$table.append(`<div class="${this.generateClassName(false, specName, specs, i, true)}">${this.generateValue(value)}</div>`);

            competitors.forEach(({ specs: SpecObj }, competitorColIndex) => {

                this.$table.append(`<div class="${this.generateClassName(false, specName, SpecObj, i, false)}" data-competitor-col-index="${competitorColIndex}">${this.generateValue(SpecObj[i])}</div>`);
            });
        });
    },

    init: function (MiniComparisonTableProps) {
        this.$table = $(".mini-comparison-table");
        this.props = MiniComparisonTableProps;
        this.renderAllColHeaders();
        this.renderAllRowHeaders();
        this.renderAllCells();
        $('.mini-comparison-specs').show();
    },
};

