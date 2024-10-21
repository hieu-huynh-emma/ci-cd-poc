import {
    InlineLayout,
    useApi,
    View,
    BlockLayout,
    Image,
    reactExtension,
    Text,
    useTranslate
} from "@shopify/ui-extensions-react/checkout";
import {useState} from "react";

export default reactExtension(
    "purchase.checkout.block.render",
    () => <Extension/>,
);

function Extension() {
    const translate = useTranslate()
    const {appMetafields} = useApi()


    const [images, setImages] = useState([]);

    appMetafields.subscribe((metafields) => {
        setImages(JSON.parse(metafields[0].metafield.value as string))
    });

    return (
        <BlockLayout rows="auto" blockAlignment="center" inlineAlignment="center" spacing="tight">
            <Text accessibilityRole="strong" emphasis="bold" size="base">
                {translate("topText")}
            </Text>

            <InlineLayout columns={75} spacing="tight" blockAlignment="center" inlineAlignment="center">
                {images.map(i => <Image source={i.src}></Image>)}
            </InlineLayout>

            <Text accessibilityRole="strong" emphasis="bold" size="base">
                {translate("bottomText")}
            </Text>
        </BlockLayout>
    );
}
