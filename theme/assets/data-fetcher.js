import {metaobjectMapper, productMapper, variantMapper} from "data-processor";
import API from "storefront-api"

export const fetchMetaobjects = (metaobjectIds) => {
    return allFulfilled(metaobjectIds.map((id) => fetchMetaObject(id)))
}

export const fetchMetaObject = (gid) => {
    return API({
        method: "POST",
        data: JSON.stringify({
            query: `query getMetaObject($id: ID!) {
    metaobject(id: $id) {
        id
        type
        updatedAt
        handle
        fields {
            key
            value
            type
        }
        fields {
            key
            value
            type
        }
    }
}`,
            variables: {
                id: gid,
            },
        }),
    }).then((res) => metaobjectMapper(res.data.data.metaobject))
}

export const fetchVariant = (gid) => {
    return API({
        method: "POST",
        data: JSON.stringify({
            query: `query getVariantById($id: ID!) {
    node(id: $id) {
        ... on ProductVariant {
            id
            title
            quantityAvailable
            price {
                amount
            }
            compareAtPrice {
                amount
            }
            metafields(
                identifiers: [{ namespace: "accentuate", key: "product_cross_selling" }]
            ) {
                value
                id
                key
                namespace
            }
            product {
                id
                handle
                onlineStoreUrl
                title
                featuredImage {
                    id
                    src
                    width
                    height
                }
                availableForSale
                priceRange {
                    minVariantPrice {
                        amount
                    }
                    maxVariantPrice {
                        amount
                    }
                }
                compareAtPriceRange {
                    minVariantPrice {
                        amount
                    }
                    maxVariantPrice {
                        amount
                    }
                }
                variants(first: 10) {
                    nodes {
                        ... on ProductVariant {
                            id
                            title
                            quantityAvailable
                            price {
                                amount
                                currencyCode
                            }
                        }
                    }
                }
                metafields(
                    identifiers: [
                        { namespace: "accentuate", key: "featured_image" }
                        { namespace: "accentuate", key: "display_name" }
                        { namespace: "accentuate", key: "track_postfix" }
                    ]
                ) {
                    value
                    id
                    key
                    namespace
                }
            }
        }
    }
}
`,
            variables: {
                id: gid,
            },
        }),
    }).then((res) => variantMapper(res.data.data.node));
}

export const fetchProduct = (gid) => {
    return API({
        method: "POST",
        data: JSON.stringify({
            query: `query getProductById($id: ID!) {
    node(id: $id) {
        ... on Product {
            id
            title
            description
            featuredImage {
                id
                src
                width
                height
            }
            priceRange {
                minVariantPrice {
                    amount
                }
                maxVariantPrice {
                    amount
                }
            }
            compareAtPriceRange {
                minVariantPrice {
                    amount
                }
                maxVariantPrice {
                    amount
                }
            }
            variants(first: 10) {
                nodes {
                    id
                    title
                    quantityAvailable
                    price {
                        amount
                        currencyCode
                    }
                }
            }
            metafields(
                identifiers: [
                    { namespace: "accentuate", key: "product_cross_selling" }
                    { namespace: "accentuate", key: "featured_image" }
                    { namespace: "accentuate", key: "display_name" }
                    { namespace: "accentuate", key: "track_postfix" }
                ]
            ) {
                value
                id
                key
                namespace
            }
        }
    }
}
`,
            variables: {
                id: gid,
            },
        }),
    }).then((res) => productMapper(res.data.data.node));
}


export const allFulfilled = async (promisedArr) => {
    const results = await Promise.allSettled(promisedArr)

    return results.filter((x) => x.status === "fulfilled").map((x) => x.value)
}
