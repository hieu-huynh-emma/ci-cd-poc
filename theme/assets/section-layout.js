if (!customElements.get("container-block")) {

    class StructureBlock extends Element {
        props = {
            settings: {},
            type: "skeleton", // skeleton | spinner
        };

        setup(props) {
            Object.entries(props.settings).forEach(([property, value]) => {
                if (property && value) {
                    this.style.setProperty(`--${property}`, value);
                }
            });
            const { spacing } = props.settings;

            this.$el.attr(":spacing", spacing || "base");

        }
    }

    class SectionContainer extends StructureBlock {
        setup(props) {
            super.setup(props);

            this.$el.addClass(`container-outer`);
        }

        template() {
            return `
               <div class="container-outer">
                   <div class="page-boundary">
                       ${this.innerHTML}
                    </div>
               </div>
            `;
        }
    }

    customElements.define("container-block", SectionContainer);


    class FrameBlock extends StructureBlock {
        setup(props) {
            super.setup(props);
        }
    }

    customElements.define("frame-block", FrameBlock);

    class ColumnBlock extends StructureBlock {
        setup(props) {
            super.setup(props);
        }
    }

    customElements.define("column-block", ColumnBlock);
}
