import {
  Appearance,
  InlineAlignment,
  InlineLayout,
  reactExtension,
  Text,
  useApi,
  useCartLineTarget,
  useSettings,
  View,
  useTranslate
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";
import { TextSize } from "@shopify/ui-extensions/build/ts/surfaces/checkout/components/shared";
import { ExtensionSettings } from "@shopify/ui-extensions/build/ts/surfaces/checkout/api/standard/standard";
import { TextAccessibilityRole } from "@shopify/ui-extensions/build/ts/surfaces/admin/components/shared";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.cart-line-item.render-after", () => (
  <Extension />
));

type TextColor = Extract<Appearance, | "accent" | "subdued" | "info" | "success" | "warning" | "critical" | "decorative">

async function getLineItem({ cartLine, query }) {
  const { merchandise: { id }, quantity } = cartLine;

  const { data, errors } = await query(
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
      variables: { id },
    },
  );

  const originalPrice = data?.node?.compareAtPrice.amount ?? 0;

  cartLine.cost.compareAtPrice = { amount: originalPrice * quantity };

  return cartLine;
}

function DiscountTag(props) {
  if (!props || !props?.originalPrice) return "";

  const { originalPrice, price, appearance, fontSize, inlineAlignment } = props;

  const diff = originalPrice - price;
  const percent = (diff * 100) / originalPrice;
  const formattedPercent = Math.floor(percent);

  return (
    <InlineLayout inlineAlignment={inlineAlignment} blockAlignment={"center"}>
      <View background={"subdued"} padding={"extraTight"}
            borderRadius={"base"}>
        <Text
          appearance={appearance}
          size={fontSize}
        >
          {formattedPercent}% OFF
        </Text>
      </View>
    </InlineLayout>

  );
}

function getSettings(extensionSettings: Partial<ExtensionSettings>) {
  const appearance = (extensionSettings.apperance || "subdued") as TextColor,
    inlineAlignment: InlineAlignment = extensionSettings.alignment === "right" ? "end" : "start",
    fontSize = (extensionSettings.fontSize || "base") as TextSize,
    content = extensionSettings.message || "On sale. Originally",
    strikethrough: TextAccessibilityRole | undefined = extensionSettings.isShowStrikethrough ? "deletion" : undefined,
    isShowPercentage = extensionSettings.isShowPercentage;

  return { appearance, inlineAlignment, fontSize, content, strikethrough, isShowPercentage };
}

function Extension() {
  const translate = useTranslate()
  const settings = getSettings(useSettings());
  const { i18n, extension, query } = useApi();
  const cartLine = useCartLineTarget();

  const [pricing, setPricing] = useState({});

  useEffect(async () => {
    const lineItem = await getLineItem({ cartLine, query });

    const { totalAmount: { amount: price }, compareAtPrice: { amount: originalPrice } } = lineItem.cost;

    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      currencyDisplay: "narrowSymbol",
    });

    const totalDiscounts = Math.max(0, originalPrice - price),
      priceCurrency = formatter.format(price),
      originalPriceCurrency = formatter.format(originalPrice),
      totalDiscountsCurrency = formatter.format(totalDiscounts);

    setPricing({
      price,
      priceCurrency,
      originalPrice,
      originalPriceCurrency,
      totalDiscounts,
      totalDiscountsCurrency,
    });
  }, [query]);

  const { appearance, inlineAlignment, fontSize, content, strikethrough, isShowPercentage } = settings;

  if (!pricing.totalDiscounts) return "";

  return isShowPercentage ? <DiscountTag {...pricing} {...settings} /> : (
    <InlineLayout columns={"auto"} spacing="none" inlineAlignment={inlineAlignment} blockAlignment={"center"}>
      <Text
        appearance={appearance}
        size={fontSize}
      >
        {translate("fullPrice")}
        &nbsp;
      </Text>

      <Text appearance={appearance}
            accessibilityRole={strikethrough}
            size={fontSize}
      >
        {pricing?.originalPriceCurrency}
      </Text>
    </InlineLayout>
  );
}
