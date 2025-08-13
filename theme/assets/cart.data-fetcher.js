import API from "./storefront-api.js";
import { cartLinesTransformer, CartMapper } from "./cart.data-processor.js";
import { onResponse } from "./data-fetcher.js";

const PRODUCT_VARIANT_FRAGMENT = `
    id
    title
    
    availableForSale
    compareAtPrice {
        amount
        currencyCode
    }
    price {
        amount
        currencyCode
    }
    image {
        id
        url
        width
        height
        altText
    }
`;

const DISCOUNT_ALLOCATION_FRAGMENT = `
    discountAllocations {
        ... on CartAutomaticDiscountAllocation {
                title
        }
         ... on CartCodeDiscountAllocation {
                code
        }
        discountApplication {
            allocationMethod
            targetSelection
            targetType  
            value {
                ... on MoneyV2 {
                    amount
                    currencyCode
                }
            }
        }
        discountedAmount {
            amount
            currencyCode
        }
        targetType      
    }
`;

const BASE_CART_LINE_FRAGMENT = `
    id
    quantity
    cost {
        amountPerQuantity {
            amount
            currencyCode
        }
        compareAtAmountPerQuantity {
            amount
            currencyCode
        }
        subtotalAmount {
            amount
            currencyCode
        }
        totalAmount {
            amount
            currencyCode
        }
    }
    
    merchandise {
        ... on ProductVariant {
                ${PRODUCT_VARIANT_FRAGMENT}
                product {
                    id
                    title
                    description
                    handle
                    onlineStoreUrl
                    vendor
                    productType
                    metafields(
                        identifiers: [
                            { namespace: "accentuate", key: "bundle_show_composite_message" },
                            { namespace: "accentuate", key: "optin_primary_mattress_name" },
                            { namespace: "accentuate", key: "bundle_quantity" }
                        ]
                    ) {
                        value
                        id
                        key
                        namespace
                        type
                    }
                }
                metafields(
                    identifiers: [
                        {
                            namespace: "custom",
                            key: "bundle_items"
                        },
                        {
                            namespace: "accentuate",
                            key: "optin_bundle_item"
                        },
                    ]
                ) {
                    value
                    id
                    key
                    namespace
                    type
                }
      
            }
    }
`
const CART_LINE_FRAGMENT = `
    ${BASE_CART_LINE_FRAGMENT}
    ${DISCOUNT_ALLOCATION_FRAGMENT}
    attributes {
        key
        value
    }
`;

const CART_FRAGMENT = `
    id
    totalQuantity
    lines(first: 10) {
        edges {
            node {
                ${CART_LINE_FRAGMENT}
                 ... on ComponentizableCartLine {
                     lineComponents {
                         ${CART_LINE_FRAGMENT} 
                    } 
                }
            }
        }
    }
    attributes {
        key
        value
    }
    cost {
        totalAmount {
            amount
            currencyCode
        }
        subtotalAmount {
            amount
            currencyCode
        }
        checkoutChargeAmount {
            amount
            currencyCode
        }
        subtotalAmountEstimated
        totalAmountEstimated
    }
    ${DISCOUNT_ALLOCATION_FRAGMENT}
    discountCodes {
        code
        applicable
    }
`;

const fetchCart = (gid) => {
    return API({
        method: "POST",
        data: JSON.stringify({
            query: `query retrieveCart($id: ID!) {
                        cart(id: $id) {
                            ${CART_FRAGMENT}
                        }
                    }`,
            variables: {
                id: gid,
            },
        }),
    }).then(onResponse).then((res) => CartMapper.fromDTO(res.cart));
};

const addToCart = (gid, items) => {
    const lines = cartLinesTransformer(items);

    return API({
        method: "POST",
        data: JSON.stringify({
            query: `mutation ($id: ID!, $lines: [CartLineInput!]!) {
                      cartLinesAdd(cartId: $id, lines: $lines) {
                        cart {
                          ${CART_FRAGMENT}
                        }
                        userErrors {
                          field
                          message
                          code
                        }
                        warnings {
                          target
                          message
                          code
                        }
                      }
                    }`,
            variables: {
                id: gid,
                lines,
            },
        }),
    }).then(onResponse).then((res) => CartMapper.fromDTO(res.cartLinesAdd.cart));
};

const updateCart = (gid, lines) => {

    return API({
        method: "POST",
        data: JSON.stringify({
            query: `mutation ($id: ID!, $lines: [CartLineUpdateInput!]!) {
                      cartLinesUpdate(cartId: $id, lines: $lines) {
                        cart {
                          ${CART_FRAGMENT}
                        }
                        userErrors {
                          field
                          message
                          code
                        }
                        warnings {
                          target
                          message
                          code
                        }
                      }
                    }`,
            variables: {
                id: gid,
                lines,
            },
        }),
    }).then((res) => CartMapper.fromDTO(res.data.data.cartLinesUpdate.cart));
};

const removeFromCart = (gid, lineIds) => {
    return API({
        method: "POST",
        data: JSON.stringify({
            query: `mutation ($id: ID!, $lineIds: [ID!]!) {
                      cartLinesRemove(cartId: $id, lineIds: $lineIds) {
                        cart {
                          ${CART_FRAGMENT}
                        }
                        userErrors {
                          field
                          message
                          code
                        }
                        warnings {
                          target
                          message
                          code
                        }
                      }
                    }`,
            variables: {
                id: gid,
                lineIds,
            },
        }),
    }).then((res) => CartMapper.fromDTO(res.data.data.cartLinesRemove.cart));
};

const discountCodeUpdate = (gid, discountCodes = []) => {
    return API({
        method: "POST",
        data: JSON.stringify({
            query: `mutation ($id: ID!, $discountCodes: [String!]) {
                      cartDiscountCodesUpdate(cartId: $id, discountCodes: $discountCodes) {
                        cart {
                          ${CART_FRAGMENT}
                        }
                         userErrors {
                          field
                          message
                          code
                        }
                        warnings {
                          target
                          message
                          code
                        }
                      }
                    }`,
            variables: {
                id: gid,
                discountCodes: discountCodes || [],
            },
        }),
    }).then((res) => CartMapper.fromDTO(res.data.data.cartDiscountCodesUpdate.cart));
};


const CartAPI = {
    fetch: fetchCart,
    add: addToCart,
    update: updateCart,
    remove: removeFromCart,
    discountCodeUpdate: discountCodeUpdate,
};

export { CartAPI, CART_FRAGMENT };
