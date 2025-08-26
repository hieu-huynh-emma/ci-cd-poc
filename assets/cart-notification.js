class CartNotification extends HTMLElement {
  constructor() {
    super();

    this.notification = document.getElementById("cart-notification");
    this.header = document.querySelector("sticky-header");
    this.onBodyClick = this.handleBodyClick.bind(this);

    this.notification.addEventListener(
      "keyup",
      (evt) => evt.code === "Escape" && this.close()
    );
    this.querySelectorAll('button[type="button"]').forEach((closeButton) =>
      closeButton.addEventListener("click", this.close.bind(this))
    );
  }

  open() {
    this.notification.classList.add("animate", "active");

    this.notification.addEventListener(
      "transitionend",
      () => {
        this.notification.focus();
        trapFocus(this.notification);
      },
      { once: true }
    );

    document.body.addEventListener("click", this.onBodyClick);
  }

  close() {
    this.notification.classList.remove("active");

    document.body.removeEventListener("click", this.onBodyClick);

    removeTrapFocus(this.activeElement);
  }

  renderContents(parsedState) {
    $(`#cart-notification-product`).empty();

    if (parsedState.items) {
      parsedState.items.forEach((item) => {
        this.productId = item.id;
        this.renderProductLineItem(parsedState);
      });
    } else {
      this.productId = parsedState.id;
      this.renderProductLineItem(parsedState);
    }

    if (this.header) this.header.reveal();
    this.open();
  }

  renderProductLineItem(parsedState) {
    this.getSectionsToRender().forEach((section) => {
      section.id === "cart-notification-product"
        ? $(`#${section.id}`).append(
            `<div class="cart-notification-product">${this.getSectionInnerHTML(
              parsedState.sections[section.id],
              section.selector
            )}</div>`
          )
        : (document.getElementById(section.id).innerHTML =
            this.getSectionInnerHTML(
              parsedState.sections[section.id],
              section.selector
            ));
    });
  }

  getSectionsToRender() {
    return [
      {
        id: "cart-notification-product",
        selector: `#cart-notification-product-${this.productId}`,
      },
      {
        id: "cart-notification-button",
      }
    ];
  }

  getSectionInnerHTML(html, selector = ".shopify-section") {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
  }

  handleBodyClick(evt) {
    const target = evt.target;
    if (target !== this.notification && !target.closest("cart-notification")) {
      const disclosure = target.closest("details-disclosure");
      this.activeElement = disclosure
        ? disclosure.querySelector("summary")
        : null;
      this.close();
    }
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define("cart-notification", CartNotification);
