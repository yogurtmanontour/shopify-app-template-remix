import db from "../db.server";
import { ItemType } from "./Item.server";
import { PurchaseOrderType } from "./PurchaseOrder.server";

export interface PurchaseItemType {
    ID : number;
    PurchaseOrderID : number;
    Title: string;
    Cost: number;
    Items: ItemType[];
    FixedCosts : number;
    RateCosts : number;
}

export interface CreatePurchaseItemType {
    PurchaseOrderID : number;
    Title: string;
    Cost: number;
}


export async function GetPurchaseItem (ID: number): Promise<PurchaseItemType | null> {

    let PurchaseItem = await db.purchaseItem.findFirst({include:{Items:true, PurchaseOrder:{include:{PurchaseCosts: true, PurchaseItems:{select:{ID:true}}}}}, where: { ID } }).then(Value=>{
        if (Value!=null) {
            let TotalFixedCosts : number = 0;
            let TotalRateCosts : number = 0;
            Value.PurchaseOrder.PurchaseCosts.forEach(Cost => {
                TotalFixedCosts+=Cost.Cost;
                TotalRateCosts+=Cost.Rate;
            });
            let EachFixedCosts : number = TotalFixedCosts/Value.PurchaseOrder.PurchaseItems.length

            let Output : PurchaseItemType = {
                ID: Value.ID,
                PurchaseOrderID: Value.PurchaseOrderID,
                Title: Value.Title,
                Cost: Value.Cost,
                Items: Value.Items,
                FixedCosts: EachFixedCosts,
                RateCosts: TotalRateCosts
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

