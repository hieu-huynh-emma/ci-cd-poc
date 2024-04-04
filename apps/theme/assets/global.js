function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe",
    ),
  );
}

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (event.target !== container && event.target !== last && event.target !== first) return;

    document.addEventListener("keydown", trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener("keydown", trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== "TAB") return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if ((event.target === container || event.target === first) && event.shiftKey) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener("focusout", trapFocusHandlers.focusout);
  document.addEventListener("focusin", trapFocusHandlers.focusin);

  elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ["ARROWUP", "ARROWDOWN", "ARROWLEFT", "ARROWRIGHT", "TAB", "ENTER", "SPACE", "ESCAPE", "HOME", "END", "PAGEUP", "PAGEDOWN"];
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener("keydown", (event) => {
    if (navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener("mousedown", (event) => {
    mouseClick = true;
  });

  window.addEventListener(
    "focus",
    () => {
      if (currentFocusedElement) currentFocusedElement.classList.remove("focused");

      if (mouseClick) return;

      currentFocusedElement = document.activeElement;
      currentFocusedElement.classList.add("focused");
    },
    true,
  );
}

function pauseAllMedia() {
  document.querySelectorAll(".js-youtube").forEach((video) => {
    video.contentWindow.postMessage("{\"event\":\"command\",\"func\":\"" + "pauseVideo" + "\",\"args\":\"\"}", "*");
  });
  document.querySelectorAll(".js-vimeo").forEach((video) => {
    video.contentWindow.postMessage("{\"method\":\"pause\"}", "*");
  });
  document.querySelectorAll("video").forEach((video) => video.pause());
  document.querySelectorAll("product-model").forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener("focusin", trapFocusHandlers.focusin);
  document.removeEventListener("focusout", trapFocusHandlers.focusout);
  document.removeEventListener("keydown", trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== "ESCAPE") return;

  const openDetailsElement = event.target.closest("details[open]");
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector("summary");
  openDetailsElement.removeAttribute("open");
  summaryElement.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector("input");
    this.changeEvent = new Event("change", { bubbles: true });

    this.querySelectorAll("button").forEach((button) => button.addEventListener("click", this.onButtonClick.bind(this)));
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === "plus" ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define("quantity-input", QuantityInput);

const serializeForm = (form) => {
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

function fetchConfig(type = "json") {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: `application/${type}` },
  };
}

/*
 * Shopify Common JS
 *
 */
if (typeof window.Shopify == "undefined") {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  };
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent("on" + eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options["method"] || "post";
  var params = options["parameters"] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for (var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl = document.getElementById(country_domid);
  this.provinceEl = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options["hideElement"] || province_domid);

  Shopify.addListener(this.countryEl, "change", Shopify.bind(this.countryHandler, this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute("data-default");
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute("data-default");
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt = this.countryEl.options[this.countryEl.selectedIndex];
    var raw = opt.getAttribute("data-provinces");
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = "none";
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement("option");
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement("option");
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  },
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector("details");
    const summaryElements = this.querySelectorAll("summary");
    this.addAccessibilityAttributes(summaryElements);

    if (navigator.platform === "iPhone") document.documentElement.style.setProperty("--viewport-height", `${window.innerHeight}px`);

    this.addEventListener("keyup", this.onKeyUp.bind(this));
    this.addEventListener("focusout", this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll("summary").forEach((summary) => summary.addEventListener("click", this.onSummaryClick.bind(this)));
    this.querySelectorAll("button").forEach((button) => button.addEventListener("click", this.onCloseButtonClick.bind(this)));
  }

  addAccessibilityAttributes(summaryElements) {
    summaryElements.forEach((element) => {
      element.setAttribute("role", "button");
      element.setAttribute("aria-expanded", false);
      element.setAttribute("aria-controls", element.nextElementSibling.id);
    });
  }

  onKeyUp(event) {
    if (event.code.toUpperCase() !== "ESCAPE") return;

    const openDetailsElement = event.target.closest("details[open]");
    if (!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle
      ? this.closeMenuDrawer(this.mainDetailsToggle.querySelector("summary"))
      : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const isOpen = detailsElement.hasAttribute("open");

    if (detailsElement === this.mainDetailsToggle) {
      if (isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(summaryElement) : this.openMenuDrawer(summaryElement);
    } else {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector("button"));

      setTimeout(() => {
        detailsElement.classList.add("menu-opening");
      });
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add("menu-opening");
    });
    summaryElement.setAttribute("aria-expanded", true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event !== undefined) {
      this.mainDetailsToggle.classList.remove("menu-opening");
      this.mainDetailsToggle.querySelectorAll("details").forEach((details) => {
        details.removeAttribute("open");
        details.classList.remove("menu-opening");
      });
      this.mainDetailsToggle.querySelector("summary").setAttribute("aria-expanded", false);
      document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
      removeTrapFocus(elementToFocus);
      this.closeAnimation(this.mainDetailsToggle);
    }
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute("open") && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest("details");
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    detailsElement.classList.remove("menu-opening");
    removeTrapFocus();
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute("open");
        if (detailsElement.closest("details[open]")) {
          trapFocus(detailsElement.closest("details[open]"), detailsElement.querySelector("summary"));
        }
      }
    };

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define("menu-drawer", MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.getElementById("shopify-section-header");
    this.borderOffset = this.borderOffset || this.closest(".header-wrapper").classList.contains("header-wrapper--border-bottom") ? 1 : 0;
    document.documentElement.style.setProperty(
      "--header-bottom-position",
      `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`,
    );

    setTimeout(() => {
      this.mainDetailsToggle.classList.add("menu-opening");
    });

    summaryElement.setAttribute("aria-expanded", true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }
}

customElements.define("header-drawer", HeaderDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector("[id^=\"ModalClose-\"]").addEventListener("click", this.hide.bind(this));
    this.addEventListener("keyup", (event) => {
      if (event.code.toUpperCase() === "ESCAPE") this.hide();
    });
    if (this.classList.contains("media-modal")) {
      this.addEventListener("pointerup", (event) => {
        if (event.pointerType === "mouse" && !event.target.closest("deferred-media, product-model")) this.hide();
      });
    } else {
      this.addEventListener("click", (event) => {
        if (event.target.nodeName === "MODAL-DIALOG") this.hide();
      });
    }
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector(".template-popup");
    document.body.classList.add("overflow-hidden");
    this.setAttribute("open", "");
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector("[role=\"dialog\"]"));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove("overflow-hidden");
    this.removeAttribute("open");
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}

customElements.define("modal-dialog", ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector("button");

    if (!button) return;
    button.addEventListener("click", () => {
      const modal = document.querySelector(this.getAttribute("data-modal"));
      if (modal) modal.show(button);
    });
  }
}

customElements.define("modal-opener", ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector("[id^=\"Deferred-Poster-\"]");
    if (!poster) return;
    poster.addEventListener("click", this.loadContent.bind(this));
  }

  loadContent() {
    window.pauseAllMedia();
    if (!this.getAttribute("loaded")) {
      const content = document.createElement("div");
      content.appendChild(this.querySelector("template").content.firstElementChild.cloneNode(true));

      this.setAttribute("loaded", true);
      this.appendChild(content.querySelector("video, model-viewer, iframe")).focus();
    }
  }
}

customElements.define("deferred-media", DeferredMedia);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector("ul");
    this.sliderItems = this.querySelectorAll("li");
    this.pageCount = this.querySelector(".slider-counter--current");
    this.pageTotal = this.querySelector(".slider-counter--total");
    this.prevButton = this.querySelector("button[name=\"previous\"]");
    this.nextButton = this.querySelector("button[name=\"next\"]");
    this.productSlider = this.querySelector(".product-slider-box");

    if (!this.slider || !this.nextButton) return;

    const resizeObserver = new ResizeObserver((entries) => this.initPages());
    resizeObserver.observe(this.slider);

    this.slider.addEventListener("scroll", this.update.bind(this));
    this.prevButton.addEventListener("click", this.onButtonClick.bind(this));
    this.nextButton.addEventListener("click", this.onButtonClick.bind(this));
  }

  initPages() {
    const sliderItemsToShow = Array.from(this.sliderItems).filter((element) => element.clientWidth > 0);
    this.sliderLastItem = sliderItemsToShow[sliderItemsToShow.length - 1];
    if (sliderItemsToShow.length === 0) return;
    this.slidesPerPage = Math.floor(this.slider.clientWidth / sliderItemsToShow[0].clientWidth);
    if (this.productSlider) {
      this.totalPages = sliderItemsToShow.length - this.slidesPerPage + 4;
    } else {
      this.totalPages = sliderItemsToShow.length - this.slidesPerPage + 1;
    }
    this.update();
  }

  update() {
    if (!this.pageCount || !this.pageTotal) return;
    if (this.productSlider) {
      this.currentPage = Math.round(this.slider.scrollLeft / this.sliderLastItem.clientWidth) + 4;
    } else {
      this.currentPage = Math.round(this.slider.scrollLeft / this.sliderLastItem.clientWidth) + 1;
    }

    if (this.currentPage === 1) {
      this.prevButton.setAttribute("disabled", true);
    } else {
      this.prevButton.removeAttribute("disabled");
    }

    if (this.currentPage === this.totalPages) {
      this.nextButton.setAttribute("disabled", true);
    } else {
      this.nextButton.removeAttribute("disabled");
    }

    this.pageCount.textContent = this.currentPage;
    this.pageTotal.textContent = this.totalPages;
  }

  onButtonClick(event) {
    event.preventDefault();
    const slideScrollPosition =
      event.currentTarget.name === "next"
        ? this.slider.scrollLeft + this.sliderLastItem.clientWidth
        : this.slider.scrollLeft - this.sliderLastItem.clientWidth;
    this.slider.scrollTo({
      left: slideScrollPosition,
    });
  }
}

