import db from "../db.server";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Badge, BlockStack, Box, Button, Card, DataTable, EmptyState, IndexTable, InlineGrid, Layout, Link, Page, PageActions, TableData, Text } from "@shopify/polaris";
import { PlusIcon } from '@shopify/polaris-icons';
import { Item } from "@shopify/polaris/build/ts/src/components/ActionList/components";
import { PurchaseCostType } from "app/models/PurchaseCost.server";
import { PurchaseItemType } from "app/models/PurchaseItem.server";
import { GetPurchaseOrder, PurchaseOrderType } from "app/models/PurchaseOrder.server";

const CurrencyFormatter = new Intl.NumberFormat('en-GB',{style:"currency",currency:"GBP"})


export async function loader({ request, params } : LoaderFunctionArgs){
    const PurchaseOrderDTO : PurchaseOrderType | null = await GetPurchaseOrder(Number(params.id));

    return Response.json({
        PurchaseOrderDTO
    })
}

export async function action({ request, params } : ActionFunctionArgs){
    
    const data : any = {
        ...Object.fromEntries(await request.formData())
    };

    const ParsdedIDs : string[] = JSON.parse("[" + data.PurchaseItems + "]")
    ParsdedIDs.forEach(async (PI: string) => {
        await db.purchaseItem.delete({ where: { ID: Number(PI) } })
    });

    await db.purchaseOrder.delete({ where: { ID: Number(params.id) } });

    return redirect(`/app/purchaseorders/`);
}

const PITableEmptyState = (
    <EmptyState
        heading="Add some purchase items to get started"
        image = "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    />
)

const PCTableEmptyState = (
    <EmptyState
        heading="Add some purchase costs to get started"
        image = "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    />
)

const PITableRow = (({PurchaseItem, CalculatedCosts, RateCosts} : {PurchaseItem : PurchaseItemType, CalculatedCosts : number, RateCosts : number})=>(
    <IndexTable.Row position={PurchaseItem.ID} id={String(PurchaseItem.ID)} key={PurchaseItem.ID}>
        <IndexTable.Cell>
            <Link dataPrimaryLink monochrome removeUnderline url={"/app/purchaseitems/"+PurchaseItem.ID}>
                <Text as="p">{PurchaseItem.ID}</Text>
            </Link>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Text as="p" numeric>{CurrencyFormatter.format(PurchaseItem.Cost)}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Text as="p" numeric>{CurrencyFormatter.format(PurchaseItem.Cost+CalculatedCosts+(PurchaseItem.Cost*(RateCosts/100)))}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Text as="p">{PurchaseItem.Title}</Text>
        </IndexTable.Cell>
    </IndexTable.Row>
))

const PITable = (({PurchaseItems, PurchaseCosts} : {PurchaseItems : PurchaseItemType[], PurchaseCosts : PurchaseCostType[]})=>{
    let TotalCosts : number = 0
    let TotalRate : number = 0

    PurchaseCosts.forEach(Cost => {
        if (Cost.Type=="Fixed") {
            TotalCosts+=Cost.Cost
        } else {
            TotalRate+=Cost.Rate
        }
    });

    let CalculatedCosts : number = TotalCosts/PurchaseItems.length


    return(
        <IndexTable
            emptyState={PITableEmptyState}
            itemCount={PurchaseItems.length}
            headings={[
                {title:"ID"},
                {title:"Price"},
                {title:"Est Subtotal"},
                {title:"Title"}
            ]}
            selectable={false}
        >
            {PurchaseItems.map(Item=>(
                <PITableRow PurchaseItem={Item} CalculatedCosts={CalculatedCosts} RateCosts={TotalRate}/>
            ))
            }
        </IndexTable>
    )
    
})

const PCTableRow = (({PurchaseCost} : {PurchaseCost : PurchaseCostType})=>(
    <IndexTable.Row position={PurchaseCost.ID} id={String(PurchaseCost.ID)} key={PurchaseCost.ID}>
        <IndexTable.Cell>
            <Link dataPrimaryLink monochrome removeUnderline url={"/app/purchasecosts/"+PurchaseCost.ID}>
                <Text as="p">{PurchaseCost.ID}</Text>
            </Link>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Text as="p" >{PurchaseCost.Description}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Text as="p" >{PurchaseCost.Type}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Text as="p" numeric>{CurrencyFormatter.format(PurchaseCost.Cost)}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
        <Text as="p" numeric>{`${PurchaseCost.Rate}%`}</Text>
        </IndexTable.Cell>
    </IndexTable.Row>
))

const PCTable = (({PurchaseCosts} : {PurchaseCosts : PurchaseCostType[]})=>(
    <IndexTable
        emptyState={PCTableEmptyState}
        itemCount={PurchaseCosts.length}
        headings={[
            {title:"ID"},
            {title:"Description"},
            {title:"Type"},
            {title:"Cost"},
            {title:"Rate"}
        ]}
        selectable={false}
    >
        {PurchaseCosts.map(Item=>(
            <PCTableRow PurchaseCost={Item}/>
        ))
        }
    </IndexTable>
))

