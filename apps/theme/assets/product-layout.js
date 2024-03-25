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
        blockId: "cross-selling-section",
        outlet: "#attribute-configurator",
        insertPosition: "afterend",
      },
    ],
  },
];
const sectionId = document.currentScript.dataset["sectionId"];
const templateId = sectionId.split("__")[0];

schema.forEach(processSectionSchema);

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

  sectionPlaceholderEl.appendChild(detachedSectionEl);

  if (blocks.length > 0) {
    blocks.forEach(({ blockId, insertPosition, outlet }) => {
      const blockEl = document.querySelector(`#${blockId}`);
      const detachedBlockEl = blockEl.parentElement.removeChild(blockEl);
      const outletEl = document.querySelector(`${outlet}`);

      outletEl.insertAdjacentElement(insertPosition, detachedBlockEl);
    });
  }

  sectionEl.classList.remove("hidden");
}
