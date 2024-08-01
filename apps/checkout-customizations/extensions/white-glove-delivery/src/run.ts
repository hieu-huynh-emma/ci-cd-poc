// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 * @typedef {import("../generated/api").Operation} Operation
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  /**
   * @type {{
  *   deliveryTitle: string
  *   zipCodes: string
  * }}
  */
  const configuration = JSON.parse(
    input?.deliveryCustomization?.metafield?.value ?? "{}"
  );

  if (!configuration.zipCodes && !configuration.deliveryTitle) {
    return NO_CHANGES;
  }

  const includedZipCodes = configuration.zipCodes.split(",").map(zip => zip.trim().toLowerCase()).filter(zip => zip != "");

  let toRemove = input.cart.deliveryGroups
    .filter(group => !includedZipCodes.find(zip => group.deliveryAddress?.zip?.toLowerCase().includes(zip)))
    .flatMap(group => group.deliveryOptions)
    .filter(option => option.title == configuration.deliveryTitle.trim())
    .map(option => /** @type {Operation} */({
      hide: {
        deliveryOptionHandle: option.handle
      }
    }));

  return {
    operations: toRemove
  };
};
