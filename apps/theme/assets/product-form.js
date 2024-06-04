if (!customElements.get("product-form")) {
  customElements.define("product-form", class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector("form");
      this.form.querySelector("[name=id]").disabled = false;
      this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
      this.cartSurface = document.querySelector("cart-surface");
    }

    async onSubmitHandler(evt) {
      evt.preventDefault();

      this.$submitBtn = $(".add-to-cart-btn");
      if (document.querySelector("cart-drawer")) this.$submitBtn.attr("aria-haspopup", "dialog");

      // const pillowCheckbox$ = $('#add-on-pillows .add-on-checkbox-input')

      if (this.$submitBtn.hasClass("loading")) return;

      this.handleErrorMessage();

      this.$submitBtn.attr("aria-disabled", true);
      this.$submitBtn.addClass("loading");
      this.$submitBtn.find(".loading-overlay__spinner").removeClass("hidden");

      await waitUntil(_ => !!this.cartSurface.loading === false);


      const config = fetchConfig("javascript");
      config.headers["X-Requested-With"] = "XMLHttpRequest";
      const formData = JSON.parse(serializeForm(this.form));

      formData.properties = {
        _reset: true,
      };

      const $crossSells = $("cross-sell-widget").filter(function() {
        return $(this).find('.widget-checkbox__input').is(':checked');
      });

      if ($crossSells.length > 0) {
        const qty = formData.quantity;
        const productId = formData.id

        const productSize = $(`select[name="options[Size]"]`).val().split("|")[0].trim()

        const allAddonProducts = $crossSells.toArray().map( (el) => {
          const $el = $(el);

          const addonProd = JSON.parse($el.find(`script[type="application/json"]`).text());

          const allVariants = addonProd.variants

          const defaultVariant = allVariants[0];
          const selectedVariantId = $el.data("variantId")

          const isConfigurable = allVariants.length > 1 && !selectedVariantId

          if(isConfigurable) {
            const selectedVariant = addonProd.variants.find(variant => variant.title.includes(productSize))

            return {
              id: selectedVariant.id, quantity: qty ? parseInt(qty) : 1
            }
          }

          return {
            id: selectedVariantId ||  defaultVariant.id, quantity: qty ? parseInt(qty) : 1
          }
        });

        delete formData.id;
        delete formData.quantity;
        delete formData.properties;

        formData.items = [
          ...allAddonProducts,
          {
            id: productId, quantity: qty,
          },
        ];
      }


      // const $loadUpAddonService = $("#load-up-widget");
      //
      // const hasLoadUpService = $loadUpAddonService.find(".addon-checkbox__input").is(":checked");


      // if (hasLoadUpService) {
      //   const qty = formData.quantity;
      //   const productId = formData.id;
      //   const addonServiceProductId = $loadUpAddonService.attr(":productId");
      //   const addonServiceVariantId = $loadUpAddonService.attr(":variantId");
      //
      //   delete formData.id;
      //   delete formData.quantity;
      //   delete formData.properties;
      //
      //   formData.items = [{
      //     id: addonServiceVariantId, quantity: qty ? parseInt(qty) : 1, properties: {
      //       _addonServiceFor: productId,
      //     },
      //   }, {
      //     id: productId, quantity: qty, properties: {
      //       _addonService: JSON.stringify({
      //         productId: addonServiceProductId, variantId: addonServiceVariantId,
      //       }),
      //     },
      //   }];
      // }


      if (this.cartSurface) {
        formData.sections = this.cartSurface.getCartPartsToRender().map((section) => section.section);
        formData.sections_url = window.location.pathname;

        this.cartSurface.setActiveElement(document.activeElement);
      }

      config.body = JSON.stringify(formData);

      const previousEmpty = this.cartSurface.$el.hasClass("is-empty");

      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then(async (response) => {
          if (response.status) {
            this.handleErrorMessage(response.description);
            const soldOutMessage = this.$submitBtn.find(".sold-out-message").get(0);
            if (!soldOutMessage) return;
            this.$submitBtn.attr("aria-disabled", true);
            this.$submitBtn.find("span").addClass("hidden");
            soldOutMessage.classList.remove("hidden");
            this.error = true;

            return;
          }

          this.error = false;

          await this.cartSurface.open();

          this.cart = document.querySelector("cart-drawer");

          await wait(100);

          await waitUntil(_ => !!this.cart.loading === false);

          this.cart.renderContents(response);

          const cartRedeem = document.getElementById("CartRedeemCode");
          const cartSummary = document.getElementById("CartDrawerSummary");
          const codeRedeemed = cartRedeem.codeRedeemed;

          if (previousEmpty) {
            this.cartSurface.$el.removeClass("is-empty");
          }

          if (!!codeRedeemed) {
            await this.cart.loadCheckout();

            const isApplicable = cartRedeem.checkCodeApplicable();

            if (!isApplicable) return;

            cartSummary.computeDiscountedTotal();
            cartRedeem.refreshDiscountTag();
          }
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.$submitBtn.removeClass("loading");
          this.$submitBtn.removeAttr("aria-disabled");
          this.$submitBtn.find(".loading-overlay__spinner").addClass("hidden");
        });
    }

    handleErrorMessage(errorMessage = false) {
      this.errorMessageWrapper = this.errorMessageWrapper || document.querySelector(".product-form__error-message-wrapper");
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector(".product-form__error-message");

      this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);

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
