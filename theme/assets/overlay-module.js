if (!customElements.get("overlay-container")) {

	class OverlayContainer extends CustomElement {
		outlets = new Map();
		modals = new Map();

		get refs() {
			return {
				frame: this.querySelector("overlay-frame"),
				backdrop: this.querySelector("overlay-backdrop"),
				component: this.querySelector("overlay-component")
			};
		}

		constructor() {
			super();
		}

		register({id, type = "modal", $slots}) {
			const tagName = `${type}-component`;

			const slots = $slots.toArray().reduce(function (r, slot, i) {
				const $slot = $(slot);
				const slotName = $slot.attr("slot");

				r[slotName] = $slot;
				return r;
			}, {});

			this.outlets.set(id, {
				type,
				slots,
				tagName,
			});
		}

		open(id) {
			const outlet = this.outlets.get(id);

			if (!outlet) return;

			const {frame, backdrop, component} = this.refs

			component.open(outlet)

			requestAnimationFrame(() => {
				this.$el.addClass("active");
				backdrop.open();
				frame.open(outlet.type);
			});
		}

		close() {
			const {frame, backdrop} = this.refs;

			requestAnimationFrame(async () => {
				backdrop.close();
				await frame.close();

				this.$el.removeClass("active");
			});
		}
	}

	class OverlayLayer extends ShadowElement {
		get refs() {
			return {
				container: document.querySelector("overlay-container")
			};
		}

		constructor() {super();}

		open() {
			this.$el.addClass("active");

			this.setAccessibility()
		}

		setAccessibility() {

		}

		close() {
			this.$el.removeClass("active");
		}
	}

	class OverlayBackdrop extends OverlayLayer {
		setup() {
			super.setup();

			this.addEventListener('click', (event) => {
				event.preventDefault();
				this.onClick(event);
			});

			this.$el.addClass("cursor-pointer")
		}

		onClick() {
			const {container} = this.refs
			container.close()
		}
	}

	class OverlayFrame extends OverlayLayer {
		async open(type) {
			this.$el.attr({type});

			this.animationClasses = `animate ${type === 'drawer' ? "slide" : "zoom"}`

			this.$el.addClass(this.animationClasses);
			super.open();
			await waitForAnimation(this);

			this.$el.removeClass(this.animationClasses);
		}

		async close() {
			this.$el.addClass(this.animationClasses + " animate--leave");
			await waitForAnimation(this);
			this.$el.removeClass(this.animationClasses + " animate--leave");

			super.close();
		}
	}

	class OverlayOutlet extends CustomElement {
		props = {
			type: "lightbox",
		};
		overlayId;

		get refs() {
			return {
				overlayContainer: document.querySelector("overlay-container"),
			};
		}

		constructor() {
			super();

			this.overlayId = generateUUID();

		}

		mounted() {
			super.mounted();

			this.prepare();
		}

		prepare() {
			const {overlayContainer} = this.refs;
			const {type} = this.props;

			const $slots = this.$el.find(`[slot]`).detach();

			overlayContainer.register({
				type,
				id: this.overlayId,
				$slots,
			});
		}
	}

	class OverlayTrigger extends CustomButton {
		get refs() {
			return {
				overlayContainer: document.querySelector("overlay-container"),
				outlet: this.closest("overlay-outlet"),
			};
		}

		constructor() {
			super();
		}

		onClick(e) {
			super.onClick(e);

			const {overlayContainer, outlet} = this.refs;

			const overlayId = outlet.overlayId;

			overlayContainer.open(overlayId);
		}
	}

	class OverlayComponent extends OverlayLayer {
		template = document.querySelector("#overlay-component-tpl");

		get refs() {
			return {
				...super.refs,
				$title: this.$el.find("#Modal-Title"),
				$body: this.$el.find("#Modal-Body")
			};
		}

		open(outletObj) {
			if (!outletObj) return;

			const {slots, type} = outletObj;
			this.slots = slots;

			this.$el.attr({type})

			this.render();

			super.open()
		}

		close() {
			super.close();

			this.$el.empty()
		}

		setAccessibility() {
			const {container} = this.refs;

			this.$el.find("#Modal-CloseIcon, #Modal-DismissButton, .Modal-DismissButton").click((e) => {
				e.preventDefault();
				container.close();
			});
		}
	}


	customElements.define("overlay-container", OverlayContainer);
	customElements.define("overlay-outlet", OverlayOutlet);
	customElements.define("overlay-frame", OverlayFrame);
	customElements.define("overlay-trigger", OverlayTrigger);
	customElements.define("overlay-backdrop", OverlayBackdrop);
	customElements.define("overlay-component", OverlayComponent);

}
