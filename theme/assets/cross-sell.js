import {allFulfilled, fetchMetaobjects, fetchProduct, fetchVariant} from "data-fetcher";
import {METAFIELD} from "data-constants";

class CrossSellAPI {
    async perVariant(variantId, metafield = METAFIELD.CROSS_SELLING_PRODUCT) {
        const variant = await fetchVariant(generateShopifyGid("ProductVariant", variantId));

        const metaobjectIds = variant.metafields[metafield];

        return {
            main: variant,
            entries: await this.compose(metaobjectIds),
        };
    }

    async perProduct(productId, metafield = METAFIELD.CROSS_SELLING_PRODUCT) {

        const product = await fetchProduct(generateShopifyGid("Product", productId));

        const metaobjectIds = product.metafields[metafield];

        return {
            main: product,
            entries: await this.compose(metaobjectIds),
        };

    }

    async compose(metaobjectIds) {
        if (!metaobjectIds) {
            return [];
        }

        const metaobjects = await fetchMetaobjects(metaobjectIds);

        return allFulfilled(
            metaobjects.map(async (metaobject) => {
                const variant = await fetchVariant(metaobject.variantId);
                return {
                    title: metaobject.title,
                    variant,
                    parent: await fetchProduct(metaobject.productId || variant.product.id),
                    qty: metaobject.qty,
                };
            }),
        );
    }
}

class CrossSellManager extends CustomElement {

    crossSellProducts = [];

    constructor() {
        super();
    }

    render() {
        if (!this.crossSellProducts.length) return;

        this.$el.html(this.template());
    }


    listenToParent() {
        window.addEventListener("productVariantChange", debounce(this.onParentVariantChange.bind(this), 100));
    }

    async mounted() {
        super.mounted();
        this.$el.addClass("is-mounted");
    }

    async onChange(id) {
        this.prepare();

        await this.update(id);

        this.render();

        this.$el.removeClass("is-loading");
    }

    prepare() {
        this.innerHTML = `<div class="skeleton"></div>`;
        this.$el.addClass("is-loading");
        this.$el.removeClass('hidden')
    }

    async update() {

    }

    destroy() {
        this.$el.empty()
        this.$el.addClass('hidden')
    }

    onParentVariantChange() {
        const currentParentVariantId = +$(".product-form__variants option:selected").val();
        if (!currentParentVariantId) return;

        this.onChange(currentParentVariantId);
    }
}

export default {
    API: new CrossSellAPI(),
    Manager: CrossSellManager,
};

