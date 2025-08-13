class EventController {

    constructor({target = document, eventName, listener}) {
        this.controller = new AbortController();

        target.addEventListener(eventName, listener, {signal: this.controller.signal})

        return this.controller
    }
}

class CoverSelectionEngine extends HTMLElement {
    initialized = false;
    currProduct = {};

    coreProduct = {};

    activeIndex = 0;

    constructor() {
        super();

        this.data = JSON.parse(document.querySelector("#cover-selection-data").textContent);

        const initialHandle = window.location.href.slice(window.location.href.lastIndexOf("/") + 1);

        const currProduct = this.data.find(({handle}) => handle === initialHandle) || this.data[0]

        this.currProduct = currProduct
        this.coreProduct = currProduct
    }

    connectedCallback() {
        this.refreshSelector();
        setTimeout(() => {
            $("#product-layout .skeleton").hide();
        }, 100);

        this.initialized = true;
    }

    fetchPDP(targetProduct) {
        const url = this.composeURL(targetProduct);

        return fetch(url)
        .then((response) => response.text())
        .then((text) => new DOMParser().parseFromString(text, "text/html").querySelector("#MainContent"));
    }

    composeURL(targetProduct) {
        const url = new URL(`${window.location.origin}/products/${targetProduct.handle}${window.location.search}`);

        if (targetProduct.id !== this.coreProduct.id) {
            const variantId = url.searchParams.get("variant");

            if (variantId) {
                const matchedVariant = this.findMatchingVariant(variantId, targetProduct);
                url.searchParams.set("variant", matchedVariant.id);
            }
        }

        return url.toString();
    }

    findMatchingVariant(currVariantId, targetProduct) {
        const currVariantIndex = this.currProduct.variants.findIndex(({id: targetId}) => +currVariantId === targetId);

        return targetProduct.variants[currVariantIndex];
    }

    selectorWidgetToggle(show = true) {
        const $jointProductSelector = $("cover-selection");
        const $jointProductEngine = $("cover-selection-engine");
        const $attrConfigurator = $("#attribute-configurator");

        $jointProductSelector.detach();

        if (show) {
            $jointProductSelector.insertAfter($attrConfigurator);
            $jointProductSelector.removeClass("hidden");
        } else {
            $jointProductEngine.append($jointProductSelector);
            $jointProductSelector.addClass("hidden");
        }
    }

    refreshSelector() {
        const $joinProductOptions = $("cover-option");

        $joinProductOptions.removeClass("selected");

        const $selectedOption = $joinProductOptions.filter(`[data-product-id='${this.currProduct.id}']`);

        $selectedOption.addClass("selected");
    }
}

class CoverSelection extends HTMLElement {
    get refs() {
        return {
            $variantSelects: $("variant-selects"),
            engine: document.querySelector("cover-selection-engine"),
            $options: $("cover-option"),
        };
    }

    constructor() {
        super();
        this.$el = $(this);

        this.data = JSON.parse(document.querySelector("#cover-selection-data").textContent);
    }

    connectedCallback() {
        const $options = $("cover-option");

        $options.click(debounce(this.handleOnClick, 100));

        this.refreshListeners();
    }

    updateURL() {
        const {$variantSelects, engine} = this.refs;
        const product = engine.coreProduct;
        const url = new URL(`${window.location.origin}/products/${product.handle}${window.location.search}`);

        const $variantSelector = $variantSelects.find(".select__select");

        const size = $variantSelector.val().split("|")[0].trim();
        const selectedVariant = product.variants.find((v) => {
            const variantSize = v.title.split("|")[0].trim();
            return variantSize === size;
        });

        url.searchParams.set("variant", selectedVariant.id);

        window.history.replaceState({}, "", url.toString());
    }

    handleOnClick = async (e) => {
        const $option = $(e.currentTarget);

        const productId = $option.data("productId");

        await this.updatePage(productId);
    };

