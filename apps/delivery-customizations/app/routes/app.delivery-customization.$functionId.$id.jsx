import { useState, useEffect } from "react";
import {
  Banner,
  Card,
  FormLayout,
  Layout,
  Page,
  TextField,
} from "@shopify/polaris";
import {
  Form,
  useActionData,
  useNavigation,
  useSubmit,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ params, request }) => {
  const { functionId, id } = params;
  const { admin } = await authenticate.admin(request);

  if (id != "new") {
    const gid = `gid://shopify/DeliveryCustomization/${id}`;

    const response = await admin.graphql(
      `#graphql
        query getDeliveryCustomization($id: ID!) {
          deliveryCustomization(id: $id) {
            id
            title
            enabled
            metafield(namespace: "$app:delivery-customization", key: "scheduled-delivery-with-in-home-setup-excluded-zipcodes") {
              id
              value
            }
          }
        }`,
      {
        variables: {
          id: gid,
        },
      }
    );

    const responseJson = await response.json();
    const deliveryCustomization = responseJson.data.deliveryCustomization;
    const metafieldValue = JSON.parse(deliveryCustomization.metafield.value);

    return {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deliveryTitle: metafieldValue.deliveryTitle,
        zipCodes: metafieldValue.zipCodes,
      }),
    };
  }

  return {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deliveryTitle: "",
      zipCodes: "",
    }),
  };
};

export const action = async ({ params, request }) => {
  const { functionId, id } = params;
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const zipCodes = formData.get("zipCodes");
  const deliveryTitle = formData.get("deliveryTitle");

  const deliveryCustomizationInput = {
    functionId,
    title: `Scheduled Delivery with In-Home Setup Excluded Zipcodes`,
    enabled: true,
    metafields: [
      {
        namespace: "$app:delivery-customization",
        key: "scheduled-delivery-with-in-home-setup-excluded-zipcodes",
        type: "json",
        value: JSON.stringify({
          deliveryTitle,
          zipCodes: zipCodes.split(",").map(zip => zip.trim().replace("'", "")).filter(zip => zip != "").join(", ")
        }),
      },
    ],
  };

  if (id != "new") {
    const response = await admin.graphql(
      `#graphql
        mutation updateDeliveryCustomization($id: ID!, $input: DeliveryCustomizationInput!) {
          deliveryCustomizationUpdate(id: $id, deliveryCustomization: $input) {
            deliveryCustomization {
              id
            }
            userErrors {
              message
            }
          }
        }`,
      {
        variables: {
          id: `gid://shopify/DeliveryCustomization/${id}`,
          input: deliveryCustomizationInput,
        },
      }
    );

    const responseJson = await response.json();
    const errors = responseJson.data.deliveryCustomizationUpdate?.userErrors;

    return json({ errors });
  } else {
    const response = await admin.graphql(
      `#graphql
        mutation createDeliveryCustomization($input: DeliveryCustomizationInput!) {
          deliveryCustomizationCreate(deliveryCustomization: $input) {
            deliveryCustomization {
              id
            }
            userErrors {
              message
            }
          }
        }`,
      {
        variables: {
          input: deliveryCustomizationInput,
        },
      }
    );

    const responseJson = await response.json();
    const errors = responseJson.data.deliveryCustomizationCreate?.userErrors;

    return json({ errors });
  }
};

export default function DeliveryCustomization() {
  const submit = useSubmit();
  const actionData = useActionData();
  const navigation = useNavigation();
  const loaderData = useLoaderData();
  const [zipCodes, setZipCodes] = useState(loaderData.zipCodes);
  const [deliveryTitle, setDeliveryTitle] = useState(loaderData.deliveryTitle);

  useEffect(() => {
    if (loaderData) {
      const parsedData = JSON.parse(loaderData.body);
      setZipCodes(parsedData.zipCodes);
      setDeliveryTitle(parsedData.deliveryTitle);
    }
  }, [loaderData]);

  const isLoading = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.errors.length === 0) {
      open('shopify:admin/settings/shipping/customizations', '_top')
    }
  }, [actionData?.errors]);

  const errorBanner = actionData?.errors.length ? (
    <Layout.Section>
    <Banner
      title="There was an error creating the customization."
      status="critical"
    >
      <ul>
        {actionData?.errors.map((error, index) => {
          return <li key={`${index}`}>{error.message}</li>;
        })}
      </ul>
    </Banner>
  </Layout.Section>
) : null;

const handleSubmit = () => {
  submit({ deliveryTitle, zipCodes }, { method: "post" });
};

return (
  <Page
    title="Scheduled Delivery with In-Home Setup Excluded Zipcodes"
    backAction={{
      content: "Delivery customizations",
      onAction: () => open('shopify:admin/settings/shipping/customizations', '_top')
    }}
    primaryAction={{
      content: "Save",
      loading: isLoading,
      onAction: handleSubmit,
    }}
  >
    <Layout>
      {errorBanner}
      <Layout.Section>
        <Card>
          <Form method="post">
            <FormLayout>
              <FormLayout.Group>
                <TextField
                  name="delivery-title"
                  type="text"
                  label="Delivery Title"
                  value={deliveryTitle}
                  onChange={setDeliveryTitle}
                  disabled={isLoading}
                  requiredIndicator
                  autoComplete="off"
                />
                <TextField
                  name="zipcodes"
                  type="text"
                  label="Excluded Zip codes (comma separated)"
                  value={zipCodes}
                  onChange={setZipCodes}
                  disabled={isLoading}
                  requiredIndicator
                  autoComplete="off"
                />
              </FormLayout.Group>
            </FormLayout>
          </Form>
        </Card>
      </Layout.Section>
    </Layout>
  </Page>
);
}
