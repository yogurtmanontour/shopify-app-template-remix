import db from "../db.server";
import { PurchaseCostType } from "./PurchaseCost.server";
import { PurchaseItemType } from "./PurchaseItem.server";

export interface PurchaseOrderType {
    ID : number;
    Description : string;
    InvoiceURL : string;
    HasPaid : boolean; 
    DatePaid : Date;
    HasReceived : boolean;
    DateReceived: Date;
    PurchaseItems: PurchaseItemType[];
    PurchaseCosts: PurchaseCostType[];
    TotalCost: number;
    EstimatedCosts : number;
}

export interface CreatePurchaseOrderType {
    Description : string;
    InvoiceURL : string;
    HasPaid : boolean; 
    DatePaid : Date | null;
    HasReceived : boolean;
    DateReceived: Date | null;
}

export async function GetPurchaseOrder (ID: number): Promise<PurchaseOrderType | null> {

    let PurchaseOrder = await db.purchaseOrder.findFirst({include:{PurchaseItems:true,PurchaseCosts:true}, where: { ID } }).then(Value=>{
        if (Value!=null) {
            let TotalCost = 0
            Value.PurchaseItems.forEach(element => {
                TotalCost += element.Cost;
            });
            let Output : PurchaseOrderType = {
                ID: Value.ID,
                Description: Value.Description || "",
                InvoiceURL: Value.InvoiceURL,
                HasPaid: Value.HasPaid,
                DatePaid: Value.DatePaid || new Date(),
                HasReceived: Value.HasReceived,
                DateReceived: Value.DateReceived || new Date(),
                PurchaseItems: Value.PurchaseItems,
                PurchaseCosts: Value.PurchaseCosts,
                TotalCost: TotalCost
            }
            return Output
        }
        return null
    })
    if (!PurchaseOrder) {
        return null;
    }
    return PurchaseOrder
}

export async function GetPurchaseOrders(): Promise<Array<PurchaseOrderType>> {
    let PurchaseOrders = await db.purchaseOrder.findMany({include:{PurchaseItems:{select:{Cost:true}},PurchaseCosts:true}, orderBy: {ID : "desc"} }).then(Values=>{
        if (Values.length>0){
            let Output = Values.map(Value=>{
                let TotalCost = 0
                Value.PurchaseItems.forEach(element => {
                    TotalCost += element.Cost;
                });
                let TotalCosts : number = 0
                Value.PurchaseCosts.forEach(Cost => {
                    if (Cost.Type=="fixed") {
                        TotalCosts+=Cost.Cost
                    } else {
                        TotalCosts+=TotalCost*(Cost.Rate/100)
                    }
                });

                let Output2 : PurchaseOrderType = {
                    ID: Value.ID,
                    Description: Value.Description || "",
                    InvoiceURL: Value.InvoiceURL,
                    HasPaid: Value.HasPaid,
                    DatePaid: Value.DatePaid || new Date(),
                    HasReceived: Value.HasReceived,
                    DateReceived: Value.DateReceived || new Date(),
                    PurchaseItems: [],
                    PurchaseCosts: [],
                    TotalCost: TotalCost,
                    EstimatedCosts: TotalCosts
                }
                return Output2
            })
            return Output
        }
        return []
    });
    if (!PurchaseOrders) {
        return [];
    }
    return PurchaseOrders
}