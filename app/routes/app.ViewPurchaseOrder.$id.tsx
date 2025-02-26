import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { BlockStack, Box, Button, Card, DescriptionList, EmptyState, Form, FormLayout, IndexTable, InlineGrid, Layout, Link, Page, Text, TextField } from "@shopify/polaris";
import { CheckIcon, EditIcon, PlusIcon } from '@shopify/polaris-icons';
import { PurchaseItemType } from "app/models/PurchaseItem.server";
import { GetPurchaseOrder, PurchaseOrderType } from "app/models/PurchaseOrder.server";

const CurrencyFormatter = new Intl.NumberFormat('en-GB',{style:"currency",currency:"GBP"})


export async function loader({ request, params } : LoaderFunctionArgs){
    const PurchaseOrderDTO : PurchaseOrderType | null = await GetPurchaseOrder(Number(params.id));

    return Response.json({
        PurchaseOrderDTO
    })
}

const TableEmptyState = (
    <EmptyState
        heading="Add some purchase items to get started"
        image = "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        action={{content:"Add", url:"/app/createpurchaseitem"}}
    />
)

const PITableRow = (({PurchaseItem} : {PurchaseItem : PurchaseItemType})=>(
    <IndexTable.Row position={PurchaseItem.ID} id={String(PurchaseItem.ID)} >
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

export default function PurchaseItems(){
    const {PurchaseOrderDTO} : any = useLoaderData()
    const CurrentOrder : PurchaseOrderType = {
        ID: PurchaseOrderDTO.ID,
        InvoiceURL: PurchaseOrderDTO.InvoiceURL,
        DatePaid: new Date(PurchaseOrderDTO.DatePaid),
        DateReceived: new Date(PurchaseOrderDTO.DateReceived),
        PurchaseItems: PurchaseOrderDTO.PurchaseItems,
        TotalCost: PurchaseOrderDTO.TotalCost
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
                        <InlineGrid columns="1fr auto">
                            <Text as="h2" variant="headingLg" >Details</Text>
                            <Button
                                icon={EditIcon}
                                accessibilityLabel="Edit"
                            />
                        </InlineGrid>
                        <Box paddingBlock="200">
                            <BlockStack gap="200">
                                <BlockStack>
                                    <Text as="h3" variant="headingMd" >ID:</Text>
                                    <Text as="p" numeric>{CurrentOrder.ID}</Text>
                                </BlockStack>
                                <BlockStack>
                                    <Text as="h3" variant="headingMd" >Date Paid:</Text>
                                    <Text as="p" numeric>{CurrentOrder.DatePaid?.toLocaleDateString() || "N/A"}</Text>
                                </BlockStack>
                                <BlockStack>
                                    <Text as="h3" variant="headingMd">Date Received:</Text>
                                    <Text as="p" numeric>{CurrentOrder.DateReceived?.toLocaleDateString() || "N/A"}</Text>
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
                            <InlineGrid columns="1fr auto">
                                <Text as="h2" variant="headingLg" >Purchase Items</Text>
                                <Button accessibilityLabel="Add variant" icon={PlusIcon} url={'/app/createPurchaseItem/'+CurrentOrder.ID}>Add Item</Button>
                            </InlineGrid>
                            <PITable PurchaseItems={CurrentOrder.PurchaseItems}/>
                        </BlockStack>
                    </Card>         
                </Layout.Section>
            </Layout>
        </Page>

    )
}