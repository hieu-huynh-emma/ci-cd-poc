class CartCrossSell extends HTMLElement {


  get refs() {
    return {
      allAddButtons: this.querySelectorAll("button"),
      allVariantSelectors: this.querySelectorAll("variant-selector"),
    };
  }

  connectedCallback() {
    this.cartSurface = document.querySelector("cart-surface");
    const buttons = this.querySelectorAll("button");
      
    
    buttons.forEach(button => {
      button.addEventListener("click", async (e) => {
        button.setAttribute("aria-disabled", true);
        button.classList.add("loading");

        const loader = button.querySelector("loader-element");
         const btnChildren = button.querySelectorAll(".btn-child");
        if (loader) loader.hidden = false;
        btnChildren.forEach(el => {
        if (el instanceof SVGElement) {
        el.style.display = "none";
        } else {
        el.hidden = true;
        }
        });


        try {
          await this.onAddCrosssell(e);
        } finally {
          button.setAttribute("aria-disabled", false);
          button.classList.remove("loading");
          if (loader) loader.hidden = true;
           btnChildren.forEach(el => {
        if (el instanceof SVGElement) {
        el.style.display = "block";
        } else {
        el.hidden = false;
        }
        });
        }
      });
    });

    this.refs.allVariantSelectors.forEach(select => {
      select.addEventListener("change", () => this.refreshPrice(select));
      this.refreshPrice(select);
    });
  }

  refreshPrice(selectEl) {
    const selectedOption = selectEl.querySelector("option:checked");
    const pricingEl = selectEl.closest(".cross-sell-item")?.querySelector(".upsell-item__pricing");

    if (!selectedOption || !pricingEl) return;

    const price = Number(selectedOption.dataset.price);
    const originalPrice = Number(selectedOption.dataset.originalPrice);

    const priceInCurrency = Currency.format(price, {
      maximumFractionDigits: price % 1 === 0 ? 0 : 2,
    });

    const originalPriceInCurrency = Currency.format(originalPrice, {
      maximumFractionDigits: originalPrice % 1 === 0 ? 0 : 2,
    });

    pricingEl.innerHTML = `
      <div class="${originalPrice > price ? `text-[#DA1F00]` : ''} font-semibold text-sm">${priceInCurrency}</div>
      ${
        originalPrice > price
          ? `<div class="text-[#2E2F3C] line-through text-sm">${originalPriceInCurrency}</div>`
          : ""
      }
    `;
  }

  async onAddCrosssell(e) {
  
    e.stopPropagation();
    const upsellItem = e.target.closest(".cross-sell-item");
    if (!upsellItem) {
      console.error("Could not find necessary elements.");
      return;
    }
    const upsellVariantSelector = upsellItem.querySelector(".variant-selector select");
    if (upsellVariantSelector) {
    await window.Cart.add([{ id: upsellVariantSelector.value, quantity: 1 }]);
    } else {
    await window.Cart.addSingle(upsellItem.dataset.productId, 1 );
    }

    this.cartSurface?.classList.remove("is-empty");
  }
}

customElements.define("cart-cross-sell", CartCrossSell);
