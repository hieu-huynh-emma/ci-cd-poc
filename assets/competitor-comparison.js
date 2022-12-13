let CompetitorComparison = {
  renderAllColHeaders: function () {
    const $table = $(
      "#competitor-comparison-section .competitor-comparison-table"
    );

    const emmaColHeader = $(
      $.parseHTML(`<div
                  class="competitor-comparison-table-cell competitor-comparison-table-cell--highlight grid-row-1 col-start-1 md:col-start-2 column-header"
              >
                  <div class="emma column-header">
                      <div class="emma__brand">
                          <img src="${emmaLogo}" alt="">
                      </div>
                  </div>
              </div>`)
    );

    const competitorHeaders = $(
      $.parseHTML(`
                <div data-competitor-col-index="0" class="competitor-comparison-table-cell grid-row-1 col-start-2 md:col-start-3 column-header">
                    <div class="competitor column-header">
                    <p class="competitor__brand">${compertitorName}</p>
                </div>
                `)
    );
    $table.append(emmaColHeader);
    $table.append(competitorHeaders);
  },
  renderAllRowHeaders: function () {
    const $table = $(
      "#competitor-comparison-section .competitor-comparison-table"
    );

    Object.keys(specifications).forEach((featureName, i) => {
      const $rowHeader = $(
        $.parseHTML(
          `<div class="competitor-comparison-table-cell grid-row-${
            i + 2
          } row-header">${featureName}</div>`
        )
      );

      $table.append($rowHeader);
    });
  },
  renderAllCells: function () {
    const $table = $(
      "#competitor-comparison-section .competitor-comparison-table"
    );

    const $baseCell = $(
      $.parseHTML(`<div class="competitor-comparison-table-cell">
                        <p class="cell-header"></p>
                        <p class="cell-content"></p>
                    </div>`)
    );

    Object.keys(specifications).forEach((featureName, i) => {
      const $cell = $baseCell.clone(true).addClass(`grid-row-${i + 2}`);

      if (i === Object.keys(specifications).length - 1) {
        $cell.addClass(`last-specs`);
      }

      $cell.find(".cell-header").text(featureName);

      const emmaCell = $cell
        .clone(true)
        .addClass("competitor-comparison-table-cell--highlight");

      $table.append(emmaCell);

      Array.from(Array(2).keys()).forEach((competitorColIndex) => {
        const $competitorCell = $cell
          .clone(true)
          .attr("data-competitor-col-index", competitorColIndex);

        $table.append($competitorCell);
      });
    });

    Object.values(productToCompare).forEach((emmaSpec, i) => {
      let $cellContent = $table.find(
        `.grid-row-${
          i + 2
        }.competitor-comparison-table-cell--highlight .cell-content`
      );
      if (emmaSpec === "Yes") {
        $cellContent.append(`<img src="${checkGreenIcon}" alt="">`);
      } else if (emmaSpec === "No") {
        $cellContent.append(`<img src="${cancelIcon}" alt="">`);
      } else {
        $cellContent.html(emmaSpec);
      }
    });

    Object.values(specifications).forEach((competitorSpec, i) => {
      let $cellContent = $table.find(
        `.competitor-comparison-table-cell.grid-row-${
          i + 2
        }[data-competitor-col-index="0"] .cell-content`
      );
      if (competitorSpec === "Yes") {
        $cellContent.append(`<img src="${checkGrayIcon}" alt="">`);
      } else if (competitorSpec === "No") {
        $cellContent.append(`<img src="${cancelIcon}" alt="">`);
      } else {
        if (i === 0) {
          if (typeof competitorSpec === "string") {
            $cellContent.text(competitorSpec);
          } else {
            const { price, originalPrice } = competitorSpec
            $cellContent.html(`${price} <span class="line-through font-medium text-sm">${originalPrice}</span>`)
          }
        } else {
          $cellContent.text(competitorSpec);
        }
      }
    });
  },
  renderBuyLink: function () {
    if (competitor.productToCompare === "Emma Original") {
      $("#competitor-buy-btn").attr("href", "/products/emma-original-mattress");
    } else {
      $("#competitor-buy-btn").attr(
        "href",
        "/products/emma-climax-hybrid"
      );
    }
  },
  init: function () {
    CompetitorComparison.renderAllColHeaders();
    CompetitorComparison.renderAllRowHeaders();
    CompetitorComparison.renderAllCells();
    CompetitorComparison.renderBuyLink();
  },
};

$(document).ready(function () {
  CompetitorComparison.init();
});
