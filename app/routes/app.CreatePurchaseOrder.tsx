import { BlockStack, Box, Card, DatePicker, FormLayout, Icon, Layout, Page, PageActions, Popover, Text, TextField } from "@shopify/polaris";

import db from "../db.server";
import { redirect, useSubmit } from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import { PurchaseOrderType } from "app/models/PurchaseOrder.server";

import CustomDatePicker from "app/Components/DatePicker";



export async function action({ request, params } : ActionFunctionArgs){
    
    const data : any = {
        ...Object.fromEntries(await request.formData())
    };
    const CurrentItem = await db.purchaseOrder.create({data})

    return redirect(`/app/viewpurchaseorder/${CurrentItem.ID}`);
}

export default function CreatePurchaseOrder(){

    const DefaultItem : PurchaseOrderType = {
        ID: 0,
        InvoiceURL: "",
        DatePaid: null,
        DateReceived: null,
        PurchaseItems: [],
        TotalCost: 0
    }
    
    const [FormState,SetFormState] = useState(DefaultItem)

    const submit = useSubmit();
    function SaveData(){
        const data : any = {
            InvoiceURL: FormState.InvoiceURL,
            DatePaid: PaidDate.toISOString(),
            DateReceived: ReceivedDate.toISOString(),
        }
        submit(data, { method: "post" })
    }

    const [PaidDate, SetPaidDate] = useState(new Date());
    const [ReceivedDate, SetReceivedDate] = useState(new Date());

    return(
        <Page
            
            title="Create Purchase Order"
            backAction={{content: 'Purchase Orders', url: '/app/purchaseorders'}}
        >
            <Layout>
                <Layout.Section>
                    <Card>
                    <Text as="h2" variant="headingLg">New Purchase order</Text>
                    <Box paddingBlock="200">
                        <FormLayout>
                            <BlockStack gap="200">
                                <TextField 
                                    id="InvoiceURL"
                                    label="Invoice URL"
                                    autoComplete="off"
                                    value={FormState.InvoiceURL}
                                    onChange={InvoiceURL=>{
                                        SetFormState({...FormState,InvoiceURL})
                                    }}
                                />
                                <CustomDatePicker Label="Date Paid" selectedDate={PaidDate} setSelectedDate={SetPaidDate}/>
                                <CustomDatePicker Label="Date Received" selectedDate={ReceivedDate} setSelectedDate={SetReceivedDate}/>
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