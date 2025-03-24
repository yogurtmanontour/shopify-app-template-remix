import db from "../db.server";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Badge, BlockStack, Box, Button, Card, EmptyState, IndexTable, InlineGrid, Layout, Link, Page, PageActions, Text, Thumbnail } from "@shopify/polaris";
import { ImageIcon, PlusIcon } from '@shopify/polaris-icons';
import { ItemType } from "app/models/Item.server";
import { GetPurchaseItem, PurchaseItemType } from "app/models/PurchaseItem.server";
import { authenticate } from "app/shopify.server";

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

const TableEmptyState = ((PurchaseItemID : number) => (
    <EmptyState
        heading="Add some Items to get started"
        image = "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        action={{content:"Add", url: `/app/Items/edit/new?PurchaseItem=${PurchaseItemID}`}}
    />
))

const PITableRow = (({Item, CostEach} : {Item : ItemType, CostEach : number})=>(
    <IndexTable.Row position={Item.ID} id={String(Item.ID)} key={Item.ID}>
        <IndexTable.Cell>
            <Link dataPrimaryLink monochrome removeUnderline url={"/app/Items/"+Item.ID}>
                <Text as={"p"} fontWeight="bold">{Item.ID}</Text>
            </Link>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Thumbnail
                source={Item.ProductImage || ImageIcon}
                alt={Item.ProductTitle}
                size="small"
            />
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Text as={"p"}>{Item.ProductTitle}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Text numeric as={"p"}>{Item.SerialNumber}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Text numeric as={"p"}>{CurrencyFormatter.format(CostEach)}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Badge progress={Item.Status == "Available" ? "incomplete" : "complete"} tone={Item.Status == "Available" ? "attention" : "success"}>{Item.Status}</Badge>
        </IndexTable.Cell>
    </IndexTable.Row>
))

const ItemTable = (({Items, CostEach, PurchaseItemID} : {Items : ItemType[], CostEach : number, PurchaseItemID : number})=>(
    <IndexTable
        emptyState={TableEmptyState(PurchaseItemID)}
        itemCount={Items.length}
        headings={[
            {title:"ID"},
            {title:"Thumbnail", hidden: true },
            {title:"Product"},
            {title:"Serial Number"},
            {title:"Est Cost"},
            {title:"Status"}
        ]}
        selectable={false}
    >
        {Items.map(Item=>( 
            <PITableRow Item={Item} CostEach={CostEach}/>
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
        PurchaseOrderID: PurchaseItemDTO.PurchaseOrderID,
        Items: PurchaseItemDTO.Items,
        FixedCosts: PurchaseItemDTO.FixedCosts,
        RateCosts: PurchaseItemDTO.RateCosts
    }

    const submit = useSubmit();
    function DeletePurchaseItem(){
        const data : any = {
            ReturnID : PurchaseItemDTO.PurchaseOrderID
        }
        submit(data, { method: "post" })
    }


    const EstimatedTotalCost : number = CurrentPurchaseItem.Cost+CurrentPurchaseItem.FixedCosts+(CurrentPurchaseItem.Cost*(CurrentPurchaseItem.RateCosts/100))
    const EstimatedTotalCostEach : number = EstimatedTotalCost/CurrentPurchaseItem.Items.length

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
                                    <Text as="h3" variant="headingMd" >Estimated Total Cost:</Text>
                                    <Text as="p" numeric>{CurrencyFormatter.format(EstimatedTotalCost)}</Text>
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
                                <Text as="h2" variant="headingLg" >Items</Text>
                                <Button accessibilityLabel="Add variant" icon={PlusIcon} url={'/app/Items/edit/new?PurchaseItem='+CurrentPurchaseItem.ID}>Add Item</Button>
                            </InlineGrid>
                            <ItemTable Items={CurrentPurchaseItem.Items} CostEach={EstimatedTotalCostEach} PurchaseItemID={CurrentPurchaseItem.ID}/>
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