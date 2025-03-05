import { BlockStack, Box, Card, DatePicker, FormLayout, Icon, Layout, Page, PageActions, Popover, Text, TextField } from "@shopify/polaris";

import db from "../db.server";
import { redirect, useLoaderData, useSearchParams, useSubmit } from "@remix-run/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import { GetPurchaseOrder, PurchaseOrderType } from "app/models/PurchaseOrder.server";

import CustomDatePicker from "app/Components/DatePicker";
import { CreatePurchaseItemType, GetPurchaseItem, PurchaseItemType } from "app/models/PurchaseItem.server";

export async function loader({ request, params } : LoaderFunctionArgs){
    let PurchaseItemDTO : PurchaseItemType | null = {
        ID: 0,
        PurchaseOrderID: 0,
        Title: "",
        Cost: 0
    }

    if (params.id!="new") {
        PurchaseItemDTO = await GetPurchaseItem(Number(params.id));
    }

    return Response.json({
        PurchaseItemDTO
    })
}

export async function action({ request, params } : ActionFunctionArgs){

    const RequestData = await request.formData()
    
    const data : CreatePurchaseItemType = {
        PurchaseOrderID: Number(RequestData.get("PurchaseOrderID")),
        Title: String(RequestData.get("Title")) || "",
        Cost: Number(RequestData.get("Cost"))
    };

    const CurrentItem = params.id=="new" ? await db.purchaseItem.create({data}) : await db.purchaseItem.update({ where: { ID: Number(params.id)}, data })
    

    return redirect(`/app/purchaseorders/${data.PurchaseOrderID}`);
}

export default function EditPurchaseOrder(){
    const [searchParams, setSearchParams] = useSearchParams();

    const {PurchaseItemDTO} : any = useLoaderData()
        const CurrentPurchaseItem : PurchaseItemType = {
            ID: PurchaseItemDTO.ID,
            Title: PurchaseItemDTO.Title,
            Cost: PurchaseItemDTO.Cost,
            PurchaseOrderID: PurchaseItemDTO.PurchaseOrderID
    }
    
    const [FormState,SetFormState] = useState(CurrentPurchaseItem)

    const submit = useSubmit();
    function SaveData(){
        const data : any = {
            Title: FormState.Title,
            Cost: FormState.Cost,
            PurchaseOrderID: searchParams.get("PurchaseOrder") || FormState.PurchaseOrderID
        }
        submit(data, { method: "post" })
    }

    return(
        <Page
            
            title={CurrentPurchaseItem.ID==0? "Create Purchase Item" : "Edit Purchase Item"}
            backAction={{content: 'Purchase Order', url: `/app/purchaseorders/${CurrentPurchaseItem.PurchaseOrderID}`}}
        >
            <Layout>
                <Layout.Section>
                    <Card>
                    <Text as="h2" variant="headingLg">{CurrentPurchaseItem.ID==0? "New Purchase Item" : "Purchase Item: "+CurrentPurchaseItem.ID}</Text>
                    <Box paddingBlock="200">
                        <FormLayout>
                            <BlockStack gap="400">
                                <TextField 
                                    id="Title"
                                    label="Title"
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