import {
    View, Image,
    reactExtension,
    useApi
} from '@shopify/ui-extensions-react/checkout';
import {useState} from "react";

export default reactExtension(
    'purchase.checkout.block.render',
    () => <Extension/>,
);

function Extension() {
    const {appMetafields} = useApi()
    const [banner, setBanner] = useState(null);

    appMetafields.subscribe((metafields) => {
        const accentuateObject = JSON.parse(metafields[0].metafield.value as string)

        setBanner(accentuateObject[0].src)
    });

    return (
        <View>
            <Image source={banner}></Image>
        </View>
    )
}
