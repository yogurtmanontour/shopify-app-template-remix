import { Bleed, BlockStack, Box, Button, Card, ChoiceList, DatePicker, Divider, FormLayout, Icon, InlineError, InlineStack, Layout, Page, PageActions, Popover, Text, TextField, Thumbnail } from "@shopify/polaris";

import db from "../db.server";
import { redirect, useLoaderData, useSearchParams, useSubmit } from "@remix-run/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useCallback, useState } from "react";
import { GetPurchaseOrder, GetPurchaseOrders, PurchaseOrderType } from "app/models/PurchaseOrder.server";

import CustomDatePicker from "app/Components/DatePicker";
import { CreatePurchaseCostType, GetPurchaseCost, PurchaseCostType } from "app/models/PurchaseCost.server";
import { AddItem, CreateItemType, GetItem, ItemType } from "app/models/Item.server";
import { authenticate } from "app/shopify.server";
import { ImageIcon } from "@shopify/polaris-icons";

export async function loader({ request, params } : LoaderFunctionArgs){
    const { admin } = await authenticate.admin(request);
    
    let ItemDTO : ItemType | null = {
        ID: 0,
        PurchaseItemID: 0,
        ProductID: "",
        ProductVariantID: "",
        ProductHandle: "",
        SerialNumber: "",
        ProductTitle: "",
        ProductImage: "",
        ProductAlt: ""
    }

    if (params.id!="new") {
        ItemDTO = await GetItem(Number(params.id),admin.graphql);
    }

    const PurchaseOrders = await GetPurchaseOrders();

    return Response.json({
        ItemDTO,
        PurchaseOrders
    })
}

export async function action({ request, params } : ActionFunctionArgs){
    const { admin } = await authenticate.admin(request);
    const RequestData = await request.formData()

    const data : CreateItemType = {
        ID:  Number(RequestData.get("ID")),
        PurchaseItemID:  Number(RequestData.get("PurchaseItemID")),
        ProductID: String(RequestData.get("ProductID")),
        ProductVariantID: String(RequestData.get("ProductVariantID")),
        ProductHandle: String(RequestData.get("ProductHandle")),
        ProductTitle: String(RequestData.get("ProductTitle")),
        ProductImage: String(RequestData.get("ProductImage")),
        ProductAlt: String(RequestData.get("ProductAlt")),
        SerialNumber: String(RequestData.get("SerialNumber"))
    };

    const CurrentCost = params.id=="new" ? AddItem(data,admin): await db.item.update({ where: { ID: Number(params.id)}, data })
    

    return redirect(`/app/items/${data.ID}`);
}

export default function EditItem(){
    const [searchParams, setSearchParams] = useSearchParams();

    const {ItemDTO} : any = useLoaderData()
    const CurrentItem : ItemType = {
        ID: ItemDTO.ID,
        PurchaseItemID: ItemDTO.PurchaseItemID,
        ProductID: ItemDTO.ProductID,
        ProductVariantID: ItemDTO.ProductVariantID,
        ProductHandle: ItemDTO.ProductHandle,
        SerialNumber: ItemDTO.SerialNumber,
        ProductTitle: ItemDTO.ProductTitle,
        ProductImage: ItemDTO.ProductImage,
        ProductAlt: ItemDTO.ProductAlt
    }
    
    const [FormState,SetFormState] = useState(CurrentItem)

    async function selectProduct() {
        const products : any = await window.shopify.resourcePicker({
        type: "product",
        action: "select", // customized action verb, either 'select' or 'add',
        });

        if (products) {
        const { images, id, variants, title, handle } = products[0];

        SetFormState({
            ...FormState,
            ProductID: id,
            ProductVariantID: variants[0].id,
            ProductTitle: title,
            ProductHandle: handle,
            ProductAlt: images[0]?.altText,
            ProductImage: images[0]?.originalSrc,
        });
        }
    }

    const submit = useSubmit();
    function SaveData(){
        const data : any = {
            ID: FormState.ID,
            PurchaseItemID: Number(searchParams.get("PurchaseItem") || FormState.PurchaseItemID),
            ProductID: FormState.ProductID,
            ProductVariantID: FormState.ProductVariantID,
            ProductHandle: FormState.ProductHandle,
            ProductTitle: FormState.ProductTitle,
            ProductImage: FormState.ProductImage,
            ProductAlt: FormState.ProductAlt,
            SerialNumber: FormState.SerialNumber,
        }
        submit(data, { method: "post" })
    }

    return(
        <Page
            
            title={CurrentItem.ID==0? "Create Item" : "Edit Item"}
            backAction={{content: 'Purchase Order', url: `/app/purchaseorders/${CurrentItem.PurchaseItemID}`}}
        >
            <Layout>
                <Layout.Section>
                    <Card>
                        <Text as="h2" variant="headingLg">{CurrentItem.ID==0? "New Item" : "Item: "+CurrentItem.ID}</Text>
                        <Box paddingBlock="200">
                            <FormLayout>
                                <BlockStack gap="400">
                                    <TextField 
                                        type="number"
                                        id="ID"
                                        label="Unique ID"
                                        autoComplete="off"
                                        value={String(FormState.ID)}
                                        onChange={IDString=>{
                                            let ID = Number(IDString)
                                            SetFormState({...FormState,ID})
                                        }}
                                    />
                                    <TextField 
                                        id="SerialNumber"
                                        label="Serial Number"
                                        autoComplete="off"
                                        value={FormState.SerialNumber}
                                        onChange={SerialNumber=>{
                                            SetFormState({...FormState,SerialNumber})
                                        }}
                                    />
                                </BlockStack>
                            </FormLayout>
                        </Box>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            <Text as={"h2"} variant="headingLg">
                                Product
                            </Text>
                            {FormState.ProductID ? (
                            <InlineStack blockAlign="center" gap="500">
                                <Thumbnail
                                source={FormState.ProductImage || ImageIcon}
                                alt={FormState.ProductAlt}
                                />
                                <Text as="span" variant="headingMd" fontWeight="semibold">
                                {FormState.ProductTitle}
                                </Text>
                            </InlineStack>
                            ) : (
                            <BlockStack gap="200">
                                <Button onClick={selectProduct} id="select-product">
                                Select product
                                </Button>
                            </BlockStack>
                            )}
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <PageActions
                        primaryAction={
                            {
                                content: "Save",
                                onAction() {
                                    SaveData()
                                },
                            }
                        }
                    />
                </Layout.Section>
            </Layout>
        </Page>
    )
}