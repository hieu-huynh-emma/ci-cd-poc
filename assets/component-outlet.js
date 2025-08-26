if (!customElements.get("component-outlet")) {
  customElements.define("component-outlet", class ComponentOutlet extends CustomElement {
    props = {
      sectionId: "",
    };

    constructor() {
      super();
    }

    mounted() {
      const { sectionId } = this.props;

      if (!sectionId) return;

      const sectionKey = sectionId.split("__")[1];

      const foundTpl = document.querySelector(`template#${sectionKey}-tpl`);

      if (!foundTpl) return;

      this.$el.html(foundTpl.innerHTML);
    }


  });
}
