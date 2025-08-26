const storeFrontPublicAccessToken = "1a76b86cfdf9cb7d548e285c705cd294";
const storefrontApiVersion = "2025-01";
const storeDomain = "emma-sleep.ca";

const shopifyY = window.CookieParser?.get("_shopify_y");
const shopifyS = window.CookieParser?.get("_shopify_s");

const storefrontApi = axios.create({
    baseURL: `https://${storeDomain}/api/${storefrontApiVersion}/graphql`,
    headers: {
        "Content-Type": "application/json",
        "Shopify-Storefront-Y": shopifyY,
        "Shopify-Storefront-S": shopifyS,
        "X-Shopify-Storefront-Access-Token": storeFrontPublicAccessToken,
    },
});

export default storefrontApi;
