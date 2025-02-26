import { useState } from "react";
import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  useNavigate,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  Bleed,
  Button,
  ChoiceList,
  Divider,
  EmptyState,
  InlineStack,
  InlineError,
  Layout,
  Page,
  Text,
  TextField,
  Thumbnail,
  BlockStack,
  PageActions,
} from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";

import db from "../db.server";
import { GetItem, validateItem } from "../models/Item.server";

export async function loader({ request, params } : LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  if (params.id === "new") {
    return Response.json({
      destination: "product",
      title: "",
    });
  }

  return Response.json(await GetItem(String(params.id), admin.graphql));
}

export async function action({ request, params } : ActionFunctionArgs) {
    const { session } = await authenticate.admin(request);
    const Shop = session.shop;

    const data : any = {
        ...Object.fromEntries(await request.formData()),
        Shop,
    };

    console.log(data)

    if (data.action === "delete") {
        await db.item.delete({ where: { ID: String(params.id) } });
        return redirect("/app");
    }

    const errors = validateItem(data);

    console.log(errors)

    if (errors) {
        return Response.json({ errors }, { status: 422 });
    }

    
    const CurrentItem =
        params.id === "new"
        ? await db.item.create({ data })
        : await db.item.update({ where: { ID: String(params.id)}, data });

    return redirect(`/app/items/${CurrentItem.ID}`);
}

export default function QRCodeForm() {
    const errors : any = useActionData<typeof action>()?.errors || {} ;

    const CurrentItem : any = useLoaderData();
    const [formState, setFormState] :any = useState(CurrentItem);
    const [cleanFormState, setCleanFormState] = useState(CurrentItem);
    const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

    const nav = useNavigation();
    const isSaving =
        nav.state === "submitting" && nav.formData?.get("action") !== "delete";
    const isDeleting =
        nav.state === "submitting" && nav.formData?.get("action") === "delete";

    const navigate = useNavigate();

    async function selectProduct() {
        const products : any = await window.shopify.resourcePicker({
        type: "product",
        action: "select", // customized action verb, either 'select' or 'add',
        });

        if (products) {
        const { images, id, variants, title, handle } = products[0];

        setFormState({
            ...formState,
            productId: id,
            productVariantId: variants[0].id,
            productTitle: title,
            productHandle: handle,
            productAlt: images[0]?.altText,
            productImage: images[0]?.originalSrc,
        });
        }
    }

    const submit = useSubmit();
    function handleSave() {
        console.log(formState)
        const data = {
            ID: formState.UID,
            SerialNumber: formState.Serial || "N/A",
            ProductID: formState.productId || "",
            ProductVariantID: formState.productVariantId || "",
            ProductHandle: formState.productHandle || "",
        };

        setCleanFormState({ ...formState });
        submit(data, { method: "post" });
    }

    return (
        <Page>
        <ui-title-bar title={CurrentItem.id ? "Edit QR code" : "Create new QR code"}>
            <button variant="breadcrumb" onClick={() => navigate("/app")}>
            QR codes
            </button>
        </ui-title-bar>
        <Layout>
            <Layout.Section>
            <BlockStack gap="500">
                <Card>
                <BlockStack gap="500">
                    <Text as={"h2"} variant="headingLg">
                    Item Details
                    </Text>
                    <TextField
                    id="UID"
                    helpText="Scan the UID barcode"
                    label="Unique ID"
                    autoComplete="off"
                    value={formState.UID}
                    onChange={(UID) => setFormState({ ...formState, UID })}
                    error={errors.UID}
                    />
                    <TextField
                    id="SerialNumber"
                    helpText="Scan / Enter the serial number"
                    label="Serial Number"
                    autoComplete="off"
                    value={formState.Serial}
                    onChange={(Serial) => setFormState({ ...formState, Serial })}
                    error={errors.Serial}
                    />
                </BlockStack>
                </Card>
                <Card>
                <BlockStack gap="500">
                    <InlineStack align="space-between">
                    <Text as={"h2"} variant="headingLg">
                        Product
                    </Text>
                    {formState.productId ? (
                        <Button variant="plain" onClick={selectProduct}>
                        Change product
                        </Button>
                    ) : null}
                    </InlineStack>
                    {formState.productId ? (
                    <InlineStack blockAlign="center" gap="500">
                        <Thumbnail
                        source={formState.productImage || ImageIcon}
                        alt={formState.productAlt}
                        />
                        <Text as="span" variant="headingMd" fontWeight="semibold">
                        {formState.productTitle}
                        </Text>
                    </InlineStack>
                    ) : (
                    <BlockStack gap="200">
                        <Button onClick={selectProduct} id="select-product">
                        Select product
                        </Button>
                        {errors.productId ? (
                        <InlineError
                            message={errors.productId}
                            fieldID="myFieldID"
                        />
                        ) : null}
                    </BlockStack>
                    )}
                    <Bleed marginInlineStart="200" marginInlineEnd="200">
                    <Divider />
                    </Bleed>
                </BlockStack>
                </Card>
            </BlockStack>
            </Layout.Section>
            <Layout.Section>
                <PageActions
                    secondaryActions={[
                        {
                            content: "Delete",
                            loading: isDeleting,
                            disabled: !CurrentItem.id || !CurrentItem || isSaving || isDeleting,
                            destructive: true,
                            outline: true,
                            onAction: () =>
                            submit({ action: "delete" }, { method: "post" }),
                        },
                    ]}
                    primaryAction={{
                        content: "Save",
                        loading: isSaving,
                        disabled: !isDirty || isSaving || isDeleting,
                        onAction: ()=>{
                            console.log("onaction");
                            handleSave();
                        },
                    }}
                />
            
            </Layout.Section>
        </Layout>
        </Page>
    );
}