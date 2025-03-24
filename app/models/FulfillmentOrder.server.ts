import { AdminApiContext } from "@shopify/shopify-app-remix/server"
import { AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients"

export interface FulfillmentOrderLineItem {
    ID : string
    ProductTitle : string
    ProductImage : string
    ProductVarientID : string
    Quantity : number
}

export interface FulfillmentOrder {
    ID : string
    CreatedDate : Date
    LineItems : FulfillmentOrderLineItem[]
}

export async function GetOrder(ID : number, Admin : AdminApiContextWithoutRest) : Promise<FulfillmentOrder | null>{
    const FulfillmentOrderResponse = await Admin.graphql(
        `
            query FulfillmentOrder($fulfillmentOrderId: ID!) {
                fulfillmentOrder(id: $fulfillmentOrderId) {
                    id
                    createdAt
                    lineItems (first:50){
                        nodes {
                            id
                            productTitle
                            image {
                                url
                            }
                            variant{
                                id
                            }
                            totalQuantity
                        }
                        pageInfo{
                            startCursor
                            endCursor
                            hasPreviousPage
                            hasNextPage
                        }
                    }
                }
            }
        `,
        {
            variables: {"fulfillmentOrderId": `gid://shopify/FulfillmentOrder/${ID}`}
        }
    );

    const {
        data: { fulfillmentOrder },
    } = await FulfillmentOrderResponse.json();

    if (fulfillmentOrder!=null) {
        return {
            ID : fulfillmentOrder.id,
            CreatedDate : fulfillmentOrder.createdAt,
            LineItems : fulfillmentOrder.lineItems.nodes.map((item: any)=>{
                const NewItem : FulfillmentOrderLineItem = {
                    ID : item.id,
                    ProductTitle : item.productTitle,
                    ProductImage : item.image.url,
                    Quantity : item.totalQuantity,
                    ProductVarientID : item.variant.id
                }
                return NewItem
            })
        }
    }
    return null
}

export async function GetOrders(Admin : AdminApiContextWithoutRest) : Promise<FulfillmentOrder[] | null>{
    const FulfillmentOrderResponse = await Admin.graphql(
        `
            query AssignedFulfillmentOrders{
                fulfillmentOrders (first: 50){
                    nodes {
                        id
                        createdAt
                        lineItems (first:250){
                            nodes {
                                id
                                totalQuantity
                            }
                        }
                    }
                    pageInfo {
                        startCursor
                        endCursor
                        hasNextPage
                        hasPreviousPage
                    }
                }
            }
        `
    );

    const {
        data: { fulfillmentOrders },
    } = await FulfillmentOrderResponse.json();

    if (fulfillmentOrders!=null) {
        let ProcessedFulfillmentOrders : FulfillmentOrder[] = []
        console.log(JSON.stringify(fulfillmentOrders))
        fulfillmentOrders.nodes.forEach((fulfillmentOrder: { id: any; createdAt: any; lineItems: { nodes: any[] } }) => {
            let TempFulfillmentOrder : FulfillmentOrder = {
                ID : fulfillmentOrder.id,
                CreatedDate : fulfillmentOrder.createdAt,
                LineItems : fulfillmentOrder.lineItems.nodes.map((item: any)=>{
                const NewItem : FulfillmentOrderLineItem = {
                    ID: item.id,
                    Quantity: item.totalQuantity,
                    ProductTitle: "",
                    ProductImage: "",
                    ProductVarientID: ""
                }
                return NewItem
            })
            }
            ProcessedFulfillmentOrders.push(TempFulfillmentOrder)
        });
        return ProcessedFulfillmentOrders
    }
    return null
}