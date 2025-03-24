import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Badge, BlockStack, Card, EmptyState, IndexTable, Layout, Link, Page, Text, Thumbnail } from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";
import { GetItemOverview, GetManyItems, ItemOverview, ItemOverviewItem, ItemType } from "app/models/Item.server";

const CurrencyFormatter = new Intl.NumberFormat('en-GB',{style:"currency",currency:"GBP"})

export async function loader({ request, params } : LoaderFunctionArgs){
    const ItemOverviewDTO : ItemOverview | null = await GetItemOverview();

    return Response.json({
        ItemOverviewDTO
    })
}

const TableEmptyState = (() => (
    <EmptyState
        heading="Add some Items to get started"
        image = "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    />
))

const PITableRow = (({Item} : {Item : ItemOverviewItem})=>(
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
            <Text numeric as={"p"}>{CurrencyFormatter.format(Item.EstimatedCost)}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Badge progress={Item.Status == "Available" ? "incomplete" : "complete"} tone={Item.Status == "Available" ? "attention" : "success"}>{Item.Status}</Badge>
        </IndexTable.Cell>
    </IndexTable.Row>
))

const ItemTable = (({Items} : {Items : ItemOverviewItem[]})=>(
    <IndexTable
        emptyState={TableEmptyState()}
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
            <PITableRow Item={Item}/>
        ))
        }
    </IndexTable>
))

export default function ViewItem(){
    const {ItemOverviewDTO} : {ItemOverviewDTO : ItemOverview} = useLoaderData()

    return(
        <Page
            fullWidth
            title="Items"
            backAction={{content: 'Home', url: `/app`}}
        >
            <Layout>
                <Layout.Section variant="oneThird">
                    <Card>
                    <BlockStack gap="200">
                            <Text as="h2" variant="headingLg">Total</Text>
                            <Text as="p" numeric>{`${ItemOverviewDTO.TotalQuantity} Items`}</Text>
                            <Text as="p" numeric>{CurrencyFormatter.format(ItemOverviewDTO.TotalValue)}</Text>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section variant="oneThird">
                    <Card>
                        <BlockStack gap="200">
                            <Text as="h2" variant="headingLg">Total Available</Text>
                            <Text as="p" numeric>{`${ItemOverviewDTO.TotalQuantity-ItemOverviewDTO.TotalQuantitySold} Items`}</Text>
                            <Text as="p" numeric>{CurrencyFormatter.format(ItemOverviewDTO.TotalValue-ItemOverviewDTO.TotalValueSold)}</Text>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section variant="oneThird">
                    <Card>
                        <BlockStack gap="200">
                            <Text as="h2" variant="headingLg">Total Sold</Text>
                            <Text as="p" numeric>{`${ItemOverviewDTO.TotalQuantitySold} Items`}</Text>
                            <Text as="p" numeric>{CurrencyFormatter.format(ItemOverviewDTO.TotalValueSold)}</Text>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="200">
                            <Text as="h2" variant="headingLg">Items</Text>
                            <ItemTable Items={ItemOverviewDTO.Items}/>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    )
}