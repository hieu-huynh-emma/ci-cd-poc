import { BlockLayout, Image, reactExtension, Text, useTranslate } from "@shopify/ui-extensions-react/checkout";

export default reactExtension(
  "purchase.checkout.block.render",
  () => <Extension />,
);

function Extension() {
  const translate = useTranslate()
  const imageUrl = "https://emma-sleep.ca/cdn/shop/t/384/assets/checkout-payment-support_600x.png";

  return (
    <BlockLayout rows="auto" blockAlignment="center" inlineAlignment="center" spacing="base">
      <Text accessibilityRole="strong" emphasis="bold" size="base">
        {translate("topText")}
      </Text>

      <Image source={imageUrl} />

      <Text accessibilityRole="strong" emphasis="bold" size="base">
        {translate("bottomText")}
      </Text>
    </BlockLayout>
  );
}
