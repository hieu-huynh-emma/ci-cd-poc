class JointProductEngine extends HTMLElement {
  currProduct = {};

  coreProduct = {};

  activeIndex = 0;

  constructor() {
    super();

    this.data = JSON.parse(document.querySelector("#joint-product-data").textContent);
    this.currProduct = this.data[0];
    this.coreProduct = this.data[0];
  }

  connectedCallback() {
    this.selectorWidgetToggle();
    this.refreshSelector();
    setTimeout(() => {
      this.removeYotpoStarRatingBlock();
      $("#product-layout .skeleton").hide();
    }, 100);
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
    const currVariantIndex = this.currProduct.variants.findIndex(({ id: targetId }) => +currVariantId === targetId);

    return targetProduct.variants[currVariantIndex];
  }

  selectorWidgetToggle(show = true) {
    const $jointProductSelector = $("joint-product-selector");
    const $jointProductEngine = $("joint-product-engine");
    const $productConfiguration = $("#product-form");

    $jointProductSelector.detach();

    if (show) {
      $jointProductSelector.insertBefore($productConfiguration);
      $jointProductSelector.removeClass("hidden");
    } else {
      $jointProductEngine.append($jointProductSelector);
      $jointProductSelector.addClass("hidden");
    }
  }

  refreshSelector() {
    const $joinProductOptions = $("joint-product-option");

    $joinProductOptions.removeClass("selected");

    const $selectedOption = $joinProductOptions.filter(`[data-product-id='${this.currProduct.id}']`);

    $selectedOption.addClass("selected");
  }

  removeYotpoStarRatingBlock() {
    setTimeout(() => {
      const $yotpoStarRating = $(".yotpo-reviews-star-ratings-widget");

      $yotpoStarRating.hide();
    }, 500);
  }
}

class JointProductSelector extends HTMLElement {
  get refs() {
    return {
      $variantSelects: $("variant-selects"),
      engine: document.querySelector("joint-product-engine"),
      $options: $("joint-product-option"),
    };
  }

  constructor() {
    super();
    this.data = JSON.parse(document.querySelector("#joint-product-data").textContent);
  }

  connectedCallback() {
    const $options = $("joint-product-option");

    $options.click(debounce(this.handleOnClick, 100));

    this.refreshListeners();
  }

  updateURL() {
    const { $variantSelects, engine } = this.refs;
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
    const { engine } = this.refs;

    if (productId === engine.currProduct.id) return;

    $("#product-layout .skeleton").show();

    const selectedProduct = this.data.find(({ id: targetId }) => targetId === productId);
    const selectedIndex = this.data.findIndex(({ id: targetId }) => targetId === productId);

    const pageHtml = await engine.fetchPDP(selectedProduct);

    engine.currProduct = selectedProduct;
    engine.activeIndex = selectedIndex;

    await this.refreshSections(pageHtml);

    setTimeout(() => {
      engine.removeYotpoStarRatingBlock();
    }, 100);

    setTimeout(() => {
      engine.refreshSelector();

      this.refreshVariantListeners();
      this.refreshListeners();
      this.refreshForm(pageHtml);

      $("#product-layout .skeleton").hide();
    }, 200);
  }

  refreshForm(html) {
    const $form = $("#product-form form");

    const replacementForm = html.querySelector("#product-form form");

    $form.attr({
      id: replacementForm.getAttribute("id"),
      class: replacementForm.getAttribute("class"),
    });

    $(`input[name="product-id"]`).val(html.querySelector(`input[name="product-id"]`).value);
    $(`input[name="section-id"]`).val(html.querySelector(`input[name="section-id"]`).value);
  }

  refreshSections(html) {
    return Promise.all(
      this.getSectionsToRender().map(({ sectionId, replaceId, selector }) => {
        console.log("=>(joint-product.js:180) sectionId", sectionId);
        return new Promise((resolve) => {
          const elementQuery = `[id$='__${sectionId}']${selector ? ` ${selector}` : ""}`,
            newElementQuery = `[id$='__${replaceId}']${selector ? ` ${selector}` : ""}`;

          const $elementToReplace = $(elementQuery);

          if (!$elementToReplace.length) resolve();

          $elementToReplace.empty();

          const newElement = html.querySelector(newElementQuery) || html.querySelector(elementQuery);

          if (!newElement) resolve();

          if (selector) {
            $elementToReplace.replaceWith(this.prepareHtml(newElement.outerHTML)).ready(resolve);
          } else {
            const doc = this.prepareHtml(newElement.innerHTML);
            $elementToReplace.html(doc).ready(resolve);
          }
        });
      }),
    );
  }

  prepareHtml(html) {
    return html.replace(`rel="quickscript"`, `rel="stylesheet"`).replace(`type="quickscript"`, ``).replace(`loading="visibility"`, "");
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
        sectionId: "product-media",
        selector: "product-media",
      },
      {
        sectionId: "product-layout",
        selector: ".product__price",
      },
      {
        sectionId: "product-layout",
        selector: ".product-form__controls-group",
      },
      {
        sectionId: "product-layout",
        selector: "#attribute-configurator",
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
      { sectionId: "bundle-box" },
      {
        sectionId: "mattress-layers",
        selector: "mattress-layers",
      },
      {
        sectionId: "mattress-firmness",
      },
    ];
  }

  refreshListeners() {
    const { $variantSelects } = this.refs;

    $variantSelects.on("change", this.updateURL.bind(this));
  }

  refreshVariantListeners() {
    const { $options } = this.refs;

    $options.each(function() {
      this.attachVariantListener();
    });
  }
}

