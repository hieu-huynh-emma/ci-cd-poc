import { Banner, reactExtension, Text, useTranslate, View } from "@shopify/ui-extensions-react/checkout";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();

  return (
    <View inlineAlignment={"center"}>
      <Banner status="success" collapsible={true}>
        <Text emphasis="bold">{translate("freeShipping")}</Text>
      </Banner>
    </View>
  );
}
