import { BlockStack, Box, Card, DatePicker, FormLayout, Icon, Layout, Page, PageActions, Popover, Text, TextField } from "@shopify/polaris";

import db from "../db.server";
import { redirect, useLoaderData, useSubmit } from "@remix-run/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import { PurchaseItemType } from "app/models/PurchaseItem.server";

import CustomDatePicker from "app/Components/DatePicker";

export async function loader({ request, params } : LoaderFunctionArgs){

    const PurchaseOrderID = params.id;

    return Response.json({
        PurchaseOrderID
    })
}

export async function action({ request, params } : ActionFunctionArgs){
    
    const data : any = {
        ...Object.fromEntries(await request.formData())
    };
    data.Cost = Number(data.Cost)
    data.PurchaseorderID = Number(data.PurchaseorderID)
    const CurrentItem = await db.purchaseItem.create({data})

    return redirect(`/app/viewpurchaseItem/${CurrentItem.ID}`);
}

export default function CreatePurchaseItem(){

    const {PurchaseOrderID} : {PurchaseOrderID : string} = useLoaderData()

    const DefaultItem : PurchaseItemType = {
        ID: 0,
        Title: "",
        Cost: 0
    }
    
    const [FormState,SetFormState] = useState(DefaultItem)

    const submit = useSubmit();
    function SaveData(){
        const data : any = {
            Title: FormState.Title,
            Cost: Number(FormState.Cost),
            PurchaseorderID: PurchaseOrderID
        }
        submit(data, { method: "post" })
    }

    return(
        <Page
            
            title="Create Purchase Item"
            backAction={{content: 'Purchase Items', url: '/app/purchaseItems'}}
        >
            <Layout>
                <Layout.Section>
                    <Card>
                    <Text as="h2" variant="headingLg">New Purchase Item</Text>
                    <Box paddingBlock="200">
                        <FormLayout>
                            <BlockStack gap="200">
                                <TextField 
                                    id="InvoiceURL"
                                    label="Invoice URL"
                                    autoComplete="off"
                                    value={FormState.Title}
                                    onChange={Title=>{
                                        SetFormState({...FormState,Title})
                                    }}
                                />
                                <TextField 
                                    type="number"
                                    id="Cost"
                                    label="Cost"
                                    autoComplete="off"
                                    value={String(FormState.Cost)}
                                    onChange={CostString=>{
                                        let Cost = Number(CostString)
                                        SetFormState({...FormState,Cost})
                                    }}
                                />
                            </BlockStack>
                        </FormLayout>
                    </Box>
                        
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <PageActions
                        primaryAction={
                            {
                                content: "Save",
                                onAction() {
                                    SaveData()
                                },
                            }
                        }
                    />
                </Layout.Section>
            </Layout>
        </Page>
    )
}