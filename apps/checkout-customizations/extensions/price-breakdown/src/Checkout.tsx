import {
    InlineLayout, View, BlockStack,
    useApi,
    useCartLineTarget, BlockLayout,
    reactExtension, useCartLines, Text, InlineAlignment, useSettings, useDiscountAllocations
} from '@shopify/ui-extensions-react/checkout';
import {useEffect, useState} from 'react';
import {ExtensionSettings} from "@shopify/ui-extensions/build/ts/surfaces/checkout/api/standard/standard";

export default reactExtension(
    "purchase.checkout.reductions.render-after",
    () => <Extension/>,
);


async function getOrderPriceBreakdown({cartLines, query, i18n}) {

    const lineItems = await lineItemsMapper(cartLines)
    console.log("=>(Checkout.tsx:19) lineItems", lineItems);

    return computePricing(lineItems)

    function lineItemsMapper(cartLines) {
        return Promise.allSettled(cartLines.map(cartLine => getLineItem({cartLine, query}))).then((r) =>
            r.filter((x) => x.status === "fulfilled").map((x) => x.value)
        );
    }

    function computePricing(lineItems) {
        let price = 0, originalPrice = 0;

        lineItems.forEach(({cost}) => {
            const {subtotalAmount: {amount: priceAmount}, compareAtPrice} = cost;
            console.log("=>(Checkout.tsx:33) cost", cost);

            const {amount: originalPriceAmount = priceAmount} = compareAtPrice || {}
            console.log("=>(Checkout.tsx:35) originalPriceAmount", originalPriceAmount);

            price += +priceAmount
            originalPrice += +originalPriceAmount
        });

        const totalDiscounts = Math.max(0, originalPrice - price);

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
    const {merchandise: {id}, quantity} = cartLine

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

    const pricePerUnit = data?.node?.price?.amount ?? 0,
        price = pricePerUnit * quantity,

        originalPricePerUnit = data?.node?.compareAtPrice?.amount ?? 0,
        originalPrice = originalPricePerUnit * quantity;


    cartLine.cost.compareAtPrice = !!originalPrice ? {amount: originalPrice} : null

    //The cost of the merchandise line before line-level discounts.
    cartLine.cost.subtotalAmount = {amount: price}

    return cartLine
}

function Extension() {
    const {i18n, extension, query} = useApi();
    const cartLines = useCartLines()
    console.log("=>(Checkout.tsx:96) cartLines", cartLines);

    const [pricing, setPricing] = useState({price: 0, originalPrice: 0});

    useEffect(async () => {
        const priceBreakdown = await getOrderPriceBreakdown({cartLines, query, i18n});

        setPricing(priceBreakdown)
    }, [query]);

    return pricing.totalDiscounts ? (
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
    ) : ""
}
