import {
    InlineLayout,
    reactExtension, View, Link, useShop
} from "@shopify/ui-extensions-react/checkout";


export default reactExtension("purchase.checkout.footer.render-after", () => (
    <Footer></Footer>
));


const Footer = () => {
    const {storefrontUrl} = useShop();

    const legalDocs = [
        {
            label: "Legal Notice",
            url: "/pages/legal-notice"
        },
        {
            label: "Privacy Policy",
            url: "/pages/privacy-policy"
        },
        {
            label: "Terms and Conditions",
            url: "/pages/terms-and-conditions"
        }
    ]


    return (<InlineLayout
        spacing="base"
        accessibilityRole="orderedList"
        inlineAlignment="start"
        blockAlignment="start"
        columns="auto"
    >
        {legalDocs.map(({url, label}) => {
            const to = new URL(url, storefrontUrl).href

            return <View accessibilityRole="listItem">
                <Link to={to} external appearance="monochrome">
                    {label}
                </Link>
            </View>
        })}
    </InlineLayout>)
}
