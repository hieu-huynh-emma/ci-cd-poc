let CustomCheckout = {
  loadOriginalLinePrice: function() {
    let allOriginalLinePrice = [];
    $("input[name=original_line_price]").each(function() {
      allOriginalLinePrice.push($(this).val());
    });

    $(".product-table tbody tr .product__price").each(function(index) {
      $(this).prepend(
        "<span class=\"order-summary__emphasis original-line-price\">" +
        allOriginalLinePrice[index] +
        "</span>",
      );
    });
  },
  init: function() {
    CustomCheckout.loadOriginalLinePrice();
  },
};

// Init mutationObserver to watch for changes in the DOM
let mutationObserver = new MutationObserver(function() {
  mutationObserver.disconnect();
  CustomCheckout.loadOriginalLinePrice();
});

$(document).on("click", "#checkout_submit, .tag__button", function() {
  mutationObserver.observe(
    document.querySelector(".order-summary__section--product-list"),
    {
      childList: true,
      subtree: true,
    },
  );
});

$(document).ready(function() {
  CustomCheckout.init();
  if (Shopify.Checkout.step === 'contact_information' || Shopify.Checkout.step === "payment_method" || Shopify.Checkout.step === "shipping_method") {
    addTangooBasketTracking()
  }
});

function addTangooBasketTracking() {
  window.data_3415 = [];
  window.data_3415.push({
  'Currency': '$Currency$',
  'CustomerType': '$CustomerType$',
  'ProductId': '$ProductId$',
  'gdpr': '${GDPR}',
  'gdpr_consent': '${GDPR_CONSENT_317}',
  'gdpr_pd': '${GDPR_PD}',
  'us_privacy': '${US_PRIVACY}',
  'CouponCode': '$CouponCode$',
  'PageType': 'basket'
  });
}
