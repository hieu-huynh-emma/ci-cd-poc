import {
    reactExtension, View, BlockLayout, Image,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
    'purchase.checkout.block.render',
    () => <ShippingNotice/>,
);

function ShippingNotice() {
    return (
        <BlockLayout rows={[60, 'fill', 60]}>
            <View>
                <Image source="https://cdn.shopify.com/s/files/1/0562/9873/3706/files/Checkout_Shipping_Notice.png?v=1720509075"></Image>
            </View>
        </BlockLayout>

    );
}