customElements.define("slider-component", SliderComponent);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("change", this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, "", false);
    this.updatePickupAvailability();
    this.removeErrorMessage();

    if (!this.currentVariant) {
      this.toggleAddButton(true, "", true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.renderProductInfo();
      this.updateVariantInput();
      this.updateCrossSell();
      // this.updateSingleCrosssell();
    }
  }

  updateSingleCrosssell() {
    const size = this.currentVariant.title.split("|")[0].trim();

    const isSingleSize = ["Twin", "Twin XL"].includes(size);

    const $2xFoamPillow = $(`addon-service[data-variant-id="44308529086602"]`);
    const $singleFoamPillow = $(`addon-service[data-variant-id="44308529053834"]`);

    const $2xProxyCoolingPillow = $(`addon-service[data-variant-id="44308528496778"]`);
    const $singleProxyCoolingPillow = $(`addon-service[data-variant-id="44308528464010"]`);

    if (isSingleSize) {
      $2xFoamPillow.hide();
      $2xProxyCoolingPillow.hide();

      $singleFoamPillow.show();
      $singleProxyCoolingPillow.show();

      const isFoamPillowChecked = $2xFoamPillow.find(".addon-checkbox__input").is(":checked");
      if (isFoamPillowChecked) {
        $2xFoamPillow.trigger("click");
      }

      const isCoolingPillowChecked = $2xProxyCoolingPillow.find(".addon-checkbox__input").is(":checked");
      if (isCoolingPillowChecked) {
        $2xProxyCoolingPillow.trigger("click");
      }
    } else {
      $2xFoamPillow.show();
      $2xProxyCoolingPillow.show();

      $singleFoamPillow.hide();
      $singleProxyCoolingPillow.hide();

      const isFoamPillowChecked = $singleFoamPillow.find(".addon-checkbox__input").is(":checked");
      if (isFoamPillowChecked) {
        $singleFoamPillow.trigger("click");
      }

      const isCoolingPillowChecked = $singleProxyCoolingPillow.find(".addon-checkbox__input").is(":checked");
      if (isCoolingPillowChecked) {
        $singleProxyCoolingPillow.trigger("click");
      }
    }
  }

  updateCrossSell() {
    const crossSellEngine = document.querySelector("cross-sell-engine");

    crossSellEngine.onVariantChange(this.currentVariant.id);
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll("select"), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option;
        })
        .includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;
    const newMedia = document.querySelector(`[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`);

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
    const hasJointProduct = document.querySelector("joint-product-engine");

    if (!this.currentVariant || this.dataset.updateUrl === "false" || hasJointProduct) return;
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
    const originalPrice = this.currentVariant.compare_at_price / 100,
      price = this.currentVariant.price / 100,
      totalSaved = Math.max(0, originalPrice - price),
      priceInCurrency = Currency.format(price, { maximumFractionDigits: price % 1 === 0 ? 0 : 2 }),
      originalPriceInCurrency = Currency.format(originalPrice, { maximumFractionDigits: originalPrice % 1 === 0 ? 0 : 2 });

    $("[data-sale-price]").text(priceInCurrency);
    if (totalSaved) $("[data-regular-price]").text(originalPriceInCurrency);

    const isAvail = !!this.currentVariant.available;

    const attrConfiguratorEl = $("#attribute-configurator");

    attrConfiguratorEl[isAvail ? "removeClass" : "addClass"]("attribute-configurator--unavailable");

    console.log(this.currentVariant);

    const $qtySelector = $("[data-quantity-selector]");

    $qtySelector[isAvail ? "removeClass" : "addClass"]("opacity-0\t");

    $("[data-quantity-selector-input]").val(1);

    this.toggleAddButton(!isAvail, window.variantStrings.soldOut);
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.querySelector(`.product-form-${this.dataset.section}`);

    if (!productForm) return;
    const addButton = productForm.querySelector("button[name=\"add\"]");

    if (!addButton) return;

    const addButtonText = addButton.querySelector("[data-add-to-cart-text]");

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

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector("[type=\"application/json\"]").textContent);
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

