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
});

(function() {
  function asyncLoad() {
    var urls = [
      "https://cdn.shopify.com/shopifycloud/shopify_chat/storefront/shopifyChatV1.js?api_env=production\u0026button_color=%233c4196\u0026button_style=text\u0026i=chat_bubble\u0026p=bottom_left\u0026shop_id=T9Vv9uxCwBDH-42OIrR-KP4eAHMqAbQIrvfP8WYy2Vk\u0026t=chat_with_us\u0026v=1\u0026shop=emma-sleep-ca.myshopify.com",
    ];
    for (var i = 0; i < urls.length; i++) {
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.src = urls[i];
      var x = document.getElementsByTagName("script")[0];
      x.parentNode.insertBefore(s, x);
    }
  }

  if (window.attachEvent) {
    window.attachEvent("onload", asyncLoad);
  } else {
    window.addEventListener("load", asyncLoad, false);
  }
})();
