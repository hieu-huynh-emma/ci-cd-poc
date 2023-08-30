class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("change", this.onVariantChange);


  }


  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleCartState(true, "", false);
    this.updatePickupAvailability();
    this.removeErrorMessage();

    if (!this.currentVariant) {
      this.toggleCartState(true, "", true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.renderProductInfo();
      this.updateVariantInput();
      this.updateAffirm();
    }
  }

  updateAffirm() {
    const price = this.currentVariant.price / 100;
    const affirmPrice = Number((price / 12).toFixed(2));
    const priceInCurrency = Currency.format(affirmPrice, { maximumFractionDigits: affirmPrice % 1 === 0 ? 0 : 2 });
    $("#affirm-widget .pro_val").text(priceInCurrency);
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll("select"), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;
    const newMedia = document.querySelector(
      `[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`,
    );

    if (!newMedia) return;
    const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
    const newMediaModal = modalContent.querySelector(`[data-media-id="${this.currentVariant.featured_media.id}"]`);
    const parent = newMedia.parentElement;
    if (parent.firstChild == newMedia) return;
    modalContent.prepend(newMediaModal);
    parent.prepend(newMedia);
    this.stickyHeader = this.stickyHeader || document.querySelector("sticky-header");
    if (this.stickyHeader) {
      this.stickyHeader.dispatchEvent(new Event("preventHeaderReveal"));
    }
    window.setTimeout(() => {
      parent.querySelector("li.product__media-item").scrollIntoView({ behavior: "smooth" });
    });
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === "false") return;
    window.history.replaceState({}, "", `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`.product-form-${this.dataset.section}, #product-form-installment`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector("input[name=\"id\"]");

      if (input) {
        input.value = this.currentVariant.id;
        input.dispatchEvent(new Event("change", { bubbles: true }));

      }

      const selectEl = productForm.querySelector("select[name=\"id\"]");

      if (selectEl) {
        selectEl.value = this.currentVariant.id;
        selectEl.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector("pickup-availability");
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute("available");
      pickUpAvailability.innerHTML = "";
    }
  }

  removeErrorMessage() {
    const section = this.closest("section");
    if (!section) return;

    const productForm = section.querySelector("product-form");
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    const originalPrice = this.currentVariant.compare_at_price / 100;
    const price = this.currentVariant.price / 100;

    const priceInCurrency = Currency.format(price, { maximumFractionDigits: price % 1 === 0 ? 0 : 2 });
    const originalPriceInCurrency = Currency.format(originalPrice, { maximumFractionDigits: originalPrice % 1 === 0 ? 0 : 2 });
    const discountPercentage = Math.round((originalPrice - price) * 100 / originalPrice);

    $(".price-item.price-item--sale").text(priceInCurrency);
    $(".price-item.price-item--regular").text(originalPriceInCurrency);
    $(".price__pricing-group .price-badge").text(`- ${discountPercentage}%`);

    const isAvail = !!this.currentVariant.available;

    this.toggleCartState(!isAvail, window.variantStrings.soldOut);

    const $qtySelector = $(".product-quantity-selector");

    $qtySelector[isAvail ? "removeClass" : "addClass"]("visibility-hidden");

    $("quantity-input .quantity-input__native").val(1);
  }


  toggleSoldOutUpsell(disable) {
    const productForm = document.querySelector(`.product-form-${this.dataset.section}`);

    const outOfStockNotice = productForm?.querySelector("#sold-out-upsell");

    if (!outOfStockNotice) return;

    const $outOfStockNotice = $(outOfStockNotice);


    const defaultMsg = $outOfStockNotice.data("default");

    const variantMsg = this.currentVariant.accentuate.out_of_stock_notice?.[Shop.locale];

    if (disable) {
      $outOfStockNotice.addClass("hidden");

    } else {
      $outOfStockNotice.removeClass("hidden");
      $outOfStockNotice.find("p").text(variantMsg || defaultMsg);
    }
  }

  toggleDisclaimer(disable = true) {
    const productForm = document.querySelector(`.product-form-${this.dataset.section}`);

    const disclaimerEl = productForm?.querySelector("#product-disclaimer");

    if (!disclaimerEl) return;

    const $disclaimer = $(disclaimerEl);

    const defaultMsg = $disclaimer.data("default");

    const variantMsg = this.currentVariant.accentuate.disclaimer?.[Shop.locale];


    if (disable) {
      $disclaimer.addClass("hidden");
    } else {
      $disclaimer.removeClass("hidden");

      $disclaimer.children(":first").text(variantMsg || defaultMsg);
    }
  }

  toggleCartState(disable = true, text, modifyClass = true) {
    const productForm = document.querySelector(`.product-form-${this.dataset.section}`);

    if (!productForm) return;

    this.toggleAddButton(...arguments);

    this.toggleSoldOutUpsell(disable);
    this.toggleDisclaimer(disable);
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.querySelector(`.product-form-${this.dataset.section}`);
    const addButton = productForm.querySelector("[name=\"add\"]");

    if (!addButton) return;

    const addButtonText = addButton.querySelector("span");

    if (disable) {
      addButton.setAttribute("disabled", true);
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute("disabled");
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector("[name=\"add\"]");
    const addButtonText = button.querySelector("[name=\"add\"] > span");
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add("visibility-hidden");
  }

  composeVariantData() {
    const rawVariants = JSON.parse(this.querySelector("[type=\"application/json\"]").textContent);
    const rawAccentuates = JSON.parse(document.querySelector(`#AccentuateJson-${this.dataset.section}`).textContent);

    return rawVariants.map(variant => {
      const accentuateData = rawAccentuates.find(({ variantId }) => +variantId === variant.id);

      variant.accentuate = accentuateData.accentuate;

      return variant;
    });
  }

  getVariantData() {
    if (!this.variantData) {
      this.variantData = this.composeVariantData();
    }

    return this.variantData;
  }


}

customElements.define("variant-selects", VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll("fieldset"));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll("input")).find((radio) => radio.checked).value;
    });
  }
}

customElements.define("variant-radios", VariantRadios);

class BundleVariantSelects extends VariantSelects {
  constructor() {
    super();
  }

}

customElements.define("bundle-variant-selects", BundleVariantSelects);
