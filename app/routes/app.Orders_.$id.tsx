import { FulfillmentRecord } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { BlockStack, Box, Button, Card, FormLayout, IndexTable, Layout, Page, Text, TextField, Thumbnail } from "@shopify/polaris"
import { ImageIcon, PlusIcon, UndoIcon } from "@shopify/polaris-icons";
import { FulfillmentOrder, FulfillmentOrderLineItem, GetOrder } from "app/models/FulfillmentOrder.server";
import { CreateFulfillmentRecord, FulfillmentRecordType, GetFullfilmentRecordByFullfilmentOrder } from "app/models/FulfillmentRecord.server";
import { CheckAndFulfillItem, FulfillItem, GetItem, ItemType, UndoFulfillment } from "app/models/Item.server";
import { authenticate } from "app/shopify.server";
import { useState } from "react";

export async function loader({ request, params } : LoaderFunctionArgs){
    const { admin } = await authenticate.admin(request);
    const FulfillmentOrderDTO : FulfillmentOrder | null = await GetOrder(Number(params.id),admin);
    const FulfillmentRecord : FulfillmentRecord | null = await GetFullfilmentRecordByFullfilmentOrder(`gid://shopify/FulfillmentOrder/${params.id}`)
    return Response.json({
        FulfillmentOrderDTO,
        FulfillmentRecord
    })
}

export async function action({ request, params } : ActionFunctionArgs){
    const { admin } = await authenticate.admin(request);
    
    const data : any = {
        ...Object.fromEntries(await request.formData())
    };

    //Was the action to undo a fulfillment
    if (request.method=="PATCH") {
        const {ItemID} : {ItemID : Number} = data
        const ItemResponse = UndoFulfillment(ItemID)
        if (ItemResponse!=null) {
            return Response.json({}, { status: 200 });        
        }
        return Response.json({Error : "Could not undo fulfillment"}, { status: 500 });
    }

    const {Barcode, FulfillmentOrderID} : {Barcode : string, FulfillmentOrderID : string} = data

    const CurrentItem = await GetItem(Number(Barcode))
    if (CurrentItem!=null) {
        if (CurrentItem.Status=="Available") {
            const CurrentFulfillmentOrder = await GetOrder(Number(FulfillmentOrderID.slice(-13)),admin)
            if (CurrentFulfillmentOrder) {
                //Does a fulfillment record exist in DB
                let CurrentFulfillmentRecord = await GetFullfilmentRecordByFullfilmentOrder(FulfillmentOrderID)
                if (CurrentFulfillmentRecord) {
                    return await CheckAndFulfillItem(CurrentFulfillmentOrder,CurrentFulfillmentRecord,CurrentItem)
                } else {
                    CurrentFulfillmentRecord = await CreateFulfillmentRecord({FulfillmentOrderID : FulfillmentOrderID})
                    if (CurrentFulfillmentRecord) {
                        return await CheckAndFulfillItem(CurrentFulfillmentOrder,CurrentFulfillmentRecord,CurrentItem)
                    }
                    return Response.json({Error : "Could not create fulfillment record"}, { status: 500 });
                }
            }
            return Response.json({Error : "Could not get fulfillment order"}, { status: 500 });
        } else {
            return Response.json({Error : "Item already fulfilled"}, { status: 409 });
        }
    } else {
        return Response.json({Error : "Item does not exist"}, { status: 400 });
    }
}

const LineItemRow = (({LineItem, FulfillmentRecord}:{LineItem : FulfillmentOrderLineItem, FulfillmentRecord : FulfillmentRecordType})=>{
    const FulfilledItems = FulfillmentRecord ? FulfillmentRecord.Items.filter(x=>x.ProductVariantID==LineItem.ProductVarientID).length : 0
    const OverallCount = FulfilledItems-LineItem.Quantity

    return(
        <IndexTable.Row id={LineItem.ID} position={0}>
            <IndexTable.Cell>
                <Thumbnail
                    source={LineItem.ProductImage || ImageIcon}
                    alt={LineItem.ProductTitle}
                    size="small"
                />
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text as={"p"}>{LineItem.ProductTitle}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text numeric as={"p"}>{LineItem.Quantity}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text numeric as={"p"}>{FulfilledItems || 0}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text numeric as={"p"} tone={OverallCount<0?"critical":"success"}>{OverallCount || 0}</Text>
            </IndexTable.Cell>
        </IndexTable.Row>
    )
})

