import {
    reactExtension,
    Text,
    useSettings,
} from "@shopify/ui-extensions-react/checkout";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.reductions.render-before", () => (
    <Extension/>
));

function Extension() {
    const settings = useSettings();
    const content = settings.content || "Have a promo code? Enter it below."
    return (
        <Text>{content}</Text>
    )
}
