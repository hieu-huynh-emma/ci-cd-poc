import { reactExtension, Text, useTranslate } from "@shopify/ui-extensions-react/checkout";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.shipping-option-item.render-after", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();
  return (
    <Text>
      {translate("shippingNotice")}
    </Text>
  );
}
