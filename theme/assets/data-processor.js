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

    const accentuateImg = metafields['featured_image'];

    const hasOnlyDefaultVariant = (variants?.nodes?.length ?? []) === 1;


    const featuredImage = accentuateImg ? `${JSON.parse(accentuateImg.value)[0].src}&transform=resize=720` : imgSource.src + `&width=720`;
    const displayName = metafields['display_name']?.value
    const trackPostfix = metafields['track_postfix']?.value
    const crossSellingProducts = JSON.parse(metafields['product_cross_selling']?.value ?? "[]")

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
        crossSellingProducts,
        ...rest,
    };

}

export const variantMapper = (variant) => {
    const {
        id: gid,
        price: {amount: price = 0},
        compareAtPrice,
        metafields = [],
        product,
        ...rest
    }
        = variant;

    const originalPrice = compareAtPrice?.amount ?? 0;

    const crossSellMetafield = metafields.filter(m => !!m).find(({
                                                                     namespace,
                                                                     key,
                                                                 } = {}) => namespace === "accentuate" && key === "product_cross_selling");


    return {
        id: extractIdFromGid(gid),
        price,
        originalPrice,
        gid,
        ...(crossSellMetafield ? {crossSellMetafield} : {}),
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