    async updatePage(productId) {
        const {engine} = this.refs;

        if (productId === engine.currProduct.id) return;

        $("#product-layout .skeleton").show();

        this.onVariantChangeController?.abort()

        const selectedProduct = this.data.find(({id: targetId}) => targetId === productId);
        const selectedIndex = this.data.findIndex(({id: targetId}) => targetId === productId);

        const pageHtml = await engine.fetchPDP(selectedProduct);

        engine.currProduct = selectedProduct;
        engine.activeIndex = selectedIndex;

        await this.refreshSections(pageHtml);

        setTimeout(() => {
            engine.refreshSelector();
            this.refreshListeners()
            this.refreshForm(pageHtml);

            $("#product-layout .skeleton").hide();
        }, 200);
    }

    refreshForm(html) {
        const $form = $("product-form form");

        const replacementForm = html.querySelector("product-form form");

        $form.attr({
            id: replacementForm.getAttribute("id"),
            class: replacementForm.getAttribute("class"),
        });

        // Re-updating the variant ID
        $("product-buybox select.select__select")
        .get(0)
        .dispatchEvent(new Event("change", {bubbles: true}));

        $(`input[name="product-id"]`).val(html.querySelector(`input[name="product-id"]`).value);
        $(`input[name="section-id"]`).val(html.querySelector(`input[name="section-id"]`).value);
    }

    refreshSections(html) {
        return Promise.allSettled(
            this.getSectionsToRender().map((config) => this.loadSection(html, config)),
        );
    }

    loadSection(replacementPage, {sectionId, outletQuery, insertPosition, replaceId, selector, blocks = []}) {
        return new Promise(async (resolve) => {
            const sectionQuery = `${sectionId ? `[id$='__${sectionId}']` : ""}`,
                selectorQuery = `${selector ? `${selector}` : ""}`,
                targetQuery = `${sectionQuery} ${selectorQuery}`;

            const replacementEl = replacementPage.querySelector(targetQuery);

            const $currEl = $(targetQuery);


            if (!$currEl.length && !!replacementEl) {
                const outletEl = document.querySelector(outletQuery);

                outletEl?.insertAdjacentHTML(insertPosition, replacementEl.outerHTML);

                resolve();
                return;
            } else {
                $currEl.empty();
            }


            if (!replacementEl) {
                resolve();
                return;
            }

            if (selector) {
                $currEl.replaceWith(this.prepareHtml(replacementEl.outerHTML));
            } else {
                const doc = this.prepareHtml(replacementEl.innerHTML);
                $currEl.html(doc);
            }


            if (!!blocks?.length) {
                await Promise.allSettled(blocks.map(this.loadBlock.bind(this, {sectionQuery, replacementPage})));
            }

            resolve();
        });
    }


    loadBlock({sectionQuery, replacementPage}, {query, outletQuery, blockId, insertPosition}) {
        return new Promise((resolve) => {
            const blockEl = replacementPage.querySelector(query);
            if (!blockEl) {
                resolve();
                return;
            }

            const processedBlock = this.prepareHtml(blockEl.outerHTML);

            if (outletQuery) {
                const outletEl = document.querySelector(`${sectionQuery} ${outletQuery}`);

                outletEl?.insertAdjacentHTML(insertPosition, processedBlock);
            } else {
                const $blockPlaceholder = $(`${sectionQuery} #${blockId}-placeholder`);
                $blockPlaceholder.replaceWith(processedBlock);
            }

            setTimeout(() => {
                blockEl.classList.add("is-initialized");
            }, 500);

            resolve();

        });
    }

    prepareHtml(html) {
        return html.replaceAll(`rel="quickscript"`, `rel="stylesheet"`).replaceAll(`type="quickscript"`, ``)
                   .replaceAll(`loading="visibility"`, "");
    }

