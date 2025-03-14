import db from "../db.server";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Badge, BlockStack, Box, Button, Card, EmptyState, IndexTable, InlineGrid, Layout, Link, Page, PageActions, Text } from "@shopify/polaris";
import { PlusIcon } from '@shopify/polaris-icons';
import { GetPurchaseCost, PurchaseCostType } from "app/models/PurchaseCost.server";
import { GetPurchaseOrder, PurchaseOrderType } from "app/models/PurchaseOrder.server";

const CurrencyFormatter = new Intl.NumberFormat('en-GB',{style:"currency",currency:"GBP"})


export async function loader({ request, params } : LoaderFunctionArgs){
    const PurchaseCostDTO : PurchaseCostType | null = await GetPurchaseCost(Number(params.id));

    return Response.json({
        PurchaseCostDTO
    })
}

export async function action({ request, params } : ActionFunctionArgs){
    
    const data : any = {
        ...Object.fromEntries(await request.formData())
    };

    await db.purchaseCost.delete({ where: { ID: Number(params.id) } });

    return redirect(`/app/purchaseorders/${data.ReturnID}`);
}

export default function ViewPurchaseCost(){
    const {PurchaseCostDTO} : any = useLoaderData()
    const CurrentPurchaseCost : PurchaseCostType = {
        ID: PurchaseCostDTO.ID,
        PurchaseOrderID: PurchaseCostDTO.PurchaseOrderID,
        Description: PurchaseCostDTO.Description,
        Type: PurchaseCostDTO.Type,
        Rate: PurchaseCostDTO.Rate,
        Cost: PurchaseCostDTO.Cost
    }

    const submit = useSubmit();
    function DeletePurchaseCost(){
        const data : any = {
            ReturnID : PurchaseCostDTO.PurchaseOrderID
        }
        submit(data, { method: "post" })
    }

    return(
        <Page
            fullWidth
            title="Purchase Cost"
            backAction={{content: 'Purchase Order', url: `/app/purchaseorders/${CurrentPurchaseCost.PurchaseOrderID}`}}
        >
            <Layout>
                <Layout.Section>
                    <Card>
                        <Text as="h2" variant="headingLg" >Details</Text>
                        <Box paddingBlock="200">
                            <BlockStack gap="200">
                                <BlockStack>
                                    <Text as="h3" variant="headingMd" >ID:</Text>
                                    <Text as="p" numeric>{CurrentPurchaseCost.ID}</Text>
                                </BlockStack>
                                <BlockStack>
                                    <Text as="h3" variant="headingMd" >Description:</Text>
                                    <Text as="p">{CurrentPurchaseCost.Description}</Text>
                                </BlockStack>
                                <BlockStack>
                                    <Text as="h3" variant="headingMd" >Type:</Text>
                                    <Text as="p">{CurrentPurchaseCost.Type}</Text>
                                </BlockStack>
                                {CurrentPurchaseCost.Type=="Percentage" ?
                                    <BlockStack>
                                        <Text as="h3" variant="headingMd" >Cost:</Text>
                                        <Text as="p" numeric>{`${CurrentPurchaseCost.Rate}%`}</Text>
                                    </BlockStack>
                                :
                                    <BlockStack>
                                        <Text as="h3" variant="headingMd" >Cost:</Text>
                                        <Text as="p" numeric>{CurrencyFormatter.format(CurrentPurchaseCost.Cost)}</Text>
                                    </BlockStack>
                                }
                                <BlockStack>
                                    <Text as="h3" variant="headingMd" >Purchase Order:</Text>
                                    <Link url={`/app/purchaseorders/${CurrentPurchaseCost.PurchaseOrderID}`}>
                                        <Text as="p">{CurrentPurchaseCost.PurchaseOrderID}</Text>
                                    </Link>
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
                                url:`/app/purchaseCosts/edit/${CurrentPurchaseCost.ID}`,
                            }
                        }
                        secondaryActions={[
                            {
                                content:"Delete",
                                destructive:true,
                                onAction() {
                                    DeletePurchaseCost();
                                },
                            }
                        ]}
                    />
                </Layout.Section>
            </Layout>
        </Page>

    )
}