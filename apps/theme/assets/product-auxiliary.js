class ProductAuxiliary extends CustomElement {
    props = {
        trackable: false,
        product: {},
        eventName: ""
    }

    constructor() {
        super();
        this.$el.click(this.onClick);
        this.intersectionOberser = new IntersectionObserver(this.onIntersect);

    }

    mounted() {
        super.mounted();
    }


    beforeMount() {
        const {trackable} = this.props
        if (trackable) {
            this.intersectionOberser.observe(this);
        }
    }

    onClick = () => {
        const {eventName, product, trackable} = this.props

        if (trackable) {
            window.dataLayer.push({
                'event': eventName + '_clicked',
                'product_name': product.title,
                'product_id': product.id,
                'quantity': 1,
                'variant_id': product.variants[0].id,
                'timestamp': new Date().toISOString()
            });
        }
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

customElements.define('product-auxiliary', ProductAuxiliary);

