import { reactExtension, Text, useTranslate } from "@shopify/ui-extensions-react/checkout";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.reductions.render-before", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();

  return (
    <Text>{translate("discountHelperText")}</Text>
  );
}
