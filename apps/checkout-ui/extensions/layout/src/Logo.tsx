import {
    View,
    Image, Link, useShop,
} from "@shopify/ui-extensions-react/checkout";

export default function () {
    const {storefrontUrl} = useShop();
    const homepageUrl = new URL('/', storefrontUrl).href
    return (
        <View maxBlockSize={100} maxInlineSize={135}>
            <Link to={homepageUrl}>
                <Image source="https://emma-sleep.ca/cdn/shop/files/MicrosoftTeams-Logo_Emma_new.png"></Image>
            </Link>
        </View>
    )
}


