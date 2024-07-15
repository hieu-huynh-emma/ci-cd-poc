import {
    View, Image,
    reactExtension, BlockLayout, Text, useApi, InlineLayout,
} from '@shopify/ui-extensions-react/checkout';
import { useState} from "react";

export default reactExtension(
    'purchase.checkout.block.render',
    () => <Extension/>,
);

function Extension() {
    const {appMetafields} = useApi()

    const [shopAwards, setShopAwards] = useState([]);

    appMetafields.subscribe((metafields) => {
        const awards = JSON.parse(metafields[0].metafield.value as string)
        setShopAwards(awards)
    })

    return (
        <BlockLayout rows="auto" spacing="extraLoose">
            <View inlineAlignment="center">
                <Text size="extraLarge" emphasis="bold">Multi Award Winning Mattress</Text>
            </View>
            <InlineLayout columns="fill" spacing="loose" blockAlignment="center" inlineAlignment="center">
                {shopAwards.map(i => <View overflow="hidden" cornerRadius="large"><Image source={i.src} ></Image></View>)}
            </InlineLayout>
        </BlockLayout>
    );
}
