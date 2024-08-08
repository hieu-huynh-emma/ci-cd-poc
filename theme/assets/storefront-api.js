const storeFrontPublicAccessToken = "1a76b86cfdf9cb7d548e285c705cd294";
const storefrontApi = axios.create({
    baseURL: "https://emma-sleep-ca.myshopify.com/api/2024-07/graphql",
    headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storeFrontPublicAccessToken,
    }
})

export default storefrontApi
