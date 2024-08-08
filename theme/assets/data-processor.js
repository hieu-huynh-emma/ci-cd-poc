export const productMapper = (product) => {
    const {
        featuredImage: imgSource,
        metafields: baseMetafields = [],
        variants,
        priceRange: basePriceRange,
        compareAtPriceRange: baseOriginalPriceRange,
        ...rest
    } = product;

    const metafields = metafieldsMapper(baseMetafields)

    const accentuateImg = metafields['isolated_image'];

    const hasOnlyDefaultVariant = (variants?.nodes?.length ?? []) === 1;


    const featuredImage = accentuateImg ? `${JSON.parse(accentuateImg.value)[0].src}&transform=resize=720` : imgSource.src + `&width=720`;
    const displayName = metafields['display_name']?.value
    const trackPostfix = metafields['track_postfix']?.value
    const crossSellMetafield = JSON.parse(metafields['product_cross_selling']?.value ?? "[]")

    const priceRange = [+basePriceRange.minVariantPrice.amount, +basePriceRange.maxVariantPrice.amount]
    const originalPriceRange = [+baseOriginalPriceRange?.minVariantPrice.amount ?? 0, +baseOriginalPriceRange?.maxVariantPrice.amount ?? 0]

    return {
        featuredImage,
        variants: variants.nodes,
        displayName,
        trackPostfix,
        priceRange,
        originalPriceRange,
        hasOnlyDefaultVariant,
        crossSellMetafield,
        ...rest,
    };

}

export const variantMapper = (variant) => {
    const {
        id: gid,
        price: {amount: price = 0},
        compareAtPrice,
        metafields: baseMetafields = [],
        product,
        ...rest
    } = variant;

    const metafields = metafieldsMapper(baseMetafields)

    const originalPrice = compareAtPrice?.amount ?? price;
    const totalSaved = Math.max(0, originalPrice - price);

    const crossSellMetafield = JSON.parse(metafields['product_cross_selling']?.value ?? "[]")
    const optinBundleMetafield = JSON.parse(metafields['optin_bundle_item']?.value ?? "[]")


    return {
        id: extractIdFromGid(gid),
        price,
        originalPrice,
        totalSaved,
        gid,
        crossSellMetafield,
        optinBundleMetafield,
        ...(product ? {product: productMapper(product)} : {}),
        ...rest,
    };
}

export const metafieldsMapper = (metafields) => {
    return metafields.reduce((r, node) => {
        if (!!node) {
            r[node.key] = node
        }

        return r
    }, {})
}

export const metaobjectMapper = (metaobject) => {
    const {fields: baseFields, ...rest} = metaobject

    const fields = baseFields.reduce((r, {key, value, type}) => {
        if (type === "variant_reference") {
            key = "variantId"
        }

        r[key] = value
        return r
    }, {})

    return {
        ...fields,
        ...rest
    }
}

