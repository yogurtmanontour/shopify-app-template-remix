import db from "../db.server";
import { PurchaseItemType } from "./PurchaseItem.server";

export interface PurchaseOrderType {
    ID : number;
    InvoiceURL : string;
    DatePaid : Date | null;
    DateReceived: Date | null;
    PurchaseItems: PurchaseItemType[];
    TotalCost: number;
}

export async function GetPurchaseOrder (ID: number): Promise<PurchaseOrderType | null> {

    let PurchaseOrder = await db.purchaseOrder.findFirst({include:{PurchaseItems:true}, where: { ID } }).then(Value=>{
        if (Value!=null) {
            let TotalCost = 0
            Value.PurchaseItems.forEach(element => {
                TotalCost += element.Cost;
            });
            let Output : PurchaseOrderType = {
                ID: Value.ID,
                InvoiceURL: Value.InvoiceURL,
                DatePaid: Value.DatePaid,
                DateReceived: Value.DateReceived,
                PurchaseItems: Value.PurchaseItems,
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
    let PurchaseOrders = await db.purchaseOrder.findMany({include:{PurchaseItems:{select:{Cost:true}}}, orderBy: {ID : "desc"} }).then(Values=>{
        if (Values.length>0){
            let Output = Values.map(Value=>{
                let TotalCost = 0
                Value.PurchaseItems.forEach(element => {
                    TotalCost += element.Cost;
                });
                let Output2 : PurchaseOrderType = {
                    ID: Value.ID,
                    InvoiceURL: Value.InvoiceURL,
                    DatePaid: Value.DatePaid,
                    DateReceived: Value.DateReceived,
                    PurchaseItems: [],
                    TotalCost: TotalCost
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