/*bundle variant-select*/
class BundleVariantSelects extends VariantSelects {
  constructor() {
    super();
  }
}

customElements.define("bundle-variant-selects", BundleVariantSelects);

/*end of bundle varient*/

class YotpoReviewStarsStandalone extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const $element = $(this);
    const starRatingObserver = new MutationObserver(() => {
      starRatingObserver.disconnect();

      $element.find(".yotpo-bottomline .yotpo-clr").remove();

      const $reviewSource = $element.find(".yotpo-bottomline .text-m");
      $reviewSource.addClass("yotpo-review-source").removeClass("text-m").html("");

      const $starsContainer = $element.find(".yotpo-bottomline .yotpo-stars");
      const $scoreEl = $starsContainer.find(".sr-only");
      $scoreEl.removeClass("sr-only").addClass("yotpo-rating-score").text(parseFloat($scoreEl.text())).detach().insertAfter($starsContainer);

      $element.find(".yotpo-stars .yotpo-icon-star").replaceWith(`
        <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.103 4.36677C12.6146 4.36677 13.0492 4.6798 13.2104 5.1643C13.3711 5.64738 13.211 6.15694 12.8026 6.46198L10.4151 8.24502L11.2058 11.1976C11.3391 11.6966 11.1437 12.199 10.7085 12.4776C10.271 12.7579 9.73151 12.7231 9.33217 12.3927L7.18683 10.612C7.07859 10.522 6.92108 10.522 6.81228 10.612L4.66779 12.3927C4.44875 12.5744 4.18757 12.6662 3.9241 12.6662C3.70677 12.6662 3.48831 12.6041 3.29063 12.477C2.85569 12.1985 2.66087 11.696 2.79445 11.1976L3.58457 8.24502L1.19769 6.46227C0.789246 6.15636 0.629168 5.64708 0.790098 5.16373C0.951028 4.67951 1.38568 4.36677 1.89695 4.36677H4.66323C4.78656 4.36677 4.89707 4.2893 4.93837 4.17423L5.90139 1.47973C6.06887 1.01033 6.5001 0.706985 6.99998 0.706985C7.49957 0.706985 7.9308 1.01033 8.09828 1.48001L9.06215 4.17451C9.10316 4.28959 9.21368 4.36677 9.33672 4.36677H12.103Z" fill="#FFBA00"/>
        </svg>
      `);

      $element.find(".yotpo-stars .yotpo-icon-half-star").replaceWith(`
        <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.8471 3.93846C12.3799 3.93846 12.8326 4.27533 13.0005 4.79672C13.1678 5.31658 13.0011 5.86494 12.5757 6.19322L10.0891 8.11203L10.9126 11.2894C11.0515 11.8264 10.8479 12.3671 10.3946 12.6669C9.93897 12.9685 9.37709 12.9311 8.96117 12.5756L6.72671 10.6592C6.72671 11.0234 6.5 0 6.72671 0.0158723C7.17838 0.0747844 7.51955 0.378499 7.67603 0.83189L8.67993 3.73156C8.72265 3.8554 8.83775 3.93846 8.96591 3.93846H11.8471Z" fill="#CDCDCD"/>
          <path d="M5.38787 0.831589C5.55752 0.340325 6.21198 0.0332128 6.72671 0.0158723V10.6592C6.72671 10.6592 6.44993 10.5623 6.3366 10.6592L4.10303 12.5756C3.8749 12.7711 3.60286 12.8698 3.32845 12.8698C3.10209 12.8698 2.87456 12.803 2.66867 12.6663C2.21566 12.3665 2.01275 11.8258 2.15188 11.2894L2.97482 8.11203L0.488791 6.19352C0.0633806 5.86432 -0.103347 5.31627 0.0642677 4.7961C0.231883 4.27502 0.684591 3.93846 1.2171 3.93846H4.09828C4.22674 3.93846 4.34184 3.85509 4.38486 3.73126L5.38787 0.831589Z" fill="#FFBA00"/>
        </svg>
      `);
    });

    $(document).ready(async () => {
      starRatingObserver.observe(this.querySelector(".yotpo.bottomLine"), {
        childList: true,
        subtree: true,
      });
    });
  }
}

