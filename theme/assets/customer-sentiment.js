$("#customer-sentiment-section").ready(async function () {
  await ResourceCoordinator.requestVendor('Splide');

  new Splide('#customer-sentiment-section .splide', {
    autoWidth: true,
    padding: { right: '5rem' },
    perPage: 4,
    perMove: 1,
    gap: '20px',
    pagination: false,
    breakpoints: {
      768: {
        perPage: 1,
        arrows: false,
        pagination: true,
        gap: '8px',
      }
    }
  }).mount();
})

class CustomerReviewCard extends CustomElement {
  maxLines = 12
  clamped = false

  props = {
    clampable: true
  }

  get refs() {
    return {
      $content: this.$el.find(".customer-review__content")
    }
  }

  constructor() {
    super();

    this.observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry?.contentRect?.height) return

      this.onTextReady(entry)
    })
  }

  async mounted() {
    super.mounted();

    const {clampable} = this.props;

    clampable && this.observer.observe(this.querySelector(".customer-review__content", {
      childList: true
    }))
  }

  onTextReady(entry) {
    const { contentRect: { height }, target } = entry

    const lines = this.countLines(target, height)

    if (lines > this.maxLines && !this.clamped) {
      this.clamp()
      this.clamped = true;
    }
  }

  countLines(el, height) {
    const lineHeight = parseFloat($(el).css('line-height'));

    return height / lineHeight;
  }

  clamp() {
    const { $content } = this.refs

    $content.addClass("line-clamp");

    const moreBtn = document.createElement("button");
    moreBtn.innerHTML = `Read More`;
    moreBtn.classList.add("read-more");

    $(moreBtn).click(() => {
      $("#customer-sentiment-section .customer-review__content").removeClass("line-clamp");
      $("#customer-sentiment-section button.read-more").remove()
    })

    $content.append(moreBtn);
  }
}


customElements.define('customer-review-card', CustomerReviewCard);
