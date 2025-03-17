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

export interface CreatePurchaseCostErrors {
    Description: string;
    Rate: string;
    Cost: string;
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

export function ValidatePurchaseCost(data: CreatePurchaseCostType) : CreatePurchaseCostErrors | null{
    let HasError = false
    const errors : CreatePurchaseCostErrors = {
        Description: "",
        Rate: "",
        Cost: ""
    };

    if (!data.Description) {
        errors.Description = "A Description is required";
        HasError = true  
    }

    if (data.Type=="Fixed") {
        if (!data.Cost) {
            errors.Cost = "A cost is required";
            HasError = true
        }
    } else {
        if (!data.Rate) {
            errors.Rate = "A rate is required";
            HasError = true
        }
    }

    if (HasError) {
        return errors;
    }
    return null
}
