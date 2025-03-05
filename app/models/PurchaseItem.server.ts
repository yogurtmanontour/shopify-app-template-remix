import db from "../db.server";
import { ItemType } from "./Item.server";
import { PurchaseOrderType } from "./PurchaseOrder.server";

export interface PurchaseItemType {
    ID : number;
    PurchaseOrderID : number;
    Title: string;
    Cost: number;
}

export interface CreatePurchaseItemType {
    PurchaseOrderID : number;
    Title: string;
    Cost: number;
}


export async function GetPurchaseItem (ID: number): Promise<PurchaseItemType | null> {

    let PurchaseItem = await db.purchaseItem.findFirst({ where: { ID } }).then(Value=>{
        if (Value!=null) {
            let Output : PurchaseItemType = {
                ID: Value.ID,
                PurchaseOrderID: Value.PurchaseOrderID,
                Title: Value.Title,
                Cost: Value.Cost
            }
            return Output
        }
        return null
    })
    if (!PurchaseItem) {
        return null;
    }
    return PurchaseItem
}

