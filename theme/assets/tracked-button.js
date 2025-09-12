class TrackedButton extends Button {
    props = {
        trackId: null,
    };

    onClick(e) {
        super.onClick(e);

        const { trackId } = this.props;

        if (trackId) {
            window.dataLayer.push({
                event: "click",
                click_type: trackId,
            });
        }
    }
}

customElements.define("tracked-button", TrackedButton);
