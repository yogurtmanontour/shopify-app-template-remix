import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BlockStack, Card, IndexTable, Layout, Link, Page, Text } from "@shopify/polaris"
import { FulfillmentOrder, GetOrders } from "app/models/FulfillmentOrder.server"
import { authenticate } from "app/shopify.server";

export async function loader({ request, params } : LoaderFunctionArgs){
    const { admin } = await authenticate.admin(request);
    const FulfillmentOrdersDTO : FulfillmentOrder[] | null = await GetOrders(admin);
    return Response.json({
        FulfillmentOrdersDTO
    })
}

const OrderTableItem = (({Order} : {Order : FulfillmentOrder})=>{
    let ItemSum : number = 0
    Order.LineItems.forEach(LineItem => {
        ItemSum+=LineItem.Quantity
    });

    const ShortID = Order.ID.slice(-13)

    return (
        <IndexTable.Row id={Order.ID} position={0}>
            <IndexTable.Cell>
                <Link dataPrimaryLink monochrome removeUnderline url={"/app/Orders/"+ShortID}>
                    <Text numeric as="p">{ShortID}</Text>
                </Link>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text numeric as="p">{Order.CreatedDate.toLocaleDateString()}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text numeric as="p">{ItemSum}</Text>
            </IndexTable.Cell>
        </IndexTable.Row>
    )
})

const OrderTable = (({Orders}:{Orders: FulfillmentOrder[]})=>(
    <IndexTable headings={[
        {title:"ID"},
        {title:"Created at"},
        {title:"Total Items"}
    ]}
    itemCount={Orders.length}
    selectable={false}
    >
        {Orders.map(Order=>(
            <OrderTableItem Order={Order}/>
        ))}
    </IndexTable>
))

export default function ViewOrders() {
    let FulfillmentOrders : FulfillmentOrder[] = []
    const {FulfillmentOrdersDTO} : any = useLoaderData()
    FulfillmentOrdersDTO.forEach((FulfillmentOrder: FulfillmentOrder) => {
        FulfillmentOrder.CreatedDate = new Date(FulfillmentOrder.CreatedDate)
        FulfillmentOrders.push(FulfillmentOrder)
    });

    return (
        <Page
            fullWidth
            title="Orders"
            backAction={{content: 'Home', url: `/app`}}
        >
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="200">
                            <Text as="h2" variant="headingLg" >Unfulfilled Orders</Text>
                            <OrderTable Orders={FulfillmentOrders}/>
                        </BlockStack>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    )
}