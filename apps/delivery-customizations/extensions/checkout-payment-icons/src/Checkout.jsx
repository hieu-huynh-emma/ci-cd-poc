import {
  Banner,
  BlockLayout,
  View,
  Heading,
  Image,
  PaymentIcon,
  useApi,
  useTranslate,
  reactExtension,
  useAppMetafields,
  useSettings,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.checkout.block.render',
  () => <Extension />,
);

function Extension() {
  const translate = useTranslate();
  const { extension } = useApi();

  const metafield = useAppMetafields({type: 'shop', namespace: 'globals', key: 'checkout_payment_icons'});
  const metafieldValue = metafield[0]?.metafield?.value || "";
  let imageUrl = null;

  try {
    imageUrl = JSON.parse(metafieldValue)[0].src;
  } catch (e) {
    console.log(e);
  }

  return (
    <>
      { imageUrl &&
        <BlockLayout rows={[20, 'auto']} blockAlignment="center" inlineAlignment="center">
          <View border="none" padding="base">
            <Heading inlineAlignment="center">{translate('top_label')}</Heading>
          </View>
          <View border="none" padding="base">
            <Image source={imageUrl} />
          </View>
          <View border="none" padding="none">
            <Heading>{translate('bottom_label')}</Heading>
          </View>
        </BlockLayout>
      }
    </>
  );
}