    getSectionsToRender() {
        return [
            {
                sectionId: "product-summary",
            },
            {
                sectionId: "product-layout",
                selector: "#product-viewer .promotion-overlay",
            },
            {
                selector: "product-buybox",
                blocks: [
                    {
                        query: `[id$="__bundle-cross-sell"]`,
                        outletQuery: "#attribute-configurator",
                        insertPosition: "afterend",
                    },
                    {
                        query: `[id$="__price-transparency"]`,
                        blockId: "price-transparency",
                    },
                ],
            },
            {
                selector: "sticky-buybox",
            },
            {
                sectionId: "campaign-teaser",
            },
            {
                sectionId: "product-media",
                selector: "product-media",
            },

            {
                sectionId: "product-auxiliary",
                selector: "#quick-compare",
            },
            {
                sectionId: "product-auxiliary",
                selector: "#upsell-widget",
            },

            {
                sectionId: "product-specifications",
            },
            {
                sectionId: "product-unique-selling-points",
            },

            {
                sectionId: "freebie-bundle",
                outletQuery: "#attribute-configurator",
                insertPosition: "afterend",
            },

            {
                sectionId: "mattress-layers",
                selector: "mattress-layers",
            },
            {
                sectionId: "mattress-firmness",
            },
            {
                sectionId: "product-auxiliary",
                selector: "#cross-sell-panel",
                outletQuery: "#attribute-configurator",
                insertPosition: "afterend",
            },
            {
                sectionId: "freebie-offer",
                outletQuery: "#attribute-configurator",
                insertPosition: "afterend",
            },
            {
                sectionId: "cover-selection",
                selector: "cover-selection",
                outletQuery: "#attribute-configurator",
                insertPosition: "afterend",
            },
        ];
    }

    refreshListeners() {
        const {$variantSelects} = this.refs;

        this.onVariantChangeController = new EventController({
            target: $variantSelects.get(0),
            eventName: "change",
            listener: () => {
                console.log("change", performance.mark("change"))

                this.onVariantChange()
            }
        })

    }

    onVariantChange() {
        const {$options, engine} = this.refs;

        this.updateURL();

        const optionsData = $options.map(function () {
            return this.onVariantChange();
        }).get();

        const shouldHidden = optionsData.some(({variant: {available}}) => !available)
        console.log("=>(cover-selection.js:360) shouldHidden", shouldHidden);
        this.$el.attr("hidden", false);


        if (!shouldHidden) {
            this.$el.find("cover-option").attr("hidden", false);

            return;
        }
        this.$el.find("cover-option").attr("hidden", true);

        const availOption = optionsData.find(({variant: {available}}) => !!available)

        if (!availOption) {
            this.updatePage(optionsData?.[0]?.product?.id);
            this.$el.attr("hidden", shouldHidden);
        } else {
            const availProductId = availOption?.product?.id;

            console.log("=>(cover-selection.js:364) availOption", availOption);
            console.log("=>(cover-selection.js:368) availProductId", availProductId);
            console.log("=>(cover-selection.js:364) engine.currProduct.id", engine.currProduct.id)

            this.updatePage(availProductId)

            this.$el.find(`cover-option[data-product-id="${availProductId}"]`).attr("hidden", false);
        }
    }


}

class CoverOption extends Button {
    props = {
        trackId: null,
    };
    data = {
        product: {},
        variant: {},
    };

    get refs() {
        return {
            variantSelector: document.querySelector("variant-selects .select__select"),
            engine: document.querySelector("cover-selection-engine"),
            selector: document.querySelector("cover-selection"),
        };
    }

    setup() {
        const allProducts = JSON.parse(document.querySelector("#cover-selection-data").textContent);

        this.data.product = allProducts.find(({id: targetId}) => targetId === this.$el.data("productId"));
    }

    onVariantChange() {
        const {variantSelector} = this.refs;
        const {product} = this.data;

        const size = variantSelector.value.split("|")[0].trim();

        const targetVariant = product.variants.find((v) => {
            const variantSize = v.title.split("|")[0].trim();
            return variantSize === size;
        });

        this.data.variant = targetVariant

        return {product, variant: targetVariant}
    }

    onClick(e) {
        super.onClick(e);

        const {trackId} = this.props;

        if (trackId) {
            window.dataLayer.push({
                event: "click",
                click_type: trackId,
            });
        }
    }
}


customElements.define("cover-selection-engine", CoverSelectionEngine);
customElements.define("cover-selection", CoverSelection);
customElements.define("cover-option", CoverOption);
