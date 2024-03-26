const schema = [
  {
    sectionId: "product-summary",
    eager: true,
  },
  {
    sectionId: "product-badges",
  },
  {
    sectionId: "product-media",
  },
  {
    sectionId: "product-unique-selling-points",
  },
  {
    sectionId: "product-specifications",
  },
  {
    sectionId: "product-auxiliary",
    blocks: [
      {
        query: "#cross-selling-section",
        outletQuery: "#attribute-configurator",
        insertPosition: "afterend",
      },
      {
        query: `product-auxiliary[name="upsell-widget"]`,
        outletQuery: "#attribute-configurator",
        insertPosition: "afterend",
      }
    ],
  },
];
const sectionId = document.currentScript.dataset["sectionId"];
const templateId = sectionId.split("__")[0];

schema.forEach(processSectionSchema);

setTimeout(() => {
  const productLayoutEl = document.querySelector('#product-layout')

  productLayoutEl.classList.add("is-initialized")
}, 500)

function processSectionSchema({ eager = false, ...data }) {
  if (eager) {
    loadSection(data);
  } else {
    window.addEventListener("load", () => loadSection(data));
  }
}

function loadSection({ sectionId, blocks = [] }) {
  const sectionEl = document.querySelector(`#shopify-section-${templateId}__${sectionId}`);

  const sectionPlaceholderEl = document.querySelector(`#product-layout #${sectionId}-placeholder`);

  const detachedSectionEl = sectionEl.parentElement.removeChild(sectionEl);

  sectionPlaceholderEl.replaceWith(detachedSectionEl);

  if (blocks.length > 0) {
    blocks.forEach(({ query, insertPosition, outletQuery }) => {
      try {
        const blockEl = document.querySelector(query);
        const detachedBlockEl = blockEl.parentElement.removeChild(blockEl);
        const outletEl = document.querySelector(outletQuery);

        outletEl.insertAdjacentElement(insertPosition, detachedBlockEl);
      } catch (e) {
        console.error(e)
      }
    });
  }

  sectionEl.classList.remove("hidden");

  setTimeout(() => {
    sectionEl.classList.add("is-initialized")
  }, 500)

}
