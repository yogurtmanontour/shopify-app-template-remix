import { BlockStack, Box, Card, DatePicker, FormLayout, Icon, Layout, Page, PageActions, Popover, Text, TextField } from "@shopify/polaris";

import db from "../db.server";
import { redirect, useActionData, useLoaderData, useSearchParams, useSubmit } from "@remix-run/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import { GetPurchaseOrder, PurchaseOrderType } from "app/models/PurchaseOrder.server";

import CustomDatePicker from "app/Components/DatePicker";
import { CreatePurchaseItemErrors, CreatePurchaseItemType, GetPurchaseItem, PurchaseItemType, ValidatePurchaseItem } from "app/models/PurchaseItem.server";

export async function loader({ request, params } : LoaderFunctionArgs){
    let PurchaseItemDTO : PurchaseItemType | null = {
        ID: 0,
        PurchaseOrderID: 0,
        Title: "",
        Cost: 0,
        Items: [],
        FixedCosts: 0,
        RateCosts: 0
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

    const ValidationErrors : CreatePurchaseItemErrors | null = ValidatePurchaseItem(data)
    if (ValidationErrors) {
        return Response.json({ ValidationErrors }, { status: 422 });
    }

    const CurrentItem = params.id=="new" ? await db.purchaseItem.create({data}) : await db.purchaseItem.update({ where: { ID: Number(params.id)}, data })
    

    return redirect(`/app/purchaseorders/${data.PurchaseOrderID}`);
}

export default function EditPurchaseItem(){
    const [searchParams, setSearchParams] = useSearchParams();

    //Errors returned from action
    const ValidationErrors  : CreatePurchaseItemErrors | null = useActionData<typeof action>()?.ValidationErrors

    const {PurchaseItemDTO} : any = useLoaderData()
        const CurrentPurchaseItem : PurchaseItemType = {
            ID: PurchaseItemDTO.ID,
            Title: PurchaseItemDTO.Title,
            Cost: PurchaseItemDTO.Cost,
            PurchaseOrderID: PurchaseItemDTO.PurchaseOrderID,
            Items: [],
            FixedCosts: 0,
            RateCosts: 0
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
                                    error={ValidationErrors?.Title}
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
                                    error={ValidationErrors?.Cost}
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