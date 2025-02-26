import db from "../db.server";
import { ItemType } from "./Item.server";
import { PurchaseOrderType } from "./PurchaseOrder.server";

export interface PurchaseItemType {
    ID : number;
    Title: string;
    Cost: number;
}


