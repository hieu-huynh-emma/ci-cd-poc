import {
    InlineLayout,
    View,
    reactExtension, Image,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
    'purchase.checkout.payment-method-list.render-before',
    () => <DigicertBadge/>,
);

function DigicertBadge() {
    return (
        <InlineLayout spacing="base" columns={['40%', '10%', 'fill']}>
            <View>
                <Image
                    source="https://cdn.shopify.com/s/files/1/0562/9873/3706/files/SSL_Secure_Message.png?v=1720507932"></Image>
            </View>
            <View>
                <Image
                    source="https://cdn.shopify.com/s/files/1/0562/9873/3706/files/Digicert_from_Emma_Sleep.avif?v=1720507147"></Image>
            </View>
            <View>
            </View>
        </InlineLayout>
    );
}
