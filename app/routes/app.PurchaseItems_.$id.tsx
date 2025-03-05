import db from "../db.server";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Badge, BlockStack, Box, Button, Card, EmptyState, IndexTable, InlineGrid, Layout, Link, Page, PageActions, Text } from "@shopify/polaris";
import { PlusIcon } from '@shopify/polaris-icons';
import { GetPurchaseItem, PurchaseItemType } from "app/models/PurchaseItem.server";
import { GetPurchaseOrder, PurchaseOrderType } from "app/models/PurchaseOrder.server";

const CurrencyFormatter = new Intl.NumberFormat('en-GB',{style:"currency",currency:"GBP"})


export async function loader({ request, params } : LoaderFunctionArgs){
    const PurchaseItemDTO : PurchaseItemType | null = await GetPurchaseItem(Number(params.id));

    return Response.json({
        PurchaseItemDTO
    })
}

export async function action({ request, params } : ActionFunctionArgs){
    
    const data : any = {
        ...Object.fromEntries(await request.formData())
    };

    await db.purchaseItem.delete({ where: { ID: Number(params.id) } });

    return redirect(`/app/purchaseorders/${data.ReturnID}`);
}

const TableEmptyState = (
    <EmptyState
        heading="Add some purchase items to get started"
        image = "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        action={{content:"Add", url:"/app/PurchaseItems/"}}
    />
)

const PITableRow = (({PurchaseItem} : {PurchaseItem : PurchaseItemType})=>(
    <IndexTable.Row position={PurchaseItem.ID} id={String(PurchaseItem.ID)} key={PurchaseItem.ID}>
        <IndexTable.Cell>
            <Text as="p">{PurchaseItem.ID}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Text as="p" numeric>{CurrencyFormatter.format(PurchaseItem.Cost)}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Text as="p">{PurchaseItem.Title}</Text>
        </IndexTable.Cell>
    </IndexTable.Row>
))

const PITable = (({PurchaseItems} : {PurchaseItems : PurchaseItemType[]})=>(
    <IndexTable
        emptyState={TableEmptyState}
        itemCount={PurchaseItems.length}
        headings={[
            {title:"ID"},
            {title:"Cost"},
            {title:"Title"}
        ]}
        selectable={false}
    >
        {PurchaseItems.map(Item=>(
            <PITableRow PurchaseItem={Item}/>
        ))
        }
    </IndexTable>
))

export default function ViewPurchaseItem(){
    const {PurchaseItemDTO} : any = useLoaderData()
    const CurrentPurchaseItem : PurchaseItemType = {
        ID: PurchaseItemDTO.ID,
        Title: PurchaseItemDTO.Title,
        Cost: PurchaseItemDTO.Cost,
        PurchaseOrderID: PurchaseItemDTO.PurchaseOrderID
    }

    const submit = useSubmit();
    function DeletePurchaseItem(){
        const data : any = {
            ReturnID : PurchaseItemDTO.PurchaseOrderID
        }
        submit(data, { method: "post" })
    }

    return(
        <Page
            fullWidth
            title="Purchase Item"
            backAction={{content: 'Purchase Order', url: `/app/purchaseorders/${CurrentPurchaseItem.PurchaseOrderID}`}}
        >
            <Layout>
                <Layout.Section>
                    <Card>
                        <Text as="h2" variant="headingLg" >Details</Text>
                        <Box paddingBlock="200">
                            <BlockStack gap="200">
                                <BlockStack>
                                    <Text as="h3" variant="headingMd" >ID:</Text>
                                    <Text as="p" numeric>{CurrentPurchaseItem.ID}</Text>
                                </BlockStack>
                                <BlockStack>
                                    <Text as="h3" variant="headingMd" >Cost:</Text>
                                    <Text as="p" numeric>{CurrencyFormatter.format(CurrentPurchaseItem.Cost)}</Text>
                                </BlockStack>
                                <BlockStack>
                                    <Text as="h3" variant="headingMd" >Purchase Order:</Text>
                                    <Link url={`/app/purchaseorders/${CurrentPurchaseItem.PurchaseOrderID}`}>
                                        <Text as="p">{CurrentPurchaseItem.PurchaseOrderID}</Text>
                                    </Link>
                                </BlockStack>
                            </BlockStack>
                        </Box>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="200">
                            <InlineGrid columns="1fr auto">
                                <Text as="h2" variant="headingLg" >Purchase Items</Text>
                                {/* <Button accessibilityLabel="Add variant" icon={PlusIcon} url={'/app/PurchaseItems/'+CurrentOrder.ID}>Add Item</Button> */}
                            </InlineGrid>
                            {/* <PITable PurchaseItems={CurrentOrder.PurchaseItems}/> */}
                        </BlockStack>
                    </Card>         
                </Layout.Section>
                <Layout.Section>
                    <PageActions
                        primaryAction={
                            {
                                content: "Edit",
                                url:`/app/purchaseitems/edit/${CurrentPurchaseItem.ID}`,
                            }
                        }
                        secondaryActions={[
                            {
                                content:"Delete",
                                destructive:true,
                                onAction() {
                                    DeletePurchaseItem();
                                },
                            }
                        ]}
                    />
                </Layout.Section>
            </Layout>
        </Page>

    )
}