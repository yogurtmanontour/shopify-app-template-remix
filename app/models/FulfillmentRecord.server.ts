import { ItemType } from "./Item.server"
import db from "../db.server";

export interface FulfillmentRecordType {
    ID : number
    FulfillmentOrderID : string
    Items : ItemType[]
}

export interface CreateFulfillmentRecordType {
    FulfillmentOrderID : string
}

export async function GetFullfilmentRecordByFullfilmentOrder(FulfillmentOrderID : string) : Promise<FulfillmentRecordType | null> {
    const FulfillmentRecordDTO = await db.fulfillmentRecord.findFirst({include:{Items:true}, where: { FulfillmentOrderID } });
  
    if (FulfillmentRecordDTO!=null) {
        let Output : FulfillmentRecordType = {
            ID : FulfillmentRecordDTO.ID,
            FulfillmentOrderID : FulfillmentRecordDTO.FulfillmentOrderID,
            Items : FulfillmentRecordDTO.Items
        }
        return Output
    }
    return null
}

export async function CreateFulfillmentRecord(data : CreateFulfillmentRecordType) : Promise<FulfillmentRecordType | null> {
    console.log('fulfillmentOrderID:' +data.FulfillmentOrderID)
    const FulfillmentRecordDTO = await db.fulfillmentRecord.create({data})
    if (FulfillmentRecordDTO!=null) {
        let Output : FulfillmentRecordType = {
            ID : FulfillmentRecordDTO.ID,
            FulfillmentOrderID : FulfillmentRecordDTO.FulfillmentOrderID,
            Items : []
        }
        return Output
    }
    return null
}