const LineItemTable = (({LineItems, FulfillmentRecord} : {LineItems : FulfillmentOrderLineItem[], FulfillmentRecord : FulfillmentRecordType})=>(
    <IndexTable headings={[
        {title:"Thumbnail", hidden: true },
        {title:"Product"},
        {title:"Required"},
        {title:"Fulfilled"},
        {title:"Overall"}
    ]} 
    itemCount={LineItems.length}
    selectable={false}>
        {
            LineItems.map(Item=>(
                <LineItemRow LineItem={Item} FulfillmentRecord={FulfillmentRecord}/>
            ))
        }
    </IndexTable>
))

const FulfillmentRecordRow = (({Item, UndoAction}:{Item : ItemType, UndoAction : Function})=>(
        <IndexTable.Row id={String(Item.ID)} position={Item.ID}>
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
                <Text numeric as={"p"}>{Item.ID}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Button icon={UndoIcon} accessibilityLabel="Undo fulfillment" onClick={()=>UndoAction(Item.ID)}/>
            </IndexTable.Cell>
        </IndexTable.Row>
))

const FulfillmentRecordTable = (({FulfillmentRecord, UndoAction} : { FulfillmentRecord : FulfillmentRecordType, UndoAction : Function})=>(
    <IndexTable headings={[
        {title:"Thumbnail", hidden: true },
        {title:"Product"},
        {title:"ID"},
        {title:"Undo", hidden: true}
    ]} 
    itemCount={FulfillmentRecord.Items.length}
    selectable={false}>
        {
            FulfillmentRecord.Items.map(Item=>(
                <FulfillmentRecordRow Item={Item} UndoAction={UndoAction}/>
            ))
        }
    </IndexTable>
))

export default function ViewOrder() {
    const {FulfillmentOrderDTO} : any = useLoaderData()
    FulfillmentOrderDTO.CreatedDate = new Date(FulfillmentOrderDTO.CreatedDate)
    const CurrentFulfillmentOrder : FulfillmentOrder = FulfillmentOrderDTO
    const {FulfillmentRecord} : {FulfillmentRecord : FulfillmentRecordType} = useLoaderData()

    const [BarcodeState,SetBarcodeState] = useState("")

    //returned from action
    const Error  : string | null = useActionData<typeof action>()?.Error

    const submit = useSubmit();

    function SaveData(){
        const data : any = {
            Barcode: BarcodeState,
            FulfillmentOrderID : CurrentFulfillmentOrder.ID
        }
        submit(data, { method: "post" })
    }

    function UndoFulfillment(ItemID : Number){
        const data : any = {
            ItemID: ItemID
        }
        submit(data, { method: "patch" })
    }

    return (
        <Page
            fullWidth
            title="Orders"
            backAction={{content: 'Home', url: `/app/Orders`}}
        >
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="200">
                            <Text as="h2" variant="headingLg" >Details</Text>
                                <Box paddingBlock="200">
                                    <BlockStack gap="200">
                                        <BlockStack>
                                            <Text as="h3" variant="headingMd" >ID:</Text>
                                            <Text as="p" numeric>{CurrentFulfillmentOrder.ID.slice(-13)}</Text>
                                        </BlockStack>
                                        <BlockStack>
                                            <Text as="h3" variant="headingMd" >Created At:</Text>
                                            <Text as="p" numeric>{CurrentFulfillmentOrder.CreatedDate.toLocaleDateString()}</Text>
                                        </BlockStack>
                                    </BlockStack>
                                </Box>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="200">
                            <Text as="h2" variant="headingLg" >Required Items</Text>
                            <LineItemTable LineItems={CurrentFulfillmentOrder.LineItems} FulfillmentRecord={FulfillmentRecord}/>
                        </BlockStack>
                    </Card>
                </Layout.Section>
                {FulfillmentRecord ? <Layout.Section>
                    <Card>
                        <BlockStack gap="200">
                            <Text as="h2" variant="headingLg" >Fulfillment Record</Text>
                            <FulfillmentRecordTable FulfillmentRecord={FulfillmentRecord} UndoAction={UndoFulfillment}/>
                        </BlockStack>
                    </Card>
                </Layout.Section> : null}
                <Layout.Section>
                    <Card>
                        <FormLayout>
                            <BlockStack gap="400">
                                <TextField 
                                    type="number"
                                    id="Barcode"
                                    label="Barcode"
                                    autoComplete="off"
                                    autoFocus={true}
                                    value={BarcodeState}
                                    error={Error||undefined}
                                    onChange={Barcode=>{
                                        SetBarcodeState(Barcode)
                                    }}
                                />
                                <Button
                                    icon={PlusIcon}
                                    onClick={SaveData}
                                >Add</Button>
                            </BlockStack>
                        </FormLayout>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    )
}