class AddonService extends CustomElement {
    props = {
        product: {},
        eventName: "",
        parentProductSize: "",
        checkCompatible: false,
        checkSingle: false,
        variantId: 0
    }

    get refs() {
        return {
            $checkboxInput: this.$el.find('.addon-checkbox__input')
        }
    }

    constructor() {
        super();
        this.$el.click(this.onClick);
        this.intersectionOberser = new IntersectionObserver(this.onIntersect);

    }

    mounted() {
        super.mounted();

        const {checkCompatible, checkSingle} = this.props;

        if (checkCompatible) {
            this.checkCompatible();
        }
        if (checkSingle) {
            this.checkSingle()

        }
    }

    checkSingle() {
        const {parentProductSize, variantId} = this.props

        const isSingleSize = ['Twin', 'Twin XL'].includes(parentProductSize)

        if (isSingleSize && [44308529086602, 44308528496778].includes(variantId)) {
            this.$el.hide();
        }

        if (!isSingleSize && [44308529053834, 44308528464010].includes(variantId)) {
            this.$el.hide();
        }


        // const isSingle = product.variants.some(v => {
        //     const variantSize = v.title.split('|')[0].trim();
        //     console.log("=>(global.js:612) variantSize", variantSize);
        //     return variantSize === parentProductSize
        // })
        // console.log("=>(global.js:615) hasCompatibleSize", hasCompatibleSize);
        //
        //
        // if (!hasCompatibleSize) {

        // }
    }

    checkCompatible() {
        const {parentProductSize, product} = this.props

        const hasCompatibleSize = product.variants.some(v => {
            const variantSize = v.title.split('|')[0].trim();
            return variantSize === parentProductSize
        })

        if (!hasCompatibleSize) {
            this.$el.hide();
        }
    }

    beforeMount() {
        this.intersectionOberser.observe(this);
    }

    onClick = (e) => {
        e.preventDefault();
        const {eventName, product} = this.props
        const {$checkboxInput} = this.refs

        const serviceIncluded = $checkboxInput.is(':checked')

        if (!serviceIncluded) {
            $checkboxInput.prop("checked", true)
        } else {
            $checkboxInput.prop("checked", false)
        }

        window.dataLayer.push({
            'event': eventName + '_clicked',
            'product_name': product.title,
            'product_id': product.id,
            'quantity': 1,
            'variant_id': product.variants[0].id,
            'timestamp': new Date().toISOString()
        });
    }


    onIntersect = (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
            this.trackComponentView();
            this.intersectionOberser.unobserve(this);
        }
    }

    trackComponentView = () => {
        const {eventName, product} = this.props

        window.dataLayer.push({
            'event': eventName + "_viewed",
            'product_name': product.title,
            'product_id': product.id,
            'quantity': 1,
            'variant_id': product.variants[0].id,
            'timestamp': new Date().toISOString()
        });
    }
}

customElements.define('addon-service', AddonService);