const SummaryTable = (({PurchaseCosts,PurchaseItems} : {PurchaseCosts : PurchaseCostType[], PurchaseItems : PurchaseItemType[]})=>{

    let Rows : TableData[][] = []
    let SubTotal : number = 0
    let Total : number = 0

    PurchaseItems.forEach(Item => {
        SubTotal+=Item.Cost
        Rows.push([Item.Title,CurrencyFormatter.format(Item.Cost)])
    });

    PurchaseCosts.forEach(Cost => {
        if (Cost.Type=="Fixed") {
            Total+=Cost.Cost
            Rows.push([Cost.Description,CurrencyFormatter.format(Cost.Cost)])
        } else {
            let Effect : number = (SubTotal*(Cost.Rate/100))
            Total+=Effect
            Rows.push([Cost.Description,CurrencyFormatter.format(Effect)])
        }
    });

    Total+=SubTotal

    return(
        <DataTable
            headings={[
                "Description",
                "Cost"
            ]}
            columnContentTypes={[
                "text",
                "numeric"
            ]}
            rows={Rows}
            totals={["",CurrencyFormatter.format(Total)]}
            showTotalsInFooter
        />
    )
})


export default function ViewPurchaseOrder(){
    const {PurchaseOrderDTO} : any = useLoaderData()
    const CurrentOrder : PurchaseOrderType = {
        ID: PurchaseOrderDTO.ID,
        Description: PurchaseOrderDTO.Description,
        InvoiceURL: PurchaseOrderDTO.InvoiceURL,
        HasPaid: PurchaseOrderDTO.HasPaid,
        DatePaid: new Date(PurchaseOrderDTO.DatePaid),
        HasReceived: PurchaseOrderDTO.HasReceived,
        DateReceived: new Date(PurchaseOrderDTO.DateReceived),
        PurchaseItems: PurchaseOrderDTO.PurchaseItems,
        PurchaseCosts: PurchaseOrderDTO.PurchaseCosts,
        TotalCost: PurchaseOrderDTO.TotalCost,
        EstimatedCosts: 0
    }

    const submit = useSubmit();
    function DeletePurchaseOrder(){
        const data : any = {
            PurchaseItems: PurchaseOrderDTO.PurchaseItems.map((element: PurchaseItemType)=>{
                return(element.ID)
            })
        }
        submit(data, { method: "post" })
    }
    

    return(
        <Page
            fullWidth
            title="Purchase Order"
            backAction={{content: 'Purchase Orders', url: '/app/purchaseorders'}}
        >
            <Layout>
                <Layout.Section>
                    <Card>
                        <Text as="h2" variant="headingLg" >Details</Text>
                        <Box paddingBlock="200">
                            <BlockStack gap="200">
                                <BlockStack>
                                    <Text as="h3" variant="headingMd" >Description:</Text>
                                    <Text as="p" numeric>{CurrentOrder.Description}</Text>
                                </BlockStack>
                                <BlockStack>
                                    <Text as="h3" variant="headingMd" >ID:</Text>
                                    <Text as="p" numeric>{CurrentOrder.ID}</Text>
                                </BlockStack>
                                <BlockStack>
                                    <Text as="h3" variant="headingMd" >Date Paid:</Text>
                                    {CurrentOrder.HasPaid ?
                                        <Text as="p" numeric>{CurrentOrder.DatePaid?.toLocaleString()}</Text>
                                    :
                                        <Box>
                                            <Badge tone="attention">Not Paid</Badge>        
                                        </Box>
                                    }
                                    
                                </BlockStack>
                                <BlockStack>
                                    <Text as="h3" variant="headingMd">Date Received:</Text>
                                    {CurrentOrder.HasReceived ?
                                        <Text as="p" numeric>{CurrentOrder.DateReceived?.toLocaleString()}</Text>
                                    :
                                        <Box>
                                            <Badge tone="attention">Not Received</Badge>
                                        </Box>                  
                                    }
                                </BlockStack>
                                <BlockStack>
                                    <Text as="h3" variant="headingMd">Invoice URL:</Text>
                                    <Link url={CurrentOrder.InvoiceURL}>
                                        <Text as="p">{CurrentOrder.InvoiceURL}</Text>
                                    </Link>
                                </BlockStack>
                            </BlockStack>
                        </Box>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="200">
                            <Text as="h2" variant="headingLg" >Summary</Text>
                            <SummaryTable PurchaseCosts={CurrentOrder.PurchaseCosts} PurchaseItems={CurrentOrder.PurchaseItems}/>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="200">
                            <InlineGrid columns="1fr auto">
                                <Text as="h2" variant="headingLg" >Purchase Costs</Text>
                                <Button accessibilityLabel="Add variant" icon={PlusIcon} url={'/app/PurchaseCosts/edit/new?PurchaseOrder='+CurrentOrder.ID}>Add Cost</Button>
                            </InlineGrid>
                            <PCTable PurchaseCosts={CurrentOrder.PurchaseCosts}/>
                        </BlockStack>
                    </Card>         
                </Layout.Section>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="200">
                            <InlineGrid columns="1fr auto">
                                <Text as="h2" variant="headingLg" >Purchase Items</Text>
                                <Button accessibilityLabel="Add variant" icon={PlusIcon} url={'/app/PurchaseItems/edit/new?PurchaseOrder='+CurrentOrder.ID}>Add Item</Button>
                            </InlineGrid>
                            <PITable PurchaseItems={CurrentOrder.PurchaseItems} PurchaseCosts={CurrentOrder.PurchaseCosts}/>
                        </BlockStack>
                    </Card>         
                </Layout.Section>
                <Layout.Section>
                    <PageActions
                        primaryAction={
                            {
                                content: "Edit",
                                url:"/app/purchaseorders/edit/"+CurrentOrder.ID,
                            }
                        }
                        secondaryActions={[
                            {
                                content:"Delete",
                                destructive:true,
                                onAction() {
                                    DeletePurchaseOrder();
                                },
                            }
                        ]}
                    />
                </Layout.Section>
            </Layout>
        </Page>

    )
}