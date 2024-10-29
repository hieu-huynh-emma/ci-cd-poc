const schema = [
	{
		sectionId: "product-summary",
	},
	{
		sectionId: "product-badges",
	},
	{
		sectionId: "product-media",
	},
	{
		sectionId: "overlay-text-on-image",
	},
	{
		sectionId: "risk-reversal",
	},
	{
		sectionId: "campaign-teaser",
	},
	{
		sectionId: "product-unique-selling-points",
	},
	{
		sectionId: "product-specifications",
	},
	{
		sectionId: "bundle-box",
		outletQuery: "#attribute-configurator",
		insertPosition: "afterend",
	},
	{
		sectionId: "bundle-cross-sell",
		outletQuery: "#attribute-configurator",
		insertPosition: "afterend",
	},
	{
		sectionId: "product-auxiliary",
		blocks: [
			{
				query: "cross-sell-panel",
				outletQuery: "#attribute-configurator",
				insertPosition: "afterend",
			},
			{
				query: `product-auxiliary[name="upsell-widget"]`,
				outletQuery: "#attribute-configurator",
				insertPosition: "afterend",
			},
		],
	},
	{
		sectionId: "price-transparency",
		type: "clone",
		blocks: [
			{
				query: "[abtasty-campaign-id=\"1317071\"][abtasty-campaign-variation=\"0\"]",
				outletQuery: "product-price",
				insertPosition: "afterend",
			},
			{
				query: "[abtasty-campaign-id=\"1317071\"][abtasty-campaign-variation=\"1\"]",
				outletQuery: ".installment-widgets",
				insertPosition: "beforeend",
			},
		],
	},
];
const sectionId = document.currentScript.dataset["sectionId"];
const templateId = sectionId.split("__")[0];


function loadSection({sectionId, type, outletQuery, insertPosition, blocks = []}) {
	const sectionEl = document.querySelector(`#shopify-section-${templateId}__${sectionId}`);

	if (!sectionEl) return

	const processedEl = type === 'clone' ? sectionEl.cloneNode(true) : sectionEl.parentElement.removeChild(sectionEl);

	if (outletQuery) {
		const outletEl = document.querySelector(outletQuery)
		outletEl?.insertAdjacentElement(insertPosition, processedEl);
	} else {
		const sectionPlaceholderEl = document.querySelector(`#product-layout #${sectionId}-placeholder`);
		sectionPlaceholderEl?.replaceWith(processedEl);
	}

	if (blocks.length > 0) {
		blocks.forEach(({query, insertPosition, outletQuery}) => {
			try {
				const blockEl = sectionEl.querySelector(query);
				if (!blockEl) return;
				const detachedBlockEl = blockEl.parentElement.removeChild(blockEl);
				const outletEl = document.querySelector(outletQuery);

				outletEl.insertAdjacentElement(insertPosition, detachedBlockEl);
			} catch (e) {
				console.error(e);
			}
		});
	}

	sectionEl.classList.remove("hidden");

	setTimeout(() => {
		sectionEl.classList.add("is-initialized");
	}, 500);
}

document.addEventListener("DOMContentLoaded", () => {
	schema.forEach(loadSection);

	$("#product-layout .skeleton").hide();

	const productLayoutEl = document.querySelector("#product-layout");

	productLayoutEl.classList.add("is-initialized");


});
