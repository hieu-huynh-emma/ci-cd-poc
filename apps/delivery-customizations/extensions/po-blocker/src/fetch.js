import { HttpRequestMethod } from "../generated/api";

// @ts-check

/**
 * @typedef {import("../generated/api").FetchInput} FetchInput
 * @typedef {import("../generated/api").FunctionFetchResult} FunctionFetchResult
 */

/**
 * @param {FetchInput} input
 * @returns {FunctionFetchResult}
 */
export function fetch(input) {
  const googleApiKey = input?.shop?.metafield?.value;
  const deliveryGroup = input?.cart?.deliveryGroups[0];
  const address = deliveryGroup.deliveryAddress?.address1 || "";

  const poRegex = /po box/i;
  const poRegex2 = /p.o. box/i;
  const poRegex3 = /po. box/i;
  const poRegex4 = /box [0-9]/i;
  
  if (poRegex.test(address) || poRegex2.test(address) || poRegex3.test(address) || poRegex4.test(address)) {
    return {
      request : null
    }
  }

  const url = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${googleApiKey}`;

  const data = {
    address: {
      regionCode: deliveryGroup.deliveryAddress?.provinceCode,
      countryCode: deliveryGroup.deliveryAddress?.countryCode,
      postalCode: deliveryGroup.deliveryAddress?.zip,
      locality: deliveryGroup.deliveryAddress?.city,
      addressLines: [deliveryGroup.deliveryAddress?.address1]
    }
  };

  return {
    request: {
      method: HttpRequestMethod.Post,
      url,
      headers: [
        { name: "accept", value: "application/json" },
        { name: "content-type", value: "application/json" }
      ],
      body: JSON.stringify(data),
      policy: {
        readTimeoutMs: 2000
      }
    }
  };
};