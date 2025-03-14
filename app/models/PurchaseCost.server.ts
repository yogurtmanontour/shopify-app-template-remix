import db from "../db.server";

export interface PurchaseCostType {
    ID : number;
    PurchaseOrderID : number;
    Description: string;
    Type : string;
    Rate: number;
    Cost: number;
}

export interface CreatePurchaseCostType {
    PurchaseOrderID : number;
    Description: string;
    Type : string;
    Rate: number;
    Cost: number;
}


export async function GetPurchaseCost (ID: number): Promise<PurchaseCostType | null> {

    let PurchaseCost = await db.purchaseCost.findFirst({ where: { ID } }).then(Value=>{
        if (Value!=null) {
            let Output : PurchaseCostType = {
                ID: Value.ID,
                PurchaseOrderID: Value.PurchaseOrderID,
                Description: Value.Description,
                Type: Value.Type,
                Rate: Value.Rate,
                Cost: Value.Cost
            }
            return Output
        }
        return null
    })
    if (!PurchaseCost) {
        return null;
    }
    return PurchaseCost
}

