export const productMapper = (product) => {
  const {
    featuredImage: imgSource,
    metafields: baseMetafields = [],
    variants: variantsEntry,
    priceRange: basePriceRange,
    compareAtPriceRange: baseOriginalPriceRange,
    ...rest
  } = product;

  const metafields = metafieldsMapper(baseMetafields);

  const accentuateImg = metafields["isolated_image"];

  const featuredImage = accentuateImg ? `${accentuateImg?.[0]?.src}&transform=resize=720` : imgSource.src + `&width=720`;
  const displayName = metafields["display_name"];
  const trackPostfix = metafields["track_postfix"];

  const priceRange = [+basePriceRange.minVariantPrice.amount, +basePriceRange.maxVariantPrice.amount];
  const originalPriceRange = [+baseOriginalPriceRange?.minVariantPrice.amount ?? 0, +baseOriginalPriceRange?.maxVariantPrice.amount ?? 0];

  const variants = (variantsEntry?.nodes ?? []).map(variantMapper);

  const availableVariants = variants.filter((node) => node.available);
  const firstAvailableVariant = availableVariants[0];
  const hasOnlyDefaultVariant = variants.length === 1;

  return {
    variants,
    availableVariants,
    firstAvailableVariant,
    featuredImage,
    displayName,
    trackPostfix,
    priceRange,
    originalPriceRange,
    hasOnlyDefaultVariant,
    metafields,
    ...rest,
  };
};

export const variantMapper = (variant) => {
  const {
    id: gid,
    price: { amount: price = 0 },
    compareAtPrice,
    metafields: baseMetafields = [],
    product,
    availableForSale,
    ...rest
  } = variant;

  const metafields = metafieldsMapper(baseMetafields);

  const originalPrice = compareAtPrice?.amount ?? price;
  const totalSaved = Math.max(0, originalPrice - price);

  return {
    id: extractIdFromGid(gid),
    available: availableForSale,
    price,
    originalPrice,
    totalSaved,
    gid,
    metafields,
    ...(product ? { product: productMapper(product) } : {}),
    ...rest,
  };
};

export const metafieldsMapper = (metafields) => {
  return metafields.reduce((r, node) => {
    if (!!node) {
      let value = node.value;

      switch (node.type) {
        case "list.metaobject_reference":
        case "json_string":
          value = JSON.parse(node.value ?? null);
          break;
      }

      r[node.key] = value;
    }

    return r;
  }, {});
};

export const metaobjectMapper = (metaobject) => {
  const { fields: baseFields, ...rest } = metaobject;

  const fields = baseFields.reduce((r, { key, value, type }) => {
    switch (type) {
      case "variant_reference":
        key = "variantId";
        break;
      case "product_reference":
        key = "productId";
        break;
    }

    r[key] = value;
    return r;
  }, {});

  return {
    ...fields,
    ...rest,
  };
};
