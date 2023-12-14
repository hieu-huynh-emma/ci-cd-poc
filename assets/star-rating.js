class StarRating extends CustomElement {
    props = {
        id: "#",
        score: 0,
        showScale: false
    }

    constructor() {
        super()
    }

    mounted() {
        super.mounted();
    }

    template() {
        super.template();

        const {score, showScale} = this.props;

        return `
          <div class="star-icons">
            ${this.renderStarIcons()}
          </div>
          <p class="average-score">${score}${showScale ? " / 5.0" : ""}</p>
        `
    }

    renderStarIcons() {
        const {id, score} = this.props;
        const scoreSegments = Array.from({length: 5}, (_, i) => i === 4 ? +(score - 4).toFixed(1) : 1);

        return scoreSegments.map((segment, i) => {
            const filledPercent = Math.round(segment * 100);

            return `
            <svg class="star-icon" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="star-icon-bg-${id}-${i}">
                  <stop offset="${filledPercent}%" stop-color="#FFBA00" />
                  <stop stop-color="#CDCDCD" />
                </linearGradient>
              </defs>
              <path
                  d="M12.103 4.36677C12.6146 4.36677 13.0492 4.6798 13.2104 5.1643C13.3711 5.64738 13.211 6.15694 12.8026 6.46198L10.4151 8.24502L11.2058 11.1976C11.3391 11.6966 11.1437 12.199 10.7085 12.4776C10.271 12.7579 9.73151 12.7231 9.33217 12.3927L7.18683 10.612C7.07859 10.522 6.92108 10.522 6.81228 10.612L4.66779 12.3927C4.44875 12.5744 4.18757 12.6662 3.9241 12.6662C3.70677 12.6662 3.48831 12.6041 3.29063 12.477C2.85569 12.1985 2.66087 11.696 2.79445 11.1976L3.58457 8.24502L1.19769 6.46227C0.789246 6.15636 0.629168 5.64708 0.790098 5.16373C0.951028 4.67951 1.38568 4.36677 1.89695 4.36677H4.66323C4.78656 4.36677 4.89707 4.2893 4.93837 4.17423L5.90139 1.47973C6.06887 1.01033 6.5001 0.706985 6.99998 0.706985C7.49957 0.706985 7.9308 1.01033 8.09828 1.48001L9.06215 4.17451C9.10316 4.28959 9.21368 4.36677 9.33672 4.36677H12.103Z"
                  fill="url(#star-icon-bg-${id}-${i})">
              </path>
            </svg>
        `
        }).join("")
    }
}

customElements.define('star-rating', StarRating);

function getTotalReviews() {
    const url = `https://api.yotpo.com/products/hEc3IC0lCXuQ15phwUS54IFWUkW2L7LAcNLTHkt6/yotpo_site_reviews/bottomline`;
    const options = {
        method: 'GET',
        headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
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
