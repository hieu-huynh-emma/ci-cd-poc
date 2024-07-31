class ModalEngine extends CustomElement {

  get refs() {
    return {
      $frame: this.$el.find("#Modal-Frame"),
      $backdrop: this.$el.find("#Modal-Backdrop"),
      $title: this.$el.find("#Modal-Title"),
      $body: this.$el.find("#Modal-Body"),
      $closeIcon: this.$el.find("#Modal-CloseIcon"),
      $dismissBtn: this.$el.find("#Modal-DismissButton"),
    };
  }

  constructor() {
    super();

    this.setAccessibility();
  }

  async open(config) {
    const { $frame, $backdrop } = this.refs;

    this.renderContent(config);

    requestAnimationFrame(() => {
      this.$el.addClass("active");
      $backdrop.addClass("active");

      $frame.addClass("animate");
    });

    await waitForAnimation(this);

    requestAnimationFrame(() => {
      $frame.removeClass("animate");

      document.body.classList.add("no-scroll");
    });
  }

  async close() {
    const { $frame, $backdrop } = this.refs;
    requestAnimationFrame(() => {
      $frame.addClass("animate animate--leave");
      $backdrop.removeClass("active")
    });

    await waitForAnimation(this);

    requestAnimationFrame(() => {
      this.$el.removeClass("active");
      $frame.removeClass("animate animate--leave");
      document.body.classList.remove("no-scroll");
    });

  }

  setAccessibility() {
    const { $backdrop, $closeIcon, $dismissBtn } = this.refs;

    $($closeIcon).add($dismissBtn).add($backdrop).click((e) => {
      e.preventDefault();
      this.close();
    });
  }

  renderContent({ title, template }) {
    const { $title, $body } = this.refs;

    $title.text(title);

    $body.html(template);
  }
}

customElements.define("modal-engine", ModalEngine);

class ModalTrigger extends CustomButton {
  props = {
    title: "",
  };

  get refs() {
    return {
      modalEngine: document.querySelector("modal-engine"),
    };
  }

  constructor() {
    super();

    this.setAccessibility();
  }

  setAccessibility() {
    const source = this.querySelector("template");

    if (!source) return;

    this.$el.click(this.prepareOpen.bind(this, source));
  }

  prepareOpen(source) {
    const { title } = this.props;
    const { modalEngine } = this.refs;

    const template = source.cloneNode(true);

    modalEngine.open({
      title,
      template: template.content,
    });

    setTimeout(() => {
      template.remove();
    });
  }

}

customElements.define("modal-trigger", ModalTrigger);
