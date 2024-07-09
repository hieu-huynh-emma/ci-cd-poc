import {
    InlineLayout, View, BlockStack,
    useApi,
    useCartLineTarget,BlockLayout,
    reactExtension, useCartLines, Text
} from '@shopify/ui-extensions-react/checkout';
import {useEffect, useState} from 'react';

export const cartLineItemBreakdown = reactExtension("purchase.checkout.cart-line-item.render-after", () =>
    <LineItemPriceBreakdown/>);

export const priceBreakdownTop = reactExtension(
    "purchase.checkout.reductions.render-after",
    () => <PriceBreakdownTop/>,
);

export const priceBreakdownBottom = reactExtension(
    'purchase.checkout.block.render',
    () => <PriceBreakdownBottom/>,
);

async function getOrderPriceBreakdown({cartLines, query, i18n}) {

    const lineItems = await lineItemsMapper(cartLines)

    return computePricing(lineItems)

    function lineItemsMapper(cartLines) {
        return Promise.allSettled(cartLines.map(cartLine => getLineItem({cartLine, query}))).then((r) =>
            r.filter((x) => x.status === "fulfilled").map((x) => x.value)
        );
    }

    function computePricing(lineItems) {
        let price = 0, originalPrice = 0;

        lineItems.forEach(({cost}) => {
            const {totalAmount: {amount: priceAmount}, compareAtPrice: {amount: originalPriceAmount}} = cost;

            price += +priceAmount
            originalPrice += +originalPriceAmount
        });

        const totalDiscounts = originalPrice - price

        const priceCurrency = i18n.formatCurrency(price),
            originalPriceCurrency = i18n.formatCurrency(originalPrice),
            totalDiscountsCurrency = i18n.formatCurrency(totalDiscounts);

        return {
            price,
            priceCurrency,
            originalPrice,
            originalPriceCurrency,
            totalDiscounts,
            totalDiscountsCurrency
        };

    }
}

async function getLineItem({cartLine, query}) {
    const {merchandise: {id}} = cartLine


    const {data, errors} = await query(
        `query ($id: ID!) {
         node(id: $id) {
        ... on ProductVariant {
            id
            title
            quantityAvailable
            price {
                amount
            }
            compareAtPrice {
                amount
            }
        }
    }
      }`,
        {
            variables: {id},
        },
    )

    cartLine.cost.compareAtPrice = data?.node?.compareAtPrice

    return cartLine
}

function LineItemPriceBreakdown() {
    const {i18n, extension, query} = useApi();
    const cartLine = useCartLineTarget();


    const [pricing, setPricing] = useState({});

    useEffect(async () => {
        const lineItem = await getLineItem({cartLine, query});

        const {totalAmount: {amount: price}, compareAtPrice: {amount: originalPrice}} = lineItem.cost;

        const totalDiscounts = originalPrice - price,
            priceCurrency = i18n.formatCurrency(price),
            originalPriceCurrency = i18n.formatCurrency(originalPrice),
            totalDiscountsCurrency = i18n.formatCurrency(totalDiscounts);

        setPricing({
            price,
            priceCurrency,
            originalPrice,
            originalPriceCurrency,
            totalDiscounts,
            totalDiscountsCurrency
        })
    }, [query]);

    return (
        <BlockStack spacing="none">
            <InlineLayout columns={['fill', 'auto']}>
                <View padding="none" visibility="hidden"></View>
                <View padding="none" inlineAlignment="end">
                    <BlockLayout rows={['fill', 'fill']}>
                        <View>
                            <Text appearance="subdued" accessibilityRole="deletion">{pricing?.originalPriceCurrency}</Text>
                        </View>
                        <View></View>
                    </BlockLayout>
                </View>
            </InlineLayout>
        </BlockStack>
    );
}

function PriceBreakdownTop() {
    const {i18n, extension, query} = useApi();
    const cartLines = useCartLines()


    const [pricing, setPricing] = useState({price: 0, originalPrice: 0});

    useEffect(async () => {
        const priceBreakdown = await getOrderPriceBreakdown({cartLines, query, i18n});

        setPricing(priceBreakdown)
    }, [query]);

    return (
        <BlockStack spacing="none">
            <InlineLayout columns={['auto', 'fill', 'auto']}>
                <View padding="none">
                    <Text>Retail Price</Text>
                </View>
                <View padding="none"></View>
                <View padding="none" inlineAlignment="end">
                    <Text>{pricing?.originalPriceCurrency}</Text>
                </View>
            </InlineLayout>
            <InlineLayout columns={['auto', 'fill', 'auto']}>
                <View padding={["none", "none", "none", "base"]} inlineAlignment="end">
                    <Text>Sale Discount</Text>
                </View>
                <View padding="none"></View>
                <View padding="none" inlineAlignment="end">
                    <Text appearance="critical" emphasis="bold">- {pricing?.totalDiscountsCurrency}</Text>
                </View>
            </InlineLayout>
        </BlockStack>
    );
}

function PriceBreakdownBottom() {
    const {i18n, extension, query} = useApi();
    const cartLines = useCartLines()


    const [pricing, setPricing] = useState({price: 0, originalPrice: 0});

    useEffect(async () => {
        const priceBreakdown = await getOrderPriceBreakdown({cartLines, query, i18n});

        setPricing(priceBreakdown)
    }, [query]);

    return (
        <InlineLayout columns={['fill', 'auto']}>
            <View padding="none"></View>
            <View padding="none" inlineAlignment="end">
                <Text size="medium" appearance="critical" emphasis="bold">You
                    save {pricing?.totalDiscountsCurrency}!</Text>
            </View>
        </InlineLayout>
    );
}
