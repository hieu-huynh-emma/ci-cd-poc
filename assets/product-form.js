if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.querySelector('[name=id]').disabled = false;
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cart = document.querySelector('cart-drawer');
      this.cartAffirm = document.querySelector('cart-drawer-affirm')
      this.submitButton = this.querySelector('[type="submit"]');
      if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');
    }

    async onSubmitHandler(evt) {
      evt.preventDefault();

      const pillowCheckbox$ = $('#add-on-pillows .add-on-checkbox-input')

      if (this.submitButton.classList.contains('loading')) return;

      this.handleErrorMessage();

      this.submitButton.setAttribute('aria-disabled', true);
      this.submitButton.classList.add('loading');
      this.querySelector('.loading-overlay__spinner').classList.remove('hidden');

      await waitUntil(_ => !!this.cart.loading === false)

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';

      if (pillowCheckbox$.is(":checked")) {
        const mainProduct = JSON.parse(serializeForm(this.form))

        config.body = JSON.stringify({
          items: [
            {
              id: pillowCheckbox$.val(),
              quantity: mainProduct.quantity ? parseInt(mainProduct.quantity) : 1,
              properties: {
                freeGift: true
              }
            },
            { ...mainProduct, properties: { hasGWP: true } },
          ],
          form_type: mainProduct.form_type,
          utf8: mainProduct.utf8,
          ...(!!this.cart ? {
            sections: this.cart.getSectionsToRender().map((section) => section.section),
            sections_url: window.location.pathname
          } : {})
        });
      } else {
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);

        if (this.cart) {
          formData.append('sections', this.cart.getSectionsToRender().map((section) => section.section));
          formData.append('sections_url', window.location.pathname);

          this.cart.setActiveElement(document.activeElement);
        }

        config.body = formData
      }

      const previousEmpty = $(this.cart).hasClass('is-empty')

      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then(async (response) => {
          if (response.status) {
            this.handleErrorMessage(response.description);
            const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
            if (!soldOutMessage) return;
            this.submitButton.setAttribute('aria-disabled', true);
            this.submitButton.querySelector('span').classList.add('hidden');
            soldOutMessage.classList.remove('hidden');
            this.error = true;

            return;
          } else if (!this.cart) {
            window.location = window.routes.cart_url;
            return;
          }
          this.error = false;

          await this.cartAffirm.refreshAffirm()

          const quickAddModal = this.closest('quick-add-modal');
          if (quickAddModal) {
            document.body.addEventListener('modalClosed', () => {
              setTimeout(() => {
                this.cart.renderContents(response)
              });
            }, { once: true });
            quickAddModal.hide(true);
          } else {
            this.cart.renderContents(response);
          }

          const cartRedeem = document.getElementById('CartRedeemCode');
          const cartSummary = document.getElementById('CartDrawerSummary');
          const codeRedeemed = cartRedeem.codeRedeemed

          if (previousEmpty) {
            $(this.cart).removeClass('is-empty')
          }

          if (!!codeRedeemed) {
            await this.cart.loadCheckout()

            const isApplicable = cartRedeem.checkCodeApplicable()

            if (!isApplicable) return

            cartSummary.computeDiscountedTotal()
            cartRedeem.refreshDiscountTag();
          }
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.submitButton.classList.remove('loading');
          this.submitButton.removeAttribute('aria-disabled');
          this.querySelector('.loading-overlay__spinner').classList.add('hidden');
        });
    }

    handleErrorMessage(errorMessage = false) {
      this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }
  });
}

// (function () {
//   const mutationObserver = new MutationObserver(function () {
//     const $dynamicButton = $('.shopify-payment-button__button.shopify-payment-button__button--unbranded:not([disabled])');
//     if ($dynamicButton.length) {
//       mutationObserver.disconnect();
//       const newButton = $dynamicButton[0].cloneNode(true);
//
//       $(newButton).on('click', function (e) {
//         $(this).attr('disabled', 'disabled');
//         $.get('/cart/clear', function (data) {
//           const config = fetchConfig('javascript');
//           config.headers['X-Requested-With'] = 'XMLHttpRequest';
//           const form = document.querySelector('.product-form form');
//           const pillowCheckbox$ = $('#add-on-pillows .add-on-checkbox-input');
//           if (pillowCheckbox$.is(":checked")) {
//
//             const mainProduct = JSON.parse(serializeForm(form));
//
//             config.body = JSON.stringify({
//               items: [
//                 { ...mainProduct },
//                 {
//                   id: pillowCheckbox$.val(),
//                   quantity: mainProduct.quantity ? parseInt(mainProduct.quantity) : 1
//                 }
//               ],
//               form_type: mainProduct.form_type,
//               utf8: mainProduct.utf8
//             });
//           } else {
//             config.body = JSON.stringify({
//               ...JSON.parse(serializeForm(form))
//             });
//           }
//
//           fetch(`${routes.cart_add_url}`, config)
//             .then((response) => response.json())
//             .then((response) => {
//               if (response.status) {
//                 return;
//               }
//               window.location.href = '/checkout';
//             })
//             .catch((e) => {
//               console.error(e);
//             });
//         });
//         e.preventDefault();
//       });
//       $dynamicButton[0].parentNode.replaceChild(newButton, $dynamicButton[0]);
//     }
//   });
//   mutationObserver.observe(
//     document.querySelector('.product-form'),
//     {
//       childList: true,
//       subtree: true,
//     }
//   );
// })();
