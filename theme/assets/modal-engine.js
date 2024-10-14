if (!customElements.get("modal-engine")) {
  class ModalEngine extends CustomElement {
    outlets = new Map();
    modals = new Map();

    constructor() {
      super();
    }

    mounted() {
      super.mounted();

      const $sliderDrawer = $(`<slider-drawer></slider-drawer>`);

      this.modals.set("slider-drawer", $sliderDrawer);

      this.$el.append($sliderDrawer);
    }

    register({ outletId, type = "slider-drawer", slots }) {
      this.outlets.set(outletId, {
        type,
        slots,
      });
    }

    open(outletId) {
      const outlet = this.outlets.get(outletId);

      if (!outlet) return;

      const { type, slots } = outlet;

      const $modal = this.modals.get(type);

      $modal.empty().append(slots);

      $modal.get(0).open();
    }
  }

  customElements.define("modal-engine", ModalEngine);

  class SliderDrawer extends HTMLElement {
    get refs() {
      return {
        $modal: this.$shEl.find("aside#Modal"),
        $frame: this.$shEl.find("#Modal-Frame"),
        $backdrop: this.$shEl.find("#Modal-Backdrop"),
        $title: this.$shEl.find("#Modal-Title"),
        $body: this.$shEl.find("#Modal-Body"),
        $closeIcon: this.$shEl.find("#Modal-CloseIcon"),
        $dismissBtn: this.$shEl.find("#Modal-DismissButton"),
      };
    }

    constructor() {
      super();

      this.attachShadow({ mode: "open" });

      const template = document.getElementById("modal-engine-tpl");

      this.shadowRoot.appendChild(template.content.cloneNode(true));

      this.$shEl = $(this.shadowRoot);

    }

    connectedCallback() {
      this.setAccessibility();
    }

    async open() {
      const { $backdrop, $frame, $modal } = this.refs;

      requestAnimationFrame(() => {
        $modal.addClass("active");

        $backdrop.addClass("active");

        $frame.addClass("animate");
      });

      await waitForAnimation($modal.get(0));

      requestAnimationFrame(() => {
        $frame.removeClass("animate");

        document.body.classList.add("no-scroll");
      });
    }

    setAccessibility() {
      const { $backdrop, $closeIcon, $dismissBtn } = this.refs;

      $($closeIcon).add($dismissBtn).add($backdrop).click((e) => {
        e.preventDefault();
        this.close();
      });
    }

    async close() {
      const { $frame, $backdrop, $modal } = this.refs;
      requestAnimationFrame(() => {
        $frame.addClass("animate animate--leave");
        $backdrop.removeClass("active");
      });

      await waitForAnimation($modal.get(0));

      requestAnimationFrame(() => {
        $modal.removeClass("active");
        $frame.removeClass("animate animate--leave");
        document.body.classList.remove("no-scroll");
      });
    }
  }

  customElements.define("slider-drawer", SliderDrawer);

  class ModalOutlet extends CustomElement {
    outletId;

    get refs() {
      return {
        modalEngine: document.querySelector("modal-engine"),
      };
    }

    constructor() {
      super();

      this.attachShadow({ mode: "open" });

      const template = document.getElementById("modal-outlet-tpl");

      this.shadowRoot.appendChild(template.content.cloneNode(true));

      this.$shEl = $(this.shadowRoot);
    }

    mounted() {
      super.mounted();

      this.outletId = generateUUID();

      this.prepare();

      this.setAccessibility();
    }

    setAccessibility() {
      this.$shEl.find(`slot[name="trigger"]`).click(this.trigger.bind(this));
    }

    prepare() {
      const { modalEngine } = this.refs;

      const slots = this.$el.find(`[slot]`).filter(`[slot!="trigger"]`);

      modalEngine.register({
        outletId: this.outletId,
        slots,
      });
    }


    trigger() {
      const { modalEngine } = this.refs;

      modalEngine.open(this.outletId);
    }
  }

  customElements.define("modal-outlet", ModalOutlet);

}