class JointProductOption extends HTMLElement {
  data = {
    product: {},
    variant: {},
  };

  get refs() {
    return {
      variantSelector: document.querySelector("variant-selects .select__select"),
      engine: document.querySelector("joint-product-engine"),
      selector: document.querySelector("joint-product-selector"),
    };
  }

  constructor() {
    super();

    this.$el = $(this);

    const allProducts = JSON.parse(document.querySelector("#joint-product-data").textContent);

    this.data.product = allProducts.find(({ id: targetId }) => targetId === this.$el.data("productId"));
  }

  connectedCallback() {
    this.attachVariantListener();
    this.onVariantChange();
  }

  renderPrice() {
    const { variant } = this.data;

    const $productPrice = $(this).find(".product-price");

    const price = variant.price,
      originalPrice = variant.compare_at_price || 0,
      totalSaved = Math.max(0, originalPrice - price),
      priceInCurrency = Currency.format(parseFloat(price) / 100),
      originalPriceInCurrency = Currency.format(parseFloat(originalPrice) / 100);

    $productPrice.html(`
				<p>
					<span class="font-semibold text-scarlet">${priceInCurrency}</span>
					${totalSaved ? `<span class="line-through">${originalPriceInCurrency}</span>` : ""}       
				</p>
		`);
  }

  attachVariantListener() {
    const { variantSelector } = this.refs;

    variantSelector.addEventListener("change", this.onVariantChange.bind(this));
  }

  onVariantChange() {
    const { variantSelector } = this.refs;
    const { product } = this.data;

    const size = variantSelector.value.split("|")[0].trim();

    this.data.variant = product.variants.find((v) => {
      const variantSize = v.title.split("|")[0].trim();
      return variantSize === size;
    });

    this.renderPrice();
  }
}

