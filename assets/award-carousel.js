
function renderAwardQuote(slide) {
  if (slide.isClone) return
  const awardNameEl = $(slide.slide).data('heading')
  const awardName = $($.parseHTML(awardNameEl)).text()
  $("#award-carousel-section .award-name").text(awardName)
}

$(document).ready(function () {
  const awardCarousel = new Splide('#award-carousel-section .splide', {
    gap: '1.6rem',
    type: 'loop',
    perMove: 1,
    perPage: 5,
    pagination: false,
    arrows: true,
    focus: 'center',
    breakpoints: {
      768: {
        perPage: 3,
        pagination: true,
        arrows: false
      }
    }
  })

  awardCarousel.on('active', renderAwardQuote);

  awardCarousel.mount();
})
