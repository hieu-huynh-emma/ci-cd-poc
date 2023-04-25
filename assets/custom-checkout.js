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

let CountDown = { 
  saveCountDown: function() { 
    const timer = document.getElementById('timer');
    if (timer && timer.innerHTML !== '00:00') { 
      sessionStorage.setItem('countdown', timer.innerHTML);
    } 
    if (countdownInterVal) { 
      clearInterval(countdownInterVal);
    }
  },
  
  init: function() { 
    const continueBtn = document.getElementById('continue_button');
    const breadcrumbLinks = document.getElementsByClassName('breadcrumb__link');

    for (var i = 0; i < breadcrumbLinks.length; i++) {
      breadcrumbLinks[i].addEventListener('click', this.saveCountDown, false);
    }

    continueBtn.addEventListener('click', this.saveCountDown, false);
  }
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
  CountDown.init();
});
