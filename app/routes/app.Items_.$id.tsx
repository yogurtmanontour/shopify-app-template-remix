import db from "../db.server";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Badge, BlockStack, Box, Button, Card, EmptyState, IndexTable, InlineGrid, InlineStack, Layout, Link, Page, PageActions, Text, Thumbnail } from "@shopify/polaris";
import { ImageIcon, PlusIcon } from '@shopify/polaris-icons';
import { Session } from "@shopify/shopify-app-remix/server";
import { DeleteItem, GetItem, ItemType } from "app/models/Item.server";
import { GetPurchaseCost, PurchaseCostType } from "app/models/PurchaseCost.server";
import { GetPurchaseOrder, PurchaseOrderType } from "app/models/PurchaseOrder.server";
import { authenticate } from "app/shopify.server";

const CurrencyFormatter = new Intl.NumberFormat('en-GB',{style:"currency",currency:"GBP"})


export async function loader({ request, params } : LoaderFunctionArgs){
    const ItemDTO : ItemType | null = await GetItem(Number(params.id));

    return Response.json({
        ItemDTO
    })
}

export async function action({ request, params } : ActionFunctionArgs){
    const { admin } = await authenticate.admin(request);

    const data : any = {
        ...Object.fromEntries(await request.formData())
    };

    DeleteItem(Number(params.id), admin)

    return redirect(`/app/purchaseitems/${data.ReturnID}`);
}

export default function ViewItem(){
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

    const submit = useSubmit();
    function DeleteItem(){
        const data : any = {
            ReturnID : CurrentItem.PurchaseItemID
        }
        submit(data, { method: "post" })
    }

    return(
        <Page
            fullWidth
            title="Item"
            backAction={{content: 'Purchase Item', url: `/app/purchaseitems/${CurrentItem.PurchaseItemID}`}}
        >
            <Layout>
                <Layout.Section>
                    <Card>
                        <Text as="h2" variant="headingLg" >Details</Text>
                        <Box paddingBlock="200">
                            <BlockStack gap="200">
                                <BlockStack>
                                    <Text as="h3" variant="headingMd" >ID:</Text>
                                    <Text as="p" numeric>{CurrentItem.ID}</Text>
                                </BlockStack>
                                <BlockStack>
                                    <Text as="h3" variant="headingMd" >Serial Number:</Text>
                                    <Text as="p" numeric>{CurrentItem.SerialNumber}</Text>
                                </BlockStack>
                                <BlockStack>
                                <Text as="h3" variant="headingMd" >Purchase Item:</Text>
                                    <Link url={`/app/purchaseitems/${CurrentItem.PurchaseItemID}`}>
                                        <Text as="p">{CurrentItem.PurchaseItemID}</Text>
                                    </Link>
                                </BlockStack>
                                <BlockStack gap="200">
                                    <Text as="h3" variant="headingMd" >Product:</Text>
                                    <InlineStack blockAlign="center" gap="500">
                                        <Thumbnail
                                            source={CurrentItem.ProductImage || ImageIcon}
                                            alt={CurrentItem.ProductAlt}
                                        />
                                        <Link url={"shopify://admin/products/"+CurrentItem.ProductID.slice(-13)}>
                                            <Text as="span" variant="headingMd" fontWeight="semibold">{CurrentItem.ProductTitle}</Text>
                                        </Link>
                                    </InlineStack>
                                </BlockStack>
                                
                            </BlockStack>
                        </Box>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <PageActions
                        primaryAction={
                            {
                                content: "Edit",
                                url:`/app/items/edit/${CurrentItem.ID}`,
                            }
                        }
                        secondaryActions={[
                            {
                                content:"Delete",
                                destructive:true,
                                onAction() {
                                    DeleteItem();
                                },
                            },
                            {
                                content:"Duplicate",
                                url:`/app/Items/edit/new?CopyFrom=${CurrentItem.ID}`,
                            }
                        ]}
                    />
                </Layout.Section>
            </Layout>
        </Page>

    )
}