customElements.define("yotpo-review-stars-standalone", YotpoReviewStarsStandalone);

function calculateCountdownTime(endTime) {
  const endDate = new Date(endTime).getTime();
  const currentTime = new Date().getTime();
  const timeRemaining = endDate - currentTime;

  return {
    days: Math.floor(timeRemaining / 1000 / 60 / 60 / 24),
    hours: Math.floor(timeRemaining / 1000 / 60 / 60) % 24,
    minutes: Math.floor(timeRemaining / 1000 / 60) % 60,
    seconds: Math.floor(timeRemaining / 1000) % 60,
  };
}

class Countdown {
  constructor(expiredDate, onRender, onComplete) {
    this.setExpiredDate(expiredDate);

    this.onRender = onRender;
    this.onComplete = onComplete;
  }

  setExpiredDate(expiredDate) {
    const currentTime = new Date().getTime();

    this.timeRemaining = expiredDate - currentTime;

    this.timeRemaining > 0 ? this.start() : this.complete();
  }

  complete() {
    if (typeof this.onComplete === "function") {
      this.onComplete();
    }
  }

  start() {
    this.update();

    const intervalId = setInterval(() => {
      this.timeRemaining -= 1000;
      if (this.timeRemaining < 0) {
        this.complete();
        clearInterval(intervalId);
      } else {
        this.update();
      }
    }, 1000);
  }

