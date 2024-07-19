import { BlockLayout, Image, reactExtension, Text } from "@shopify/ui-extensions-react/checkout";

export default reactExtension(
  "purchase.checkout.block.render",
  () => <Extension />,
);

function Extension() {
  const imageUrl = "https://emma-sleep.ca/cdn/shop/t/384/assets/checkout-payment-support_600x.png";

  return (
    <BlockLayout rows="auto" blockAlignment="center" inlineAlignment="center" spacing="base">
      <Text accessibilityRole="strong" emphasis="bold" size="base">
        We offer financing and accept credit and debit cards
        at payment:
      </Text>

      <Image source={imageUrl} />

      <Text accessibilityRole="strong" emphasis="bold" size="base">
        Just fill in your details below.
      </Text>
    </BlockLayout>
  );
}
