let CustomCheckout = {
  loadOriginalLinePrice    : function () {
    let allOriginalLinePrice = [];
    let allPrices            = []
    $("input[name=original_line_price]").each(function () {
      allOriginalLinePrice.push($(this).val());
      allPrices.push($(this).data('price'))
    });
    
    $(".product-table tbody tr .product__price").each(function (index) {
      if (allOriginalLinePrice[index] === allPrices[index]) {
        $(this).find(".order-summary__emphasis").addClass("single-price");
        return
      }
      
      $(this)
      .prepend('<span class="order-summary__emphasis original-line-price">' + allOriginalLinePrice[index] + "</span>");
      
      // Apply red font color to the original line price when there is an automatic discount
      if (allOriginalLinePrice[index] != "") {
        $(this).find(".order-summary__emphasis:last-child").addClass("custom-original-line-price");
      }
      
      // Remove discount price when apply promote code
      if ($(this).find(".order-summary__small-text, br").length) {
        $(this).find(".order-summary__small-text, br").remove();
      }
    });
  }, renderLoadUpDisclaimer: () => {
    const loadUpDisclaimer = $("#load-up-disclaimer-text").val()
    $(".product-table tr.product").each(function () {
      const $el       = $(this)
      const productId = $el.data('productId')
      
      if (productId === 8033882570915) {
        $el.find(".product__description__name")
           .append(`<div class="load-up-disclaimer discount-tooltip">&#9432;</div>`);
        
        setTimeout(() => {
          tippy('.load-up-disclaimer', {
            content: loadUpDisclaimer
          });
        }, 500)
      }
    });
    
  }, init                  : function () {
    CustomCheckout.loadOriginalLinePrice();
    CustomCheckout.renderLoadUpDisclaimer()
  },
};

// Init mutationObserver to watch for changes in the DOM
let mutationObserver = new MutationObserver(function () {
  mutationObserver.disconnect();
  CustomCheckout.loadOriginalLinePrice();
  CustomCheckout.renderLoadUpDisclaimer()
});

$(document).on("click", "#checkout_submit, .tag__button", function () {
  mutationObserver.observe(document.querySelector(".order-summary__section--product-list"), {
    childList: true, subtree: true,
  });
});

$(document).ready(function () {
  CustomCheckout.init();
});
