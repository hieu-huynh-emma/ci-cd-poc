class JointProductEngine extends HTMLElement {
	currentProductId = 0;

	get refs() {
		return {
			$pageSpinner: $('#page-spinner')
		};
	}

	constructor() {
		super();

		this.data = JSON.parse(document.querySelector('#joint-product-data').textContent);
	}

	connectedCallback() {
		$(document.body).addClass('no-scroll');
		this.initPage();
	}

	async initPage() {
		const { $pageSpinner } = this.refs;
		const docFragment = await this.fetchPDP(this.data.products[0]);

		this.renderPage(docFragment);

		// $pageSpinner.addClass('hidden')
		$('.joint-product-page').hide();
		$(document.body).removeClass('no-scroll');

		this.currentProductId = this.data.products[0].id;

		this.selectorWidgetToggle();
		this.refreshSelector();
		var api = new Yotpo.API(yotpo);
		api.refreshWidgets();
	}

	fetchPDP(product) {
		const pdpUrl = `/products/${product.handle}`;

		return fetch(pdpUrl)
			.then(response => response.text())
			.then(text =>
				new DOMParser()
					.parseFromString(text, 'text/html')
					.querySelector('#MainContent')
			);
	}

	selectorWidgetToggle(show = true) {
		const $jointProductSelector = $('joint-product-selector');
		const $jointProductEngine = $('joint-product-engine');
		const $productConfiguration = $('#attribute-configurator');

		$jointProductSelector.detach();

		if (show) {
			$jointProductSelector.insertBefore($productConfiguration);
			$jointProductSelector.removeClass('hidden');
		} else {
			$jointProductEngine.append($jointProductSelector);
			$jointProductSelector.addClass('hidden');
		}
	}

	refreshSelector() {
		const $joinProductOptions = $('.joint-product-option');
		const selectedClass = 'joint-product-option--selected';

		$joinProductOptions.removeClass(selectedClass);

		$joinProductOptions.filter(`[data-product-id='${this.currentProductId}']`).addClass(selectedClass);
	}

	renderPage(docFragment) {
		const $mainContent = $('#MainContent');
		$mainContent.append(docFragment.innerHTML);

		this.removeYotpoStarRatingBlock();
	}

	removeYotpoStarRatingBlock() {
		setTimeout(() => {
			const $yotpoStarRating = $('.yotpo.bottomLine');

			$yotpoStarRating.hide();
		}, 500);
	}
}

class JointProductSelector extends HTMLElement {
	get refs() {
		return {
			engine: document.querySelector('joint-product-engine'),
			$pageSpinner: $('#page-spinner')
		};
	}

	constructor() {
		super();
		this.data = JSON.parse(document.querySelector('#joint-product-data').textContent);
	}

	connectedCallback() {
		const $options = $('.joint-product-option');

		$options.click($.debounce(100, this.handleOnClick));
	}

	handleOnClick = async (e) => {
		const $option = $(e.currentTarget);

		const productId = $option.data('productId');

		await this.updatePage(productId);
	};

	async updatePage(productId) {
		const { engine, $pageSpinner } = this.refs;

		if (productId === engine.currentProductId) return;
		$('.joint-product-page').show();
		$(document.body).addClass('no-scroll');

		const selectedProduct = this.data.products.find(({ id: targetId }) => targetId === productId);

		const pageHtml = await engine.fetchPDP(selectedProduct);
		engine.selectorWidgetToggle(false);
		await this.refreshSections(pageHtml);

		setTimeout(() => {
			engine.removeYotpoStarRatingBlock();
		}, 100);

		setTimeout(() => {
			engine.currentProductId = productId;
			engine.selectorWidgetToggle(true);
			engine.refreshSelector();

			$('.joint-product-page').hide();
			$(document.body).removeClass('no-scroll');

			// var api = new Yotpo.API(yotpo);
			// api.refreshWidgets();
		}, 500);

	}

	refreshSections(html) {
		return Promise.all(this.getSectionsToRender().map((sectionId => {
			return new Promise(resolve => {
				const elementId = `[id$='__${sectionId}']`;

				const $elementToReplace = $(elementId);

				$elementToReplace.empty();

				$elementToReplace.html(html.querySelector(elementId).innerHTML).ready(resolve);
			});
		})));
	}

