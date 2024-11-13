class TrackedButton extends CustomButton {
    props = {
        trackId: null,
    };

    isHyperlink = false;

    $hyperlink;

    constructor() {
        super();
    }

    setup() {
        this.addEventListener("click", this.handleClick.bind(this));
    }

    render() {
        this.isHyperlink = this.hasAttribute("href");

        if (this.isHyperlink) {

            this.$el.addClass('cursor-pointer')

            this.renderHyperlink()
        }
    }

    renderHyperlink() {
        this.$hyperlink = $("<a></a>");

        [...this.attributes].forEach((attr) => {
            if (["download", "href", "hreflang", "media", "ping", "referrerpolicy", "rel", "target", "type"].includes(attr.name)) {
                this.$hyperlink.attr(attr.name, attr.value);
                this.removeAttribute(attr.name);
            }
        });

        this.$el.append(this.$hyperlink);

        this.$el.addClass("tracked-button--link")
    }

    handleClick(event) {
        // event.preventDefault();

        if (this.disabled || this.readOnly) {
            event.stopImmediatePropagation();
            return;
        }

        const {trackId} = this.props;

        if (trackId) {
            window.dataLayer.push({
                event: "click",
                click_type: trackId,
            });
        }

        this.onClick(event);
    }

    onClick(e) {
    }
}

customElements.define("tracked-button", TrackedButton);
