if (!customElements.get("product-form")) {
    customElements.define(
        "product-form",
        class ProductForm extends HTMLElement {
            connectedCallback() {
                this.form = this.querySelector("form");
                this.form.querySelector("[name=id]").disabled = false;
                this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
                this.cartSurface = document.querySelector("cart-surface");
                this.formError = document.querySelector("product-form-error");
            }

            discountedCallback() {
                this.reset();
            }

            serializeForm(form) {
                const obj = {};
                const formData = new FormData(form);

                for (const key of formData.keys()) {
                    const regex = /(?:^(properties\[))(.*?)(?:\]$)/;

                    if (regex.test(key)) {
                        obj.properties = obj.properties || {};
                        obj.properties[regex.exec(key)[2]] = formData.get(key);
                    } else {
                        obj[key] = formData.get(key);
                    }
                }

                return JSON.stringify(obj);
            };

            async onSubmitHandler(evt) {
                evt.preventDefault();

                this.reset();

                this.$submitBtn = $(".add-to-cart-btn");
                if (document.querySelector("cart-drawer")) this.$submitBtn.attr("aria-haspopup", "dialog");

                if (this.$submitBtn.hasClass("loading")) return;

                await this.purchase();

            }

            async purchase() {
                await this.prepare();

                const formData = this.compose();

                await this.injectServices(formData);

                await this.fetchAjaxCart(formData);
            }

            async fetchAjaxCart(formData) {
                return window.Cart.add(formData.items)
                    .then(this.onSuccess.bind(this))
                    .then(this.postPurchase.bind(this, formData))
                    .catch(this.onError.bind(this))
                    .finally(this.onDone.bind(this));
            }

            async onSuccess(res) {
                await this.cartSurface.open();

                this.cart = document.querySelector("cart-drawer");

                await waitUntil((_) => !!this.cart.loading === false);

                this.cart.refresh();

                const previousEmpty = this.cartSurface.$el.hasClass("is-empty");

                if (previousEmpty) {
                    this.cartSurface.$el.removeClass("is-empty");
                }

                return res;
            }

            onError(errors) {
                console.log("=>(product-form.js:260) e", errors);

                this.formError.errors = errors;
            }

            onDone() {
                this.$submitBtn.removeClass("loading");
                this.$submitBtn.removeAttr("aria-disabled");
                this.$submitBtn.find("loader-element").attr("hidden", true);

            }

            async prepare() {
                this.$submitBtn.attr("aria-disabled", true);
                this.$submitBtn.addClass("loading");
                this.$submitBtn.find("loader-element").attr("hidden", false);

                await waitUntil((_) => !!this.cartSurface.loading === false);
            }

            compose() {
                const formData = JSON.parse(this.serializeForm(this.form));

                const qty = formData.quantity;
                const productId = formData.id;

                this.product = {
                    id: productId,
                    quantity: this.test ? 70 : qty,
                };

                delete formData.id;
                delete formData.quantity;

                formData.items = [this.product];

                if (this.cartSurface) {
                    formData.sections = this.cartSurface.getCartPartsToRender().map((section) => section.section);
                    formData.sections_url = window.location.pathname;

                    this.cartSurface.setActiveElement(document.activeElement);
                }

                return formData;
            }

            reset() {
                this.formError.reset();
            }

            async injectServices(formData) {
                const $crossSells = $("cross-sell-widget")
                    .filter(function() {
                        return $(this).find(`input[type="checkbox"]`).is(":checked")
                    });
                const $bundleCrossSell = $("bundle-cross-sell").filter(function() {
                    return $(this).find("#offer-switch").is(":checked");
                });
                const $freebieBundle = $("freebie-bundle").filter(function() {
                    return $(this).find("#offer-switch").is(":checked");
                });
                const $freebieOffer = $("freebie-offer").filter(function() {
                    return $(this).find("#offer-switch").is(":checked");
                });

                const $promotionalPanel = $("promotional-panel");

                if (!!$crossSells.length) {
                    const selectedSize = $(`product-buybox select[name="options[Size]"]`).val();


                    const productSize = selectedSize?.split("|")[0].trim();
                    const $crossSellPanel = $("cross-sell-panel")

                    const { sizeCompatible, mode } = $crossSellPanel.get(0).props;


                    const allAddonProducts = $crossSells.toArray().map((el) => {
                        const $el = $(el);
                        const crossSellVariantId = $el.data("variantId");

                        if (sizeCompatible) {
                            const crossSellProduct = JSON.parse($el.find(`script[name="parent"][type="application/json"]`)
                                .text());

                            const allVariants = crossSellProduct.variants;

                            const isSingle = allVariants.length === 1;

                            if (!isSingle) {
                                const selectedVariant = allVariants.find(this.findMatchingSizes.bind(this, productSize));

                                if (selectedVariant) {
                                    return {
                                        id: selectedVariant.id,
                                        quantity: this.product.quantity,
                                    };
                                }

                            }
                        }

                        return {
                            id: crossSellVariantId,
                            quantity: this.product.quantity,
                        };
                    });


                    formData.items.push(...allAddonProducts);
                }

                if (!!$bundleCrossSell.length) {
                    const targetVariant = $bundleCrossSell.get(0).targetVariant;

                    if (targetVariant) {
                        formData.items.unshift({
                            id: targetVariant.id,
                            quantity: this.product.quantity,
                        });
                    }
                }

                if (!!$freebieBundle.length) {
                    const data = JSON.parse($freebieBundle.find(`script#BundleCrossSell-JSON`).text());

                    const singleVariant = data.variants.length === 1;

                    let selectedVariant;

                    if (singleVariant) {
                        selectedVariant = data.variants[0];
                    } else {
                        const productSize = $(`product-buybox select[name="options[Size]"]`).val().split("|")[0].trim();

                        selectedVariant = data.variants.find((variant) => variant.title.includes(productSize));
                    }

                    if (selectedVariant) {
                        formData.items[0].attributes = [
                            {
                                key: "_optInFreebie",
                                value: "true",
                            },
                            {
                                key: "_freebieVariantId",
                                value: selectedVariant.id.toString(),
                            },
                        ];
                    }
                }

                if (!!$freebieOffer.length) {
                    formData.items[0].attributes = [
                        {
                            key: "_enableFreebie",
                            value: "",
                        },
                    ];
                }

                if (!!$promotionalPanel.length) {
                    const sizeCompatible = !!$promotionalPanel.data("sizeCompatible");

                    if (sizeCompatible) {
                        const promotionalProductData = JSON.parse($promotionalPanel.find(`script#Promotional-Product-JSON[type="application/json"]`)
                            .text());

                        const allVariants = promotionalProductData.variants;

                        const isConfigurable = allVariants.length > 1;

                        if (isConfigurable) {
                            const productSize = $(`product-buybox select[name="options[Size]"]`).val()
                                .split("|")[0].trim();
                            const selectedVariant = allVariants.find((variant) => variant.title.includes(productSize));

                            if (!selectedVariant) return;

                            formData.items.unshift({
                                id: selectedVariant.id,
                                quantity: this.product.quantity,
                            });
                        }
                    }
                }
            }

            findMatchingSizes(targetSize, variant) {
                const sizes = new Set([...variant.title.split(" / "), variant.title.split("|")[0].trim()]);

                if (sizes.has("Cal King")) sizes.add("California King");

                return sizes.has(targetSize);
            }

            async postPurchase(cartInput, cart) {
                // const $promotionalPanel = $("promotional-panel");
                // const promotionalCoupon = $promotionalPanel.data("promotionalCoupon");
                //
                // if (!this.formError.hasErrors && !!promotionalCoupon) {
                //     await this.applyDiscountCode(promotionalCoupon);
                // }
                // const cartRedeem = document.getElementById("CartRedeemCode");
                // const cartSummary = document.getElementById("CartDrawerSummary");
                // const codeRedeemed = cartRedeem.codeRedeemed;
                // if (!!codeRedeemed) {
                //   await this.cart.loadCheckout();
                //
                //   const isApplicable = cartRedeem.checkCodeApplicable();
                //
                //   if (!isApplicable) return;
                //
                //   cartSummary.computeDiscountedTotal();
                //   cartRedeem.refreshDiscountTag();
                // }


                return cart;
            }


        },
    );
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
class ProductFormError extends Element {
    props = {
        errors: [],
    };

    get hasErrors() {
        return this.errors?.length;
    }

    setup(props) {
        this.$el.attr({ "role": "alert" });
    }


    mounted() {
        super.mounted();

        $(window).on("complete", this.setupTooltips);
    }

    template() {
        return this.errors.length && this.errors.map(err => `
            <div class="product-form__error-message">
                <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-error" viewBox="0 0 13 13" width="13"
         height="13">
      <circle cx="6.5" cy="6.50049" r="5.5" stroke="white" stroke-width="2"></circle>
      <circle cx="6.5" cy="6.5" r="5.5" fill="#EB001B" stroke="#EB001B" stroke-width="0.7"></circle>
      <path
        d="M5.87413 3.52832L5.97439 7.57216H7.02713L7.12739 3.52832H5.87413ZM6.50076 9.66091C6.88091 9.66091 7.18169 9.37267 7.18169 9.00504C7.18169 8.63742 6.88091 8.34917 6.50076 8.34917C6.12061 8.34917 5.81982 8.63742 5.81982 9.00504C5.81982 9.37267 6.12061 9.66091 6.50076 9.66091Z"
        fill="white"></path>
      <path
        d="M5.87413 3.17832H5.51535L5.52424 3.537L5.6245 7.58083L5.63296 7.92216H5.97439H7.02713H7.36856L7.37702 7.58083L7.47728 3.537L7.48617 3.17832H7.12739H5.87413ZM6.50076 10.0109C7.06121 10.0109 7.5317 9.57872 7.5317 9.00504C7.5317 8.43137 7.06121 7.99918 6.50076 7.99918C5.94031 7.99918 5.46982 8.43137 5.46982 9.00504C5.46982 9.57872 5.94031 10.0109 6.50076 10.0109Z"
        fill="white" stroke="#EB001B" stroke-width="0.7">
      </path>
    </svg>
                <span>${err.message}</span>
            </div>
        `).join("");
    }

    reset() {
        this.errors = [];
    }
}

customElements.define("product-form-error", ProductFormError);
