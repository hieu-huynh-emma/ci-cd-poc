if (!customElements.get("accordion-item")) {
    class AccordionItem extends Element {

        _providers = ["Beefup"];

        mounted() {
            super.mounted();

            this.$el.beefup({
                trigger: "accordion-label",
                content: "accordion-content",
                openSpeed: 500,
                closeSpeed: 250,
            });
        }
    }

    customElements.define("accordion-item", AccordionItem);
}
