$(document).ready(function () {
  const competitors = JSON.parse(document.querySelector("#Competitors-Data-JSON").textContent) || [];
  const elements = {
    heading$: $('#competitor-myth-busting-section .mythbusting__heading'),
    subheading$: $('#competitor-myth-busting-section .mythbusting__subheading'),
    splideList$: $('#competitor-myth-busting-section .splide__list'),
    mythbustingList$: $('#competitor-myth-busting-section .mythbusting-list')
  }

  renderHeading();
  renderMythBustingList();
  initSplide();


  function renderHeading() {
    const competitor = getComparisonCompetitor(competitors)
    elements.heading$.text(competitor.mythBusting.title)
    elements.subheading$.text(competitor.mythBusting.subtitle)
  }

  function renderMythBustingList() {
    const competitor = getComparisonCompetitor(competitors)
    for (const block of competitor.mythBusting.blocks) {
      const { heading, content, debunk } = block
      elements.splideList$.append(createMythBustingCard(heading, content, debunk, true))
      elements.mythbustingList$.append(createMythBustingCard(heading, content, debunk, false))
    }
  }

  function getCompetitor() {
    const params = new URLSearchParams(window.location.search)
    const competitorParam = params.get('competitor')
    if (!competitorParam) return

    const competitor = competitors.find(c => c.brandName === competitorParam)
    if (!competitor) return

    return competitor
  }

  function createMythBustingCard(title, content, footerContent, slideAble) {
    return `
      <li class="${slideAble ? 'splide__slide' : ''}">
        <div class="card">
          <p class="card__title">${title}</p>
          <p class="card__content">${content}</p>
          <div class="card__footer">
            <p class="card__footer-content">${footerContent}</p>
          </div>
        </div>
      </li>
    `
  }

  async function initSplide() {
    await ResourceCoordinator.requestVendor("Splide");

    new Splide('#competitor-myth-busting-section .splide', {
      perPage: 3,
      perMove: 1,
      gap: '40px',
      breakpoints: {
        768: { perPage: 1, gap: '20px' },
      },
    }).mount();
  }
})