class JointProductStarRating extends HTMLElement {
  constructor() {
    super();

    this.innerHTML = `
                <div class="yotpo-stars">
                <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.103 4.36677C12.6146 4.36677 13.0492 4.6798 13.2104 5.1643C13.3711 5.64738 13.211 6.15694 12.8026 6.46198L10.4151 8.24502L11.2058 11.1976C11.3391 11.6966 11.1437 12.199 10.7085 12.4776C10.271 12.7579 9.73151 12.7231 9.33217 12.3927L7.18683 10.612C7.07859 10.522 6.92108 10.522 6.81228 10.612L4.66779 12.3927C4.44875 12.5744 4.18757 12.6662 3.9241 12.6662C3.70677 12.6662 3.48831 12.6041 3.29063 12.477C2.85569 12.1985 2.66087 11.696 2.79445 11.1976L3.58457 8.24502L1.19769 6.46227C0.789246 6.15636 0.629168 5.64708 0.790098 5.16373C0.951028 4.67951 1.38568 4.36677 1.89695 4.36677H4.66323C4.78656 4.36677 4.89707 4.2893 4.93837 4.17423L5.90139 1.47973C6.06887 1.01033 6.5001 0.706985 6.99998 0.706985C7.49957 0.706985 7.9308 1.01033 8.09828 1.48001L9.06215 4.17451C9.10316 4.28959 9.21368 4.36677 9.33672 4.36677H12.103Z" fill="#FFBA00"/>
                              </svg>
                               <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.103 4.36677C12.6146 4.36677 13.0492 4.6798 13.2104 5.1643C13.3711 5.64738 13.211 6.15694 12.8026 6.46198L10.4151 8.24502L11.2058 11.1976C11.3391 11.6966 11.1437 12.199 10.7085 12.4776C10.271 12.7579 9.73151 12.7231 9.33217 12.3927L7.18683 10.612C7.07859 10.522 6.92108 10.522 6.81228 10.612L4.66779 12.3927C4.44875 12.5744 4.18757 12.6662 3.9241 12.6662C3.70677 12.6662 3.48831 12.6041 3.29063 12.477C2.85569 12.1985 2.66087 11.696 2.79445 11.1976L3.58457 8.24502L1.19769 6.46227C0.789246 6.15636 0.629168 5.64708 0.790098 5.16373C0.951028 4.67951 1.38568 4.36677 1.89695 4.36677H4.66323C4.78656 4.36677 4.89707 4.2893 4.93837 4.17423L5.90139 1.47973C6.06887 1.01033 6.5001 0.706985 6.99998 0.706985C7.49957 0.706985 7.9308 1.01033 8.09828 1.48001L9.06215 4.17451C9.10316 4.28959 9.21368 4.36677 9.33672 4.36677H12.103Z" fill="#FFBA00"/>
                              </svg>
                               <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.103 4.36677C12.6146 4.36677 13.0492 4.6798 13.2104 5.1643C13.3711 5.64738 13.211 6.15694 12.8026 6.46198L10.4151 8.24502L11.2058 11.1976C11.3391 11.6966 11.1437 12.199 10.7085 12.4776C10.271 12.7579 9.73151 12.7231 9.33217 12.3927L7.18683 10.612C7.07859 10.522 6.92108 10.522 6.81228 10.612L4.66779 12.3927C4.44875 12.5744 4.18757 12.6662 3.9241 12.6662C3.70677 12.6662 3.48831 12.6041 3.29063 12.477C2.85569 12.1985 2.66087 11.696 2.79445 11.1976L3.58457 8.24502L1.19769 6.46227C0.789246 6.15636 0.629168 5.64708 0.790098 5.16373C0.951028 4.67951 1.38568 4.36677 1.89695 4.36677H4.66323C4.78656 4.36677 4.89707 4.2893 4.93837 4.17423L5.90139 1.47973C6.06887 1.01033 6.5001 0.706985 6.99998 0.706985C7.49957 0.706985 7.9308 1.01033 8.09828 1.48001L9.06215 4.17451C9.10316 4.28959 9.21368 4.36677 9.33672 4.36677H12.103Z" fill="#FFBA00"/>
                              </svg>
                               <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.103 4.36677C12.6146 4.36677 13.0492 4.6798 13.2104 5.1643C13.3711 5.64738 13.211 6.15694 12.8026 6.46198L10.4151 8.24502L11.2058 11.1976C11.3391 11.6966 11.1437 12.199 10.7085 12.4776C10.271 12.7579 9.73151 12.7231 9.33217 12.3927L7.18683 10.612C7.07859 10.522 6.92108 10.522 6.81228 10.612L4.66779 12.3927C4.44875 12.5744 4.18757 12.6662 3.9241 12.6662C3.70677 12.6662 3.48831 12.6041 3.29063 12.477C2.85569 12.1985 2.66087 11.696 2.79445 11.1976L3.58457 8.24502L1.19769 6.46227C0.789246 6.15636 0.629168 5.64708 0.790098 5.16373C0.951028 4.67951 1.38568 4.36677 1.89695 4.36677H4.66323C4.78656 4.36677 4.89707 4.2893 4.93837 4.17423L5.90139 1.47973C6.06887 1.01033 6.5001 0.706985 6.99998 0.706985C7.49957 0.706985 7.9308 1.01033 8.09828 1.48001L9.06215 4.17451C9.10316 4.28959 9.21368 4.36677 9.33672 4.36677H12.103Z" fill="#FFBA00"/>
                              </svg>
                               <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.103 4.36677C12.6146 4.36677 13.0492 4.6798 13.2104 5.1643C13.3711 5.64738 13.211 6.15694 12.8026 6.46198L10.4151 8.24502L11.2058 11.1976C11.3391 11.6966 11.1437 12.199 10.7085 12.4776C10.271 12.7579 9.73151 12.7231 9.33217 12.3927L7.18683 10.612C7.07859 10.522 6.92108 10.522 6.81228 10.612L4.66779 12.3927C4.44875 12.5744 4.18757 12.6662 3.9241 12.6662C3.70677 12.6662 3.48831 12.6041 3.29063 12.477C2.85569 12.1985 2.66087 11.696 2.79445 11.1976L3.58457 8.24502L1.19769 6.46227C0.789246 6.15636 0.629168 5.64708 0.790098 5.16373C0.951028 4.67951 1.38568 4.36677 1.89695 4.36677H4.66323C4.78656 4.36677 4.89707 4.2893 4.93837 4.17423L5.90139 1.47973C6.06887 1.01033 6.5001 0.706985 6.99998 0.706985C7.49957 0.706985 7.9308 1.01033 8.09828 1.48001L9.06215 4.17451C9.10316 4.28959 9.21368 4.36677 9.33672 4.36677H12.103Z" fill="#FFBA00"/>
                              </svg>
                </div>
             <div class="yotpo-rating-score"></div>
        `;
  }

  connectedCallback() {
    this.getReview();
  }

  getReview() {
    const productId = this.getAttribute(`:${"productId".toLowerCase()}`);
    const placeholder = this.getAttribute(`:${"placeholder".toLowerCase()}`);

    const url = `https://api.yotpo.com/products/hEc3IC0lCXuQ15phwUS54IFWUkW2L7LAcNLTHkt6/${productId}/bottomline`;

    const options = {
      method: "GET",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
    };

    const ratingScore = this.querySelector(".yotpo-rating-score");

    fetch(url, options)
      .then((res) => res.json())
      .then((json) => json.response.bottomline)
      .then((res) => {
        ratingScore.innerHTML = res.average_score || placeholder;
      })
      .catch((err) => {
        ratingScore.innerHTML = placeholder;
        console.error("error:" + err);
      });
  }
}

customElements.define("joint-product-star-rating", JointProductStarRating);

customElements.define("joint-product-engine", JointProductEngine);
customElements.define("joint-product-selector", JointProductSelector);
customElements.define("joint-product-option", JointProductOption);
