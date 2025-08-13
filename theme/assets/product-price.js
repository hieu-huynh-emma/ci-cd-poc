if (!customElements.get("product-price")) {
    class ProductPrice extends CustomElement {
        currentPrice = {};

        get refs() {
            return {
                $variantSelects: $("variant-selects"),
            };
        }

        constructor() {
            super();
            window.addEventListener("productVariantChange", debounce(this.onProductVariantChange.bind(this), 100));
            window.addEventListener("productPriceChange", debounce(this.onPriceChange.bind(this), 100));
        }

        mounted() {
            super.mounted();
            this.onProductVariantChange();
        }

        onProductVariantChange() {
            const { $variantSelects } = this.refs;
            const currentVariant = $variantSelects.get(0).currentVariant;

            this.computePrice(currentVariant);

            this.onPriceChange();
            this.updateMetadata(this.currentPrice);
            this.updateParameters(this.currentPrice);
        }

        onPriceChange() {
            let price = 0, originalPrice = 0

            const $crossSells = $("cross-sell-widget").filter(function() {
                return $(this).find(".widget-checkbox__input").is(":checked");
            });

            if ($crossSells.length) {
               const crossSellPricing = this.computeCrossSell($crossSells);

                price += crossSellPricing.price
                originalPrice+= crossSellPricing.originalPrice

            }

            const $bundleCrossSell = $("bundle-cross-sell").filter(function() {
                return $(this).find("#offer-switch").is(":checked");
            });


            if ($bundleCrossSell.length) {

                const bundleCrossSellPricing = this.computeBundleCrossSell($bundleCrossSell);
                price += bundleCrossSellPricing.price
                originalPrice+= bundleCrossSellPricing.originalPrice
            }

            const $freebie = $("freebie-offer").filter(function() {
                return $(this).find("#offer-switch").is(":checked");
            });

            if ($freebie.length) {
                const freebiePricing = this.computeFreebie($freebie);
                price += freebiePricing.price
                originalPrice+= freebiePricing.originalPrice
            }

            const $freebieBundle = $("freebie-bundle").filter(function () {
                return $(this).find("#offer-switch").is(":checked");
            });

            if ($freebieBundle.length) {
                const freebiePricing = this.computeFreebieBundle($freebieBundle);
                price += freebiePricing.price
                originalPrice+= freebiePricing.originalPrice
            }

            const finalPricing = {
              price: price + this.currentPrice.price,
              originalPrice: originalPrice + this.currentPrice.originalPrice
            };

            this.renderPriceTag(finalPricing);
            this.updateMetadata(finalPricing);
        }

        computePrice(currentVariant) {
            let price = +this.$el.find("#price").val(),
                originalPrice = +this.$el.find("#originalPrice").val() || price;

            if (!!currentVariant) {
                price = currentVariant.price / 100;
                originalPrice = (currentVariant.compare_at_price / 100) || price;
            }

            this.currentPrice = {
                price,
                originalPrice,
            };
        }

        computeCrossSell($crossSells) {
            let totalCrossSellPrices = 0,
                totalCrossSellOriginalPrices = 0;

            if ($crossSells.length) {
                $crossSells.each(function() {
                    const $el = $(this);
                    totalCrossSellPrices += +$el.data("price");
                    totalCrossSellOriginalPrices += +$el.data("originalPrice") || +$el.data("price");
                });
            }



            return {
                price: totalCrossSellPrices,
                originalPrice: totalCrossSellOriginalPrices,
            };
        }

        computeBundleCrossSell($bundleCrossSell) {
            const {price, originalPrice } = $bundleCrossSell.get(0).getPricing();

            return {
                price,
                originalPrice,
            };

        }

        computeFreebie($freebie) {
            const { originalPrice } = $freebie.get(0)?.getPricing?.() ?? {originalPrice: 0};

            return {
                price: 0,
                originalPrice,
            };
        }

        computeFreebieBundle($freebie) {
            const bundleData = JSON.parse($freebie.find(`script#BundleCrossSell-JSON`).text());
            const bundleVariant = bundleData.variants[0];

            const bundleOriginalPrice = (bundleVariant.price || 0) / 100;

            return {
                price: 0,
                originalPrice: bundleOriginalPrice,
            };
        }

        renderPriceTag({
                           price,
                           originalPrice,
                       }) {

            const totalSaved = Math.max(0, originalPrice - price),
                priceInCurrency = Currency.format(price, { maximumFractionDigits: price % 1 === 0 ? 0 : 2 }),
                originalPriceInCurrency = Currency.format(originalPrice, { maximumFractionDigits: originalPrice % 1 === 0 ? 0 : 2 });


            this.$el.find("[data-sale-price]").text(priceInCurrency);
            this.$el.find("[data-regular-price]").text(totalSaved ? originalPriceInCurrency : "");
        }

        updateParameters({ price, originalPrice }) {
            $("#price").val(price);
            $("#originalPrice").val(originalPrice);
        }

        updateMetadata(pricing) {
            this.$el.data({
                price: pricing.price,
                originalPrice: pricing.originalPrice,
            });
        }
    }

    customElements.define("product-price", ProductPrice);

}
