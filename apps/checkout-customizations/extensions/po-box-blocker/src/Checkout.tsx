import {useEffect, useState} from "react";
import {
    reactExtension,
    useApi,
    useAppMetafields,
    useBuyerJourneyIntercept,
    useShippingAddress,
    useTranslate,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension(
    "purchase.checkout.block.render",
    () => <Extension/>,
);

function Extension() {
    const address = useShippingAddress();
    const metafield = useAppMetafields({
        type: "shop",
        namespace: "accentuate",
        key: "google_address_validator_api_key",
    });
    const googleApiKey = metafield[0]?.metafield?.value || "";
    const url = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${googleApiKey}`;
    const [isAddressPoBox, setIsAddressPoBox] = useState(false);

    const poRegex = /po box/i;
    const poRegex2 = /p.o. box/i;
    const poRegex3 = /po. box/i;
    const poRegex4 = /box [0-9]/i;

    const data = {
        address: {
            administrativeArea: address?.provinceCode,
            regionCode: address?.countryCode,
            postalCode: address?.zip,
            locality: address?.city,
            addressLines: [address?.address1],
        },
    };

    useEffect(() => {
        if (poRegex.test(address?.address1) || poRegex2.test(address?.address1) || poRegex3.test(address?.address1) || poRegex4.test(address?.address1)) {
            setIsAddressPoBox(true);
        } else {
            googleApiKey &&
            fetch(
                url,
                {
                    credentials: "include",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                },
            ).then((response) => response.json()).then((data) => {
                setIsAddressPoBox(data?.result?.address?.unconfirmedComponentTypes?.includes("post_box"));
            }).catch((e) => {
                setIsAddressPoBox(false);
            });
        }
    }, [address, googleApiKey]);

    useBuyerJourneyIntercept(
        ({canBlockProgress}) => {
            const isBlocked = canBlockProgress && address?.countryCode == "CA" && isAddressPoBox;

            return isBlocked ? {
                    behavior: "block",
                    reason: "Invalid shipping address",
                    errors: [
                        {
                            message: "We do not support shipping to PO BOX addresses.\nPlease enter a residential or commercial address to proceed.",
                            target: "$.cart.deliveryGroups[0].deliveryAddress.address1"
                        }
                    ]
                }
                : {
                    behavior: "allow"
                };
        },
    );

    return null
}