  getTime() {
    return {
      days: Math.floor(this.timeRemaining / 1000 / 60 / 60 / 24),
      hours: Math.floor(this.timeRemaining / 1000 / 60 / 60) % 24,
      minutes: Math.floor(this.timeRemaining / 1000 / 60) % 60,
      seconds: Math.floor(this.timeRemaining / 1000) % 60,
    };
  }

  update() {
    if (typeof this.onRender === "function") {
      this.onRender(this.getTime());
    }
  }
}

class HeroBannerCountdownTimer extends HTMLElement {
  constructor() {
    super();
    this.digitElements = Array.from(this.querySelectorAll(".digit"));
    this.startTime = Date.now();
    this.endTime = null;
  }

  connectedCallback() {
    this.endTime = new Date(this.getAttribute("end-time").replace(" ", "T"));
    this.startTimer();
  }

  disconnectedCallback() {
  }

  setValues(values) {
    if (values.length !== this.digitElements.length) {
      console.error("Invalid values provided.");
      return;
    }

    values.forEach((value, index) => {
      this.digitElements[index].textContent = value;
    });
  }

  getTimeParts(delta) {
    const days = Math.floor(delta / 86400);
    delta -= days * 86400;

    const hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    const minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    const seconds = Math.floor(delta % 60); // in theory the modulus is not required

    return [days, hours, minutes, seconds];
  }

  renderTimer(delta) {
    const timeParts = this.getTimeParts(delta);
    this.setValues(timeParts);
  }

  startTimer() {
    const intervalId = setInterval(() => {
      const delta = (this.endTime - Date.now()) / 1000;
      if (delta >= 0) {
        this.renderTimer(delta);
      } else {
        this.classList.add("hidden");

        clearInterval(intervalId);
      }
    }, 1000);
  }
}

customElements.define("hero-banner-countdown-timer", HeroBannerCountdownTimer);
