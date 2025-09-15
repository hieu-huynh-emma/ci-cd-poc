if (!customElements.get("quantity-input")) {

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

      if (event.target.name === "plus") {
        this.input.stepUp();
      } else {
        if (this.input.value <= 1) {
          return;
        }
        this.input.stepDown();
      }
      if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
    }
  }

  customElements.define("quantity-input", QuantityInput);
}
