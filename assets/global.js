function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function () {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function isShippedOutNextDay(hour, minute) {
  if (hour === 14 && minute === 0) return false
  return hour >= 14 && hour <= 23;
}

async function onAddToCartSuccess() {
  const cart = document.querySelector('cart-drawer')
  const cartScrollableContent = document.querySelector('cart-scrollable-content')

  const cartSections = cart.getSectionsToRender().map((section) => section.section)
  // remove duplicate section IDs, due to it originally going to work for section rendering in cart bundle API
  // but not works for standalone section rendering
  const sections = [...new Set(cartSections)].join(',')

  const cartRedeem = document.getElementById('CartRedeemCode');
  const cartSummary = document.getElementById('CartDrawerSummary');
  const codeRedeemed = cartRedeem.codeRedeemed

  if ($(cart).hasClass('is-empty')) {
    $(cart).removeClass('is-empty')
  }

  cart.open()
  cartScrollableContent.loading = true

  const response = await fetch(`/?sections=${sections}`)
  const responseData = await response.json()

  cart.renderContents({ sections: responseData })

  if (!!codeRedeemed) {
    await cart.loadCheckout()

    const isApplicable = cartRedeem.checkCodeApplicable()

    if (!isApplicable) return

    cartSummary.computeDiscountedTotal()
    cartRedeem.refreshDiscountTag();
  }

  cartScrollableContent.loading = false
}

// Monitor event from page fly when user add product to cart
// https://help.pagefly.io/manual/cart-drawer-does-not-automatically-update/?utm_campaign=manual&utm_source=profile%3Ashopify_community&utm_medium=message&utm_content=LinhNH
async function monitorPageFlyAddToCartEvent() {
  try {
    setTimeout(function() {
      window.__pagefly_helper_store__ &&
      window.__pagefly_helper_store__.subscribe(function(c) {
        onAddToCartSuccess()
      });
    }, 1500);
  } catch (e) {
    console.warn('PageFly', e);
  }
}

monitorPageFlyAddToCartEvent()
