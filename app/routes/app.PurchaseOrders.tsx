import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Badge, Card, EmptyState, IndexTable, Link, Page, Text } from "@shopify/polaris";
import { GetPurchaseOrders, PurchaseOrderType } from "app/models/PurchaseOrder.server";

const CurrencyFormatter = new Intl.NumberFormat('en-GB',{style:"currency",currency:"GBP"})

export async function loader({ request } : LoaderFunctionArgs){
    const PurchaseOrders : PurchaseOrderType[] = await GetPurchaseOrders();

    return Response.json({
        PurchaseOrders
    })
}

const TableEmptyState = (
    <EmptyState
        heading="Create some purchase orders to get started"
        image = "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        action={{content:"Create", url:"/app/purchaseorders/edit/new"}}
    />
)
const POTable = (({PurchaseOrders} : {PurchaseOrders : PurchaseOrderType[]})=>(
    <IndexTable
        emptyState={TableEmptyState}
        itemCount={PurchaseOrders.length}
        headings={[
            {title:"ID"},
            {title:"Description"},
            {title:"Cost"},
            {title:"Est Subtotal"},
            {title:"Date Paid"},
            {title:"Date Received"},
        ]}
        selectable={false}
    >
        {PurchaseOrders.map(Item=>(
            <POTableRow PurchaseOrder={Item}/>
        ))
        }
    </IndexTable>
))
const POTableRow = (({PurchaseOrder} : {PurchaseOrder : PurchaseOrderType})=>(
    <IndexTable.Row position={PurchaseOrder.ID} id={String(PurchaseOrder.ID)} key={PurchaseOrder.ID}>
        <IndexTable.Cell>
            <Link dataPrimaryLink monochrome removeUnderline url={"/app/purchaseorders/"+PurchaseOrder.ID}>
                <Text as="p">{PurchaseOrder.ID}</Text>
            </Link>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Text as="p" numeric>{PurchaseOrder.Description}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Text as="p" numeric>{CurrencyFormatter.format(PurchaseOrder.TotalCost)}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
            <Text as="p" numeric>{CurrencyFormatter.format(PurchaseOrder.TotalCost+PurchaseOrder.EstimatedCosts)}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
            {PurchaseOrder.HasPaid ? <Text as="p">{PurchaseOrder.DatePaid.toLocaleDateString()}</Text> : <Badge tone="attention">Unpaid</Badge>}
        </IndexTable.Cell>
        <IndexTable.Cell>
            {PurchaseOrder.HasReceived ? <Text as="p">{PurchaseOrder.DateReceived.toLocaleDateString()}</Text> : <Badge tone="attention">Expected</Badge>}
        </IndexTable.Cell>
    </IndexTable.Row>
))

export default function PurchaseOrders() {
    const {PurchaseOrders} : any = useLoaderData()
    const Processed : PurchaseOrderType[] = PurchaseOrders.map((Value: any)=>{
        const Post : PurchaseOrderType = {
            ID: Value.ID,
            Description: Value.Description,
            InvoiceURL: Value.InvoiceURL,
            DatePaid: new Date(Value.DatePaid),
            DateReceived: new Date(Value.DateReceived),
            PurchaseItems: [],
            PurchaseCosts: [],
            TotalCost: Value.TotalCost,
            HasPaid: Value.HasPaid,
            HasReceived: Value.HasReceived,
            EstimatedCosts: Value.EstimatedCosts
        }
        return Post
    })

    return  (
        <Page
            fullWidth
            title="Purchase Orders"
            backAction={{content: 'Home', url: '/app'}}
            primaryAction={{content:'Create', url:'/app/purchaseorders/edit/new'}}
        >
            <Card>
                <POTable PurchaseOrders={Processed}/>
            </Card>
        </Page>
    )
}