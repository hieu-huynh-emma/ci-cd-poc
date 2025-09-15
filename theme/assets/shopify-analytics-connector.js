class ShopifyAnalyticsConnector {

    sendCartAnalytics(addedLines) {
        try {
            const eventPayload = this.prepareBasePageViewPayload();

            const eventName = "ADD_TO_CART";

            const eventId = this.buildUUID();

            addedLines.forEach(cartLine => {
                this.sendGA4Analytics({
                    eventId,
                    cartLine,
                });

            });

            this.sendShopifyAnalytics({
                eventName,
                payload: {
                    ...eventPayload,
                    eventId,
                    cartId: window.Cart.cartId,
                    products: addedLines,
                },
            });
        } catch (e) {
            console.error(e);
        }

    }

    sendGA4Analytics(payload) {
        const { eventId, cartLine } = payload;

        const eventName = "add_to_cart";

        const gtagPayload = {
            currency: cartLine?.currency,
            value: cartLine?.cost?.total?.amount,
            items: [
                {
                    item_id: cartLine?.merchandise?.product?.id,
                    item_name: cartLine?.merchandise?.product?.title,
                    item_variant: cartLine.merchandise.title,
                    item_brand: cartLine?.merchandise?.product?.vendor,
                    item_category: cartLine?.merchandise?.product?.productType,
                    price: cartLine?.merchandise?.price?.amount,
                    quantity: cartLine?.quantity,
                    currency: cartLine?.currency,
                },
            ],
        };

        const gtmPayload = {
            event: eventName,
            timestamp: Date.now(),
            id: eventId,
            url: window.location.href,
            ecommerce: gtagPayload,
        };

        gtag("event", eventName, gtagPayload);
    }

    sendShopifyAnalytics(event) {
        const { eventName, payload } = event;

        if (!payload.hasUserConsent) return Promise.resolve();

        const events = this.composeSchema(payload);
        const shopDomain = location.host;

        if (events.length) {
            return this.sendToShopify(events, shopDomain);
        } else {
            return Promise.resolve();
        }
    }

    composeSchema(payload) {
        const addToCartPayload = payload;
        const cartToken = window.Cart.cartToken;
        const schemaId = "custom_storefront_customer_tracking/1.2";
        const products = addToCartPayload.products.map(this.formatProduct.bind(this));

        return [
            {
                schema_id: schemaId,
                payload: {
                    event_name: "product_added_to_cart",
                    cart_token: cartToken,
                    products,
                    ...this.formatPayload(addToCartPayload),
                },
                metadata: {
                    event_created_at_ms: Date.now(),
                },
            },
        ];
    }

    sendToShopify(events, shopDomain) {
        const eventsToBeSent = {
            events,
            metadata: {
                event_sent_at_ms: Date.now(),
            },
        };

        const ERROR_MESSAGE = "sendShopifyAnalytics request is unsuccessful";

        try {
            return fetch(
                shopDomain
                    ? `https://${shopDomain}/.well-known/shopify/monorail/unstable/produce_batch`
                    : "https://monorail-edge.shopifysvc.com/unstable/produce_batch",
                {
                    method: "post",
                    headers: {
                        "content-type": "text/plain",
                    },
                    body: JSON.stringify(eventsToBeSent),
                },
            )
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Response failed");
                    }
                    return response.text();
                })
                .then((data) => {
                    if (data) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        const jsonResponse = JSON.parse(data);
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                        jsonResponse.result.forEach((eventResponse) => {
                            if (eventResponse.status !== 200) {
                                console.error(ERROR_MESSAGE, "\n\n", eventResponse.message);
                            }
                        });
                    }
                })
                .catch((err) => {
                    console.error(ERROR_MESSAGE, err);
                });
        } catch (error) {
            // Do nothing
            return Promise.resolve();
        }
    }


    prepareBasePageViewPayload() {
        const customerPrivacy = this.getCustomerPrivacyRequired();
        const hasUserConsent = customerPrivacy.analyticsProcessingAllowed();

        const eventPayload = {
            shopifySalesChannel: "headless",
            assetVersionId: "2025-01-01",
            shopId: Shop.id,
            hasUserConsent,
            currency: window.Shopify.currency.active,
            ...this.getClientBrowserParameters(),
            ccpaEnforced: !customerPrivacy.saleOfDataAllowed(),
            gdprEnforced: !(
                customerPrivacy.marketingAllowed() &&
                customerPrivacy.analyticsProcessingAllowed()
            ),
            analyticsAllowed: customerPrivacy.analyticsProcessingAllowed(),
            marketingAllowed: customerPrivacy.marketingAllowed(),
            saleOfDataAllowed: customerPrivacy.saleOfDataAllowed(),
        };

        return eventPayload;
    }

    formatProduct(cartLine) {
        const productGid = cartLine.merchandise.product.id;
        const variantGid = cartLine.merchandise.id;

        const formattedProduct = {
            product_gid: productGid,
            variant_gid: variantGid,
            product_id: extractIdFromGid(productGid),
            variant_id: extractIdFromGid(variantGid),
            name: cartLine.merchandise.product.title,
            variant: cartLine.merchandise.title,
            brand: cartLine.merchandise.product.vendor,
            price: parseFloat(cartLine.merchandise.price.amount),
            quantity: Number(cartLine.quantity || 0),
            category: cartLine.merchandise.product.productType,
            sku: cartLine.merchandise.sku,
        };

        return JSON.stringify(formattedProduct);
    }

    formatPayload(payload) {
        return {
            source: payload.shopifySalesChannel || "headless",
            asset_version_id: payload.assetVersionId || "2025.1.3",

            is_persistent_cookie: payload.hasUserConsent,
            deprecated_visit_token: payload.visitToken,
            unique_token: payload.uniqueToken,
            event_time: Date.now(),
            event_id: payload.eventId,

            event_source_url: payload.url,
            referrer: payload.referrer,
            user_agent: payload.userAgent,
            navigation_type: payload.navigationType,
            navigation_api: payload.navigationApi,

            shop_id: +payload.shopId,
            currency: payload.currency,

            ccpa_enforced: payload.ccpaEnforced || false,
            gdpr_enforced: payload.gdprEnforced || false,
            gdpr_enforced_as_string: payload.gdprEnforced ? "true" : "false",
            analytics_allowed: payload.analyticsAllowed || false,
            marketing_allowed: payload.marketingAllowed || false,
            sale_of_data_allowed: payload.saleOfDataAllowed || false,
        };
    }

    buildUUID() {
        let hash = "";
        const tokenHash = "xxxx-4xxx-xxxx-xxxxxxxxxxxx";

        try {
            const crypto = window.crypto;
            const randomValuesArray = new Uint16Array(31);
            crypto.getRandomValues(randomValuesArray);

            // Generate a strong UUID
            let i = 0;
            hash = tokenHash
                .replace(/[x]/g, (c) => {
                    const r = randomValuesArray[i] % 16;
                    const v = c === "x" ? r : (r & 0x3) | 0x8;
                    i++;
                    return v.toString(16);
                })
                .toUpperCase();
        } catch (err) {
            // crypto not available, generate weak UUID
            hash = tokenHash
                .replace(/[x]/g, (c) => {
                    const r = (Math.random() * 16) | 0;
                    const v = c === "x" ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                })
                .toUpperCase();
        }

        return `${this.hexTime()}-${hash}`;
    }

    hexTime() {
        // 32 bit representations of new Date().getTime() and performance.now()
        let dateNumber = 0;
        let perfNumber = 0;

        // Result of zero-fill right shift is always positive
        dateNumber = new Date().getTime() >>> 0;

        try {
            perfNumber = performance.now() >>> 0;
        } catch (err) {
            perfNumber = 0;
        }

        const output = Math.abs(dateNumber + perfNumber)
            .toString(16)
            .toLowerCase();

        // Ensure the output is exactly 8 characters
        return output.padStart(8, "0");
    }


    getCustomerPrivacyRequired() {
        const customerPrivacy = this.getCustomerPrivacy();

        if (!customerPrivacy) {
            throw new Error(
                "Shopify Customer Privacy API not available. Must be used within a useEffect. Make sure to load the Shopify Customer Privacy API with useCustomerPrivacy() or <AnalyticsProvider>.",
            );
        }

        return customerPrivacy;
    }

    getCustomerPrivacy() {
        try {
            return window.Shopify && window.Shopify.customerPrivacy
                ? window.Shopify?.customerPrivacy
                : null;
        } catch (e) {
            return null;
        }
    }

    getClientBrowserParameters() {
        const [navigationType, navigationApi] = this.getNavigationType();

        return {
            uniqueToken: window.CookieParser.get("_shopify_y"),
            visitToken: window.CookieParser.get("_shopify_s"),
            url: location.href,
            path: location.pathname,
            search: location.search,
            referrer: document.referrer,
            title: document.title,
            userAgent: navigator.userAgent,
            navigationType,
            navigationApi,
        };
    }

    getNavigationTypeExperimental() {
        try {
            const navigationEntries =
                performance?.getEntriesByType &&
                performance?.getEntriesByType("navigation");

            if (navigationEntries && navigationEntries[0]) {
                // https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming
                const rawType = (
                    window.performance.getEntriesByType(
                        "navigation",
                    )[0]
                )["type"];
                const navType = rawType && rawType.toString();

                return navType;
            }
        } catch (err) {
            // Do nothing
        }
        return undefined;
    }

    getNavigationTypeLegacy() {
        try {
            if (
                PerformanceNavigation &&
                performance?.navigation?.type !== null &&
                performance?.navigation?.type !== undefined
            ) {
                //  https://developer.mozilla.org/en-US/docs/Web/API/Performance/navigation
                const rawType = performance.navigation.type;
                switch (rawType) {
                    case PerformanceNavigation.TYPE_NAVIGATE:
                        return "navigate";
                    case PerformanceNavigation.TYPE_RELOAD:
                        return "reload";
                    case PerformanceNavigation.TYPE_BACK_FORWARD:
                        return "back_forward";
                    default:
                        return `unknown: ${rawType}`;
                }
            }
        } catch (err) {
            // do nothing
        }
        return undefined;
    }

    getNavigationType() {
        try {
            let navApi = "PerformanceNavigationTiming";
            let navType = this.getNavigationTypeExperimental();
            if (!navType) {
                navType = this.getNavigationTypeLegacy();
                navApi = "performance.navigation";
            }
            if (navType) {
                return [navType, navApi];
            } else {
                return ["unknown", "unknown"];
            }
        } catch (err) {
            // do nothing
        }
        return ["error", "error"];
    }
}


window.ShopifyAnalyticsConnector = new ShopifyAnalyticsConnector();
