import {
    reactExtension,
    View,
    Text,
    useApi,
    InlineAlignment, useDiscountAllocations, useSettings, useCartLines, InlineLayout,
} from "@shopify/ui-extensions-react/checkout";
import {useEffect, useState} from "react";
import {
    CartDiscountAllocation, CartLine,
    ExtensionSettings
} from "@shopify/ui-extensions/build/ts/surfaces/checkout/api/standard/standard";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (
    <Extension/>
));


async function getOrderPriceBreakdown({cartLines, query, i18n, totalDiscountedAmount}) {
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
            const {subtotalAmount: {amount: priceAmount}, compareAtPrice} = cost;

            const {amount: originalPriceAmount = priceAmount} = compareAtPrice || {}

            price += +priceAmount
            originalPrice += +originalPriceAmount
        });

        const saleDiscounted = Math.max(0, originalPrice - price)

        const totalDiscounts = saleDiscounted + totalDiscountedAmount || 0;

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

function getSettings(extensionSettings: Partial<ExtensionSettings>) {
    const inlineAlignment: InlineAlignment = extensionSettings.alignment === "right" ? "end" : "start",
        content = extensionSettings.message || "You save";

    return {inlineAlignment, content};
}

const getDiscountedAmount = (discountAllocations: CartDiscountAllocation[] = []) => discountAllocations.reduce((r, {discountedAmount: {amount}}) => r += amount, 0)

function getTotalDiscountAllocations(cartDiscountAllocations: CartDiscountAllocation[], cartLines: CartLine[]) {
    const cartDiscounts = getDiscountedAmount(cartDiscountAllocations)

    const lineItemDiscounts = cartLines.reduce((r, {discountAllocations}) => r += getDiscountedAmount(discountAllocations), 0)

    return cartDiscounts + lineItemDiscounts;
}

function Extension() {
    const settings = getSettings(useSettings())
    const cartDiscountAllocations = useDiscountAllocations()
    const {i18n, extension, query} = useApi();
    const cartLines = useCartLines();

    const totalDiscountedAmount = getTotalDiscountAllocations(cartDiscountAllocations, cartLines)

    const [pricing, setPricing] = useState({price: 0, originalPrice: 0});

    useEffect(async () => {
        const priceBreakdown = await getOrderPriceBreakdown({cartLines, query, i18n, totalDiscountedAmount});

        setPricing(priceBreakdown)
    }, [query]);

    const {inlineAlignment, content} = settings

    return pricing.totalDiscounts ? (
        <InlineLayout columns={'fill'}>
            <View padding="none" inlineAlignment={inlineAlignment}>
                <Text size="medium" appearance="critical"
                      emphasis="bold">{content} {pricing?.totalDiscountsCurrency}!</Text>
            </View>
        </InlineLayout>
    ) : ""
}