	getSectionsToRender() {
		return ['product-info', 'mattress-layers', 'mattress-firmness'];
	}

}

class JointProductStarRating extends CustomElement {
	props = {
		productId: '',
		placeholder: 0
	};

	constructor() {
		super();

		this.innerHTML = `
                <div class="yotpo-stars">
                <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.103 4.36677C12.6146 4.36677 13.0492 4.6798 13.2104 5.1643C13.3711 5.64738 13.211 6.15694 12.8026 6.46198L10.4151 8.24502L11.2058 11.1976C11.3391 11.6966 11.1437 12.199 10.7085 12.4776C10.271 12.7579 9.73151 12.7231 9.33217 12.3927L7.18683 10.612C7.07859 10.522 6.92108 10.522 6.81228 10.612L4.66779 12.3927C4.44875 12.5744 4.18757 12.6662 3.9241 12.6662C3.70677 12.6662 3.48831 12.6041 3.29063 12.477C2.85569 12.1985 2.66087 11.696 2.79445 11.1976L3.58457 8.24502L1.19769 6.46227C0.789246 6.15636 0.629168 5.64708 0.790098 5.16373C0.951028 4.67951 1.38568 4.36677 1.89695 4.36677H4.66323C4.78656 4.36677 4.89707 4.2893 4.93837 4.17423L5.90139 1.47973C6.06887 1.01033 6.5001 0.706985 6.99998 0.706985C7.49957 0.706985 7.9308 1.01033 8.09828 1.48001L9.06215 4.17451C9.10316 4.28959 9.21368 4.36677 9.33672 4.36677H12.103Z" fill="#FFBA00"/>
                              </svg>
                               <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.103 4.36677C12.6146 4.36677 13.0492 4.6798 13.2104 5.1643C13.3711 5.64738 13.211 6.15694 12.8026 6.46198L10.4151 8.24502L11.2058 11.1976C11.3391 11.6966 11.1437 12.199 10.7085 12.4776C10.271 12.7579 9.73151 12.7231 9.33217 12.3927L7.18683 10.612C7.07859 10.522 6.92108 10.522 6.81228 10.612L4.66779 12.3927C4.44875 12.5744 4.18757 12.6662 3.9241 12.6662C3.70677 12.6662 3.48831 12.6041 3.29063 12.477C2.85569 12.1985 2.66087 11.696 2.79445 11.1976L3.58457 8.24502L1.19769 6.46227C0.789246 6.15636 0.629168 5.64708 0.790098 5.16373C0.951028 4.67951 1.38568 4.36677 1.89695 4.36677H4.66323C4.78656 4.36677 4.89707 4.2893 4.93837 4.17423L5.90139 1.47973C6.06887 1.01033 6.5001 0.706985 6.99998 0.706985C7.49957 0.706985 7.9308 1.01033 8.09828 1.48001L9.06215 4.17451C9.10316 4.28959 9.21368 4.36677 9.33672 4.36677H12.103Z" fill="#FFBA00"/>
                              </svg>
                               <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.103 4.36677C12.6146 4.36677 13.0492 4.6798 13.2104 5.1643C13.3711 5.64738 13.211 6.15694 12.8026 6.46198L10.4151 8.24502L11.2058 11.1976C11.3391 11.6966 11.1437 12.199 10.7085 12.4776C10.271 12.7579 9.73151 12.7231 9.33217 12.3927L7.18683 10.612C7.07859 10.522 6.92108 10.522 6.81228 10.612L4.66779 12.3927C4.44875 12.5744 4.18757 12.6662 3.9241 12.6662C3.70677 12.6662 3.48831 12.6041 3.29063 12.477C2.85569 12.1985 2.66087 11.696 2.79445 11.1976L3.58457 8.24502L1.19769 6.46227C0.789246 6.15636 0.629168 5.64708 0.790098 5.16373C0.951028 4.67951 1.38568 4.36677 1.89695 4.36677H4.66323C4.78656 4.36677 4.89707 4.2893 4.93837 4.17423L5.90139 1.47973C6.06887 1.01033 6.5001 0.706985 6.99998 0.706985C7.49957 0.706985 7.9308 1.01033 8.09828 1.48001L9.06215 4.17451C9.10316 4.28959 9.21368 4.36677 9.33672 4.36677H12.103Z" fill="#FFBA00"/>
                              </svg>
                               <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.103 4.36677C12.6146 4.36677 13.0492 4.6798 13.2104 5.1643C13.3711 5.64738 13.211 6.15694 12.8026 6.46198L10.4151 8.24502L11.2058 11.1976C11.3391 11.6966 11.1437 12.199 10.7085 12.4776C10.271 12.7579 9.73151 12.7231 9.33217 12.3927L7.18683 10.612C7.07859 10.522 6.92108 10.522 6.81228 10.612L4.66779 12.3927C4.44875 12.5744 4.18757 12.6662 3.9241 12.6662C3.70677 12.6662 3.48831 12.6041 3.29063 12.477C2.85569 12.1985 2.66087 11.696 2.79445 11.1976L3.58457 8.24502L1.19769 6.46227C0.789246 6.15636 0.629168 5.64708 0.790098 5.16373C0.951028 4.67951 1.38568 4.36677 1.89695 4.36677H4.66323C4.78656 4.36677 4.89707 4.2893 4.93837 4.17423L5.90139 1.47973C6.06887 1.01033 6.5001 0.706985 6.99998 0.706985C7.49957 0.706985 7.9308 1.01033 8.09828 1.48001L9.06215 4.17451C9.10316 4.28959 9.21368 4.36677 9.33672 4.36677H12.103Z" fill="#FFBA00"/>
                              </svg>
                               <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.103 4.36677C12.6146 4.36677 13.0492 4.6798 13.2104 5.1643C13.3711 5.64738 13.211 6.15694 12.8026 6.46198L10.4151 8.24502L11.2058 11.1976C11.3391 11.6966 11.1437 12.199 10.7085 12.4776C10.271 12.7579 9.73151 12.7231 9.33217 12.3927L7.18683 10.612C7.07859 10.522 6.92108 10.522 6.81228 10.612L4.66779 12.3927C4.44875 12.5744 4.18757 12.6662 3.9241 12.6662C3.70677 12.6662 3.48831 12.6041 3.29063 12.477C2.85569 12.1985 2.66087 11.696 2.79445 11.1976L3.58457 8.24502L1.19769 6.46227C0.789246 6.15636 0.629168 5.64708 0.790098 5.16373C0.951028 4.67951 1.38568 4.36677 1.89695 4.36677H4.66323C4.78656 4.36677 4.89707 4.2893 4.93837 4.17423L5.90139 1.47973C6.06887 1.01033 6.5001 0.706985 6.99998 0.706985C7.49957 0.706985 7.9308 1.01033 8.09828 1.48001L9.06215 4.17451C9.10316 4.28959 9.21368 4.36677 9.33672 4.36677H12.103Z" fill="#FFBA00"/>
                              </svg>
                </div>
             <div class="yotpo-rating-score"></div>
        `;
	}

	mounted() {
		super.mounted();

		this.getReview();
	}

	getReview() {
		const { productId, placeholder } = this.props;
		const url = `https://api.yotpo.com/products/hEc3IC0lCXuQ15phwUS54IFWUkW2L7LAcNLTHkt6/${productId}/bottomline`;

		const options = {
			method: 'GET',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' }
		};

		const ratingScore = this.querySelector('.yotpo-rating-score');


		fetch(url, options)
			.then(res => res.json())
			.then(json => json.response.bottomline)
			.then(res => {
				ratingScore.innerHTML = res.average_score || placeholder;
			})
			.catch(err => {
				ratingScore.innerHTML = placeholder;
				console.error('error:' + err);
			});
	}
}

customElements.define('joint-product-star-rating', JointProductStarRating);

customElements.define('joint-product-engine', JointProductEngine);
customElements.define('joint-product-selector', JointProductSelector);
