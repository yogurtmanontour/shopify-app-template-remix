import { BlockStack, Box, Card, DatePicker, FormLayout, Icon, Layout, Page, PageActions, Popover, Text, TextField } from "@shopify/polaris";

import db from "../db.server";
import { redirect, useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import { CreatePurchaseOrderErrors, CreatePurchaseOrderType, GetPurchaseOrder, PurchaseOrderType, ValidatePurchaseOrder } from "app/models/PurchaseOrder.server";

import CustomDatePicker from "app/Components/DatePicker";

export async function loader({ request, params } : LoaderFunctionArgs){
    let PurchaseOrderDTO : PurchaseOrderType | null = {
        ID: 0,
        InvoiceURL: "",
        DatePaid: new(Date),
        DateReceived: new(Date),
        PurchaseItems: [],
        TotalCost: 0,
        HasPaid: false,
        HasReceived: false,
        Description: "",
        PurchaseCosts: [],
        EstimatedCosts: 0
    }

    if (params.id!="new") {
        PurchaseOrderDTO = await GetPurchaseOrder(Number(params.id));
    }

    return Response.json({
        PurchaseOrderDTO
    })
}

export async function action({ request, params } : ActionFunctionArgs){

    const RequestData = await request.formData()

    const data : CreatePurchaseOrderType = {
        Description: String(RequestData.get("Description")) || "",
        InvoiceURL: String(RequestData.get("InvoiceURL")) || "",
        HasPaid: JSON.parse(String(RequestData.get("HasPaid"))),
        DatePaid: new Date(String(RequestData.get("DatePaid"))),
        HasReceived: JSON.parse(String(RequestData.get("HasReceived"))),
        DateReceived: new Date(String(RequestData.get("DateReceived")))
    }

    const ValidationErrors : CreatePurchaseOrderErrors | null = ValidatePurchaseOrder(data)
    if (ValidationErrors) {
        console.log(ValidationErrors)
        return Response.json({ ValidationErrors }, { status: 422 });
    }

    const CurrentItem = params.id=="new" ? await db.purchaseOrder.create({data}) : await db.purchaseOrder.update({ where: { ID: Number(params.id)}, data })
    

    return redirect(`/app/purchaseorders/${CurrentItem.ID}`);
}

export default function EditPurchaseOrder(){
    const {PurchaseOrderDTO} : any = useLoaderData()

    //Errors returned from action
    const ValidationErrors  : CreatePurchaseOrderErrors | null = useActionData<typeof action>()?.ValidationErrors


    const CurrentOrder : PurchaseOrderType = {
        ID: PurchaseOrderDTO.ID,
        Description: PurchaseOrderDTO.Description,
        InvoiceURL: PurchaseOrderDTO.InvoiceURL,
        DatePaid: PurchaseOrderDTO.DatePaid,
        DateReceived: PurchaseOrderDTO.DateReceived,
        PurchaseItems: PurchaseOrderDTO.PurchaseItems,
        TotalCost: PurchaseOrderDTO.TotalCost,
        HasPaid: PurchaseOrderDTO.HasPaid,
        HasReceived: PurchaseOrderDTO.HasReceived,
        PurchaseCosts: [],
        EstimatedCosts: 0
    }

    
    //Date pickers
    const [PaidDateSelected,SetPaidDateSelected] = useState(PurchaseOrderDTO.HasPaid);
    const [ReceivedDateSelected,SetReceivedDateSelected] = useState(PurchaseOrderDTO.HasReceived);
    const [PaidDate, SetPaidDate] = useState(PurchaseOrderDTO.DatePaid==null ? new Date() : new Date(PurchaseOrderDTO.DatePaid));
    const [ReceivedDate, SetReceivedDate] = useState(PurchaseOrderDTO.DateReceived==null ? new Date() : new Date(PurchaseOrderDTO.DateReceived));
    
    const [FormState,SetFormState] = useState(CurrentOrder)

    const submit = useSubmit();
    function SaveData(){
        const data : any = {
            Description: FormState.Description,
            InvoiceURL: FormState.InvoiceURL,
            DatePaid: PaidDate.toISOString(),
            DateReceived: ReceivedDate.toISOString(),
            HasPaid: PaidDateSelected,
            HasReceived: ReceivedDateSelected
        }
        submit(data, { method: "post" })
    }

    

    return(
        <Page
            
            title={CurrentOrder.ID==0? "Create Purchase Order" : "Edit Purchase Order"}
            backAction={{content: 'Purchase Orders', url: '/app/purchaseorders'}}
        >
            <Layout>
                <Layout.Section>
                    <Card>
                    <Text as="h2" variant="headingLg">{CurrentOrder.ID==0? "New Purchase Order" : "Purchase Order: "+CurrentOrder.ID}</Text>
                    <Box paddingBlock="200">
                        <FormLayout>
                            <BlockStack gap="400">
                                <TextField 
                                    id="Description"
                                    label="Description"
                                    autoComplete="off"
                                    error={ValidationErrors?.Description}
                                    value={FormState.Description}
                                    onChange={Description=>{
                                        SetFormState({...FormState,Description})
                                    }}
                                />
                                <TextField 
                                    id="InvoiceURL"
                                    label="Invoice URL"
                                    autoComplete="off"
                                    error={ValidationErrors?.InvoiceURL}
                                    value={FormState.InvoiceURL}
                                    onChange={InvoiceURL=>{
                                        SetFormState({...FormState,InvoiceURL})
                                    }}
                                />
                                <CustomDatePicker Label="Date Paid" selectedDate={PaidDate} setSelectedDate={SetPaidDate} DateSelected={PaidDateSelected} SetDateSelected={SetPaidDateSelected}/>
                                <CustomDatePicker Label="Date Received" selectedDate={ReceivedDate} setSelectedDate={SetReceivedDate} DateSelected={ReceivedDateSelected} SetDateSelected={SetReceivedDateSelected}/>
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