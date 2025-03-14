import { BlockStack, Box, Card, ChoiceList, DatePicker, FormLayout, Icon, Layout, Page, PageActions, Popover, Text, TextField } from "@shopify/polaris";

import db from "../db.server";
import { redirect, useLoaderData, useSearchParams, useSubmit } from "@remix-run/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useCallback, useState } from "react";
import { GetPurchaseOrder, PurchaseOrderType } from "app/models/PurchaseOrder.server";

import CustomDatePicker from "app/Components/DatePicker";
import { CreatePurchaseCostType, GetPurchaseCost, PurchaseCostType } from "app/models/PurchaseCost.server";

export async function loader({ request, params } : LoaderFunctionArgs){
    let PurchaseCostDTO : PurchaseCostType | null = {
        ID: 0,
        PurchaseOrderID: 0,
        Type: "",
        Rate: 0,
        Cost: 0,
        Description: ""
    }

    if (params.id!="new") {
        PurchaseCostDTO = await GetPurchaseCost(Number(params.id));
    }

    return Response.json({
        PurchaseCostDTO
    })
}

export async function action({ request, params } : ActionFunctionArgs){

    const RequestData = await request.formData()

    const data : CreatePurchaseCostType = {
        PurchaseOrderID: Number(RequestData.get("PurchaseOrderID")),
        Description: String(RequestData.get("Description")),
        Type: String(RequestData.get("Type")),
        Rate: Number(RequestData.get("Rate")),
        Cost: Number(RequestData.get("Cost"))
    };

    const CurrentCost = params.id=="new" ? await db.purchaseCost.create({data}) : await db.purchaseCost.update({ where: { ID: Number(params.id)}, data })
    

    return redirect(`/app/purchaseorders/${data.PurchaseOrderID}`);
}

export default function EditPurchaseCost(){
    const [searchParams, setSearchParams] = useSearchParams();

    const {PurchaseCostDTO} : any = useLoaderData()
        const CurrentPurchaseCost : PurchaseCostType = {
            ID: PurchaseCostDTO.ID,
            PurchaseOrderID: PurchaseCostDTO.PurchaseOrderID,
            Description: PurchaseCostDTO.Description,
            Type: PurchaseCostDTO.Type,
            Rate: PurchaseCostDTO.Rate,
            Cost: PurchaseCostDTO.Cost
        }
    
    const [FormState,SetFormState] = useState(CurrentPurchaseCost)

    const [Type,SetType] = useState<string[]>(['Fixed']);
    const HandleTypeChange = useCallback((value: string[]) => SetType(value), []);

    const submit = useSubmit();
    function SaveData(){
        const data : any = {
            PurchaseOrderID: Number(searchParams.get("PurchaseOrder") || FormState.PurchaseOrderID),
            Description: FormState.Description,
            Type: Type[0],
            Rate: FormState.Rate,
            Cost: FormState.Cost,
        }
        submit(data, { method: "post" })
    }

    return(
        <Page
            
            title={CurrentPurchaseCost.ID==0? "Create Purchase Cost" : "Edit Purchase Cost"}
            backAction={{content: 'Purchase Order', url: `/app/purchaseorders/${CurrentPurchaseCost.PurchaseOrderID}`}}
        >
            <Layout>
                <Layout.Section>
                    <Card>
                    <Text as="h2" variant="headingLg">{CurrentPurchaseCost.ID==0? "New Purchase Cost" : "Purchase Cost: "+CurrentPurchaseCost.ID}</Text>
                    <Box paddingBlock="200">
                        <FormLayout>
                            <BlockStack gap="400">
                                <TextField 
                                    id="Description"
                                    label="Description"
                                    autoComplete="off"
                                    value={FormState.Description}
                                    onChange={Description=>{
                                        SetFormState({...FormState,Description})
                                    }}
                                />
                                <ChoiceList
                                    title="Type of Cost"
                                    choices={[
                                        {label:"Fixed",value:"Fixed"},
                                        {label:"Rate (Percentage)",value:"Rate"}
                                    ]}
                                    selected={Type}
                                    onChange={HandleTypeChange}
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
                                    disabled={Type[0]=="Rate"}
                                />
                                <TextField 
                                    type="number"
                                    id="Rate"
                                    label="Rate"
                                    autoComplete="off"
                                    value={String(FormState.Rate)}
                                    onChange={RateString=>{
                                        let Rate = Number(RateString)
                                        SetFormState({...FormState,Rate})
                                    }}
                                    disabled={Type[0]=="Fixed"}
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