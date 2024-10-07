class Shoppable extends CustomElement {
  fancybox;

  get refs() {
    return {
      player: document.querySelector("shoppable-player"),
    };
  }

  constructor() {
    super();
    ResourceCoordinator.requestVendor("Fancybox");

  }

  async open(index = 0) {

    const { player } = this.refs;

    if (!player.initialized) {
      await player.initPlayer();
    }
    setTimeout(() => {
      player.go(index);
      // Do not change this number otherwise, the splide transition will buggy
    }, 500);

    await this.openFancybox();
  }

  async openFancybox() {
    await ResourceCoordinator.requestVendor("Fancybox");

    return new Promise((rs, rj) => {
      const { player } = this.refs;

      const sources = [{ src: player, type: "inline" }];
      const options = {
        mainClass: "shoppable-fancybox",
        Toolbar: {
          enabled: true,
          display: {
            left: ["close"],
            middle: [],
            right: ["sound"],
          },
          items: {
            sound: {
              tpl: `<button id="sound-button" class="f-button">
                <svg class="mute-icon ${!!player.muted ? "hidden" : ""}" width="24" height="24" viewBox="0 0 32 32" fill="none">
                    <path d="M7.81818 10H2V22H7.81818L17 29V3L7.81818 10Z" fill="white"></path>
                    <path d="M21.8642 15.3638C21.8642 13.7454 21.0183 12.3245 19.7446 11.5191C19.1424 11.1383 18.7963 10.3527 19.1446 9.73111C19.4028 9.27025 19.9605 9.05403 20.4304 9.29546C22.6312 10.4263 24.1369 12.7192 24.1369 15.3638C24.1369 18.0084 22.6312 20.3014 20.4304 21.4322C19.9605 21.6736 19.4028 21.4574 19.1446 20.9965C18.7963 20.375 19.1424 19.5893 19.7446 19.2085C21.0183 18.4031 21.8642 16.9822 21.8642 15.3638Z"
                          fill="white"></path>
                    <path d="M23.3875 8.37237C25.8645 9.72016 27.5457 12.3459 27.5457 15.3643C27.5457 18.3826 25.8645 21.0084 23.3875 22.3562C22.8014 22.6751 22.4991 23.3888 22.7871 23.9907C23.0394 24.518 23.6578 24.7694 24.18 24.5067C27.524 22.825 29.8184 19.3626 29.8184 15.3643C29.8184 11.366 27.524 7.90355 24.18 6.2218C23.6578 5.95916 23.0394 6.21054 22.7871 6.73783C22.4991 7.3397 22.8014 8.05347 23.3875 8.37237Z"
                          fill="white"></path>
                </svg>

                <svg class="unmute-icon ${!!player.muted ? "" : "hidden"}" width="24" height="24" viewBox="0 0 32 32" fill="none">
                    <path d="M2 10H7.81818L17 3V29L7.81818 22H2V10ZM8.49361 12L15 7.03968V24.9603L8.49361 20H4V12H8.49361Z"
                          fill="white"></path>
                    <path d="M20.8219 10.4325C20.4314 10.042 19.7982 10.042 19.4077 10.4325C19.0172 10.8231 19.0172 11.4562 19.4077 11.8468L23.643 16.0821L19.4077 20.3174C19.0172 20.708 19.0172 21.3411 19.4077 21.7316C19.7982 22.1222 20.4314 22.1222 20.8219 21.7316L25.0573 17.4963L29.2926 21.7316C29.6831 22.1222 30.3163 22.1222 30.7068 21.7316C31.0973 21.3411 31.0973 20.708 30.7068 20.3174L26.4715 16.0821L30.7068 11.8468C31.0973 11.4562 31.0973 10.8231 30.7068 10.4325C30.3163 10.042 29.6831 10.042 29.2926 10.4325L25.0573 14.6679L20.8219 10.4325Z"
                          fill="white"></path>
                </svg>
</button>`,
              click: () => {
                player.toggleMute();
              },
            },
          },
        },

        on: {
          ready: rs,
          error: rj,
          close: () => {
            player.close();
          },
        },
        dragToClose: false,
      };

      this.fancybox = new Fancybox(sources, options);
    });
  }

}

customElements.define("shoppable-manager", Shoppable);


class ShoppableCarousel extends CustomElement {
  constructor() {
    super();
  }


  async mounted() {
    super.mounted();
    await ResourceCoordinator.requestVendor("Splide");

    new Splide(this, {
      gap: ".5rem",
      padding: { right: 50 },
      perMove: 1,
      mediaQuery: "min",
      arrows: false,
      pagination: false,
      fixedWidth: 269,
      breakpoints: {
        640: {
          padding: false,
        },
        768: {
          gap: "1rem",
        },
      },
    }).mount();
  }
}

customElements.define("shoppable-carousel", ShoppableCarousel);

class ShoppableCard extends CustomElement {
  props = {
    index: 0,
  };

  get refs() {
    return {
      $shoppable: $("shoppable-manager"),
    };
  }

  constructor() {
    super();

    this.addEventListener("click", this.onClick.bind(this));


  }

  onClick() {
    const { $shoppable } = this.refs;
    const { index } = this.props;

    $shoppable.get(0).open(index);
  }
}

customElements.define("shoppable-card", ShoppableCard);
