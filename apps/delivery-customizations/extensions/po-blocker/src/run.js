// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  const fetchResult = input.fetchResult;
  const poError = {
    localizedMessage: `We do not support shipping to PO BOX addresses. Please enter a residential or commercial address to proceed.`,
    target: "cart.deliveryGroups[0].deliveryAddress.address1",
  };

  if (!fetchResult || fetchResult.status !== 200 || !fetchResult.body) {
    const deliveryGroup = input?.cart?.deliveryGroups[0];
    const address = deliveryGroup.deliveryAddress?.address1 || "";
    

    const poRegex = /po box/i;
    const poRegex2 = /p.o. box/i;
    const poRegex3 = /po. box/i;
    const poRegex4 = /box [0-9]/i;

    const errors = poRegex.test(address) || poRegex2.test(address) || poRegex3.test(address) || poRegex4.test(address) ? [poError] : [];

    return {errors};
  }

  const data = JSON.parse(fetchResult.body);
  const isPO = data.result.address.addressComponents[0].componentType == 'post_box';
  const errors = isPO ? [poError] : [];

  return {
    errors
  }
};