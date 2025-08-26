import { productLiquidMapper } from "./data-processor.js";

class ProductCard extends CustomElement {
  props = {
    productId: ""
  }

  constructor() {
    super()
  }
}

customElements.define('product-card', ProductCard);

class ProductStarRating extends CustomElement {
  props = {
    productId: ""
  }

  constructor() {
    super()
  }

  mounted() {
    super.mounted();

    this.getReview()
  }

  getReview() {
    const { productId } = this.props;
    const url = `https://api.yotpo.com/products/hEc3IC0lCXuQ15phwUS54IFWUkW2L7LAcNLTHkt6/${productId}/bottomline`;

    const options = {
      method: 'GET',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    };

    fetch(url, options)
      .then(res => res.json())
      .then(json => json.response.bottomline)
      .then(res => {
        if (res.average_score > 0) this.innerHTML = `<star-rating :id="${productId}" :count="${res.total_reviews}" :score="${res.average_score}">`
      })
      .catch(err => console.error('error:' + err));
  }
}

customElements.define('product-star-rating', ProductStarRating);
