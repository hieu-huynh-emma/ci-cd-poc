import {
  View, Image,
  reactExtension,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.checkout.block.render',
  () => <Extension />,
);

function Extension() {
  return (
      <View>
        <Image source="https://cdn.shopify.com/s/files/1/0562/9873/3706/files/Checkout_Information_Panel.png?v=1720602901"></Image>
      </View>
  );
}
