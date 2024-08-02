import type { CartDeliveryGroup, CartDeliveryOption, FunctionRunResult, RunInput } from "../generated/api";

const NO_CHANGES: FunctionRunResult = {
  operations: [],
};

type Configuration = {
  deliveryTitle: string,
  zipCodes: string[]
};

export function run(input: RunInput): FunctionRunResult {
  const configuration: Configuration = JSON.parse(
    input?.shop?.metafield?.value ?? "{}",
  );

  if (!configuration.zipCodes && !configuration.deliveryTitle) {
    return NO_CHANGES;
  }

  const includedZipCodes = configuration.zipCodes.map(zip => zip.trim().toLowerCase()).filter(zip => zip != "");

  let toRemove = input.cart.deliveryGroups
    .filter((group: CartDeliveryGroup) => !includedZipCodes.find(zip => group.deliveryAddress?.zip?.toLowerCase().includes(zip)))
    .flatMap((group: CartDeliveryGroup) => group.deliveryOptions)
    .filter((option: CartDeliveryOption) => option.title == configuration.deliveryTitle.trim())
    .map((option: CartDeliveryOption) => /** @type {Operation} */({
      hide: {
        deliveryOptionHandle: option.handle,
      },
    }));

  return {
    operations: toRemove,
  };
};
