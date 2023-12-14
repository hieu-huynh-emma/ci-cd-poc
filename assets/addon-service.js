class AddonService extends CustomElement {
    props = {
        productId: "",
        variantId: ""
    }

    get refs() {
        const $serviceAddBtn = $("#removal-service-modal .service-package__add-btn")
        return {
            $checkboxInput: this.$el.find('.addon-checkbox__input'),
            $serviceAddBtn
        }
    }

    constructor() {
        super();

        this.setAccessibility()
    }


    mounted() {
        super.mounted();

        const {$checkboxInput} = this.refs


        this.$el.click((e => {
            e.preventDefault();
            const serviceIncluded = $checkboxInput.is(':checked')

            if (!serviceIncluded) {
                $("#removal-service-modal").modal({
                    fadeDuration: 100,
                    modalClass: "",
                    closeText: "x"
                })
            }
            else {
                $checkboxInput.prop("checked", false)
            }
        }));
    }

    close () {
        $.modal.close();
    }

    setAccessibility() {
        const {$checkboxInput, $serviceAddBtn} = this.refs

        $serviceAddBtn.click(() => {
            $checkboxInput.prop("checked", true)

            this.close()
        })
    }
}

customElements.define('addon-service', AddonService);
