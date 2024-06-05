class TrackedButton extends CustomButton {
  props = {
    trackId: null,
  };

  constructor() {
    super();
  }

  setup() {
    this.addEventListener("click", this.handleClick.bind(this));
  }

  render() {
    const isHyperlink = this.hasAttribute("href");

    if (isHyperlink) {
      const hyperlinkEl = document.createElement("a");

      [...this.attributes].forEach((attr) => {
        if (["download", "href", "hreflang", "media", "ping", "referrerpolicy", "rel", "target", "type"].includes(attr.name)) {
          hyperlinkEl.setAttribute(attr.name, attr.value);
          this.removeAttribute(attr.name);
        }
      });

      this.appendChild(hyperlinkEl)
    }
  }

  handleClick(event) {
    // event.preventDefault();

    if (this.disabled || this.readOnly) {
      event.stopImmediatePropagation();
      return;
    }

    const { trackId } = this.props;

    if (trackId) {
      window.dataLayer.push({
        event: "click",
        click_type: trackId,
      });
    }

    this.onClick(event);
  }

  onClick(e) {}
}

customElements.define("tracked-button", TrackedButton);
