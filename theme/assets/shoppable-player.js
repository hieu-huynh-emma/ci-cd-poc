class ShoppablePlayer extends CustomElement {
	initialized = false;
	muted = false;

	activeVideo;

	carousel;
	thumbnails;

	constructor() {
		super();
	}

	initPlayer() {
		return new Promise(async (rs) => {
			await ResourceCoordinator.requestVendor("Splide");

			this.carousel = new Splide(this.querySelector(".video-container"), {
				mediaQuery: "min",
				pagination: false,
				arrows: false,
				rewind: true,
				rewindByDrag: true,
				waitForTransition: true,
				speed: 200,
				breakpoints: {
					769: {
						direction: "ttb",
						height: "100%",
					},
				},
			});

			this.thumbnails = new Splide(this.querySelector(".thumbnail-carousel"), {
				gap: 8,
				pagination: false,
				direction: "ttb",
				height: "100%",
				isNavigation: true,
				focus: "center",
				fixedHeight: 80,
				fixedWidth: 80,
				rewind: true,
				waitForTransition: true,
				speed: 200,
				breakpoints: {
					769: {
						destroy: true,
					},
				},
			});


			this.carousel.on("inactive", ({slide}) => {
				const shoppableVideo = slide.querySelector("shoppable-video");
				shoppableVideo.pause();
				const $playerInteraction = $(shoppableVideo).find(".player-interaction");

				if ($playerInteraction.length) {
					$playerInteraction.removeClass("player-interaction--transition");
				}
			});

			this.carousel.on("active", ({slide}) => {
				const shoppableVideo = slide.querySelector("shoppable-video");

				this.activeVideo = shoppableVideo;

				shoppableVideo.play();
				shoppableVideo.mute(this.muted);

				const $playerInteraction = $(shoppableVideo).find(".player-interaction");

				if ($playerInteraction.length) {
					$playerInteraction.addClass("player-interaction--transition");
				}
			});

			this.carousel.on("ready", () => {
				this.initialized = true;
				rs();
			})

			this.carousel.sync(this.thumbnails);

			this.carousel.mount();
			this.thumbnails.mount();
		});
	}

	go(index = 0) {
		this.carousel.go(index);
	}

	toggleMute = debounce(() => {
		this.mute(!this.muted);
	}, 10);

	mute(muted = false) {
		const $soundBtn = $("#sound-button"),
			$muteIcon = $soundBtn.find(".mute-icon"),
			$unmuteIcon = $soundBtn.find(".unmute-icon");

		this.muted = muted;

		if (muted) {
			$muteIcon.addClass("hidden");
			$unmuteIcon.removeClass("hidden");
		} else {
			$unmuteIcon.addClass("hidden");
			$muteIcon.removeClass("hidden");
		}

		this.activeVideo.mute(muted);
	}

	close() {
		this.activeVideo.pause();
	}
}

customElements.define("shoppable-player", ShoppablePlayer);


class ShoppableVideo extends CustomElement {
	video;

	get refs() {
		return {
			$shoppable: $("shoppable-manager"),
			container: this.querySelector('.player-container'),
			$playIcon: this.$el.find(".play-icon"),
			$soundButton: this.$el.find(".sound-button"),
			$playerButtons: this.$el.find(".player-buttons"),
		};
	}

	constructor() {
		super();

		this.addEventListener("click", this.onClick.bind(this));

	}

	onClick(e) {
		e.preventDefault();

		const {$shoppable, container} = this.refs

		if (!this.video) return;

		const isBackdropClick = !container.contains(e.target)

		isBackdropClick ? $shoppable.get(0).fancybox.close() : this.togglePlay()

	}

	beforeMount() {
		this.refs.$soundButton.click(this.onSoundButtonClicked);
	}

	toggle(playing = false) {
		playing ? this.play() : this.pause();
	}

	play() {
		this.video.play();
	}

	pause() {
		this.video.pause();
	}

	mute(muted = false) {
		this.video.muted = muted;
	}

	togglePlay = debounce((e) => {
		const {$playIcon} = this.refs;

		if (this.video.paused || this.video.ended) {
			this.video.play();
			$playIcon.addClass("hidden");

		} else {
			this.video.pause();
			$playIcon.removeClass("hidden");
		}
	}, 10);

	async mounted() {
		super.mounted();

		this.video = this.querySelector("video");
	}
}

customElements.define("shoppable-video", ShoppableVideo);
