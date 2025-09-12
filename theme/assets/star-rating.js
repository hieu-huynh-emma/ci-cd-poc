class StarRating extends CustomElement {
  props = {
    id: "#",
    score: 0,
    showScale: false,
    single: true,
    count: 0,
  }

  constructor() {
    super()
  }

  mounted() {
    super.mounted();
  }

  template() {
    super.template();

    const { score, showScale, single, count } = this.props;

    return `
          <div class="review-stars">
            ${single ? this.renderSingleStar() : this.renderAllStars()}
          </div>
          <p class="text-xs font-semibold text-comet">${score}${showScale ? " / 5.0" : ""}</p>
          ${!!count ? `<p class="text-xs text-comet">(${count} reviews)</p>` : ""}
        `
  }

  renderAllStars() {
    const { id, score } = this.props;
    const scoreSegments = Array.from({ length: 5 }, (_, i) => i === 4 ? +(score - 4).toFixed(1) : 1);

    return scoreSegments.map((segment, i) => {
      // const filledPercent = Math.round(segment * 100);
      // const id = `star-icon-bg-${id}-${i}`;

      return this.renderSingleStar()
    }).join("")
  }

  renderSingleStar() {
    return `
            <svg class="star-icon" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.332 5.01627C13.9167 5.01627 14.4134 5.37402 14.5976 5.92773C14.7812 6.47982 14.5983 7.06217 14.1315 7.4108L11.403 9.44856L12.3066 12.8229C12.459 13.3932 12.2357 13.9674 11.7383 14.2858C11.2383 14.6061 10.6217 14.5664 10.1654 14.1888L7.71353 12.1536C7.58983 12.0508 7.40982 12.0508 7.28547 12.1536L4.83462 14.1888C4.5843 14.3965 4.2858 14.5013 3.98469 14.5013C3.73632 14.5013 3.48664 14.4303 3.26073 14.2851C2.76366 13.9668 2.541 13.3926 2.69367 12.8229L3.59666 9.44856L0.868798 7.41112C0.402005 7.06152 0.219058 6.47948 0.402978 5.92708C0.586898 5.37369 1.08364 5.01627 1.66795 5.01627H4.82941C4.97037 5.01627 5.09666 4.92773 5.14387 4.79622L6.24445 1.7168C6.43586 1.18034 6.9287 0.833656 7.49998 0.833656C8.07095 0.833656 8.56378 1.18034 8.75519 1.71712L9.85675 4.79654C9.90362 4.92806 10.0299 5.01627 10.1706 5.01627H13.332Z" fill="currentColor"/>
            </svg>
        `
  }
}

customElements.define('star-rating', StarRating);

function getTotalReviews() {
  const url = `https://api.yotpo.com/products/hEc3IC0lCXuQ15phwUS54IFWUkW2L7LAcNLTHkt6/yotpo_site_reviews/bottomline`;
  const options = {
    method: 'GET',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  };

  fetch(url, options)
    .then(res => res.json())
    .then(json => json.response.bottomline)
    .then(renderShopStarRating)
    .catch(err => console.error('error:' + err));
}

function renderShopStarRating(res) {
  $("#hero-banner-section .total-review-count").text(res.total_reviews.toLocaleString())

  $("#hero-banner-section .shop-star-rating").removeClass("visually-hidden").prepend(`<star-rating :score="${res.average_score}" :showScale="true">`);
}

$(document).ready(function () {
  getTotalReviews()
})
