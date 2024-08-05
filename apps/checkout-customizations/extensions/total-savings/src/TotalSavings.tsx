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
            console.log("=>(Checkout.tsx:43) cost", cost);

            const {totalAmount: {amount: priceAmount}, compareAtPrice} = cost;

            const {amount: originalPriceAmount = priceAmount} = compareAtPrice || {}

            price += +priceAmount
            originalPrice += +originalPriceAmount
        });
        const saleDiscounted = Math.max(0, originalPrice - price)

        const totalDiscounts =  saleDiscounted + totalDiscountedAmount || 0;

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

    const originalPrice = data?.node?.compareAtPrice.amount ?? 0

    cartLine.cost.compareAtPrice = {amount: originalPrice * quantity}

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
    console.log("=>(Checkout.tsx:106) cartDiscounts", cartDiscounts);

    const lineItemDiscounts = cartLines.reduce((r, {discountAllocations}) => r += getDiscountedAmount(discountAllocations), 0)
    console.log("=>(Checkout.tsx:109) lineItemDiscounts", lineItemDiscounts);

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
