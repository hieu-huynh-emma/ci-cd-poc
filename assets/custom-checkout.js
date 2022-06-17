let CustomCheckout = {
    loadOriginalLinePrice: function () {
        let allOriginalLinePrice = [];
        $('input[name=original_line_price]').each(function(){
            allOriginalLinePrice.push($(this).val());
        })

        $('.product-table tbody tr .product__price').each(function(index) {
            $(this).prepend('<span class="order-summary__emphasis original-line-price">'+ allOriginalLinePrice[index] +'</span>');
        })
    },
    init: function () {
        CustomCheckout.loadOriginalLinePrice();
    }
}

// Init mutationObserver to watch for changes in the DOM
let mutationObserver = new MutationObserver(function(mutations) {
    setTimeout(function(){
       mutationObserver.disconnect();
       CustomCheckout.loadOriginalLinePrice();
    }, 0);
});

$(document).on('click', '#checkout_submit', function(){
    mutationObserver.observe(document.querySelector('.order-summary__section--product-list'), {
      childList: true,
      subtree: true,
    });
});

$(document).ready(function() {
    CustomCheckout.init();
});
